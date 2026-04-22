import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import * as redeemController from '../controllers/redeemController';

const router = Router();

router.post('/', authMiddleware, redeemController.createRedemption);

export default router;
