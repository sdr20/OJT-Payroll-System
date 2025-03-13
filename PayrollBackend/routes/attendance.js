const express = require('express');
const router = express.Router();
const { getAttendance, updateAttendance } = require('../controllers/attendanceController');
const { isAdmin } = require('../middleware/auth');

router.get('/', isAdmin, getAttendance);
router.put('/:id', isAdmin, updateAttendance);

module.exports = router;