import React from "react";
import { FeedCard } from "../modules/Feed.jsx";
import Comments, {AddCommentCard} from "../modules/Comments.jsx";
import NotFound from "./NotFound";
import AnnotationCard from "../modules/Annotation.jsx";
import { navigate } from "@reach/router";
import { get, post } from "../../utilities";
import {InputModal, InfoModalIcon} from "../modules/BootstrapModels.jsx";

import "../../utilities.css";
import "./Reading.css";
import { parse } from "@babel/core";

class Reading extends React.Component {
  constructor(props) {
    super(props);
    const systemComment = {
      id: "System Annotations",
      ownerName: "System",
      content: "System annotations helps you flag the parts of news which our fact checker has deemed problematic.",
      annotations: [],
      annotationText: "Show System Annotations",
    }
    this.state = {
        newsObj: null,
        annotationsShown: [],
        systemComment: systemComment,
        commentObjs: [systemComment],
        commentOwnerNames: ["System"],
        highlightMode: false,
        currentHighlights: [],
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

  toggleAnnotation = (commentId) => {
    if (this.state.annotationsShown.includes(commentId)) {
      this.setState({annotationsShown: this.remove_from_list(this.state.annotationsShown, commentId)});
    }
    else {
      this.setState({annotationsShown: [commentId]});
      //this.setState({annotationsShown: this.state.annotationsShown.concat([annotationId])})
    }
  }

  deselectAnnotations = () => {
    this.setState({annotationsShown: []})
  }

  onMouseUp = (e) => {
    e.stopPropagation();
    const parserOffset = 11; //react-html-parser introduces an offset of 11, will switch to a different method in constructing span in the future
    console.log("mouse released");
    if(window.getSelection){
      const sel = window.getSelection();
      console.log(sel.anchorNode.parentElement)
      console.log(sel.focusNode.parentElement)
      if(sel.anchorNode.parentElement && sel.anchorNode.parentElement.id == "reading-body"
          && sel.focusNode.parentElement && sel.anchorNode.parentElement.id == "reading-body"){
        const offsets = [sel.anchorOffset, sel.focusOffset];
        console.log(offsets.sort((a,b) => a-b));
        if(offsets[0] !== offsets[1]){
          this.setState({currentHighlights: [{
            start: offsets[0] - parserOffset,
            end: offsets[1] - parserOffset,
            color: "yellow",
          }]}); /* for now we only restrict one span per highlight,
          can easily add more using concat(), but need to implement a binary search to remove duplicates*/
          this.setState({highlightMode: true});
        }
      }
    }
  }

  setHighlightMode = (bool) => {
    this.setState({highlightMode: bool});
  }

  refresh_comments = () => {
    post("/api/comments", {newsId: this.props.newsId}).then((commentObjs) => {
      this.setState({commentObjs: [this.state.systemComment].concat(commentObjs)});
      return post('/api/user', {ids: commentObjs.map(commentObj => commentObj.ownerId)});
    }).then((res) => {
      this.setState({commentOwnerNames: ['system'].concat(res.map(userObj => userObj.userName))});
    });
  }

  submitComment = (text) => {
    post("/api/addcomment", {
      ownerId: this.props.userId,
      newsId: this.state.newsObj.id,
      content: text,
      annotations: this.state.currentHighlights,
    }).then((res) => {
      this.refresh_comments();
      this.setState({annotationsShown: res.id})
    })
    this.setState({currentHighlights: []});
    this.setHighlightMode(false);
  }

  componentDidMount() {
    post("/api/news", {newsIds: [this.props.newsId]}).then((newsObjs) => {
      if (newsObjs.length == 0) {
        navigate("/notfound");
      }
      this.setState({newsObj: newsObjs[0]});
      this.refresh_comments();
    });
  }

  render() {
    return (this.state.newsObj ? (
      <div className="u-page-container" onClick = {this.deselectAnnotations}>
        <FeedCard
         newsObj={this.state.newsObj}
         expanded={true}
         highlightMode={this.state.highlightMode}
         onMouseUp={this.onMouseUp}
         deselectAnnotations = {this.deselectAnnotations}
         annotations = {
           this.state.highlightMode ? (
             [this.state.currentHighlights]
            ):(
              this.state.commentObjs
                .filter((commentObj) => this.state.annotationsShown.includes(commentObj.id))
                .map((commentObj) => commentObj.annotations)
            )
          }
        />
        <div className="reading-sidebar u-greybox">
          <div className="u-title-with-icon">
            <h3 style={{gridArea:"title", whiteSpace: "nowrap"}}>Annotation Toolbox</h3>
            <InfoModalIcon 
              heading="Writing Annotation"
              text={(
                <>
                  Minerva encourages its users to have conversations through the use of Annotations.
                  This box helps you write and post an annotation. Simply select one of the colors below, then drag and hold
                  to select a part of the news content which you want to highlight with your mouse, and a modal will pop up for you
                  to post an annotation on the region you selected. Try it out!
                  <br></br>
                  <br></br>
                  You have currently selected: {this.state.highlightColor}.
                </>
              )}
            />            
          </div>
          <div className="reading-annbox-cont u-greybox">
            <div className="reading-system-ann"> {
              this.defaultAnnotations.map((annotation, i) => (
              <AnnotationCard {...annotation} id = {`default${i}`} key = {i}/>
              ))
            }
          </div>

          </div>
          <Comments
            commentObjs = {this.state.commentObjs}
            commentOwnerNames = {this.state.commentOwnerNames}
            toggleAnnotation = {this.toggleAnnotation}
            annotationsShown = {this.state.annotationsShown}
          />
        </div>
        <InputModal
          show={this.state.highlightMode}
          setshow={this.setHighlightMode}
          id="highlighing modal"
          placeholder = "Write a comment"
          rows="6"
          postfunc = {this.submitComment}
          />
      </div>
    ):(
      <div></div>
    ));
  }
}

export default Reading;

/*
addCommentCard = {(
                <AddCommentCard
                  newsId = {this.state.newsObj.id}
                  ownerId = {this.props.userId}
                  ownerName = {this.props.userName}
                  componentId = {"New Comment"}
                  submitComment = {this.submitComment}
                  highlightMode = {this.state.highlightMode}
                  toggleHighlight = {this.toggleHighlight}
                  currentHighlights = {this.state.currentHighlights}
                />
              )}*/
