import React, { Component } from "react";
import { Link } from "@reach/router";

import "../../utilities.css";
import "./ToolBar.css";

class ToolBar extends Component {
  constructor(props) {
    super(props);
    // props needed:
    // onBack
    // onSave
    // onPlay
    // onOpenSettings
    // levelId
  }

  render() {
    return (
      <div className="toolBarContainer">
        <Link
          to={"/"}
          className="u-clickable"
          onClick={(e) => {
            this.props.onBack();
          }}
        >
          Back
        </Link>
        <div
          className="u-clickable"
          onClick={(e) => {
            this.props.onSave();
          }}
        >
          Save
        </div>
        <Link
          className="u-clickable"
          to={"/play/" + this.props.levelId + "/true"}
          onClick={(e) => {
            this.props.onPlay();
          }}
        >
          Play
        </Link>
        <div
          className="u-clickable"
          onClick={(e) => {
            this.props.onOpenSettings();
          }}
        >
          Settings
        </div>
      </div>
    );
  }
}

export default ToolBar;
