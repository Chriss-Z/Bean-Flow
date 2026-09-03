<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ROLES
        |--------------------------------------------------------------------------
        */

        $roles = [
            [
                'name' => 'Admin',
                'slug' => 'admin',
            ],
            [
                'name' => 'Manager',
                'slug' => 'manager',
            ],
            [
                'name' => 'Cashier',
                'slug' => 'cashier',
            ],
            [
                'name' => 'Inventory Staff',
                'slug' => 'inventory_staff',
            ],
            [
                'name' => 'HR / Payroll Staff',
                'slug' => 'payroll_staff',
            ],
        ];

        $roleModels = [];

        foreach ($roles as $roleData) {
            $roleModels[$roleData['slug']] = Role::updateOrCreate(
                [
                    'slug' => $roleData['slug'],
                ],
                [
                    'name' => $roleData['name'],
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | MODULES
        |--------------------------------------------------------------------------
        */

        $modules = [
            'dashboard',
            'products',
            'sales',
            'inventory',
            'menu',
            'staff',
            'payroll',
            'reports',
            'settings',
        ];

        /*
        |--------------------------------------------------------------------------
        | ACTIONS
        |--------------------------------------------------------------------------
        */

        $actions = [
            'view',
            'create',
            'edit',
            'delete',
        ];

        /*
        |--------------------------------------------------------------------------
        | CREATE PERMISSIONS
        |--------------------------------------------------------------------------
        */

        $permissions = [];

        foreach ($modules as $module) {
            foreach ($actions as $action) {
                $slug = "{$module}.{$action}";

                $permissions[$module][$action] = Permission::updateOrCreate(
                    [
                        'slug' => $slug,
                    ],
                    [
                        'name' => ucfirst($action) . ' ' . ucfirst($module),
                        'module' => $module,
                        'action' => $action,
                    ]
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | ADMIN
        |--------------------------------------------------------------------------
        |
        | Admin memiliki seluruh permission.
        |
        */

        $roleModels['admin']
            ->permissions()
            ->sync(
                Permission::pluck('id')->toArray()
            );

        /*
        |--------------------------------------------------------------------------
        | MANAGER
        |--------------------------------------------------------------------------
        |
        | Manager dapat mengelola sebagian besar operasional.
        |
        */

        $managerPermissions = [
            // DASHBOARD
            $permissions['dashboard']['view'],

            // PRODUCTS
            $permissions['products']['view'],
            $permissions['products']['create'],
            $permissions['products']['edit'],
            $permissions['products']['delete'],

            // SALES
            $permissions['sales']['view'],

            // INVENTORY
            $permissions['inventory']['view'],
            $permissions['inventory']['create'],
            $permissions['inventory']['edit'],

            // MENU
            $permissions['menu']['view'],
            $permissions['menu']['create'],
            $permissions['menu']['edit'],
            $permissions['menu']['delete'],

            // STAFF
            $permissions['staff']['view'],
            $permissions['staff']['create'],
            $permissions['staff']['edit'],

            // PAYROLL
            $permissions['payroll']['view'],

            // REPORTS
            $permissions['reports']['view'],

            // SETTINGS
            $permissions['settings']['view'],
        ];

        $roleModels['manager']
            ->permissions()
            ->sync(
                collect($managerPermissions)
                    ->pluck('id')
                    ->toArray()
            );

        /*
        |--------------------------------------------------------------------------
        | CASHIER
        |--------------------------------------------------------------------------
        |
        | Cashier dapat melihat menu dan melakukan transaksi.
        |
        */

        $cashierPermissions = [
            // DASHBOARD
            $permissions['dashboard']['view'],

            // MENU
            $permissions['menu']['view'],

            // SALES
            $permissions['sales']['view'],
            $permissions['sales']['create'],
        ];

        $roleModels['cashier']
            ->permissions()
            ->sync(
                collect($cashierPermissions)
                    ->pluck('id')
                    ->toArray()
            );

        /*
        |--------------------------------------------------------------------------
        | INVENTORY STAFF
        |--------------------------------------------------------------------------
        |
        | Inventory Staff dapat mengelola inventory.
        |
        */

        $inventoryPermissions = [
            // DASHBOARD
            $permissions['dashboard']['view'],

            // MENU
            $permissions['menu']['view'],

            // INVENTORY
            $permissions['inventory']['view'],
            $permissions['inventory']['create'],
            $permissions['inventory']['edit'],
            $permissions['inventory']['delete'],
        ];

        $roleModels['inventory_staff']
            ->permissions()
            ->sync(
                collect($inventoryPermissions)
                    ->pluck('id')
                    ->toArray()
            );

        /*
        |--------------------------------------------------------------------------
        | HR / PAYROLL STAFF
        |--------------------------------------------------------------------------
        |
        | HR / Payroll Staff mengelola staff dan payroll.
        |
        */

        $payrollPermissions = [
            // DASHBOARD
            $permissions['dashboard']['view'],

            // STAFF
            $permissions['staff']['view'],
            $permissions['staff']['create'],
            $permissions['staff']['edit'],
            $permissions['staff']['delete'],

            // PAYROLL
            $permissions['payroll']['view'],
            $permissions['payroll']['create'],
            $permissions['payroll']['edit'],
            $permissions['payroll']['delete'],
        ];

        $roleModels['payroll_staff']
            ->permissions()
            ->sync(
                collect($payrollPermissions)
                    ->pluck('id')
                    ->toArray()
            );
    }
}
