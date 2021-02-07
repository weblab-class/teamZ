import { tileSize, tileSizeOnCanvas } from "../../constants.js";
import {
  clearCanvas,
  drawBackground,
  darken,
  drawCharSprite,
  drawTile,
} from "./canvasUtilities.js";
import { toCanvasCors, toAbstractCors, isTileOnCanvas } from "../../logicUtilities.js";

/**
 * Draws all tiles on the level editor canvas given instructions.
 * @param {*} canvas the canvas element
 * @param {*} instructions a dictionary containing instructions
 *                         sent by logic.instructionsForPlayer
 *                           camX:
 *                           camY:
 *                           mouseX:
 *                           mouseY:
 *                           sliceRowStart:
 *                           sliceColStart:
 *                           sliceRows:
 *                           sliceCols:
 *                           slice:
 * @param {*} tiles {tileId: {image: CanvasImageSource, ...}}
 */
const drawTiles = (canvas, instructions, tiles) => {
  // safely assume slice contains all the tiles we need.
  const iSlice = (row, col) => {
    return (
      (row - instructions.sliceRowStart) * instructions.sliceCols +
      (col - instructions.sliceColStart)
    );
  };
  // compute the tile under the mouse
  const absMouseCors = toAbstractCors(
    instructions.mouseX,
    instructions.mouseY,
    instructions.camX,
    instructions.camY
  );
  const colMouse = Math.floor(absMouseCors.x / tileSize);
  const rowMouse = Math.floor(absMouseCors.y / tileSize);
  for (let i = 0; i < instructions.sliceCols; i++) {
    for (let j = 0; j < instructions.sliceRows; j++) {
      const col = i + instructions.sliceColStart;
      const row = j + instructions.sliceRowStart;
      const canvasCors = toCanvasCors(
        col * tileSize,
        row * tileSize,
        instructions.camX,
        instructions.camY
      );
      if (
        isTileOnCanvas(row, col, instructions.camX, instructions.camY, canvas.width, canvas.height)
      ) {
        const shouldDarken = col === colMouse && row === rowMouse;
        const tileId = instructions.slice[iSlice(row, col)];
        const tileImage = tileId in tiles ? tiles[tileId].image : null;
        drawTile(canvas, tileImage, canvasCors.x, canvasCors.y, true);
        if (shouldDarken) {
          darken(canvas, canvasCors.x, canvasCors.y);
        }
      }
    }
  }
};

/**
 * Draws the character on the edit page canvas given instructions.
 * @param {*} canvas canvas
 * @param {*} instructions dictionary containing rendering instructions, sent from editLogic
 * @param {*} charSpriteImage CanvasImageSource of char sprite, facing right
 */
const drawChar = (canvas, instructions, charSpriteImage) => {
  const charCanvasCors = toCanvasCors(
    instructions.startX,
    instructions.startY,
    instructions.camX,
    instructions.camY
  );
  const mouseAbsCors = toAbstractCors(
    instructions.mouseX,
    instructions.mouseY,
    instructions.camX,
    instructions.camY
  );
  const playerMouseOnChar =
    instructions.startX <= mouseAbsCors.x &&
    mouseAbsCors.x < instructions.startX + tileSize &&
    instructions.startY <= mouseAbsCors.y &&
    mouseAbsCors.y < instructions.startY + tileSize;
  const shouldDarken = playerMouseOnChar || instructions.isDraggingChar;
  drawCharSprite(canvas, charSpriteImage, null, charCanvasCors.x, charCanvasCors.y, true);
  if (shouldDarken) {
    darken(canvas, charCanvasCors.x, charCanvasCors.y);
  }
};

/**
 * Draws on the canvas on the edit page.
 * @param {*} canvas canvas
 * @param {*} instructions dictionary containing rendering instructions, sent from editLogic
 * @param {*} tiles {tileId: {image: CanvasImageSource, ...}}
 * @param {*} charSpriteImage CanvasImageSource of char sprite, facing right
 * @param {*} backgroundImage CanvasImageSource of background image
 */
export const drawEditCanvas = (canvas, instructions, tiles, charSpriteImage, backgroundImage) => {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  clearCanvas(canvas);
  drawBackground(canvas, backgroundImage);
  drawTiles(canvas, instructions, tiles);
  drawChar(canvas, instructions, charSpriteImage);
};
