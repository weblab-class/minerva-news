import React, { Component } from "react";
import Navbar from "../modules/navbar.js"

class Home extends Component {
    constructor(props) {
      super(props);
    }
  
    componentDidMount() {
      // remember -- api calls go here!
    }
  
    render() {
      return (
        <>
            <Navbar></Navbar> 
        </>
      );
    }
  }
  
  export default Home;