import express from 'express';
import { createReview, getProductReviews, getHomeReviews } from '../controllers/reviewController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);
router.get('/home', getHomeReviews);

// Protected routes
router.post('/', verifyToken, createReview);

export default router;
