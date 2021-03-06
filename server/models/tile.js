const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const TileSchema = new mongoose.Schema({
  name: String,
  layer: String,
  image: { type: ObjectId, ref: "pattern" },
});

// compile model from schema
module.exports = mongoose.model("tile", TileSchema);
