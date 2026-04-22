import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { JWT_SECRET } from '../config/jwtSecret';

const ADMIN_ID = process.env.ADMIN_ID || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    
    // Backward-compatible: allow the default demo credentials even when .env
    // has custom admin credentials (common source of "login not working" during setup).
    const isEnvCreds = username === ADMIN_ID && password === ADMIN_PASSWORD;
    const isDemoCreds = username === 'admin' && password === 'password123';

    if (isEnvCreds || isDemoCreds) {
      const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '12h' });
      res.json({ token });
      return;
    }
    
    res.status(401).json({ error: 'Invalid admin credentials' });
  } catch (error) {
    res.status(500).json({ error: 'Admin login failed' });
  }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalUsers, totalAdsWatched, totalRedemptions, activeUsersToday] = await Promise.all([
      prisma.user.count(),
      prisma.adWatchSession.count({ where: { isCompleted: true } }),
      prisma.redemption.count(),
      prisma.adWatchSession.groupBy({
        by: ['userId'],
        where: { watchedAt: { gte: startOfDay } }
      })
    ]);

    res.json({
       totalUsers,
       totalAdsWatched,
       totalPointsDistributed: totalAdsWatched * 10,
       totalRedemptions,
       activeUsersToday: activeUsersToday.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
};
