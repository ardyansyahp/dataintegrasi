const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, userController.getUsers);
router.post('/', verifyToken, userController.createUser);
router.put('/:id/roles', verifyToken, userController.updateUserRoles);

module.exports = router;
