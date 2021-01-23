import React from "react";
import "../../utilities.css";
import { FeedCard } from "../modules/Feed.js";
import { get, post } from "../../utilities";
import "./Reading.css";
import Comments from "../modules/Comments.js";
import NotFound from "./NotFound";
import AnnotationCard from "../modules/Annotation.js";
import { set } from "mongoose";

class Reading extends React.Component {
  constructor(props) {
    super(props);
    const systemComment = {
      id: "System Annotations",
      ownerName: "System",
      content: "System annotations helps you flag the parts of news which our fact checker has deemed problematic.",
      annotation: {
        id: "System Annotations",
        text: "Show System Annotations",
        highlight: [],
      },
    }
    this.state = {
        newsObj: null,
        annotationsShown: [],
        commentObjs: [systemComment],
    }
    this.defaultAnnotations = [
        {text: "Incorrect Facts", backgroundColor: "red"}, 
        {text: "Strong Sentiment", backgroundColor: "blue"},
    ]
  }

  remove_from_list = (list, el) => {
    const index = list.indexOf(el);
    return list.slice(0, index).concat(list.slice(index + 1));
  }

  toggleAnnotation = (annotationId) => {
    if(this.state.annotationsShown.includes(annotationId)){
      this.setState({annotationsShown: this.remove_from_list(this.state.annotationsShown, annotationId)});
    }
    else{
      this.setState({annotationsShown: [annotationId]})
      //this.setState({annotationsShown: this.state.annotationsShown.concat([annotationId])})
    }
  }

  componentDidMount() {
      post("/api/news", {newsIds: [this.props.newsId]}).then((newsObjs) => {
        this.setState({newsObj: newsObjs[0]})
      });
      post("/api/comments", {newsId: this.props.newsId}).then((commentObjs) => {
          this.setState({commentObjs: this.state.commentObjs.concat(commentObjs)});
      });
  }

  render() {
    return (this.state.newsObj?(
        <div className="reading-cont">
            <FeedCard newsObj={this.state.newsObj} expanded={true} annotations = {
              this.state.commentObjs.map((commentObj) => commentObj.annotation)
              .filter((annotationObj) => this.state.annotationsShown.includes(annotationObj.id))  
            }/>
            <div className="reading-sidebar u-greybox">
                <div className="reading-system-ann u-greybox">
                    {this.defaultAnnotations.map((annotation, i) => (
                    <AnnotationCard {...annotation} id = {`default${i}`} key = {i}/>
                    ))}
                </div>
                <Comments 
                  commentObjs = {this.state.commentObjs}
                  toggleAnnotation = {this.toggleAnnotation} 
                  annotationsShown = {this.state.annotationsShown}
                />
            </div>
        </div>
    ):(
        <NotFound />
    ));
  }
}

export default Reading;
