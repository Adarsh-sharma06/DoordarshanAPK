import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const AssignDriverModal = ({ show, onHide, drivers, onAssign }) => {
  const [selectedDriver, setSelectedDriver] = useState("");

  const handleAssign = () => {
    if (selectedDriver) {
      onAssign(selectedDriver);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Driver</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="driverSelection">
            <Form.Label>Select Driver</Form.Label>
            <Form.Control
              as="select"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
            >
              <option value="">--Select Driver--</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button className="orangeBtn" onClick={handleAssign}>
          Assign Driver
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignDriverModal;