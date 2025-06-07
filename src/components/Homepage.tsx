import React, { useState } from "react";
import { useBooking } from "../context/BookingContext"; // Still needed for other resortDetails
import { Star, MapPin, Phone } from "lucide-react";
import About from "./About";
import Gallery from "./Gallery";
import Bookinsec from "./Bookinginfo";
import CustomerReviews from "./CustomerReviews";

// Import your local video file directly
// Assuming your video is in 'public/videos/resort_hero_video.mp4'
// In Vite/React, public assets are served from the root, so you can reference it directly
const LOCAL_VIDEO_PATH = "/logo-file/image/resort.mp4";

const Homepage = () => {
  const { resortDetails } = useBooking(); // Still using this for name, description etc.
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Scroll to the gallery section smoothly
  const scrollToGallery = () => {
    const gallerySection = document.getElementById("gallery-section");
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with HD Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Overlay to darken the video for text visibility */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>

        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          {/* Use the local video path directly */}
          <source src={LOCAL_VIDEO_PATH} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Content over the video */}
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">Premium Resort Experience</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-5 animate-fade-in bg-gradient-to-r from-white via-orange-100 to-teal-100 bg-clip-text text-transparent">
            {resortDetails.name || "MADRAS VILLA"}
          </h1>

          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in">
            {resortDetails.description || "Escape to paradise where luxury meets tranquility. Experience world-class amenities, breathtaking views, and unforgettable moments at our exclusive resort."}
          </p>

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <button
              onClick={scrollToGallery}
              className="inline-block bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full hover:bg-white/30 transition-all duration-300 font-semibold border border-white/30"
            >
              Explore Gallery
            </button>
            <a
              href="/booking"
              className="inline-block bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Book Your Stay
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm mt-10">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>ECR Chennai, Premium Destination</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-teal-400" />
              <span>24/7 Concierge Service</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Sections */}
      <About />

      <section id="gallery-section">
        <Gallery setSelectedImage={setSelectedImage} />
      </section>

      <Bookinsec />

      {/* Customer Reviews Section */}
      <CustomerReviews />

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Resort view"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors duration-300"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Homepage;
