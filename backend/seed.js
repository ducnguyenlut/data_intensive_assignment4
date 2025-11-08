// seed.js
const mongoose = require("mongoose");
const { users, products, categories, orders, reviews } = require("./dummy-data");

// Import schemas (each file exports only the schema)
const userSchema = require("./models/User");
const productSchema = require("./models/Product");
const categorySchema = require("./models/Category");
const orderSchema = require("./models/Order");
const reviewSchema = require("./models/Review");

const dbName = "nosql"; // single DB

async function seedDatabase() {
  try {
    // Create connection
    const connection = mongoose.createConnection(`mongodb://mongodb:27017/${dbName}`);

    // Wait for connection to be open
    await new Promise((resolve, reject) => {
      connection.once("open", resolve);
      connection.on("error", reject);
    });

    console.log(`Seeding ${dbName}...`);

    // Create models for this connection
    const Models = {
      User: connection.model("User", userSchema),
      Product: connection.model("Product", productSchema),
      Category: connection.model("Category", categorySchema),
      Order: connection.model("Order", orderSchema),
      Review: connection.model("Review", reviewSchema),
    };

    // Clear old data
    for (let key of Object.keys(Models)) {
      await Models[key].deleteMany({});
    }

    // Insert dummy data
    await Models.User.insertMany(users);
    await Models.Product.insertMany(products);
    await Models.Category.insertMany(categories);
    await Models.Order.insertMany(orders);
    await Models.Review.insertMany(reviews);

    console.log(`${dbName} seeded successfully!`);

    // Close connection
    await connection.close();
  } catch (err) {
    console.error(`Error seeding ${dbName}:`, err);
  } finally {
    console.log("All databases seeded!");
    process.exit();
  }
}

seedDatabase();
