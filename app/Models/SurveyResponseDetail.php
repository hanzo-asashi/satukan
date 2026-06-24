<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['response_id', 'question_id', 'score'])]
class SurveyResponseDetail extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'score' => 'integer',
        ];
    }

    /**
     * Parent response.
     *
     * @return BelongsTo<SurveyResponse, $this>
     */
    public function response(): BelongsTo
    {
        return $this->belongsTo(SurveyResponse::class, 'response_id');
    }

    /**
     * Question associated with this response detail.
     *
     * @return BelongsTo<SurveyQuestion, $this>
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(SurveyQuestion::class, 'question_id');
    }
}
