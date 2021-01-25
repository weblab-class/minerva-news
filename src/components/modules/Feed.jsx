import React from "react";
import "../../utilities.css";
import "./Feed.css"
import {get, post} from "../../utilities.js";
import InfiniteScroll from "react-infinite-scroll-component";
import { navigate } from "@reach/router";
import parse from "html-react-parser";

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
      post("/api/news", {"newsIds": newsids.slice(0, Math.min(5, newsids.length))}).then((newsObjs) => {
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
    } else{
      post('/api/news', {"newsIds": this.state.newsids.slice(cur_length, Math.min(cur_length + 5, tot_length))}).then((newsObjs) => {
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
            <FeedCard newsObj={newsObj} expanded={false} key={index}/>
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


export class FeedCard extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      highlighted_text: props.newsObj.body_text,
      //spanEndpoints: this.recalculateSpanEndpoints(props.annotations),
    };
  }

/*
  recalculateSpanEndpoints = (annotationObjs) => {
    
  }*/

  apply_highlight = () => {
    if(!this.props.annotations.length){
      this.setState({highlighted_text: this.props.newsObj.body_text});
    }
    else{
      const text = this.props.newsObj.body_text;
      var all_slices = []
      var last_index = 0
      this.props.annotations[0].forEach((highLightObj, index) => {
        console.log(highLightObj)
        all_slices.push(text.slice(last_index, highLightObj.start));
        all_slices.push(`<span style="backgroundColor:${highLightObj.color};">`);
        all_slices.push(text.slice(highLightObj.start, highLightObj.end));
        all_slices.push("</span>");
        last_index = highLightObj.end;
      });
      console.log(JSON.parse(JSON.stringify(all_slices)))
      all_slices.push(text.slice(last_index));
      this.setState({highlighted_text: (all_slices).join("")});
    }
  }

  sliceContent = (text) => {
    return this.props.expanded?this.state.highlighted_text:text.slice(0, text.slice(0, 400).lastIndexOf(' ')) + " ...";
  };

  read = () => {
    navigate(`/reading/${this.props.newsObj.id}`)
  };

  colorToLogPassthru = (colorName) => {
    const body_style = getComputedStyle(document.body);
    const colorHex = body_style.getPropertyValue(`--${colorName}`).substr(2);
    return ([1,3,5].map((i) => {
      return Math.log(parseInt(colorHex.substr(i, 2), 16)) - Math.log(255);
    }));
  };

  text_to_el = (text) => {
    var vw = window.innerWidth;
    return parse(this.props.highlightMode?(
      `<p
          id=reading-body
          class=feedcard-highlight-content
        >
        ${text}
      </p>`
    ):(
      `<p id=reading-body class=feedcard-content>
        ${text}
      </p>`
    ));
  }
      
  componentDidUpdate(prevProps) {
    if(prevProps.annotations != this.props.annotations){
      this.apply_highlight();
    }
  }

  render() {
    return (
      <div 
        className={`${this.props.expanded?"feedcard-exp-cont":"feedcard-cont"} u-greybox u-button`} 
        onClick={this.read}
      >
        <h3 className="feedcard-src">
          {this.props.newsObj.source}
        </h3>
        <h2>
          {this.props.newsObj.title}
        </h2>
        {this.text_to_el(this.sliceContent(this.props.newsObj.body_text))}
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