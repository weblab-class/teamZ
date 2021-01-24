import React, { Component } from "react";
import { Link } from "@reach/router";

import "../../utilities.css";
import "./CreateLevelForm.css";

class CreateLevelForm extends Component {
  constructor(props) {
    super(props);
    // prop: onCancel
    this.state = {
      showingCreateLevelPopup: false,
    };
  }

  render() {
    return (
      <div className="u-cover">
        <div className="u-window u-windowLarge u-flexColumn">TODO</div>
      </div>
    );
  }
}

export default CreateLevelForm;
