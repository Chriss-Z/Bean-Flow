<?php

namespace Database\Seeders;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'staff_code' => 'STF001',
                'username' => 'john',
                'role' => 'admin',
            ],
            [
                'staff_code' => 'STF002',
                'username' => 'sarah',
                'role' => 'cashier',
            ],
            [
                'staff_code' => 'STF003',
                'username' => 'emily',
                'role' => 'staff',
            ],
            [
                'staff_code' => 'STF004',
                'username' => 'michael',
                'role' => 'staff',
            ],
            [
                'staff_code' => 'STF005',
                'username' => 'sophia',
                'role' => 'inventory_staff',
            ],
        ];

        foreach ($users as $userData) {

            $staffMember = Staff::where(
                'staff_code',
                $userData['staff_code']
            )->first();

            if (!$staffMember) {
                continue;
            }

            User::updateOrCreate(
                [
                    'email' => $staffMember->email,
                ],
                [
                    'staff_id' => $staffMember->id,
                    'name' => $staffMember->full_name,
                    'username' => $userData['username'],
                    'password' => Hash::make('password123'),
                    'role' => $userData['role'],
                    'two_factor' => false,
                    'login_status' => 'Offline',
                ]
            );
        }
    }
}
