import React, { Component } from "react";
import { render } from "react-dom";
import { Router, Link } from "@reach/router";

import "./navbar.css";

class Navbar extends Component {
    constructor(props) {
      super(props);
    }
  
    componentDidMount() {
      // remember -- api calls go here!
    }
  
    render() {
      return (
        <>
            <nav className="navbar-container">
                <div className="navbar-elt navbar-logo">
                    Minerva
                </div>
                <Link className="navbar-elt" to="/">Home</Link>
                <Link className="navbar-elt" to="/profile">Profile</Link>
            </nav>    
        </>
      );
    }
  }
  
  export default Navbar;