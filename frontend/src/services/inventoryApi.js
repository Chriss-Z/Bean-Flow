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

// GET INVENTORY
export async function getInventory() {
  const response = await fetch(`${API_URL}/inventory`, {
    method: "GET",
    headers: getHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data inventory");
  }

  return result.data;
}

// GET DETAIL INVENTORY
export async function getInventoryById(id) {
  const response = await fetch(`${API_URL}/inventory/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil detail inventory");
  }

  return result.data;
}

// CREATE INVENTORY
export async function createInventory(data) {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/inventory`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menambahkan inventory");
  }

  return result.data;
}

// UPDATE INVENTORY
export async function updateInventory(id, data) {
  const token = getAuthToken();

  // Laravel akan membaca POST ini sebagai PUT
  data.append("_method", "PUT");

  const response = await fetch(`${API_URL}/inventory/${id}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui inventory");
  }

  return result.data;
}

// DELETE INVENTORY
export async function deleteInventory(id) {
  const response = await fetch(`${API_URL}/inventory/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus inventory");
  }

  return result;
}

export async function addInventoryStock(id, quantity, image = null) {
  const token = getAuthToken();

  const formData = new FormData();

  formData.append("quantity", quantity);

  if (image) {
    formData.append("image", image);
  }

  const response = await fetch(`${API_URL}/inventory/${id}/stock`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menambahkan stock");
  }

  return result.data;
}

// ============================================================
// MENU / PRODUCT
// Menu direpresentasikan sebagai Product di backend (ProductController,
// tabel `products`), jadi tidak ada MenuController atau file API baru —
// semua fungsi Menu ditaruh di sini dan mengarah ke endpoint /products.
// ============================================================

// GET MENU (list products)
export async function getMenu() {
  const response = await fetch(`${API_URL}/products`, {
    method: "GET",
    headers: getHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data menu");
  }

  return result.data;
}

// GET DETAIL MENU (termasuk relasi ingredients dari product_ingredients)
export async function getMenuById(id) {
  const response = await fetch(`${API_URL}/products/${id}`, {
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
// data: FormData berisi name, category, price, description, is_active,
// image (opsional), dan ingredients[index][inventory_item_id] /
// ingredients[index][quantity] untuk disimpan ke tabel product_ingredients.
export async function createMenu(data) {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/products`, {
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

  const response = await fetch(`${API_URL}/products/${id}`, {
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
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus menu");
  }

  return result;
}

// GET CATEGORIES (untuk dropdown Kategori di form Menu/Product)
export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`, {
    method: "GET",
    headers: getHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data kategori");
  }

  return result.data;
}
