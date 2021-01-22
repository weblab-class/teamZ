import { tileSize, tileSizeOnCanvas } from "../../constants.js";
/** helper functions */

const drawBackground = (canvas, backgroundImage) => {
  const context = canvas.getContext("2d");
  if (backgroundImage === null) {
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // TODO: "center" the background
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  }
};

/**Draws tile */
const drawTile = (canvas, tileImage, x, y) => {
  // console.log(`drawTile(x: ${x}, y: ${y})`);
  const context = canvas.getContext("2d");
  if (tileImage !== null) {
    context.drawImage(tileImage, x, y, tileSizeOnCanvas, tileSizeOnCanvas);
  }
};

/**
 * Draws all tiles on the level editor canvas given instructions.
 * @param {*} canvas the canvas element
 * @param {*} instructions a dictionary containing instructions
 *                         sent by logic.instructionsForPlayer
 *                           camX: player.camX,
 *                           camY: player.camY,
 *                           mouseX: player.mouseX,
 *                           mouseY: player.mouseY,
 *                           sliceRowStart: 0, //TODO
 *                           sliceColStart: 0, //TODO
 *                           sliceRows: 0, //TODO
 *                           sliceCols: 0, //TODO
 *                           slice: [], //TODO: row major order of slice
 * @param {*} tiles dict maps tileId to tile obj
 */
const drawTiles = (canvas, instructions, tiles) => {
  const context = canvas.getContext("2d");
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  // safely assume slice contains all the tiles we need.
  const iSlice = (row, col) => {
    return (
      (row - instructions.sliceRowStart) * instructions.sliceCols +
      (col - instructions.sliceColStart)
    );
  };
  const getCanvasCor = (absX, absY) => {
    const canvasToAbstractRatio = Math.floor(tileSizeOnCanvas / tileSize);
    const retX = (absX - instructions.camX) * canvasToAbstractRatio;
    const retY = (absY - instructions.camY) * canvasToAbstractRatio;
    return { x: retX, y: retY };
  };
  const isPixelOnCanvas = (x, y) => {
    return x >= 0 && y >= 0 && x < canvas.width && y < canvas.height;
  };
  const isTileOnCanvas = (row, col) => {
    // abstract (x,y) topleft of tile is (col * tileSize, row * tileSize)
    const topLeftTileCanvas = getCanvasCor(col * tileSize, row * tileSize);
    const bottomRightTileCanvas = getCanvasCor(
      col * tileSize + tileSize - 1,
      row * tileSize + tileSize - 1
    );
    return (
      isPixelOnCanvas(topLeftTileCanvas.x, topLeftTileCanvas.y) ||
      isPixelOnCanvas(bottomRightTileCanvas.x, bottomRightTileCanvas.y) ||
      isPixelOnCanvas(topLeftTileCanvas.x, bottomRightTileCanvas.y) ||
      isPixelOnCanvas(bottomRightTileCanvas.x, topLeftTileCanvas.x)
    );
  };
  // compute the tile under the mouse
  const getAbstractCor = (canX, canY) => {
    const canvasToAbstractRatio = Math.floor(tileSizeOnCanvas / tileSize);
    const retX = canX / canvasToAbstractRatio + instructions.camX;
    const retY = canY / canvasToAbstractRatio + instructions.camY;
    return { x: retX, y: retY };
  };
  for (let i = 0; i < instructions.sliceCols; i++) {
    for (let j = 0; j < instructions.sliceRows; j++) {
      const col = i + instructions.sliceColStart;
      const row = j + instructions.sliceRowStart;
      const canvasCors = getCanvasCor(col * tileSize, row * tileSize);
      if (isTileOnCanvas(row, col)) {
        const tileId = instructions.slice[iSlice(row, col)];
        const tileImage = tileId in tiles ? tiles[tileId].image : null;
        drawTile(canvas, tileImage, canvasCors.x, canvasCors.y);
      }
    }
  }
};

const drawCharSprite = (canvas, charSpriteImage, x, y) => {
  const context = canvas.getContext("2d");
  if (charSpriteImage === null) {
    context.fillStyle = "rgba(230,230,230,1)";
    context.fillRect(x, y, tileSizeOnCanvas, tileSizeOnCanvas);
  } else {
    context.drawImage(charSpriteImage, x, y, tileSizeOnCanvas, tileSizeOnCanvas);
  }
};

const drawChar = (canvas, instructions, charSpriteImage) => {
  const context = canvas.getContext("2d");
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const getCanvasCor = (absX, absY) => {
    const canvasToAbstractRatio = Math.floor(tileSizeOnCanvas / tileSize);
    const retX = (absX - instructions.camX) * canvasToAbstractRatio;
    const retY = (absY - instructions.camY) * canvasToAbstractRatio;
    return { x: retX, y: retY };
  };
  const charCanvasCors = getCanvasCor(instructions.x, instructions.y);
  drawCharSprite(canvas, charSpriteImage, charCanvasCors.x, charCanvasCors.y);
};
const clearCanvas = (canvas) => {
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
};
export const drawPlayCanvas = (canvas, instructions, tiles, charSpriteImage, backgroundImage) => {
  // console.log(
  //   `now drawing on edit canvas with cors mouseX: ${instructions.mouseX}, mouseY: ${instructions.mouseY}`
  // );
  // disable smoothing
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  clearCanvas(canvas);
  drawBackground(canvas, backgroundImage);
  drawTiles(canvas, instructions, tiles);
  drawChar(canvas, instructions, charSpriteImage);
};
