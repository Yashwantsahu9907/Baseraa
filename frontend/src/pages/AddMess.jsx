import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { UploadCloud, Utensils, MapPin, CheckCircle } from 'lucide-react';

const AddMess = () => {
  const { api } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthlyPlanPrice: '',
    address: '',
    foodType: 'Veg',
    deliveryOptions: false,
    facilities: []
  });

  const [mealTimings, setMealTimings] = useState({
    breakfast: { start: '', end: '' },
    lunch: { start: '', end: '' },
    dinner: { start: '', end: '' }
  });

  const [images, setImages] = useState([]);

  const facilitiesList = ['Dining Hall', 'RO Water', 'Tiffin Service', 'Sunday Special', 'Daily Cleaning'];

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleTimingChange = (meal, type, value) => {
    setMealTimings(prev => ({
      ...prev,
      [meal]: { ...prev[meal], [type]: value }
    }));
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
      
      data.append('mealTimings', JSON.stringify(mealTimings));
      data.append('coordinates', JSON.stringify([77.2090, 28.6139])); 

      images.forEach(image => {
        data.append('images', image);
      });

      await api.post('/mess', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Mess listing created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto glass rounded-2xl shadow-xl overflow-hidden animate-fade-in relative">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply opacity-30 filter blur-3xl z-0" />
        
        <div className="px-8 py-10 relative z-10">
          <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-slate-200">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Add New Mess/Tiffin Service</h2>
              <p className="text-sm text-slate-500">List your food service for students</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Service Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Maa Ki Rasoi"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/60 backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Plan (₹)</label>
                <input
                  type="number"
                  name="monthlyPlanPrice"
                  required
                  value={formData.monthlyPlanPrice}
                  onChange={handleChange}
                  placeholder="e.g. 3500"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/60 backdrop-blur-sm"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/60 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description / Menu details</label>
              <textarea
                name="description"
                rows="3"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your food quality, sample menu, hygiene..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/60 backdrop-blur-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Food Type</label>
                <select
                  name="foodType"
                  value={formData.foodType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/60 backdrop-blur-sm"
                >
                  <option value="Veg">Pure Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Both">Both (Veg & Non-Veg)</option>
                </select>
              </div>
              <div className="flex items-center mt-8">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="deliveryOptions"
                    checked={formData.deliveryOptions}
                    onChange={handleChange}
                    className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm font-medium text-slate-700">Tiffin Delivery Available</span>
                </label>
              </div>
            </div>

            {/* Timings */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Meal Timings</label>
              <div className="space-y-3 glass bg-white/40 p-4 rounded-xl">
                {['breakfast', 'lunch', 'dinner'].map(meal => (
                   <div key={meal} className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium text-slate-600 capitalize">{meal}:</span>
                      <input 
                         type="time" 
                         value={mealTimings[meal].start}
                         onChange={(e) => handleTimingChange(meal, 'start', e.target.value)}
                         className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                      />
                      <span className="text-slate-400">to</span>
                      <input 
                         type="time" 
                         value={mealTimings[meal].end}
                         onChange={(e) => handleTimingChange(meal, 'end', e.target.value)}
                         className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                      />
                   </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Facilities</label>
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
                          ? 'border-orange-500 bg-orange-50 text-orange-700' 
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Upload Images (Max 5)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-white/50 hover:bg-white/80 transition-colors">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                      <span>Upload files</span>
                      <input type="file" multiple accept="image/*" className="sr-only" onChange={handleImageChange} />
                    </label>
                  </div>
                  {images.length > 0 && (
                    <p className="text-sm text-green-600 font-medium mt-2">{images.length} file(s) selected</p>
                  )}
                </div>
              </div>
            </div>

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
                  loading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
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

export default AddMess;
