<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'token', 'abilities', 'last_used_at', 'expires_at'])]
class ApiToken extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'abilities' => 'json',
            'last_used_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }
}
