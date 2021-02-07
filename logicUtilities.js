const constants = require("./constants.js");

/**
 * Translates abstract coordinates to canvas coordinates
 * @param {*} absX abstract x cor
 * @param {*} absY abstract y cor
 * @param {*} camX x cor of camera
 * @param {*} camY y cor of camera
 * @return a dictionary with attributes `x` and `y` containing the desired canvas coordinates.
 */
const toCanvasCors = (absX, absY, camX, camY) => {
  const retX = (absX - camX) * constants.canvasToAbstractRatio;
  const retY = (absY - camY) * constants.canvasToAbstractRatio;
  return { x: retX, y: retY };
};

/**
 * Translates canvas coordinates to abstract coordinates
 * @param {*} canX canvas x cor
 * @param {*} canY canvas y cor
 * @param {*} camX x cor of camera
 * @param {*} camY y cor of camera
 * @return a dictionary with attributes `x` and `y` containing the desired abstract coordinates.
 */
const toAbstractCors = (canX, canY, camX, camY) => {
  return {
    x: Math.floor(canX / constants.canvasToAbstractRatio + camX),
    y: Math.floor(canY / constants.canvasToAbstractRatio + camY),
  };
};

const isPixelOnCanvas = (x, y, canvasWidth, canvasHeight) => {
  return x >= 0 && y >= 0 && x < canvasWidth && y < canvasHeight;
};

/**
 * Returns whether the tile at [row, col] is on canvas.
 * @param {*} row row of tile
 * @param {*} col column of tile
 * @param {*} camX x cor of camera
 * @param {*} camY y cor of camera
 * @param {*} canvasWidth width of canvas
 * @param {*} canvasHeight height of canvas
 * @return boolean: aforementioned value
 */
const isTileOnCanvas = (row, col, camX, camY, canvasWidth, canvasHeight) => {
  const topLeftTileCanvas = toCanvasCors(
    col * constants.tileSize,
    row * constants.tileSize,
    camX,
    camY
  );
  const bottomRightTileCanvas = toCanvasCors(
    col * constants.tileSize + constants.tileSize - 1,
    row * constants.tileSize + constants.tileSize - 1,
    camX,
    camY
  );
  return (
    isPixelOnCanvas(topLeftTileCanvas.x, topLeftTileCanvas.y, canvasWidth, canvasHeight) ||
    isPixelOnCanvas(bottomRightTileCanvas.x, bottomRightTileCanvas.y, canvasWidth, canvasHeight) ||
    isPixelOnCanvas(topLeftTileCanvas.x, bottomRightTileCanvas.y, canvasWidth, canvasHeight) ||
    isPixelOnCanvas(bottomRightTileCanvas.x, topLeftTileCanvas.y, canvasWidth, canvasHeight)
  );
};

module.exports = {
  toAbstractCors,
  toCanvasCors,
  isTileOnCanvas,
};
