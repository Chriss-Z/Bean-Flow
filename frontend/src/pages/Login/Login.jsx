import { useEffect, useRef, useState } from "react";
import {
  FiCoffee,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
  FiLoader,
  FiCheckCircle,
} from "react-icons/fi";
import "./Login.css";

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;
const ATTEMPTS_KEY = "bf_login_attempts";
const LOCKOUT_KEY = "bf_lockout_until";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
async function loginAPI({ email, password }) {
  const response = await fetch("http://127.0.0.1:8001/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      message: data.message || "Email atau password salah.",
    };
  }

  return {
    ok: true,
    user: data.user,
    token: data.token,
  };
}

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSucceeded, setJustSucceeded] = useState(false);

  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const timerRef = useRef(null);

  // Restore lockout state on mount / tab refresh so a reload can't bypass it.
  useEffect(() => {
    const until = Number(localStorage.getItem(LOCKOUT_KEY) || 0);
    if (until > Date.now()) {
      setLockoutRemaining(Math.ceil((until - Date.now()) / 1000));
    }
  }, []);

  // Countdown ticker while locked out.
  useEffect(() => {
    if (lockoutRemaining <= 0) return undefined;

    timerRef.current = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          localStorage.removeItem(LOCKOUT_KEY);
          localStorage.removeItem(ATTEMPTS_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [lockoutRemaining]);

  const isLockedOut = lockoutRemaining > 0;

  const registerFailedAttempt = () => {
    const attempts = Number(localStorage.getItem(ATTEMPTS_KEY) || 0) + 1;
    localStorage.setItem(ATTEMPTS_KEY, String(attempts));

    if (attempts >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_SECONDS * 1000;
      localStorage.setItem(LOCKOUT_KEY, String(until));
      setLockoutRemaining(LOCKOUT_SECONDS);
    }
    return attempts;
  };

  const clearAttempts = () => {
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
  };

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = "Email is required";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email address";

    if (!password) errors.password = "Password is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCapsLock = (event) => {
    if (typeof event.getModifierState === "function") {
      setCapsLockOn(event.getModifierState("CapsLock"));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (isLockedOut || isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const result = await loginAPI({
        email: email.trim(),
        password,
      });
      if (result.ok) {
        console.log("LOGIN USER:", result.user);
        console.log("LOGIN TOKEN:", result.token);

        clearAttempts();
        setJustSucceeded(true);

        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem("bf_user", JSON.stringify(result.user));
        storage.setItem("bf_token", result.token);
        storage.setItem("isAuthenticated", "true");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      } else {
        const attempts = registerFailedAttempt();

        const remaining = Math.max(MAX_ATTEMPTS - attempts, 0);

        setFormError(
          remaining > 0
            ? `Email or password is incorrect. ${remaining} attempt${
                remaining === 1 ? "" : "s"
              } left before a short lockout.`
            : "Too many failed attempts. Please wait before trying again.",
        );

        setPassword("");
      }
    } catch (err) {
      console.error("Login error:", err);

      setFormError("Unable to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="login-page">
      <div className="login-visual" aria-hidden="true">
        <div className="login-visual-overlay" />
        <div className="bean-scatter" />
        <div className="login-brand">
          <div className="login-logo">
            <FiCoffee />
          </div>
          <h1 className="login-wordmark">Bean &amp; Flow</h1>
          <p className="login-wordmark-sub">COFFEE SHOP</p>
        </div>
        <div className="login-visual-copy">
          <h2>Your corner of the coffee shop, digitized.</h2>
          <p>
            Sign in to track sales, manage inventory, and keep every shift
            running as smoothly as a well-pulled shot.
          </p>
        </div>
        <div className="steam" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="login-panel">
        <form
          className="login-card"
          onSubmit={handleSubmit}
          noValidate
          autoComplete="on"
        >
          <div className="login-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue to your dashboard</p>
          </div>

          {justSucceeded && (
            <div className="login-alert login-alert-success" role="status">
              <FiCheckCircle />
              <span>Signed in — redirecting…</span>
            </div>
          )}

          {isLockedOut && (
            <div className="login-alert login-alert-error" role="alert">
              <FiAlertTriangle />
              <span>
                Too many failed attempts. Try again in{" "}
                <strong>{formatTime(lockoutRemaining)}</strong>.
              </span>
            </div>
          )}

          {!isLockedOut && formError && (
            <div className="login-alert login-alert-error" role="alert">
              <FiAlertTriangle />
              <span>{formError}</span>
            </div>
          )}

          <label className="login-field" htmlFor="login-email">
            <span className="login-label">Email</span>
            <div
              className={
                fieldErrors.email
                  ? "login-input-wrap login-input-error"
                  : "login-input-wrap"
              }
            >
              <FiMail className="login-input-icon" />
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="username"
                placeholder="you@beanflow.com"
                value={email}
                disabled={isLockedOut || isSubmitting}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={
                  fieldErrors.email ? "login-email-error" : undefined
                }
              />
            </div>
            {fieldErrors.email && (
              <span className="login-field-error" id="login-email-error">
                {fieldErrors.email}
              </span>
            )}
          </label>

          <label className="login-field" htmlFor="login-password">
            <span className="login-label">Password</span>
            <div
              className={
                fieldErrors.password
                  ? "login-input-wrap login-input-error"
                  : "login-input-wrap"
              }
            >
              <FiLock className="login-input-icon" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                disabled={isLockedOut || isSubmitting}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={handleCapsLock}
                onKeyDown={handleCapsLock}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={
                  fieldErrors.password ? "login-password-error" : undefined
                }
              />
              <button
                type="button"
                className="login-eye-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {capsLockOn && !isLockedOut && (
              <span className="login-field-hint">
                <FiAlertTriangle /> Caps Lock is on
              </span>
            )}
            {fieldErrors.password && (
              <span className="login-field-error" id="login-password-error">
                {fieldErrors.password}
              </span>
            )}
          </label>

          <div className="login-row">
            <label className="login-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={isLockedOut || isSubmitting}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember this device</span>
            </label>
            <a className="login-forgot" href="/forgot-password">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={isLockedOut || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FiLoader className="login-spinner" /> Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <p className="login-footnote">
            Protected by Bean &amp; Flow Security · Sessions time out
            automatically after a period of inactivity
          </p>
        </form>
      </div>
    </div>
  );
}
