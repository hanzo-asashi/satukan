<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiToken
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tokenStr = $request->bearerToken() ?? $request->header('X-API-KEY');

        if (! $tokenStr) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token API tidak ditemukan. Harap berikan Header Bearer Token atau X-API-KEY.',
            ], 401);
        }

        // Search for hashed token in DB
        $hashedToken = hash('sha256', $tokenStr);
        $apiToken = ApiToken::where('token', $hashedToken)->first();

        if (! $apiToken) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token API tidak valid atau telah dicabut.',
            ], 401);
        }

        // Log last used time
        $apiToken->update([
            'last_used_at' => now(),
        ]);

        // Attach token abilities/object to request for further usage if needed
        $request->attributes->set('api_token', $apiToken);

        return $next($request);
    }
}
