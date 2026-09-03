const API_URL = "http://127.0.0.1:8001/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("bf_token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ========================================
// GET PAYROLLS
// ========================================

export const getPayrolls = async () => {
  const response = await fetch(`${API_URL}/payrolls`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch payrolls.");
  }

  return data;
};

// ========================================
// GET PAYROLL HISTORY
// ========================================

export const getPayrollHistory = async () => {
  const response = await fetch(`${API_URL}/payrolls/history`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch payroll history.");
  }

  return data;
};

// ========================================
// GET UPCOMING PAYMENTS
// ========================================

export const getUpcomingPayments = async () => {
  const response = await fetch(`${API_URL}/payrolls/upcoming`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch upcoming payments.");
  }

  return data;
};

// ========================================
// CREATE PAYROLL
// ========================================

export const createPayroll = async (payload) => {
  const response = await fetch(`${API_URL}/payrolls`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create payroll.");
  }

  return data;
};

// ========================================
// UPDATE PAYROLL
// ========================================

export const updatePayroll = async (id, payload) => {
  const response = await fetch(`${API_URL}/payrolls/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update payroll.");
  }

  return data;
};

// ========================================
// DELETE PAYROLL
// ========================================

export const deletePayroll = async (id) => {
  const response = await fetch(`${API_URL}/payrolls/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete payroll.");
  }

  return data;
};
