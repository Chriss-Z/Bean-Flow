<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $cashier1 = User::where('username', 'john')->firstOrFail();
        $cashier2 = User::where('username', 'sarah')->first();

        $product1 = Product::findOrFail(1);
        $product2 = Product::findOrFail(2);
        $product3 = Product::findOrFail(3);

        /*
        |--------------------------------------------------------------------------
        | Transaction 1
        |--------------------------------------------------------------------------
        */

        $transaction = Transaction::create([
            'invoice_number' => 'INV-20260801-001',
            'user_id' => $cashier1->id,
            'transaction_date' => '2026-08-01 08:15:00',
            'payment_method' => 'QRIS',
            'status' => 'Completed',
            'subtotal' => 80000,
            'tax' => 8000,
            'grand_total' => 88000,
        ]);

        TransactionItem::create([
            'transaction_id' => $transaction->id,
            'product_id' => $product1->id,
            'product_name' => $product1->name,
            'price' => $product1->price,
            'quantity' => 2,
            'subtotal' => $product1->price * 2,
        ]);

        TransactionItem::create([
            'transaction_id' => $transaction->id,
            'product_id' => $product2->id,
            'product_name' => $product2->name,
            'price' => $product2->price,
            'quantity' => 1,
            'subtotal' => $product2->price,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Transaction 2
        |--------------------------------------------------------------------------
        */

        $transaction = Transaction::create([
            'invoice_number' => 'INV-20260801-002',
            'user_id' => $cashier2->id,
            'transaction_date' => '2026-08-01 08:32:00',
            'payment_method' => 'Cash',
            'status' => 'Completed',
            'subtotal' => 50000,
            'tax' => 5000,
            'grand_total' => 55000,
        ]);

        TransactionItem::create([
            'transaction_id' => $transaction->id,
            'product_id' => $product3->id,
            'product_name' => $product3->name,
            'price' => $product3->price,
            'quantity' => 2,
            'subtotal' => $product3->price * 2,
        ]);
    }
}
