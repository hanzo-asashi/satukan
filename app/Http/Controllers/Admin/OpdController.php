<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Opd;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OpdController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAction($request);

        $opds = Opd::withCount('units')->get();

        return Inertia::render('admin/opds/index', [
            'opds' => $opds,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAction($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:100', 'unique:opds,code'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'logo_url' => ['nullable', 'url', 'max:2048'],
        ]);

        $opd = Opd::create($validated);

        AuditLog::log("Created OPD: {$opd->name} ({$opd->code})");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'OPD berhasil ditambahkan.']);

        return redirect()->back();
    }

    public function update(Request $request, Opd $opd): RedirectResponse
    {
        $this->authorizeAction($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:100', "unique:opds,code,{$opd->id}"],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'logo_url' => ['nullable', 'url', 'max:2048'],
        ]);

        $opd->update($validated);

        AuditLog::log("Updated OPD: {$opd->name} ({$opd->code})");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'OPD berhasil diperbarui.']);

        return redirect()->back();
    }

    public function destroy(Request $request, Opd $opd): RedirectResponse
    {
        $this->authorizeAction($request);

        $name = $opd->name;
        $code = $opd->code;
        $opd->delete();

        AuditLog::log("Deleted OPD: {$name} ({$code})");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'OPD berhasil dihapus.']);

        return redirect()->back();
    }

    private function authorizeAction(Request $request): void
    {
        if (! $request->user()->hasPermission('manage-opds')) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengelola data OPD.');
        }
    }
}
