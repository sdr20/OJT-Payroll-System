const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

const isAdmin = (req, res, next) => {
  const userRole = req.headers['user-role'];
  if (!userRole || userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET all employees
router.get('/', isAdmin, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ empNo: 1 });
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error in GET /api/employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees', message: error.message });
  }
});

// GET count of employees
router.get('/count', isAdmin, async (req, res) => {
  try {
    const count = await Employee.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error counting employees:', error);
    res.status(500).json({ error: 'Failed to count employees', message: error.message });
  }
});

// GET employees eligible for salary
router.get('/eligible-for-salary', isAdmin, async (req, res) => {
  try {
    const employees = await Employee.find({ /* Add your eligibility criteria here */ });
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching eligible employees:', error);
    res.status(500).json({ error: 'Failed to fetch eligible employees', message: error.message });
  }
});

// POST a new employee
router.post('/', isAdmin, async (req, res) => {
  try {
    const maxIdEmployee = await Employee.findOne().sort({ id: -1 });
    const newId = maxIdEmployee ? maxIdEmployee.id + 1 : 1;
    const employeeData = { ...req.body, id: newId };
    const employee = new Employee(employeeData);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to add employee', message: error.message });
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
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee', message: error.message });
  }
});

// DELETE an employee by ID
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const result = await Employee.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee', message: error.message });
  }
});

module.exports = router;