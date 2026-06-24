<?php

namespace Database\Seeders;

use App\Models\Survey;
use App\Models\SurveyPeriod;
use App\Models\SurveyQuestion;
use App\Models\Unit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class IndicatorSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure an active survey period exists
        $period = SurveyPeriod::updateOrCreate(
            ['name' => 'Triwulan II - 2026'],
            [
                'start_date' => '2026-04-01',
                'end_date' => '2026-06-30',
                'is_active' => true,
            ]
        );

        // 2. Define the 9 Permen PANRB No.14 Tahun 2017 indicators
        $indicators = [
            [
                'code' => 'U1',
                'name' => 'Persyaratan',
                'question' => 'Bagaimana pendapat Saudara tentang kemudahan persyaratan pelayanan di unit ini?',
                'scale_1' => 'Tidak Sesuai',
                'scale_2' => 'Kurang Sesuai',
                'scale_3' => 'Sesuai',
                'scale_4' => 'Sangat Sesuai',
            ],
            [
                'code' => 'U2',
                'name' => 'Sistem, Mekanisme, dan Prosedur',
                'question' => 'Bagaimana pemahaman Saudara tentang kemudahan alur/prosedur pelayanan di unit ini?',
                'scale_1' => 'Tidak Mudah',
                'scale_2' => 'Kurang Mudah',
                'scale_3' => 'Mudah',
                'scale_4' => 'Sangat Mudah',
            ],
            [
                'code' => 'U3',
                'name' => 'Waktu Penyelesaian',
                'question' => 'Bagaimana pendapat Saudara tentang kecepatan waktu dalam penyelesaian pelayanan?',
                'scale_1' => 'Tidak Cepat',
                'scale_2' => 'Kurang Cepat',
                'scale_3' => 'Cepat',
                'scale_4' => 'Sangat Cepat',
            ],
            [
                'code' => 'U4',
                'name' => 'Biaya/Tarif',
                'question' => 'Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam mendapatkan pelayanan?',
                'scale_1' => 'Sangat Mahal',
                'scale_2' => 'Cukup Mahal',
                'scale_3' => 'Murah/Wajar',
                'scale_4' => 'Gratis/Sangat Murah',
            ],
            [
                'code' => 'U5',
                'name' => 'Produk Spesifikasi Jenis Pelayanan',
                'question' => 'Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara standar dengan hasil yang diberikan?',
                'scale_1' => 'Tidak Sesuai',
                'scale_2' => 'Kurang Sesuai',
                'scale_3' => 'Sesuai',
                'scale_4' => 'Sangat Sesuai',
            ],
            [
                'code' => 'U6',
                'name' => 'Kompetensi Pelaksana',
                'question' => 'Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam memberikan pelayanan?',
                'scale_1' => 'Tidak Kompeten',
                'scale_2' => 'Kurang Kompeten',
                'scale_3' => 'Kompeten',
                'scale_4' => 'Sangat Kompeten',
            ],
            [
                'code' => 'U7',
                'name' => 'Perilaku Pelaksana',
                'question' => 'Bagaimana pendapat Saudara tentang perilaku petugas terkait kesopanan dan keramahan?',
                'scale_1' => 'Tidak Sopan/Ramah',
                'scale_2' => 'Kurang Sopan/Ramah',
                'scale_3' => 'Sopan/Ramah',
                'scale_4' => 'Sangat Sopan/Ramah',
            ],
            [
                'code' => 'U8',
                'name' => 'Penanganan Pengaduan, Saran dan Masukan',
                'question' => 'Bagaimana pendapat Saudara tentang kualitas penanganan pengaduan, saran, dan masukan di unit pelayanan?',
                'scale_1' => 'Tidak Respon',
                'scale_2' => 'Kurang Respon',
                'scale_3' => 'Responsif',
                'scale_4' => 'Sangat Responsif',
            ],
            [
                'code' => 'U9',
                'name' => 'Sarana dan Prasarana',
                'question' => 'Bagaimana pendapat Saudara tentang kenyamanan dan kualitas sarana prasarana pendukung pelayanan?',
                'scale_1' => 'Buruk',
                'scale_2' => 'Cukup/Kurang Baik',
                'scale_3' => 'Baik/Nyaman',
                'scale_4' => 'Sangat Baik/Mewah',
            ],
        ];

        // 3. Create default surveys for all units
        $units = Unit::all();
        foreach ($units as $unit) {
            $survey = Survey::updateOrCreate(
                [
                    'period_id' => $period->id,
                    'unit_id' => $unit->id,
                ],
                [
                    'title' => 'Survei Kepuasan Masyarakat - '.$unit->name,
                    'description' => 'Evaluasi kepuasan masyarakat terhadap pelayanan '.$unit->name.' berdasarkan Permen PANRB No. 14 Tahun 2017.',
                    'is_published' => true,
                    'token' => Str::slug($unit->code).'-period-'.$period->id,
                ]
            );

            // Create survey questions
            foreach ($indicators as $index => $ind) {
                SurveyQuestion::updateOrCreate(
                    [
                        'survey_id' => $survey->id,
                        'indicator_code' => $ind['code'],
                    ],
                    [
                        'indicator_name' => $ind['name'],
                        'question_text' => $ind['question'],
                        'scale_1_label' => $ind['scale_1'],
                        'scale_2_label' => $ind['scale_2'],
                        'scale_3_label' => $ind['scale_3'],
                        'scale_4_label' => $ind['scale_4'],
                        'is_mandatory' => true,
                        'order_index' => $index,
                    ]
                );
            }
        }
    }
}
