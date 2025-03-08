import React, { useState, useEffect, useMemo } from "react";
import { db, collection, getDocs, query, where, doc, updateDoc, deleteDoc } from "../../../service/firebase";
import { FaClipboardList, FaCheck, FaTimes } from "react-icons/fa";
import Sidebar from "../../ReusableComponents/Sidebar/Sidebar";
import Navbar from "../../ReusableComponents/Navbar/Navbar";
import StatusCards from "../StatusCards/StatusCards";
import BookingTable from "../BookingTable/BookingTable";
import EditBookingModal from "../Modals/EditBookingModal";
import AssignDriverModal from "../Modals/AssignDriverModal";
import DeleteBookingModal from "../Modals/DeleteBookingModal";
import Pagination from "../Pagination/Pagination";
import ChatBot from "../ChatBot/ChatBot";
import "./Dashboard.css";

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [driverSelection, setDriverSelection] = useState(null);
  const [userData, setUserData] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page

  // Define menuSections for Sidebar
  const menuSections = [
    {
      heading: "Main Menu",
      items: [
        { name: "Dashboard", link: "/Admin/Dashboard", icon: "bi bi-speedometer2" },
        { name: "Tracker", link: "/Admin/Tracker", icon: "bi bi-map" },
        { name: "Reports", link: "/Admin/Reports/Report", icon: "bi bi-bar-chart" },
        { name: "Rating Report", link: "/Admin/Rating/RatingReport", icon: "bi bi-star" },
      ],
    },
    {
      heading: "Administration",
      items: [
        { name: "Create Users", link: "/Admin/Dashboard/CreateUser", icon: "bi bi-people" },
      ],
    },
  ];

  // Fetch bookings, user names, drivers, and user data
  useEffect(() => {
    const fetchData = async () => {
      // Fetch bookings
      const bookingsQuery = query(collection(db, "bookings"));
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookingsData = bookingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort bookings by startDate (latest first)
      const sortedBookings = bookingsData.sort((a, b) => {
        const dateA = a.startDate?.seconds ? new Date(a.startDate.seconds * 1000) : new Date(0);
        const dateB = b.startDate?.seconds ? new Date(b.startDate.seconds * 1000) : new Date(0);
        return dateB - dateA; // Sort in descending order (latest first)
      });

      setBookings(sortedBookings);

      // Fetch user names
      const usersQuery = query(collection(db, "users"));
      const usersSnapshot = await getDocs(usersQuery);
      const userNamesMap = {};
      usersSnapshot.forEach((doc) => {
        const user = doc.data();
        userNamesMap[user.email] = user.name;
      });
      setUserNames(userNamesMap);

      // Fetch drivers
      const driversQuery = query(collection(db, "users"), where("role", "==", "Driver"));
      const driversSnapshot = await getDocs(driversQuery);
      const driversData = driversSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDrivers(driversData);

      // Fetch admin user data
      const adminQuery = query(collection(db, "users"), where("role", "==", "Admin"));
      const adminSnapshot = await getDocs(adminQuery);
      const adminData = adminSnapshot.docs.map((doc) => doc.data())[0];
      setUserData(adminData);
    };

    fetchData();
  }, []);

  // Define updateBookingStatus function
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

  // Define tabsData for StatusCards
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle modal actions
  const handleApproveClick = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowDriverModal(true);
  };

  const handleRejectClick = (bookingId) => {
    updateBookingStatus(bookingId, "Rejected");
  };

  const handleEditClick = (booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleDeleteClick = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowDeleteModal(true);
  };

  const handleAssignDriver = async (driverId) => {
    if (selectedBookingId && driverId) {
      const bookingRef = doc(db, "bookings", selectedBookingId);
      await updateDoc(bookingRef, { allotedDriver: driverId, status: "Approved" });
      setShowDriverModal(false);
      setSelectedBookingId(null);
    }
  };

  const handleSaveEdit = async (updatedBooking) => {
    const bookingRef = doc(db, "bookings", updatedBooking.id);
    await updateDoc(bookingRef, {
      aim: updatedBooking.aim,
      destination: updatedBooking.destination,
      status: updatedBooking.status,
    });
    setShowEditModal(false);
    setSelectedBooking(null);
  };

  const handleDeleteBooking = async () => {
    const bookingRef = doc(db, "bookings", selectedBookingId);
    await deleteDoc(bookingRef);
    setShowDeleteModal(false);
    setSelectedBookingId(null);
  };

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
        <StatusCards tabsData={tabsData} />
        <BookingTable
          bookings={currentBookings}
          userNames={userNames}
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={bookings.length}
          paginate={paginate}
        />
        <EditBookingModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          selectedBooking={selectedBooking}
          onSave={handleSaveEdit}
        />
        <AssignDriverModal
          show={showDriverModal}
          onHide={() => setShowDriverModal(false)}
          drivers={drivers}
          onAssign={handleAssignDriver}
        />
        <DeleteBookingModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onDelete={handleDeleteBooking}
        />
        <ChatBot />
      </div>
    </div>
  );
};

export default Dashboard;