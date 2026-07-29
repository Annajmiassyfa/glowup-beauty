# 🌸 GlowUp Beauty — E-Commerce Platform

> **GlowUp Beauty** adalah aplikasi e-commerce modern berbasis web untuk belanja produk kecantikan, perawatan kulit (*skincare*), dan kosmetik. Platform ini dilengkapi dengan fitur belanja lengkap bagi pelanggan (*customer*) serta dashboard manajemen intuitif bagi pengelola (*admin*).

---

## 📋 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Teknologi (Tech Stack)](#-teknologi-tech-stack)
3. [Struktur Project](#-struktur-project)
4. [Persyaratan Sistem](#-persyaratan-sistem)
5. [Panduan Instalasi & Cara Menjalankan](#-panduan-instalasi--cara-menjalankan)
6. [Konfigurasi Environment Variables](#-konfigurasi-environment-variables)
7. [Skema Database (Prisma ORM)](#-skema-database-prisma-orm)
8. [Dokumentasi API Endpoints](#-dokumentasi-api-endpoints)
9. [Perintah / Script npm](#-perintah--script-npm)
10. [Panduan Transfer / Export Project](#-panduan-transfer--export-project)

---

## ✨ Fitur Utama

### 🛍️ Sisi Pelanggan (Customer)
* **Katalog & Pencarian Produk**: Filter produk berdasarkan kategori, brand, rentang harga, pencarian kata kunci, serta sorting (terbaru, harga terendah/tertinggi).
* **Detail Produk & Review**: Visualisasi gambar produk, harga, diskon, stok, deskripsi, bahan (*ingredients*), cara pakai (*usage*), serta rating dan ulasan pelanggan.
* **Keranjang Belanja (Cart)**: Tambah, ubah kuantitas, hapus item, dan akumulasi subtotal secara real-time.
* **Checkout & Pembayaran**: Pemilihan alamat pengiriman, opsi metode pembayaran, simulasi ongkos kirim, dan pembuatan pesanan.
* **Manajemen Akun & Profil**:
  * Pengaturan data diri & avatar.
  * Buku Alamat (*Address Book*) dengan penandaan Alamat Utama.
  * Riwayat Pesanan & Lacak Status Pesanan (*Created*, *Processed*, *Shipped*, *Completed*, *Cancelled*).
  * Pengajuan Retur / Pengembalian Produk (*Return Requests*).
  * Program Keanggotaan (*Membership & Loyalty Points*) dengan tingkatan *Starter*, *Insider*, dan *VIP*.

### 🛡️ Sisi Pengelola (Admin)
* **Dashboard Statistik**: Overview penjualan, total pesanan, jumlah produk, dan aktivitas user.
* **Manajemen Produk (CRUD)**:
  * Tambah/edit/hapus produk.
  * Pengaturan stok, harga normal, harga diskon (*compare-at-price*).
  * Upload multiple gambar produk (diintegrasikan dengan `multer`).
  * Penandaan produk unggulan (*Featured Product*).
* **Manajemen Pesanan**: Pembaruan status pesanan (diproses, dikirim, selesai, dibatalkan) dan input nomor resi pengiriman (*tracking number*).
* **Manajemen Retur**: Meninjau dan menyetujui/menolak pengajuan retur barang dari pelanggan.
* **Manajemen Pengguna**: Mengelola akun pengguna dan promosi peran (*role*) Admin.

---

## 🛠️ Teknologi (Tech Stack)

### Frontend
| Teknologi | Kegunaan |
| :--- | :--- |
| **React 19** | Library UI utama |
| **Vite 8** | Build tool & Development Server ultra-cepat |
| **Tailwind CSS v4** | Framework styling utilitas tinggi |
| **Lucide React** | Icon pack modern |
| **Context API** | State management internal (AuthContext, CartContext) |

### Backend
| Teknologi | Kegunaan |
| :--- | :--- |
| **Node.js & Express v5** | Server Runtime & Web API Framework |
| **Prisma ORM v6** | Database Abstraction & Migration Tool |
| **SQLite / PostgreSQL** | Database Relasional |
| **JWT (JSON Web Token)** | Autentikasi & Otorisasi Stateless |
| **Bcryptjs** | Hashing kata sandi |
| **Multer** | Penanganan upload file media (gambar produk/avatar) |

---

## 📁 Struktur Project

```text
glowup-beauty/
├── backend/                  # Application Backend (Express.js & Prisma)
│   ├── prisma/               # Database Schema, Migrations, & Seeders
│   │   ├── schema.prisma     # Definisi Model Data
│   │   ├── seed.js           # Seeder Data Awal
│   │   └── dev.db            # Database SQLite lokal
│   ├── src/
│   │   ├── controllers/      # Logika Bisnis & Handlers API
│   │   ├── middlewares/      # Express Middlewares (Auth, Upload, Error)
│   │   ├── routes/           # Routing API Endpoints
│   │   ├── prisma.js         # Client Instance Prisma
│   │   └── server.js         # Entry Point Backend Server
│   ├── uploads/              # Storage File Media Uploads
│   ├── .env                  # Environment Variables Backend
│   └── package.json          # Dependensi Backend
├── public/                   # Asset Statis Frontend (Favicon, Logo, dll)
├── src/                      # Application Frontend (React)
│   ├── assets/               # Gambar & Aset CSS
│   ├── components/           # Komponen Reusable UI (Navbar, Footer, Modal, Cards)
│   ├── context/              # Context Providers (Auth, Cart)
│   ├── data/                 # Data Dummy / Constants
│   ├── pages/                # Halaman Aplikasi (Home, Shop, Admin, Cart, Checkout, dll)
│   ├── services/             # Integrasi API HTTP (Fetch/Axios Helpers)
│   ├── App.jsx               # Komponen Utama & Routing
│   └── main.jsx              # Entry Point Frontend
├── index.html                # Entry Point HTML Vite
├── package.json              # Dependensi Frontend Root
├── vite.config.js            # Konfigurasi Vite
└── project_handoff.md        # Panduan Pemindahan Project Lokal
```

---

## 💻 Persyaratan Sistem

* **Node.js**: v18.0.0 atau versi yang lebih baru.
* **npm**: v9.0.0 atau versi yang lebih baru.

---

## 🚀 Panduan Instalasi & Cara Menjalankan

Ikuti langkah-langkah di bawah ini untuk menjalankan project secara lokal:

### 1. Clone / Download Project
Pastikan Anda sudah mengunduh folder project `glowup-beauty`.

### 2. Menjalankan Backend Server
1. Buka terminal dan masuk ke folder `backend`:
   ```bash
   cd backend
   ```
2. Install semua dependensi backend:
   ```bash
   npm install
   ```
3. Buat file `.env` di dalam folder `backend` (lihat bagian [Environment Variables](#-konfigurasi-environment-variables)).
4. Jalankan migrasi Prisma & seeding data (jika belum ada database):
   ```bash
   npx prisma db push
   npm run seed
   ```
5. Jalankan backend server dalam mode development:
   ```bash
   npm run dev
   ```
   > 🌐 Backend API akan berjalan di **`http://localhost:5000`**

### 3. Menjalankan Frontend Application
1. Buka jendela terminal baru di akar folder project (`glowup-beauty`):
2. Install dependensi frontend:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan Vite:
   ```bash
   npm run dev
   ```
   > 🌐 Aplikasi Frontend akan berjalan di **`http://localhost:5173`** (atau port default Vite).

---

## 🔑 Konfigurasi Environment Variables

Buat file `.env` pada folder `backend/`:

```env
# Port Server Backend
PORT=5000

# Database URL (SQLite untuk dev, PostgreSQL untuk prod)
DATABASE_URL="file:./dev.db"

# Rahasia Kunci JWT
JWT_SECRET="glowup_super_secret_jwt_key_2026"

# Izinkan Origin CORS (Opsional)
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

---

## 🗄️ Skema Database (Prisma ORM)

Beberapa entitas utama yang dikelola oleh Prisma ORM:

* **User**: Informasi pengguna, email, hashed password, role (`Customer`/`Admin`), poin reward, dan tier membership (`Starter`, `Insider`, `VIP`).
* **Address**: Buku alamat pelanggan yang terhubung dengan `User` (Provinsi, Kota, Kecamatan, Kode Pos, Detail).
* **Category & Brand**: Kategori produk dan merk kosmetik/skincare.
* **Product & ProductImage**: Data katalog produk, stok, harga, deskripsi, bahan, penggunaan, serta galeri foto produk.
* **Order & OrderItem**: Data transaksi pesanan, subtotal, ongkir, diskon, status pembayaran, dan status pengiriman.
* **ReturnRequest**: Pengajuan klaim/retur barang dari pelanggan berserta status persetujuannya.
* **Review**: Ulasan bintang (1-5) dan komentar pelanggan terhadap produk yang dibeli.

---

## 📡 Dokumentasi API Endpoints

### 🔑 Autentikasi (`/api/auth`)
* `POST /api/auth/register` — Registrasi akun baru.
* `POST /api/auth/login` — Login pengguna & dapatkan JWT Token.
* `GET /api/auth/me` — Ambil profil pengguna yang sedang login (Protected).

### 🛒 Produk & Katalog (`/api/products`)
* `GET /api/products` — Mendapatkan daftar semua produk (mendukung query filter & search).
* `GET /api/products/:slug` — Mendapatkan detail produk berdasarkan slug.

### 🏠 Alamat Pengiriman (`/api/addresses`)
* `GET /api/addresses` — Ambil daftar alamat milik pengguna (Protected).
* `POST /api/addresses` — Tambah alamat baru (Protected).
* `PUT /api/addresses/:id` — Perbarui data alamat (Protected).
* `DELETE /api/addresses/:id` — Hapus alamat (Protected).

### 📦 Pesanan & Transaksi (`/api/orders`)
* `GET /api/orders` — Ambil riwayat pesanan milik pengguna (Protected).
* `POST /api/orders` — Buat pesanan baru / Checkout (Protected).
* `GET /api/orders/:id` — Detail spesifik pesanan (Protected).

### 🔄 Retur Produk (`/api/returns`)
* `GET /api/returns` — Ambil daftar pengajuan retur pengguna (Protected).
* `POST /api/returns` — Buat pengajuan retur baru (Protected).

### ⭐ Ulasan / Reviews (`/api/reviews`)
* `POST /api/reviews` — Beri ulasan untuk produk yang pernah dibeli (Protected).
* `GET /api/reviews/product/:productId` — Ambil semua ulasan untuk suatu produk.

### 🛡️ Admin Dashboard (`/api/admin`) *(Memerlukan Role Admin)*
* `GET /api/admin/stats` — Ringkasan statistik penjualan & aktivitas.
* `POST /api/admin/products` — Tambah produk baru (+ upload gambar via Multer).
* `PUT /api/admin/products/:id` — Perbarui data produk.
* `DELETE /api/admin/products/:id` — Hapus produk.
* `PUT /api/admin/orders/:id/status` — Update status pesanan & resi pengiriman.
* `PUT /api/admin/returns/:id/status` — Approve/Reject pengajuan retur.

---

## 📜 Perintah / Script npm

### Frontend (Root)
* `npm run dev` — Menjalankan server pengembangan Vite.
* `npm run build` — Melakukan kompilasi bundle produksi di folder `dist/`.
* `npm run preview` — Menjalankan server preview untuk mengecek hasil build.
* `npm run lint` — Memeriksa kesalahan sintaks/gaya kode dengan ESLint.

### Backend (`backend/`)
* `npm run dev` — Menjalankan server backend dengan auto-reload (`node --watch`).
* `npm start` — Menjalankan server backend di lingkungan produksi.
* `npm run seed` — Mengisi database dengan data awal (*seed data*).
* `npx prisma studio` — Membuka GUI interaktif untuk melihat database di browser.

---

## 📦 Panduan Transfer / Export Project

Jika Anda hendak memindahkan atau membagikan project ini ke perangkat lain:

1. **Aset Wajib Disertakan**:
   * Seluruh isi folder `src/` dan `public/`
   * Seluruh isi `backend/src/` dan `backend/prisma/`
   * File database `backend/dev.db` dan folder media `backend/uploads/`
   * File konfigurasi: `package.json`, `vite.config.js`, `tailwind.config.js`, `backend/.env`
2. **Folder yang TIDAK Perludisertakan / Abaikan**:
   * `node_modules/` (Akan dibuat ulang via `npm install`)
   * `dist/` (Hasil build statis)

Detail lengkap panduan transfer dapat dibaca di [project_handoff.md](file:///c:/Users/HP%20VICTUS/.gemini/antigravity/scratch/glowup-beauty/project_handoff.md).

---

© 2026 **GlowUp Beauty Team**. All rights reserved.

