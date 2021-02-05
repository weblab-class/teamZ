import React, { Component } from "react";

import "../../../utilities.css";
import TileDesigner from "../TileDesigner.js";

class SettingsCharacter extends Component {
  constructor(props) {
    // props: onSubmit, onCancel
    super(props);
    this.state = {
      image: null,
    };
  }

  render() {
    return (
      <div className="u-flexColumn">
        <div className="u-monoFont u-midFont">
          Design a character (facing right) using the canvas, or upload an image.
        </div>
        <TileDesigner
          onSubmit={(im) => {
            this.props.onSubmit(im);
            this.props.onCancel();
          }}
        />
      </div>
    );
  }
}

export default SettingsCharacter;
