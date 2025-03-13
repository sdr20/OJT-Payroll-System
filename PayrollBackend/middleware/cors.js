const cors = require('cors');

const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'user-role', 'Authorization'],
  credentials: true
};

module.exports = cors(corsOptions);