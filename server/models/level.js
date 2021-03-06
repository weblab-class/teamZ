const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const LevelSchema = new mongoose.Schema({
  title: String,
  description: String,
  creator: { type: ObjectId, ref: "user" },
  emptyTile: { type: ObjectId, ref: "tile" },
  rows: Number,
  cols: Number,
  gridTiles: [{ type: ObjectId, ref: "tile" }], // of Tile, length should be exactly rows * cols
  availableTiles: [{ type: ObjectId, ref: "tile" }], // of Tile
  startX: Number, // x_cor of character spawn point
  startY: Number, // y_cor of character spawn point
  charSprite: { type: ObjectId, ref: "pattern" }, // facing right
  background: { type: ObjectId, ref: "pattern" },
  isPublished: Boolean,
});

// compile model from schema
module.exports = mongoose.model("level", LevelSchema);
