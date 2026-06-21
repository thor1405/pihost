import express from 'express';
import { registerUser, loginUser, getMe, updateProfile, upgradePlan } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/upgrade', protect, upgradePlan);

export default router;
