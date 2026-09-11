const pool = require('../config/db');

// Helper function: Build nested tree from flat adjacency list
const buildTree = (items, parentId = null) => {
  const result = [];
  const children = items.filter((item) => {
    if (parentId === null) {
      return item.parent_id === null || item.parent_id === undefined;
    }
    return item.parent_id === parentId;
  });

  children.sort((a, b) => a.order_index - b.order_index);

  for (const child of children) {
    const subChildren = buildTree(items, child.id);
    result.push({
      ...child,
      children: subChildren,
    });
  }

  return result;
};

// GET /api/menus/my-menus
// Mengambil menu hierarkis sesuai role aktif karyawan saat ini
const getMyMenus = async (req, res) => {
  try {
    const activeRoleId = req.user.activeRoleId;

    if (!activeRoleId) {
      return res.status(400).json({
        success: false,
        message: 'No active role specified in session',
      });
    }

    // Query CTE rekursif untuk mengambil menu yang diizinkan untuk role ini,
    // plus memastikan seluruh parent chain ke atas ikut terambil agar struktur pohon menu utuh.
    const query = `
      WITH RECURSIVE role_assigned AS (
        SELECT m.id, m.menu_name, m.url, m.parent_id, m.order_index, m.icon
        FROM menus m
        INNER JOIN role_menus rm ON m.id = rm.menu_id
        WHERE rm.role_id = $1
      ),
      menu_hierarchy AS (
        -- Base: menu yang di-assign langsung
        SELECT id, menu_name, url, parent_id, order_index, icon
        FROM role_assigned
        UNION
        -- Rekursif ke atas (mengambil parent yang mungkin tidak di-assign langsung)
        SELECT p.id, p.menu_name, p.url, p.parent_id, p.order_index, p.icon
        FROM menus p
        INNER JOIN menu_hierarchy h ON h.parent_id = p.id
      )
      SELECT DISTINCT id, menu_name, url, parent_id, order_index, icon
      FROM menu_hierarchy
      ORDER BY order_index ASC;
    `;

    const result = await pool.query(query, [activeRoleId]);
    const menuTree = buildTree(result.rows, null);

    return res.status(200).json({
      success: true,
      roleId: activeRoleId,
      roleName: req.user.activeRoleName,
      data: menuTree,
      flatData: result.rows,
    });
  } catch (error) {
    console.error('Get my menus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// GET /api/menus
// Mengambil semua menu (untuk keperluan Menu Management)
const getAllMenus = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.menu_name, m.url, m.parent_id, m.order_index, m.icon,
              p.menu_name as parent_name
       FROM menus m
       LEFT JOIN menus p ON m.parent_id = p.id
       ORDER BY m.parent_id NULLS FIRST, m.order_index ASC`
    );

    const tree = buildTree(result.rows, null);

    return res.status(200).json({
      success: true,
      data: tree,
      flatData: result.rows,
    });
  } catch (error) {
    console.error('Get all menus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// POST /api/menus
const createMenu = async (req, res) => {
  try {
    const { menu_name, url, parent_id, order_index, icon } = req.body;

    if (!menu_name) {
      return res.status(400).json({
        success: false,
        message: 'menu_name is required',
      });
    }

    const parentVal = parent_id ? parseInt(parent_id, 10) : null;
    const orderVal = order_index !== undefined && order_index !== null ? parseInt(order_index, 10) : 0;

    const insertQuery = await pool.query(
      `INSERT INTO menus (menu_name, url, parent_id, order_index, icon)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [menu_name.trim(), url ? url.trim() : null, parentVal, orderVal, icon || 'file-text']
    );

    // Otomatis assign menu baru ke Super Admin (Role 1)
    await pool.query(
      `INSERT INTO role_menus (role_id, menu_id) VALUES (1, $1) ON CONFLICT DO NOTHING`,
      [insertQuery.rows[0].id]
    );

    return res.status(201).json({
      success: true,
      message: 'Menu created successfully',
      data: insertQuery.rows[0],
    });
  } catch (error) {
    console.error('Create menu error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// PUT /api/menus/:id
const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { menu_name, url, parent_id, order_index, icon } = req.body;

    const parentVal = parent_id ? parseInt(parent_id, 10) : null;
    // Mencegah menu menjadi parent bagi dirinya sendiri
    if (parentVal === parseInt(id, 10)) {
      return res.status(400).json({
        success: false,
        message: 'Menu cannot be its own parent',
      });
    }

    const updateQuery = await pool.query(
      `UPDATE menus 
       SET menu_name = COALESCE($1, menu_name),
           url = $2,
           parent_id = $3,
           order_index = COALESCE($4, order_index),
           icon = COALESCE($5, icon)
       WHERE id = $6
       RETURNING *`,
      [menu_name, url, parentVal, order_index, icon, id]
    );

    if (updateQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Menu updated successfully',
      data: updateQuery.rows[0],
    });
  } catch (error) {
    console.error('Update menu error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// DELETE /api/menus/:id
const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM menus WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Menu and all sub-menus deleted successfully',
      deletedId: id,
    });
  } catch (error) {
    console.error('Delete menu error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  getMyMenus,
  getAllMenus,
  createMenu,
  updateMenu,
  deleteMenu,
};
