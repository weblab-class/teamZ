const tileSize = 16; // number of pixels per tile

// keys used in level-editor; initialize keys to not-pressed-down
const keys = ["w", "a", "s", "d", "SHIFT"];

// state of level editor
const editState = {
  // ........
  // non-player-specific information:
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
const registerKeyDown = (id, key) => {
  editState.players[id].keyDownMap[key] = true;
};

const registerKeyUp = (id, key) => {
  editState.players[id].keyDownMap[key] = false;
};

const registerMouseMove = (id, newX, newY) => {
  editState.players[id].mouseX = newX;
  editState.players[id].mouseY = newY;
};

const registerMouseDown = (id) => {
  editState.players[id].mouseDown = true;
};

const registerMouseUp = (id) => {
  editState.players[id].mouseDown = false;
};

/**
 * change the current tile of player with given id to newTileId.
 * if the player is erasing, newTileId is null
 * @param {*} id of player
 * @param {*} newTileId
 */
const changeTile = (id, newTileId) => {
  editState.players[id].currentTile = newTileId;
};

/**
 * Adds a new player to a level. If player already has a level, will reset.
 * @param {*} playerId
 * @param {*} levelId
 */
const addPlayer = (playerId, levelId) => {
  const keyDownMap = {};
  for (let i = 0; i < keys.length; i++) {
    keyDownMap[keys[i]] = false;
  }
  editState.players[id] = {
    levelId: levelId,
    camX: 0,
    camY: 0,
    currentTile: null,
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    keyDownMap: keyDownMap,
  };
};

/** Remove a player from the game state if they DC */
const removePlayer = (id) => {
  delete editState.players[id];
};

// ... helper functions for update ...

const clipPadding = 2; // number of tiles
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
  retX = Math.max(-clipPadding * tileSize, retX);
  retX = Math.min(clipPadding * tileSize + editState.levels[levelId].cols * tileSize - 1);
  retY = Math.max(-clipPadding * tileSize, retY);
  retY = Math.min(clipPadding * tileSize + editState.levels[levelId].rows * tileSize - 1);
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

// TODO: function to send state to clients like getStateForPlayer(id)

module.exports = {
  editState, // replace with fn like getStateForPlayer(id)
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
