<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Coffee',
                'description' => 'Coffee based drinks',
                'is_active' => true,
            ],
            [
                'name' => 'Non Coffee',
                'description' => 'Non coffee based drinks',
                'is_active' => true,
            ],
            [
                'name' => 'Food',
                'description' => 'Food and pastry',
                'is_active' => true,
            ],
            [
                'name' => 'Merchandise',
                'description' => 'Bean & Flow merchandise',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                [
                    'name' => $category['name'],
                ],
                $category
            );
        }
    }
}
