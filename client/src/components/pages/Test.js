import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { get, post } from "../../utilities.js";

import "../../utilities.css";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "121479668229-t5j82jrbi9oejh7c8avada226s75bopn.apps.googleusercontent.com";

class Test extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {
      newLevelTitle: "",
      levels: [],
    };
  }

  componentDidMount() {
    // fetch all levels
    this.loadLevels();
  }

  loadLevels = () => {
    get("/api/levels", {}).then((levels) => this.setState({ levels: levels }));
  };

  /**
   * Creates a new level with some hard-coded default settings,
   * but with the title specified in the state.
   */
  newLevel = async () => {
    const rows = 10;
    const cols = 10;
    //create an empty tile first for the level
    const emptyTile = await post("/api/newTile", {
      name: "emptyTile",
      layer: "None",
      image: null,
    });
    const gridTiles = [];
    for (let i = 0; i < rows * cols; i++) {
      gridTiles.push(emptyTile._id);
    }
    await post("/api/newLevel", {
      title: this.state.newLevelTitle,
      creator: this.props.userId,
      emptyTile: emptyTile._id,
      rows: rows,
      cols: cols,
      gridTiles: gridTiles,
      availableTiles: [],
    });
    this.setState({ newLevelTitle: "" });
    this.loadLevels();
  };

  render() {
    let levels = this.state.levels.map((level, i) => <li key={i}>{level.title}</li>);
    return (
      <>
        {this.props.userId ? (
          <GoogleLogout
            clientId={GOOGLE_CLIENT_ID}
            buttonText="Logout"
            onLogoutSuccess={this.props.handleLogout}
            onFailure={(err) => console.log(err)}
          />
        ) : (
          <GoogleLogin
            clientId={GOOGLE_CLIENT_ID}
            buttonText="Login"
            onSuccess={this.props.handleLogin}
            onFailure={(err) => console.log(err)}
          />
        )}
        <div>You have reached the test page.</div>
        <div>
          Create a new level here:
          <textarea
            type="text"
            placeholder="Title here"
            value={this.state.newLevelTitle}
            onChange={(e) => this.setState({ newLevelTitle: e.target.value })}
          ></textarea>
          <button type="submit" onClick={(e) => this.newLevel()}>
            Create level
          </button>
        </div>
        <ul>{levels}</ul>
      </>
    );
  }
}

export default Test;
