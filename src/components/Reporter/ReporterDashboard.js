import React, { useState, useEffect } from "react";
import Navbar from "../ReusableComponents/Navbar/Navbar";
import Sidebar from "../ReusableComponents/Sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../service/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { Tabs, Tab } from "@mui/material";
import { FaStar, FaRegStar, FaCalendarAlt, FaMapMarkerAlt, FaCarAlt } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap"; // Import modal components

function ReporterDashboard() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [endKM, setEndKM] = useState("");
  const [rating, setRating] = useState(1); // Rating starts from 1
  const [description, setDescription] = useState("");
  const [driverNames, setDriverNames] = useState({}); // For storing driver names

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("email", "==", currentUser?.email)
        );
        const snapshot = await getDocs(bookingsQuery);
        const bookingsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate(),
        }));
        setBookings(bookingsData);
        // After fetching bookings, get the driver names
        fetchDriverNames(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDriverNames = async (bookings) => {
      const driverEmails = [...new Set(bookings.map((booking) => booking.allotedDriver))]; // Get unique driver emails
      const driverNamesObj = {};
      for (let email of driverEmails) {
        const userQuery = query(collection(db, "users"), where("email", "==", email));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          driverNamesObj[email] = userData.name; // Store driver name by email
        }
      }
      setDriverNames(driverNamesObj);
    };

    if (currentUser) fetchBookings();
  }, [currentUser]);

  const isTodayOrFuture = (date) => new Date(date) >= new Date().setHours(0, 0, 0, 0);

  const handleAddStartingKM = async (bookingId) => {
    const startingKM = prompt("Enter Starting KM:");
    if (startingKM && !isNaN(startingKM)) {
      try {
        const bookingDocRef = doc(db, "bookings", bookingId);
        await updateDoc(bookingDocRef, { startingKM: parseInt(startingKM, 10) });
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId ? { ...booking, startingKM: parseInt(startingKM, 10) } : booking
          )
        );
      } catch (error) {
        console.error("Error updating starting KM:", error);
      }
    } else {
      alert("Please enter a valid number.");
    }
  };

  const handleOpenModal = (booking) => {
    setCurrentBooking(booking);
    setModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if (endKM && rating) {
      try {
        const bookingDocRef = doc(db, "bookings", currentBooking.id);
        await updateDoc(bookingDocRef, {
          endKM: parseInt(endKM, 10),
          rating,
          description: description || "",
        });
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === currentBooking.id
              ? { ...booking, endKM: parseInt(endKM, 10), rating, description }
              : booking
          )
        );
        setModalOpen(false);
        setCurrentBooking(null);
        setEndKM("");
        setRating(1); // Reset rating to 1 after submission
        setDescription("");
      } catch (error) {
        console.error("Error updating booking:", error);
      }
    } else {
      alert("Please fill all fields.");
    }
  };

  const categorizedBookings = bookings.reduce(
    (acc, booking) => {
      if (isTodayOrFuture(booking.startDate)) acc.upcoming.push(booking);
      else acc.past.push(booking);
      return acc;
    },
    { upcoming: [], past: [] }
  );

  return (
    <div className="d-flex">
      <Sidebar
        menuSections={[{ heading: null, items: [{ name: "Dashboard", link: "/Reporter/ReporterDashboard", icon: "bi bi-house-door" },
           { name: "Reports", link: "/Reporter/reports", icon: "bi bi-file-earmark-text" },
        //  { name: "History", link: "/Reporter/History", icon: "bi bi-clock" },
          { name: "Car Request", link: "/Reporter/CarRequest", icon: "bi bi-car-front" }] }, { heading: "Settings", items: [{ name: "Profile", link: "/Profile", icon: "bi bi-person" }] }]} showLogout={true} />
      <div className="main-content flex-grow-1">
        <Navbar title="Reporter Dashboard" userEmail={currentUser?.email} />

        <div className="container-fluid mt-4">
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            className="mb-3"
          >
            <Tab label="Upcoming Bookings" value="upcoming" />
            <Tab label="Past Bookings" value="past" />
          </Tabs>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading...</p>
            </div>
          ) : (
            <div className="row">
              {categorizedBookings[activeTab]?.length > 0 ? (
                categorizedBookings[activeTab].map((booking) => (
                  <div key={booking.id} className="col-12 col-md-6 col-lg-4 mb-3">
                    <div className="card shadow-lg">
                      <div className="card-body p-4">
                        <h5 className="card-title text-primary">
                          <FaMapMarkerAlt className="me-2" />
                          {booking.destination}
                        </h5>
                        <h6 className="card-subtitle text-muted mb-2">
                          <FaCarAlt className="me-2" />
                          {driverNames[booking.allotedDriver] || "Driver not found"}
                        </h6>
                        <p className="card-text">
                          <FaCalendarAlt className="me-2" />
                          {booking.startDate.toLocaleString()}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          <span
                            className={`badge ${booking.status === "Approved" ? "bg-success" : "bg-warning"
                              }`}
                          >
                            {booking.status}
                          </span>
                        </p>

                        {/* Display rating with stars */}
                        <p>
                          <strong>Rating:</strong>
                          <div className="d-flex">
                            {[...Array(5)].map((_, index) => (
                              <div key={index} className="me-1">
                                {booking.rating > index ? (
                                  <FaStar color="gold" size={24} />
                                ) : (
                                  <FaRegStar color="gold" size={24} />
                                )}
                              </div>
                            ))}
                          </div>
                        </p>

                        {/* Action buttons */}
                        {booking.status === "Approved" && !booking.startingKM && activeTab === "upcoming" && (
                          <button
                            className="btn btn-outline-success w-100 mt-2"
                            onClick={() => handleAddStartingKM(booking.id)}
                          >
                            Add Starting KM
                          </button>
                        )}
                        {booking.status === "Approved" && booking.startingKM && !booking.endKM && activeTab === "upcoming" && (
                          <button
                            className="btn btn-outline-primary w-100 mt-2"
                            onClick={() => handleOpenModal(booking)}
                          >
                            Add Ending KM & Rating
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center">
                  <p className="text-muted">No bookings found in this category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Adding Ending KM and Rating */}
      <Modal show={modalOpen} onHide={() => setModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Ending KM and Rating</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Ending KM</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Ending KM"
                value={endKM}
                onChange={(e) => setEndKM(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div className="d-flex">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="me-1"
                    onClick={() => setRating(index + 1)} // Rating starts from 1
                    style={{ cursor: "pointer" }}
                  >
                    {rating > index ? (
                      <FaStar color="gold" size={24} />
                    ) : (
                      <FaRegStar color="gold" size={24} />
                    )}
                  </div>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter a description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleModalSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ReporterDashboard;
