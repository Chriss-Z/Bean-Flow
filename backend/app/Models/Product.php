<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'sku',
        'description',
        'price',
        'cost_price',
        'unit',
        'image',
        'is_active',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
    public function ingredients(): HasMany
    {
        return $this->hasMany(ProductIngredient::class);
    }
    public function transactionItems(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }
}
