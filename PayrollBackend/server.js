const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const Employee = require('./models/Employee');

const employeeRoutes = require('./routes/employees');
const pendingRequestRoutes = require('./routes/pendingRequests');
const leaveRequestRoutes = require('./routes/leaveRequests');
const payslipRoutes = require('./routes/payslips');
const attendanceRoutes = require('./routes/attendance');
const payheadRoutes = require('./routes/payheads');
const authRoutes = require('./routes/auth');
const positionRoutes = require('./routes/positions');
const positionHistoryRoutes = require('./routes/positionHistory');
const contributionRoutes = require('./routes/contributions');
const employeeRecordsRoutes = require('./routes/employeeRecords');

const app = express();

const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'user-role', 'user-id', 'authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

console.log('Environment Variables:');
console.log('PORT:', process.env.PORT || 7777);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');

async function seedUsers() {
  try {
    // Seed Admin User
    const existingAdmin = await Employee.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      const admin = new Employee({
        id: 1,
        empNo: "ADMIN001",
        firstName: "Admin",
        lastName: "User",
        position: "Manager",
        salary: 50000,
        hourlyRate: 284.09,
        email: "admin@example.com",
        contactInfo: "09123456789",
        username: "admin",
        password: hashedPassword,
        role: "admin",
        hireDate: new Date('2023-01-01')
      });
      await admin.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Seed Test Employee
    const existingEmployee = await Employee.findOne({ username: 'janedoe' });
    if (!existingEmployee) {
      const hashedPassword = bcrypt.hashSync('janedoe123', 10);
      const employee = new Employee({
        id: 2,
        empNo: "EMP002",
        firstName: "Jane",
        lastName: "Doe",
        position: "Analyst",
        salary: 35000,
        hourlyRate: 35000 / (8 * 22),
        email: "jane.doe@example.com",
        contactInfo: "09123456789",
        username: "janedoe",
        password: hashedPassword,
        role: "employee",
        hireDate: new Date('2024-01-01')
      });
      await employee.save();
      console.log('Test employee created successfully');
    } else {
      console.log('Test employee already exists');
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

connectDB()
  .then(seedUsers)
  .catch(err => console.error("Database Connection Error:", err));

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/pending-requests', pendingRequestRoutes);
app.use('/api/leaves', leaveRequestRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payheads', payheadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/positionHistory', positionHistoryRoutes);
app.use('/api/employee-contributions', contributionRoutes);
app.use('/api/employee-records', employeeRecordsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running', uptime: process.uptime() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 7777;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});