import React from 'react';
import { Router, navigate } from "@reach/router";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHighlighter, faCheck } from '@fortawesome/free-solid-svg-icons'

import NavBar from "./modules/NavBar.jsx";
import Landing from "./pages/Landing.jsx"
import Home from "./pages/Home.jsx";
import Reading from "./pages/Reading.jsx";
import NotFound from "./pages/NotFound.jsx";
import { get, post } from "../utilities.js";

import "../utilities.css";
import "./App.css";


library.add(faHighlighter)


class App extends React.Component {
  constructor(props) {
    super(props);
    const retrieved = localStorage.getItem("userCollections");
    this.state = {
      userId: localStorage.getItem("userId"),
      userName: localStorage.getItem("userName"),
      userEmail: localStorage.getItem("userEmail"),
      userPicture: localStorage.getItem("userPicture"),
      userCollections: retrieved ? JSON.parse(retrieved) : [],
      loggingIn: localStorage.getItem("loggingIn"),
    };
  }

  componentDidMount() {
    if (!this.state.userId) {
      get('/api/whoami').then((res) => {
        if (res.id) {
          this.setState({
            userId: res.id,
            userName: res.name,
            userEmail: res.email,
            userPicture: res.picture,
            userCollections: res.collections,
          });
          localStorage.setItem("userId", res.id);
          localStorage.setItem("userName", res.name);
          localStorage.setItem("userEmail", res.email);
          localStorage.setItem("userPicture", res.picture);
          localStorage.setItem("userCollections", JSON.stringify(res.collections));
        }
      });
    }
  }

  handleLogin = (res) => {
    get('/api/login').then((res) => {
      localStorage.setItem("loggingIn", "YES"); //  'welcomes' redirect from server
      navigate(res.request_uri);
    });
  };

  handleLogout = () => {
    this.setState({
      userId: undefined,
      userName: undefined,
      userEmail: undefined,
      userPicture: undefined,
      userCollections: undefined,
      loggingIn: undefined,
    });
    localStorage.clear();
    post("/api/logout");
    navigate("/");
  };

  render() {
    console.log(this.state.loggingIn);
    return (
      <>
        <NavBar
          handleLogin={this.handleLogin}
          handleLogout={this.handleLogout}
          userId={this.state.userId}
          userName={this.state.userName}
          userEmail={this.state.userEmail}
          userPicture={this.state.userPicture}
        />
        <div className="app-full">
          <div className="app-page">
            {this.state.userId ? (
              <Router>
                <Home path="/" collections={this.state.userCollections} userId={this.state.userId}/>
                <Reading path="/reading/:newsId" userName={this.state.userName} userId={this.state.userId}/>
                <NotFound default />
              </Router>
            ):(
              <>
                { this.state.loggingIn ? (
                  <div/>
                ) : (
                  <Landing default handleLogin={this.handleLogin}/>
                )}
              </>
            )}
          </div>
        </div>
        <div className="app-background"/>
      </>
    );
  }
}

export default App;
