import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { get, post } from "../../utilities.js";
import { Link } from "@reach/router";

import "../../utilities.css";
import "./MyLevels.css";
import Card from "../modules/Card.js";
import NavBar from "../modules/NavBar.js";

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

  render() {
    let levels = this.state.levels.map((level) => (
      <Card level={level} key={level._id} toEdit={true} />
    ));
    if (levels.length === 0) {
      levels = (
        <div>
          You don't have any level yet. Create a level by clicking on the corresponding button in
          the nav-bar above.
        </div>
      );
    }
    return (
      <div className="u-flexColumnReverse">
        <div className="u-page u-paddingBottom">
          <div className="u-header">Edit your levels</div>
          {levels}
        </div>
        <NavBar handleLogout={this.props.handleLogout} />
      </div>
    );
  }
}

export default MyLevels;
