import React, { useState, useEffect } from "react";
import Navbar from "../ReusableComponents/Navbar/Navbar";
import Sidebar from "../ReusableComponents/Sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../service/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { Tabs, Tab, Tooltip } from "@mui/material";
import { FaCalendarAlt, FaMapMarkerAlt, FaCarAlt } from "react-icons/fa";
import { Modal, Button, Form, OverlayTrigger } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ReporterDashboard() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [startingKMModalOpen, setStartingKMModalOpen] = useState(false);
  const [endKMModalOpen, setEndKMModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [startingKM, setStartingKM] = useState("");
  const [endKM, setEndKM] = useState("");
  const [rating, setRating] = useState(1);
  const [description, setDescription] = useState("");
  const [driverNames, setDriverNames] = useState({});

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
          startDate: doc.data().startDate ? doc.data().startDate.toDate() : null,
          time: doc.data().time ? doc.data().time.toDate() : null,
        }));
        setBookings(bookingsData);
        fetchDriverNames(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to fetch bookings.");
      } finally {
        setLoading(false);
      }
    };

    const fetchDriverNames = async (bookings) => {
      const driverEmails = [...new Set(bookings.map((booking) => booking.allotedDriver))];
      const driverNamesObj = {};
      if (driverEmails.length > 0) {
        const usersQuery = query(collection(db, "users"), where("email", "in", driverEmails));
        const userSnapshot = await getDocs(usersQuery);
        userSnapshot.docs.forEach((doc) => {
          const userData = doc.data();
          driverNamesObj[userData.email] = { name: userData.name, phone: userData.phone };
        });
      }
      setDriverNames(driverNamesObj);
    };

    if (currentUser) fetchBookings();
  }, [currentUser]);

  const handleAddStartingKM = async () => {
    if (startingKM && !isNaN(startingKM)) {
      try {
        const bookingDocRef = doc(db, "bookings", currentBooking.id);
        await updateDoc(bookingDocRef, {
          startingKM: parseInt(startingKM, 10),
          status: "onTrip", // Update status to "onTrip"
        });

        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === currentBooking.id
              ? { ...booking, startingKM: parseInt(startingKM, 10), status: "onTrip" }
              : booking
          )
        );

        toast.success("Starting KM added, status updated to 'onTrip'!");
        resetStartingKMModal();
      } catch (error) {
        console.error("Error updating starting KM:", error);
        toast.error("Failed to add Starting KM.");
      }
    } else {
      toast.error("Please enter a valid number.");
    }
  };

  const handleAddEndKMAndRating = async () => {
    if (endKM && rating) {
      try {
        const bookingDocRef = doc(db, "bookings", currentBooking.id);
        await updateDoc(bookingDocRef, {
          endKM: parseInt(endKM, 10),
          rating,
          description: description || "",
          status: "Completed", // Update the status to Completed
        });
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === currentBooking.id
              ? { ...booking, endKM: parseInt(endKM, 10), rating, description, status: "Completed" }
              : booking
          )
        );
        toast.success("End KM, rating added, and status updated to Completed!");
        resetEndKMModal();
      } catch (error) {
        console.error("Error updating booking:", error);
        toast.error("Failed to add End KM, rating, and update status.");
      }
    } else {
      toast.error("Please fill all fields.");
    }
  };


  const resetStartingKMModal = () => {
    setStartingKMModalOpen(false);
    setStartingKM("");
    setCurrentBooking(null);
  };

  const resetEndKMModal = () => {
    setEndKMModalOpen(false);
    setEndKM("");
    setRating(1);
    setDescription("");
    setCurrentBooking(null);
  };

  const isToday = (date) =>
    new Date(date).toDateString() === new Date().toDateString() && new Date(date) <= new Date();

  const categorizedBookings = bookings.reduce(
    (acc, booking) => {
      if (new Date(booking.startDate) >= new Date().setHours(0, 0, 0, 0)) acc.upcoming.push(booking);
      else acc.past.push(booking);
      return acc;
    },
    { upcoming: [], past: [] }
  );

  return (
    <div className="dashboard-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar
        menuSections={[{
          heading: null,
          items: [
            { name: "Dashboard", link: "/Reporter/ReporterDashboard", icon: "bi bi-house-door" },
            { name: "Reports", link: "/Reporter/reports", icon: "bi bi-file-earmark-text" },
            { name: "Car Request", link: "/Reporter/CarRequest", icon: "bi bi-car-front" },
          ],
        },
        { heading: "Settings", items: [{ name: "Profile", link: "/Profile", icon: "bi bi-person" }] },
        ]}
        showLogout={true}
      />
      <div className="content-container">
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
                        <div className="d-flex mt-4 mb-2 align-items-center">
                          <FaCarAlt className="me-2" />
                          {driverNames[booking.allotedDriver] ? (
                            <OverlayTrigger
                              overlay={
                                <Tooltip
                                  id="tooltip-phone"
                                  data-placement="right"
                                  PopperProps={{
                                    modifiers: [
                                      {
                                        name: "offset",
                                        options: {
                                          offset: [0, 8], // Adds space between the tooltip and the target element
                                        },
                                      },
                                    ],
                                  }}
                                >
                                  {driverNames[booking.allotedDriver].phone ? (
                                    <span>
                                      Call: <a href={`tel:${driverNames[booking.allotedDriver].phone}`}>{driverNames[booking.allotedDriver].phone}</a>
                                    </span>
                                  ) : (
                                    "No mobile number available"
                                  )}
                                </Tooltip>
                              }
                            >
                              <span
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  window.location.href = `tel:${driverNames[booking.allotedDriver].phone}`;
                                }}
                              >
                                {driverNames[booking.allotedDriver].name || "Driver not found"}
                              </span>
                            </OverlayTrigger>
                          ) : (
                            <span className="text-muted">Driver not found</span>
                          )}
                        </div>

                        <p className="card-text">
                          <FaCalendarAlt className="me-2" />
                          {booking.startDate
                            ? booking.startDate.toLocaleDateString("en-GB")
                            : "No Start Date"}
                          {booking.time
                            ? `, ${booking.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : ""}
                        </p>

                        {booking.startingKM && booking.endKM ? (
                          <>
                            <p>
                              <strong>Total KM:</strong> {booking.endKM - booking.startingKM} km
                            </p>
                            <p>
                              <strong>Status:</strong>{" "}
                              <span className="badge bg-primary">Completed</span>
                            </p>
                          </>
                        ) : (
                          <p>
                            <strong>Status:</strong>{" "}
                            <span
                              className={`badge ${booking.status === "Approved" ? "bg-success" : "bg-warning"
                                }`}
                            >
                              {booking.status}
                            </span>
                          </p>
                        )}

                        {/* Actions */}
                        {booking.status === "Approved" &&
                          !booking.startingKM &&
                          activeTab === "upcoming" &&
                          isToday(booking.startDate) && (
                            <OverlayTrigger overlay={<Tooltip>Add starting kilometers for the trip.</Tooltip>} placement="top">
                              <button
                                className="btn btn-outline-success w-100 mt-2"
                                onClick={() => {
                                  setCurrentBooking(booking);
                                  setStartingKMModalOpen(true);
                                }}
                              >
                                Add Starting KM
                              </button>
                            </OverlayTrigger>
                          )}

                        {booking.status === "onTrip" && // Ensure it's in progress
                          booking.startingKM !== undefined && booking.startingKM > 0 &&
                          (booking.endKM === undefined || booking.endKM === null) && // Ensure endKM is not already set
                          activeTab === "upcoming" && (
                            <OverlayTrigger overlay={<Tooltip>Complete the trip details.</Tooltip>} placement="top">
                              <button
                                className="btn btn-outline-primary w-100 mt-2"
                                onClick={() => {
                                  setCurrentBooking(booking);
                                  setEndKMModalOpen(true);
                                }}
                              >
                                Add Ending KM & Rating
                              </button>
                            </OverlayTrigger>
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

      {/* Modals */}
      <Modal show={startingKMModalOpen} onHide={resetStartingKMModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Starting KM</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Starting KM</Form.Label>
              <Form.Control
                type="number"
                value={startingKM}
                onChange={(e) => setStartingKM(e.target.value)}
                placeholder="Enter starting kilometers"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetStartingKMModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddStartingKM}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={endKMModalOpen} onHide={resetEndKMModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add End KM & Rating</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>End KM</Form.Label>
              <Form.Control
                type="number"
                value={endKM}
                onChange={(e) => setEndKM(e.target.value)}
                placeholder="Enter end kilometers"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <Form.Control
                as="select"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (optional)</Form.Label>
              <Form.Control
                as="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Enter any comments"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetEndKMModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddEndKMAndRating}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ReporterDashboard;
