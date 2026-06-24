<?php

use App\Models\Opd;
use App\Models\RespondentProfile;
use App\Models\Survey;
use App\Models\SurveyPeriod;
use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use App\Models\SurveyResponseDetail;
use App\Models\Unit;
use App\Models\User;

beforeEach(function () {
    // 1. Create survey period
    $this->period = SurveyPeriod::create([
        'name' => 'Triwulan III - 2026',
        'start_date' => '2026-07-01',
        'end_date' => '2026-09-30',
        'is_active' => true,
    ]);

    // 2. Create OPD
    $this->opd = Opd::create([
        'name' => 'Dinas Perhubungan',
        'code' => 'DISHUB',
    ]);

    // 3. Create Unit
    $this->unit = Unit::create([
        'opd_id' => $this->opd->id,
        'name' => 'Loket Pengujian Kendaraan',
        'code' => 'LOKET-UJI',
    ]);

    // 4. Create Survey
    $this->survey = Survey::create([
        'title' => 'Survei Dishub',
        'period_id' => $this->period->id,
        'unit_id' => $this->unit->id,
        'is_published' => true,
        'token' => 'dishub-token',
    ]);

    // 5. Create Questions
    $this->question = SurveyQuestion::create([
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

    // 6. Create Respondent Profile
    $this->respondent = RespondentProfile::create([
        'name' => 'Andi Soppeng',
        'gender' => 'L',
        'age' => 35,
        'education' => 'SMA',
        'job' => 'Wiraswasta/Usahawan',
    ]);

    // 7. Create Response
    $this->response = SurveyResponse::create([
        'survey_id' => $this->survey->id,
        'respondent_profile_id' => $this->respondent->id,
        'completed_at' => now(),
    ]);

    // 8. Create Response Detail
    SurveyResponseDetail::create([
        'response_id' => $this->response->id,
        'question_id' => $this->question->id,
        'score' => 4,
    ]);

    // 9. User admin
    $this->user = User::factory()->create([
        'opd_id' => $this->opd->id,
    ]);
});

test('guests are denied access to exports', function () {
    $responsePdf = $this->get(route('export.pdf'));
    $responsePdf->assertRedirect(route('login'));

    $responseExcel = $this->get(route('export.excel'));
    $responseExcel->assertRedirect(route('login'));
});

test('authenticated users can export PDF report layout', function () {
    $this->actingAs($this->user);

    $response = $this->get(route('export.pdf', [
        'period_id' => $this->period->id,
        'opd_id' => $this->opd->id,
    ]));

    $response->assertOk();
    $response->assertSee('LAPORAN HASIL SURVEI KEPUASAN MASYARAKAT');
    $response->assertSee('Dinas Perhubungan');
    $response->assertSee('Triwulan III - 2026');
});

test('authenticated users can export raw data Excel CSV', function () {
    $this->actingAs($this->user);

    $response = $this->get(route('export.excel', [
        'period_id' => $this->period->id,
        'opd_id' => $this->opd->id,
    ]));

    $response->assertOk();

    $disposition = $response->headers->get('Content-Disposition');
    expect($disposition)->toContain('attachment')
        ->and($disposition)->toContain('Data_Mentah_Survei_SKM_Triwulan_III_-_2026');

    $content = $response->streamedContent();
    expect($content)->toContain('LAPORAN DATA RESPONDEN & NILAI UNSUR SKM')
        ->and($content)->toContain('Andi Soppeng')
        ->and($content)->toContain('Dinas Perhubungan');
});
