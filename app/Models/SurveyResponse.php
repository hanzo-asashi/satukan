<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['survey_id', 'respondent_profile_id', 'ip_address', 'user_agent', 'completed_at'])]
class SurveyResponse extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
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
     * Respondent profile associated with this response.
     *
     * @return BelongsTo<RespondentProfile, $this>
     */
    public function respondentProfile(): BelongsTo
    {
        return $this->belongsTo(RespondentProfile::class, 'respondent_profile_id');
    }

    /**
     * Details (answers to questions) for this response.
     *
     * @return HasMany<SurveyResponseDetail, $this>
     */
    public function details(): HasMany
    {
        return $this->hasMany(SurveyResponseDetail::class, 'response_id');
    }

    /**
     * Complaint linked to this survey response (if any).
     *
     * @return HasOne<Complaint, $this>
     */
    public function complaint(): HasOne
    {
        return $this->hasOne(Complaint::class, 'response_id');
    }
}
