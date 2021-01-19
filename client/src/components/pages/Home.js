import React from "react";
import "./Home.css";
import "../../utilities.css";

import Collections from "../modules/Collection.js";
import Summaries from "../modules/Summaries.js";
import Feed from "../modules/Feed.js";
import TagSelection from "../modules/TagSelection.js";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: [],
    }
  }

  setTags = (tags) => {
    this.setState({tags: tags});
  };

  render() {
    return (
      <div className="home-container">
        <Collection setTags={this.setTags} userId={this.props.userId} collections={this.props.collections}/>
        <div className="home-middle">
          <TagSelection setTags={this.setTags}/>
          <Feed tags={this.state.tags}/>
        </div>
        <Summaries/>
      </div>
    );
  }
}

export default Home;
