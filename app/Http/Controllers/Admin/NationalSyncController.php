<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\NationalSyncLog;
use App\Models\Setting;
use App\Services\NationalSyncService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NationalSyncController extends Controller
{
    public function __construct(
        protected NationalSyncService $syncService
    ) {}

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

        $result = $this->syncService->sync();

        if ($result['success']) {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => $result['message'],
            ]);
        } else {
            $syncEnabled = Setting::getValue('national_sync_enabled', '0') === '1';
            $endpoint = Setting::getValue('national_api_endpoint', '');

            if (! $syncEnabled || empty($endpoint)) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'Gagal melakukan sinkronisasi: '.$result['message'],
                ]);
            } else {
                Inertia::flash('toast', [
                    'type' => 'warning',
                    'message' => 'Sinkronisasi gagal terkoneksi ke server pusat, namun log simulasi gagal telah dicatat. Periksa status log.',
                ]);
            }
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
