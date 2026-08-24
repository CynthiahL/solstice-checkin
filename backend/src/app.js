import express from 'express';
import http from 'http';
import cors from 'cors'; // Injected core module dependency
import { Server } from 'socket.io';
import { serve } from 'inngest/express';
import dotenv from 'dotenv';

// Relative route structural configurations 
import checkinRoutes from './routes/checkinRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { inngest } from './inngest/client.js';
import { processPrintRequest } from './inngest/functions/process-print-request.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Mounted CORS middleware//
app.use(cors({ 
  origin: 'https://solstice-checkin-frontend.vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-solstice-signature'],
  credentials: true 
})); 

app.use(express.json());

const io = new Server(server, { 
  cors: { 
    origin: 'https://solstice-checkin-frontend.vercel.app', 
    methods: ["GET", "POST"] 
  }
});

// Mounted API endpoint clusters
app.use('/api/checkin', checkinRoutes);
app.use('/api/webhooks', webhookRoutes);

// Fallback visual landing page
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ONLINE', app: 'Solstice Kiosk Async Engine' });
});

// Mounted Inngest Async Background Framework Context
app.use('/api/inngest', serve({ 
  client: inngest, 
  functions: [processPrintRequest] 
}));

// Global Error Interceptor Pipeline
app.use(errorHandler);

const activeKiosks = new Map();

io.on('connection', (socket) => {
  socket.on('register_kiosk', (attendeeId) => activeKiosks.set(attendeeId, socket.id));
  socket.on('disconnect', () => {
    for (const [key, value] of activeKiosks.entries()) {
      if (value === socket.id) activeKiosks.delete(key);
    }
  });
});

export const emitToKiosk = (attendeeId, payload) => {
  const socketId = activeKiosks.get(attendeeId);
  if (socketId) {
    io.to(socketId).emit('status_updated', payload);
    activeKiosks.delete(attendeeId);
  }
};

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 Solstice Backend Engine online at: http://localhost:${PORT}`);
    console.log(`⚙️  Inngest endpoint active at: http://localhost:${PORT}/api/inngest`);
  });
}

export { app, server };
