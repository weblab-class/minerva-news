import React from "react";
import "../../utilities.css";
import "./Annotation.css";

class AnnotationCard extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      return (
          <div className="reading-ann-cont">
              <div className="reading-ann-box"
                style={{
                  backgroundColor: this.props.showHighlight?"green":this.props.backgroundColor,
                  cursor: this.props.clickable?"pointer":"default",
                }}
                onClick={this.props.toggleAnnotation}
              />
              <div className="reading-ann-text">
                  {this.props.text}
              </div>
          </div>
      );
    }
}

export default AnnotationCard;
