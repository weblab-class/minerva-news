import React from "react";
import {get} from "../../utilities.js";

import "../../utilities.css";
import "./Summaries.css";

class Summaries extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      summaries: [],
    };
  }

  componentDidMount() {
    get("/api/summaries").then((summaryObjs) =>{
        this.setState({summaries:summaryObjs});
    });
  }

  render() {
    return (
      <div className="u-summary-box u-greybox">
        <h2 className="u-title">Summaries</h2>
        <div className="u-vert-list"> {
          this.state.summaries.map((summaryObj) => (
            <SummaryCard key={summaryObj.tags}summaryObj={summaryObj}/>
          ))
        }
        </div>
      </div>
    );
  }
}

class SummaryCard extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      return (
      <div className="u-greybox summarycard-cont">
        <div className="summarycard-taglist"> {
          this.props.summaryObj.tags.map((tag) => (
            <div key={tag} className="summarycard-tag">
              #{tag}
            </div>
          ))}
        </div>
        <div className="summarycard-summary">
          {this.props.summaryObj.summary}
        </div>
      </div>);
    }
}

export default Summaries;
