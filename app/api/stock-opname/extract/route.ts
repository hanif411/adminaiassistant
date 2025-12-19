import { createClient } from "@/utils/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { Buffer } from "buffer";

const STOCK_PROMPT = `
Analyze this shelf image. Extract data into a single JSON object.
Priority: 
1. Product Name: Look at shelf labels (below items) first. If not found, use product packaging.
2. Price: Extract numeric price from shelf labels.
3. Quantity: Count how many items of each type are visible in the front row/facing.
4. Rack Number: Identify if there's a rack or aisle code (e.g., "A-01", "R05"). Use null if not found.

Return JSON Structure STRICTLY:
{
  "rack_number": "string or null",
  "items": [
    {
      "extracted_product_name": "string",
      "extracted_quantity": number,
      "price": number
    }
  ]
}

Rules:
- Return ONLY valid JSON. 
- NUMERIC RULE: Convert prices like '10.500' to 10500.
`;

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { status: 401, message: "Akses ditolak." },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { status: 400, message: "File tidak ditemukan." },
        { status: 400 }
      );
    }

    // 1. UPLOAD KE BUCKET
    const filePath = `stock-opname/${user.id}/${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("stock-opname-images") // Pastikan bucket ini sudah dibuat
      .upload(filePath, Buffer.from(fileBuffer), { contentType: file.type });

    if (uploadError) throw new Error(`Upload Error: ${uploadError.message}`);

    const {
      data: { publicUrl },
    } = supabase.storage.from("stock-opname-images").getPublicUrl(filePath);

    const base64ImageData = Buffer.from(fileBuffer).toString("base64");
    const mimeType = file.type || "application/octet-stream";
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64ImageData,
          },
        },
        { text: STOCK_PROMPT }, // Menggunakan prompt baru
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = result.text!.trim();
    let parsedData;

    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      return NextResponse.json(
        {
          status: 500,
          message: "AI gagal mengembalikan format JSON yang valid.",
          raw: result,
        },
        { status: 500 }
      );
    }

    // 3. SUCCESS RESPONSE
    return NextResponse.json({
      status: 200,
      message: "Berhasil ekstrak data stok",
      data: {
        rack_number: parsedData.rack_number,
        items: parsedData.items,
        image_url: publicUrl,
        extraction_date: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error: any) {
    console.error("Stock Extract Error:", error);
    return NextResponse.json(
      { status: 500, message: error.message },
      { status: 500 }
    );
  }
}
