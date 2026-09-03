<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();

            $table->string('name');

            $table->string('sku')->unique();

            $table->text('description')->nullable();

            $table->decimal('stock', 15, 3)->default(0);

            $table->decimal('minimum_stock', 15, 3)->default(0);

            $table->string('unit');

            $table->decimal('cost_per_unit', 15, 2)->default(0);

            $table->string('image')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
