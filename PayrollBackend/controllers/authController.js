const Employee = require('../models/Employee');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const trimmedUsername = username?.trim();
    const trimmedPassword = password?.trim();

    if (!trimmedUsername || !trimmedPassword) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await Employee.findOne({ username: trimmedUsername });
    if (!user || !(await user.comparePassword(trimmedPassword))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

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
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
};

module.exports = { login };