# SATUKAN - Dokumentasi API Integrasi

Dokumen ini memuat daftar endpoint API, metode pengiriman data, otentikasi kunci keamanan, dan spesifikasi payload.

---

## 🔒 Otentikasi API

Seluruh request API (di bawah prefix `/api/v1/*`) wajib melampirkan kunci otentikasi. Token API dibuat oleh Superadmin melalui tab **Keamanan & Kredensial** di panel admin.

Kirimkan token menggunakan salah satu header berikut:
```http
Authorization: Bearer <your_api_token>
```
atau
```http
X-API-KEY: <your_api_token>
```

---

## 🚀 Endpoint API

### 1. Submit Data Respon Kuesioner (Kios/External Client)
* **URL**: `/api/v1/skm/submit`
* **Method**: `POST`
* **Deskripsi**: Digunakan oleh kios survei tablet fisik atau chatbot Whatsapp untuk mengirim jawaban survei publik secara programmatic.

#### Request Payload
```json
{
  "survey_token": "disdukcapil-ktp-kk-period-1",
  "answers": [
    { "question_id": 1, "score": 4 },
    { "question_id": 2, "score": 3 },
    { "question_id": 3, "score": 4 },
    { "question_id": 4, "score": 4 },
    { "question_id": 5, "score": 3 },
    { "question_id": 6, "score": 4 },
    { "question_id": 7, "score": 3 },
    { "question_id": 8, "score": 4 },
    { "question_id": 9, "score": 4 }
  ],
  "respondent": {
    "nik": "7300000000000000",
    "name": "Budi Santoso",
    "gender": "L",
    "age": 32,
    "education": "Sarjana (S1)",
    "job": "Pegawai Swasta",
    "phone": "081234567890",
    "email": "budi@email.com"
  },
  "complaint": "Waktu antrian cetak KTP di loket A masih agak lambat."
}
```

#### Response (Success - 201 Created)
```json
{
  "status": "success",
  "message": "Respon survei berhasil disimpan.",
  "data": {
    "response_id": 154,
    "respondent": "Budi Santoso"
  }
}
```

---

### 2. Dapatkan Hasil Indeks (IKM) Regional
* **URL**: `/api/v1/skm/results`
* **Method**: `GET`
* **Deskripsi**: Mengambil hasil IKM agregat terhitung untuk periode survei aktif saat ini.
* **Parameter Query (Opsional)**:
  - `opd_code`: Filter IKM berdasarkan kode OPD (contoh: `DISDUKCAPIL`).
  - `unit_code`: Filter IKM berdasarkan kode Unit Layanan (contoh: `DISDUKCAPIL-KTP-KK`).

#### Response (Success - 200 OK)
```json
{
  "status": "success",
  "data": {
    "ikm_score": 82.50,
    "grade": "B",
    "grade_label": "Baik",
    "total_respondents": 420,
    "lowest_unsur": {
      "code": "U3",
      "name": "Waktu Penyelesaian",
      "score": 3.05
    },
    "highest_unsur": {
      "code": "U4",
      "name": "Biaya/Tarif",
      "score": 3.90
    },
    "indicators": {
      "U1": {
        "code": "U1",
        "name": "Persyaratan",
        "nrr": 3.32,
        "nrr_weighted": 0.369
      }
    }
  }
}
```

---

### 3. Dapatkan Detail Analitis (Dashboard Regional)
* **URL**: `/api/v1/skm/analytics`
* **Method**: `GET`
* **Deskripsi**: Mengambil data komparatif antar OPD dan tren IKM bulanan untuk diintegrasikan ke dashboard utama kabupaten/kota.

#### Response (Success - 200 OK)
```json
{
  "status": "success",
  "data": {
    "overall_score": 82.50,
    "grade": "B",
    "total_respondents": 420,
    "opd_performance": [
      {
        "opd_name": "Dinas Kependudukan dan Pencatatan Sipil",
        "opd_code": "DISDUKCAPIL",
        "score": 85.40,
        "grade": "B",
        "total_respondents": 250
      },
      {
        "opd_name": "Rumah Sakit Umum Daerah",
        "opd_code": "RSUD",
        "score": 78.20,
        "grade": "B",
        "total_respondents": 170
      }
    ]
  }
}
```

---

### 4. Trigger Sinkronisasi Pusat (Manual Push)
* **URL**: `/api/v1/skm/sync/national`
* **Method**: `POST`
* **Deskripsi**: Memicu pengiriman agregat IKM regional ke API Portal SKM Nasional Kementerian PANRB secara instan.

#### Response (Success - 200 OK)
```json
{
  "status": "success",
  "message": "Sinkronisasi berhasil dilakukan."
}
```

---

### 5. Kirim Undangan Survei WhatsApp (Layanan Selesai)
* **URL**: `/api/v1/services/complete`
* **Method**: `POST`
* **Deskripsi**: Dipanggil oleh sistem eksternal (antrean, rumah sakit, dll.) ketika pelayanan warga selesai untuk mengirimkan undangan survei kepuasan via WhatsApp secara otomatis.

#### Request Payload
```json
{
  "phone": "081234567890",
  "unit_code": "DISHUB-KIR"
}
```

#### Response (Success - 200 OK)
```json
{
  "status": "success",
  "message": "Link survei berhasil dikirim ke nomor WhatsApp.",
  "data": {
    "phone": "081234567890",
    "unit": "Pengujian Kendaraan KIR",
    "url": "http://satukan.test/public/survey/kir-survey-token"
  }
}
```
