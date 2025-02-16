import React, { useState, useEffect } from "react";
import Sidebar from "../../ReusableComponents/Sidebar/Sidebar";
import Navbar from "../../ReusableComponents/Navbar/Navbar";
import StatusTab from "../../ReusableComponents/StatusTab/StatusTab";
import { db, collection, getDocs, auth } from "../../../service/firebase"; // Firebase imports
import { onAuthStateChanged } from "firebase/auth"; // To track auth state
import { FaPrint } from "react-icons/fa";
import "./Report.css"; // Custom CSS

function Report() {
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

  const [userEmail, setUserEmail] = useState(""); // State for logged-in user's email
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [reporterNames, setReporterNames] = useState({});
  const [reporterFilter, setReporterFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // Track the logged-in user's email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsCollection = collection(db, "bookings");
        const bookingSnapshot = await getDocs(bookingsCollection);
        const bookingList = bookingSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => b.startDate.seconds - a.startDate.seconds); // Sorting by date in descending order

        setBookings(bookingList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter users by role to get only reporters
        const reporters = userList.filter((user) => user.role === "Reporter");

        setUsers(reporters);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchBookings();
    fetchUsers();
  }, []);

  useEffect(() => {
    const nameMapping = {};
    users.forEach((user) => {
      nameMapping[user.email] = user.name;
    });
    setReporterNames(nameMapping);
  }, [users]);

  const filterByDate = (date) => {
    if (!date || (!monthFilter && !yearFilter)) return true;
    const bookingDate = new Date(date.seconds * 1000);
    const bookingMonth = bookingDate.getMonth();
    const bookingYear = bookingDate.getFullYear();

    return (
      (monthFilter ? bookingMonth === parseInt(monthFilter) : true) &&
      (yearFilter ? bookingYear === parseInt(yearFilter) : true)
    );
  };

  const handleSearch = (booking) => {
    const searchFields = [
      booking.email ? reporterNames[booking.email] : "",
      booking.aim || "",
      booking.time
        ? new Date(booking.time.seconds * 1000).toLocaleTimeString("en-GB")
        : "",
      booking.startDate
        ? new Date(booking.startDate.seconds * 1000).toLocaleDateString("en-GB")
        : "",
      booking.destination || "",
      booking.bookingType || "",
      (booking.endKM - booking.startingKM) || "",
    ];

    return searchFields.some((field) => {
      return (
        typeof field === "string" &&
        field.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    return (
      (reporterFilter ? booking.email === reporterFilter : true) &&
      filterByDate(booking.startDate) &&
      handleSearch(booking)
    );
  });

  const totalData = filteredBookings.reduce(
    (totals, booking) => {
      totals.totalBookings++;
      const distance = booking.endKM && booking.startingKM ? booking.endKM - booking.startingKM : 0;
      totals.totalKmMoved += distance > 0 ? distance : 0; // Ensuring no negative values
      return totals;
    },
    { totalBookings: 0, totalKmMoved: 0 }
  );

  const handlePrint = () => {
    const content = document.getElementById("report-content");
    const printWindow = window.open("", "", "height=500,width=800");
    printWindow.document.write("<html><head><title>Bookings Report</title>");
    printWindow.document.write(
      '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">'
    );
    printWindow.document.write("</head><body>");
    const tableContent = content.querySelector(".table-responsive");
    printWindow.document.write(tableContent.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="Reports-container">
      <Sidebar logoText="Doordarshan" menuSections={menuSections} showLogout={true} />
      <div className="Reports-content">
        <Navbar title="Report" userEmail={userEmail} />
        <div className="mt-4">
          <StatusTab
            tabs={[
              {
                heading: "Total Bookings",
                content: totalData.totalBookings,
                color: "#333",
              },
              {
                heading: "Total Km Moved",
                content: totalData.totalKmMoved || 0,
                color: "f99244",
                customClass: "totalKM", // Custom class for styling
              },
            ]}
          />
        </div>

        <div id="report-content" className="mt-5 rounded-container">
          {/* Filter Section */}
          <div className="mb-4 d-flex  filter-wrapper">
            {/* Reporter Dropdown */}
            <div className="filter-dropdown">
              <select
                className="form-control filter-select"
                value={reporterFilter}
                onChange={(e) => setReporterFilter(e.target.value)}
              >
                <option value="">Reporter</option>
                {users.map((user) => (
                  <option key={user.id} value={user.email}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Dropdown */}
            <div className="filter-dropdown">
              <select
                className="form-control filter-select"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <option value="">Month</option>
                {[...Array(12).keys()].map((month) => (
                  <option key={month} value={month}>
                    {new Date(0, month).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Dropdown */}
            <div className="filter-dropdown">
              <select
                className="form-control filter-select"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="">Year</option>
                {[...Array(5).keys()].map((yearOffset) => {
                  const currentYear = new Date().getFullYear();
                  return (
                    <option key={yearOffset} value={currentYear - yearOffset}>
                      {currentYear - yearOffset}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Search Bar */}
            <div className="filter-dropdown">
              <input
                type="text"
                className="form-control filter-select"
                placeholder="Search"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Print Button */}
            <div className="text-end">
              <button className="btn print-btn" onClick={handlePrint}>
                <FaPrint /> Print
              </button>
            </div>
          </div>

          {/* Report Heading */}
          <h4 className="mb-4">Bookings Reports</h4>

          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="thead-dark">
                <tr>
                  <th>#</th>
                  <th>Reporter Name</th>
                  <th>Aim</th>
                  <th>Time</th>
                  <th>Date</th>
                  <th>Destination</th>
                  <th>Booking Type</th>
                  <th>Start KM</th>
                  <th>End KM</th>
                  <th>Distance (km)</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, index) => (
                  <tr key={booking.id}>
                    <td>{index + 1}</td>
                    <td>{reporterNames[booking.email]}</td>
                    <td>{booking.aim || "N/A"}</td>
                    <td>
                      {booking.time
                        ? new Date(booking.time.seconds * 1000).toLocaleTimeString("en-GB")
                        : "N/A"}
                    </td>
                    <td>
                      {booking.startDate
                        ? new Date(booking.startDate.seconds * 1000).toLocaleDateString("en-GB")
                        : "N/A"}
                    </td>
                    <td>{booking.destination || "N/A"}</td>
                    <td>{booking.bookingType}</td>
                    <td>{booking.startingKM || 0}</td>
                    <td>{booking.endKM || 0}</td>
                    <td>{(booking.endKM - booking.startingKM) || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;
