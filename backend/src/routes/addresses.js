import express from 'express';
import { getAddresses, createAddress, updateAddress, deleteAddress, setPrimaryAddress } from '../controllers/addressController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All address routes require authentication
router.use(verifyToken);

router.get('/', getAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.put('/:id/primary', setPrimaryAddress);

export default router;
