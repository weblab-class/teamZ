import { tileSize, tileSizeOnCanvas } from "../../constants.js";
import {
  clearCanvas,
  drawBackground,
  drawShade,
  drawCharSprite,
  drawTile,
} from "./canvasUtilities.js";
import { toAbstractCors, toCanvasCors, isTileOnCanvas } from "../../logicUtilities.js";

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
        const tileId = instructions.slice[iSlice(row, col)];
        const tileImage = tileId in tiles ? tiles[tileId].image : null;
        drawTile(canvas, tileImage, Math.floor(canvasCors.x), Math.floor(canvasCors.y), false);
      }
    }
  }
};

const drawChar = (canvas, instructions, charSpriteImage, charSpriteImageFlipped) => {
  const charCanvasCors = toCanvasCors(
    instructions.x,
    instructions.y,
    instructions.camX,
    instructions.camY
  );
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
