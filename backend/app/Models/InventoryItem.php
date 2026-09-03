<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\InventoryMovement;
use App\Models\ProductIngredient;

class InventoryItem extends Model
{
    protected $fillable = [
        'name',
        'sku',
        'description',
        'stock',
        'minimum_stock',
        'unit',
        'cost_per_unit',
        'image',
        'is_active',
    ];

    protected $casts = [
        'stock' => 'decimal:3',
        'minimum_stock' => 'decimal:3',
        'cost_per_unit' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'status',
        'total_value',
    ];

    public function productIngredients(): HasMany
    {
        return $this->hasMany(ProductIngredient::class);
    }

    public function getStatusAttribute(): string
    {
        if ((float) $this->stock <= 0) {
            return 'Out of Stock';
        }

        if ((float) $this->stock <= (float) $this->minimum_stock) {
            return 'Low Stock';
        }

        return 'In Stock';
    }

    public function getTotalValueAttribute(): float
    {
        return (float) $this->stock * (float) $this->cost_per_unit;
    }
    public function movements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }
}
