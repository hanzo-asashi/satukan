<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Opd;
use App\Models\Survey;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAction($request);

        $user = $request->user();
        $isSuperAdmin = $user->hasRole('superadmin');

        $unitsQuery = Unit::with('opd');
        if (! $isSuperAdmin) {
            $unitsQuery->where('opd_id', $user->opd_id);
        }

        $units = $unitsQuery->get();
        $opds = $isSuperAdmin ? Opd::all() : Opd::where('id', $user->opd_id)->get();

        return Inertia::render('admin/units/index', [
            'units' => $units,
            'opds' => $opds,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAction($request);

        $user = $request->user();
        $isSuperAdmin = $user->hasRole('superadmin');

        $validated = $request->validate([
            'opd_id' => ['required', 'exists:opds,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:100', 'unique:units,code'],
            'description' => ['nullable', 'string'],
        ]);

        // Enforce OPD boundaries for non-superadmins
        if (! $isSuperAdmin) {
            $validated['opd_id'] = $user->opd_id;
        }

        $unit = Unit::create($validated);

        AuditLog::log("Created Service Unit: {$unit->name} ({$unit->code})");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Unit layanan berhasil ditambahkan.']);

        return redirect()->back();
    }

    public function update(Request $request, Unit $unit): RedirectResponse
    {
        $this->authorizeAction($request);
        $this->checkScope($request->user(), $unit);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:100', "unique:units,code,{$unit->id}"],
            'description' => ['nullable', 'string'],
        ]);

        $unit->update($validated);

        AuditLog::log("Updated Service Unit: {$unit->name} ({$unit->code})");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Unit layanan berhasil diperbarui.']);

        return redirect()->back();
    }

    public function destroy(Request $request, Unit $unit): RedirectResponse
    {
        $this->authorizeAction($request);
        $this->checkScope($request->user(), $unit);

        $name = $unit->name;
        $code = $unit->code;
        $unit->delete();

        AuditLog::log("Deleted Service Unit: {$name} ({$code})");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Unit layanan berhasil dihapus.']);

        return redirect()->back();
    }

    /**
     * Get QR Code target details for a unit.
     */
    public function qrCode(Request $request, Unit $unit): Response
    {
        $this->checkScope($request->user(), $unit);

        // Fetch active/latest survey for this unit
        $survey = Survey::where('unit_id', $unit->id)
            ->where('is_published', true)
            ->whereHas('period', function ($q) {
                $q->where('is_active', true);
            })
            ->first();

        if (! $survey) {
            $survey = Survey::where('unit_id', $unit->id)->orderBy('created_at', 'desc')->first();
        }

        $surveyUrl = $survey ? route('survey.show', ['token' => $survey->token]) : null;

        return Inertia::render('admin/units/qr', [
            'unit' => $unit->load('opd'),
            'survey' => $survey,
            'surveyUrl' => $surveyUrl,
        ]);
    }

    private function authorizeAction(Request $request): void
    {
        if (! $request->user()->hasPermission('manage-units')) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengelola data Unit Layanan.');
        }
    }

    private function checkScope($user, Unit $unit): void
    {
        if (! $user->hasRole('superadmin') && $unit->opd_id !== $user->opd_id) {
            abort(403, 'Anda tidak memiliki wewenang untuk mengakses unit layanan ini.');
        }
    }
}
