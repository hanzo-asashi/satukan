<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\NationalSyncLog;
use App\Models\Setting;
use App\Models\SurveyResponse;
use App\Utils\IkmCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class NationalSyncController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAction($request);

        $settings = [
            'national_sync_enabled' => Setting::getValue('national_sync_enabled', '0'),
            'national_api_endpoint' => Setting::getValue('national_api_endpoint', ''),
            'national_api_token' => Setting::getValue('national_api_token', ''),
            'regional_name' => Setting::getValue('regional_name', ''),
            'regional_code' => Setting::getValue('regional_code', ''),
        ];

        $syncLogs = NationalSyncLog::orderBy('created_at', 'desc')->limit(50)->get();

        return Inertia::render('admin/sync/index', [
            'settings' => $settings,
            'syncLogs' => $syncLogs,
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $this->authorizeAction($request);

        $validated = $request->validate([
            'national_sync_enabled' => ['required', 'boolean'],
            'national_api_endpoint' => ['nullable', 'url'],
            'national_api_token' => ['nullable', 'string'],
            'regional_name' => ['required', 'string', 'max:255'],
            'regional_code' => ['required', 'string', 'max:50'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::setValue($key, (string) $value);
        }

        AuditLog::log('Updated National Integration settings');

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Konfigurasi sinkronisasi nasional berhasil disimpan.']);

        return redirect()->back();
    }

    /**
     * Perform manual data synchronization to the national portal.
     */
    public function sync(Request $request): RedirectResponse
    {
        $this->authorizeAction($request);

        $syncEnabled = Setting::getValue('national_sync_enabled', '0') === '1';
        $endpoint = Setting::getValue('national_api_endpoint', '');
        $token = Setting::getValue('national_api_token', '');

        if (! $syncEnabled || empty($endpoint)) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Gagal melakukan sinkronisasi: Integrasi nasional belum aktif atau endpoint kosong.',
            ]);

            return redirect()->back();
        }

        // Calculate regional active IKM data to push
        $responses = SurveyResponse::whereHas('survey.period', function ($q) {
            $q->where('is_active', true);
        });

        $totalCount = $responses->count();
        if ($totalCount === 0) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => 'Tidak ada data survei aktif untuk disinkronkan.',
            ]);

            return redirect()->back();
        }

        $ikmStats = IkmCalculator::calculate($responses);

        // Prepare data payload
        $payload = [
            'regional_code' => Setting::getValue('regional_code', ''),
            'regional_name' => Setting::getValue('regional_name', ''),
            'timestamp' => now()->toIso8601String(),
            'total_respondents' => $ikmStats['total_respondents'],
            'ikm_score' => $ikmStats['score'],
            'grade' => $ikmStats['grade'],
            'grade_label' => IkmCalculator::getGradeLabel($ikmStats['grade']),
            'lowest_indicator' => $ikmStats['lowest_indicator'],
            'highest_indicator' => $ikmStats['highest_indicator'],
            'indicators' => $ikmStats['indicators'],
        ];

        // Perform the sync API call
        try {
            // Simulated push (since actual endpoint is standard Permen PANRB dummy)
            // If the user uses a mock or dummy, we will make a real HTTP call but rescue with simulation logs on failure.
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$token}",
                'Accept' => 'application/json',
            ])->timeout(5)->post($endpoint, $payload);

            if ($response->successful()) {
                NationalSyncLog::create([
                    'entity_type' => 'ikm_aggregate',
                    'entity_id' => 0,
                    'status' => 'success',
                    'response_message' => 'Data successfully pushed to National SKM Server. Status: '.$response->status(),
                ]);

                AuditLog::log("National sync successful. Sent aggregate IKM: {$ikmStats['score']}");
                Inertia::flash('toast', ['type' => 'success', 'message' => 'Sinkronisasi ke portal nasional berhasil dilakukan.']);
            } else {
                throw new \Exception('Server returned status code: '.$response->status().' - '.$response->body());
            }

        } catch (\Exception $e) {
            // Log as failure, but for local simulation/demo, we explain in log
            NationalSyncLog::create([
                'entity_type' => 'ikm_aggregate',
                'entity_id' => 0,
                'status' => 'failed',
                'response_message' => 'Sync failed: '.$e->getMessage().'. (Local Simulation Mode activated)',
            ]);

            AuditLog::log('National sync failed. Logged to sync logs.');

            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => 'Sinkronisasi gagal terkoneksi ke server pusat, namun log simulasi gagal telah dicatat. Periksa status log.',
            ]);
        }

        return redirect()->back();
    }

    private function authorizeAction(Request $request): void
    {
        if (! $request->user()->hasPermission('manage-settings')) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengelola sinkronisasi nasional.');
        }
    }
}
