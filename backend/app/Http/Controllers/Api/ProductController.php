<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | INDEX
    |--------------------------------------------------------------------------
    */

    public function index(): JsonResponse
    {
        $products = Product::with([
            'category',
            'ingredients.inventoryItem',
        ])
            ->where('is_active', true)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | SHOW
    |--------------------------------------------------------------------------
    */

    public function show(Product $product): JsonResponse
    {
        $product->load([
            'category',
            'ingredients.inventoryItem',
        ]);

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | STORE
    |--------------------------------------------------------------------------
    */

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',

            'name' => 'required|string|max:255',

            'sku' => 'required|string|max:100|unique:products,sku',

            'description' => 'nullable|string',

            'price' => 'required|numeric|min:0',

            'cost_price' => 'required|numeric|min:0',

            'unit' => 'required|string|max:50',

            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'is_active' => 'sometimes|boolean',

            /*
            |--------------------------------------------------------------------------
            | INGREDIENTS
            |--------------------------------------------------------------------------
            */

            'ingredients' => 'nullable|array',

            'ingredients.*.inventory_item_id' =>
            'required|exists:inventory_items,id',

            'ingredients.*.quantity' =>
            'required|numeric|min:0.001',
        ]);


        /*
        |--------------------------------------------------------------------------
        | IMAGE
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('image')) {
            $validated['image'] = $request
                ->file('image')
                ->store('products', 'public');
        }


        /*
        |--------------------------------------------------------------------------
        | DATABASE TRANSACTION
        |--------------------------------------------------------------------------
        */

        $product = DB::transaction(function () use ($validated) {

            /*
            | Create Product
            */

            $product = Product::create(
                collect($validated)
                    ->except('ingredients')
                    ->toArray()
            );


            /*
            | Create Ingredients
            */

            foreach ($validated['ingredients'] ?? [] as $ingredient) {

                $product->ingredients()->create([
                    'inventory_item_id' =>
                    $ingredient['inventory_item_id'],

                    'quantity' =>
                    $ingredient['quantity'],
                ]);
            }

            return $product;
        });


        /*
        |--------------------------------------------------------------------------
        | LOAD RELATIONSHIPS
        |--------------------------------------------------------------------------
        */

        $product->load([
            'category',
            'ingredients.inventoryItem',
        ]);


        return response()->json([
            'success' => true,
            'message' => 'Product berhasil dibuat.',
            'data' => $product,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Product $product
    ): JsonResponse {

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',

            'name' => 'required|string|max:255',

            'sku' =>
            'required|string|max:100|unique:products,sku,' .
                $product->id,

            'description' => 'nullable|string',

            'price' => 'required|numeric|min:0',

            'cost_price' => 'required|numeric|min:0',

            'unit' => 'required|string|max:50',

            'image' =>
            'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'is_active' => 'sometimes|boolean',

            /*
            |--------------------------------------------------------------------------
            | INGREDIENTS
            |--------------------------------------------------------------------------
            */

            'ingredients' => 'nullable|array',

            'ingredients.*.inventory_item_id' =>
            'required|exists:inventory_items,id',

            'ingredients.*.quantity' =>
            'required|numeric|min:0.001',
        ]);


        /*
        |--------------------------------------------------------------------------
        | IMAGE
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('image')) {

            if ($product->image) {
                Storage::disk('public')->delete(
                    $product->image
                );
            }

            $validated['image'] = $request
                ->file('image')
                ->store('products', 'public');
        }


        /*
        |--------------------------------------------------------------------------
        | DATABASE TRANSACTION
        |--------------------------------------------------------------------------
        */

        DB::transaction(function () use (
            $product,
            $validated
        ) {

            /*
            | Update Product
            */

            $product->update(
                collect($validated)
                    ->except('ingredients')
                    ->toArray()
            );


            /*
            | Replace Ingredients
            |
            | Recipe lama dihapus,
            | kemudian recipe baru dibuat.
            */

            $product->ingredients()->delete();


            foreach ($validated['ingredients'] ?? [] as $ingredient) {

                $product->ingredients()->create([
                    'inventory_item_id' =>
                    $ingredient['inventory_item_id'],

                    'quantity' =>
                    $ingredient['quantity'],
                ]);
            }
        });


        /*
        |--------------------------------------------------------------------------
        | LOAD RELATIONSHIPS
        |--------------------------------------------------------------------------
        */

        $product->load([
            'category',
            'ingredients.inventoryItem',
        ]);


        return response()->json([
            'success' => true,
            'message' => 'Product berhasil diperbarui.',
            'data' => $product,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DESTROY
    |--------------------------------------------------------------------------
    */

    public function destroy(Product $product): JsonResponse
    {
        /*
        | Jangan benar-benar menghapus product.
        | Gunakan soft deactivate.
        */

        $product->update([
            'is_active' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product berhasil dinonaktifkan.',
        ]);
    }
}
