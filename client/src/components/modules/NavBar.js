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
          {this.props.userId ? (
            <>
              <Link className="navbar-elm" to="/"> Home </Link>
              <Link className="navbar-elm" to="/profile"> Profile </Link>
              <button
                onClick={this.props.handleLogout}
                className="u-cute-button navbar-login"
              >Logout</button>
            </>
          ) : (
            <button
              buttonText="Login"
              onClick={this.props.handleLogin}
              className="u-cute-button navbar-login"
            >Login with Google</button>
          )}
        </div>
      </div>
    );
  }
}

export default NavBar;
