import { getAuthToken } from "./authToken";

const API_URL = "http://127.0.0.1:8001/api";

export async function getTransactions() {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token autentikasi tidak ditemukan.");
  }

  const response = await fetch(`${API_URL}/transactions`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Transaction API Error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });

    let message = "Gagal mengambil data transaksi";

    try {
      const errorData = JSON.parse(errorText);
      message = errorData.message || message;
    } catch {
      // response bukan JSON
    }

    throw new Error(message);
  }

  const result = await response.json();

  return result.data;
}
