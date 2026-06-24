<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use App\Models\AuditLog;
use App\Models\Opd;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAction($request);

        $users = User::with(['roles', 'opd'])->get();
        $roles = Role::all();
        $opds = Opd::all();

        $apiTokens = ApiToken::orderBy('created_at', 'desc')->get();
        $auditLogs = AuditLog::with('user')->orderBy('created_at', 'desc')->limit(100)->get();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => $roles,
            'opds' => $opds,
            'apiTokens' => $apiTokens,
            'auditLogs' => $auditLogs,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAction($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role_id' => ['required', 'exists:roles,id'],
            'opd_id' => ['nullable', 'exists:opds,id'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'opd_id' => $validated['opd_id'],
        ]);

        $user->roles()->attach($validated['role_id']);

        AuditLog::log("Created user Account: {$user->email}");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Akun pengguna berhasil ditambahkan.']);

        return redirect()->back();
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAction($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', "unique:users,email,{$user->id}"],
            'password' => ['nullable', 'string', 'min:8'],
            'role_id' => ['required', 'exists:roles,id'],
            'opd_id' => ['nullable', 'exists:opds,id'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'opd_id' => $validated['opd_id'],
        ]);

        if (! empty($validated['password'])) {
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);
        }

        $user->roles()->sync([$validated['role_id']]);

        AuditLog::log("Updated user Account: {$user->email}");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Akun pengguna berhasil diperbarui.']);

        return redirect()->back();
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAction($request);

        if ($user->id === $request->user()->id) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Anda tidak bisa menghapus akun Anda sendiri yang sedang aktif.']);

            return redirect()->back();
        }

        $email = $user->email;
        $user->delete();

        AuditLog::log("Deleted user Account: {$email}");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Akun pengguna berhasil dihapus.']);

        return redirect()->back();
    }

    /**
     * Store a new API Token for national or external integration.
     */
    public function storeToken(Request $request): RedirectResponse
    {
        $this->authorizeAction($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $tokenStr = Str::random(40);

        ApiToken::create([
            'name' => $validated['name'],
            'token' => hash('sha256', $tokenStr),
            'abilities' => ['view-results', 'submit-responses'],
        ]);

        AuditLog::log("Generated API Integration Token: {$validated['name']}");

        // Save unhashed token in session flash so user can copy it once
        $request->session()->flash('plainTextToken', $tokenStr);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Token API berhasil dibuat. Silakan salin sekarang karena token tidak akan ditampilkan kembali.',
        ]);

        return redirect()->back();
    }

    /**
     * Delete an API Token.
     */
    public function destroyToken(Request $request, ApiToken $apiToken): RedirectResponse
    {
        $this->authorizeAction($request);

        $name = $apiToken->name;
        $apiToken->delete();

        AuditLog::log("Revoked API Integration Token: {$name}");

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Token API berhasil dicabut.']);

        return redirect()->back();
    }

    private function authorizeAction(Request $request): void
    {
        if (! $request->user()->hasPermission('manage-users')) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengelola pengguna/keamanan.');
        }
    }
}
