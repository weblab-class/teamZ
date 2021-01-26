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
          <h1>Making a level</h1>
          <div>
            Use WASD or the arrow keys to scroll around the editor. Create a tile using the button
            on the right side of the screen. A tile can be in one of two layers. The player can
            stand on and collide with tiles in the "Platform" layer , while tiles in the
            "Background" layer are purely for decoration. Place down a tile by clicking / dragging
            your mouse over the editor. Switch into eraser mode by pressing the `e` key on your
            keyboard, or temporarily switch into eraser mode by holding down `SHIFT`. Change the
            starting position of the character by dragging the character sprite (initially at the
            top left). You can modify level settings by clicking on the `settings` button on the
            toolbar on the top of the screen. Here, you can change the title, description, size,
            character sprite, and background image of the level. You can also choose to publish the
            level, which will make your level accessible for everyone to play. To play your level,
            click `play`.
          </div>
          <h1>Playing a level</h1>
          <div>
            Use WASD or the arrow keys to move. Click `Retry` on the top left to restart the level.
            Click `Back` to go back. That's all!
          </div>
        </div>
      </div>
    );
  }
}

export default Help;
