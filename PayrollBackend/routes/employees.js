// C:\Users\Administrator\Desktop\OJT-Payroll-System\PayrollBackend\routes\employees.js
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Payhead = require('../models/Payhead'); // Import the Payhead model to register it

const isAdmin = (req, res, next) => {
  console.log('All request headers for employees:', req.headers); // Log all headers for debugging
  const userRole = req.headers['user-role'];
  console.log('Parsed user-role for employees:', userRole);
  if (!userRole || userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Admin access required', headers: req.headers });
  }
  next();
};

// GET all employees with optional month filtering using hireDate
router.get('/', isAdmin, async (req, res) => {
  try {
    const { month } = req.query;
    let query = {};

    if (month) {
      // Parse the month parameter (e.g., "2025-03") into year and month
      const [year, monthNum] = month.split('-');
      if (!year || !monthNum) {
        return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM (e.g., 2025-03)' });
      }

      // Filter employees based on hireDate for the specified month (for payroll purposes)
      query = {
        hireDate: {
          $gte: new Date(year, monthNum - 1, 1), // Start of the month
          $lt: new Date(year, monthNum, 1)        // Start of the next month
        }
      };

      // For payroll (e.g., SalarySlips), populate payheads to include salary details
      const employees = await Employee.find(query)
        .populate('payheads') // Populate payheads only when filtering by month (payroll-specific)
        .sort({ empNo: 1 }); // Sort by employee number for consistency
      console.log('Fetched employees for payroll:', employees.length, 'Query:', query);
      res.status(200).json(employees);
    } else {
      // For non-payroll use (e.g., ManageEmployee), fetch employees without populating payheads
      const employees = await Employee.find()
        .sort({ empNo: 1 }); // Sort by employee number for consistency
      console.log('Fetched employees for management:', employees.length);
      res.status(200).json(employees);
    }
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees', message: error.message });
  }
});

// POST a new employee with auto-generated ID
router.post('/', isAdmin, async (req, res) => {
  try {
    console.log('Received employee data:', req.body); // Debug log

    // Find the highest existing ID and increment it
    const maxIdEmployee = await Employee.findOne().sort({ id: -1 });
    const newId = maxIdEmployee ? maxIdEmployee.id + 1 : 1;

    // Add the generated ID to the employee data
    const employeeData = { ...req.body, id: newId };
    const employee = new Employee(employeeData);

    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ 
        error: 'Validation failed', 
        message: 'Invalid employee data', 
        details: validationErrors 
      });
    } else if (error.code === 11000) { // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ 
        error: 'Duplicate key error', 
        message: `${field} already exists` 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to add employee', 
        message: error.message 
      });
    }
  }
});

// PUT (update) an existing employee by ID
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { id: parseInt(req.params.id) }, 
      req.body, 
      { new: true }
    );
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ 
        error: 'Validation failed', 
        message: 'Invalid employee data', 
        details: validationErrors 
      });
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ 
        error: 'Duplicate key error', 
        message: `${field} already exists` 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to update employee', 
        message: error.message 
      });
    }
  }
});

// DELETE an employee by ID
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const result = await Employee.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Employee not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee', message: error.message });
  }
});

module.exports = router;