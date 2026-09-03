<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payroll extends Model
{
    protected $table = 'payrolls';

    protected $fillable = [
        'staff_id',
        'payroll_period',
        'basic_salary',
        'allowance',
        'deduction',
        'net_salary',
        'status',
        'payment_date',
        'notes',
    ];

    protected $casts = [
        'payroll_period' => 'date',
        'payment_date' => 'date',
        'basic_salary' => 'decimal:2',
        'allowance' => 'decimal:2',
        'deduction' => 'decimal:2',
        'net_salary' => 'decimal:2',
    ];

    public function staff(): BelongsTo
    {
        return $this->belongsTo(
            Staff::class,
            'staff_id',
            'id'
        );
    }
}
