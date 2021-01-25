import React, { Component } from "react";
import { get, post } from "../../utilities.js";
import { Link, navigate } from "@reach/router";

import "../../utilities.css";
import "./CreateLevelForm.css";

const defaultRows = 25;
const defaultCols = 40;
class CreateLevelForm extends Component {
  constructor(props) {
    super(props);
    // prop: onCancel
    this.state = {
      title: "",
      description: "",
      rows: defaultRows,
      cols: defaultCols,
      displayError: false,
    };
  }
  validArgs = () => {
    return this.state.rows > 0 && this.state.cols > 0;
  };
  newLevel = () => {
    const rows = this.state.rows;
    const cols = this.state.cols;
    const gridTiles = [];
    for (let i = 0; i < rows * cols; i++) {
      gridTiles.push(null);
    }
    return post("/api/newLevel", {
      title: this.state.title,
      description: this.state.description,
      rows: rows,
      cols: cols,
      gridTiles: gridTiles,
      availableTiles: [],
      startX: 0,
      startY: 0,
      charSprite: null,
      background: null,
    });
  };
  render() {
    return (
      <div className="u-cover">
        <div className="u-window u-largeHorizontalWindow u-flexColumn">
          <div className="u-windowHeader">
            <div>Create a level</div>
            <div className="u-cancelButton" onClick={(e) => this.props.onCancel()}>
              Cancel
            </div>
          </div>
          <div className="u-inputContainer u-marginTop">
            Title
            <textarea
              type="text"
              className="u-input"
              placeholder=""
              value={this.state.name}
              onChange={(e) =>
                this.setState({
                  title: e.target.value,
                })
              }
            ></textarea>
          </div>
          <div className="u-inputContainer u-marginTop">
            Description
            <textarea
              type="text"
              className="u-input descriptionInput"
              placeholder=""
              value={this.state.name}
              onChange={(e) =>
                this.setState({
                  description: e.target.value,
                })
              }
            ></textarea>
          </div>
          <div className="u-flexRow u-spaceBetween">
            <div className="u-flexRow u-flexStart">
              <div className="u-inputContainer u-marginTop">
                Rows
                <input
                  type="number"
                  className="u-input"
                  value={this.state.rows}
                  onChange={(e) => {
                    this.setState({
                      rows: parseInt(e.target.value),
                    });
                  }}
                />
              </div>
              <div className="u-marginLeft u-inputContainer u-marginTop">
                Columns
                <input
                  type="number"
                  className="u-input"
                  value={this.state.cols}
                  onChange={(e) => {
                    this.setState({
                      cols: parseInt(e.target.value),
                    });
                  }}
                />
              </div>
            </div>
            <div
              className="u-submitButton u-midFont u-marginTop"
              onClick={(e) => {
                if (this.validArgs()) {
                  this.props.onCancel();
                  this.newLevel().then((level) => {
                    navigate("/edit/" + level._id);
                  });
                } else {
                  this.setState({ displayError: true });
                }
              }}
            >
              Submit
            </div>
          </div>
        </div>
        {this.state.displayError ? (
          <div className="u-errorMessage">
            Invalid arguments. Make sure that the dimensions of the level are positive.
          </div>
        ) : null}
      </div>
    );
  }
}

export default CreateLevelForm;
