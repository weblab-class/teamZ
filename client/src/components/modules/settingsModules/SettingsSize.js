import React, { Component } from "react";

import "../../../utilities.css";
import "../SettingsPane.css";

class SettingsSize extends Component {
  constructor(props) {
    super(props);
    // props needed:
    //  - rows
    //  - cols
    //  - onSubmit
    this.state = {
      left: 0,
      right: 0,
      up: 0,
      down: 0,
      errorMessage: "",
    };
  }

  getNewLevelDims = () => {
    return {
      rows: this.state.up + this.state.down + this.props.rows,
      cols: this.state.left + this.state.right + this.props.cols,
    };
  };

  render() {
    const dirs = ["left", "right", "down", "up"];
    const dirInputs = dirs.map((dir, i) => (
      <div
        className={"u-inputContainer u-flexGrow " + (i === dirs.length - 1 ? "" : "u-marginRight")}
        key={i}
      >
        {dir}
        <input
          type="number"
          className="u-input"
          value={this.state[dir]}
          onChange={(e) => {
            this.setState({ [dir]: parseInt(e.target.value) });
          }}
        />
      </div>
    ));
    return (
      <div className="settingsSizeContainer">
        <div className="sizeRow">
          <div className="u-flexColumn u-flexGrow">
            <div className="u-midFont">Original size</div>
            <div className="u-mediumSmallFont">{"Height: " + this.props.rows}</div>
            <div className="u-mediumSmallFont">{"Width:  " + this.props.cols}</div>
          </div>
          <div className="u-flexColumn u-flexGrow">
            <div className="u-midFont">New size</div>
            <div className="u-mediumSmallFont">{"Height: " + this.getNewLevelDims().rows}</div>
            <div className="u-mediumSmallFont">{"Width:  " + this.getNewLevelDims().cols}</div>
          </div>
        </div>
        <div className="u-midFont u-monoFont sizeCaption">
          Amount of tiles to increase in each direction (negative to decrease):
        </div>
        <div className="u-flexRow">{dirInputs}</div>

        <div className="u-submitRow">
          <div
            className="u-submitButton u-midFont u-marginTop submitButton"
            onClick={(e) => {
              const newLevelDims = this.getNewLevelDims();
              if (
                newLevelDims.rows <= 0 ||
                newLevelDims.cols <= 0 ||
                this.state.left + this.props.cols <= 0 ||
                this.state.right + this.props.cols <= 0 ||
                this.state.up + this.props.rows <= 0 ||
                this.state.down + this.props.rows <= 0 ||
                isNaN(this.state.left) ||
                isNaN(this.state.right) ||
                isNaN(this.state.up) ||
                isNaN(this.state.down)
              ) {
                this.setState({ errorMessage: "Invalid resize dimensions." });
                return;
              }
              this.props.onSubmit({
                left: this.state.left,
                right: this.state.right,
                up: this.state.up,
                down: this.state.down,
              });
              this.setState(
                {
                  left: 0,
                  right: 0,
                  up: 0,
                  down: 0,
                },
                () => {
                  this.props.onCancel();
                }
              );
            }}
          >
            Submit
          </div>
        </div>
        <div className="u-errorMessage u-flexEnd u-marginTop">{this.state.errorMessage}</div>
      </div>
    );
  }
}

export default SettingsSize;
