<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();

            $table->string('name');

            $table->enum('status', ['active', 'inactive'])
                ->default('active');

            $table->decimal('fee', 12, 2)->default(0);
            $table->decimal('minimum_transaction', 12, 2)->default(0);
            $table->decimal('maximum_transaction', 12, 2)->default(0);

            $table->string('icon')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
