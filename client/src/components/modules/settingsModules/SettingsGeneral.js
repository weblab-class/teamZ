import React, { Component } from "react";

import "../../utilities.css";
import "./SettingsPane.css";

const menuStrings = ["General", "Level Size", "Character", "Background", "Sharing"];
class SettingsGeneral extends Component {
  constructor(props) {
    super(props);
    // props needed:
    //  - title
    //  - description
    //  - onSubmit
    this.state = {
      title: "",
      description: "",
    };
  }

  render() {
    return (
      <div className="settingsGeneralContainer">
        general settings
        <textarea
          type="text"
          placeholder="Title..."
          value={this.props.title}
          onChange={(e) => {
            this.setState({ title: e.target.value });
          }}
          className="textInput"
        ></textarea>
        <textarea
          type="text"
          placeholder="Description..."
          value={this.props.description}
          onChange={(e) => {
            this.setState({ description: e.target.value });
          }}
          className="textInput"
        ></textarea>
        <div
          className="u-clickable"
          onClick={(e) => {
            this.props.onSubmit(this.state.title, this.state.description);
          }}
        >
          Submit
        </div>
      </div>
    );
  }
}

export default SettingsGeneral;
