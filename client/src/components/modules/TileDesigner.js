import React, { Component } from "react";
import { SketchPicker } from "react-color";

import "../../utilities.css";
import "./TileDesigner.css";

import { tileSize } from "../../../../constants.js";

const pixelsPerPixel = 32; // size of a checkerboard square on the canvas, in pixels.
const transparent = "rgba(0,0,0,0)";

// creates an array of length `len`, where each slot is initialized to `val`
const arrOf = (len, val) => {
  const ret = [];
  for (let i = 0; i < len; i++) {
    ret.push(val);
  }
  return ret;
};

// a component to design a 16x16 image. supports upload or drawing on 16x16 canvas
class TileDesigner extends Component {
  constructor(props) {
    super(props);
    this.isMouseDown = false;
    const pixels = arrOf(tileSize * tileSize, transparent);
    this.pixels = arrOf(tileSize * tileSize, transparent);
    this.canvases = arrOf(tileSize * tileSize, null);
    this.state = {
      color: "rgba(255,255,255,1)",
      isErasing: false,
    };
  }

  registerMouseDown = (e) => {
    this.isMouseDown = true;
  };

  registerMouseUp = (e) => {
    this.isMouseDown = false;
  };

  componentDidMount() {
    window.addEventListener("mousedown", this.registerMouseDown);
    window.addEventListener("mouseup", this.registerMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.registerMouseDown);
    window.removeEventListener("mouseup", this.registerMouseUp);
  }

  // helper fn used to handle image uploads
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
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const dataArr = data.data;
          const imArr = [];
          for (let i = 0; i < 4 * data.width * data.height; i += 4) {
            const rgba = `rgba(${dataArr[i + 0]},${dataArr[i + 1]},${dataArr[i + 2]},${
              dataArr[i + 3] / 255
            })`;
            imArr.push(rgba);
          }
          this.pixels = imArr;
          this.redrawPixels();
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

  drawPixelSquare = (canvas, index, color) => {
    const context = canvas.getContext("2d");
    context.fillStyle =
      (index + Math.floor(index / tileSize)) % 2 === 0
        ? "rgba(128,128,128,1)"
        : "rgba(192,192,192,1)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  drawPixelSquareAt = (index, color) => {
    const canvas = this.canvases[index];
    if (!canvas) return;
    const context = canvas.getContext("2d");
    context.fillStyle =
      (index + Math.floor(index / tileSize)) % 2 === 0
        ? "rgba(128,128,128,1)"
        : "rgba(192,192,192,1)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  redrawPixelSquareAt = (index) => {
    this.drawPixelSquareAt(index, this.pixels[index]);
  };

  redrawPixels = () => {
    for (let i = 0; i < this.pixels.length; i++) {
      this.drawPixelSquareAt(i, this.pixels[i]);
    }
  };

  /**
   * from: https://gist.github.com/oriadam/396a4beaaad465ca921618f2f2444d49
   * @param {*} color
   */
  colorValues = (color) => {
    if (!color) return;
    if (color.toLowerCase() === "transparent") return [0, 0, 0, 0];
    if (color[0] === "#") {
      if (color.length < 7) {
        // convert #RGB and #RGBA to #RRGGBB and #RRGGBBAA
        color =
          "#" +
          color[1] +
          color[1] +
          color[2] +
          color[2] +
          color[3] +
          color[3] +
          (color.length > 4 ? color[4] + color[4] : "");
      }
      return [
        parseInt(color.substr(1, 2), 16),
        parseInt(color.substr(3, 2), 16),
        parseInt(color.substr(5, 2), 16),
        color.length > 7 ? parseInt(color.substr(7, 2), 16) / 255 : 1,
      ];
    }
    if (color.indexOf("rgb") === -1) {
      // convert named colors
      var temp_elem = document.body.appendChild(document.createElement("fictum")); // intentionally use unknown tag to lower chances of css rule override with !important
      var flag = "rgb(1, 2, 3)"; // this flag tested on chrome 59, ff 53, ie9, ie10, ie11, edge 14
      temp_elem.style.color = flag;
      if (temp_elem.style.color !== flag) return; // color set failed - some monstrous css rule is probably taking over the color of our object
      temp_elem.style.color = color;
      if (temp_elem.style.color === flag || temp_elem.style.color === "") return; // color parse failed
      color = getComputedStyle(temp_elem).color;
      document.body.removeChild(temp_elem);
    }
    if (color.indexOf("rgb") === 0) {
      if (color.indexOf("rgba") === -1) color += ",1"; // convert 'rgb(R,G,B)' to 'rgb(R,G,B)A' which looks awful but will pass the regxep below
      return color.match(/[\.\d]+/g).map((a) => {
        return +a;
      });
    }
  };

  render() {
    const pixelCanvas = [];
    for (let row = 0; row < tileSize; row++) {
      const pixelRow = [];
      for (let col = 0; col < tileSize; col++) {
        const pixelSquare = (
          <canvas
            key={col}
            width={pixelsPerPixel}
            height={pixelsPerPixel}
            onMouseDown={(e) => {
              this.pixels[row * tileSize + col] = this.state.isErasing
                ? transparent
                : this.state.color;
              this.redrawPixelSquareAt(row * tileSize + col);
            }}
            onMouseEnter={(e) => {
              if (this.isMouseDown) {
                this.pixels[row * tileSize + col] = this.state.isErasing
                  ? transparent
                  : this.state.color;
                this.redrawPixelSquareAt(row * tileSize + col);
              }
            }}
            ref={(canvas) => {
              if (!canvas) return;
              canvas.width = pixelsPerPixel;
              canvas.height = pixelsPerPixel;
              this.canvases[row * tileSize + col] = canvas;
              this.drawPixelSquare(canvas, row * tileSize + col, this.pixels[row * tileSize + col]);
            }}
          />
        );
        pixelRow.push(pixelSquare);
      }
      pixelCanvas.push(
        <div className="pixelRow" key={row}>
          {pixelRow}
        </div>
      );
    }
    return (
      <div className="u-flexColumn">
        <div className="u-flexRow u-spaceBetween">
          <div className="u-flexColumn u-marginLeft">
            <SketchPicker
              color={this.state.color}
              width={480}
              onChange={(color) => {
                this.setState({ color: color.hex });
              }}
              onChangeComplete={(color) => {
                this.setState({ color: color.hex });
              }}
            />
            <div className="u-flexRow u-spaceBetween u-marginTop">
              <div
                onClick={(e) => this.setState({ isErasing: false })}
                className={
                  (!this.state.isErasing ? "activeDesignerButton" : "") +
                  " u-clickable u-midFont u-padding designerButton"
                }
              >
                Draw
              </div>
              <div
                onClick={(e) => this.setState({ isErasing: true })}
                className={
                  (this.state.isErasing ? "activeDesignerButton" : "") +
                  " u-clickable u-midFont u-padding designerButton"
                }
              >
                Erase
              </div>
              <div
                onClick={(e) => {
                  this.pixels = arrOf(tileSize * tileSize, this.state.color);
                  this.redrawPixels();
                }}
                className="u-clickable u-midFont u-padding designerButton"
              >
                Fill
              </div>
              <div
                onClick={(e) => {
                  this.pixels = arrOf(tileSize * tileSize, transparent);
                  this.redrawPixels();
                }}
                className="u-clickable u-midFont u-padding designerButton"
              >
                Clear
              </div>
            </div>
          </div>
          <div className="pixelCanvas">{pixelCanvas}</div>
        </div>
        <div className="u-inputContainer u-marginTop">
          Upload an image
          <input
            className="u-input"
            type="file"
            name="files[]"
            accept="image/*"
            onChange={this.uploadImage}
          />
        </div>
        <div className="u-submitRow u-marginBottom">
          <div
            className="u-submitButton u-midFont u-marginTop submitButton"
            onClick={async (e) => {
              const clampedArr = new Uint8ClampedArray(4 * tileSize * tileSize);
              for (let i = 0; i < tileSize * tileSize; i++) {
                const colorArr = this.colorValues(this.pixels[i]);
                clampedArr[4 * i + 0] = colorArr[0];
                clampedArr[4 * i + 1] = colorArr[1];
                clampedArr[4 * i + 2] = colorArr[2];
                clampedArr[4 * i + 3] = 255 * colorArr[3];
              }
              const imData = new ImageData(clampedArr, tileSize, tileSize);
              const canvas = document.createElement("canvas");
              canvas.width = tileSize;
              canvas.height = tileSize;
              const ctx = canvas.getContext("2d");
              ctx.putImageData(imData, 0, 0);
              this.props.onSubmit(canvas.toDataURL());
            }}
          >
            Submit
          </div>
        </div>
      </div>
    );
  }
}

export default TileDesigner;
