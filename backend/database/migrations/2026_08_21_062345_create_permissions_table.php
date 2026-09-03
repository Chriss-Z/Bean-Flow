<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();

            // Nama permission
            // Contoh: Create Inventory
            $table->string('name');

            // Identifier permission
            // Contoh: inventory.create
            $table->string('slug')->unique();

            // Module
            // Contoh: inventory
            $table->string('module');

            // Action
            // view, create, edit, delete
            $table->string('action');

            $table->timestamps();

            $table->unique([
                'module',
                'action'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
