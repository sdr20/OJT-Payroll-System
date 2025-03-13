const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const { Admin } = require('../models/Admin');

function generateAdminToken(adminId) {
    return jwt.sign({ adminId }, process.env.JWT_SECRET, { expiresIn: '1800s' });
}

// Login Admin
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password }); // Debug: Log incoming credentials

    if (!email || !password) {
        console.log('Missing email or password');
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }

    const admin = await Admin.findOne({ email });
    console.log('Admin found:', admin ? admin : 'No admin found'); // Debug: Log admin lookup result
    if (!admin) {
        res.status(401).json({ message: 'Unauthorized - Admin not found' });
        return;
    }

    const isValid = await bcrypt.compare(password, admin.password);
    console.log('Password match:', isValid); // Debug: Log password comparison result
    if (!isValid) {
        res.status(401).json({ message: 'Unauthorized - Invalid password' });
        return;
    }

    const token = generateAdminToken(admin._id);

    res.status(200).json({
        id: admin._id,
        username: admin.username,
        email: admin.email,
        token,
    });
});

// Get Current Admin Profile
const getAdminProfile = async (req, res) => {
    try {
        res.json({
            success: true,
            admin: {
                id: req.admin._id,
                name: req.admin.name,
                username: req.admin.username,
                email: req.admin.email,
                role: req.admin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile',
            error: error.message
        });
    }
};

// Update Admin Profile
const updateAdminProfile = async (req, res) => {
    try {
        const { name, username, email } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (username) updates.username = username;
        if (email) updates.email = email;

        const admin = await Admin.findByIdAndUpdate(
            req.admin._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            admin: {
                id: admin._id,
                name: admin.name,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error updating profile',
            error: error.message
        });
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current and new passwords are required'
            });
        }

        const admin = await Admin.findById(req.admin._id);
        const isMatch = await bcrypt.compare(currentPassword, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        admin.password = newPassword; // Pre-save hook will hash it
        await admin.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error changing password',
            error: error.message
        });
    }
};

module.exports = {
    loginAdmin,
    getAdminProfile,
    updateAdminProfile,
    changePassword
};