<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\FollowUp;
use App\Models\Opd;
use App\Models\SurveyPeriod;
use App\Models\SurveyResponse;
use App\Models\Unit;
use App\Utils\IkmCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the main admin dashboard based on user roles and scope.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isSuperAdmin = $user->hasRole('superadmin');
        $opdId = $user->opd_id;

        // 1. Get active survey period
        $activePeriod = SurveyPeriod::where('is_active', true)->first();
        if (! $activePeriod) {
            $activePeriod = SurveyPeriod::orderBy('end_date', 'desc')->first();
        }

        // 2. Base query for responses in the active period
        $responseQuery = SurveyResponse::whereHas('survey.period', function ($q) use ($activePeriod) {
            if ($activePeriod) {
                $q->where('id', $activePeriod->id);
            }
        });

        // 3. Apply scope based on role
        if (! $isSuperAdmin && $opdId) {
            $responseQuery->whereHas('survey.unit', function ($q) use ($opdId) {
                $q->where('opd_id', $opdId);
            });
        }

        // 4. Calculate IKM stats for the current period
        $ikmStats = IkmCalculator::calculate(clone $responseQuery);

        // 5. Monthly trend calculation (last 6 months, database-agnostic)
        $sixMonthsAgo = now()->subMonths(6)->startOfMonth();
        $trendResponses = SurveyResponse::where('completed_at', '>=', $sixMonthsAgo);

        if (! $isSuperAdmin && $opdId) {
            $trendResponses->whereHas('survey.unit', function ($q) use ($opdId) {
                $q->where('opd_id', $opdId);
            });
        }

        $trendData = $trendResponses->select('id', 'completed_at', 'survey_id')
            ->with(['details' => function ($q) {
                $q->select('id', 'response_id', 'score');
            }])
            ->get()
            ->groupBy(function ($response) {
                return Carbon::parse($response->completed_at)->format('Y-m');
            })
            ->map(function ($responses, $monthKey) {
                $scoresSum = 0;
                $detailsCount = 0;
                foreach ($responses as $resp) {
                    foreach ($resp->details as $det) {
                        $scoresSum += $det->score;
                        $detailsCount++;
                    }
                }
                $averageScore = $detailsCount > 0 ? ($scoresSum / $detailsCount) * 25 : 0;

                return [
                    'month' => Carbon::parse($monthKey.'-01')->translatedFormat('F Y'),
                    'score' => round($averageScore, 2),
                    'respondents' => $responses->count(),
                ];
            })
            ->values();

        // 6. Organization-specific list and breakdown
        $breakdown = [];
        if ($isSuperAdmin) {
            // OPD Breakdown for Superadmin
            $opds = Opd::all();
            foreach ($opds as $opd) {
                $opdResponses = SurveyResponse::whereHas('survey.unit', function ($q) use ($opd) {
                    $q->where('opd_id', $opd->id);
                });
                if ($activePeriod) {
                    $opdResponses->whereHas('survey.period', function ($q) use ($activePeriod) {
                        $q->where('id', $activePeriod->id);
                    });
                }
                $opdStats = IkmCalculator::calculate($opdResponses);

                $breakdown[] = [
                    'id' => $opd->id,
                    'name' => $opd->name,
                    'code' => $opd->code,
                    'total_respondents' => $opdStats['total_respondents'],
                    'score' => $opdStats['score'],
                    'grade' => $opdStats['grade'],
                    'grade_label' => IkmCalculator::getGradeLabel($opdStats['grade']),
                ];
            }
        } elseif ($opdId) {
            // Unit Breakdown for OPD Admin
            $units = Unit::where('opd_id', $opdId)->get();
            foreach ($units as $unit) {
                $unitResponses = SurveyResponse::whereHas('survey', function ($q) use ($unit) {
                    $q->where('unit_id', $unit->id);
                });
                if ($activePeriod) {
                    $unitResponses->whereHas('survey.period', function ($q) use ($activePeriod) {
                        $q->where('id', $activePeriod->id);
                    });
                }
                $unitStats = IkmCalculator::calculate($unitResponses);

                $breakdown[] = [
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'code' => $unit->code,
                    'total_respondents' => $unitStats['total_respondents'],
                    'score' => $unitStats['score'],
                    'grade' => $unitStats['grade'],
                    'grade_label' => IkmCalculator::getGradeLabel($unitStats['grade']),
                ];
            }
        }

        // 7. Recent complaints
        $complaintsQuery = Complaint::with('unit.opd')
            ->orderBy('created_at', 'desc')
            ->limit(5);

        if (! $isSuperAdmin && $opdId) {
            $complaintsQuery->whereHas('unit', function ($q) use ($opdId) {
                $q->where('opd_id', $opdId);
            });
        }
        $recentComplaints = $complaintsQuery->get();

        // 8. RTL (Rencana Tindak Lanjut) Completion Stats
        $rtlStatsQuery = FollowUp::query();
        if (! $isSuperAdmin && $opdId) {
            $rtlStatsQuery->whereHas('recommendation.unit', function ($q) use ($opdId) {
                $q->where('opd_id', $opdId);
            });
        }
        $totalRtl = (clone $rtlStatsQuery)->count();
        $completedRtl = (clone $rtlStatsQuery)->where('status', 'completed')->count();
        $inProgressRtl = (clone $rtlStatsQuery)->where('status', 'in_progress')->count();
        $notStartedRtl = (clone $rtlStatsQuery)->where('status', 'not_started')->count();

        return Inertia::render('dashboard', [
            'activePeriod' => $activePeriod,
            'stats' => [
                'score' => $ikmStats['score'],
                'grade' => $ikmStats['grade'],
                'grade_label' => IkmCalculator::getGradeLabel($ikmStats['grade']),
                'total_respondents' => $ikmStats['total_respondents'],
                'lowest_indicator' => $ikmStats['lowest_indicator'],
                'highest_indicator' => $ikmStats['highest_indicator'],
                'indicators' => $ikmStats['indicators'],
            ],
            'trend' => $trendData,
            'breakdown' => $breakdown,
            'recentComplaints' => $recentComplaints,
            'rtlStats' => [
                'total' => $totalRtl,
                'completed' => $completedRtl,
                'in_progress' => $inProgressRtl,
                'not_started' => $notStartedRtl,
                'completion_rate' => $totalRtl > 0 ? round(($completedRtl / $totalRtl) * 100, 1) : 0.0,
            ],
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }
}
