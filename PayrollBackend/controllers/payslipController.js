const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const getPayslips = async (req, res) => {
  try {
    const { month } = req.query;
    const query = month ? { salaryMonth: month } : {};
    const payslips = await Payslip.find(query);
    res.status(200).json(payslips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payslips', message: error.message });
  }
};

const getEmployeePayslips = async (req, res) => {
  try {
    const employeeId = Number(req.params.employeeId);
    const payslips = await Payslip.find({ employeeId });
    res.status(200).json(payslips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payslips', message: error.message });
  }
};

const generatePayslip = async (req, res) => {
  try {
    const { employeeId, empNo, payslipData, salaryMonth, paydayType } = req.body;
    if (!employeeId || !empNo || !payslipData || !salaryMonth || !paydayType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!['mid-month', 'end-of-month'].includes(paydayType)) {
      return res.status(400).json({ error: 'Invalid paydayType' });
    }

    const employee = await Employee.findOne({ id: employeeId, empNo });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (!payslipData.startsWith('data:application/pdf;base64,')) {
      return res.status(400).json({ error: 'Invalid payslipData format' });
    }

    const existingPayslip = await Payslip.findOne({ employeeId, salaryMonth, paydayType });
    if (existingPayslip) {
      return res.status(409).json({ error: 'Payslip already exists for this salary date' });
    }

    const payslip = new Payslip({ employeeId, empNo, payslipData, salaryMonth, paydayType });
    await payslip.save();
    res.status(200).json({ success: true, message: 'Payslip generated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate payslip', message: error.message });
  }
};

const sendPayslipEmail = async (req, res) => {
  try {
    const { employeeId, employeeEmail, payslipData, salaryMonth } = req.body;
    if (!employeeId || !employeeEmail || !payslipData || !salaryMonth) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const employee = await Employee.findOne({ id: employeeId, email: employeeEmail });
    if (!employee) return res.status(404).json({ error: 'Employee not found or email mismatch' });
    if (!payslipData.startsWith('data:application/pdf;base64,')) {
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
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email', message: error.message });
  }
};

module.exports = { getPayslips, getEmployeePayslips, generatePayslip, sendPayslipEmail };