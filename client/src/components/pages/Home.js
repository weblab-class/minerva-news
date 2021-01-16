import React from "react";
import "./Home.css";
import "../../utilities.css";

import Collection from "../modules/Collection.js";
import Summaries from "../modules/Summaries.js";
import Feed from "../modules/Feed.js";
import TagSelection from "../modules/TagSelection.js";

class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <div className="home-container">
          {this.props.tags}
            <Collection setTags={this.props.setTags}/>
            <div className="home-middle">
              <TagSelection setTags={this.props.setTags}/>
              <Feed/>
            </div>
            <Summaries/>
        </div>
    );
  }
}

export default Home;
