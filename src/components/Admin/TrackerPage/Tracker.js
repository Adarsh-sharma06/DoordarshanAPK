import React, { useState, useEffect } from "react";
import { ref, onChildAdded, onChildChanged, get } from "firebase/database"; // Realtime Database functions
import Sidebar from "../../ReusableComponents/Sidebar/Sidebar";
import Navbar from "../../ReusableComponents/Navbar/Navbar";
import MapComponent from "../../ReusableComponents/MapComponent/MapComponent";
import './Tracker.css';
import { collection, getDocs, query, where } from "firebase/firestore"; // Firestore methods
import { db, database } from "../../../service/firebase"; // Ensure 'db' and 'database' are correctly imported

function Tracker() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state for fetching data
  const [vehicleData, setVehicleData] = useState([]); // Start with an empty array

  const menuSections = [
    {
      heading: null,
      items: [
        { name: 'Dashboard', link: '/Admin/Dashboard', icon: 'bi bi-speedometer2' },
        { name: 'Tracker', link: '/Admin/Tracker', icon: 'bi bi-map' },
        { name: 'Report', link: '/Admin/Report', icon: 'bi bi-bar-chart' },
      ],
    },
    {
      heading: 'Administrator',
      items: [
        { name: 'Vehicles', link: '/vehicles', icon: 'bi bi-truck' },
        { name: 'Users', link: '/Admin/Dashboard/CreateUser', icon: 'bi bi-people' },  // Updated link
        { name: 'Driver', link: '/driver', icon: 'bi bi-person-badge' },
      ],
    },
  ];

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userQuery = query(collection(db, "users"), where("role", "==", "Admin"));
        const userSnapshot = await getDocs(userQuery);
        const userDoc = userSnapshot.docs.map(doc => doc.data())[0];
        setUserData(userDoc);
        setLoading(false); // Stop loading after data is fetched
        console.log(userDoc); // Log user data
      } catch (error) {
        console.error("Error fetching user data: ", error);
        setLoading(false); // Make sure to stop loading even if an error occurs
      }
    };

    fetchUserData();
  }, []);

  // Fetch all vehicle data from Firebase Realtime Database initially
  useEffect(() => {
    const vehicleRef = ref(database, "/locations"); // Using Realtime Database instance

    // Fetch all existing vehicles from Realtime Database
    const fetchVehicleData = async () => {
      try {
        const snapshot = await get(vehicleRef); // Get all data once
        if (snapshot.exists()) {
          const allVehicles = [];
          snapshot.forEach((childSnapshot) => {
            const vehicleData = childSnapshot.val();
            const vehicle = {
              lat: vehicleData.latitude,
              lng: vehicleData.longitude,
              name: `Vehicle ${childSnapshot.key}`, // You can customize this depending on your structure
              status: 'Active', // Modify status as needed
              lastUpdated: new Date(vehicleData.timestamp).toLocaleString(),
              heading: vehicleData.heading || 0, // Assuming heading (direction) data is available
              speed: vehicleData.speed || 0,  // Include speed data
            };
            allVehicles.push(vehicle);
          });
          setVehicleData(allVehicles);
        }
      } catch (error) {
        console.error("Error fetching vehicle data: ", error);
      }
    };

    fetchVehicleData();

    // Listen for new data added to the "locations" node
    const onLocationAdded = onChildAdded(vehicleRef, (snapshot) => {
      const vehicleData = snapshot.val();
      const newVehicle = {
        lat: vehicleData.latitude,
        lng: vehicleData.longitude,
        name: `Vehicle ${snapshot.key}`, // You can customize this depending on your structure
        status: 'Active', // Modify status as needed
        lastUpdated: new Date(vehicleData.timestamp).toLocaleString(),
        heading: vehicleData.heading || 180, // Assuming heading (direction) data is available
        speed: vehicleData.speed || 0, // Include speed data
      };
      setVehicleData((prevData) => [...prevData, newVehicle]); // Add the new vehicle to the state
    });

    // Listen for data updates in the "locations" node (when data changes for any vehicle)
    const onLocationChanged = onChildChanged(vehicleRef, (snapshot) => {
      const updatedVehicleData = snapshot.val();
      const updatedVehicle = {
        lat: updatedVehicleData.latitude,
        lng: updatedVehicleData.longitude,
        name: `Vehicle ${snapshot.key}`,
        status: 'Active',
        lastUpdated: new Date(updatedVehicleData.timestamp).toLocaleString(),
        heading: updatedVehicleData.heading || 180, // Ensure heading is included
        speed: updatedVehicleData.speed || 0, // Ensure speed is included
      };
      // Update the vehicle data array with the new data
      setVehicleData((prevData) => {
        return prevData.map((vehicle) =>
          vehicle.name === updatedVehicle.name ? updatedVehicle : vehicle
        );
      });
    });

    // Cleanup listener on unmount
    return () => {
      onLocationAdded();
      onLocationChanged();
    };
  }, []); // Empty dependency array to run the effect once when component mounts

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="tracker-container">
      {/* Sidebar */}
      <Sidebar logoSrc="/images/DD.png" logoText="Doordarshan" menuSections={menuSections} showLogout={true} />

      <div className="main-content">
        {/* Navbar */}
        <Navbar
          title="Tracker"
          placeholder="Search for something..."
          profileImg={userData?.profileImage || "/images/DD.png"}
          profileName={userData?.name || "Admin"}
        />

        {/* Map and Vehicle Data */}
        <div className="vehicle-map-container mt-5">
          <div className="vehicle-map">
            <MapComponent vehicleData={vehicleData} />
            <div className="map-placeholder">
              <h5>Map showing vehicle locations</h5>
              <ul>
                {vehicleData.map((vehicle, index) => (
                  <li key={index}>
                    <strong>{vehicle.name}</strong> - Status: {vehicle.status} - Last updated: {vehicle.lastUpdated} - Speed: {vehicle.speed} km/h - Heading: {vehicle.heading}°
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tracker;
