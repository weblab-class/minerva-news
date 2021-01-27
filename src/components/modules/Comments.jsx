import React from "react";
import AnnotationCard from "./Annotation.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {get, post, submitOnEnter} from "../../utilities.js";
import {InfoModalIcon} from "./BootstrapModels.jsx";

import "../../utilities.css";
import "./Comments.css";

class Comments extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="comments-cont">
        <div className="u-title-with-icon">
          <h3 className="comments-title" style={{gridArea:"title"}}>
            Annotations
          </h3>
          <InfoModalIcon 
              heading="View Annotations"
              text={(
                <>
                  The Annotations posted by other users will display here. You can view the are highlighed by the comment
                  by clicking on it. Clicking anywhere else to deselect the comment and remove the highlight.
                </>
              )}
            />
        </div>
        {this.props.commentObjs.map((commentObj, index) => (
          <CommentCard
            {...commentObj}
            ownerName = {this.props.commentOwnerNames[index]}
            key={commentObj.id}
            toggleAnnotation = {(e) => {
              e.stopPropagation();
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

  render() {
    return (
      <div 
        className="u-greybox commentcard-cont u-button u-card" 
        onClick={this.props.toggleAnnotation}
        style={this.props.showHighlight?{
          borderColor: "#9ecaed",
          boxShadow: "0 0 10px #9ecaed"
        }:{}}
      >
        <div>
          <p className="commentcard-texts">
            <b>{this.props.ownerName || this.state.ownerName} |</b> {this.props.addCommentSuggestive||this.props.content}
          </p>
        </div> {
          this.props.addCommentButtons || (
          <></>
        )}
      </div>
    );
  }
}

/*
{this.props.addCommentCard}
export class AddCommentCard extends React.Component {
  constructor(props) {
    super(props);
  }

  submitComment = (value) => {
    console.log(this.props.currentHighlights)
    post("/api/addcomment", {
      ownerId: this.props.ownerId,
      newsId: this.props.newsId,
      content: value,
      annotations: this.props.currentHighlights,
    }).then(() => {
      document.getElementById(this.props.componentId).value = "";
      this.props.submitComment();
    });
  }

  render() {
    const addCommentSuggestive = (
      <input
        id={this.props.componentId}
        type="text"
        placeholder="Write a comment..."
        className="addcomment-suggestive"
        onKeyUp={submitOnEnter(this.props.componentId, this.submitComment)}
      />
    )
    const addCommentButtons = (
      <div className="addcomment-buttons-cont">
        <button
          className="u-plain-button addcomment-button"
          style={this.props.highlightMode?({color: "#fdff38"}):({})}
          onClick={this.props.toggleHighlight}
          >
          <FontAwesomeIcon icon="highlighter"/>
        </button>
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
}*/

export default Comments;

/*
         <AnnotationCard
            backgroundColor={"red"}
            text={this.props.annotationText || "Show Annotation"}
            annotationId={this.props.id}
            highlights={this.props.annotations}
            toggleAnnotation = {this.props.toggleAnnotation}
            showHighlight = {this.props.showHighlight}
            clickable={true}*/