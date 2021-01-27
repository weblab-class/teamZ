const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const PatternSchema = new mongoose.Schema({
  width: Number,
  height: Number,
  image: [Number], //
});

// compile model from schema
module.exports = mongoose.model("pattern", PatternSchema);
