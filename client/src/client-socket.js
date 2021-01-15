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
  console.log("registered keyDown, emitting keyDown message");
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
