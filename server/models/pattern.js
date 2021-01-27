const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const PatternSchema = new mongoose.Schema({
  image: String,
});

// compile model from schema
module.exports = mongoose.model("pattern", PatternSchema);
