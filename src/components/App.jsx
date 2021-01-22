import React from 'react';
import { Router, navigate } from "@reach/router";

import NavBar from "./modules/NavBar.jsx";
import Landing from "./pages/Landing.jsx"
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";
import { get, post } from "../utilities.js";

class App extends React.Component {
  constructor(props) {
    super(props);
    const retrieved = localStorage.getItem("userCollections");
    this.state = {
      userId: localStorage.getItem("userId"),
      userCollections: (retrieved == "undefined") ? [] : JSON.parse(retrieved)
    };
  }

  componentDidMount() {
    get('/api/whoami')
      .then((res) => {
        if (res.id) {
          this.setState({
            userId: res.id,
            userCollections: res.collections
          });
          localStorage.setItem("userId", res.id);
          localStorage.setItem("userCollections", JSON.stringify(res.collections));
          return res.id
        }
        return '';
      }).then((id) => {
        navigate('/' + id);
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
    localStorage.clear();
    post("/api/logout");
    navigate("/");
  };

  render() {
    return (
      <>
        <NavBar
          handleLogin={this.handleLogin}
          handleLogout={this.handleLogout}
          userId={this.state.userId}
        />
        <div>
          <Router>
            <Landing path="/" handleLogin={this.handleLogin}/>
            <Home path="/:userId" collections={this.state.userCollections}/>
            <NotFound default />
          </Router>
        </div>
      </>
    );
  }
}

export default App;
