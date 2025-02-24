const express = require('express');
const router = express.Router();
const PendingRequest = require('../models/PendingRequest');

router.get('/max-id', async (req, res) => {
  try {
    const maxIdDoc = await PendingRequest.findOne().sort({ id: -1 });
    const maxId = maxIdDoc ? maxIdDoc.id : 0;
    res.json({ maxId });
  } catch (error) {
    console.error('Error fetching max ID:', error);
    res.status(500).json({ error: 'Failed to fetch max ID' });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Received request data:', req.body); // Add logging
    const request = new PendingRequest(req.body);
    await request.save();
    console.log('Saved request:', request); // Confirm saved data
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating pending request:', error);
    res.status(500).json({ error: 'Failed to create pending request: ' + error.message });
  }
});

// ... other routes unchanged

module.exports = router;

// GET all pending requests
router.get('/', async (req, res) => {
  try {
    const requests = await PendingRequest.find();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

// POST a new pending request
router.post('/', async (req, res) => {
  try {
    const request = new PendingRequest(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pending request' });
  }
});

// PUT to update a pending request
router.put('/:id', async (req, res) => {
  try {
    const request = await PendingRequest.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true }
    );
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// DELETE a pending request
router.delete('/:id', async (req, res) => {
  try {
    const result = await PendingRequest.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Request not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

module.exports = router;