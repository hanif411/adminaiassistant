// app/api/sales/extract/route.ts
import { createClient } from "@/utils/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { ExtractedSalesData } from "@/types/sales"; // PASTIKAN PATH INI BENAR
import { Buffer } from "buffer"; // Import Buffer

// Gunakan prompt yang sudah dimodifikasi (TIDAK BERUBAH)
const SALES_EXTRACTION_PROMPT = `
You are an expert sales chat parser and order logger. Your task is to analyze the provided WhatsApp chat screenshot/image and extract the order details STRICTLY into a single JSON object.

Primary Fields:
- extracted_customer_name: (string, The name or contact alias of the customer. Infer from the chat name/header if available, otherwise use "WA Customer")
- order_date: (string, The date of the final order confirmation message. Must be in YYYY-MM-DD format. Infer from the chat timestamp.)
- notes: (string, Summarize the conversation context or specific instructions from the customer, e.g., "Vitamin tipes, 2 item". Use null if only simple details are present.)

- subtotal_items_before_additional_cost: (number, The total sum of all product items BEFORE any additional charges. This is the item subtotal.)
- extracted_additional_cost: (number, The amount of any supplementary charges found in the chat, such as 'ongkir' or handling fees. Use 0 if no clear additional cost is found.)
- additional_cost_description: (string, The description of the supplementary charge, e.g., 'ongkir', 'biaya kurir', 'biaya admin'. Use null if extracted_additional_cost is 0.)
- grand_total: (number, The final total amount the customer agreed to pay, including items and additional costs.)

Item List (items): array of objects for each product item confirmed in the chat.
Each item MUST have these keys:
- extracted_product_name: (string, The name/description of the product, e.g., 'Vermis')
- quantity: (number, The numeric quantity of the item. Infer from "jd 2 item" or explicit numbers)
- unit: (string, The measurement unit e.g., 'BOX', 'PCS', 'BOTOL'. Use 'PCS' if unit is not specified)
- price: (number, The UNIT price for ONE item. Infer from "Rp 46.000" if quantity is 1)

Rules:
- Return ONLY a valid JSON object. Do not include markdown (like 'json') or any explanation.
- NUMERIC RULE: If any number contains dots (.) or commas (,) as thousands separators, convert it to a clean US decimal format (e.g., '10.500,50' becomes 10500.50). The AI MUST output pure numeric JSON types (float/integer).
- Infer items by looking for product photos or names mentioned alongside prices and quantities.
- If the chat implies a quantity (e.g., "jd 2 item"), and only one price is given, assume the price listed is the unit price and use the quantity listed in the infered item list.
`;

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        status: 401,
        message: "Akses ditolak. Anda harus login.",
      },
      { status: 401 }
    );
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

    // --- 1. UPLOAD FILE KE SUPABASE ---
    const filePath = `sales-chats/${user.id}/${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("sales-chats") // Ganti nama bucket jika perlu (misalnya: 'sales-chats' atau tetap 'purchase-invoices')
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
      .from("sales-chats") // Sesuaikan nama bucket
      .getPublicUrl(filePath);

    const invoiceUrl = publicUrlData.publicUrl;

    // --- 2. EKSTRAKSI DATA DENGAN GEMINI ---
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const mimeType = file.type || "application/octet-stream";
    const base64ImageData = Buffer.from(fileBuffer).toString("base64");

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64ImageData,
          },
        },
        { text: SALES_EXTRACTION_PROMPT }, // Menggunakan prompt baru
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

    // --- 3. NORMALISASI DATA ---
    const extractedData: ExtractedSalesData = {
      extracted_customer_name:
        parsedData.extracted_customer_name || "WA Customer",
      order_date: parsedData.order_date || extractionTime.substring(0, 10), // Gunakan tanggal hari ini jika gagal
      invoice_url: invoiceUrl,
      notes: parsedData.notes || null,

      // Financials (dari AI)
      subtotal_items_before_additional_cost:
        parseFloat(parsedData.subtotal_items_before_additional_cost) || 0,
      extracted_additional_cost:
        parseFloat(parsedData.extracted_additional_cost) || 0,
      additional_cost_description:
        parsedData.additional_cost_description || null,
      grand_total: parseFloat(parsedData.grand_total) || 0,

      // METRIK BARU (Ditambahkan dengan nilai awal 0 atau timestamp)
      extraction_timestamp: extractionTime,
      total_input_fields: 0, // Dihitung di FE, inisiasi 0
      corrected_field_count: 0, // Dihitung di FE, inisiasi 0
      // END METRIK BARU

      items: (parsedData.items || []).map((item: any, index: number) => ({
        id: index,
        extracted_product_name: item.extracted_product_name || "Unknown Item",
        quantity: parseFloat(item.quantity) || 0,
        unit: item.unit || "PCS",
        price: parseFloat(item.price) || 0,
      })),
    };

    if (
      !extractedData.extracted_customer_name ||
      extractedData.items.length === 0
    ) {
      return NextResponse.json(
        {
          status: 400,
          message:
            "Data inti (Customer Name atau Item List) tidak ditemukan. Coba foto lain.",
        },
        { status: 400 }
      );
    }

    // --- 4. SUCCESS RESPONSE ---
    return NextResponse.json(
      {
        status: 200,
        message: "Success extract sales order",
        data: extractedData,
      } satisfies { status: number; message: string; data: ExtractedSalesData },
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
