const mongoose = require("mongoose");

const TileSchema = new mongoose.Schema({
  name: String,
  layer: String,
  image: Buffer,
});

// compile model from schema
module.exports = mongoose.model("tile", TileSchema);
