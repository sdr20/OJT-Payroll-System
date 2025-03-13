const express = require('express');
const router = express.Router();
const { getPositions, createPosition } = require('../controllers/positionController');
const { isAdmin } = require('../middleware/auth');

router.get('/', getPositions);
router.post('/', isAdmin, createPosition);

module.exports = router;