import { useEffect, useRef } from "react";

/**
 * useSessionTimeout
 * ─────────────────────────────────────────────────────────────────────────
 * Logs the user out automatically after `timeoutMinutes` of inactivity.
 * Meant to be mounted once, near the top of your authenticated app (e.g.
 * inside the layout that wraps Beranda / Penjualan / Inventori / etc.),
 * NOT inside Login.jsx itself.
 *
 * How to wire it to the Setting.jsx "Security" tab:
 * 1. In SettingsContext's default state, add a field to `security`, e.g.
 *      security: { ...existing fields, sessionTimeout: 15 } // minutes
 * 2. In SecuritySettings.jsx, add a number input bound to
 *      value.sessionTimeout -> onChange(...) same pattern as your other
 *    fields already use (min ~1, sensible max ~120).
 * 3. In your main authenticated layout:
 *
 *      import { useSettings } from "../context/SettingsContext";
 *      import useSessionTimeout from "../hooks/useSessionTimeout";
 *
 *      const { settings } = useSettings();
 *
 *      useSessionTimeout({
 *        timeoutMinutes: settings.security.sessionTimeout ?? 15,
 *        onWarning: () => setShowTimeoutWarning(true),
 *        onTimeout: () => {
 *          sessionStorage.removeItem("bf_session_token");
 *          localStorage.removeItem("bf_session_token");
 *          navigate("/login");
 *        },
 *      });
 *
 * Security note: this is a client-side idle timer for UX (auto-logging a
 * forgotten, unlocked screen). It does not replace a real backend session
 * expiry — your API token should also have its own server-enforced TTL.
 * ─────────────────────────────────────────────────────────────────────────
 */

const DEFAULT_ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
];

export default function useSessionTimeout({
  timeoutMinutes = 15,
  warningSeconds = 60,
  onTimeout,
  onWarning,
  events = DEFAULT_ACTIVITY_EVENTS,
  enabled = true,
}) {
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);

  useEffect(() => {
    if (!enabled || !timeoutMinutes || timeoutMinutes <= 0) return undefined;

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = Math.max(timeoutMs - warningSeconds * 1000, 0);

    const clearTimers = () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
    };

    const resetTimers = () => {
      clearTimers();
      if (warningMs > 0 && onWarning) {
        warningRef.current = setTimeout(onWarning, warningMs);
      }
      timeoutRef.current = setTimeout(() => {
        onTimeout?.();
      }, timeoutMs);
    };

    resetTimers();
    events.forEach((evt) => window.addEventListener(evt, resetTimers));

    // Also end the session if the tab is hidden past the limit (e.g. laptop
    // closed) — checked once when the tab becomes visible again.
    let hiddenAt = null;
    const handleVisibility = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
      } else if (hiddenAt && Date.now() - hiddenAt >= timeoutMs) {
        onTimeout?.();
      } else {
        resetTimers();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimers();
      events.forEach((evt) => window.removeEventListener(evt, resetTimers));
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, timeoutMinutes, warningSeconds, onTimeout, onWarning, events]);
}
