import React from 'react';

import NavBar from "./modules/NavBar.js";
import NotFound from "./pages/NotFound.jsx";

import { get, post } from "../utilities";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: null,
    };
  }

  componentDidMount() {

  }

  handleLogin = (res) => {
    get('/api/login').then((res) => {
      this.setState({
        userId: res.userId,
      });
    });
  };

  handleLogout = () => {
    this.setState({
      userId: null,
    });
    post('/api/logout');
  };

  render() {
    return (
      <>
        <NavBar
          handleLogin={this.handleLogin}
          handleLogout={this.handleLogout}
          userId={this.state.userId}
        />
        <NotFound />
      </>
    );
  }
}

export default App;
