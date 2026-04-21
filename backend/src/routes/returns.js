import express from 'express';
import { createReturn, getMyReturns, getReturnsByOrder, getAllReturnsAdmin, updateReturnStatus } from '../controllers/returnController.js';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User routes (auth required)
router.post('/', verifyToken, createReturn);
router.get('/', verifyToken, getMyReturns);
router.get('/order/:orderId', verifyToken, getReturnsByOrder);

// Admin routes (auth + admin role required)
router.get('/admin/all', verifyToken, requireAdmin, getAllReturnsAdmin);
router.patch('/admin/:id/status', verifyToken, requireAdmin, updateReturnStatus);

export default router;
