const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Admin } = require('../models/Admin');

async function seedAdminIfNeeded() {
  try {
    if (require.main === module && mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Seeder connected to MongoDB');
    }

    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('Admin12345', saltRounds);

    if (existingAdmin) {
      // Update existing admin's password and username
      await Admin.updateOne(
        { email: 'admin@example.com' },
        {
          $set: {
            username: 'superadmin', // Fix the username
            password: hashedPassword, // Update to match Admin12345
            name: 'Super Admin',
            role: 'admin',
          },
        }
      );
      console.log('Existing admin updated with correct credentials');
      console.log('Username: superadmin');
      console.log('Email: admin@example.com');
      console.log('Password: Admin12345');
      return;
    }

    // Create new admin if none exists
    const adminData = {
      name: 'Super Admin',
      username: 'superadmin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log('Admin user created successfully');
    console.log('Username: superadmin');
    console.log('Email: admin@example.com');
    console.log('Password: Admin12345');
  } catch (error) {
    console.error('Error seeding admin:', error);
    throw error;
  } finally {
    if (require.main === module && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Seeder database connection closed');
    }
  }
}

module.exports = seedAdminIfNeeded;

if (require.main === module) {
  seedAdminIfNeeded();
}