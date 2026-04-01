import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Phone, MessageCircle, Share2, Heart, CheckCircle, IndianRupee, ShieldCheck, Zap, Utensils, Home, Calendar, Trash2, AlertTriangle, XCircle, Users } from 'lucide-react';
import { toast } from 'react-toastify';

const ListingDetails = () => {
  const { id } = useParams();
  const { api, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [listingType, setListingType] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        try {
            const res = await api.get(`/rooms/${id}`);
            setListing(res.data);
            setListingType('RoomListing');
        } catch (err) {
            const res = await api.get(`/mess/${id}`);
            setListing(res.data);
            setListingType('MessListing');
        }

        // Check if already in favourites
        if (user) {
            try {
                const profileRes = await api.get('/auth/profile');
                const favs = profileRes.data.favorites || [];
                setIsFavourite(favs.some(fid => fid === id || fid.toString() === id));
            } catch (_) {}
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        toast.error('Could not load listing details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchListing();
  }, [id, api]);

  const handleRequestBooking = async () => {
      if (!user) {
          toast.info('Please login as a Student to request a booking');
          return navigate('/login');
      }
      if (user.role !== 'Student') {
          toast.error('Only students can request bookings');
          return;
      }

      setBookingLoading(true);
      try {
          const actualPrice = listing.price || listing.monthlyPlanPrice || 0;
          const deposit = listingType === 'RoomListing' ? Math.round(actualPrice / 4) : actualPrice;
          
          await api.post('/bookings', {
              propertyId: listing._id,
              propertyType: listingType,
              amount: deposit,
              startDate: new Date()
          });
          
          toast.success('Your request has been sent! Check your Dashboard for approval.');
          navigate('/student/dashboard');
      } finally {
          setBookingLoading(false);
      }
  };

  const handleToggleFavourite = async () => {
      if (!user) {
          toast.info('Please login to save listings to your favourites');
          return navigate('/login');
      }
      setFavLoading(true);
      try {
          const res = await api.put(`/auth/favorites/${listing._id}`);
          setIsFavourite(res.data.saved);
          toast.success(res.data.saved ? '❤️ Saved to Favourites!' : 'Removed from Favourites');
      } catch (error) {
          toast.error('Could not update favourites');
      } finally {
          setFavLoading(false);
      }
  };

  const handleAdminDelete = async () => {
    if (!window.confirm('WARNING: Are you sure you want to PERMANENTLY delete this listing? This will also remove all associated images from Cloudinary. This action cannot be undone.')) return;
    
    try {
        const endpoint = listingType === 'RoomListing' ? `/rooms/${listing._id}/admin` : `/mess/${listing._id}/admin`;
        await api.delete(endpoint);
        toast.error('Listing and assets removed permanently.');
        navigate('/admin/dashboard');
    } catch (error) {
        toast.error('Failed to delete listing');
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-20 flex justify-center items-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
    </div>
  );

  if (!listing) return <div className="text-center mt-20 font-bold">Listing not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Top Header */}
        <div className="mb-6">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">{listing.title || listing.name}</h1>
        </div>

        {/* 1. Main Gallery Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 h-auto md:h-[450px]">
            {/* Main/Hero Image */}
            <div 
                onClick={() => setShowAllImages(true)}
                className={`${listing.images.length === 1 ? 'w-full' : 'md:w-2/3'} h-[300px] md:h-full rounded-2xl overflow-hidden shadow-lg relative group cursor-pointer`}
            >
                <img 
                    src={listing.images[0]?.url} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt="Main" 
                />
                {listing.isVerified && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-black flex items-center shadow-lg pointer-events-none">
                        <ShieldCheck className="w-4 h-4 mr-1" /> VERIFIED
                    </div>
                )}
            </div>

            {/* Side Column - Only shown if more than 1 image exists */}
            {listing.images.length > 1 && (
                <div className="flex md:w-1/3 flex-row md:flex-col gap-4 h-[120px] md:h-full">
                    {/* Second Image (Shown if length >= 2) */}
                    <div 
                        onClick={() => setShowAllImages(true)}
                        className="flex-1 rounded-2xl overflow-hidden shadow-md group relative cursor-pointer"
                    >
                        <img 
                            src={listing.images[1]?.url} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            alt="Interior" 
                        />
                    </div>
                    
                    {/* Third Image (Shown if length >= 3) */}
                    {listing.images.length > 2 && (
                        <div 
                            onClick={() => setShowAllImages(true)}
                            className="flex-1 rounded-2xl overflow-hidden shadow-md relative group cursor-pointer"
                        >
                            <img 
                                src={listing.images[2]?.url} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                alt="Facilities" 
                            />
                            {/* "More Photos" Counter Overlay (Shown if length > 3) */}
                            {listing.images.length > 3 && (
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-white cursor-pointer hover:bg-black/40 transition-colors">
                                    <span className="text-2xl font-black">+ {listing.images.length - 3}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">More Photos</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* 2. Info Row (Address, Save, Heart) - PLACED DIRECTLY BELOW IMAGES */}
        <div className="glass bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center text-slate-600 font-bold text-lg">
                <MapPin className="h-6 w-6 mr-2 text-primary-500" />
                {listing.address}
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
                    <Share2 className="w-4 h-4 mr-2" /> Share
                </button>
                <button
                    onClick={handleToggleFavourite}
                    disabled={favLoading}
                    className={`flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl font-bold transition-all ${
                        isFavourite
                            ? 'bg-red-50 border border-red-300 text-red-500 hover:bg-red-100'
                            : 'bg-white border border-red-100 text-red-400 hover:bg-red-50'
                    } disabled:opacity-60`}
                >
                    <Heart className={`w-4 h-4 mr-2 transition-all ${isFavourite ? 'fill-red-500 text-red-500' : ''}`} />
                    {isFavourite ? 'Saved ✓' : 'Save to Favorites'}
                </button>
            </div>
        </div>

        {/* 3. Booking Section (Price, Request Button) */}
        <div className="glass bg-slate-900 p-8 rounded-3xl shadow-xl mb-12 flex flex-col gap-6 relative overflow-hidden">
            {/* Admin Badge */}
            {user?.role === 'Admin' && (
                <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                    ADMIN CONTROL ACTIVE
                </div>
            )}

            {/* Availability Status Banner — only for rooms */}
            {listingType === 'RoomListing' && (() => {
                const status = listing.availabilityStatus || 'Available';
                const available = (listing.totalRooms || 0) - (listing.bookedRooms || 0);
                const cfg = {
                    'Available': { icon: CheckCircle, label: 'Rooms Available', cls: 'bg-emerald-500/20 border-emerald-500 text-emerald-300' },
                    'Limited':   { icon: AlertTriangle, label: 'Limited Rooms Left', cls: 'bg-amber-500/20 border-amber-500 text-amber-300' },
                    'Full':      { icon: XCircle, label: 'Fully Booked', cls: 'bg-red-500/20 border-red-500 text-red-300' },
                };
                const { icon: Icon, label, cls } = cfg[status] || cfg['Available'];
                return (
                    <div className={`flex items-center justify-between px-5 py-3 rounded-2xl border ${cls}`}>
                        <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5" />
                            <span className="font-black text-sm uppercase tracking-wider">{label}</span>
                        </div>
                        {listing.totalRooms > 0 && (
                            <span className="text-sm font-bold opacity-80">
                                {available} of {listing.totalRooms} rooms free
                            </span>
                        )}
                    </div>
                );
            })()}

            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-white">
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Monthly Subscription</p>
                    <div className="flex items-baseline">
                        <span className="text-5xl font-black tracking-tighter">₹{listing.price || listing.monthlyPlanPrice}</span>
                        <span className="text-slate-400 font-bold ml-2">/ month</span>
                    </div>
                    <p className="text-[10px] text-primary-300 font-bold uppercase mt-2 italic cursor-help" title="Calculated as Price / 4 for Rooms">
                       Security Deposit Apply: ₹{listingType === 'RoomListing' ? Math.round((listing.price || 0) / 4) : (listing.monthlyPlanPrice || 0)}
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {listingType === 'RoomListing' && listing.availabilityStatus === 'Full' ? (
                        <div className="flex-1 bg-red-900/30 border-2 border-red-600 text-red-300 px-10 py-5 rounded-2xl font-black text-base text-center flex items-center justify-center gap-3">
                            <XCircle className="w-6 h-6" />
                            No Rooms Available
                        </div>
                    ) : (
                        <button 
                            onClick={handleRequestBooking}
                            disabled={bookingLoading}
                            className="flex-1 bg-primary-500 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-primary-500/20 hover:bg-primary-600 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
                        >
                            {bookingLoading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                            ) : (
                                <>
                                    <Zap className="w-6 h-6 mr-3 text-yellow-300 fill-yellow-300" />
                                    REQUEST BOOKING
                                </>
                            )}
                        </button>
                    )}

                    {user?.role === 'Admin' && (
                        <button 
                            onClick={handleAdminDelete}
                            className="flex-1 bg-red-600/10 border-2 border-red-600 text-red-600 px-6 py-5 rounded-2xl font-black text-lg hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center whitespace-nowrap"
                        >
                            <Trash2 className="w-6 h-6 mr-2" />
                            DELETE LISTING
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* 4. Details Section (About & Perks) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
                
                <div className="flex gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-1">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Category</p>
                        <p className="text-slate-900 font-extrabold flex items-center">
                            {listingType === 'RoomListing' ? <Home className="w-5 h-5 mr-3 text-blue-500" /> : <Utensils className="w-5 h-5 mr-3 text-orange-500" />}
                            {listing.roomType || listing.foodType}
                        </p>
                    </div>
                    {listingType === 'RoomListing' && (
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-1">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Preferred For</p>
                            <p className="text-slate-900 font-extrabold">{listing.genderPreference}</p>
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center tracking-tighter">
                        <span className="w-8 h-1 bg-primary-600 rounded-full mr-3"></span>
                        ABOUT THIS {listingType === 'RoomListing' ? 'ROOM' : 'MESS'}
                    </h2>
                    <p className="text-slate-600 leading-8 text-lg font-medium whitespace-pre-line">
                        {listing.description}
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center tracking-tighter">
                        <span className="w-8 h-1 bg-primary-600 rounded-full mr-3"></span>
                        FACILITIES & PERKS
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {(listing.facilities || []).map(facility => (
                            <div key={facility} className="group flex items-center p-4 bg-white rounded-xl border border-slate-100">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                <span className="text-slate-800 font-bold text-sm">{facility}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center uppercase tracking-widest">
                        Connect with Owner
                    </h3>
                    <div className="flex items-center mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-black text-xl mr-4 shadow-inner">
                            {listing.owner?.name?.charAt(0) || 'O'}
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Listed By</p>
                            <p className="font-black text-slate-900">{listing.owner?.name}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <a href={`tel:${listing.owner?.phone}`} className="flex items-center justify-center w-full py-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold shadow-sm hover:bg-slate-50">
                            <Phone className="w-5 h-5 mr-3" /> Call Directly
                        </a>
                        <a href={`https://wa.me/91${listing.owner?.phone}`} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full py-4 bg-[#25D366] text-white rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-[#1ebd5a]">
                            <MessageCircle className="w-5 h-5 mr-3" /> WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {showAllImages && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl animate-fade-in flex flex-col">
              <div className="p-6 flex justify-between items-center border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-10">
                  <h3 className="text-white font-black uppercase tracking-widest">
                    Listing Photos <span className="ml-2 text-slate-400 font-mono">({listing.images.length})</span>
                  </h3>
                  <button 
                    onClick={() => setShowAllImages(false)}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all transform hover:rotate-90"
                  >
                      <Trash2 className="w-6 h-6 rotate-45" /> {/* Use Trash2 rotated as an 'X' or import X from lucide-react */}
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 scroll-smooth">
                  <div className="max-w-4xl mx-auto space-y-12">
                      {listing.images.map((img, index) => (
                          <div key={index} className="rounded-3xl overflow-hidden shadow-2xl border border-white/5 animate-slide-up group">
                              <img 
                                src={img.url} 
                                className="w-full h-auto object-contain bg-black/20" 
                                alt={`Gallery ${index}`} 
                              />
                              <div className="bg-white/5 p-4 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] flex justify-between items-center group-hover:text-white/60 transition-colors">
                                  <span>PHOTO {index + 1} OF {listing.images.length}</span>
                                  <span>BASERA PREMIUM LISTING</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Bottom Navigation / Close Tap */}
              <div 
                onClick={() => setShowAllImages(false)}
                className="p-4 text-center bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/10 hover:text-white transition-all"
              >
                  Click anywhere to close or use the 'X' button
              </div>
          </div>
      )}
    </div>
  );
};

export default ListingDetails;
