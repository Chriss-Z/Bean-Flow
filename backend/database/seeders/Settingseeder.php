<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /*
     * Sebenarnya opsional: Setting::current() akan otomatis membuat
     * baris default saat pertama kali diakses. Seeder ini hanya
     * untuk memastikan baris sudah ada sejak awal deploy.
     */
    public function run(): void
    {
        Setting::current();
    }
}
