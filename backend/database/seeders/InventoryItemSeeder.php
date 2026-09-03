<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryItem;

class InventoryItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'name' => 'Arabica Coffee Bean',
                'sku' => 'INV-COF-001',
                'description' => 'Arabica coffee beans',
                'stock' => 10,
                'minimum_stock' => 5,
                'unit' => 'kg',
                'cost_per_unit' => 120000,
                'is_active' => true,
            ],
            [
                'name' => 'Fresh Milk',
                'sku' => 'INV-MLK-001',
                'description' => 'Fresh milk',
                'stock' => 20,
                'minimum_stock' => 5,
                'unit' => 'liter',
                'cost_per_unit' => 20000,
                'is_active' => true,
            ],
            [
                'name' => 'Caramel Syrup',
                'sku' => 'INV-SYR-001',
                'description' => 'Caramel syrup',
                'stock' => 10,
                'minimum_stock' => 3,
                'unit' => 'bottle',
                'cost_per_unit' => 75000,
                'is_active' => true,
            ],
            [
                'name' => 'Coffee Cup',
                'sku' => 'INV-CUP-001',
                'description' => '12oz coffee cup',
                'stock' => 100,
                'minimum_stock' => 20,
                'unit' => 'pcs',
                'cost_per_unit' => 1500,
                'is_active' => true,
            ],
        ];

        foreach ($items as $data) {
            InventoryItem::updateOrCreate(
                [
                    'sku' => $data['sku'],
                ],
                $data
            );
        }
    }
}
