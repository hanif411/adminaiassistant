"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadForm } from "@/components/purchase/UploadForm";
import { ReviewStockData } from "@/components/stock-opname/ReviewStockData";
import HeaderDashboard from "@/components/Header/HeaderDashboard";

export type StockItem = {
  id?: number;
  extracted_product_name: string;
  extracted_quantity: number;
  price: number; // Untuk visual di UI
};

export type StockOpnameData = {
  rack_number: string | null;
  stockopname_date: string;
  image_url: string;
  items: StockItem[];
};

type Status =
  | "initial"
  | "extracting"
  | "review"
  | "saving"
  | "success"
  | "error";

export default function NewStockOpnamePage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("initial");
  const [stockData, setStockData] = useState<StockOpnameData>({
    rack_number: "",
    stockopname_date: new Date().toISOString().split("T")[0],
    image_url: "",
    items: [],
  });

  const router = useRouter();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement> | File) => {
    if (e instanceof File) {
      setFile(e);
    } else if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
    setStatus("initial");
  };

  const handleExtract = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!file) return toast.error("Pilih gambar rak dulu!");

    setStatus("extracting");
    const formData = new FormData();
    formData.append("image", file);

    const extractPromise = fetch("/api/stock-opname/extract", {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        return result.data;
      })
      .then((data) => {
        setStockData({
          rack_number: data.rack_number,
          stockopname_date: data.extraction_date,
          image_url: data.image_url,
          items: data.items,
        });
        setStatus("review");
      });

    toast.promise(extractPromise, {
      loading: "AI sedang menganalisis rak dan label harga...",
      success: "Data rak berhasil diekstrak!",
      error: (err) => {
        setStatus("error");
        return err.message;
      },
    });
  };

  const handleSave = async () => {
    setStatus("saving");
    const savePromise = fetch("/api/stock-opname/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stockData),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal simpan");
        return res.json();
      })
      .then(() => {
        setStatus("success");
        router.push("/stockopname");
      });

    toast.promise(savePromise, {
      loading: "Menyimpan data stok opname...",
      success: "Stock Opname berhasil dicatat!",
      error: "Gagal menyimpan data.",
    });
  };

  return (
    <>
      <HeaderDashboard />
      <h1 className="text-xl items-center text-center mt-5 font-semibold">
        Tambah Stock Opname baru
      </h1>
      <div className="p-8 max-w-6xl mx-auto">
        {(status === "initial" ||
          status === "extracting" ||
          status === "error") && (
          <UploadForm
            file={file}
            status={status}
            handleFileChange={handleFileChange}
            handleExtract={handleExtract}
          />
        )}

        {(status === "review" || status === "saving") && (
          <ReviewStockData
            data={stockData}
            setData={setStockData}
            onSave={handleSave}
            isSaving={status === "saving"}
          />
        )}
      </div>
    </>
  );
}
