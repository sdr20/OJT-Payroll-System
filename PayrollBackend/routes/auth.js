// C:\Users\Administrator\Desktop\OJT-Payroll-System\PayrollBackend\routes\auth.js
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username });

    // Trim and validate input
    const trimmedUsername = username?.trim();
    const trimmedPassword = password?.trim();

    if (!trimmedUsername || !trimmedPassword) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username
    const user = await Employee.findOne({ username: trimmedUsername });
    if (!user) {
      console.log('User not found:', trimmedUsername);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare password
    const isMatch = await user.comparePassword(trimmedPassword);
    if (!isMatch) {
      console.log('Password mismatch for user:', trimmedUsername);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Prepare response with all necessary fields for SalarySlips
    const userData = {
      id: user.id,
      empNo: user.empNo,
      username: user.username,
      firstName: user.firstName,
      middleName: user.middleName || '',
      lastName: user.lastName,
      name: `${user.firstName} ${user.middleName || ''} ${user.lastName}`.trim(),
      email: user.email,
      role: user.role,
      hireDate: user.hireDate, // Required for SalarySlips filtering
      position: user.position,
      salary: user.salary,
      hourlyRate: user.hourlyRate,
      contactInfo: user.contactInfo,
      sss: user.sss || '',
      philhealth: user.philhealth || '',
      hdmf: user.hdmf || '',
      tin: user.tin || '',
      civilStatus: user.civilStatus || 'Single',
      earnings: user.earnings || { travelExpenses: 0, otherEarnings: 0 }
    };

    console.log('Login successful:', { id: user.id, username: user.username, role: user.role });
    res.status(200).json(userData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

module.exports = router;