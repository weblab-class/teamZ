import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";

import grassRow from "../../public/grassRow.png";

import "../../utilities.css";
import "./Landing.css";

import { GOOGLE_CLIENT_ID } from "../../../../constants.js";

class Landing extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const googleLoginButton = this.props.userId ? (
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
    );
    return (
      <div className="landingPageContainer">
        <div className="topBar">
          <div className="topText">playPix</div>
          {googleLoginButton}
        </div>
        <div className="landingBody">
          <div className="headerText">Welcome to playPix.</div>
          <div className="subheaderText">Explore pixel art through platforming!</div>
        </div>
      </div>
    );
  }
}

export default Landing;
