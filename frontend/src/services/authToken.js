const TOKEN_KEY = "bf_token";

/**
 * GET TOKEN
 */
export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

/**
 * SET TOKEN
 */
export function setAuthToken(token, remember = true) {
  if (!token) return;

  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * CLEAR TOKEN
 */
export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

/**
 * CHECK AUTHENTICATION
 */
export function isAuthenticated() {
  return Boolean(getAuthToken());
}
