# TODO List - SATUKAN (Sistem Terpadu Ukur Kepuasan Masyarakat Nasional)
## Rencana Pengembangan Fitur untuk Pemerintah Kabupaten Soppeng

Dokumen ini berisi peta jalan pengembangan fitur tambahan untuk menyempurnakan aplikasi SATUKAN agar siap digunakan di lingkungan Pemerintah Kabupaten Soppeng.

- [x] **1. Ekspor Dokumen Laporan Resmi Standar Permen PANRB 14/2017 Lengkap (PDF & Excel)** <!-- id: 1 -->
  - Otomatisasi generate format laporan resmi SKM sesuai lampiran Permen PANRB No. 14 Tahun 2017 (termasuk surat pernyataan, rincian hitungan NRR unsur, kesimpulan, dan tanda tangan kepala OPD).
- [x] **2. Peta Spasial Kepuasan Pelayanan (Regional Heatmap Analytics)** <!-- id: 2 -->
  - Peta digital interaktif Kabupaten Soppeng di dashboard Superadmin untuk menandai tingkat kepuasan per OPD/Kecamatan dengan warna hijau/kuning/merah.
- [x] **3. Integrasi WhatsApp Gateway untuk Pengisian & Notifikasi Aduan** <!-- id: 3 -->
  - Mengirim link survei secara otomatis setelah layanan selesai, dan sistem eskalasi instan via WhatsApp ke Kepala OPD jika ada aduan publik bernilai "Sangat Buruk".
- [x] **4. Kiosk Mode Interface untuk Tablet Loket Pelayanan** <!-- id: 4 -->
  - Antarmuka khusus tablet dengan tombol besar, minim teks, transisi cepat, dan fitur auto-reset jika idle selama 15 detik.
- [x] **5. Sistem Rekomendasi Tindak Lanjut Berbasis AI (AI Recommendation)** <!-- id: 5 -->
  - Analisis otomatis yang memberikan saran rencana aksi (RTL) secara cerdas jika ada unsur survei yang bernilai rendah.
- [x] **6. Executive Dashboard untuk Bupati / Sekretaris Daerah** <!-- id: 6 -->
  - Ringkasan eksekutif makro untuk pimpinan daerah, mencakup peringkat OPD terbaik/terburuk, tren daerah, dan rasio penyelesaian RTL.

## Pengembangan Lanjutan (Gap & Keamanan)

- [ ] **7. Honeypot & Anti-Spam (Keamanan Portal Publik)** <!-- id: 7 -->
  - Implementasi field honeypot tersembunyi pada pengisian survei publik untuk membedakan bot dengan manusia secara otomatis tanpa mengganggu pengguna nyata.
- [ ] **8. Otomatisasi Sinkronisasi Nasional (Laravel Scheduler & Queue)** <!-- id: 8 -->
  - Penjadwalan otomatis sinkronisasi ke `skm.go.id` menggunakan Laravel Scheduler serta antrean (Queue Job) dengan mekanisme retry otomatis jika server pusat downtime.
- [ ] **9. PWA & Offline Mode untuk Kiosk Tablet** <!-- id: 9 -->
  - Dukungan Progressive Web App (PWA) dan local storage (IndexedDB) agar tablet kiosk di loket tetap berfungsi optimal saat offline dan otomatis sinkron saat online.
- [ ] **10. Lokalisasi Bahasa Bugis & Audio Inklusif** <!-- id: 10 -->
  - Menyediakan opsi terjemahan kuesioner ke Bahasa Bugis Soppeng dan opsi audio read-aloud untuk penyandang disabilitas atau lansia.
- [ ] **11. Klasifikasi Pengaduan & Sentimen Berbasis AI** <!-- id: 11 -->
  - Analisis otomatis isi kotak saran/aduan publik ke dalam kategori sentimen (Positif, Netral, Negatif) dan prioritas penanganan.
- [ ] **12. Portal Pelacakan Aduan Dua Arah (WhatsApp Bot)** <!-- id: 12 -->
  - Interaksi WA Gateway interaktif agar masyarakat bisa mengirim pengaduan langsung dan melacak status tindak lanjut (Rencana Aksi) OPD via chat WhatsApp.


