-- DDL Schema Database "dataintegrasi"
-- Sesuai ERD (RBAC + Many-to-Many + Adjacency List)

DROP TABLE IF EXISTS role_menus CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Tabel users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel user_roles (Many-to-Many antara users dan roles)
CREATE TABLE user_roles (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 4. Tabel menus (Adjacency List untuk Multi-level Hierarchy tanpa batas)
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    menu_name VARCHAR(100) NOT NULL,
    url VARCHAR(255),
    parent_id INT REFERENCES menus(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 0,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel role_menus (Many-to-Many antara roles dan menus)
CREATE TABLE role_menus (
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    menu_id INT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, menu_id)
);

-- =======================================================
-- SEED DATA AWAL
-- Password default semua user: password123 ($2b$10$wEkgK/Qv377vT1sR4v0nfuWvjZ4mG7JjV8wF1a9CgDkFfR8Cq0iGy)
-- =======================================================

-- Masukkan Roles
INSERT INTO roles (id, role_name, description) VALUES
(1, 'Super Admin', 'Akses penuh ke semua fitur dan manajemen hak akses'),
(2, 'Manager', 'Akses ke manajemen operasional dan pelaporan'),
(3, 'Staff Operasional', 'Akses terbatas untuk kebutuhan operasional harian');

-- Masukkan Users (hash bcrypt untuk 'password123')
INSERT INTO users (id, username, password, full_name, is_active) VALUES
(1, 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator Utama', true),
(2, 'staff', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Budi Santoso', true),
(3, 'manager', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Siti Rahmawati', true);

-- Masukkan User Roles (Karyawan Jabatan Ganda & Tunggal)
-- User 'admin' memiliki 2 role: Super Admin (1) & Manager (2) -> Untuk uji coba Multi-role
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),
(1, 2),
(2, 3), -- 'staff' hanya memiliki role Staff Operasional (3)
(3, 2); -- 'manager' memiliki role Manager (2)

-- Reset Sequence ID
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- =======================================================
-- SEED DATA STRUKTUR MENU UJI COBA (Sesuai Soal Interview)
-- =======================================================

-- Level 0: Master Menu Utama Sesuai Wireframe 3
INSERT INTO menus (id, menu_name, url, parent_id, order_index, icon) VALUES
(1, 'Master Data', '/master-data', NULL, 1, 'database'),
(2, 'Sub Master', '/sub-master', NULL, 2, 'layers'),
(3, 'Administration', '/admin', NULL, 3, 'users');

-- Sub Menu di bawah Administration
INSERT INTO menus (id, menu_name, url, parent_id, order_index, icon) VALUES
(4, 'Menu Management', '/management/menus', 3, 1, 'list'),
(5, 'Access Role Management', '/management/roles', 3, 2, 'shield'),
(6, 'User Management', '/management/users', 3, 3, 'user-check');

-- Sesuai Catatan Soal: Struktur Menu Bertingkat (Menu 1, 2, 3)
-- Menu 1
INSERT INTO menus (id, menu_name, url, parent_id, order_index, icon) VALUES
(100, 'Menu 1', '/menu-1', NULL, 4, 'folder'),
(110, 'Menu 1.1', '/menu-1/1', 100, 1, 'file-text'),
(120, 'Menu 1.2', '/menu-1/2', 100, 2, 'folder'),
(121, 'Menu 1.2.1', '/menu-1/2/1', 120, 1, 'file-text'),
(122, 'Menu 1.2.2', '/menu-1/2/2', 120, 2, 'file-text'),
(130, 'Menu 1.3', '/menu-1/3', 100, 3, 'folder'),
(131, 'Menu 1.3.1', '/menu-1/3/1', 130, 1, 'file-text');

-- Menu 2
INSERT INTO menus (id, menu_name, url, parent_id, order_index, icon) VALUES
(200, 'Menu 2', '/menu-2', NULL, 5, 'folder'),
(210, 'Menu 2.1', '/menu-2/1', 200, 1, 'file-text'),
(220, 'Menu 2.2', '/menu-2/2', 200, 2, 'folder'),
(221, 'Menu 2.2.1', '/menu-2/2/1', 220, 1, 'file-text'),
(222, 'Menu 2.2.2', '/menu-2/2/2', 220, 2, 'folder'),
(2221, 'Menu 2.2.2.1', '/menu-2/2/2/1', 222, 1, 'file-text'),
(2222, 'Menu 2.2.2.2', '/menu-2/2/2/2', 222, 2, 'file-text'),
(223, 'Menu 2.2.3', '/menu-2/2/3', 220, 3, 'file-text'),
(230, 'Menu 2.3', '/menu-2/3', 200, 3, 'file-text');

-- Menu 3
INSERT INTO menus (id, menu_name, url, parent_id, order_index, icon) VALUES
(300, 'Menu 3', '/menu-3', NULL, 6, 'folder'),
(310, 'Menu 3.1', '/menu-3/1', 300, 1, 'file-text'),
(320, 'Menu 3.2', '/menu-3/2', 300, 2, 'file-text');

SELECT setval('menus_id_seq', 3000);

-- =======================================================
-- SEED ROLE_MENUS (HAK AKSES PER ROLE)
-- =======================================================

-- Super Admin (Role 1): Mendapatkan SEMUA menu
INSERT INTO role_menus (role_id, menu_id)
SELECT 1, id FROM menus;

-- Manager (Role 2): Mendapatkan Menu 1, Menu 2, Master Data
INSERT INTO role_menus (role_id, menu_id)
SELECT 2, id FROM menus WHERE id IN (1, 100, 110, 120, 121, 122, 130, 131, 200, 210, 220, 221, 222, 2221, 2222, 223, 230);

-- Staff Operasional (Role 3): Hanya Menu 1 dan Menu 3
INSERT INTO role_menus (role_id, menu_id)
SELECT 3, id FROM menus WHERE id IN (100, 110, 120, 121, 300, 310, 320);
