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
 * @param {*} instructions dictionary containing rendering instructions, sent from playLogic
 * @param {*} tiles {tileId: {image: CanvasImageSource, ...}}
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

/**
 * Draws the character on the play page canvas given instructions.
 * @param {*} canvas canvas
 * @param {*} instructions dictionary containing rendering instructions, sent from playLogic
 * @param {*} charSpriteImage CanvasImageSource of char sprite, facing right
 * @param {*} charSpriteImageFlipped CanvasImageSource of char sprite, facing left
 */
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

/**
 * Draws on the canvas on the play page.
 * @param {*} canvas canvas
 * @param {*} instructions dictionary containing rendering instructions, sent from playLogic
 * @param {*} tiles {tileId: {image: CanvasImageSource, ...}}
 * @param {*} charSpriteImage CanvasImageSource of char sprite, facing right
 * @param {*} charSpriteImageFlipped CanvasImageSource of char sprite, facing left
 * @param {*} backgroundImage CanvasImageSource of background image
 */
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
