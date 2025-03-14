import express from 'express';
import { getPaySlips, generatePayslip, sendPayslipEmail, getEmployeePayslips } from '../controllers/employee/paySlip.controller.js';

const router = express.Router();

router.get('/', getPaySlips);
router.post('/generate', generatePayslip);
router.post('/send-email', sendPayslipEmail);
router.get('/:employeeId', getEmployeePayslips);

export default router;