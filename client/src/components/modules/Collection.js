import React from "react";
import "../../utilities.css";
import {get, post} from "../../utilities.js";
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
    /*
    post("/api/collections").then((collectionObjs) =>{
        this.setState({collections:collectionObjs});
    });
    */
  }

  // <CollectionCard key={collection[0]} setTags={this.props.setTags} name={collection[0]} {...(collection[1])}/>

  render() {
    console.log("OOOOOOOOOOO");
    console.log(this.collectionsList);
    return (
      <div className="collection-box u-greybox">
        <div className = "u-vert-list collection-list"> {
          this.state.collectionsList.map((collection) => (
            <div> hello </div>
          ))
        }
        </div>
        <div className="collection-create">
          <img src={require("../../public/plusSign.png").default} className="collection-image collection-plus"></img>
          <button className="u-plain-button collection-text">Create Collection</button>
        </div>
      </div>
    );
  }
}

class CollectionsCard extends React.Component {
  constructor(props) {
    super(props);
  }
  changeTags = () =>{
    this.props.setTags(this.props.tags);
  };

  render() {
    return (
      <div className="collection-card">
        <img src={require(`../../public/collectionIcons/${this.props.img}`).default} className="collection-image"></img>
        <button className="u-plain-button collection-text" onClick={this.changeTags}>{this.props.name}</button>
      </div>
    );
  }
}

export default Collections;
