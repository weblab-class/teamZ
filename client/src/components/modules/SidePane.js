import React, { Component } from "react";

import "../../utilities.css";

class SidePane extends Component {
  constructor(props) {
    super(props);
    // props needed:
    // - tileId -> tile dictionary
    // id of current tile
    // callbacks:
    //  -  setCurrentTile
    //  -  displayTileDesigner
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return <div classname="u-flexColumn">Side pane</div>;
  }
}

export default SidePane;
