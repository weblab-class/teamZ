import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { get, post } from "../../utilities.js";
import { socket, playModifyPlayer } from "../../client-socket";
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
    const emptyFn = () => {
      console.log("empty fn");
    };
    // for now, the only prop the play page should take is :levelId
    // also takes :didComeFromEditor prop
    // Initialize Default State
    this.fetching = {};
    this.lastFetchedCharSprite = null;
    this.charSprite = null;
    this.charSpriteImage = null;
    this.lastFetchedBackground = null;
    this.background = null;
    this.backgroundImage = null;
    this.clearInputFn = emptyFn;
    this.tiles = {};
    this.state = {
      loaded: false,
    };
  }

  componentDidMount() {
    // api calls here
    post("/api/joinGame", {
      levelId: this.props.levelId,
      canvasWidth: this.canvas ? this.canvas.width : 32,
      canvasHeight: this.canvas ? this.canvas.height : 32,
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
      if (!(tileId in this.tiles) && !(tileId in this.fetching)) {
        tilesToFetch.push(tileId);
        fetchingDict[tileId] = true;
      }
    }
    if (tilesToFetch.length > 0) {
      this.fetching = await Object.assign({}, this.fetching, fetchingDict);
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
              this.tiles[tileId] = {
                _id: tileObject._id,
                name: tileObject.name,
                layer: tileObject.layer,
                image: bitmap,
              };
            });
          };
          img.src = imString;
          console.log("img: ", img);
        });
      });
    }
    if (update.charSprite !== this.charSprite && update.charSprite !== this.lastFetchedCharSprite) {
      this.lastFetchedCharSprite = update.charSprite;
      if (update.charSprite === null) {
        this.charSprite = null;
        this.charSpriteImage = null;
      } else {
        console.log("update.charSprite: " + update.charSprite);
        post("/api/fetchImage", { patternId: update.charSprite }).then((imObj) => {
          const imString = imObj.image;
          const img = document.createElement("img");
          img.onload = () => {
            createImageBitmap(img).then((bitmap) => {
              this.charSprite = update.charSprite;
              this.charSpriteImage = bitmap;
            });
          };
          img.src = imString;
        });
      }
    }
    if (update.background !== this.background && update.background !== this.lastFetchedBackground) {
      this.lastFetchedBackground = update.background;
      if (update.background === null) {
        this.background = null;
        this.backgroundImage = null;
      } else {
        console.log("update.background: " + update.background);
        post("/api/fetchImage", { patternId: update.background }).then((imObj) => {
          const imString = imObj.image;
          const img = document.createElement("img");
          img.onload = () => {
            createImageBitmap(img).then((bitmap) => {
              this.background = update.background;
              this.backgroundImage = bitmap;
            });
          };
          img.src = imString;
        });
      }
    }
    drawPlayCanvas(
      this.getCanvas(),
      update,
      this.tiles,
      this.charSpriteImage,
      this.backgroundImage
    );
  };

  render() {
    const loadingPage = <div className="loadingPage">Loading ...</div>;
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
            playModifyPlayer({ canvasWidth: canvas.width, canvasHeight: canvas.height });
          }}
        />
      </div>
    );
    return <>{this.state.loaded ? playContainer : loadingPage}</>;
  }
}

export default Play;
