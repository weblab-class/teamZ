import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { get, post } from "../../utilities.js";
import {
  socket,
  addTile,
  changeTile,
  enableEdit,
  disableEdit,
  modifyLevel,
  modifyPlayer,
} from "../../client-socket";
import { drawEditCanvas } from "../../editCanvasManager";
import { SOCKET_MESSAGE_TYPES } from "../../../../constants";
import { initInput } from "../../editInput.js";
import { Link } from "@reach/router";

import SidePane from "../modules/SidePane.js";
import ToolBar from "../modules/ToolBar.js";
import SettingsPane from "../modules/SettingsPane.js";
import TileDesignerModal from "../modules/TileDesignerModal.js";

import "../../utilities.css";
import "./Edit.css";

// The level editor page.
class Edit extends Component {
  constructor(props) {
    super(props);
    this.canvas = null;
    // the only prop the Edit page should take is `levelId`
    // Initialize Default State
    this.fetching = {}; // the set of tileIds that this component has ever sent a fetch request for.
    this.lastFetchedCharSprite = null; // the id of the last pattern this component has sent a fetch for.
    this.lastFetchedBackground = null;
    this.clearInputFn = () => {};
    this.state = {
      tiles: {}, // maps tileId to tile object, including actual images
      //         // tile object has name, layer, image attributes
      charSprite: null,
      charSpriteImage: null,
      background: null,
      backgroundImage: null,
      currentTile: null, // tileId of currentTile
      title: "",
      description: "",
      rows: 0,
      cols: 0,
      isPublished: false,
      isSettingsPaneOpen: false,
      isTileDesignerModalOpen: false,
    };
  }

  componentDidMount() {
    post("/api/joinLevel", {
      levelId: this.props.levelId,
      canvasWidth: this.canvas ? this.canvas.width : 32,
      canvasHeight: this.canvas ? this.canvas.height : 32,
    }).then((garbage) => {
      const clearInputFn = initInput({ canvas: this.getCanvas() });
      this.clearInputFn = clearInputFn;
    });
    socket.on(SOCKET_MESSAGE_TYPES.EDIT_UPDATE, (update) => {
      this.processUpdate(update);
    });
  }

  componentWillUnmount() {
    this.clearInputFn();
    post("/api/removePlayer");
    socket.off(SOCKET_MESSAGE_TYPES.EDIT_UPDATE);
  }

  getCanvas = () => {
    return this.canvas;
  };

  processUpdate = (update) => {
    if (this.getCanvas() === null) return; //do nothing if no canvas
    //before drawing, check if update includes any new tiles.
    const updateAvailableTiles = update.availableTiles;
    const tilesToFetch = [];
    const fetchingDict = {};
    for (let i = 0; i < updateAvailableTiles.length; i++) {
      const tileId = updateAvailableTiles[i];
      if (!(tileId in this.state.tiles) && !(tileId in this.fetching)) {
        tilesToFetch.push(tileId);
        fetchingDict[tileId] = true;
      }
    }
    if (tilesToFetch.length > 0) {
      this.fetching = Object.assign({}, this.fetching, fetchingDict);
      post("/api/tilesWithId", { tileIds: tilesToFetch }).then((tileDict) => {
        Object.keys(tileDict).forEach((tileId) => {
          const tileObject = tileDict[tileId];
          const imString = tileObject.image;
          const img = document.createElement("img");
          img.onload = () => {
            createImageBitmap(img).then((bitmap) => {
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
        });
      });
    }
    if (
      update.charSprite !== this.state.charSprite &&
      update.charSprite !== this.lastFetchedCharSprite
    ) {
      this.lastFetchedCharSprite = update.charSprite;
      if (update.charSprite === null) {
        this.setState((prevState) => {
          return { charSprite: null, charSpriteImage: null };
        });
      } else {
        post("/api/fetchImage", { patternId: update.charSprite }).then((imObj) => {
          const imString = imObj.image;
          const img = document.createElement("img");
          img.onload = () => {
            createImageBitmap(img).then((bitmap) => {
              this.setState((prevState) => {
                return { charSprite: update.charSprite, charSpriteImage: bitmap };
              });
            });
          };
          img.src = imString;
        });
      }
    }
    if (
      update.background !== this.state.background &&
      update.background !== this.lastFetchedBackground
    ) {
      this.lastFetchedBackground = update.background;
      if (update.background === null) {
        this.setState((prevState) => {
          return { background: null, backgroundImage: null };
        });
      } else {
        post("/api/fetchImage", { patternId: update.background }).then((imObj) => {
          const imString = imObj.image;
          const img = document.createElement("img");
          img.onload = () => {
            createImageBitmap(img).then((bitmap) => {
              this.setState((prevState) => {
                return { background: update.background, backgroundImage: bitmap };
              });
            });
          };
          img.src = imString;
        });
      }
    }
    if (update.currentTile !== this.state.currentTile) {
      this.setState({ currentTile: update.currentTile });
    }
    if (update.title !== this.state.title) {
      this.setState({ title: update.title });
    }
    if (update.description !== this.state.description) {
      this.setState({ description: update.description });
    }
    if (update.isPublished !== this.state.isPublished) {
      this.setState({ isPublished: update.isPublished });
    }
    if (update.rows !== this.state.rows) {
      this.setState({ rows: update.rows });
    }
    if (update.cols !== this.state.cols) {
      this.setState({ cols: update.cols });
    }
    drawEditCanvas(
      this.getCanvas(),
      update,
      this.state.tiles,
      this.state.charSpriteImage,
      this.state.backgroundImage
    );
  };

  /**
   * @param image has to be a base64 encoded string
   */
  createTile = (tileName, layer, image) => {
    post("/api/newTile", {
      name: tileName,
      layer: layer,
      image: image,
    }).then((tileId) => {
      addTile(tileId);
    });
  };

  changeAttr = (image, attr) => {
    if (image === null) {
      modifyLevel({ [attr]: null });
      return;
    }
    post("/api/newImage", {
      image: image,
    }).then((patternId) => {
      modifyLevel({ [attr]: patternId });
    });
  };

  changeCharSprite = (image) => {
    this.changeAttr(image, "charSprite");
  };

  changeBackground = (image) => {
    this.changeAttr(image, "background");
  };

  render() {
    return (
      <div className="u-flexColumn editPageContainer">
        <ToolBar
          levelId={this.props.levelId}
          onBack={() => {
            return post("/api/save");
          }}
          onSave={() => {
            return post("/api/save");
          }}
          onPlay={() => {
            return post("/api/save");
          }}
          onOpenSettings={() => {
            this.setState({ isSettingsPaneOpen: true }, () => {
              disableEdit();
            });
          }}
        />
        <div className="u-flexRow editRow">
          <div className="editorContainer">
            <canvas
              ref={(canvas) => {
                if (!canvas) {
                  return;
                }
                this.canvas = canvas;
                canvas.width = canvas.parentElement.offsetWidth;
                canvas.height = canvas.parentElement.offsetHeight;
                modifyPlayer({
                  canvasWidth: canvas.width,
                  canvasHeight: canvas.height,
                });
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
              this.setState({ isTileDesignerModalOpen: true }, () => {
                disableEdit();
              });
            }}
          />
        </div>
        {this.state.isSettingsPaneOpen ? (
          <SettingsPane
            title={this.state.title}
            description={this.state.description}
            isPublished={this.state.isPublished}
            rows={this.state.rows}
            cols={this.state.cols}
            changeCharSprite={this.changeCharSprite}
            changeBackground={this.changeBackground}
            onCancel={() => {
              this.setState({ isSettingsPaneOpen: false }, () => {
                enableEdit();
              });
            }}
          />
        ) : null}
        {this.state.isTileDesignerModalOpen ? (
          <TileDesignerModal
            onSubmit={this.createTile}
            onCancel={() => {
              this.setState({ isTileDesignerModalOpen: false }, () => {
                enableEdit();
              });
            }}
          />
        ) : null}
      </div>
    );
  }
}

export default Edit;
