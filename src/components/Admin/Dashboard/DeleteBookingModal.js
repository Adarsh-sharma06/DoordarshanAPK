import React from "react";
import { Modal, Button } from "react-bootstrap";

const DeleteBookingModal = ({ showDeleteModal, setShowDeleteModal, deleteBooking }) => {
  return (
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Booking</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete this booking?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
          Cancel
        </Button>
        <Button className="orangeBtn" onClick={deleteBooking}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteBookingModal;