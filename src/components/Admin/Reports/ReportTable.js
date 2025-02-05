import React from "react";

function ReportTable({ filteredBookings, reporterNames }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="thead-dark">
          <tr>
            <th>Reporter Name</th>
            <th>Aim</th>
            <th>Time</th>
            <th>Date</th>
            <th>Destination</th>
            <th>Booking Type</th>
            <th>Starting KM</th>
            <th>End KM</th>
            <th>Distance Covered</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.map((booking) => (
            <tr key={booking.id}>
              <td>{reporterNames[booking.email] || "N/A"}</td>
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
              <td>{booking.destination || "Not Entered"}</td>
              <td>{booking.bookingType || "Not Entered"}</td>
              <td>{booking.startingKM || 0 }</td>
              <td>{booking.endKM || 0}</td>
              <td>{(booking.endKM - booking.startingKM) || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReportTable;