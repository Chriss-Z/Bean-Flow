<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index(): JsonResponse
    {
        $items = InventoryItem::with('productIngredients')
            ->where('is_active', true)
            ->get();

        $items->transform(function ($item) {
            if ($item->image) {
                $item->image = asset('storage/' . $item->image);
            }

            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    public function show(InventoryItem $inventoryItem): JsonResponse
    {
        $inventoryItem->load('productIngredients');

        if ($inventoryItem->image) {
            $inventoryItem->image = asset(
                'storage/' . $inventoryItem->image
            );
        }

        return response()->json([
            'success' => true,
            'data' => $inventoryItem,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:255|unique:inventory_items,sku',
            'description' => 'nullable|string',
            'stock' => 'nullable|numeric|min:0',
            'minimum_stock' => 'nullable|numeric|min:0',
            'unit' => 'required|string|max:255',
            'cost_per_unit' => 'required|numeric|min:0',

            // Upload gambar
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store(
                'inventory',
                'public'
            );
        }

        $item = InventoryItem::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Inventory berhasil ditambahkan.',
            'data' => $item,
        ], 201);
    }

    public function update(
        Request $request,
        InventoryItem $inventoryItem
    ): JsonResponse {

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'sku' => 'sometimes|required|string|max:255|unique:inventory_items,sku,' . $inventoryItem->id,
            'description' => 'nullable|string',
            'stock' => 'nullable|numeric|min:0',
            'minimum_stock' => 'nullable|numeric|min:0',
            'unit' => 'sometimes|required|string|max:255',
            'cost_per_unit' => 'sometimes|required|numeric|min:0',

            // Upload gambar
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store(
                'inventory',
                'public'
            );
        }

        $inventoryItem->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Inventory berhasil diperbarui.',
            'data' => $inventoryItem->fresh(),
        ]);
    }

    public function destroy(InventoryItem $inventoryItem): JsonResponse
    {
        $inventoryItem->update([
            'is_active' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inventory berhasil dinonaktifkan.',
        ]);
    }

    public function addStock(
        Request $request,
        InventoryItem $inventoryItem
    ): JsonResponse {

        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.001',

            // Upload gambar optional
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // Tambahkan stock
        $inventoryItem->increment(
            'stock',
            $validated['quantity']
        );

        // Jika user upload gambar
        if ($request->hasFile('image')) {

            $path = $request->file('image')->store(
                'inventory',
                'public'
            );

            $inventoryItem->update([
                'image' => $path,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Stock berhasil ditambahkan.',
            'data' => $inventoryItem->fresh(),
        ]);
    }
}
