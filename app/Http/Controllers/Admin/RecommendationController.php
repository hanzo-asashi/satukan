<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FollowUp;
use App\Models\Recommendation;
use App\Models\SurveyPeriod;
use App\Models\Unit;
use App\Services\AiRecommendationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecommendationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAction($request);

        $user = $request->user();
        $isSuperAdmin = $user->hasRole('superadmin');

        $recsQuery = Recommendation::with(['unit.opd', 'period', 'followUps', 'creator']);

        if (! $isSuperAdmin) {
            $recsQuery->whereHas('unit', function ($q) use ($user) {
                $q->where('opd_id', $user->opd_id);
            });
        }

        $recommendations = $recsQuery->orderBy('created_at', 'desc')->get();
        $periods = SurveyPeriod::orderBy('start_date', 'desc')->get();

        $unitsQuery = Unit::with('opd');
        if (! $isSuperAdmin) {
            $unitsQuery->where('opd_id', $user->opd_id);
        }
        $units = $unitsQuery->get();

        return Inertia::render('admin/recommendations/index', [
            'recommendations' => $recommendations,
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
            'unit_id' => ['required', 'exists:units,id'],
            'period_id' => ['required', 'exists:survey_periods,id'],
            'content' => ['required', 'string'],
            'action_plans' => ['nullable', 'array'],
            'action_plans.*' => ['string'],
        ]);

        if (! $isSuperAdmin) {
            $unit = Unit::findOrFail($validated['unit_id']);
            if ($unit->opd_id !== $user->opd_id) {
                abort(403, 'Anda tidak diizinkan menambahkan rekomendasi untuk unit ini.');
            }
        }

        $rec = Recommendation::create([
            'unit_id' => $validated['unit_id'],
            'period_id' => $validated['period_id'],
            'content' => $validated['content'],
            'created_by' => $user->id,
        ]);

        if (! empty($validated['action_plans'])) {
            foreach ($validated['action_plans'] as $plan) {
                FollowUp::create([
                    'recommendation_id' => $rec->id,
                    'action_plan' => $plan,
                    'deadline' => now()->addMonths(1),
                    'status' => 'not_started',
                    'progress_percentage' => 0,
                ]);
            }
        }

        AuditLog::log("Created Recommendation for unit ID {$rec->unit_id}");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Rekomendasi perbaikan berhasil ditambahkan.']);

        return redirect()->back();
    }

    public function storeFollowUp(Request $request): RedirectResponse
    {
        $this->authorizeAction($request);

        $validated = $request->validate([
            'recommendation_id' => ['required', 'exists:recommendations,id'],
            'action_plan' => ['required', 'string'],
            'deadline' => ['nullable', 'date'],
        ]);

        $rec = Recommendation::findOrFail($validated['recommendation_id']);
        $this->checkScope($request->user(), $rec);

        $followUp = FollowUp::create([
            'recommendation_id' => $rec->id,
            'action_plan' => $validated['action_plan'],
            'deadline' => $validated['deadline'],
            'status' => 'not_started',
            'progress_percentage' => 0,
        ]);

        AuditLog::log("Created Action Plan for recommendation ID {$rec->id}");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Rencana aksi tindak lanjut berhasil ditambahkan.']);

        return redirect()->back();
    }

    public function updateFollowUp(Request $request, FollowUp $followUp): RedirectResponse
    {
        $this->authorizeAction($request);
        $rec = $followUp->recommendation;
        $this->checkScope($request->user(), $rec);

        $validated = $request->validate([
            'progress_percentage' => ['required', 'integer', 'min:0', 'max:100'],
            'status' => ['required', 'in:not_started,in_progress,completed'],
            'notes' => ['nullable', 'string'],
        ]);

        if ($validated['status'] === 'completed' && $followUp->status !== 'completed') {
            $validated['completed_at'] = now();
            $validated['progress_percentage'] = 100;
        }

        $followUp->update($validated);

        AuditLog::log("Updated Action Plan progress to {$followUp->progress_percentage}%: status {$followUp->status}");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kemajuan tindak lanjut berhasil diperbarui.']);

        return redirect()->back();
    }

    public function generateAi(Request $request): JsonResponse
    {
        $this->authorizeAction($request);

        $validated = $request->validate([
            'unit_id' => ['required', 'exists:units,id'],
            'period_id' => ['required', 'exists:survey_periods,id'],
        ]);

        $user = $request->user();
        $isSuperAdmin = $user->hasRole('superadmin');

        if (! $isSuperAdmin) {
            $unit = Unit::findOrFail($validated['unit_id']);
            if ($unit->opd_id !== $user->opd_id) {
                abort(403, 'Anda tidak diizinkan mengakses rekomendasi untuk unit ini.');
            }
        }

        $result = AiRecommendationService::generate(
            (int) $validated['unit_id'],
            (int) $validated['period_id']
        );

        return response()->json($result);
    }

    private function authorizeAction(Request $request): void
    {
        if (! $request->user()->hasPermission('manage-recommendations')) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengelola rekomendasi & tindak lanjut.');
        }
    }

    private function checkScope($user, Recommendation $rec): void
    {
        if (! $user->hasRole('superadmin')) {
            $unit = Unit::findOrFail($rec->unit_id);
            if ($unit->opd_id !== $user->opd_id) {
                abort(403, 'Anda tidak memiliki wewenang untuk unit ini.');
            }
        }
    }
}
