import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { UploadCloud, Building, MapPin, CheckCircle, Navigation } from 'lucide-react';

const AddRoom = () => {
  const { api, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    roomType: 'Single',
    genderPreference: 'Any',
    availabilityStatus: 'Available',
    totalRooms: '',
    facilities: []
  });

  const [images, setImages] = useState([]);

  const facilitiesList = ['WiFi', 'AC', 'Attached Bathroom', 'Parking', 'Washing Machine', 'Food Included', 'Water Cooler'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => {
      const isSelected = prev.facilities.includes(facility);
      if (isSelected) {
        return { ...prev, facilities: prev.facilities.filter(f => f !== facility) };
      } else {
        return { ...prev, facilities: [...prev.facilities, facility] };
      }
    });
  };

  const handleImageChange = (e) => {
    // Only accept up to 5 images
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'facilities') {
          data.append('facilities', JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });
      
      // Temporary logic: Add dummy coordinates around a central college location manually or rely on map integration later
      data.append('coordinates', JSON.stringify([77.2090, 28.6139])); 

      images.forEach(image => {
        data.append('images', image);
      });

      await api.post('/rooms', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Room listing created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Failed to create listing';
      const detail = error.response?.data?.error?.message ? ` - ${error.response.data.error.message}` : '';
      toast.error(`${errorMessage}${detail}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto glass rounded-2xl shadow-xl overflow-hidden animate-fade-in relative">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply opacity-30 filter blur-3xl z-0" />
        
        <div className="px-8 py-10 relative z-10">
          <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-slate-200">
            <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Add New Room/PG</h2>
              <p className="text-sm text-slate-500">List your property for students to discover</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title & Price */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Listing Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Anand PG for Boys"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow bg-white/60 backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Rent (₹)</label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow bg-white/60 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, Landmark, City, State, PIN"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/60 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the atmosphere, nearby landmarks, rules..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/60 backdrop-blur-sm"
              />
            </div>

            {/* Room Specs */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Room Type</label>
                <select
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/60 backdrop-blur-sm"
                >
                  {['Single', 'Double', 'Triple', 'Dormitory', '1BHK', '2BHK', 'PG'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Total Rooms Available</label>
                <input
                  type="number"
                  name="totalRooms"
                  required
                  min="1"
                  max="200"
                  value={formData.totalRooms}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow bg-white/60 backdrop-blur-sm"
                />
                <p className="text-xs text-slate-400 mt-1">Total number of rooms in your property</p>
              </div>
            </div>

            {/* Gender Preference */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gender Preference</label>
              <div className="flex space-x-4 h-[50px] items-center">
                {['Boys', 'Girls', 'Any'].map(g => (
                  <label key={g} className="flex items-center">
                    <input
                      type="radio"
                      name="genderPreference"
                      value={g}
                      checked={formData.genderPreference === g}
                      onChange={handleChange}
                      className="text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                    <span className="ml-2 text-slate-700">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Facilities */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Facilities Provided</label>
              <div className="flex flex-wrap gap-3">
                {facilitiesList.map(facility => {
                  const isSelected = formData.facilities.includes(facility);
                  return (
                    <button
                      type="button"
                      key={facility}
                      onClick={() => handleFacilityToggle(facility)}
                      className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && <CheckCircle className="w-4 h-4 mr-1.5" />}
                      {facility}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Upload Images (Max 5)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-white/50 hover:bg-white/80 transition-colors">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload files</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB each</p>
                  {images.length > 0 && (
                    <p className="text-sm text-green-600 font-medium mt-2">
                      {images.length} file(s) selected
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-white py-3 px-6 border border-slate-300 rounded-xl shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 mr-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`py-3 px-8 border border-transparent rounded-xl shadow-md text-sm font-medium text-white ${
                  loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                } transition-colors`}
              >
                {loading ? 'Publishing...' : 'Publish Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRoom;
