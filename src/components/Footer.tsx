import React from 'react';
import { useBooking } from '../context/BookingContext';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Make sure this exists in your project
import { Link } from 'react-router-dom';

const Footer = () => {
  const { resortDetails } = useBooking();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand / Resort Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="../assets/logo-file/12.png" // <-- remove '/public', just start from root
                alt={`${resortDetails?.name || 'Resort'} Logo`} 
                className="h-7 w-auto"
              />
              <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                {resortDetails?.name || 'Madrass Villa'}
              </h3>
            </div>

            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Experience luxury and tranquility at our premium resort destination. 
              Create unforgettable memories with world-class amenities and breathtaking views.
            </p>

            <div className="flex space-x-4 mb-6">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-teal-400">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-400">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-teal-400">
                <Twitter className="w-5 h-5" />
              </Button>
            </div>

            {/* Contact Info */}
            <h4 className="text-xl font-semibold mb-4 text-teal-400">Contact</h4>
            <div className="space-y-3 max-w-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Premium Resort Location</p>
                  <p className="text-gray-400 text-sm">ECR Chennai, India</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-400" />
                <p className="text-gray-300">+91 9876543210</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-400" />
                <p className="text-gray-300">info@madrassvilla.com</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-teal-400">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="/" className="hover:text-orange-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="/booking" className="hover:text-orange-400 transition-colors">Book Now</a>
              </li>
              <li>
                <a href="/#gallery" className="hover:text-orange-400 transition-colors">Gallery</a>
              </li>
              <li>
                <Link to="/admin" className="hover:text-orange-400 transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

        
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
         <p className="text-gray-400 text-sm">
  © {currentYear} {resortDetails?.name || 'Madrass Villa'}. All rights reserved. | Designed with ❤️ by{' '}
  <a
    href="https://digivybe.in"
    target="_blank"
    rel="noopener noreferrer"
    className="text-orange-400 font-semibold hover:underline"
  >
    Digivybe
  </a>
</p>


          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
