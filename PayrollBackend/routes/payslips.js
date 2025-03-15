const express = require('express');
const router = express.Router();
const Payslip = require('../models/Payslip');
const nodemailer = require('nodemailer');
const Employee = require('../models/Employee');

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

transporter.verify((error) => {
  if (error) console.error('Nodemailer configuration error:', error);
  else console.log('Nodemailer ready to send emails');
});

router.get('/', isAdmin, async (req, res) => {
  try {
    const { month } = req.query;
    const query = month ? { salaryMonth: month } : {};
    const payslips = await Payslip.find(query);
    res.status(200).json(payslips);
  } catch (error) {
    console.error('Error fetching payslips:', error);
    res.status(500).json({ error: 'Failed to fetch payslips', message: error.message });
  }
});

router.get('/:employeeId', isAdmin, async (req, res) => {
  try {
    const employeeId = Number(req.params.employeeId);
    const payslips = await Payslip.find({ employeeId });
    res.status(200).json(payslips);
  } catch (error) {
    console.error('Error fetching payslips by employee ID:', error);
    res.status(500).json({ error: 'Failed to fetch payslips', message: error.message });
  }
});

router.post('/generate', isAdmin, async (req, res) => {
  try {
    console.log('Received payload for payslip generation:', req.body);
    const { employeeId, empNo, payslipData, salaryMonth, paydayType, position, salary } = req.body;
    if (!employeeId || !empNo || !payslipData || !salaryMonth || !paydayType || !position || !salary) {
      const missing = [];
      if (!employeeId) missing.push('employeeId');
      if (!empNo) missing.push('empNo');
      if (!payslipData) missing.push('payslipData');
      if (!salaryMonth) missing.push('salaryMonth');
      if (!paydayType) missing.push('paydayType');
      if (!position) missing.push('position');
      if (!salary) missing.push('salary');
      console.log('Missing fields:', missing);
      return res.status(400).json({ error: 'Missing required fields', missing });
    }

    if (!['mid-month', 'end-of-month'].includes(paydayType)) {
      console.log('Invalid paydayType:', paydayType);
      return res.status(400).json({ error: 'Invalid paydayType' });
    }

    const employee = await Employee.findOne({ id: employeeId, empNo });
    if (!employee) {
      console.log('Employee not found:', { employeeId, empNo });
      return res.status(404).json({ error: 'Employee not found' });
    }

    const payslipDate = new Date(salaryMonth + (paydayType === 'mid-month' ? '-15' : '-28'));
    const historyEntry = employee.positionHistory.find(h =>
      h.startDate <= payslipDate && (!h.endDate || h.endDate >= payslipDate)
    );
    if (!historyEntry || historyEntry.position !== position || historyEntry.salary !== salary) {
      console.log('Position/salary mismatch:', {
        providedPosition: position,
        providedSalary: salary,
        historyEntry
      });
      return res.status(400).json({ error: 'Position or salary does not match employee history for this period' });
    }

    if (!payslipData.startsWith('data:application/pdf;base64,')) {
      console.log('Invalid payslipData format:', payslipData);
      return res.status(400).json({ error: 'Invalid payslipData format' });
    }

    const existingPayslip = await Payslip.findOne({ employeeId, salaryMonth, paydayType });
    if (existingPayslip) {
      console.log('Payslip already exists:', { employeeId, salaryMonth, paydayType });
      return res.status(409).json({ error: 'Payslip already exists for this salary date' });
    }

    const payslip = new Payslip({ employeeId, empNo, payslipData, salaryMonth, paydayType, position, salary });
    await payslip.save();
    res.status(200).json({ success: true, message: 'Payslip generated successfully', payslip });
  } catch (error) {
    console.error('Error generating payslip:', error);
    res.status(500).json({ error: 'Failed to generate payslip', message: error.message });
  }
});

router.post('/send-email', isAdmin, async (req, res) => {
  try {
    const { employeeId, employeeEmail, payslipData, salaryMonth, position } = req.body;
    if (!employeeId || !employeeEmail || !payslipData || !salaryMonth || !position) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const employee = await Employee.findOne({ id: employeeId, email: employeeEmail });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found or email mismatch' });
    }

    const pdfBuffer = Buffer.from(payslipData.split(',')[1], 'base64');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employeeEmail,
      subject: `Payslip for ${salaryMonth}`,
      text: `Dear ${employee.firstName} ${employee.lastName},\n\nPlease find your payslip for ${salaryMonth} attached.\n\nBest regards,\nPayroll Team`,
      attachments: [{
        filename: `payslip-${employeeId}-${salaryMonth}-${position}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', message: error.message });
  }
});

module.exports = router;