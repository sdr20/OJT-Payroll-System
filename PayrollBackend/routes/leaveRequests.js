const express = require('express');
const router = express.Router();
const { 
  getAllLeaveRequests,
  getEmployeeLeaveRequests,
  createLeaveRequest,
  approveLeaveRequest,
  disapproveLeaveRequest
} = require('../controllers/leaveRequestController');

router.get('/all', getAllLeaveRequests);
router.get('/employee/:employeeId', getEmployeeLeaveRequests);
router.post('/', createLeaveRequest);
router.put('/:id/approve', approveLeaveRequest);
router.put('/:id/disapprove', disapproveLeaveRequest);

module.exports = router;