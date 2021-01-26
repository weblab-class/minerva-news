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
        <UserInfo userName={this.props.userName} userPicture={this.props.userPicture}/>
      </div>
    );
  }
}


class UserInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    return (
      <>
      <div className="userinfo-container">
        <img src={this.props.userPicture}/>
        <b>{this.props.userName}</b>
      </div>
      </>
    );
  }

}

export default Profile;
