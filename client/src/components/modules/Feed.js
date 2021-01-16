import React from "react";
import "../../utilities.css";
import {get} from "../../utilities.js";

class Feed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      feeds: [],
    };
  }

  componentDidMount() {
    get("/api/feeds").then((feedObjs) =>{
        this.setState({feeds:feedObjs});
    });
  }

  render() {
    return (
        <div className="feed-box u-greybox">
          feed
            <div className="u-vert-list">
                {
                    this.state.feeds.map((feedObj) => (
                        <FeedCard/>
                    ))
                }
            </div>
        </div>
    );
  }
}

class FeedCard extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
      return <></>;
    }
}

export default Feed;
