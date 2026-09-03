<?php

namespace Database\Seeders;

use App\Models\Staff;
use Illuminate\Database\Seeder;

class StaffSeeder extends Seeder
{
    public function run(): void
    {
        $staff = [
            [
                'staff_code' => 'STF001',
                'full_name' => 'John Michael Carter',
                'email' => 'john@beanflow.com',
                'phone' => '081234567801',
                'position' => 'Admin',
                'role' => 'Admin',
                'hire_date' => '2026-01-01',
                'address' => 'Jakarta',
                'status' => 'Active',
                'about' => 'Administrator Bean & Flow',
            ],
            [
                'staff_code' => 'STF002',
                'full_name' => 'Sarah Olivia Wilson',
                'email' => 'sarah@beanflow.com',
                'phone' => '081234567802',
                'position' => 'Cashier',
                'role' => 'Staff',
                'hire_date' => '2026-01-05',
                'address' => 'Jakarta',
                'status' => 'Active',
                'about' => 'Cashier Bean & Flow',
            ],
            [
                'staff_code' => 'STF003',
                'full_name' => 'Emily Grace Brown',
                'email' => 'emily@beanflow.com',
                'phone' => '081234567803',
                'position' => 'Barista',
                'role' => 'Staff',
                'hire_date' => '2026-01-10',
                'address' => 'Jakarta',
                'status' => 'Active',
                'about' => 'Barista Bean & Flow',
            ],
            [
                'staff_code' => 'STF004',
                'full_name' => 'Michael Andrew Lee',
                'email' => 'michael@beanflow.com',
                'phone' => '081234567804',
                'position' => 'Kitchen Staff',
                'role' => 'Staff',
                'hire_date' => '2026-01-15',
                'address' => 'Jakarta',
                'status' => 'Active',
                'about' => 'Kitchen Staff Bean & Flow',
            ],
            [
                'staff_code' => 'STF005',
                'full_name' => 'Sophia Anne Taylor',
                'email' => 'sophia@beanflow.com',
                'phone' => '081234567805',
                'position' => 'Inventory Officer',
                'role' => 'Staff',
                'hire_date' => '2026-01-20',
                'address' => 'Jakarta',
                'status' => 'Active',
                'about' => 'Inventory Officer Bean & Flow',
            ],
        ];

        foreach ($staff as $data) {
            Staff::updateOrCreate(
                ['staff_code' => $data['staff_code']],
                $data
            );
        }
    }
}