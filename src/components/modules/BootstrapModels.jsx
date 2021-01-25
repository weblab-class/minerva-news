import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { handleEnter } from "../../utilities.js";

// Pass in id, placeholder, and a function postfunc as props
// postfunc is used to process the user entered text
export function InputModal(props) {
  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      backdrop="static"
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton/>
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
          const text = document.getElementById(props.id).value;
          this.props.postfunc(text);
        }}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
