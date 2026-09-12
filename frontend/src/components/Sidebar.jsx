import React, { useState } from 'react';
import {
  Database,
  Layers,
  Users,
  Folder,
  FileText,
  List,
  Shield,
  UserCheck,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import Logo from './Logo';

// Helper icon resolver
const renderIcon = (iconName, size = 18) => {
  switch (iconName) {
    case 'database':
      return <Database size={size} />;
    case 'layers':
      return <Layers size={size} />;
    case 'users':
      return <Users size={size} />;
    case 'list':
      return <List size={size} />;
    case 'shield':
      return <Shield size={size} />;
    case 'user-check':
      return <UserCheck size={size} />;
    case 'folder':
      return <Folder size={size} />;
    case 'file-text':
      return <FileText size={size} />;
    default:
      return <FileText size={size} />;
  }
};

// Recursive Menu Item Component for Unlimited Hierarchy
function RecursiveMenuItem({ item, level = 0, currentPath, onNavigate }) {
  const hasChildren = item.children && item.children.length > 0;
  const [isOpen, setIsOpen] = useState(false);

  // Compare normalized paths so active state is reliably highlighted
  const normCurrent = (currentPath || '').trim().toLowerCase().replace(/\/$/, '');
  const normUrl = (item.url || '').trim().toLowerCase().replace(/\/$/, '');
  const isActive = Boolean(normCurrent && normUrl && normCurrent === normUrl);

  const handleClick = (e) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
    if (item.url) {
      onNavigate(item.url, item);
    }
  };

  return (
    <div className="menu-tree-node">
      <div
        className={`menu-item-row ${isActive ? 'menu-active' : ''}`}
        style={{ paddingLeft: `${16 + level * 18}px` }}
        onClick={handleClick}
      >
        <span className="menu-item-icon">
          {renderIcon(item.icon || (hasChildren ? 'folder' : 'file-text'))}
        </span>
        <span className="menu-item-label">{item.menu_name}</span>
        {hasChildren && (
          <span className="menu-chevron">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="menu-children-container">
          {item.children.map((child) => (
            <RecursiveMenuItem
              key={child.id}
              item={child}
              level={level + 1}
              currentPath={currentPath}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ menus = [], currentPath, onNavigate, activeRole }) {
  return (
    <aside className="app-sidebar">
      {/* Top Logo */}
      <div className="sidebar-logo-area">
        <Logo size="medium" />
      </div>

      {/* Main Navigation */}
      <div className="sidebar-content">
        <div className="sidebar-menu-list">
          {menus.length === 0 ? (
            <div className="empty-menu-notice p-4 text-xs text-gray-400">Tidak ada menu untuk role ini.</div>
          ) : (
            menus.map((menu) => (
              <RecursiveMenuItem
                key={menu.id}
                item={menu}
                level={0}
                currentPath={currentPath}
                onNavigate={onNavigate}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer info showing active role */}
      <div className="sidebar-footer">
        <div className="role-pill-indicator">
          <span className="dot-green"></span>
          <span className="role-pill-text">{activeRole?.role_name || 'Active Role'}</span>
        </div>
      </div>
    </aside>
  );
}
