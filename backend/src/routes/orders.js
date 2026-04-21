import express from 'express';
import { getOrders, getOrderById, createOrder, completeOrder } from '../controllers/orderController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getOrders);
router.post('/', createOrder);
router.get('/:id', getOrderById);
router.patch('/:id/complete', completeOrder);

export default router;
