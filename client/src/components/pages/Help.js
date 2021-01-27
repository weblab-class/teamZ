import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";

import "../../utilities.css";
import "./Help.css";

class Help extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {};
  }

  render() {
    return (
      <div className="u-page">
        <div className="textContainer u-chocoThemed">
          {" "}
          {/* DON'T CHANGE u-chocoThemed or u-page. You can
        remove them from the className string for these divs, but don't modify the styling properties
        in utilities.css */}
          <h1 className="helpHeader">Making a level</h1>
          <div className="helpText">
            <p className="helpSection">
              <strong>Scroll View</strong>
            </p>
            <p className="helpSpec">
              Use <span className="span">WASD</span> or the <span className="span">arrow keys</span>{" "}
              to scroll around the editor view.
            </p>

            <p className="helpSection">
              <strong>Creating Tiles</strong>
            </p>
            <p className="helpSpec">
              Create a tile with the <mark>Add Tile</mark> button on the bottom right side of the
              screen.
            </p>

            <p className="helpSection">
              <strong>Layers</strong>
            </p>
            <p className="helpSpec">
              Tiles can be placed in one of two layers, <em>Platform</em> or <em>Background</em>.
            </p>
            <ol className="helpList">
              <li>
                <p>
                  <em>Platform</em> – the player can stand on and collide with tiles in this layer.
                </p>
              </li>
              <li>
                <p>
                  <em>Background</em> – tiles in this layer are purely for decoration and background
                  art.
                </p>
              </li>
            </ol>
            <p className="helpSpec">
              To switch layers, click on the current layer name on the top right.
            </p>

            <p className="helpSection">
              <strong>Placing Tiles</strong>
            </p>
            <p className="helpSpec">
              Place down a tile by clicking or dragging your mouse over the editor.
            </p>
            <p className="helpSpec">
              Switch into <em>Eraser Mode</em> by pressing the <span className="span">e</span> key
              on your keyboard, or temporarily switch into eraser mode by holding down{" "}
              <span className="span">SHIFT</span>.
            </p>

            <p className="helpSection">
              <strong>Character Position</strong>
            </p>
            <p className="helpSpec">
              Change the starting position of the character by dragging the character sprite. By
              default, the sprite starts at the top left.
            </p>

            <p className="helpSection">
              <strong>Level Modifications</strong>
            </p>
            <p className="helpSpec">
              Modify level settings by clicking on the <mark>Settings</mark> button on the toolbar
              on the top of the screen. Here, you can change the title, description, size, character
              sprite, and background image of the level.
            </p>
            <p className="helpSpec">
              You can also choose to publish the level, which will make your level accessible for
              everyone to play. To play your level, click <mark>Play</mark>.
            </p>
          </div>
          <h1 className="helpHeader">Playing a level</h1>
          <div className="helpText">
            <p className="helpCenter">
              Use <span className="span">WASD</span> or the <span className="span">arrow keys</span>{" "}
              to move. Click <mark>Retry</mark> on the top left to restart the level. Click{" "}
              <mark>Back</mark> to go back. That's all!
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Help;
