<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /*
    |--------------------------------------------------------------------------
    | IN APP NOTIFICATIONS
    |--------------------------------------------------------------------------
    |
    | Diberi nama in_app_notifications (bukan "notifications") karena
    | Laravel sudah memakai nama tabel "notifications" untuk trait
    | Notifiable bawaan pada model User.
    |
    */
    public function up(): void
    {
        Schema::create('in_app_notifications', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->text('message')->nullable();

            $table->string('module')->default('System');
            $table->string('status')->default('Info');

            $table->timestamp('read_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('in_app_notifications');
    }
};
