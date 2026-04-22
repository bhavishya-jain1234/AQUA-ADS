import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import * as userController from '../controllers/userController';

const router = Router();

router.get('/profile', authMiddleware, userController.getProfile);
router.get('/wallet', authMiddleware, userController.getWallet);
router.get('/ad-status', authMiddleware, userController.getAdStatus);

export default router;
