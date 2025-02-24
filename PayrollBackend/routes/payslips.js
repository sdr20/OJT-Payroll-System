const express = require('express');
const router = express.Router();
const Payslip = require('../models/Payslip');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-specific-password'
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { employeeId, payslipData, salaryMonth } = req.body;
    const payslip = new Payslip({ employeeId, payslipData, salaryMonth });
    await payslip.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate payslip' });
  }
});

router.post('/send-email', async (req, res) => {
  try {
    const { employeeId, employeeEmail, payslipData, salaryMonth } = req.body;
    const pdfBuffer = Buffer.from(payslipData.split(',')[1], 'base64');

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: employeeEmail,
      subject: `Payslip for ${salaryMonth}`,
      text: 'Please find your payslip attached.',
      attachments: [{
        filename: `payslip-${employeeId}-${salaryMonth}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;