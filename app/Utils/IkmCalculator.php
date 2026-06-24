<?php

namespace App\Utils;

use App\Models\SurveyResponseDetail;
use Illuminate\Database\Eloquent\Builder;

class IkmCalculator
{
    /**
     * Calculate IKM score, grade, and indicator breakdown for a given query (e.g. by unit, OPD, period).
     *
     * @return array{
     *     score: float,
     *     grade: string,
     *     grade_label: string,
     *     total_respondents: int,
     *     indicators: array<string, array{code: string, name: string, nrr: float, raw_avg: float}>,
     *     lowest_indicator: array{code: string, name: string, score: float}|null,
     *     highest_indicator: array{code: string, name: string, score: float}|null
     * }
     */
    public static function calculate(?Builder $responseQuery): array
    {
        if (! $responseQuery) {
            return self::emptyResult();
        }

        // Get matching response IDs
        $responseIds = $responseQuery->pluck('id');
        $totalRespondents = $responseIds->count();

        if ($totalRespondents === 0) {
            return self::emptyResult();
        }

        // Fetch details grouped by question indicators
        // We need average score per question/indicator
        $details = SurveyResponseDetail::whereIn('response_id', $responseIds)
            ->join('survey_questions', 'survey_response_details.question_id', '=', 'survey_questions.id')
            ->selectRaw('survey_questions.indicator_code, survey_questions.indicator_name, AVG(survey_response_details.score) as avg_score')
            ->groupBy('survey_questions.indicator_code', 'survey_questions.indicator_name')
            ->get();

        $indicatorsBreakdown = [];
        $sumNrrWeighted = 0;
        $countIndicators = 0;

        foreach ($details as $detail) {
            $code = $detail->indicator_code;
            $name = $detail->indicator_name;
            $avgScore = (float) $detail->avg_score;

            // Permen PANRB 14/2017 weight: 1 / total indicators (which is 9)
            // Weight is equal for all indicators.
            // NRR Tertimbang = NRR per unsur * Bobot (0.11 or 1/total_unsur)
            // We can just average the raw NRRs and multiply by 25.

            $indicatorsBreakdown[$code] = [
                'code' => $code,
                'name' => $name,
                'nrr' => round($avgScore, 3),
                'nrr_weighted' => round($avgScore * 0.111, 3), // showing weighted NRR
            ];

            $sumNrrWeighted += $avgScore;
            $countIndicators++;
        }

        if ($countIndicators === 0) {
            return self::emptyResult();
        }

        // Average NRR of all indicators
        $avgNrr = $sumNrrWeighted / $countIndicators;
        // IKM Score = Average NRR * 25
        $ikmScore = round($avgNrr * 25, 2);
        $grade = self::determineGrade($ikmScore);

        // Find lowest and highest indicators
        $sortedDetails = collect($indicatorsBreakdown)->sortBy('nrr');
        $lowest = $sortedDetails->first();
        $highest = $sortedDetails->last();

        return [
            'score' => $ikmScore,
            'grade' => $grade,
            'grade_label' => self::getGradeLabel($grade),
            'total_respondents' => $totalRespondents,
            'indicators' => $indicatorsBreakdown,
            'lowest_indicator' => $lowest ? ['code' => $lowest['code'], 'name' => $lowest['name'], 'score' => $lowest['nrr']] : null,
            'highest_indicator' => $highest ? ['code' => $highest['code'], 'name' => $highest['name'], 'score' => $highest['nrr']] : null,
        ];
    }

    /**
     * Determine SKM Grade based on score.
     */
    public static function determineGrade(float $score): string
    {
        if ($score >= 88.31 && $score <= 100) {
            return 'A'; // Sangat Baik
        }
        if ($score >= 76.61 && $score < 88.31) {
            return 'B'; // Baik
        }
        if ($score >= 65.00 && $score < 76.61) {
            return 'C'; // Kurang Baik
        }

        return 'D'; // Tidak Baik
    }

    /**
     * Get human label for grade.
     */
    public static function getGradeLabel(string $grade): string
    {
        return match ($grade) {
            'A' => 'Sangat Baik',
            'B' => 'Baik',
            'C' => 'Kurang Baik',
            'D' => 'Tidak Baik',
            default => 'Belum Terdefinisi',
        };
    }

    /**
     * Return default empty result payload.
     */
    private static function emptyResult(): array
    {
        return [
            'score' => 0.0,
            'grade' => 'D',
            'grade_label' => 'Tidak Baik',
            'total_respondents' => 0,
            'indicators' => [],
            'lowest_indicator' => null,
            'highest_indicator' => null,
        ];
    }
}
