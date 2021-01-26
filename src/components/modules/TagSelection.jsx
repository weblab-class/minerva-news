import React from "react";
import { get, submitOnEnter } from "../../utilities";

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

  insertTag = (tag) =>{
    document.getElementById("taginput").value += tag;
  };

  render() {
    const placeholder_text = "Tag topics you want to explore using #topic...";
    return (
      <div className="tagselection-box u-greybox">
        <textarea
          id="taginput"
          type="text"
          placeholder={placeholder_text}
          className="tagselection-input"
          rows="2"
          onKeyDown={submitOnEnter("taginput", (value) => {
            this.props.setTags(value.split('#').slice(1).map((str) => str.trim()));
            //document.getElementById("taginput").value = "";
          })}
        />
        <div className="tagselection-suggestbox">
          <div className="tagselection-suggestionlabel">Popular: </div> {
            this.state.suggestions.map((suggestion) => (
            <div
              className="tagselection-suggestion u-plain-button"
              key = {suggestion}
              onClick={() => {this.insertTag(`#${suggestion} `)}}
            >
              #{suggestion}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default TagSelection;
