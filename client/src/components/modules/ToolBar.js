import React, { Component } from "react";
import { Link, navigate } from "@reach/router";

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
          to={"/my"}
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
        <div
          className="u-clickable u-clickableSmall u-marginLeft u-chocoThemed"
          onClick={(e) => {
            this.props.onPlay().then((x) => {
              navigate("/play/" + this.props.levelId + "/true");
            });
          }}
        >
          Play
        </div>
        <div
          className="u-clickable u-clickableSmall u-marginLeft u-chocoThemed"
          onClick={(e) => {
            this.props.onOpenSettings();
          }}
        >
          Settings
        </div>
        <a
          className="u-clickable u-clickableSmall u-marginLeft u-chocoThemed"
          target="_blank"
          rel="noopener noreferrer"
          href="/help"
        >
          Help
        </a>
      </div>
    );
  }
}

export default ToolBar;
