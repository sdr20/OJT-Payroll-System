const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');

// Fetch all leave requests (AdminLeaveManagement)
router.get('/all', async (req, res) => {
  try {
    const { page = 0, size = 10 } = req.query;
    const skip = page * size;
    const leaveRequests = await LeaveRequest.find()
      .skip(skip)
      .limit(parseInt(size));
    const total = await LeaveRequest.countDocuments();
    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// Fetch employee-specific leave requests (EmployeeLeaveRequest)
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ employeeId: parseInt(req.params.employeeId) });
    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching employee leave requests:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// Create leave request (EmployeeLeaveRequest)
router.post('/', async (req, res) => {
  try {
    const maxId = await LeaveRequest.findOne().sort({ id: -1 });
    const newId = maxId ? maxId.id + 1 : 1;
    const leaveRequest = new LeaveRequest({ ...req.body, id: newId });
    await leaveRequest.save();
    res.status(201).json(leaveRequest);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
});

// Approve leave request (AdminLeaveManagement)
router.put('/:id/approve', async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { status: 'Approved' },
      { new: true }
    );
    if (!leaveRequest) return res.status(404).json({ error: 'Leave request not found' });
    res.json(leaveRequest);
  } catch (error) {
    console.error('Error approving leave request:', error);
    res.status(500).json({ error: 'Failed to approve leave request' });
  }
});

// Disapprove leave request (AdminLeaveManagement)
router.put('/:id/disapprove', async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { status: 'Disapproved' },
      { new: true }
    );
    if (!leaveRequest) return res.status(404).json({ error: 'Leave request not found' });
    res.json(leaveRequest);
  } catch (error) {
    console.error('Error disapproving leave request:', error);
    res.status(500).json({ error: 'Failed to disapprove leave request' });
  }
});

module.exports = router;