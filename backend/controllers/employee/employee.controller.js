const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const Employee = require('../../models/employee.model.js');

// Get pending employees
exports.getPendingEmployees = asyncHandler(async (req, res) => {
    try {
        const pending = await Employee.find({ status: 'pending' }).select('-password');
        res.status(200).json(pending);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending employees', error: error.message });
    }
});

// Get total number of employees
exports.getTotalEmployees = asyncHandler(async (req, res) => {
    try {
        const total = await Employee.countDocuments();
        res.status(200).json({ total });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching total employees', error: error.message });
    }
});

// Get user details
exports.getProfile = asyncHandler(async (req, res) => {
    console.log('req.employeeId:', req.employeeId);
    const employee = await Employee.findById(req.employeeId).select('-password');
    if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
    }

    const employeeObj = employee.toObject();
    res.status(200).json(employeeObj);
});

exports.uploadProfilePicture = asyncHandler(async (req, res) => {
    console.log('Request employeeId:', req.employeeId);
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const employee = await Employee.findById(req.employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;
        
        employee.profilePicture = profilePicturePath;
        await employee.save();

        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            profilePicture: profilePicturePath
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error uploading profile picture', 
            error: error.message 
        });
    }
});