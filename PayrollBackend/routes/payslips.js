const express = require('express');
const router = express.Router();
const { getPayslips, getEmployeePayslips, generatePayslip, sendPayslipEmail } = require('../controllers/payslipController');
const { isAdmin } = require('../middleware/auth');

router.get('/', isAdmin, getPayslips);
router.get('/:employeeId', isAdmin, getEmployeePayslips);
router.post('/generate', isAdmin, generatePayslip);
router.post('/send-email', isAdmin, sendPayslipEmail);

module.exports = router;