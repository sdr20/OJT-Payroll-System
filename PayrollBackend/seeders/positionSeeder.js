const mongoose = require('mongoose');
const Position = require('../models/Position');

async function seedPositions() {
  try {
    if (require.main === module && mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Seeder connected to MongoDB');
    }

    const existingPositions = await Position.countDocuments();
    if (existingPositions > 0) {
      console.log('Positions already seeded');
      return;
    }

    const positions = [
      { name: 'Software Engineer', salary: 50000 },
      { name: 'HR Manager', salary: 60000 },
      { name: 'Developer', salary: 60000 },
      { name: 'Accountant', salary: 45000 },
    ];

    await Position.insertMany(positions);
    console.log('Positions seeded successfully');
  } catch (error) {
    console.error('Error seeding positions:', error);
    throw error;
  } finally {
    if (require.main === module && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Seeder database connection closed');
    }
  }
}

module.exports = seedPositions;

if (require.main === module) {
  seedPositions();
}