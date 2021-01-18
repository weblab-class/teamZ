import React, { Component } from "react";

import "../../utilities.css";

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
    const refDict = {};
    Object.keys(props.tiles).forEach((tileId) => {
      refDict[tileId] = React.createRef();
    });
    this.state = {
      layer: "Platform",
      refDict: refDict,
    };
  }

  componentDidMount() {
    Object.keys(this.state.refDict).forEach((tileId) => {
      const canvas = this.refDict[tileId].current;
      const context = canvas.getContext("2d");
      const im = this.props.tiles[tileId].image;
      context.drawImage(im, 0, 0, tileButtonSize, tileButtonSize);
    });
  }

  componentDidUpdate(prevProps) {
    if (Object.keys(prevProps.tiles).length !== Object.keys(this.props.tiles).length) {
      const refDict = {};
      Object.keys(this.state.refDict).forEach((tileId) => {
        refDict[tileId] = this.state.refDict[tileId];
      });
      Object.keys(this.props.tiles).forEach((tileId) => {
        refDict[tileId] = React.createRef();
      });
      this.setState({ refDict: refDict }, () => {
        Object.keys(this.state.refDict).forEach((tileId) => {
          const canvas = this.state.refDict[tileId].current;
          const context = canvas.getContext("2d");
          const im = this.props.tiles[tileId].image;
          context.drawImage(im, 0, 0, tileButtonSize, tileButtonSize);
        });
      });
    }
  }

  render() {
    const tileButtons = Object.keys(this.props.tiles)
      .filter((tileId) => {
        return this.props.tiles[tileId].layer === this.state.layer;
      })
      .map((tileId) => {
        return (
          <div
            className="tileButton"
            key={tileId}
            onClick={(e) => {
              this.props.setCurrentTile(tileId);
            }}
          >
            {this.props.tiles[tileId].name}
            <canvas
              width={tileButtonSize}
              height={tileButtonSize}
              ref={this.state.refDict[tileId]}
            />
          </div>
        );
      });
    return (
      <div className="u-flexColumn">
        tile select
        <div
          onClick={(e) => {
            this.setState({ layer: this.state.layer === "Platform" ? "Background" : "Platform" });
          }}
        >
          {this.state.layer}
        </div>
        <div>{tileButtons}</div>
        <div>
          Current tile:{" "}
          {this.props.currentTile in this.props.tiles
            ? this.props.tiles[this.props.currentTile].name
            : "badTile :("}
        </div>
        <button
          onClick={(e) => {
            this.props.displayTileDesigner();
          }}
        >
          Create new tile
        </button>
      </div>
    );
  }
}

export default SidePane;
