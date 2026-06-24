<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Survey;
use App\Models\SurveyPeriod;
use App\Models\SurveyQuestion;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SurveyManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAction($request);

        $user = $request->user();
        $isSuperAdmin = $user->hasRole('superadmin');

        $surveysQuery = Survey::with(['unit.opd', 'period', 'questions'])->orderBy('created_at', 'desc');

        if (! $isSuperAdmin) {
            $surveysQuery->whereHas('unit', function ($q) use ($user) {
                $q->where('opd_id', $user->opd_id);
            });
        }

        $surveys = $surveysQuery->get();
        $periods = SurveyPeriod::orderBy('start_date', 'desc')->get();

        $unitsQuery = Unit::with('opd');
        if (! $isSuperAdmin) {
            $unitsQuery->where('opd_id', $user->opd_id);
        }
        $units = $unitsQuery->get();

        return Inertia::render('admin/surveys/index', [
            'surveys' => $surveys,
            'periods' => $periods,
            'units' => $units,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAction($request);
        $user = $request->user();
        $isSuperAdmin = $user->hasRole('superadmin');

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'period_id' => ['required', 'exists:survey_periods,id'],
            'unit_id' => ['required', 'exists:units,id'],
            'is_published' => ['required', 'boolean'],
        ]);

        if (! $isSuperAdmin) {
            // Enforce unit safety
            $unit = Unit::where('id', $validated['unit_id'])->firstOrFail();
            if ($unit->opd_id !== $user->opd_id) {
                abort(403, 'Anda tidak diizinkan membuat survei untuk unit layanan ini.');
            }
        }

        $validated['token'] = Str::random(32);

        $survey = Survey::create($validated);

        // Auto-seed the 9 mandatory questions
        $this->seedMandatoryQuestions($survey);

        AuditLog::log("Created Survey: {$survey->title}");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Survei berhasil ditambahkan beserta 9 indikator wajib.']);

        return redirect()->back();
    }

    public function togglePublish(Request $request, Survey $survey): RedirectResponse
    {
        $this->authorizeAction($request);
        $this->checkScope($request->user(), $survey);

        $survey->update([
            'is_published' => ! $survey->is_published,
        ]);

        $statusText = $survey->is_published ? 'dipublikasikan' : 'diarsipkan';
        AuditLog::log("Toggled Survey Publish: {$survey->title} to {$statusText}");

        Inertia::flash('toast', ['type' => 'success', 'message' => "Survei berhasil {$statusText}."]);

        return redirect()->back();
    }

    public function destroy(Request $request, Survey $survey): RedirectResponse
    {
        $this->authorizeAction($request);
        $this->checkScope($request->user(), $survey);

        $title = $survey->title;
        $survey->delete();

        AuditLog::log("Deleted Survey: {$title}");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Survei berhasil dihapus.']);

        return redirect()->back();
    }

    private function authorizeAction(Request $request): void
    {
        if (! $request->user()->hasPermission('manage-surveys')) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengelola data survei.');
        }
    }

    private function checkScope(User $user, Survey $survey): void
    {
        if (! $user->hasRole('superadmin')) {
            $unit = Unit::where('id', $survey->unit_id)->firstOrFail();
            if ($unit->opd_id !== $user->opd_id) {
                abort(403, 'Anda tidak memiliki wewenang untuk mengakses data survei unit ini.');
            }
        }
    }

    private function seedMandatoryQuestions(Survey $survey): void
    {
        $indicators = [
            ['code' => 'U1', 'name' => 'Persyaratan', 'q' => 'Bagaimana pendapat Saudara tentang kemudahan persyaratan pelayanan di unit ini?', 's1' => 'Tidak Sesuai', 's2' => 'Kurang Sesuai', 's3' => 'Sesuai', 's4' => 'Sangat Sesuai'],
            ['code' => 'U2', 'name' => 'Sistem, Mekanisme, dan Prosedur', 'q' => 'Bagaimana pemahaman Saudara tentang kemudahan alur/prosedur pelayanan di unit ini?', 's1' => 'Tidak Mudah', 's2' => 'Kurang Mudah', 's3' => 'Mudah', 's4' => 'Sangat Mudah'],
            ['code' => 'U3', 'name' => 'Waktu Penyelesaian', 'q' => 'Bagaimana pendapat Saudara tentang kecepatan waktu dalam penyelesaian pelayanan?', 's1' => 'Tidak Cepat', 's2' => 'Kurang Cepat', 's3' => 'Cepat', 's4' => 'Sangat Cepat'],
            ['code' => 'U4', 'name' => 'Biaya/Tarif', 'q' => 'Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam mendapatkan pelayanan?', 's1' => 'Sangat Mahal', 's2' => 'Cukup Mahal', 's3' => 'Murah/Wajar', 's4' => 'Gratis/Sangat Murah'],
            ['code' => 'U5', 'name' => 'Produk Spesifikasi Jenis Pelayanan', 'q' => 'Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara standar dengan hasil yang diberikan?', 's1' => 'Tidak Sesuai', 's2' => 'Kurang Sesuai', 's3' => 'Sesuai', 's4' => 'Sangat Sesuai'],
            ['code' => 'U6', 'name' => 'Kompetensi Pelaksana', 'q' => 'Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam memberikan pelayanan?', 's1' => 'Tidak Kompeten', 's2' => 'Kurang Kompeten', 's3' => 'Kompeten', 's4' => 'Sangat Kompeten'],
            ['code' => 'U7', 'name' => 'Perilaku Pelaksana', 'q' => 'Bagaimana pendapat Saudara tentang perilaku petugas terkait kesopanan dan keramahan?', 's1' => 'Tidak Sopan/Ramah', 's2' => 'Kurang Sopan/Ramah', 's3' => 'Sopan/Ramah', 's4' => 'Sangat Sopan/Ramah'],
            ['code' => 'U8', 'name' => 'Penanganan Pengaduan, Saran dan Masukan', 'q' => 'Bagaimana pendapat Saudara tentang kualitas penanganan pengaduan, saran, dan masukan di unit pelayanan?', 's1' => 'Tidak Respon', 's2' => 'Kurang Respon', 's3' => 'Responsif', 's4' => 'Sangat Responsif'],
            ['code' => 'U9', 'name' => 'Sarana dan Prasarana', 'q' => 'Bagaimana pendapat Saudara tentang kenyamanan dan kualitas sarana prasarana pendukung pelayanan?', 's1' => 'Buruk', 's2' => 'Cukup/Kurang Baik', 's3' => 'Baik/Nyaman', 's4' => 'Sangat Baik/Mewah'],
        ];

        foreach ($indicators as $index => $ind) {
            SurveyQuestion::create([
                'survey_id' => $survey->id,
                'indicator_code' => $ind['code'],
                'indicator_name' => $ind['name'],
                'question_text' => $ind['q'],
                'scale_1_label' => $ind['s1'],
                'scale_2_label' => $ind['s2'],
                'scale_3_label' => $ind['s3'],
                'scale_4_label' => $ind['s4'],
                'is_mandatory' => true,
                'order_index' => $index,
            ]);
        }
    }
}
