<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\SurveyPeriod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeriodController extends Controller
{
    public function index(Request $request): Response
    {
        $periods = SurveyPeriod::orderBy('start_date', 'desc')->get();

        $isSuperAdmin = $request->user()->hasRole('superadmin');

        return Inertia::render('admin/periods/index', [
            'periods' => $periods,
            'canManage' => $isSuperAdmin,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAction($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'is_active' => ['required', 'boolean'],
        ]);

        if ($validated['is_active']) {
            // Deactivate other periods
            SurveyPeriod::where('is_active', true)->update(['is_active' => false]);
        }

        $period = SurveyPeriod::create($validated);

        AuditLog::log("Created Survey Period: {$period->name}");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Periode survei berhasil ditambahkan.']);

        return redirect()->back();
    }

    public function update(Request $request, SurveyPeriod $period): RedirectResponse
    {
        $this->authorizeAction($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'is_active' => ['required', 'boolean'],
        ]);

        if ($validated['is_active']) {
            // Deactivate other periods
            SurveyPeriod::where('id', '!=', $period->id)->where('is_active', true)->update(['is_active' => false]);
        }

        $period->update($validated);

        AuditLog::log("Updated Survey Period: {$period->name}");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Periode survei berhasil diperbarui.']);

        return redirect()->back();
    }

    public function destroy(Request $request, SurveyPeriod $period): RedirectResponse
    {
        $this->authorizeAction($request);

        $name = $period->name;
        $period->delete();

        AuditLog::log("Deleted Survey Period: {$name}");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Periode survei berhasil dihapus.']);

        return redirect()->back();
    }

    private function authorizeAction(Request $request): void
    {
        if (! $request->user()->hasRole('superadmin')) {
            abort(403, 'Hanya Super Administrator yang diperbolehkan mengelola periode survei.');
        }
    }
}
