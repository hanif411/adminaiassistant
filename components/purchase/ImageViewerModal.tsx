// components/ImageViewerModal.tsx
"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCw, X } from "lucide-react";

interface ImageViewerModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageViewerModal({
  imageUrl,
  isOpen,
  onClose,
}: ImageViewerModalProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const imageStyle = {
    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
    transition: "transform 0.3s ease",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h3 className="text-white">Foto Faktur Asli - Fullscreen</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Invoice Fullscreen"
          className="max-w-full max-h-full object-contain"
          style={imageStyle}
        />
      </div>

      <div className="flex items-center justify-center gap-2 p-4 bg-black/50">
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 50}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Zoom Out">
          <ZoomOut className="w-6 h-6 text-white" />
        </button>

        <span className="px-6 py-3 bg-white/10 rounded-lg text-white min-w-[100px] text-center">
          {zoom}%
        </span>

        <button
          onClick={handleZoomIn}
          disabled={zoom >= 200}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Zoom In">
          <ZoomIn className="w-6 h-6 text-white" />
        </button>

        <div className="w-px h-10 bg-white/30 mx-2" />

        <button
          onClick={handleRotate}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          title="Rotate 90°">
          <RotateCw className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
