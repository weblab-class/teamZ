import socketIOClient from "socket.io-client";
import { post } from "./utilities";
import { SOCKET_MESSAGE_TYPES } from "../../constants";
const endpoint = window.location.hostname + ":" + window.location.port;
export const socket = socketIOClient(endpoint);
socket.on("connect", () => {
  post("/api/initsocket", { socketid: socket.id });
});

// these functions below emit messages to server socket.

export const keyDown = (key) => {
  socket.emit(SOCKET_MESSAGE_TYPES.EDIT_KEY_DOWN, key);
};

export const keyUp = (key) => {
  socket.emit(SOCKET_MESSAGE_TYPES.EDIT_KEY_UP, key);
};

// cors has x and y attribute
export const mouseMove = (cors) => {
  socket.emit(SOCKET_MESSAGE_TYPES.EDIT_MOUSE_MOVE, cors);
};

export const mouseDown = () => {
  socket.emit(SOCKET_MESSAGE_TYPES.EDIT_MOUSE_DOWN);
};

export const mouseUp = () => {
  socket.emit(SOCKET_MESSAGE_TYPES.EDIT_MOUSE_UP);
};

export const addTile = (tileId) => {
  socket.emit(SOCKET_MESSAGE_TYPES.ADD_TILE, tileId);
};

export const enableEdit = () => {
  socket.emit(SOCKET_MESSAGE_TYPES.ENABLE_EDIT);
};

export const disableEdit = () => {
  socket.emit(SOCKET_MESSAGE_TYPES.DISABLE_EDIT);
};

export const changeTile = (tileId) => {
  socket.emit(SOCKET_MESSAGE_TYPES.CHANGE_TILE, tileId);
};

export const modifyLevel = (newValues) => {
  socket.emit(SOCKET_MESSAGE_TYPES.EDIT_MODIFY_LEVEL, newValues);
};

export const modifyPlayer = (newValues) => {
  socket.emit(SOCKET_MESSAGE_TYPES.EDIT_MODIFY_PLAYER, newValues);
};

export const resizeLevel = (deltas) => {
  socket.emit(SOCKET_MESSAGE_TYPES.RESIZE_LEVEL, deltas);
};

export const playKeyDown = (key) => {
  socket.emit(SOCKET_MESSAGE_TYPES.PLAY_KEY_DOWN, key);
};

export const playKeyUp = (key) => {
  socket.emit(SOCKET_MESSAGE_TYPES.PLAY_KEY_UP, key);
};

export const playModifyPlayer = (newValues) => {
  socket.emit(SOCKET_MESSAGE_TYPES.PLAY_MODIFY_PLAYER, newValues);
};

export const playRestartPlayer = () => {
  socket.emit(SOCKET_MESSAGE_TYPES.PLAY_RESTART_PLAYER);
};
