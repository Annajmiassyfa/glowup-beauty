# GlowUp Beauty Project Handoff Guide

Panduan ini disiapkan untuk membantu Anda memindahkan project **GlowUp Beauty** ke VS Code lokal di komputer Anda.

## 1. Struktur Folder Project

Berikut adalah struktur folder yang harus Anda download/pindahkan:

```text
glowup-beauty/
├── backend/                # Source code Backend (Express & Prisma)
│   ├── prisma/             # Skema Database & Migrasi
│   ├── src/                # Logika Server
│   ├── uploads/            # Folder penyimpanan file (gambar produk, dll)
│   ├── .env                # Konfigurasi Backend (WAJIB)
│   ├── dev.db              # File Database SQLite (WAJIB)
│   └── package.json        # Dependensi Backend
├── public/                 # Aset statis Frontend
├── src/                    # Source code Frontend (React)
├── .gitignore              # Pengaturan file yang diabaikan Git
├── index.html              # Entry point HTML
├── package.json            # Dependensi Frontend
├── postcss.config.js       # Konfigurasi styling
├── tailwind.config.js      # Konfigurasi styling
└── vite.config.js          # Konfigurasi build Vite
```

---

## 2. Daftar File Penting (Wajib Ikut)

Pastikan file-file berikut ada di dalam folder export Anda:

- **Frontend Source**: Semua isi folder `src/` dan file `index.html`.
- **Backend Source**: Semua isi folder `backend/src/`.
- **Prisma Schema**: `backend/prisma/schema.prisma`.
- **SQLite Database**: `backend/dev.db` (Ini berisi semua data produk, user, dan pesanan saat ini).
- **Uploads Folder**: `backend/uploads/` (Berisi gambar-gambar yang sudah diupload).
- **Env/Config Files**:
  - `backend/.env` (Berisi `DATABASE_URL` dan konfigurasi rahasia lainnya).
  - `package.json` (Baik di root maupun di folder backend).
  - `vite.config.js`, `tailwind.config.js`, `postcss.config.js`.

---

## 3. Cara Menjalankan Project Secara Lokal

Buka terminal di VS Code Anda dan ikuti langkah berikut:

### Bagian A: Menjalankan Backend
1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Install dependensi:
   ```bash
   npm install
   ```
3. Jalankan server:
   ```bash
   npm run dev
   ```
   *Server akan berjalan di port yang ditentukan di `.env` (biasanya `http://localhost:5000`).*

### Bagian B: Menjalankan Frontend
1. Buka terminal baru (tetap di root project `glowup-beauty`):
2. Install dependensi:
   ```bash
   npm install
   ```
3. Jalankan Vite:
   ```bash
   npm run dev
   ```
   *Frontend akan berjalan di `http://localhost:5173`.*

---

## 4. Dependensi Utama yang Akan Ter-install

### Frontend (Root `package.json`):
- `react`, `react-dom` (V19)
- `vite`
- `tailwindcss`, `postcss`, `autoprefixer`
- `lucide-react` (icon)

### Backend (`backend/package.json`):
- `express`
- `@prisma/client` & `prisma`
- `sqlite3`
- `bcryptjs` (hash password)
- `jsonwebtoken` (auth)
- `multer` (upload file)
- `cors`, `dotenv`

---

## 5. File Tidak Wajib (Generated/Temporary)

Anda **TIDAK PERLU** mendownload folder/file berikut karena akan otomatis dibuat kembali saat menjalankan `npm install` atau build:

- ❌ `node_modules/` (Di root maupun di folder backend)
- ❌ `dist/` (Hasil build frontend)
- ❌ `.clerk/` (Jika ada cache vendor)
- ❌ `backend/prisma/dev.db` (Duplikat, gunakan salah satu yang terbaru, biasanya di `backend/dev.db`)

---

> [!IMPORTANT]
> Jangan lupa untuk copy file **.env** di folder backend secara manual, karena seringkali tersembunyi (hidden file) di file explorer standar.

---

### Tips Pengembangan Selanjutnya
- Gunakan extension **ESLint** dan **Prettier** di VS Code untuk menjaga kualitas kode.
- Extension **Prisma** di VS Code sangat membantu untuk membaca `schema.prisma`.
- Gunakan **Thunder Client** atau **Postman** untuk testing API backend secara terpisah.
