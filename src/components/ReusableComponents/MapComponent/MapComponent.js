import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import './MapComponent.css'; // Assuming you'll add styles for the popup here
import { db } from '../../../service/firebase'; // Import your Firebase config

// Define a custom icon generator function for vehicles
const createVehicleIcon = (heading = 0) => {
  return new L.DivIcon({
    className: 'vehicle-icon',
    html: `<img src="/images/car.png" alt="Vehicle" style="transform: rotate(${heading}deg); width: 30px; height: 30px; rgba(0, 0, 0, 0.5);"/>`, // Improved shadow effect
    iconSize: [30, 30], // Adjusted size
    iconAnchor: [15, 15], // Adjusted anchor to make it centered
  });
};

// Office Location (Example coordinates)
const officeLocation = { lat: 23.04771370240098, lng: 72.52459693002172 }; // Change to your office's location

// Function to calculate distance between two points (in kilometers) using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

function MapComponent({ vehicleData = [] }) {
  const [driversProfile, setDriversProfile] = useState({});

  // Fetch driver profile from users collection using email as document ID
  const fetchDriverProfile = async (email) => {
    try {
      const userDoc = await db.collection('users').doc(email).get();
      if (userDoc.exists) {
        setDriversProfile(prevState => ({
          ...prevState,
          [email]: userDoc.data(), // Store profile data by email key
        }));
      }
    } catch (error) {
      console.error("Error fetching driver profile: ", error);
    }
  };

  useEffect(() => {
    // Fetch driver profiles when vehicleData is available
    vehicleData.forEach(vehicle => {
      if (vehicle.driverEmail) {
        fetchDriverProfile(vehicle.driverEmail); // Assuming driverEmail exists in vehicleData
      }
    });
  }, [vehicleData]);

  // Use useMemo to avoid recalculating center on every render
  const center = useMemo(() => {
    if (vehicleData.length === 0) return [officeLocation.lat, officeLocation.lng]; // Default to office location
    return [
      vehicleData.reduce((acc, vehicle) => acc + vehicle.lat, 0) / vehicleData.length,
      vehicleData.reduce((acc, vehicle) => acc + vehicle.lng, 0) / vehicleData.length,
    ];
  }, [vehicleData]);

  const zoomLevel = vehicleData.length > 1 ? 10 : 13;

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={zoomLevel} zoomControl={false} style={{ height: '100vh' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Office Marker with custom image */}
        <Marker position={[officeLocation.lat, officeLocation.lng]} icon={new L.Icon({
          iconUrl: '/images/office-marker.png', // Custom office marker image
          iconSize: [40, 40], // Adjusted size for office marker
          iconAnchor: [20, 40], // Anchor to the bottom of the icon
        })}>
          <Popup>
            <strong>Office Location</strong>
            <br />
            Coordinates: {officeLocation.lat}, {officeLocation.lng}
          </Popup>
        </Marker>

        {/* Display markers for vehicles with smooth movement */}
        {vehicleData.map((vehicle, index) => {
          const vehicleIcon = createVehicleIcon(vehicle.heading || 0); // Dynamically set the icon with rotation
          const distanceToOffice = calculateDistance(vehicle.lat, vehicle.lng, officeLocation.lat, officeLocation.lng);
          const driverProfile = driversProfile[vehicle.driverEmail] || {}; // Get profile if it exists

          return (
            <Marker key={index} position={[vehicle.lat, vehicle.lng]} icon={vehicleIcon}>
              <Popup>
                <div className="vehicle-popup">
                  <h5>{vehicle.name}</h5>
                  <div className="vehicle-info">
                    <p><strong>Status:</strong> {vehicle.status}</p>
                    <p><strong>Last Updated:</strong> {vehicle.lastUpdated}</p>
                    <p><strong>Speed:</strong> {vehicle.speed} km/h</p>
                    <p><strong>Heading:</strong> {vehicle.heading}°</p>
                    <p><strong>Distance to Office:</strong> {distanceToOffice.toFixed(2)} km</p>
                  </div>

                  {/* Driver Information */}
                  {driverProfile.name && (
                    <div className="driver-info">
                      <h6>Driver Info:</h6>
                      <p><strong>Name:</strong> {driverProfile.name}</p>
                      {driverProfile.photo && <img src={driverProfile.photo} alt="Driver" className="driver-photo" />}
                      {driverProfile.mobile && <p><strong>Mobile:</strong> {driverProfile.mobile}</p>}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Zoom controls */}
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
}

export default MapComponent;
