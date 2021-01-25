import React, { Component } from "react";
import { Link } from "@reach/router";

import "../../utilities.css";
import "./CreateLevelForm.css";

const defaultRows = 20;
const defaultCols = 25;
class CreateLevelForm extends Component {
  constructor(props) {
    super(props);
    // prop: onCancel
    this.state = {
      title: "",
      description: "",
      rows: defaultRows,
      cols: defaultCols,
    };
  }

  render() {
    return (
      <div className="u-cover">
        <div className="u-window u-largeWindow u-flexColumn">
          <div className="u-windowHeader">
            <div>Create a level</div>
            <div className="u-cancelButton" onClick={(e) => this.props.onCancel()}>
              Cancel
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CreateLevelForm;
