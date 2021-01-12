const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const LevelSchema = new mongoose.Schema({
  title: String,
  creator: ObjectId, // of User
  emptyTile: ObjectId, // of Tile
  rows: Number,
  cols: Number,
  gridTiles: [ObjectId], // of Tile, length should be exactly rows * cols
  availableTiles: [ObjectId], // of Tile
  // startX: Number, // x_cor of character spawn point
  // startY: Number, // y_cor of character spawn point
});

// compile model from schema
module.exports = mongoose.model("level", LevelSchema);
