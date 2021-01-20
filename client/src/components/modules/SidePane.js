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
    const tileButtons = Object.keys(this.props.tiles)
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
    return (
      <div className="u-flexColumn sidePaneContainer">
        <div
          className="u-clickable layerSwitchButton"
          onClick={(e) => {
            this.setState({ layer: this.state.layer === "Platform" ? "Background" : "Platform" });
          }}
        >
          {this.state.layer}
        </div>
        <div className="tileButtonContainer">{tileButtons}</div>
        <div className="currentBlockContainer">
          {this.props.currentTile in this.props.tiles
            ? this.props.tiles[this.props.currentTile].name
            : "Eraser"}
          <canvas
            width="128"
            height="128"
            ref={(canvas) => {
              if (!canvas) {
                console.log("no canvas (currentTile)");
                return;
              } else {
                const context = canvas.getContext("2d");
                if (this.props.currentTile in this.props.tiles) {
                  // draw
                  const im = this.props.tiles[this.props.currentTile].image;
                  context.drawImage(im, 0, 0, canvas.width, canvas.height);
                }
              }
            }}
          />
        </div>
        <div
          className="u-clickable"
          onClick={(e) => {
            this.props.displayTileDesigner();
          }}
        >
          Create new tile
        </div>
      </div>
    );
  }
}

export default SidePane;
