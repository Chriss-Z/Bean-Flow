<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;

class InventoryMovementController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryMovement::with([
            'inventoryItem',
            'user:id,name',
        ])
            ->latest();

        if ($request->filled('inventory_item_id')) {
            $query->where(
                'inventory_item_id',
                $request->inventory_item_id
            );
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function show(InventoryMovement $inventoryMovement)
    {
        $inventoryMovement->load([
            'inventoryItem',
            'user:id,name',
        ]);

        return response()->json([
            'success' => true,
            'data' => $inventoryMovement,
        ]);
    }
}
