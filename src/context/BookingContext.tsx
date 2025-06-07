import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc, // Used for creating/updating a document with a specific ID
  Timestamp,
  // query, // Not directly used in the final version of addBooking, keeping for completeness if needed
  // where, // Not directly used in the final version of addBooking, keeping for completeness if needed
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext';

// Types
interface BookingDetails {
  id?: string; // Firestore document ID, might be the custom key or a generated one
  fullName: string;
  members: number;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  totalAmount: number;
  createdAt: Timestamp;
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
  isUnderMaintenance?: boolean;
  discountMessage?: string;
}

interface BookingContextType {
  bookingDetails: Omit<BookingDetails, 'id' | 'createdAt'>;
  setBookingDetails: (details: Omit<BookingDetails, 'id' | 'createdAt'>) => void;
  resortDetails: ResortDetails;
  setResortDetails: (details: ResortDetails) => void;
  bookings: BookingDetails[];
  fetchBookings: () => Promise<void>;
  // Updated return type: now returns an object with status and id
  addBooking: (booking: Omit<BookingDetails, 'id' | 'createdAt'>) => Promise<{ status: 'created' | 'exists', id: string }>;
  availableSlots: string[];
  loadingBookings: boolean;
  errorBookings: string | null;
  loadingResort: boolean;
  errorResort: string | null;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

// Context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Hook
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// Provider
export const BookingProvider = ({ children }: { ReactNode }) => {
  const { currentUser, loading: authLoading } = useAuth();

  const [bookingDetails, setBookingDetails] = useState<Omit<BookingDetails, 'id' | 'createdAt'>>({
    fullName: '',
    members: 1,
    email: '',
    phone: '',
    date: '',
    timeSlot: '',
    totalAmount: 0,
  });

  const [resortDetails, setResortDetails] = useState<ResortDetails>({
    name: '',
    description: '',
    pricing: 0,
    videoUrl: '',
    gallery: [],
  });

  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [errorBookings, setErrorBookings] = useState<string | null>(null);
  const [loadingResort, setLoadingResort] = useState(false);
  const [errorResort, setErrorResort] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const availableSlots = useMemo(
    () => [
      '09:00 AM - 12:00 PM',
      '12:00 PM - 03:00 PM',
      '03:00 PM - 06:00 PM',
      '06:00 PM - 09:00 PM',
    ],
    []
  );

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    setErrorBookings(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'bookings'));
      const fetchedBookings: BookingDetails[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, // The document ID is now the unique key generated below
          fullName: data.fullName || '',
          members: data.members || 0,
          email: data.email || '',
          phone: data.phone || '',
          date: data.date || '',
          timeSlot: data.timeSlot || '',
          totalAmount: data.totalAmount || 0,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
        };
      });
      setBookings(fetchedBookings);
    } catch (err) {
      console.error("Failed to fetch bookings from Firestore:", err);
      setErrorBookings('Failed to fetch bookings');
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const fetchResortConfig = useCallback(async () => {
    setLoadingResort(true);
    setErrorResort(null);
    try {
      const docRef = doc(db, 'resortConfig', 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setResortDetails({
          name: data.name || '',
          description: data.description || '',
          pricing: data.pricing || 0,
          videoUrl: data.videoUrl || '',
          gallery: Array.isArray(data.gallery)
            ? data.gallery
                .filter((item: any) => item?.url)
                .map((item: any) => ({
                  url: item.url || '',
                  caption: item.caption || '',
                }))
            : [],
          isUnderMaintenance: data.isUnderMaintenance || false,
          discountMessage: data.discountMessage || '',
        });
      } else {
        console.warn("No 'resortConfig/main' document found in Firestore.");
      }
    } catch (err) {
      console.error("Error fetching resort config:", err);
      setErrorResort('Failed to fetch resort details');
    } finally {
      setLoadingResort(false);
    }
  }, []);

  useEffect(() => {
    fetchResortConfig();
    if (!authLoading && currentUser) {
      fetchBookings();
      // Example: Admin check - replace with your actual admin role check
      // For a more robust solution, admin roles should be managed in Firestore/backend.
      if (currentUser.email === 'admin@example.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false); // Ensure it's reset if user logs out or changes
      }
    } else if (!authLoading && !currentUser) {
      // If no user is logged in, perhaps reset bookings or clear admin status
      setBookings([]);
      setIsAdmin(false);
    }
  }, [fetchBookings, fetchResortConfig, authLoading, currentUser]);

  const addBooking = useCallback(async (booking: Omit<BookingDetails, 'id' | 'createdAt'>) => {
    try {
      // 1. Define what makes a booking unique in your application
      //    Using email, date, and timeSlot as a composite key.
      //    Ensure email is trimmed and normalized if necessary.
      //    Example: "user@example.com-2025-06-07-09:00 AM - 12:00 PM"
      const uniqueBookingKey = `${booking.email.toLowerCase().trim()}-${booking.date}-${booking.timeSlot}`;

      // 2. Create a document reference with the custom ID
      const bookingDocRef = doc(db, 'bookings', uniqueBookingKey);

      // 3. Check if a document with this ID already exists
      const docSnap = await getDoc(bookingDocRef);

      if (docSnap.exists()) {
        // If a booking with this unique key already exists, prevent re-creation
        console.warn(`Booking already exists with ID: ${uniqueBookingKey}. Returning existing document ID.`);
        // !!! IMPORTANT: The alert() call has been removed from here !!!
        await fetchBookings(); // Still refresh to ensure latest state on dashboard
        return { status: 'exists', id: docSnap.id }; // Indicate that it already existed
      }

      // 4. If it does NOT exist, proceed to save the new booking
      const bookingDataToSave = {
        ...booking,
        createdAt: Timestamp.now(),
      };

      // Use setDoc to create the document with the specified unique ID.
      // If docSnap.exists() was false, this will create a new document.
      await setDoc(bookingDocRef, bookingDataToSave);

      // 5. Refresh the list of bookings in the context state
      await fetchBookings();

      return { status: 'created', id: uniqueBookingKey }; // Indicate new creation
    } catch (err) {
      console.error("Error adding booking to Firestore:", err);
      // Re-throw the error so the calling component (BookingPage) can handle it
      throw err;
    }
  }, [fetchBookings]); // fetchBookings is a dependency of this useCallback

  return (
    <BookingContext.Provider
      value={{
        bookingDetails,
        setBookingDetails,
        resortDetails,
        setResortDetails,
        bookings,
        fetchBookings,
        addBooking,
        availableSlots,
        loadingBookings,
        errorBookings,
        loadingResort,
        errorResort,
        isAdmin,
        setIsAdmin,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};