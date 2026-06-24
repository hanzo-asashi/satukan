<?php

use App\Models\ApiToken;
use App\Models\Opd;
use App\Models\Survey;
use App\Models\SurveyPeriod;
use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use App\Models\Unit;
use App\Utils\IkmCalculator;

beforeEach(function () {
    // 1. Create survey period
    $this->period = SurveyPeriod::create([
        'name' => 'Triwulan II - 2026',
        'start_date' => '2026-04-01',
        'end_date' => '2026-06-30',
        'is_active' => true,
    ]);

    // 2. Create OPD
    $this->opd = Opd::create([
        'name' => 'Dinas Kesehatan',
        'code' => 'DINKES',
    ]);

    // 3. Create Unit
    $this->unit = Unit::create([
        'opd_id' => $this->opd->id,
        'name' => 'Puskesmas Satukan',
        'code' => 'PUSKESMAS-SATUKAN',
    ]);

    // 4. Create Survey
    $this->survey = Survey::create([
        'title' => 'Survei Puskesmas',
        'period_id' => $this->period->id,
        'unit_id' => $this->unit->id,
        'is_published' => true,
        'token' => 'puskesmas-token',
    ]);

    // 5. Create 9 standard questions
    $indicators = [
        ['code' => 'U1', 'name' => 'Persyaratan'],
        ['code' => 'U2', 'name' => 'Prosedur'],
        ['code' => 'U3', 'name' => 'Waktu'],
        ['code' => 'U4', 'name' => 'Biaya'],
        ['code' => 'U5', 'name' => 'Produk'],
        ['code' => 'U6', 'name' => 'Kompetensi'],
        ['code' => 'U7', 'name' => 'Perilaku'],
        ['code' => 'U8', 'name' => 'Penanganan'],
        ['code' => 'U9', 'name' => 'Sarpras'],
    ];

    $this->questions = [];
    foreach ($indicators as $index => $ind) {
        $this->questions[] = SurveyQuestion::create([
            'survey_id' => $this->survey->id,
            'indicator_code' => $ind['code'],
            'indicator_name' => $ind['name'],
            'question_text' => "Pertanyaan {$ind['name']}",
            'scale_1_label' => 'Tidak Baik',
            'scale_2_label' => 'Kurang Baik',
            'scale_3_label' => 'Baik',
            'scale_4_label' => 'Sangat Baik',
            'is_mandatory' => true,
            'order_index' => $index,
        ]);
    }
});

test('public can access landing page and see active stats', function () {
    $response = $this->get(route('home'));
    $response->assertOk();
    $response->assertSee('SATUKAN');
});

test('public can view active survey form with token', function () {
    $response = $this->get(route('survey.show', ['token' => $this->survey->token]));
    $response->assertOk();
    $response->assertSee($this->survey->title);
});

test('public can submit survey answers successfully', function () {
    $answers = array_map(function ($q) {
        return [
            'question_id' => $q->id,
            'score' => 4, // Sangat Baik
        ];
    }, $this->questions);

    $payload = [
        'survey_id' => $this->survey->id,
        'answers' => $answers,
        'respondent' => [
            'name' => 'Budi Santoso',
            'gender' => 'L',
            'age' => 30,
            'education' => 'Sarjana (S1)',
            'job' => 'Pegawai Swasta',
            'phone' => '08123456789',
        ],
        'complaint' => [
            'content' => 'Pelayanan sangat bagus, pertahankan!',
        ],
    ];

    $response = $this->post(route('survey.submit'), $payload);

    $response->assertRedirect(route('survey.complete', ['token' => $this->survey->token]));

    // Check DB
    $this->assertDatabaseHas('respondent_profiles', [
        'name' => 'Budi Santoso',
        'gender' => 'L',
        'education' => 'Sarjana (S1)',
    ]);

    $this->assertDatabaseHas('complaints', [
        'name' => 'Budi Santoso',
        'content' => 'Pelayanan sangat bagus, pertahankan!',
    ]);

    // Calculate IKM manually using calculator
    $calcQuery = SurveyResponse::where('survey_id', $this->survey->id);
    $stats = IkmCalculator::calculate($calcQuery);

    expect($stats['score'])->toBe(100.0) // All 4s should equal score 100
        ->and($stats['grade'])->toBe('A')
        ->and($stats['total_respondents'])->toBe(1);
});

test('prevent duplicate survey submissions from same IP within 5 minutes', function () {
    $answers = array_map(function ($q) {
        return [
            'question_id' => $q->id,
            'score' => 3,
        ];
    }, $this->questions);

    $payload = [
        'survey_id' => $this->survey->id,
        'answers' => $answers,
        'respondent' => [
            'name' => 'Test Dup',
            'gender' => 'P',
            'age' => 25,
            'education' => 'SMA',
            'job' => 'Lainnya',
        ],
    ];

    // First submission
    $response1 = $this->withServerVariables(['REMOTE_ADDR' => '192.168.1.100'])->post(route('survey.submit'), $payload);
    $response1->assertRedirect();

    // Second submission (within 5 minutes, same IP)
    $response2 = $this->withServerVariables(['REMOTE_ADDR' => '192.168.1.100'])->post(route('survey.submit'), $payload);
    $response2->assertRedirect();

    // Check session flash in a robust way that accommodates Inertia v3 flash storage
    $toast = session()->get('inertia.flash_data.toast');
    expect($toast)->not->toBeNull()
        ->and($toast['type'])->toBe('error')
        ->and($toast['message'])->toContain('mencegah duplikasi');
});

test('api endpoints block unauthorized requests', function () {
    $response = $this->getJson('/api/v1/skm/results');
    $response->assertStatus(401);
});

test('api endpoints accept authorized requests', function () {
    $token = ApiToken::create([
        'name' => 'Kiosk 1',
        'token' => hash('sha256', 'token-rahasia-123'),
        'abilities' => ['submit'],
    ]);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer token-rahasia-123',
    ])->getJson('/api/v1/skm/results');

    $response->assertOk();
    $response->assertJsonStructure([
        'status',
        'data' => [
            'ikm_score',
            'grade',
            'total_respondents',
        ],
    ]);
});
