import React, { useState } from 'react';

const Message = ({ message, isOwn }) => {
  const [showMedia, setShowMedia] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' : 'bg-gray-200 text-gray-800'} rounded-2xl px-4 py-2 shadow`}>
        {!isOwn && message.sender && (
          <p className="text-xs font-semibold mb-1 opacity-70">{message.sender.name}</p>
        )}

        {message.type === 'text' && (
          <p className="break-words">{message.content}</p>
        )}

        {message.type === 'image' && (
          <div>
            <img
              src={getMediaUrl(message.fileUrl)}
              alt="Shared"
              className="rounded-lg max-w-full cursor-pointer"
              onClick={() => setShowMedia(true)}
              loading="lazy"
            />
            {showMedia && (
              <div
                className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                onClick={() => setShowMedia(false)}
              >
                <img
                  src={getMediaUrl(message.fileUrl)}
                  alt="Full"
                  className="max-w-full max-h-full"
                />
              </div>
            )}
          </div>
        )}

        {message.type === 'video' && (
          <div>
            <video
              src={getMediaUrl(message.fileUrl)}
              controls
              className="rounded-lg max-w-full"
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}

        <p className={`text-xs mt-1 ${isOwn ? 'text-purple-100' : 'text-gray-500'}`}>
          {new Date(message.createdAt || message.timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

export default Message;
