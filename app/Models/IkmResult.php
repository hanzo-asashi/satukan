<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['period_id', 'opd_id', 'unit_id', 'total_respondents', 'score', 'grade', 'calculated_at'])]
class IkmResult extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_respondents' => 'integer',
            'score' => 'float',
            'calculated_at' => 'datetime',
        ];
    }

    /**
     * Period.
     *
     * @return BelongsTo<SurveyPeriod, $this>
     */
    public function period(): BelongsTo
    {
        return $this->belongsTo(SurveyPeriod::class, 'period_id');
    }

    /**
     * OPD.
     *
     * @return BelongsTo<Opd, $this>
     */
    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class, 'opd_id');
    }

    /**
     * Unit.
     *
     * @return BelongsTo<Unit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
