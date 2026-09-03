<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\InventoryMovementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with([
            'user',
            'items.product.category',
        ])
            ->latest('transaction_date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    public function show(Transaction $transaction)
    {
        $transaction->load([
            'user',
            'items.product.category',
        ]);

        return response()->json([
            'success' => true,
            'data' => $transaction,
        ]);
    }

    public function store(
        Request $request,
        InventoryMovementService $inventoryMovementService
    ) {
        $validated = $request->validate([
            'invoice_number' => 'required|string|unique:transactions,invoice_number',
            'user_id' => 'required|exists:users,id',
            'transaction_date' => 'required|date',
            'payment_method' => 'required|string',
            'status' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'grand_total' => 'required|numeric|min:0',

            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_name' => 'required|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.subtotal' => 'required|numeric|min:0',
        ]);

        $transaction = DB::transaction(function () use (
            $validated,
            $inventoryMovementService
        ) {
            $transaction = Transaction::create([
                'invoice_number' => $validated['invoice_number'],
                'user_id' => $validated['user_id'],
                'transaction_date' => $validated['transaction_date'],
                'payment_method' => $validated['payment_method'],
                'status' => $validated['status'],
                'subtotal' => $validated['subtotal'],
                'tax' => $validated['tax'],
                'grand_total' => $validated['grand_total'],
            ]);

            $transaction->items()->createMany(
                $validated['items']
            );

            /*
             * Kurangi inventory hanya jika transaksi Completed.
             */
            if ($transaction->status === 'Completed') {
                $inventoryMovementService
                    ->deductForTransaction($transaction);
            }

            return $transaction;
        });

        $transaction->load([
            'user',
            'items.product.category',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dibuat.',
            'data' => $transaction,
        ], 201);
    }
}
