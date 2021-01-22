import socketIOClient from "socket.io-client";
import { post } from "./utilities";
const endpoint = window.location.hostname + ":" + window.location.port;
export const socket = socketIOClient(endpoint);
socket.on("connect", () => {
  post("/api/initsocket", { socketid: socket.id });
});

// these fns will be called when certain events happen.
// and will give the appropriate message to the server socket.

/** send a message to the server with the move you made */
// export const move = (dir) => {
//   socket.emit("move", dir);
// };
export const keyDown = (key) => {
  socket.emit("keyDown", key);
};

export const keyUp = (key) => {
  socket.emit("keyUp", key);
};

// cors has x and y attribute
export const mouseMove = (cors) => {
  socket.emit("mouseMove", cors);
};

export const mouseDown = () => {
  socket.emit("mouseDown");
};

export const mouseUp = () => {
  socket.emit("mouseUp");
};

export const addTile = (tileId) => {
  socket.emit("addTile", tileId);
};

export const enableEdit = () => {
  socket.emit("enableEdit");
};

export const disableEdit = () => {
  console.log("disableEdit called");
  socket.emit("disableEdit");
};

export const changeTile = (tileId) => {
  socket.emit("changeTile", tileId);
};

export const modifyLevel = (newValues) => {
  socket.emit("modifyLevel", newValues);
};

export const modifyPlayer = (newValues) => {
  socket.emit("modifyPlayer", newValues);
};

export const resizeLevel = (deltas) => {
  console.log("resizing called client socket: ", deltas);
  socket.emit("resizeLevel", deltas);
};

export const playKeyDown = (key) => {
  socket.emit("playKeyDown", key);
};

export const playKeyUp = (key) => {
  socket.emit("playKeyUp", key);
};

export const playModifyPlayer = (newValues) => {
  socket.emit("playModifyPlayer", newValues);
};
