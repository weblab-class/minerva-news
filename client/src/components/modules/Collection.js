import React from "react";
import "../../utilities.css";
import {get, post} from "../../utilities.js";
import "./Collection.css";

class Collection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collections: [],
    };
  }

  componentDidMount() {
    post("/api/collections").then((collectionObjs) =>{
        this.setState({collections:collectionObjs});
    });
  }

  render() {
    return (
        <div className="collection-box u-greybox">
            <div className = "u-vert-list collection-list">
                {
                    this.state.collections.map((collectionObj) => (
                        <CollectionCard key={collectionObj.name} setTags={this.props.setTags} {...collectionObj}/>
                    ))
                }
            </div>
            <div className="collection-create">
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
          <img src={require(`../../public/collectionIcons/${this.props.imageName}`).default} className="collection-image"></img>
          <button className="u-plain-button collection-button" onClick={this.changeTags}>{this.props.name}</button>
        </div>);
    }
}

export default Collection;
