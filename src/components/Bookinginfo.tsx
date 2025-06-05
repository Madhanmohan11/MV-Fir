import React from 'react';
import { useBooking } from '../context/BookingContext';

const BookingInfo: React.FC = () => {
  const { resortDetails } = useBooking();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-4xl md:text-5xl font-bold mt-0 mb-6 leading-tight bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
        Booking Information
        </h2>
        <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-8 rounded-2xl shadow-xl">
          <div className="text-3xl font-bold text-gray-800 mb-4">
            ₹{resortDetails.pricing.toLocaleString()}{' '}
            <span className="text-lg text-gray-600">per day</span>
          </div>
          <p className="text-gray-600 mb-8">
            Experience luxury accommodation with all amenities included
          </p>
          <a
            href="/booking"
            className="inline-block bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
          >
            Book Your Stay Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default BookingInfo;
