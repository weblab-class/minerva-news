import React from "react";
import "./Home.css";
import "../../utilities.css";

import Collections from "../modules/Collections.jsx";
import Summaries from "../modules/Summaries.jsx";
import Feed from "../modules/Feed.jsx";
import TagSelection from "../modules/TagSelection.jsx";
import NotFound from "./NotFound.jsx";

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
    return (this.props.userId == this.props.authenticatedId)?(
      <div className="home-container">
        <Collections setTags={this.setTags} userId={this.props.userId} collections={this.props.collections}/>
        <div className="home-middle">
          <TagSelection setTags={this.setTags}/>
          <Feed tags={this.state.tags}/>
        </div>
        <Summaries/>
      </div>
    ):(
      <NotFound />
    );
  }
}

export default Home;
