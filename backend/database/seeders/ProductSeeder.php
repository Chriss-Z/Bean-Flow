<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $coffee = Category::where('name', 'Coffee')->first();
        $nonCoffee = Category::where('name', 'Non Coffee')->first();
        $food = Category::where('name', 'Food')->first();

        $products = [
            [
                'category_id' => $coffee->id,
                'name' => 'Americano',
                'sku' => 'BF-COF-001',
                'description' => 'Classic espresso with water',
                'price' => 18000,
                'cost_price' => 7000,
                'unit' => 'cup',
                'is_active' => true,
            ],
            [
                'category_id' => $coffee->id,
                'name' => 'Cafe Latte',
                'sku' => 'BF-COF-002',
                'description' => 'Espresso with steamed milk',
                'price' => 25000,
                'cost_price' => 10000,
                'unit' => 'cup',
                'is_active' => true,
            ],
            [
                'category_id' => $coffee->id,
                'name' => 'Cappuccino',
                'sku' => 'BF-COF-003',
                'description' => 'Espresso with milk foam',
                'price' => 25000,
                'cost_price' => 10000,
                'unit' => 'cup',
                'is_active' => true,
            ],
            [
                'category_id' => $nonCoffee->id,
                'name' => 'Matcha Latte',
                'sku' => 'BF-NC-001',
                'description' => 'Matcha with fresh milk',
                'price' => 28000,
                'cost_price' => 12000,
                'unit' => 'cup',
                'is_active' => true,
            ],
            [
                'category_id' => $food->id,
                'name' => 'Croissant',
                'sku' => 'BF-FD-001',
                'description' => 'Fresh butter croissant',
                'price' => 22000,
                'cost_price' => 9000,
                'unit' => 'pcs',
                'is_active' => true,
            ],
        ];

        foreach ($products as $data) {
            Product::updateOrCreate(
                [
                    'sku' => $data['sku'],
                ],
                $data
            );
        }
    }
}
