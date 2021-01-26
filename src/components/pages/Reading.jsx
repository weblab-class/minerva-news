import React from "react";
import { FeedCard } from "../modules/Feed.jsx";
import Comments, {AddCommentCard} from "../modules/Comments.jsx";
import NotFound from "./NotFound";
import AnnotationCard from "../modules/Annotation.jsx";
import { navigate } from "@reach/router";
import { get, post } from "../../utilities";

import "../../utilities.css";
import "./Reading.css";

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

  toggleAnnotation = (annotationId) => {
    if (this.state.annotationsShown.includes(annotationId)) {
      this.setState({annotationsShown: this.remove_from_list(this.state.annotationsShown, annotationId)});
    }
    else {
      this.setState({annotationsShown: [annotationId]});
      //this.setState({annotationsShown: this.state.annotationsShown.concat([annotationId])})
    }
  }

  toggleHighlight = () => {
    if(!this.state.highlightMode) {
      this.setState({highlightMode: true})
    } else {
      if(window.getSelection){
        const sel = window.getSelection();
        if(sel.anchorNode.parentElement && sel.anchorNode.parentElement.id == "reading-body"
            && sel.focusNode.parentElement && sel.anchorNode.parentElement.id == "reading-body"){
          const offsets = [sel.anchorOffset, sel.focusOffset];
          console.log(offsets.sort((a,b) => a-b));
          this.setState({currentHighlights: [{
            start: offsets[0],
            end: offsets[1],
            color: "yellow",
          }]}); /* for now we only restrict one span per highlight,
          can easily add more using concat(), but need to implement a binary search to remove duplicates*/
        } else{
          alert("Please select an area in news text to highlight");
        }
      }
      this.setState({highlightMode: false})
    }
  }

  refresh_comments = () => {
    post("/api/comments", {newsId: this.props.newsId}).then((commentObjs) => {
      this.setState({commentObjs: [this.state.systemComment].concat(commentObjs)});
      return post('/api/user', {ids: commentObjs.map(commentObj => commentObj.ownerId)});
    }).then((res) => {
      this.setState({commentOwnerNames: ['system'].concat(res.map(userObj => userObj.userName))});
    });
  }

  submitComment = () => {
    this.refresh_comments();
    this.setState({currentHighlights: []});
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
      <div className="u-page-container">
        <FeedCard
         newsObj={this.state.newsObj}
         expanded={true}
         highlightMode={this.state.highlightMode}
         annotations = {
           this.state.highlightMode ? (
             []
            ):(
              this.state.commentObjs
                .filter((commentObj) => this.state.annotationsShown.includes(commentObj.id))
                .map((commentObj) => commentObj.annotations)
            )
          }
        />
        <div className="reading-sidebar u-greybox">
          <div className="reading-system-ann u-greybox"> {
            this.defaultAnnotations.map((annotation, i) => (
            <AnnotationCard {...annotation} id = {`default${i}`} key = {i}/>
            ))
          }
          </div>
            <Comments
              commentObjs = {this.state.commentObjs}
              commentOwnerNames = {this.state.commentOwnerNames}
              toggleAnnotation = {this.toggleAnnotation}
              annotationsShown = {this.state.annotationsShown}
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
              )}
            />
          </div>
        </div>
    ):(
      <div></div>
    ));
  }
}

export default Reading;
