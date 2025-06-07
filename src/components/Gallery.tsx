import React, { useState } from "react";
import { useBooking } from "../context/BookingContext";
import { X } from "lucide-react";

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
          <div className="relative max-w-4xl w-full px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Full View"
              className="w-full h-auto object-contain rounded-xl shadow-lg"
              onError={(e) =>
                ((e.target as HTMLImageElement).src = "/logo-file/image/fallback.jpg")
              }
            />
            <button
              className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 p-2 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Heading */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Gallery &{" "}
          <span className="bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-transparent">
            Moments
          </span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our stunning facilities and beautiful spaces through our
          curated photo gallery.
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {resortDetails.gallery.map(({ url, caption }, index) => (
          <div
            key={index}
            className="rounded-2xl overflow-hidden shadow-lg bg-white/30 backdrop-blur-md border border-white/40 transition-transform duration-300 hover:scale-105 cursor-pointer"
            onClick={() => setSelectedImage(url)}
          >
            <img
              src={url}
              alt={caption || `Resort view ${index + 1}`}
              className="w-full h-60 object-cover"
              onError={(e) =>
                ((e.target as HTMLImageElement).src = "/logo-file/image/fallback.jpg")
              }
            />
           <div className="p-3 text-center text-base font-bold text-pink-700 bg-gradient-to-r from-yellow-100 via-pink-100 to-orange-100 backdrop-blur-sm shadow-inner tracking-wide">
            {caption || "Beautiful Resort View"}
          </div>  

          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
