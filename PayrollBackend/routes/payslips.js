const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Employee = require('../models/Employee');
const Payslip = require('../models/Payslip');

// Middleware to check for admin role
const isAdmin = (req, res, next) => {
  const userRole = req.headers['user-role'];
  console.log('Checking admin role:', { userRole });
  if (!userRole || userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET payslips for an employee
router.get('/:employeeId', isAdmin, async (req, res) => {
  try {
    const payslips = await Payslip.find({ employeeId: parseInt(req.params.employeeId) });
    console.log('Fetched payslips:', payslips);
    res.json(payslips);
  } catch (error) {
    console.error('Error fetching payslips:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST to generate a payslip
router.post('/generate', isAdmin, async (req, res) => {
  console.log('Incoming request body:', req.body);

  const { employeeId, empNo, payslipData, salaryMonth, paydayType, position, salary } = req.body;

  const requiredFields = { employeeId, empNo, payslipData, salaryMonth, paydayType, position, salary };
  const missingFields = Object.entries(requiredFields)
    .filter(([key, value]) => value === undefined || value === null || value === '')
    .map(([key]) => key);
  if (missingFields.length > 0) {
    console.log('Missing required fields:', missingFields);
    return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
  }

  try {
    const employee = await Employee.findOne({ id: employeeId, empNo });
    if (!employee) {
      console.log('Employee not found:', { employeeId, empNo });
      return res.status(404).json({ error: 'Employee not found' });
    }

    const [year, month] = salaryMonth.split('-').map(Number);
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const day = paydayType === 'mid-month' ? 15 : lastDayOfMonth;
    const payslipDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

    const hireDate = new Date(employee.hireDate);
    if (payslipDate < hireDate) {
      console.log('Payslip date is before hire date:', { payslipDate: payslipDate.toISOString(), hireDate: hireDate.toISOString() });
      return res.status(400).json({ error: 'Payslip date cannot be before hire date' });
    }

    const existingPayslip = await Payslip.findOne({ employeeId, salaryMonth, paydayType });
    if (existingPayslip) {
      console.log('Payslip already exists:', { employeeId, salaryMonth, paydayType });
      return res.status(409).json({ error: 'Payslip already generated for this period' });
    }

    let historyEntry = employee.positionHistory.find(h => {
      const startDate = new Date(h.startDate);
      const endDate = h.endDate ? new Date(h.endDate) : new Date('9999-12-31T23:59:59Z');
      return startDate <= payslipDate && payslipDate <= endDate;
    }) || { position: employee.position, salary: employee.salary };

    const receivedPosition = position.trim().toLowerCase();
    const historyPosition = historyEntry.position.trim().toLowerCase();
    const receivedSalary = Number(salary);
    const historySalary = historyEntry.salary;

    if (historyPosition !== receivedPosition || historySalary !== receivedSalary) {
      console.warn('Position/salary mismatch (proceeding with frontend values):', {
        history: { position: historyPosition, salary: historySalary },
        received: { position: receivedPosition, salary: receivedSalary },
        payslipDate: payslipDate.toISOString()
      });
    }

    const newPayslip = new Payslip({
      employeeId,
      empNo,
      payslipData,
      salaryMonth,
      paydayType,
      position: position.trim(),
      salary: receivedSalary
    });
    await newPayslip.save();
    console.log('Payslip generated successfully:', { employeeId, salaryMonth, paydayType });
    res.status(201).json(newPayslip);
  } catch (error) {
    console.error('Error generating payslip:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;