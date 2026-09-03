import { getAuthToken } from "./authToken";

const API_URL = "http://127.0.0.1:8001/api";

export async function getCurrentUser() {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token autentikasi tidak ditemukan.");
  }

  const response = await fetch(`${API_URL}/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data user.");
  }

  // Backend:
  // {
  //   success: true,
  //   user: {...}
  // }

  return result.user;
}
