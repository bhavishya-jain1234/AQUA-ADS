"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = exports.emailLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const jwtSecret_1 = require("../config/jwtSecret");
const emailLogin = async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email || typeof email !== 'string') {
            res.status(400).json({ error: 'Email is required for login.' });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        let user = await prisma_1.default.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            user = await prisma_1.default.user.create({
                data: {
                    email: normalizedEmail,
                    name: name?.trim() || 'AQUA User',
                    phone: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
                },
            });
        }
        const authToken = jsonwebtoken_1.default.sign({ userId: user.id }, jwtSecret_1.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token: authToken, user });
    }
    catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
};
exports.emailLogin = emailLogin;
const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        // In production, verify Google token. For MVP, we use the mock token passed from frontend.
        const mockEmail = `${token}@mock.com`;
        let user = await prisma_1.default.user.findUnique({ where: { email: mockEmail } });
        if (!user) {
            user = await prisma_1.default.user.create({
                data: {
                    email: mockEmail,
                    name: 'Demo Student',
                    phone: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
                }
            });
        }
        const authToken = jsonwebtoken_1.default.sign({ userId: user.id }, jwtSecret_1.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token: authToken, user });
    }
    catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
};
exports.googleAuth = googleAuth;
