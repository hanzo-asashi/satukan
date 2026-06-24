<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'start_date', 'end_date', 'is_active'])]
class SurveyPeriod extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Surveys in this period.
     *
     * @return HasMany<Survey, $this>
     */
    public function surveys(): HasMany
    {
        return $this->hasMany(Survey::class, 'period_id');
    }

    /**
     * IKM Results calculated for this period.
     *
     * @return HasMany<IkmResult, $this>
     */
    public function ikmResults(): HasMany
    {
        return $this->hasMany(IkmResult::class, 'period_id');
    }

    /**
     * Recommendations made in this period.
     *
     * @return HasMany<Recommendation, $this>
     */
    public function recommendations(): HasMany
    {
        return $this->hasMany(Recommendation::class, 'period_id');
    }
}
