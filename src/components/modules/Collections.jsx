import React from "react";
import { InputModalButton } from "./BootstrapModels.jsx"
import {get, post} from "../../utilities.js";

import "../../utilities.css";
import "./Collection.css";


class Collections extends React.Component {
  constructor(props) {
    super(props);
    const entries = JSON.parse(localStorage.getItem("collectionsList"));
    this.state = {
      collectionsList: entries ? entries : [],
    };
  }

  componentDidMount() {
    const entries = Object.entries(this.props.collections);
    this.setState({
      collectionsList: entries.sort((a,b) => {
        return (a[0] > b[0])
      })
    });
    localStorage.setItem("collectionslist", JSON.stringify(entries));
  }

  addCollection = (text) => {

  }

  render() {
    return (
      <div className="collection-box u-greybox">
        <h2 className="u-title">Collections</h2>
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
      <div className="collection-card">
        <img src={require(`../../assets/collectionIcons/${this.props.img}`).default} className="collection-image"></img>
        <button className="u-plain-button collection-text" onClick={this.changeTags}>{this.props.name}</button>
      </div>
    );
  }
}

export default Collections;
