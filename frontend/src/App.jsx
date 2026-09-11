import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardHome from './pages/DashboardHome';
import MenuManagement from './pages/MenuManagement';
import RoleManagement from './pages/RoleManagement';
import UserManagement from './pages/UserManagement';
import DynamicMenuView from './pages/DynamicMenuView';
import RoleSelectModal from './components/RoleSelectModal';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Dynamic Menus for current active role
  const [menus, setMenus] = useState([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [activeMenuData, setActiveMenuData] = useState(null);

  // Switch role modal state
  const [isSwitchRoleOpen, setIsSwitchRoleOpen] = useState(false);

  // Initial check on load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success) {
          setUser(res.user);
          setActiveRole(res.activeRole);
          setRoles(res.roles || []);
          await fetchRoleMenus();
        } else {
          handleLogout();
        }
      } catch (err) {
        console.error('Session expired or network error:', err);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Fetch menus for current active role
  const fetchRoleMenus = async () => {
    try {
      const res = await api.getMyMenus();
      if (res.success) {
        setMenus(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching role menus:', err);
    }
  };

  const handleLoginSuccess = (loggedUser, loggedRole, userRoles) => {
    setUser(loggedUser);
    setActiveRole(loggedRole);
    setRoles(userRoles);
    setToken(localStorage.getItem('token'));
    setCurrentPath('/');
    fetchRoleMenus();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeRole');
    localStorage.removeItem('roles');
    setUser(null);
    setActiveRole(null);
    setRoles([]);
    setToken(null);
    setMenus([]);
    setCurrentPath('/');
  };

  const handleSwitchRole = async (newRoleId) => {
    try {
      const res = await api.switchRole(newRoleId);
      if (res.success) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('activeRole', JSON.stringify(res.activeRole));
        setActiveRole(res.activeRole);
        setIsSwitchRoleOpen(false);
        setCurrentPath('/');
        await fetchRoleMenus();
      } else {
        alert(res.message || 'Gagal mengganti role');
      }
    } catch (err) {
      alert('Error switching role: ' + err.message);
    }
  };

  const handleNavigate = (path, menuObj = null) => {
    setCurrentPath(path);
    setActiveMenuData(menuObj);
  };

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="spinner"></div>
        <p className="mt-4 font-semibold text-gray-700">Menghubungkan ke Data Integrasi RBAC...</p>
      </div>
    );
  }

  // If not logged in -> Show Wireframe 1 Login
  if (!user || !token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Main Dashboard View (Wireframe 2 & 3)
  return (
    <div className="app-layout-container">
      {/* Wireframe 3: Sidebar */}
      <Sidebar
        menus={menus}
        currentPath={currentPath}
        onNavigate={handleNavigate}
        activeRole={activeRole}
      />

      <div className="app-main-area">
        {/* Wireframe 2: Navbar */}
        <Navbar
          user={user}
          activeRole={activeRole}
          roles={roles}
          onSwitchRoleClick={() => setIsSwitchRoleOpen(true)}
          onLogout={handleLogout}
        />

        {/* Content View */}
        <main className="app-page-body">
          {currentPath === '/' && (
            <DashboardHome
              user={user}
              activeRole={activeRole}
              roles={roles}
              onNavigate={handleNavigate}
            />
          )}

          {currentPath === '/management/menus' && (
            <MenuManagement onMenuUpdated={fetchRoleMenus} />
          )}

          {currentPath === '/management/roles' && (
            <RoleManagement onRoleUpdated={fetchRoleMenus} />
          )}

          {currentPath === '/management/users' && (
            <UserManagement />
          )}

          {/* Fallback for Dynamic Menus (Menu 1, Menu 1.1, etc.) */}
          {currentPath !== '/' &&
            currentPath !== '/management/menus' &&
            currentPath !== '/management/roles' &&
            currentPath !== '/management/users' && (
              <DynamicMenuView
                activeMenu={activeMenuData || { menu_name: 'Menu View', url: currentPath }}
                activeRole={activeRole}
              />
            )}
        </main>
      </div>

      {/* Modal Switch Role */}
      <RoleSelectModal
        isOpen={isSwitchRoleOpen}
        userName={user?.full_name || user?.username}
        roles={roles}
        onSelectRole={handleSwitchRole}
        onCancel={() => setIsSwitchRoleOpen(false)}
      />
    </div>
  );
}
