<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'code', 'logo_url', 'address', 'phone', 'email'])]
class Opd extends Model
{
    /**
     * @var string
     */
    protected $table = 'opds';

    /**
     * Units under this OPD.
     *
     * @return HasMany<Unit, $this>
     */
    public function units(): HasMany
    {
        return $this->hasMany(Unit::class, 'opd_id');
    }

    /**
     * Users belonging to this OPD.
     *
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'opd_id');
    }
}
