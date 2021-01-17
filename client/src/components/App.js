import React from "react";
import { Router } from "@reach/router";

import NavBar from "./modules/NavBar.js";
import NotFound from "./pages/NotFound.js";
import Landing from "./pages/Landing.js";
import Home from "./pages/Home.js";

import { get, post } from "../utilities";

import "../utilities.css";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: undefined,
    };
  }

  componentDidMount() {
    get("/auth/whoami").then(user => {
      if (user.hasOwnProperty('id')) {
        // they are registed in the database, and currently logged in.
        this.setState({ userId: user.id });
      }
    });
  }

  /*
  handleLogin = (res) => {
    console.log(`Logged in as ${res.profileObj.name}`);
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      this.setState({ userId: user._id });
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  handleLogout = () => {
    this.setState({ userId: undefined });
    post("/api/logout");
  };*/

  render() {
    return (
      <div>
        <NavBar
          handleLogin={this.handleLogin}
          handleLogout={this.handleLogout}
          userId={this.state.userId}
        />
        <div>
          <Router>
            <Landing path="/landing"/>
            <Home path="/"/>
            <NotFound default />
          </Router>
        </div>
      </div>
    );
  }
}

export default App;
