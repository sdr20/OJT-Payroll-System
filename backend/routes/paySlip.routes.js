import express from 'express';
import { verifyAdminToken } from '../middleware/adminAuthMiddleware.js';
import { 
    getPaySlips, 
    generatePayslip, 
    sendPayslipEmail, 
    getEmployeePayslips 
} from '../controllers/employee/paySlip.controller.js';

const router = express.Router();

router.get('/:employeeId', getEmployeePayslips);

router.get('/', verifyAdminToken, getPaySlips);
router.post('/generate', verifyAdminToken, generatePayslip);
router.post('/send-email', verifyAdminToken, sendPayslipEmail);

export default router;