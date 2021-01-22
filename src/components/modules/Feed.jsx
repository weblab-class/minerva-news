import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import {get, post} from "../../utilities.js";

import "./Feed.css"
import "../../utilities.css";

class Feed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newsids: [],
      newsObjs: [], // news items already loaded
      hasMore: true,
    };
  }

  update_newsObjs = () => {
    post("/api/feed", {tags: this.props.tags}).then((newsids) => {
      this.setState({newsids:newsids});
      post("/api/news", {"newsids": newsids.slice(0, Math.min(5, newsids.length))}).then((newsObjs) => {
        this.setState({newsObjs: newsObjs});
      });
    });
  }

  componentDidMount() {
    this.update_newsObjs();
  }

  componentDidUpdate(prevProps){
    if(prevProps.tags !== this.props.tags){
      this.update_newsObjs();
    }
  }

  fetchMoreNews = () => {
    const tot_length = this.state.newsids.length;
    const cur_length = this.state.newsObjs.length;
    if (cur_length == tot_length){
      this.setState({hasMore: false});
    } else {
      post('/api/news', {"newsids": this.state.newsids.slice(cur_length, Math.min(cur_length + 5, tot_length))}).then((newsObjs) => {
        this.setState({newsObjs: this.state.newsObjs.concat(newsObjs)});
      });
    }
  }

  render() {
    return (
      <div className="feed-box u-greybox">
        {this.state.newsids.length ? (
          <InfiniteScroll
            dataLength={this.state.newsObjs.length}
            next={this.fetchMoreNews}
            hasMore={this.state.hasMore}
            loader={<h4>Loading...</h4>}
            endMessage={
              <p style={{ textAlign: "center" }}>
                <b>Yay! You have seen it all</b>
              </p>
            }
          >{this.state.newsObjs.map((newsObj, index) => (
            <FeedCard newsObj={newsObj} key={index}/>
          ))}
          </InfiniteScroll>
        ):(
          <p style={{ textAlign: "center" }}>
            <b>No matching news found. Try with less tags</b>
          </p>
        )}
      </div>
    );
  }
}


class FeedCard extends React.Component {
  constructor(props) {
    super(props);
  }

  sliceContent = (text) => {
    return text.slice(0, text.slice(0, 400).lastIndexOf(' '));
  }

  render() {
    return (
      <div className="feedcard-cont u-greybox">
        <div className="feedcard-src">
          {this.props.newsObj.source}
        </div>
        <div className="feedcard-title">
          {this.props.newsObj.title}
        </div>
        <div className="feedcard-content">
          {this.sliceContent(this.props.newsObj.content)} ...
        </div>
        <div className="feedcard-commentbar u-greybox">
          <div className="feedcard-counts">
            {this.props.newsObj.upvotes} upvotes
          </div>
          <div className="feedcard-commentbar-right">
            <div className="feedcard-counts feedcard-comments">
              {this.props.newsObj.numComments} comments
            </div>
            <div className="feedcard-counts">
              {this.props.newsObj.numAnnotations} annotations
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Feed;
