const tileSize = 16; // number of pixels per tile

// keys used in level-editor; initialize keys to not-pressed-down
const keys = ["w", "a", "s", "d", "SHIFT"];

// state of level editor
const editState = {
  // ........
  // non-player-specific information:
  title: "",
  // don't need to store creator, since that won't change. might store collaborators later
  rows: 0,
  cols: 0,
  gridTiles: [], // row-major array of the ids of tiles
  // availableTiles: {}, // consider changing this to a dictionary of objectId --> tile object
  // ........
  // player-specific information:
  players: {},
  // players is dict mapping id of user, containing...
  /* { camX
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
 * @param {*} id
 * @param {*} newTileId
 */
const changeTile = (id, newTileId) => {
  editState.players[id].currentTile = newTileId;
};

/** Adds a player to the game state, initialized with a random location */
const addPlayer = (id) => {
  const keyDownMap = {};
  for (let i = 0; i < keys.length; i++) {
    keyDownMap[keys[i]] = false;
  }
  editState.players[id] = {
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
 */
const clipCamera = (camX, camY) => {
  let retX = camX;
  let retY = camY;
  retX = Math.max(-clipPadding * tileSize, retX);
  retX = Math.min(clipPadding * tileSize + editState.cols * tileSize - 1);
  retY = Math.max(-clipPadding * tileSize, retY);
  retY = Math.min(clipPadding * tileSize + editState.cols * tileSize - 1);
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
    const clippedCors = clipCamera(player.camX, player.camY);
    player.camX = clippedCors.x;
    player.camY = clippedCors.y;
  });
};

const corsInGrid = (x, y) => {
  return x >= 0 && y >= 0 && x < editState.cols * tileSize && y < editState.rows * tileSize;
};
// place down tiles
const updateTiles = () => {
  Object.keys(editState.players).forEach((key) => {
    const player = editState.players[key];
    const tileIdToPlace = player.keyDownMap["SHIFT"] ? null : player.currentTile;
    if (player.mouseDown && corsInGrid(player.mouseX, player.mouseY)) {
      const row = Math.floor(player.mouseY / tileSize);
      const col = Math.floor(player.mouseX / tileSize);
      editState.gridTiles[row * editState.cols + col] = tileIdToPlace;
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
