const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../../../models/employee.model.js');

function generateToken(employeeId) {
    return jwt.sign({ employeeId }, process.env.JWT_SECRET, { expiresIn: '1800s' });
}

const registerEmployee = asyncHandler(async (req, res) => {
    const {
        employeeIdNumber, username, password, firstName, middleName, lastName, email,
        contactInfo, civilStatus, position, salary, sss, philhealth, pagibig, tin,
        hireDate, role, status,
    } = req.body;

    // Check required fields per the model
    if (!employeeIdNumber || !firstName || !lastName || !username || !email || !password || !position || !salary || !contactInfo || !hireDate) {
        res.status(400).json({ error: 'Required fields are missing' });
        return;
    }

    // Check for existing employee
    const existingEmployee = await Employee.exists({
        $or: [
            { username: { $regex: username, $options: 'i' } },
            { email },
            { employeeIdNumber },
        ],
    });

    if (existingEmployee) {
        res.status(409).json({ error: 'Username, email, or employee ID already in use' });
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a unique numeric id (this could be improved with a counter or sequence)
    const lastEmployee = await Employee.findOne().sort({ id: -1 });
    const newId = lastEmployee ? lastEmployee.id + 1 : 1;

    const employee = await Employee.create({
        id: newId,
        empNo: employeeIdNumber,
        firstName,
        middleName: middleName || '',
        lastName,
        username,
        email,
        password: hashedPassword,
        position,
        salary,
        contactInfo,
        civilStatus: civilStatus || 'Single',
        sss: sss || '',
        philhealth: philhealth || '',
        pagibig: pagibig || '',
        tin: tin || '',
        hireDate,
        role: role || 'employee',
        status: status || 'pending',
    });

    const token = generateToken(employee._id);

    res.status(201).json({
        message: 'Registration submitted for approval',
        employee: {
            id: employee._id,
            employeeIdNumber: employee.empNo,
            firstName: employee.firstName,
            middleName: employee.middleName,
            lastName: employee.lastName,
            username: employee.username,
            email: employee.email,
            position: employee.position,
            salary: employee.salary,
            contactInfo: employee.contactInfo,
            civilStatus: employee.civilStatus,
            sss: employee.sss,
            philhealth: employee.philhealth,
            pagibig: employee.pagibig,
            tin: employee.tin,
            hireDate: employee.hireDate,
            role: employee.role,
            status: employee.status,
        },
        token,
    });
});

const loginEmployee = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const employee = await Employee.findOne({ username });
    if (!employee) {
        res.status(401).json({ message: 'Unauthorized: Username not found' });
        return;
    }

    const isValid = await bcrypt.compare(password, employee.password);
    if (!isValid) {
        res.status(401).json({ message: 'Unauthorized: Incorrect password' });
        return;
    }

    if (employee.status === 'pending') {
        res.status(403).json({ message: 'Account awaiting approval. Please wait for admin approval.' });
        return;
    }

    if (employee.status === 'rejected') {
        res.status(403).json({ message: 'Account request was rejected. Contact the administrator.' });
        return;
    }

    const token = generateToken(employee._id);

    res.status(200).json({
        message: 'Login successful',
        employee: {
            id: employee._id,
            employeeIdNumber: employee.empNo,
            firstName: employee.firstName,
            middleName: employee.middleName,
            lastName: employee.lastName,
            username: employee.username,
            email: employee.email,
            position: employee.position,
            salary: employee.salary,
            contactInfo: employee.contactInfo,
            civilStatus: employee.civilStatus,
            sss: employee.sss,
            philhealth: employee.philhealth,
            pagibig: employee.pagibig,
            tin: employee.tin,
            hireDate: employee.hireDate,
            role: employee.role,
        },
        token,
    });
});

module.exports = { registerEmployee, loginEmployee };