<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\NationalSyncLog;
use App\Models\Opd;
use App\Models\RespondentProfile;
use App\Models\Setting;
use App\Models\Survey;
use App\Models\SurveyResponse;
use App\Models\SurveyResponseDetail;
use App\Models\Unit;
use App\Services\WhatsAppService;
use App\Utils\IkmCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SkmApiController extends Controller
{
    /**
     * Submit survey response via API (e.g. for kiosk apps).
     * Endpoint: /api/v1/skm/submit
     */
    public function submit(Request $request): JsonResponse
    {
        $request->validate([
            'survey_token' => ['required', 'exists:surveys,token'],
            'answers' => ['required', 'array'],
            'answers.*.question_id' => ['required', 'exists:survey_questions,id'],
            'answers.*.score' => ['required', 'integer', 'min:1', 'max:4'],

            // Respondent
            'respondent.nik' => ['nullable', 'string', 'size:16'],
            'respondent.name' => ['nullable', 'string', 'max:255'],
            'respondent.gender' => ['nullable', 'in:L,P'],
            'respondent.age' => ['nullable', 'integer', 'min:10', 'max:120'],
            'respondent.education' => ['nullable', 'string', 'max:100'],
            'respondent.job' => ['nullable', 'string', 'max:100'],
            'respondent.phone' => ['nullable', 'string', 'max:50'],
            'respondent.email' => ['nullable', 'email', 'max:255'],

            // Optional Complaint
            'complaint' => ['nullable', 'string', 'max:1000'],
        ]);

        $survey = Survey::where('token', $request->input('survey_token'))->firstOrFail();

        // Prevent spam/duplicates (same IP and survey within 1 minute via API)
        $ipAddress = $request->ip();
        $recent = SurveyResponse::where('survey_id', $survey->id)
            ->where('ip_address', $ipAddress)
            ->where('created_at', '>=', now()->subMinute())
            ->first();

        if ($recent) {
            return response()->json([
                'status' => 'error',
                'message' => 'Duplikasi terdeteksi. Pengisian survei terlalu cepat.',
            ], 429);
        }

        DB::beginTransaction();
        try {
            $profileData = $request->input('respondent', []);
            $respondent = null;

            if (! empty($profileData['nik'])) {
                $respondent = RespondentProfile::where('nik', $profileData['nik'])->first();
            }

            if (! $respondent) {
                $respondent = RespondentProfile::create([
                    'nik' => $profileData['nik'] ?? null,
                    'name' => $profileData['name'] ?? 'Anonymous Kiosk',
                    'gender' => $profileData['gender'] ?? null,
                    'age' => $profileData['age'] ?? null,
                    'education' => $profileData['education'] ?? null,
                    'job' => $profileData['job'] ?? null,
                    'phone' => $profileData['phone'] ?? null,
                    'email' => $profileData['email'] ?? null,
                ]);
            }

            $response = SurveyResponse::create([
                'survey_id' => $survey->id,
                'respondent_profile_id' => $respondent->id,
                'ip_address' => $ipAddress,
                'user_agent' => $request->userAgent() ?? 'Kiosk/API Client',
                'completed_at' => now(),
            ]);

            $answers = $request->input('answers');
            foreach ($answers as $ans) {
                SurveyResponseDetail::create([
                    'response_id' => $response->id,
                    'question_id' => $ans['question_id'],
                    'score' => $ans['score'],
                ]);
            }

            $complaintText = $request->input('complaint');
            if (! empty($complaintText)) {
                Complaint::create([
                    'response_id' => $response->id,
                    'unit_id' => $survey->unit_id,
                    'name' => $respondent->name,
                    'contact' => $respondent->phone ?? $respondent->email,
                    'content' => $complaintText,
                    'status' => 'pending',
                ]);
            }

            DB::commit();

            // Check and trigger WhatsApp escalation for poor scores
            try {
                WhatsAppService::checkAndTriggerEscalation($response);
            } catch (\Exception $e) {
                Log::error('Escalation check error: '.$e->getMessage());
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Respon survei berhasil disimpan.',
                'data' => [
                    'response_id' => $response->id,
                    'respondent' => $respondent->name,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan data: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get IKM overall results.
     * Endpoint: /api/v1/skm/results
     */
    public function results(Request $request): JsonResponse
    {
        $unitCode = $request->query('unit_code');
        $opdCode = $request->query('opd_code');

        $query = SurveyResponse::whereHas('survey.period', function ($q) {
            $q->where('is_active', true);
        });

        if ($unitCode) {
            $query->whereHas('survey.unit', function ($q) use ($unitCode) {
                $q->where('code', $unitCode);
            });
        } elseif ($opdCode) {
            $query->whereHas('survey.unit.opd', function ($q) use ($opdCode) {
                $q->where('code', $opdCode);
            });
        }

        $stats = IkmCalculator::calculate($query);

        return response()->json([
            'status' => 'success',
            'data' => [
                'ikm_score' => $stats['score'],
                'grade' => $stats['grade'],
                'grade_label' => IkmCalculator::getGradeLabel($stats['grade']),
                'total_respondents' => $stats['total_respondents'],
                'lowest_unsur' => $stats['lowest_indicator'],
                'highest_unsur' => $stats['highest_indicator'],
                'indicators' => $stats['indicators'],
            ],
        ]);
    }

    /**
     * Get detailed analytics for reporting.
     * Endpoint: /api/v1/skm/analytics
     */
    public function analytics(Request $request): JsonResponse
    {
        // 1. Get OPD wise performance
        $opds = Opd::all();
        $opdPerformance = [];
        foreach ($opds as $opd) {
            $query = SurveyResponse::whereHas('survey.unit', function ($q) use ($opd) {
                $q->where('opd_id', $opd->id);
            })->whereHas('survey.period', function ($q) {
                $q->where('is_active', true);
            });
            $stats = IkmCalculator::calculate($query);
            $opdPerformance[] = [
                'opd_name' => $opd->name,
                'opd_code' => $opd->code,
                'score' => $stats['score'],
                'grade' => $stats['grade'],
                'total_respondents' => $stats['total_respondents'],
            ];
        }

        // 2. Indicators comparison
        $overallQuery = SurveyResponse::whereHas('survey.period', function ($q) {
            $q->where('is_active', true);
        });
        $overallStats = IkmCalculator::calculate($overallQuery);

        return response()->json([
            'status' => 'success',
            'data' => [
                'overall_score' => $overallStats['score'],
                'grade' => $overallStats['grade'],
                'total_respondents' => $overallStats['total_respondents'],
                'opd_performance' => $opdPerformance,
                'indicators' => $overallStats['indicators'],
            ],
        ]);
    }

    /**
     * Trigger synchronization to national SKM system.
     * Endpoint: /api/v1/skm/sync/national
     */
    public function syncNational(Request $request): JsonResponse
    {
        $syncEnabled = Setting::getValue('national_sync_enabled', '0') === '1';
        $endpoint = Setting::getValue('national_api_endpoint', '');
        $token = Setting::getValue('national_api_token', '');

        if (! $syncEnabled || empty($endpoint)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Integrasi nasional dinonaktifkan atau endpoint belum dikonfigurasi.',
            ], 400);
        }

        $responses = SurveyResponse::whereHas('survey.period', function ($q) {
            $q->where('is_active', true);
        });

        if ($responses->count() === 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada data survei aktif untuk disinkronkan.',
            ], 400);
        }

        $ikmStats = IkmCalculator::calculate($responses);

        $payload = [
            'regional_code' => Setting::getValue('regional_code', ''),
            'regional_name' => Setting::getValue('regional_name', ''),
            'timestamp' => now()->toIso8601String(),
            'total_respondents' => $ikmStats['total_respondents'],
            'ikm_score' => $ikmStats['score'],
            'grade' => $ikmStats['grade'],
            'grade_label' => IkmCalculator::getGradeLabel($ikmStats['grade']),
            'lowest_indicator' => $ikmStats['lowest_indicator'],
            'highest_indicator' => $ikmStats['highest_indicator'],
            'indicators' => $ikmStats['indicators'],
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$token}",
                'Accept' => 'application/json',
            ])->timeout(5)->post($endpoint, $payload);

            if ($response->successful()) {
                NationalSyncLog::create([
                    'entity_type' => 'ikm_aggregate',
                    'entity_id' => 0,
                    'status' => 'success',
                    'response_message' => 'API Push successful: Status '.$response->status(),
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Sinkronisasi berhasil dilakukan.',
                ]);
            } else {
                throw new \Exception('Server HTTP error: Status '.$response->status());
            }
        } catch (\Exception $e) {
            NationalSyncLog::create([
                'entity_type' => 'ikm_aggregate',
                'entity_id' => 0,
                'status' => 'failed',
                'response_message' => 'API Push failed: '.$e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Sinkronisasi gagal: '.$e->getMessage(),
            ], 502);
        }
    }

    /**
     * Trigger automatic survey invitation when a service/transaction completes.
     * Endpoint: /api/v1/services/complete
     */
    public function serviceComplete(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string', 'max:50'],
            'unit_code' => ['required', 'string', 'exists:units,code'],
        ]);

        $unit = Unit::where('code', $request->input('unit_code'))->firstOrFail();

        $survey = Survey::where('unit_id', $unit->id)
            ->where('is_published', true)
            ->whereHas('period', function ($q) {
                $q->where('is_active', true);
            })
            ->first();

        if (! $survey) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada survei aktif untuk unit layanan ini.',
            ], 400);
        }

        $url = url('/public/survey/'.$survey->token);

        $dispatched = WhatsAppService::sendSurveyLink(
            $request->input('phone'),
            $url,
            $unit->name
        );

        if ($dispatched) {
            return response()->json([
                'status' => 'success',
                'message' => 'Link survei berhasil dikirim ke nomor WhatsApp.',
                'data' => [
                    'phone' => $request->input('phone'),
                    'unit' => $unit->name,
                    'url' => $url,
                ],
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Gagal mengirim WhatsApp melalui gateway.',
        ], 500);
    }
}
