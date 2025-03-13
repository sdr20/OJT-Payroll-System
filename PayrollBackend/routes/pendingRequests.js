const express = require('express');
const router = express.Router();
const { 
  getMaxId,
  getPendingRequests,
  createPendingRequest,
  updatePendingRequest,
  approvePendingRequest,
  rejectPendingRequest,
  deletePendingRequest
} = require('../controllers/pendingRequestController');
const { isAdmin } = require('../middleware/auth');

router.get('/max-id', getMaxId);
router.get('/', isAdmin, getPendingRequests);
router.post('/', createPendingRequest);
router.put('/:id', isAdmin, updatePendingRequest);
router.put('/:id/approve', isAdmin, approvePendingRequest);
router.put('/:id/reject', isAdmin, rejectPendingRequest);
router.delete('/:id', isAdmin, deletePendingRequest);

module.exports = router;