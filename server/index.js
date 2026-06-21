import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import storageRoutes from './src/routes/storageRoutes.js';
import Project from './src/models/Project.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/storage', storageRoutes);

// Serve standalone storage files
app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

// Static Site Hosting Middleware (Simulation for local dev)
app.use((req, res, next) => {
  const host = req.hostname;
  // If accessing a subdomain like sub.pihost.app or sub.localhost
  const parts = host.split('.');
  if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost' && parts[0] !== '127') {
    const subdomain = parts[0];
    const publicPath = path.join(process.cwd(), 'public_sites', subdomain);
    
    if (fs.existsSync(publicPath)) {
      res.on('finish', async () => {
        const contentLength = res.get('Content-Length');
        if (contentLength) {
          try {
            await Project.findOneAndUpdate(
              { subdomain },
              { $inc: { bandwidthUsed: parseInt(contentLength, 10) } }
            );
          } catch (e) {
            console.error('Bandwidth tracking error:', e);
          }
        }
      });
      return express.static(publicPath)(req, res, next);
    }
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'PiHost API is running' });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// Connect DB and Start Server
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
