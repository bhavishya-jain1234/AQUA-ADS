"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWallet = exports.getAdStatus = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Profile lookup failed' });
    }
};
exports.getProfile = getProfile;
const getAdStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Check how many ads watched today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const count = await prisma_1.default.adWatchSession.count({
            where: {
                userId,
                watchedAt: { gte: startOfDay },
                isCompleted: true,
            },
        });
        const resetAt = new Date();
        resetAt.setHours(23, 59, 59, 999);
        res.json({
            watchedToday: count,
            limit: 10,
            canWatch: count < 10,
            resetAt
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch ad status' });
    }
};
exports.getAdStatus = getAdStatus;
const getWallet = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        // For MVP, we will mock history since we don't track points ledgers explicitly yet
        res.json({
            balance: user?.pointsBalance || 0,
            history: {
                earned: [{ type: 'earned', points: 10, title: 'Ad Watched', date: new Date().toISOString() }],
                spent: []
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Wallet fetch failed' });
    }
};
exports.getWallet = getWallet;
