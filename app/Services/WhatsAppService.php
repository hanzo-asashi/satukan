<?php

namespace App\Services;

use App\Models\SurveyResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Send survey link to a citizen's phone number after service completion.
     */
    public static function sendSurveyLink(string $phone, string $url, string $unitName): bool
    {
        $message = "Halo,\n\nTerima kasih telah menggunakan layanan kami di *{$unitName}* Kabupaten Soppeng.\n\nMohon luangkan waktu 1-2 menit untuk memberikan penilaian terhadap layanan kami melalui link survei berikut:\n{$url}\n\nPenilaian Anda sangat berharga bagi peningkatan kualitas pelayanan kami.\n\nSistem Terpadu Ukur Kepuasan Masyarakat Nasional (SATUKAN) Kabupaten Soppeng.";

        return self::send($phone, $message);
    }

    /**
     * Send instant escalation notice to the Head of OPD for "Sangat Buruk" responses.
     */
    public static function sendEscalation(
        string $phone,
        string $opdName,
        string $unitName,
        string $respondentName,
        string $complaintText
    ): bool {
        $message = "🚨 *ESKALASI ADUAN SANGAT BURUK (SATUKAN)* 🚨\n\nYth. Kepala {$opdName},\n\nTerdapat penilaian/aduan dengan nilai *Sangat Buruk* (Skor 1) di unit layanan *{$unitName}*.\n\nDetail Laporan:\n- Responden: {$respondentName}\n- Aduan/Komentar: \"{$complaintText}\"\n\nMohon untuk segera ditindaklanjuti.\n\nSATUKAN - Kabupaten Soppeng";

        return self::send($phone, $message);
    }

    /**
     * Check a survey response and trigger WhatsApp escalation if there's a score of 1.
     */
    public static function checkAndTriggerEscalation(SurveyResponse $response): void
    {
        // Check if any question was graded with score 1 (Sangat Buruk)
        $hasSangatBuruk = $response->details()->where('score', 1)->exists();

        if ($hasSangatBuruk) {
            $response->loadMissing(['survey.unit.opd', 'respondentProfile', 'complaint']);

            $survey = $response->survey;
            if (! $survey || ! $survey->unit || ! $survey->unit->opd) {
                return;
            }

            $opd = $survey->unit->opd;
            $unit = $survey->unit;
            $respondent = $response->respondentProfile;
            $complaintText = $response->complaint ? $response->complaint->content : 'Tidak ada komentar tertulis';

            // Escalate to OPD phone if configured
            $opdPhone = $opd->phone;

            if ($opdPhone) {
                self::sendEscalation(
                    $opdPhone,
                    $opd->name,
                    $unit->name,
                    $respondent->name ?? 'Anonymous',
                    $complaintText
                );
            }
        }
    }

    /**
     * Internal helper to dispatch the message via HTTP request (Fonnte API style) or fallback to log.
     */
    private static function send(string $phone, string $message): bool
    {
        $token = config('services.fonnte.token');
        $apiUrl = config('services.fonnte.url', 'https://api.fonnte.com/send');

        // Sanitize phone number (remove space, dash, ensure country code)
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '62'.substr($phone, 1);
        }

        if (empty($token)) {
            // Mock mode for local testing
            Log::info("MOCK WHATSAPP SEND to [{$phone}]:\n====================\n{$message}\n====================");

            return true;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post($apiUrl, [
                'target' => $phone,
                'message' => $message,
                'countryCode' => '62',
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('WhatsApp dispatch failed: '.$response->body());

            return false;
        } catch (\Exception $e) {
            Log::error('WhatsApp dispatch exception: '.$e->getMessage());

            return false;
        }
    }
}
