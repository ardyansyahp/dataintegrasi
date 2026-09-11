import React, { useState } from 'react';
import Logo from '../components/Logo';
import { api } from '../services/api';
import RoleSelectModal from '../components/RoleSelectModal';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Multi-role state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [pendingRoles, setPendingRoles] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Harap isi username dan password');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.login(username, password);

      if (!response.success) {
        setErrorMsg(response.message || 'Login gagal, periksa kredensial Anda');
        setLoading(false);
        return;
      }

      // Karyawan dengan Jabatan Ganda (Multi-Role)
      if (response.require_role_selection) {
        setPendingUser(response.user);
        setPendingRoles(response.roles);
        setShowRoleModal(true);
        setLoading(false);
        return;
      }

      // Karyawan dengan Single Role
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('activeRole', JSON.stringify(response.activeRole));
      localStorage.setItem('roles', JSON.stringify(response.roles));

      onLoginSuccess(response.user, response.activeRole, response.roles);
    } catch (err) {
      setErrorMsg('Gagal terhubung ke backend server (port 5000): ' + err.message);
      setLoading(false);
    }
  };

  const handleRoleSelected = async (selectedRoleId) => {
    try {
      setLoading(true);
      const res = await api.selectRole(pendingUser.id, selectedRoleId);
      if (res.success) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('activeRole', JSON.stringify(res.activeRole));
        localStorage.setItem('roles', JSON.stringify(res.roles));

        setShowRoleModal(false);
        onLoginSuccess(res.user, res.activeRole, res.roles);
      } else {
        setErrorMsg(res.message || 'Gagal memilih role');
      }
    } catch (err) {
      setErrorMsg('Error memilih role: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      {/* Container Dua Kolom Sesuai Wireframe 1 */}
      <div className="wireframe-login-card">
        {/* Kolom Kiri: Gradien Gelap + Deskripsi */}
        <div className="login-left-pane">
          <div className="left-pane-header">
            <Logo size="medium" />
          </div>

          <div className="left-pane-body">
            <h1 className="wireframe-title">
              Unified Identity and
              <span className="neon-text"> Access Control.</span>
            </h1>

            <p className="wireframe-description">
              Sistem manajemen autentikasi dan otorisasi terpusat berbasis Role-Based Access Control (RBAC). 
              Kelola transisi multi-jabatan karyawan secara dinamis dan konfigurasikan struktur menu hierarkis tanpa batas 
              untuk menyelaraskan hak akses dengan kebijakan organisasi.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Form Login Putih dengan Border Biru */}
        <div className="login-right-pane">
          <div className="form-card-header">
            <h2 className="welcome-title">Welcome Back !</h2>
            <p className="welcome-subtitle">Please sign in to access your dashboard.</p>
          </div>

          {errorMsg && <div className="alert-box-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="wireframe-input"
                placeholder="Enter your username ..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="wireframe-input"
                placeholder="Enter your password ..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-links">
              <span className="forgot-link">Forgot Password?</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-wireframe-signin"
            >
              {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
            </button>
          </form>

          {/* Quick Demo Credentials Info for Evaluator */}
          <div className="demo-credentials-box">
            <div className="demo-badge">Akun Uji Coba Cepat:</div>
            <div className="demo-buttons-row">
              <button
                type="button"
                onClick={() => { setUsername('admin'); setPassword('password123'); }}
                className="btn-quick-fill"
              >
                <strong>admin</strong> (Multi-Role)
              </button>
              <button
                type="button"
                onClick={() => { setUsername('staff'); setPassword('password123'); }}
                className="btn-quick-fill"
              >
                <strong>staff</strong> (Single Role)
              </button>
              <button
                type="button"
                onClick={() => { setUsername('manager'); setPassword('password123'); }}
                className="btn-quick-fill"
              >
                <strong>manager</strong>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Pilihan Role jika karyawan punya jabatan ganda */}
      <RoleSelectModal
        isOpen={showRoleModal}
        userName={pendingUser?.full_name || pendingUser?.username}
        roles={pendingRoles}
        onSelectRole={handleRoleSelected}
        onCancel={() => setShowRoleModal(false)}
      />
    </div>
  );
}
