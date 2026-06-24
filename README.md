# SATUKAN - Sistem Terpadu Ukur Kepuasan Masyarakat Nasional

SATUKAN adalah aplikasi web tingkat produksi untuk mengukur Indeks Kepuasan Masyarakat (IKM) pada loket pelayanan publik regional. Sistem ini dibangun dengan kepatuhan penuh terhadap **Permen PANRB No. 14 Tahun 2017** tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik.

Aplikasi ini mengusung arsitektur modern berbasis **Laravel 13**, **React 19**, **Inertia.js v3**, dan **Tailwind CSS v4**.

---

## 📋 Fitur Utama & Kepatuhan PANRB

1. **Sembilan Indikator Wajib SKM (Permen PANRB 14/2017)**:
   - U1: Persyaratan
   - U2: Sistem, Mekanisme, dan Prosedur
   - U3: Waktu Penyelesaian
   - U4: Biaya/Tarif
   - U5: Produk Spesifikasi Jenis Pelayanan
   - U6: Kompetensi Pelaksana
   - U7: Perilaku Pelaksana
   - U8: Penanganan Pengaduan, Saran, dan Masukan
   - U9: Sarana dan Prasarana

2. **Kalkulasi & Konversi Otomatis IKM**:
   - Penghitungan Nilai Rata-Rata (NRR) per Unsur.
   - Bobot rata-rata tertimbang IKM Nasional.
   - Konversi skor mutu pelayanan (A/B/C/D).

3. **Modul Pengguna Multi-Level**:
   - **Superadmin**: Konfigurasi global daerah, API Kunci Integrasi, manajemen OPD, monitoring audit log nasional.
   - **Admin OPD**: Manajemen unit layanan spesifik, penjadwalan periode survei, analisis grafik unsur, pembuatan rekomendasi, dan tindak lanjut progress aksi.

4. **Kios & Portal Survei Publik**:
   - QR Code instan per unit loket pelayanan.
   - Mode Pengisian Cepat / Anonim.
   - Proteksi pengisian ganda (IP & Timestamp rate limiting).
   - Kotak pengaduan publik terpadu.

5. **Sinkronisasi Integrasi API Nasional**:
   - API Push data IKM ke portal SKM Kementerian PANRB.
   - Log pelaporan detail & retry queue.

---

## 📂 Panduan Dokumentasi Terkait

Untuk mempermudah pemahaman arsitektur dan operasional sistem, silakan merujuk ke dokumen berikut:

* 📖 **[Dokumentasi API Integrasi](file:///D:/Code/satukan/API_DOCS.md)**: Detail endpoint API, parameter request, format response, dan mekanisme otentikasi X-API-KEY.
* ⚙️ **[Panduan Deployment & Instalasi](file:///D:/Code/satukan/DEPLOYMENT.md)**: Langkah-langkah instalasi lokal (Herd/Sail), konfigurasi database, antrean, dan prapemrosesan aset.
* 🇮🇩 **[Integrasi Portal SKM Nasional](file:///D:/Code/satukan/NATIONAL_INTEGRATION.md)**: Alur sinkronisasi data IKM daerah ke database pusat Kementerian PANRB.

---

## 🛠️ Tech Stack yang Digunakan

* **Backend**: PHP 8.5, Laravel 13, SQLite / MySQL
* **Frontend**: React 19, InertiaJS v3, TailwindCSS v4, Lucide Icons, Sonner Toaster
* **Keamanan**: Authentication Fortify + Passkey (WebAuthn), RBAC, IP Rate Limiter, CSRF & XSS protection
* **Testing Suite**: Pest PHP v4 (45 Feature & Unit Tests)
