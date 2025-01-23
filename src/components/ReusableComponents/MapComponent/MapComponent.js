import React, { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine'; // Required for routing
import RoutingMachine from 'react-leaflet-routing-machine'; // Component to handle routing
import './MapComponent.css';
import { db } from '../../../service/firebase'; // Import your Firebase config

const createVehicleIcon = (heading = 0) => {
  return new L.DivIcon({
    className: 'vehicle-icon',
    html: `<img src="/images/car.png" alt="Vehicle" style="transform: rotate(${heading}deg); width: 40px; height: 40px;"/>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const officeLocation = { lat: 23.04771370240098, lng: 72.52459693002172 };

function MapComponent({ vehicleData = [] }) {
  const [driversProfile, setDriversProfile] = useState({});
  const [zoomLevel, setZoomLevel] = useState(13);
  const [selectedVehicle, setSelectedVehicle] = useState(null); // To store the clicked vehicle
  const mapRef = useRef();

  const fetchDriverProfile = async (email) => {
    try {
      const userDoc = await db.collection('users').doc(email).get();
      if (userDoc.exists) {
        setDriversProfile((prevState) => ({
          ...prevState,
          [email]: userDoc.data(),
        }));
      }
    } catch (error) {
      console.error('Error fetching driver profile: ', error);
    }
  };

  useEffect(() => {
    vehicleData.forEach((vehicle) => {
      if (vehicle.driverEmail) {
        fetchDriverProfile(vehicle.driverEmail);
      }
    });
  }, [vehicleData]);

  useEffect(() => {
    const map = mapRef.current;

    if (map) {
      map.on('zoomend', () => {
        const newZoomLevel = map.getZoom();
        setZoomLevel(newZoomLevel);
      });
    }
  }, []);

  const officeIcon = useMemo(() => {
    const size = 30 + zoomLevel * 2;
    return new L.Icon({
      iconUrl: '/images/office.gif',
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
    });
  }, [zoomLevel]);

  return (
    <div className="map-container">
      <MapContainer
        center={[officeLocation.lat, officeLocation.lng]}
        zoom={zoomLevel}
        zoomControl={false}
        style={{ height: '100vh' }}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Office Marker */}
        <Marker position={[officeLocation.lat, officeLocation.lng]} icon={officeIcon}>
          <Popup>
            <strong>Office Location</strong>
            <br />
            Coordinates: {officeLocation.lat}, {officeLocation.lng}
          </Popup>
        </Marker>

        {/* Vehicle Markers */}
        {vehicleData.map((vehicle, index) => {
          const vehicleIcon = createVehicleIcon(vehicle.heading || 0);
          const distanceToOffice = calculateDistance(vehicle.lat, vehicle.lng, officeLocation.lat, officeLocation.lng);
          const driverProfile = driversProfile[vehicle.driverEmail] || {}; // Access the driver profile data

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


        {/* Display Directions if a vehicle is selected */}
        {selectedVehicle && (
          <RoutingMachine
            waypoints={[
              L.latLng(selectedVehicle.lat, selectedVehicle.lng),
              L.latLng(officeLocation.lat, officeLocation.lng),
            ]}
            lineOptions={{
              styles: [{ color: 'blue', weight: 4 }],
            }}
            fitSelectedRoutes={true}
            show={true}
          />
        )}

        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
}

export default MapComponent;
