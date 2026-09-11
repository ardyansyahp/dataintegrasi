import React from 'react';
import { Shield, CheckCircle2, Database, Layers, ArrowRight, UserCheck } from 'lucide-react';

export default function DashboardHome({ user, activeRole, roles = [], onNavigate }) {
  return (
    <div className="dashboard-content-page">
      {/* Welcome Hero Banner */}
      <div className="welcome-banner-card">
        <div className="banner-left">
          <div className="badge-status-active">
            <span className="dot-pulse"></span>
            <span>SESI AKTIF RBAC</span>
          </div>
          <h1 className="banner-title">
            Selamat Datang, <span>{user?.full_name || user?.username}</span> !
          </h1>
          <p className="banner-text">
            Anda saat ini login dengan role aktif <strong>{activeRole?.role_name}</strong>.
            Sistem memuat daftar menu dinamis berbasis hak akses role ini secara real-time dari database PostgreSQL.
          </p>
        </div>

        <div className="banner-role-card">
          <div className="role-card-badge">Role Aktif</div>
          <div className="role-card-name">{activeRole?.role_name}</div>
          <div className="role-card-desc">
            {activeRole?.description || 'Akses terverifikasi'}
          </div>
          {roles.length > 1 && (
            <div className="multi-role-notice">
              <UserCheck size={14} />
              <span>Memiliki {roles.length} Jabatan Ganda</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid Status & Fitur Uji Coba */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="card-icon-circle bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="feature-card-title">Kriteria 1 & 2: Autentikasi & Multi-Role</h3>
          <p className="feature-card-desc">
            Sistem mendukung login berbasis JWT. Karyawan dengan jabatan ganda secara otomatis disajikan dialog pemilihan role saat login dan dapat berganti role kapan saja.
          </p>
        </div>

        <div className="feature-card">
          <div className="card-icon-circle bg-blue-100 text-blue-600">
            <Layers size={24} />
          </div>
          <h3 className="feature-card-title">Kriteria 3: Dynamic Menu Tree</h3>
          <p className="feature-card-desc">
            Struktur menu hierarkis tanpa batas (Adjacency List) dimuat di sidebar kiri, termasuk struktur data uji coba interview (Menu 1, Menu 2, Menu 3 dengan sub-levelnya).
          </p>
        </div>

        <div className="feature-card">
          <div className="card-icon-circle bg-purple-100 text-purple-600">
            <Database size={24} />
          </div>
          <h3 className="feature-card-title">Kriteria 4: Management Menu & Access</h3>
          <p className="feature-card-desc">
            Admin dapat mengelola struktur menu tak terbatas (CRUD) serta mengonfigurasi matriks hak akses menu per role secara dinamis.
          </p>
          <div className="feature-card-action">
            <button
              onClick={() => onNavigate('/management/menus', { menu_name: 'Menu Management' })}
              className="btn-text-link"
            >
              <span>Buka Menu Management</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Database Connection */}
      <div className="connection-info-box">
        <div className="info-box-header">
          <Database size={18} className="text-cyan-600 mr-2" />
          <h4 className="font-bold text-gray-800">Status Database & Server:</h4>
        </div>
        <div className="info-box-grid">
          <div className="info-item">
            <span className="info-label">Database Engine:</span>
            <span className="info-value">PostgreSQL 18</span>
          </div>
          <div className="info-item">
            <span className="info-label">Nama Database:</span>
            <span className="info-value">dataintegrasi</span>
          </div>
          <div className="info-item">
            <span className="info-label">Host & Port:</span>
            <span className="info-value">localhost:5432</span>
          </div>
          <div className="info-item">
            <span className="info-label">Backend API:</span>
            <span className="info-value">Node.js Express (Port 5000)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
