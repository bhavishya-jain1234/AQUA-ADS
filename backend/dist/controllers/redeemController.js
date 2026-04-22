"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedemption = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const crypto_1 = __importDefault(require("crypto"));
const createRedemption = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Check balance
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user || user.pointsBalance < 40) {
            res.status(400).json({ error: 'Insufficient points. 40 points required.' });
            return;
        }
        // Deduct and create
        const code = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 2);
        await prisma_1.default.$transaction([
            prisma_1.default.user.update({
                where: { id: userId },
                data: { pointsBalance: { decrement: 40 } }
            }),
            prisma_1.default.redemption.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Redemption failed' });
    }
};
exports.createRedemption = createRedemption;
