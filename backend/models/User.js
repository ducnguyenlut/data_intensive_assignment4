const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: Number,
  name: String,
  email: String,
  age: Number
});

module.exports = userSchema;