const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

const isAdmin = (req, res, next) => {
  console.log('All request headers for employees:', req.headers);
  const userRole = req.headers['user-role'];
  console.log('Parsed user-role for employees:', userRole);
  if (!userRole || userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Admin access required', headers: req.headers });
  }
  next();
};

// Employee Login Endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const employee = await Employee.findOne({ username });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      employee: {
        id: employee.id,
        username: employee.username,
        role: employee.role,
        name: `${employee.firstName} ${employee.lastName}`,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to login', message: error.message });
  }
});

// GET all employees with optional month filtering using hireDate
router.get('/', isAdmin, async (req, res) => {
  try {
    const { month } = req.query;
    let query = {};

    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        console.error('Invalid month format:', month);
        return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM (e.g., 2025-03)' });
      }

      const [year, monthNum] = month.split('-');
      const parsedYear = parseInt(year, 10);
      const parsedMonth = parseInt(monthNum, 10);

      if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        console.error('Invalid year or month value:', { year, monthNum });
        return res.status(400).json({ error: 'Invalid year or month value' });
      }

      console.log('Filtering employees for month:', month);
      query = {
        hireDate: {
          $gte: new Date(parsedYear, parsedMonth - 1, 1),
          $lt: new Date(parsedYear, parsedMonth, 1),
        },
      };
    }

    console.log('Executing query:', JSON.stringify(query, null, 2));
    const employees = await Employee.find(query)
      .sort({ empNo: 1 })
      .catch((err) => {
        throw new Error(`Database query failed: ${err.message}`);
      });

    console.log('Fetched employees:', employees.length, 'Query:', query);
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error in GET /api/employees:', {
      message: error.message,
      stack: error.stack,
      query: req.query,
    });
    res.status(500).json({ error: 'Failed to fetch employees', message: error.message });
  }
});

// POST a new employee with auto-generated ID and initial position history
router.post('/', isAdmin, async (req, res) => {
  try {
    console.log('Received employee data:', req.body);
    const maxIdEmployee = await Employee.findOne().sort({ id: -1 });
    const newId = maxIdEmployee ? maxIdEmployee.id + 1 : 1;

    const hireDate = req.body.hireDate ? new Date(req.body.hireDate) : new Date();
    const employeeData = {
      ...req.body,
      id: newId,
      hireDate,
      positionHistory: [{
        position: req.body.position,
        salary: req.body.salary,
        startDate: hireDate, // Use hireDate for initial position
        endDate: null
      }]
    };

    const employee = new Employee(employeeData);
    await employee.save();
    console.log('Employee created:', employee.id);
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({ error: 'Validation failed', message: 'Invalid employee data', details: validationErrors });
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ error: 'Duplicate key error', message: `${field} already exists` });
    } else {
      res.status(500).json({ error: 'Failed to add employee', message: error.message });
    }
  }
});

// PUT (update) an existing employee by ID with position history management
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const employee = await Employee.findOne({ id });
    if (!employee) {
      console.log(`Employee not found for ID: ${id}`);
      return res.status(404).json({ error: 'Employee not found' });
    }

    const { position, salary } = req.body;
    if ((position && position !== employee.position) || (salary !== undefined && salary !== employee.salary)) {
      const currentHistory = employee.positionHistory.find(h => !h.endDate);
      if (currentHistory) {
        currentHistory.endDate = new Date();
      }
      employee.positionHistory.push({
        position: position || employee.position,
        salary: salary !== undefined ? salary : employee.salary,
        startDate: new Date(), // New position starts now
        endDate: null
      });
    }

    const updatedEmployee = await Employee.findOneAndUpdate(
      { id },
      { ...req.body, positionHistory: employee.positionHistory },
      { new: true, runValidators: true }
    );

    console.log('Employee updated:', updatedEmployee.id);
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({ error: 'Validation failed', message: 'Invalid employee data', details: validationErrors });
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ error: 'Duplicate key error', message: `${field} already exists` });
    } else {
      res.status(500).json({ error: 'Failed to update employee', message: error.message });
    }
  }
});

// DELETE an employee by ID
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const result = await Employee.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount === 0) {
      console.log(`Employee not found for ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Employee not found' });
    }
    console.log(`Employee deleted with ID: ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee', message: error.message });
  }
});

module.exports = router;