"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeSession = exports.startSession = exports.getActiveAd = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const crypto_1 = __importDefault(require("crypto"));
const getActiveAd = async (req, res) => {
    try {
        // For MVP, randomly select one active ad from db or return a mock record
        const ads = await prisma_1.default.ad.findMany({ where: { isActive: true } });
        if (ads.length > 0) {
            res.json(ads[Math.floor(Math.random() * ads.length)]);
        }
        else {
            res.json({
                id: 'mock-ad',
                title: 'Water Safety Sponsor',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                durationSeconds: 15
            });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to find ad' });
    }
};
exports.getActiveAd = getActiveAd;
const startSession = async (req, res) => {
    try {
        const userId = req.user.userId;
        const sessionToken = crypto_1.default.randomUUID();
        await prisma_1.default.adWatchSession.create({
            data: {
                userId,
                adId: req.body.adId || 'mock-ad',
                sessionToken,
            }
        });
        res.json({ sessionToken });
    }
    catch (error) {
        res.status(500).json({ error: 'Could not create session' });
    }
};
exports.startSession = startSession;
const completeSession = async (req, res) => {
    try {
        const { sessionToken } = req.body;
        const userId = req.user.userId;
        const session = await prisma_1.default.adWatchSession.findFirst({
            where: { sessionToken, userId, isCompleted: false }
        });
        if (!session) {
            res.status(400).json({ error: 'Invalid or expired session' });
            return;
        }
        // Complete session and add points (10 points per MVP Ad watch)
        await prisma_1.default.$transaction([
            prisma_1.default.adWatchSession.update({
                where: { id: session.id },
                data: { isCompleted: true }
            }),
            prisma_1.default.user.update({
                where: { id: userId },
                data: { pointsBalance: { increment: 10 } }
            })
        ]);
        res.json({ success: true, pointsAwarded: 10 });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to verify compilation' });
    }
};
exports.completeSession = completeSession;
