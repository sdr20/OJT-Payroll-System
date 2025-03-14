import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import connectDB from '../config/database.js';
import { Admin } from '../models/admin.model.js';

dotenv.config();

const adminData = {
    name: 'Admin User',
    username: 'admin123',
    email: 'admin@example.com',
    password: 'AdminPassword123',
    role: 'admin',
};

const seedAdmin = async () => {
    try {
        await connectDB();

        const existingAdmin = await Admin.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Admin already exists. Skipping seeding.');
            return;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

        const admin = new Admin({
            name: adminData.name,
            username: adminData.username,
            email: adminData.email,
            password: hashedPassword,
            role: adminData.role,
        });

        await admin.save();
        console.log('Admin seeded successfully:', admin);

    } catch (error) {
        console.error('Error seeding admin:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);
    }
};

seedAdmin();