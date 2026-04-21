import express from 'express';
import { getDashboardStats, getAllOrders, updateOrderStatus } from '../controllers/adminController.js';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes here are protected and require Admin role
router.use(verifyToken, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.patch('/orders/:id', updateOrderStatus);

export default router;
