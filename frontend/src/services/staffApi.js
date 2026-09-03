import { getAuthToken } from "./authToken";

const API_URL = "http://127.0.0.1:8001/api";

export async function getStaff() {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token autentikasi tidak ditemukan.");
  }

  const response = await fetch(`${API_URL}/staff`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data staff");
  }

  return result.data;
}

export async function getStaffById(id) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token autentikasi tidak ditemukan.");
  }

  const response = await fetch(`${API_URL}/staff/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil detail staff");
  }

  return result.data;
}

export async function createStaff(payload) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token autentikasi tidak ditemukan.");
  }

  const isFormData = payload instanceof FormData;

  const response = await fetch(`${API_URL}/staff`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? payload : JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menambahkan staff");
  }

  return result.data;
}

export async function updateStaff(id, payload) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token autentikasi tidak ditemukan.");
  }

  const isFormData = payload instanceof FormData;

  if (isFormData) {
    payload.append("_method", "PUT");
  }

  const response = await fetch(`${API_URL}/staff/${id}`, {
    method: isFormData ? "POST" : "PUT",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? payload : JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui data staff");
  }

  return result.data;
}

export async function deleteStaff(id) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token autentikasi tidak ditemukan.");
  }

  const response = await fetch(`${API_URL}/staff/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus staff");
  }

  return result.data;
}
