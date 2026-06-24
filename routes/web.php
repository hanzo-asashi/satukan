<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\NationalSyncController;
use App\Http\Controllers\Admin\OpdController;
use App\Http\Controllers\Admin\PeriodController;
use App\Http\Controllers\Admin\RecommendationController;
use App\Http\Controllers\Admin\ReportExportController;
use App\Http\Controllers\Admin\SurveyManagementController;
use App\Http\Controllers\Admin\UnitController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\PublicSurveyController;
use Illuminate\Support\Facades\Route;

// Public Survey Portal Routes
Route::get('/', [PublicSurveyController::class, 'index'])->name('home');
Route::get('/public/survey/{token}', [PublicSurveyController::class, 'show'])->name('survey.show');
Route::post('/public/survey/submit', [PublicSurveyController::class, 'submit'])->name('survey.submit');
Route::get('/public/survey/complete/{token}', [PublicSurveyController::class, 'complete'])->name('survey.complete');

// Administrative Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Executive Dashboards
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Exports
    Route::get('admin/export/pdf', [ReportExportController::class, 'pdf'])->name('export.pdf');
    Route::get('admin/export/excel', [ReportExportController::class, 'excel'])->name('export.excel');

    // Superadmin: OPD management
    Route::get('admin/opds', [OpdController::class, 'index'])->name('opds.index');
    Route::post('admin/opds', [OpdController::class, 'store'])->name('opds.store');
    Route::patch('admin/opds/{opd}', [OpdController::class, 'update'])->name('opds.update');
    Route::delete('admin/opds/{opd}', [OpdController::class, 'destroy'])->name('opds.destroy');

    // Units management
    Route::get('admin/units', [UnitController::class, 'index'])->name('units.index');
    Route::post('admin/units', [UnitController::class, 'store'])->name('units.store');
    Route::patch('admin/units/{unit}', [UnitController::class, 'update'])->name('units.update');
    Route::delete('admin/units/{unit}', [UnitController::class, 'destroy'])->name('units.destroy');
    Route::get('admin/units/{unit}/qr', [UnitController::class, 'qrCode'])->name('units.qr');

    // Periods management
    Route::get('admin/periods', [PeriodController::class, 'index'])->name('periods.index');
    Route::post('admin/periods', [PeriodController::class, 'store'])->name('periods.store');
    Route::patch('admin/periods/{period}', [PeriodController::class, 'update'])->name('periods.update');
    Route::delete('admin/periods/{period}', [PeriodController::class, 'destroy'])->name('periods.destroy');

    // Survey configurations
    Route::get('admin/surveys', [SurveyManagementController::class, 'index'])->name('surveys.index');
    Route::post('admin/surveys', [SurveyManagementController::class, 'store'])->name('surveys.store');
    Route::post('admin/surveys/{survey}/toggle-publish', [SurveyManagementController::class, 'togglePublish'])->name('surveys.toggle-publish');
    Route::delete('admin/surveys/{survey}', [SurveyManagementController::class, 'destroy'])->name('surveys.destroy');

    // Recommendations and Action Plans
    Route::get('admin/recommendations', [RecommendationController::class, 'index'])->name('recommendations.index');
    Route::post('admin/recommendations', [RecommendationController::class, 'store'])->name('recommendations.store');
    Route::post('admin/recommendations/generate-ai', [RecommendationController::class, 'generateAi'])->name('recommendations.generate-ai');
    Route::post('admin/recommendations/follow-up', [RecommendationController::class, 'storeFollowUp'])->name('recommendations.follow-up.store');
    Route::patch('admin/recommendations/follow-up/{followUp}', [RecommendationController::class, 'updateFollowUp'])->name('recommendations.follow-up.update');

    // National Sync Config
    Route::get('admin/sync', [NationalSyncController::class, 'index'])->name('sync.index');
    Route::post('admin/sync/settings', [NationalSyncController::class, 'updateSettings'])->name('sync.settings.update');
    Route::post('admin/sync/trigger', [NationalSyncController::class, 'sync'])->name('sync.trigger');

    // User management & API keys
    Route::get('admin/users', [UserController::class, 'index'])->name('users.index');
    Route::post('admin/users', [UserController::class, 'store'])->name('users.store');
    Route::patch('admin/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('admin/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::post('admin/users/token', [UserController::class, 'storeToken'])->name('users.token.store');
    Route::delete('admin/users/token/{apiToken}', [UserController::class, 'destroyToken'])->name('users.token.destroy');
});

require __DIR__.'/settings.php';
