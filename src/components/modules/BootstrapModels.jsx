import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { handleEnter } from "../../utilities.js";


export function InputModalButton(props) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="bootstrap-iso">
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
          <div class="input-group">
            <textarea
              {...props}
              className="form-control"
              rows="3"
            >
            </textarea>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {
            setShow(false);
            const text = document.getElementById(props.unique_id).value;
          }}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
