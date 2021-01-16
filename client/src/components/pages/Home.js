import React from "react";
import "./Home.css";
import "../../utilities.css";

import Collection from "../modules/Collection.js";

class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <div className="home-container">
            <Collection/>
            <div className="home-middle">
              <TagSelection/>
              <Feed/>
            </div>
            <Summaries/>
        </div>
    );
  }
}

export default Home;
