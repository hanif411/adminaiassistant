import { createClient } from "@/utils/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { ExtractedData } from "@/types/purchases";

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      status: 401,
      message: "Akses ditolak. Anda harus login.",
    });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("invoice") as File;

    if (!file) {
      return NextResponse.json(
        { status: 400, message: "File tidak ditemukan." },
        { status: 400 }
      );
    }
    const filePath = `invoices/${user.id}/${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("purchase-invoices")
      .upload(filePath, Buffer.from(fileBuffer), {
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      return NextResponse.json(
        { status: 500, message: `Gagal upload file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("purchase-invoices")
      .getPublicUrl(filePath);

    const invoiceUrl = publicUrlData.publicUrl;

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const mimeType = file.type || "application/octet-stream";
    const base64ImageData = Buffer.from(fileBuffer).toString("base64");

    const prompt = `
    You are an expert invoice parser and data logger. Extract the following fields STRICTLY into a single JSON object.

    Primary Fields:
    - extracted_supplier_name: (string, the name of the merchant/supplier)
    - invoice_number: (string, the invoice or receipt number)
    - purchase_date: (string, Tgl. Faktur or Date. Must be in YYYY-MM-DD format)

    - extracted_tax: (number, The total PPN/Tax amount for the entire invoice. STRICTLY look for the value associated with the 'PPN' label at the bottom of the invoice. Use 0 if not found)
    - extracted_discount: (number, The total general Discount applied to the entire invoice. STRICTLY look for the value associated with the 'Diskon Rp.' label at the bottom of the invoice. Use 0 if not found)

    Item List (items): array of objects for each product item.
    Each item MUST have these keys:
    - extracted_code_item: (string, The product code/SKU. Use null if not found)
    - extracted_product_name: (string, The name/description of the product)
    - quantity: (number, The numeric part of the quantity only)
    - unit: (string, The measurement unit e.g., 'BOX', 'PCS', 'BOTOL', 'TUBE'. Use 'PCS' if unit is not specified)
    - price: (number, The BASE unit price BEFORE ANY discount/tax. Look for 'Harga WP' or 'Harga Satuan')
    - subtotal: (number, The FINAL ROW TOTAL AFTER all discounts/taxes for that item row. Look for 'HARGA BERSIH' or 'JUMLAH')

    Rules:
    - Return ONLY a valid JSON object. Do not include markdown (like 'json') or any explanation.
    - IMPORTANT NUMERIC RULE: If any number field contains dots (.) or commas (,) as thousands separators, the AI MUST convert the number to a clean US decimal format (e.g., '10.500,50' becomes 10500.50). If the number is whole (e.g. 15.887), treat it as an integer (15887). The AI MUST output pure numeric JSON types (float/integer).
    - Ensure all numeric fields (quantity, price, subtotal, extracted_tax, extracted_discount, extracted_discount_item) are converted to float/integer.
    - If a field is missing, ensure the key is present with a value of null or 0 (for numbers) or "PCS" (for unit).
    - The AI must infer the final 'subtotal' column even if discounts are present in other columns.`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64ImageData,
          },
        },
        { text: prompt },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text!.trim();
    let parsedData: any;
    const extractionTime = new Date().toISOString();

    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      console.log("Raw response text:", text);
      return NextResponse.json(
        {
          status: 500,
          message: "Gagal memproses AI: Format data tidak valid.",
          rawResponse: text,
        },
        { status: 500 }
      );
    }

    const extractedData: ExtractedData = {
      extracted_supplier_name: parsedData.extracted_supplier_name,
      invoice_number: parsedData.invoice_number,
      purchase_date: parsedData.purchase_date,
      invoice_url: invoiceUrl,
      extracted_tax: parseFloat(parsedData.extracted_tax) || 0,
      extracted_discount: parseFloat(parsedData.extracted_discount) || 0,
      extraction_timestamp: extractionTime,
      items: parsedData.items.map((item: any, index: number) => ({
        id: index,
        extracted_code_item: item.extracted_code_item || null,
        extracted_product_name: item.extracted_product_name || "Unknown Item",

        quantity: parseFloat(item.quantity) || 0,
        unit: item.unit || "PCS",

        price: parseFloat(item.price) || 0,
        subtotal: parseFloat(item.subtotal) || 0,
      })),
    };

    if (
      !extractedData.extracted_supplier_name ||
      extractedData.items.length === 0
    ) {
      return NextResponse.json(
        {
          status: 400,
          message:
            "Data inti (Supplier Name atau Item List) tidak ditemukan. Coba foto lain.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: 200,
        message: "Success extract purchases",
        data: extractedData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("General API Error:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Error di API Extraction: " + error.message,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
