import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App.jsx";

import { InputModalButton } from "./components/modules/BootstrapModels.jsx";

// renders React Component "Root" into the DOM element with ID "root"
ReactDOM.render(<App />, document.getElementById("root"));

// Playground for testing indvidual features
// ReactDOM.render(<InputModalButton unique_id="asd" placeholder_text="TETTE"/>, document.getElementById("root"));

// allows for live updating
if (module.hot) {
  module.hot.accept();
}
