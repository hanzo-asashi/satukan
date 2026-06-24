# SATUKAN - Panduan Deployment & Instalasi

Dokumen ini memuat panduan instalasi lokal dan tata cara deployment aplikasi SATUKAN pada server production.

---

## 💻 Prasyarat Sistem

* **PHP Version**: `^8.3` atau lebih baru (`PHP 8.5` direkomendasikan).
* **Ekstensi PHP**: `PDO`, `openssl`, `mbstring`, `xml`, `curl`, `sqlite3` atau `mysql`.
* **Database**: MySQL 8.0+ atau SQLite.
* **Node.js**: `^20.x` atau lebih baru.
* **Web Server**: Nginx atau Apache.
* **Composer**: `^2.x` untuk manajemen dependensi PHP.
* **Package Manager**: npm atau Bun.

---

## 🛠️ Langkah Instalasi Lokal (Laravel Herd / Laragon)

1. **Clone repositori proyek**:
   ```bash
   git clone <repo-url> satukan
   cd satukan
   ```

2. **Salin konfigurasi environment**:
   ```bash
   cp .env.example .env
   ```

3. **Buka file `.env` dan sesuaikan koneksi database MySQL**:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=satukan
   DB_USERNAME=root
   DB_PASSWORD=BlackID85
   ```

4. **Instal dependensi Backend (PHP)**:
   ```bash
   composer install
   ```

5. **Generate kunci enkripsi aplikasi**:
   ```bash
   php artisan key:generate
   ```

6. **Jalankan migrasi database & seeding awal**:
   ```bash
   php artisan migrate:fresh --seed
   ```
   *Perintah di atas akan membuat tabel dan menyuntikkan data default: 9 indikator kuesioner wajib, OPD percontohan, unit loket percontohan, akun Superadmin, dan OPD Admin.*

7. **Instal dependensi Frontend (React)**:
   ```bash
   npm install
   ```

8. **Kompilasi aset frontend menggunakan Vite**:
   ```bash
   npm run build
   ```

9. **Konfigurasi Akun Petugas Default**:
   - **Superadmin**:
     - Email: `admin@satukan.test`
     - Password: `password`
   - **OPD Admin (Disdukcapil)**:
     - Email: `opd.admin@satukan.test`
     - Password: `password`

---

## 🚀 Konfigurasi Antrean (Queue) & Cache Production

1. **Database Queue**:
   Sistem disiapkan menggunakan driver antrean `database` untuk menampung pengiriman API eksternal dan sinkronisasi nasional di background. Jalankan listener antrean:
   ```bash
   php artisan queue:work --queue=default --sleep=3 --tries=3
   ```
   *Pada production, disarankan menggunakan supervisor untuk memantau proses `queue:work`.*

2. **Redis Cache**:
   Untuk mempercepat pencarian data analitis IKM regional, ubah driver cache pada `.env`:
   ```env
   CACHE_STORE=redis
   REDIS_HOST=127.0.0.1
   ```

3. **Task Scheduler (Cron Job)**:
   Tambahkan cron job pada server production untuk mengotomatiskan sinkronisasi harian ke Portal Nasional:
   ```cron
   * * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
   ```
