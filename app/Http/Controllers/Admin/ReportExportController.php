<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Opd;
use App\Models\Recommendation;
use App\Models\RespondentProfile;
use App\Models\SurveyPeriod;
use App\Models\SurveyResponse;
use App\Models\Unit;
use App\Utils\IkmCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response as FacadeResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExportController extends Controller
{
    /**
     * Generate PDF-ready print layout for SKM Report (compliant with Permen PANRB No. 14 Tahun 2017).
     */
    public function pdf(Request $request)
    {
        $user = $request->user();
        $isSuperAdmin = $user->hasRole('superadmin');

        $periodId = $request->input('period_id');
        $opdId = $isSuperAdmin ? $request->input('opd_id') : $user->opd_id;
        $unitId = $request->input('unit_id');

        // 1. Get survey period
        $period = null;
        if ($periodId) {
            $period = SurveyPeriod::find($periodId);
        }
        if (! $period) {
            $period = SurveyPeriod::where('is_active', true)->first() ?: SurveyPeriod::orderBy('end_date', 'desc')->first();
        }

        if (! $period) {
            return redirect()->back()->with('error', 'Tidak ada periode survei yang dapat diexport.');
        }

        // 2. Base query for responses
        $responseQuery = SurveyResponse::whereHas('survey.period', function ($q) use ($period) {
            $q->where('id', $period->id);
        });

        // Apply filters
        $scopeName = 'Kabupaten Soppeng';
        $subScopeName = 'Seluruh Organisasi Perangkat Daerah';

        if ($opdId) {
            $opd = Opd::find($opdId);
            if ($opd) {
                $scopeName = $opd->name;
                $subScopeName = 'Organisasi Perangkat Daerah regional';
                $responseQuery->whereHas('survey.unit', function ($q) use ($opdId) {
                    $q->where('opd_id', $opdId);
                });
            }
        }

        if ($unitId) {
            $unit = Unit::with('opd')->find($unitId);
            if ($unit) {
                $scopeName = $unit->name;
                $subScopeName = $unit->opd->name;
                $responseQuery->whereHas('survey', function ($q) use ($unitId) {
                    $q->where('unit_id', $unitId);
                });
            }
        }

        // Calculate general statistics
        $stats = IkmCalculator::calculate(clone $responseQuery);

        // Fetch demographic breakdowns
        $respondentIds = (clone $responseQuery)->pluck('respondent_profile_id');

        $demographics = [
            'gender' => RespondentProfile::whereIn('id', $respondentIds)
                ->selectRaw('gender, COUNT(*) as count')
                ->groupBy('gender')
                ->get()
                ->pluck('count', 'gender')
                ->toArray(),
            'education' => RespondentProfile::whereIn('id', $respondentIds)
                ->selectRaw('education, COUNT(*) as count')
                ->groupBy('education')
                ->get()
                ->pluck('count', 'education')
                ->toArray(),
            'job' => RespondentProfile::whereIn('id', $respondentIds)
                ->selectRaw('job, COUNT(*) as count')
                ->groupBy('job')
                ->get()
                ->pluck('count', 'job')
                ->toArray(),
            'age_groups' => [
                'Under 20' => RespondentProfile::whereIn('id', $respondentIds)->where('age', '<', 20)->count(),
                '20 - 29' => RespondentProfile::whereIn('id', $respondentIds)->whereBetween('age', [20, 29])->count(),
                '30 - 39' => RespondentProfile::whereIn('id', $respondentIds)->whereBetween('age', [30, 39])->count(),
                '40 - 49' => RespondentProfile::whereIn('id', $respondentIds)->whereBetween('age', [40, 49])->count(),
                '50 +' => RespondentProfile::whereIn('id', $respondentIds)->where('age', '>=', 50)->count(),
            ],
        ];

        // Fetch active recommendations
        $recommendationsQuery = Recommendation::with(['unit', 'follow_ups'])
            ->where('period_id', $period->id);

        if ($opdId) {
            $recommendationsQuery->whereHas('unit', function ($q) use ($opdId) {
                $q->where('opd_id', $opdId);
            });
        }

        if ($unitId) {
            $recommendationsQuery->where('unit_id', $unitId);
        }

        $recommendations = $recommendationsQuery->get();

        return view('admin.exports.pdf', [
            'period' => $period,
            'scopeName' => $scopeName,
            'subScopeName' => $subScopeName,
            'stats' => $stats,
            'demographics' => $demographics,
            'recommendations' => $recommendations,
            'isOpdReport' => (bool) $opdId,
            'officerName' => $user->name,
            'opdName' => $isSuperAdmin && ! $opdId ? 'Sekretariat Daerah Soppeng' : ($opdId ? Opd::find($opdId)->name : 'Sekretariat Daerah Soppeng'),
        ]);
    }

    /**
     * Export raw survey response details for Excel/CSV.
     */
    public function excel(Request $request): StreamedResponse
    {
        $user = $request->user();
        $isSuperAdmin = $user->hasRole('superadmin');

        $periodId = $request->input('period_id');
        $opdId = $isSuperAdmin ? $request->input('opd_id') : $user->opd_id;
        $unitId = $request->input('unit_id');

        // Get active period
        $period = null;
        if ($periodId) {
            $period = SurveyPeriod::find($periodId);
        }
        if (! $period) {
            $period = SurveyPeriod::where('is_active', true)->first() ?: SurveyPeriod::orderBy('end_date', 'desc')->first();
        }

        $responsesQuery = SurveyResponse::with([
            'survey.unit.opd',
            'respondentProfile',
            'details.question',
        ])->whereHas('survey.period', function ($q) use ($period) {
            $q->where('id', $period->id);
        });

        // Apply filters
        if ($opdId) {
            $responsesQuery->whereHas('survey.unit', function ($q) use ($opdId) {
                $q->where('opd_id', $opdId);
            });
        }

        if ($unitId) {
            $responsesQuery->whereHas('survey', function ($q) use ($unitId) {
                $q->where('unit_id', $unitId);
            });
        }

        $responses = $responsesQuery->orderBy('completed_at', 'asc')->get();

        $filename = 'Data_Mentah_Survei_SKM_'.str_replace(' ', '_', $period->name).'_'.date('Ymd_His').'.csv';

        $headers = [
            'Content-type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=$filename",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($responses, $period) {
            $file = fopen('php://output', 'w');

            // Write UTF-8 BOM so Excel opens it correctly
            fwrite($file, "\xEF\xBB\xBF");

            // Title info
            fputcsv($file, ['LAPORAN DATA RESPONDEN & NILAI UNSUR SKM']);
            fputcsv($file, ['Periode Survei:', $period->name]);
            fputcsv($file, ['Tanggal Unduh:', date('d-m-Y H:i:s')]);
            fputcsv($file, []); // Blank row

            // Table headers
            $columns = [
                'No', 'Tanggal Lengkap', 'Unit Layanan', 'OPD',
                'Nama Responden', 'Umur', 'Jenis Kelamin', 'Pendidikan', 'Pekerjaan',
                'U1 (Persyaratan)', 'U2 (Prosedur)', 'U3 (Waktu Pelayanan)', 'U4 (Biaya/Tarif)',
                'U5 (Spesifikasi)', 'U6 (Kompetensi)', 'U7 (Perilaku)', 'U8 (Pengaduan)', 'U9 (Sarpras)',
                'Rerata NRR', 'IKM Konversi', 'Saran/Aduan/Komentar',
            ];
            fputcsv($file, $columns);

            $num = 1;
            foreach ($responses as $resp) {
                // Map detail answers by indicator code U1-U9
                $unsurs = [];
                for ($i = 1; $i <= 9; $i++) {
                    $unsurs["U$i"] = 0;
                }

                $detailsSum = 0;
                $detailsCount = 0;
                foreach ($resp->details as $detail) {
                    $code = $detail->question->indicator_code;
                    $unsurs[$code] = $detail->score;
                    $detailsSum += $detail->score;
                    $detailsCount++;
                }

                $nrrAvg = $detailsCount > 0 ? ($detailsSum / $detailsCount) : 0;
                $ikmKonversi = $nrrAvg * 25;

                $comment = $resp->complaint ? $resp->complaint->content : '';

                $row = [
                    $num++,
                    $resp->completed_at ? $resp->completed_at->format('Y-m-d H:i:s') : '',
                    $resp->survey->unit->name,
                    $resp->survey->unit->opd->name,
                    $resp->respondentProfile->name,
                    $resp->respondentProfile->age,
                    $resp->respondentProfile->gender === 'L' ? 'Laki-laki' : 'Perempuan',
                    $resp->respondentProfile->education,
                    $resp->respondentProfile->job,
                    $unsurs['U1'], $unsurs['U2'], $unsurs['U3'], $unsurs['U4'],
                    $unsurs['U5'], $unsurs['U6'], $unsurs['U7'], $unsurs['U8'], $unsurs['U9'],
                    round($nrrAvg, 3),
                    round($ikmKonversi, 2),
                    $comment,
                ];

                fputcsv($file, $row);
            }

            fclose($file);
        };

        return FacadeResponse::stream($callback, 200, $headers);
    }
}
