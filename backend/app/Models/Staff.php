<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Staff extends Model
{
    protected $table = 'staff';

    protected $fillable = [
        'staff_code',
        'full_name',
        'email',
        'phone',
        'position',
        'role',
        'hire_date',
        'address',
        'status',
        'about',
        'photo',
    ];

    protected $casts = [
        'hire_date' => 'date',
    ];

    /**
     * Gunakan staff_code sebagai route parameter
     *
     * Contoh:
     * /api/staff/STF002
     */
    public function getRouteKeyName()
    {
        return 'staff_code';
    }

    public function user(): HasOne
    {
        return $this->hasOne(
            User::class,
            'staff_id',
            'id'
        );
    }

    public function payrolls(): HasMany
    {
        return $this->hasMany(
            Payroll::class,
            'staff_id',
            'id'
        );
    }
}
