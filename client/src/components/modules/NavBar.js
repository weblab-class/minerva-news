import React from "react";
import { Link } from "@reach/router";

import "./NavBar.css";

class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="navbar-base">
        <nav className='navbar-container'>
          <div className="navbar-elm navbar-logo"> Minerva </div>
          <Link className="navbar-elm" to="/">Home</Link>
          <Link className="navbar-elm" to="/profile">Profile</Link>
        </nav>
      </div>
    );
  }
}

export default NavBar;
