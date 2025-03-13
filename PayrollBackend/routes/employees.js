const express = require('express');
const router = express.Router();
const { 
  loginEmployee, 
  getEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} = require('../controllers/employeeController');
const { isAdmin } = require('../middleware/auth');

router.post('/login', loginEmployee);
router.get('/', isAdmin, getEmployees);
router.post('/', isAdmin, createEmployee);
router.put('/:id', isAdmin, updateEmployee);
router.delete('/:id', isAdmin, deleteEmployee);

module.exports = router;