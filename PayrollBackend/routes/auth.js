// C:\Users\Administrator\Desktop\OJT-Payroll-System\PayrollBackend\routes\auth.js
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username });

    const user = await Employee.findOne({ username: username.trim() });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password.trim());
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    console.log('Login successful:', user);
    res.json({
      id: user.id,
      empNo: user.empNo,
      name: `${user.firstName} ${user.middleName} ${user.lastName}`.trim(),
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

module.exports = router; // Ensure this line is present