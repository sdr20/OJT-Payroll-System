import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Employee } from '../../../models/employee.model.js';
import { Position } from '../../../models/position.model.js';

function generateToken(employeeId) {
    return jwt.sign({ employeeId }, process.env.JWT_SECRET, { expiresIn: '1800s' });
}

export const registerEmployee = asyncHandler(async (req, res) => {
    const {
        empNo, username, password, firstName, middleName, lastName, email,
        contactInfo, civilStatus, position, salary, sss, philHealth, pagIbig,
        tin, hireDate, role
    } = req.body;

    console.log('Register request body:', req.body); // Log incoming data

    if (!empNo || !username || !password || !firstName || !lastName || !email || !salary) {
        return res.status(400).json({ error: 'Required fields are missing' });
    }

    const existingEmployee = await Employee.exists({
        $or: [{ empNo }, { username: { $regex: username, $options: 'i' } }, { email }],
    });

    if (existingEmployee) {
        return res.status(409).json({ error: 'Employee number, username, or email already in use' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let positionId = null;
        if (position) {
            const positionDoc = await Position.findOne({ name: position });
            if (!positionDoc) {
                return res.status(400).json({ error: `Position '${position}' not found` });
            }
            positionId = positionDoc._id;
        }

        const employeeData = {
            empNo,
            username,
            password: hashedPassword,
            firstName,
            middleName: middleName || '',
            lastName,
            email,
            contactInfo: contactInfo || '',
            civilStatus: civilStatus || 'Single',
            position: positionId, // Use ObjectId instead of string
            salary: Number(salary),
            sss: sss || '',
            philHealth: philHealth || '',
            pagIbig: pagIbig || '',
            tin: tin || '',
            hireDate: hireDate ? new Date(hireDate) : Date.now(),
            role: role || 'employee',
            status: 'pending',
            earnings: { travelExpenses: 0, otherEarnings: 0 },
            payHead: [],
        };

        console.log('Creating employee with data:', employeeData); // Log before creation

        const employee = await Employee.create(employeeData);

        const token = generateToken(employee._id);

        res.status(201).json({
            message: 'Registration submitted for approval',
            employee: {
                id: employee._id,
                empNo: employee.empNo,
                username: employee.username,
                firstName: employee.firstName,
                middleName: employee.middleName,
                lastName: employee.lastName,
                email: employee.email,
                contactInfo: employee.contactInfo,
                civilStatus: employee.civilStatus,
                position: employee.position,
                salary: employee.salary,
                sss: employee.sss,
                philHealth: employee.philHealth,
                pagIbig: employee.pagIbig,
                tin: employee.tin,
                hireDate: employee.hireDate,
                role: employee.role,
                status: employee.status,
            },
            token,
        });
    } catch (error) {
        console.error('Error in registerEmployee:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

export const loginEmployee = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Find the employee by email
    const employee = await Employee.findOne({ username });
    if (!employee) {
        res.status(401).json({ message: 'Unauthorized: Username not found' });
        return;
    }

    // Check if the password is valid
    const isValid = await bcrypt.compare(password, employee.password);
    if (!isValid) {
        res.status(401).json({ message: 'Unauthorized: Incorrect password' });
        return;
    }
    
    // Check the employee's status
    if (employee.status === 'pending') {
        res.status(403).json({ message: 'Account awaiting approval. Please wait for admin approval.' });
        return;
    }
    if (employee.status === 'rejected') {
        res.status(403).json({ message: 'Account request was rejected. Contact the administrator.' });
        return;
    }

    // If status is 'approved', proceed with login
    const token = generateToken(employee._id);

    res.status(200).json({
        message: 'Login successful',
        employee: {
            id: employee._id,
            firstName: employee.firstName,
            middleName: employee.middleName,
            lastName: employee.lastName,
            username: employee.username,
            email: employee.email,
            empNo: employee.empNo,
            birthday: employee.birthday,
            hireDate: employee.hireDate,
            contactInfo: employee.contactInfo,
            civilStatus: employee.civilStatus,
            position: employee.position,
            salary: employee.salary,
            sss: employee.sss,
            philHealth: employee.philHealth,
            pagIbig: employee.pagIbig,
            role: employee.role
        },
        token
    });
});

export const pendingRequest = asyncHandler(async (req, res) => {
    const { name, positionApplied, salary, email, contactNumber, password } = req.body;

    // Check required fields (adjusted for pending request context)
    if (!name || !positionApplied || !salary || !email || !contactNumber || !password) {
        res.status(400).json({ error: 'Required fields are missing' });
        return;
    }

    // Split name into firstName and lastName (assuming "name" is full name)
    const [firstName, ...lastNameParts] = name.trim().split(' ');
    const lastName = lastNameParts.join(' ') || 'Unknown'; // Fallback if no lastName

    // Generate a temporary username (could be refined based on your needs)
    const username = email.split('@')[0]; // Simple username from email

    // Check for existing employee
    const existingEmployee = await Employee.exists({ 
        $or: [
            { username: { $regex: username, $options: 'i' } },
            { email }
        ]
    });
    
    if (existingEmployee) {
        res.status(409).json({ error: 'Username or email already in use' });
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const employee = await Employee.create({
        firstName,
        middleName,
        lastName,
        username,
        email,
        password: hashedPassword,
        empNo: `TEMP-${Date.now()}`, // Temporary ID until approved
        position: positionApplied,             // Map positionApplied to position
        salary,
        contactInfo: contactNumber,            // Map contactNumber to contactInfo
        sss: '',
        philHealth: '',
        pagIbig: '',
        tin: '',
        earnings: {
            travelExpenses: 0,
            otherEarnings: 0
        },
        payHeads: [],
        role: 'employee',
        status: 'pending'                      // Set as pending per the model
    });

    const token = generateToken(employee._id);

    res.status(201).json({
        message: 'Pending request submitted successfully',
        employee: {
            id: employee._id,
            firstName: employee.firstName,
            middleName: employee.middleName,
            lastName: employee.lastName,
            username: employee.username,
            email: employee.email,
            empNo: employee.empNo,
            position: employee.position,
            salary: employee.salary,
            contactInfo: employee.contactInfo,
            status: employee.status
        },
        token
    });
});