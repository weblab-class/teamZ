// import { tileSize, tileSizeOnCanvas } from "../constants.js";
const tileSize = 16;
const tileSizeOnCanvas = 64;

// keys used in level-editor; initialize keys to not-pressed-down
const keys = ["w", "a", "s", "d", "SHIFT"];

// state of level editor
const editState = {
  // ........
  // non-player-specific information:
  tiles: {}, // maps tileId to image
  levels: {}, // maps levelId to level information consisting of
  // title, rows, cols, gridTiles, availableTiles, etc
  // title: "",
  // don't need to store creator, since that won't change. might store collaborators later
  // rows: 0,
  // cols: 0,
  // gridTiles: [], // row-major array of the ids of tiles
  // availableTiles: {}, // consider changing this to a dictionary of objectId --> tile object
  // ........
  // player-specific information:
  players: {},
  // players is dict mapping id of user, containing...
  /* { levelId -- id of level player is currently editing
       camX
       camY -- coordinates of top left corner of camera of player
       canvasWidth
       canvasHeight -- number of pixels vertically in canvas
       currentTile -- objectIds. can easily access tile properties through availableTiles dictionary
       keyDownMap -- dictionary mapping a keyboard key to boolean -- is player holding down
                                                         that key at the moment?
       mouseX -- xcor of mouse relative to entire grid. for example, if the player's
                 mouse is at the top left corner of top left tile, their mouse is at (0,0)
       mouseY
       mouseDown -- is player's mouse down?
     }
   */
};

// ... functions called by events (not once per frame) ...

/**
 * @param key one of the strings in keys
 */
const registerKeyDown = (playerId, key) => {
  editState.players[playerId].keyDownMap[key] = true;
};

const registerKeyUp = (playerId, key) => {
  editState.players[playerId].keyDownMap[key] = false;
};

const registerMouseMove = (playerId, newX, newY) => {
  editState.players[playerId].mouseX = newX;
  editState.players[playerId].mouseY = newY;
};

const registerMouseDown = (playerId) => {
  editState.players[playerId].mouseDown = true;
};

const registerMouseUp = (playerId) => {
  editState.players[playerId].mouseDown = false;
};

/**
 * change the current tile of player with given id to newTileId.
 * if the player is erasing, newTileId is null
 * @param {*} playerId of player
 * @param {*} newTileId
 */
const changeTile = (playerId, newTileId) => {
  editState.players[playerId].currentTile = newTileId;
};

/**
 * Adds a new player to a level. If player already has a level, will reset.
 * @param {*} playerId
 * @param {*} level dictionary containing level info
 * @param {*} canvasWidth how many pixels across on player's canvas
 * @param {*} canvasHeight
 */
const addPlayer = (playerId, level, canvasWidth, canvasHeight) => {
  const keyDownMap = {};
  for (let i = 0; i < keys.length; i++) {
    keyDownMap[keys[i]] = false;
  }
  const levelId = level._id;
  // check if level already exists in editState. if so, EASY!
  if (!(levelId in editState.levels)) {
    // we have to add this level.
    editState.levels[levelId] = level;
  }
  editState.players[playerId] = {
    levelId: levelId,
    camX: 0,
    camY: 0,
    currentTile: null,
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    keyDownMap: keyDownMap,
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
  };
};

/** Remove a player from the game state if they DC */
const removePlayer = (playerId) => {
  delete editState.players[playerId];
};

// ... helper functions for update ...

const clipPadding = 0; // number of tiles
/**
 * Given camera coordinates, returns coordinates that are the given cors if they are valid,
 * else closest coordinate that is valid
 * @param {*} camX
 * @param {*} camY
 * @param {*} levelId
 */
const clipCamera = (camX, camY, levelId) => {
  let retX = camX;
  let retY = camY;
  // retX = Math.max(-clipPadding * tileSize, retX);
  // retX = Math.min(clipPadding * tileSize + editState.levels[levelId].cols * tileSize - 1);
  // retY = Math.max(-clipPadding * tileSize, retY);
  // retY = Math.min(clipPadding * tileSize + editState.levels[levelId].rows * tileSize - 1);
  return {
    x: retX,
    y: retY,
  };
};

// update players' camera coordinates
const scrollSpeed = 4;
const updateCameras = () => {
  Object.keys(editState.players).forEach((key) => {
    const player = editState.players[key];
    if (player.keyDownMap["w"]) {
      player.camY -= scrollSpeed;
    }
    if (player.keyDownMap["s"]) {
      player.camY += scrollSpeed;
    }
    if (player.keyDownMap["a"]) {
      player.camX -= scrollSpeed;
    }
    if (player.keyDownMap["d"]) {
      player.camX += scrollSpeed;
    }
    // we need to make sure the player's camera coordinates are valid
    // apply the clipping helper fn
    const clippedCors = clipCamera(player.camX, player.camY, player.levelId);
    player.camX = clippedCors.x;
    player.camY = clippedCors.y;
  });
};

const corsInGrid = (x, y, levelId) => {
  return (
    x >= 0 &&
    y >= 0 &&
    x < editState.levels[levelId].cols * tileSize &&
    y < editState.levels[levelId].rows * tileSize
  );
};
// place down tiles
const updateTiles = () => {
  Object.keys(editState.players).forEach((key) => {
    const player = editState.players[key];
    const tileIdToPlace = player.keyDownMap["SHIFT"] ? null : player.currentTile;
    if (player.mouseDown && corsInGrid(player.mouseX, player.mouseY, player.levelId)) {
      const row = Math.floor(player.mouseY / tileSize);
      const col = Math.floor(player.mouseX / tileSize);
      editState.levels[player.levelId].gridTiles[row * editState.cols + col] = tileIdToPlace;
    }
  });
};

// ... update ...

/**
 * called each frame. updates the edit state
 */
const update = () => {
  updateTiles();
  updateCameras();
};

/**
 * Returns instructions for player to render stuff at client side.
 * @param {*} playerId
 */
const instructionsForPlayer = (playerId) => {
  const player = editState.players[playerId];
  const ret = {
    editState: editState,
    playerId: playerId,
    camX: player.camX,
    camY: player.camY,
    mouseX: player.mouseX,
    mouseY: player.mouseY,
    sliceRowStart: 0, //TODO
    sliceColStart: 0, //TODO
    sliceRows: 10, //TODO hard code for now
    sliceCols: 10, //TODO hard code for now
    slice: editState.levels[player.levelId].gridTiles, //TODO: row major order of slice, hard code for now
  };
  return ret;
};

const getInstructions = () => {
  const ret = {};
  Object.keys(editState.players).forEach((key) => {
    ret[key] = instructionsForPlayer(key);
  });
  return ret;
};

module.exports = {
  instructionsForPlayer,
  getInstructions,
  registerKeyDown,
  registerKeyUp,
  registerMouseDown,
  registerMouseMove,
  registerMouseUp,
  changeTile,
  addPlayer,
  removePlayer,
  update,
};
