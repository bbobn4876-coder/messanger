const { User } = require('../models');
const { generateToken } = require('../utils/jwt');

// Регистрация
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Проверка существующего пользователя
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Создание пользователя
    const user = await User.create({
      email,
      password,
      name
    });

    const token = generateToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

// Вход
exports.login = async (req, res) => {
  try {
    const { email, password, pin } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Проверка PIN если установлен
    if (user.secretPin) {
      if (!pin) {
        return res.status(403).json({ error: 'Требуется PIN-код', requirePin: true });
      }

      const isPinValid = await user.comparePin(pin);
      if (!isPinValid) {
        return res.status(401).json({ error: 'Неверный PIN-код' });
      }
    }

    // Обновление статуса онлайн
    await user.update({ online: true, lastSeen: new Date() });

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        hasPin: !!user.secretPin
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
};

// Получение текущего пользователя
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password', 'secretPin'] }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
  }
};

// Выход
exports.logout = async (req, res) => {
  try {
    await User.update(
      { online: false, lastSeen: new Date() },
      { where: { id: req.userId } }
    );

    res.json({ message: 'Успешный выход' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Ошибка при выходе' });
  }
};
