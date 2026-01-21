-- eDnevnik – SEED DATA (PostgreSQL)

BEGIN;

-- clean db
TRUNCATE TABLE grades RESTART IDENTITY CASCADE;
TRUNCATE TABLE teacher_subject_classroom RESTART IDENTITY CASCADE;
TRUNCATE TABLE subjects RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
TRUNCATE TABLE classrooms RESTART IDENTITY CASCADE;

-- classrooms
INSERT INTO classrooms (id, name)
VALUES
(1, 'V-1'),
(2, 'V-2'),
(3, 'V-3');

-- subjects
INSERT INTO subjects (id, name) VALUES
(1, 'Matematika'),
(2, 'Srpski jezik'),
(3, 'Informatika');

-- users - password za sve: password123
INSERT INTO users (username, full_name, password, role, "classroomId")
VALUES

--- admin
('admin',
 'Administrator',
 '$2b$10$B3ZRLIje31uwagP2g5t5Xuk71BqNgfgsMue85vXNsy./U.vN.pe6S',
 'ADMIN',
 NULL),

--- nastavnici
('milica',
 'Milica Matematika',
 '$2b$10$B3ZRLIje31uwagP2g5t5Xuk71BqNgfgsMue85vXNsy./U.vN.pe6S',
 'TEACHER',
 NULL),

('ana',
 'Ana Srpski',
 '$2b$10$B3ZRLIje31uwagP2g5t5Xuk71BqNgfgsMue85vXNsy./U.vN.pe6S',
 'TEACHER',
 NULL),

('petar',
 'Petar Informatika',
 '$2b$10$B3ZRLIje31uwagP2g5t5Xuk71BqNgfgsMue85vXNsy./U.vN.pe6S',
 'TEACHER',
 NULL),

--- student V-1
('marko',
 'Marko Markovic',
 '$2b$10$B3ZRLIje31uwagP2g5t5Xuk71BqNgfgsMue85vXNsy./U.vN.pe6S',
 'STUDENT',
 1),

('jelena',
 'Jelena Jovanovic',
 '$2b$10$B3ZRLIje31uwagP2g5t5Xuk71BqNgfgsMue85vXNsy./U.vN.pe6S',
 'STUDENT',
 1),

--- student V-2
('ivan',
 'Ivan Ilic',
 '$2b$10$B3ZRLIje31uwagP2g5t5Xuk71BqNgfgsMue85vXNsy./U.vN.pe6S',
 'STUDENT',
 2),
--- student V-3
('sara',
 'Sara Savic',
 '$2b$10$B3ZRLIje31uwagP2g5t5Xuk71BqNgfgsMue85vXNsy./U.vN.pe6S',
 'STUDENT',
 3);

--- razredne staresine
UPDATE classrooms
SET "homeroomTeacherId" = (
  SELECT id FROM users WHERE username = 'milica'
)
WHERE name = 'V-1';

UPDATE classrooms
SET "homeroomTeacherId" = (
  SELECT id FROM users WHERE username = 'ana'
)
WHERE name = 'V-2';

UPDATE classrooms
SET "homeroomTeacherId" = (
  SELECT id FROM users WHERE username = 'petar'
)
WHERE name = 'V-3';



-- teacher_subject_classroom
INSERT INTO teacher_subject_classroom ("teacherId", "subjectId", "classroomId")
VALUES
-- milica – Matematika
(2, 1, 1),
(2, 1, 2),
(2, 1, 3),

-- ana – Srpski
(3, 2, 1),
(3, 2, 2),
(3, 2, 3),

-- petar – Informatika
(4, 3, 1),
(4, 3, 2),
(4, 3, 3);


INSERT INTO grades
(value, comment, date, "studentId", "teacherId", "subjectId", "classroomId")
VALUES

--- ucenici V-1 (Marko, Jelena) – Matematika
(5, 'Odlicno znanje', NOW(), 5, 2, 1, 1),
(4, 'Dobar rad na casu', NOW(), 6, 2, 1, 1),
(3, 'Lep sastav', NOW(), 5, 3, 2, 1),

--- ucenik V-2 (Ivan) – Matematika i Informatika
(5, 'Izuzetan uspeh', NOW(), 7, 2, 1, 2),
(4, 'Dobro razumevanje gradiva', NOW(), 7, 4, 3, 2),

--- ucenik V-3 (Sara) – Srpski i Informatika
(5, 'Odlican odgovor', NOW(), 8, 3, 2, 3),
(5, 'Samostalno resava zadatke', NOW(), 8, 4, 3, 3);

COMMIT;
