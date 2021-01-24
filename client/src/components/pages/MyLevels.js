import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { get, post } from "../../utilities.js";
import { Link } from "@reach/router";

import "../../utilities.css";
import "./MyLevels.css";
import Card from "../modules/Card.js";
import NavBar from "../modules/NavBar.js";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "968597986163-jb2ki4cdo7df3jfui7j1vshv8vc2j3dp.apps.googleusercontent.com";

class MyLevels extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = { levels: [] };
  }

  componentDidMount() {
    // fetch all levels
    this.loadLevels();
  }

  loadLevels = () => {
    get("/api/levels", { creator: this.props.userId }).then((levels) =>
      this.setState({ levels: levels })
    );
  };

  // /**
  //  * Creates a new level with some hard-coded default settings,
  //  * but with the title specified in the state.
  //  */
  // newLevel = async () => {
  //   const rows = this.state.newLevelRows;
  //   const cols = this.state.newLevelCols;
  //   const emptyTile = await post("/api/emptyTile");
  //   const gridTiles = [];
  //   for (let i = 0; i < rows * cols; i++) {
  //     gridTiles.push(null);
  //   }
  //   await post("/api/newLevel", {
  //     title: this.state.newLevelTitle,
  //     description: "hard coded description",
  //     creator: this.props.userId,
  //     rows: rows,
  //     cols: cols,
  //     gridTiles: gridTiles,
  //     availableTiles: [],
  //     startX: 0,
  //     startY: 0,
  //     charSprite: null,
  //     background: null,
  //   });
  //   this.setState({ newLevelTitle: "", newLevelRows: 10, newLevelCols: 10 });
  //   this.loadLevels();
  // };

  render() {
    let levels = this.state.levels.map((level) => (
      <Card level={level} key={level._id} toEdit={true} />
    ));
    return (
      <div className="u-flexColumnReverse">
        <div className="u-page">
          <div className="u-header">Edit your levels</div>
          {levels}
        </div>
        <NavBar handleLogout={this.props.handleLogout} />
      </div>
    );
  }
}

export default MyLevels;
