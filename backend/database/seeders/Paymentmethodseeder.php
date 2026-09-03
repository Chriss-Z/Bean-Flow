<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        foreach (PaymentMethod::defaults() as $method) {
            PaymentMethod::firstOrCreate(
                ['name' => $method['name']],
                $method,
            );
        }
    }
}
