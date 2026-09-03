<?php

namespace Database\Seeders;

use App\Models\Payroll;
use App\Models\Staff;
use Illuminate\Database\Seeder;

class PayrollSeeder extends Seeder
{
    public function run(): void
    {
        $payrolls = [
            [
                'staff_code' => 'STF001',
                'basic_salary' => 8000000,
                'allowance' => 1000000,
                'deduction' => 200000,
                'status' => 'Paid',
            ],
            [
                'staff_code' => 'STF002',
                'basic_salary' => 5000000,
                'allowance' => 500000,
                'deduction' => 100000,
                'status' => 'Paid',
            ],
            [
                'staff_code' => 'STF003',
                'basic_salary' => 3500000,
                'allowance' => 300000,
                'deduction' => 50000,
                'status' => 'Paid',
            ],
            [
                'staff_code' => 'STF004',
                'basic_salary' => 4500000,
                'allowance' => 400000,
                'deduction' => 100000,
                'status' => 'Pending',
            ],
            [
                'staff_code' => 'STF005',
                'basic_salary' => 6000000,
                'allowance' => 750000,
                'deduction' => 150000,
                'status' => 'Paid',
            ],
        ];

        foreach ($payrolls as $data) {
            $staff = Staff::where(
                'staff_code',
                $data['staff_code']
            )->first();

            if (!$staff) {
                continue;
            }

            $netSalary =
                $data['basic_salary']
                + $data['allowance']
                - $data['deduction'];

            Payroll::updateOrCreate(
                [
                    'staff_id' => $staff->id,
                    'payroll_period' => '2026-08-01',
                ],
                [
                    'basic_salary' => $data['basic_salary'],
                    'allowance' => $data['allowance'],
                    'deduction' => $data['deduction'],
                    'net_salary' => $netSalary,
                    'status' => $data['status'],
                    'payment_date' => '2026-08-01',
                    'notes' => 'Payroll August 2026',
                ]
            );
        }
    }
}
