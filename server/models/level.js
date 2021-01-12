const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
  title: String,
  creator: ObjectId, // of User
  rows: Number,
  cols: Number,
  gridTiles: [ObjectId], // of Tile, length should be exactly rows * cols
  availableTiles: [ObjectId], // of Tile
  // startX: Number, // x_cor of character spawn point
  // startY: Number, // y_cor of character spawn point
});

// compile model from schema
module.exports = mongoose.model("level", LevelSchema);
