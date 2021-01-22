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
      displayMessage: "",
    };
  }

  isNumeric = (str) => {
    if (typeof str != "string") return false;
    return !isNaN(str) && !isNaN(parseFloat(str));
  };

  getNewLevelDims = () => {
    return {
      rows: this.state.up + this.state.down + this.props.rows,
      cols: this.state.left + this.state.right + this.props.cols,
    };
  };

  render() {
    const dirs = ["left", "right", "down", "up"];
    const dirInputs = dirs.map((dir, i) => (
      <input
        type="number"
        key={i}
        className="u-input"
        placeholder={dir}
        defaultValue={0}
        onChange={(e) => {
          this.setState({ [dir]: parseInt(e.target.value) });
        }}
      />
    ));
    return (
      <div className="settingsSizeContainer">
        level size settings component
        {dirInputs}
        <div>
          {"new level dimensions: rows " +
            this.getNewLevelDims().rows +
            "cols: " +
            this.getNewLevelDims().cols}
        </div>
        {this.state.displayMessage}
        <div
          className="u-clickable"
          onClick={(e) => {
            const newLevelDims = this.getNewLevelDims;
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
              this.setState({ displayMessage: "Invalid resize dimensions." });
              return;
            }
            this.props.onSubmit({
              left: this.state.left,
              right: this.state.right,
              up: this.state.up,
              down: this.state.down,
            });
          }}
        >
          Submit
        </div>
      </div>
    );
  }
}

export default SettingsSize;
