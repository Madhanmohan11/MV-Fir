
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { resortDetails, setResortDetails, bookings, isAdmin } = useBooking();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingResort, setEditingResort] = useState(false);
  const [editForm, setEditForm] = useState(resortDetails);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleSaveResort = () => {
    setResortDetails(editForm);
    setEditingResort(false);
  };

  const handleCancelEdit = () => {
    setEditForm(resortDetails);
    setEditingResort(false);
  };

  const handleGalleryImageChange = (index: number, newUrl: string) => {
    const newGallery = [...editForm.gallery];
    newGallery[index] = newUrl;
    setEditForm({ ...editForm, gallery: newGallery });
  };

  const addGalleryImage = () => {
    setEditForm({
      ...editForm,
      gallery: [...editForm.gallery, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80']
    });
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = editForm.gallery.filter((_, i) => i !== index);
    setEditForm({ ...editForm, gallery: newGallery });
  };

  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const totalBookings = bookings.length;

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Manage your resort and bookings</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'bookings', label: 'Bookings', icon: '📅' },
                { id: 'resort', label: 'Resort Details', icon: '🏨' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-300 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">Total Bookings</h3>
                    <p className="text-3xl font-bold">{totalBookings}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">Average Booking</h3>
                    <p className="text-3xl font-bold">
                      ₹{totalBookings > 0 ? Math.round(totalRevenue / totalBookings).toLocaleString() : '0'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Bookings</h3>
                  {bookings.length > 0 ? (
                    <div className="space-y-3">
                      {bookings.slice(-5).reverse().map((booking, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-white rounded-lg">
                          <div>
                            <p className="font-medium">{booking.fullName}</p>
                            <p className="text-sm text-gray-600">{booking.date} - {booking.timeSlot}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-600">₹{booking.totalAmount.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">{booking.members} members</p>
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
            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">All Bookings</h2>
                {bookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Guest Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Booking Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bookings.map((booking, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="font-medium text-gray-900">{booking.fullName}</p>
                                <p className="text-sm text-gray-500">{booking.members} members</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm text-gray-900">{booking.email}</p>
                                <p className="text-sm text-gray-500">{booking.phone}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm text-gray-900">{booking.date}</p>
                                <p className="text-sm text-gray-500">{booking.timeSlot}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-lg font-bold text-orange-600">
                                ₹{booking.totalAmount.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No bookings found</p>
                  </div>
                )}
              </div>
            )}

            {/* Resort Details Tab */}
            {activeTab === 'resort' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Resort Details</h2>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resort Name</label>
                    {editingResort ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">{resortDetails.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    {editingResort ? (
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    ) : (
                      <p className="text-gray-700">{resortDetails.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pricing (per person per day)</label>
                    {editingResort ? (
                      <input
                        type="number"
                        value={editForm.pricing}
                        onChange={(e) => setEditForm({ ...editForm, pricing: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">₹{resortDetails.pricing.toLocaleString()}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                    {editingResort ? (
                      <input
                        type="url"
                        value={editForm.videoUrl}
                        onChange={(e) => setEditForm({ ...editForm, videoUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    ) : (
                      <p className="text-gray-700 break-all">{resortDetails.videoUrl}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
                    {editingResort ? (
                      <div className="space-y-4">
                        {editForm.gallery.map((image, index) => (
                          <div key={index} className="flex space-x-2">
                            <input
                              type="url"
                              value={image}
                              onChange={(e) => handleGalleryImageChange(index, e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                            <button
                              onClick={() => removeGalleryImage(index)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addGalleryImage}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                        >
                          Add Image
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {resortDetails.gallery.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
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
