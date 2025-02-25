const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');

router.get('/all', async (req, res) => {
  try {
    const requests = await LeaveRequest.find();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

router.get('/employee/:id', async (req, res) => {
  try {
    const requests = await LeaveRequest.find({ employeeId: parseInt(req.params.id) });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee leave requests' });
  }
});

router.post('/', async (req, res) => {
  try {
    const maxId = await LeaveRequest.findOne().sort({ id: -1 });
    const newId = maxId ? maxId.id + 1 : 1;
    const leaveRequest = new LeaveRequest({ ...req.body, id: newId });
    await leaveRequest.save();
    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create leave request' });
  }
});

router.put('/:id/approve', async (req, res) => {
  try {
    const request = await LeaveRequest.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { status: 'Approved' },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: 'Leave request not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve leave request' });
  }
});

router.put('/:id/disapprove', async (req, res) => {
  try {
    const request = await LeaveRequest.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { status: 'Disapproved' },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: 'Leave request not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disapprove leave request' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await LeaveRequest.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Leave request not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete leave request' });
  }
});

module.exports = router;