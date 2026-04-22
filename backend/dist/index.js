"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adRoutes_1 = __importDefault(require("./routes/adRoutes"));
const redeemRoutes_1 = __importDefault(require("./routes/redeemRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', authRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
app.use('/api/ads', adRoutes_1.default);
app.use('/api/redeem', redeemRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.get('/', (req, res) => {
    res.send('AQUA_ADS Backend API is running. Use /api/* routes or open the frontend at http://localhost:5173');
});
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'AQUA_ADS Backend Running' });
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
