"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { ExtractedSalesData, SalesItem } from "@/types/sales";
import { UploadForm } from "@/components/purchase/UploadForm";
import { ReviewSalesData } from "@/components/sales/ReviewSalesData";
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

const initialData: ExtractedSalesData = {
  extracted_customer_name: "",
  order_date: "",
  invoice_url: "",
  notes: null,
  subtotal_items_before_additional_cost: 0,
  extracted_additional_cost: 0,
  additional_cost_description: null,
  grand_total: 0,
  extraction_timestamp: "",
  items: [],
  total_input_fields: 0,
  corrected_field_count: 0,
};

export default function NewSalesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] =
    useState<ExtractedSalesData>(initialData);

  // Menyimpan data asli hasil AI untuk perbandingan akurasi
  const [initialAiData, setInitialAiData] = useState<ExtractedSalesData | null>(
    null
  );

  const [status, setStatus] = useState<Status>("initial");
  const router = useRouter();

  // =======================================================
  // HELPER FUNCTION: Menghitung jumlah field yang dikoreksi (Disamakan dengan logic purchase)
  // =======================================================
  const calculateCorrectedCount = (
    currentData: ExtractedSalesData,
    initialData: ExtractedSalesData
  ): number => {
    let correctedCount = 0;

    // 1. Main Fields (6 fields) - SESUAIKAN DENGAN SALES FIELDS
    const mainFields: (keyof ExtractedSalesData)[] = [
      "extracted_customer_name",
      "order_date",
      "extracted_additional_cost",
      "additional_cost_description",
      "notes",
      "invoice_url",
    ];
    // NOTE: Subtotal dan Grand Total tidak dihitung karena mereka hasil kalkulasi

    mainFields.forEach((field) => {
      const currentVal = String(currentData[field]);
      const initialVal = String(initialData[field]);
      if (currentVal !== initialVal) {
        correctedCount++;
      }
    });

    // 2. Item Fields (4 fields per item) - SESUAIKAN DENGAN SALES ITEMS
    const itemFields: (keyof SalesItem)[] = [
      "extracted_product_name",
      "quantity",
      "unit",
      "price",
    ];

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
        correctedCount += itemFields.length;
      }
    });

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
      toast.info("Pilih file gambar chat penjualan terlebih dahulu.");
      return;
    }

    setStatus("extracting");

    const formData = new FormData();
    formData.append("invoice", file); // Tetap pakai 'invoice' sesuai backend

    // GANTI ENDPOINT KE SALES EXTRACTION
    const extractPromise = fetch("/api/sales/extractSales", {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Gagal Ekstraksi Data Penjualan.");
        }
        return result;
      })
      .then((result) => {
        const initialExtractedData: ExtractedSalesData = result.data;

        // SIMPAN DATA ASLI AI
        setInitialAiData(initialExtractedData);

        // Hitung Total Fields
        const mainFieldsCount = 6;
        const itemFieldsCount = initialExtractedData.items.length * 4; // 4 fields per item di Sales
        const totalFields = mainFieldsCount + itemFieldsCount;

        setExtractedData({
          ...initialExtractedData,
          total_input_fields: totalFields,
          corrected_field_count: 0, // Awalnya 0
        });
        setStatus("review");
      });

    toast.promise(extractPromise, {
      loading:
        "Sedang memproses dan mengekstrak data chat penjualan menggunakan AI...",
      success: () => {
        return "Ekstraksi Berhasil! Silakan periksa dan edit data di bawah.";
      },
      error: (err) => {
        setStatus("error");
        return `Gagal Ekstraksi: ${err.message}. Coba lagi atau upload file lain.`;
      },
    });
  };

  // FUNGSI UNTUK MENGUBAH DATA UTAMA
  const handleMainDataChange = (
    field: keyof ExtractedSalesData,
    value: string | number | null
  ) => {
    const isNumericField = field === "extracted_additional_cost";
    const valueToSave = isNumericField ? parseFloat(String(value)) || 0 : value;

    setExtractedData((prev) => {
      const nextData = {
        ...prev,
        [field]: valueToSave,
      };

      // Hitung ulang corrected count
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

  // FUNGSI UNTUK MENGUBAH DATA ITEM
  const handleItemChange = (
    index: number,
    field: keyof SalesItem,
    value: string | number
  ) => {
    const isNumericField = field === "quantity" || field === "price";
    const valueToSave = isNumericField ? parseFloat(String(value)) || 0 : value;

    setExtractedData((prev) => {
      const newItems = prev.items.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: valueToSave };
        }
        return item;
      });

      const nextData = { ...prev, items: newItems };

      // Hitung ulang corrected count
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

  // FUNGSI SIMPAN
  // FUNGSI SIMPAN
  const handleSave = async () => {
    setStatus("saving");

    // 1. Hitung ulang Grand Total & Subtotal
    const subtotalItems = extractedData.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const finalGrandTotal =
      subtotalItems + extractedData.extracted_additional_cost;

    // 2. Pastikan Metrik (Total Fields & Corrected Count) sudah terisi
    // Jika user langsung save tanpa edit, kita harus hitung total fields-nya sekarang
    const mainFieldsCount = 6;
    const itemFieldsCount = extractedData.items.length * 4;
    const finalTotalFields = mainFieldsCount + itemFieldsCount;

    // Hitung corrected count akhir untuk jaga-jaga
    const finalCorrectedCount = initialAiData
      ? calculateCorrectedCount(extractedData, initialAiData)
      : 0;

    // 3. Gabungkan semua ke payload final
    const payload = {
      ...extractedData,
      subtotal_items_before_additional_cost: subtotalItems,
      grand_total: finalGrandTotal,
      total_input_fields: finalTotalFields,
      corrected_field_count: finalCorrectedCount,
      // Pastikan timestamp dari AI ikut terkirim
      extraction_timestamp:
        extractedData.extraction_timestamp || new Date().toISOString(),
    };

    const savePromise = fetch("/api/sales/createSales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            result.message || "Gagal menyimpan transaksi penjualan."
          );
        }
        return result;
      })
      .then((result) => {
        setStatus("success");
        toast.success(`Transaksi Penjualan Berhasil Dicatat!`);
        router.push(`/sales/${result.salesId}`);
        return result;
      });

    toast.promise(savePromise, {
      loading: "Menyimpan transaksi penjualan ke database...",
      error: (err) => {
        setStatus("review");
        return `Gagal Menyimpan: ${err.message}`;
      },
    });
  };

  // FUNGSI TAMBAH ITEM BARU
  const handleAddItem = () => {
    const newItemId =
      extractedData.items.length > 0
        ? Math.max(...extractedData.items.map((item) => item.id!)) + 1
        : 1;

    const newItem: SalesItem = {
      id: newItemId,
      extracted_product_name: "",
      quantity: 0,
      unit: "PCS",
      price: 0,
    };

    setExtractedData((prev) => {
      const nextData = {
        ...prev,
        items: [...prev.items, newItem],
      };

      // Hitung ulang corrected count dan total fields
      if (initialAiData) {
        const newCorrectedCount = calculateCorrectedCount(
          nextData,
          initialAiData
        );
        const itemFieldsCount = nextData.items.length * 4; // 4 fields per item di Sales
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

  // FUNGSI HAPUS ITEM
  const handleRemoveItem = (indexToRemove: number) => {
    setExtractedData((prev) => {
      const nextData = {
        ...prev,
        items: prev.items.filter((_, index) => index !== indexToRemove),
      };

      // Hitung ulang corrected count dan total fields
      if (initialAiData) {
        const newCorrectedCount = calculateCorrectedCount(
          nextData,
          initialAiData
        );
        const itemFieldsCount = nextData.items.length * 4; // 4 fields per item di Sales
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
        Tambah penjualan baru
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
          <ReviewSalesData
            data={extractedData}
            status={status}
            handleMainDataChange={
              handleMainDataChange as (
                field: keyof ExtractedSalesData,
                value: any
              ) => void
            }
            handleItemChange={
              handleItemChange as (
                index: number,
                field: keyof SalesItem,
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
