import express from 'express';
import { verifyAdminToken } from '../middleware/adminAuthMiddleware.js';
import { recordPositionHistory, getPositionHistory, updatePositionHistory } from '../controllers/employee/positionHistory.controller.js';

const router = express.Router();

router.post('/record', verifyAdminToken, recordPositionHistory);
router.get('/:employeeId', verifyAdminToken, getPositionHistory);
router.put('/update/:employeeId', verifyAdminToken, updatePositionHistory);

export default router;