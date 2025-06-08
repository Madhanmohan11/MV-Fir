import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

const Navbar = () => {
  const location = useLocation();
  const { isAdmin, setIsAdmin, resortDetails } = useBooking();

  const handleLogout = () => {
    setIsAdmin(false);
  };

  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Resort Name (shown only on md+) */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="../logo-file/12.png"
              alt="Madras Villa Logo"
              className="h-8 w-auto"
            />
            <span className="hidden md:block text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              {resortDetails?.name}
            </span>
          </Link>

          {/* Right-side Buttons */}
          <div className="flex items-center space-x-4">
            {location.pathname === '/' && (
              <>
                {/* <Link
                  to="/booking"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-5 py-1 rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Book Now
                </Link> */}

                {!isAdmin && (
                  <Link
                    to="/admin"
                    className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-5 py-1 rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}

            {isAdmin && (
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 transition-colors duration-300"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
