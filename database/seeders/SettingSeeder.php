<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'national_sync_enabled' => '1',
            'national_api_endpoint' => 'https://skm.menpan.go.id/api/v1/sync',
            'national_api_token' => 'token_dummy_national_skm_12345',
            'regional_name' => 'Pemerintah Kabupaten Soppeng',
            'regional_code' => '7312',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
