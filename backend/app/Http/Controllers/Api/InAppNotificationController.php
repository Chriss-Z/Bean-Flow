<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InAppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InAppNotificationController extends Controller
{
    /**
     * GET /api/notifications
     *
     * Mengembalikan 50 notifikasi terbaru, setara dengan
     * .slice(0, 50) di pushNotification() versi lama.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => InAppNotification::latest()->limit(50)->get(),
        ]);
    }

    /**
     * POST /api/notifications
     *
     * Setara dengan pushNotification() di context lama.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['nullable', 'string'],
            'module' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        $notification = InAppNotification::create([
            'title' => $validated['title'],
            'message' => $validated['message'] ?? null,
            'module' => $validated['module'] ?? 'System',
            'status' => $validated['status'] ?? 'Info',
        ]);

        /*
         * Jaga supaya tabel tidak tumbuh tanpa batas:
         * hapus notifikasi di luar 50 yang terbaru.
         */
        $staleIds = InAppNotification::orderByDesc('id')
            ->skip(50)
            ->take(PHP_INT_MAX)
            ->pluck('id');

        if ($staleIds->isNotEmpty()) {
            InAppNotification::whereIn('id', $staleIds)->delete();
        }

        return response()->json([
            'success' => true,
            'data' => $notification,
        ], 201);
    }

    /**
     * PATCH /api/notifications/{notification}/read
     */
    public function markRead(InAppNotification $notification): JsonResponse
    {
        $notification->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'data' => $notification->fresh(),
        ]);
    }

    /**
     * DELETE /api/notifications
     *
     * Hapus semua notifikasi (dipakai saat resetApplicationData).
     */
    public function clear(): JsonResponse
    {
        InAppNotification::query()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi berhasil dihapus.',
        ]);
    }
}
