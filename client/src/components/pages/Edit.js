import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { get, post } from "../../utilities.js";
import { socket, addTile, changeTile } from "../../client-socket";
import { drawEditCanvas } from "../../editCanvasManager";
import { initInput } from "../../editInput.js";
import { Link } from "@reach/router";

import SidePane from "../modules/SidePane.js";
import ToolBar from "../modules/ToolBar.js";

import "../../utilities.css";
import "./Edit.css";

//const tileSize = 16;
import { tileSize } from "../../../../constants";
class Edit extends Component {
  constructor(props) {
    super(props);
    this.canvas = null;
    this.canvasWidth = 900;
    this.canvasHeight = 700;
    const emptyFn = () => {
      console.log("empty fn");
    };
    // for now, the only prop the Edit page should take is :levelId
    // Initialize Default State
    this.state = {
      tiles: {}, // maps tileId to tile object, including actual images
      //            tile object has name, layer, image attributes
      fetching: {}, // tileIds -> true
      currentTile: "no current tile", // tileId of currentTile
      tempNewTileName: "",
      tempNewTileLayer: "Platform",
      tempNewTileR: 128,
      tempNewTileG: 128,
      tempNewTileB: 128,
      clearInputFn: emptyFn,
    };
  }

  componentDidMount() {
    // api calls here
    post("/api/joinLevel", {
      levelId: this.props.levelId,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
    }).then((garbage) => {
      const clearInputFn = initInput({ canvas: this.getCanvas() });
      this.setState({ clearInputFn: clearInputFn });
    });
    socket.on("update", (update) => {
      // console.log(`mouseX: ${update.mouseX}, mouseY: ${update.mouseY}`);
      this.processUpdate(update);
    });
  }

  componentWillUnmount() {
    this.state.clearInputFn();
  }

  getCanvas = () => {
    return this.canvas;
  };

  processUpdate = async (update) => {
    if (this.getCanvas() === null) return; //do nothing if no canvas
    //before drawing, check if update includes any new tiles.
    const updateAvailableTiles = update.availableTiles;
    const tilesToFetch = [];
    const fetchingDict = {};
    for (let i = 0; i < updateAvailableTiles.length; i++) {
      const tileId = updateAvailableTiles[i];
      if (!(tileId in this.state.tiles) && !(tileId in this.state.fetching)) {
        tilesToFetch.push(tileId);
        fetchingDict[tileId] = true;
      }
    }
    // if (tilesToFetch.length > 0) {
    //   console.log("tilesToFetch: " + tilesToFetch);
    //   console.log("tilesToFetchLength: " + tilesToFetch.length);
    //   console.log("first elem of tilesToFetch: " + tilesToFetch[0]);
    // }
    if (tilesToFetch.length > 0) {
      await this.setState((prevState) => {
        return {
          fetching: Object.assign({}, prevState.fetching, fetchingDict),
        };
      });
      // Object.keys(this.state.fetching).forEach((key) => {
      //   console.log("a key in fetching: " + key);
      // });
      post("/api/tilesWithId", { tileIds: tilesToFetch }).then(async (tileDict) => {
        // image is STRING
        // console.log("received tileDict from tilesWithID call");
        await Object.keys(tileDict).forEach((tileId) => {
          // console.log("one key in loop: " + tileId);
          const tileObject = tileDict[tileId];
          const imString = tileObject.image;
          console.log("got imString in edit.js: " + imString);
          const img = document.createElement("img");
          img.onload = () => {
            createImageBitmap(img).then((bitmap) => {
              // console.log("created butmap successfully: " + bitmap);
              const newEntry = {};
              newEntry[tileId] = {
                _id: tileObject._id,
                name: tileObject.name,
                layer: tileObject.layer,
                image: bitmap,
              };
              this.setState((prevState) => {
                return { tiles: Object.assign({}, prevState.tiles, newEntry) };
              });
            });
          };
          img.src = imString;
          console.log("img: ", img);
        });
      });
    }
    if (update.currentTile !== this.state.currentTile) {
      this.setState({ currentTile: update.currentTile });
    }
    drawEditCanvas(this.getCanvas(), update, this.state.tiles);
  };

  /**
   * @param image has to be a bas64 encoded string
   */
  createTile = (tileName, layer, image) => {
    // console.log(`TileName: ${tileName}, layer: ${layer}, image: ${image}`);
    post("/api/newTile", {
      name: tileName,
      layer: layer,
      image: image,
    }).then((tileId) => {
      // consider adding this new tile to state locally, without relying on api call
      // console.log("created tile with id: " + tileId);
      addTile(tileId);
    });
  };

  imagedataEncode = (imagedata) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = imagedata.width;
    canvas.height = imagedata.height;
    ctx.putImageData(imagedata, 0, 0);
    return canvas.toDataURL();
  };

  render() {
    return (
      <div className="u-flexColumn editPageContainer">
        <ToolBar
          levelId={this.props.levelId}
          onBack={() => {
            post("/api/save");
          }}
          onSave={() => {
            post("/api/save");
          }}
          onPlay={() => {
            post("/api/save");
          }}
        />
        <div className="u-flexRow">
          <div className="editorContainer">
            <canvas
              ref={(canvas) => {
                if (!canvas) {
                  console.log("no canvas edit");
                  return;
                }
                this.canvas = canvas;
                canvas.width = canvas.parentElement.offsetWidth;
                canvas.height = canvas.parentElement.offsetHeight;
              }}
            />
          </div>
          <SidePane
            tiles={this.state.tiles}
            currentTile={this.state.currentTile}
            setCurrentTile={(tileId) => {
              changeTile(tileId);
            }}
            displayTileDesigner={() => {
              /* TODO */
            }}
          />
        </div>

        <div>
          Temporary tile creator
          <textarea
            type="text"
            placeholder="TileName"
            value={this.state.tempNewTileName}
            onChange={(e) => this.setState({ tempNewTileName: e.target.value })}
          ></textarea>
          <textarea
            type="text"
            placeholder="TileLayer"
            value={this.state.tempNewTileLayer}
            onChange={(e) => this.setState({ tempNewTileLayer: e.target.value })}
          ></textarea>
          <textarea
            type="text"
            placeholder="TileR"
            value={this.state.tempNewTileR}
            onChange={(e) => this.setState({ tempNewTileR: parseInt(e.target.value) })}
          ></textarea>
          <textarea
            type="text"
            placeholder="TileG"
            value={this.state.tempNewTileG}
            onChange={(e) => this.setState({ tempNewTileG: parseInt(e.target.value) })}
          ></textarea>
          <textarea
            type="text"
            placeholder="TileB"
            value={this.state.tempNewTileB}
            onChange={(e) => this.setState({ tempNewTileB: parseInt(e.target.value) })}
          ></textarea>
          <button
            type="submit"
            onClick={(e) => {
              const arr = new Uint8ClampedArray(4 * tileSize * tileSize);
              for (let i = 0; i < 4 * tileSize * tileSize; i += 4) {
                arr[i + 0] = this.state.tempNewTileR;
                arr[i + 1] = this.state.tempNewTileG;
                arr[i + 2] = this.state.tempNewTileB;
                arr[i + 3] = 255;
              }
              const imData = new ImageData(arr, tileSize, tileSize);
              const base64String = this.imagedataEncode(imData);
              this.createTile(
                this.state.tempNewTileName,
                this.state.tempNewTileLayer,
                base64String
              );
            }}
          >
            Add tile
          </button>
        </div>
      </div>
    );
  }
}

export default Edit;
