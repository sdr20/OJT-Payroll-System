// C:\Users\Administrator\Desktop\OJT-Payroll-System\PayrollBackend\routes\payslips.js
const express = require('express');
const router = express.Router();
const Payslip = require('../models/Payslip');
const nodemailer = require('nodemailer');
const Employee = require('../models/Employee'); // Added for validation

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  const userRole = req.headers['user-role'];
  if (!userRole || userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Nodemailer configuration error:', error);
  } else {
    console.log('Nodemailer ready to send emails');
  }
});

router.get('/', isAdmin, async (req, res) => {
  try {
    const { month } = req.query;
    const query = month ? { salaryMonth: month } : {};
    const payslips = await Payslip.find(query);
    console.log(`Fetched ${payslips.length} payslips for month: ${month || 'all'}`);
    res.status(200).json(payslips);
  } catch (error) {
    console.error('Error fetching payslips:', error);
    res.status(500).json({ error: 'Failed to fetch payslips', message: error.message });
  }
});

router.post('/generate', isAdmin, async (req, res) => {
  try {
    const { employeeId, empNo, payslipData, salaryMonth } = req.body;
    if (!employeeId || !empNo || !payslipData || !salaryMonth) {
      console.error('Missing required fields for generate:', req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate employee existence
    const employee = await Employee.findOne({ id: employeeId, empNo });
    if (!employee) {
      console.error('Employee not found:', { employeeId, empNo });
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Validate payslipData format
    if (!payslipData.startsWith('data:application/pdf;base64,')) {
      console.error('Invalid payslipData format:', payslipData.slice(0, 50));
      return res.status(400).json({ error: 'Invalid payslipData format' });
    }

    const payslip = new Payslip({ employeeId, empNo, payslipData, salaryMonth });
    await payslip.save();
    console.log(`Payslip generated for employee ${employeeId}, month ${salaryMonth}`);
    res.status(200).json({ success: true, message: 'Payslip generated successfully' });
  } catch (error) {
    console.error('Error generating payslip:', error);
    res.status(500).json({ error: 'Failed to generate payslip', message: error.message });
  }
});

router.post('/send-email', isAdmin, async (req, res) => {
  try {
    const { employeeId, employeeEmail, payslipData, salaryMonth } = req.body;
    if (!employeeId || !employeeEmail || !payslipData || !salaryMonth) {
      console.error('Missing required fields for send-email:', req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate employee email
    const employee = await Employee.findOne({ id: employeeId, email: employeeEmail });
    if (!employee) {
      console.error('Employee not found or email mismatch:', { employeeId, employeeEmail });
      return res.status(404).json({ error: 'Employee not found or email does not match' });
    }

    // Validate payslipData format
    if (!payslipData.startsWith('data:application/pdf;base64,')) {
      console.error('Invalid payslipData format:', payslipData.slice(0, 50));
      return res.status(400).json({ error: 'Invalid payslipData format' });
    }

    const pdfBuffer = Buffer.from(payslipData.split(',')[1], 'base64');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employeeEmail,
      subject: `Payslip for ${salaryMonth}`,
      text: `Dear ${employee.firstName} ${employee.lastName},\n\nPlease find your payslip for ${salaryMonth} attached.\n\nBest regards,\nPayroll Team`,
      attachments: [{
        filename: `payslip-${employeeId}-${salaryMonth}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payslip email sent to ${employeeEmail} for employee ${employeeId}, month ${salaryMonth}`);
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', message: error.message });
  }
});

module.exports = router;