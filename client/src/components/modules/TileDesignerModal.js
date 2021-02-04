import React, { Component } from "react";

import "../../utilities.css";
import "./TileDesignerModal.css";

import TileDesigner from "./TileDesigner.js";
class TileDesignerModal extends Component {
  constructor(props) {
    /* TileDesignerModal is a pop-up whose job is to design and output a tile.
     * One prop passed to TileDesignerModal is a callback `onSubmit`,
     * which takes three arguments:
     *   -  name: String // name of tile
     *   -  layer: String // one of "Platform" or "Background"
     *   -  image: String // base64 encoding of tile image
     * Call `onSubmit` like so: `this.props.onSubmit(name, layer, image)`.
     * `onSubmit` should be called when the user performs an action that translates to
     * submitting the designed tile (e.g. clicking a submit button).
     * ----------------
     * Another prop passed to TileDesignerModal is a callback `onCancel`,
     * which takes no arguments.
     * `onCancel` should be called when the user performs an action that translates to
     * exiting the TileDesignerModal (e.g. clicking on a cancel button).
     * ----------------
     * One should be able to submit a tile by:
     *   -  uploading a 16x16 PNG image
     *   -  or drawing directly on a 16x16 pixel editor.
     * For the MVP, it should be OK to just support the uploading method.
     */
    super(props);
    this.state = {
      name: "",
      layer: "Platform",
      image: null,
    };
  }

  render() {
    return (
      <div className="u-cover">
        <div className="u-window u-largeWindow u-flexColumn u-overflowY">
          <div className="u-windowHeader u-spaceBetween">
            Tile Designer
            <div
              className="u-cancelButton"
              onClick={(e) => {
                this.props.onCancel();
              }}
            >
              Cancel
            </div>
          </div>
          <div className="u-inputContainer">
            Name of tile
            <textarea
              type="text"
              className="u-input"
              placeholder=""
              value={this.state.name}
              onChange={(e) =>
                this.setState({
                  name: e.target.value,
                })
              }
            ></textarea>
          </div>
          <div className="u-inputContainer u-marginTop">
            Layer
            <select
              value={this.state.layer}
              className="u-input"
              onChange={(e) => {
                console.log("changed select: " + e.target.value);
                this.setState({ layer: e.target.value });
              }}
            >
              <option value="Platform">Platform</option>
              <option value="Background">Background</option>
            </select>
          </div>
          <div className="u-monoFont u-midFont u-marginTop u-marginBottom">
            Design a tile using the canvas, or upload an image.
          </div>
          <TileDesigner
            onSubmit={(image) => {
              this.props.onSubmit(this.state.name, this.state.layer, image);
              this.props.onCancel();
            }}
          />
        </div>
      </div>
    );
  }
}

export default TileDesignerModal;
