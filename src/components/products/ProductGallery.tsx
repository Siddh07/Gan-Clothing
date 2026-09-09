"use client";

import React, { useState } from "react";
import { ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(
    images[0] || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800"
  );
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="space-y-3">
      {/* Main Image Container */}
      <div
        className="relative h-96 sm:h-[460px] w-full rounded-none overflow-hidden bg-[#F6F7F8] border border-[#0D0D0D] cursor-crosshair group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={selectedImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-150"
          style={
            isZoomed
              ? {
                  transform: "scale(1.75)",
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }
              : undefined
          }
        />

        {!isZoomed && (
          <div className="absolute bottom-3 right-3 bg-[#0D0D0D] text-white font-mono text-[10px] uppercase px-2.5 py-1 flex items-center pointer-events-none">
            <ZoomIn className="w-3.5 h-3.5 mr-1" />
            Inspect Weft / Weave
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`relative w-20 h-20 rounded-none overflow-hidden shrink-0 border transition-all ${
                selectedImage === img
                  ? "border-[#0D0D0D] ring-1 ring-[#0D0D0D]"
                  : "border-[#E1E4E7] opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
