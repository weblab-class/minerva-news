import React from "react";
import "../../utilities.css";
import {get} from "../../utilities.js";
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
        <div className="summaries-box u-greybox">
            <div className="summaries-title">
                Summaries
            </div>
            <div className="u-vert-list">
                {
                    this.state.summaries.map((summaryObj) => (
                        <SummaryCard/>
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
      return <></>;
    }
}

export default Summaries;
