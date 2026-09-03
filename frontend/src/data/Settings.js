import { defaultPaymentMethods } from "./PaymentMethods";
import { defaultRoles } from "./Roles";

export const defaultSettings = {
  general: {
    language: "English",
    currency: "IDR",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    timezone: "Asia/Jakarta",
    sessionTimeout: 30,
    theme: "light",
    compactMode: false,
    confirmationDialog: true,
    successNotification: true,
    errorNotification: true,
  },
  storeInformation: {
    storeName: "Bean & Flow",
    storeId: "BF-STORE-001",
    phone: "+62 812-0000-0000",
    email: "hello@beanflow.com",
    website: "https://beanflow.local",
    address: "Jl. Sudirman No.12",
    city: "Jakarta",
    province: "DKI Jakarta",
    postalCode: "10220",
    businessRegistrationNumber: "NIB-1234567890",
    npwp: "00.000.000.0-000.000",
    businessHours: "08:00 - 22:00",
    timezone: "Asia/Jakarta",
    logo: "",
    receipt: {
      header: "Thank you for visiting Bean & Flow",
      footer: "Have a great day",
      showLogo: true,
      showAddress: true,
      showPhone: true,
      showCashierName: true,
    },
  },
  paymentMethods: defaultPaymentMethods,
  taxAndCharges: {
    tax: {
      enabled: true,
      name: "PPN",
      rate: 11,
      mode: "excluded",
    },
    charges: [
      {
        id: "chg-service",
        name: "Service Charge",
        type: "percentage",
        value: 5,
        enabled: false,
      },
      {
        id: "chg-packaging",
        name: "Packaging Fee",
        type: "fixed",
        value: 2000,
        enabled: false,
      },
      {
        id: "chg-delivery",
        name: "Delivery Fee",
        type: "fixed",
        value: 5000,
        enabled: false,
      },
    ],
  },
  notification: {
    inventory: {
      lowStockAlert: { inApp: true, email: false },
      outOfStockAlert: { inApp: true, email: false },
    },
    sales: {
      newTransaction: { inApp: true, email: false },
      failedTransaction: { inApp: true, email: false },
      refund: { inApp: false, email: false },
    },
    payroll: {
      upcomingPayroll: { inApp: true, email: false },
      payrollPending: { inApp: true, email: false },
      payrollCompleted: { inApp: true, email: false },
    },
    system: {
      backupCompleted: { inApp: true, email: false },
      backupFailed: { inApp: true, email: true },
      securityAlert: { inApp: true, email: true },
      loginAlert: { inApp: false, email: false },
    },
  },
  security: {
    twoFactorEnabled: false,
    maximumLoginAttempts: 5,
    lockoutDuration: 15,
    rememberDevice: true,
    passwordPolicy: {
      minimumLength: 8,
      requireUppercase: true,
      requireNumber: true,
      requireSpecialCharacter: false,
    },
  },
  backupAndData: {
    lastBackup: null,
    backupStatus: "Never",
    automaticBackup: {
      enabled: false,
      frequency: "weekly",
      time: "23:00",
    },
  },
  integration: {
    payment: {
      qris: { connected: false, lastSync: null, status: "Not Connected" },
      paymentGateway: {
        connected: false,
        lastSync: null,
        status: "Not Connected",
      },
    },
    storage: {
      googleDrive: {
        connected: false,
        lastSync: null,
        status: "Not Connected",
      },
      cloudStorage: {
        connected: false,
        lastSync: null,
        status: "Not Connected",
      },
    },
    communication: {
      email: { connected: false, lastSync: null, status: "Not Connected" },
      whatsapp: {
        connected: false,
        lastSync: null,
        status: "Not Connected",
      },
    },
  },
  roles: defaultRoles,
};
