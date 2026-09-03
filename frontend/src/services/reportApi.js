import { getAuthToken } from "./authToken";


const API_URL = "http://127.0.0.1:8001/api";

export async function getReport(startDate, endDate) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication token not found");
  }

  const params = new URLSearchParams();

  if (startDate) {
    params.append("start_date", startDate);
  }

  if (endDate) {
    params.append("end_date", endDate);
  }

  const response = await fetch(`${API_URL}/reports?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch report");
  }

  return data;
}
