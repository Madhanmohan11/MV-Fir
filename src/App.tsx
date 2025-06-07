import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner"; // Assuming you're using Sonner
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BookingProvider } from "./context/BookingContext";
import { AuthProvider } from "./context/AuthContext"; // Import your AuthProvider

import Homepage from "./components/Homepage";
import BookingPage from "./components/BookingPage";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminPasswordReset from "./components/AdminPasswordReset";
import PaymentPage from "./components/PaymentPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      {/* Wrap BrowserRouter with AuthProvider */}
      <AuthProvider>
        <BrowserRouter
          // Add the future flags here to opt-in early and remove warnings
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          {/* BookingProvider can remain inside AuthProvider if its state depends on auth, or outside if independent */}
          <BookingProvider>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/payment" element={<PaymentPage />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  {/* These admin routes are now protected by the AuthContext within AdminDashboard */}
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/reset-password" element={<AdminPasswordReset />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BookingProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;