const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/database');
const routes = require('./routes');
const { verifyToken } = require('./utils/jwt');
const { User } = require('./models');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы (загруженные файлы)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// WebSocket
const onlineUsers = new Map(); // userId -> socketId

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Invalid token'));
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user.id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  // Добавить пользователя в онлайн
  onlineUsers.set(socket.userId, socket.id);

  // Обновить статус пользователя
  User.update(
    { online: true, lastSeen: new Date() },
    { where: { id: socket.userId } }
  );

  // Уведомить всех о новом онлайн пользователе
  io.emit('user:online', { userId: socket.userId });

  // Присоединение к комнатам чатов
  socket.on('chat:join', (chatId) => {
    socket.join(`chat:${chatId}`);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  });

  // Покинуть чат
  socket.on('chat:leave', (chatId) => {
    socket.leave(`chat:${chatId}`);
  });

  // Новое сообщение
  socket.on('message:send', (data) => {
    const { chatId, message } = data;
    // Отправить сообщение всем участникам чата
    io.to(`chat:${chatId}`).emit('message:new', message);
  });

  // Печатает сообщение
  socket.on('typing:start', (data) => {
    const { chatId } = data;
    socket.to(`chat:${chatId}`).emit('typing:start', {
      chatId,
      userId: socket.userId,
      userName: socket.user.name
    });
  });

  socket.on('typing:stop', (data) => {
    const { chatId } = data;
    socket.to(`chat:${chatId}`).emit('typing:stop', {
      chatId,
      userId: socket.userId
    });
  });

  // Отключение
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);

    onlineUsers.delete(socket.userId);

    // Обновить статус пользователя
    User.update(
      { online: false, lastSeen: new Date() },
      { where: { id: socket.userId } }
    );

    // Уведомить всех об оффлайн пользователе
    io.emit('user:offline', { userId: socket.userId });
  });
});

// Инициализация БД и запуск сервера
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Подключение к БД
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Синхронизация моделей
    await sequelize.sync({ alter: true });
    console.log('✓ Database models synchronized');

    // Запуск сервера
    server.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };
