const sequelize = require('./database');
const { User, Chat, Message, ChatParticipant } = require('../models');

const initializeDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    console.log('Synchronizing models...');
    await sequelize.sync({ force: true }); // ВНИМАНИЕ: force: true удалит все данные!
    console.log('✓ Database models synchronized');

    // Создать тестовых пользователей (опционально)
    console.log('Creating test users...');

    const user1 = await User.create({
      email: 'test1@pyrus.com',
      password: 'password123',
      name: 'Тестовый Пользователь 1'
    });

    const user2 = await User.create({
      email: 'test2@pyrus.com',
      password: 'password123',
      name: 'Тестовый Пользователь 2',
      secretPin: '1234'
    });

    console.log('✓ Test users created');

    // Создать тестовый чат
    const chat = await Chat.create({
      name: 'Общий чат',
      isGroup: true
    });

    await ChatParticipant.create({
      chatId: chat.id,
      userId: user1.id,
      role: 'admin'
    });

    await ChatParticipant.create({
      chatId: chat.id,
      userId: user2.id,
      role: 'member'
    });

    await Message.create({
      chatId: chat.id,
      senderId: user1.id,
      content: 'Привет! Это первое сообщение!',
      type: 'text'
    });

    console.log('✓ Test chat created');
    console.log('\n=== Database initialized successfully ===');
    console.log('Test accounts:');
    console.log('1. Email: test1@pyrus.com, Password: password123');
    console.log('2. Email: test2@pyrus.com, Password: password123, PIN: 1234');

    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
