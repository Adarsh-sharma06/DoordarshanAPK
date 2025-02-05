// Dashboard.js
import React, { useState, useEffect, useMemo } from "react";
import {
  db,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "../../../service/firebase";
import Sidebar from "../../ReusableComponents/Sidebar/Sidebar";
import Navbar from "../../ReusableComponents/Navbar/Navbar";
import "./Dashboard.css";
import { FaClipboardList, FaCheck, FaTimes } from "react-icons/fa";
import StatusCard from "./StatusCard";
import BookingTable from "./BookingTable";
import EditBookingModal from "./EditBookingModal";
import DriverModal from "./DriverModal";
import DeleteModal from "./DeleteModal";

function Dashboard() {
  const menuSections = [
    {
      heading: "Main Menu",
      items: [
        { name: "Dashboard", link: "/Admin/Dashboard", icon: "bi bi-speedometer2" },
        { name: "Tracker", link: "/Admin/Tracker", icon: "bi bi-map" },
        { name: "Reports", link: "/Admin/Reports/Report", icon: "bi bi-bar-chart" },
      ],
    },
    {
      heading: "Administration",
      items: [
        { name: "Create Users", link: "/Admin/Dashboard/CreateUser", icon: "bi bi-people" },
      ],
    },
  ];

  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState({});
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [driverSelection, setDriverSelection] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userQuery = query(collection(db, "users"), where("role", "==", "Admin"));
        const userSnapshot = await getDocs(userQuery);
        const userDoc = userSnapshot.docs.map((doc) => doc.data())[0];
        setUserData(userDoc);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data: ", error);
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      if (userData?.email) {
        try {
          const bookingsCollection = collection(db, "bookings");
          const bookingSnapshot = await getDocs(bookingsCollection);
          const bookingList = bookingSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setBookings(bookingList);

          const emails = Array.from(new Set(bookingList.map((booking) => booking.email)));
          const usersQuery = query(collection(db, "users"), where("email", "in", emails));
          const usersSnapshot = await getDocs(usersQuery);
          const userNamesMap = {};
          usersSnapshot.forEach((doc) => {
            const user = doc.data();
            userNamesMap[user.email] = user.name;
          });
          setUserNames(userNamesMap);
        } catch (error) {
          console.error("Error fetching bookings: ", error);
        }
      }
    };

    const fetchDrivers = async () => {
      try {
        const driversQuery = query(collection(db, "users"), where("role", "==", "Driver"));
        const driversSnapshot = await getDocs(driversQuery);
        const driversList = driversSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDrivers(driversList);
      } catch (error) {
        console.error("Error fetching drivers: ", error);
      }
    };

    fetchUserData();

    if (userData) {
      fetchBookings();
      fetchDrivers();
    }
  }, [userData]);

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { status: newStatus });
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
    } catch (error) {
      console.error("Error updating booking status: ", error);
    }
  };

  const deleteBooking = async () => {
    try {
      const bookingRef = doc(db, "bookings", selectedBookingId);
      await deleteDoc(bookingRef);
      setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== selectedBookingId));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting booking: ", error);
    }
  };

  const handleApproveClick = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowDriverModal(true);
  };

  const handleRejectClick = (bookingId) => {
    updateBookingStatus(bookingId, "Rejected");
  };

  const handleDriverSelection = (driverId) => {
    setDriverSelection(driverId);
  };

  const handleAssignDriver = async () => {
    if (selectedBookingId && driverSelection) {
      updateBookingStatus(selectedBookingId, "Approved");
      const bookingRef = doc(db, "bookings", selectedBookingId);
      await updateDoc(bookingRef, { allotedDriver: driverSelection });
      setShowDriverModal(false);
      setSelectedBookingId(null);
    }
  };

  const handleDeleteModalShow = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowDeleteModal(true);
  };

  const handleEditClick = (booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (selectedBooking) {
      try {
        const bookingRef = doc(db, "bookings", selectedBooking.id);
        await updateDoc(bookingRef, {
          aim: selectedBooking.aim,
          destination: selectedBooking.destination,
          status: selectedBooking.status,
        });

        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === selectedBooking.id ? selectedBooking : booking
          )
        );
        setShowEditModal(false);
        setSelectedBooking(null);
      } catch (error) {
        console.error("Error updating booking: ", error);
      }
    }
  };

  const tabsData = useMemo(
    () => [
      {
        heading: "Pending Bookings",
        content: bookings.filter((booking) => booking.status === "Pending").length,
        color: "lightblue",
        icon: <FaClipboardList />,
        isPending: bookings.filter((booking) => booking.status === "Pending").length > 0,
      },
      {
        heading: "Approved Bookings",
        content: bookings.filter((booking) => booking.status === "Approved").length,
        color: "lightgreen",
        icon: <FaCheck />,
      },
      {
        heading: "Rejected Bookings",
        content: bookings.filter((booking) => booking.status === "Rejected").length,
        color: "lightcoral",
        icon: <FaTimes />,
      },
    ],
    [bookings]
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar logoText="Doordarshan" menuSections={menuSections} showLogout={true} />

      <div className="content-container">
        <Navbar
          title="Admin Dashboard"
          placeholder="Search for something..."
          profileImg={userData?.profileImage || "/images/DD.png"}
          profileName={userData?.name || "Admin"}
          userEmail={userData?.email}
        />

        <div className="status-cards-container row mt-4">
          {tabsData.map((tab, index) => (
            <div key={index} className="col-12 col-md-3 mb-3">
              <StatusCard
                heading={tab.heading}
                content={tab.content}
                color={tab.color}
                icon={tab.icon}
                isPending={tab.isPending}
              />
            </div>
          ))}
        </div>

        <div className="booking-details container-fluid mt-5">
          <h4>Booking Details</h4>
          <BookingTable
            bookings={bookings}
            userNames={userNames}
            handleApproveClick={handleApproveClick}
            handleRejectClick={handleRejectClick}
            handleEditClick={handleEditClick}
            handleDeleteModalShow={handleDeleteModalShow}
          />
        </div>

        <EditBookingModal
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          selectedBooking={selectedBooking}
          setSelectedBooking={setSelectedBooking}
          handleSaveEdit={handleSaveEdit}
        />

        <DriverModal
          showDriverModal={showDriverModal}
          setShowDriverModal={setShowDriverModal}
          drivers={drivers}
          driverSelection={driverSelection}
          handleDriverSelection={handleDriverSelection}
          handleAssignDriver={handleAssignDriver}
        />

        <DeleteModal
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          deleteBooking={deleteBooking}
        />
      </div>
    </div>
  );
}

export default Dashboard;