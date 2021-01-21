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
    this.canvas = null;
    this.canvasWidth = 900;
    this.canvasHeight = 700;
    const emptyFn = () => {
      console.log("empty fn");
    };
    // for now, the only prop the play page should take is :levelId
    // also takes :didComeFromEditor prop
    // Initialize Default State
    this.state = {
      tiles: {}, // maps tileId to tile object, including actual images
      //            tile object has name, layer, image attributes
      fetching: {}, // tileIds -> true
      loaded: false,
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
    return this.canvas;
  };

  processUpdate = async (update) => {
    if (!this.state.loaded) {
      this.setState({ loaded: true });
    }
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
    drawPlayCanvas(this.getCanvas(), update, this.state.tiles);
  };

  render() {
    const loadingPage = <div>loading...</div>;
    const playContainer = (
      <div className="u-flexRow playContainer">
        <canvas
          ref={(canvas) => {
            if (!canvas) {
              console.log("no canvas play");
              return;
            }
            this.canvas = canvas;
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
          }}
        />
      </div>
    );
    return <>{this.state.loaded ? playContainer : loadingPage}</>;
  }
}

export default Play;
