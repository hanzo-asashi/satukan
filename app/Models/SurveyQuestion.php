<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'survey_id',
    'indicator_code',
    'indicator_name',
    'question_text',
    'scale_1_label',
    'scale_2_label',
    'scale_3_label',
    'scale_4_label',
    'is_mandatory',
    'order_index',
])]
class SurveyQuestion extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_mandatory' => 'boolean',
            'order_index' => 'integer',
        ];
    }

    /**
     * Parent survey.
     *
     * @return BelongsTo<Survey, $this>
     */
    public function survey(): BelongsTo
    {
        return $this->belongsTo(Survey::class, 'survey_id');
    }

    /**
     * Response details for this question.
     *
     * @return HasMany<SurveyResponseDetail, $this>
     */
    public function responseDetails(): HasMany
    {
        return $this->hasMany(SurveyResponseDetail::class, 'question_id');
    }
}
