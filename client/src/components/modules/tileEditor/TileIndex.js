import React from "react";
import ReactDOM from "react-dom";

import TileEditor from "./TileEditor";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <TileEditor />
  </React.StrictMode>,
  rootElement
);