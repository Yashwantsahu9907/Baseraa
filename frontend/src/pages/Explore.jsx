import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Search, MapPin, Filter, Map as MapIcon, List, IndianRupee, Trash2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import Map from '../components/Map';

const AvailabilityBadge = ({ listing }) => {
  if (listing.type !== 'room') return null;
  const status = listing.availabilityStatus || 'Available';
  const available = (listing.totalRooms || 0) - (listing.bookedRooms || 0);
  const config = {
    'Available': { icon: CheckCircle, label: 'Rooms Available', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'Limited':   { icon: AlertTriangle, label: 'Limited Rooms Left', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    'Full':      { icon: XCircle, label: 'Fully Booked', cls: 'bg-red-50 text-red-700 border-red-200' },
  };
  const { icon: Icon, label, cls } = config[status] || config['Available'];
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${cls}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
      {listing.totalRooms > 0 && (
        <span className="opacity-60 font-medium ml-1">· {available}/{listing.totalRooms}</span>
      )}
    </div>
  );
};

const Explore = () => {
  const { api, user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'rooms', 'mess'
    query: '',
    minPrice: '',
    maxPrice: '',
    college: ''
  });

  const colleges = [
    { name: 'Delhi University (North Campus)', coords: [77.2100, 28.6890] },
    { name: 'IIT Delhi', coords: [77.1928, 28.5450] },
    { name: 'Amity University Noida', coords: [77.3323, 28.5445] }
  ];

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const [roomsRes, messRes] = await Promise.all([
          api.get('/rooms'),
          api.get('/mess')
        ]);
        
        // Add a 'type' property to distinguish them
        const rooms = roomsRes.data.map(r => ({ ...r, type: 'room' }));
        const messes = messRes.data.map(m => ({ ...m, type: 'mess' }));
        
        setListings([...rooms, ...messes]);
      } catch (error) {
        console.error('Failed to fetch listings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [api]);

  const handleAdminDelete = async (e, id, type) => {
    e.preventDefault(); // Prevent navigating to details
    e.stopPropagation();
    
    if (!window.confirm('WARNING: PERMANENTLY delete this listing and its images? This cannot be undone.')) return;
    
    try {
        const endpoint = type === 'room' ? `/rooms/${id}/admin` : `/mess/${id}/admin`;
        await api.delete(endpoint);
        setListings(prev => prev.filter(l => l._id !== id));
        alert('Listing removed successfully.');
    } catch (error) {
        alert('Failed to delete listing');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Search Header */}
      <div className="bg-primary-600 pb-16 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-6">Find your perfect Basera</h1>
          
          <div className="glass !bg-white/90 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4">
            
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="query"
                placeholder="Search localities, PGs..."
                value={filters.query}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>

            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-slate-400" />
              </div>
              <select
                name="college"
                value={filters.college}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white appearance-none text-slate-700"
              >
                <option value="">Calculate distance from College</option>
                {colleges.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-medium shadow-md transition-all flex items-center justify-center">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 w-full flex justify-end mb-6">
         <div className="glass flex bg-white rounded-xl p-1 shadow-md">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <List className="w-4 h-4 mr-2" /> List
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'map' ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <MapIcon className="w-4 h-4 mr-2" /> Map
            </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 flex gap-8">
        
        {/* Filters Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 glass rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2" /> Filters
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Property Type</label>
                <div className="space-y-2">
                  {['All', 'PG / Rooms', 'Mess'].map(type => (
                    <label key={type} className="flex items-center">
                      <input type="radio" name="type" className="text-primary-600 focus:ring-primary-500 h-4 w-4" />
                      <span className="ml-2 text-sm text-slate-600">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Price Range</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm" />
                  <span className="text-slate-400">-</span>
                  <input type="number" placeholder="Max" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {loading ? (
             <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
             </div>
          ) : viewMode === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {listings.length === 0 ? (
                 <div className="col-span-full text-center py-12 text-slate-500">
                   No listings found matching your criteria.
                 </div>
              ) : listings.map((listing) => (
                <Link 
                key={listing._id} 
                to={`/listing/${listing._id}`} 
                className={`group glass rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-white ${listing.availabilityStatus === 'Full' ? 'opacity-70 pointer-events-none' : ''}`}
              >
                  <div className="relative h-56 w-full bg-slate-200 overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0].url}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">No Image</div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm shadow-black/10">
                      {listing.roomType}
                    </div>

                    {/* Fully Booked overlay */}
                    {listing.type === 'room' && listing.availabilityStatus === 'Full' && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">Fully Booked</span>
                      </div>
                    )}

                    {user?.role === 'Admin' && (
                        <button 
                            onClick={(e) => handleAdminDelete(e, listing._id, listing.type)}
                            className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-black transition-colors"
                            title="Admin: Quick Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{listing.title || listing.name}</h3>
                       <div className="flex items-center text-primary-700 font-bold bg-primary-50 px-2.5 py-1 rounded-lg">
                          <IndianRupee className="w-4 h-4 mr-0.5" />
                          {listing.price || listing.monthlyPlanPrice}
                       </div>
                    </div>
                    <p className="text-sm text-slate-500 flex items-center mb-3 line-clamp-1">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" /> {listing.address}
                    </p>
                    {/* Availability Badge */}
                    <div className="mb-3">
                      <AvailabilityBadge listing={listing} />
                    </div>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                      <div className="flex w-full mb-2">
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${listing.type === 'room' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                          {listing.type === 'room' ? 'Accommodation' : 'Mess Service'}
                        </span>
                      </div>
                      {(listing.facilities || []).slice(0, 3).map(f => (
                        <span key={f} className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                          {f}
                        </span>
                      ))}
                      {listing.facilities.length > 3 && (
                        <span className="text-xs font-medium text-slate-500 px-2 py-1">+{listing.facilities.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-[600px] rounded-2xl overflow-hidden shadow-inner border border-slate-200">
               <Map listings={listings} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Explore;
