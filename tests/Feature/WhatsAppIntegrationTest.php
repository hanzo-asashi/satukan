<?php

use App\Models\ApiToken;
use App\Models\Opd;
use App\Models\Survey;
use App\Models\SurveyPeriod;
use App\Models\SurveyQuestion;
use App\Models\Unit;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
        'name' => 'Dinas Perhubungan',
        'code' => 'DISHUB',
        'phone' => '08122334455', // OPD Phone for WhatsApp escalation
    ]);

    // 3. Create Unit
    $this->unit = Unit::create([
        'opd_id' => $this->opd->id,
        'name' => 'Pengujian Kendaraan KIR',
        'code' => 'DISHUB-KIR',
    ]);

    // 4. Create Survey
    $this->survey = Survey::create([
        'title' => 'Survei KIR',
        'period_id' => $this->period->id,
        'unit_id' => $this->unit->id,
        'is_published' => true,
        'token' => 'kir-survey-token',
    ]);

    // 5. Create questions
    $this->question = SurveyQuestion::create([
        'survey_id' => $this->survey->id,
        'indicator_code' => 'U1',
        'indicator_name' => 'Persyaratan',
        'question_text' => 'Bagaimana kelengkapan persyaratan?',
        'scale_1_label' => 'Sangat Buruk',
        'scale_2_label' => 'Buruk',
        'scale_3_label' => 'Baik',
        'scale_4_label' => 'Sangat Baik',
        'is_mandatory' => true,
        'order_index' => 1,
    ]);

    // 6. Create API token for authorization
    $this->token = ApiToken::create([
        'name' => 'System Integrator',
        'token' => hash('sha256', 'secure-api-token-999'),
        'abilities' => ['submit'],
    ]);
});

test('service complete endpoint rejects requests without API token', function () {
    $response = $this->postJson('/api/v1/services/complete', [
        'phone' => '081234567890',
        'unit_code' => 'DISHUB-KIR',
    ]);

    $response->assertStatus(401);
});

test('service complete endpoint triggers survey invitation and logs in mock mode', function () {
    // Clear any token to force mock log mode
    config(['services.fonnte.token' => '']);
    Log::shouldReceive('info')
        ->once()
        ->withArgs(fn ($msg) => str_contains($msg, 'MOCK WHATSAPP SEND') && str_contains($msg, 'kir-survey-token') && str_contains($msg, 'Pengujian Kendaraan KIR'))
        ->andReturn(true);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer secure-api-token-999',
    ])->postJson('/api/v1/services/complete', [
        'phone' => '081234567890',
        'unit_code' => 'DISHUB-KIR',
    ]);

    $response->assertOk();
    $response->assertJson([
        'status' => 'success',
        'message' => 'Link survei berhasil dikirim ke nomor WhatsApp.',
    ]);
});

test('service complete endpoint dispatches API request when WHATSAPP_API_TOKEN is configured', function () {
    // Configure API token for testing real dispatch
    config(['services.fonnte.token' => 'dummy-gateway-token']);
    Http::fake([
        'api.fonnte.com/*' => Http::response(['status' => true], 200),
    ]);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer secure-api-token-999',
    ])->postJson('/api/v1/services/complete', [
        'phone' => '081234567890',
        'unit_code' => 'DISHUB-KIR',
    ]);

    $response->assertOk();

    // Assert HTTP request was made correctly
    Http::assertSent(function ($request) {
        return $request->url() === 'https://api.fonnte.com/send' &&
            $request->header('Authorization')[0] === 'dummy-gateway-token' &&
            $request['target'] === '6281234567890' &&
            str_contains($request['message'], 'kir-survey-token');
    });

    // Reset config
    config(['services.fonnte.token' => '']);
});

test('submitting a poor score (1) triggers WhatsApp escalation to Head of OPD', function () {
    // Configure API token for testing real dispatch
    config(['services.fonnte.token' => 'dummy-gateway-token']);
    Http::fake([
        'api.fonnte.com/*' => Http::response(['status' => true], 200),
    ]);

    $payload = [
        'survey_id' => $this->survey->id,
        'answers' => [
            [
                'question_id' => $this->question->id,
                'score' => 1, // Sangat Buruk (Triggers escalation)
            ],
        ],
        'respondent' => [
            'name' => 'Warga Soppeng Kecewa',
            'gender' => 'L',
            'age' => 45,
            'education' => 'SMA',
            'job' => 'Lainnya',
            'phone' => '08999999999',
        ],
        'complaint' => [
            'content' => 'Pelayanan KIR sangat lambat dan berbelit-belit!',
        ],
    ];

    $response = $this->post(route('survey.submit'), $payload);
    $response->assertRedirect();

    // Verify escalation was sent to OPD head's number (628122334455)
    Http::assertSent(function ($request) {
        return $request->url() === 'https://api.fonnte.com/send' &&
            $request->header('Authorization')[0] === 'dummy-gateway-token' &&
            $request['target'] === '628122334455' &&
            str_contains($request['message'], 'ESKALASI ADUAN SANGAT BURUK') &&
            str_contains($request['message'], 'Warga Soppeng Kecewa') &&
            str_contains($request['message'], 'Pelayanan KIR sangat lambat');
    });

    // Reset config
    config(['services.fonnte.token' => '']);
});
