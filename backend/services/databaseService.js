const { pgPool, getMongoDb } = require('../config/database');

// Database abstraction layer - routes requests to appropriate database
// User doesn't know which database is being used

class DatabaseService {
  // Get all entities from both databases
  async getAllEntities(entityType) {
    const results = {
      postgres: [],
      mongodb: [],
      combined: []
    };

    try {
      // Get from PostgreSQL
      if (['teachers', 'classes', 'students', 'subjects', 'enrollments'].includes(entityType)) {
        try {
          const tableName = this.getTableName(entityType);
          const query = `SELECT * FROM ${tableName}`;
          const pgResult = await pgPool.query(query);
          results.postgres = pgResult.rows;
        } catch (error) {
          console.error(`PostgreSQL error for ${entityType}:`, error.message);
          results.postgres = [];
        }
      }

      // Get from MongoDB
      if (['teachers', 'classes', 'students', 'librarybooks', 'events'].includes(entityType)) {
        try {
          const collectionName = this.getCollectionName(entityType);
          const mongoDb = getMongoDb();
          if (mongoDb) {
            const mongoResult = await mongoDb.collection(collectionName).find({}).toArray();
            results.mongodb = mongoResult;
          }
        } catch (error) {
          console.error(`MongoDB error for ${entityType}:`, error.message);
          results.mongodb = [];
        }
      }

      // Combine similar entities (teachers, classes, students)
      if (['teachers', 'classes', 'students'].includes(entityType)) {
        results.combined = this.combineResults(results.postgres, results.mongodb, entityType);
      }

      return results;
    } catch (error) {
      console.error(`Error getting ${entityType}:`, error);
      throw error;
    }
  }

  // Insert entity - automatically routes to appropriate database
  async insertEntity(entityType, data) {
    try {
      // For entities that exist in both databases, check for MongoDB-specific fields
      if (['teachers', 'classes', 'students'].includes(entityType)) {
        const mongoSpecificFields = this.getMongoSpecificFields(entityType);
        const hasMongoFields = mongoSpecificFields.some(field => data.hasOwnProperty(field));
        
        if (hasMongoFields) {
          // Insert into MongoDB if it has MongoDB-specific fields
          return await this.insertMongoDB(entityType, data);
        } else {
          // Otherwise insert into PostgreSQL
          return await this.insertPostgreSQL(entityType, data);
        }
      }
      // Route to PostgreSQL for: subjects, enrollments
      else if (['subjects', 'enrollments'].includes(entityType)) {
        return await this.insertPostgreSQL(entityType, data);
      }
      // Route to MongoDB for: librarybooks, events
      else if (['librarybooks', 'events'].includes(entityType)) {
        return await this.insertMongoDB(entityType, data);
      }
      else {
        throw new Error(`Unknown entity type: ${entityType}`);
      }
    } catch (error) {
      console.error(`Error inserting ${entityType}:`, error);
      throw error;
    }
  }

  // Delete entity - automatically routes to appropriate database
  async deleteEntity(entityType, id) {
    try {
      // For entities that exist in both databases, try MongoDB first, then PostgreSQL
      if (['teachers', 'classes', 'students'].includes(entityType)) {
        const mongoDb = getMongoDb();
        if (mongoDb) {
          const collectionName = this.getCollectionName(entityType);
          const idField = this.getMongoIdField(entityType);
          const mongoRecord = await mongoDb.collection(collectionName).findOne({ [idField]: parseInt(id) });
          
          if (mongoRecord) {
            return await this.deleteMongoDB(entityType, id);
          }
        }
        // If not found in MongoDB, try PostgreSQL
        return await this.deletePostgreSQL(entityType, id);
      }
      // Route to PostgreSQL for: subjects, enrollments
      else if (['subjects', 'enrollments'].includes(entityType)) {
        return await this.deletePostgreSQL(entityType, id);
      }
      // Route to MongoDB for: librarybooks, events
      else if (['librarybooks', 'events'].includes(entityType)) {
        return await this.deleteMongoDB(entityType, id);
      }
      else {
        throw new Error(`Unknown entity type: ${entityType}`);
      }
    } catch (error) {
      console.error(`Error deleting ${entityType}:`, error);
      throw error;
    }
  }

  // Update entity - automatically routes to appropriate database
  async updateEntity(entityType, id, data) {
    try {
      // For entities that exist in both databases, check which one has the record
      if (['teachers', 'classes', 'students'].includes(entityType)) {
        // Check if record exists in MongoDB first (by checking for MongoDB-specific fields or by ID)
        const mongoDb = getMongoDb();
        if (mongoDb) {
          const collectionName = this.getCollectionName(entityType);
          const idField = this.getMongoIdField(entityType);
          const mongoRecord = await mongoDb.collection(collectionName).findOne({ [idField]: parseInt(id) });
          
          // If record exists in MongoDB or has MongoDB-specific fields, update MongoDB
          const mongoSpecificFields = this.getMongoSpecificFields(entityType);
          const hasMongoFields = mongoSpecificFields.some(field => data.hasOwnProperty(field));
          
          if (mongoRecord || hasMongoFields) {
            const result = await this.updateMongoDB(entityType, id, data);
            if (result) {
              return result;
            }
            // If MongoDB update returned null, the record might not exist there, try PostgreSQL
          }
        }
        
        // Otherwise, filter out MongoDB-only fields and update PostgreSQL
        const filteredData = this.filterPostgresFields(entityType, data);
        // Make sure we have data to update
        if (Object.keys(filteredData).length === 0) {
          throw new Error('No valid fields to update (all fields are MongoDB-specific)');
        }
        const result = await this.updatePostgreSQL(entityType, id, filteredData);
        if (result) {
          return result;
        }
        // If PostgreSQL update returned null/undefined, try MongoDB as fallback
        if (mongoDb) {
          const result = await this.updateMongoDB(entityType, id, data);
          return result;
        }
        return null;
      }
      // Route to PostgreSQL for subjects and enrollments
      else if (['subjects', 'enrollments'].includes(entityType)) {
        return await this.updatePostgreSQL(entityType, id, data);
      }
      // Route to MongoDB for librarybooks and events
      else if (['librarybooks', 'events'].includes(entityType)) {
        return await this.updateMongoDB(entityType, id, data);
      }
      else {
        throw new Error(`Unknown entity type: ${entityType}`);
      }
    } catch (error) {
      console.error(`Error updating ${entityType}:`, error);
      throw error;
    }
  }

  // Join similar tables from both databases
  async joinEntities(entityType) {
    try {
      const results = await this.getAllEntities(entityType);
      return results.combined;
    } catch (error) {
      console.error(`Error joining ${entityType}:`, error);
      throw error;
    }
  }

  // PostgreSQL operations
  async insertPostgreSQL(entityType, data) {
    const tableName = this.getTableName(entityType);
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await pgPool.query(query, values);
    return result.rows[0];
  }

  async deletePostgreSQL(entityType, id) {
    const tableName = this.getTableName(entityType);
    const idColumn = this.getIdColumn(entityType);
    const query = `DELETE FROM ${tableName} WHERE ${idColumn} = $1 RETURNING *`;
    const result = await pgPool.query(query, [id]);
    return result.rows[0];
  }

  async updatePostgreSQL(entityType, id, data) {
    const tableName = this.getTableName(entityType);
    const idColumn = this.getIdColumn(entityType);
    
    // Make sure we have data to update
    if (!data || Object.keys(data).length === 0) {
      return null;
    }
    
    const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 2}`).join(', ');
    
    const query = `UPDATE ${tableName} SET ${setClause} WHERE ${idColumn} = $1 RETURNING *`;
    const values = [id, ...Object.values(data)];
    const result = await pgPool.query(query, values);
    
    // Return the updated row, or null if no rows were updated
    return result.rows[0] || null;
  }

  // MongoDB operations
  async insertMongoDB(entityType, data) {
    const collectionName = this.getCollectionName(entityType);
    const mongoDb = getMongoDb();
    if (!mongoDb) {
      throw new Error('MongoDB connection not available');
    }
    const result = await mongoDb.collection(collectionName).insertOne(data);
    return { ...data, _id: result.insertedId };
  }

  async deleteMongoDB(entityType, id) {
    const collectionName = this.getCollectionName(entityType);
    const idField = this.getMongoIdField(entityType);
    const mongoDb = getMongoDb();
    if (!mongoDb) {
      throw new Error('MongoDB connection not available');
    }
    const result = await mongoDb.collection(collectionName).findOneAndDelete({ [idField]: parseInt(id) });
    return result.value;
  }

  async updateMongoDB(entityType, id, data) {
    const collectionName = this.getCollectionName(entityType);
    const idField = this.getMongoIdField(entityType);
    const mongoDb = getMongoDb();
    if (!mongoDb) {
      throw new Error('MongoDB connection not available');
    }
    
    // Try to update the document
    const updateResult = await mongoDb.collection(collectionName).findOneAndUpdate(
      { [idField]: parseInt(id) },
      { $set: data },
      { returnDocument: 'after' }
    );
    
    // If result.value is null, the document wasn't found
    if (!updateResult.value) {
      // Try alternative ID formats (string vs number)
      const docById = await mongoDb.collection(collectionName).findOne({ [idField]: id });
      if (docById) {
        // Document exists with string ID, update it
        const result2 = await mongoDb.collection(collectionName).findOneAndUpdate(
          { [idField]: id },
          { $set: data },
          { returnDocument: 'after' }
        );
        return result2.value || docById;
      }
      return null;
    }
    
    // Return the updated document
    return updateResult.value;
  }

  // Helper methods
  getTableName(entityType) {
    const mapping = {
      'teachers': 'Teachers',
      'classes': 'Classes',
      'students': 'Students',
      'subjects': 'Subjects',
      'enrollments': 'Enrollments'
    };
    return mapping[entityType] || entityType;
  }

  getCollectionName(entityType) {
    const mapping = {
      'teachers': 'Teachers',
      'classes': 'Classes',
      'students': 'Students',
      'librarybooks': 'LibraryBooks',
      'events': 'Events'
    };
    return mapping[entityType] || entityType;
  }

  getIdColumn(entityType) {
    const mapping = {
      'teachers': 'teacher_id',
      'classes': 'class_id',
      'students': 'student_id',
      'subjects': 'subject_id',
      'enrollments': 'enrollment_id'
    };
    return mapping[entityType] || 'id';
  }

  getMongoIdField(entityType) {
    const mapping = {
      'teachers': 'teacher_id',
      'classes': 'class_id',
      'students': 'student_id',
      'librarybooks': 'book_id',
      'events': 'event_id'
    };
    return mapping[entityType] || 'id';
  }

  combineResults(pgResults, mongoResults, entityType) {
    // Combine results from both databases, handling different schemas
    const combined = [];
    
    // Add PostgreSQL results
    pgResults.forEach(item => {
      combined.push({
        source: 'PostgreSQL',
        ...item
      });
    });
    
    // Add MongoDB results
    mongoResults.forEach(item => {
      const { _id, ...rest } = item;
      combined.push({
        source: 'MongoDB',
        ...rest
      });
    });
    
    return combined;
  }

  // Get MongoDB-specific fields for each entity type
  getMongoSpecificFields(entityType) {
    const mapping = {
      'teachers': ['department'],
      'classes': ['schedule'],
      'students': ['enrollment_year']
    };
    return mapping[entityType] || [];
  }

  // Filter out MongoDB-only fields for PostgreSQL updates
  filterPostgresFields(entityType, data) {
    const mongoFields = this.getMongoSpecificFields(entityType);
    const filtered = { ...data };
    mongoFields.forEach(field => {
      delete filtered[field];
    });
    return filtered;
  }
}

module.exports = new DatabaseService();

