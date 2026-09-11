const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, roleController.getRoles);
router.get('/:id/menus', verifyToken, roleController.getRoleMenus);
router.put('/:id/menus', verifyToken, roleController.assignRoleMenus);
router.post('/', verifyToken, roleController.createRole);
router.put('/:id', verifyToken, roleController.updateRole);
router.delete('/:id', verifyToken, roleController.deleteRole);

module.exports = router;
