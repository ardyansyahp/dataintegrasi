const pool = require('../config/db');

// GET /api/roles
const getRoles = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.role_name, r.description, r.created_at,
             COUNT(DISTINCT ur.user_id) as total_users,
             COUNT(DISTINCT rm.menu_id) as total_menus
      FROM roles r
      LEFT JOIN user_roles ur ON r.id = ur.role_id
      LEFT JOIN role_menus rm ON r.id = rm.role_id
      GROUP BY r.id
      ORDER BY r.id ASC
    `);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get roles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// GET /api/roles/:id/menus
// Mengambil daftar menu_id yang di-assign ke role tertentu
const getRoleMenus = async (req, res) => {
  try {
    const { id } = req.params;

    const roleQuery = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
    if (roleQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const menusQuery = await pool.query(
      'SELECT menu_id FROM role_menus WHERE role_id = $1',
      [id]
    );

    const assignedMenuIds = menusQuery.rows.map((row) => row.menu_id);

    return res.status(200).json({
      success: true,
      role: roleQuery.rows[0],
      assignedMenuIds,
    });
  } catch (error) {
    console.error('Get role menus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// PUT /api/roles/:id/menus
// Update menu akses untuk role (Transaction)
const assignRoleMenus = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { menuIds } = req.body; // Array of menu IDs [1, 2, 100, ...]

    if (!Array.isArray(menuIds)) {
      return res.status(400).json({
        success: false,
        message: 'menuIds must be an array of numbers',
      });
    }

    await client.query('BEGIN');

    // 1. Hapus relasi lama
    await client.query('DELETE FROM role_menus WHERE role_id = $1', [id]);

    // 2. Insert relasi baru
    if (menuIds.length > 0) {
      for (const menuId of menuIds) {
        await client.query(
          'INSERT INTO role_menus (role_id, menu_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, menuId]
        );
      }
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Role menu permissions updated successfully',
      assignedCount: menuIds.length,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Assign role menus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// POST /api/roles
const createRole = async (req, res) => {
  try {
    const { role_name, description } = req.body;

    if (!role_name) {
      return res.status(400).json({
        success: false,
        message: 'role_name is required',
      });
    }

    const insertQuery = await pool.query(
      `INSERT INTO roles (role_name, description) VALUES ($1, $2) RETURNING *`,
      [role_name.trim(), description]
    );

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: insertQuery.rows[0],
    });
  } catch (error) {
    console.error('Create role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// PUT /api/roles/:id
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name, description } = req.body;

    const updateQuery = await pool.query(
      `UPDATE roles SET role_name = COALESCE($1, role_name), description = $2 WHERE id = $3 RETURNING *`,
      [role_name, description, id]
    );

    if (updateQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: updateQuery.rows[0],
    });
  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// DELETE /api/roles/:id
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    console.error('Delete role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  getRoles,
  getRoleMenus,
  assignRoleMenus,
  createRole,
  updateRole,
  deleteRole,
};
