import { getAuthToken } from "./authToken";

const API_URL = "http://127.0.0.1:8001/api";

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
   GET /settings/permissions
   -> { roles: [{ id, name, slug, permissions: [...] }],
        permissions: [{ id, name, slug, module, action }] }
========================================================= */
export async function fetchRolesAndPermissions() {
  const result = await request("/settings/permissions", { method: "GET" });
  return result.data;
}

export async function createRole(name) {
  const result = await request("/settings/roles", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return result.data;
}

export async function renameRole(roleId, name) {
  const result = await request(`/settings/roles/${roleId}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
  return result.data;
}

export async function deleteRole(roleId) {
  // Sengaja tidak melempar error di sini untuk kasus 409
  // (role masih dipakai user) - biarkan caller yang menampilkan
  // pesan dari backend, karena ini bukan error tak terduga.
  return request(`/settings/roles/${roleId}`, { method: "DELETE" });
}

export async function updateRolePermissions(roleId, permissionIds) {
  const result = await request(`/settings/roles/${roleId}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissions: permissionIds }),
  });
  return result.data;
}
