import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { get, post } from "../../utilities.js";
import { socket, addTile, changeTile } from "../../client-socket";
import { drawEditCanvas } from "../../editCanvasManager";
import { initInput } from "../../editInput.js";

import SidePane from "../modules/SidePane.js";

import "../../utilities.css";
import "./Edit.css";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "121479668229-t5j82jrbi9oejh7c8avada226s75bopn.apps.googleusercontent.com";

const tileSize = 16;
class Edit extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.canvasWidth = 900;
    this.canvasHeight = 700;
    // for now, the only prop the Edit page should take is :levelId
    // Initialize Default State
    this.state = {
      tiles: {}, // maps tileId to tile object, including actual images
      //            tile object has name, layer, image attributes
      fetching: {},
      currentTile: "no current tile", // tileId of currentTile
      tempNewTileName: "",
      tempNewTileLayer: "Platform",
      tempNewTileR: 128,
      tempNewTileG: 128,
      tempNewTileB: 128,
    };
  }

  componentDidMount() {
    // api calls here
    post("/api/joinLevel", {
      levelId: this.props.levelId,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
    }).then((garbage) => {
      initInput({ canvas: this.getCanvas() });
    });
    socket.on("update", (update) => {
      // console.log(`mouseX: ${update.mouseX}, mouseY: ${update.mouseY}`);
      this.processUpdate(update);
    });
  }

  getCanvas = () => {
    return this.canvasRef.current;
  };

  processUpdate = async (update) => {
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
    if (tilesToFetch.length > 0) {
      console.log("tilesToFetch: " + tilesToFetch);
      console.log("tilesToFetchLength: " + tilesToFetch.length);
      console.log("first elem of tilesToFetch: " + tilesToFetch[0]);
    }
    if (tilesToFetch.length > 0) {
      await this.setState((prevState) => {
        return {
          fetching: Object.assign({}, prevState.fetching, fetchingDict),
        };
      });
      Object.keys(this.state.fetching).forEach((key) => {
        console.log("a key in fetching: " + key);
      });
      post("/api/tilesWithId", { tileIds: tilesToFetch }).then(async (tileDict) => {
        console.log("received tileDict from tilesWithID call");
        const newTiles = {};
        await Object.keys(tileDict).forEach((tileId) => {
          console.log("one key in loop: " + tileId);
          const tileObject = tileDict[tileId];
          const imArray = tileObject.image;
          const imArrayClamped = new Uint8ClampedArray(imArray.length);
          for (let i = 0; i < imArray.length; i++) {
            imArrayClamped[i] = imArray[i];
          }
          const tileImageData = new ImageData(imArrayClamped, tileObject.width, tileObject.height);
          createImageBitmap(tileImageData).then((bitmap) => {
            console.log("created butmap successfully: " + bitmap);
            newTiles[tileId] = {
              _id: tileObject._id,
              name: tileObject.name,
              layer: tileObject.layer,
              image: bitmap,
            };
          });
        });
        console.log("newTiles len: " + Object.keys(newTiles).length);
        await this.setState((prevState) => {
          return { tiles: Object.assign({}, prevState.tiles, newTiles) };
        });
        console.log("new state tiles len: " + Object.keys(this.state.tiles).length);
        if (Object.keys(this.state.tiles).length > 0) {
          console.log("state tiles: " + this.state.tiles);
        }
      });
    }
    if (update.currentTile !== this.state.currentTile) {
      this.setState({ currentTile: update.currentTile });
    }
    drawEditCanvas(this.getCanvas(), update, this.state.tiles);
  };

  /**
   * @param image has to be an actual image ||| FOR NOW image is just array
   */
  createTile = (tileName, layer, image) => {
    // console.log(`TileName: ${tileName}, layer: ${layer}, image: ${image}`);
    post("/api/newTile", {
      name: tileName,
      layer: layer,
      image: image,
    }).then((tileId) => {
      // consider adding this new tile to state locally, without relying on api call
      console.log("created tile with id: " + tileId);
      addTile(tileId);
    });
  };

  render() {
    return (
      <div className="u-flexRow">
        <div className="u-flexColumn">
          <div>Save button, Go-Back button go here</div>
          <canvas ref={this.canvasRef} width={this.canvasWidth} height={this.canvasHeight} />
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
              const arr = [];
              for (let i = 0; i < 4 * tileSize * tileSize; i += 4) {
                arr.push(this.state.tempNewTileR);
                arr.push(this.state.tempNewTileG);
                arr.push(this.state.tempNewTileB);
                arr.push(255);
              }
              this.createTile(this.state.tempNewTileName, this.state.tempNewTileLayer, arr);
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
