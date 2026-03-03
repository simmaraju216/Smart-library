import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import fineRoutes from './routes/fineRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import { startScheduler } from './services/scheduler.js';
import { initDatabase } from './config/initDatabase.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

/* ================================
   PRODUCTION CORS CONFIGURATION
================================ */

const allowedOrigins = [
  "http://localhost:5173", // local development
  process.env.FRONTEND_URL // production frontend (Vercel)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / server requests

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

/* ================================
   HEALTH CHECK
================================ */

app.get('/api/health', (_req, res) => {
  res.json({ message: 'Smart Library API running' });
});

/* ================================
   ROUTES
================================ */

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/branches', branchRoutes);

/* ================================
   404 HANDLER
================================ */

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

/* ================================
   GLOBAL ERROR HANDLER
================================ */

app.use((err, _req, res, _next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

/* ================================
   PROCESS ERROR HANDLERS
================================ */

process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught exception:', error);
});

/* ================================
   START SERVER (WITH DB INIT)
================================ */

const startServer = async () => {
  try {
    await initDatabase(pool);
    console.log("✅ Database initialized");

    app.listen(port, () => {
      console.log(`🚀 Server started on port ${port}`);
      startScheduler();
    });

  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

startServer();