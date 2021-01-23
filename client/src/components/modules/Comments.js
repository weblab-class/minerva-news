import React from "react";
import "../../utilities.css";
import {get, post} from "../../utilities.js";
import "./Comments.css";

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
        <div>
        <div>
            Comments
        </div>
        {this.state.commentObjs.map((commentObj) => (
            <CommentCard commentObj = {commentObj} />
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
        <div>
        </div>
    );
  }
}

export default Comments;
