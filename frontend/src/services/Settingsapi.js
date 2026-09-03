import { getAuthToken } from "./authToken";

const API_URL = "http://127.0.0.1:8001/api";

/* =========================================================
   BASE REQUEST HELPER

   Mengikuti pola yang sama dengan getCurrentUser() di
   authApi.js: fetch + Bearer token + { success, message }.
========================================================= */
async function request(path, options = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token autentikasi tidak ditemukan.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Terjadi kesalahan pada server.");
  }

  return result;
}

/* =========================================================
   SETTINGS
========================================================= */
export async function fetchSettings() {
  const result = await request("/settings", { method: "GET" });
  return result.data;
}

export async function updateSettingSection(section, value) {
  const result = await request(`/settings/${section}`, {
    method: "PATCH",
    body: JSON.stringify({ value }),
  });
  return result.data;
}

export async function resetSettingsApi() {
  const result = await request("/settings/reset", { method: "POST" });
  return result.data;
}

export async function updateIntegrationApi(group, key, status) {
  const result = await request(`/settings/integration/${group}/${key}`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
  return result.data;
}

export async function backupNowApi() {
  const result = await request("/settings/backup", { method: "POST" });
  return result;
}

export async function exportAllDataApi() {
  const result = await request("/settings/export", { method: "GET" });
  return result.data;
}

export async function importAllDataApi(payload) {
  const result = await request("/settings/import", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result.data;
}

export async function resetApplicationDataApi() {
  return request("/settings/reset-application", { method: "POST" });
}

/* =========================================================
   PAYMENT METHODS
========================================================= */
export async function fetchPaymentMethods() {
  const result = await request("/payment-methods", { method: "GET" });
  return result.data;
}

export async function createPaymentMethod(payload) {
  const result = await request("/payment-methods", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result.data;
}

export async function updatePaymentMethodApi(id, payload) {
  const result = await request(`/payment-methods/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return result.data;
}

export async function deletePaymentMethodApi(id) {
  return request(`/payment-methods/${id}`, { method: "DELETE" });
}

export async function togglePaymentMethodApi(id) {
  const result = await request(`/payment-methods/${id}/toggle`, {
    method: "PATCH",
  });
  return result.data;
}

/* =========================================================
   ACTIVITY LOGS
========================================================= */
export async function fetchActivityLogs(params = {}) {
  const query = new URLSearchParams(params).toString();
  const result = await request(`/activity-logs${query ? `?${query}` : ""}`, {
    method: "GET",
  });
  return result.data;
}

export async function createActivityLogApi(payload) {
  const result = await request("/activity-logs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result.data;
}

/* =========================================================
   IN-APP NOTIFICATIONS
========================================================= */
export async function fetchNotifications() {
  const result = await request("/notifications", { method: "GET" });
  return result.data;
}

export async function pushNotificationApi(payload) {
  const result = await request("/notifications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result.data;
}

export async function markNotificationReadApi(id) {
  const result = await request(`/notifications/${id}/read`, {
    method: "PATCH",
  });
  return result.data;
}

export async function clearNotificationsApi() {
  return request("/notifications", { method: "DELETE" });
}
