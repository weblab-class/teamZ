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
    this.state = {
      isSaving: false,
    };
  }

  render() {
    return (
      <div className="toolBarContainer">
        <Link
          to={"/"}
          className="u-clickable u-clickableSmall u-marginLeft u-chocoThemed"
          onClick={(e) => {
            this.props.onBack();
          }}
        >
          Back
        </Link>
        <div
          className="u-clickable u-clickableSmall u-marginLeft u-chocoThemed"
          onClick={(e) => {
            this.setState({ isSaving: true }, () => {
              this.props.onSave().then((x) => {
                this.setState({ isSaving: false });
              });
            });
          }}
        >
          {this.state.isSaving ? "Saving..." : "Save"}
        </div>
        <Link
          className="u-clickable u-clickableSmall u-marginLeft u-chocoThemed"
          to={"/play/" + this.props.levelId + "/true"}
          onClick={(e) => {
            this.props.onPlay();
          }}
        >
          Play
        </Link>
        <div
          className="u-clickable u-clickableSmall u-marginLeft u-chocoThemed"
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
