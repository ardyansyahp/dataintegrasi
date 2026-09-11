const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const activeToken = token || localStorage.getItem('token');
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
};

export const api = {
  // Auth
  login: async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  selectRole: async (userId, roleId) => {
    const res = await fetch(`${API_BASE_URL}/auth/select-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, roleId }),
    });
    return res.json();
  },

  switchRole: async (roleId) => {
    const res = await fetch(`${API_BASE_URL}/auth/switch-role`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ roleId }),
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Menus
  getMyMenus: async () => {
    const res = await fetch(`${API_BASE_URL}/menus/my-menus`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getAllMenus: async () => {
    const res = await fetch(`${API_BASE_URL}/menus`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  createMenu: async (data) => {
    const res = await fetch(`${API_BASE_URL}/menus`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateMenu: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/menus/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteMenu: async (id) => {
    const res = await fetch(`${API_BASE_URL}/menus/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Roles
  getRoles: async () => {
    const res = await fetch(`${API_BASE_URL}/roles`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getRoleMenus: async (roleId) => {
    const res = await fetch(`${API_BASE_URL}/roles/${roleId}/menus`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  assignRoleMenus: async (roleId, menuIds) => {
    const res = await fetch(`${API_BASE_URL}/roles/${roleId}/menus`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ menuIds }),
    });
    return res.json();
  },

  createRole: async (data) => {
    const res = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Users
  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  createUser: async (data) => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateUserRoles: async (userId, roleIds) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/roles`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role_ids: roleIds }),
    });
    return res.json();
  },
};
