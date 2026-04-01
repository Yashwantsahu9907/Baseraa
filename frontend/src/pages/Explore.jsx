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

const ListingCard = ({ listing, user, handleAdminDelete }) => (
  <Link 
    to={`/listing/${listing._id}`} 
    className={`group glass rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-white ${listing.type === 'room' && listing.availabilityStatus === 'Full' ? 'opacity-70 pointer-events-none' : ''}`}
  >
    <div className="relative h-56 w-full bg-slate-200 overflow-hidden">
      {listing.images && listing.images.length > 0 ? (
        <img
          src={listing.images[0].url}
          alt={listing.title || listing.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400">No Image</div>
      )}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm shadow-black/10">
        {listing.roomType || listing.foodType}
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
);

const Explore = () => {
  const { api, user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  
  const [filters, setFilters] = useState({
    type: 'room', // 'room' or 'mess'
    query: '',
    minPrice: '',
    maxPrice: '',
    college: ''
  });

  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);

  const colleges = [
    { name: 'Guru Ghasidas Vishwavidyalaya (GGV)', coords: [82.1360, 22.1293] },
    { name: 'Atal Bihari Vajpayee University', coords: [82.1391, 22.0760] },
    { name: 'Govt. E. Raghavendra Rao Science College', coords: [82.1364, 22.0815] },
    { name: 'Chhattisgarh Institute of Medical Sciences (CIMS)', coords: [82.1558, 22.0774] },
    { name: 'S.L.T. Institute of Pharmaceutical Sciences', coords: [82.1356, 22.1285] }
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
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    
    if (name === 'college') {
      const college = colleges.find(c => c.name === value);
      setSelectedCollege(college);
    }
  };

  const filteredListings = listings.filter(listing => {
    // 1. Text Query (Title/Address/Description)
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchableText = `${listing.title || ''} ${listing.name || ''} ${listing.address || ''} ${listing.description || ''}`.toLowerCase();
      if (!searchableText.includes(q)) return false;
    }

    // 2. Price Range
    const price = listing.price || listing.monthlyPlanPrice || 0;
    if (filters.minPrice && price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && price > Number(filters.maxPrice)) return false;

    // 3. College Distance Filter (Mocking behavior since distance isn't in record)
    // In a real app, this would use the coordinates and distance calculation
    if (filters.college && listing.address && !listing.address.includes('Delhi') && filters.college.includes('Delhi')) {
        // Simple mock: if college is Delhi and listing address doesn't mention Delhi, filter it
        // return false; 
    }

    return true;
  });

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 flex flex-col lg:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24 glass rounded-2xl p-6 shadow-sm bg-white">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2" /> Filters
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Property Type</label>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  {[
                    { label: 'Rooms', value: 'room', activeClass: 'bg-primary-600 text-white shadow-md' },
                    { label: 'Mess', value: 'mess', activeClass: 'bg-orange-600 text-white shadow-md' }
                  ].map(item => (
                    <button 
                      key={item.value}
                      onClick={() => setFilters({ ...filters, type: item.value })}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                        filters.type === item.value ? item.activeClass : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Price Range</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    name="minPrice"
                    placeholder="Min" 
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" 
                  />
                  <span className="text-slate-400">-</span>
                  <input 
                    type="number" 
                    name="maxPrice"
                    placeholder="Max" 
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" 
                  />
                </div>
              </div>

              {(filters.query || filters.minPrice || filters.maxPrice || filters.college || filters.type !== 'room') && (
                <button 
                  onClick={() => setFilters({ type: 'room', query: '', minPrice: '', maxPrice: '', college: '' })}
                  className="w-full py-2 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors"
                >
                  Clear All Filters
                </button>
              )}
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
            <div className="w-full">
              {/* Category Selection Tabs (Desktop Tabs) */}
              <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-200 mb-8 max-w-md">
                <button 
                  onClick={() => setFilters({ ...filters, type: 'room' })}
                  className={`flex-1 flex justify-center items-center py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${filters.type === 'room' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  PGs & Rental Rooms
                </button>
                <button 
                  onClick={() => setFilters({ ...filters, type: 'mess' })}
                  className={`flex-1 flex justify-center items-center py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${filters.type === 'mess' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Mess Services
                </button>
              </div>

              {/* Listings Content Area */}
              <div className="space-y-8 animate-fade-in" key={filters.type}>
                {/* Rooms Section */}
                {filters.type === 'room' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-8 w-1 bg-primary-600 rounded-full"></div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verified Accommodations</h2>
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                        {listings.filter(l => l.category === 'room' || l.type === 'room').length} total
                      </span>
                    </div>
                  
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                      {filteredListings.filter(l => l.category === 'room' || l.type === 'room').length === 0 ? (
                        <div className="col-span-full border-2 border-dashed border-slate-200 rounded-2xl py-12 text-center text-slate-500">
                          No rooms found matching your criteria.
                        </div>
                      ) : (
                        filteredListings.filter(l => l.category === 'room' || l.type === 'room').map((listing) => (
                          <ListingCard key={listing._id} listing={listing} user={user} handleAdminDelete={handleAdminDelete} />
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Mess Section */}
                {filters.type === 'mess' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mess & Tiffin Services</h2>
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                        {filteredListings.filter(l => l.category === 'mess' || l.type === 'mess').length} total
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                      {filteredListings.filter(l => l.category === 'mess' || l.type === 'mess').length === 0 ? (
                        <div className="col-span-full border-2 border-dashed border-slate-200 rounded-2xl py-12 text-center text-slate-500">
                          No mess services found matching your criteria.
                        </div>
                      ) : (
                        filteredListings.filter(l => l.category === 'mess' || l.type === 'mess').map((listing) => (
                          <ListingCard key={listing._id} listing={listing} user={user} handleAdminDelete={handleAdminDelete} />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[650px] relative rounded-2xl overflow-hidden shadow-xl border border-slate-200">
               <Map 
                  listings={filteredListings} 
                  colleges={colleges}
                  selectedCollege={selectedCollege} 
                  selectedListing={selectedListing}
                  onSelectListing={setSelectedListing}
               />
               
               {/* Selection Status Overlay (Optional) */}
               {(selectedCollege || selectedListing) && (
                 <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-200 max-w-xs">
                   <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Current Selection</h4>
                   {selectedCollege && (
                     <div className="mb-2">
                       <p className="text-[10px] text-slate-400">College</p>
                       <p className="text-sm font-bold text-slate-800 line-clamp-1">{selectedCollege.name}</p>
                     </div>
                   )}
                   {selectedListing && (
                     <div>
                       <p className="text-[10px] text-slate-400">Accommodation</p>
                       <p className="text-sm font-bold text-primary-600 line-clamp-1">{selectedListing.title || selectedListing.name}</p>
                     </div>
                   )}
                   {(!selectedCollege || !selectedListing) && (
                     <p className="mt-2 text-[11px] italic text-slate-500">Pick both to see route and distance</p>
                   )}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
