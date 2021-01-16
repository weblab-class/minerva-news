import { get } from "mongoose";
import React from "react";
import "../../utilities.css";

class Feed extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    get("/api/collections").then((collectionObjs) =>{
        this.setState({collections:collectionObjs});
    });
  }

  render() {
    return (
        <div>
            <div>
            </div>
            <div className="collection-create">
                {
                    this.state.collections.map((collectionObj) => (
                        <CollectionCard/>
                    ))
                }
            </div>
        </div>
    );
  }
}

class FeedCard extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
      return (
      );
    }
}

export default Collection;
