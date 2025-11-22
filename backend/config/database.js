const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

// PostgreSQL connection
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'admin123',
  database: process.env.POSTGRES_DB || 'school_db',
});

// MongoDB connection
let mongoClient;
let mongoDb;

const connectMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/school_db?authSource=admin';
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    mongoDb = mongoClient.db('school_db');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Retry connection after a delay
    setTimeout(connectMongoDB, 5000);
  }
};

// Initialize MongoDB connection with retry logic
let retryCount = 0;
const maxRetries = 10;

const initializeMongoDB = async () => {
  try {
    await connectMongoDB();
  } catch (error) {
    retryCount++;
    if (retryCount < maxRetries) {
      console.log(`Retrying MongoDB connection (${retryCount}/${maxRetries})...`);
      setTimeout(initializeMongoDB, 5000);
    } else {
      console.error('Failed to connect to MongoDB after multiple retries');
    }
  }
};

initializeMongoDB();

module.exports = {
  pgPool,
  getMongoDb: () => mongoDb,
  getMongoClient: () => mongoClient,
};

