<?php

use App\Models\Opd;
use App\Models\RespondentProfile;
use App\Models\Setting;
use App\Models\Survey;
use App\Models\SurveyPeriod;
use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use App\Models\SurveyResponseDetail;
use App\Models\Unit;
use Illuminate\Support\Facades\Http;

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

    // 5. Create questions
    $this->questions = [];
    $this->questions[] = SurveyQuestion::create([
        'survey_id' => $this->survey->id,
        'indicator_code' => 'U1',
        'indicator_name' => 'Persyaratan',
        'question_text' => 'Pertanyaan Persyaratan',
        'scale_1_label' => 'Tidak Baik',
        'scale_2_label' => 'Kurang Baik',
        'scale_3_label' => 'Baik',
        'scale_4_label' => 'Sangat Baik',
        'is_mandatory' => true,
        'order_index' => 0,
    ]);

    // Create respondent profile first to satisfy foreign key NOT NULL constraint
    $this->respondent = RespondentProfile::create([
        'name' => 'Responden Test',
        'gender' => 'L',
        'age' => 30,
        'education' => 'SMA',
        'job' => 'Lainnya',
    ]);

    // Create a survey response so we have data to sync
    $response = SurveyResponse::create([
        'survey_id' => $this->survey->id,
        'respondent_profile_id' => $this->respondent->id,
        'ip_address' => '127.0.0.1',
        'completed_at' => now(),
    ]);

    SurveyResponseDetail::create([
        'response_id' => $response->id,
        'question_id' => $this->questions[0]->id,
        'score' => 4,
    ]);
});

test('sync command prints error if integration is disabled', function () {
    Setting::setValue('national_sync_enabled', '0');

    $this->artisan('national:sync')
        ->expectsOutput('Memulai sinkronisasi data IKM ke portal nasional...')
        ->expectsOutput('Gagal: Integrasi nasional belum aktif atau endpoint kosong.')
        ->assertFailed();
});

test('sync command triggers API call and logs success if successful', function () {
    Setting::setValue('national_sync_enabled', '1');
    Setting::setValue('national_api_endpoint', 'https://skm.go.id/api/v1/sync');
    Setting::setValue('national_api_token', 'test-token');

    // Fake HTTP response
    Http::fake([
        'https://skm.go.id/api/v1/sync' => Http::response(['status' => 'success'], 200),
    ]);

    $this->artisan('national:sync')
        ->expectsOutput('Memulai sinkronisasi data IKM ke portal nasional...')
        ->expectsOutput('Sukses: Sinkronisasi ke portal nasional berhasil dilakukan.')
        ->assertSuccessful();

    $this->assertDatabaseHas('national_sync_logs', [
        'status' => 'success',
        'entity_type' => 'ikm_aggregate',
    ]);
});

test('sync command logs failure if API returns error status code', function () {
    Setting::setValue('national_sync_enabled', '1');
    Setting::setValue('national_api_endpoint', 'https://skm.go.id/api/v1/sync');
    Setting::setValue('national_api_token', 'test-token');

    // Fake HTTP error response
    Http::fake([
        'https://skm.go.id/api/v1/sync' => Http::response('Server Error', 500),
    ]);

    $this->artisan('national:sync')
        ->expectsOutput('Memulai sinkronisasi data IKM ke portal nasional...')
        ->expectsOutput('Gagal: Sinkronisasi gagal terkoneksi ke server pusat: Server returned status code: 500 - Server Error')
        ->assertFailed();

    $this->assertDatabaseHas('national_sync_logs', [
        'status' => 'failed',
        'entity_type' => 'ikm_aggregate',
    ]);
});
