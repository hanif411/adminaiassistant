"use client";

import { useState, ChangeEvent, FormEvent } from "react";
// Pastikan ExtractedData di @/types/purchases sudah menerima '?' atau diinisialisasi 'null'
import { ExtractedData, ExtractedItem } from "@/types/purchases";
import { UploadForm } from "@/components/purchase/UploadForm";
import { ReviewData } from "@/components/purchase/ReviewData";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import HeaderDashboard from "@/components/Header/HeaderDashboard";

type Status =
  | "initial"
  | "extracting"
  | "review"
  | "saving"
  | "success"
  | "error";

const initialData: ExtractedData = {
  extracted_supplier_name: "",
  invoice_number: "",
  purchase_date: "",
  invoice_url: "",
  extracted_tax: 0,
  extracted_discount: 0,
  extraction_timestamp: "",
  items: [],
  total_input_fields: 0,
  corrected_field_count: 0,
};

export default function NewPurchasePage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] =
    useState<ExtractedData>(initialData);

  // 💡 STATE BARU: Menyimpan data asli hasil AI untuk perbandingan akurasi
  const [initialAiData, setInitialAiData] = useState<ExtractedData | null>(
    null
  );

  const [status, setStatus] = useState<Status>("initial");
  const router = useRouter();

  // =======================================================
  // HELPER FUNCTION: Menghitung jumlah field yang dikoreksi
  // =======================================================
  const calculateCorrectedCount = (
    currentData: ExtractedData,
    initialData: ExtractedData
  ): number => {
    let correctedCount = 0;

    // 1. Main Fields (6 fields)
    const mainFields: (keyof ExtractedData)[] = [
      "extracted_supplier_name",
      "invoice_number",
      "purchase_date",
      "extracted_tax",
      "extracted_discount",
      "invoice_url",
    ];

    mainFields.forEach((field) => {
      // Bandingkan nilai, gunakan konversi string untuk memastikan perbandingan tipe data yang konsisten
      const currentVal = String(currentData[field]);
      const initialVal = String(initialData[field]);

      if (currentVal !== initialVal) {
        correctedCount++;
      }
    });

    // 2. Item Fields (6 fields per item)
    const itemFields: (keyof ExtractedItem)[] = [
      "extracted_code_item",
      "extracted_product_name",
      "quantity",
      "unit",
      "price",
      "subtotal",
    ];

    // Iterasi berdasarkan item di currentData
    currentData.items.forEach((currentItem, index) => {
      const initialItem = initialData.items[index];

      if (initialItem) {
        // Bandingkan item yang sudah ada
        itemFields.forEach((field) => {
          const currentVal = String(currentItem[field]);
          const initialVal = String(initialItem[field]);

          if (currentVal !== initialVal) {
            correctedCount++;
          }
        });
      } else {
        // Item baru ditambahkan (ItemCount > Initial Item Count)
        // Item yang ditambahkan dihitung sebagai 6 koreksi baru.
        correctedCount += itemFields.length;
      }
    });

    // Perhatikan: Jika item dihapus, correctedCount mungkin tidak berkurang,
    // tapi ini umumnya dianggap acceptable dalam metrik kualitas data.

    return correctedCount;
  };

  // =======================================================

  const handleFileChange = (e: ChangeEvent<HTMLInputElement> | File) => {
    if (e instanceof File) {
      setFile(e);
    } else if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }

    setExtractedData(initialData);
    setInitialAiData(null);
    setStatus("initial");
  };

  const handleExtract = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!file) {
      toast.info("Pilih file gambar faktur terlebih dahulu.");
      return;
    }

    setStatus("extracting");

    const formData = new FormData();
    formData.append("invoice", file);

    const extractPromise = fetch("/api/purchases/extractPurchases", {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Gagal Ekstraksi Data.");
        }
        return result;
      })
      .then((result) => {
        const initialExtractedData: ExtractedData = result.data;

        // 💡 SIMPAN DATA ASLI AI
        setInitialAiData(initialExtractedData);

        // Hitung Total Fields
        const mainFieldsCount = 6;
        const itemFieldsCount = initialExtractedData.items.length * 6;
        const totalFields = mainFieldsCount + itemFieldsCount;

        setExtractedData({
          ...initialExtractedData,
          total_input_fields: totalFields,
          corrected_field_count: 0, // Awalnya 0
        });
        setStatus("review");
      });

    toast.promise(extractPromise, {
      loading: "Sedang memproses dan mengekstrak data faktur menggunakan AI...",
      success: (data) => {
        return "Ekstraksi Berhasil! Silakan periksa dan edit data di bawah.";
      },
      error: (err) => {
        setStatus("error");
        return `Gagal Ekstraksi: ${err.message}. Coba lagi atau upload file lain.`;
      },
    });
  };

  // 💡 FUNGSI INI DIUBAH untuk menghitung ulang corrected_field_count
  const handleMainDataChange = (
    field: keyof ExtractedData,
    value: string | number
  ) => {
    const valueToSave =
      field === "extracted_tax" || field === "extracted_discount"
        ? parseFloat(String(value)) || 0
        : value;

    setExtractedData((prev) => {
      // 1. Buat data baru dengan perubahan field
      const nextData = {
        ...prev,
        [field]: valueToSave,
      };

      // 2. Hitung ulang corrected count jika data AI awal ada
      if (initialAiData) {
        const newCorrectedCount = calculateCorrectedCount(
          nextData,
          initialAiData
        );
        return {
          ...nextData,
          corrected_field_count: newCorrectedCount,
        };
      }

      return nextData;
    });
  };

  // 💡 FUNGSI INI DIUBAH untuk menghitung ulang corrected_field_count
  const handleItemChange = (
    index: number,
    field: keyof ExtractedItem,
    value: string | number
  ) => {
    const isNumericField =
      field === "quantity" || field === "price" || field === "subtotal";
    const valueToSave = isNumericField ? parseFloat(String(value)) || 0 : value;

    setExtractedData((prev) => {
      const newItems = prev.items.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: valueToSave };
        }
        return item;
      });

      // 1. Buat data baru dengan perubahan item
      const nextData = { ...prev, items: newItems };

      // 2. Hitung ulang corrected count jika data AI awal ada
      if (initialAiData) {
        const newCorrectedCount = calculateCorrectedCount(
          nextData,
          initialAiData
        );
        return {
          ...nextData,
          corrected_field_count: newCorrectedCount,
        };
      }

      return nextData;
    });
  };

  const handleSave = async () => {
    setStatus("saving");

    const savePromise = fetch("/api/purchases/createPurchases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // extractedData sudah mengandung corrected_field_count yang dihitung ulang
      body: JSON.stringify(extractedData),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Gagal menyimpan transaksi.");
        }
        return result;
      })
      .then((result) => {
        setStatus("success");
        router.push(`/purchases/${result.purchaseId}`);
        setFile(null);
        setExtractedData(initialData);
        setInitialAiData(null); // Reset data AI
        return result;
      });

    toast.promise(savePromise, {
      loading: "Menyimpan transaksi pembelian ke database...",
      success: (result) => {
        return `Transaksi ID: ${result.purchaseId} berhasil dicatat!`;
      },
      error: (err) => {
        setStatus("review");
        return `Gagal Menyimpan: ${err.message}. Periksa data Anda atau coba lagi.`;
      },
    });
  };

  // 💡 FUNGSI INI DIUBAH untuk menghitung ulang corrected_field_count
  const handleAddItem = () => {
    const newItemId =
      extractedData.items.length > 0
        ? Math.max(...extractedData.items.map((item) => item.id!)) + 1
        : 1;

    const newItem: ExtractedItem = {
      id: newItemId,
      extracted_code_item: null,
      extracted_product_name: "",
      quantity: 0,
      unit: "PCS",
      price: 0,
      subtotal: 0,
    };

    setExtractedData((prev) => {
      const nextData = {
        ...prev,
        items: [...prev.items, newItem],
      };
      // Hitung ulang corrected count jika data AI awal ada
      if (initialAiData) {
        const newCorrectedCount = calculateCorrectedCount(
          nextData,
          initialAiData
        );
        // Total fields juga harus diupdate karena item bertambah
        const itemFieldsCount = nextData.items.length * 6;
        const totalFields = 6 + itemFieldsCount;

        return {
          ...nextData,
          total_input_fields: totalFields,
          corrected_field_count: newCorrectedCount,
        };
      }
      return nextData;
    });
  };

  // 💡 FUNGSI INI DIUBAH untuk menghitung ulang corrected_field_count
  const handleRemoveItem = (indexToRemove: number) => {
    setExtractedData((prev) => {
      const nextData = {
        ...prev,
        items: prev.items.filter((_, index) => index !== indexToRemove),
      };

      // Hitung ulang corrected count jika data AI awal ada
      if (initialAiData) {
        const newCorrectedCount = calculateCorrectedCount(
          nextData,
          initialAiData
        );
        // Total fields juga harus diupdate karena item berkurang
        const itemFieldsCount = nextData.items.length * 6;
        const totalFields = 6 + itemFieldsCount;

        return {
          ...nextData,
          total_input_fields: totalFields,
          corrected_field_count: newCorrectedCount,
        };
      }
      return nextData;
    });
  };

  const showUpload =
    status === "initial" || status === "error" || status === "extracting";
  const showReview = status === "review" || status === "saving";

  return (
    <>
      <HeaderDashboard />
      <h1 className="text-xl items-center text-center mt-5 font-semibold">
        Tambah pembelian baru
      </h1>
      <div className="p-8 max-w-6xl mx-auto">
        {showUpload && (
          <UploadForm
            file={file}
            status={status}
            handleFileChange={handleFileChange}
            handleExtract={handleExtract}
          />
        )}
        {showReview && (
          <ReviewData
            data={extractedData}
            status={status}
            // Type casting tidak diubah sesuai permintaan
            handleMainDataChange={
              handleMainDataChange as (
                field: keyof ExtractedData,
                value: any
              ) => void
            }
            handleItemChange={
              handleItemChange as (
                index: number,
                field: keyof ExtractedItem,
                value: string | number
              ) => void
            }
            handleSave={handleSave}
            handleAddItem={handleAddItem}
            handleRemoveItem={handleRemoveItem}
          />
        )}
      </div>
    </>
  );
}
