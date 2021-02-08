const tileSize = 16; // size of tile, abstractly
const tileSizeOnCanvas = 48; // number of pixels each tile takes on canvas.
const canvasToAbstractRatio = Math.floor(tileSizeOnCanvas / tileSize);
const GOOGLE_CLIENT_ID = "968597986163-jb2ki4cdo7df3jfui7j1vshv8vc2j3dp.apps.googleusercontent.com";

const SOCKET_MESSAGE_TYPES = {
  EDIT_UPDATE: "update",
  PLAY_UPDATE: "playUpdate",

  EDIT_KEY_DOWN: "keyDown",
  EDIT_KEY_UP: "keyUp",
  EDIT_MOUSE_MOVE: "mouseMove",
  EDIT_MOUSE_DOWN: "mouseDown",
  EDIT_MOUSE_UP: "mouseUp",
  ENABLE_EDIT: "enableEdit",
  DISABLE_EDIT: "disableEdit",
  ADD_TILE: "addTile",
  CHANGE_TILE: "changeTile",
  EDIT_MODIFY_LEVEL: "modifyLevel",
  EDIT_MODIFY_PLAYER: "modifyPlayer",
  RESIZE_LEVEL: "resizeLevel",
  PLAY_KEY_DOWN: "playKeyDown",
  PLAY_KEY_UP: "playKeyUp",
  PLAY_MODIFY_PLAYER: "playModifyPlayer",
  PLAY_RESTART_PLAYER: "playRestartPlayer",
};

const TILE_TYPES = {
  PLATFORM: "Platform",
  BACKGROUND: "Background",
};

module.exports = {
  tileSize,
  tileSizeOnCanvas,
  canvasToAbstractRatio,
  GOOGLE_CLIENT_ID,
  SOCKET_MESSAGE_TYPES,
  TILE_TYPES,
};
