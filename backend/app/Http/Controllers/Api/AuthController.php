<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * LOGIN
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::with([
            'staff',
            'roleModel.permissions',
        ])
            ->where('email', $credentials['email'])
            ->first();

        if (
            !$user ||
            !Hash::check($credentials['password'], $user->password)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah.',
            ], 401);
        }

        /**
         * Hapus token lama.
         */
        $user->tokens()->delete();

        /**
         * Buat token baru.
         */
        $token = $user
            ->createToken('bean-flow-frontend')
            ->plainTextToken;

        /**
         * Update status login.
         */
        $user->update([
            'login_status' => 'Online',
            'last_login' => now(),
        ]);

        /**
         * Refresh data user setelah update.
         */
        $user->refresh();

        $user->load([
            'staff',
            'roleModel.permissions',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * CURRENT USER
     */
    public function me(Request $request)
    {
        $user = $request->user()->load([
            'staff',
            'roleModel.permissions',
        ]);

        return response()->json([
            'success' => true,
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * LOGOUT
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        $user->update([
            'login_status' => 'Offline',
            'last_logout' => now(),
        ]);

        $currentToken = $user->currentAccessToken();

        if ($currentToken) {
            $currentToken->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * FORMAT USER RESPONSE
     *
     * Semua informasi role dan permission
     * dikirim dari backend ke frontend.
     */
    private function formatUser(User $user): array
    {
        $role = $user->roleModel;

        /**
         * Admin otomatis memiliki semua permission
         * berdasarkan User::canPermission().
         *
         * Tetapi untuk frontend kita tetap kirim
         * daftar permission aktual dari database.
         */
        if ($user->role === 'admin') {
            $permissions = \App\Models\Permission::pluck('slug')->values()->toArray();
        } else {
            $permissions = $role
                ? $role->permissions
                ->pluck('slug')
                ->values()
                ->toArray()
                : [];
        }

        return [
            'id' => $user->id,

            'staff_id' =>
            $user->staff?->staff_code
                ?? $user->staff_id,

            'name' =>
            $user->staff?->full_name
                ?? $user->name,

            'username' => $user->username,

            'email' => $user->email,

            /**
             * Identifier role.
             *
             * Contoh:
             * admin
             * manager
             * cashier
             * inventory_staff
             * payroll_staff
             */
            'role' => $user->role,

            /**
             * Nama role untuk UI.
             *
             * Contoh:
             * Admin
             * Manager
             * Cashier
             * Inventory Staff
             * HR / Payroll Staff
             */
            'role_name' => $role?->name ?? $user->role,

            /**
             * Slug role.
             */
            'role_slug' => $role?->slug ?? $user->role,

            /**
             * Permission dari backend.
             */
            'permissions' => $permissions,

            'login_status' => $user->login_status,

            'last_login' => $user->last_login,

            'last_logout' => $user->last_logout,

            'two_factor' => $user->two_factor,
        ];
    }
}
