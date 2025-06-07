
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, Car, Music, Waves, TreePine, Gamepad2 } from 'lucide-react';
import dayi from '/logo-file/image/Day-ori.png';

const About = () => {
  const amenities = [
    { icon: Waves, name: 'Swimming Pool', desc: 'Crystal clear waters' },
    { icon: Wifi, name: 'Free WiFi', desc: 'High-speed internet' },
    { icon: Car, name: 'Parking', desc: 'Complimentary valet' },
    { icon: Music, name: 'Music Sys', desc: 'JBL Sound System' },
    { icon: TreePine, name: 'Garden', desc: 'Landscaped grounds' },
    { icon: Gamepad2, name: 'Indoor-game', desc: 'Shuttle, Carrom, Chess' }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Experience <span className="bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-transparent">Luxury</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nestled in a pristine location, MADRAS VILLA offers an unparalleled resort experience. 
              From our world-class amenities to our exceptional service, every detail is designed to create unforgettable memories.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Home Away From Home</h3>
              <div className="space-y-4 text-gray-600">
                <p className="leading-relaxed">
                  Our resort features elegantly appointed accommodations with modern amenities and traditional charm. 
                  Each space is thoughtfully designed to provide comfort and tranquility during your stay.
                </p>
                <p className="leading-relaxed">
                  Whether you're seeking adventure or relaxation, our diverse range of activities and facilities 
                  ensures there's something special for every guest. From sunrise yoga sessions to evening entertainment, 
                  your days will be filled with memorable experiences.
                </p>
                <p className="leading-relaxed">
                  Our dedicated staff is committed to providing personalized service that exceeds expectations, 
                  making your stay truly exceptional.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src=  {dayi}
                alt="Resort Interior"
                className="rounded-2xl shadow-2xl w-full h-80 object-cover"
              />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-teal-500 to-orange-500 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-orange-500 to-teal-500 rounded-full opacity-20"></div>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Premium Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {amenities.map((amenity, index) => (
                <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-br from-teal-500 to-orange-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <amenity.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">{amenity.name}</h4>
                    <p className="text-sm text-gray-600">{amenity.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
