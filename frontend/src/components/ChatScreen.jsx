import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Image, Video, X } from 'lucide-react';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket';
import Message from './Message';

const ChatScreen = ({ chat, onBack, onChatUpdate }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    loadMessages();
    socketService.joinChat(chat.id);

    socketService.on('message:new', handleNewMessage);

    return () => {
      socketService.off('message:new');
      socketService.leaveChat(chat.id);
    };
  }, [chat.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getChatMessages(chat.id);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleNewMessage = (message) => {
    if (message.chatId === chat.id) {
      setMessages(prev => [...prev, message]);
      if (onChatUpdate) {
        onChatUpdate();
      }
    }
  };

  const sendMessage = async (type, content, file) => {
    try {
      setLoading(true);
      const response = await chatAPI.sendMessage(
        chat.id,
        { content, type },
        file
      );

      const newMessage = response.data.message;
      setMessages(prev => [...prev, newMessage]);

      // Отправить через WebSocket
      socketService.sendMessage(chat.id, newMessage);

      if (onChatUpdate) {
        onChatUpdate();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Ошибка при отправке сообщения');
    } finally {
      setLoading(false);
    }
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessage('text', messageText.trim());
      setMessageText('');
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      await sendMessage(type, '', file);
    }
    setShowAttachMenu(false);
  };

  const getChatName = () => {
    if (chat.isGroup) return chat.name;
    const otherParticipant = chat.participants?.find(p => p.id !== user.id);
    return otherParticipant?.name || chat.name;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
          <X size={24} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
          {getChatName()[0]?.toUpperCase()}
        </div>
        <h2 className="font-semibold text-gray-800">{getChatName()}</h2>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map(message => (
          <Message
            key={message.id}
            message={message}
            isOwn={message.senderId === user.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Ввод сообщения */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendText} className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-3 hover:bg-gray-100 rounded-full transition"
              disabled={loading}
            >
              <Paperclip size={20} className="text-gray-600" />
            </button>

            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg w-full text-left"
                >
                  <Image size={18} className="text-purple-600" />
                  <span className="text-sm">Фото</span>
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg w-full text-left"
                >
                  <Video size={18} className="text-pink-600" />
                  <span className="text-sm">Видео</span>
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'image')}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleFileUpload(e, 'video')}
              className="hidden"
            />
          </div>

          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !messageText.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-3 rounded-full hover:opacity-90 transition disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;
