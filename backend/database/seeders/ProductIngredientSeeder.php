<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\InventoryItem;
use App\Models\ProductIngredient;

class ProductIngredientSeeder extends Seeder
{
    public function run(): void
    {
        $coffeeBean = InventoryItem::where(
            'name',
            'Arabica Coffee Bean'
        )->first();

        $milk = InventoryItem::where(
            'name',
            'Fresh Milk'
        )->first();

        $cup = InventoryItem::where(
            'name',
            'Coffee Cup'
        )->first();

        $americano = Product::where(
            'name',
            'Americano'
        )->first();

        $latte = Product::where(
            'name',
            'Cafe Latte'
        )->first();

        $cappuccino = Product::where(
            'name',
            'Cappuccino'
        )->first();

        /*
        |--------------------------------------------------------------------------
        | Validasi data
        |--------------------------------------------------------------------------
        */

        if (
            !$coffeeBean ||
            !$milk ||
            !$cup ||
            !$americano ||
            !$latte ||
            !$cappuccino
        ) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Product Ingredients
        |--------------------------------------------------------------------------
        */

        $ingredients = [

            // Americano
            [
                'product_id' => $americano->id,
                'inventory_item_id' => $coffeeBean->id,
                'quantity' => 0.018,
            ],
            [
                'product_id' => $americano->id,
                'inventory_item_id' => $cup->id,
                'quantity' => 1,
            ],

            // Cafe Latte
            [
                'product_id' => $latte->id,
                'inventory_item_id' => $coffeeBean->id,
                'quantity' => 0.018,
            ],
            [
                'product_id' => $latte->id,
                'inventory_item_id' => $milk->id,
                'quantity' => 0.150,
            ],
            [
                'product_id' => $latte->id,
                'inventory_item_id' => $cup->id,
                'quantity' => 1,
            ],

            // Cappuccino
            [
                'product_id' => $cappuccino->id,
                'inventory_item_id' => $coffeeBean->id,
                'quantity' => 0.018,
            ],
            [
                'product_id' => $cappuccino->id,
                'inventory_item_id' => $milk->id,
                'quantity' => 0.100,
            ],
            [
                'product_id' => $cappuccino->id,
                'inventory_item_id' => $cup->id,
                'quantity' => 1,
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Insert / Update
        |--------------------------------------------------------------------------
        */

        foreach ($ingredients as $data) {
            ProductIngredient::updateOrCreate(
                [
                    'product_id' => $data['product_id'],
                    'inventory_item_id' => $data['inventory_item_id'],
                ],
                [
                    'quantity' => $data['quantity'],
                ]
            );
        }
    }
}
