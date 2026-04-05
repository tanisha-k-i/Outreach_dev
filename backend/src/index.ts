import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import searchRoutes from './routes/search';
import uploadRoutes from './routes/upload';
import resourceRoutes from './routes/resource';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`🚀 Backend server running on port ${port}`);
});
