import { tileSize, tileSizeOnCanvas } from "../../constants.js";
import { isTileOnCanvas, toCanvasCors, toAbstractCors } from "../../logicUtilities";

/**
 * Clears a canvas
 * @param {*} canvas canvas
 */
export const clearCanvas = (canvas) => {
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
};

/**
 * Draws a background on given canvas. Background takes up entire canvas
 * and defaults to black if backgroundImage is null
 * @param {*} canvas canvas
 * @param {*} backgroundImage an instance of a CanvasImageSource, or null, in which case
 *                            default black background is drawn.
 */
export const drawBackground = (canvas, backgroundImage) => {
  const context = canvas.getContext("2d");
  if (backgroundImage === null) {
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  }
};

/**
 * Shades the entire canvas by a certain percentage.
 * @param {*} canvas canvas
 * @param {*} perc a number from 0 to 1 that specifies how much to shade, with 0 being no shade,
 *                 to 1 making the entire canvas black.
 */
export const drawShade = (canvas, perc) => {
  const context = canvas.getContext("2d");
  if (perc > 0) {
    context.fillStyle = `rgba(0,0,0,${1 - 2 * Math.abs(0.5 - perc)})`;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
};

/**
 * Darkens a square at (x,y) of size `tileSizeOnCanvas` on given canvas
 * @param {*} canvas canvas
 * @param {*} x top-left x cor of shaded square
 * @param {*} y top-left y cor of shaded square
 */
export const darken = (canvas, x, y) => {
  const context = canvas.getContext("2d");
  context.fillStyle = "rgba(0, 0, 0, .4)";
  context.fillRect(x, y, tileSizeOnCanvas, tileSizeOnCanvas);
};

// load the default char sprite
import defaultChar from "/client/src/public/defaultChar.png";
let defaultCharSprite = null;
const img = document.createElement("img");
img.onload = () => {
  createImageBitmap(img).then((bitmap) => {
    defaultCharSprite = bitmap;
  });
};
img.src = defaultChar;

/**
 * Draws the character sprite on the canvas.
 * @param {*} canvas canvas
 * @param {*} charSpriteImage a CanvasImageSource instance that represents the image of the
 *                            character facing right. If null, the default char sprite is drawn.
 * @param {*} charSpriteImageFlipped similar to charSpriteImage, but facing left. If null,
 *                                   charSpriteImage is drawn.
 * @param {*} x top-left x cor of char sprite
 * @param {*} y top-left y cor of char sprite
 * @param {*} isFacingRight boolean specifying whether the character is facing right.
 *                          This function will draw charSpriteImage if isFacingRight is true;
 *                          else charSpriteImageFlipped
 */
export const drawCharSprite = (
  canvas,
  charSpriteImage,
  charSpriteImageFlipped,
  x,
  y,
  isFacingRight
) => {
  const context = canvas.getContext("2d");
  if (charSpriteImage === null) {
    if (defaultCharSprite === null) {
      context.fillStyle = "rgba(230,230,230,1)";
      context.fillRect(x, y, tileSizeOnCanvas, tileSizeOnCanvas);
    } else {
      context.drawImage(defaultCharSprite, x, y, tileSizeOnCanvas, tileSizeOnCanvas);
    }
  } else {
    if (isFacingRight) {
      context.drawImage(charSpriteImage, x, y, tileSizeOnCanvas, tileSizeOnCanvas);
    } else {
      if (charSpriteImageFlipped !== null) {
        context.drawImage(charSpriteImageFlipped, x, y, tileSizeOnCanvas, tileSizeOnCanvas);
      } else {
        context.drawImage(charSpriteImage, x, y, tileSizeOnCanvas, tileSizeOnCanvas);
      }
    }
  }
};

/**
 * Draws a tile on the canvas.
 * @param {*} canvas canvas
 * @param {*} tileImage a CanvasImageSource representing the image of the tile. If null, then the
 *                      empty tile is drawn.
 * @param {*} x top-left x cor of tile
 * @param {*} y top-left y cor of tile
 * @param {*} isInEditor boolean: are you drawing this tile in the level editor?
 */
export const drawTile = (canvas, tileImage, x, y, isInEditor) => {
  const context = canvas.getContext("2d");
  if (tileImage === null) {
    // if null, draw semi-opaque rect if in editor. else, do nothing.
    if (isInEditor) {
      context.strokeStyle = "rgba(0,0,0,0)";
      context.fillStyle = "rgba(240,240,240,0.21)";
      context.fillRect(x, y, tileSizeOnCanvas, tileSizeOnCanvas);
    }
  } else {
    // tileImage is not null
    context.drawImage(tileImage, x, y, tileSizeOnCanvas, tileSizeOnCanvas);
  }
  // draw border if in editor
  if (isInEditor) {
    context.strokeStyle = "rgba(200,200,200,0.8)";
    context.lineWidth = 2;
    context.strokeRect(x, y, tileSizeOnCanvas, tileSizeOnCanvas);
  }
};
