import React, { Component } from "react";

import "../../utilities.css";
import "./TileDesignerModal.css";

const tileSize = 16; // use this constant rather than the number `16` when referencing tile size.
class TileDesignerModal extends Component {
  constructor(props) {
    /* TileDesignerModal is a pop-up whose job is to design and output a tile.
     * One prop passed to TileDesignerModal is a callback `onSubmit`,
     * which takes three arguments:
     *   -  name: String // name of tile
     *   -  layer: String // one of "Platform" or "Background"
     *   -  image: an object that contains information for a 16x16 ARGB image.
     *             You can choose what kind of object this is (e.g. can be
     *             an ImageBitmap), but you should specify your choice here,
     *             so I will know what to do with it.
     * Call `onSubmit` like so: `this.props.onSubmit(name, layer, image)`.
     * `onSubmit` should be called when the user performs an action that translates to
     * submitting the designed tile (e.g. clicking a submit button).
     * ----------------
     * Another prop passed to TileDesignerModal is a callback `onCancel`,
     * which takes no arguments.
     * `onCancel` should be called when the user performs an action that translates to
     * exiting the TileDesignerModal without submitting the designed tile (e.g.
     * clicking on a cancel button).
     * ----------------
     * One should be able to submit a tile by:
     *   -  uploading a 16x16 PNG image
     *   -  or drawing directly on a 16x16 pixel editor.
     * For the MVP, it should be OK to just support the uploading method.
     */
    super(props);
    this.state = {
      // TODO: initialize state
    };
  }

  //for the MVP, the modal will only be able to upload images

  render() {
    return (
      <div className="modal-wrapper">
        <div className="modal-header">
          <p>Design a tile or upload your own image</p>
          <span className="close-modal-btn"></span>
        </div>
        <div className="modal-content">
          <div className="modal-body">
            <h4>Modal</h4>
            <button onClick={this.props.onSubmit(name, layer, image)} className="btn-submit">Upload Image</button> 
          </div>
          <div className="modal-footer">
            <button onClick={this.props.onCancel()} className="btn-cancel">Cancel</button>
          </div>
        </div>
      </div>
    );
  }
}


export default TileDesignerModal;

