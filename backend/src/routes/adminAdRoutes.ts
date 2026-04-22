import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { adminAuthMiddleware } from '../middlewares/adminAuthMiddleware';
import * as adminAdController from '../controllers/adminAdController';

const router = Router();

// Keep uploads at backend/uploads (same folder served by src/index.ts).
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-z0-9-_]+/gi, '_')
      .slice(0, 80);
    const ext = path.extname(file.originalname) || '.bin';
    const unique = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    cb(null, `${safeBase}_${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

router.get('/', adminAuthMiddleware, adminAdController.listAds);
router.post('/', adminAuthMiddleware, adminAdController.createAd);
router.patch('/:id/active', adminAuthMiddleware, adminAdController.setActive);
router.post('/upload', adminAuthMiddleware, upload.single('file'), adminAdController.uploadAdMedia);

export default router;

