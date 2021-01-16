import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { get, post } from "../../utilities.js";
import { socket } from "../../client-socket";
import { drawEditCanvas } from "../../editCanvasManager";
import { initInput } from "../../editInput.js";

import "../../utilities.css";
import "./Edit.css";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "121479668229-t5j82jrbi9oejh7c8avada226s75bopn.apps.googleusercontent.com";

class Edit extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.canvasWidth = 900;
    this.canvasHeight = 700;
    // for now, the only prop the Edit page should take is :levelId
    // Initialize Default State
    this.state = {
      //TODO
    };
  }

  componentDidMount() {
    // api calls here
    post("/api/joinLevel", {
      levelId: this.props.levelId,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
    }).then((garbage) => {
      initInput({ canvas: this.getCanvas() });
    });
    // fetch level with _id this.props.levelId, and load into state.
    //
    // set socket instructions here ...
    //
    socket.on("update", (update) => {
      console.log(`mouseX: ${update.mouseX}, mouseY: ${update.mouseY}`);
      this.processUpdate(update);
    });
  }

  getCanvas = () => {
    return this.canvasRef.current;
  };

  processUpdate = (update) => {
    drawEditCanvas(this.getCanvas(), update, {});
  };

  render() {
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
        <div>You have reached the edit page.</div>
        <div>LevelId: {this.props.levelId}</div>
        <canvas ref={this.canvasRef} width={this.canvasWidth} height={this.canvasHeight} />
      </>
    );
  }
}

export default Edit;
