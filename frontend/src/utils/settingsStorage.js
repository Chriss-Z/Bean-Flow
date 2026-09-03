const SETTINGS_STORAGE_KEY = "beanflow.settings.v1";
const APP_DATA_STORAGE_KEY = "beanflow.appdata.v1";
const ACTIVITY_LOG_STORAGE_KEY = "beanflow.activitylog.v1";
const SESSION_ACTIVITY_KEY = "beanflow.sessionActivity.v1";
const USER_STORAGE_KEY = "beanflow.currentUser.v1";
const NOTIFICATION_CENTER_KEY = "beanflow.notificationCenter.v1";

export function loadFromStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) return fallbackValue;

    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

export function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storageKeys = {
  SETTINGS_STORAGE_KEY,
  APP_DATA_STORAGE_KEY,
  ACTIVITY_LOG_STORAGE_KEY,
  SESSION_ACTIVITY_KEY,
  USER_STORAGE_KEY,
  NOTIFICATION_CENTER_KEY,
};
