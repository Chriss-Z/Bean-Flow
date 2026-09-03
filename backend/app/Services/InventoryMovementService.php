<?php

namespace App\Services;

use App\Models\InventoryMovement;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InventoryMovementService
{
    public function deductForTransaction(Transaction $transaction): void
    {
        $alreadyProcessed = InventoryMovement::query()
            ->where('reference_type', 'transaction')
            ->where('reference_id', $transaction->id)
            ->where('type', 'sale')
            ->exists();

        if ($alreadyProcessed) {
            return;
        }

        DB::transaction(function () use ($transaction) {

            $transaction->load([
                'items.product.ingredients.inventoryItem',
            ]);

            foreach ($transaction->items as $transactionItem) {

                $product = $transactionItem->product;

                if (!$product) {
                    continue;
                }

                $productQuantity = (float) $transactionItem->quantity;

                foreach ($product->ingredients as $ingredient) {

                    $inventoryItem = $ingredient->inventoryItem;

                    if (!$inventoryItem) {
                        continue;
                    }

                    $requiredQuantity =
                        (float) $ingredient->quantity *
                        $productQuantity;

                    $stockBefore = (float) $inventoryItem->stock;

                    $stockAfter =
                        $stockBefore - $requiredQuantity;

                    if ($stockAfter < 0) {
                        throw new RuntimeException(
                            "Stok {$inventoryItem->name} tidak mencukupi."
                        );
                    }

                    $inventoryItem->update([
                        'stock' => $stockAfter,
                    ]);

                    InventoryMovement::create([
                        'inventory_item_id' => $inventoryItem->id,
                        'type' => 'sale',
                        'quantity' => -$requiredQuantity,
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockAfter,
                        'reference_type' => 'transaction',
                        'reference_id' => $transaction->id,
                        'notes' => "Penggunaan bahan untuk transaksi #{$transaction->id}",
                        'user_id' => $transaction->user_id,
                    ]);
                }
            }
        });
    }
}
