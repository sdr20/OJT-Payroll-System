import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import { Position } from '../models/position.model.js';

dotenv.config();

const positionData = [
    {
        name: 'Software Engineer',
        salary: 65000,
    },
    {
        name: 'Developer',
        salary: 60000,
    },
    {
        name: 'Project Manager',
        salary: 80000,
    },
    {
        name: 'HR Specialist',
        salary: 50000,
    },
    {
        name: 'System Administrator',
        salary: 65000,
    },
];

const seedPositions = async () => {
    try {
        await connectDB();

        const existingPositions = await Position.countDocuments();
        if (existingPositions > 0) {
            await Position.deleteMany({});
            console.log('Existing positions cleared.');
        }

        const positions = await Position.insertMany(positionData);
        console.log('Positions seeded successfully:', positions);

    } catch (error) {
        console.error('Error seeding positions:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);
    }
};

seedPositions();