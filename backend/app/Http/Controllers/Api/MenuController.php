<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    /**
     * GET /api/menu
     *
     * Menampilkan semua menu aktif
     * beserta category dan ingredients.
     */
    public function index(): JsonResponse
    {
        $menus = Product::with([
            'category',
            'ingredients.inventoryItem',
        ])
            ->where('is_active', true)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $menus,
        ]);
    }

    /**
     * GET /api/menu/{menu}
     *
     * Menampilkan detail satu menu.
     */
    public function show(Product $menu): JsonResponse
    {
        $menu->load([
            'category',
            'ingredients.inventoryItem',
        ]);

        return response()->json([
            'success' => true,
            'data' => $menu,
        ]);
    }

    /**
     * POST /api/menu
     *
     * Membuat menu baru beserta ingredients.
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

            'is_active' => 'boolean',

            /*
             * Ingredients / Recipe
             *
             * Setiap ingredient harus mengambil
             * inventory_item yang sudah ada.
             */
            'ingredients' => 'nullable|array',

            'ingredients.*.inventory_item_id' => [
                'required_with:ingredients',
                'exists:inventory_items,id',
            ],

            'ingredients.*.quantity' => [
                'required_with:ingredients',
                'numeric',
                'min:0.001',
            ],
        ]);

        /*
         * Upload image
         */
        if ($request->hasFile('image')) {
            $validated['image'] = $request
                ->file('image')
                ->store('products', 'public');
        }

        /*
         * Buat Product/Menu
         *
         * ingredients tidak masuk ke tabel products.
         */
        $menu = Product::create(
            collect($validated)
                ->except('ingredients')
                ->toArray()
        );

        /*
         * Simpan ingredients ke
         * product_ingredients.
         */
        foreach ($request->input('ingredients', []) as $ingredient) {
            $menu->ingredients()->create([
                'inventory_item_id' => $ingredient['inventory_item_id'],
                'quantity' => $ingredient['quantity'],
            ]);
        }

        /*
         * Load kembali data lengkap.
         */
        $menu->load([
            'category',
            'ingredients.inventoryItem',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil dibuat.',
            'data' => $menu,
        ], 201);
    }

    /**
     * PUT /api/menu/{menu}
     *
     * Update menu beserta recipe.
     */
    public function update(
        Request $request,
        Product $menu
    ): JsonResponse {

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',

            'name' => 'required|string|max:255',

            'sku' => 'required|string|max:100|unique:products,sku,' . $menu->id,

            'description' => 'nullable|string',

            'price' => 'required|numeric|min:0',

            'cost_price' => 'required|numeric|min:0',

            'unit' => 'required|string|max:50',

            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'is_active' => 'boolean',

            'ingredients' => 'nullable|array',

            'ingredients.*.inventory_item_id' => [
                'required_with:ingredients',
                'exists:inventory_items,id',
            ],

            'ingredients.*.quantity' => [
                'required_with:ingredients',
                'numeric',
                'min:0.001',
            ],
        ]);

        /*
         * Jika upload gambar baru,
         * hapus gambar lama.
         */
        if ($request->hasFile('image')) {

            if ($menu->image) {
                Storage::disk('public')->delete($menu->image);
            }

            $validated['image'] = $request
                ->file('image')
                ->store('products', 'public');
        }

        /*
         * Update data Menu/Product.
         */
        $menu->update(
            collect($validated)
                ->except('ingredients')
                ->toArray()
        );

        /*
         * Hapus recipe lama.
         */
        $menu->ingredients()->delete();

        /*
         * Simpan recipe baru.
         */
        foreach ($request->input('ingredients', []) as $ingredient) {
            $menu->ingredients()->create([
                'inventory_item_id' => $ingredient['inventory_item_id'],
                'quantity' => $ingredient['quantity'],
            ]);
        }

        /*
         * Load data lengkap.
         */
        $menu->load([
            'category',
            'ingredients.inventoryItem',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil diperbarui.',
            'data' => $menu,
        ]);
    }

    /**
     * DELETE /api/menu/{menu}
     *
     * Soft delete secara aplikasi:
     * hanya mengubah is_active menjadi false.
     */
    public function destroy(Product $menu): JsonResponse
    {
        $menu->update([
            'is_active' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil dinonaktifkan.',
        ]);
    }
}
