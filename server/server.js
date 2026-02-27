import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import fineRoutes from './routes/fineRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import { startScheduler } from './services/scheduler.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ message: 'Smart Library API running' });
});


app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/branches', branchRoutes);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  startScheduler();
});