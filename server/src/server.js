import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';

import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { setupSocketServer } from './sockets/chatSocket.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { User } from './models/User.js';
import { seedDatabase } from './seed.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import markRoutes from './routes/markRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (ENV.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'Student Group Management API'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);

// Socket Setup
setupSocketServer(io);

// 404 & Error Handling
app.use(notFound);
app.use(errorHandler);

// Start server and initialize DB
const PORT = ENV.PORT;

const startServer = async () => {
  try {
    await connectDB();

    // Check if database needs initial seeding
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('⚡ No admin account detected. Running automatic initial database seeding...');
      await seedDatabase();
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running in ${ENV.NODE_ENV} mode on port ${PORT}`);
      console.log(`📡 API Base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export { app, server, io };
