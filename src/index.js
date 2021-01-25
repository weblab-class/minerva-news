// import Bootstrap css first to be overriden by custom css
import "bootstrap/dist/css/bootstrap.min.css"

import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App.jsx";

ReactDOM.render(<App />, document.getElementById("root"));

/*
import { InputModal } from "./components/modules/BootstrapModels.jsx"

function Playground() {
  const [show, setshow] = React.useState(false);
  return (
    <>
    <button onClick={() => setshow(true)}>Trigger/Replace with highlight mouse up</button>
    <InputModal
      show={show}
      setshow={setshow}
      id="unique_id"
      placeholder="Type your comment here"
      rows="6"
      postfunc = {(text) => {
        console.log(text);
      }}
    />
    </>
  )
}

ReactDOM.render(<Playground/>, document.getElementById("root"));
*/

// allows for live updating
if (module.hot) {
  module.hot.accept();
}
