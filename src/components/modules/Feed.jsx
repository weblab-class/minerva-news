import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import parse from "html-react-parser";
import { navigate } from "@reach/router";
import { get, post } from "../../utilities.js";

import "../../utilities.css";
import "./Feed.css"

const NUM_ARTICLES = 25;

class Feed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newsIds: [],
      newsObjs: [], // news items already loaded
      hasMore: true,
    };
  }

  update_newsObjs = () => {
    if (this.props.tags[0] == "reload_delay_hack") {
      return;
    }
    post("/api/feed", {tags: this.props.tags}).then((newsIds) => {
      this.setState({newsIds:newsIds});
      post("/api/news", {"newsIds": newsIds.slice(0, Math.min(NUM_ARTICLES, newsIds.length))}).then((newsObjs) => {
        this.setState({newsObjs: newsObjs});
        this.props.setFeedLoaded();
      });
    });
  }

  componentDidMount() {
    this.update_newsObjs();
  }

  componentDidUpdate(prevProps) {
    if(prevProps.tags !== this.props.tags) {
      this.setState({hasMore: true});
      this.update_newsObjs();
    }
  }

  fetchMoreNews = () => {
    const tot_length = this.state.newsIds.length;
    const cur_length = this.state.newsObjs.length;
    if (cur_length == tot_length) {
      this.setState({hasMore: false});
    } else {
      post('/api/news', {"newsIds": this.state.newsIds.slice(cur_length, Math.min(cur_length + NUM_ARTICLES, tot_length))}).then((newsObjs) => {
        this.setState({newsObjs: this.state.newsObjs.concat(newsObjs)});
      });
    }
  }

  render() {
    return (
      <div className="feed-box u-greybox">
        {this.props.feedLoading?(<p></p>):
          this.state.newsIds.length ? (
            <InfiniteScroll
              dataLength={this.state.newsObjs.length}
              next={this.fetchMoreNews}
              hasMore={this.state.hasMore}
              loader={<h4></h4>}
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
            <>
              {(this.props.tags.length)? (
                <p style={{ textAlign: "center" }}>
                  <b>No matching news found. Try with less tags</b>
                </p>
              ):(
                <p></p>
              )}
            </>
        )}
      </div>
    );
    return ret_html;
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
      this.setState({highlighted_text: this.add_linebreaks(this.props.newsObj.body_text)});
    }
    else{
      const text = this.add_linebreaks(this.props.newsObj.body_text);
      var all_slices = []
      const text_chunks = text.split("</div>").slice(0, -1)
      var last_index = 0
      var last_chunk_index = 0
      this.props.annotations[0].forEach((highLightObj, index) => {
        const color = highLightObj.color;
        console.log(highLightObj.color)
        text_chunks.slice(last_chunk_index, highLightObj.start[0]).forEach((chunk) => {
          all_slices.push(chunk + "</div>")
        });
        if(highLightObj.start[0] == highLightObj.end[0]){
          var chunk = text_chunks[highLightObj.start[0]];
          var offset = `<div id=reading-para-${highLightObj.start[0].toString()}>`.length;
          all_slices = all_slices.concat(this.add_span(chunk, highLightObj.start[1], highLightObj.end[1], color, offset));
          console.log(JSON.parse(JSON.stringify(all_slices)))
        }else{
          var chunk_s = text_chunks[highLightObj.start[0]];
          var offset = `<div id=reading-para-${highLightObj.start[0].toString()}>`.length;
          all_slices = all_slices.concat(this.add_span(chunk_s, highLightObj.start[1] + offset, null, color, 0))
          text_chunks.slice(highLightObj.start[0] + 1, highLightObj.end[0]).forEach((chunk, index) => {
            var offset = `<div id=reading-para-${(highLightObj.start[0] + index + 1).toString()}>`.length;
            all_slices = all_slices.concat(this.add_span(chunk, offset, null, color, 0))
          })
          var chunk_e = text_chunks[highLightObj.end[0]];
          offset = `<div id=reading-para-${highLightObj.end[0].toString()}>`.length;
          all_slices = all_slices.concat(this.add_span(chunk_e, 0, highLightObj.end[1], color, offset))
        }
        last_chunk_index = highLightObj.end[0] + 1
      });
      text_chunks.slice(last_chunk_index).forEach((chunk) => {
        all_slices.push(chunk + "</div>")
      });
      console.log(all_slices)
      this.setState({highlighted_text: (all_slices).join("")});
    }
  }

  add_span = (text, start, end, style, offset) => {
    if(end === null){
      end = text.length - offset
    }
    var all_slices = []
    all_slices.push(text.slice(0, start+offset));
    all_slices.push(`<span style="backgroundColor:${style};">`);
    all_slices.push(text.slice(start+offset, end+offset));
    all_slices.push("</span>");
    all_slices.push(text.slice(end+offset))
    all_slices.push("</div>")
    console.log(JSON.parse(JSON.stringify(all_slices)))
    return all_slices
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

  doNothing = () => {}

  add_linebreaks = (text) => {
    var text_chunks = text.split("\n");
    var all_slices = []
    text_chunks.forEach((para, index) => {
      all_slices.push(`<div id=reading-para-${index.toString()}>`)
      all_slices.push(para)
      all_slices.push("</div>")
    });
    return all_slices.join("");
  }

  text_to_el = (text) => {
    return this.props.highlightMode?parse(
      `<div
          id=reading-body
          class=feedcard-content
        >
        ${text}
      </div>`
    ):(
      <div onMouseUp={this.props.onMouseUp} onMouseDown={this.props.deselectAnnotations}>
      {parse(
        `<div id=reading-body class=feedcard-content>
          ${text}
        </div>`)}
      </div>
    )
  }

  componentDidUpdate(prevProps) {
    if(prevProps.annotations != this.props.annotations){
      this.apply_highlight();
    }
  }

  render() {
    return (
      <div
        className={`${this.props.expanded?"feedcard-exp-cont":"feedcard-cont"} u-greybox u-button u-card`}
        onClick={this.props.expanded?this.doNothing:this.read}
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

          </div>
          <div className="feedcard-commentbar-right">
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
