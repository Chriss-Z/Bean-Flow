<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {

            // Hubungkan akun dengan staff
            $table->foreignId('staff_id')
                ->nullable()
                ->after('id')
                ->constrained('staff')
                ->nullOnDelete();

            // Username untuk login
            $table->string('username')
                ->unique()
                ->nullable()
                ->after('name');

            // Two Factor Authentication
            $table->boolean('two_factor')
                ->default(false)
                ->after('password');

            // Status login
            $table->enum('login_status', [
                'Online',
                'Offline',
            ])
                ->default('Offline')
                ->after('two_factor');

            // Login terakhir
            $table->dateTime('last_login')
                ->nullable()
                ->after('login_status');

            // Logout terakhir
            $table->dateTime('last_logout')
                ->nullable()
                ->after('last_login');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['staff_id']);

            $table->dropColumn([
                'staff_id',
                'username',
                'two_factor',
                'login_status',
                'last_login',
                'last_logout',
            ]);
        });
    }
};
