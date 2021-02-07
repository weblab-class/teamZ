const constants = require("../constants.js");
const tileSize = constants.tileSize;
const tileSizeOnCanvas = constants.tileSizeOnCanvas;
const canvasToAbstractRatio = constants.canvasToAbstractRatio;

const logicUtilities = require("../logicUtilities.js");
const toAbstractCors = logicUtilities.toAbstractCors;

// some platforming-physics constants
const gravity = 0.7;
const maxWalkSpeed = tileSize / 4;
const maxAirSpeed = tileSize;
const jumpSpeed = tileSize / 1.64;
const walkAccel = 1.764;
const airAccel = 1;

const restartCap = 20;
const groundTolerance = 5;
// keys used in level-editor; initialize keys to not-pressed-down
const keys = ["w", "a", "s", "d"];

// state of level editor
const playState = {
  // ........
  // non-player-specific information:
  levels: {
    /**
     * levelId:
     * { rows -- #rows of level
     *   cols -- #cols of level
     *   gridTiles -- the grid tiles of the level, in the format of a row-major 1D array
     *                of dictionaries {_id, layer} *note this is different from gridTiles in editLogic
     *   availableTiles -- the *set* of the available tiles of the level
     *   startX -- abstract x cor of start position
     *   startY
     *   }
     */
  },
  // player-specific information:
  players: {
    /**
     * playerId:
     * { levelId -- id of level player is currently editing
     *   camX
     *   camY -- coordinates of top left corner of camera of player
     *   x -- cor of player char
     *   y
     *   xspeed -- speed of player char in x dir
     *   yspeed
     *   isRestarting: Boolean
     *   restartTimer: Number: how long has the player been restarting?
     *   isFacingRight: Boolean
     *   canvasWidth
     *   canvasHeight -- number of pixels vertically in canvas
     *   keyDownMap -- dictionary mapping a keyboard key to boolean -- is player holding down
     *                                                     that key at the moment?
     *   }
     */
  },
  // players is dict mapping id of user, containing...
  /* { levelId -- id of level player is currently editing
       camX
       camY -- coordinates of top left corner of camera of player
       x -- cor of player char
       y 
       xspeed -- speed of player char in x dir
       yspeed 
       isRestarting: Boolean
       restartTimer: number
       isFacingRight: Boolean
       canvasWidth
       canvasHeight -- number of pixels vertically in canvas
       keyDownMap -- dictionary mapping a keyboard key to boolean -- is player holding down
                                                         that key at the moment?
     }
   */
};

// ... functions called by events (not once per frame) ...

/**
 * @param key one of the strings in keys
 */
const registerKeyDown = (playerId, key) => {
  if (!(playerId in playState.players)) return;
  const player = playState.players[playerId];
  if (key === "w" && !player.keyDownMap["w"] && onGround(playerId)) {
    player.yspeed = -1 * jumpSpeed;
  }
  player.keyDownMap[key] = true;
  if (key === "a") {
    player.isFacingRight = false;
  }
  if (key === "d") {
    player.isFacingRight = true;
  }
};

const registerKeyUp = (playerId, key) => {
  if (!(playerId in playState.players)) return;
  const player = playState.players[playerId];
  player.keyDownMap[key] = false;
  if (key === "a" || key === "d") {
    player.xspeed = 0;
  }
};

/**
 * Adds a new player to a level. If player already has a level, will reset.
 * @param {*} playerId
 * @param {*} level dictionary containing level info
 * @param {*} canvasWidth how many pixels across on player's canvas
 * @param {*} canvasHeight
 */
const addPlayer = (playerId, level, modifiedGridTilesArr, canvasWidth, canvasHeight) => {
  const keyDownMap = {};
  for (let i = 0; i < keys.length; i++) {
    keyDownMap[keys[i]] = false;
  }
  const availableTilesSet = {};
  for (let i = 0; i < level.availableTiles.length; i++) {
    availableTilesSet[level.availableTiles[i]] = true;
  }
  const levelId = level._id;
  playState.levels[levelId] = {
    title: level.title,
    rows: level.rows,
    cols: level.cols,
    gridTiles: modifiedGridTilesArr,
    creator: level.creator,
    emptyTile: level.emptyTile,
    startX: level.startX,
    startY: level.startY,
    availableTiles: level.availableTiles,
    charSprite: level.charSprite,
    background: level.background,
  }; // add level no matter what
  playState.levels[levelId].gridTiles = modifiedGridTilesArr;
  playState.levels[levelId].availableTilesSet = availableTilesSet;
  playState.players[playerId] = {
    levelId: levelId,
    camX: 0,
    camY: 0,
    x: level.startX,
    y: level.startY,
    xspeed: 0,
    yspeed: 0,
    isFacingRight: true,
    isRestarting: false,
    restartTimer: 0,
    keyDownMap: keyDownMap,
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
  };
  centerCamera(playerId);
  // restart all players on same level.
  Object.keys(playState.players).forEach((otherPlayerId) => {
    if (
      otherPlayerId !== playerId &&
      levelId === playState.levels[playState.players[otherPlayerId].levelId]
    ) {
      restartPlayer(otherPlayerId);
    }
  });
};

/** Remove a player from the game state if they DC */
const removePlayer = (playerId) => {
  if (playerId in playState.players) {
    const levelId = playState.players[playerId].levelId;
    delete playState.players[playerId];
    if (
      Object.keys(playState.players).filter((otherPlayerId) => {
        return playState.players[otherPlayerId].levelId.toString() === levelId.toString();
      }).length === 0
    ) {
      // no other player is playing this level. delete.
      delete playState.levels[levelId];
    }
  }
};

const modifyPlayer = (playerId, newValues) => {
  if (!(playerId in playState.players)) return;
  const player = playState.players[playerId];
  Object.keys(newValues).forEach((key) => {
    player[key] = newValues[key];
  });
};

const restartPlayer = (playerId) => {
  if (!(playerId in playState.players)) return;
  playState.players[playerId].isRestarting = true;
};

// ... helper functions for update ...

/**
 * Returns whether specified cors collide with platform
 * @param {*} levelId
 * @param {*} absX
 * @param {*} absY
 */
const hitTest = (levelId, absX, absY) => {
  const level = playState.levels[levelId];
  // if either cor is negative, return false
  if (absX < 0 || absY < 0) return false;
  // find the tile row and col
  const col = Math.floor(absX / tileSize);
  const row = Math.floor(absY / tileSize);
  // if either col or row are out of range of level's size, return false
  if (col >= level.cols || row >= level.rows) return false;
  // now we know row and col are legit.
  const tile = level.gridTiles[row * level.cols + col];
  if (tile === null) return false;
  return tile.layer === "Platform" && tile._id in level.availableTilesSet;
};

const diamondFromTopLeft = (x, y) => {
  const ret = {};
  ret.up = { x: x + tileSize / 2, y: y };
  ret.down = { x: x + tileSize / 2, y: y + tileSize - 1 };
  ret.right = { x: x + tileSize - 1, y: y + tileSize / 2 };
  ret.left = { x: x, y: y + tileSize / 2 };
  return ret;
};

/**
 * returns dict describing player cors
 * @param {*} playerId
 */
const playerCors = (playerId) => {
  const player = playState.players[playerId];
  return diamondFromTopLeft(player.x, player.y);
};

/**
 * return whether player is on ground
 * @param {*} playerId
 */
const onGround = (playerId) => {
  const player = playState.players[playerId];
  const pcors = playerCors(playerId);
  return (
    hitTest(player.levelId, pcors.down.x - groundTolerance, pcors.down.y + 1) ||
    hitTest(player.levelId, pcors.down.x + groundTolerance, pcors.down.y + 1)
  );
};

const clipCharCors = (playerId) => {
  const player = playState.players[playerId];
  const level = playState.levels[player.levelId];
  player.x = Math.max(0, player.x);
  player.y = Math.max(0, player.y);
  player.x = Math.min(level.cols * tileSize - tileSize, player.x);
  player.y = Math.min(level.rows * tileSize + 2 * tileSize, player.y);
  // reset player if off screen
  if (player.y > level.rows * tileSize) {
    player.isRestarting = true;
  }
};

const updatePlayerPosition = (playerId) => {
  if (!(playerId in playState.players)) return;
  const player = playState.players[playerId];
  // first, if player is stuck in platform, move them out, and reset their speed
  while (
    hitTest(
      player.levelId,
      playerCors(playerId).down.x - groundTolerance,
      playerCors(playerId).down.y
    ) ||
    hitTest(
      player.levelId,
      playerCors(playerId).down.x + groundTolerance,
      playerCors(playerId).down.y
    )
  ) {
    player.y--;
    player.yspeed = 0;
  }
  while (hitTest(player.levelId, playerCors(playerId).up.x, playerCors(playerId).up.y)) {
    player.y++;
    player.yspeed = 0;
  }
  while (hitTest(player.levelId, playerCors(playerId).left.x, playerCors(playerId).left.y)) {
    player.x++;
    player.xspeed = 0;
  }
  while (hitTest(player.levelId, playerCors(playerId).right.x, playerCors(playerId).right.y)) {
    player.x--;
    player.xspeed = 0;
  }
  // next, check if the player's next position will collide with platform
  // if so, reset their speed, and move them to the edge of the platform
  let playerNextPos = { x: player.x + player.xspeed, y: player.y + player.yspeed };
  if (
    hitTest(
      player.levelId,
      diamondFromTopLeft(playerNextPos.x, playerNextPos.y).down.x - groundTolerance,
      diamondFromTopLeft(playerNextPos.x, playerNextPos.y).down.y
    ) ||
    hitTest(
      player.levelId,
      diamondFromTopLeft(playerNextPos.x, playerNextPos.y).down.x + groundTolerance,
      diamondFromTopLeft(playerNextPos.x, playerNextPos.y).down.y
    )
  ) {
    player.y += player.yspeed;
    player.yspeed = 0;
    while (
      hitTest(
        player.levelId,
        playerCors(playerId).down.x - groundTolerance,
        playerCors(playerId).down.y
      ) ||
      hitTest(
        player.levelId,
        playerCors(playerId).down.x + groundTolerance,
        playerCors(playerId).down.y
      )
    ) {
      player.y--;
    }
  }
  playerNextPos = { x: player.x + player.xspeed, y: player.y + player.yspeed };
  if (
    hitTest(
      player.levelId,
      diamondFromTopLeft(playerNextPos.x, playerNextPos.y).up.x,
      diamondFromTopLeft(playerNextPos.x, playerNextPos.y).up.y
    )
  ) {
    player.y += player.yspeed;
    player.yspeed = 0;
    while (hitTest(player.levelId, playerCors(playerId).up.x, playerCors(playerId).up.y)) {
      player.y++;
    }
  }
  playerNextPos = { x: player.x + player.xspeed, y: player.y + player.yspeed };
  if (
    hitTest(
      player.levelId,
      diamondFromTopLeft(playerNextPos.x, playerNextPos.y).left.x,
      diamondFromTopLeft(playerNextPos.x, playerNextPos.y).left.y
    )
  ) {
    player.x += player.xspeed;
    player.xspeed = 0;
    while (hitTest(player.levelId, playerCors(playerId).left.x, playerCors(playerId).left.y)) {
      player.x++;
    }
  }
  playerNextPos = { x: player.x + player.xspeed, y: player.y + player.yspeed };
  if (
    hitTest(
      player.levelId,
      diamondFromTopLeft(playerNextPos.x, playerNextPos.y).right.x,
      diamondFromTopLeft(playerNextPos.x, playerNextPos.y).right.y
    )
  ) {
    player.x += player.xspeed;
    player.xspeed = 0;
    while (hitTest(player.levelId, playerCors(playerId).right.x, playerCors(playerId).right.y)) {
      player.x--;
    }
  }

  // // now, update the player's position based on their speed
  player.x += player.xspeed;
  player.y += player.yspeed;
  // finally, update the player's speed based on gravity, keypresses, etc
  if (onGround(playerId)) {
    if (player.keyDownMap["a"]) {
      // player is moving left
      player.xspeed -= walkAccel;
    }
    if (player.keyDownMap["d"]) {
      // player is moving right
      player.xspeed += walkAccel;
    }
  } else {
    if (player.keyDownMap["a"]) {
      // player is moving left
      player.xspeed -= airAccel;
    }
    if (player.keyDownMap["d"]) {
      // player is moving right
      player.xspeed += airAccel;
    }
  }
  // // update gravity
  player.yspeed += gravity;
  // // clip speed to max speeds.
  player.xspeed = Math.min(player.xspeed, maxWalkSpeed);
  player.xspeed = Math.max(player.xspeed, -1 * maxWalkSpeed);
  player.yspeed = Math.min(player.yspeed, maxAirSpeed);
  player.yspeed = Math.max(player.yspeed, -1 * maxAirSpeed);
  // if player is not holding keys down, fric.
  if (onGround(playerId) && !player.keyDownMap["d"] && !player.keyDownMap["a"]) {
    player.xspeed /= 2;
    if (Math.abs(player.xspeed) < 0.5) {
      player.xspeed = 0;
    }
  }
  // clip character position.
  clipCharCors(playerId);
};

const updatePlayerPositions = () => {
  Object.keys(playState.players).forEach((playerId) => {
    updatePlayerPosition(playerId);
  });
};

/**
 * Mutates player camera position to be within bounds.
 * @param {*} playerId _id of player
 */
const clipCamera = (playerId) => {
  const player = playState.players[playerId];
  const level = playState.levels[player.levelId];
  player.camX = Math.min(
    player.camX,
    Math.floor(level.cols * tileSize - player.canvasWidth / canvasToAbstractRatio)
  );
  player.camY = Math.min(
    player.camY,
    Math.floor(level.rows * tileSize - player.canvasHeight / canvasToAbstractRatio)
  );
  player.camX = Math.max(0, player.camX);
  player.camY = Math.max(0, player.camY);
  if (player.camY % 2 !== 0) {
    player.camY -= 1; // lazy fix
  }
};

/**
 * Centers player camera on char
 * @param {*} playerId _id of player
 */
const centerCamera = (playerId) => {
  const player = playState.players[playerId];
  const cameraAbstractWidth = Math.floor(player.canvasWidth / canvasToAbstractRatio);
  const cameraAbstractHeight = Math.floor(player.canvasHeight / canvasToAbstractRatio);
  const charCenterX = player.x + tileSize / 2;
  const charCenterY = player.y + tileSize / 2;
  player.camX = Math.floor(charCenterX - cameraAbstractWidth / 2);
  player.camY = Math.floor(charCenterY - cameraAbstractHeight / 2);
};

// update players' camera coordinates
const updateCameras = () => {
  Object.keys(playState.players).forEach((playerId) => {
    centerCamera(playerId);
    clipCamera(playerId);
  });
};

/**
 * Updates the restarting state of player
 * @param {*} playerId _id of player
 */
const updatePlayerRestart = (playerId) => {
  const player = playState.players[playerId];
  const level = playState.levels[player.levelId];
  if (player.isRestarting) {
    if (player.restartTimer === restartCap) {
      player.isRestarting = false;
      player.restartTimer = 0;
      return;
    }
    if (player.restartTimer === Math.floor(restartCap / 2)) {
      player.x = level.startX;
      player.y = level.startY;
      player.xspeed = 0;
      player.yspeed = 0;
    }
    player.restartTimer++;
  }
};

const updatePlayerRestarts = () => {
  Object.keys(playState.players).forEach((playerId) => {
    updatePlayerRestart(playerId);
  });
};

/**
 * called each frame. updates the game state
 */
const update = () => {
  updatePlayerRestarts();
  updatePlayerPositions();
  updateCameras();
};

const getSlice = (playerId) => {
  const player = playState.players[playerId];
  const level = playState.levels[player.levelId];
  // worry about edge cases below
  const rowStart = Math.min(Math.max(0, Math.floor(player.camY / tileSize)), level.rows);
  const colStart = Math.min(Math.max(0, Math.floor(player.camX / tileSize)), level.cols);
  const tilesHigh = Math.min(
    level.rows - rowStart,
    Math.floor(player.canvasHeight / tileSizeOnCanvas) + 2
  );
  const tilesWide = Math.min(
    level.cols - colStart,
    Math.floor(player.canvasWidth / tileSizeOnCanvas) + 2
  );
  const slice = [];
  for (let i = rowStart; i < rowStart + tilesHigh; i++) {
    for (let j = colStart; j < colStart + tilesWide; j++) {
      const iSlice = i * level.cols + j;
      if (level.gridTiles[iSlice] === null) {
        slice.push(null);
      } else {
        slice.push(level.gridTiles[i * level.cols + j]._id);
      }
    }
  }
  return {
    sliceRowStart: rowStart,
    sliceColStart: colStart,
    sliceRows: tilesHigh,
    sliceCols: tilesWide,
    slice: slice,
  };
};

/**
 * Returns instructions for player to render stuff at client side.
 * @param {*} playerId _id of player
 */
const instructionsForPlayer = (playerId) => {
  const player = playState.players[playerId];
  const level = playState.levels[player.levelId];
  const sliceDict = getSlice(playerId);
  const ret = {
    availableTiles: level.availableTiles,
    camX: Math.floor(player.camX),
    camY: Math.floor(player.camY),
    sliceRowStart: sliceDict.sliceRowStart,
    sliceColStart: sliceDict.sliceColStart,
    sliceRows: sliceDict.sliceRows,
    sliceCols: sliceDict.sliceCols,
    slice: sliceDict.slice,
    x: Math.floor(player.x),
    y: Math.floor(player.y),
    charSprite: level.charSprite,
    background: level.background,
    restartFraction: player.restartTimer / restartCap,
    isFacingRight: player.isFacingRight,
  };
  return ret;
};

/**
 * @return {*} {playerId: {...instructionsForPlayer(playerId)}}
 */
const getInstructions = () => {
  const ret = {};
  Object.keys(playState.players).forEach((key) => {
    ret[key] = instructionsForPlayer(key);
  });
  return ret;
};

module.exports = {
  playState,
  instructionsForPlayer,
  getInstructions,
  registerKeyDown,
  registerKeyUp,
  addPlayer,
  removePlayer,
  restartPlayer,
  modifyPlayer,
  update,
};
