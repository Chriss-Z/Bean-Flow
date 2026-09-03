import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { StockData as defaultStockData } from "../data/StockData";
import { staffData as defaultStaffData } from "../data/Staff";
import {
  employeeSalaryData as defaultEmployeeSalaryData,
  payrollHistory as defaultPayrollHistory,
  upcomingPayments as defaultUpcomingPayments,
} from "../data/Salary";
import { salesData as defaultSalesData } from "../data/Sales";
import { menus as defaultMenus } from "../data/Menu";
import { historyPayment as defaultHistoryPayment } from "../data/HistoryPayment";

import {
  loadFromStorage,
  saveToStorage,
  storageKeys,
} from "../utils/settingsStorage";
import { createActivityLogEntry } from "../utils/activityLogger";
import { getCurrentUser } from "../services/authApi";
import { getAuthToken, clearAuthToken } from "../services/authToken";

import {
  fetchSettings,
  updateSettingSection,
  resetSettingsApi,
  updateIntegrationApi,
  backupNowApi,
  exportAllDataApi,
  importAllDataApi,
  resetApplicationDataApi,
  fetchPaymentMethods,
  createPaymentMethod,
  updatePaymentMethodApi,
  deletePaymentMethodApi,
  togglePaymentMethodApi,
  fetchActivityLogs,
  createActivityLogApi,
  fetchNotifications,
  pushNotificationApi,
  clearNotificationsApi,
} from "../services/Settingsapi";
import { getInventory } from "../services/inventoryApi";

const SettingsContext = createContext(null);

/* =========================================================
   NOTE - MIGRASI KE BACKEND (Laravel)
   =========================================================

   Sebelumnya seluruh state di bawah ini disimpan di
   localStorage lewat loadFromStorage/saveToStorage. Sekarang
   sumber data sebenarnya (source of truth) adalah backend:

   - settings (general, storeInformation, taxAndCharges,
     notification, security, backupAndData, integration)
     -> tabel `settings` (singleton)
   - paymentMethods -> tabel `payment_methods`
   - activityLogs -> tabel `activity_logs`
   - inAppNotifications -> tabel `in_app_notifications`

   State React di context ini sekarang berfungsi sebagai CACHE
   client-side saja: di-fetch saat mount, lalu di-update
   kembali dari response backend setiap kali ada perubahan.
   Ini supaya perubahan settings oleh satu user langsung
   konsisten untuk semua halaman & (setelah refresh) untuk
   semua user lain juga.

   YANG TETAP DI localStorage (memang seharusnya begitu):
   - sessionActivity: flag ephemeral per-browser-session
     (loginLogged, lowStockNotified, dst), bukan data bisnis.

   YANG TIDAK LAGI DIURUS DI SINI:
   - roles/permissions: sudah terintegrasi ke backend lewat
     endpoint /settings/permissions (RolePermissionController)
     di halaman yang bersangkutan. Context ini tidak lagi
     menyimpan atau meng-update roles.
   ========================================================= */

/* =========================================================
   DEFAULT APP DATA

   NOTE: appData (stockData, staffData, dst) menurut
   konfirmasi sebelumnya sudah diintegrasikan ke backend di
   halaman masing-masing di luar context ini. Bagian ini
   dipertahankan apa adanya (tidak diubah) agar tidak
   memutus halaman yang mungkin masih membacanya dari sini;
   silakan hapus jika memang sudah benar-benar tidak dipakai.
========================================================= */
const defaultAppData = {
  historyPayment: defaultHistoryPayment,
  stockData: defaultStockData,
  staffData: defaultStaffData,
  employeeSalaryData: defaultEmployeeSalaryData,
  payrollHistory: defaultPayrollHistory,
  upcomingPayments: defaultUpcomingPayments,
  salesData: defaultSalesData,
  menus: defaultMenus,
};

/* =========================================================
   DEFAULT CURRENT USER
========================================================= */
const defaultCurrentUser = {
  id: null,
  staffId: null,
  userId: null,
  name: "",
  username: "",
  email: "",
  role: "",
  roleSlug: "",
  permissions: [],
  loginStatus: "Offline",
  lastLogin: null,
};

/* =========================================================
   NORMALIZE ROLE
========================================================= */
function normalizeRole(role) {
  if (!role) return "";
  const roleMap = {
    admin: "Admin",
    manager: "Manager",
    cashier: "Cashier",
    inventory_staff: "Inventory Staff",
    inventory: "Inventory Staff",
    payroll_staff: "HR / Payroll Staff",
    hr_payroll_staff: "HR / Payroll Staff",
  };
  const normalizedRole = String(role).toLowerCase().trim();
  return roleMap[normalizedRole] || role;
}

/* =========================================================
   NORMALIZE CURRENT USER
========================================================= */
function normalizeCurrentUser(user) {
  if (!user || typeof user !== "object") {
    return defaultCurrentUser;
  }
  return {
    id: user.id ?? null,
    staffId: user.staff_id ?? user.staffId ?? null,
    userId: user.id ?? user.user_id ?? user.userId ?? null,
    name: user.name ?? "",
    username: user.username ?? "",
    email: user.email ?? "",
    role: user.role_name ?? normalizeRole(user.role) ?? "",
    roleSlug: user.role_slug ?? user.role ?? "",
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
    loginStatus: user.login_status ?? "Offline",
    lastLogin: user.last_login ?? null,
  };
}

/* =========================================================
   NORMALIZE PAYMENT METHOD NAME
========================================================= */
function normalizePaymentMethodName(name) {
  if (!name) return "";
  const value = String(name).toLowerCase().trim();
  if (value === "debit") return "Debit Card";
  if (value === "cash" || value === "tunai") return "Cash";
  if (value === "qris") return "QRIS";
  return name;
}

/* =========================================================
   SETTINGS PROVIDER
========================================================= */
export function SettingsProvider({ children }) {
  /* =======================================================
     SETTINGS (dari backend)
  ======================================================= */
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  /* =======================================================
     PAYMENT METHODS (dari backend)
  ======================================================= */
  const [paymentMethods, setPaymentMethods] = useState([]);

  /* =======================================================
     ACTIVITY LOG (dari backend)
  ======================================================= */
  const [activityLogs, setActivityLogs] = useState([]);

  /* =======================================================
     CURRENT USER (sudah terintegrasi sebelumnya)
  ======================================================= */
  const [currentUser, setCurrentUserState] = useState(defaultCurrentUser);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      const token = getAuthToken();

      if (!token) {
        if (mounted) {
          setCurrentUserState(defaultCurrentUser);
          setAuthLoading(false);
        }
        return;
      }

      try {
        const user = await getCurrentUser();
        if (!mounted) return;
        setCurrentUserState(
          user ? normalizeCurrentUser(user) : defaultCurrentUser,
        );
      } catch (error) {
        console.error("Failed to load current user:", error);
        clearAuthToken();
        localStorage.removeItem("bf_user");
        sessionStorage.removeItem("bf_user");
        if (mounted) {
          setCurrentUserState(defaultCurrentUser);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    }

    loadCurrentUser();
    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     SESSION ACTIVITY (tetap localStorage, memang ephemeral)
  ======================================================= */
  const [sessionActivity, setSessionActivity] = useState(() =>
    loadFromStorage(storageKeys.SESSION_ACTIVITY_KEY, {}),
  );

  useEffect(() => {
    saveToStorage(storageKeys.SESSION_ACTIVITY_KEY, sessionActivity);
  }, [sessionActivity]);

  /* =======================================================
     NOTIFICATION CENTER (dari backend)
  ======================================================= */
  const [inAppNotifications, setInAppNotifications] = useState([]);

  /* =======================================================
     APP DATA (di luar scope migrasi ini, lihat NOTE di atas)
  ======================================================= */
  const [appData, setAppData] = useState(defaultAppData);

  /* =======================================================
     LOAD DATA FROM BACKEND ON MOUNT
     (settings, paymentMethods, activityLogs, notifications)
  ======================================================= */
  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      const token = getAuthToken();

      if (!token) {
        if (mounted) setSettingsLoading(false);
        return;
      }

      try {
        const [
          settingsData,
          paymentMethodsData,
          activityLogsData,
          notificationsData,
          inventoryData,
        ] = await Promise.all([
          fetchSettings(),
          fetchPaymentMethods(),
          fetchActivityLogs({ per_page: 100 }),
          fetchNotifications(),
          getInventory(),
        ]);

        if (!mounted) return;

        setSettings(settingsData);
        setPaymentMethods(paymentMethodsData);
        setActivityLogs(activityLogsData?.data ?? activityLogsData ?? []);
        setInAppNotifications(notificationsData ?? []);

        const mappedStock = (inventoryData || []).map((item) => {
          const stock = Number(item.stock ?? 0);
          const minimum = Number(item.minimum_stock ?? 0);

          let status = "In Stock";

          if (stock <= 0) {
            status = "Out of Stock";
          } else if (stock <= minimum) {
            status = "Low Stock";
          }

          return {
            ...item,
            stock,
            minimum,
            status,
          };
        });

        setAppData((prev) => ({
          ...prev,
          stockData: mappedStock,
        }));
      } catch (error) {
        console.error("Failed to load settings from backend:", error);
      } finally {
        if (mounted) {
          setSettingsLoading(false);
        }
      }
    }

    loadAll();

    return () => {
      mounted = false;
    };
  }, []);
  /* =======================================================
     THEME
  ======================================================= */
  useEffect(() => {
    if (!settings?.general) return;
    document.documentElement.setAttribute("data-theme", settings.general.theme);
    document.documentElement.setAttribute(
      "data-compact",
      settings.general.compactMode ? "true" : "false",
    );
  }, [settings?.general?.compactMode, settings?.general?.theme]);

  /* =======================================================
     PUSH NOTIFICATION (kini menulis ke backend)
  ======================================================= */
  const pushNotification = async (notification) => {
    try {
      const created = await pushNotificationApi({
        title: notification.title,
        message: notification.message,
        module: notification.module || "System",
        status: notification.status || "Info",
      });
      setInAppNotifications((prev) => [created, ...prev].slice(0, 50));
      return created;
    } catch (error) {
      console.error("Failed to push notification:", error);
      return null;
    }
  };

  /* =======================================================
     SESSION TIMEOUT (tidak berubah, tetap client-side)
  ======================================================= */
  useEffect(() => {
    if (!settings?.general) return;

    const timeoutInMs =
      Number(settings.general.sessionTimeout || 30) * 60 * 1000;
    let timeoutId;

    const scheduleTimeout = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        addActivityLog({
          action: "TIMEOUT",
          module: "Security",
          description: `Session timed out after ${settings.general.sessionTimeout} minutes of inactivity`,
          status: "Warning",
        });

        pushNotification({
          title: "Session Timeout",
          message: "Your session reached inactivity timeout.",
          module: "Security",
          status: "Warning",
        });
      }, timeoutInMs);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((eventName) =>
      window.addEventListener(eventName, scheduleTimeout),
    );
    scheduleTimeout();

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach((eventName) =>
        window.removeEventListener(eventName, scheduleTimeout),
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentUser?.name, settings?.general?.sessionTimeout]);

  /* =======================================================
     LOGIN ACTIVITY
  ======================================================= */
  useEffect(() => {
    if (!currentUser?.id || !currentUser?.name) return;
    if (sessionActivity.loginLogged) return;

    addActivityLog({
      action: "LOGIN",
      module: "Security",
      description: "User logged in",
      status: "Success",
    });

    setSessionActivity((prev) => ({ ...prev, loginLogged: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentUser?.name, sessionActivity.loginLogged]);

  /* =======================================================
     ADD ACTIVITY LOG (kini menulis ke backend)
  ======================================================= */
  const addActivityLog = async (payload) => {
    try {
      const logEntry = await createActivityLogApi(payload);
      setActivityLogs((prev) => [logEntry, ...prev]);
      return logEntry;
    } catch (error) {
      console.error("Failed to add activity log:", error);
      // Tetap catat secara lokal (fallback) supaya UI tidak diam saja
      // jika request ke backend gagal (mis. koneksi terputus).
      const fallbackEntry = createActivityLogEntry({
        ...payload,
        userId: currentUser?.id ?? null,
        userName: currentUser?.name ?? "",
      });
      setActivityLogs((prev) => [fallbackEntry, ...prev]);
      return fallbackEntry;
    }
  };

  /* =======================================================
     INVENTORY NOTIFICATIONS
  ======================================================= */
  useEffect(() => {
    if (!appData?.stockData || !settings?.notification) return;

    const lowStockCount = appData.stockData.filter(
      (item) => item.status === "Low Stock",
    ).length;
    const outOfStockCount = appData.stockData.filter(
      (item) => item.status === "Out of Stock",
    ).length;

    if (
      lowStockCount > 0 &&
      settings.notification.inventory.lowStockAlert.inApp &&
      !sessionActivity.lowStockNotified
    ) {
      pushNotification({
        title: "Low Stock Alert",
        message: `${lowStockCount} items are running low`,
        module: "Inventory",
        status: "Warning",
      });
      setSessionActivity((prev) => ({ ...prev, lowStockNotified: true }));
    }

    if (
      outOfStockCount > 0 &&
      settings.notification.inventory.outOfStockAlert.inApp &&
      !sessionActivity.outOfStockNotified
    ) {
      pushNotification({
        title: "Out of Stock Alert",
        message: `${outOfStockCount} items are out of stock`,
        module: "Inventory",
        status: "Critical",
      });
      setSessionActivity((prev) => ({ ...prev, outOfStockNotified: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    appData?.stockData,
    sessionActivity.lowStockNotified,
    sessionActivity.outOfStockNotified,
    settings?.notification,
  ]);

  /* =======================================================
     UPDATE SETTINGS (PATCH ke backend per-section)
  ======================================================= */
  const updateSettings = async (section, value) => {
    try {
      const previousSection = settings?.[section];

      const nextSectionValue =
        typeof value === "function" ? value(previousSection) : value;

      const updatedSettings = await updateSettingSection(
        section,
        nextSectionValue,
      );
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.error(`Failed to update ${section} settings:`, error);
      throw error;
    }
  };

  /* =======================================================
     RESET SETTINGS
  ======================================================= */
  const resetSettings = async () => {
    try {
      const resetData = await resetSettingsApi();
      setSettings(resetData);
      return resetData;
    } catch (error) {
      console.error("Failed to reset settings:", error);
      throw error;
    }
  };

  /* =======================================================
     PAYMENT METHODS (CRUD ke backend)
  ======================================================= */
  const updatePaymentMethod = async (action, payload) => {
    try {
      if (action === "add") {
        const created = await createPaymentMethod(payload);
        setPaymentMethods((prev) => [...prev, created]);
        return created;
      }

      if (action === "edit") {
        const updated = await updatePaymentMethodApi(payload.id, payload);
        setPaymentMethods((prev) =>
          prev.map((method) => (method.id === payload.id ? updated : method)),
        );
        return updated;
      }

      if (action === "delete") {
        await deletePaymentMethodApi(payload.id);
        setPaymentMethods((prev) =>
          prev.filter((method) => method.id !== payload.id),
        );
        return null;
      }

      if (action === "toggle") {
        const updated = await togglePaymentMethodApi(payload.id);
        setPaymentMethods((prev) =>
          prev.map((method) => (method.id === payload.id ? updated : method)),
        );
        return updated;
      }

      return null;
    } catch (error) {
      console.error(`Failed to ${action} payment method:`, error);
      throw error;
    }
  };

  /* =======================================================
     TAX SETTINGS
  ======================================================= */
  const updateTaxSettings = (value) => updateSettings("taxAndCharges", value);

  /* =======================================================
     NOTIFICATION SETTINGS
  ======================================================= */
  const updateNotificationSettings = (value) =>
    updateSettings("notification", value);

  /* =======================================================
     SET CURRENT USER
  ======================================================= */
  const setCurrentUser = (user) => {
    setCurrentUserState(normalizeCurrentUser(user));
  };

  /* =======================================================
     PERMISSION
  ======================================================= */
  const hasPermission = (moduleName, action = "view") => {
    const permission = `${moduleName}.${action}`;
    if (!currentUser?.permissions) return false;
    return currentUser.permissions.includes(permission);
  };

  /* =======================================================
     FORMAT CURRENCY
  ======================================================= */
  const formatCurrency = (value) => {
    const currencyCode = settings?.general?.currency || "IDR";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  /* =======================================================
     FORMAT DATE
  ======================================================= */
  const formatDate = (inputDate) => {
    if (!inputDate) return "-";
    const date = new Date(inputDate);
    if (Number.isNaN(date.getTime())) return String(inputDate);

    const format = settings?.general?.dateFormat;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());

    if (format === "MM/DD/YYYY") return `${month}/${day}/${year}`;
    if (format === "YYYY-MM-DD") return `${year}-${month}-${day}`;
    return `${day}/${month}/${year}`;
  };

  /* =======================================================
     FORMAT TIME
  ======================================================= */
  const formatTime = (inputDate) => {
    if (!inputDate) return "-";
    const date = new Date(inputDate);
    if (Number.isNaN(date.getTime())) return String(inputDate);

    const use12Hours = settings?.general?.timeFormat === "12h";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: use12Hours,
    });
  };

  /* =======================================================
     TRANSACTION TOTALS
  ======================================================= */
  const getTransactionTotals = (items = []) => {
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0),
      0,
    );

    const activeCharges = (settings?.taxAndCharges?.charges ?? []).filter(
      (charge) => charge.enabled,
    );

    const charges = activeCharges.map((charge) => {
      const amount =
        charge.type === "percentage"
          ? (subtotal * Number(charge.value || 0)) / 100
          : Number(charge.value || 0);
      return { ...charge, amount };
    });

    const chargesTotal = charges.reduce(
      (sum, charge) => sum + charge.amount,
      0,
    );

    const tax = settings?.taxAndCharges?.tax;
    const taxAmount = tax?.enabled
      ? ((tax.mode === "included" ? subtotal : subtotal + chargesTotal) *
          Number(tax.rate || 0)) /
        100
      : 0;

    const total = subtotal + chargesTotal + taxAmount;

    return { subtotal, taxAmount, charges, chargesTotal, total };
  };

  /* =======================================================
     ACTIVE PAYMENT METHODS
  ======================================================= */
  const activePaymentMethods = useMemo(
    () => paymentMethods.filter((method) => method.status === "active"),
    [paymentMethods],
  );

  /* =======================================================
     BACKUP
  ======================================================= */
  const backupNow = async () => {
    try {
      const result = await backupNowApi();
      setSettings(result.data);
      if (result.notification) {
        setInAppNotifications((prev) =>
          [result.notification, ...prev].slice(0, 50),
        );
      }
      return result.data;
    } catch (error) {
      console.error("Failed to run backup:", error);
      throw error;
    }
  };

  /* =======================================================
     EXPORT ALL DATA
  ======================================================= */
  const exportAllData = async () => {
    try {
      return await exportAllDataApi();
    } catch (error) {
      console.error("Failed to export data:", error);
      throw error;
    }
  };

  /* =======================================================
     IMPORT ALL DATA
  ======================================================= */
  const importAllData = async (payload) => {
    if (!payload || typeof payload !== "object") {
      console.error("Invalid import payload");
      return;
    }

    try {
      const updatedSettings = await importAllDataApi(payload);
      setSettings(updatedSettings);

      // Refresh payment methods juga karena import bisa mengubahnya.
      const refreshedPaymentMethods = await fetchPaymentMethods();
      setPaymentMethods(refreshedPaymentMethods);

      return updatedSettings;
    } catch (error) {
      console.error("Failed to import data:", error);
      throw error;
    }
  };

  /* =======================================================
     CLEAR TRANSACTION DATA / RESET INVENTORY
     -------------------------------------------------------
     Di luar scope migrasi settings ini: appData sudah
     dikonfirmasi terintegrasi ke backend di halaman lain.
     Fungsi ini dipertahankan sebagai no-op lokal supaya
     komponen lama yang masih memanggilnya tidak crash.
  ======================================================= */
  const clearTransactionData = () => {
    setAppData((prev) => ({ ...prev, historyPayment: [], salesData: [] }));
  };

  const resetInventoryData = () => {
    setAppData((prev) => ({ ...prev, stockData: defaultStockData }));
  };

  /* =======================================================
     RESET APPLICATION
  ======================================================= */
  const resetApplicationData = async () => {
    try {
      await resetApplicationDataApi();
      const [freshSettings, freshLogs, freshNotifications] = await Promise.all([
        fetchSettings(),
        fetchActivityLogs({ per_page: 100 }),
        fetchNotifications(),
      ]);
      setSettings(freshSettings);
      setActivityLogs(freshLogs?.data ?? freshLogs ?? []);
      setInAppNotifications(freshNotifications ?? []);
      setSessionActivity({});
    } catch (error) {
      console.error("Failed to reset application data:", error);
      throw error;
    }
  };

  /* =======================================================
     INTEGRATION
  ======================================================= */
  const updateIntegrationState = async (group, key, status) => {
    try {
      const updatedSettings = await updateIntegrationApi(group, key, status);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.error(`Failed to update integration ${group}.${key}:`, error);
      throw error;
    }
  };

  /* =======================================================
     PAYMENT NAME MAPPER
  ======================================================= */
  const mapPaymentNameForTransaction = (name) => {
    const normalized = normalizePaymentMethodName(name);
    const found = paymentMethods.find(
      (method) => method.name.toLowerCase() === normalized.toLowerCase(),
    );
    return found ? found.name : normalized;
  };

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */
  const value = {
    settings,
    settingsLoading,
    updateSettings,
    resetSettings,

    paymentMethods,
    updatePaymentMethod,

    taxSettings: settings?.taxAndCharges,
    updateTaxSettings,

    notificationSettings: settings?.notification,
    updateNotificationSettings,

    activityLogs,
    addActivityLog,

    currentUser: normalizeCurrentUser(currentUser),
    setCurrentUser,
    authLoading,

    hasPermission,

    formatCurrency,
    formatDate,
    formatTime,

    getTransactionTotals,
    activePaymentMethods,

    inAppNotifications,
    pushNotification,
    clearNotifications: async () => {
      await clearNotificationsApi();
      setInAppNotifications([]);
    },

    appData,
    setAppData,

    backupNow,
    exportAllData,
    importAllData,

    clearTransactionData,
    resetInventoryData,
    resetApplicationData,

    updateIntegrationState,

    mapPaymentNameForTransaction,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/* =========================================================
   USE SETTINGS
========================================================= */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
