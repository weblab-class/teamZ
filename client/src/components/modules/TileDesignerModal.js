import React, { Component } from "react";

import "../../utilities.css";
import "./TileDesignerModal.css";
import { tileSize } from "../../../../constants.js";

//import TileEditor from "./tileEditor/TileEditor";

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
      name: "",
      layer: "Platform",
      image: null,
    };
  }

  uploadImage = (event) => {
    const fileInput = event.target;
    console.log(fileInput);
    this.readImage(fileInput.files[0])
      .then((image) => {
        fileInput.value = null;
        // scale image down to 16 x 16
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = tileSize;
          canvas.height = tileSize;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const scaledImageString = canvas.toDataURL();
          this.setState({ image: scaledImageString });
        };
        img.src = image;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  readImage = (blob) => {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onloadend = () => {
        if (r.error) {
          reject(r.error.message);
          return;
        } else if (!r.result.startsWith("data:image/")) {
          reject("not an image!");
          return;
        } else {
          resolve(r.result);
        }
      };
      r.readAsDataURL(blob);
    });
  };

  render() {
    return (
      <div className="u-cover">
        <div className="u-window u-largeWindow u-flexColumn">
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
            Name
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

          <input type="file" name="files[]" accept="image/*" onChange={this.uploadImage} />
          <div
            className="u-clickable"
            onClick={(e) => {
              if (this.state.image !== null) {
                this.props.onSubmit(this.state.name, this.state.layer, this.state.image);
              }
            }}
          >
            Submit
            {this.state.image === null ? "stateImage is null" : ""}
          </div>
        </div>
      </div>
    );
  }
}

export default TileDesignerModal;
