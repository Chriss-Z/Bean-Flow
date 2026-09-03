<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /*
    |--------------------------------------------------------------------------
    | SETTINGS TABLE
    |--------------------------------------------------------------------------
    |
    | Tabel ini didesain sebagai SINGLETON (hanya 1 baris, id = 1).
    | Setiap "section" pengaturan disimpan sebagai kolom JSON tersendiri
    | supaya bentuknya tetap dekat dengan struktur defaultSettings di
    | frontend, dan supaya update per-section tidak perlu menyentuh
    | section lain.
    |
    | paymentMethods & roles TIDAK disimpan di sini:
    | - paymentMethods -> tabel payment_methods (relasional)
    | - roles/permissions -> sudah ada di tabel roles/permissions
    |
    */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();

            $table->json('general')->nullable();
            $table->json('store_information')->nullable();
            $table->json('tax_and_charges')->nullable();
            $table->json('notification')->nullable();
            $table->json('security')->nullable();
            $table->json('backup_and_data')->nullable();
            $table->json('integration')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
