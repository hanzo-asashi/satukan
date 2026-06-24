<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\NationalSyncLog;
use App\Models\Setting;
use App\Models\SurveyResponse;
use App\Utils\IkmCalculator;
use Illuminate\Support\Facades\Http;

class NationalSyncService
{
    /**
     * Perform aggregate survey data synchronization to the national SKM portal.
     *
     * @return array{success: bool, message: string}
     */
    public function sync(): array
    {
        $syncEnabled = Setting::getValue('national_sync_enabled', '0') === '1';
        $endpoint = Setting::getValue('national_api_endpoint', '');
        $token = Setting::getValue('national_api_token', '');

        if (! $syncEnabled || empty($endpoint)) {
            return [
                'success' => false,
                'message' => 'Integrasi nasional belum aktif atau endpoint kosong.',
            ];
        }

        // Calculate regional active IKM data to push
        $responses = SurveyResponse::whereHas('survey.period', function ($q): void {
            $q->where('is_active', true);
        });

        $totalCount = $responses->count();
        if ($totalCount === 0) {
            return [
                'success' => false,
                'message' => 'Tidak ada data survei aktif untuk disinkronkan.',
            ];
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

        try {
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

                return [
                    'success' => true,
                    'message' => 'Sinkronisasi ke portal nasional berhasil dilakukan.',
                ];
            }

            throw new \Exception('Server returned status code: '.$response->status().' - '.$response->body());
        } catch (\Exception $e) {
            NationalSyncLog::create([
                'entity_type' => 'ikm_aggregate',
                'entity_id' => 0,
                'status' => 'failed',
                'response_message' => 'Sync failed: '.$e->getMessage().'. (Local Simulation Mode activated)',
            ]);

            AuditLog::log('National sync failed. Logged to sync logs.');

            return [
                'success' => false,
                'message' => 'Sinkronisasi gagal terkoneksi ke server pusat: '.$e->getMessage(),
            ];
        }
    }
}
