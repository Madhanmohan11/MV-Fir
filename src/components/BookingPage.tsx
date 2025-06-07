import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Users, CheckCircle2, XCircle, Info } from 'lucide-react'; // Import icons for better visual cues
import { format, parseISO } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

const BookingPage = () => {
  const navigate = useNavigate();
  const {
    bookingDetails,
    setBookingDetails,
    resortDetails,
    availableSlots, // availableSlots would ideally be dynamic based on date
    addBooking,
  } = useBooking();

  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isStepValid, setIsStepValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today's date for minimum date selection
  const [currentDate] = useState(new Date().toISOString().split('T')[0]); // Use state for a stable 'today'

  const handleInputChange = (field: string, value: string | number) => {
    setBookingDetails((prev) => {
      const updatedDetails = {
        ...prev,
        [field]: value,
        totalAmount:
          field === 'members'
            ? Number(value) * resortDetails.pricing
            : prev.totalAmount,
      };
      return updatedDetails;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Memoize validateStep to prevent unnecessary re-renders and issues with useEffect deps
  const validateStep = useCallback((step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!bookingDetails.date) newErrors.date = 'Date is required';
      if (!bookingDetails.timeSlot)
        newErrors.timeSlot = 'Time slot is required';
      if (bookingDetails.members < 1)
        newErrors.members = 'At least 1 guest is required';
    }

    if (step === 2) {
      if (!bookingDetails.fullName.trim())
        newErrors.fullName = 'Full name is required';
      if (!bookingDetails.email.trim())
        newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(bookingDetails.email))
        newErrors.email = 'Email is invalid';
      if (!bookingDetails.phone.trim())
        newErrors.phone = 'Phone number is required';
      else if (
        !/^\d{10}$/.test(bookingDetails.phone.replace(/\D/g, ''))
      )
        newErrors.phone = 'Phone number must be 10 digits';
    }

    setErrors(newErrors); // setErrors here will trigger re-render
    return Object.keys(newErrors).length === 0;
  }, [bookingDetails]); // Dependencies for useCallback

  useEffect(() => {
    setIsStepValid(validateStep(currentStep));
  }, [bookingDetails, currentStep, validateStep]); // Corrected dependencies


  // Effect to reset timeSlot when date changes
  useEffect(() => {
    // Only reset if a date was previously selected and has now changed
    // And if the new date is different from the old one
    if (bookingDetails.timeSlot && bookingDetails.date) {
      // If the date changes, clear the time slot to force re-selection for the new date
      // This assumes availableSlots might change based on date
      // If availableSlots is always static, you might not need to clear timeSlot
      setBookingDetails(prev => ({
        ...prev,
        timeSlot: '', // Clear time slot if date changes
      }));
    }
  }, [bookingDetails.date, setBookingDetails]); // Depend on bookingDetails.date

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setIsSubmitting(true);
      try {
        const result = await addBooking(bookingDetails);

        if (result.status === 'created') {
          toast({
            title: "🎉 Booking Confirmed!",
            description: `Great news, ${bookingDetails.fullName}! Your ${resortDetails.name} experience on ${format(parseISO(bookingDetails.date), 'PPP')} at ${bookingDetails.timeSlot} is confirmed. Proceeding to secure your spot.`,
            action: <CheckCircle2 className="text-green-500" />, // Icon for success
            duration: 5000, // Show for 5 seconds
          });
          navigate('/payment');
        } else if (result.status === 'exists') {
          toast({
            title: "Heads Up! Duplicate Booking",
            description: `It looks like you've already reserved the ${bookingDetails.timeSlot} slot on ${format(parseISO(bookingDetails.date), 'PPP')} with this email. Check your existing bookings!`,
            action: <Info className="text-blue-500" />, // Icon for info/warning
            duration: 6000, // Show for 6 seconds
          });
          // You might choose to navigate to existing bookings or keep them on the page
          // navigate('/my-bookings');
        }
      } catch (error) {
        console.error('Booking save failed:', error);
        toast({
          title: "Booking Failed 😔",
          description: "Oops! We encountered an issue while processing your booking. Please review your details and try again.",
          variant: "destructive",
          action: <XCircle className="text-red-500" />, // Icon for error
          duration: 7000, // Show for 7 seconds
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Book Your Stay
          </h1>
          <p className="text-gray-600 text-lg">
            {resortDetails?.name ?? 'Resort'} - ₹
            {resortDetails?.pricing?.toLocaleString() ?? '0'} per person per
            day
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                {step !== 2 && (
                  <div
                    className={`w-16 h-1 ${
                      currentStep > step
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && (
            <>
              {/* Step 1 */}
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Select Date & Time
              </h2>

              {/* Date */}
              <div className="mb-6">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Check-in Date
                </label>
                <input
                  type="date"
                  id="date"
                  min={currentDate} // Use currentDate from state
                  value={bookingDetails.date}
                  onChange={(e) =>
                    handleInputChange('date', e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-orange-500`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              {/* Time Slot */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/*
                    IMPORTANT: availableSlots should ideally be fetched dynamically
                    based on the selected 'date' from your backend or a booking system.
                    For now, it uses what's provided by useBooking context.
                  */}
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
                {errors.timeSlot && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.timeSlot}
                  </p>
                )}
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
                  Total: ₹
                  {(bookingDetails.members * resortDetails.pricing).toLocaleString()}
                </p>
                {errors.members && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.members}
                  </p>
                )}
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              {/* Step 2 */}
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Customer Details
              </h2>

              {/* Full Name */}
              <div className="mb-4">
                <label htmlFor="fullName" className="font-medium text-sm text-gray-700">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={bookingDetails.fullName}
                  onChange={(e) =>
                    handleInputChange('fullName', e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-orange-500`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="font-medium text-sm text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={bookingDetails.email}
                  onChange={(e) =>
                    handleInputChange('email', e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-orange-500`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="mb-6">
                <label htmlFor="phone" className="font-medium text-sm text-gray-700">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={bookingDetails.phone}
                  onChange={(e) =>
                    handleInputChange('phone', e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-orange-500`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-orange-50 p-4 rounded-lg shadow-sm space-y-2">
                <p>Date: {bookingDetails.date && format(parseISO(bookingDetails.date), 'PPP')}</p>
                <p>Time: {bookingDetails.timeSlot}</p>
                <p>Guests: {bookingDetails.members}</p>
                <p className="font-bold text-orange-600">
                  Total: ₹{(bookingDetails.members * resortDetails.pricing).toLocaleString()}
                </p>
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleNext}
              disabled={!isStepValid || isSubmitting}
              className={`px-8 py-3 rounded-lg font-semibold shadow-lg transform transition ${
                isStepValid && !isSubmitting
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:scale-105'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Processing...' : (currentStep === 2 ? 'Proceed to Payment' : 'Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;