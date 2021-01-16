// import { tileSize, tileSizeOnCanvas } from "../../constants.js";
const tileSize = 16;
const tileSizeOnCanvas = 64;
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
const drawTile = (canvas, tileImage, x, y, isDarkened) => {
  // console.log(`drawTile(x: ${x}, y: ${y})`);
  const context = canvas.getContext("2d");
  // TODO: add border to tile?
  // to draw a bitmap image onto context at cors x, y, consult:
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage#syntax
  // context.drawImage(tileImage, x, y, tileSizeOnCanvas, tileSizeOnCanvas);
  // HARD CODE FOR NOW
  context.strokeStyle = "red";
  if (isDarkened) context.strokeStyle = "green"; // just pretend green is darkened for now
  context.lineWidth = 2;
  context.strokeRect(x, y, tileSizeOnCanvas, tileSizeOnCanvas);
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
      isPixelOnCanvas(bottomRightTileCanvas.x, bottomRightTileCanvas.y)
    );
  };
  // compute the tile under the mouse
  const getAbstractCor = (canX, canY) => {
    const canvasToAbstractRatio = Math.floor(tileSizeOnCanvas / tileSize);
    const retX = canX / canvasToAbstractRatio + instructions.camX;
    const retY = canY / canvasToAbstractRatio + instructions.camY;
    return { x: retX, y: retY };
  };
  const absMouseCors = getAbstractCor(instructions.mouseX, instructions.mouseY);
  //console.log(`absMouseCors: (${absMouseCors.x}, ${absMouseCors.y})`);
  const colMouse = Math.floor(absMouseCors.x / tileSize);
  const rowMouse = Math.floor(absMouseCors.y / tileSize);
  //console.log(`colMouse: ${colMouse}, rowMouse: ${rowMouse}`);
  // ---
  for (let i = 0; i < instructions.sliceCols; i++) {
    for (let j = 0; j < instructions.sliceRows; j++) {
      const col = i + instructions.sliceColStart;
      const row = j + instructions.sliceRowStart;
      const canvasCors = getCanvasCor(col * tileSize, row * tileSize);
      if (isTileOnCanvas(row, col)) {
        const shouldDarken = col === colMouse && row === rowMouse;
        drawTile(canvas, null, canvasCors.x, canvasCors.y, shouldDarken);
      }
    }
  }
  // // // old, possibly buggy code below
  // // calculate which tile the camera is on.
  // const rowStart = Math.floor(instructions.camY / tileSize);
  // const colStart = Math.floor(instructions.camX / tileSize);
  // // calculate the top left pixel of camera tile, in abstract coordinates
  // const xStart = colStart * tileSize;
  // const yStart = rowStart * tileSize;
  // // calculate the canvas cors of the camera tile
  // const canvasCorsTopLeftTile = getCanvasCor(xStart, yStart);
  // const canvasXStart = canvasCorsTopLeftTile.x;
  // const canvasYStart = canvasCorsTopLeftTile.y;
  // // calculate how many tiles across and high I have to draw on canvas
  // // const tilesAcross = Math.ceil((canvasWidth - canvasXStart) / tileSizeOnCanvas);
  // // const tilesHigh = Math.ceil((canvasHeight - canvasYStart) / tileSizeOnCanvas);
  // const tilesAcross = 10;
  // const tilesHigh = 10;
  // // start drawing tiles.
  // for (let i = colStart; i < colStart + tilesAcross; i++) {
  //   for (let j = rowStart; j < rowStart + tilesHigh; j++) {
  //     //const tileId = instructions.slice[iSlice(i, j)];
  //     // const tileImage = images[tileId];
  //     const tileImage = null; // HARD CODED FOR NOW, DELETE LATER TODO
  //     const canvasX = canvasXStart + i * tileSizeOnCanvas;
  //     const canvasY = canvasYStart + j * tileSizeOnCanvas;
  //     drawTile(canvas, tileImage, canvasX, canvasY);
  //   }
  // }
};

export const drawEditCanvas = (canvas, instructions, images) => {
  drawBackground(canvas);
  drawTiles(canvas, instructions, images);
};
