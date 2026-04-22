import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { adminAuthMiddleware } from '../middlewares/adminAuthMiddleware';

const router = Router();

router.post('/login', adminController.login);
router.get('/stats', adminAuthMiddleware, adminController.getStats);

export default router;
