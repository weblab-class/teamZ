import React, { Component } from "react";
import { SketchPicker } from "react-color";

import "../../utilities.css";
import "./TileDesigner.css";

import { tileSize } from "../../../../constants.js";

const pixelsPerPixel = 36;
const transparent = "rgba(0,0,0,0)";

const arrOf = (len, val) => {
  const ret = [];
  for (let i = 0; i < len; i++) {
    ret.push(val);
  }
  return ret;
};

class TileDesigner extends Component {
  constructor(props) {
    super(props);
    this.isMouseDown = false;
    const pixels = arrOf(tileSize * tileSize, transparent);
    this.state = {
      // TODO: initialize state
      color: "rgba(255,255,255,1)",
      isErasing: false,
      pixels: pixels,
    };
  }
  registerMouseDown = (e) => {
    // console.log("mouseDown");
    this.isMouseDown = true;
  };
  registerMouseUp = (e) => {
    // console.log("mouseUp");
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
          // console.log("imArr len: ", imArr.length);
          // console.log("imArr first elem ", imArr[0]);
          this.setState({ pixels: imArr });
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
    context.fillStyle = "rgba(0, 0, 0, 1)"; // hard code init black fill for now
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  changePixelSquare = (index, color) => {
    const pixelsCopy = [...this.state.pixels];
    pixelsCopy[index] = color;
    this.setState({ pixels: pixelsCopy });
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
              this.changePixelSquare(
                row * tileSize + col,
                this.state.isErasing ? transparent : this.state.color
              );
            }}
            onMouseEnter={(e) => {
              if (this.isMouseDown) {
                this.changePixelSquare(
                  row * tileSize + col,
                  this.state.isErasing ? transparent : this.state.color
                );
              }
            }}
            ref={(canvas) => {
              if (!canvas) return;
              canvas.width = pixelsPerPixel;
              canvas.height = pixelsPerPixel;
              this.drawPixelSquare(
                canvas,
                row * tileSize + col,
                this.state.pixels[row * tileSize + col]
              );
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
              width={560}
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
                onClick={(e) =>
                  this.setState({ pixels: arrOf(tileSize * tileSize, this.state.color) })
                }
                className="u-clickable u-midFont u-padding designerButton"
              >
                Fill
              </div>
              <div
                onClick={(e) => this.setState({ pixels: arrOf(tileSize * tileSize, transparent) })}
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
                const colorArr = this.colorValues(this.state.pixels[i]);
                // console.log("colorArr: ", colorArr);
                clampedArr[4 * i + 0] = colorArr[0];
                clampedArr[4 * i + 1] = colorArr[1];
                clampedArr[4 * i + 2] = colorArr[2];
                clampedArr[4 * i + 3] = 255 * colorArr[3];
                // for (let j = 0; j < colorArr.length; j++) {
                //   clampedArr[i + j] = colorArr[j];
                // }
              }
              const imData = new ImageData(clampedArr, tileSize, tileSize);
              console.log("imData: ", imData);
              const canvas = document.createElement("canvas");
              canvas.width = tileSize;
              canvas.height = tileSize;
              const ctx = canvas.getContext("2d");
              ctx.putImageData(imData, 0, 0);
              console.log(canvas.toDataURL());
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
