import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "../ReusableComponents/Navbar/Navbar";
import Sidebar from "../ReusableComponents/Sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../service/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BookingTabs from "./BookingTabs";
import BookingCard from "./BookingCard";
import { StartingKMModal, EndKMModal } from "./Modals";

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
        await updateDoc(bookingDocRef, { startingKM: parseInt(startingKM, 10) });
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === currentBooking.id ? { ...booking, startingKM: parseInt(startingKM, 10) } : booking
          )
        );
        toast.success("Starting KM added successfully!");
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
      if (rating <= 2 && !description) {
        toast.error("Description is compulsory for ratings of 2 stars or below.");
        return;
      }
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
        toast.success("End KM and rating added successfully!");
        resetEndKMModal();
      } catch (error) {
        console.error("Error updating booking:", error);
        toast.error("Failed to add End KM and rating.");
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

  const isToday = useCallback((date) =>
    new Date(date).toDateString() === new Date().toDateString() && new Date(date) <= new Date(), []);

  const categorizedBookings = useMemo(() => bookings.reduce(
    (acc, booking) => {
      if (new Date(booking.startDate) >= new Date().setHours(0, 0, 0, 0)) acc.upcoming.push(booking);
      else acc.past.push(booking);
      return acc;
    },
    { upcoming: [], past: [] }
  ), [bookings]);

  return (
    <div className="d-flex">
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
      <div className="main-content flex-grow-1">
        <Navbar title="Reporter Dashboard" userEmail={currentUser?.email} />
        <div className="container-fluid mt-4">
          <BookingTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading...</p>
            </div>
          ) : (
            <div className="row">
              {categorizedBookings[activeTab]?.length > 0 ? (
                categorizedBookings[activeTab].map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    driverNames={driverNames}
                    isToday={isToday}
                    onAddStartingKM={(booking) => {
                      setCurrentBooking(booking);
                      setStartingKMModalOpen(true);
                    }}
                    onAddEndKM={(booking) => {
                      setCurrentBooking(booking);
                      setEndKMModalOpen(true);
                    }}
                  />
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

      <StartingKMModal
        show={startingKMModalOpen}
        onHide={resetStartingKMModal}
        startingKM={startingKM}
        setStartingKM={setStartingKM}
        onSave={handleAddStartingKM}
      />

      <EndKMModal
        show={endKMModalOpen}
        onHide={resetEndKMModal}
        endKM={endKM}
        setEndKM={setEndKM}
        rating={rating}
        setRating={setRating}
        description={description}
        setDescription={setDescription}
        onSave={handleAddEndKMAndRating}
      />
    </div>
  );
}

export default ReporterDashboard;