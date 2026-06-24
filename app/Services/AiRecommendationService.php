<?php

namespace App\Services;

use App\Models\SurveyPeriod;
use App\Models\SurveyResponse;
use App\Models\Unit;
use App\Utils\IkmCalculator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiRecommendationService
{
    /**
     * Local expert system rules for Permen PANRB 14/2017 U1-U9 indicators.
     *
     * @var array<string, array{recommendation: string, action_plans: array<string>}>
     */
    protected static array $rules = [
        'U1' => [
            'recommendation' => 'Tinjau kembali persyaratan administrasi pelayanan agar lebih sederhana, mudah dipahami, dan tidak tumpang tindih.',
            'action_plans' => [
                'Menyusun dan mempublikasikan infografis standar pelayanan yang ringkas & jelas di loket dan media sosial.',
                'Mengurangi berkas persyaratan yang bersifat duplikasi dengan instansi lain melalui integrasi data internal.',
                'Menyediakan loket pra-verifikasi berkas khusus untuk memastikan pemohon melengkapi syarat sebelum mengantre.',
            ],
        ],
        'U2' => [
            'recommendation' => 'Sederhanakan alur birokrasi pelayanan dan terapkan digitalisasi alur untuk memotong antrean manual.',
            'action_plans' => [
                'Menerapkan sistem antrean online mandiri agar pemohon tahu estimasi waktu pelayanan sebelum datang.',
                'Menyusun SOP baru yang memangkas tahapan verifikasi berkas berulang.',
                'Menyediakan petunjuk arah alur layanan fisik yang lebih jelas di ruang pelayanan.',
            ],
        ],
        'U3' => [
            'recommendation' => 'Percepat waktu penyelesaian pelayanan dengan optimalisasi antrean dan pembagian tugas staff.',
            'action_plans' => [
                'Menerapkan sistem shifting petugas di jam istirahat untuk memastikan loket tetap melayani pemohon.',
                'Melakukan digitalisasi pengarsipan berkas untuk mempercepat pencarian data pemohon.',
                'Menetapkan Service Level Agreement (SLA) waktu maksimal penyelesaian layanan per loket.',
            ],
        ],
        'U4' => [
            'recommendation' => 'Tingkatkan transparansi biaya pelayanan dan sediakan metode pembayaran non-tunai resmi.',
            'action_plans' => [
                'Memasang banner informasi tarif resmi (termasuk pelayanan Rp 0/Gratis) secara mencolok di area loket.',
                'Bekerja sama dengan bank daerah untuk menyediakan mesin EDC / QRIS resmi untuk pembayaran tarif.',
                'Menyediakan struk/kuitansi digital ber-QR code untuk setiap transaksi pembayaran resmi.',
            ],
        ],
        'U5' => [
            'recommendation' => 'Lakukan sosialisasi berkala mengenai spesifikasi produk layanan yang diterima agar tidak terjadi salah paham.',
            'action_plans' => [
                'Membuat media edukasi (brosur/video pendek) tentang jenis dan bentuk fisik produk layanan.',
                'Mengadakan lokakarya internal untuk penyamaan persepsi output layanan antar petugas loket.',
                'Menyediakan salinan sampel produk layanan (contoh berkas yang benar) di meja konsultasi.',
            ],
        ],
        'U6' => [
            'recommendation' => 'Lakukan pelatihan berkala untuk petugas pelayanan guna meningkatkan keahlian teknis pelayanan.',
            'action_plans' => [
                'Mengirimkan petugas pelayanan ke pelatihan pelayanan prima (service excellence) dan keterampilan teknis.',
                'Menyusun buku saku/panduan FAQ pelayanan untuk pegangan harian petugas loket.',
                'Mengadakan transfer knowledge mingguan antarsejawat petugas loket.',
            ],
        ],
        'U7' => [
            'recommendation' => 'Terapkan standar budaya pelayanan 5S (Senyum, Sapa, Salam, Sopan, Santun) dan evaluasi performa petugas.',
            'action_plans' => [
                'Mengadakan briefing pagi harian untuk mengingatkan kepatuhan terhadap kode etik 5S pelayanan.',
                'Memasang kotak umpan balik kepuasan sikap petugas (kamera/tablet rating instan) di setiap meja loket.',
                'Memberikan apresiasi bulanan kepada petugas loket dengan rating kepuasan pelanggan terbaik.',
            ],
        ],
        'U8' => [
            'recommendation' => 'Optimalkan unit penanganan aduan masyarakat dan tindak lanjuti setiap keluhan secara berkala.',
            'action_plans' => [
                'Mengaktifkan saluran aduan terintegrasi (WhatsApp/Website/SP4N-LAPOR) dan menunjuk admin khusus aduan.',
                'Mengadakan rapat koordinasi berkala setiap bulan untuk mengevaluasi aduan yang belum terselesaikan.',
                'Memajang alur dan prosedur penyelesaian aduan masyarakat secara transparan.',
            ],
        ],
        'U9' => [
            'recommendation' => 'Lakukan perbaikan sarana ruang tunggu loket untuk memberikan kenyamanan lebih bagi pemohon.',
            'action_plans' => [
                'Menyediakan fasilitas ramah disabilitas seperti guiding block, kursi roda, dan ramp landai.',
                'Memperbaiki kenyamanan ruang tunggu dengan penambahan AC/kipas angin, colokan charger, dan air minum gratis.',
                'Mengatur ulang tata letak kursi tunggu dan memperbarui papan informasi nomor antrean.',
            ],
        ],
    ];

    /**
     * Generate recommendation and action plans based on survey statistics.
     *
     * @return array{
     *     recommendation: string,
     *     action_plans: array<string>,
     *     indicator_code: string,
     *     indicator_name: string,
     *     score: float,
     *     is_fallback: bool
     * }
     */
    public static function generate(int $unitId, int $periodId): array
    {
        $unit = Unit::with('opd')->findOrFail($unitId);
        $period = SurveyPeriod::findOrFail($periodId);

        // Fetch and calculate statistics
        $responseQuery = SurveyResponse::whereHas('survey', function ($q) use ($unitId, $periodId) {
            $q->where('unit_id', $unitId)->where('period_id', $periodId);
        });

        $stats = IkmCalculator::calculate($responseQuery);
        $lowest = $stats['lowest_indicator'];

        if (! $lowest) {
            return [
                'recommendation' => 'Belum terdapat data survei yang memadai untuk menghasilkan analisis rekomendasi AI pada unit ini.',
                'action_plans' => [
                    'Lakukan sosialisasi pengisian survei kepuasan masyarakat kepada pemohon.',
                    'Pastikan kuesioner survei telah dipublikasikan dan aktif.',
                ],
                'indicator_code' => 'N/A',
                'indicator_name' => 'Data tidak tersedia',
                'score' => 0.0,
                'is_fallback' => true,
            ];
        }

        $apiKey = config('services.openai.key');
        $model = config('services.openai.model', 'gpt-4o-mini');

        if ($apiKey) {
            try {
                // Prepare indicators list text for context
                $indicatorsText = '';
                foreach ($stats['indicators'] as $ind) {
                    $indicatorsText .= "- {$ind['name']} ({$ind['code']}): {$ind['nrr']}\n";
                }

                $prompt = "Anda adalah Asisten Kecerdasan Buatan (AI) handal untuk Pemerintah Kabupaten Soppeng, Indonesia. Tugas Anda adalah memberikan Rekomendasi Analitis dan Rencana Aksi Tindak Lanjut (RTL) yang cerdas dan realistis untuk meningkatkan Indeks Kepuasan Masyarakat (IKM) pada unit layanan *{$unit->name}* (di bawah *{$unit->opd->name}*) untuk periode *{$period->name}*.\n\n"
                    ."Berikut adalah hasil penilaian survei berdasarkan unsur Permen PANRB 14/2017:\n"
                    ."{$indicatorsText}\n"
                    ."Unsur dengan performa terendah adalah: *{$lowest['name']} ({$lowest['code']})* dengan nilai rata-rata *{$lowest['score']}* dari skala 4.0.\n\n"
                    ."Silakan berikan respons dalam format JSON dengan struktur persis seperti berikut (jangan sertakan markdown block lainnya seperti ```json, cukup mentah JSON-nya saja):\n"
                    ."{\n"
                    ."  \"recommendation\": \"<Rekomendasi taktis, ringkas, dan jelas dalam 1-2 kalimat untuk memperbaiki unsur terendah ini>\",\n"
                    ."  \"action_plans\": [\n"
                    ."    \"<Rencana aksi tindak lanjut 1 yang konkret dan dapat dikerjakan dalam 1-3 bulan ke depan>\",\n"
                    ."    \"<Rencana aksi tindak lanjut 2 yang konkret>\",\n"
                    ."    \"<Rencana aksi tindak lanjut 3 yang konkret>\"\n"
                    ."  ]\n"
                    ."}\n\n"
                    .'Gunakan bahasa Indonesia yang formal, sopan, dan relevan dengan regulasi pelayanan publik di Indonesia (Permen PANRB 14/2017) serta kontekstual untuk Kabupaten Soppeng.';

                $response = Http::timeout(10)
                    ->withHeaders([
                        'Authorization' => "Bearer {$apiKey}",
                    ])
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => $model,
                        'messages' => [
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'temperature' => 0.5,
                        'max_tokens' => 500,
                    ]);

                if ($response->successful()) {
                    $rawContent = $response->json('choices.0.message.content');

                    if (preg_match('/^\s*```(?:json)?\s*(.*?)\s*```\s*$/s', $rawContent, $matches)) {
                        $rawContent = $matches[1];
                    }

                    $decoded = json_decode($rawContent, true);

                    if (is_array($decoded) && isset($decoded['recommendation']) && isset($decoded['action_plans'])) {
                        return [
                            'recommendation' => (string) $decoded['recommendation'],
                            'action_plans' => (array) $decoded['action_plans'],
                            'indicator_code' => $lowest['code'],
                            'indicator_name' => $lowest['name'],
                            'score' => (float) $lowest['score'],
                            'is_fallback' => false,
                        ];
                    }
                }

                Log::warning('AI Recommendation API parse failed or unsuccessful. Falling back to local rules.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            } catch (\Exception $e) {
                Log::error('AI Recommendation Service API Exception. Falling back to local rules: '.$e->getMessage());
            }
        }

        // Rule-based fallback
        $code = $lowest['code'];
        $rule = self::$rules[$code] ?? [
            'recommendation' => "Tingkatkan performa unsur {$lowest['name']} untuk menaikkan nilai kepuasan pelayanan.",
            'action_plans' => [
                "Melakukan analisis internal terhadap unsur {$lowest['name']}.",
                'Mengadakan Focus Group Discussion (FGD) dengan pemohon layanan.',
                "Menyusun standar operasional perbaikan unsur {$lowest['name']}.",
            ],
        ];

        return [
            'recommendation' => $rule['recommendation'],
            'action_plans' => $rule['action_plans'],
            'indicator_code' => $code,
            'indicator_name' => $lowest['name'],
            'score' => (float) $lowest['score'],
            'is_fallback' => true,
        ];
    }
}
