// Report.js
import React, { useState, useEffect } from "react";
import Sidebar from "../../ReusableComponents/Sidebar/Sidebar";
import Navbar from "../../ReusableComponents/Navbar/Navbar";
import StatusTab from "../../ReusableComponents/StatusTab/StatusTab";
import FilterSection from "./FilterSection";
import ReportTable from "./ReportTable";
import { db, collection, getDocs, auth } from "../../../service/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FaPrint } from "react-icons/fa";
import "./Report.css";

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

  const [userEmail, setUserEmail] = useState("");
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [reporterNames, setReporterNames] = useState({});
  const [reporterFilter, setReporterFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

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
        const bookingList = bookingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
      const startKM = booking.startingKM || 0; // Default to 0 if missing
      const endKM = booking.endKM || 0; // Default to 0 if missing
  
      totals.totalBookings++;
      totals.totalKmMoved += Math.max(0, endKM - startKM); // Ensure no negative values
      return totals;
    },
    { totalBookings: 0, totalKmMoved: 0 }
  );
  

  const handlePrint = () => {
    const tableElement = document.querySelector(".table-responsive");
  
    if (!tableElement) {
      alert("Report table not found! Please make sure the table is visible.");
      return;
    }
  
    const tableContent = tableElement.outerHTML;
  
    const printWindow = window.open("", "", "height=600,width=900");
    printWindow.document.write(`
      <html>
        <head>
          <title>Bookings Report</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 20px;
              padding: 20px;
              text-align: center;
            }
            h2 {
              margin-bottom: 10px;
            }
            .summary {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid black;
              padding: 10px;
              text-align: left;
              font-size: 14px;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
              text-align: center;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            tr:hover {
              background-color: #f1f1f1;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <h2>Bookings Report</h2>
          <div class="summary">
            <p><strong>Total Bookings:</strong> ${totalData.totalBookings}</p>
            <p><strong>Total KM Moved:</strong> ${totalData.totalKmMoved || 0} km</p>
          </div>
          ${tableContent}
        </body>
      </html>
    `);
  
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
                customClass: "totalKM",
              },
            ]}
          />
        </div>

        <div id="report-content" className="mt-5 rounded-container">
          <FilterSection
            users={users}
            reporterFilter={reporterFilter}
            setReporterFilter={setReporterFilter}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handlePrint={handlePrint}
          />

          <h4 className="mb-4">Bookings Reports</h4>

          <ReportTable filteredBookings={filteredBookings} reporterNames={reporterNames} />
        </div>
      </div>
    </div>
  );
}

export default Report;