import { io } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Восстановить слушателей после переподключения
    this.socket.on('connect', () => {
      this.listeners.forEach((callback, event) => {
        this.socket.on(event, callback);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      this.listeners.set(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  joinChat(chatId) {
    this.emit('chat:join', chatId);
  }

  leaveChat(chatId) {
    this.emit('chat:leave', chatId);
  }

  sendMessage(chatId, message) {
    this.emit('message:send', { chatId, message });
  }

  startTyping(chatId) {
    this.emit('typing:start', { chatId });
  }

  stopTyping(chatId) {
    this.emit('typing:stop', { chatId });
  }
}

export default new SocketService();
