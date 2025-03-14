import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import connectDB from '../config/database.js';
import { Employee } from '../models/employee.model.js';
import { Position } from '../models/position.model.js';

dotenv.config();

function generateEmpNo() {
    const randomNum = Math.floor(1000000 + Math.random() * 9000000);
    return `EMP-${randomNum}`;
}

const employeeData = {
    id: 1,
    empNo: null,
    firstName: 'John',
    middleName: '',
    lastName: 'Doe',
    username: 'john123',
    email: 'john@example.com',
    password: 'securePassword123',
    position: null,
    salary: 60000,
    role: 'employee',
    contactInfo: '123-456-7890',
};

const seedEmployee = async () => {
    try {
        await connectDB();

        let position = await Position.findOne({ name: 'Software Engineer' });
        if (!position) {
            position = await new Position({
                name: 'Software Engineer',
                salary: 60000,
            }).save();
            console.log('Position created:', position);
        }

        let empNo;
        let isUnique = false;
        do {
            empNo = generateEmpNo();
            const existingEmployee = await Employee.findOne({ empNo });
            isUnique = !existingEmployee;
        } while (!isUnique);

        const existingEmployeeByEmail = await Employee.findOne({ email: employeeData.email });
        if (existingEmployeeByEmail) {
            console.log('Employee already exists. Skipping seeding.');
            return;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(employeeData.password, saltRounds);

        const employee = new Employee({
            id: employeeData.id,
            empNo: empNo,
            firstName: employeeData.firstName,
            middleName: employeeData.middleName,
            lastName: employeeData.lastName,
            username: employeeData.username,
            email: employeeData.email,
            password: hashedPassword,
            position: position._id,
            salary: employeeData.salary,
            role: employeeData.role,
            contactInfo: employeeData.contactInfo,
        });

        await employee.save();
        console.log('Employee seeded successfully:', employee);

    } catch (error) {
        console.error('Error seeding employee:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);
    }
};

seedEmployee();