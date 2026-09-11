import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Folder, FileText, ChevronRight, Layers, Check, AlertCircle } from 'lucide-react';

export default function MenuManagement({ onMenuUpdated }) {
  const [flatMenus, setFlatMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    menu_name: '',
    url: '',
    parent_id: '',
    order_index: 1,
    icon: 'folder',
  });

  const loadMenus = async () => {
    try {
      setLoading(true);
      const res = await api.getAllMenus();
      if (res.success) {
        setFlatMenus(res.flatData || []);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Gagal memuat menu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleOpenCreate = (parentId = '') => {
    setEditingId(null);
    setFormData({
      menu_name: '',
      url: '',
      parent_id: parentId ? String(parentId) : '',
      order_index: 1,
      icon: 'folder',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (menu) => {
    setEditingId(menu.id);
    setFormData({
      menu_name: menu.menu_name,
      url: menu.url || '',
      parent_id: menu.parent_id ? String(menu.parent_id) : '',
      order_index: menu.order_index,
      icon: menu.icon || 'folder',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.menu_name) {
      alert('Nama menu wajib diisi');
      return;
    }

    try {
      const payload = {
        ...formData,
        parent_id: formData.parent_id ? parseInt(formData.parent_id, 10) : null,
        order_index: parseInt(formData.order_index, 10) || 1,
      };

      let res;
      if (editingId) {
        res = await api.updateMenu(editingId, payload);
      } else {
        res = await api.createMenu(payload);
      }

      if (res.success) {
        setSuccessMsg(editingId ? 'Menu berhasil diubah!' : 'Menu baru berhasil dibuat!');
        setTimeout(() => setSuccessMsg(''), 3000);
        setIsModalOpen(false);
        loadMenus();
        if (onMenuUpdated) onMenuUpdated();
      } else {
        alert(res.message || 'Gagal menyimpan menu');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus menu "${name}" dan seluruh sub-menu di bawahnya?`)) return;

    try {
      const res = await api.deleteMenu(id);
      if (res.success) {
        setSuccessMsg(`Menu "${name}" dan turunannya berhasil dihapus!`);
        setTimeout(() => setSuccessMsg(''), 3000);
        loadMenus();
        if (onMenuUpdated) onMenuUpdated();
      } else {
        alert(res.message || 'Gagal menghapus menu');
      }
    } catch (err) {
      alert('Error menghapus: ' + err.message);
    }
  };

  return (
    <div className="management-page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Management Menu</h1>
          <p className="page-subtitle">
            Fitur pengelolaan struktur menu hierarkis tanpa batas (Multiple Level Adjacency List).
          </p>
        </div>
        <button onClick={() => handleOpenCreate('')} className="btn-primary-action">
          <Plus size={18} />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert-box-success">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert-box-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Table Data Menu */}
      <div className="table-card">
        {loading ? (
          <div className="table-loading">Memuat data menu dari PostgreSQL...</div>
        ) : flatMenus.length === 0 ? (
          <div className="table-empty">Belum ada menu yang dibuat.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Menu</th>
                  <th>URL Path</th>
                  <th>Parent Menu</th>
                  <th>Urutan</th>
                  <th>Icon</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {flatMenus.map((m) => (
                  <tr key={m.id} className="table-row">
                    <td className="font-mono text-gray-500 font-bold">{m.id}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">
                          {m.parent_id ? <ChevronRight size={16} /> : <Folder size={16} className="text-cyan-600" />}
                        </span>
                        <span className="font-semibold text-gray-800">{m.menu_name}</span>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-blue-600">{m.url || '-'}</td>
                    <td>
                      {m.parent_name ? (
                        <span className="badge-parent">{m.parent_name} (ID: {m.parent_id})</span>
                      ) : (
                        <span className="badge-root">Root (Menu Utama)</span>
                      )}
                    </td>
                    <td className="font-semibold">{m.order_index}</td>
                    <td>
                      <span className="badge-icon font-mono">{m.icon || 'folder'}</span>
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          onClick={() => handleOpenCreate(m.id)}
                          className="btn-action-icon text-emerald-600"
                          title="Tambah Sub-Menu"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="btn-action-icon text-blue-600"
                          title="Edit Menu"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.menu_name)}
                          className="btn-action-icon text-red-600"
                          title="Hapus Menu"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Create / Edit Menu */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingId ? 'Edit Menu' : 'Tambah Menu Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                &times;
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body-form">
                <div className="form-group">
                  <label className="form-label">Nama Menu *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Menu 1.4 atau Master Karyawan"
                    value={formData.menu_name}
                    onChange={(e) => setFormData({ ...formData, menu_name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">URL Path</label>
                  <input
                    type="text"
                    placeholder="Contoh: /menu-1/4"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Parent Menu (Struktur Hirarki)</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="form-input"
                  >
                    <option value="">-- Menu Utama / Root (Tanpa Parent) --</option>
                    {flatMenus
                      .filter((m) => !editingId || m.id !== editingId)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.parent_id ? `└── ${m.menu_name}` : m.menu_name} (ID: {m.id})
                        </option>
                      ))}
                  </select>
                  <span className="form-hint">
                    Pilih parent untuk membuat sub-menu bertingkat tanpa batas.
                  </span>
                </div>

                <div className="grid-2-col">
                  <div className="form-group">
                    <label className="form-label">Urutan (Order Index)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Icon</label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="form-input"
                    >
                      <option value="folder">folder</option>
                      <option value="file-text">file-text</option>
                      <option value="database">database</option>
                      <option value="layers">layers</option>
                      <option value="users">users</option>
                      <option value="shield">shield</option>
                      <option value="list">list</option>
                    </select>
                  </div>
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
                  {editingId ? 'Simpan Perubahan' : 'Buat Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
