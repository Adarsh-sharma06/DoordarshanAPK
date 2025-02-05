// DriverModal.js
import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const DriverModal = ({
  showDriverModal,
  setShowDriverModal,
  drivers,
  driverSelection,
  handleDriverSelection,
  handleAssignDriver,
}) => {
  return (
    <Modal show={showDriverModal} onHide={() => setShowDriverModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Driver</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6>Select a Driver:</h6>
        <Form.Control
          as="select"
          value={driverSelection || ""}
          onChange={(e) => handleDriverSelection(e.target.value)}
        >
          <option value="">--Select Driver--</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.name}
            </option>
          ))}
        </Form.Control>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDriverModal(false)}>
          Close
        </Button>
        <Button className="orangeBtn" onClick={handleAssignDriver}>
          Assign Driver
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DriverModal;