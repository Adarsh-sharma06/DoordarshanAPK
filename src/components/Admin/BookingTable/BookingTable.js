import React from "react";
import { FaCheck, FaTimes, FaEdit, FaTrashAlt } from "react-icons/fa";

const BookingTable = ({ bookings, userNames, onApprove, onReject, onEdit, onDelete }) => {
  return (
    <div className="booking-details">
      <h4>Booking Details</h4>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Reporter Name</th>
            <th>Aim</th>
            <th>Time</th>
            <th>Date</th>
            <th>Destination</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{userNames[booking.email] || booking.email}</td>
              <td>{booking.aim || "N/A"}</td>
              <td>{new Date(booking.time.seconds * 1000).toLocaleTimeString()}</td>
              <td>
                {new Date(booking.startDate.seconds * 1000).toLocaleDateString("en-GB")}
              </td>
              <td>{booking.destination || 0}</td>
              <td>{booking.status || "N/A"}</td>
              <td>
                <div className="btn-group">
                  {booking.status !== "Approved" && (
                    <button className="btn btn-sm btn-success" onClick={() => onApprove(booking.id)}>
                      <FaCheck />
                    </button>
                  )}
                  {booking.status !== "Rejected" && (
                    <button className="btn btn-sm btn-danger" onClick={() => onReject(booking.id)}>
                      <FaTimes />
                    </button>
                  )}
                  <button className="btn btn-sm btn-warning" onClick={() => onEdit(booking)}>
                    <FaEdit />
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(booking.id)}>
                    <FaTrashAlt />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;