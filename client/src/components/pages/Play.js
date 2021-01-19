import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { get, post } from "../../utilities.js";
import { socket } from "../../client-socket";
import { drawPlayCanvas } from "../../playCanvasManager";
import { initInput } from "../../playInput.js";
import { Link } from "@reach/router";

import "../../utilities.css";
import "./Play.css";

import { tileSize, tileSizeOnCanvas } from "../../../../constants";
class Play extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.canvasWidth = 900;
    this.canvasHeight = 700;
    const emptyFn = () => {
      console.log("empty fn");
    };
    // for now, the only prop the play page should take is :levelId
    // Initialize Default State
    this.state = {
      tiles: {}, // maps tileId to tile object, including actual images
      //            tile object has name, layer, image attributes
      fetching: {}, // tileIds -> true
      clearInputFn: emptyFn,
    };
  }

  componentDidMount() {
    // api calls here
    post("/api/joinGame", {
      levelId: this.props.levelId,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
    }).then((garbage) => {
      const clearInputFn = initInput();
      this.setState({ clearInputFn: clearInputFn });
    });
    socket.on("playUpdate", (update) => {
      this.processUpdate(update);
    });
  }

  componentWillUnmount() {
    this.state.clearInputFn();
    post("/api/removePlayerFromGame");
  }

  getCanvas = () => {
    return this.canvasRef.current;
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
        // console.log("received tileDict from tilesWithID call");
        const newTiles = {};
        await Object.keys(tileDict).forEach((tileId) => {
          // console.log("one key in loop: " + tileId);
          const tileObject = tileDict[tileId];
          const imArray = tileObject.image;
          const imArrayClamped = new Uint8ClampedArray(imArray.length);
          for (let i = 0; i < imArray.length; i++) {
            imArrayClamped[i] = imArray[i];
          }
          const tileImageData = new ImageData(imArrayClamped, tileObject.width, tileObject.height);
          createImageBitmap(tileImageData).then((bitmap) => {
            // console.log("created butmap successfully: " + bitmap);
            newTiles[tileId] = {
              _id: tileObject._id,
              name: tileObject.name,
              layer: tileObject.layer,
              image: bitmap,
            };
          });
        });
        // console.log("newTiles len: " + Object.keys(newTiles).length);
        await this.setState((prevState) => {
          return { tiles: Object.assign({}, prevState.tiles, newTiles) };
        });
        // console.log("new state tiles len: " + Object.keys(this.state.tiles).length);
        // if (Object.keys(this.state.tiles).length > 0) {
        //   console.log("state tiles: " + this.state.tiles);
        // }
      });
    }
    if (update.currentTile !== this.state.currentTile) {
      this.setState({ currentTile: update.currentTile });
    }
    drawPlayCanvas(this.getCanvas(), update, this.state.tiles);
  };

  render() {
    return (
      <div className="u-flexRow">
        <canvas ref={this.canvasRef} width={this.canvasWidth} height={this.canvasHeight} />
      </div>
    );
  }
}

export default Play;
