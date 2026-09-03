<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RolePermissionController extends Controller
{
    /**
     * Get all roles and permissions.
     */
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')
            ->orderBy('name')
            ->get();

        $permissions = Permission::orderBy('module')
            ->orderBy('action')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'roles' => $roles,
                'permissions' => $permissions,
            ],
        ]);
    }

    /**
     * Get one role with its permissions.
     */
    public function show(Role $role): JsonResponse
    {
        $role->load('permissions');

        return response()->json([
            'success' => true,
            'data' => $role,
        ]);
    }

    /**
     * POST /api/settings/roles
     *
     * Membuat role baru. Slug dibuat otomatis dari name
     * (di-slugify + snake_case) dan dipastikan unik.
     * Role baru dibuat tanpa permission (kosong) - admin
     * mengaturnya lewat endpoint update permissions setelahnya.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:roles,name',
            ],
        ]);

        $baseSlug = Str::slug($validated['name'], '_');
        $slug = $baseSlug;
        $suffix = 1;

        while (Role::where('slug', $slug)->exists()) {
            $suffix++;
            $slug = "{$baseSlug}_{$suffix}";
        }

        $role = Role::create([
            'name' => $validated['name'],
            'slug' => $slug,
        ]);

        $role->load('permissions');

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil dibuat.',
            'data' => $role,
        ], 201);
    }

    /**
     * PUT /api/settings/roles/{role}
     *
     * Update nama role. Slug SENGAJA tidak ikut diubah karena
     * slug dipakai sebagai identifier di users.role (relasi
     * string, bukan foreign key sungguhan) - mengubah slug
     * role yang sedang dipakai user akan membuat user tersebut
     * kehilangan role-nya secara diam-diam.
     */
    public function updateName(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->ignore($role->id),
            ],
        ]);

        $role->update(['name' => $validated['name']]);

        $role->load('permissions');

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil diperbarui.',
            'data' => $role->fresh()->load('permissions'),
        ]);
    }

    /**
     * Update permissions for a role.
     */
    public function update(
        Request $request,
        Role $role
    ): JsonResponse {
        $validated = $request->validate([
            'permissions' => [
                'required',
                'array',
            ],
            'permissions.*' => [
                'exists:permissions,id',
            ],
        ]);

        $role->permissions()->sync(
            $validated['permissions']
        );

        $role->load('permissions');

        return response()->json([
            'success' => true,
            'message' => 'Role permissions updated successfully.',
            'data' => $role,
        ]);
    }

    /**
     * DELETE /api/settings/roles/{role}
     *
     * Role tidak boleh dihapus jika masih ada user yang
     * memakainya (users.role = role.slug), supaya user
     * tersebut tidak diam-diam kehilangan seluruh permission.
     */
    public function destroy(Role $role): JsonResponse
    {
        $userCount = User::where('role', $role->slug)->count();

        if ($userCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Role ini masih dipakai oleh {$userCount} user. Pindahkan user tersebut ke role lain sebelum menghapus.",
            ], 409);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil dihapus.',
        ]);
    }
}
