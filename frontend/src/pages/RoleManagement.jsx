import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, CheckSquare, Square, Save, Plus, Check, AlertCircle } from 'lucide-react';

export default function RoleManagement({ onRoleUpdated }) {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [assignedMenuIds, setAssignedMenuIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // New role modal
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [newRoleData, setNewRoleData] = useState({ role_name: '', description: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, menusRes] = await Promise.all([api.getRoles(), api.getAllMenus()]);

      if (rolesRes.success) {
        setRoles(rolesRes.data || []);
        if (rolesRes.data.length > 0 && !selectedRole) {
          handleSelectRole(rolesRes.data[0]);
        }
      }
      if (menusRes.success) {
        setMenus(menusRes.flatData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectRole = async (role) => {
    setSelectedRole(role);
    try {
      const res = await api.getRoleMenus(role.id);
      if (res.success) {
        setAssignedMenuIds(res.assignedMenuIds || []);
      }
    } catch (err) {
      console.error('Error fetching role menus:', err);
    }
  };

  const toggleMenu = (menuId) => {
    setAssignedMenuIds((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  const handleSelectAll = () => {
    setAssignedMenuIds(menus.map((m) => m.id));
  };

  const handleDeselectAll = () => {
    setAssignedMenuIds([]);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      setSaving(true);
      const res = await api.assignRoleMenus(selectedRole.id, assignedMenuIds);
      if (res.success) {
        setStatusMsg(`Hak akses menu untuk "${selectedRole.role_name}" berhasil disimpan!`);
        setTimeout(() => setStatusMsg(''), 3000);
        if (onRoleUpdated) onRoleUpdated();
        loadData();
      } else {
        alert(res.message || 'Gagal menyimpan hak akses');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleData.role_name) return;
    try {
      const res = await api.createRole(newRoleData);
      if (res.success) {
        setIsNewRoleModalOpen(false);
        setNewRoleData({ role_name: '', description: '' });
        loadData();
      } else {
        alert(res.message || 'Gagal membuat role');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="management-page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Access Role Management</h1>
          <p className="page-subtitle">
            Konfigurasikan matriks hak akses menu untuk setiap role (RBAC).
          </p>
        </div>
        <button onClick={() => setIsNewRoleModalOpen(true)} className="btn-primary-action">
          <Plus size={18} />
          <span>Tambah Role Baru</span>
        </button>
      </div>

      {statusMsg && (
        <div className="alert-box-success">
          <Check size={18} />
          <span>{statusMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="table-loading">Memuat data role dan menu...</div>
      ) : (
        <div className="role-management-grid">
          {/* List Roles */}
          <div className="roles-list-card">
            <h3 className="section-title">Daftar Role</h3>
            <div className="roles-items">
              {roles.map((r) => {
                const isSelected = selectedRole?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => handleSelectRole(r)}
                    className={`role-item-btn ${isSelected ? 'active' : ''}`}
                  >
                    <div className="flex items-center space-x-2">
                      <Shield size={18} className={isSelected ? 'text-cyan-500' : 'text-gray-400'} />
                      <span className="font-bold text-gray-800">{r.role_name}</span>
                    </div>
                    <span className="badge-count">{r.total_menus || 0} Menu</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Matrix Hak Akses Menu untuk Role Terpilih */}
          <div className="permissions-matrix-card">
            {selectedRole ? (
              <div>
                <div className="matrix-header">
                  <div>
                    <h3 className="matrix-title">
                      Hak Akses Menu: <span className="text-cyan-600">{selectedRole.role_name}</span>
                    </h3>
                    <p className="matrix-subtitle">{selectedRole.description}</p>
                  </div>
                  <div className="matrix-actions">
                    <button onClick={handleSelectAll} className="btn-secondary-sm">
                      Pilih Semua
                    </button>
                    <button onClick={handleDeselectAll} className="btn-secondary-sm">
                      Hapus Semua
                    </button>
                    <button
                      onClick={handleSavePermissions}
                      disabled={saving}
                      className="btn-primary-neon-sm"
                    >
                      <Save size={16} />
                      <span>{saving ? 'Menyimpan...' : 'Simpan Hak Akses'}</span>
                    </button>
                  </div>
                </div>

                <div className="menu-checklist-container">
                  {menus.map((m) => {
                    const isChecked = assignedMenuIds.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => toggleMenu(m.id)}
                        className={`menu-check-row ${m.parent_id ? 'is-submenu' : 'is-parent'}`}
                        style={{ paddingLeft: m.parent_id ? '36px' : '16px' }}
                      >
                        <span className="checkbox-icon">
                          {isChecked ? (
                            <CheckSquare size={20} className="text-emerald-500" />
                          ) : (
                            <Square size={20} className="text-gray-400" />
                          )}
                        </span>
                        <div className="menu-check-label">
                          <span className="font-semibold text-gray-800">{m.menu_name}</span>
                          {m.url && <span className="font-mono text-xs text-gray-400 ml-2">{m.url}</span>}
                        </div>
                        <span className="menu-id-tag">ID: {m.id}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="empty-selection">Pilih role di sebelah kiri untuk melihat hak akses.</div>
            )}
          </div>
        </div>
      )}

      {/* Modal Tambah Role */}
      {isNewRoleModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Tambah Role Baru</h3>
              <button onClick={() => setIsNewRoleModalOpen(false)} className="modal-close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateRole}>
              <div className="modal-body-form">
                <div className="form-group">
                  <label className="form-label">Nama Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: HRD Specialist"
                    value={newRoleData.role_name}
                    onChange={(e) => setNewRoleData({ ...newRoleData, role_name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Deskripsi</label>
                  <textarea
                    rows={3}
                    placeholder="Deskripsi tugas dan akses peran ini..."
                    value={newRoleData.description}
                    onChange={(e) => setNewRoleData({ ...newRoleData, description: e.target.value })}
                    className="form-input"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsNewRoleModalOpen(false)}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary-action">
                  Simpan Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
