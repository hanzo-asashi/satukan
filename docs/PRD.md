PRD (PRODUCT REQUIREMENTS DOCUMENT)
1. Product Name

SATUKAN

2. Product Vision

Platform SKM daerah yang terstandardisasi nasional untuk meningkatkan kualitas layanan publik berbasis data.

3. Problem Statement

Masalah umum:

Pengukuran kepuasan masih manual.
Tidak terintegrasi nasional.
Sulit monitoring OPD.
Tidak ada tindak lanjut terstruktur.
Sulit audit.

Solusi:
SATUKAN menjadi platform terpadu.

4. Target Users
   Super Admin Pemda
   Bagian Ortala
   Admin OPD
   Kepala Dinas
   Masyarakat
   Auditor
   Inspektorat
5. User Roles
   Superadmin

Kontrol penuh.

Admin OPD

Kelola unit.

Pimpinan

Lihat dashboard.

Surveyor

Distribusi survey.

Publik

Isi survey.

6. Functional Requirements
   Survey
   Buat periode
   Publish survey
   QR survey
   Public access
   Analytics
   IKM realtime
   Grade otomatis
   Grafik tren
   Integration
   Sync nasional
   Reporting
   PDF
   Excel
   Follow-up
   CAPA (Corrective Action)
7. Non Functional Requirements
   Response < 2s
   SSL enabled
   High availability
   Audit trail
   Queue-based sync
   Scalable
   DATABASE RELATION (HIGH LEVEL)

users → roles
opds → units
units → surveys
surveys → survey_questions
survey_responses → survey_response_details
survey_responses → respondent_profiles
units → ikm_results
ikm_results → recommendations
recommendations → follow_ups
surveys → national_sync_logs

STRUKTUR FOLDER SQL
database/
├── migrations/
├── seeders/
├── factories/
└── schema/
└── satukan.sql
Setup Lokal
APP_NAME=SATUKAN
APP_URL=https://satukan.test

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=satukan
DB_USERNAME=root
DB_PASSWORD=BlackID85
Perintah Instalasi
composer install
npm install
php artisan migrate
php artisan db:seed
npm run dev
php artisan serve
