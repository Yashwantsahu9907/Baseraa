import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GraduationCap, Home, Navigation, Clock } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Bilaspur, Chhattisgarh coordinates
const defaultCenter = [22.0797, 82.1401];

const createCustomIcon = (IconComponent, color) => {
  return L.divIcon({
    html: renderToString(
      <div style={{ 
        backgroundColor: color, 
        padding: '8px', 
        borderRadius: '50%', 
        border: '3px solid white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <IconComponent size={20} color="white" />
      </div>
    ),
    className: 'custom-leaflet-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const collegeIcon = createCustomIcon(GraduationCap, '#4f46e5'); // Indigo
const pgIcon = createCustomIcon(Home, '#f97316'); // Orange

const MapUpdater = ({ center, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (center && !bounds) {
      map.setView(center, 13);
    }
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [center, bounds, map]);
  return null;
};

const Map = ({ listings = [], colleges = [], selectedCollege = null, selectedListing = null, onSelectListing }) => {
  const [routeLine, setRouteLine] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);

  // Calculate Route when both are selected
  useEffect(() => {
    const fetchRoute = async () => {
      if (!selectedCollege || !selectedListing) {
        setRouteLine(null);
        setRouteInfo(null);
        return;
      }

      try {
        const collegeCoords = `${selectedCollege.coords[0]},${selectedCollege.coords[1]}`;
        const pgCoords = `${selectedListing.location.coordinates[0]},${selectedListing.location.coordinates[1]}`;
        
        // OSRM API expects [lng,lat]
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${collegeCoords};${pgCoords}?overview=full&geometries=geojson`);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // OSRM returns [lng, lat], Leaflet needs [lat, lng]
          const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRouteLine(coordinates);
          setRouteInfo({
            distance: (route.distance / 1000).toFixed(1), // km
            duration: Math.round(route.duration / 60) // minutes
          });
        }
      } catch (error) {
        console.error('Routing error:', error);
      }
    };

    fetchRoute();
  }, [selectedCollege, selectedListing]);

  // Handle Bounds for all markers
  useEffect(() => {
    const allCoords = [];
    listings.forEach(l => {
      if (l.location?.coordinates) allCoords.push([l.location.coordinates[1], l.location.coordinates[0]]);
    });
    colleges.forEach(c => {
      if (c.coords) allCoords.push([c.coords[1], c.coords[0]]);
    });

    if (allCoords.length > 0) {
      setMapBounds(L.latLngBounds(allCoords));
    }
  }, [listings, colleges]);

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapUpdater center={defaultCenter} bounds={mapBounds} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Line */}
        {routeLine && (
          <Polyline 
            positions={routeLine} 
            pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.8, lineJoin: 'round' }} 
          />
        )}

        {/* College Markers */}
        {colleges.map((college, idx) => (
          <Marker 
            key={`college-${idx}`} 
            position={[college.coords[1], college.coords[0]]}
            icon={collegeIcon}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold text-slate-800">{college.name}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-black">Major Institution</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Listing Markers */}
        {listings.map((listing) => {
          if (!listing.location || !listing.location.coordinates) return null;
          const position = [listing.location.coordinates[1], listing.location.coordinates[0]];

          return (
            <Marker 
              key={listing._id} 
              position={position}
              icon={pgIcon}
              eventHandlers={{
                click: () => onSelectListing && onSelectListing(listing)
              }}
            >
              <Popup className="custom-popup">
                <div className="w-48">
                  {listing.images?.length > 0 && (
                    <img src={listing.images[0].url} alt="" className="w-full h-24 object-cover rounded-t-lg mb-2" />
                  )}
                  <h3 className="font-bold text-slate-900 leading-tight mb-1 truncate">{listing.title || listing.name}</h3>
                  <p className="text-sm font-semibold text-primary-600">₹{listing.price || listing.monthlyPlanPrice}/mo</p>
                  <div className="mt-2 flex gap-2">
                    <a href={`/listing/${listing._id}`} className="flex-1 text-center bg-slate-900 text-white text-[10px] py-1.5 rounded hover:bg-slate-800">
                      View
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Distance Panel */}
      {routeInfo && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-2xl shadow-2xl p-4 border border-slate-100 flex items-center gap-6 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Navigation size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Distance</p>
              <p className="text-lg font-black text-slate-900">{routeInfo.distance} <span className="text-sm font-medium">km</span></p>
            </div>
          </div>
          
          <div className="w-px h-10 bg-slate-100" />
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Est. Time</p>
              <p className="text-lg font-black text-slate-900">{routeInfo.duration} <span className="text-sm font-medium">min</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
