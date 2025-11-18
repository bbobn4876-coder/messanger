const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const { uploadMedia } = require('../middleware/upload');

router.get('/', auth, chatController.getUserChats);
router.post('/', auth, chatController.createChat);
router.get('/:chatId/messages', auth, chatController.getChatMessages);
router.post('/:chatId/messages', auth, uploadMedia.single('file'), chatController.sendMessage);
router.delete('/:chatId', auth, chatController.deleteChat);

module.exports = router;
