import React from 'react';

import NavBar from "./modules/NavBar.js";
import NotFound from "./pages/NotFound.jsx";


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

  };

  handleLogout = () => {

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
