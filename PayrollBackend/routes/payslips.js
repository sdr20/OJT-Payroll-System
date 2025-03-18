const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Employee = require('../models/Employee');
const Payslip = require('../models/Payslip');

// Middleware to check for admin role
const isAdmin = (req, res, next) => {
  const userRole = req.headers['user-role'];
  if (!userRole || userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET payslips for an employee
router.get('/:employeeId', isAdmin, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    const payslips = await Payslip.find({ employeeId }).sort({ salaryMonth: 1, paydayType: 1 });

    if (!payslips || payslips.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(payslips.map(payslip => ({
      employeeId: payslip.employeeId,
      empNo: payslip.empNo,
      payslipData: payslip.payslipData,
      salaryMonth: payslip.salaryMonth,
      paydayType: payslip.paydayType,
      position: payslip.position,
      salary: payslip.salary
    })));
  } catch (error) {
    console.error('Error fetching payslips:', error);
    res.status(500).json({ error: 'Failed to fetch payslips', message: error.message });
  }
});

// POST generate a payslip
router.post('/generate', isAdmin, async (req, res) => {
  try {
    const {
      employeeId,
      empNo,
      payslipData,
      salaryMonth,
      paydayType,
      position,
      salary
    } = req.body;

    if (!employeeId || !empNo || !payslipData || !salaryMonth || !paydayType || !position || salary === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const employee = await Employee.findOne({ id: parseInt(employeeId) });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const [year, month] = salaryMonth.split('-');
    const payslipDate = new Date(
      paydayType.toLowerCase() === 'mid-month'
        ? `${year}-${month}-15`
        : `${year}-${month}-${new Date(year, month, 0).getDate()}`
    );

    // Ensure payslip date is not before hireDate
    if (payslipDate < new Date(employee.hireDate)) {
      return res.status(400).json({ error: `Payslip date (${payslipDate.toISOString()}) cannot be before hire date (${employee.hireDate.toISOString()})` });
    }

    const positionHistory = employee.positionHistory.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const activePosition = positionHistory.find(history => {
      const startDate = new Date(history.startDate);
      const endDate = history.endDate ? new Date(history.endDate) : new Date();
      return payslipDate >= startDate && payslipDate <= endDate;
    }) || positionHistory[positionHistory.length - 1];

    if (!activePosition) {
      return res.status(400).json({ error: 'No active position found for the payslip date' });
    }

    const historyPosition = activePosition.position;
    const historySalary = activePosition.salary;

    if (historyPosition !== position || historySalary !== salary) {
      return res.status(400).json({
        error: 'Position or salary mismatch with historical data',
        details: {
          expected: { position: historyPosition, salary: historySalary },
          received: { position, salary },
          payslipDate: payslipDate.toISOString()
        }
      });
    }

    const existingPayslip = await Payslip.findOne({ employeeId, salaryMonth, paydayType });

    if (existingPayslip) {
      existingPayslip.payslipData = payslipData;
      existingPayslip.position = position;
      existingPayslip.salary = salary;
      await existingPayslip.save();
      return res.status(200).json({
        success: true,
        message: `Payslip updated for employee ID ${employeeId}, ${salaryMonth}, ${paydayType}`,
        payslip: {
          employeeId,
          empNo,
          payslipData,
          salaryMonth,
          paydayType,
          position,
          salary
        }
      });
    }

    const payslip = new Payslip({
      employeeId,
      empNo,
      payslipData,
      salaryMonth,
      paydayType,
      position,
      salary
    });

    await payslip.save();

    res.status(201).json({
      success: true,
      message: `Payslip generated for employee ID ${employeeId}, ${salaryMonth}, ${paydayType}`,
      payslip: {
        employeeId,
        empNo,
        payslipData,
        salaryMonth,
        paydayType,
        position,
        salary
      }
    });
  } catch (error) {
    console.error('Error generating payslip:', error);
    res.status(500).json({ error: 'Failed to generate payslip', message: error.message });
  }
});

// DELETE a payslip
router.delete('/:employeeId/:salaryMonth/:paydayType', isAdmin, async (req, res) => {
  try {
    const { employeeId, salaryMonth, paydayType } = req.params;

    const payslip = await Payslip.findOneAndDelete({
      employeeId: parseInt(employeeId),
      salaryMonth,
      paydayType
    });

    if (!payslip) {
      return res.status(404).json({ error: 'Payslip not found' });
    }

    res.status(200).json({
      success: true,
      message: `Payslip for employee ID ${employeeId}, ${salaryMonth}, ${paydayType} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting payslip:', error);
    res.status(500).json({ error: 'Failed to delete payslip', message: error.message });
  }
});

module.exports = router;