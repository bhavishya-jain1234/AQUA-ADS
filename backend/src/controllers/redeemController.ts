import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import crypto from 'crypto';

export const createRedemption = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    
    // Check balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.pointsBalance < 40) {
      res.status(400).json({ error: 'Insufficient points. 40 points required.' });
      return;
    }
    
    // Deduct and create
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 2);
    
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { pointsBalance: { decrement: 40 } }
      }),
      prisma.redemption.create({
        data: {
          userId,
          pointsSpent: 40,
          redemptionCode: code,
          expiresAt,
          status: 'PENDING',
        }
      })
    ]);

    res.json({
      code,
      expiresAt: expiresAt.toISOString(),
      pointsRemaining: user.pointsBalance - 40
    });
  } catch (error) {
    res.status(500).json({ error: 'Redemption failed' });
  }
};
