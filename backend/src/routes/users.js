import express from 'express';
import { updateProfile, updateAvatar, activateMembership } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes in this namespace
router.use(verifyToken);

router.put('/me', updateProfile);
router.put('/me/avatar', upload.single('avatar'), updateAvatar);
router.post('/me/membership', activateMembership);

export default router;
