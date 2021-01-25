import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

// Pass in id, placeholder, and a function postfunc as props
// postfunc is used to process the user entered text
export function InputModal(props) {
  return (
    <Modal
      show={props.show}
      onHide={() => props.setshow(false)}
      backdrop="static"
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton/>
      <Modal.Body>
        <div className="input-group">
          <textarea
            id={props.id}
            placeholder={props.placeholder}
            className="form-control"
            rows={props.rows}
          >
          </textarea>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" onClick={() => {
          props.setshow(false);
          const text = document.getElementById(props.id).value;
          props.postfunc(text);
        }}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
