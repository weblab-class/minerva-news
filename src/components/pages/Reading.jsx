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
      content: "COMING SOON: System annotations helps you flag the parts of news which our fact checker has deemed problematic.",
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
        highlightColor: null,
        highlightText: "None",
    }
    this.defaultAnnotations = [
        {text: "General Highlight", backgroundColor: "#FDF2CC"},
        {text: "Great Reporting", backgroundColor: "#E1F8DC"},
        {text: "Incorrect Facts", backgroundColor: "#F4C2C2"},
        {text: "Biased Sentiment", backgroundColor: "#B0E1E2"},
        {text: "Misleading", backgroundColor: "#F9B2EF"},
        {text: "Lack of Context", backgroundColor: "#DCD0FF"},
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

  changeHighlightColor = (color, text) => {
    if (this.state.highlightColor == color){
      this.setState({highlightColor: null});
      this.setState({highlightText: "None"})
    }else{
      this.setState({highlightColor: color});
      this.setState({highlightText: text})
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
      if(sel.anchorNode.parentElement && sel.anchorNode.parentElement.id.slice(0, 13) == "reading-para-"
          && sel.focusNode.parentElement && sel.focusNode.parentElement.id.slice(0, 13) == "reading-para-"
          && this.state.highlightColor){
        console.log("selected");
        const offsets = [[parseInt(sel.anchorNode.parentElement.id.slice(13)),sel.anchorOffset], 
        [parseInt(sel.focusNode.parentElement.id.slice(13)), sel.focusOffset]];
        console.log(offsets.sort((a,b) => a[0]-b[0]));
        if((offsets[0][1] !== offsets[1][1]) || (offsets[0][0] !== offsets[1][0])){
          console.log(offsets);
          this.setState({currentHighlights: [{
            start: offsets[0],
            end: offsets[1],
            color: this.state.highlightColor,
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
      this.setState({commentOwnerNames: ['System'].concat(res.map(userObj => userObj.userName))});
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
                  You have currently selected: {this.state.highlightText}.
                </>
              )}
            />
          </div>
          <div className="reading-annbox-cont u-greybox">
            <div className="reading-system-ann"> {
              this.defaultAnnotations.map((annotation, i) => (
              <AnnotationCard {...annotation}
                id = {`default${i}`}
                key = {i}
                changeColor = {() => this.changeHighlightColor(annotation.backgroundColor, annotation.text)}
                clickable = {true}
                selected = {(this.state.highlightColor == annotation.backgroundColor)}
              />
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
          id="highlighting modal"
          heading="Create Annotation"
          placeholder = "What do you think?"
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
