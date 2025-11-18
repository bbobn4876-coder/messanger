import React, { useState, useEffect } from 'react';
import { Settings, User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import AuthScreen from './AuthScreen';
import SettingsScreen from './SettingsScreen';
import ChatList from './ChatList';
import ChatScreen from './ChatScreen';

const PyrusApp = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
    }
  }, [isAuthenticated]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getUserChats();
      setChats(response.data.chats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    const chatName = prompt('Введите название чата:');
    if (!chatName) return;

    try {
      const response = await chatAPI.createChat({
        name: chatName,
        isGroup: false
      });

      const newChat = response.data.chat;
      setChats([newChat, ...chats]);
      setSelectedChat(newChat);
      setShowMobileMenu(false);
    } catch (error) {
      console.error('Failed to create chat:', error);
      alert('Ошибка при создании чата');
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
        <div className="text-white text-2xl font-bold">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Шапка */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 hover:bg-white/10 rounded-full"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold">Pyrus</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <Settings size={24} />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img
                src={`${API_URL}${user.avatar}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={20} />
            )}
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex overflow-hidden">
        {/* Боковая панель с чатами */}
        <div
          className={`${
            showMobileMenu || !selectedChat ? 'block' : 'hidden'
          } md:block w-full md:w-80 bg-white border-r border-gray-200`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={handleNewChat}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
              >
                + Новый чат
              </button>
            </div>
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">Загрузка чатов...</p>
              </div>
            ) : (
              <ChatList
                chats={chats}
                onSelectChat={(chat) => {
                  setSelectedChat(chat);
                  setShowMobileMenu(false);
                }}
                onNewChat={handleNewChat}
              />
            )}
          </div>
        </div>

        {/* Область чата */}
        <div
          className={`${
            !showMobileMenu && selectedChat ? 'block' : 'hidden'
          } md:block flex-1 bg-white`}
        >
          {selectedChat ? (
            <ChatScreen
              chat={selectedChat}
              onBack={() => setSelectedChat(null)}
              onChatUpdate={loadChats}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Добро пожаловать в Pyrus!</h2>
                <p>Выберите чат или создайте новый</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно настроек */}
      {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default PyrusApp;
