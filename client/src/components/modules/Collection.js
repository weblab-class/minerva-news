import React from "react";
import "../../utilities.css";
import {get, post} from "../../utilities.js";
import "./Collection.css";

class Collection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collectionsList: [],
    };
  }

  componentDidMount() {
    this.state.collectionsList = Object.entries(this.props.collections);
    this.state.collectionsList.sort((a,b) => {
      return (a[0] > b[0])
    });
    /*
    post("/api/collections").then((collectionObjs) =>{
        this.setState({collections:collectionObjs});
    });
    */
  }

  render() {

    return (
        <div className="collection-box u-greybox">
            <div className = "u-vert-list collection-list">
                {
                    this.state.collectionsList.map((collection) => (
                        <CollectionCard key={collection[0]} setTags={this.props.setTags} {...(collection[1])}/>
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

class CollectionCard extends React.Component {
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
        </div>);
    }
}

export default Collection;
