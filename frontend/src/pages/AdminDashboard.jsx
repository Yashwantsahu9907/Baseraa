import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Shield, CheckCircle, XCircle, AlertCircle, Building, Utensils, User, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [rooms, setRooms] = useState([]);
    const [messes, setMesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('rooms'); // 'rooms' or 'messes'
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'approved'

    const fetchData = async () => {
        setLoading(true);
        try {
            const [roomsRes, messesRes] = await Promise.all([
                api.get('/rooms/admin/all'),
                api.get('/mess/admin/all')
            ]);
            setRooms(roomsRes.data);
            setMesses(messesRes.data);
        } catch (error) {
            console.error('Fetch Error:', error);
            toast.error('Failed to fetch listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVerify = async (id, category) => {
        try {
            const endpoint = category === 'rooms' ? `/rooms/${id}/verify` : `/mess/${id}/verify`;
            await api.put(endpoint);
            toast.success('Listing approved successfully!');
            fetchData(); // Refresh data
        } catch (error) {
            toast.error('Failed to approve listing');
        }
    };

    const handleDelete = async (id, category) => {
        if (!window.confirm('WARNING: Are you sure you want to PERMANENTLY delete this listing? This will also remove all associated images from Cloudinary. This action cannot be undone.')) return;
        try {
            const endpoint = category === 'rooms' ? `/rooms/${id}/admin` : `/mess/${id}/admin`;
            await api.delete(endpoint);
            toast.error('Listing removed from platform.');
            fetchData(); // Refresh data
        } catch (error) {
            toast.error('Failed to delete listing');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col justify-center items-center py-20 bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-slate-500 font-medium">Loading Admin Portal...</p>
        </div>
    );

    const currentListings = activeCategory === 'rooms' ? rooms : messes;
    const displayedListings = currentListings.filter(l => 
        activeTab === 'pending' ? !l.isVerified : l.isVerified
    );

    const stats = {
        totalRooms: rooms.length,
        totalMesses: messes.length,
        pendingRooms: rooms.filter(r => !r.isVerified).length,
        pendingMesses: messes.filter(m => !m.isVerified).length,
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                 
                 <div className="flex items-center mb-8">
                     <div className="bg-slate-900 p-3 rounded-xl mr-4 shadow-lg shadow-slate-200">
                         <Shield className="w-8 h-8 text-yellow-400" />
                     </div>
                     <div>
                         <h1 className="text-3xl font-bold text-slate-900">Admin Control Center</h1>
                         <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider font-semibold">Security & Verification Tier</p>
                     </div>
                 </div>

                 {/* Overview Stats */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                     <div className="glass p-6 rounded-2xl flex items-center justify-between border-l-4 border-yellow-400 shadow-sm">
                         <div>
                             <p className="text-slate-500 text-xs font-bold uppercase tracking-tight">Pending Rooms</p>
                             <h3 className="text-2xl font-bold text-slate-900">{stats.pendingRooms}</h3>
                         </div>
                         <div className="bg-yellow-50 p-2 rounded-lg"><AlertCircle className="w-6 h-6 text-yellow-500" /></div>
                     </div>
                     <div className="glass p-6 rounded-2xl flex items-center justify-between border-l-4 border-orange-400 shadow-sm">
                         <div>
                             <p className="text-slate-500 text-xs font-bold uppercase tracking-tight">Pending Messes</p>
                             <h3 className="text-2xl font-bold text-slate-900">{stats.pendingMesses}</h3>
                         </div>
                         <div className="bg-orange-50 p-2 rounded-lg"><Utensils className="w-6 h-6 text-orange-500" /></div>
                     </div>
                     <div className="glass p-6 rounded-2xl flex items-center justify-between border-l-4 border-green-500 shadow-sm">
                         <div>
                             <p className="text-slate-500 text-xs font-bold uppercase tracking-tight">Total Properties</p>
                             <h3 className="text-2xl font-bold text-slate-900">{stats.totalRooms}</h3>
                         </div>
                         <div className="bg-green-50 p-2 rounded-lg"><Building className="w-6 h-6 text-green-500" /></div>
                     </div>
                     <div className="glass p-6 rounded-2xl flex items-center justify-between border-l-4 border-blue-500 shadow-sm">
                         <div>
                             <p className="text-slate-500 text-xs font-bold uppercase tracking-tight">Food Services</p>
                             <h3 className="text-2xl font-bold text-slate-900">{stats.totalMesses}</h3>
                         </div>
                         <div className="bg-blue-50 p-2 rounded-lg"><Utensils className="w-6 h-6 text-blue-500" /></div>
                     </div>
                 </div>

                 {/* Category Selector */}
                 <div className="flex space-x-4 mb-6">
                     <button 
                         onClick={() => setActiveCategory('rooms')}
                         className={`flex items-center px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeCategory === 'rooms' ? 'bg-slate-900 text-white shadow-lg scale-105' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                     >
                         <Building className="w-4 h-4 mr-2" /> PG & Room Listings
                     </button>
                     <button 
                         onClick={() => setActiveCategory('messes')}
                         className={`flex items-center px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeCategory === 'messes' ? 'bg-slate-900 text-white shadow-lg scale-105' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                     >
                         <Utensils className="w-4 h-4 mr-2" /> Mess & Tiffin Services
                     </button>
                 </div>

                 {/* Verification Panel */}
                 <div className="glass rounded-2xl shadow-xl border border-slate-200 overflow-hidden bg-white/40 backdrop-blur-xl">
                     <div className="border-b border-slate-200 bg-white/50">
                         <nav className="flex -mb-px px-6" aria-label="Tabs">
                             <button
                               onClick={() => setActiveTab('pending')}
                               className={`w-40 py-4 px-1 text-center border-b-2 font-bold text-xs uppercase tracking-widest transition-colors ${activeTab === 'pending' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'}`}
                             >
                               Pending ({activeCategory === 'rooms' ? stats.pendingRooms : stats.pendingMesses})
                             </button>
                             <button
                               onClick={() => setActiveTab('approved')}
                               className={`w-40 py-4 px-1 text-center border-b-2 font-bold text-xs uppercase tracking-widest transition-colors ${activeTab === 'approved' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'}`}
                             >
                               Approved
                             </button>
                         </nav>
                     </div>

                     <div className="p-0">
                         <div className="divide-y divide-slate-100">
                             {displayedListings.length === 0 ? (
                                 <div className="text-center py-20 text-slate-400">
                                     <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                         <Shield className="w-8 h-8 opacity-20" />
                                     </div>
                                     <p className="font-medium italic">No {activeTab} {activeCategory} found.</p>
                                 </div>
                             ) : displayedListings.map(listing => (
                                 <div key={listing._id} className="p-6 hover:bg-white/60 transition-all flex flex-col md:flex-row md:items-center justify-between group">
                                     <div className="flex items-start md:items-center mb-4 md:mb-0">
                                         <div className="bg-primary-50 p-4 rounded-2xl mr-4 hidden md:block group-hover:scale-110 transition-transform shadow-sm">
                                             {activeCategory === 'rooms' ? <Building className="w-6 h-6 text-primary-600" /> : <Utensils className="w-6 h-6 text-primary-600" />}
                                         </div>
                                         <div>
                                             <div className="flex items-center">
                                                 <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-primary-600 transition-colors">{listing.title || listing.name}</h4>
                                                 <span className="ml-3 px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-tight">
                                                     {listing.roomType || listing.foodType}
                                                 </span>
                                             </div>
                                             <div className="flex flex-col sm:flex-row sm:items-center text-sm text-slate-500 mt-1 sm:space-x-4">
                                                 <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400"/> {listing.address}</span>
                                                 <span className="flex items-center mt-1 sm:mt-0 font-medium text-slate-600 bg-slate-50 px-2 rounded-md">
                                                     <User className="w-3.5 h-3.5 mr-1 text-slate-400"/> {listing.owner?.name || 'Unknown Owner'}
                                                 </span>
                                             </div>
                                             <p className="text-xs text-slate-400 mt-1 italic">Listed on {new Date(listing.createdAt).toLocaleDateString()}</p>
                                         </div>
                                     </div>
                                     <div className="flex items-center justify-end space-x-3 w-full md:w-auto">
                                         {!listing.isVerified && (
                                            <button 
                                                onClick={() => handleVerify(listing._id, activeCategory)}
                                                className="flex-1 md:flex-none flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-green-100 transition-all hover:-translate-y-0.5 active:scale-95"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" /> Approve Listing
                                            </button>
                                         )}
                                         <button 
                                            onClick={() => handleDelete(listing._id, activeCategory)}
                                            className="flex-1 md:flex-none flex items-center justify-center bg-red-50 hover:bg-red-600 border border-red-200 text-red-600 hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-lg active:scale-95 shadow-sm"
                                         >
                                             <Trash2 className="w-4 h-4 mr-2" /> {listing.isVerified ? 'Delete Listing' : 'Reject & Delete'}
                                         </button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
