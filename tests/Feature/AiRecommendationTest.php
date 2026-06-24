<?php

use App\Models\Opd;
use App\Models\Recommendation;
use App\Models\RespondentProfile;
use App\Models\Role;
use App\Models\Survey;
use App\Models\SurveyPeriod;
use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use App\Models\SurveyResponseDetail;
use App\Models\Unit;
use App\Models\User;
use App\Services\AiRecommendationService;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    // Run seeders
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);

    // Create survey period
    $this->period = SurveyPeriod::create([
        'name' => 'Triwulan II - 2026',
        'start_date' => '2026-04-01',
        'end_date' => '2026-06-30',
        'is_active' => true,
    ]);

    // Create OPD
    $this->opd = Opd::create([
        'name' => 'Dinas Kesehatan',
        'code' => 'DINKES',
    ]);

    // Create Unit
    $this->unit = Unit::create([
        'opd_id' => $this->opd->id,
        'name' => 'Puskesmas Lalabata',
        'code' => 'PUSK-LALABATA',
    ]);

    // Create Survey
    $this->survey = Survey::create([
        'title' => 'Survei Puskesmas Lalabata',
        'period_id' => $this->period->id,
        'unit_id' => $this->unit->id,
        'is_published' => true,
        'token' => 'lalabata-token',
    ]);

    // Create 9 standard questions
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
        $this->questions[$ind['code']] = SurveyQuestion::create([
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

    // Create Respondent Profile
    $this->respondent = RespondentProfile::create([
        'name' => 'Andi Soppeng',
        'gender' => 'L',
        'age' => 35,
        'education' => 'SMA',
        'job' => 'Wiraswasta/Usahawan',
    ]);

    // Create a response
    $this->response = SurveyResponse::create([
        'survey_id' => $this->survey->id,
        'respondent_profile_id' => $this->respondent->id,
        'completed_at' => now(),
    ]);

    // Create response details with U9 having a low score (2.0) and others having high score (4.0)
    foreach ($this->questions as $code => $q) {
        SurveyResponseDetail::create([
            'response_id' => $this->response->id,
            'question_id' => $q->id,
            'score' => $code === 'U9' ? 2 : 4,
        ]);
    }

    // Set up users
    $this->superAdmin = User::factory()->create();
    $this->superAdmin->roles()->attach(Role::where('slug', 'superadmin')->first());

    $this->opdAdmin = User::factory()->create([
        'opd_id' => $this->opd->id,
    ]);
    $this->opdAdmin->roles()->attach(Role::where('slug', 'admin_opd')->first());

    $this->otherOpd = Opd::create([
        'name' => 'Dinas Pendidikan',
        'code' => 'DISDIK',
    ]);
    $this->otherOpdAdmin = User::factory()->create([
        'opd_id' => $this->otherOpd->id,
    ]);
    $this->otherOpdAdmin->roles()->attach(Role::where('slug', 'admin_opd')->first());
});

test('service correctly identifies lowest indicator and generates rule fallback', function () {
    // Ensure OpenAI API key is null to trigger local fallback
    Config::set('services.openai.key', null);

    $result = AiRecommendationService::generate($this->unit->id, $this->period->id);

    expect($result)->toBeArray()
        ->and($result['indicator_code'])->toBe('U9')
        ->and($result['score'])->toBe(2.0)
        ->and($result['is_fallback'])->toBeTrue()
        ->and($result['recommendation'])->toContain('ruang tunggu loket')
        ->and($result['action_plans'])->toBeArray()
        ->and($result['action_plans'][0])->toContain('ramah disabilitas');
});

test('service calls OpenAI API when credentials exist', function () {
    // Set API Key
    Config::set('services.openai.key', 'fake-key');

    // Fake HTTP request to OpenAI
    Http::fake([
        'https://api.openai.com/v1/chat/completions' => Http::response([
            'choices' => [
                [
                    'message' => [
                        'content' => json_encode([
                            'recommendation' => 'Rekomendasi AI Keren untuk Sarpras.',
                            'action_plans' => [
                                'Rencana Aksi AI 1',
                                'Rencana Aksi AI 2',
                            ],
                        ]),
                    ],
                ],
            ],
        ], 200),
    ]);

    $result = AiRecommendationService::generate($this->unit->id, $this->period->id);

    expect($result)->toBeArray()
        ->and($result['indicator_code'])->toBe('U9')
        ->and($result['score'])->toBe(2.0)
        ->and($result['is_fallback'])->toBeFalse()
        ->and($result['recommendation'])->toBe('Rekomendasi AI Keren untuk Sarpras.')
        ->and($result['action_plans'])->toEqual(['Rencana Aksi AI 1', 'Rencana Aksi AI 2']);
});

test('service falls back to local rules if OpenAI API fails or times out', function () {
    Config::set('services.openai.key', 'fake-key');

    // Fake HTTP request to fail
    Http::fake([
        'https://api.openai.com/v1/chat/completions' => Http::response([], 500),
    ]);

    $result = AiRecommendationService::generate($this->unit->id, $this->period->id);

    expect($result)->toBeArray()
        ->and($result['indicator_code'])->toBe('U9')
        ->and($result['is_fallback'])->toBeTrue()
        ->and($result['recommendation'])->toContain('ruang tunggu loket');
});

test('guest cannot access generate-ai endpoint', function () {
    $response = $this->post(route('recommendations.generate-ai'), [
        'unit_id' => $this->unit->id,
        'period_id' => $this->period->id,
    ]);

    $response->assertRedirect(route('login'));
});

test('opd admin can generate-ai recommendation for their own unit', function () {
    $this->actingAs($this->opdAdmin);

    $response = $this->postJson(route('recommendations.generate-ai'), [
        'unit_id' => $this->unit->id,
        'period_id' => $this->period->id,
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'recommendation',
            'action_plans',
            'indicator_code',
            'indicator_name',
            'score',
            'is_fallback',
        ])
        ->assertJson([
            'indicator_code' => 'U9',
            'is_fallback' => true,
        ]);
});

test('opd admin cannot generate-ai recommendation for unit of another opd', function () {
    $this->actingAs($this->otherOpdAdmin);

    $response = $this->postJson(route('recommendations.generate-ai'), [
        'unit_id' => $this->unit->id,
        'period_id' => $this->period->id,
    ]);

    $response->assertStatus(403);
});

test('superadmin can generate-ai recommendation for any unit', function () {
    $this->actingAs($this->superAdmin);

    $response = $this->postJson(route('recommendations.generate-ai'), [
        'unit_id' => $this->unit->id,
        'period_id' => $this->period->id,
    ]);

    $response->assertOk()
        ->assertJson([
            'indicator_code' => 'U9',
        ]);
});

test('store recommendation endpoint saves optional checked action plans as follow-ups', function () {
    $this->actingAs($this->opdAdmin);

    $payload = [
        'unit_id' => $this->unit->id,
        'period_id' => $this->period->id,
        'content' => 'Rekomendasi test',
        'action_plans' => [
            'Rencana Aksi Test 1',
            'Rencana Aksi Test 2',
        ],
    ];

    $response = $this->post(route('recommendations.store'), $payload);

    $response->assertRedirect();

    // Verify recommendation was created
    $this->assertDatabaseHas('recommendations', [
        'unit_id' => $this->unit->id,
        'period_id' => $this->period->id,
        'content' => 'Rekomendasi test',
    ]);

    $rec = Recommendation::where('content', 'Rekomendasi test')->first();
    expect($rec)->not->toBeNull();

    // Verify follow-ups were created
    $this->assertDatabaseHas('follow_ups', [
        'recommendation_id' => $rec->id,
        'action_plan' => 'Rencana Aksi Test 1',
        'status' => 'not_started',
    ]);

    $this->assertDatabaseHas('follow_ups', [
        'recommendation_id' => $rec->id,
        'action_plan' => 'Rencana Aksi Test 2',
        'status' => 'not_started',
    ]);
});
