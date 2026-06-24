<?php

use App\Models\Opd;
use App\Models\Survey;
use App\Models\SurveyPeriod;
use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use App\Models\Unit;

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
});

test('public can submit survey answers successfully when honeypot is empty', function () {
    $answers = [
        [
            'question_id' => $this->questions[0]->id,
            'score' => 4,
        ],
    ];

    $payload = [
        'survey_id' => $this->survey->id,
        'website' => '', // empty honeypot
        'answers' => $answers,
        'respondent' => [
            'name' => 'Responden Asli',
            'gender' => 'L',
            'age' => 30,
            'education' => 'SMA',
            'job' => 'Swasta',
        ],
    ];

    $response = $this->post(route('survey.submit'), $payload);

    $response->assertRedirect(route('survey.complete', ['token' => $this->survey->token]));

    // Assert it saved to DB
    $this->assertDatabaseHas('respondent_profiles', [
        'name' => 'Responden Asli',
    ]);
    expect(SurveyResponse::where('survey_id', $this->survey->id)->count())->toBe(1);
});

test('public submission is silently ignored when honeypot is filled', function () {
    $answers = [
        [
            'question_id' => $this->questions[0]->id,
            'score' => 4,
        ],
    ];

    $payload = [
        'survey_id' => $this->survey->id,
        'website' => 'http://spam-bot.com', // filled honeypot (bot)
        'answers' => $answers,
        'respondent' => [
            'name' => 'Spam Bot',
            'gender' => 'L',
            'age' => 30,
            'education' => 'SMA',
            'job' => 'Swasta',
        ],
    ];

    $response = $this->post(route('survey.submit'), $payload);

    // Should still redirect to completion screen to trick the bot
    $response->assertRedirect(route('survey.complete', ['token' => $this->survey->token]));

    // Assert it did NOT save to DB
    $this->assertDatabaseMissing('respondent_profiles', [
        'name' => 'Spam Bot',
    ]);
    expect(SurveyResponse::where('survey_id', $this->survey->id)->count())->toBe(0);
});
