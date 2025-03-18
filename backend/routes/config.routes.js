import express from 'express';
import { getConfig } from '../controllers/employee/config.controller.js';
import { verifyAdminToken } from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

router.get('/', verifyAdminToken, getConfig);

export default router;