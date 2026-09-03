<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StaffController extends Controller
{
    public function index(): JsonResponse
    {
        $staff = Staff::with('user')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $staff,
        ]);
    }

    public function show(Staff $staff): JsonResponse
    {
        $staff->load('user');

        return response()->json([
            'success' => true,
            'data' => $staff,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'staff_code' => 'required|string|max:50|unique:staff,staff_code',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:staff,email',
            'phone' => 'nullable|string|max:20',
            'position' => 'required|string|max:100',
            'role' => 'required|string|max:100',
            'hire_date' => 'nullable|date',
            'address' => 'nullable|string',
            'status' => 'required|in:Active,Inactive',
            'about' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $staff = Staff::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Staff berhasil ditambahkan.',
            'data' => $staff->load('user'),
        ], 201);
    }

    public function update(Request $request, Staff $staff): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('staff', 'email')
                    ->ignore($staff->id),
            ],

            'phone' => 'nullable|string|max:20',
            'position' => 'required|string|max:100',
            'role' => 'required|string|max:100',
            'hire_date' => 'nullable|date',
            'address' => 'nullable|string',
            'status' => 'required|in:Active,Inactive',
            'about' => 'nullable|string',

            // PHOTO
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('staff', 'public');

            $validated['photo'] = $path;
        }

        $staff->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Staff berhasil diperbarui.',
            'data' => $staff->fresh()->load('user'),
        ]);
    }

    public function destroy(Staff $staff): JsonResponse
    {
        $staff->delete();

        return response()->json([
            'success' => true,
            'message' => 'Staff berhasil dihapus.',
        ]);
    }
}
