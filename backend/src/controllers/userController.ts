import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { adWatchSessions: true }
        }
      }
    });
    
    if (!user) {
       res.status(404).json({ error: 'User not found' });
       return;
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Profile lookup failed' });
  }
};

export const getAdStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;

    const limit = 5;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Rolling 24h limit (counts sessions started, not just completed).
    const sessions = await prisma.adWatchSession.findMany({
      where: { userId, watchedAt: { gte: since } },
      orderBy: { watchedAt: 'asc' },
      select: { watchedAt: true },
    });

    const count = sessions.length;
    const canWatch = count < limit;

    // When the window will open up again (24h after the oldest session in the window).
    const resetAt = count === 0 ? new Date() : new Date(new Date(sessions[0].watchedAt).getTime() + 24 * 60 * 60 * 1000);

    res.json({
      watchedToday: count,
      limit,
      canWatch,
      resetAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ad status' });
  }
};

export const getWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId }});
    
    // For MVP, we will mock history since we don't track points ledgers explicitly yet
    res.json({
      balance: user?.pointsBalance || 0,
      history: {
        earned: [{ type: 'earned', points: 10, title: 'Ad Watched', date: new Date().toISOString() }],
        spent: []
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Wallet fetch failed' });
  }
};
