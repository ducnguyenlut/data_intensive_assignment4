db = db.getSiblingDB('school_db');

db.Teachers.insertMany([
  {
    teacher_id: 1,
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@school.com',
    phone_number: '555-0101',
    hire_date: new Date('2020-01-15')
  },
  {
    teacher_id: 2,
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@school.com',
    phone_number: '555-0102',
    hire_date: new Date('2019-03-20')
  },
  {
    teacher_id: 3,
    first_name: 'Michael',
    last_name: 'Brown',
    email: 'michael.brown@school.com',
    phone_number: '555-0103',
    hire_date: new Date('2021-09-01')
  },
  {
    teacher_id: 4,
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily.davis@school.com',
    phone_number: '555-0104',
    hire_date: new Date('2018-05-10')
  },
  {
    teacher_id: 5,
    first_name: 'David',
    last_name: 'Wilson',
    email: 'david.wilson@school.com',
    phone_number: '555-0105',
    hire_date: new Date('2022-01-15')
  }
]);

// 2. Classes Collection (similar to PostgreSQL)
db.Classes.insertMany([
  {
    class_id: 1,
    class_name: 'Mathematics 101',
    teacher_id: 1,
    room_number: 'A101'
  },
  {
    class_id: 2,
    class_name: 'English Literature',
    teacher_id: 2,
    room_number: 'B205'
  },
  {
    class_id: 3,
    class_name: 'Physics 201',
    teacher_id: 3,
    room_number: 'C301'
  },
  {
    class_id: 4,
    class_name: 'History 101',
    teacher_id: 4,
    room_number: 'D102'
  },
  {
    class_id: 5,
    class_name: 'Chemistry 101',
    teacher_id: 5,
    room_number: 'E201'
  }
]);

// 3. Students Collection (similar to PostgreSQL)
db.Students.insertMany([
  {
    student_id: 1,
    first_name: 'Alice',
    last_name: 'Anderson',
    date_of_birth: new Date('2005-03-15'),
    gender: 'F',
    email: 'alice.anderson@student.com',
    phone_number: '555-1001',
    class_id: 1,
    enrollment_year: 2024
  },
  {
    student_id: 2,
    first_name: 'Bob',
    last_name: 'Baker',
    date_of_birth: new Date('2005-07-22'),
    gender: 'M',
    email: 'bob.baker@student.com',
    phone_number: '555-1002',
    class_id: 1,
    enrollment_year: 2024
  },
  {
    student_id: 3,
    first_name: 'Carol',
    last_name: 'Clark',
    date_of_birth: new Date('2005-11-08'),
    gender: 'F',
    email: 'carol.clark@student.com',
    phone_number: '555-1003',
    class_id: 2,
    enrollment_year: 2024
  },
  {
    student_id: 4,
    first_name: 'Daniel',
    last_name: 'Evans',
    date_of_birth: new Date('2005-01-30'),
    gender: 'M',
    email: 'daniel.evans@student.com',
    phone_number: '555-1004',
    class_id: 2,
    enrollment_year: 2024
  },
  {
    student_id: 5,
    first_name: 'Eva',
    last_name: 'Foster',
    date_of_birth: new Date('2005-09-12'),
    gender: 'F',
    email: 'eva.foster@student.com',
    phone_number: '555-1005',
    class_id: 3,
    enrollment_year: 2024
  }
]);


db.LibraryBooks.insertMany([
  {
    book_id: 1,
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '978-0262046305',
    available: true,
    borrower_id: null,
    due_date: null
  },
  {
    book_id: 2,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    available: false,
    borrower_id: 3,
    due_date: new Date('2024-12-31')
  },
  {
    book_id: 3,
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    isbn: '978-0553380163',
    available: true,
    borrower_id: null,
    due_date: null
  },
  {
    book_id: 4,
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '978-0062316097',
    available: true,
    borrower_id: null,
    due_date: null
  },
  {
    book_id: 5,
    title: 'Organic Chemistry Textbook',
    author: 'David Klein',
    isbn: '978-1118452288',
    available: false,
    borrower_id: 5,
    due_date: new Date('2024-12-20')
  }
]);


db.Events.insertMany([
  {
    event_id: 1,
    event_name: 'Science Fair',
    event_date: new Date('2024-12-15'),
    location: 'Main Hall',
    organizer_id: 3,
    participants: [1, 2, 5],
    status: 'upcoming'
  },
  {
    event_id: 2,
    event_name: 'Literary Festival',
    event_date: new Date('2024-11-20'),
    location: 'Library',
    organizer_id: 2,
    participants: [3, 4],
    status: 'completed'
  },
  {
    event_id: 3,
    event_name: 'Math Competition',
    event_date: new Date('2025-01-10'),
    location: 'Room A101',
    organizer_id: 1,
    participants: [1, 2],
    status: 'upcoming'
  },
  {
    event_id: 4,
    event_name: 'History Exhibition',
    event_date: new Date('2024-12-05'),
    location: 'Museum Wing',
    organizer_id: 4,
    participants: [4, 7],
    status: 'upcoming'
  },
  {
    event_id: 5,
    event_name: 'Chemistry Lab Open Day',
    event_date: new Date('2025-02-01'),
    location: 'Lab E201',
    organizer_id: 5,
    participants: [5, 8],
    status: 'upcoming'
  }
]);

db.Teachers.createIndex({ teacher_id: 1 });
db.Classes.createIndex({ class_id: 1 });
db.Students.createIndex({ student_id: 1 });
db.LibraryBooks.createIndex({ book_id: 1 });
db.Events.createIndex({ event_id: 1 });

