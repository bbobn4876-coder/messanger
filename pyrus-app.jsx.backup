import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Video, Settings, LogOut, User, Lock, Mail, Shield, Menu, X, Search, Paperclip } from 'lucide-react';

// Утилита для работы с localStorage
const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }
};

// Компонент экрана входа/регистрации
const AuthScreen = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      // Регистрация
      if (formData.password !== formData.confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }
      if (formData.name.length < 2) {
        setError('Имя слишком короткое');
        return;
      }

      const users = storage.get('pyrus_users') || [];
      if (users.find(u => u.email === formData.email)) {
        setError('Пользователь с таким email уже существует');
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        email: formData.email,
        password: formData.password,
        name: formData.name,
        avatar: null,
        secretPin: null,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      storage.set('pyrus_users', users);
      onAuth(newUser);
    } else {
      // Вход
      const users = storage.get('pyrus_users') || [];
      const user = users.find(u => u.email === formData.email && u.password === formData.password);

      if (!user) {
        setError('Неверный email или пароль');
        return;
      }

      // Проверка секретного PIN
      if (user.secretPin) {
        const pin = prompt('Введите секретный PIN-код:');
        if (pin !== user.secretPin) {
          setError('Неверный PIN-код');
          return;
        }
      }

      onAuth(user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Pyrus</h1>
          <p className="text-gray-600">Современный мессенджер</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ваше имя"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Подтвердите пароль</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ email: '', password: '', name: '', confirmPassword: '' });
            }}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Компонент настроек
const SettingsScreen = ({ user, onUpdateUser, onClose, onLogout }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    secretPin: user.secretPin || ''
  });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const users = storage.get('pyrus_users') || [];
    const userIndex = users.findIndex(u => u.id === user.id);

    if (userIndex === -1) return;

    // Проверка текущего пароля если меняется пароль
    if (formData.newPassword && formData.currentPassword !== user.password) {
      alert('Неверный текущий пароль');
      return;
    }

    // Проверка PIN (только цифры и максимум 6 символов)
    if (formData.secretPin && (!/^\d+$/.test(formData.secretPin) || formData.secretPin.length > 6)) {
      alert('PIN должен содержать только цифры (максимум 6)');
      return;
    }

    const updatedUser = {
      ...users[userIndex],
      name: formData.name,
      email: formData.email,
      password: formData.newPassword || users[userIndex].password,
      avatar: avatarPreview,
      secretPin: formData.secretPin || null
    };

    users[userIndex] = updatedUser;
    storage.set('pyrus_users', users);
    onUpdateUser(updatedUser);
    alert('Настройки сохранены!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold text-gray-800">Настройки</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Аватар */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-white" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 shadow-lg"
              >
                <Image size={20} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Основные данные */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Смена пароля */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-gray-800">Смена пароля</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Текущий пароль</label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Секретный PIN */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-gray-800">Секретный PIN-код</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN (до 6 цифр, необязательно)
              </label>
              <input
                type="text"
                value={formData.secretPin}
                onChange={(e) => setFormData({ ...formData, secretPin: e.target.value })}
                maxLength={6}
                pattern="\d*"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                placeholder="123456"
              />
              <p className="text-sm text-gray-500 mt-2">
                PIN будет запрашиваться при каждом входе
              </p>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90"
            >
              Сохранить изменения
            </button>
            <button
              onClick={onLogout}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 flex items-center gap-2"
            >
              <LogOut size={20} />
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент списка чатов
const ChatList = ({ chats, currentUser, onSelectChat, onNewChat }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <p className="text-center mb-4">Нет чатов</p>
            <button
              onClick={onNewChat}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90"
            >
              Создать чат
            </button>
          </div>
        ) : (
          filteredChats.map(chat => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className="px-4 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                    {chat.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{chat.name}</h3>
                    {lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {lastMessage.type === 'text' ? lastMessage.content : 
                         lastMessage.type === 'image' ? '📷 Фото' : '🎥 Видео'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Компонент сообщения
const Message = ({ message, isOwn }) => {
  const [showMedia, setShowMedia] = useState(false);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' : 'bg-gray-200 text-gray-800'} rounded-2xl px-4 py-2 shadow`}>
        {message.type === 'text' && (
          <p className="break-words">{message.content}</p>
        )}
        
        {message.type === 'image' && (
          <div>
            <img
              src={message.content}
              alt="Shared"
              className="rounded-lg max-w-full cursor-pointer"
              onClick={() => setShowMedia(true)}
            />
            {showMedia && (
              <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setShowMedia(false)}>
                <img src={message.content} alt="Full" className="max-w-full max-h-full" />
              </div>
            )}
          </div>
        )}

        {message.type === 'video' && (
          <div>
            <video
              src={message.content}
              controls
              className="rounded-lg max-w-full"
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}

        <p className={`text-xs mt-1 ${isOwn ? 'text-purple-100' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

// Главный компонент чата
const ChatScreen = ({ chat, currentUser, onUpdateChat, onBack }) => {
  const [messageText, setMessageText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  const sendMessage = (type, content) => {
    const newMessage = {
      id: Date.now().toString(),
      type,
      content,
      senderId: currentUser.id,
      timestamp: new Date().toISOString()
    };

    const updatedChat = {
      ...chat,
      messages: [...chat.messages, newMessage]
    };

    onUpdateChat(updatedChat);
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessage('text', messageText.trim());
      setMessageText('');
    }
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        sendMessage(type, reader.result);
      };
      reader.readAsDataURL(file);
    }
    setShowAttachMenu(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
          <X size={24} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
          {chat.name[0].toUpperCase()}
        </div>
        <h2 className="font-semibold text-gray-800">{chat.name}</h2>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {chat.messages.map(message => (
          <Message
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUser.id}
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
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-3 rounded-full hover:opacity-90 transition"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

// Главное приложение
const PyrusApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    // Загрузка текущего пользователя
    const savedUser = storage.get('pyrus_current_user');
    if (savedUser) {
      setCurrentUser(savedUser);
      loadChats(savedUser.id);
    }
  }, []);

  const loadChats = (userId) => {
    const allChats = storage.get('pyrus_chats') || [];
    const userChats = allChats.filter(chat => chat.participants.includes(userId));
    setChats(userChats);
  };

  const handleAuth = (user) => {
    setCurrentUser(user);
    storage.set('pyrus_current_user', user);
    loadChats(user.id);
  };

  const handleLogout = () => {
    storage.set('pyrus_current_user', null);
    setCurrentUser(null);
    setChats([]);
    setSelectedChat(null);
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    storage.set('pyrus_current_user', updatedUser);
  };

  const handleNewChat = () => {
    const chatName = prompt('Введите название чата:');
    if (!chatName) return;

    const newChat = {
      id: Date.now().toString(),
      name: chatName,
      participants: [currentUser.id],
      messages: [],
      createdAt: new Date().toISOString()
    };

    const allChats = storage.get('pyrus_chats') || [];
    allChats.push(newChat);
    storage.set('pyrus_chats', allChats);
    
    setChats([...chats, newChat]);
    setSelectedChat(newChat);
    setShowMobileMenu(false);
  };

  const handleUpdateChat = (updatedChat) => {
    const allChats = storage.get('pyrus_chats') || [];
    const chatIndex = allChats.findIndex(c => c.id === updatedChat.id);
    
    if (chatIndex !== -1) {
      allChats[chatIndex] = updatedChat;
      storage.set('pyrus_chats', allChats);
      
      setChats(chats.map(c => c.id === updatedChat.id ? updatedChat : c));
      setSelectedChat(updatedChat);
    }
  };

  if (!currentUser) {
    return <AuthScreen onAuth={handleAuth} />;
  }

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
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={20} />
            )}
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex overflow-hidden">
        {/* Боковая панель с чатами */}
        <div className={`${showMobileMenu || !selectedChat ? 'block' : 'hidden'} md:block w-full md:w-80 bg-white border-r border-gray-200`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={handleNewChat}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
              >
                + Новый чат
              </button>
            </div>
            <ChatList
              chats={chats}
              currentUser={currentUser}
              onSelectChat={(chat) => {
                setSelectedChat(chat);
                setShowMobileMenu(false);
              }}
              onNewChat={handleNewChat}
            />
          </div>
        </div>

        {/* Область чата */}
        <div className={`${!showMobileMenu && selectedChat ? 'block' : 'hidden'} md:block flex-1 bg-white`}>
          {selectedChat ? (
            <ChatScreen
              chat={selectedChat}
              currentUser={currentUser}
              onUpdateChat={handleUpdateChat}
              onBack={() => setSelectedChat(null)}
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
      {showSettings && (
        <SettingsScreen
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onClose={() => setShowSettings(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default PyrusApp;
