import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, CheckCircle, Clock, CreditCard, Home, MapPin, Search, Heart, Trash2, AlertTriangle, XCircle, IndianRupee, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

// ── Availability Badge ────────────────────────────────────────────────────────
const AvailBadge = ({ status }) => {
    const cfg = {
        Available: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'Available' },
        Limited:   { cls: 'bg-amber-50 text-amber-700 border-amber-200',   icon: AlertTriangle, label: 'Limited' },
        Full:      { cls: 'bg-red-50 text-red-700 border-red-200',          icon: XCircle,       label: 'Fully Booked' },
    };
    const { cls, icon: Icon, label } = cfg[status] || cfg['Available'];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-lg border ${cls}`}>
            <Icon className="w-3 h-3" /> {label}
        </span>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favLoading, setFavLoading] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings');
            setBookings(res.data);
        } catch {
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            setFavLoading(true);
            const res = await api.get('/auth/profile');
            setFavorites(res.data.favorites || []);
        } catch {
            toast.error('Failed to load favourites');
        } finally {
            setFavLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchFavorites();
    }, []);

    const handleRemoveFavourite = async (listingId) => {
        setRemovingId(listingId);
        try {
            await api.put(`/auth/favorites/${listingId}`);
            setFavorites(prev => prev.filter(f => f._id !== listingId));
            toast.success('Removed from Favourites');
        } catch {
            toast.error('Could not remove from favourites');
        } finally {
            setRemovingId(null);
        }
    };

    const handlePayment = async (bookingId) => {
        try {
            await api.put(`/bookings/${bookingId}/pay`);
            toast.success('Security Deposit Paid Successfully!');
            fetchBookings();
        } catch {
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

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">My Student Dashboard</h1>
                        <p className="text-slate-500 mt-1 font-medium flex items-center">
                            Welcome back, <span className="text-primary-600 ml-1 underline decoration-primary-300 underline-offset-4">{user.name}</span>
                        </p>
                    </div>
                </div>

                {/* ── Tab Bar ── */}
                <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 w-fit">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'bookings'
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        Bookings
                        {bookings.length > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${activeTab === 'bookings' ? 'bg-white/20' : 'bg-primary-100 text-primary-700'}`}>
                                {bookings.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'favorites'
                                ? 'bg-red-500 text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-white' : ''}`} />
                        Favourites
                        {favorites.length > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${activeTab === 'favorites' ? 'bg-white/20' : 'bg-red-50 text-red-600'}`}>
                                {favorites.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── Bookings Tab ── */}
                {activeTab === 'bookings' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Stats sidebar */}
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
                                <Link to="/explore" className="block w-full mt-6 bg-slate-900 text-white py-4 rounded-2xl font-bold transition hover:bg-slate-800 shadow-lg shadow-slate-200 text-center">
                                    Find More Rooms
                                </Link>
                            </div>
                        </div>

                        {/* Bookings list */}
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
                                                        {booking.propertyModel === 'RoomListing'
                                                            ? <Home className="w-7 h-7 text-primary-600" />
                                                            : <Clock className="w-7 h-7 text-primary-600" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-bold text-slate-900">{booking.propertyId?.title || booking.propertyId?.name || 'Property Listing'}</h4>
                                                        <div className="flex items-center text-slate-500 text-sm mt-1 mb-2">
                                                            <MapPin className="w-3.5 h-3.5 mr-1" /> {booking.propertyId?.address}
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                                booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                                booking.status === 'Approved'  ? 'bg-blue-100 text-blue-700' :
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
                                                    <div className="text-2xl font-black text-slate-900 mb-2 font-mono">₹{booking.amount}</div>
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
                )}

                {/* ── Favourites Tab ── */}
                {activeTab === 'favorites' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900 flex items-center uppercase tracking-tight">
                                <Heart className="w-6 h-6 mr-3 text-red-500 fill-red-500" />
                                Saved Favourites
                                <span className="ml-3 text-sm font-bold text-slate-400 normal-case tracking-normal">{favorites.length} {favorites.length === 1 ? 'property' : 'properties'}</span>
                            </h3>
                            <Link to="/explore" className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700">
                                Browse more <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {favLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-400"></div>
                            </div>
                        ) : favorites.length === 0 ? (
                            <div className="glass p-16 rounded-3xl text-center border-2 border-dashed border-red-100 flex flex-col items-center bg-white">
                                <div className="bg-red-50 p-5 rounded-full mb-4">
                                    <Heart className="w-10 h-10 text-red-300" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800 mb-2">No favourites yet</h4>
                                <p className="text-slate-500 mb-6">Tap the ❤️ button on any listing to save it here for quick access.</p>
                                <Link to="/explore" className="bg-red-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-600 transition shadow-lg shadow-red-100">
                                    Explore Listings
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favorites.map((listing) => {
                                    const available = (listing.totalRooms || 0) - (listing.bookedRooms || 0);
                                    return (
                                        <div key={listing._id} className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col">
                                            {/* Image */}
                                            <div className="relative h-44 bg-slate-100 overflow-hidden">
                                                {listing.images?.[0]?.url ? (
                                                    <img
                                                        src={listing.images[0].url}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-slate-300">
                                                        <Home className="w-10 h-10" />
                                                    </div>
                                                )}
                                                {/* Room type badge */}
                                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                                                    {listing.roomType}
                                                </div>
                                                {/* Availability overlay for full rooms */}
                                                {listing.availabilityStatus === 'Full' && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Fully Booked</span>
                                                    </div>
                                                )}
                                                {/* Remove heart button */}
                                                <button
                                                    onClick={() => handleRemoveFavourite(listing._id)}
                                                    disabled={removingId === listing._id}
                                                    title="Remove from Favourites"
                                                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow-md text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                                                >
                                                    {removingId === listing._id
                                                        ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                        : <Heart className="w-4 h-4 fill-red-500" />}
                                                </button>
                                            </div>

                                            {/* Details */}
                                            <div className="p-5 flex-1 flex flex-col">
                                                <h4 className="text-base font-black text-slate-900 line-clamp-1 mb-1">{listing.title}</h4>
                                                <p className="text-sm text-slate-500 flex items-center mb-3 line-clamp-1">
                                                    <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-slate-400" />
                                                    {listing.address}
                                                </p>

                                                {/* Price + Availability */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center text-primary-700 font-black text-lg bg-primary-50 px-3 py-1 rounded-lg">
                                                        <IndianRupee className="w-4 h-4 mr-0.5" />
                                                        {listing.price}
                                                        <span className="text-xs font-medium text-slate-400 ml-1">/mo</span>
                                                    </div>
                                                    <AvailBadge status={listing.availabilityStatus || 'Available'} />
                                                </div>

                                                {/* Room count */}
                                                {listing.totalRooms > 0 && (
                                                    <p className="text-xs text-slate-400 font-medium mb-4">
                                                        {available} of {listing.totalRooms} rooms free
                                                    </p>
                                                )}

                                                {/* Action buttons */}
                                                <div className="mt-auto grid grid-cols-2 gap-2">
                                                    <Link
                                                        to={`/listing/${listing._id}`}
                                                        className="flex items-center justify-center py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition"
                                                    >
                                                        View Details
                                                    </Link>
                                                    <button
                                                        onClick={() => handleRemoveFavourite(listing._id)}
                                                        disabled={removingId === listing._id}
                                                        className="flex items-center justify-center py-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default StudentDashboard;
