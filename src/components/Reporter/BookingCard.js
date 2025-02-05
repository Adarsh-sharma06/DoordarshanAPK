import React from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaCarAlt } from "react-icons/fa";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";

const BookingCard = ({ booking, driverNames, isToday, onAddStartingKM, onAddEndKM }) => {
  return (
    <div className="col-12 col-md-6 col-lg-4 mb-3">
      <div className="card shadow-lg">
        <div className="card-body p-4">
          <h5 className="card-title text-primary">
            <FaMapMarkerAlt className="me-2" />
            {booking.destination}
          </h5>
          <div className="d-flex mt-4 mb-2 align-items-center">
            <FaCarAlt className="me-2" />
            {driverNames[booking.allotedDriver] ? (
              <OverlayTrigger
                overlay={
                  <Tooltip id="tooltip-phone" data-placement="right">
                    {driverNames[booking.allotedDriver].phone ? (
                      <span>
                        Call: <a href={`tel:${driverNames[booking.allotedDriver].phone}`}>{driverNames[booking.allotedDriver].phone}</a>
                      </span>
                    ) : (
                      "No mobile number available"
                    )}
                  </Tooltip>
                }
              >
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    window.location.href = `tel:${driverNames[booking.allotedDriver].phone}`;
                  }}
                >
                  {driverNames[booking.allotedDriver].name || "Driver not found"}
                </span>
              </OverlayTrigger>
            ) : (
              <span className="text-muted">Driver not found</span>
            )}
          </div>

          <p className="card-text">
            <FaCalendarAlt className="me-2" />
            {booking.startDate
              ? booking.startDate.toLocaleDateString("en-GB")
              : "No Start Date"}
            {booking.time
              ? `, ${booking.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : ""}
          </p>
          <p>
            <strong>Car Status:</strong>{" "}
            <span
              className={`badge ${!booking.startingKM ? "bg-success" : booking.startingKM && !booking.endKM ? "bg-danger" : "bg-secondary"
                }`}
            >
              {!booking.startingKM ? "Available" : booking.startingKM && !booking.endKM ? "Not Available" : "Unknown"}
            </span>
          </p>

          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`badge ${booking.status === "Approved"
                ? "bg-success"
                : booking.status === "Pending"
                  ? "bg-warning"
                  : booking.status === "Rejected"
                    ? "bg-danger"
                    : "bg-secondary"
                }`}
            >
              {booking.status}
            </span>
          </p>

          {booking.holdType && (
            <p>
              <strong>Hold Type:</strong>{" "}
              <OverlayTrigger
                overlay={
                  <Tooltip id="tooltip-hold-duration">
                    Hold Duration: {booking.holdDuration || "Not specified"}
                  </Tooltip>
                }
              >
                <span
                  className={`badge ${booking.holdType === "On Hold"
                    ? "bg-secondary"
                    : booking.holdType === "Drop and Go"
                      ? "bg-info"
                      : "bg-secondary"
                    }`}
                >
                  {booking.holdType}
                </span>
              </OverlayTrigger>
            </p>
          )}

          {booking.status === "Approved" &&
            !booking.startingKM &&
            isToday(booking.startDate) && (
              <OverlayTrigger overlay={<Tooltip>Add starting kilometers for the trip.</Tooltip>} placement="top">
                <button
                  className="btn btn-outline-success w-100 mt-2"
                  onClick={() => onAddStartingKM(booking)}
                >
                  Add Starting KM
                </button>
              </OverlayTrigger>
            )}

          {booking.status === "Approved" &&
            booking.startingKM &&
            !booking.endKM && (
              <OverlayTrigger overlay={<Tooltip>Complete the trip details.</Tooltip>} placement="top">
                <button
                  className="btn btn-outline-primary w-100 mt-2"
                  onClick={() => onAddEndKM(booking)}
                >
                  Add Ending KM & Rating
                </button>
              </OverlayTrigger>
            )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;