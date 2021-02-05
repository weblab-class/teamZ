const tileSize = 16; // size of tile, abstractly
const tileSizeOnCanvas = 48; // number of pixels each tile takes on canvas.
const canvasToAbstractRatio = Math.floor(tileSizeOnCanvas / tileSize);
const GOOGLE_CLIENT_ID = "968597986163-jb2ki4cdo7df3jfui7j1vshv8vc2j3dp.apps.googleusercontent.com";

module.exports = {
  tileSize,
  tileSizeOnCanvas,
  canvasToAbstractRatio,
  GOOGLE_CLIENT_ID,
};
