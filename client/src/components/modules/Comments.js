import React from "react";
import "../../utilities.css";
import {get, post, handleEnter} from "../../utilities.js";
import "./Comments.css";
import AnnotationCard from "./Annotation.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class Comments extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <div className="comments-cont">
        <h3 className="comments-title">
            Comments
        </h3>
        {this.props.addCommentCard}
        {this.props.commentObjs.map((commentObj) => (
            <CommentCard 
            {...commentObj} 
            key={commentObj.id}
            toggleAnnotation = {() => {
              this.props.toggleAnnotation(commentObj.id);
            }}
            showHighlight = {this.props.annotationsShown.includes(commentObj.id)}
            />
        ))}
        </div>
    );
  }
}

class CommentCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ownerName: "",
    }
  }

  componentDidMount() {
    if(!this.props.ownerName){
      post('/api/user', {id: this.props.ownerId}).then((res) => {
        this.setState({ownerName: res.userName});
      });
    }
  }

  render() {
    return (
        <div className="u-greybox commentcard-cont">
          <div>
            <p className="commentcard-texts">
              <b>{this.props.ownerName || this.state.ownerName} |</b> {this.props.addCommentSuggestive||this.props.content}
            </p>
          </div>
          {this.props.addCommentButtons||(
            <AnnotationCard 
              backgroundColor={"red"} 
              text={this.props.annotationText||"Show Annotation"}
              annotationId={this.props.id}
              highlights={this.props.annotations}
              toggleAnnotation = {this.props.toggleAnnotation}
              showHighlight = {this.props.showHighlight}
              clickable={true}
            />
          )} 
        </div>
    );
  }
}


export class AddCommentCard extends React.Component {
  constructor(props) {
    super(props);
  }

  submitComment = (value) => {
    post("/api/addcomment", {
      ownerId: this.props.ownerId, 
      newsId: this.props.newsId, 
      content: value,
      annotations: [],
    }).then(() => {
      document.getElementById(this.props.componentId).value = "";
      this.props.refresh();
    });
  }

  render() {
    const addCommentSuggestive = (
      <input 
        id={this.props.componentId} 
        type="text" 
        placeholder="Write a comment..."
        className="addcomment-suggestive"
        onKeyUp={handleEnter(this.props.componentId, this.submitComment)}
      />
    )
    const addCommentButtons = (
      <div className="addcomment-buttons-cont">
        <button className="u-plain-button addcomment-button" style={{color: "#fdff38"}}><FontAwesomeIcon icon="highlighter"/></button>
        <button className="u-plain-button addcomment-button" 
        onClick={() => this.submitComment(document.getElementById(this.props.componentId).value)}>Post</button>
      </div>
    )
    return (
        <CommentCard 
        ownerName = {this.props.ownerName}
        addCommentSuggestive = {addCommentSuggestive}
        addCommentButtons = {addCommentButtons}
        />
    );
  }
}

export default Comments;
