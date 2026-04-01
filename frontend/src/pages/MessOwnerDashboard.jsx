import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Utensils, MapPin, IndianRupee, Bell, CheckCircle, XCircle, Users, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const MessOwnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
        const [listingsRes, bookingsRes] = await Promise.all([
            api.get('/mess/me'),
            api.get('/bookings')
        ]);
        setListings(listingsRes.data);
        setBookings(bookingsRes.data.filter(b => b.propertyModel === 'MessListing'));
    } catch (error) {
        toast.error('Failed to fetch dashboard data');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (bookingId, status) => {
      try {
          await api.put(`/bookings/${bookingId}/status`, { status });
          toast.success(`Request ${status} successfully!`);
          fetchData();
      } catch (error) {
          toast.error('Failed to update status');
      }
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mess Owner Portal</h1>
            <p className="mt-1 text-slate-500 font-medium tracking-wide">Manage your food services and subscriber requests.</p>
          </div>
          <Link
            to="/owner/add-mess"
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold shadow-xl shadow-primary-100 hover:bg-primary-700 transition"
          >
            <Plus className="mr-2 h-5 w-5" /> Add New Mess Service
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Listings */}
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center">
              <Utensils className="w-5 h-5 mr-3 text-primary-500" /> Active Services
            </h3>
            
            {listings.length === 0 ? (
                <div className="glass p-12 rounded-3xl text-center border-dashed border-2 border-slate-300">
                    <Utensils className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-slate-500 font-bold">No mess services listed yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {listings.map(listing => (
                        <div key={listing._id} className="glass rounded-3xl overflow-hidden border border-white bg-white/40 backdrop-blur-md shadow-lg shadow-slate-200/50 group">
                            <div className="relative h-44">
                                <img src={listing.images?.[0]?.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-lg ${
                                    listing.isVerified ? 'bg-green-500/80 text-white' : 'bg-amber-500/80 text-white'
                                }`}>
                                    {listing.isVerified ? 'Verified' : 'Pending'}
                                </div>
                            </div>
                            <div className="p-6">
                                <h4 className="text-lg font-black text-slate-900 truncate">{listing.name}</h4>
                                <div className="flex items-center text-slate-500 text-sm mt-1 mb-4">
                                    <MapPin className="w-4 h-4 mr-1 text-slate-400" /> {listing.address}
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <span className="text-xl font-black text-slate-900 font-mono">₹{listing.monthlyPlanPrice}</span>
                                    <div className="flex space-x-2">
                                        <button className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 transition"><Edit2 className="w-4 h-4" /></button>
                                        <button className="p-2 bg-red-50 rounded-lg text-red-500 hover:bg-red-100 transition"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* Sidebar: Recent Requests */}
          <div className="lg:col-span-1 space-y-8">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center">
              <Bell className="w-5 h-5 mr-3 text-amber-500" /> New Subscribers
            </h3>
            
            <div className="space-y-4">
                {bookings.length === 0 ? (
                    <div className="glass p-8 rounded-3xl text-center text-slate-500 italic font-medium bg-white/40">
                        No new subscribers.
                    </div>
                ) : bookings.map(booking => (
                    <div key={booking._id} className="glass p-5 rounded-3xl bg-white shadow-xl shadow-slate-200/40 border border-slate-50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                                    <Users className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">{booking.studentName || booking.student?.name}</p>
                                    <p className="text-[10px] text-slate-500 font-bold">{booking.studentPhone || booking.student?.phone || 'No Phone'}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{booking.status}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                            <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 font-medium flex items-center">
                                <Utensils className="w-3 h-3 mr-2 text-primary-400" /> Plan: <span className="font-bold ml-1">{booking.propertyId?.name}</span>
                            </div>
                            {booking.aadhaarCard && (
                                <a 
                                    href={booking.aadhaarCard} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="block p-3 bg-primary-50 rounded-2xl text-[11px] text-primary-700 font-bold hover:bg-primary-100 transition-colors flex items-center justify-center border border-primary-100"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5 mr-2" /> View Aadhaar Card
                                </a>
                            )}
                        </div>

                        {booking.status === 'Pending' && (
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleUpdateStatus(booking._id, 'Approved')}
                                    className="flex items-center justify-center py-2 bg-green-600 text-white rounded-xl text-[11px] font-black uppercase transition hover:bg-green-700 shadow-lg shadow-green-100"
                                >
                                    <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus(booking._id, 'Rejected')}
                                    className="flex items-center justify-center py-2 bg-white border border-red-100 text-red-500 rounded-xl text-[11px] font-black uppercase transition hover:bg-red-50"
                                >
                                    <XCircle className="w-3 h-3 mr-1" /> Reject
                                </button>
                            </div>
                        )}
                        
                        {booking.status === 'Confirmed' && (
                           <div className="text-center py-2 bg-green-50 text-green-700 rounded-xl text-[11px] font-black uppercase border border-green-100">
                               PAID & CONFIRMED
                           </div>
                        )}
                    </div>
                ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MessOwnerDashboard;
