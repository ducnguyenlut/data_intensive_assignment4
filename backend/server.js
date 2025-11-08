const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to the single MongoDB database
const nosql = mongoose.createConnection('mongodb://mongodb:27017/nosql');

// Import schemas
const userSchema = require('./models/User');
const productSchema = require('./models/Product');
const categorySchema = require('./models/Category');
const orderSchema = require('./models/Order');
const reviewSchema = require('./models/Review');

// Create models for the DB
const models = {
    nosql: {
        User: nosql.model('User', userSchema),
        Product: nosql.model('Product', productSchema),
        Category: nosql.model('Category', categorySchema),
        Order: nosql.model('Order', orderSchema),
        Review: nosql.model('Review', reviewSchema),
    }
};

// Middleware to select DB from params
function selectDB(req, res, next) {
    const dbName = req.params.db;
    if (!models[dbName]) return res.status(400).send('Invalid database');
    req.db = models[dbName];
    next();
}

// --------- ROUTES ----------

// Get all documents from a collection
app.get('/:db/:collection', selectDB, async (req, res) => {
    const collection = req.params.collection;

    const collectionMap = {
        users: 'User',
        products: 'Product',
        categories: 'Category',
        orders: 'Order',
        reviews: 'Review'
    };

    const ModelName = collectionMap[collection];
    if (!ModelName) return res.status(400).send('Invalid collection');

    const Model = req.db[ModelName];

    try {
        const data = await Model.find();
        res.json(data);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Server error");
    }
});

// Create new user with auto-increment _id
app.post('/:dbName/users', async (req, res) => {
  const { dbName } = req.params;
  const { name, email, age } = req.body;

  try {
    const UserModel = models[dbName].User;

    // Compute next _id by finding the max existing _id
    const lastUser = await UserModel.findOne().sort({ _id: -1 }).lean();
    const nextId = lastUser ? lastUser._id + 1 : 1;

    const newUser = await UserModel.create({ _id: nextId, name, email, age });

    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to create user');
  }
});

// Update a single item by _id
app.put('/:db/:collection/:id', selectDB, async (req, res) => {
    const collection = req.params.collection;
    const id = req.params.id;
    const updateData = req.body;

    const collectionMap = {
        users: 'User',
        products: 'Product',
        categories: 'Category',
        orders: 'Order',
        reviews: 'Review'
    };

    const Model = req.db[collectionMap[collection]];
    if (!Model) return res.status(400).send('Invalid collection');

    try {
        const updated = await Model.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return res.status(404).send('Item not found');
        res.json(updated);
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).send("Server error");
    }
});

// Delete a single item by _id
app.delete('/:db/:collection/:id', selectDB, async (req, res) => {
    const collection = req.params.collection;
    const id = req.params.id;

    const collectionMap = {
        users: 'User',
        products: 'Product',
        categories: 'Category',
        orders: 'Order',
        reviews: 'Review'
    };

    const Model = req.db[collectionMap[collection]];
    if (!Model) return res.status(400).send('Invalid collection');

    try {
        const deleted = await Model.findByIdAndDelete(id);
        if (!deleted) return res.status(404).send('Item not found');
        res.json({ message: `Deleted ${collection} with id ${id}` });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).send("Server error");
    }
});

// Import dummy data
const { users, products, categories, orders, reviews } = require("./dummy-data");

// Restore DB endpoint
app.post('/:db/restore', selectDB, async (req, res) => {
  const Models = req.db;

  try {
    // Clear old data
    await Promise.all(Object.keys(Models).map(key => Models[key].deleteMany({})));

    // Restore from dummy-data
    await Models.User.insertMany(users);
    await Models.Product.insertMany(products);
    await Models.Category.insertMany(categories);
    await Models.Order.insertMany(orders);
    await Models.Review.insertMany(reviews);

    res.json({ message: `nosql restored successfully` });
  } catch (err) {
    console.error("Restore error:", err);
    res.status(500).send("Failed to restore database");
  }
});

// Test route
app.get('/', (req, res) => res.send('Backend server is running'));

// Start server
const PORT = 2000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
