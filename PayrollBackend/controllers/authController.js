const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');

// Secret key for JWT (store this in an environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.status(200).json({
      token, // Return the token
      user: {
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
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
};

// Optional: Add a middleware to verify JWT for protected routes
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Expecting "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded user data to request
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { login, verifyToken };