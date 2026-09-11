import React, { useState } from 'react';
import { Shield, Briefcase, UserCheck, ArrowRight, X } from 'lucide-react';

export default function RoleSelectModal({ isOpen, roles = [], userName, onSelectRole, onCancel }) {
  const [selectedId, setSelectedId] = useState(roles[0]?.id || null);

  if (!isOpen) return null;

  const getRoleIcon = (roleName) => {
    const name = roleName.toLowerCase();
    if (name.includes('admin')) return <Shield size={24} className="text-emerald-500" />;
    if (name.includes('manager')) return <Briefcase size={24} className="text-blue-500" />;
    return <UserCheck size={24} className="text-indigo-500" />;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Pilih Role Akses</h2>
            <p className="modal-subtitle">
              Halo <strong>{userName}</strong>, Anda memiliki <strong>{roles.length} jabatan/role</strong>. Silakan pilih role yang ingin digunakan untuk sesi ini:
            </p>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="modal-close-btn" title="Batal">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="role-options-list">
          {roles.map((role) => {
            const isSelected = selectedId === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedId(role.id)}
                className={`role-option-card ${isSelected ? 'role-selected' : ''}`}
              >
                <div className="role-option-icon">{getRoleIcon(role.role_name)}</div>
                <div className="role-option-details">
                  <div className="role-option-title">
                    <span>{role.role_name}</span>
                    {isSelected && <span className="active-badge">Dipilih</span>}
                  </div>
                  <p className="role-option-desc">
                    {role.description || 'Hak akses fungsional sesuai kebijakan departemen.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          {onCancel && (
            <button onClick={onCancel} className="btn-secondary">
              Batal
            </button>
          )}
          <button
            onClick={() => selectedId && onSelectRole(selectedId)}
            disabled={!selectedId}
            className="btn-primary-neon"
          >
            <span>Masuk dengan Role Ini</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
