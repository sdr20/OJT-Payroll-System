// C:\Users\ASUS\Desktop\Payroll_system\PayrollBackend\routes\pending-requests.js
const express = require('express');
const router = express.Router();
const PendingRequest = require('../models/PendingRequest');

// Get max ID for assigning new request IDs
router.get('/max-id', async (req, res) => {
  try {
    const maxIdDoc = await PendingRequest.findOne().sort({ id: -1 }).select('id');
    const maxId = maxIdDoc ? maxIdDoc.id : 0;
    console.log('Fetched max ID:', maxId);
    res.status(200).json({ maxId });
  } catch (error) {
    console.error('Error fetching max ID:', error);
    res.status(500).json({ error: 'Failed to fetch max ID', message: error.message });
  }
});

// Get all pending requests
router.get('/', async (req, res) => {
  try {
    const requests = await PendingRequest.find();
    console.log('Fetched pending requests:', requests.length);
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests', message: error.message });
  }
});

// Create a new pending request
router.post('/', async (req, res) => {
  try {
    console.log('Received request data:', req.body);
    const requiredFields = ['id', 'name', 'positionApplied', 'email', 'contactNumber', 'salary', 'username', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const request = new PendingRequest(req.body);
    await request.save();
    console.log('Saved request:', request);
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating pending request:', error);
    if (error.code === 11000) { // Duplicate key error (e.g., id or username)
      res.status(400).json({ error: 'Duplicate ID or username detected', message: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create pending request', message: error.message });
    }
  }
});

// Update a pending request
router.put('/:id', async (req, res) => {
  try {
    const request = await PendingRequest.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true }
    );
    if (!request) {
      console.error(`Request not found for ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Request not found' });
    }
    console.log('Updated request:', request);
    res.status(200).json(request);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request', message: error.message });
  }
});

// Delete a pending request
router.delete('/:id', async (req, res) => {
  try {
    const result = await PendingRequest.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount === 0) {
      console.error(`Request not found for ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Request not found' });
    }
    console.log(`Deleted request with ID: ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete request', message: error.message });
  }
});

module.exports = router;