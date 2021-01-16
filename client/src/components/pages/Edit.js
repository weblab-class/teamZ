import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { get, post } from "../../utilities.js";
import { socket, addTile } from "../../client-socket";
import { drawEditCanvas } from "../../editCanvasManager";
import { initInput } from "../../editInput.js";

import "../../utilities.css";
import "./Edit.css";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "121479668229-t5j82jrbi9oejh7c8avada226s75bopn.apps.googleusercontent.com";

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

  processUpdate = (update) => {
    //before drawing, check if update includes any new tiles.
    const updateAvailableTiles = update.availableTiles;
    const tilesToFetch = [];
    for (let i = 0; i < updateAvailableTiles.length; i++) {
      const tileId = updateAvailableTiles[i];
      if (!(tileId in this.state.tiles)) {
        tilesToFetch.push(tileId);
      }
    }
    if (tilesToFetch.length > 0) {
      get("/tilesWithId", { tileIds: tilesToFetch }).then((tileDict) => {
        this.setState({ tiles: { ...this.state.tiles, ...tileDict } });
      });
    }
    drawEditCanvas(this.getCanvas(), update, this.state.tiles);
  };

  /**
   * @param image has to be an actual image
   */
  createTile = (tileName, layer, image) => {
    post("newTile", {
      name: tileName,
      layer: layer,
      image: image,
    }).then((tileId) => {
      // consider adding this new tile to state locally, without relying on api call
      addTile(tileId);
    });
  };

  render() {
    return (
      <div classname="u-flexRow">
        <div classname="u-flexColumn">
          <div>Save button, Go-Back button go here</div>
          <canvas ref={this.canvasRef} width={this.canvasWidth} height={this.canvasHeight} />
        </div>
        <div>Side pane goes here</div>
      </div>
    );
  }
}

export default Edit;
