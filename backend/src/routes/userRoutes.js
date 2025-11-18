const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.put('/profile', auth, userController.updateProfile);
router.post('/avatar', auth, uploadAvatar.single('avatar'), userController.updateAvatar);
router.put('/password', auth, userController.changePassword);
router.put('/pin', auth, userController.setPin);
router.get('/search', auth, userController.searchUsers);

module.exports = router;
