import express from 'express';
import {
    getAllLeaveRequests,
    getEmployeeLeaveRequests,
    createLeaveRequest,
    approveLeaveRequest,
    disapproveLeaveRequest,
    deleteLeaveRequest
} from '../controllers/employee/leaveRequest.controller.js';
import { verifyEmployeeToken } from '../middleware/employeeAuthMiddleware.js';

const router = express.Router();

router.get('/all', getAllLeaveRequests);
router.get('/employee/:id', verifyEmployeeToken, getEmployeeLeaveRequests);
router.post('/', verifyEmployeeToken, createLeaveRequest);
router.put('/:id/approve', approveLeaveRequest);
router.put('/:id/disapprove', disapproveLeaveRequest);
router.delete('/:id', deleteLeaveRequest);

export default router;