const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

async function seedAdminIfNeeded() {
  try {
    const existingAdmin = await Employee.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      const admin = new Employee({
        id: 1,
        empNo: "ADMIN001",
        firstName: "Admin",
        lastName: "User",
        position: "Manager",
        salary: 50000,
        hourlyRate: 284.0909090909091,
        email: "admin@example.com",
        contactInfo: "09123456789",
        username: "admin",
        password: hashedPassword,
        role: "admin"
      });
      await admin.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

module.exports = seedAdminIfNeeded;