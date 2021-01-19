import React from "react";
import { navigate, Router } from "@reach/router";

import NavBar from "./modules/NavBar.js";
import NotFound from "./pages/NotFound.js";
import Landing from "./pages/Landing.js";
import Home from "./pages/Home.js";

import { get, post} from "../utilities";

import "../utilities.css";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // user: (id, name, email, picture (url))
      userId: undefined,
      userCollections: {}
    };
  }

  componentDidMount() {
    get("/api/whoami").then((res) => {
      // they are registed in the database, and currently logged in.
      res = JSON.parse(res);
      if (res.id) {
        this.setState({
          userId: res.id,
          userCollections: res.collections
        });
      }
    });
  }

  handleLogin = (res) => {
    get('/api/login').then((res) => {
      navigate(res.request_uri);
    });
  };

  handleLogout = () => {
    this.setState({
      userId: undefined,
      userCollections: undefined
    });
    get("/api/logout").then((res) => {
      navigate('/landing');
        // reserve res for future use
    });
  };

  render() {
    return (
      <div>
        <NavBar
          handleLogin={this.handleLogin}
          handleLogout={this.handleLogout}
          userId={this.state.userId? this.state.userId : undefined}
        />
        <div>
          <Router>
            <NotFound default />
            <Landing path="/landing" handleLogin={this.handleLogin}/>
            <Home path="/:userId" collections={this.state.user ? this.state.user.collections : {}}/>
          </Router>
        </div>
      </div>
    );
  }
}

export default App;
