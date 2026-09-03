const API_URL = "http://127.0.0.1:8001/api";

export const getReport = async (startDate, endDate) => {
  const token = localStorage.getItem("bf_token");

  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });

  const response = await fetch(`${API_URL}/reports?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to fetch report");
  }

  return response.json();
};
