const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
const { 
    loginAdmin, 
    getAdminProfile, 
    updateAdminProfile, 
    changePassword 
} = require('../controllers/adminController');

// Public route
router.post('/login', loginAdmin);

// Protected routes
router.get('/profile', adminAuth, getAdminProfile);
router.put('/profile', adminAuth, updateAdminProfile);
router.put('/password', adminAuth, changePassword);

module.exports = router;