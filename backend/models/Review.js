const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  _id: Number,
  user: String,
  product: String,
  rating: Number,
  comment: String
});

module.exports = reviewSchema;