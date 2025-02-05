// BookingTable.js
import React from "react";
import { FaCheck, FaTimes, FaEdit, FaTrashAlt } from "react-icons/fa";

const BookingTable = ({
  bookings,
  userNames,
  handleApproveClick,
  handleRejectClick,
  handleEditClick,
  handleDeleteModalShow,
}) => {
  return (
    <div className="table-responsive">
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
              <td>{new Date(booking.startDate.seconds * 1000).toLocaleDateString()}</td>
              <td>{booking.destination || "N/A"}</td>
              <td>{booking.status || "N/A"}</td>
              <td>
                <div className="btn-group">
                  {booking.status !== "Approved" && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleApproveClick(booking.id)}
                    >
                      <FaCheck />
                    </button>
                  )}
                  {booking.status !== "Rejected" && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRejectClick(booking.id)}
                    >
                      <FaTimes />
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => handleEditClick(booking)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteModalShow(booking.id)}
                  >
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