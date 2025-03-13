const LeaveRequest = require('../models/LeaveRequest');

const getAllLeaveRequests = async (req, res) => {
  try {
    const { page = 0, size = 10 } = req.query;
    const skip = page * size;
    const leaveRequests = await LeaveRequest.find()
      .skip(skip)
      .limit(parseInt(size));
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

const getEmployeeLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ employeeId: parseInt(req.params.employeeId) });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

const createLeaveRequest = async (req, res) => {
  try {
    const maxId = await LeaveRequest.findOne().sort({ id: -1 });
    const newId = maxId ? maxId.id + 1 : 1;
    const leaveRequest = new LeaveRequest({ ...req.body, id: newId });
    await leaveRequest.save();
    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create leave request' });
  }
};

const approveLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { status: 'Approved' },
      { new: true }
    );
    if (!leaveRequest) return res.status(404).json({ error: 'Leave request not found' });
    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve leave request' });
  }
};

const disapproveLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { status: 'Disapproved' },
      { new: true }
    );
    if (!leaveRequest) return res.status(404).json({ error: 'Leave request not found' });
    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to disapprove leave request' });
  }
};

module.exports = {
  getAllLeaveRequests,
  getEmployeeLeaveRequests,
  createLeaveRequest,
  approveLeaveRequest,
  disapproveLeaveRequest
};