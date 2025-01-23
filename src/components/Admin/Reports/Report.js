import React, { useState, useEffect } from 'react';
import Sidebar from '../../ReusableComponents/Sidebar/Sidebar';
import Navbar from '../../ReusableComponents/Navbar/Navbar';
import StatusTab from '../../ReusableComponents/StatusTab/StatusTab';
import { db, collection, getDocs } from '../../../service/firebase'; // Firebase import
import { FaPrint } from 'react-icons/fa';
import './Report.css'; // Import custom CSS

function Report() {
  const menuSections = [
    {
      heading: null,
      items: [
        { name: 'Dashboard', link: '/Admin/Dashboard', icon: 'bi bi-speedometer2' },
        { name: 'Tracker', link: '/Admin/Tracker', icon: 'bi bi-map' },
        { name: 'Report', link: '/Admin/Report', icon: 'bi bi-bar-chart' },
      ],
    },
    {
      heading: 'Administrator',
      items: [
        { name: 'Vehicles', link: '/vehicles', icon: 'bi bi-truck' },
        { name: 'Users', link: '/Admin/Dashboard/CreateUser', icon: 'bi bi-people' },  // Updated link
        { name: 'Driver', link: '/driver', icon: 'bi bi-person-badge' },
      ],
    },
  ];

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    bookingType: '', // local or outstation filter
  });

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

    fetchBookings();
  }, []);

  // Function to calculate approximate kilometers (dummy logic)
  const calculateKm = (startDate, endDate) => {
    const hours = (endDate.seconds - startDate.seconds) / 3600;
    const averageSpeed = 50; // Assuming average speed of 50 km/h
    return (hours * averageSpeed).toFixed(2); // Approximate kilometers
  };

  // Filtering bookings based on the bookingType filter
  const filteredBookings = bookings.filter((booking) => {
    return filter.bookingType === '' || booking.bookingType === filter.bookingType;
  });

  // Function to handle print
  const handlePrint = () => {
    const content = document.getElementById('report-content'); // Get the report section
    const printWindow = window.open('', '', 'height=500,width=800');
    printWindow.document.write('<html><head><title>Bookings Report</title>');
    printWindow.document.write('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(content.innerHTML); // Print only the report content
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  const tabsData = [
    {
      heading: 'Total Cars',
      content: '15',
      color: 'var(--color-black)', 
    },
    {
      heading: 'On-Trip Cars',
      content: '5',
      color: 'var(--danger-color)', 
    },
    {
      heading: 'Available Cars',
      content: '5',
      color: 'var(--success-color)', 
    },
    {
      heading: 'Booked Cars',
      content: '5',
      color: 'var(--primary-color)', 
    },
  ];

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <Sidebar logoSrc="/images/DD.png" logoText="Doordarshan" menuSections={menuSections} showLogout={true} />

        {/* Main Content */}
        <div className="col-10 ms-auto">
          <Navbar 
            title="Report"
            placeholder="Search for something..."
            profileImg="/images/DD.png"
            profileName="Admin"
          />

          <div className="mt-4">
            <StatusTab tabs={tabsData} />
          </div>

          {/* Filter Section */}
          <div className="mt-4 mb-4">
            {/* Local / Outstation Dropdown */}
            <select
              className="form-control mb-2"
              value={filter.bookingType}
              onChange={(e) => setFilter({ ...filter, bookingType: e.target.value })}
            >
              <option value="">Filter by Trip Type</option>
              <option value="local">Local</option>
              <option value="outstation">Outstation</option>
            </select>
          </div>

          {/* Print Button */}
          <div className="text-end mt-3">
            <button className="btn btn-primary" onClick={handlePrint}>
              <FaPrint /> Print Report
            </button>
          </div>

          {/* Bookings Table */}
          <div className="mt-5" id="report-content">
            <h4 className="mb-4">Bookings Report</h4>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="thead-dark">
                  <tr>
                    <th>#</th>
                    <th>Customer Name</th>
                    <th>Aim</th>
                    <th>Time</th>
                    <th>Date</th>
                    <th>Destination</th>
                    <th>Type</th>
                    <th>Approx. Km Moved</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, index) => (
                    <tr key={booking.id}>
                      <td>{index + 1}</td>
                      <td>{booking.customerName || 'N/A'}</td>
                      <td>{booking.aim || 'N/A'}</td>
                      <td>{booking.time || 'N/A'}</td>
                      <td>{booking.startDate ? new Date(booking.startDate.seconds * 1000).toLocaleDateString('en-GB') : 'Invalid Date'}</td>
                      <td>{booking.destination || 'N/A'}</td>
                      <td>{booking.bookingType}</td>
                      <td>
                        {booking.startDate && booking.endDate
                          ? calculateKm(booking.startDate, booking.endDate)
                          : 'N/A'}
                      </td>
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
