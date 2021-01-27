import React from "react";
import { InfoModalIcon } from "./BootstrapModels.jsx"
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
      <div className="summary-box u-greybox">
        <div className="u-title-with-icon">
          <h2 style={{gridArea: "title"}}>Summaries</h2>
          <InfoModalIcon
            heading="News Summarization with Minerva"
            text={(
              <>
                Everyday, Minerva sifts through hundreds of pieces of breaking news and summarizes
                the day's key events as part of the Minerva document pipeline, which involves state-of-the-art
                deep learning. Fake/opinionated news is implicitly filtered out in the process,
                and all sources are considered, so you can be sure you get an impartial and accurate understanding
                of the world's happenings.
                <br></br>
                <br></br>
                If you're interested in the underlying pipeline, please check out the github repo.
                <br></br>
                <br></br>
                Also coming soon: explicit fact checking on the reading page. Stay tuned!`
              </>
            )}
          />
        </div>
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
      <div className="u-greybox summarycard-cont u-card">
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
