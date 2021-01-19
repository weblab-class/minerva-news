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
    this.state = {
      tags: [],
    }
  }

  setTags = (tags) => {
    this.setState({tags:tags});
  };

  render() {
    if(!this.props.userId) {
      return (<div></div>);
    }
    return (
        <div className="home-container">
          {this.state.tags}
            <Collection setTags={this.setTags} userId={this.props.userId} collections={this.props.collections}/>
            <div className="home-middle">
              <TagSelection setTags={this.setTags}/>
              <Feed/>
            </div>
            <Summaries/>
        </div>
    );
  }
}

export default Home;
