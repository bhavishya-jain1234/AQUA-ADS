import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/login', authController.emailLogin);
router.post('/google', authController.googleAuth);

export default router;
