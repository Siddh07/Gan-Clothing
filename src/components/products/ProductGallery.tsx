"use client";

import React, { useState } from "react";
import { ZoomIn, Package } from "lucide-react";

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
    <div className="space-y-4">
      {/* Main Image Container */}
      <div
        className="relative h-96 sm:h-[480px] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-crosshair group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={selectedImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-200"
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
          <div className="absolute bottom-3 right-3 bg-slate-900/70 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center pointer-events-none">
            <ZoomIn className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            Hover to Zoom
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${selectedImage === img
                  ? "border-emerald-700 ring-2 ring-emerald-500/20 shadow-md"
                  : "border-slate-200 opacity-70 hover:opacity-100"
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
