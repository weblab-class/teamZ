import React, { Component } from "react";
import { Link } from "@reach/router";

import "../../utilities.css";
import "./NavBar.css";

const GOOGLE_CLIENT_ID = "968597986163-jb2ki4cdo7df3jfui7j1vshv8vc2j3dp.apps.googleusercontent.com";
class NavBar extends Component {
  constructor(props) {
    super(props);
    // prop: handleLogout
    this.state = {
      showingCreateLevelPopup: false,
    };
  }

  render() {
    return (
      <div className="navBarContainer">
        NavBar
        <div>left</div>
        <GoogleLogout
          clientId={GOOGLE_CLIENT_ID}
          buttonText="Logout"
          onLogoutSuccess={this.props.handleLogout}
          onFailure={(err) => console.log(err)}
        />
      </div>
    );
  }
}

export default NavBar;
