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

/**
 * GET ALL INVENTORY MOVEMENTS
 *
 * Optional:
 * inventoryItemId
 */
export async function getInventoryMovements(inventoryItemId = null) {
  const url = inventoryItemId
    ? `${API_URL}/inventory-movements?inventory_item_id=${inventoryItemId}`
    : `${API_URL}/inventory-movements`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil inventory movements.");
  }

  return result.data ?? result;
}

/**
 * GET INVENTORY MOVEMENT BY ID
 */
export async function getInventoryMovementById(id) {
  if (!id) {
    throw new Error("Inventory movement ID tidak ditemukan.");
  }

  const response = await fetch(`${API_URL}/inventory-movements/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Gagal mengambil detail inventory movement.",
    );
  }

  return result.data ?? result;
}
