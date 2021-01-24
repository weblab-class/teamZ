import React, { Component } from "react";
import { Link } from "@reach/router";

import "../../utilities.css";
import "./Card.css";

class Card extends Component {
  constructor(props) {
    super(props);
    // props:
    // level a dictionary of level
    // // creator must be populated
    // toEdit: boolean
    this.state = {
      isShowingDescription: false,
    };
  }

  render() {
    return (
      <div className="cardContainer u-flexColumn">
        <div className="mainCardContent u-flexRow">
          <div className="cardInfo u-flexColumn">
            <div className="u-midFont">{this.props.level.title}</div>
            <div className="u-smallFont">{this.props.level.creator.name}</div>
          </div>
          <Link
            className="u-clickable u-chocoThemed u-textCenter cardAction"
            to={
              this.props.toEdit
                ? "/edit/" + this.props.level._id
                : "/play/" + this.props.level._id + "/false"
            }
          >
            {this.props.toEdit ? "\u270E" : "\u25B6"}
          </Link>
        </div>
        <div className="descriptionContainer">
          {this.state.isShowingDescription ? (
            <div className="u-mediumSmallFont">{this.props.level.description}</div>
          ) : (
            <div
              className="u-clickable u-clickableSmall u-chocoThemed showDescriptionButton"
              onClick={(e) => {
                this.setState({ isShowingDescription: true });
              }}
            >
              Show Description
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Card;
