-- PostgreSQL Database Initialization

-- 1. Teachers Table
CREATE TABLE IF NOT EXISTS Teachers (
    teacher_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),
    hire_date DATE NOT NULL
);

-- 2. Classes Table 
CREATE TABLE IF NOT EXISTS Classes (
    class_id SERIAL PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    teacher_id INT,
    room_number VARCHAR(10),
    CONSTRAINT fk_teacher FOREIGN KEY (teacher_id) REFERENCES Teachers(teacher_id)
);

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS Subjects (
    subject_id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    credits INT CHECK (credits > 0),
    teacher_id INT,
    CONSTRAINT fk_subject_teacher FOREIGN KEY (teacher_id) REFERENCES Teachers(teacher_id)
);

-- 4. Students Table
CREATE TABLE IF NOT EXISTS Students (
    student_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),
    class_id INT,
    CONSTRAINT fk_class FOREIGN KEY (class_id) REFERENCES Classes(class_id)
);

-- 5. Enrollments Table
CREATE TABLE IF NOT EXISTS Enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    grade VARCHAR(5),
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES Students(student_id),
    CONSTRAINT fk_enrollment_subject FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id)
);

-- Insert sample data
INSERT INTO Teachers (first_name, last_name, email, phone_number, hire_date) VALUES
('John', 'Smith', 'john.smith@school.com', '555-0101', '2020-01-15'),
('Sarah', 'Johnson', 'sarah.johnson@school.com', '555-0102', '2019-03-20'),
('Michael', 'Brown', 'michael.brown@school.com', '555-0103', '2021-09-01'),
('Emily', 'Davis', 'emily.davis@school.com', '555-0104', '2018-05-10'),
('David', 'Wilson', 'david.wilson@school.com', '555-0105', '2022-01-15');

INSERT INTO Classes (class_name, teacher_id, room_number) VALUES
('Mathematics 101', 1, 'A101'),
('English Literature', 2, 'B205'),
('Physics 201', 3, 'C301'),
('History 101', 4, 'D102'),
('Chemistry 101', 5, 'E201');

INSERT INTO Subjects (subject_name, credits, teacher_id) VALUES
('Algebra', 3, 1),
('Calculus', 4, 1),
('Shakespeare Studies', 3, 2),
('Modern Literature', 3, 2),
('Mechanics', 4, 3),
('Thermodynamics', 4, 3),
('World History', 3, 4),
('Organic Chemistry', 4, 5);

INSERT INTO Students (first_name, last_name, date_of_birth, gender, email, phone_number, class_id) VALUES
('Alice', 'Anderson', '2005-03-15', 'F', 'alice.anderson@student.com', '555-1001', 1),
('Bob', 'Baker', '2005-07-22', 'M', 'bob.baker@student.com', '555-1002', 1),
('Carol', 'Clark', '2005-11-08', 'F', 'carol.clark@student.com', '555-1003', 2),
('Daniel', 'Evans', '2005-01-30', 'M', 'daniel.evans@student.com', '555-1004', 2),
('Eva', 'Foster', '2005-09-12', 'F', 'eva.foster@student.com', '555-1005', 3),
('Frank', 'Green', '2005-05-25', 'M', 'frank.green@student.com', '555-1006', 3),
('Grace', 'Harris', '2005-12-03', 'F', 'grace.harris@student.com', '555-1007', 4),
('Henry', 'Jackson', '2005-08-18', 'M', 'henry.jackson@student.com', '555-1008', 5);

INSERT INTO Enrollments (student_id, subject_id, enrollment_date, grade) VALUES
(1, 1, '2024-01-15', 'A'),
(1, 3, '2024-01-15', 'B+'),
(2, 1, '2024-01-15', 'A-'),
(2, 5, '2024-01-15', 'B'),
(3, 3, '2024-01-15', 'A'),
(3, 4, '2024-01-15', 'A-'),
(4, 3, '2024-01-15', 'B+'),
(4, 7, '2024-01-15', 'A'),
(5, 5, '2024-01-15', 'A'),
(5, 6, '2024-01-15', 'B+'),
(6, 5, '2024-01-15', 'A-'),
(7, 7, '2024-01-15', 'A'),
(8, 8, '2024-01-15', 'B');

