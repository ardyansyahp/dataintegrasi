# Project Full-Stack: Modul Login & Management Access (RBAC)

Aplikasi full-stack untuk studi kasus tes backend developer & modul Login & Management Access terintegrasi.

## 🌟 Fitur Utama
1. **Login & Autentikasi JWT**: Menggunakan bcrypt password hashing dan JWT token.
2. **Karyawan Jabatan Ganda (Multi-Role)**:
   - Jika karyawan memiliki lebih dari 1 role, sistem otomatis memunculkan modal dialog pemilihan role aktif saat login.
   - Karyawan dapat berganti role aktif (*switch role*) kapan saja dari dropdown profil.
3. **Menu Dinamis Sesuai Role**:
   - Menu dimuat dinamis berdasarkan role yang aktif saat ini dari database PostgreSQL.
   - Karyawan hanya melihat menu yang diizinkan untuk rolenya di tabel `role_menus`.
4. **Struktur Menu Hierarkis Tanpa Batas (Multiple Level Adjacency List)**:
   - Mendukung kedalaman level tidak terbatas (`parent_id` self-referencing).
   - Telah dimuat dengan data uji coba interview:
     - **Menu 1** $\rightarrow$ 1.1, 1.2 (1.2.1, 1.2.2), 1.3 (1.3.1)
     - **Menu 2** $\rightarrow$ 2.1, 2.2 (2.2.1, 2.2.2 [2.2.2.1, 2.2.2.2], 2.2.3), 2.3
     - **Menu 3** $\rightarrow$ 3.1, 3.2
5. **Fitur Management Access & Menu**:
   - **Menu Management**: Tambah, edit, hapus menu dan atur parent menu untuk membuat struktur bertingkat tanpa batas.
   - **Access Role Management**: Matriks checkbox untuk mengonfigurasi menu apa saja yang berhak diakses oleh setiap role.
   - **User & Jabatan Management**: Atur penetapan satu atau banyak role pada setiap akun karyawan.
6. **Desain UI Presisi**:
   - **Wireframe 1**: Halaman Login split layout dengan branding *Data Integrasi Inovasi*, judul *Unified Identity and Access Control.*, dan tombol neon green *SIGN IN*.
   - **Wireframe 2**: Header navbar putih dengan label *ADMIN* dan info user.
   - **Wireframe 3**: Sidebar putih bergaris aksen biru dengan pill hitam *Homepage*, section *MASTER*, dan recursive menu bertingkat dengan icon dan chevron toggle.

---

## 🛠️ Stack Teknologi
* **Backend**: Node.js, Express, PostgreSQL (`pg`), JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`), CORS.
* **Database**: PostgreSQL 18 (`localhost:5432`, database: `dataintegrasi`).
* **Frontend**: React 18, Vite, Lucide React Icons, Vanilla CSS Design System.

---

## 🚀 Cara Menjalankan

### 1. Database PostgreSQL
Database `dataintegrasi` di port `5432` telah di-inisialisasi dengan DDL dan Seeder di:
`backend/schema.sql`

### 2. Jalankan Backend (Port 5000)
```bash
cd c:\laragon\www\dataintegrasi\backend
npm start
```
Akan berjalan di `http://localhost:5000`

### 3. Jalankan Frontend React (Port 5173)
```bash
cd c:\laragon\www\dataintegrasi\frontend
npm run dev
```
Buka browser di `http://localhost:5173`

---

## 👤 Akun Uji Coba Demo
| Username | Password | Tipe Role | Hasil Pengujian |
| :--- | :--- | :--- | :--- |
| **admin** | `password123` | **Multi-Role** (Super Admin & Manager) | Muncul dialog pemilihan role aktif |
| **staff** | `password123` | **Single-Role** (Staff Operasional) | Langsung masuk dashboard (hanya Menu 1 & 3) |
| **manager** | `password123` | **Single-Role** (Manager) | Masuk dashboard (Menu 1, 2 & Master Data) |
