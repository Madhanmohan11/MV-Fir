import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Users } from 'lucide-react'; // Only Users is used
import { format, parseISO } from 'date-fns';

const BookingPage = () => {
  const navigate = useNavigate();
  const { bookingDetails, setBookingDetails, resortDetails, availableSlots } = useBooking();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
      // Recalculate totalAmount only if 'members' field changes
      totalAmount: field === 'members'
        ? Number(value) * resortDetails.pricing
        : prevDetails.totalAmount,
    }));

    // Clear error for the current field if it exists
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!bookingDetails.date) newErrors.date = 'Date is required';
      if (!bookingDetails.timeSlot) newErrors.timeSlot = 'Time slot is required';
      if (bookingDetails.members < 1) newErrors.members = 'At least 1 member is required';
    }

    if (step === 2) {
      if (!bookingDetails.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!bookingDetails.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(bookingDetails.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!bookingDetails.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(bookingDetails.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Phone number must be 10 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        // Ensure totalAmount is correctly updated before moving to the next step
        setBookingDetails((prevDetails) => ({
          ...prevDetails,
          totalAmount: prevDetails.members * resortDetails.pricing,
        }));
        setCurrentStep(2);
      } else if (currentStep === 2) {
        navigate('/payment');
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Book Your Stay
          </h1>
          <p className="text-gray-600 text-lg">
            {resortDetails.name} - ₹{resortDetails.pricing.toLocaleString()} per person per day
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 3 ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Date & Time</h2>

              <div>
                <Label htmlFor="check-in-date">
                  Check-in Date
                </Label>
                <input
                  id="check-in-date"
                  type="date"
                  min={today}
                  value={bookingDetails.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <Label>
                  Time Slot
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleInputChange('timeSlot', slot)}
                      className={`p-4 border-2 rounded-lg text-left transition-all duration-300 ${
                        bookingDetails.timeSlot === slot
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 hover:border-orange-300 hover:bg-orange-25'
                      }`}
                    >
                      <div className="font-medium">{slot}</div>
                    </button>
                  ))}
                </div>
                {errors.timeSlot && <p className="text-red-500 text-sm mt-1">{errors.timeSlot}</p>}
              </div>

              {/* Members */}
              <div className="mb-6 space-y-2">
                <Label className="text-gray-700 font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Number of Guests *
                </Label>
                <Select
                  value={bookingDetails.members.toString()}
                  onValueChange={(value) =>
                    handleInputChange('members', parseInt(value))
                  }
                >
                  <SelectTrigger className="w-full max-w-xs p-3 border-2 border-cyan-600 rounded-xl">
                    <SelectValue placeholder="Select guests" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1} Guest{i > 0 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Total: ₹{(bookingDetails.members * resortDetails.pricing).toLocaleString()}
                </p>
                {errors.members && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.members}
                  </p>
                )}
              </div>
            </div>
          )}


          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Details</h2>

              <div>
                <Label htmlFor="full-name">
                  Full Name
                </Label>
                <input
                  id="full-name"
                  type="text"
                  value={bookingDetails.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <Label htmlFor="email-address">
                  Email Address
                </Label>
                <input
                  id="email-address"
                  type="email"
                  value={bookingDetails.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone-number">
                  Phone Number
                </Label>
                <input
                  id="phone-number"
                  type="tel"
                  value={bookingDetails.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* Booking Summary */}
              <div className="bg-orange-50 p-4 rounded-lg shadow-sm space-y-2">
                <p>Date: {bookingDetails.date && format(parseISO(bookingDetails.date), 'PPP')}</p>
                <p>Time: {bookingDetails.timeSlot}</p>
                <p>Guests: {bookingDetails.members}</p>
                <p className="font-bold text-orange-600">
                  Total: ₹{(bookingDetails.members * resortDetails.pricing).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}

            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {currentStep === 2 ? 'Proceed to Payment' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;