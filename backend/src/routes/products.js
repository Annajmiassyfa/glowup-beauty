import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getProducts);

// Admin only routes
router.post('/', verifyToken, requireAdmin, upload.single('image'), createProduct);
router.put('/:id', verifyToken, requireAdmin, upload.single('image'), updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

export default router;
