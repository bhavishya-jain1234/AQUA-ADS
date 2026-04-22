import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwtSecret';

export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded?.admin) {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }
    (req as any).admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
};

