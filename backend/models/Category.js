const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  _id: Number,
  name: String,
  description: String,
  popularity: Number
});

// const Category = mongoose.model("Category", categorySchema);

module.exports = categorySchema;