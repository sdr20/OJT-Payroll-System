const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const { getAttendance, updateAttendance } = require('../controllers/attendanceController');

router.get('/', isAdmin, getAttendance);
router.put('/:id', isAdmin, updateAttendance);

module.exports = router;