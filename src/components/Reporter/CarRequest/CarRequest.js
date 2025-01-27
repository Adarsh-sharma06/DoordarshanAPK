import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { db } from "../../../service/firebase";
import Sidebar from "../../ReusableComponents/Sidebar/Sidebar";
import Navbar from "../../ReusableComponents/Navbar/Navbar";
import { getAuth } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import dayjs from "dayjs";

function CarRequest() {
  const [formData, setFormData] = useState({
    aim: "",
    destination: "",
    startDate: null,
    time: null,
    bookingType: "Local",
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs(), dayjs().add(1, "day")]); // Default range for Local
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const menuSections = [
    {
      heading: null,
      items: [
        { name: "Dashboard", link: "/Reporter/ReporterDashboard", icon: "bi bi-house-door" },
        { name: "Reports", link: "/Reporter/Reports", icon: "bi bi-file-earmark-text" },
        { name: "History", link: "/Reporter/History", icon: "bi bi-clock" },
        { name: "Car Request", link: "/Reporter/CarRequest", icon: "bi bi-car-front" },
      ],
    },
    {
      heading: "Settings",
      items: [
        { name: "Profile", link: "/Reporter/Profile", icon: "bi bi-person" },
        { name: "Logout", link: "/logout", icon: "bi bi-box-arrow-right" },
      ],
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      startDate: date,
    }));
  };

  const handleTimeChange = (time) => {
    const today = dayjs().startOf("day");
    const combinedDateTime = today.hour(time.hour()).minute(time.minute()).second(0);
    setFormData((prev) => ({
      ...prev,
      time: combinedDateTime,
    }));
  };

  const handleBookingTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      bookingType: type,
    }));

    if (type === "Local") {
      setDateRange([dayjs(), dayjs().add(1, "day")]); // Today and tomorrow
    } else {
      setDateRange([dayjs(), dayjs().add(2, "day")]); // Today, tomorrow, and day after
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentUser) {
        alert("User is not authenticated!");
        setLoading(false);
        return;
      }

      const userEmail = currentUser.email;
      const userName = userEmail.split("@")[0];

      const bookingData = {
        ...formData,
        startDate: formData.startDate ? formData.startDate.toDate() : null,
        time: formData.time ? formData.time.toDate() : null,
        status: "Pending",
        allotedDriver: "",
        email: userEmail,
      };

      const bookingCollection = collection(db, "bookings");
      const q = query(bookingCollection, where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);

      let highestBookingNumber = 0;

      querySnapshot.forEach((doc) => {
        const match = doc.id.match(/^(.+)_booking(\d+)$/);
        if (match && match[2]) {
          const bookingNumber = parseInt(match[2], 10);
          highestBookingNumber = Math.max(highestBookingNumber, bookingNumber);
        }
      });

      const newBookingNumber = highestBookingNumber + 1;
      const newDocId = `${userName}_booking${newBookingNumber}`;

      await setDoc(doc(db, "bookings", newDocId), bookingData);

      alert("Car request submitted successfully!");

      setFormData({
        aim: "",
        destination: "",
        startDate: null,
        time: null,
        bookingType: "Local",
      });
    } catch (error) {
      console.error("Error submitting car request: ", error);
      alert("Failed to submit car request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
       <Sidebar
                menuSections={[
                    {
                        heading: null,
                        items: [
                            { name: "Dashboard", link: "/Reporter/ReporterDashboard", icon: "bi bi-house-door" },
                            { name: "Reports", link: "/Reporter/reports", icon: "bi bi-file-earmark-text" },
                            // { name: "History", link: "/Reporter/History", icon: "bi bi-clock" },
                            { name: "Car Request", link: "/Reporter/CarRequest", icon: "bi bi-car-front" },
                        ],
                    },
                    { heading: "Settings", items: [{ name: "Profile", link: "/Profile", icon: "bi bi-person" }] },
                ]}
                showLogout={true}
            />

<div className="main-content flex-grow-1">
                <Navbar title="Reporter Dashboard" userEmail={currentUser?.email || "Guest"} />
      <div className="container py-5">
        
        <Paper
          elevation={4}
          sx={{
            padding: 4,
            maxWidth: "600px",
            margin: "auto",
            borderRadius: "16px",
            background: "linear-gradient(to bottom, #ffffff, #f9f9f9)",
          }}
        >
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#333" }}>
            Car Request Form
          </Typography>
          <Typography variant="body1" align="center" sx={{ marginBottom: 4, color: "#555" }}>
            Complete the form below to book your trip.
          </Typography>

          <Box display="flex" justifyContent="center" gap={2} marginBottom={2}>
            <Button
              variant={formData.bookingType === "Local" ? "contained" : "outlined"}
              color="primary"
              onClick={() => handleBookingTypeChange("Local")}
            >
              Local
            </Button>
            <Button
              variant={formData.bookingType === "Outstation" ? "contained" : "outlined"}
              color="primary"
              onClick={() => handleBookingTypeChange("Outstation")}
            >
              Outstation
            </Button>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Aim *"
                  variant="outlined"
                  fullWidth
                  name="aim"
                  value={formData.aim}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Destination *"
                  variant="outlined"
                  fullWidth
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body1">Start Date *</Typography>
                  {formData.bookingType === "Local" && (
                    <Tooltip title="Local is limited to Gandhinagar and Ahmedabad">
                      <IconButton size="small">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={formData.startDate}
                    onChange={handleStartDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    shouldDisableDate={(date) =>
                      date.isBefore(dateRange[0], "day") || date.isAfter(dateRange[1], "day")
                    }
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Time"
                    value={formData.time}
                    onChange={handleTimeChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Request"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </div>
      </div>
    </div>
  );
}

export default CarRequest;
