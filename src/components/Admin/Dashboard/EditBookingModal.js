// EditBookingModal.js
import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const EditBookingModal = ({
  showEditModal,
  setShowEditModal,
  selectedBooking,
  setSelectedBooking,
  handleSaveEdit,
}) => {
  return (
    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Booking</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="editAim">
            <Form.Label>Aim</Form.Label>
            <Form.Control
              type="text"
              value={selectedBooking?.aim || ""}
              onChange={(e) => setSelectedBooking({ ...selectedBooking, aim: e.target.value })}
            />
          </Form.Group>

          <Form.Group controlId="editDestination">
            <Form.Label>Destination</Form.Label>
            <Form.Control
              type="text"
              value={selectedBooking?.destination || ""}
              onChange={(e) => setSelectedBooking({ ...selectedBooking, destination: e.target.value })}
            />
          </Form.Group>

          <Form.Group controlId="editStatus">
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              value={selectedBooking?.status || ""}
              onChange={(e) => setSelectedBooking({ ...selectedBooking, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
          Close
        </Button>
        <Button className="orangeBtn" onClick={handleSaveEdit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditBookingModal;