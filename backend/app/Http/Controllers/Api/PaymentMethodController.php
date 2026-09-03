<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\PaymentMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => PaymentMethod::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'in:active,inactive'],
            'fee' => ['nullable', 'numeric', 'min:0'],
            'minimum_transaction' => ['nullable', 'numeric', 'min:0'],
            'maximum_transaction' => ['nullable', 'numeric', 'min:0'],
            'icon' => ['nullable', 'string', 'max:100'],
        ]);

        $paymentMethod = PaymentMethod::create($validated);

        $this->logActivity($request, 'add', $paymentMethod->name);

        return response()->json([
            'success' => true,
            'message' => 'Payment method berhasil ditambahkan.',
            'data' => $paymentMethod,
        ], 201);
    }

    public function update(
        Request $request,
        PaymentMethod $paymentMethod
    ): JsonResponse {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'status' => ['nullable', 'in:active,inactive'],
            'fee' => ['nullable', 'numeric', 'min:0'],
            'minimum_transaction' => ['nullable', 'numeric', 'min:0'],
            'maximum_transaction' => ['nullable', 'numeric', 'min:0'],
            'icon' => ['nullable', 'string', 'max:100'],
        ]);

        $paymentMethod->update($validated);

        $this->logActivity($request, 'edit', $paymentMethod->name);

        return response()->json([
            'success' => true,
            'message' => 'Payment method berhasil diperbarui.',
            'data' => $paymentMethod->fresh(),
        ]);
    }

    public function destroy(
        Request $request,
        PaymentMethod $paymentMethod
    ): JsonResponse {
        $name = $paymentMethod->name;

        $paymentMethod->delete();

        $this->logActivity($request, 'delete', $name);

        return response()->json([
            'success' => true,
            'message' => 'Payment method berhasil dihapus.',
        ]);
    }

    public function toggle(
        Request $request,
        PaymentMethod $paymentMethod
    ): JsonResponse {
        $paymentMethod->update([
            'status' => $paymentMethod->status === 'active' ? 'inactive' : 'active',
        ]);

        $this->logActivity($request, 'toggle', $paymentMethod->name);

        return response()->json([
            'success' => true,
            'data' => $paymentMethod->fresh(),
        ]);
    }

    private function logActivity(
        Request $request,
        string $action,
        string $paymentMethodName,
    ): void {
        $user = $request->user();

        ActivityLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->staff?->full_name ?? $user?->name,
            'action' => 'UPDATE',
            'module' => 'Payment Method',
            'description' => "{$action} payment method {$paymentMethodName}",
            'status' => 'Success',
        ]);
    }
}
