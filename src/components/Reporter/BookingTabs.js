import React from "react";
import { Tabs, Tab } from "@mui/material";

const BookingTabs = ({ activeTab, setActiveTab }) => {
  return (
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
  );
};

export default BookingTabs;