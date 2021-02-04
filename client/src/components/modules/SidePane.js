import React, { Component } from "react";

import "../../utilities.css";
import "./SidePane.css";

const tileButtonSize = 64;
class SidePane extends Component {
  constructor(props) {
    super(props);
    // props needed:
    // - tiles: tileId -> tile dictionary
    // - currentTile: id of current tile
    // callbacks:
    //  -  setCurrentTile
    //  -  displayTileDesigner
    this.state = {
      layer: "Platform",
    };
  }

  render() {
    let tileButtons = Object.keys(this.props.tiles)
      .filter((tileId) => {
        return this.props.tiles[tileId].layer === this.state.layer;
      })
      .map((tileId) => {
        return (
          <div
            className="u-clickable tileButton"
            key={tileId}
            onClick={(e) => {
              this.props.setCurrentTile(tileId);
            }}
          >
            <canvas
              width={tileButtonSize}
              height={tileButtonSize}
              ref={(canvas) => {
                if (!canvas) {
                  console.log("no canvas");
                  return;
                } else {
                  const context = canvas.getContext("2d");
                  context.imageSmoothingEnabled = false;
                  if (tileId in this.props.tiles) {
                    // draw
                    const im = this.props.tiles[tileId].image;
                    context.drawImage(im, 0, 0, canvas.width, canvas.height);
                  }
                }
              }}
            />
          </div>
        );
      });
    if (tileButtons.length === 0) {
      tileButtons = (
        <div className="u-italic u-padding">
          You don't have any tile yet for this layer. Create one with the button below.
        </div>
      );
    }
    return (
      <div className="u-flexColumn sidePaneContainer">
        <div
          className="u-clickable u-clickableMid u-chocoThemed layerSwitchButton u-flexColumn"
          onClick={(e) => {
            this.setState({ layer: this.state.layer === "Platform" ? "Background" : "Platform" });
          }}
        >
          {this.state.layer}
          <div className="u-italic u-superSmallFont">(Click to switch layer)</div>
        </div>
        <div className="tileButtonContainer u-chocoThemed">{tileButtons}</div>
        <div className="currentBlockContainer u-chocoThemed">
          {this.props.currentTile in this.props.tiles
            ? this.props.tiles[this.props.currentTile].name
            : "Eraser"}
          <canvas
            width="120"
            height="120"
            ref={(canvas) => {
              if (!canvas) {
                console.log("no canvas (currentTile)");
                return;
              } else {
                const context = canvas.getContext("2d");
                context.imageSmoothingEnabled = false;
                if (this.props.currentTile in this.props.tiles) {
                  // draw
                  const im = this.props.tiles[this.props.currentTile].image;
                  context.clearRect(0, 0, canvas.width, canvas.height);
                  context.drawImage(im, 0, 0, canvas.width, canvas.height);
                } else {
                  // eraser tile is blank for now:
                  context.clearRect(0, 0, canvas.width, canvas.height);
                }
              }
            }}
          />
        </div>
        <div
          className="u-clickable u-clickableMid u-chocoThemed addTileButton"
          onClick={(e) => {
            this.props.displayTileDesigner();
          }}
        >
          + Add Tile
        </div>
      </div>
    );
  }
}

export default SidePane;
