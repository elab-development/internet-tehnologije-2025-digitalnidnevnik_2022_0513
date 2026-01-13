-- eDnevnik – SEED DATA (PostgreSQL)

BEGIN;

-- clean db
TRUNCATE TABLE
  teacher_subject_classroom,
  subjects,
  classrooms,
  users
RESTART IDENTITY CASCADE;

-- users (bez classroomId)
INSERT INTO users (id, username, full_name, password, role, "classroomId") VALUES
---- admin
(1, 'admin', 'Administrator Sistema', 'admin123', 'ADMIN', NULL),

---- nastavnici
(2, 'milica', 'Milica Matematika', 'teacher123', 'TEACHER', NULL),
(3, 'ana', 'Ana Srpski', 'teacher123', 'TEACHER', NULL),
(4, 'petar', 'Petar Informatika', 'teacher123', 'TEACHER', NULL),

-- studenti (classroomId je NULL)
(5, 'marko', 'Marko Markovic', 'student123', 'STUDENT', NULL),
(6, 'jelena', 'Jelena Jovanovic', 'student123', 'STUDENT', NULL),
(7, 'ivan', 'Ivan Ilic', 'student123', 'STUDENT', NULL),
(8, 'sara', 'Sara Savic', 'student123', 'STUDENT', NULL);

-- classrooms (kada nastavnici postoje)
INSERT INTO classrooms (id, name, "homeroomTeacherId") VALUES
(1, 'V-1', 2),
(2, 'V-2', 3),
(3, 'V-3', 4);

-- dodeli studente u classrooms
UPDATE users SET "classroomId" = 1 WHERE id IN (5, 6);
UPDATE users SET "classroomId" = 2 WHERE id = 7;
UPDATE users SET "classroomId" = 3 WHERE id = 8;

-- subjects
INSERT INTO subjects (id, name) VALUES
(1, 'Matematika'),
(2, 'Srpski jezik'),
(3, 'Informatika');

-- teacher_subject_classroom
INSERT INTO teacher_subject_classroom ("teacherId", "subjectId", "classroomId") VALUES
(2, 1, 1),
(2, 1, 2),
(2, 1, 3),

(3, 2, 1),
(3, 2, 2),
(3, 2, 3),

(4, 3, 1),
(4, 3, 2),
(4, 3, 3);


INSERT INTO grades
(value, comment, date, "studentId", "teacherId", "subjectId", "classroomId")
VALUES

--- ucenici V-1 (Marko, Jelena) – Matematika
(5, 'Odlicno znanje', NOW(), 5, 2, 1, 1),
(4, 'Dobar rad na casu', NOW(), 6, 2, 1, 1),

--- ucenici V-1 – Srpski jezik
(4, 'Lep sastav', NOW(), 5, 3, 2, 1),
(3, 'Treba vise vezbe', NOW(), 6, 3, 2, 1),

--- ucenik V-2 (Ivan) – Matematika i Informatika
(5, 'Izuzetan uspeh', NOW(), 7, 2, 1, 2),
(4, 'Dobro razumevanje gradiva', NOW(), 7, 4, 3, 2),

--- ucenik V-3 (Sara) – Srpski i Informatika
(5, 'Odlican odgovor', NOW(), 8, 3, 2, 3),
(5, 'Samostalno resava zadatke', NOW(), 8, 4, 3, 3);

COMMIT;
