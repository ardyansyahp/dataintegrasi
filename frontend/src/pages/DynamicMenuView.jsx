import React from 'react';
import { Folder, FileText, ChevronRight, CheckCircle2, Shield } from 'lucide-react';

export default function DynamicMenuView({ activeMenu, activeRole }) {
  if (!activeMenu) {
    return <div className="p-8 text-gray-500">Pilih menu dari sidebar.</div>;
  }

  return (
    <div className="management-page-container">
      {/* Breadcrumb Bar */}
      <div className="breadcrumb-bar">
        <span className="text-gray-400">Sidebar</span>
        <ChevronRight size={14} className="text-gray-400 mx-1" />
        <span className="text-gray-400">Dynamic Menu</span>
        <ChevronRight size={14} className="text-gray-400 mx-1" />
        <span className="font-bold text-cyan-700">{activeMenu.menu_name}</span>
      </div>

      <div className="dynamic-menu-hero">
        <div className="hero-icon-box">
          {activeMenu.icon === 'folder' ? <Folder size={32} /> : <FileText size={32} />}
        </div>
        <div>
          <h1 className="hero-menu-title">{activeMenu.menu_name}</h1>
          <p className="hero-menu-sub">
            Menu Dinamis Hierarkis (Multiple Level Tanpa Batas) — Diambil dari Database PostgreSQL
          </p>
        </div>
      </div>

      <div className="dynamic-details-grid">
        <div className="details-card">
          <h3 className="card-heading">Informasi Node Menu</h3>
          <div className="property-list">
            <div className="property-item">
              <span className="prop-name">Menu ID:</span>
              <span className="prop-val font-mono">{activeMenu.id}</span>
            </div>
            <div className="property-item">
              <span className="prop-name">Nama Menu:</span>
              <span className="prop-val font-bold">{activeMenu.menu_name}</span>
            </div>
            <div className="property-item">
              <span className="prop-name">URL Target:</span>
              <span className="prop-val font-mono text-blue-600">{activeMenu.url || '-'}</span>
            </div>
            <div className="property-item">
              <span className="prop-name">Parent ID:</span>
              <span className="prop-val font-mono">{activeMenu.parent_id !== null ? activeMenu.parent_id : 'Root (NULL)'}</span>
            </div>
            <div className="property-item">
              <span className="prop-name">Order Index:</span>
              <span className="prop-val font-semibold">{activeMenu.order_index}</span>
            </div>
            <div className="property-item">
              <span className="prop-name">Icon Identifier:</span>
              <span className="prop-val font-mono">{activeMenu.icon || 'file-text'}</span>
            </div>
          </div>
        </div>

        <div className="details-card">
          <h3 className="card-heading">Validasi Akses RBAC</h3>
          <div className="rbac-status-box">
            <div className="flex items-center space-x-2 text-emerald-600 font-bold mb-2">
              <CheckCircle2 size={20} />
              <span>Akses Diizinkan</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Menu ini di-render karena Role aktif Anda (<strong>{activeRole?.role_name}</strong>) memiliki izin akses terhadap relasi menu ini di tabel <code>role_menus</code>.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-500">
              <Shield size={14} className="mr-1 text-cyan-600" />
              <span>Verifikasi Token JWT: Valid & Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
