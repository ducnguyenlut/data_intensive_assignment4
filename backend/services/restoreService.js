const { pgPool, getMongoDb } = require('../config/database');
const seedData = require('../data/seedData');

async function restorePostgres() {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE TABLE Enrollments, Students, Subjects, Classes, Teachers RESTART IDENTITY CASCADE');

    for (const teacher of seedData.postgres.teachers) {
      await client.query(
        `INSERT INTO Teachers (first_name, last_name, email, phone_number, hire_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [teacher.first_name, teacher.last_name, teacher.email, teacher.phone_number, teacher.hire_date]
      );
    }

    for (const cls of seedData.postgres.classes) {
      await client.query(
        `INSERT INTO Classes (class_name, teacher_id, room_number)
         VALUES ($1, $2, $3)`,
        [cls.class_name, cls.teacher_id, cls.room_number]
      );
    }

    for (const subject of seedData.postgres.subjects) {
      await client.query(
        `INSERT INTO Subjects (subject_name, credits, teacher_id)
         VALUES ($1, $2, $3)`,
        [subject.subject_name, subject.credits, subject.teacher_id]
      );
    }

    for (const student of seedData.postgres.students) {
      await client.query(
        `INSERT INTO Students (first_name, last_name, date_of_birth, gender, email, phone_number, class_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [student.first_name, student.last_name, student.date_of_birth, student.gender, student.email, student.phone_number, student.class_id]
      );
    }

    for (const enrollment of seedData.postgres.enrollments) {
      await client.query(
        `INSERT INTO Enrollments (student_id, subject_id, enrollment_date, grade)
         VALUES ($1, $2, $3, $4)`,
        [enrollment.student_id, enrollment.subject_id, enrollment.enrollment_date, enrollment.grade]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function restoreMongo() {
  const mongoDb = getMongoDb();
  if (!mongoDb) {
    throw new Error('MongoDB connection not available');
  }

  const collections = [
    { name: 'Teachers', data: seedData.mongo.teachers },
    { name: 'Classes', data: seedData.mongo.classes },
    { name: 'Students', data: seedData.mongo.students },
    { name: 'LibraryBooks', data: seedData.mongo.libraryBooks },
    { name: 'Events', data: seedData.mongo.events },
  ];

  for (const { name, data } of collections) {
    const collection = mongoDb.collection(name);
    await collection.deleteMany({});
    if (data.length > 0) {
      await collection.insertMany(data);
    }
  }
}

async function restoreAll() {
  await restorePostgres();
  await restoreMongo();
}

module.exports = {
  restorePostgres,
  restoreMongo,
  restoreAll,
};

