import express from 'express';
import { verifyAdminToken } from '../middleware/adminAuthMiddleware.js';
import { verifyAuthToken } from '../middleware/authMiddleware.js';
import { 
    getPaySlips, 
    generatePayslip, 
    sendPayslipEmail, 
    getEmployeePayslips 
} from '../controllers/employee/paySlip.controller.js';

const router = express.Router();

router.get('/:employeeId', verifyAuthToken, getEmployeePayslips);

router.get('/', verifyAdminToken, getPaySlips);
router.post('/generate', verifyAdminToken, generatePayslip);
router.post('/send-email', verifyAdminToken, sendPayslipEmail);

export default router;