import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { get, post } from "../../utilities.js";
import { socket, playModifyPlayer, playRestartPlayer } from "../../client-socket";
import { drawPlayCanvas } from "../../playCanvasManager";
import { initInput } from "../../playInput.js";
import { Link } from "@reach/router";

import "../../utilities.css";
import "./Play.css";

import { tileSize, tileSizeOnCanvas, SOCKET_MESSAGE_TYPES } from "../../../../constants";

// page for playing a level
class Play extends Component {
  constructor(props) {
    super(props);
    // props: levelId, didComeFromEditor
    this.canvas = null;
    this.fetching = {};
    this.lastFetchedCharSprite = null;
    this.charSprite = null;
    this.charSpriteImage = null;
    this.charSpriteImageFlipped = null;
    this.lastFetchedBackground = null;
    this.background = null;
    this.backgroundImage = null;
    this.clearInputFn = () => {};
    this.tiles = {};
    this.state = {
      loaded: false,
    };
  }

  componentDidMount() {
    post("/api/joinGame", {
      levelId: this.props.levelId,
      canvasWidth: this.canvas ? this.canvas.width : 32,
      canvasHeight: this.canvas ? this.canvas.height : 32,
    }).then((garbage) => {
      const clearInputFn = initInput();
      this.setState({ clearInputFn: clearInputFn });
    });
    socket.on(SOCKET_MESSAGE_TYPES.PLAY_UPDATE, (update) => {
      this.processUpdate(update);
    });
  }

  componentWillUnmount() {
    this.state.clearInputFn();
    post("/api/removePlayerFromGame");
    socket.off(SOCKET_MESSAGE_TYPES.PLAY_UPDATE);
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
      post("/api/tilesWithId", { tileIds: tilesToFetch }).then((tileDict) => {
        Object.keys(tileDict).forEach((tileId) => {
          const tileObject = tileDict[tileId];
          const imString = tileObject.image;
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
        });
      });
    }
    if (update.charSprite !== this.charSprite && update.charSprite !== this.lastFetchedCharSprite) {
      this.lastFetchedCharSprite = update.charSprite;
      if (update.charSprite === null) {
        this.charSprite = null;
        this.charSpriteImage = null;
        this.charSpriteImageFlipped = null;
      } else {
        post("/api/fetchImage", { patternId: update.charSprite }).then((imObj) => {
          const imString = imObj.image;
          const img = document.createElement("img");
          img.onload = () => {
            createImageBitmap(img).then((bitmap) => {
              const canvasFlipped = document.createElement("canvas");
              const ctxFlipped = canvasFlipped.getContext("2d");
              canvasFlipped.width = tileSize;
              canvasFlipped.height = tileSize;
              ctxFlipped.translate(tileSize, 0);
              ctxFlipped.scale(-1, 1);
              ctxFlipped.drawImage(bitmap, 0, 0);
              createImageBitmap(canvasFlipped).then((bitmapFlipped) => {
                this.charSpriteImageFlipped = bitmapFlipped;
              });

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
      this.charSpriteImageFlipped,
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
              return;
            }
            this.canvas = canvas;
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            playModifyPlayer({ canvasWidth: canvas.width, canvasHeight: canvas.height });
          }}
        />
        <div className="playButtonsContainer">
          <Link
            className="u-clickable u-clickableSmall u-marginLeft playButton"
            to={this.props.didComeFromEditor === "true" ? "/edit/" + this.props.levelId : "/"}
          >
            Back
          </Link>
          <div
            className="u-clickable u-clickableSmall u-marginLeft playButton"
            onClick={(e) => {
              playRestartPlayer();
            }}
          >
            Retry
          </div>
        </div>
      </div>
    );
    return <>{this.state.loaded ? playContainer : loadingPage}</>;
  }
}

export default Play;
