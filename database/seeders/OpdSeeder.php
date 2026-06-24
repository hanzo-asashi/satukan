<?php

namespace Database\Seeders;

use App\Models\Opd;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class OpdSeeder extends Seeder
{
    public function run(): void
    {
        $opds = [
            [
                'name' => 'Dinas Kependudukan dan Pencatatan Sipil Kabupaten Soppeng',
                'code' => 'DISDUKCAPIL',
                'address' => 'Jl. Pemuda No. 1, Lalabata Rilau, Kec. Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21102',
                'email' => 'disdukcapil@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Perekaman dan Pencetakan KTP-el',
                        'code' => 'DISDUKCAPIL-KTP',
                        'description' => 'Perekaman sidik jari, retina mata, foto, dan pencetakan fisik kartu tanda penduduk elektronik.',
                    ],
                    [
                        'name' => 'Pelayanan Akta Kelahiran dan Akta Kematian',
                        'code' => 'DISDUKCAPIL-AKTA',
                        'description' => 'Penerbitan kutipan akta kelahiran baru, akta kematian, serta perbaikan data akta pencatatan sipil.',
                    ],
                    [
                        'name' => 'Pelayanan Kartu Keluarga (KK) dan Pindah Datang',
                        'code' => 'DISDUKCAPIL-KK-PINDAH',
                        'description' => 'Pengurusan kartu keluarga baru, perubahan anggota keluarga, dan surat keterangan pindah/datang.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Penanaman Modal, Pelayanan Terpadu Satu Pintu, Tenaga Kerja dan Transmigrasi Kabupaten Soppeng',
                'code' => 'DPMPTSPTKTRANS',
                'address' => 'Jl. Salotungo, Lalabata Rilau, Kec. Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21332',
                'email' => 'dpmptsp@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Perizinan Berusaha Terintegrasi Secara Elektronik (OSS RBA)',
                        'code' => 'DPMPTSPTK-OSS',
                        'description' => 'Pelayanan penerbitan Nomor Induk Berusaha (NIB) dan izin operasional berbasis risiko.',
                    ],
                    [
                        'name' => 'Pelayanan Perizinan Non-Berusaha (Sektor Kesehatan & Pendidikan)',
                        'code' => 'DPMPTSPTK-NON-OSS',
                        'description' => 'Penerbitan izin praktik tenaga kesehatan, izin operasional sekolah swasta, serta rekomendasi teknis lainnya.',
                    ],
                    [
                        'name' => 'Pelayanan Kartu Pencari Kerja (AK-1 / Kartu Kuning)',
                        'code' => 'DPMPTSPTK-KARTU-KUNING',
                        'description' => 'Pendaftaran pencari kerja baru dan penerbitan kartu tanda bukti pencari kerja (kartu kuning).',
                    ],
                ],
            ],
            [
                'name' => 'UPT Rumah Sakit Umum Daerah (RSUD) La Temmamala',
                'code' => 'RSUD-LATEMMAMALA',
                'address' => 'Jl. Malaka Raya, Kec. Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 23456',
                'email' => 'rsudlatemmamala@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Rawat Jalan (Poliklinik Spesialis)',
                        'code' => 'RSUD-RAWAT-JALAN',
                        'description' => 'Pelayanan konsultasi dokter spesialis, pemeriksaan, dan pengobatan medis rawat jalan.',
                    ],
                    [
                        'name' => 'Instalasi Gawat Darurat (IGD) 24 Jam',
                        'code' => 'RSUD-IGD',
                        'description' => 'Pelayanan penanganan medis darurat, kecelakaan, dan pertolongan pertama pasien kritis selama 24 jam.',
                    ],
                    [
                        'name' => 'Pelayanan Laboratorium dan Radiologi',
                        'code' => 'RSUD-LAB-RAD',
                        'description' => 'Pengujian sampel darah, urin, serta pemindaian rontgen, USG, dan rekam diagnostik lainnya.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Kesehatan Kabupaten Soppeng',
                'code' => 'DINKES',
                'address' => 'Jl. Kayangan No. 3, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21105',
                'email' => 'dinkes@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'UPTD Puskesmas Salotungo',
                        'code' => 'DINKES-PKM-SALOTUNGO',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Salotungo melayani pemeriksaan umum dan pengobatan primer.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Sewo',
                        'code' => 'DINKES-PKM-SEWO',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Sewo melayani rawat jalan dan program promosi kesehatan.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Malaka',
                        'code' => 'DINKES-PKM-MALAKA',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Malaka melayani pemeriksaan medis umum bagi masyarakat.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Cangadi',
                        'code' => 'DINKES-PKM-CANGADI',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Cangadi melayani rawat jalan, imunisasi, dan kesehatan ibu anak.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Pacongkang',
                        'code' => 'DINKES-PKM-PACONGKANG',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Pacongkang melayani pemeriksaan kesehatan dasar.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Ganra',
                        'code' => 'DINKES-PKM-GANRA',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Ganra melayani pemeriksaan umum, KB, dan kesehatan gigi.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Citta',
                        'code' => 'DINKES-PKM-CITTA',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Citta melayani pengobatan dasar dan kesehatan lingkungan.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Cabenge',
                        'code' => 'DINKES-PKM-CABENGE',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Cabenge melayani unit gawat darurat dasar dan rawat inap.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Baringeng',
                        'code' => 'DINKES-PKM-BARINGENG',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Baringeng melayani kebutuhan pelayanan kesehatan dasar masyarakat.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Cakkuridi',
                        'code' => 'DINKES-PKM-CAKKURIDI',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Cakkuridi melayani pemeriksaan kesehatan masyarakat.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Tajuncu',
                        'code' => 'DINKES-PKM-TAJUNCU',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Tajuncu melayani konsultasi medis dasar.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Leworeng',
                        'code' => 'DINKES-PKM-LEWORENG',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Leworeng melayani tindakan medis tingkat pertama.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Tanjonge',
                        'code' => 'DINKES-PKM-TANJONGE',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Tanjonge melayani poli umum dan KIA.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Takalala',
                        'code' => 'DINKES-PKM-TAKALALA',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Takalala melayani rawat jalan dan pemeriksaan dasar.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Batu-batu',
                        'code' => 'DINKES-PKM-BATUBATU',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Batu-batu melayani penanganan kegawatdaruratan dan persalinan.',
                    ],
                    [
                        'name' => 'UPTD Puskesmas Goarie',
                        'code' => 'DINKES-PKM-GOARIE',
                        'description' => 'Unit Pelaksana Teknis Daerah Puskesmas Goarie melayani konsultasi dokter dan apotek obat generik.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Pendidikan dan Kebudayaan Kabupaten Soppeng',
                'code' => 'DISDIKBUD',
                'address' => 'Jl. Raya Lalabata No. 12, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21108',
                'email' => 'disdikbud@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Rekomendasi Mutasi Siswa & Guru',
                        'code' => 'DISDIKBUD-MUTASI',
                        'description' => 'Pengurusan mutasi masuk/keluar siswa antar sekolah, serta mutasi dinas guru dan tenaga kependidikan.',
                    ],
                    [
                        'name' => 'Pelayanan Penerbitan Ijazah & Penyetaraan Paket A, B, C',
                        'code' => 'DISDIKBUD-IJAZAH',
                        'description' => 'Legalisasi ijazah sekolah, surat keterangan pengganti ijazah yang hilang, serta penyetaraan ujian kesetaraan.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Sosial Kabupaten Soppeng',
                'code' => 'DINSOS',
                'address' => 'Jl. Kemakmuran No. 8, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21201',
                'email' => 'dinsos@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Rekomendasi Jaminan Kesehatan (PBI-APBD)',
                        'code' => 'DINSOS-PBI',
                        'description' => 'Verifikasi data dan penerbitan rekomendasi jaminan kesehatan daerah gratis bagi warga prasejahtera.',
                    ],
                    [
                        'name' => 'Pelayanan Bantuan Sosial & Data Kemiskinan (DTKS, PKH, BPNT)',
                        'code' => 'DINSOS-BANSOS',
                        'description' => 'Fasilitasi aduan dan pendaftaran warga prasejahtera dalam DTKS serta bantuan sosial Program Keluarga Harapan.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Perhubungan Kabupaten Soppeng',
                'code' => 'DISHUB',
                'address' => 'Jl. Terminal Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21305',
                'email' => 'dishub@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Pengujian Kendaraan Bermotor (KIR)',
                        'code' => 'DISHUB-KIR',
                        'description' => 'Pemeriksaan kelayakan teknis dan keselamatan kendaraan angkutan umum dan barang berkala.',
                    ],
                    [
                        'name' => 'Pelayanan Izin Trayek & Perparkiran',
                        'code' => 'DISHUB-TRAYEK-PARKIR',
                        'description' => 'Penerbitan izin trayek angkutan pedesaan/perkotaan serta pengelolaan retribusi parkir daerah.',
                    ],
                ],
            ],
            [
                'name' => 'Sekretariat Daerah Kabupaten Soppeng',
                'code' => 'SETDA',
                'address' => 'Jl. Pemuda No. 1, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21001',
                'email' => 'setda@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Administrasi Umum & Protokoler',
                        'code' => 'SETDA-MIN-PROT',
                        'description' => 'Pelayanan persuratan, administrasi pimpinan, dan penjadwalan keprotokolan daerah.',
                    ],
                ],
            ],
            [
                'name' => 'Sekretariat DPRD Kabupaten Soppeng',
                'code' => 'SET-DPRD',
                'address' => 'Jl. Wijaya No. 5, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21002',
                'email' => 'set.dprd@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Aspirasi & Pengaduan Masyarakat Terpadu',
                        'code' => 'SET-DPRD-ASPIRASI',
                        'description' => 'Pelayanan penerimaan aspirasi, audiensi, dan audiensi publik di lingkungan DPRD Kabupaten Soppeng.',
                    ],
                ],
            ],
            [
                'name' => 'Inspektorat Daerah Kabupaten Soppeng',
                'code' => 'INSPEKTORAT',
                'address' => 'Jl. Salotungo No. 10, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21003',
                'email' => 'inspektorat@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Whistleblowing System & Pengaduan Penyalahgunaan Wewenang',
                        'code' => 'INSPEKTORAT-ADUAN',
                        'description' => 'Layanan penerimaan aduan dugaan pelanggaran integritas atau pungli di lingkungan aparatur daerah.',
                    ],
                ],
            ],
            [
                'name' => 'Badan Perencanaan Pembangunan, Penelitian dan Pengembangan Daerah Kabupaten Soppeng',
                'code' => 'BAPPELITBANGDA',
                'address' => 'Jl. Pemuda No. 3, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21004',
                'email' => 'bappelitbangda@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Konsultasi Proposal Riset & Pengajuan Kerja Sama',
                        'code' => 'BAPPELITBANGDA-KONSUL',
                        'description' => 'Konsultasi kelayakan rencana riset daerah dan kemitraan akademis pembangunan.',
                    ],
                ],
            ],
            [
                'name' => 'Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Soppeng',
                'code' => 'BKPSDM',
                'address' => 'Jl. Kayangan No. 5, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21005',
                'email' => 'bkpsdm@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Kenaikan Pangkat & Pensiun ASN',
                        'code' => 'BKPSDM-PANGKAT',
                        'description' => 'Pengurusan kenaikan pangkat berkala, kenaikan jabatan, serta persiapan berkas pensiun pegawai.',
                    ],
                    [
                        'name' => 'Pelayanan Pengembangan Kompetensi & Diklat Pegawai',
                        'code' => 'BKPSDM-DIKLAT',
                        'description' => 'Fasilitasi diklat teknis, struktural, fungsional, dan ujian dinas/ujian penyesuaian ijazah.',
                    ],
                ],
            ],
            [
                'name' => 'Badan Pengelolaan Keuangan dan Pendapatan Daerah Kabupaten Soppeng',
                'code' => 'BPKPD',
                'address' => 'Jl. Kemakmuran No. 12, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21006',
                'email' => 'bpkpd@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Pajak Bumi dan Bangunan Perdesaan dan Perkotaan (PBB-P2)',
                        'code' => 'BPKPD-PBB',
                        'description' => 'Pengurusan SPPT PBB, pemecahan objek pajak baru, pemutakhiran data, serta mutasi nama SPPT.',
                    ],
                    [
                        'name' => 'Pelayanan Pajak Daerah & Retribusi Lainnya',
                        'code' => 'BPKPD-PAJAK',
                        'description' => 'Pengurusan pajak hotel, restoran, hiburan, reklame, mineral bukan logam, dan BPHTB.',
                    ],
                ],
            ],
            [
                'name' => 'Badan Kesatuan Bangsa dan Politik Kabupaten Soppeng',
                'code' => 'KESBANGPOL',
                'address' => 'Jl. Attakka No. 2, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21007',
                'email' => 'kesbangpol@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Penerbitan Surat Keterangan Lapor Ormas / LSM',
                        'code' => 'KESBANGPOL-ORMAS',
                        'description' => 'Pencatatan keberadaan organisasi kemasyarakatan baru dan penerbitan bukti lapor resmi.',
                    ],
                ],
            ],
            [
                'name' => 'Badan Penanggulangan Bencana Daerah Kabupaten Soppeng',
                'code' => 'BPBD',
                'address' => 'Jl. Tujuh Belas Agustus No. 4, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21008',
                'email' => 'bpbd@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Kesiapsiagaan, Kebencanaan & Penyaluran Bantuan Darurat',
                        'code' => 'BPBD-BENCANA',
                        'description' => 'Fasilitasi aduan bencana, evakuasi penyelamatan, dan pendistribusian logistik darurat bencana.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Komunikasi dan Informatika Kabupaten Soppeng',
                'code' => 'DISKOMINFO',
                'address' => 'Jl. Pemuda No. 2, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21009',
                'email' => 'diskominfo@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Layanan Pengaduan Publik Terpadu & Permohonan Informasi Publik',
                        'code' => 'DISKOMINFO-INFO',
                        'description' => 'Fasilitasi aduan masyarakat melalui SP4N LAPOR dan permohonan informasi PPID resmi.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Pariwisata, Kepemudaan dan Olahraga Kabupaten Soppeng',
                'code' => 'DISPARPORA',
                'address' => 'Jl. Malaka No. 8, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21010',
                'email' => 'disparpora@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Rekomendasi Tanda Daftar Usaha Pariwisata (TDUP)',
                        'code' => 'DISPARPORA-PARIWISATA',
                        'description' => 'Rekomendasi teknis pembukaan hotel, homestay, rumah makan, destinasi wisata, dan hiburan umum.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Soppeng',
                'code' => 'PUPR',
                'address' => 'Jl. Salotungo No. 4, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21011',
                'email' => 'dpupr@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR)',
                        'code' => 'PUPR-RUANG',
                        'description' => 'Penerbitan rekomendasi tata ruang, koordinat lokasi pembangunan, serta verifikasi pemanfaatan lahan.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Perumahan dan Kawasan Permukiman Kabupaten Soppeng',
                'code' => 'DPKP',
                'address' => 'Jl. Attakka No. 6, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21012',
                'email' => 'dpkp@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Bantuan Perbaikan Rumah Tidak Layak Huni (RTLH)',
                        'code' => 'DPKP-RTLH',
                        'description' => 'Verifikasi dan fasilitasi program bantuan perbaikan rumah tidak layak huni bagi keluarga prasejahtera.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Perdagangan, Perindustrian, Koperasi dan UKM Kabupaten Soppeng',
                'code' => 'DPPKUKM',
                'address' => 'Jl. Kemakmuran No. 15, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21013',
                'email' => 'dppkukm@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Tera dan Tera Ulang UTTP (Alat Ukur, Takar, Timbang)',
                        'code' => 'DPPKUKM-TERA',
                        'description' => 'Pengujian akurasi alat timbangan pasar, tera SPBU, serta tera alat takar resmi dinas.',
                    ],
                    [
                        'name' => 'Pelayanan Fasilitasi Sertifikasi Halal & Pendaftaran Merek UKM',
                        'code' => 'DPPKUKM-UKM',
                        'description' => 'Pendampingan administrasi pengajuan sertifikat halal MUI dan perlindungan merek usaha mikro.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Tanaman Pangan, Hortikultura, Perkebunan dan Ketahanan Pangan Kabupaten Soppeng',
                'code' => 'DTPHPKP',
                'address' => 'Jl. Kayangan No. 10, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21014',
                'email' => 'dtphpkp@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Kartu Tani & Rekomendasi Alokasi Pupuk Bersubsidi',
                        'code' => 'DTPHPKP-PUPUK',
                        'description' => 'Pendataan anggota kelompok tani, verifikasi luas lahan, serta penetapan jatah pupuk bersubsidi.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Pemberdayaan Masyarakat dan Desa Kabupaten Soppeng',
                'code' => 'DPMD',
                'address' => 'Jl. Merdeka No. 6, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21015',
                'email' => 'dpmd@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Pembinaan Administrasi & Evaluasi Kinerja Desa',
                        'code' => 'DPMD-DESA',
                        'description' => 'Fasilitasi konsultasi pengelolaan Anggaran Dana Desa (ADD) dan verifikasi Perdes.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Pemberdayaan Perempuan, Perlindungan Anak, Pengendalian Penduduk dan Keluarga Berencana Kabupaten Soppeng',
                'code' => 'DP3AP2KB',
                'address' => 'Jl. Wijaya No. 12, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21016',
                'email' => 'dp3ap2kb@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Konseling UPTD Perlindungan Perempuan dan Anak (PPA)',
                        'code' => 'DP3AP2KB-UPTD',
                        'description' => 'Layanan pendampingan hukum, psikologis, dan mediasi korban kekerasan dalam rumah tangga serta perlindungan anak.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Peternakan, Kesehatan Hewan dan Perikanan Kabupaten Soppeng',
                'code' => 'DPKHP',
                'address' => 'Jl. Kayangan No. 8, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21017',
                'email' => 'dpkhp@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Klinik Kesehatan Hewan & Rekomendasi Higiene Sanitasi Hewani',
                        'code' => 'DPKHP-HEWAN',
                        'description' => 'Pemeriksaan kesehatan ternak, vaksinasi rabies, serta penerbitan surat keterangan kesehatan daging.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Lingkungan Hidup Kabupaten Soppeng',
                'code' => 'DLH',
                'address' => 'Jl. Attakka No. 8, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21018',
                'email' => 'dlh@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Rekomendasi Dokumen Persetujuan Lingkungan (SPPL/UKL-UPL)',
                        'code' => 'DLH-IZIN',
                        'description' => 'Pengujian amdal, penerbitan kelayakan lingkungan hidup bagi rencana usaha dan pembangunan fisik.',
                    ],
                    [
                        'name' => 'Pelayanan Persampahan, Kebersihan & Retribusi Pelayanan Kebersihan',
                        'code' => 'DLH-SAMPAH',
                        'description' => 'Fasilitasi armada pengangkutan sampah domestik perumahan dan retribusi sampah wilayah perkotaan.',
                    ],
                ],
            ],
            [
                'name' => 'Dinas Perpustakaan dan Kearsipan Kabupaten Soppeng',
                'code' => 'DPK',
                'address' => 'Jl. Pemuda No. 8, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21019',
                'email' => 'dpk@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Keanggotaan & Ruang Baca Perpustakaan Umum Daerah',
                        'code' => 'DPK-PERPUSTAKAAN',
                        'description' => 'Pendaftaran anggota perpustakaan, layanan peminjaman buku fisik, dan akses perpustakaan digital kabupaten.',
                    ],
                ],
            ],
            [
                'name' => 'Satuan Polisi Pamong Praja dan Pemadam Kebakaran Kabupaten Soppeng',
                'code' => 'SATPOLPP-DAMKAR',
                'address' => 'Jl. Merdeka No. 1, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21020',
                'email' => 'satpolpp@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Layanan Penyelamatan Bencana & Pemadaman Kebakaran Darurat',
                        'code' => 'SATPOLPP-DAMKAR-LILIN',
                        'description' => 'Layanan bantuan darurat respon cepat 24 jam kebakaran pemukiman, evakuasi satwa liar, dan penyelamatan korban.',
                    ],
                ],
            ],
            [
                'name' => 'Kantor Kecamatan Lalabata',
                'code' => 'KEC-LALABATA',
                'address' => 'Jl. Merdeka No. 4, Lalabata, Kabupaten Soppeng, Sulawesi Selatan 90812',
                'phone' => '(0484) 21401',
                'email' => 'kec.lalabata@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Administrasi Terpadu Kecamatan (PATEN) Lalabata',
                        'code' => 'KEC-LALABATA-PATEN',
                        'description' => 'Pelayanan surat keterangan dispensasi nikah, legalisasi surat miskin, pengantar nikah, dan pengantar KTP kecamatan.',
                    ],
                ],
            ],
            [
                'name' => 'Kantor Kecamatan Marioriwawo',
                'code' => 'KEC-MARIORIWAWO',
                'address' => 'Jl. Poros Soppeng-Barru, Marioriwawo, Kabupaten Soppeng, Sulawesi Selatan 90821',
                'phone' => '(0484) 21402',
                'email' => 'kec.marioriwawo@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Administrasi Terpadu Kecamatan (PATEN) Marioriwawo',
                        'code' => 'KEC-MARIORIWAWO-PATEN',
                        'description' => 'Pelayanan PATEN pendaftaran izin usaha mikro/kecil tingkat kecamatan, rekomendasi IMB kecil, dan surat keterangan waris.',
                    ],
                ],
            ],
            [
                'name' => 'Kantor Kecamatan Lilirilau',
                'code' => 'KEC-LILIRILAU',
                'address' => 'Jl. Poros Soppeng-Wajo, Lilirilau, Kabupaten Soppeng, Sulawesi Selatan 90851',
                'phone' => '(0484) 21403',
                'email' => 'kec.lilirilau@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Administrasi Terpadu Kecamatan (PATEN) Lilirilau',
                        'code' => 'KEC-LILIRILAU-PATEN',
                        'description' => 'Pemberian rekomendasi izin keramaian skala desa/kelurahan, legalisasi dokumen, serta verifikasi kelengkapan KK/KTP.',
                    ],
                ],
            ],
            [
                'name' => 'Kantor Kecamatan Liliriaja',
                'code' => 'KEC-LILIRIAJA',
                'address' => 'Jl. Poros Lalabata-Cangadi, Liliriaja, Kabupaten Soppeng, Sulawesi Selatan 90831',
                'phone' => '(0484) 21404',
                'email' => 'kec.liliriaja@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Administrasi Terpadu Kecamatan (PATEN) Liliriaja',
                        'code' => 'KEC-LILIRIAJA-PATEN',
                        'description' => 'Layanan pengurusan surat pengantar dinas, PATEN kartu keluarga baru, dan surat keterangan domisili usaha kecamatan.',
                    ],
                ],
            ],
            [
                'name' => 'Kantor Kecamatan Donri-Donri',
                'code' => 'KEC-DONRIDONRI',
                'address' => 'Jl. Poros Tajuncu, Donri-Donri, Kabupaten Soppeng, Sulawesi Selatan 90861',
                'phone' => '(0484) 21405',
                'email' => 'kec.donridonri@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Administrasi Terpadu Kecamatan (PATEN) Donri-Donri',
                        'code' => 'KEC-DONRIDONRI-PATEN',
                        'description' => 'Layanan legalisasi akta jual beli (AJB) tanah non-notaris, izin keramaian umum tingkat kecamatan, dan rekomendasi bansos.',
                    ],
                ],
            ],
            [
                'name' => 'Kantor Kecamatan Ganra',
                'code' => 'KEC-GANRA',
                'address' => 'Jl. Poros Ganra, Ganra, Kabupaten Soppeng, Sulawesi Selatan 90871',
                'phone' => '(0484) 21406',
                'email' => 'kec.ganra@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Administrasi Terpadu Kecamatan (PATEN) Ganra',
                        'code' => 'KEC-GANRA-PATEN',
                        'description' => 'Layanan PATEN surat pengantar izin usaha, verifikasi berkas nikah, dispensasi usia kawin, dan surat keterangan lainnya.',
                    ],
                ],
            ],
            [
                'name' => 'Kantor Kecamatan Citta',
                'code' => 'KEC-CITTA',
                'address' => 'Jl. Poros Citta, Citta, Kabupaten Soppeng, Sulawesi Selatan 90881',
                'phone' => '(0484) 21407',
                'email' => 'kec.citta@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Administrasi Terpadu Kecamatan (PATEN) Citta',
                        'code' => 'KEC-CITTA-PATEN',
                        'description' => 'Pelayanan pendaftaran KTP/KK terpadu, rekomendasi dispensasi nikah, legalisasi dokumen ahli waris kecamatan.',
                    ],
                ],
            ],
            [
                'name' => 'Kantor Kecamatan Marioriawa',
                'code' => 'KEC-MARIORIAWA',
                'address' => 'Jl. Poros Soppeng-Sidrap, Marioriawa, Kabupaten Soppeng, Sulawesi Selatan 90841',
                'phone' => '(0484) 21408',
                'email' => 'kec.marioriawa@soppeng.go.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_Soppeng_Regency.svg',
                'units' => [
                    [
                        'name' => 'Pelayanan Administrasi Terpadu Kecamatan (PATEN) Marioriawa',
                        'code' => 'KEC-MARIORIAWA-PATEN',
                        'description' => 'Fasilitasi pengurusan mutasi penduduk antar daerah, pengantar perkawinan, legalisasi surat keterangan usaha, dan bansos.',
                    ],
                ],
            ],
        ];

        foreach ($opds as $opdData) {
            $units = $opdData['units'];
            unset($opdData['units']);

            $opd = Opd::updateOrCreate(['code' => $opdData['code']], $opdData);

            foreach ($units as $unitData) {
                $unitData['opd_id'] = $opd->id;
                Unit::updateOrCreate(['code' => $unitData['code']], $unitData);
            }
        }
    }
}
