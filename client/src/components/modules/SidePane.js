import React, { Component } from "react";

import "../../utilities.css";

class SidePane extends Component {
  constructor(props) {
    super(props);
    // props needed:
    // - tiles: tileId -> tile dictionary
    // - currentTile: id of current tile
    // callbacks:
    //  -  setCurrentTile
    //  -  displayTileDesigner
    this.state = {};
  }

  render() {
    const tileButtons = Object.keys(this.props.tiles).map((tileId) => {
      return (
        <li key={tileId}>
          <button
            onClick={(e) => {
              this.props.setCurrentTile(tileId);
            }}
          >
            {`Tile: ${tileId}`}
          </button>
        </li>
      );
    });
    return (
      <div className="u-flexColumn">
        <div>Side pane</div>
        <ul>{tileButtons}</ul>
        <div>Current tile: {this.props.currentTile}</div>
      </div>
    );
  }
}

export default SidePane;
