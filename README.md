# Pyrus - Современный мессенджер

Полноценное приложение для обмена сообщениями с поддержкой текстовых сообщений, фото и видео.

## Возможности

- ✅ Регистрация и авторизация пользователей
- ✅ Секретный PIN-код (4-6 цифр) для дополнительной защиты
- ✅ Профили пользователей с аватаркой
- ✅ Настройки профиля (смена имени, email, пароля)
- ✅ Создание и управление чатами
- ✅ Отправка текстовых сообщений
- ✅ Отправка фото и видео
- ✅ Встроенный медиа-плеер для просмотра фото и видео
- ✅ Real-time обмен сообщениями через WebSocket
- ✅ Адаптивный минималистичный дизайн
- ✅ Сохранение переписок и файлов

## Технологический стек

### Backend
- Node.js + Express.js
- PostgreSQL (База данных)
- Sequelize ORM
- Socket.io (WebSocket)
- JWT (Аутентификация)
- Multer (Загрузка файлов)
- Bcrypt (Хеширование паролей)

### Frontend
- React 18
- Tailwind CSS
- Axios (HTTP клиент)
- Socket.io-client
- Lucide React (Иконки)

## Требования

- Node.js 16+
- PostgreSQL 12+
- npm или yarn

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd messanger
```

### 2. Настройка Backend

```bash
cd backend
npm install
```

Создайте PostgreSQL базу данных:

```sql
CREATE DATABASE pyrus_db;
```

Настройте `.env` файл (уже создан, измените если нужно):

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=pyrus_db
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=pyrus_secret_key_change_in_production_2024

MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

CORS_ORIGIN=http://localhost:3000
```

Инициализируйте базу данных (опционально - создаст тестовых пользователей):

```bash
npm run init-db
```

Запустите backend сервер:

```bash
npm run dev
```

Backend будет доступен на `http://localhost:5000`

### 3. Настройка Frontend

Откройте новый терминал:

```bash
cd frontend
npm install
```

Настройте `.env` файл (уже создан):

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=http://localhost:5000
```

Запустите frontend:

```bash
npm start
```

Frontend откроется автоматически на `http://localhost:3000`

## Тестовые аккаунты

После запуска `npm run init-db` будут созданы тестовые аккаунты:

1. **Email:** test1@pyrus.com
   **Password:** password123

2. **Email:** test2@pyrus.com
   **Password:** password123
   **PIN:** 1234

## Использование

### Регистрация
1. Откройте приложение
2. Нажмите "Нет аккаунта? Зарегистрируйтесь"
3. Заполните форму регистрации
4. После регистрации вы автоматически войдете в систему

### Вход
1. Введите email и пароль
2. Если у вас установлен PIN-код, введите его
3. Нажмите "Войти"

### Создание чата
1. Нажмите кнопку "+ Новый чат"
2. Введите название чата
3. Начните общение!

### Отправка сообщений
- **Текст:** Введите сообщение и нажмите Enter или кнопку отправки
- **Фото:** Нажмите на скрепку и выберите "Фото"
- **Видео:** Нажмите на скрепку и выберите "Видео"

### Настройки профиля
1. Нажмите на иконку настроек (⚙️)
2. Измените аватарку, имя, email
3. Смените пароль (введите текущий и новый)
4. Установите или измените PIN-код
5. Нажмите "Сохранить изменения"

## Структура проекта

```
messanger/
├── backend/
│   ├── src/
│   │   ├── config/         # Конфигурация (БД)
│   │   ├── controllers/    # Контроллеры
│   │   ├── middleware/     # Middleware (auth, upload)
│   │   ├── models/         # Модели Sequelize
│   │   ├── routes/         # API маршруты
│   │   ├── utils/          # Утилиты (JWT)
│   │   └── server.js       # Главный файл сервера
│   ├── uploads/            # Загруженные файлы
│   ├── .env                # Переменные окружения
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── context/        # Context API (Auth)
│   │   ├── services/       # API и Socket сервисы
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получить текущего пользователя
- `POST /api/auth/logout` - Выход

### Users
- `PUT /api/users/profile` - Обновить профиль
- `POST /api/users/avatar` - Загрузить аватар
- `PUT /api/users/password` - Сменить пароль
- `PUT /api/users/pin` - Установить/изменить PIN
- `GET /api/users/search` - Поиск пользователей

### Chats
- `GET /api/chats` - Получить все чаты пользователя
- `POST /api/chats` - Создать новый чат
- `GET /api/chats/:chatId/messages` - Получить сообщения чата
- `POST /api/chats/:chatId/messages` - Отправить сообщение
- `DELETE /api/chats/:chatId` - Удалить чат

## WebSocket Events

### Client -> Server
- `chat:join` - Присоединиться к чату
- `chat:leave` - Покинуть чат
- `message:send` - Отправить сообщение
- `typing:start` - Начал печатать
- `typing:stop` - Перестал печатать

### Server -> Client
- `message:new` - Новое сообщение
- `user:online` - Пользователь онлайн
- `user:offline` - Пользователь оффлайн
- `typing:start` - Кто-то печатает
- `typing:stop` - Перестал печатать

## Production Deployment

### Backend
1. Установите переменные окружения для production
2. Измените `JWT_SECRET` на безопасный ключ
3. Настройте PostgreSQL
4. Запустите: `npm start`

### Frontend
1. Измените `.env` на production URL
2. Соберите: `npm run build`
3. Разместите содержимое `build/` на вашем хостинге

## Безопасность

- Пароли хешируются с помощью bcrypt
- JWT токены для аутентификации
- PIN-коды хешируются
- CORS настроен
- Валидация всех входных данных
- Безопасная загрузка файлов

## Лицензия

MIT

## Автор

Создано с помощью Claude Code

## Поддержка

Для вопросов и предложений создайте issue в репозитории.
