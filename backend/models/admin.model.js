const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const bcrypt = require('bcrypt'); // Add bcrypt for password hashing

const USERNAME_INVALID_CHARACTERS = ' ?;:,.`\'"(){}[]|\\/';

function usernameValidator(value) {
    for (let i = 0; i < USERNAME_INVALID_CHARACTERS.length; i++) {
        if (value.includes(USERNAME_INVALID_CHARACTERS[i])) {
            return false;
        }
    }
    return true;
}

const adminSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: [4, 'Username must be at least 4 characters long'],
        validate: [usernameValidator, 'Invalid username'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    password: {
        type: String,
        required: true,
        minLength: [8, 'Password must be at least 8 characters long'],
    },
    role: {
        type: String,
        default: 'admin',
    },
    resetToken: { type: String },
    verificationCode: { type: String },
    resetTokenExpires: { type: Date }
});

// Pre-save hook to hash password
adminSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Define the Admin model
const Admin = mongoose.models.Admin || model('Admin', adminSchema);

// Create static admin account
const createStaticAdminAccount = async () => {
    try {
        const staticAdmin = {
            name: 'Administrator',
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123', // Plain text, will be hashed by pre-save hook
            role: 'admin'
        };

        const adminExists = await Admin.findOne({ email: staticAdmin.email });

        if (!adminExists) {
            const newAdmin = new Admin(staticAdmin);
            await newAdmin.save();
            console.log('Static admin account created successfully.');
        } else {
            console.log('Static admin account already exists.');
        }
    } catch (err) {
        console.error('Error creating static admin account:', err);
    }
};

// Run static admin creation when the database connection opens
mongoose.connection.once('open', () => {
    createStaticAdminAccount();
});

module.exports = Admin;