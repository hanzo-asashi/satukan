<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Opd;
use App\Models\RespondentProfile;
use App\Models\Survey;
use App\Models\SurveyResponse;
use App\Models\SurveyResponseDetail;
use App\Services\WhatsAppService;
use App\Utils\IkmCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PublicSurveyController extends Controller
{
    /**
     * Display the public landing page with statistics and survey choices.
     */
    public function index(): Response
    {
        $opds = Opd::with('units')->get();

        // Calculate global IKM stats
        $activeResponses = SurveyResponse::whereHas('survey.period', function ($query) {
            $query->where('is_active', true);
        });

        $ikmStats = IkmCalculator::calculate($activeResponses);

        return Inertia::render('welcome', [
            'opds' => $opds,
            'globalStats' => [
                'score' => $ikmStats['score'],
                'grade' => $ikmStats['grade'],
                'grade_label' => IkmCalculator::getGradeLabel($ikmStats['grade']),
                'total_respondents' => $ikmStats['total_respondents'],
                'lowest_indicator' => $ikmStats['lowest_indicator'],
                'highest_indicator' => $ikmStats['highest_indicator'],
            ],
        ]);
    }

    /**
     * Show the public survey form for a specific survey token.
     */
    public function show(string $token): Response
    {
        $survey = Survey::with(['unit.opd', 'questions' => function ($q) {
            $q->orderBy('order_index');
        }])->where('token', $token)->where('is_published', true)->firstOrFail();

        return Inertia::render('public/survey', [
            'survey' => $survey,
        ]);
    }

    /**
     * Submit a public survey response.
     */
    public function submit(Request $request): RedirectResponse
    {
        $request->validate([
            'survey_id' => ['required', 'exists:surveys,id'],
            'answers' => ['required', 'array'],
            'answers.*.question_id' => ['required', 'exists:survey_questions,id'],
            'answers.*.score' => ['required', 'integer', 'min:1', 'max:4'],

            // Respondent Profile (optional or conditional validation)
            'respondent.nik' => ['nullable', 'string', 'size:16'],
            'respondent.name' => ['nullable', 'string', 'max:255'],
            'respondent.gender' => ['nullable', 'in:L,P'],
            'respondent.age' => ['nullable', 'integer', 'min:10', 'max:120'],
            'respondent.education' => ['nullable', 'string', 'max:100'],
            'respondent.job' => ['nullable', 'string', 'max:100'],
            'respondent.phone' => ['nullable', 'string', 'max:50'],
            'respondent.email' => ['nullable', 'email', 'max:255'],

            // Optional Complaint
            'complaint.content' => ['nullable', 'string', 'max:1000'],
        ]);

        $survey = Survey::where('id', $request->input('survey_id'))->firstOrFail();

        // 1. Duplicate Prevention check (same IP and Survey ID within last 5 minutes)
        $ipAddress = $request->ip();
        $recentResponse = SurveyResponse::where('survey_id', $survey->id)
            ->where('ip_address', $ipAddress)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->first();

        if ($recentResponse) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Anda telah mengisi survei ini dalam 5 menit terakhir. Silakan coba lagi nanti untuk mencegah duplikasi.',
            ]);

            return redirect()->back();
        }

        DB::beginTransaction();
        try {
            // 2. Create or find Respondent Profile
            $profileData = $request->input('respondent', []);
            $respondent = null;

            // If NIK is provided, try to find or create
            if (! empty($profileData['nik'])) {
                $respondent = RespondentProfile::where('nik', $profileData['nik'])->first();
            }

            if (! $respondent) {
                $respondent = RespondentProfile::create([
                    'nik' => $profileData['nik'] ?? null,
                    'name' => $profileData['name'] ?? 'Anonymous',
                    'gender' => $profileData['gender'] ?? null,
                    'age' => $profileData['age'] ?? null,
                    'education' => $profileData['education'] ?? null,
                    'job' => $profileData['job'] ?? null,
                    'phone' => $profileData['phone'] ?? null,
                    'email' => $profileData['email'] ?? null,
                ]);
            }

            // 3. Create Survey Response header
            $response = SurveyResponse::create([
                'survey_id' => $survey->id,
                'respondent_profile_id' => $respondent->id,
                'ip_address' => $ipAddress,
                'user_agent' => $request->userAgent(),
                'completed_at' => now(),
            ]);

            // 4. Save Answers
            $answers = $request->input('answers');
            foreach ($answers as $ans) {
                SurveyResponseDetail::create([
                    'response_id' => $response->id,
                    'question_id' => $ans['question_id'],
                    'score' => $ans['score'],
                ]);
            }

            // 5. Save Complaint if filed
            $complaintText = $request->input('complaint.content');
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
                report($e);
            }

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Terima kasih! Survei kepuasan Anda telah berhasil dikirim.',
            ]);

            return to_route('survey.complete', ['token' => $survey->token]);

        } catch (\Exception $e) {
            DB::rollBack();
            report($e);
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Terjadi kesalahan sistem saat menyimpan survei Anda. Silakan coba lagi.',
            ]);

            return redirect()->back();
        }
    }

    /**
     * Show completion page.
     */
    public function complete(string $token): Response
    {
        $survey = Survey::with('unit.opd')->where('token', $token)->firstOrFail();

        return Inertia::render('public/complete', [
            'survey' => $survey,
        ]);
    }
}
