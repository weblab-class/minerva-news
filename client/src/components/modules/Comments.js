import React from "react";
import "../../utilities.css";
import {get, post} from "../../utilities.js";
import "./Comments.css";
import {AnnotationCard} from "../pages/Reading.js";

class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {commentObjs: []};
  }

  componentDidMount() {
    post("/api/comments", {newsId: this.props.newsId}).then((commentObjs) => {
        this.setState({commentObjs: commentObjs});
    });
  }

  render() {
    return (
        <div className="comments-cont">
        <h3 className="comments-title">
            Comments
        </h3>
        {this.state.commentObjs.map((commentObj) => (
            <CommentCard {...commentObj} />
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
          <div className="commentcard-cont">
            <p className="commentcard-texts">
              <b>{this.props.ownerName} |</b> {this.props.content}
            </p>
          </div>
          <AnnotationCard {...this.props.annotation} text="Show Annotation"/>
        </div>
    );
  }
}

export default Comments;
