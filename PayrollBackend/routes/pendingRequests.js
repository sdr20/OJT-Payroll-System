// C:\Users\Administrator\Desktop\OJT-Payroll-System\PayrollBackend\routes\pendingRequests.js
const express = require('express');
const router = express.Router();
const PendingRequest = require('../models/PendingRequest');
const Employee = require('../models/Employee');

const isAdmin = (req, res, next) => {
  const userRole = req.headers['user-role'] || 'employee';
  console.log('Received user-role header:', userRole); // Debug log
  if (userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get max ID
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
router.get('/', isAdmin, async (req, res) => {
  try {
    const requests = await PendingRequest.find({ status: 'pending' });
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
    const requiredFields = ['id', 'empNo', 'firstName', 'lastName', 'position', 'email', 'contactNumber', 'salary', 'username', 'password'];
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
    if (error.code === 11000) {
      res.status(400).json({ error: 'Duplicate ID, Employee Number, or username detected', message: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create pending request', message: error.message });
    }
  }
});

// Update a pending request
router.put('/:id', isAdmin, async (req, res) => {
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
    if (error.code === 11000) {
      res.status(400).json({ error: 'Duplicate ID, Employee Number, or username detected', message: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update request', message: error.message });
    }
  }
});

// Approve a pending request and create an employee
router.put('/:id/approve', isAdmin, async (req, res) => {
  try {
    const request = await PendingRequest.findOne({ id: parseInt(req.params.id) });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const existingEmployee = await Employee.findOne({ empNo: request.empNo });
    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee with this Employee Number already exists' });
    }

    const employee = new Employee({
      id: request.id,
      empNo: request.empNo,
      firstName: request.firstName,
      middleName: request.middleName,
      lastName: request.lastName,
      position: request.position,
      salary: request.salary,
      hourlyRate: request.hourlyRate,
      email: request.email,
      contactInfo: request.contactNumber,
      sss: request.sss,
      philhealth: request.philhealth,
      pagibig: request.pagibig,
      tin: request.tin,
      civilStatus: request.civilStatus,
      username: request.username,
      password: request.password,
      role: 'employee'
    });

    await employee.save();
    await PendingRequest.updateOne({ id: request.id }, { status: 'approved' });

    console.log('Approved request and created employee:', employee);
    res.status(200).json(employee);
  } catch (error) {
    console.error('Error approving request:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Duplicate ID, Employee Number, or username in employees collection', message: error.message });
    } else {
      res.status(500).json({ error: 'Failed to approve request', message: error.message });
    }
  }
});

// Reject a pending request
router.put('/:id/reject', isAdmin, async (req, res) => {
  try {
    const request = await PendingRequest.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { status: 'rejected' },
      { new: true }
    );
    if (!request) {
      console.error(`Request not found for ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Request not found' });
    }
    console.log('Rejected request:', request);
    res.status(200).json(request);
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Failed to reject request', message: error.message });
  }
});

// Delete a pending request
router.delete('/:id', isAdmin, async (req, res) => {
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