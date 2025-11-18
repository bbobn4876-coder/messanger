const { User } = require('../models');
const path = require('path');

// Обновление профиля
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверка email на уникальность (если меняется)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email уже используется' });
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
};

// Обновление аватара
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await user.update({ avatar: avatarUrl });

    res.json({ avatar: avatarUrl });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении аватара' });
  }
};

// Смена пароля
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Необходимо указать текущий и новый пароль' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    await user.update({ password: newPassword });

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Ошибка при смене пароля' });
  }
};

// Установка/изменение PIN-кода
exports.setPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const userId = req.userId;

    if (pin && (!/^\d{4,6}$/.test(pin))) {
      return res.status(400).json({ error: 'PIN должен содержать 4-6 цифр' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    await user.update({ secretPin: pin || null });

    res.json({ message: pin ? 'PIN-код установлен' : 'PIN-код удален' });
  } catch (error) {
    console.error('Set PIN error:', error);
    res.status(500).json({ error: 'Ошибка при установке PIN-кода' });
  }
};

// Поиск пользователей
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ users: [] });
    }

    const users = await User.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { name: { [require('sequelize').Op.iLike]: `%${query}%` } },
          { email: { [require('sequelize').Op.iLike]: `%${query}%` } }
        ]
      },
      attributes: ['id', 'name', 'email', 'avatar', 'online', 'lastSeen'],
      limit: 20
    });

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Ошибка при поиске пользователей' });
  }
};
