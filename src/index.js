// import Bootstrap css first to be overriden by custom css
import "bootstrap/dist/css/bootstrap.min.css"

import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App.jsx";

ReactDOM.render(<App />, document.getElementById("root"));

// allows for live updating
if (module.hot) {
  module.hot.accept();
}
