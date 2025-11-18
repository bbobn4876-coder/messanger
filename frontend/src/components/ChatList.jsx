import React, { useState } from 'react';
import { Search } from 'lucide-react';

const ChatList = ({ chats, onSelectChat, onNewChat }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return null;
    const lastMsg = chat.messages[0];

    if (lastMsg.type === 'text') return lastMsg.content;
    if (lastMsg.type === 'image') return '📷 Фото';
    if (lastMsg.type === 'video') return '🎥 Видео';
    return '';
  };

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
            const lastMessage = getLastMessage(chat);
            const chatName = chat.isGroup ? chat.name : chat.participants?.find(p => p.id !== chat.userId)?.name || chat.name;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className="px-4 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {chatName[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{chatName}</h3>
                    {lastMessage && (
                      <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
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

export default ChatList;
