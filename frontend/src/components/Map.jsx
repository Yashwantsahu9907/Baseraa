import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultCenter = [28.6139, 77.2090]; // Delhi

const MapUpdater = ({ center, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [center, bounds, map]);
  return null;
};

const Map = ({ listings = [], center = defaultCenter, zoom = 12 }) => {
  const [mapBounds, setMapBounds] = useState(null);

  useEffect(() => {
    if (listings.length > 0) {
      const allCoords = listings
        .filter(l => l.location && l.location.coordinates)
        .map(l => [l.location.coordinates[1], l.location.coordinates[0]]); // GeoJSON is [lng, lat], Leaflet is [lat, lng]
      
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        setMapBounds(bounds);
      }
    }
  }, [listings]);

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 z-0 relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapUpdater center={center} bounds={mapBounds} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {listings.map((listing) => {
          if (!listing.location || !listing.location.coordinates) return null;
          
          // MongoDB GeoJSON stores coordinates as [longitude, latitude]
          // Leaflet expects [latitude, longitude]
          const position = [
            listing.location.coordinates[1],
            listing.location.coordinates[0]
          ];

          return (
            <Marker key={listing._id} position={position}>
              <Popup className="custom-popup">
                <div className="w-48">
                  {listing.images && listing.images.length > 0 && (
                    <img 
                      src={listing.images[0].url} 
                      alt={listing.title || listing.name} 
                      className="w-full h-24 object-cover rounded-t-lg mb-2"
                    />
                  )}
                  <h3 className="font-bold text-slate-900 leading-tight mb-1">
                    {listing.title || listing.name}
                  </h3>
                  <p className="font-semibold text-primary-600">₹{listing.price || listing.monthlyPlanPrice}/mo</p>
                  <a href={`/listing/${listing._id}`} className="mt-2 block text-center bg-slate-900 text-white text-xs py-1.5 rounded-md hover:bg-slate-800 transition">
                    View Details
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;
