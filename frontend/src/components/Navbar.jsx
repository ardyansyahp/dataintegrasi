import React, { useState } from 'react';
import { LogOut, RefreshCw, ChevronDown, User } from 'lucide-react';

export default function Navbar({ user, activeRole, roles = [], onSwitchRoleClick, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        {/* Breadcrumb or title */}
      </div>

      <div className="navbar-right">
        {/* Wireframe 2 Style: Uppercase Role name in bold */}
        <div className="user-profile-widget">
          <div className="role-badge-header">
            {activeRole?.role_name ? activeRole.role_name.toUpperCase() : 'USER'}
          </div>

          <div
            className="user-dropdown-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="user-avatar-circle">
              <User size={18} />
            </div>
            <div className="user-info-text">
              <span className="user-name">{user?.full_name || user?.username || 'Karyawan'}</span>
              <span className="user-role-sub">@{user?.username}</span>
            </div>
            <ChevronDown size={16} className={`chevron-icon ${dropdownOpen ? 'rotate' : ''}`} />
          </div>

          {dropdownOpen && (
            <div className="user-dropdown-menu">
              <div className="dropdown-header">
                <p className="font-semibold text-gray-800">{user?.full_name}</p>
                <p className="text-xs text-gray-500">Role Aktif: {activeRole?.role_name}</p>
              </div>

              {roles.length > 1 && (
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onSwitchRoleClick();
                  }}
                  className="dropdown-item"
                >
                  <RefreshCw size={16} className="text-blue-500 mr-2" />
                  <span>Ganti Role ({roles.length} Jabatan)</span>
                </button>
              )}

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
                className="dropdown-item text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} className="mr-2" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
