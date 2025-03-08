import React from "react";
import { Modal, Button } from "react-bootstrap";

const DeleteBookingModal = ({ show, onHide, onDelete }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Booking</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete this booking?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button className="orangeBtn" onClick={onDelete}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteBookingModal;