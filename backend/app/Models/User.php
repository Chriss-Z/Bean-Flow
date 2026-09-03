<?php

namespace App\Models;

use App\Models\Staff;
use App\Models\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'staff_id',
        'username',
        'two_factor',
        'login_status',
        'last_login',
        'last_logout',
    ];

    /**
     * The attributes that should be hidden.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor' => 'boolean',
            'last_login' => 'datetime',
            'last_logout' => 'datetime',
        ];
    }

    /**
     * User belongs to one staff.
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(
            Staff::class,
            'staff_id',
            'id'
        );
    }

    /**
     * User belongs to one role.
     *
     * users.role -> roles.slug
     *
     * Example:
     * users.role = "admin"
     * roles.slug = "admin"
     */
    public function roleModel(): BelongsTo
    {
        return $this->belongsTo(
            Role::class,
            'role',
            'slug'
        );
    }

    /**
     * Check whether user has a specific permission.
     *
     * Example:
     *
     * $user->canPermission('inventory.create');
     */
    public function canPermission(string $permission): bool
    {
        /*
         * Admin memiliki semua permission.
         */
        if ($this->role === 'admin') {
            return true;
        }

        /*
         * Ambil role berdasarkan users.role
         * -> roles.slug
         */
        $role = $this->roleModel;

        /*
         * Jika role tidak ditemukan,
         * user tidak memiliki permission.
         */
        if (!$role) {
            return false;
        }

        /*
         * Cek apakah role memiliki permission
         * yang diminta.
         */
        return $role->permissions()
            ->where('slug', $permission)
            ->exists();
    }
}
