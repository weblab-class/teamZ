import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { get, post } from "../../utilities.js";
import { Link } from "@reach/router";

import "../../utilities.css";
import "./PublishedLevels.css";
import Card from "../modules/Card.js";
import NavBar from "../modules/NavBar.js";

class PublishedLevels extends Component {
  constructor(props) {
    super(props);
    this.state = { levels: [] };
  }

  componentDidMount() {
    // fetch all levels
    this.loadLevels();
  }

  loadLevels = () => {
    get("/api/levels", { isPublished: true }).then((levels) => this.setState({ levels: levels }));
  };

  render() {
    let levels = this.state.levels.map((level) => (
      <Card key={level._id} level={level} toEdit={false} />
    ));
    return (
      <div className="u-flexColumnReverse">
        <div className="u-page u-paddingBottom">
          <div className="u-header">Play published levels</div>
          {levels}
        </div>{" "}
        <NavBar handleLogout={this.props.handleLogout} />
      </div>
    );
  }
}

export default PublishedLevels;
