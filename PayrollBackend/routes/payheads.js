const express = require('express');
const router = express.Router();
const { getPayheads, createPayhead, updatePayhead, deletePayhead } = require('../controllers/payheadController');
const { isAdmin } = require('../middleware/auth');

router.get('/', isAdmin, getPayheads);
router.post('/', isAdmin, createPayhead);
router.put('/:id', isAdmin, updatePayhead);
router.delete('/:id', isAdmin, deletePayhead);

module.exports = router;