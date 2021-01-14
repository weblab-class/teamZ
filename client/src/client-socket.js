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
