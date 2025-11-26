const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

const checkPostgres = async () => {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'admin123',
    database: process.env.POSTGRES_DB || 'school_db',
  });

  for (let i = 0; i < 30; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('PostgreSQL is ready!');
      await pool.end();
      return true;
    } catch (error) {
      console.log(`Waiting for PostgreSQL... (${i + 1}/30)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
};

const checkMongoDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/school_db?authSource=admin';
  
  for (let i = 0; i < 30; i++) {
    try {
      const client = new MongoClient(uri);
      await client.connect();
      await client.db('school_db').admin().ping();
      console.log('MongoDB is ready!');
      await client.close();
      return true;
    } catch (error) {
      console.log(`Waiting for MongoDB... (${i + 1}/30)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
};

const waitForDatabases = async () => {
  console.log('Waiting for databases to be ready...');
  const pgReady = await checkPostgres();
  const mongoReady = await checkMongoDB();
  
  if (pgReady && mongoReady) {
    console.log('All databases are ready!');
    process.exit(0);
  } else {
    console.error('Databases failed to become ready');
    process.exit(1);
  }
};

waitForDatabases();





