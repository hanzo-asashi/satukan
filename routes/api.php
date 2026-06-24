<?php

use App\Http\Controllers\Api\SkmApiController;
use App\Http\Middleware\AuthenticateApiToken;
use Illuminate\Support\Facades\Route;

// API Version 1 endpoints (Secured by custom Token API)
Route::middleware([AuthenticateApiToken::class])->prefix('v1')->group(function () {
    Route::post('/skm/submit', [SkmApiController::class, 'submit']);
    Route::get('/skm/results', [SkmApiController::class, 'results']);
    Route::get('/skm/analytics', [SkmApiController::class, 'analytics']);
    Route::post('/skm/sync/national', [SkmApiController::class, 'syncNational']);
    Route::post('/services/complete', [SkmApiController::class, 'serviceComplete']);
});
