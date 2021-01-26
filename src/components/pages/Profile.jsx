import React from "react";
import { get, post } from "../../utilities.js";

import "../../utilities.css";
import "./Profile.css";

class Profile extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="u-page-container">
        <UserInfo />
      </div>
    );
  }
}


class UserInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    post('/api/whoami')
  }

  render() {
    return (
      <div className="userinfo-container">
        Text that is good tea
      </div>
    );
  }

}

export default Profile;
