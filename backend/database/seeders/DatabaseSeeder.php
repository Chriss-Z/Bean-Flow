<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            StaffSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            InventoryItemSeeder::class,
            ProductIngredientSeeder::class,
            TransactionSeeder::class,
            RolePermissionSeeder::class,




        ]);
    }
}
