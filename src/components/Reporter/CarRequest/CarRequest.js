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
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
    holdType: "Drop and Go", // Default to "Drop and Go"
    holdDuration: "", // Duration in "HH:MM" format
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs(), dayjs().add(1, "day")]);
  const auth = getAuth();
  const currentUser = auth.currentUser;

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
    setDateRange(type === "Local" ? [dayjs(), dayjs().add(1, "day")] : [dayjs(), dayjs().add(2, "day")]);
  };

  const handleHoldTypeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      holdType: e.target.value,
      holdDuration: e.target.value === "Drop and Go" ? "" : prev.holdDuration, // Reset duration if "Drop and Go" is selected
    }));
  };

  const validateHoldDuration = (duration) => {
    // Validate the "HH:MM" format
    const regex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(duration);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!currentUser) {
        toast.error("User is not authenticated!");
        setLoading(false);
        return;
      }

      if (!formData.startDate) {
        toast.error("Start Date is required!");
        setLoading(false);
        return;
      }

      if (!formData.time) {
        toast.error("Time is required!");
        setLoading(false);
        return;
      }

      // **Combine date and time for validation**
      const selectedDate = dayjs(formData.startDate).startOf("day"); // Ensure only date is considered
      const today = dayjs().startOf("day"); // Today’s date without time
      const maxDate = formData.bookingType === "Local" ? today.add(2, "day") : today.add(3, "day");

      // **Check if selected date is within the allowed range**
      if (selectedDate.isBefore(today) || selectedDate.isAfter(maxDate)) {
        toast.error(
          `For ${formData.bookingType} trips, the start date must be between ${today.format("DD/MM/YYYY")} and ${maxDate.format("DD/MM/YYYY")}.`
        );
        setLoading(false);
        return;
      }

      // Validate hold duration if "On Hold" is selected
      if (formData.holdType === "On Hold" && !validateHoldDuration(formData.holdDuration)) {
        toast.error("Please enter a valid duration in HH:MM format (e.g., 2:30).");
        setLoading(false);
        return;
      }

      const userEmail = currentUser.email;
      const userName = userEmail.split("@")[0];

      const bookingData = {
        ...formData,
        startDate: formData.startDate.toDate(),
        time: formData.time.toDate(),
        holdDuration: formData.holdType === "On Hold" ? formData.holdDuration : null,
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

      toast.success("Car request submitted successfully!");

      setFormData({
        aim: "",
        destination: "",
        startDate: null,
        time: null,
        bookingType: "Local",
        holdType: "Drop and Go",
        holdDuration: "",
      });
    } catch (error) {
      console.error("Error submitting car request: ", error);
      toast.error("Failed to submit car request.");
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
              <Tooltip title="Request a car for local trips within the city">
                <Button
                  variant={formData.bookingType === "Local" ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => handleBookingTypeChange("Local")}
                >
                  Local
                </Button>
              </Tooltip>
              <Tooltip title="Request a car for outstation trips">
                <Button
                  variant={formData.bookingType === "Outstation" ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => handleBookingTypeChange("Outstation")}
                >
                  Outstation
                </Button>
              </Tooltip>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Coverage *"
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
                  <Typography variant="body1" sx={{ marginBottom: 1 }}>
                    Hold Type *
                  </Typography>
                  <RadioGroup
                    row
                    name="holdType"
                    value={formData.holdType}
                    onChange={handleHoldTypeChange}
                  >
                    <FormControlLabel
                      value="Drop and Go"
                      control={<Radio />}
                      label="Drop and Go"
                    />
                    <FormControlLabel
                      value="On Hold"
                      control={<Radio />}
                      label="On Hold"
                    />
                  </RadioGroup>
                </Grid>

                {formData.holdType === "On Hold" && (
                  <Grid item xs={12}>
                    <TextField
                      label="Hold Duration (HH:MM) *"
                      variant="outlined"
                      fullWidth
                      name="holdDuration"
                      value={formData.holdDuration}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 2:30"
                      inputProps={{ pattern: "([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]" }} // Enforce HH:MM format
                    />
                  </Grid>
                )}

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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default CarRequest;