import React, { Component } from "react";

import "../../utilities.css";
import "./TileDesignerModal.css";

const tileSize = 16; // use this constant rather than the number `16` when referencing tile size.
class TileDesignerModal extends Component {
  constructor(props) {
    /* TileDesignerModal is a pop-up whose job is to design and output a tile.
     * The only prop passed to TileDesignerModal is a callback called `onSubmit`,
     * which takes three arguments:
     *   -  name: String // name of tile
     *   -  layer: String // one of "Platform" or "Background"
     *   -  image: an object that contains information for a 16x16 ARGB image.
     *             You can choose what kind of object this is (e.g. can be
     *             an ImageBitmap), but you should specify your choice here,
     *             so I will know what to do with it.
     * Call `onSubmit` like so: `this.props.onSubmit(name, layer, image)`.
     * ----------------
     * One should be able to submit a tile by:
     *   -  uploading a 16x16 PNG image
     *   -  or drawing directly on a 16x16 pixel editor.
     * For the MVP, it should be OK to just support the uploading method.
     */
    super(props);
    this.state = {
      // TODO: initialize state
    };
  }

  render() {
    return <>TODO: TileDesignerModal</>;
  }
}

export default TileDesignerModal;
