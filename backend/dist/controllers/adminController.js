"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const jwtSecret_1 = require("../config/jwtSecret");
const ADMIN_ID = process.env.ADMIN_ID || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (username === ADMIN_ID && password === ADMIN_PASSWORD) {
            const token = jsonwebtoken_1.default.sign({ admin: true }, jwtSecret_1.JWT_SECRET, { expiresIn: '12h' });
            res.json({ token });
            return;
        }
        res.status(401).json({ error: 'Invalid admin credentials' });
    }
    catch (error) {
        res.status(500).json({ error: 'Admin login failed' });
    }
};
exports.login = login;
const getStats = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const [totalUsers, totalAdsWatched, totalRedemptions, activeUsersToday] = await Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.adWatchSession.count({ where: { isCompleted: true } }),
            prisma_1.default.redemption.count(),
            prisma_1.default.adWatchSession.groupBy({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate metrics' });
    }
};
exports.getStats = getStats;
