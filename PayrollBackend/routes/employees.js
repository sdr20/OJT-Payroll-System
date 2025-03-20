const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Middleware to check if user is authenticated (admin or employee)
const isAuthenticated = (req, res, next) => {
  const userRole = req.headers['user-role'];
  if (!userRole || !['admin', 'employee'].includes(userRole.toLowerCase())) {
    return res.status(403).json({ error: 'Access denied: Must be an admin or employee' });
  }
  next();
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  const userRole = req.headers['user-role'];
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin access required' });
  }
  next();
};

// GET all employees
router.get('/', isAuthenticated, async (req, res) => {
  try {
    console.log('Fetching all employees');
    const { month } = req.query; // e.g., "2025-03"

    // Validate month format if provided
    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid month format: must be YYYY-MM (e.g., 2025-03)' });
    }

    let query = {};
    if (month) {
      // Filter employees active in the given month based on hireDate and positionHistory
      const endOfMonth = new Date(`${month}-31T23:59:59.999Z`);
      const startOfMonth = new Date(`${month}-01T00:00:00.000Z`);

      query.$or = [
        // Employees hired before or during the month with no end date in positionHistory
        {
          hireDate: { $lte: endOfMonth },
          'positionHistory': {
            $elemMatch: {
              startDate: { $lte: endOfMonth },
              $or: [{ endDate: { $gte: startOfMonth } }, { endDate: null }]
            }
          }
        },
        // Employees hired before the month with no positionHistory changes
        {
          hireDate: { $lte: endOfMonth },
          'positionHistory.0.endDate': null
        }
      ];
    }

    const employees = await Employee.find(query)
      .sort({ empNo: 1 })
      .select('-password') // Exclude sensitive fields like password
      .catch((err) => {
        throw new Error(`Database query failed: ${err.message}`);
      });

    console.log('Fetched employees:', employees.length);

    if (!employees || employees.length === 0) {
      console.log(`No employees found${month ? ` for month ${month}` : ''}`);
      return res.status(200).json([]);
    }

    // Add salaryMonth to response for frontend consistency
    const employeesWithMonth = employees.map(emp => ({
      ...emp._doc, // Spread the lean document
      salaryMonth: month || new Date(emp.hireDate).toISOString().slice(0, 7),
    }));

    res.status(200).json(employeesWithMonth);
  } catch (error) {
    console.error('Error in GET /api/employees:', {
      message: error.message,
      stack: error.stack,
      query: req.query,
    });
    res.status(500).json({ error: 'Failed to fetch employees', message: error.message });
  }
});

// GET a single employee by ID
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const userId = parseInt(req.headers['user-id']);
    const userRole = req.headers['user-role'];

    // Employees can only access their own data
    if (userRole === 'employee' && employeeId !== userId) {
      return res.status(403).json({ error: 'Access denied: Employees can only access their own data' });
    }

    console.log('Fetching employee with ID:', employeeId);
    const employee = await Employee.findOne({ id: employeeId }).catch((err) => {
      throw new Error(`Database query failed: ${err.message}`);
    });

    if (!employee) {
      console.log('Employee with id', employeeId, 'not found');
      return res.status(404).json({ error: `Employee with id ${employeeId} not found` });
    }

    console.log('Found employee:', employee);
    res.status(200).json(employee);
  } catch (error) {
    console.error('Error in GET /api/employees/:id:', {
      message: error.message,
      stack: error.stack,
      params: req.params,
    });
    res.status(500).json({ error: 'Failed to fetch employee', message: error.message });
  }
});

// GET salary data for a specific employee
router.get('/:id/salary', isAuthenticated, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const userId = parseInt(req.headers['user-id']);
    const userRole = req.headers['user-role'];
    const { month } = req.query;

    // Employees can only access their own data
    if (userRole === 'employee' && employeeId !== userId) {
      return res.status(403).json({ error: 'Access denied: Employees can only access their own data' });
    }

    console.log('Fetching salary data for employee ID:', employeeId, 'month:', month);
    const employee = await Employee.findOne({ id: employeeId }).catch((err) => {
      throw new Error(`Database query failed: ${err.message}`);
    });

    if (!employee) {
      console.log('Employee with id', employeeId, 'not found');
      return res.status(404).json({ error: `Employee with id ${employeeId} not found` });
    }

    console.log('Found employee:', employee);

    const salaryData = {
      id: employee.id,
      empNo: employee.empNo,
      name: `${employee.firstName} ${employee.lastName}`.trim(),
      position: employee.position,
      salary: employee.salary,
      hireDate: employee.hireDate,
      salaryMonth: month || null,
    };

    res.status(200).json(salaryData);
  } catch (error) {
    console.error('Error in GET /api/employees/:id/salary:', {
      message: error.message,
      stack: error.stack,
      params: req.params,
      query: req.query,
    });
    res.status(500).json({ error: 'Failed to fetch salary data', message: error.message });
  }
});

// POST a new employee (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const employeeData = req.body;

    // Validate required fields
    const requiredFields = ['empNo', 'firstName', 'lastName', 'position', 'salary', 'email', 'contactInfo', 'sss', 'philhealth', 'pagibig', 'tin', 'civilStatus', 'username', 'password', 'role', 'hireDate'];
    for (const field of requiredFields) {
      if (!employeeData[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Check if employee with empNo or username already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ empNo: employeeData.empNo }, { username: employeeData.username }],
    });

    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee with this empNo or username already exists' });
    }

    // Generate a unique ID
    const lastEmployee = await Employee.findOne().sort({ id: -1 });
    const newId = lastEmployee ? lastEmployee.id + 1 : 1;

    const newEmployee = new Employee({
      ...employeeData,
      id: newId,
      positionHistory: [
        {
          position: employeeData.position,
          salary: employeeData.salary,
          startDate: new Date(employeeData.hireDate),
          endDate: null,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedEmployee = await newEmployee.save();
    console.log('Employee created:', savedEmployee);
    res.status(201).json(savedEmployee);
  } catch (error) {
    console.error('Error in POST /api/employees:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({ error: 'Failed to create employee', message: error.message });
  }
});

// PUT update an employee by ID (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const updateData = req.body;

    console.log('Updating employee with ID:', employeeId, 'Data:', updateData);

    const employee = await Employee.findOne({ id: employeeId });
    if (!employee) {
      return res.status(404).json({ error: `Employee with id ${employeeId} not found` });
    }

    // Update position history if position or salary changes
    if (updateData.position || updateData.salary) {
      const currentPosition = employee.positionHistory.find((h) => !h.endDate);
      if (currentPosition) {
        if (
          (updateData.position && updateData.position !== currentPosition.position) ||
          (updateData.salary && updateData.salary !== currentPosition.salary)
        ) {
          currentPosition.endDate = new Date();
          employee.positionHistory.push({
            position: updateData.position || currentPosition.position,
            salary: updateData.salary || currentPosition.salary,
            startDate: new Date(),
            endDate: null,
          });
        }
      }
    }

    // Update employee fields
    Object.assign(employee, updateData, { updatedAt: new Date() });
    const updatedEmployee = await employee.save();

    console.log('Employee updated:', updatedEmployee);
    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error('Error in PUT /api/employees/:id:', {
      message: error.message,
      stack: error.stack,
      params: req.params,
      body: req.body,
    });
    res.status(500).json({ error: 'Failed to update employee', message: error.message });
  }
});

// DELETE an employee by ID (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    console.log('Deleting employee with ID:', employeeId);

    const employee = await Employee.findOneAndDelete({ id: employeeId });
    if (!employee) {
      return res.status(404).json({ error: `Employee with id ${employeeId} not found` });
    }

    console.log('Employee deleted:', employee);
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/employees/:id:', {
      message: error.message,
      stack: error.stack,
      params: req.params,
    });
    res.status(500).json({ error: 'Failed to delete employee', message: error.message });
  }
});

// POST login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    console.log('Login attempt for username:', username);
    const employee = await Employee.findOne({ username });

    if (!employee) {
      console.log('Employee not found for username:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for username:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    console.log('Login successful for username:', username);
    res.status(200).json({
      message: 'Login successful',
      employee: {
        id: employee.id,
        username: employee.username,
        role: employee.role,
        name: `${employee.firstName} ${employee.lastName}`.trim(),
      },
    });
  } catch (error) {
    console.error('Error in POST /api/employees/login:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({ error: 'Failed to login', message: error.message });
  }
});

module.exports = router;