<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'status',
        'fee',
        'minimum_transaction',
        'maximum_transaction',
        'icon',
    ];

    protected $casts = [
        'fee' => 'decimal:2',
        'minimum_transaction' => 'decimal:2',
        'maximum_transaction' => 'decimal:2',
    ];

    /*
     * Nilai default, dipakai oleh seeder.
     * Sama seperti data/PaymentMethods.js versi lama.
     */
    public static function defaults(): array
    {
        return [
            [
                'name' => 'Cash',
                'status' => 'active',
                'fee' => 0,
                'minimum_transaction' => 0,
                'maximum_transaction' => 0,
                'icon' => 'cash',
            ],
            [
                'name' => 'QRIS',
                'status' => 'active',
                'fee' => 0,
                'minimum_transaction' => 0,
                'maximum_transaction' => 0,
                'icon' => 'qris',
            ],
            [
                'name' => 'Debit Card',
                'status' => 'active',
                'fee' => 0,
                'minimum_transaction' => 0,
                'maximum_transaction' => 0,
                'icon' => 'card',
            ],
        ];
    }
}
