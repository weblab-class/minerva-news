import React from "react";
import { Link } from "@reach/router";

import "./NavBar.css";
import "../../utilities.css";

class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="navbar-base">
        <div className="navbar-container">
          <div className="navbar-logo u-logo"> Minerva </div>
          <Link className="navbar-elm" to="/"> Home </Link>
          <Link className="navbar-elm" to="/profile"> Profile </Link>
        </div>
      </div>
    );
  }
}

export default NavBar;
