import { pool } from './connection.js';
import inquirer from 'inquirer';

// Function to view all departments
export const viewDepartments = async () => {
  const result = await pool.query('SELECT * FROM department');
  console.table(result.rows);
};

// Function to view all roles
export const viewRoles = async () => {
  const result = await pool.query(`
    SELECT role.id, role.title, department.name AS department, role.salary 
    FROM role
    JOIN department ON role.department_id = department.id
  `);
  console.table(result.rows);
};

// Function to view all employees
export const viewEmployees = async () => {
  const result = await pool.query(`
    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id
  `);
  console.table(result.rows);
};

// Function to add a department
export const addDepartment = async () => {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name of the department:',
    },
  ]);

  await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
  console.log(`Department "${name}" added!`);
};

// Function to add a role
export const addRole = async () => {
  const departments = await pool.query('SELECT * FROM department');
  const departmentChoices = departments.rows.map((dep: any) => dep.name);

  const { title, salary, departmentName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter the name of the role:',
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Enter the salary for the role:',
    },
    {
      type: 'list',
      name: 'departmentName',
      message: 'Which department does this role belong to?',
      choices: departmentChoices,
    },
  ]);

  const departmentId = (await pool.query('SELECT id FROM department WHERE name = $1', [departmentName])).rows[0].id;

  await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, departmentId]);
  console.log(`Role "${title}" added!`);
};

// Function to add an employee
export const addEmployee = async () => {
  const roles = await pool.query('SELECT * FROM role');
  const roleChoices = roles.rows.map((role: any) => role.title);

  const { firstName, lastName, roleTitle } = await inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: "Enter the employee's first name:",
    },
    {
      type: 'input',
      name: 'lastName',
      message: "Enter the employee's last name:",
    },
    {
      type: 'list',
      name: 'roleTitle',
      message: "Select the employee's role:",
      choices: roleChoices,
    },
  ]);

  const roleId = (await pool.query('SELECT id FROM role WHERE title = $1', [roleTitle])).rows[0].id;

  const { managerFirstName, managerLastName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'managerFirstName',
      message: 'Enter the manager’s first name (Leave blank if none):',
      default: '',
    },
    {
      type: 'input',
      name: 'managerLastName',
      message: 'Enter the manager’s last name (Leave blank if none):',
      default: '',
    },
  ]);

  let managerId = null;
  if (managerFirstName && managerLastName) {
    const manager = await pool.query(
      'SELECT id FROM employee WHERE first_name = $1 AND last_name = $2',
      [managerFirstName, managerLastName]
    );
    managerId = manager.rows[0]?.id;
  }

  await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [
    firstName,
    lastName,
    roleId,
    managerId,
  ]);
  console.log(`Employee ${firstName} ${lastName} added!`);
};

// Function to update employee role
export const updateEmployeeRole = async () => {
  const employees = await pool.query('SELECT * FROM employee');
  const employeeChoices = employees.rows.map((emp: any) => `${emp.first_name} ${emp.last_name}`);

  const { employeeName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employeeName',
      message: 'Select an employee to update:',
      choices: employeeChoices,
    },
  ]);

  const selectedEmployee = employees.rows.find(
    (emp: any) => `${emp.first_name} ${emp.last_name}` === employeeName
  );
  const { newRoleTitle } = await inquirer.prompt([
    {
      type: 'list',
      name: 'newRoleTitle',
      message: 'Select the new role for this employee:',
      choices: (await pool.query('SELECT title FROM role')).rows.map((role: any) => role.title),
    },
  ]);

  const newRoleId = (await pool.query('SELECT id FROM role WHERE title = $1', [newRoleTitle])).rows[0].id;

  await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [newRoleId, selectedEmployee.id]);
  console.log(`${selectedEmployee.first_name} ${selectedEmployee.last_name}'s role updated!`);
};
