import React from "react";
import "../../utilities.css";
import { FeedCard } from "../modules/Feed.js";
import { get, post } from "../../utilities";
import "./Reading.css";
import Comments from "../modules/Comments.js";
import NotFound from "./NotFound";

class Reading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        newsObj: null
    }
    this.annotationSets = [
        {text: "Incorrect Facts", backgroundColor: "red"}, 
        {text: "Strong Sentiment", backgroundColor: "blue"},
    ]
  }

  componentDidMount() {
      post("/api/news", {newsIds: [this.props.newsId]}).then((newsObjs) => {
        this.setState({newsObj: newsObjs[0]})
      });
  }

  render() {
    return (this.state.newsObj?(
        <div className="reading-cont">
            <FeedCard newsObj={this.state.newsObj} expanded={true}/>
            <div className="reading-sidebar u-greybox">
                <div className="reading-system-ann u-greybox">
                    {this.annotationSets.map((annotation, i) => (<AnnotationCard {...annotation} key = {i}/>))}
                </div>
                <Comments />
            </div>
        </div>
    ):(
        <NotFound />
    ));
  }
}

export class AnnotationCard extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
      return (
          <div className="reading-ann-cont">
              <div className="reading-ann-box" style={{backgroundColor: this.props.backgroundColor}}/>
              <div className="reading-ann-text">
                  {this.props.text}
              </div>
          </div>
      );
    }
  }

export default Reading;
