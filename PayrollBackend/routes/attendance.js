const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date parameter is required' });
    const records = await Attendance.find({ date });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

router.get('/late', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date parameter is required' });
    const lateRecords = await Attendance.find({ date, status: 'Late' });
    res.json({ total: lateRecords.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch late records' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Attendance.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Attendance record not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete attendance record' });
  }
});

// Helper route to populate attendance from employee time-in/time-out (used by EmployeeDashboard.vue)
router.post('/time-in', async (req, res) => {
  try {
    const { userId, time } = req.body;
    const employee = await Employee.findOne({ id: parseInt(userId) });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const date = time.split('T')[0];
    const signInTime = new Date(time).toLocaleTimeString('en-US', { hour12: false });
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
      signInTime,
      status
    });
    await attendance.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record time-in' });
  }
});

router.post('/time-out', async (req, res) => {
  try {
    const { userId, time } = req.body;
    const date = time.split('T')[0];
    const signOutTime = new Date(time).toLocaleTimeString('en-US', { hour12: false });

    const attendance = await Attendance.findOne({ employeeId: parseInt(userId), date, signOutTime: null });
    if (!attendance) return res.status(400).json({ error: 'No active time-in record found' });

    attendance.signOutTime = signOutTime;
    await attendance.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record time-out' });
  }
});

module.exports = router;