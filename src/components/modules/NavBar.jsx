import React from "react";
import { Link } from "@reach/router";

import "../../utilities.css";
import "./NavBar.css";


class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="navbar-base">
        <div className="navbar-container">
          {this.props.userId ? (
            <>
              <div className="navbar-logo u-logo"> Minerva </div>
              <Link className="navbar-elm" to={"/"}> Home </Link>
              <Link className="navbar-elm" to={"/profile"}> Profile </Link>
              <button
                onClick={this.props.handleLogout}
                className="u-cute-button navbar-login"
              >Logout</button>
            </>
          ) : (
            <>
              <div className="navbar-logo"/>
              <button
                onClick={this.props.handleLogin}
                className="u-cute-button navbar-login"
              >Login with Google</button>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default NavBar;
