const API_BASE_URL = "http://127.0.0.1:8001";

export const getImageUrl = (image) => {
  if (!image) return null;

  // Kalau sudah URL lengkap
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Kalau Laravel menyimpan path seperti:
  // products/xxxxx.png
  return `${API_BASE_URL}/storage/${image}`;
};
