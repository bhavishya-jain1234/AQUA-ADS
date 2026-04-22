import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import path from 'path';

export const listAds = async (_req: Request, res: Response): Promise<void> => {
  try {
    const ads = await prisma.ad.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(ads);
  } catch (error) {
    console.error('listAds failed', error);
    res.status(500).json({ error: 'Failed to list ads' });
  }
};

export const createAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, videoUrl, thumbnailUrl, durationSeconds, rewardPoints, isActive } = req.body ?? {};

    if (!title || typeof title !== 'string') {
      res.status(400).json({ error: 'title is required' });
      return;
    }
    if (!videoUrl || typeof videoUrl !== 'string') {
      res.status(400).json({ error: 'videoUrl is required' });
      return;
    }

    const duration = Number(durationSeconds);
    const reward = Number(rewardPoints);
    if (!Number.isFinite(duration) || duration <= 0) {
      res.status(400).json({ error: 'durationSeconds must be a positive number' });
      return;
    }
    if (!Number.isFinite(reward) || reward <= 0) {
      res.status(400).json({ error: 'rewardPoints must be a positive number' });
      return;
    }

    const ad = await prisma.ad.create({
      data: {
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        thumbnailUrl: typeof thumbnailUrl === 'string' ? thumbnailUrl.trim() : null,
        durationSeconds: Math.round(duration),
        rewardPoints: Math.round(reward),
        isActive: Boolean(isActive),
      },
    });

    res.status(201).json(ad);
  } catch (error) {
    console.error('createAd failed', error);
    res.status(500).json({ error: 'Failed to create ad' });
  }
};

export const setActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body ?? {};

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'id is required and must be a string' });
      return;
    }

    const ad = await prisma.ad.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    res.json(ad);
  } catch (error) {
    console.error('setActive failed', error);
    res.status(500).json({ error: 'Failed to update ad status' });
  }
};

export const uploadAdMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({ error: 'file is required' });
      return;
    }

    // Provide a URL that the frontend can render via backend static hosting.
    const urlPath = `/uploads/${encodeURIComponent(file.filename)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const mediaType = ['.mp4', '.webm', '.ogg', '.mov'].includes(ext) ? 'video' : 'image';

    res.status(201).json({
      url: urlPath,
      mediaType,
      originalName: file.originalname,
      size: file.size,
    });
  } catch (error) {
    console.error('uploadAdMedia failed', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

