const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');

// Fetch all employees (AdminDashboard, EmployeeManagement)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, month } = req.query;
    const skip = (page - 1) * limit;
    const query = month ? { salaryMonth: month } : {};
    const employees = await Employee.find(query)
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Employee.countDocuments(query);
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Fetch max ID (EmployeeManagement)
router.get('/max-id', async (req, res) => {
  try {
    const maxIdDoc = await Employee.findOne().sort({ id: -1 }).select('id');
    const maxId = maxIdDoc ? maxIdDoc.id : 0;
    res.json({ maxId });
  } catch (error) {
    console.error('Error fetching max ID:', error);
    res.status(500).json({ error: 'Failed to fetch max ID' });
  }
});

// Fetch employee count (AdminDashboard)
router.get('/count', async (req, res) => {
  try {
    const total = await Employee.countDocuments();
    res.json({ total });
  } catch (error) {
    console.error('Error fetching employee count:', error);
    res.status(500).json({ error: 'Failed to fetch employee count' });
  }
});

// Fetch eligible for salary (AdminDashboard)
router.get('/eligible-for-salary', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const presentEmployees = await Attendance.countDocuments({ date: today, status: { $in: ['On Time', 'Late'] } });
    res.json({ total: presentEmployees });
  } catch (error) {
    console.error('Error fetching eligible employees:', error);
    res.status(500).json({ error: 'Failed to fetch eligible employees' });
  }
});

// Fetch specific employee data (EmployeeDashboard, EmployeeSalarySlip)
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findOne({ id: parseInt(req.params.id) });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.find({ employeeId: parseInt(req.params.id) });
    const totalLate = attendance.filter(a => a.status === 'Late').length;
    const totalOnTime = attendance.filter(a => a.status === 'On Time').length;
    const totalAbsences = await Attendance.countDocuments({ employeeId: parseInt(req.params.id), status: 'Absent', date: { $lte: today } });

    res.json({
      ...employee.toObject(),
      name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`.trim(),
      employeeId: employee.id,
      attendance: attendance.map(a => ({
        id: a.id,
        date: a.date,
        timeIn: a.timeIn,
        timeOut: a.timeOut,
        status: a.status
      })),
      totalLate,
      totalOnTime,
      totalAbsences
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Fetch employee salary (EmployeeSalarySlip)
router.get('/:id/salary', async (req, res) => {
  try {
    const { month } = req.query;
    const employee = await Employee.findOne({ id: parseInt(req.params.id) });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const salaryMonth = month || new Date().toISOString().slice(0, 7);
    res.json({
      id: employee.id,
      empNo: employee.empNo,
      name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`.trim(),
      hourlyRate: employee.hourlyRate || (employee.salary / (8 * 22)),
      totalEarnings: employee.salary || 0, // Simplified for demo; add logic for dynamic earnings
      totalDeductions: 0, // Simplified; add logic for deductions
      totalSalary: employee.salary || 0, // Simplified; add logic for net salary
      salaryMonth: new Date(salaryMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' }),
      lastName: employee.lastName,
      middleName: employee.middleName,
      firstName: employee.firstName,
      birthDate: employee.birthDate,
      hireDate: employee.hireDate,
      civilStatus: employee.civilStatus,
      sss: employee.sss,
      tin: employee.tin,
      philhealth: employee.philhealth,
      hdmf: employee.pagibig,
      position: employee.position,
      salary: employee.salary,
      payheads: employee.payheads || []
    });
  } catch (error) {
    console.error('Error fetching employee salary:', error);
    res.status(500).json({ error: 'Failed to fetch employee salary' });
  }
});

// Time-In (EmployeeDashboard)
router.post('/time-in', async (req, res) => {
  try {
    const { userId, time } = req.body;
    const employee = await Employee.findOne({ id: parseInt(userId) });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const date = time.split('T')[0];
    const timeIn = new Date(time).toLocaleTimeString('en-US', { hour12: false });
    const status = new Date(time).getHours() < 9 ? 'On Time' : 'Late';

    const maxId = await Attendance.findOne().sort({ id: -1 });
    const newId = maxId ? maxId.id + 1 : 1;

    const attendance = new Attendance({
      id: newId,
      employeeId: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      position: employee.position,
      email: employee.email,
      date,
      timeIn,
      status
    });
    await attendance.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error recording time-in:', error);
    res.status(500).json({ error: 'Failed to record time-in' });
  }
});

// Time-Out (EmployeeDashboard)
router.post('/time-out', async (req, res) => {
  try {
    const { userId, time } = req.body;
    const date = time.split('T')[0];
    const timeOut = new Date(time).toLocaleTimeString('en-US', { hour12: false });

    const attendance = await Attendance.findOne({ employeeId: parseInt(userId), date, timeOut: null });
    if (!attendance) return res.status(400).json({ error: 'No active time-in record found' });

    attendance.timeOut = timeOut;
    await attendance.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error recording time-out:', error);
    res.status(500).json({ error: 'Failed to record time-out' });
  }
});

// Update employee (EmployeeManagement)
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

// Delete employee (EmployeeManagement)
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

// Create employee (EmployeeManagement)
router.post('/', async (req, res) => {
  try {
    console.log('Received employee data:', req.body);
    const maxIdDoc = await Employee.findOne().sort({ id: -1 }).select('id');
    const newId = maxIdDoc ? maxIdDoc.id + 1 : 1;
    const employee = new Employee({ ...req.body, id: newId });
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

// Update employee payheads (ManagePayHeads)
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