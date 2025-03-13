const Employee = require('../models/Employee');
const { verifyToken } = require('./authController');

const loginEmployee = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const employee = await Employee.findOne({ username });
    if (!employee || !(await employee.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      employee: {
        id: employee.id,
        username: employee.username,
        role: employee.role,
        name: `${employee.firstName} ${employee.lastName}`,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login', message: error.message });
  }
};

const getEmployees = async (req, res) => {
  try {
    const { month } = req.query;
    let query = {};
    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
      }
      const [year, monthNum] = month.split('-');
      const parsedYear = parseInt(year);
      const parsedMonth = parseInt(monthNum);
      if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({ error: 'Invalid year or month value' });
      }
      query = {
        hireDate: {
          $gte: new Date(parsedYear, parsedMonth - 1, 1),
          $lt: new Date(parsedYear, parsedMonth, 1),
        },
      };
    }

    const employees = await Employee.find(query).sort({ empNo: 1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees', message: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const maxIdEmployee = await Employee.findOne().sort({ id: -1 });
    const newId = maxIdEmployee ? maxIdEmployee.id + 1 : 1;
    const employee = new Employee({ ...req.body, id: newId });
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    handleError(res, error, 'Failed to add employee');
  }
};

const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    handleError(res, error, 'Failed to update employee');
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const result = await Employee.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee', message: error.message });
  }
};

const handleError = (res, error, defaultMessage) => {
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map(err => err.message);
    res.status(400).json({ error: 'Validation failed', message: 'Invalid employee data', details: validationErrors });
  } else if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    res.status(400).json({ error: 'Duplicate key error', message: `${field} already exists` });
  } else {
    res.status(500).json({ error: defaultMessage, message: error.message });
  }
};

module.exports = {
  loginEmployee, 
  getEmployees: [verifyToken, getEmployees],
  createEmployee: [verifyToken, createEmployee],
  updateEmployee: [verifyToken, updateEmployee],
  deleteEmployee: [verifyToken, deleteEmployee],
};