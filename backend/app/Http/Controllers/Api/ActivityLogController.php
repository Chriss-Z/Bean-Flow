<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * GET /api/activity-logs
     *
     * Support query params:
     * - module   : filter berdasarkan module (Settings, Security, dst)
     * - status   : filter berdasarkan status (Success, Warning, dst)
     * - per_page : jumlah item per halaman (default 50)
     */
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::query()->latest();

        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $logs = $query->paginate(
            $request->integer('per_page', 50)
        );

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * POST /api/activity-logs
     *
     * Dipakai oleh addActivityLog() di frontend untuk mencatat
     * aktivitas dari halaman manapun (bukan hanya settings).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', 'max:100'],
            'module' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        $user = $request->user();

        $log = ActivityLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->staff?->full_name ?? $user?->name,
            'action' => $validated['action'],
            'module' => $validated['module'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'Success',
        ]);

        return response()->json([
            'success' => true,
            'data' => $log,
        ], 201);
    }
}
