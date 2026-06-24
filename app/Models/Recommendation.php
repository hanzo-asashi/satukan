<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['unit_id', 'period_id', 'content', 'created_by'])]
class Recommendation extends Model
{
    use HasFactory;

    /**
     * Associated Unit.
     *
     * @return BelongsTo<Unit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    /**
     * Associated Period.
     *
     * @return BelongsTo<SurveyPeriod, $this>
     */
    public function period(): BelongsTo
    {
        return $this->belongsTo(SurveyPeriod::class, 'period_id');
    }

    /**
     * User who created this recommendation.
     *
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Action items or follow ups for this recommendation.
     *
     * @return HasMany<FollowUp, $this>
     */
    public function followUps(): HasMany
    {
        return $this->hasMany(FollowUp::class, 'recommendation_id');
    }
}
