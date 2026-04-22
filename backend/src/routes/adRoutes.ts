import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import * as adController from '../controllers/adController';

const router = Router();

router.get('/active', authMiddleware, adController.getActiveAd);
router.post('/start-session', authMiddleware, adController.startSession);
router.post('/complete', authMiddleware, adController.completeSession);

export default router;
