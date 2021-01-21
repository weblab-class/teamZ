import React, { Component } from "react";

import "../../utilities.css";
import "./SettingsPane.css";

import { get, post } from "../../utilities.js";
import { modifyLevel } from "../../client-socket";
import SettingsGeneral from "./settingsModules/SettingsGeneral.js";

const menuStrings = ["General", "Level Size", "Character", "Background", "Sharing"];
class SettingsPane extends Component {
  constructor(props) {
    super(props);
    // props needed:
    //  - title
    //  - description
    //  - rows
    //  - cols
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
          className="settingsPaneMenuOption"
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
          onSubmit={(title, description) => {
            modifyLevel({ title: title, description: description });
            post("/api/save");
          }}
        />
      );
    }
    return (
      <div className="settingsPaneContainer">
        <div className="settingsPaneBar">
          SettingsPane
          <div
            className="redX"
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
    );
  }
}

export default SettingsPane;
