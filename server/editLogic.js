const constants = require("../constants.js");
const tileSize = constants.tileSize;
const tileSizeOnCanvas = constants.tileSizeOnCanvas;
const canvasToAbstractRatio = constants.canvasToAbstractRatio;

const logicUtilities = require("../logicUtilities.js");
const toAbstractCors = logicUtilities.toAbstractCors;

// keys used in level-editor; initialize keys to not-pressed-down
const keys = ["w", "a", "s", "d", "e", "SHIFT"];

// state of level editor
const editState = {
  // ........
  // non-player-specific information:
  levels: {
    /**
     * levelId:
     * { title -- title of level
     *   description -- description of level
     *   * Don't need to store creator, since that won't ever change. might store collaborators later
     *   rows -- #rows of level
     *   cols -- #cols of level
     *   gridTiles -- the grid tiles of the level, in the format of a row-major 1D array of tileIds
     *   availableTiles -- a list of the available tiles of the level
     *   startX -- abstract x cor of start position
     *   startY
     *   charSprite -- _id of Pattern corresponding to charSprite
     *   background -- _id of Pattern corresponding to background
     *   isPublished -- Boolean: is the level published?
     *   }
     */
  },
  players: {
    /**
     * playerId:
     * { levelId -- id of level player is currently editing
     *   camX
     *   camY -- coordinates of top left corner of camera of player
     *   canvasWidth
     *   canvasHeight -- number of pixels vertically in canvas
     *   currentTile -- objectIds. can easily access tile properties through availableTiles dictionary
     *   keyDownMap -- dictionary mapping a keyboard key to boolean -- is player holding down
     *                                                     that key at the moment?
     *   mouseX -- xcor of mouse relative to canvas
     *   mouseY
     *   mouseDown -- is player's mouse down?
     *   isDraggingChar -- is player dragging the character and changing its start cors?
     *   isEditing -- can the player scroll / place tiles, or are they in the
     *                settings / add tiles view?
     *   }
     */
  },
};

// ... functions called by events (not once per frame) ...

/**
 * @param key one of the strings in keys
 */
const registerKeyDown = (playerId, key) => {
  if (!(playerId in editState.players)) return;
  editState.players[playerId].keyDownMap[key] = true;
  if (key === "e") {
    editState.players[playerId].currentTile = null;
  }
};

const registerKeyUp = (playerId, key) => {
  if (!(playerId in editState.players)) return;
  editState.players[playerId].keyDownMap[key] = false;
};

const registerMouseMove = (playerId, newX, newY) => {
  if (!(playerId in editState.players)) return;
  editState.players[playerId].mouseX = Math.floor(newX);
  editState.players[playerId].mouseY = Math.floor(newY);
};

const playerMouseOnChar = (playerId) => {
  if (!(playerId in editState.players)) return;
  const player = editState.players[playerId];
  const level = editState.levels[player.levelId];
  const playerMouseAbsCors = toAbstractCors(player.mouseX, player.mouseY, player.camX, player.camY);
  return (
    playerMouseAbsCors.x >= level.startX &&
    playerMouseAbsCors.x < level.startX + tileSize &&
    playerMouseAbsCors.y >= level.startY &&
    playerMouseAbsCors.y < level.startY + tileSize
  );
};

const registerMouseDown = (playerId) => {
  if (!(playerId in editState.players)) return;
  editState.players[playerId].mouseDown = true;
  // check if player clicked character. if so, the player is now dragging the character.
  if (playerMouseOnChar(playerId) && playerMouseOnCanvas(playerId)) {
    editState.players[playerId].isDraggingChar = true;
  }
};

const registerMouseUp = (playerId) => {
  if (!(playerId in editState.players)) return;
  editState.players[playerId].mouseDown = false;
  editState.players[playerId].isDraggingChar = false;
};

const enableEdit = (playerId) => {
  if (!(playerId in editState.players)) return;
  editState.players[playerId].isEditing = true;
};

const disableEdit = (playerId) => {
  if (!(playerId in editState.players)) return;
  editState.players[playerId].isEditing = false;
};

/**
 * change the current tile of player with given id to newTileId.
 * if the player is erasing, newTileId is null
 * @param {*} playerId of player
 * @param {*} newTileId
 */
const changeTile = (playerId, newTileId) => {
  if (!(playerId in editState.players)) return;
  editState.players[playerId].currentTile = newTileId;
};

const addTile = (playerId, tileId) => {
  if (!(playerId in editState.players)) return;
  const levelId = editState.players[playerId].levelId;
  editState.levels[levelId].availableTiles.push(tileId);
};

/**
 * Adds a new player to a level. If player already has a level, will reset.
 * @param {*} playerId
 * @param {*} level dictionary containing level info
 * @param {*} canvasWidth how many pixels across on player's canvas
 * @param {*} canvasHeight
 */
const addPlayer = (playerId, level, canvasWidth, canvasHeight) => {
  if (playerId.toString() !== level.creator.toString()) return; // remove this line to allow collaboration.
  const keyDownMap = {};
  for (let i = 0; i < keys.length; i++) {
    keyDownMap[keys[i]] = false;
  }
  const levelId = level._id;
  // check if level already exists in editState.
  // if so, we don't need to add `level`, since the level in editLogic is most up-to-date ver. of level.
  if (!(levelId in editState.levels)) {
    // we have to add this level.
    editState.levels[levelId] = level;
  }
  editState.players[playerId] = {
    levelId: levelId,
    camX: Math.floor(level.startX - canvasWidth / canvasToAbstractRatio / 2),
    camY: Math.floor(level.startY - canvasHeight / canvasToAbstractRatio / 2),
    currentTile: null,
    mouseX: -1,
    mouseY: -1,
    mouseDown: false,
    keyDownMap: keyDownMap,
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
    isEditing: true,
  };
};

/** Remove a player from the game state if they DC */
const removePlayer = (playerId) => {
  if (playerId in editState.players) {
    const levelId = editState.players[playerId].levelId;
    delete editState.players[playerId];
    if (
      Object.keys(editState.players).filter((otherPlayerId) => {
        return editState.players[otherPlayerId].levelId.toString() === levelId.toString();
      }).length === 0
    ) {
      // no other player is editing this level. delete.
      delete editState.levels[levelId];
    }
  }
};

const modifyPlayer = (playerId, newValues) => {
  if (!(playerId in editState.players)) return;
  const player = editState.players[playerId];
  Object.keys(newValues).forEach((key) => {
    player[key] = newValues[key];
  });
};

const modifyLevel = (playerId, newValues) => {
  if (!(playerId in editState.players)) return;
  const level = editState.levels[editState.players[playerId].levelId];
  Object.keys(newValues).forEach((key) => {
    level[key] = newValues[key];
  });
};

/**
 * Resizes level associated with player playerId
 * @param {*} playerId _id of player
 * @param {*} deltas a dictionary containing left, right, up, down : dimension changes for resize.
 */
const resizeLevel = (playerId, deltas) => {
  if (!(playerId in editState.players)) return;
  const level = editState.levels[editState.players[playerId].levelId];
  // first, make sure the deltas dont go over level dims.
  if (deltas.left + level.cols <= 0) return;
  if (deltas.right + level.cols <= 0) return;
  if (deltas.left + deltas.right + level.cols <= 0) return;
  if (deltas.up + level.rows <= 0) return;
  if (deltas.down + level.rows <= 0) return;
  if (deltas.up + deltas.down + level.rows <= 0) return;
  // construct 2d copy of gridTiles
  let copyGrid = [];
  for (let i = 0; i < level.rows; i++) {
    const nextRow = [];
    for (let j = 0; j < level.cols; j++) {
      nextRow.push(level.gridTiles[i * level.cols + j]);
    }
    copyGrid.push(nextRow);
  }
  const arrEmpty = (len) => {
    const ret = [];
    for (let i = 0; i < len; i++) {
      ret.push(null);
    }
    return ret;
  };
  let levelRows = level.rows;
  let levelCols = level.cols;
  // now resize vertically
  if (deltas.down > 0) {
    for (let i = 0; i < deltas.down; i++) {
      copyGrid.push(arrEmpty(levelCols));
    }
  } else if (deltas.down < 0) {
    for (let i = 0; i < -1 * deltas.down; i++) {
      copyGrid.pop();
    }
  }
  if (deltas.up > 0) {
    const tempArr = [];
    for (let i = 0; i < deltas.up; i++) {
      tempArr.push(arrEmpty(levelCols));
    }
    console.log("tempArr: ", tempArr);
    console.log("grid before: ", copyGrid);
    copyGrid = tempArr.concat(copyGrid);
    console.log("grid after: ", copyGrid);
  } else if (deltas.up < 0) {
    copyGrid = copyGrid.slice(-1 * deltas.up);
  }
  levelRows += deltas.down + deltas.up;
  // resize horizontally
  if (deltas.right > 0) {
    for (let i = 0; i < levelRows; i++) {
      for (let j = 0; j < deltas.right; j++) {
        copyGrid[i].push(null);
      }
    }
  } else if (deltas.right < 0) {
    for (let i = 0; i < levelRows; i++) {
      for (let j = 0; j < deltas.right; j++) {
        copyGrid[i].pop();
      }
    }
  }
  if (deltas.left > 0) {
    for (let i = 0; i < levelRows; i++) {
      copyGrid[i] = [...arrEmpty(deltas.left), ...copyGrid[i]];
    }
  } else if (deltas.left < 0) {
    for (let i = 0; i < levelRows; i++) {
      copyGrid[i] = copyGrid[i].slice(-1 * deltas.left);
    }
  }
  levelCols += deltas.left + deltas.right;
  // construct 1D array from copyGrid.
  const newGrid = [];
  for (let i = 0; i < levelRows; i++) {
    for (let j = 0; j < levelCols; j++) {
      newGrid.push(copyGrid[i][j]);
    }
  }
  // adjust level size and set grid
  level.rows = levelRows;
  level.cols = levelCols;
  level.gridTiles = newGrid;
  // last thing to do is move level char start to account for level resize
  level.startY += deltas.up * tileSize;
  level.startX += deltas.left * tileSize;
};

// ... helper functions for update ...

/**
 * Mutates player camera to be within bounds
 */
const clipCamera = (playerId) => {
  const player = editState.players[playerId];
  const level = editState.levels[player.levelId];
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
};

// update players' camera coordinates
const scrollSpeed = 8;
const updateCameras = () => {
  Object.keys(editState.players).forEach((playerId) => {
    const player = editState.players[playerId];
    if (player.isEditing) {
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
      clipCamera(playerId);
    }
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

const playerMouseOnCanvas = (playerId) => {
  const player = editState.players[playerId];
  return (
    0 <= player.mouseX &&
    player.mouseX < player.canvasWidth &&
    0 <= player.mouseY &&
    player.mouseY < player.canvasHeight
  );
};

const updateTiles = () => {
  Object.keys(editState.players).forEach((key) => {
    const player = editState.players[key];
    if (player.isEditing) {
      const level = editState.levels[player.levelId];
      if (!player.isDraggingChar) {
        const tileIdToPlace = player.keyDownMap["SHIFT"] ? null : player.currentTile;
        const mouseXAbs = player.camX + player.mouseX / canvasToAbstractRatio;
        const mouseYAbs = player.camY + player.mouseY / canvasToAbstractRatio;
        if (
          player.mouseDown &&
          corsInGrid(mouseXAbs, mouseYAbs, player.levelId) &&
          playerMouseOnCanvas(key)
        ) {
          const row = Math.floor(mouseYAbs / tileSize);
          const col = Math.floor(mouseXAbs / tileSize);
          level.gridTiles[row * level.cols + col] = tileIdToPlace;
        }
      }
    }
  });
};

const clipCharCors = (levelId) => {
  const level = editState.levels[levelId];
  level.startX = Math.max(0, level.startX);
  level.startY = Math.max(0, level.startY);
  level.startX = Math.min(level.cols * tileSize - tileSize, level.startX);
  level.startY = Math.min(level.rows * tileSize - tileSize, level.startY);
};

const updateStartPosition = () => {
  Object.keys(editState.players).forEach((key) => {
    const player = editState.players[key];
    if (player.isEditing) {
      const level = editState.levels[player.levelId];
      if (player.isDraggingChar) {
        const newStartCors = toAbstractCors(player.mouseX, player.mouseY, player.camX, player.camY);
        level.startX = Math.floor(newStartCors.x - tileSize / 2);
        level.startY = Math.floor(newStartCors.y - tileSize / 2);
      }
      clipCharCors(player.levelId);
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
  updateStartPosition();
};

/**
 * Returns a dictionary containing information about a rectangular subarray of
 * tiles that the player needs for rendering. Note that this rectangular subarray
 * is the stuff that fits on the player's canvas; there's no need to send all the tiles
 * on the grid, since the tiles outside the canvas won't be seen anyways.
 * @param {*} playerId
 */
const getSlice = (playerId) => {
  const player = editState.players[playerId];
  const level = editState.levels[player.levelId];
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
      slice.push(level.gridTiles[i * level.cols + j]);
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
  const player = editState.players[playerId];
  const level = editState.levels[player.levelId];
  const sliceDict = getSlice(playerId);
  const ret = {
    availableTiles: level.availableTiles,
    currentTile: player.currentTile,
    title: level.title,
    description: level.description,
    charSprite: level.charSprite,
    background: level.background,
    isPublished: level.isPublished,
    rows: level.rows,
    cols: level.cols,
    camX: player.camX,
    camY: player.camY,
    mouseX: player.mouseX,
    mouseY: player.mouseY,
    mouseDown: player.mouseDown,
    sliceRowStart: sliceDict.sliceRowStart,
    sliceColStart: sliceDict.sliceColStart,
    sliceRows: sliceDict.sliceRows,
    sliceCols: sliceDict.sliceCols,
    slice: sliceDict.slice,
    isDraggingChar: player.isDraggingChar,
    startX: level.startX,
    startY: level.startY,
  };
  return ret;
};

/**
 * @return {*} {playerId: {...instructionsForPlayer(playerId)}}
 */
const getInstructions = () => {
  const ret = {};
  Object.keys(editState.players).forEach((key) => {
    ret[key] = instructionsForPlayer(key);
  });
  return ret;
};

module.exports = {
  editState,
  instructionsForPlayer,
  getInstructions,
  registerKeyDown,
  registerKeyUp,
  registerMouseDown,
  registerMouseMove,
  registerMouseUp,
  enableEdit,
  disableEdit,
  addTile,
  changeTile,
  addPlayer,
  removePlayer,
  update,
  modifyLevel,
  modifyPlayer,
  resizeLevel,
};
