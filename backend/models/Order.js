const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  _id: Number,
  user: String,
  product: String,
  quantity: Number
});

// const Order = mongoose.model("Order", orderSchema);

module.exports = orderSchema;