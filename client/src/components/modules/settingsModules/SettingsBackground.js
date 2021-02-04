import React, { Component } from "react";

import "../../../utilities.css";

class SettingsBackground extends Component {
  constructor(props) {
    // only prop is onSubmit(image)
    super(props);
    this.state = {
      image: null,
    };
  }

  uploadImage = (event) => {
    const fileInput = event.target;
    console.log(fileInput);
    this.readImage(fileInput.files[0])
      .then((image) => {
        // fileInput.value = null;
        // scale image down to at most 150 pixels tall or wide
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const scaleFactor = Math.floor(Math.max(1, Math.max(img.width, img.height) / 150));
          canvas.width = Math.floor(img.width / scaleFactor);
          canvas.height = Math.floor(img.height / scaleFactor);
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
      <div className="u-flexColumn">
        <div className="u-inputContainer u-marginTop">
          Upload a background image
          <input
            className="u-input"
            type="file"
            name="files[]"
            accept="image/*"
            onChange={this.uploadImage}
          />
        </div>

        <div className="u-submitRow">
          <div
            className="u-submitButton u-midFont u-marginTop submitButton"
            onClick={(e) => {
              this.props.onSubmit(this.state.image);
              this.props.onCancel();
            }}
          >
            Submit
          </div>
        </div>
      </div>
    );
  }
}

export default SettingsBackground;
