import React, { Component } from "react";

import "../../../utilities.css";
import "../SettingsPane.css";

const menuStrings = ["General", "Level Size", "Character", "Background", "Sharing"];
class SettingsGeneral extends Component {
  constructor(props) {
    super(props);
    // props needed:
    //  - title
    //  - description
    //  - onSubmit
    this.state = {
      title: props.title.toString(),
      description: props.description.toString(),
      isPublished: props.isPublished ? true : false,
    };
  }

  render() {
    console.log("settingsGeneral received: " + this.props.title);
    return (
      <div className="settingsGeneralContainer">
        <div className="u-inputContainer">
          Title
          <textarea
            type="text"
            className="u-input"
            placeholder=""
            value={this.state.title}
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
            value={this.state.description}
            onChange={(e) =>
              this.setState({
                description: e.target.value,
              })
            }
          ></textarea>
        </div>
        <div className="u-inputContainer u-marginTop">
          Publish level?
          <select
            value={this.state.isPublished}
            className="u-input"
            onChange={(e) => {
              this.setState({ isPublished: e.target.value });
            }}
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </div>
        <div className="u-submitRow">
          <div
            className="u-submitButton u-midFont u-marginTop submitButton"
            onClick={(e) => {
              this.props.onSubmit(this.state.title, this.state.description, this.state.isPublished);
            }}
          >
            Submit
          </div>
        </div>
      </div>
    );
  }
}

export default SettingsGeneral;
