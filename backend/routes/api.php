<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\InventoryMovementController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\RolePermissionController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\PayrollController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\InAppNotificationController;


/*
|--------------------------------------------------------------------------
| AUTH - PUBLIC
|--------------------------------------------------------------------------
|
| Login tidak membutuhkan authentication.
|
*/

Route::post('/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | AUTH
    |--------------------------------------------------------------------------
    */

    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/logout', [AuthController::class, 'logout']);


    /*
    |--------------------------------------------------------------------------
    | PRODUCTS
    |--------------------------------------------------------------------------
    |
    | Product merupakan data produk.
    |
    */

    Route::get('/products', [ProductController::class, 'index'])
        ->middleware('permission:products.view');

    Route::get('/products/{product}', [ProductController::class, 'show'])
        ->middleware('permission:products.view');

    Route::post('/products', [ProductController::class, 'store'])
        ->middleware('permission:products.create');

    Route::put('/products/{product}', [ProductController::class, 'update'])
        ->middleware('permission:products.edit');

    Route::delete('/products/{product}', [ProductController::class, 'destroy'])
        ->middleware('permission:products.delete');


    /*
    |--------------------------------------------------------------------------
    | SALES / TRANSACTIONS
    |--------------------------------------------------------------------------
    */

    Route::get('/transactions', [TransactionController::class, 'index'])
        ->middleware('permission:sales.view');

    Route::get('/transactions/{transaction}', [TransactionController::class, 'show'])
        ->middleware('permission:sales.view');

    Route::post('/transactions', [TransactionController::class, 'store'])
        ->middleware('permission:sales.create');


    /*
    |--------------------------------------------------------------------------
    | INVENTORY
    |--------------------------------------------------------------------------
    */

    Route::get('/inventory', [InventoryController::class, 'index'])
        ->middleware('permission:inventory.view');

    Route::get('/inventory/{inventoryItem}', [InventoryController::class, 'show'])
        ->middleware('permission:inventory.view');

    Route::post('/inventory', [InventoryController::class, 'store'])
        ->middleware('permission:inventory.create');

    Route::put('/inventory/{inventoryItem}', [InventoryController::class, 'update'])
        ->middleware('permission:inventory.edit');

    Route::delete('/inventory/{inventoryItem}', [InventoryController::class, 'destroy'])
        ->middleware('permission:inventory.delete');

    /*
    |--------------------------------------------------------------------------
    | ADD STOCK
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/inventory/{inventoryItem}/stock',
        [InventoryController::class, 'addStock']
    )->middleware('permission:inventory.edit');


    /*
    |--------------------------------------------------------------------------
    | INVENTORY MOVEMENTS
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/inventory-movements',
        [InventoryMovementController::class, 'index']
    )->middleware('permission:inventory.view');

    Route::get(
        '/inventory-movements/{inventoryMovement}',
        [InventoryMovementController::class, 'show']
    )->middleware('permission:inventory.view');


    /*
    |--------------------------------------------------------------------------
    | MENU
    |--------------------------------------------------------------------------
    |
    | Untuk sementara Menu menggunakan Product sebagai data utama.
    |
    | Tidak membutuhkan:
    | - Menu Model
    | - menus table
    |
    | Product nantinya mempunyai:
    | - category
    | - price
    | - ingredients
    |
    */

    Route::get('/menu', [ProductController::class, 'index'])
        ->middleware('permission:menu.view');

    Route::get('/menu/{product}', [ProductController::class, 'show'])
        ->middleware('permission:menu.view');

    Route::post('/menu', [ProductController::class, 'store'])
        ->middleware('permission:menu.create');

    Route::put('/menu/{product}', [ProductController::class, 'update'])
        ->middleware('permission:menu.edit');

    Route::delete('/menu/{product}', [ProductController::class, 'destroy'])
        ->middleware('permission:menu.delete');


    /*
    |--------------------------------------------------------------------------
    | CATEGORIES
    |--------------------------------------------------------------------------
    |
    | Category digunakan oleh Product/Menu.
    |
    */

    Route::get('/categories', [CategoryController::class, 'index'])
        ->middleware('permission:menu.view');


    /*
    |--------------------------------------------------------------------------
    | STAFF
    |--------------------------------------------------------------------------
    */

    Route::get('/staff', [StaffController::class, 'index'])
        ->middleware('permission:staff.view');

    Route::get('/staff/{staff}', [StaffController::class, 'show'])
        ->middleware('permission:staff.view');

    Route::post('/staff', [StaffController::class, 'store'])
        ->middleware('permission:staff.create');

    Route::put('/staff/{staff}', [StaffController::class, 'update'])
        ->middleware('permission:staff.edit');

    Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])
        ->middleware('permission:staff.delete');


    /*
    |--------------------------------------------------------------------------
    | PAYROLL
    |--------------------------------------------------------------------------
    */

    Route::get('/payrolls', [PayrollController::class, 'index'])
        ->middleware('permission:payroll.view');

    Route::get('/payrolls/summary', [PayrollController::class, 'summary'])
        ->middleware('permission:payroll.view');

    Route::get('/payrolls/history', [PayrollController::class, 'history'])
        ->middleware('permission:payroll.view');

    Route::get('/payrolls/upcoming', [PayrollController::class, 'upcoming'])
        ->middleware('permission:payroll.view');

    Route::get('/payrolls/{payroll}', [PayrollController::class, 'show'])
        ->middleware('permission:payroll.view');

    Route::post('/payrolls', [PayrollController::class, 'store'])
        ->middleware('permission:payroll.create');

    Route::put('/payrolls/{payroll}', [PayrollController::class, 'update'])
        ->middleware('permission:payroll.edit');

    Route::delete('/payrolls/{payroll}', [PayrollController::class, 'destroy'])
        ->middleware('permission:payroll.delete');


    /*
    |--------------------------------------------------------------------------
    | REPORTS
    |--------------------------------------------------------------------------
    */

    Route::get('/reports', [ReportController::class, 'index'])
        ->middleware('permission:reports.view');


    /*
    |--------------------------------------------------------------------------
    | SETTINGS - ROLES & PERMISSIONS
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/settings/permissions',
        [RolePermissionController::class, 'index']
    )->middleware('permission:settings.view');

    Route::get(
        '/settings/roles/{role}',
        [RolePermissionController::class, 'show']
    )->middleware('permission:settings.view');

    Route::put(
        '/settings/roles/{role}/permissions',
        [RolePermissionController::class, 'update']
    )->middleware('permission:settings.edit');

    /*
|--------------------------------------------------------------------------
| SETTINGS
|--------------------------------------------------------------------------
|
| General settings, store information, tax & charges,
| notifications, security, backup, integration.
|
*/

    Route::get('/settings', [SettingController::class, 'index'])
        ->middleware('permission:settings.view');

    Route::patch('/settings/{section}', [SettingController::class, 'update'])
        ->middleware('permission:settings.edit');

    Route::post('/settings/reset', [SettingController::class, 'reset'])
        ->middleware('permission:settings.edit');

    Route::post(
        '/settings/integration/{group}/{key}',
        [SettingController::class, 'updateIntegration']
    )->middleware('permission:settings.edit');

    Route::post('/settings/backup', [SettingController::class, 'backupNow'])
        ->middleware('permission:settings.edit');

    Route::get('/settings/export', [SettingController::class, 'export'])
        ->middleware('permission:settings.view');

    Route::post('/settings/import', [SettingController::class, 'import'])
        ->middleware('permission:settings.edit');

    Route::post(
        '/settings/reset-application',
        [SettingController::class, 'resetApplication']
    )->middleware('permission:settings.edit');


    /*
|--------------------------------------------------------------------------
| PAYMENT METHODS
|--------------------------------------------------------------------------
*/

    Route::get('/payment-methods', [PaymentMethodController::class, 'index'])
        ->middleware('permission:settings.view');

    Route::post('/payment-methods', [PaymentMethodController::class, 'store'])
        ->middleware('permission:settings.edit');

    Route::put(
        '/payment-methods/{paymentMethod}',
        [PaymentMethodController::class, 'update']
    )->middleware('permission:settings.edit');

    Route::delete(
        '/payment-methods/{paymentMethod}',
        [PaymentMethodController::class, 'destroy']
    )->middleware('permission:settings.edit');

    Route::patch(
        '/payment-methods/{paymentMethod}/toggle',
        [PaymentMethodController::class, 'toggle']
    )->middleware('permission:settings.edit');


    /*
|--------------------------------------------------------------------------
| ACTIVITY LOGS
|--------------------------------------------------------------------------
*/

    Route::get(
        '/activity-logs',
        [ActivityLogController::class, 'index']
    );

    Route::post(
        '/activity-logs',
        [ActivityLogController::class, 'store']
    );


    /*
|--------------------------------------------------------------------------
| IN-APP NOTIFICATIONS
|--------------------------------------------------------------------------
*/

    Route::get(
        '/notifications',
        [InAppNotificationController::class, 'index']
    );

    Route::post(
        '/notifications',
        [InAppNotificationController::class, 'store']
    );

    Route::patch(
        '/notifications/{notification}/read',
        [InAppNotificationController::class, 'markRead']
    );

    Route::delete(
        '/notifications',
        [InAppNotificationController::class, 'clear']
    );
    Route::post(
        '/settings/roles',
        [RolePermissionController::class, 'store']
    )->middleware('permission:settings.edit');

    Route::put(
        '/settings/roles/{role}',
        [RolePermissionController::class, 'updateName']
    )->middleware('permission:settings.edit');

    Route::delete(
        '/settings/roles/{role}',
        [RolePermissionController::class, 'destroy']
    )->middleware('permission:settings.edit');
});
