-- Insert departments
INSERT INTO department (name) VALUES
('Engineering'),
('Sales'),
('Marketing'),
('Human Resources'),
('Finance & Accounting');


-- Insert roles
INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 110000, (SELECT id FROM department WHERE name = 'Engineering')),
('Sales Representative', 60000, (SELECT id FROM department WHERE name = 'Sales')),
('Digital Marketer', 85000, (SELECT id FROM department WHERE name = 'Marketing')),
('HR Manager', 70000, (SELECT id FROM department WHERE name = 'Human Resources')),
('Accountant', 95000, (SELECT id FROM department WHERE name = 'Finance & Accounting'));

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('Leif E.', 'Hetland', (SELECT id FROM role WHERE title = 'Software Engineer'), NULL),
('Su-yen', 'Simon', (SELECT id FROM role WHERE title = 'Sales Representative'), NULL),
('Stanley', 'Bertrand', (SELECT id FROM role WHERE title = 'Digital Marketer'), NULL),
('Melissa', 'Jean', (SELECT id FROM role WHERE title = 'HR Manager'), NULL),
('Steeve', 'Pierre-Louis', (SELECT id FROM role WHERE title = 'Accountant'), NULL);
