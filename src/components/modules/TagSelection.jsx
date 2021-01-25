import React from "react";
import { get, handleEnter } from "../../utilities";

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

  /*
  (e) => {
    e = e || window.event;
    var keyCode = e.code || e.key;
    if(keyCode == 'Enter'){
      var tags = document.getElementById("taginput").value.split('#').slice(1).map((str) => str.trim());
      document.getElementById("taginput").value = "";
      this.props.setTags(tags);
    }
  }*/

  render() {
    const placeholder_text = "Tag topics you want to explore using #topic...";
    return (
      <div className="tagselection-box u-greybox">
        <input
          id="taginput"
          type="text"
          placeholder={placeholder_text}
          className="tagselection-input"
          onKeyUp={handleEnter("taginput", (value) => {
            this.props.setTags(value.split('#').slice(1).map((str) => str.trim()));
            //document.getElementById("taginput").value = "";
          })}
        />
        <div className="tagselection-suggestbox">
          <div className="tagselection-suggestionlabel">Suggestions: </div> {
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
