import React from "react";
import "./Landing.css";
import "../../utilities.css";

class Landing extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="landing-page">
        <div className="landing-box">
          <div className="landing-logo">Minerva</div>
          <div className="landing-desc">
            Using AI to revolutionize how we browse and <br></br> comprehend news
          </div>
          <div className="u-grow landing-button-cont">
            <button className="landing-start u-cute-button" onClick={this.props.handleLogin}>
              Start Reading
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;
