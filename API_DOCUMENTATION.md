# Dokumentasi API - Modul Login & Access Management (RBAC)

Aplikasi Backend Node.js (Express) & Database PostgreSQL (`dataintegrasi`).  
Dirancang untuk integrasi frontend React.js dengan arsitektur **Role-Based Access Control (RBAC)**, dukungan **Karyawan Jabatan Ganda (Multi-Role)**, dan **Struktur Menu Hierarkis Tanpa Batas (Adjacency List)**.

---

## 1. Konfigurasi Server
* **Base URL**: `http://localhost:5000/api`
* **Database**: PostgreSQL (`localhost:5432`, Database: `dataintegrasi`, User: `postgres`)
* **Header Autentikasi**: `Authorization: Bearer <JWT_TOKEN>`

---

## 2. Akun Uji Coba (Kredensial Default)
| Username | Password | Role / Jabatan | Keterangan Kasus |
| :--- | :--- | :--- | :--- |
| `admin` | `password123` | **Super Admin** & **Manager** | **Jabatan Ganda (Multi-Role)**: Sistem menampilkan pilihan role saat login |
| `staff` | `password123` | **Staff Operasional** | **Jabatan Tunggal**: Langsung masuk dashboard dengan token role |
| `manager` | `password123` | **Manager** | **Jabatan Tunggal**: Akses menu manajerial |

---

## 3. Daftar Endpoint Lengkap

### A. Autentikasi (`/api/auth`)

#### 1. Login Karyawan
* **Endpoint**: `POST /api/auth/login`
* **Deskripsi**: Autentikasi username & password. Jika user memiliki multi-role, `require_role_selection` bernilai `true` dan mengembalikan daftar role untuk dipilih.
* **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
* **Response (Kasus Multi-Role / Jabatan Ganda)**:
  ```json
  {
    "success": true,
    "require_role_selection": true,
    "message": "User has multiple roles. Please select an active role.",
    "temp_token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": 1,
      "username": "admin",
      "full_name": "Administrator Utama"
    },
    "roles": [
      {
        "id": 1,
        "role_name": "Super Admin",
        "description": "Akses penuh ke semua fitur dan manajemen hak akses"
      },
      {
        "id": 2,
        "role_name": "Manager",
        "description": "Akses ke manajemen operasional dan pelaporan"
      }
    ]
  }
  ```
* **Response (Kasus Single Role)**:
  ```json
  {
    "success": true,
    "require_role_selection": false,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": { "id": 2, "username": "staff", "full_name": "Budi Santoso" },
    "activeRole": { "id": 3, "role_name": "Staff Operasional" },
    "roles": [{ "id": 3, "role_name": "Staff Operasional" }]
  }
  ```

#### 2. Pemilihan Role Aktif (Multi-Role)
* **Endpoint**: `POST /api/auth/select-role`
* **Deskripsi**: Dipilih oleh karyawan setelah login untuk menentukan role yang aktif pada sesi ini.
* **Request Body**:
  ```json
  {
    "userId": 1,
    "roleId": 1
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "message": "Active role set to Super Admin",
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": { "id": 1, "username": "admin", "full_name": "Administrator Utama" },
    "activeRole": { "id": 1, "role_name": "Super Admin" },
    "roles": [...]
  }
  ```

#### 3. Beralih Role (Switch Role)
* **Endpoint**: `POST /api/auth/switch-role`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  { "roleId": 2 }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "message": "Switched active role to Manager",
    "token": "eyJhbGciOiJIUzI1Ni...",
    "activeRole": { "id": 2, "role_name": "Manager" }
  }
  ```

#### 4. Informasi User Aktif (Me)
* **Endpoint**: `GET /api/auth/me`
* **Headers**: `Authorization: Bearer <token>`
* **Response**:
  ```json
  {
    "success": true,
    "user": { "id": 1, "username": "admin", "full_name": "Administrator Utama" },
    "activeRole": { "id": 1, "role_name": "Super Admin" },
    "roles": [...]
  }
  ```

---

### B. Dynamic Menu (`/api/menus`)

#### 1. Ambil Menu Sesuai Role Aktif (Tree Hierarkis)
* **Endpoint**: `GET /api/menus/my-menus`
* **Headers**: `Authorization: Bearer <token>`
* **Deskripsi**: Menghasilkan pohon hierarki menu (recursive tree) yang diizinkan untuk `activeRoleId` pengguna.
* **Response**:
  ```json
  {
    "success": true,
    "roleId": 1,
    "roleName": "Super Admin",
    "data": [
      {
        "id": 1,
        "menu_name": "Master Data",
        "url": "/master-data",
        "parent_id": null,
        "order_index": 1,
        "icon": "database",
        "children": []
      },
      {
        "id": 100,
        "menu_name": "Menu 1",
        "url": "/menu-1",
        "parent_id": null,
        "order_index": 4,
        "icon": "folder",
        "children": [
          {
            "id": 110,
            "menu_name": "Menu 1.1",
            "url": "/menu-1/1",
            "parent_id": 100,
            "order_index": 1,
            "children": []
          },
          {
            "id": 120,
            "menu_name": "Menu 1.2",
            "url": "/menu-1/2",
            "parent_id": 100,
            "order_index": 2,
            "children": [
              { "id": 121, "menu_name": "Menu 1.2.1", "parent_id": 120, "children": [] },
              { "id": 122, "menu_name": "Menu 1.2.2", "parent_id": 120, "children": [] }
            ]
          }
        ]
      }
    ]
  }
  ```

#### 2. Ambil Semua Menu (Untuk Menu Management)
* **Endpoint**: `GET /api/menus`
* **Headers**: `Authorization: Bearer <token>`

#### 3. Buat Menu Baru (Hierarki Tanpa Batas)
* **Endpoint**: `POST /api/menus`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "menu_name": "Menu 1.4",
    "url": "/menu-1/4",
    "parent_id": 100,
    "order_index": 4,
    "icon": "file-text"
  }
  ```

#### 4. Update Menu
* **Endpoint**: `PUT /api/menus/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "menu_name": "Menu 1.4 Updated",
    "url": "/menu-1/4",
    "parent_id": 100,
    "order_index": 4,
    "icon": "file-text"
  }
  ```

#### 5. Hapus Menu
* **Endpoint**: `DELETE /api/menus/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Deskripsi**: Menghapus menu beserta seluruh sub-menunya secara otomatis (ON DELETE CASCADE).

---

### C. Access Role Management (`/api/roles`)

#### 1. Ambil Semua Role
* **Endpoint**: `GET /api/roles`
* **Headers**: `Authorization: Bearer <token>`

#### 2. Ambil Menu yang Diizinkan untuk Role Tertentu
* **Endpoint**: `GET /api/roles/:id/menus`
* **Headers**: `Authorization: Bearer <token>`
* **Response**:
  ```json
  {
    "success": true,
    "role": { "id": 2, "role_name": "Manager" },
    "assignedMenuIds": [1, 100, 110, 120, 121, 200, 210]
  }
  ```

#### 3. Simpan Izin Akses Menu ke Role
* **Endpoint**: `PUT /api/roles/:id/menus`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "menuIds": [1, 100, 110, 120, 121, 200, 210]
  }
  ```

---

### D. User & Multi-Role Management (`/api/users`)

#### 1. Ambil Semua User Beserta Role
* **Endpoint**: `GET /api/users`
* **Headers**: `Authorization: Bearer <token>`

#### 2. Tambah User Karyawan Baru
* **Endpoint**: `POST /api/users`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "username": "karyawan_baru",
    "password": "password123",
    "full_name": "Ahmad Fauzi",
    "role_ids": [2, 3]
  }
  ```

#### 3. Atur Multi-Role / Jabatan Karyawan
* **Endpoint**: `PUT /api/users/:id/roles`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "role_ids": [1, 2]
  }
  ```
