<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();

            $table->string('staff_code')->unique();

            $table->string('full_name');

            $table->string('email')->unique();

            $table->string('phone')->nullable();

            $table->string('position');

            $table->string('role')->default('Staff');

            $table->date('hire_date')->nullable();

            $table->text('address')->nullable();

            $table->enum('status', [
                'Active',
                'On Leave',
                'Inactive',
            ])->default('Active');

            $table->text('about')->nullable();

            $table->string('photo')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
