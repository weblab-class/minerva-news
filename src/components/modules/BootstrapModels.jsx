import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Container, Row, Col } from 'react-bootstrap';

/*
Usage:
  const [show, setshow] = React.useState(false);
  return (
    <>
      <button onClick={() => setshow(true)}> Trigger/Replace with highlight mouse up</button>
      <InputModal
        show={show}
        setshow={setshow}
        id="unique_id"
        placeholder="Type your comment here"
        rows="6"
        postfunc = {(text) => { console.log(text); }}
      />
    </>
  );
*/

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
      <Modal.Header closeButton>
        <Modal.Title>{props.heading}</Modal.Title>
      </Modal.Header>
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


/*
Usage:
  const text = "Instructions Text";
  return (
    <InfoModalButton
      text = text
    />
  );
*/

export function InfoModalIcon(props) {
  const [show, setshow] = React.useState(false);
  return (
    <>
    <button
      style={{gridArea: "icon"}}
      type="button"
      className="btn btn-link"
      onClick={() => setshow(true)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="17.5" height="17.5" fill="black" className="bi bi-question-circle-fill">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z"/>
      </svg>
    </button>
    <Modal
      show={show}
      onHide={() => setshow(false)}
      backdrop="static"
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{props.heading}</Modal.Title>
      </Modal.Header>
      <Modal.Body> {props.text} </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={() => setshow(false)}>
          Ok got it!
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
}


export function ProfileModal(props) {
  const style = {
    display: 'flex',
    padding: '0 0 0 10px',
  };
  return (
    <Modal
      show={props.show}
      onHide={() => props.setshow(false)}
      aria-labelledby="contained-modal-title-vcenter"
      size="md"
    >
      <Modal.Header closeButton>
        <Modal.Title>Me</Modal.Title>
      </Modal.Header>
      <Modal.Body className="show-grid">
        <Container>
          <Row>
            <Col xs={3} md={3}>
              <img src={props.userPicture}/>
            </Col>
            <Col xs={9} md={9}>
              <b>Name</b>: {props.userName} <br></br> <b>User Email</b>: {props.userEmail}
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  )
}
