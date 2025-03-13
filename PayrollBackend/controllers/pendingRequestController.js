const PendingRequest = require('../models/PendingRequest');
const Employee = require('../models/Employee');

const getMaxId = async (req, res) => {
  try {
    const maxIdDoc = await PendingRequest.findOne().sort({ id: -1 }).select('id');
    const maxId = maxIdDoc ? maxIdDoc.id : 0;
    res.status(200).json({ maxId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch max ID', message: error.message });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const requests = await PendingRequest.find({ status: 'pending' });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending requests', message: error.message });
  }
};

const createPendingRequest = async (req, res) => {
  try {
    const requiredFields = ['id', 'empNo', 'firstName', 'lastName', 'position', 'email', 
      'contactNumber', 'salary', 'username', 'password', 'hireDate'];
    const missingFields = requiredFields.filter(field => !req.body[field] && req.body[field] !== 0);
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const { empNo, username, email } = req.body;
    const existingRequest = await PendingRequest.findOne({ $or: [{ empNo }, { username }, { email }] });
    if (existingRequest) {
      const duplicateField = existingRequest.empNo === empNo ? 'Employee Number' : 
                           existingRequest.username === username ? 'Username' : 'Email';
      return res.status(400).json({ error: `${duplicateField} already exists in pending requests` });
    }

    const existingEmployee = await Employee.findOne({ $or: [{ empNo }, { username }, { email }] });
    if (existingEmployee) {
      const duplicateField = existingEmployee.empNo === empNo ? 'Employee Number' : 
                           existingEmployee.username === username ? 'Username' : 'Email';
      return res.status(400).json({ error: `${duplicateField} already exists in employees` });
    }

    const hireDate = new Date(req.body.hireDate);
    if (isNaN(hireDate.getTime())) {
      return res.status(400).json({ error: 'Invalid hireDate format' });
    }

    const request = new PendingRequest({
      ...req.body,
      status: 'pending',
      role: 'employee',
      hourlyRate: req.body.salary / (8 * 22),
      earnings: req.body.earnings || { travelExpenses: 0, otherEarnings: 0 }
    });

    await request.save();
    res.status(201).json(request);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ error: `Duplicate ${field} detected`, message: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create pending request', message: error.message });
    }
  }
};

const updatePendingRequest = async (req, res) => {
  try {
    const request = await PendingRequest.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { ...req.body, hourlyRate: req.body.salary ? req.body.salary / (8 * 22) : req.body.hourlyRate },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ error: `Duplicate ${field} detected`, message: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update request', message: error.message });
    }
  }
};

const approvePendingRequest = async (req, res) => {
  try {
    const request = await PendingRequest.findOne({ id: parseInt(req.params.id) });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Request already processed' });

    const existingEmployee = await Employee.findOne({ 
      $or: [{ empNo: request.empNo }, { username: request.username }, { email: request.email }]
    });
    if (existingEmployee) {
      const duplicateField = existingEmployee.empNo === request.empNo ? 'Employee Number' : 
                           existingEmployee.username === request.username ? 'Username' : 'Email';
      return res.status(400).json({ error: `${duplicateField} already exists in employees` });
    }

    const employee = new Employee({
      id: request.id,
      empNo: request.empNo,
      firstName: request.firstName,
      middleName: request.middleName || '',
      lastName: request.lastName,
      position: request.position,
      salary: request.salary,
      hourlyRate: request.hourlyRate || (request.salary / (8 * 22)),
      email: request.email,
      contactInfo: request.contactNumber,
      sss: request.sss || '',
      philhealth: request.philhealth || '',
      pagibig: request.hdmf || '',
      tin: request.tin || '',
      civilStatus: request.civilStatus || 'Single',
      username: request.username,
      password: request.password,
      role: request.role || 'employee',
      hireDate: request.hireDate,
      earnings: request.earnings || { travelExpenses: 0, otherEarnings: 0 }
    });

    await employee.save();
    await PendingRequest.updateOne({ id: request.id }, { status: 'approved', approvedAt: new Date() });
    res.status(200).json(employee);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ error: `Duplicate ${field} in employees collection`, message: error.message });
    } else {
      res.status(500).json({ error: 'Failed to approve request', message: error.message });
    }
  }
};

const rejectPendingRequest = async (req, res) => {
  try {
    const request = await PendingRequest.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { status: 'rejected', rejectedAt: new Date() },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject request', message: error.message });
  }
};

const deletePendingRequest = async (req, res) => {
  try {
    const result = await PendingRequest.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Request not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete request', message: error.message });
  }
};

module.exports = {
  getMaxId,
  getPendingRequests,
  createPendingRequest,
  updatePendingRequest,
  approvePendingRequest,
  rejectPendingRequest,
  deletePendingRequest
};