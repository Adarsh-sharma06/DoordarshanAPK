import React, { useState, useEffect } from 'react';
import Sidebar from '../../ReusableComponents/Sidebar/Sidebar';
import Navbar from '../../ReusableComponents/Navbar/Navbar';
import StatusTab from '../../ReusableComponents/StatusTab/StatusTab';
import { db, collection, getDocs } from '../../../service/firebase'; // Firebase import
import { FaPrint } from 'react-icons/fa';
import { FaTruck, FaMapMarkerAlt, FaUsers, FaClipboardList } from "react-icons/fa";
import './Report.css'; // Import custom CSS

function Report() {
  const menuSections = [
    {
      heading: "Main Menu",
      items: [
        { name: "Dashboard", link: "/Admin/Dashboard", icon: 'bi bi-truck' },
        { name: "Tracker", link: "/Admin/Tracker", icon:'bi bi-map'},
        { name: "Reports", link: "/Admin/Reports/Report", icon:'bi bi-bar-chart' },
      ],
    },
    {
      heading: "Administration",
      items: [
        { name: "Create Users", link: "/Admin/Dashboard/CreateUser", icon: 'bi bi-people' },
      ],
    },
  ];

  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]); // State to store users
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State for search
  const [reporterNames, setReporterNames] = useState({}); // Store names of reporters
  const [reporterFilter, setReporterFilter] = useState(""); // Reporter filter
  const [monthFilter, setMonthFilter] = useState(""); // State for month filter
  const [yearFilter, setYearFilter] = useState(""); // State for year filter

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsCollection = collection(db, "bookings");
        const bookingSnapshot = await getDocs(bookingsCollection);
        const bookingList = bookingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter users by role to get only reporters
        const reporters = userList.filter(user => user.role === "Reporter");

        setUsers(reporters); // Set only the users with 'Reporter' role
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchBookings();
    fetchUsers();
  }, []);

  // Fetch reporter names based on email
  useEffect(() => {
    const nameMapping = {};
    users.forEach((user) => {
      nameMapping[user.email] = user.name;
    });
    setReporterNames(nameMapping);
  }, [users]);

  // Filter by month and year
  const filterByDate = (date) => {
    if (!date || (!monthFilter && !yearFilter)) return true;
    const bookingDate = new Date(date.seconds * 1000); // Convert Firestore timestamp
    const bookingMonth = bookingDate.getMonth();
    const bookingYear = bookingDate.getFullYear();

    return (
      (monthFilter ? bookingMonth === parseInt(monthFilter) : true) &&
      (yearFilter ? bookingYear === parseInt(yearFilter) : true)
    );
  };

  // Search function to check across all fields
  const handleSearch = (booking) => {
    const searchFields = [
      booking.email ? reporterNames[booking.email] : '', // Reporter Name
      booking.aim || '',
      booking.time ? new Date(booking.time.seconds * 1000).toLocaleTimeString('en-GB') : '',
      booking.startDate ? new Date(booking.startDate.seconds * 1000).toLocaleDateString('en-GB') : '',
      booking.destination || '',
      booking.bookingType || '',
      (booking.endKM - booking.startingKM) || ''
    ];

    return searchFields.some(field => {
      // Only call toLowerCase on string fields
      return typeof field === 'string' && field.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  // Filter bookings based on reporter, month, year, and search
  const filteredBookings = bookings.filter((booking) => {
    return (
      (reporterFilter ? booking.email === reporterFilter : true) &&
      filterByDate(booking.startDate) &&
      handleSearch(booking) // Apply search filter
    );
  });

  // Calculate total data
  const totalData = filteredBookings.reduce(
    (totals, booking) => {
      totals.totalBookings++;
      totals.totalKmMoved += booking.endKM - booking.startingKM;
      return totals;
    },
    { totalBookings: 0, totalKmMoved: 0 }
  );

  // Function to handle print
  const handlePrint = () => {
    const content = document.getElementById('report-content'); // Get the report section
    const totalKmMoved = totalData.totalKmMoved; // Get the total KM moved

    const printWindow = window.open('', '', 'height=500,width=800');
    printWindow.document.write('<html><head><title>Bookings Report</title>');
    printWindow.document.write('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">');
    printWindow.document.write('<style>body { font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333; } .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #fff; } .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; } .table th { background-color: #ccc; color: #333; } .table tr:nth-child(even) { background-color: #f2f2f2; } .table tr:hover { background-color: #e1e1e1; } .total-km { position: fixed; bottom: 20px; right: 20px; font-size: 18px; font-weight: bold; background-color: #f4f4f4; padding: 10px 20px; border-radius: 5px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }</style>');
    printWindow.document.write('</head><body>');

    // Exclude the filter section and only print the table
    const tableContent = content.querySelector('.table-responsive');
    printWindow.document.write(tableContent.innerHTML); // Print only the table content

    // Add total KM moved at the bottom-right corner
    printWindow.document.write(`
      <div style="text-align: right; font-weight: bold; margin-top: 20px; ">
          Total KM Moved: ${totalData.totalKmMoved}
      </div>
  `);

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };



  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-12 col-md-3">
          <Sidebar logoText="Doordarshan" menuSections={menuSections} showLogout={true} />
        </div>

        {/* Main Content */}
        <div className="col-12 col-md-9 ms-auto">

          <Navbar
            title="Report"
            placeholder="Search for something..."
            profileImg="/images/DD.png"
            profileName="Admin"
          />

          {/* <Navbar
          title="Admin Dashboard"
          placeholder="Search for something..."
          profileImg={userData?.profileImage || "/images/DD.png"}
          profileName={userData?.name || "Admin"}
          userEmail={userData?.email}
        /> */}

          <div className="mt-4">
            <StatusTab
              tabs={[
                { heading: 'Total Bookings', content: totalData.totalBookings, color: 'var(--color-black)' },
                { heading: 'Total Km Moved', content: totalData.totalKmMoved, color: '#fff', customClass: 'totalKM' }, // Add customClass
              ]}
            />

          </div>

          <div id="report-content" className="mt-5 rounded-container">
            {/* Filter Section */}
            <div className="mb-4 d-flex justify-content-between filter-wrapper">
              {/* Reporter Dropdown */}
              <div className="w-30">
                <select
                  className="form-control filter-select"
                  value={reporterFilter}
                  onChange={(e) => setReporterFilter(e.target.value)}
                >
                  <option value="">Filter by Reporter</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.email}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Dropdown */}
              <div className="w-30">
                <select
                  className="form-control filter-select"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                >
                  <option value="">Filter by Month</option>
                  {[...Array(12).keys()].map((month) => (
                    <option key={month} value={month}>
                      {new Date(0, month).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Dropdown */}
              <div className="w-30">
                <select
                  className="form-control filter-select"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  <option value="">Filter by Year</option>
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
              <div className="w-30">
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
                  <FaPrint /> Print Report
                </button>
              </div>
            </div>

            {/* Report Heading */}
            <h4 className="mb-4"> Bookings Reports</h4>

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
                    <th>Type</th>
                    <th>Km Moved</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, index) => (
                    <tr key={booking.id}>
                      <td>{index + 1}</td>
                      <td>{reporterNames[booking.email] || 'N/A'}</td>
                      <td>{booking.aim || 'N/A'}</td>
                      <td>{booking.time ? new Date(booking.time.seconds * 1000).toLocaleTimeString('en-GB') : 'N/A'}</td>
                      <td>{booking.startDate ? new Date(booking.startDate.seconds * 1000).toLocaleDateString('en-GB') : 'Invalid Date'}</td>
                      <td>{booking.destination || 'N/A'}</td>
                      <td>{booking.bookingType || 'N/A'}</td>
                      <td>{booking.endKM - booking.startingKM}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;
