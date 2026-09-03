const basePermissions = {
  dashboard: { view: true, create: false, edit: false, delete: false },
  sales: { view: true, create: true, edit: true, delete: false },
  inventory: { view: true, create: true, edit: true, delete: false },
  staff: { view: true, create: true, edit: true, delete: false },
  payroll: { view: true, create: true, edit: true, delete: false },
  reports: { view: true, create: false, edit: false, delete: false },
  settings: { view: true, create: false, edit: true, delete: false },
};

export const defaultRoles = [
  {
    id: "role-admin",
    name: "Admin",
    permissions: basePermissions,
  },
  {
    id: "role-manager",
    name: "Manager",
    permissions: {
      ...basePermissions,
      settings: { view: true, create: false, edit: false, delete: false },
      staff: { view: true, create: false, edit: true, delete: false },
    },
  },
  {
    id: "role-cashier",
    name: "Cashier",
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false },
      sales: { view: true, create: true, edit: false, delete: false },
      inventory: { view: true, create: false, edit: false, delete: false },
      staff: { view: false, create: false, edit: false, delete: false },
      payroll: { view: false, create: false, edit: false, delete: false },
      reports: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: "role-inventory",
    name: "Inventory Staff",
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false },
      sales: { view: false, create: false, edit: false, delete: false },
      inventory: { view: true, create: true, edit: true, delete: false },
      staff: { view: false, create: false, edit: false, delete: false },
      payroll: { view: false, create: false, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: "role-hr-payroll",
    name: "HR / Payroll Staff",
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false },
      sales: { view: false, create: false, edit: false, delete: false },
      inventory: { view: false, create: false, edit: false, delete: false },
      staff: { view: true, create: true, edit: true, delete: false },
      payroll: { view: true, create: true, edit: true, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
    },
  },
];
