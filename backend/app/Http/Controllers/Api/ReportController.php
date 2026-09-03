<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        if (!$startDate || !$endDate) {
            return response()->json([
                'success' => false,
                'message' => 'start_date dan end_date wajib diisi.'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Base Transaction Query
        |--------------------------------------------------------------------------
        */

        $transactions = Transaction::query()
            ->where('status', 'Completed')
            ->whereBetween('transaction_date', [
                $startDate . ' 00:00:00',
                $endDate . ' 23:59:59',
            ]);

        /*
        |--------------------------------------------------------------------------
        | SUMMARY
        |--------------------------------------------------------------------------
        */

        $totalRevenue = (clone $transactions)->sum('grand_total');

        $totalOrders = (clone $transactions)->count();

        $averageTransaction = $totalOrders > 0
            ? $totalRevenue / $totalOrders
            : 0;

        $transactionIds = (clone $transactions)
            ->pluck('id');

        $totalItemsSold = TransactionItem::query()
            ->whereIn('transaction_id', $transactionIds)
            ->sum('quantity');

        /*
        |--------------------------------------------------------------------------
        | PAYMENT METHODS
        |--------------------------------------------------------------------------
        */

        $paymentMethods = (clone $transactions)
            ->select(
                'payment_method',
                DB::raw('SUM(grand_total) as total')
            )
            ->groupBy('payment_method')
            ->get()
            ->map(function ($item) use ($totalRevenue) {
                return [
                    'payment_method' => $item->payment_method,
                    'total' => (float) $item->total,
                    'percentage' => $totalRevenue > 0
                        ? round(($item->total / $totalRevenue) * 100, 2)
                        : 0,
                ];
            });

        /*
        |--------------------------------------------------------------------------
        | SALES TREND
        |--------------------------------------------------------------------------
        */

        $salesTrend = (clone $transactions)
            ->select(
                DB::raw('DATE(transaction_date) as date'),
                DB::raw('SUM(grand_total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy(DB::raw('DATE(transaction_date)'))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'revenue' => (float) $item->revenue,
                    'orders' => (int) $item->orders,
                ];
            });

        /*
        |--------------------------------------------------------------------------
        | BEST SELLING PRODUCTS
        |--------------------------------------------------------------------------
        */

        $bestSellingProducts = TransactionItem::query()
            ->whereIn('transaction_id', $transactionIds)
            ->with('product:id,name,image')
            ->select(
                'product_id',
                'product_name',
                DB::raw('SUM(quantity) as quantity_sold'),
                DB::raw('SUM(subtotal) as revenue')
            )
            ->groupBy(
                'product_id',
                'product_name'
            )
            ->orderByDesc('quantity_sold')
            ->limit(5)
            ->get()
            ->map(function ($item) {

                return [
                    'id' => $item->product_id,
                    'name' => $item->product_name,
                    'image' => $item->product?->image,
                    'quantity_sold' => (int) $item->quantity_sold,
                    'revenue' => (float) $item->revenue,

                    // sementara
                    'profit' => (float) $item->revenue,
                ];
            });
        /*
        |--------------------------------------------------------------------------
        | TOP CASHIERS
        |--------------------------------------------------------------------------
        */

        $topCashiers = (clone $transactions)
            ->with([
                'user:id,name,staff_id',
                'user.staff:id,photo',
            ])
            ->select(
                'user_id',
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(grand_total) as total_sales')
            )
            ->groupBy('user_id')
            ->orderByDesc('total_sales')
            ->limit(5)
            ->get()
            ->map(function ($item) {

                return [
                    'id' => $item->user_id,

                    'name' => $item->user?->name ?? 'Unknown',

                    // foto dari staff
                    'photo' => $item->user?->staff?->photo,

                    // sesuaikan dengan frontend lama
                    'transactions' => (int) $item->total_orders,

                    'total_sale' => (float) $item->total_sales,
                ];
            });
        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'summary' => [
                'total_revenue' => (float) $totalRevenue,
                'total_orders' => (int) $totalOrders,
                'average_transaction' => (float) $averageTransaction,
                'total_items_sold' => (int) $totalItemsSold,

                // Belum dihitung karena struktur COGS belum kita tentukan.
                'cogs' => 0,
                'gross_profit' => (float) $totalRevenue,
            ],

            'top_cashiers' => $topCashiers,

            'best_selling_products' => $bestSellingProducts,

            'sales_trend' => $salesTrend,

            'payment_methods' => $paymentMethods,
        ]);
    }
}
