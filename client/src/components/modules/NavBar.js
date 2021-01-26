import React, { Component } from "react";
import { Link } from "@reach/router";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import CreateLevelForm from "./CreateLevelForm.js";

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
      <div className="navBarContainer u-flexRow">
        <div className="left u-flexRow">
          <Link className="u-clickable u-marginLeft u-smallFont navBarButton" to={"/"}>
            View published levels
          </Link>
          <Link className="u-clickable u-marginLeft u-smallFont navBarButton" to={"/my"}>
            Edit your levels
          </Link>
          <div
            className="u-clickable u-marginLeft u-smallFont navBarButton"
            onClick={(e) => {
              this.setState({ showingCreateLevelPopup: true });
            }}
          >
            + Create a level
          </div>
          <a
            className="u-clickable u-marginLeft u-smallFont navBarButton"
            target="_blank"
            rel="noopener noreferrer"
            href="/help"
          >
            Help
          </a>
        </div>
        <GoogleLogout
          clientId={GOOGLE_CLIENT_ID}
          buttonText="Logout"
          onLogoutSuccess={this.props.handleLogout}
          onFailure={(err) => console.log(err)}
        />
        {this.state.showingCreateLevelPopup ? (
          <CreateLevelForm onCancel={() => this.setState({ showingCreateLevelPopup: false })} />
        ) : null}
      </div>
    );
  }
}

export default NavBar;
