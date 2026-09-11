const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /api/users
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.full_name, u.is_active, u.created_at,
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT('id', r.id, 'role_name', r.role_name)
               ) FILTER (WHERE r.id IS NOT NULL), '[]'
             ) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
      ORDER BY u.id ASC
    `);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// POST /api/users
const createUser = async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, password, full_name, role_ids } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query('BEGIN');

    const insertUser = await client.query(
      `INSERT INTO users (username, password, full_name) VALUES ($1, $2, $3) RETURNING id, username, full_name, is_active, created_at`,
      [username.trim(), hashedPassword, full_name]
    );

    const newUser = insertUser.rows[0];

    if (Array.isArray(role_ids) && role_ids.length > 0) {
      for (const roleId of role_ids) {
        await client.query(
          `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [newUser.id, roleId]
        );
      }
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// PUT /api/users/:id/roles
// Mengubah role karyawan (bisa 1 atau banyak role untuk jabatan ganda)
const updateUserRoles = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { role_ids } = req.body; // Array [1, 2]

    if (!Array.isArray(role_ids)) {
      return res.status(400).json({
        success: false,
        message: 'role_ids must be an array of role IDs',
      });
    }

    await client.query('BEGIN');

    await client.query('DELETE FROM user_roles WHERE user_id = $1', [id]);

    for (const roleId of role_ids) {
      await client.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, roleId]
      );
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'User roles updated successfully',
      userId: id,
      rolesAssigned: role_ids,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update user roles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUserRoles,
};
