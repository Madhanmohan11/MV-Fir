import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BookingDetails {
  fullName: string;
  members: number;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  totalAmount: number;
}

interface GalleryItem {
  url: string;
  caption: string;
}

interface ResortDetails {
  name: string;
  description: string;
  pricing: number;
  videoUrl: string;
  gallery: GalleryItem[];
}

interface BookingContextType {
  bookingDetails: BookingDetails;
  setBookingDetails: (details: BookingDetails) => void;
  resortDetails: ResortDetails;
  setResortDetails: (details: ResortDetails) => void;
  bookings: BookingDetails[];
  addBooking: (booking: BookingDetails) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  availableSlots: string[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    fullName: '',
    members: 1,
    email: '',
    phone: '',
    date: '',
    timeSlot: '',
    totalAmount: 0,
  });

  const [resortDetails, setResortDetails] = useState<ResortDetails>({
    name: 'MADRAS VILLA',
    description: 'Experience luxury and tranquility at our beautiful resort nestled in paradise.',
    pricing: 2500,
    videoUrl: '/logo-file/image/resort.mp4',
    gallery: [
      { url: '/logo-file/image/bedroom.jpeg', caption: 'Bedroom' },
      { url: '/logo-file/image/Living.jpeg', caption: 'Living Area' },
      { url: '/logo-file/image/S-pool.jpeg', caption: 'Swimming Pool' },
      { url: '/logo-file/image/Garden.jpeg', caption: 'Garden View' },
      { url: '/logo-file/image/Luxury-suit.jpeg', caption: 'Luxury Suite' },
      { url: '/logo-file/image/ter.jpeg', caption: 'Terrace' },
    ],
  });

  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const availableSlots = [
    '09:00 AM - 12:00 PM',
    '12:00 PM - 03:00 PM',
    '03:00 PM - 06:00 PM',
    '06:00 PM - 09:00 PM',
  ];

  const addBooking = (booking: BookingDetails) => {
    setBookings(prev => [...prev, booking]);
  };

  return (
    <BookingContext.Provider
      value={{
        bookingDetails,
        setBookingDetails,
        resortDetails,
        setResortDetails,
        bookings,
        addBooking,
        isAdmin,
        setIsAdmin,
        availableSlots,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
