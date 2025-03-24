// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Define transporter directly in auth.js
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter on module load
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter verification failed in auth.js:', error);
  } else {
    console.log('Email transporter is ready in auth.js');
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Login request received:', { username, password: '[hidden]' });

    const trimmedUsername = username?.trim();
    const trimmedPassword = password?.trim();

    if (!trimmedUsername || !trimmedPassword) {
      console.log('Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await Employee.findOne({ username: trimmedUsername });
    if (!user) {
      console.log('User not found:', trimmedUsername);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    console.log('User found:', { id: user.id, username: user.username, role: user.role });
    console.log('Stored hashed password:', user.password);

    const isMatch = await user.comparePassword(trimmedPassword);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for user:', trimmedUsername);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    console.log('Login successful:', { id: user.id, username: user.username, role: user.role });

    res.status(200).json({
      id: user.id,
      empNo: user.empNo,
      username: user.username,
      firstName: user.firstName,
      middleName: user.middleName || '',
      lastName: user.lastName,
      name: `${user.firstName} ${user.middleName || ''} ${user.lastName}`.trim(),
      email: user.email,
      role: user.role,
      hireDate: user.hireDate,
      position: user.position,
      salary: user.salary,
      hourlyRate: user.hourlyRate,
      contactInfo: user.contactInfo,
      sss: user.sss || '',
      philhealth: user.philhealth || '',
      hdmf: user.hdmf || '',
      tin: user.tin || '',
      civilStatus: user.civilStatus || 'Single',
      earnings: user.earnings || { travelExpenses: 0, otherEarnings: 0 },
    });
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      requestBody: { username: req.body.username, password: '[hidden]' },
    });
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

// Forgot Password - Send Verification Code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Forgot password request received:', { email });

    const trimmedEmail = email?.trim();
    if (!trimmedEmail) {
      console.log('Missing email');
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Searching for employee with email:', trimmedEmail);
    const employee = await Employee.findOne({ email: trimmedEmail });
    if (!employee) {
      console.log('Employee not found:', trimmedEmail);
      return res.status(404).json({ error: 'Email not found' });
    }

    console.log('Employee found:', { id: employee.id, email: employee.email });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(20).toString('hex');

    console.log('Generated reset details:', { verificationCode, resetToken });

    employee.resetToken = resetToken;
    employee.verificationCode = verificationCode;
    employee.resetTokenExpires = Date.now() + 3600000; // 1 hour expiration
    await employee.save();

    console.log('Employee updated with reset details:', { id: employee.id, email: employee.email });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: trimmedEmail,
      subject: 'Password Reset Verification Code',
      text: `Your verification code is: ${verificationCode}\nThis code expires in 1 hour.`
    };

    console.log('Attempting to send email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully to:', trimmedEmail);

    res.status(200).json({ resetToken });
  } catch (error) {
    console.error('Forgot password error:', {
      message: error.message,
      stack: error.stack,
      requestBody: { email: req.body.email },
    });
    res.status(500).json({ error: 'Failed to send verification code', message: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetToken, verificationCode, newPassword } = req.body;

    console.log('Reset password request received:', { email, resetToken, verificationCode, newPassword: '[hidden]' });

    const trimmedEmail = email?.trim();
    const trimmedResetToken = resetToken?.trim();
    const trimmedVerificationCode = verificationCode?.trim();
    const trimmedNewPassword = newPassword?.trim();

    if (!trimmedEmail || !trimmedResetToken || !trimmedVerificationCode || !trimmedNewPassword) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    console.log('Searching for employee with reset details:', { email: trimmedEmail, resetToken: trimmedResetToken });
    const employee = await Employee.findOne({
      email: trimmedEmail,
      resetToken: trimmedResetToken,
      verificationCode: trimmedVerificationCode,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!employee) {
      console.log('Invalid or expired reset details:', { email: trimmedEmail });
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    console.log('Employee found for reset:', { id: employee.id, email: employee.email });

    employee.password = trimmedNewPassword;
    employee.resetToken = undefined;
    employee.verificationCode = undefined;
    employee.resetTokenExpires = undefined;
    await employee.save();

    console.log('Password reset successful for:', { id: employee.id, email: employee.email });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', {
      message: error.message,
      stack: error.stack,
      requestBody: { email: req.body.email, resetToken: req.body.resetToken, verificationCode: req.body.verificationCode, newPassword: '[hidden]' },
    });
    res.status(500).json({ error: 'Password reset failed', message: error.message });
  }
});

module.exports = router;