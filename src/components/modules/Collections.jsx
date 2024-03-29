import React from "react";
import { InfoModalIcon } from "./BootstrapModels.jsx"
import { get, post } from "../../utilities.js";

import "../../utilities.css";
import "./Collection.css";


class Collections extends React.Component {
  constructor(props) {
    super(props);
    const entries = localStorage.getItem("collectionsList");
    this.state = {
      collectionsList: entries ? JSON.parse(entries) : [],
    };
  }

  componentDidMount() {
    const entries = Object.entries(this.props.collections);
    this.setState({
      collectionsList: entries.sort((a,b) => {
        return (a[0] > b[0])
      })
    });
    localStorage.setItem("collectionsList", JSON.stringify(entries));
  }

  render() {
    return (
      <div className="collection-box u-greybox">
        <div className="u-title-with-icon">
          <div/>
          <h2>Collections</h2>
          <div/>
          <InfoModalIcon
            heading="How Collections work"
            text={(
              <>
                A collection (aka topic group) is derived from a 'distribution' of tags related to the topic.
                Minerva smartly adapts these tags based on recent news and then automatically sorts daily news
                into the relevant collections.
                <br></br>
                Coming soon: you will be able to define your own tag groups for quick future reference :)
              </>
            )}
          />
        </div>
        <div className = "u-vert-list collection-list"> {
          this.state.collectionsList.map((collection) => (
            <CollectionsCard key={collection[0]} setTags={this.props.setTags} name={collection[0]} {...(collection[1])}/>
          ))
        }
        </div>
      </div>
    );
  }
}

class CollectionsCard extends React.Component {
  constructor(props) {
    super(props);
  }

  changeTags = () => {
    document.getElementById("taginput").value = "";
    this.props.setTags(this.props.tags);
  };

  render() {
    return (
      <div className="collection-card u-button" onClick={this.changeTags}>
        <img src={require(`../../assets/collectionIcons/${this.props.img}`).default} className="collection-image"></img>
        <button className="u-plain-button collection-text">{this.props.name}</button>
      </div>
    );
  }
}

export default Collections;
