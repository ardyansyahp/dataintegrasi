const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/select-role', authController.selectRole);
router.post('/switch-role', verifyToken, authController.switchRole);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
