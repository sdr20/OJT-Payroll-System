// C:\Users\Administrator\Desktop\OJT-Payroll-System\PayrollBackend\routes\attendance.js
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { createObjectCsvWriter } = require('csv-writer'); // Import csv-writer
const fs = require('fs').promises; // Use promises version of fs for async file handling

const isAdmin = (req, res, next) => {
  const userRole = req.headers['user-role'] || 'employee';
  if (userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// Get attendance records
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date parameter is required' });
    const records = await Attendance.find({ date });
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// Get late employees count
router.get('/late', isAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date parameter is required' });
    const lateRecords = await Attendance.find({ date, status: 'Late' });
    res.json({ total: lateRecords.length });
  } catch (error) {
    console.error('Error fetching late records:', error);
    res.status(500).json({ error: 'Failed to fetch late records' });
  }
});

// Export attendance as CSV
router.get('/export', isAdmin, async (req, res) => {
  try {
    const records = await Attendance.find();
    const filename = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    const csvWriter = createObjectCsvWriter({
      path: filename,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'employeeId', title: 'Employee ID' },
        { id: 'firstName', title: 'First Name' },
        { id: 'lastName', title: 'Last Name' },
        { id: 'position', title: 'Position' },
        { id: 'email', title: 'Email' },
        { id: 'date', title: 'Date' },
        { id: 'timeIn', title: 'Time In' },
        { id: 'timeOut', title: 'Time Out' },
        { id: 'status', title: 'Status' }
      ]
    });

    await csvWriter.writeRecords(records);
    res.download(filename, filename, async (err) => {
      if (err) {
        console.error('Error during download:', err);
        return res.status(500).json({ error: 'Failed to download CSV' });
      }
      try {
        await fs.unlink(filename); // Remove the file after successful download
        console.log(`Temporary file ${filename} deleted`);
      } catch (unlinkErr) {
        console.error('Error deleting temp file:', unlinkErr);
      }
    });
  } catch (error) {
    console.error('Error exporting attendance:', error);
    res.status(500).json({ error: 'Failed to export attendance' });
  }
});

// Delete attendance record
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const result = await Attendance.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Attendance record not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ error: 'Failed to delete attendance record' });
  }
});

// Update attendance
router.put('/:id', async (req, res) => {
  try {
    const { date, status } = req.body;
    const attendance = await Attendance.findOneAndUpdate(
      { id: parseInt(req.params.id), date },
      { status },
      { new: true }
    );
    if (!attendance) return res.status(404).json({ error: 'Attendance record not found' });
    res.json(attendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

module.exports = router;