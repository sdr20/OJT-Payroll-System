const Position = require('../models/Position');

const seedPositions = async () => {
  const positions = [
    { name: 'Software Engineer', salary: 50000 },
    { name: 'HR Manager', salary: 60000 },
    { name: 'Developer', salary: 60000 },
    { name: 'Accountant', salary: 45000 },
  ];

  try {
    await Position.deleteMany();
    await Position.insertMany(positions);
    console.log('Positions seeded successfully');
  } catch (error) {
    console.error('Error seeding positions:', error);
  }
};

module.exports = seedPositions;