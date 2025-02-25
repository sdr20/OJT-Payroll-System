const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

router.get('/:id/salary', async (req, res) => {
  try {
    const employee = await Employee.findOne({ id: parseInt(req.params.id) });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee salary:', error);
    res.status(500).json({ error: 'Failed to fetch employee salary' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true }
    );
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    console.log('Updated employee:', employee);
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee: ' + error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Employee.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Employee not found' });
    console.log(`Deleted employee with id ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Received employee data:', req.body);
    const employee = new Employee(req.body);
    await employee.save();
    console.log('Saved employee:', employee);
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ 
      error: 'Failed to add employee', 
      message: error.message, 
      details: error.stack 
    });
  }
});

router.put('/:id/payheads', async (req, res) => {
  try {
    const { payheads } = req.body;
    const employee = await Employee.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { $set: { payheads } },
      { new: true }
    );
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    console.log('Updated employee payheads:', employee);
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee payheads:', error);
    res.status(500).json({ error: 'Failed to update employee payheads' });
  }
});

module.exports = router;