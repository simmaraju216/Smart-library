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
const basePort = Number(process.env.PORT) || 5000;

/* =====================================
   PRODUCTION CORS (WORKS WITH VERCEL)
===================================== */

app.use(
  cors({
    origin: true,        // Automatically allow requesting origin
    credentials: true    // Allow cookies / auth headers
  })
);

app.use(express.json());

/* =====================================
   HEALTH CHECK
===================================== */

app.get('/api/health', (_req, res) => {
  res.json({ message: 'Smart Library API running 🚀' });
});

/* =====================================
   ROUTES
===================================== */

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/branches', branchRoutes);

/* =====================================
   404 HANDLER
===================================== */

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/* =====================================
   GLOBAL ERROR HANDLER
===================================== */

app.use((err, _req, res, _next) => {
  console.error('❌ Server Error:', err.message);

  if (['ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND', 'PROTOCOL_CONNECTION_LOST'].includes(err.code)) {
    return res.status(503).json({
      success: false,
      message: 'Database is unavailable. Please check database host/network settings and try again.'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

/* =====================================
   PROCESS ERROR LOGGING
===================================== */

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

/* =====================================
   START SERVER (WITH DB INIT)
===================================== */

const startServer = async () => {
  try {
    await initDatabase(pool);
    console.log('✅ Database initialized successfully');

    const maxPortRetries = 10;
    let currentPort = basePort;
    let serverStarted = false;

    for (let attempt = 0; attempt <= maxPortRetries; attempt += 1) {
      try {
        await new Promise((resolve, reject) => {
          const server = app.listen(currentPort, () => resolve(server));
          server.on('error', reject);
        });

        console.log(`🚀 Server running on port ${currentPort}`);
        startScheduler();
        serverStarted = true;
        break;
      } catch (listenError) {
        if (listenError.code === 'EADDRINUSE') {
          console.warn(`⚠️ Port ${currentPort} is in use, trying ${currentPort + 1}...`);
          currentPort += 1;
          continue;
        }

        throw listenError;
      }
    }

    if (!serverStarted) {
      throw new Error(`Unable to start server. Ports ${basePort}-${basePort + maxPortRetries} are all in use.`);
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

startServer();