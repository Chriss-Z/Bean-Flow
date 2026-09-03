export const employeeSalaryData = [
  {
    id: 1,
    staffId: "STF001",

    employmentType: "Full Time",

    basicSalary: 8000000,
    allowance: 1000000,
    deduction: 200000,

    paymentStatus: "Paid",

    period: "August 2026",
    payDate: "2026-08-01",
  },

  {
    id: 2,
    staffId: "STF002",

    employmentType: "Full Time",

    basicSalary: 5000000,
    allowance: 500000,
    deduction: 100000,

    paymentStatus: "Paid",

    period: "August 2026",
    payDate: "2026-08-01",
  },

  {
    id: 3,
    staffId: "STF003",

    employmentType: "Part Time",

    basicSalary: 3500000,
    allowance: 300000,
    deduction: 50000,

    paymentStatus: "Paid",

    period: "August 2026",
    payDate: "2026-08-01",
  },

  {
    id: 4,
    staffId: "STF004",

    employmentType: "Contract",

    basicSalary: 4500000,
    allowance: 400000,
    deduction: 100000,

    paymentStatus: "Pending",

    period: "August 2026",
    payDate: "2026-08-01",
  },

  {
    id: 5,
    staffId: "STF005",

    employmentType: "Full Time",

    basicSalary: 6000000,
    allowance: 750000,
    deduction: 150000,

    paymentStatus: "Paid",

    period: "August 2026",
    payDate: "2026-08-01",
  },
];

/* ========================================
   PAYROLL HISTORY
======================================== */

export const payrollHistory = [
  {
    id: "PAY-2026-08",
    period: "August 2026",
    payDate: "2026-08-01",

    totalEmployee: 5,
    totalPayroll: 29350000,

    status: "Completed",
  },

  {
    id: "PAY-2026-07",
    period: "July 2026",
    payDate: "2026-07-01",

    totalEmployee: 5,
    totalPayroll: 29350000,

    status: "Completed",
  },

  {
    id: "PAY-2026-06",
    period: "June 2026",
    payDate: "2026-06-01",

    totalEmployee: 5,
    totalPayroll: 28750000,

    status: "Completed",
  },
];

/* ========================================
   UPCOMING PAYMENTS
======================================== */

export const upcomingPayments = [
  {
    id: 1,

    period: "September 2026",
    paymentDate: "2026-09-01",

    totalEmployee: 5,

    status: "Scheduled",
  },
];
export const payrollSummaryData = [
  {
    name: "Basic Salary",
    value: 27000000,
    color: "#22c55e",
  },
  {
    name: "Allowance",
    value: 2950000,
    color: "#3b82f6",
  },
  {
    name: "Deduction",
    value: 600000,
    color: "#8b5cf6",
  },
  {
    name: "Total Salary",
    value: 29350000,
    color: "#ef4444",
  },
];
