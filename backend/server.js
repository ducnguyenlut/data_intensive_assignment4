const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { getMongoDb } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    const mongoDb = getMongoDb();
    if (mongoDb) {
      await mongoDb.admin().ping();
    }
    res.json({ 
      status: 'OK', 
      message: 'Backend is running',
      databases: {
        postgres: 'connected',
        mongodb: mongoDb ? 'connected' : 'connecting'
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'PARTIAL', 
      message: 'Backend is running but databases may not be ready',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

