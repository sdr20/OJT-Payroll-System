// C:\Users\Administrator\Desktop\OJT-Payroll-System\PayrollBackend\routes\employees.js
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

const isAdmin = (req, res, next) => {
  console.log('All request headers for employees:', req.headers); // Log all headers
  const userRole = req.headers['user-role'];
  console.log('Parsed user-role for employees:', userRole);
  if (!userRole || userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

router.get('/', isAdmin, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

router.post('/', isAdmin, async (req, res) => {
  try {
    console.log('Received employee data:', req.body); // Debug log
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: 'Failed to add employee', message: error.message, details: error });
    } else {
      res.status(500).json({ error: 'Failed to add employee', message: error.message });
    }
  }
});

router.put('/:id', isAdmin, async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body, { new: true });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const result = await Employee.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Employee not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

module.exports = router;