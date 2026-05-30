import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import { connectDb } from './config/db.js';
import { initializeRazorpay } from './services/payment.js';

// Load routes
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import aiRoutes from './routes/ai.js';
import paymentsRoutes from './routes/payments.js';
const app = express();
const PORT = process.env.PORT || 7000;

// Enable CORS for frontend Vite dev server (usually localhost:5173)
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests from any localhost port (frontend dev server)
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ⛵ ${req.method} ${req.url}`);
  next();
});

// Register routers
app.use('/api/auth', authRoutes);
app.use('/api/beaches', bookingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Online', service: 'Kerala Coastal Tourism Backend API' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Initialize database & launch server
async function startServer() {
  await connectDb();

  // Initialize Razorpay for UPI payments
  initializeRazorpay(
    process.env.RAZORPAY_KEY_ID,
    process.env.RAZORPAY_KEY_SECRET
  );

  // Try multiple ports
  const portList = [PORT, 5000, 6000, 7000, 8000, 8080, 3000, 4000];
  let portIndex = 0;

  function tryPort(port) {
    const server = app.listen(port, () => {
      console.log(`🚀 Server navigating at http://localhost:${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        portIndex++;
        if (portIndex < portList.length) {
          console.log(`⚠️ Port ${port} in use, trying ${portList[portIndex]}...`);
          tryPort(portList[portIndex]);
        } else {
          console.error('❌ All ports are in use. Please close some applications and try again.');
          process.exit(1);
        }
      } else {
        console.error('❌ Server error:', err.message);
        process.exit(1);
      }
    });
  }

  tryPort(portList[0]);
}

startServer();
