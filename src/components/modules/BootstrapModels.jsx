import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { handleEnter } from "../../utilities";

import "bootstrap/dist/css/bootstrap.min.css";


export function InputModalButton(unique_id, placeholder_text) {
  const [show, setShow] = React.useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setShow(true)}>
        Add Collection
      </Button>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        backdrop="static"
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Collection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            id={unique_id}
            type="text"
            placeholder={placeholder_text}
            className=""
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {
            setShow(false);
            const text = document.getElementById(unique_id).value;
          }}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
