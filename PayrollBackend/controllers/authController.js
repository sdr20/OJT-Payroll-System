const Employee = require('../models/Employee');

const login = async (req, res) => {
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
};

module.exports = { login };