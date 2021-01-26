import React, { Component } from "react";

import "../../utilities.css";
import "./SettingsPane.css";

import { get, post } from "../../utilities.js";
import { modifyLevel, resizeLevel } from "../../client-socket";
import SettingsGeneral from "./settingsModules/SettingsGeneral.js";
import SettingsSize from "./settingsModules/SettingsSize.js";
import SettingsCharacter from "./settingsModules/SettingsCharacter.js";
import SettingsBackground from "./settingsModules/SettingsBackground.js";

const menuStrings = ["General", "Level Size", "Character", "Background"];
class SettingsPane extends Component {
  constructor(props) {
    super(props);
    // props needed:
    //  - title
    //  - description
    //-isPublished
    //  - rows
    //  - cols
    //  - changeCharSprite
    //  - onCancel (e.g. the red X button on top right to close settingsPane)
    this.state = {
      displayPaneOption: 0,
      // five kinds of panes
      // - General
      // - Level Size
      // - Character
      // - Background
      // - Sharing
    };
  }

  render() {
    const menuButtons = menuStrings.map((menuString, i) => {
      return (
        <div
          className={
            "u-clickable settingsPaneMenuOption" +
            (this.state.displayPaneOption === i ? " settingsPaneMenuOptionActive" : "")
          }
          key={i}
          onClick={(e) => {
            this.setState({ displayPaneOption: i });
          }}
        >
          {menuString}
        </div>
      );
    });
    let content = null;
    if (this.state.displayPaneOption === 0) {
      console.log("settignsPane received: " + this.props.title);
      content = (
        <SettingsGeneral
          title={this.props.title}
          description={this.props.description}
          isPublished={this.props.isPublished}
          onSubmit={(title, description, isPublished) => {
            modifyLevel({ title: title, description: description, isPublished: isPublished });
            post("/api/save");
          }}
        />
      );
    }
    if (this.state.displayPaneOption === 1) {
      content = (
        <SettingsSize
          rows={this.props.rows}
          cols={this.props.cols}
          onSubmit={(deltas) => {
            resizeLevel(deltas);
            post("/api/save");
          }}
        />
      );
    }
    if (this.state.displayPaneOption === 2) {
      content = (
        <SettingsCharacter
          onSubmit={(image) => {
            this.props.changeCharSprite(image);
            () => post("/api/save");
          }}
        />
      );
    }
    if (this.state.displayPaneOption === 3) {
      content = (
        <SettingsBackground
          onSubmit={(image) => {
            this.props.changeBackground(image);
            () => post("/api/save");
          }}
        />
      );
    }
    return (
      <div className="u-cover">
        <div className="u-window u-largeWindow settingsPaneContainer">
          <div className="settingsPaneBar u-windowHeader">
            Level Settings
            <div
              className="u-cancelButton"
              onClick={(e) => {
                this.props.onCancel();
              }}
            >
              Cancel
            </div>
          </div>
          <div className="settingsPaneSubcontainer">
            <div className="settingsPaneMenu">{menuButtons}</div>
            <div className="settingsPaneContent">{content}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default SettingsPane;
