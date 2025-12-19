"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Upload,
  X,
  Check,
  ScanLine,
  RefreshCw,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

interface UploadFormProps {
  file: File | null;
  status: string;
  handleFileChange: (e: ChangeEvent<HTMLInputElement> | File) => void;
  handleExtract: (e?: FormEvent) => void;
}

export function UploadForm({
  file,
  status,
  handleFileChange,
  handleExtract,
}: UploadFormProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fungsi Start Kamera
  const startCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      alert("Izin kamera ditolak atau tidak tersedia.");
      console.error(err);
    }
  };

  // 2. Fungsi Switch Kamera
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    startCamera(); // Restart stream dengan mode baru
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
  };

  // 3. Ambil Foto
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], "captured-stock.jpg", {
              type: "image/jpeg",
            });
            handleFileChange(capturedFile);
            setPreviewUrl(URL.createObjectURL(capturedFile));
            stopCamera();
          }
        }, "image/jpeg");
      }
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const clearSelection = () => {
    setPreviewUrl(null);
    handleFileChange(null as any);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-3xl mx-auto mb-10">
      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        {/* HEADER */}

        {previewUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="text-red-500 hover:bg-red-50">
            <X className="w-4 h-4 mr-1" /> Hapus
          </Button>
        )}

        <div className="p-8">
          {/* STATE 1: BELUM ADA FOTO & KAMERA MATI */}
          {!previewUrl && !showCamera && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={startCamera}
                  className="group flex flex-col items-center p-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-blue-600" />
                  </div>
                  <span className="font-bold text-gray-700">
                    Gunakan Kamera
                  </span>
                  <span className="text-xs text-gray-400">
                    Ambil foto rak langsung
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center p-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50/50 transition-all">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <span className="font-bold text-gray-700">Upload Galeri</span>
                  <span className="text-xs text-gray-400">
                    Pilih dari file HP/Komputer
                  </span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileInputChange}
                className="hidden"
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-sm text-blue-900">
                  <strong>Tips:</strong> Pastikan foto jelas dan tidak buram
                  untuk hasil ekstraksi terbaik.
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: MODE KAMERA AKTIF */}
          {showCamera && (
            <div className="space-y-4 animate-in zoom-in-95 duration-300">
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-[3/4] md:aspect-video shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Overlay Switch Camera */}
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/40 text-white transition-all">
                  <RefreshCw className="w-6 h-6" />
                </button>

                {/* Shutter Button */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-white/20 p-3 rounded-full text-white">
                    <X className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                    <div className="w-16 h-16 border-2 border-gray-800 rounded-full" />
                  </button>
                  <div className="w-12" /> {/* Spacer */}
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* STATE 3: PREVIEW FOTO TERPILIH */}
          {previewUrl && !showCamera && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative group mx-auto max-w-sm">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full rounded-xl shadow-md border-4 border-white"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}>
                    Ganti Foto
                  </Button>
                </div>
              </div>
              <div className="w-full text-center">
                <Button
                  onClick={() => handleExtract()}
                  disabled={status === "extracting"}>
                  {status === "extracting" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Mengekstrak Data...
                    </>
                  ) : (
                    <>
                      <Check className="" />
                      Proses Sekarang
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
