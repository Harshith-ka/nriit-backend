import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import { aiRouter } from './routes/ai';
import { matchRouter } from './routes/matches';
import { userRouter } from './routes/users';
import { projectRouter } from './routes/projects';
import { moderationRouter } from './routes/moderation';

import { Server } from 'socket.io';


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// Main OpenAI intelligent matching backend router endpoint
app.use('/ai', aiRouter);
app.use('/matches', matchRouter);
app.use('/users', userRouter);
app.use('/projects', projectRouter);
app.use('/moderation', moderationRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: 'firebase-admin' });
});

// Socket.io Real-time Messaging & Events
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  socket.on('join-chat', (matchId) => {
    socket.join(matchId);
    console.log(`Socket ${socket.id} joined room ${matchId}`);
  });

  socket.on('send-message', (data) => {
    // Broadcast message to others in the room
    socket.to(data.matchId).emit('receive-message', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.matchId).emit('user-typing', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`OpenAI Microservice running securely on port ${PORT}`);
});
