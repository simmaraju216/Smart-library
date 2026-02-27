USE smart_library;

INSERT INTO batches (name) VALUES ('2022'), ('2023'), ('2024')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO branches (name) VALUES ('CSE'), ('ECE'), ('MECH')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO students (name, email, phone, password, batch_id, branch_id, year, role, first_login)
VALUES ('Admin User', 'admin@library.com', '9999999999', '$2a$10$9DZ4MQ3Qe9IL0q2fI8Y95ejiM5KXv6Ct7AHhWjQaWgNNsGi4jyi8O', 1, 1, 4, 'admin', 0)
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO students (name, email, phone, password, batch_id, branch_id, year, role, first_login)
VALUES ('Admin', 'raju@gmail.com', '7777777777', '$2b$10$YF6LyRDkYHhKEMqzpIMwneTPF5csYX2KXW1M4d/5QacPeyv1R92gS', 1, 1, 4, 'admin', 0)
ON DUPLICATE KEY UPDATE phone = VALUES(phone), password = VALUES(password), batch_id = VALUES(batch_id), branch_id = VALUES(branch_id), year = VALUES(year), role = VALUES(role), first_login = VALUES(first_login);

INSERT INTO students (name, email, phone, password, batch_id, branch_id, year, role, first_login)
VALUES ('Student One', 'student1@library.com', '8888888888', '$2a$10$9DZ4MQ3Qe9IL0q2fI8Y95ejiM5KXv6Ct7AHhWjQaWgNNsGi4jyi8O', 2, 1, 3, 'student', 0)
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO books (title, author, quantity, available_quantity)
VALUES
('Clean Code', 'Robert C. Martin', 5, 5),
('Design Patterns', 'GoF', 3, 3),
('You Don\'t Know JS', 'Kyle Simpson', 4, 4);

INSERT INTO library_faq (question, answer)
VALUES
('How many days can I keep a book?', 'Books are issued for 7 days by default.'),
('What is the late fee?', 'Late fee is 5 per day after due date.');