const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    // 1. Cari user di database
    const userQuery = await pool.query(
      'SELECT id, username, password, full_name, is_active FROM users WHERE username = $1',
      [username.trim()]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const user = userQuery.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated',
      });
    }

    // 2. Cek password (bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // 3. Ambil semua role yang dimiliki user
    const rolesQuery = await pool.query(
      `SELECT r.id, r.role_name, r.description 
       FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1
       ORDER BY r.id ASC`,
      [user.id]
    );

    const roles = rolesQuery.rows;

    if (roles.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'User does not have any assigned roles',
      });
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
    };

    // 4. Karyawan dengan Jabatan Ganda (Multi-Role) -> Beri pilihan role
    if (roles.length > 1) {
      // Buat temporary token untuk otentikasi saat memilih role
      const tempToken = jwt.sign(
        { userId: user.id, username: user.username, isTemp: true },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      return res.status(200).json({
        success: true,
        require_role_selection: true,
        message: 'User has multiple roles. Please select an active role.',
        temp_token: tempToken,
        user: safeUser,
        roles: roles,
      });
    }

    // 5. Karyawan dengan Single Role -> Langsung generate token aktif
    const activeRole = roles[0];
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        activeRoleId: activeRole.id,
        activeRoleName: activeRole.role_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(200).json({
      success: true,
      require_role_selection: false,
      message: 'Login successful',
      token,
      user: safeUser,
      activeRole,
      roles,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// POST /api/auth/select-role
// Dipanggil saat user dengan multi-role memilih role aktifnya
const selectRole = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({
        success: false,
        message: 'userId and roleId are required',
      });
    }

    // Verifikasi user & role
    const verifyQuery = await pool.query(
      `SELECT u.id as user_id, u.username, u.full_name, r.id as role_id, r.role_name, r.description
       FROM users u
       INNER JOIN user_roles ur ON u.id = ur.user_id
       INNER JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1 AND r.id = $2`,
      [userId, roleId]
    );

    if (verifyQuery.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Selected role is not assigned to this user',
      });
    }

    const row = verifyQuery.rows[0];

    // Ambil semua role user untuk keperluan UI switch-role
    const allRolesQuery = await pool.query(
      `SELECT r.id, r.role_name, r.description 
       FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );

    const token = jwt.sign(
      {
        userId: row.user_id,
        username: row.username,
        activeRoleId: row.role_id,
        activeRoleName: row.role_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(200).json({
      success: true,
      message: `Active role set to ${row.role_name}`,
      token,
      user: {
        id: row.user_id,
        username: row.username,
        full_name: row.full_name,
      },
      activeRole: {
        id: row.role_id,
        role_name: row.role_name,
        description: row.description,
      },
      roles: allRolesQuery.rows,
    });
  } catch (error) {
    console.error('Select role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// POST /api/auth/switch-role
// Untuk beralih role aktif saat sudah login
const switchRole = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: 'roleId is required',
      });
    }

    const verifyQuery = await pool.query(
      `SELECT u.id as user_id, u.username, u.full_name, r.id as role_id, r.role_name, r.description
       FROM users u
       INNER JOIN user_roles ur ON u.id = ur.user_id
       INNER JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1 AND r.id = $2`,
      [userId, roleId]
    );

    if (verifyQuery.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this role',
      });
    }

    const row = verifyQuery.rows[0];

    const token = jwt.sign(
      {
        userId: row.user_id,
        username: row.username,
        activeRoleId: row.role_id,
        activeRoleName: row.role_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(200).json({
      success: true,
      message: `Switched active role to ${row.role_name}`,
      token,
      activeRole: {
        id: row.role_id,
        role_name: row.role_name,
        description: row.description,
      },
    });
  } catch (error) {
    console.error('Switch role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const activeRoleId = req.user.activeRoleId;

    const userQuery = await pool.query(
      'SELECT id, username, full_name, is_active FROM users WHERE id = $1',
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const rolesQuery = await pool.query(
      `SELECT r.id, r.role_name, r.description 
       FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1
       ORDER BY r.id ASC`,
      [userId]
    );

    const activeRoleQuery = await pool.query(
      'SELECT id, role_name, description FROM roles WHERE id = $1',
      [activeRoleId]
    );

    return res.status(200).json({
      success: true,
      user: userQuery.rows[0],
      activeRole: activeRoleQuery.rows[0] || null,
      roles: rolesQuery.rows,
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  login,
  selectRole,
  switchRole,
  getMe,
};
