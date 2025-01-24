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
import {
  FaEdit,
  FaTrashAlt,
  FaCheck,
  FaTimes,
  FaTruck,
  FaMapMarkerAlt,
  FaUsers,
  FaClipboardList,
} from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";

function Dashboard() {
  const menuSections = [
    {
      heading: "Main Menu",
      items: [
        { name: "Dashboard", link: "/Admin/Dashboard", icon: <FaClipboardList /> },
        { name: "Tracker", link: "/Admin/Tracker", icon: <FaMapMarkerAlt /> },
        { name: "Reports", link: "/Admin/Reports/Report", icon: <FaTruck /> },
      ],
    },
    {
      heading: "Administration",
      items: [
        { name: "Vehicles", link: "/vehicles", icon: <FaTruck /> },
        { name: "Users", link: "/Admin/Dashboard/CreateUser", icon: <FaUsers /> },
        { name: "Drivers", link: "/driver", icon: <FaUsers /> },
      ],
    },
  ];

  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState({});
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
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

  const tabsData = useMemo(
    () => [
      {
        heading: "Pending Bookings",
        content: bookings.filter((booking) => booking.status === "Pending").length,
        color: "lightblue",
        icon: <FaClipboardList />,
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
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container container-fluid">
      <Sidebar logoSrc="/images/DD.png" logoText="Doordarshan" menuSections={menuSections} showLogout={true} />

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
              <div className="status-card text-center p-3" style={{ backgroundColor: tab.color }}>
                {tab.icon}
                <h5 className="mt-3">{tab.heading}</h5>
                <p>{tab.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="booking-details mt-5">
          <h4>Booking Details</h4>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Reporter Name</th>
                  <th>Aim</th>
                  <th>Time</th>
                  <th>Date</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{userNames[booking.email] || booking.email}</td>
                    <td>{booking.aim || "N/A"}</td>
                    <td>{new Date(booking.time.seconds * 1000).toLocaleTimeString()}</td>
                    <td>{new Date(booking.startDate.seconds * 1000).toLocaleDateString()}</td>
                    <td>{booking.destination || "N/A"}</td>
                    <td>{booking.status || "N/A"}</td>
                    <td>
                      <div className="btn-group">
                        {booking.status !== "Approved" && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleApproveClick(booking.id)}
                          >
                            <FaCheck />
                          </button>
                        )}
                        {booking.status !== "Rejected" && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRejectClick(booking.id)}
                          >
                            <FaTimes />
                          </button>
                        )}
                        <button className="btn btn-sm btn-warning">
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteModalShow(booking.id)}
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Driver Modal */}
        <Modal show={showDriverModal} onHide={() => setShowDriverModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Assign Driver</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h6>Select a Driver:</h6>
            <Form.Control
              as="select"
              value={driverSelection || ""}
              onChange={(e) => handleDriverSelection(e.target.value)}
            >
              <option value="">--Select Driver--</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </Form.Control>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDriverModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleAssignDriver}>
              Assign Driver
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Booking</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this booking?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={deleteBooking}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default Dashboard;
