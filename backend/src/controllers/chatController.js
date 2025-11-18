const { Chat, User, Message, ChatParticipant } = require('../models');
const { Op } = require('sequelize');

// Получить все чаты пользователя
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await Chat.findAll({
      include: [
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'name', 'email', 'avatar', 'online'],
          through: { attributes: [] }
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'avatar']
          }]
        }
      ],
      where: {
        '$participants.id$': userId
      },
      order: [['lastMessageAt', 'DESC']]
    });

    res.json({ chats });
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ error: 'Ошибка при получении чатов' });
  }
};

// Создать новый чат
exports.createChat = async (req, res) => {
  try {
    const { name, participantIds, isGroup } = req.body;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({ error: 'Необходимо указать название чата' });
    }

    const chat = await Chat.create({
      name,
      isGroup: isGroup || false
    });

    // Добавить создателя как admin
    await ChatParticipant.create({
      chatId: chat.id,
      userId: userId,
      role: 'admin'
    });

    // Добавить других участников
    if (participantIds && Array.isArray(participantIds)) {
      for (const participantId of participantIds) {
        if (participantId !== userId) {
          await ChatParticipant.create({
            chatId: chat.id,
            userId: participantId,
            role: 'member'
          });
        }
      }
    }

    const fullChat = await Chat.findByPk(chat.id, {
      include: [{
        model: User,
        as: 'participants',
        attributes: ['id', 'name', 'email', 'avatar', 'online'],
        through: { attributes: [] }
      }]
    });

    res.status(201).json({ chat: fullChat });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Ошибка при создании чата' });
  }
};

// Получить сообщения чата
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await Message.findAll({
      where: { chatId },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'avatar']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Ошибка при получении сообщений' });
  }
};

// Отправить сообщение
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, type } = req.body;
    const userId = req.userId;

    let fileUrl = null;
    if (req.file) {
      fileUrl = `/uploads/media/${req.file.filename}`;
    }

    const message = await Message.create({
      chatId,
      senderId: userId,
      content,
      type: type || 'text',
      fileUrl
    });

    // Обновить lastMessageAt для чата
    await Chat.update(
      { lastMessageAt: new Date() },
      { where: { id: chatId } }
    );

    const fullMessage = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'avatar']
      }]
    });

    res.status(201).json({ message: fullMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
};

// Удалить чат
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    // Проверить, является ли пользователь участником чата
    const participant = await ChatParticipant.findOne({
      where: { chatId, userId }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Вы не являетесь участником этого чата' });
    }

    await Chat.destroy({ where: { id: chatId } });

    res.json({ message: 'Чат удален' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Ошибка при удалении чата' });
  }
};
