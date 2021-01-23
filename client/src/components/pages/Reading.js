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
    this.state = {
        newsObj: null,
        annotationsShown: [],
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
      this.setState({annotationsShown: this.state.annotationsShown.concat([annotationId])})
    }
  }

  componentDidMount() {
      post("/api/news", {newsIds: [this.props.newsId]}).then((newsObjs) => {
        this.setState({newsObj: newsObjs[0]})
      });
  }

  render() {
    return (this.state.newsObj?(
        <div className="reading-cont">
            <FeedCard newsObj={this.state.newsObj} expanded={true} annotationsShown = {this.state.annotationsShown}/>
            <div className="reading-sidebar u-greybox">
                <div className="reading-system-ann u-greybox">
                    {this.defaultAnnotations.map((annotation, i) => (
                    <AnnotationCard {...annotation} id = {`default${i}`} key = {i}/>
                    ))}
                </div>
                <Comments 
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
