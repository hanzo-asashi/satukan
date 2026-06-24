<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['recommendation_id', 'action_plan', 'progress_percentage', 'status', 'notes', 'deadline', 'completed_at'])]
class FollowUp extends Model
{
    /**
     * @var string
     */
    protected $table = 'follow_ups';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'progress_percentage' => 'integer',
            'deadline' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * Associated recommendation.
     *
     * @return BelongsTo<Recommendation, $this>
     */
    public function recommendation(): BelongsTo
    {
        return $this->belongsTo(Recommendation::class, 'recommendation_id');
    }
}
