import React from "react";
import { navigate, Router } from "@reach/router";

import NavBar from "./modules/NavBar.js";
import NotFound from "./pages/NotFound.js";
import Landing from "./pages/Landing.js";
import Home from "./pages/Home.js";

import { get, post} from "../utilities";

import "../utilities.css";
import "./App.css";


function attemptLoadUser(app, postFunc) {
  get("/api/whoami").then((res) => {
    // they are registed in the database, and currently logged in.
    res = JSON.parse(res);
    if (res.id) {
      app.setState({
        userId: res.id,
        userCollections: res.collections
      });
      localStorage.setItem("userId", res.id);
      localStorage.setItem("userCollections", JSON.stringify(res.collections));
    }
    postFunc();
  });
}


function checkUserLoaded(app, popup) {
  if (app.state.userId) {
    popup.close();
    navigate(`/${app.state.userId}`);
    return true;
  }
  return false;
}


function cycleAttemptLoadUser(app, popup, delay, iter, maxIters) {
  //console.log(iter);
  setTimeout(() => {
    attemptLoadUser(app, () => {
      if (iter > maxIters) {
        alert("Please retry and accept terms of service!");
        return;
      }
      if (!checkUserLoaded(app, popup)) {
        cycleAttemptLoadUser(app, popup, delay, iter + 1, maxIters);
      }
    });
  }, delay);
}


class App extends React.Component {
  constructor(props) {
    super(props);
    console.log("llllllllll");
    this.state = {
      userId: localStorage.getItem("userId"),
      userCollections: JSON.parse(localStorage.getItem("userCollections"))
    };
    console.log(this.state);
  }

  componentDidMount() {
    attemptLoadUser(this, () => {});
  }

  handleLogin = (res) => {
    const app = this;
    const LOAD_DELAY = 3000; // milliseconds
    const WAIT_DELAY = 5000;
    get('/api/login').then((res) => {
      let popup = window.open(res.request_uri,
                              'Authentication',
                              'width=600,height=600,left=300,top=100');
      setTimeout(() => {
        attemptLoadUser(app, () => {
          if (!checkUserLoaded(app, popup)) {
            // wait for user to accept terms of service
            cycleAttemptLoadUser(app, popup, WAIT_DELAY, 1, 5);
          }
        });
      }, LOAD_DELAY);
    });
  };

  handleLogout = () => {
    this.setState({
      userId: undefined,
      userCollections: undefined
    });
    //console.log(this);
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
            <Home path="/:userId" collections={this.state.userCollections}/>
          </Router>
        </div>
      </div>
    );
  }
}

export default App;
