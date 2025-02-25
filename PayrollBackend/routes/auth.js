const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    const user = await Employee.findOne({ username: username.trim() });
    console.log('Found user:', user);
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    if (user.password !== password.trim()) {
      console.log('Password mismatch:', { stored: user.password, provided: password });
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.json({ id: user.id, name: `${user.firstName} ${user.lastName}`, role: 'employee' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;