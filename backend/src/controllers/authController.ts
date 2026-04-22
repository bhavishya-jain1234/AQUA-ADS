import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { JWT_SECRET } from '../config/jwtSecret';

export const emailLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required for login.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name?.trim() || 'AQUA User',
          phone: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        },
      });
    }

    const authToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token: authToken, user });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    // In production, verify Google token. For MVP, we use the mock token passed from frontend.
    const mockEmail = `${token}@mock.com`;

    let user = await prisma.user.findUnique({ where: { email: mockEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: mockEmail,
          name: 'Demo Student',
          phone: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        }
      });
    }

    const authToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token: authToken, user });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};
