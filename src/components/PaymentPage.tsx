
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { bookingDetails, addBooking } = useBooking();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
    } else if (field === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/').slice(0, 5);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }
    
    setCardDetails({ ...cardDetails, [field]: formattedValue });
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validatePayment = () => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === 'card') {
      if (!cardDetails.name.trim()) newErrors.name = 'Cardholder name is required';
      if (!cardDetails.number.replace(/\s/g, '')) newErrors.number = 'Card number is required';
      else if (cardDetails.number.replace(/\s/g, '').length < 16) newErrors.number = 'Card number must be 16 digits';
      if (!cardDetails.expiry) newErrors.expiry = 'Expiry date is required';
      if (!cardDetails.cvv) newErrors.cvv = 'CVV is required';
      else if (cardDetails.cvv.length < 3) newErrors.cvv = 'CVV must be 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      addBooking(bookingDetails);
      setIsProcessing(false);
      navigate('/', { replace: true });
      
      // Show success message
      alert('🎉 Booking confirmed! Thank you for choosing MADRASS VILLA. You will receive a confirmation email shortly.');
    }, 2000);
  };

  if (!bookingDetails.fullName) {
    navigate('/booking');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Complete Payment
          </h1>
          <p className="text-gray-600 text-lg">Secure payment for your resort booking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Guest Name:</span>
                <span className="font-medium">{bookingDetails.fullName}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{bookingDetails.email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{bookingDetails.phone}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{bookingDetails.date}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Time Slot:</span>
                <span className="font-medium">{bookingDetails.timeSlot}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Number of Members:</span>
                <span className="font-medium">{bookingDetails.members}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between py-2 text-lg font-bold text-orange-600">
                  <span>Total Amount:</span>
                  <span>₹{bookingDetails.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Details</h2>
            
            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg text-center transition-all duration-300 ${
                    paymentMethod === 'card'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 hover:border-orange-300'
                  }`}
                >
                  💳 Credit/Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 border-2 rounded-lg text-center transition-all duration-300 ${
                    paymentMethod === 'upi'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 hover:border-orange-300'
                  }`}
                >
                  📱 UPI Payment
                </button>
              </div>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => handleCardInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter cardholder name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => handleCardInputChange('number', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1234 5678 9012 3456"
                  />
                  {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.expiry ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="MM/YY"
                    />
                    {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.cvv ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123"
                    />
                    {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* UPI Payment */}
            {paymentMethod === 'upi' && (
              <div className="text-center py-8">
                <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-500 text-lg">QR Code</span>
                </div>
                <p className="text-gray-600 mb-4">Scan the QR code to pay via UPI</p>
                <p className="text-sm text-gray-500">Or pay to UPI ID: payment@madrassvilla.com</p>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                `Pay ₹${bookingDetails.totalAmount.toLocaleString()}`
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
