import React, { Component } from "react";

import "../../../utilities.css";

import { tileSize } from "../../../../../constants.js";
class SettingsCharacter extends Component {
  constructor(props) {
    // for now only prop is onSubmit(image)
    super(props);
    this.state = {
      // TODO: initialize state
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
      <div className="">
        Character designer:
        <input type="file" name="files[]" accept="image/*" onChange={this.uploadImage} />
        <div
          className="u-clickable"
          onClick={(e) => {
            this.props.onSubmit(this.state.image);
          }}
        >
          Submit
          {this.state.image === null ? "stateImage is null" : ""}
        </div>
      </div>
    );
  }
}

export default SettingsCharacter;
