<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PayrollController extends Controller
{
    /**
     * Get all payrolls
     */
    public function index(Request $request)
    {
        $query = Payroll::with('staff')
            ->latest('payroll_period');

        // Filter period
        if ($request->filled('period')) {
            $query->whereMonth(
                'payroll_period',
                date('m', strtotime($request->period))
            );

            $query->whereYear(
                'payroll_period',
                date('Y', strtotime($request->period))
            );
        }

        // Filter status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter staff
        if ($request->filled('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }

        $payrolls = $query->get();

        return response()->json([
            'success' => true,
            'data' => $payrolls,
        ]);
    }

    /**
     * Get payroll detail
     */
    public function show(Payroll $payroll)
    {
        $payroll->load('staff');

        return response()->json([
            'success' => true,
            'data' => $payroll,
        ]);
    }

    /**
     * Create payroll
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'staff_id' => [
                'required',
                'exists:staff,id',
            ],

            'payroll_period' => [
                'required',
                'date',
            ],

            'basic_salary' => [
                'required',
                'numeric',
                'min:0',
            ],

            'allowance' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'overtime' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'bonus' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'deduction' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'status' => [
                'nullable',
                'in:Pending,Paid',
            ],

            'payment_date' => [
                'nullable',
                'date',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        $allowance = $validated['allowance'] ?? 0;
        $overtime = $validated['overtime'] ?? 0;
        $bonus = $validated['bonus'] ?? 0;
        $deduction = $validated['deduction'] ?? 0;

        // Net salary
        $netSalary =
            $validated['basic_salary']
            + $allowance
            + $overtime
            + $bonus
            - $deduction;

        $payroll = Payroll::create([
            'staff_id' => $validated['staff_id'],
            'payroll_period' => $validated['payroll_period'],
            'basic_salary' => $validated['basic_salary'],
            'allowance' => $allowance,
            'overtime' => $overtime,
            'bonus' => $bonus,
            'deduction' => $deduction,
            'net_salary' => $netSalary,
            'status' => $validated['status'] ?? 'Pending',
            'payment_date' => $validated['payment_date'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        $payroll->load('staff');

        return response()->json([
            'success' => true,
            'message' => 'Payroll created successfully',
            'data' => $payroll,
        ], 201);
    }

    /**
     * Update payroll
     */
    public function update(Request $request, Payroll $payroll)
    {
        $validated = $request->validate([
            'payroll_period' => [
                'sometimes',
                'date',
            ],

            'basic_salary' => [
                'sometimes',
                'numeric',
                'min:0',
            ],

            'allowance' => [
                'sometimes',
                'numeric',
                'min:0',
            ],

            'overtime' => [
                'sometimes',
                'numeric',
                'min:0',
            ],

            'bonus' => [
                'sometimes',
                'numeric',
                'min:0',
            ],

            'deduction' => [
                'sometimes',
                'numeric',
                'min:0',
            ],

            'status' => [
                'sometimes',
                'in:Pending,Paid',
            ],

            'payment_date' => [
                'nullable',
                'date',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        $basicSalary =
            $validated['basic_salary']
            ?? $payroll->basic_salary;

        $allowance =
            $validated['allowance']
            ?? $payroll->allowance;

        $overtime =
            $validated['overtime']
            ?? $payroll->overtime;

        $bonus =
            $validated['bonus']
            ?? $payroll->bonus;

        $deduction =
            $validated['deduction']
            ?? $payroll->deduction;

        $validated['net_salary'] =
            $basicSalary
            + $allowance
            + $overtime
            + $bonus
            - $deduction;

        $payroll->update($validated);

        $payroll->load('staff');

        return response()->json([
            'success' => true,
            'message' => 'Payroll updated successfully',
            'data' => $payroll,
        ]);
    }

    /**
     * Delete payroll
     */
    public function destroy(Payroll $payroll)
    {
        $payroll->delete();

        return response()->json([
            'success' => true,
            'message' => 'Payroll deleted successfully',
        ]);
    }

    /**
     * Payroll summary
     */
    public function summary(Request $request)
    {
        $query = Payroll::query();

        // Filter period
        if ($request->filled('period')) {
            $query->whereMonth(
                'payroll_period',
                date('m', strtotime($request->period))
            );

            $query->whereYear(
                'payroll_period',
                date('Y', strtotime($request->period))
            );
        }

        $summary = [
            'basic_salary' => (float) $query->sum('basic_salary'),

            'allowance' => (float) $query->sum('allowance'),

            'overtime' => (float) $query->sum('overtime'),

            'bonus' => (float) $query->sum('bonus'),

            'deduction' => (float) $query->sum('deduction'),

            'total_salary' => (float) $query->sum('net_salary'),

            'total_employee' => $query->count(),

            'paid_employee' => (clone $query)
                ->where('status', 'Paid')
                ->count(),

            'pending_employee' => (clone $query)
                ->where('status', 'Pending')
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }

    /**
     * Payroll history by period
     */
    public function history()
    {
        $histories = Payroll::selectRaw("
                DATE_FORMAT(
                    payroll_period,
                    '%Y-%m-01'
                ) as payroll_period,

                COUNT(*) as total_employee,

                SUM(net_salary) as total_payroll,

                MAX(payment_date) as payment_date
            ")
            ->groupByRaw(
                "DATE_FORMAT(
                    payroll_period,
                    '%Y-%m-01'
                )"
            )
            ->orderByDesc('payroll_period')
            ->get();

        $history = $histories->map(function ($item) {
            $hasPending = Payroll::whereYear(
                'payroll_period',
                date(
                    'Y',
                    strtotime(
                        $item->payroll_period
                    )
                )
            )
                ->whereMonth(
                    'payroll_period',
                    date(
                        'm',
                        strtotime(
                            $item->payroll_period
                        )
                    )
                )
                ->where('status', '!=', 'Paid')
                ->exists();

            return [
                'id' => 'PAY-' . date(
                    'Y-m',
                    strtotime(
                        $item->payroll_period
                    )
                ),

                'period' => date(
                    'F Y',
                    strtotime(
                        $item->payroll_period
                    )
                ),

                'payDate' => $item->payment_date,

                'totalEmployee' => (int) $item->total_employee,

                'totalPayroll' => (float) $item->total_payroll,

                'status' => $hasPending
                    ? 'Pending'
                    : 'Completed',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $history,
        ]);
    }

    /**
     * Upcoming payroll
     */
    public function upcoming()
    {
        $upcoming = Payroll::with('staff')
            ->where('status', 'Pending')
            ->whereDate(
                'payment_date',
                '>=',
                now()->toDateString()
            )
            ->orderBy('payment_date')
            ->get()
            ->map(function ($payroll) {
                return [
                    'id' => $payroll->id,

                    'period' => $payroll->payroll_period
                        ? $payroll->payroll_period->format('F Y')
                        : '-',

                    'paymentDate' => $payroll->payment_date
                        ? $payroll->payment_date->format('Y-m-d')
                        : null,

                    'status' => $payroll->status,

                    'staff' => $payroll->staff
                        ? [
                            'id' => $payroll->staff->id,
                            'staff_code' => $payroll->staff->staff_code,
                            'full_name' => $payroll->staff->full_name,
                            'position' => $payroll->staff->position,
                        ]
                        : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $upcoming,
        ]);
    }
}
