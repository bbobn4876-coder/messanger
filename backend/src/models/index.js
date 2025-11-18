const User = require('./User');
const Chat = require('./Chat');
const Message = require('./Message');
const ChatParticipant = require('./ChatParticipant');

// Associations

// User-Chat через ChatParticipant (many-to-many)
User.belongsToMany(Chat, { through: ChatParticipant, foreignKey: 'userId', as: 'chats' });
Chat.belongsToMany(User, { through: ChatParticipant, foreignKey: 'chatId', as: 'participants' });

// Message belongs to User and Chat
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

// Chat has many Messages
Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });

// User has many Messages
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });

module.exports = {
  User,
  Chat,
  Message,
  ChatParticipant
};
