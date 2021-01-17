import React from "react";
import { get } from "../../utilities";
import "../../utilities.css";
import "./TagSelection.css";

class TagSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestions: [],
    };
  }

  componentDidMount() {
    get("/api/tagsuggest").then((suggestions) => {
      this.setState({suggestions: suggestions});
    });
  }

  render() {
    const placeholder_text = "Tag topics you want to explore using #topic...";
    return (
        <div className="tagselection-box u-greybox">
            <input type="text" placeholder={placeholder_text} className="tagselection-input"/>
            <div className="tagselection-suggestbox">
              {this.state.suggestions.map((suggestion) => (
                <div> #{suggestion} </div>
              ))}</div>
        </div>
    );
  }
}

export default TagSelection;
