<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\InAppNotification;
use App\Models\PaymentMethod;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SettingController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | ALLOWED SECTIONS
    |--------------------------------------------------------------------------
    |
    | Key kiri = nama section yang dipakai di frontend (camelCase).
    | Value kanan = nama kolom di database (snake_case).
    |
    */
    private const SECTIONS = [
        'general' => 'general',
        'storeInformation' => 'store_information',
        'taxAndCharges' => 'tax_and_charges',
        'notification' => 'notification',
        'security' => 'security',
        'backupAndData' => 'backup_and_data',
        'integration' => 'integration',
    ];

    /*
    |--------------------------------------------------------------------------
    | FORMAT RESPONSE
    |--------------------------------------------------------------------------
    |
    | Mengubah kolom snake_case dari DB menjadi bentuk camelCase yang
    | dipakai frontend, supaya bentuk objek "settings" tetap sama
    | persis seperti defaultSettings.js sebelumnya.
    |
    */
    private function formatSetting(Setting $setting): array
    {
        $data = [];

        foreach (self::SECTIONS as $frontendKey => $column) {
            $data[$frontendKey] = $setting->{$column};
        }

        return $data;
    }

    /**
     * GET /api/settings
     *
     * Mengembalikan seluruh settings (semua section) sekaligus.
     */
    public function index(): JsonResponse
    {
        $setting = Setting::current();

        return response()->json([
            'success' => true,
            'data' => $this->formatSetting($setting),
        ]);
    }

    /**
     * PATCH /api/settings/{section}
     *
     * Update satu section saja. Body request berupa object yang akan
     * di-merge (bukan replace total) dengan value section yang ada,
     * supaya konsisten dengan updateSettings(section, value) di
     * SettingsContext lama.
     */
    public function update(Request $request, string $section): JsonResponse
    {
        if (!array_key_exists($section, self::SECTIONS)) {
            return response()->json([
                'success' => false,
                'message' => "Section '{$section}' tidak dikenal.",
            ], 422);
        }

        $validated = $request->validate([
            'value' => ['required', 'array'],
        ]);

        $column = self::SECTIONS[$section];

        $setting = Setting::current();

        $current = $setting->{$column} ?? [];

        $setting->{$column} = array_replace($current, $validated['value']);

        $setting->save();

        $this->logActivity(
            $request,
            action: 'UPDATE',
            module: 'Settings',
            description: "Updated {$section} settings",
        );

        return response()->json([
            'success' => true,
            'message' => 'Settings berhasil diperbarui.',
            'data' => $this->formatSetting($setting->fresh()),
        ]);
    }

    /**
     * POST /api/settings/reset
     *
     * Reset seluruh section settings ke nilai default.
     */
    public function reset(Request $request): JsonResponse
    {
        $setting = Setting::current();

        $setting->update(Setting::defaults());

        $this->logActivity(
            $request,
            action: 'RESET',
            module: 'Settings',
            description: 'Reset all settings to default',
        );

        return response()->json([
            'success' => true,
            'message' => 'Settings berhasil direset ke default.',
            'data' => $this->formatSetting($setting->fresh()),
        ]);
    }

    /**
     * POST /api/settings/integration/{group}/{key}
     *
     * Update status satu integrasi spesifik, contoh:
     * POST /api/settings/integration/payment/qris  { "status": "Connected" }
     */
    public function updateIntegration(
        Request $request,
        string $group,
        string $key
    ): JsonResponse {
        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $setting = Setting::current();

        $integration = $setting->integration ?? [];

        $isConnected = $validated['status'] === 'Connected';

        $integration[$group][$key] = [
            'connected' => $isConnected,
            'lastSync' => $isConnected ? now()->toIso8601String() : null,
            'status' => $validated['status'],
        ];

        $setting->integration = $integration;
        $setting->save();

        $this->logActivity(
            $request,
            action: 'UPDATE',
            module: 'Integration',
            description: "Updated integration {$group}.{$key} to {$validated['status']}",
        );

        return response()->json([
            'success' => true,
            'data' => $this->formatSetting($setting->fresh()),
        ]);
    }

    /**
     * POST /api/settings/backup
     *
     * Setara dengan backupNow() di context lama.
     */
    public function backupNow(Request $request): JsonResponse
    {
        $setting = Setting::current();

        $setting->backup_and_data = array_replace($setting->backup_and_data ?? [], [
            'lastBackup' => now()->toIso8601String(),
            'backupStatus' => 'Completed',
        ]);

        $setting->save();

        $notification = InAppNotification::create([
            'title' => 'Backup Completed',
            'message' => 'Application backup completed successfully',
            'module' => 'Backup',
            'status' => 'Success',
        ]);

        $this->logActivity(
            $request,
            action: 'BACKUP',
            module: 'Backup & Data',
            description: 'Manual backup has been executed',
        );

        return response()->json([
            'success' => true,
            'message' => 'Backup berhasil dijalankan.',
            'data' => $this->formatSetting($setting->fresh()),
            'notification' => $notification,
        ]);
    }

    /**
     * GET /api/settings/export
     *
     * Setara dengan exportAllData() di context lama. Mengembalikan
     * snapshot settings + payment methods + activity logs sebagai
     * satu payload JSON yang bisa didownload frontend.
     */
    public function export(): JsonResponse
    {
        $setting = Setting::current();

        return response()->json([
            'success' => true,
            'data' => [
                'exportedAt' => now()->toIso8601String(),
                'settings' => $this->formatSetting($setting),
                'paymentMethods' => PaymentMethod::all(),
                'activityLogs' => ActivityLog::latest()->limit(500)->get(),
            ],
        ]);
    }

    /**
     * POST /api/settings/import
     *
     * Setara dengan importAllData() di context lama. Menerima payload
     * hasil dari endpoint export di atas.
     */
    public function import(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => ['nullable', 'array'],
            'paymentMethods' => ['nullable', 'array'],
        ]);

        DB::transaction(function () use ($validated) {
            if (!empty($validated['settings'])) {
                $setting = Setting::current();

                $columns = [];

                foreach (self::SECTIONS as $frontendKey => $column) {
                    if (array_key_exists($frontendKey, $validated['settings'])) {
                        $columns[$column] = $validated['settings'][$frontendKey];
                    }
                }

                $setting->update($columns);
            }

            if (!empty($validated['paymentMethods'])) {
                foreach ($validated['paymentMethods'] as $method) {
                    if (empty($method['id'])) {
                        continue;
                    }

                    PaymentMethod::updateOrCreate(
                        ['id' => $method['id']],
                        collect($method)->except('id')->toArray(),
                    );
                }
            }
        });

        $this->logActivity(
            $request,
            action: 'RESTORE',
            module: 'Backup & Data',
            description: 'Imported backup data from JSON',
        );

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diimport.',
            'data' => $this->formatSetting(Setting::current()->fresh()),
        ]);
    }

    /**
     * POST /api/settings/reset-application
     *
     * Setara dengan resetApplicationData() di context lama.
     * Menghapus activity log, notifikasi, dan reset settings.
     * TIDAK menyentuh data transaksional (products, transactions, dll)
     * karena itu di luar cakupan "settings".
     */
    public function resetApplication(Request $request): JsonResponse
    {
        DB::transaction(function () {
            Setting::current()->update(Setting::defaults());
            ActivityLog::query()->delete();
            InAppNotification::query()->delete();
        });

        $this->logActivity(
            $request,
            action: 'RESET',
            module: 'System',
            description: 'Reset application data',
        );

        return response()->json([
            'success' => true,
            'message' => 'Data aplikasi berhasil direset.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER: LOG ACTIVITY
    |--------------------------------------------------------------------------
    */
    private function logActivity(
        Request $request,
        string $action,
        string $module,
        string $description,
        string $status = 'Success',
    ): ActivityLog {
        $user = $request->user();

        return ActivityLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->staff?->full_name ?? $user?->name,
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'status' => $status,
        ]);
    }
}
