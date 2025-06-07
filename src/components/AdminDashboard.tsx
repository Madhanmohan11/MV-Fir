import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Adjust path if necessary
import { db } from "../firebase/firebaseConfig"; // Adjust path if necessary
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage"; // Import Firebase Storage functions
import { useToast } from "@/hooks/use-toast"; // Adjust path if necessary, assuming shadcn/ui toast

// Helper function to escape CSV values (should be defined once, preferably in a utility file)
const escapeCsv = (value: string | number | undefined | null) => {
  if (value === undefined || value === null) return ""; // Handle undefined or null values
  if (typeof value === "number") return String(value);
  let stringValue = String(value);
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    // Correct way to wrap in double quotes and escape existing ones
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// --- NEW DATE FORMATTER FUNCTION ---
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";
  try {
    // Assuming dateString is in 'YYYY-MM-DD' format
    const [year, month, day] = dateString.split('-');
    // Pad with '0' for single digit day/month if needed
    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
  } catch (e) {
    console.error("Error formatting date string:", dateString, e);
    return dateString; // Return original if formatting fails
  }
};

// Define interfaces for your data for better type safety
interface Booking {
  id?: string; // Firestore document ID
  fullName: string;
  email: string;
  phone: string;
  date: string; // Stored as 'YYYY-MM-DD' string
  timeSlot: string;
  members: number;
  totalAmount: number;
  createdAt: Timestamp; // Assuming you add this field for sorting
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const { toast } = useToast();

  const [resortDetails, setResortDetails] = useState<ResortDetails>({
    name: "",
    description: "",
    pricing: 0,
    videoUrl: "",
    gallery: [],
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("overview");
  const [editingResort, setEditingResort] = useState(false);
  const [editForm, setEditForm] = useState<ResortDetails>(resortDetails);

  // NEW STATE FOR BOOKING EDITING
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editBookingForm, setEditBookingForm] = useState<Booking | null>(null);

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);

  // --- Authentication Check and Redirect ---
  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      console.log("No current user, redirecting to /admin");
      navigate("/admin");
    } else {
      console.log("Current user detected:", currentUser.email);
      // Optional: Add a more specific admin role check here if needed
      // e.g., if (currentUser.email !== 'youradminemail@example.com') { navigate('/some-other-page'); }
    }
  }, [currentUser, loading, navigate]);

  // --- Fetch Resort Details from Firestore (Once on load) ---
  useEffect(() => {
    if (!loading && currentUser) {
      const fetchResortDetails = async () => {
        try {
          const docRef = doc(db, "resortConfig", "main");
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as ResortDetails;
            // Ensure gallery items have both url and caption
            const formattedGallery: GalleryItem[] = data.gallery
              ? data.gallery.map((item) => {
                  // Check if item is an object with 'url' and 'caption' properties
                  if (
                    typeof item === "object" &&
                    item !== null &&
                    "url" in item &&
                    "caption" in item
                  ) {
                    return item as GalleryItem;
                  }
                  // Fallback for older formats where gallery might just be an array of strings (urls)
                  // Or if 'caption' is missing, default it
                  return {
                    url: (item as GalleryItem)?.url || (item as string),
                    caption: (item as GalleryItem)?.caption || "",
                  };
                })
              : []; // Handle case where gallery might be undefined

            const formattedData = { ...data, gallery: formattedGallery };

            setResortDetails(formattedData);
            setEditForm(formattedData);
            console.log("Resort details fetched:", formattedData);
          } else {
            console.log("No resort config found! Initializing with defaults.");
            const defaultDetails: ResortDetails = {
              name: "Madras Villa",
              description: "Your tranquil getaway.",
              pricing: 5000,
              videoUrl: "",
              gallery: [],
            };
            setResortDetails(defaultDetails);
            setEditForm(defaultDetails);
            await setDoc(docRef, defaultDetails);
            toast({
              title: "Default resort config created!",
              description: "You can now edit these details and upload media.",
            });
          }
        } catch (error) {
          console.error("Error fetching resort details:", error);
          toast({
            title: "Error fetching resort details.",
            description: (error as Error).message || "Please try again.",
            variant: "destructive",
          });
        }
      };
      fetchResortDetails();
    } else {
      console.log(
        "Resort details useEffect skipped: loading=",
        loading,
        "currentUser=",
        currentUser
      );
    }
  }, [currentUser, loading, toast]);

  // --- Fetch Bookings from Firestore (Real-time) ---
  useEffect(() => {
    if (!loading && currentUser) {
      setBookingsLoading(true);
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedBookings: Booking[] = snapshot.docs.map((doc) => {
            const data = doc.data() as Omit<Booking, "id">;
            // Ensure createdAt is a Timestamp; if it's not present or is an object, default or convert
            const createdAt =
              data.createdAt instanceof Timestamp
                ? data.createdAt
                : Timestamp.now();
            return {
              id: doc.id,
              ...data,
              createdAt: createdAt, // Use the possibly corrected timestamp
            };
          });
          setBookings(fetchedBookings);
          setBookingsLoading(false);
        },
        (error) => {
          console.error("Error fetching bookings:", error);
          toast({
            title: "Error fetching bookings.",
            description: (error as Error).message || "Please try again.",
            variant: "destructive",
          });
          setBookingsLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      console.log(
        "Bookings useEffect skipped: loading=",
        loading,
        "currentUser=",
        currentUser
      );
    }
  }, [currentUser, loading, toast]);

  // --- Save Resort Details to Firestore ---
  const handleSaveResort = async () => {
    try {
      const docRef = doc(db, "resortConfig", "main");
      await setDoc(docRef, editForm);
      setResortDetails(editForm);
      setEditingResort(false);
      toast({
        title: "Resort details saved!",
        description: "Your resort information has been updated.",
      });
    } catch (error) {
      console.error("Error saving resort details:", error);
      toast({
        title: "Failed to save resort details.",
        description: (error as Error).message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditForm(resortDetails); // Revert changes by setting editForm back to current resortDetails
    setEditingResort(false);
  };

  // Handler to update the 'url' property of an existing gallery item
  const handleGalleryImageChange = (index: number, newUrl: string) => {
    setEditForm((prevEditForm) => {
      const newGallery = [...prevEditForm.gallery];
      newGallery[index] = { ...newGallery[index], url: newUrl };
      return { ...prevEditForm, gallery: newGallery };
    });
  };

  // Handler to update the 'caption' property of an existing gallery item
  const handleGalleryCaptionChange = (index: number, newCaption: string) => {
    setEditForm((prevEditForm) => {
      const newGallery = [...prevEditForm.gallery];
      newGallery[index] = { ...newGallery[index], caption: newCaption };
      return { ...prevEditForm, gallery: newGallery };
    });
  };

  // Add a new empty gallery item (object with empty url and caption)
  const addGalleryImage = () => {
    setEditForm((prevEditForm) => ({
      ...prevEditForm,
      gallery: [...prevEditForm.gallery, { url: "", caption: "" }],
    }));
  };

  // Remove a gallery item by index
  const removeGalleryImage = (index: number) => {
    setEditForm((prevEditForm) => ({
      ...prevEditForm,
      gallery: prevEditForm.gallery.filter((_, i) => i !== index),
    }));
  };

  // --- File Upload Handlers (for video only) ---
  const uploadFile = useCallback(
    async (file: File, type: "video") => {
      const storage = getStorage();
      // Ensure unique file name to prevent overwrites
      const filePath = `resort_media/videos/${file.name}_${Date.now()}`;
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      if (type === "video") {
        setUploadingVideo(true);
        setVideoUploadProgress(0);
      }

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (type === "video") {
            setVideoUploadProgress(progress);
          }
        },
        (error) => {
          console.error(`Upload error for ${type}:`, error);
          toast({
            title: `Failed to upload ${type}.`,
            description: error.message,
            variant: "destructive",
          });
          if (type === "video") {
            setUploadingVideo(false);
            setVideoUploadProgress(0);
          }
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              if (type === "video") {
                setEditForm((prev) => ({ ...prev, videoUrl: downloadURL }));
                toast({
                  title: "Video uploaded successfully!",
                  description: "The video URL has been updated.",
                });
              }
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
              toast({
                title: `Error getting ${type} download URL.`,
                description: error.message,
                variant: "destructive",
              });
            })
            .finally(() => {
              if (type === "video") {
                setUploadingVideo(false);
                setVideoUploadProgress(0);
              }
            });
        }
      );
    },
    [toast]
  );

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file, "video");
    }
  };

  // --- BOOKING EDITING FUNCTIONS ---
  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    // Create a mutable copy for the form
    setEditBookingForm({ ...booking });
  };

  const handleBookingFormChange = (
    field: keyof Booking,
    value: string | number | Timestamp
  ) => {
    if (editBookingForm) {
      setEditBookingForm((prev) => {
        if (!prev) return null;

        const updatedBooking = { ...prev, [field]: value };

        // Recalculate totalAmount if members or pricing changes
        if (field === "members") {
          const members = Number(value);
          // Ensure members is a valid number before calculation
          updatedBooking.members = isNaN(members) ? 0 : members;
          updatedBooking.totalAmount =
            updatedBooking.members * resortDetails.pricing;
        } else if (field === "totalAmount") {
          // If totalAmount is directly edited, use the value
          const amount = Number(value);
          updatedBooking.totalAmount = isNaN(amount) ? 0 : amount;
        }
        // No direct recalculation on 'date' change, as pricing isn't date-dependent here

        return updatedBooking;
      });
    }
  };

  const handleUpdateBooking = async () => {
    if (!editBookingForm || !editBookingForm.id) {
      toast({
        title: "Error: Booking not found.",
        description: "Cannot update a booking without an ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      const bookingDocRef = doc(db, "bookings", editBookingForm.id);
      // Remove the 'id' field before updating Firestore, as it's not part of the document data
      const { id, ...dataToUpdate } = editBookingForm;

      // Preserve original createdAt if not changed in the form or is missing
      if (!(dataToUpdate.createdAt instanceof Timestamp)) {
        dataToUpdate.createdAt = editingBooking?.createdAt || Timestamp.now();
      }

      await updateDoc(bookingDocRef, dataToUpdate);

      setEditingBooking(null);
      setEditBookingForm(null);
      toast({
        title: "Booking updated successfully!",
        description: `Booking for ${editBookingForm.fullName} has been updated.`,
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Failed to update booking.",
        description: (error as Error).message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this booking? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      const bookingDocRef = doc(db, "bookings", bookingId);
      await deleteDoc(bookingDocRef);
      toast({
        title: "Booking deleted!",
        description: "The booking has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Failed to delete booking.",
        description: (error as Error).message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelBookingEdit = () => {
    setEditingBooking(null);
    setEditBookingForm(null);
  };

  // --- EXPORT BOOKINGS TO CSV FUNCTION ---
  const exportBookingsToCSV = () => {
    if (bookings.length === 0) {
      toast({
        title: "No bookings to export.",
        description: "There are no booking records to download.",
      });
      return;
    }

    const headers = [
      "Booking ID",
      "Full Name",
      "Email",
      "Phone",
      "Date",
      "Time Slot",
      "Members",
      "Total Amount",
      "Booked At", // Corresponds to createdAt
    ];

    // 1. Sort the bookings array by date BEFORE mapping to CSV rows
    const sortedBookings = [...bookings].sort((a, b) => {
      // Assuming booking.date is in 'YYYY-MM-DD' format, which Date constructor handles
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime(); // Sorts from earliest to latest date
    });

    const rows = sortedBookings.map((booking) => {
      // Use the sortedBookings here
      // Format createdAt Timestamp to a readable string
      const bookedAtDate =
        booking.createdAt instanceof Timestamp
          ? booking.createdAt.toDate()
          : new Date(); // Fallback if it's somehow not a Timestamp

      const formattedBookedAt = bookedAtDate.toLocaleString("en-IN", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      // Using the externally defined escapeCsv function
      return [
        escapeCsv(booking.id), // id can be string or undefined, handle gracefully
        escapeCsv(booking.fullName),
        escapeCsv(booking.email),
        escapeCsv(booking.phone),
        escapeCsv(formatDateForDisplay(booking.date)), // APPLY FORMATTER HERE FOR CSV
        escapeCsv(booking.timeSlot),
        escapeCsv(booking.members),
        escapeCsv(booking.totalAmount),
        escapeCsv(formattedBookedAt),
      ];
    });

    // Combine headers and rows into a single CSV string
    const csvContent = [
      headers.map(escapeCsv).join(","), // Ensure headers are also escaped if they contain special chars
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create a Blob and download it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bookings_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link); // Clean up
    URL.revokeObjectURL(url); // Free up memory

    toast({
      title: "Bookings exported successfully!",
      description: "Your booking data has been downloaded as a CSV file.",
    });
  };
  // --- END EXPORT BOOKINGS TO CSV FUNCTION ---

  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + booking.totalAmount,
    0
  );
  const totalBookings = bookings.length;

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50">
        <p className="text-gray-600 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your resort and bookings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: "overview", label: "Overview", icon: "📊" },
                { id: "bookings", label: "Bookings", icon: "📅" },
                { id: "resort", label: "Resort Details", icon: "🏨" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-300 ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">
                      Total Bookings
                    </h3>
                    <p className="text-3xl font-bold">{totalBookings}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">
                      Total Revenue
                    </h3>
                    <p className="text-3xl font-bold">
                      ₹{totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">
                      Average Booking
                    </h3>
                    <p className="text-3xl font-bold">
                      ₹
                      {totalBookings > 0
                        ? Math.round(totalRevenue / totalBookings).toLocaleString()
                        : "0"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Recent Bookings
                  </h3>
                  {bookingsLoading ? (
                    <p className="text-gray-500">Loading bookings...</p>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-3">
                      {bookings
                        .slice() // create a copy to avoid mutating original state
                        .sort(
                          (a, b) =>
                            new Date(a.date).getTime() -
                            new Date(b.date).getTime()
                        )
                        .slice(0, 5)
                        .map((booking) => (
                          <div
                            key={booking.id}
                            className="flex justify-between items-center p-4 bg-white rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{booking.fullName}</p>
                              <p className="text-sm text-gray-600">
                                {formatDateForDisplay(booking.date)} - {booking.timeSlot} {/* Apply formatter here */}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-orange-600">
                                ₹{booking.totalAmount.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                {booking.members} members
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No bookings yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    All Bookings
                  </h2>
                  {/* Export Button */}
                  <button
                    onClick={exportBookingsToCSV}
                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-lg hover:from-teal-600 hover:to-green-600 transition-all duration-300"
                  >
                    Export to Excel
                  </button>
                </div>

                {bookingsLoading ? (
                  <p className="text-gray-500">Loading bookings...</p>
                ) : editingBooking ? ( // Conditional render for edit form
                  <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Edit Booking for {editingBooking.fullName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-gray-700">Full Name:</span>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
                          value={editBookingForm?.fullName || ""}
                          onChange={(e) =>
                            handleBookingFormChange("fullName", e.target.value)
                          }
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700">Email:</span>
                        <input
                          type="email"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
                          value={editBookingForm?.email || ""}
                          onChange={(e) =>
                            handleBookingFormChange("email", e.target.value)
                          }
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700">Phone:</span>
                        <input
                          type="tel"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
                          value={editBookingForm?.phone || ""}
                          onChange={(e) =>
                            handleBookingFormChange("phone", e.target.value)
                          }
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700">Date:</span>
                        <input
                          type="date"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
                          value={editBookingForm?.date || ""}
                          onChange={(e) =>
                            handleBookingFormChange("date", e.target.value)
                          }
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700">Time Slot:</span>
                        <input
                          type="text" // Or a select if you have fixed time slots
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
                          value={editBookingForm?.timeSlot || ""}
                          onChange={(e) =>
                            handleBookingFormChange("timeSlot", e.target.value)
                          }
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700">Members:</span>
                        <input
                          type="number"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
                          value={editBookingForm?.members || 0}
                          onChange={(e) =>
                            handleBookingFormChange(
                              "members",
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700">Total Amount:</span>
                        <input
                          type="number"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
                          value={editBookingForm?.totalAmount || 0}
                          onChange={(e) =>
                            handleBookingFormChange(
                              "totalAmount",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={handleUpdateBooking}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      >
                        Update Booking
                      </button>
                      <button
                        onClick={handleCancelBookingEdit}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings
                      .slice() // Create a shallow copy to avoid modifying the original array
                      .sort((a, b) => {
                        // Sort by date (earliest first)
                        const dateA = new Date(a.date);
                        const dateB = new Date(b.date);
                        if (dateA.getTime() !== dateB.getTime()) {
                          return dateA.getTime() - dateB.getTime();
                        }
                        // Then by creation time (newest first) for bookings on the same date
                        // Assuming `createdAt` is a Firestore Timestamp
                        return (
                          b.createdAt.toMillis() - a.createdAt.toMillis()
                        );
                      })
                      .map((booking) => (
                        <div
                          key={booking.id}
                          className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
                        >
                          <div className="flex-1">
                            <p className="text-lg font-bold text-gray-800">
                              {booking.fullName}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Email:</span>{" "}
                              {booking.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Phone:</span>{" "}
                              {booking.phone}
                            </p>
                          </div>
                          <div className="flex-1 md:text-center">
                            <p className="text-md font-medium text-gray-700">
                              <span className="font-bold">{formatDateForDisplay(booking.date)}</span> {/* Apply formatter here */}
                              {" "}at {booking.timeSlot}
                            </p>
                            <p className="text-sm text-gray-600">
                              {booking.members} members
                            </p>
                          </div>
                          <div className="flex-1 md:text-right">
                            <p className="text-xl font-bold text-orange-600 mb-2">
                              ₹{booking.totalAmount.toLocaleString()}
                            </p>
                            <div className="flex justify-start md:justify-end space-x-2">
                              <button
                                onClick={() => handleEditBooking(booking)}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  booking.id && handleDeleteBooking(booking.id)
                                }
                                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No bookings found</p>
                  </div>
                )}
              </div>
            )}

            {/* Resort Details Tab */}
            {activeTab === "resort" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Resort Details
                  </h2>
                  {!editingResort ? (
                    <button
                      onClick={() => setEditingResort(true)}
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-300"
                    >
                      Edit Details
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={handleSaveResort}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="resortName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Resort Name
                    </label>
                    {editingResort ? (
                      <input
                        id="resortName"
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">
                        {resortDetails.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="resortDescription"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Description
                    </label>
                    {editingResort ? (
                      <textarea
                        id="resortDescription"
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    ) : (
                      <p className="text-gray-700">
                        {resortDetails.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="resortPricing"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Pricing (per person per day)
                    </label>
                    {editingResort ? (
                      <input
                        id="resortPricing"
                        type="number"
                        value={editForm.pricing}
                        // Use parseInt with a fallback to 0 if input is not a valid number
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            pricing: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">
                        ₹{resortDetails.pricing.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Video URL Management */}
                  {/* <div>
                    <label
                      htmlFor="videoUrl"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Resort Video URL
                    </label>
                    {editingResort ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <input
                          id="videoUrl"
                          type="url"
                          value={editForm.videoUrl}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              videoUrl: e.target.value,
                            })
                          }
                          placeholder="Paste YouTube or Vimeo URL here"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <input
                          type="file"
                          id="videoUpload"
                          accept="video/*"
                          onChange={handleVideoFileChange}
                          className="hidden" // Hide the default file input
                        />
                        <label
                          htmlFor="videoUpload"
                          className={`px-4 py-3 text-center rounded-lg cursor-pointer transition-colors duration-300 text-sm whitespace-nowrap ${
                            uploadingVideo
                              ? "bg-gray-400 text-gray-700"
                              : "bg-purple-500 text-white hover:bg-purple-600"
                          }`}
                        >
                          {uploadingVideo
                            ? `Uploading (${videoUploadProgress.toFixed(0)}%)`
                            : "Upload Video"}
                        </label>
                      </div>
                    ) : (
                      resortDetails.videoUrl && (
                        <div className="relative aspect-video w-full max-w-xl mx-auto rounded-lg overflow-hidden shadow-lg">
                          <iframe
                            src={resortDetails.videoUrl}
                            title="Resort Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                          ></iframe>
                        </div>
                      )
                    )}
                    {!editingResort && !resortDetails.videoUrl && (
                      <p className="text-gray-500">No video URL set.</p>
                    )}
                  </div> */}



                  <div>
                    <label
                      htmlFor="galleryImages"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Gallery Images (Add by URL)
                    </label>
                    {editingResort ? (
                      <div className="space-y-4">
                        {editForm.gallery.map((image, index) => (
                          <div
                            key={`gallery-edit-${index}`} // Using index as key is fine here because items are added/removed sequentially
                            className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-center"
                          >
                            <input
                              type="url"
                              value={image.url}
                              onChange={(e) =>
                                handleGalleryImageChange(index, e.target.value)
                              }
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter image URL" // Explicitly confirm URL input
                            />
                            <input
                              type="text"
                              value={image.caption}
                              onChange={(e) =>
                                handleGalleryCaptionChange(
                                  index,
                                  e.target.value
                                )
                              }
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter image caption"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addGalleryImage}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                        >
                          Add New Image Field
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {resortDetails.gallery.length > 0 ? (
                          resortDetails.gallery.map((image, index) => (
                            <div
                              key={`gallery-view-${index}`} // Using index as key is fine here because items are static
                              className="relative group overflow-hidden rounded-lg shadow-md"
                            >
                              <img
                                src={image.url}
                                alt={
                                  image.caption || `Gallery image ${index + 1}`
                                }
                                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              {image.caption && (
                                <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {image.caption}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 col-span-full">
                            No gallery images set.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;