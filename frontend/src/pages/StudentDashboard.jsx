import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Calendar, CheckCircle, Clock, CreditCard, Home, MapPin, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings');
            setBookings(res.data);
        } catch (error) {
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handlePayment = async (bookingId) => {
        try {
            await api.put(`/bookings/${bookingId}/pay`);
            toast.success('Security Deposit Paid Successfully!');
            fetchBookings(); // Refresh
        } catch (error) {
            toast.error('Payment failed');
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
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">My Student Dashboard</h1>
                        <p className="text-slate-500 mt-2 font-medium flex items-center">
                            Welcome back, <span className="text-primary-600 ml-1 underline decoration-primary-300 underline-offset-4">{user.name}</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stats Overview */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="glass p-8 rounded-3xl shadow-xl shadow-slate-200/50 bg-white/40 backdrop-blur-md border border-white/60">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                                <CreditCard className="w-5 h-5 mr-3 text-primary-500" />
                                Payment Summary
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-white/60 rounded-2xl border border-slate-100">
                                    <span className="text-slate-500 text-sm font-bold uppercase tracking-tight">Active Bookings</span>
                                    <span className="text-2xl font-black text-slate-900">{bookings.filter(b => b.status === 'Confirmed').length}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-white/60 rounded-2xl border border-slate-100">
                                    <span className="text-slate-500 text-sm font-bold uppercase tracking-tight">Pending Requests</span>
                                    <span className="text-2xl font-black text-slate-900">{bookings.filter(b => b.status === 'Pending').length}</span>
                                </div>
                            </div>
                            <button className="w-full mt-6 bg-slate-900 text-white py-4 rounded-2xl font-bold transition hover:bg-slate-800 shadow-lg shadow-slate-200">
                                Find More Rooms
                            </button>
                        </div>
                    </div>

                    {/* Bookings List */}
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center tracking-tight uppercase">
                            <BookOpen className="w-6 h-6 mr-3 text-primary-600" />
                            Booking History & Requests
                        </h3>

                        {bookings.length === 0 ? (
                            <div className="glass p-16 rounded-3xl text-center border-2 border-dashed border-slate-200 flex flex-col items-center">
                                <div className="bg-slate-100 p-4 rounded-full mb-4">
                                    <Search className="w-10 h-10 text-slate-400" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800">No requests yet</h4>
                                <p className="text-slate-500 mt-2">Start your journey by exploring the best PGs and hostels.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {bookings.map((booking) => (
                                    <div key={booking._id} className="glass p-6 rounded-3xl bg-white/60 backdrop-blur-md shadow-lg border border-white hover:scale-[1.01] transition-transform duration-300">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                            <div className="flex items-start">
                                                <div className="bg-primary-50 p-4 rounded-2xl mr-5 shadow-inner">
                                                    {booking.propertyModel === 'RoomListing' ? <Home className="w-7 h-7 text-primary-600" /> : <Clock className="w-7 h-7 text-primary-600" />}
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-slate-900">{booking.propertyId?.title || booking.propertyId?.name || 'Property Listing'}</h4>
                                                    <div className="flex items-center text-slate-500 text-sm mt-1 mb-2">
                                                        <MapPin className="w-3.5 h-3.5 mr-1" /> {booking.propertyId?.address}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                                                            booking.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                            {booking.status}
                                                        </span>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                            booking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                            {booking.paymentStatus}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 sm:mt-0 w-full sm:w-auto text-right">
                                                <div className="text-2xl font-black text-slate-900 mb-2 font-mono">
                                                    ₹{booking.amount}
                                                </div>
                                                
                                                {booking.status === 'Approved' && booking.paymentStatus === 'Unpaid' && (
                                                    <button 
                                                        onClick={() => handlePayment(booking._id)}
                                                        className="w-full sm:w-auto bg-primary-600 text-white px-8 py-3 rounded-2xl font-bold transition hover:bg-primary-700 shadow-xl shadow-primary-100 flex items-center justify-center animate-pulse"
                                                    >
                                                        <CreditCard className="w-5 h-5 mr-2" /> Pay Security Deposit
                                                    </button>
                                                )}
                                                
                                                {booking.status === 'Confirmed' && (
                                                    <div className="flex items-center text-green-600 font-bold justify-end">
                                                        <CheckCircle className="w-5 h-5 mr-2" /> Successfully Booked
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
