import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import crypto from 'crypto';

export const getActiveAd = async (req: Request, res: Response): Promise<void> => {
  try {
    // Randomly select one active ad from DB.
    const ads = await prisma.ad.findMany({ where: { isActive: true } });
    
    if (ads.length > 0) {
      res.json(ads[Math.floor(Math.random() * ads.length)]);
    } else {
      res.status(404).json({ error: 'No active ads available' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to find ad' });
  }
};

export const startSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const sessionToken = crypto.randomUUID();
    const { adId } = req.body ?? {};

    if (!adId || typeof adId !== 'string') {
      res.status(400).json({ error: 'adId is required' });
      return;
    }

    // Enforce rolling 24h limit: max 5 sessions per profile per 24 hours.
    const limit = 5;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSessions = await prisma.adWatchSession.findMany({
      where: { userId, watchedAt: { gte: since } },
      orderBy: { watchedAt: 'asc' },
      select: { watchedAt: true },
    });
    if (recentSessions.length >= limit) {
      const resetAt = new Date(new Date(recentSessions[0].watchedAt).getTime() + 24 * 60 * 60 * 1000);
      res.status(429).json({
        error: 'Your limit is Exceeded now you can watch ads after 24 hours',
        resetAt,
        limit,
      });
      return;
    }

    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad || !ad.isActive) {
      res.status(404).json({ error: 'Ad not found or inactive' });
      return;
    }
    
    await prisma.adWatchSession.create({
      data: {
        userId,
        adId,
        sessionToken,
      }
    });
    
    res.json({ sessionToken });
  } catch (error) {
    res.status(500).json({ error: 'Could not create session' });
  }
};

export const completeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionToken } = req.body;
    const userId = (req as any).user.userId;
    
    const session = await prisma.adWatchSession.findFirst({
      where: { sessionToken, userId, isCompleted: false },
      include: { ad: true },
    });
    
    if (!session) {
      res.status(400).json({ error: 'Invalid or expired session' });
      return;
    }
    
    const points = session.ad.rewardPoints;

    // Complete session, increment views, and add points.
    await prisma.$transaction([
      prisma.adWatchSession.update({
        where: { id: session.id },
        data: { isCompleted: true, pointsAwarded: points }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { pointsBalance: { increment: points } }
      }),
      prisma.ad.update({
        where: { id: session.adId },
        data: { viewsCount: { increment: 1 } }
      }),
    ]);

    res.json({ success: true, pointsAwarded: points });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify compilation' });
  }
};
