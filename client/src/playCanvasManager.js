import { tileSize, tileSizeOnCanvas } from "../../constants.js";
import { clearCanvas, drawBackground, drawShade, drawCharSprite } from "./canvasUtilities.js";

/**Draws tile */
const drawTile = (canvas, tileImage, x, y) => {
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
      isPixelOnCanvas(bottomRightTileCanvas.x, topLeftTileCanvas.y)
    );
  };
  for (let i = 0; i < instructions.sliceCols; i++) {
    for (let j = 0; j < instructions.sliceRows; j++) {
      const col = i + instructions.sliceColStart;
      const row = j + instructions.sliceRowStart;
      const canvasCors = getCanvasCor(col * tileSize, row * tileSize);
      if (isTileOnCanvas(row, col)) {
        const tileId = instructions.slice[iSlice(row, col)];
        const tileImage = tileId in tiles ? tiles[tileId].image : null;
        drawTile(canvas, tileImage, Math.floor(canvasCors.x), Math.floor(canvasCors.y));
      }
    }
  }
};

const drawChar = (canvas, instructions, charSpriteImage, charSpriteImageFlipped) => {
  const getCanvasCor = (absX, absY) => {
    const canvasToAbstractRatio = Math.floor(tileSizeOnCanvas / tileSize);
    const retX = (absX - instructions.camX) * canvasToAbstractRatio;
    const retY = (absY - instructions.camY) * canvasToAbstractRatio;
    return { x: retX, y: retY };
  };
  const charCanvasCors = getCanvasCor(instructions.x, instructions.y);
  drawCharSprite(
    canvas,
    charSpriteImage,
    charSpriteImageFlipped,
    charCanvasCors.x,
    charCanvasCors.y,
    instructions.isFacingRight
  );
};

export const drawPlayCanvas = (
  canvas,
  instructions,
  tiles,
  charSpriteImage,
  charSpriteImageFlipped,
  backgroundImage
) => {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  clearCanvas(canvas);
  drawBackground(canvas, backgroundImage);
  drawTiles(canvas, instructions, tiles);
  drawChar(canvas, instructions, charSpriteImage, charSpriteImageFlipped);
  drawShade(canvas, instructions.restartFraction);
};
