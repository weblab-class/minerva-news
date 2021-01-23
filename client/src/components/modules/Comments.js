import React from "react";
import "../../utilities.css";
import {get, post} from "../../utilities.js";
import "./Comments.css";
import AnnotationCard from "./Annotation.js";

class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {commentObjs: [{
      id: "System Annotations",
      ownerName: "System",
      content: "System annotations helps you flag the parts of news which our fact checker has deemed problematic.",
      annotation: {
        id: "System Annotations",
        text: "Show System Annotations"
      }
    }]};
  }

  componentDidMount() {
    post("/api/comments", {newsId: this.props.newsId}).then((commentObjs) => {
        this.setState({commentObjs: this.state.commentObjs.concat(commentObjs)});
    });
  }

  render() {
    return (
        <div className="comments-cont">
        <h3 className="comments-title">
            Comments
        </h3>
        {this.state.commentObjs.map((commentObj) => (
            <CommentCard 
            {...commentObj} 
            key={commentObj.id}
            toggleAnnotation = {() => {
              this.props.toggleAnnotation(commentObj.annotation.id);
            }}
            showHighlight = {this.props.annotationsShown.includes(commentObj.annotation.id)}
            />
        ))}
        </div>
    );
  }
}

class CommentCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <div className="u-greybox commentcard-cont">
          <div>
            <p className="commentcard-texts">
              <b>{this.props.ownerName} |</b> {this.props.content}
            </p>
          </div>
          <AnnotationCard 
            backgroundColor={"red"} 
            text="Show Annotation" 
            {...this.props.annotation}
            toggleAnnotation = {this.props.toggleAnnotation}
            showHighlight = {this.props.showHighlight}
            clickable={true}
          />
        </div>
    );
  }
}

export default Comments;
