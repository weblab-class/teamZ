import { tileSize, tileSizeOnCanvas } from "../../constants.js";
/** helper functions */

// hard code backgroundImage to be black for now
const drawBackground = (
  canvas
  /*, backgroundImage*/
) => {
  const context = canvas.getContext("2d");
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
  // context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
};

/**Draws tile */
const drawTile = (context, tileImage, x, y) => {
  // TODO: add border to tile?
  // to draw a bitmap image onto context at cors x, y, consult:
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage#syntax
  context.drawImage(tileImage, x, y, tileSizeOnCanvas, tileSizeOnCanvas);
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
 * @param {*} images a dictionary mapping id to Image object
 */
const drawTiles = (canvas, instructions, images) => {
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
  const getCanvasCor = (absX, absY, camX, camY) => {
    const canvasToAbstractRatio = Math.floor(tileSizeOnCanvas / tileSize);
    const retX = (absX - camX) * canvasToAbstractRatio;
    const retY = (absY - camY) * canvasToAbstractRatio;
    return { x: retX, y: retY };
  };
  // calculate which tile the camera is on.
  const rowStart = Math.floor(instructions.camY / tileSize);
  const colStart = Math.floor(instructions.camX / tileSize);
  // calculate the top left pixel of camera tile, in abstract coordinates
  const xStart = colStart * tileSize;
  const yStart = rowStart * tileSize;
  // calculate the canvas cors of the camera tile
  const canvasCorsTopLeftTile = getCanvasCor(xStart, yStart, instructions.camX, instructions.camY);
  const canvasXStart = canvasCorsTopLeftTile.x;
  const canvasYStart = canvasCorsTopLeftTile.y;
  // calculate how many tiles across and high I have to draw on canvas
  const tilesAcross = Math.ceil((canvasWidth - canvasXStart) / tileSizeOnCanvas);
  const tilesHigh = Math.ceil((canvasHeight - canvasYStart) / tileSizeOnCanvas);
  // start drawing tiles.
  for (let i = colStart; i < colStart + tilesAcross; i++) {
    for (let j = rowStart; j < rowStart + tilesHigh; j++) {
      const tileId = instructions.slice[iSlice(i, j)];
      const tileImage = images[tileId];
      const canvasX = canvasXStart + i * tileSizeOnCanvas;
      const canvasY = canvasYStart + j * tileSizeOnCanvas;
      drawTile(context, tileImage, canvasX, canvasY);
    }
  }
};

export const drawEditCanvas = (canvas, instructions, images) => {
  drawBackground(canvas);
  drawTiles(canvas, instructions, images);
};
