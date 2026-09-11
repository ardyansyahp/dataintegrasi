const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { verifyToken } = require('../middleware/authMiddleware');

// Route publik/khusus role aktif: My Menus (hierarki sesuai active role)
router.get('/my-menus', verifyToken, menuController.getMyMenus);

// CRUD routes (Memerlukan token login)
router.get('/', verifyToken, menuController.getAllMenus);
router.post('/', verifyToken, menuController.createMenu);
router.put('/:id', verifyToken, menuController.updateMenu);
router.delete('/:id', verifyToken, menuController.deleteMenu);

module.exports = router;
