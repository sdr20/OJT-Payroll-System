// C:\Users\ASUS\Desktop\Payroll_system\PayrollBackend\routes\payslips.js
const express = require('express');
const router = express.Router();
const Payslip = require('../models/Payslip');
const nodemailer = require('nodemailer');

// Configure Nodemailer transport with environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Load from .env
    pass: process.env.EMAIL_PASS  // Load from .env
  }
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Nodemailer configuration error:', error);
  } else {
    console.log('Nodemailer ready to send emails');
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { employeeId, payslipData, salaryMonth } = req.body;
    if (!employeeId || !payslipData || !salaryMonth) {
      console.error('Missing required fields for generate:', req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const payslip = new Payslip({ employeeId, payslipData, salaryMonth });
    await payslip.save();
    console.log(`Payslip generated for employee ${employeeId}, month ${salaryMonth}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error generating payslip:', error);
    res.status(500).json({ error: 'Failed to generate payslip', message: error.message });
  }
});

router.post('/send-email', async (req, res) => {
  try {
    const { employeeId, employeeEmail, payslipData, salaryMonth } = req.body;

    // Validate required fields
    if (!employeeId || !employeeEmail || !payslipData || !salaryMonth) {
      console.error('Missing required fields:', req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate and convert base64 data
    if (!payslipData.includes('base64,')) {
      console.error('Invalid payslipData format:', payslipData.slice(0, 50) + '...');
      return res.status(400).json({ error: 'Invalid payslipData format' });
    }
    const pdfBuffer = Buffer.from(payslipData.split(',')[1], 'base64');

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employeeEmail,
      subject: `Payslip for ${salaryMonth}`,
      text: 'Please find your payslip attached.',
      attachments: [{
        filename: `payslip-${employeeId}-${salaryMonth}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Payslip email sent to ${employeeEmail} for employee ${employeeId}`);

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      error: 'Failed to send email', 
      message: error.message, 
      details: error.stack 
    });
  }
});

module.exports = router;