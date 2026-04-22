import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adRoutes from './routes/adRoutes';
import redeemRoutes from './routes/redeemRoutes';
import adminRoutes from './routes/adminRoutes';
import adminAdRoutes from './routes/adminAdRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded ad media
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/redeem', redeemRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/ads', adminAdRoutes);

app.get('/', (req, res) => {
  res.send('AQUA_ADS Backend API is running. Use /api/* routes or open the frontend at http://localhost:5173');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'AQUA_ADS Backend Running' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
