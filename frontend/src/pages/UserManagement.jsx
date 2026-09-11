import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserCheck, Plus, Check, Edit2, Shield, User, AlertCircle } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  // Create user modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    password: '',
    full_name: '',
    role_ids: [],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([api.getUsers(), api.getRoles()]);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (rolesRes.success) setRoles(rolesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEditRoles = (user) => {
    setSelectedUser(user);
    setSelectedRoleIds(user.roles.map((r) => r.id));
    setIsModalOpen(true);
  };

  const toggleRoleSelection = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSaveUserRoles = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (selectedRoleIds.length === 0) {
      alert('Pilih minimal 1 role untuk karyawan ini');
      return;
    }

    try {
      const res = await api.updateUserRoles(selectedUser.id, selectedRoleIds);
      if (res.success) {
        setStatusMsg(`Role untuk ${selectedUser.username} berhasil diperbarui!`);
        setTimeout(() => setStatusMsg(''), 3000);
        setIsModalOpen(false);
        loadData();
      } else {
        alert(res.message || 'Gagal mengubah role user');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserData.username || !newUserData.password) {
      alert('Username dan password wajib diisi');
      return;
    }
    if (newUserData.role_ids.length === 0) {
      alert('Pilih minimal 1 role untuk user baru');
      return;
    }

    try {
      const res = await api.createUser(newUserData);
      if (res.success) {
        setStatusMsg(`Karyawan ${newUserData.username} berhasil didaftarkan!`);
        setTimeout(() => setStatusMsg(''), 3000);
        setIsCreateModalOpen(false);
        setNewUserData({ username: '', password: '', full_name: '', role_ids: [] });
        loadData();
      } else {
        alert(res.message || 'Gagal mendaftarkan user');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="management-page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">User & Jabatan Management</h1>
          <p className="page-subtitle">
            Kelola data akun karyawan dan konfigurasi multi-jabatan (jabatan ganda).
          </p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary-action">
          <Plus size={18} />
          <span>Tambah Karyawan Baru</span>
        </button>
      </div>

      {statusMsg && (
        <div className="alert-box-success">
          <Check size={18} />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <div className="table-loading">Memuat data pengguna...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Nama Lengkap</th>
                  <th>Role / Jabatan yang Dimiliki</th>
                  <th>Tipe Jabatan</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const hasMultiRole = u.roles && u.roles.length > 1;
                  return (
                    <tr key={u.id} className="table-row">
                      <td className="font-mono text-gray-500 font-bold">{u.id}</td>
                      <td className="font-semibold text-gray-800">
                        <div className="flex items-center space-x-2">
                          <User size={16} className="text-cyan-600" />
                          <span>{u.username}</span>
                        </div>
                      </td>
                      <td>{u.full_name || '-'}</td>
                      <td>
                        <div className="roles-badges-wrap">
                          {u.roles && u.roles.length > 0 ? (
                            u.roles.map((r) => (
                              <span key={r.id} className="badge-role-tag">
                                <Shield size={12} className="mr-1" />
                                {r.role_name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-red-500">Belum ada role</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {hasMultiRole ? (
                          <span className="badge-multirole">Jabatan Ganda ({u.roles.length})</span>
                        ) : (
                          <span className="badge-singlerole">Jabatan Tunggal</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            onClick={() => handleOpenEditRoles(u)}
                            className="btn-action-icon text-cyan-600"
                            title="Atur Role Karyawan"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Edit Roles Karyawan */}
      {isModalOpen && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">
                Atur Role: <span className="text-cyan-600">{selectedUser.full_name || selectedUser.username}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveUserRoles}>
              <div className="modal-body-form">
                <p className="text-sm text-gray-600 mb-3">
                  Pilih satu atau lebih role untuk menguji fitur <strong>Karyawan Jabatan Ganda (Multi-Role)</strong>:
                </p>
                <div className="role-checkboxes-list">
                  {roles.map((r) => {
                    const isChecked = selectedRoleIds.includes(r.id);
                    return (
                      <label
                        key={r.id}
                        className={`role-select-item ${isChecked ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRoleSelection(r.id)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-bold text-gray-800">{r.role_name}</div>
                          <div className="text-xs text-gray-500">{r.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary-action">
                  Simpan Role Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Create User */}
      {isCreateModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Tambah Karyawan Baru</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="modal-close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body-form">
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: andi"
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Password login"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="Contoh: Andi Wijaya"
                    value={newUserData.full_name}
                    onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pilih Role (Bisa lebih dari satu) *</label>
                  <div className="role-checkboxes-list">
                    {roles.map((r) => {
                      const isChecked = newUserData.role_ids.includes(r.id);
                      return (
                        <label key={r.id} className="role-select-item">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setNewUserData((prev) => ({
                                ...prev,
                                role_ids: isChecked
                                  ? prev.role_ids.filter((id) => id !== r.id)
                                  : [...prev.role_ids, r.id],
                              }));
                            }}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-bold text-gray-800">{r.role_name}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary-action">
                  Daftarkan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
