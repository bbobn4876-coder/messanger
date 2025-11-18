import React, { useState, useRef } from 'react';
import { X, User, Image, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const SettingsScreen = ({ onClose }) => {
  const { user, logout, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    secretPin: ''
  });
  const [avatarPreview, setAvatarPreview] = useState(
    user.avatar ? `${process.env.REACT_APP_API_URL}${user.avatar}` : null
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Обновить профиль
      if (formData.name !== user.name || formData.email !== user.email) {
        const response = await userAPI.updateProfile({
          name: formData.name,
          email: formData.email
        });
        updateUser(response.data.user);
      }

      // Обновить аватар
      if (avatarFile) {
        const response = await userAPI.updateAvatar(avatarFile);
        updateUser({ ...user, avatar: response.data.avatar });
      }

      // Сменить пароль
      if (formData.newPassword && formData.currentPassword) {
        await userAPI.changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
        alert('Пароль успешно изменен');
        setFormData({ ...formData, currentPassword: '', newPassword: '' });
      }

      // Установить PIN
      if (formData.secretPin) {
        await userAPI.setPin(formData.secretPin);
        alert('PIN-код установлен');
      }

      alert('Настройки сохранены!');
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при сохранении настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      await logout();
    }
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
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Секретный PIN */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-gray-800">Секретный PIN-код</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN (4-6 цифр, необязательно)
              </label>
              <input
                type="text"
                value={formData.secretPin}
                onChange={(e) => setFormData({ ...formData, secretPin: e.target.value })}
                maxLength={6}
                pattern="\d*"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                placeholder="123456"
                disabled={loading}
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
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
            <button
              onClick={handleLogout}
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

export default SettingsScreen;
