import { getAuthToken } from "./authToken";

const API_URL = "http://127.0.0.1:8001/api";

const getHeaders = () => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token autentikasi tidak ditemukan.");
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// GET MENU
export async function getMenu() {
  const response = await fetch(`${API_URL}/menu`, {
    method: "GET",
    headers: getHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data menu");
  }

  return result.data;
}

// GET DETAIL MENU
export async function getMenuById(id) {
  const response = await fetch(`${API_URL}/menu/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil detail menu");
  }

  return result.data;
}

// CREATE MENU
export async function createMenu(data) {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/menu`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menambahkan menu");
  }

  return result.data;
}

// UPDATE MENU
export async function updateMenu(id, data) {
  const token = getAuthToken();

  // Laravel akan membaca POST ini sebagai PUT
  data.append("_method", "PUT");

  const response = await fetch(`${API_URL}/menu/${id}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui menu");
  }

  return result.data;
}

// DELETE MENU
export async function deleteMenu(id) {
  const response = await fetch(`${API_URL}/menu/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus menu");
  }

  return result;
}
