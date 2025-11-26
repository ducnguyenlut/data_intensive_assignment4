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
          let query;
          // For subjects, join with teachers to get teacher name
          if (entityType === 'subjects') {
            query = `
              SELECT s.*, 
                     t.first_name || ' ' || t.last_name AS teacher_name
              FROM Subjects s
              LEFT JOIN Teachers t ON s.teacher_id = t.teacher_id
            `;
          }
          // For classes, join with teachers to get teacher name
          else if (entityType === 'classes') {
            query = `
              SELECT c.*, 
                     t.first_name || ' ' || t.last_name AS teacher_name
              FROM Classes c
              LEFT JOIN Teachers t ON c.teacher_id = t.teacher_id
            `;
          }
          // For enrollments, join with students and subjects to get names
          else if (entityType === 'enrollments') {
            query = `
              SELECT e.*,
                     s.first_name || ' ' || s.last_name AS student_name,
                     sub.subject_name
              FROM Enrollments e
              LEFT JOIN Students s ON e.student_id = s.student_id
              LEFT JOIN Subjects sub ON e.subject_id = sub.subject_id
            `;
          }
          // For other entities, use simple SELECT
          else {
            const tableName = this.getTableName(entityType);
            query = `SELECT * FROM ${tableName}`;
          }
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
            let mongoResult = await mongoDb.collection(collectionName).find({}).toArray();
            if (entityType === 'teachers') {
              mongoResult = mongoResult.map(({ department, ...rest }) => rest);
            }
            if (entityType === 'classes' && mongoResult.length > 0) {
              const teacherDocs = await mongoDb.collection('Teachers').find({}).toArray();
              const teacherMap = new Map(
                teacherDocs.map(t => [t.teacher_id, `${t.first_name} ${t.last_name}`])
              );
              results.mongodb = mongoResult.map(cls => ({
                ...cls,
                teacher_name: teacherMap.get(cls.teacher_id) || null,
              }));
            } else {
              results.mongodb = mongoResult;
            }
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
  async insertEntity(entityType, data = {}) {
    try {
      let targetDb = null;
      if (data.__db) {
        targetDb = data.__db;
        delete data.__db;
      }

      if (targetDb === 'mongo') {
        return await this.insertMongoDB(entityType, data);
      }

      if (targetDb === 'postgres') {
        return await this.insertPostgreSQL(entityType, data);
      }

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
  async deleteEntity(entityType, id, options = {}) {
    try {
      // For entities that exist in both databases, try MongoDB first, then PostgreSQL
      if (['teachers', 'classes', 'students'].includes(entityType)) {
        let deletedMongo = null;
        let deletedPostgres = null;

        const mongoDb = getMongoDb();
        if (mongoDb) {
          const collectionName = this.getCollectionName(entityType);
          const idField = this.getMongoIdField(entityType);
          const mongoRecord = await mongoDb.collection(collectionName).findOne({ [idField]: parseInt(id) });
          
          if (mongoRecord) {
            deletedMongo = await this.deleteMongoDB(entityType, id);
          }
        }
        // Attempt PostgreSQL deletion regardless of Mongo outcome
        deletedPostgres = await this.deletePostgreSQL(entityType, id, options);

        if (deletedMongo || deletedPostgres) {
          return deletedPostgres || deletedMongo;
        }
        return null;
      }
      // Route to PostgreSQL for: subjects, enrollments
      else if (['subjects', 'enrollments'].includes(entityType)) {
        return await this.deletePostgreSQL(entityType, id, options);
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

  async deletePostgreSQL(entityType, id, options = {}) {
    const tableName = this.getTableName(entityType);
    const idColumn = this.getIdColumn(entityType);
    const { cascade = false, reassignTo = undefined } = options;
    
    // Check for foreign key dependencies before deletion
    if (entityType === 'teachers') {
      // Check if teacher is referenced in Classes or Subjects
      const classesCheck = await pgPool.query(
        'SELECT COUNT(*) as count FROM Classes WHERE teacher_id = $1',
        [id]
      );
      const subjectsCheck = await pgPool.query(
        'SELECT COUNT(*) as count FROM Subjects WHERE teacher_id = $1',
        [id]
      );
      
      const classesCount = parseInt(classesCheck.rows[0].count);
      const subjectsCount = parseInt(subjectsCheck.rows[0].count);
      
      if (classesCount > 0 || subjectsCount > 0) {
        if (cascade) {
          
          if (classesCount > 0) {
            await pgPool.query('DELETE FROM Classes WHERE teacher_id = $1', [id]);
          }
          if (subjectsCount > 0) {
            await pgPool.query('DELETE FROM Subjects WHERE teacher_id = $1', [id]);
          }
        } else if (reassignTo !== null && reassignTo !== undefined) {
          
          if (classesCount > 0) {
            await pgPool.query('UPDATE Classes SET teacher_id = $1 WHERE teacher_id = $2', [reassignTo, id]);
          }
          if (subjectsCount > 0) {
            await pgPool.query('UPDATE Subjects SET teacher_id = $1 WHERE teacher_id = $2', [reassignTo, id]);
          }
        } else if (reassignTo === null) {
          
          if (classesCount > 0) {
            await pgPool.query('UPDATE Classes SET teacher_id = NULL WHERE teacher_id = $1', [id]);
          }
          if (subjectsCount > 0) {
            await pgPool.query('UPDATE Subjects SET teacher_id = NULL WHERE teacher_id = $1', [id]);
          }
        } else {
          
          const dependencies = [];
          if (classesCount > 0) dependencies.push(`${classesCount} class(es)`);
          if (subjectsCount > 0) dependencies.push(`${subjectsCount} subject(s)`);
          throw new Error(`Cannot delete teacher: This teacher is assigned to ${dependencies.join(' and ')}. Please reassign or remove these records first.`);
        }
      }
    } else if (entityType === 'classes') {
      // Check if class has students
      const studentsCheck = await pgPool.query(
        'SELECT COUNT(*) as count FROM Students WHERE class_id = $1',
        [id]
      );
      const studentsCount = parseInt(studentsCheck.rows[0].count);
      
      if (studentsCount > 0) {
        if (cascade) {
          await pgPool.query('DELETE FROM Students WHERE class_id = $1', [id]);
        } else if (reassignTo !== null && reassignTo !== undefined) {
          await pgPool.query('UPDATE Students SET class_id = $1 WHERE class_id = $2', [reassignTo, id]);
        } else if (reassignTo === null) {
          await pgPool.query('UPDATE Students SET class_id = NULL WHERE class_id = $1', [id]);
        } else {
          throw new Error(`Cannot delete class: This class has ${studentsCount} student(s). Please reassign or remove these students first.`);
        }
      }
    } else if (entityType === 'students') {
      
      const enrollmentsCheck = await pgPool.query(
        'SELECT COUNT(*) as count FROM Enrollments WHERE student_id = $1',
        [id]
      );
      const enrollmentsCount = parseInt(enrollmentsCheck.rows[0].count);
      
      if (enrollmentsCount > 0) {
        if (cascade) {
          await pgPool.query('DELETE FROM Enrollments WHERE student_id = $1', [id]);
        } else {
          throw new Error(`Cannot delete student: This student has ${enrollmentsCount} enrollment(s). Please remove these enrollments first or use cascade delete.`);
        }
      }
    } else if (entityType === 'subjects') {

      const enrollmentsCheck = await pgPool.query(
        'SELECT COUNT(*) as count FROM Enrollments WHERE subject_id = $1',
        [id]
      );
      const enrollmentsCount = parseInt(enrollmentsCheck.rows[0].count);
      
      if (enrollmentsCount > 0) {
        if (cascade) {
          await pgPool.query('DELETE FROM Enrollments WHERE subject_id = $1', [id]);
        } else {
          throw new Error(`Cannot delete subject: This subject has ${enrollmentsCount} enrollment(s). Please remove these enrollments first or use cascade delete.`);
        }
      }
    }
    
    const query = `DELETE FROM ${tableName} WHERE ${idColumn} = $1 RETURNING *`;
    const result = await pgPool.query(query, [id]);
    return result.rows[0] || null;
  }

  async updatePostgreSQL(entityType, id, data) {
    const tableName = this.getTableName(entityType);
    const idColumn = this.getIdColumn(entityType);
    

    if (!data || Object.keys(data).length === 0) {
      return null;
    }
    
    const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 2}`).join(', ');
    
    const query = `UPDATE ${tableName} SET ${setClause} WHERE ${idColumn} = $1 RETURNING *`;
    const values = [id, ...Object.values(data)];
    const result = await pgPool.query(query, values);
    

    return result.rows[0] || null;
  }


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
    

    const updateResult = await mongoDb.collection(collectionName).findOneAndUpdate(
      { [idField]: parseInt(id) },
      { $set: data },
      { returnDocument: 'after' }
    );
    
    if (!updateResult.value) {
 
      const docById = await mongoDb.collection(collectionName).findOne({ [idField]: id });
      if (docById) {

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
    const combined = [];
    
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

  getMongoSpecificFields(entityType) {
    const mapping = {
      'teachers': [],
      'classes': ['schedule'],
      'students': ['enrollment_year']
    };
    return mapping[entityType] || [];
  }

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

