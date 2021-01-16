import React from "react";
import "../../utilities.css";
import {get} from "../../utilities.js";
import "./Collection.css";

class Collection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collections: [],
    };
  }

  componentDidMount() {
    get("/api/collections").then((collectionObjs) =>{
        this.setState({collections:collectionObjs});
    });
  }

  render() {
    return (
        <div className="collection-box u-greybox">
          collection
            <div>
                {
                    this.state.collections.map((collectionObj) => (
                        <CollectionCard key={collectionObj.id} {...collectionObj}/>
                    ))
                }
            </div>
            <div className="collection-create u-vert-list">
            </div>
        </div>
    );
  }
}

class CollectionCard extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
      return <></>;
    }
}

export default Collection;
