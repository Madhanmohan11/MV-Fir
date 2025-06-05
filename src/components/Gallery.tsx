import React, { useState } from "react";
import { useBooking } from "../context/BookingContext";

const Gallery = () => {
  const { resortDetails } = useBooking();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-neutral-100 to-pink-50">
      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full View"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Heading */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Gallery &{" "}
          <span className="bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-transparent">
            Moments
          </span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore our stunning facilities and beautiful spaces through our curated photo gallery
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {resortDetails.gallery.map(({ url, caption }, index) => (
          <div
            key={index}
            className="rounded-2xl overflow-hidden shadow-lg bg-white/30 backdrop-blur-md border border-white/40 transition-transform hover:scale-105 cursor-pointer"
            onClick={() => setSelectedImage(url)}
          >
            <img
              src={url}
              alt={`Resort view ${index + 1}`}
              className="w-full h-60 object-cover"
              onError={(e) => ((e.target as HTMLImageElement).src = "/logo-file/image/fallback.jpg")}
            />
            <div className="p-3 text-center text-sm font-semibold text-gray-800 bg-white/80 backdrop-blur-sm">
              {caption}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
