import { useState } from "react";
import { useSettings } from "../../../context/SettingsContext";

export default function SecuritySettings({ value, onChange, disabled }) {
  const { addActivityLog } = useSettings();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const setValue = (field, fieldValue) =>
    onChange({ ...value, [field]: fieldValue });

  const setPolicy = (field, fieldValue) =>
    onChange({
      ...value,
      passwordPolicy: {
        ...value.passwordPolicy,
        [field]: fieldValue,
      },
    });

  const handleChangePassword = () => {
    if (
      !passwordForm.newPassword ||
      passwordForm.newPassword !== passwordForm.confirmPassword
    ) {
      setMessage("Password confirmation does not match");
      return;
    }

    if (passwordForm.newPassword.length < value.passwordPolicy.minimumLength) {
      setMessage("Password does not satisfy minimum length");
      return;
    }

    setMessage("Password updated successfully (prototype mode)");
    const passwordHash = btoa(passwordForm.newPassword).slice(0, 12);

    onChange({
      ...value,
      passwordMeta: {
        hash: passwordHash,
        changedAt: new Date().toISOString(),
      },
    });

    addActivityLog({
      action: "UPDATE",
      module: "Security",
      description: "Changed password policy credentials",
      status: "Success",
    });

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="settings-section">
      <h3 className="section-title">Security</h3>

      <div className="card-block">
        <h4>Password</h4>
        <div className="section-grid">
          <div className="input-field">
            <label>Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: event.target.value,
                }))
              }
              disabled={disabled}
            />
          </div>
          <div className="input-field">
            <label>New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: event.target.value,
                }))
              }
              disabled={disabled}
            />
          </div>
          <div className="input-field">
            <label>Confirm Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  confirmPassword: event.target.value,
                }))
              }
              disabled={disabled}
            />
          </div>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={handleChangePassword}
          disabled={disabled}
        >
          Change Password
        </button>
        {message ? (
          <p style={{ marginTop: "10px", color: "#6b7280" }}>{message}</p>
        ) : null}
      </div>

      <div className="card-block">
        <h4>Two Factor Authentication</h4>
        <div className="inline-row">
          <span>Enable 2FA</span>
          <button
            type="button"
            className={value.twoFactorEnabled ? "switch active" : "switch"}
            onClick={() =>
              setValue("twoFactorEnabled", !value.twoFactorEnabled)
            }
            disabled={disabled}
          />
        </div>
      </div>

      <div className="card-block">
        <h4>Login Security</h4>
        <div className="section-grid">
          <div className="input-field">
            <label>Maximum Login Attempts</label>
            <input
              type="number"
              value={value.maximumLoginAttempts}
              onChange={(event) =>
                setValue("maximumLoginAttempts", Number(event.target.value))
              }
              disabled={disabled}
            />
          </div>
          <div className="input-field">
            <label>Lockout Duration (minutes)</label>
            <input
              type="number"
              value={value.lockoutDuration}
              onChange={(event) =>
                setValue("lockoutDuration", Number(event.target.value))
              }
              disabled={disabled}
            />
          </div>
        </div>
        <div className="inline-row">
          <span>Remember Device</span>
          <button
            type="button"
            className={value.rememberDevice ? "switch active" : "switch"}
            onClick={() => setValue("rememberDevice", !value.rememberDevice)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="card-block">
        <h4>Password Policy</h4>
        <div className="section-grid">
          <div className="input-field">
            <label>Minimum Password Length</label>
            <input
              type="number"
              value={value.passwordPolicy.minimumLength}
              onChange={(event) =>
                setPolicy("minimumLength", Number(event.target.value))
              }
              disabled={disabled}
            />
          </div>
        </div>
        <div className="inline-row">
          <span>Require Uppercase</span>
          <button
            type="button"
            className={
              value.passwordPolicy.requireUppercase ? "switch active" : "switch"
            }
            onClick={() =>
              setPolicy(
                "requireUppercase",
                !value.passwordPolicy.requireUppercase,
              )
            }
            disabled={disabled}
          />
        </div>
        <div className="inline-row">
          <span>Require Number</span>
          <button
            type="button"
            className={
              value.passwordPolicy.requireNumber ? "switch active" : "switch"
            }
            onClick={() =>
              setPolicy("requireNumber", !value.passwordPolicy.requireNumber)
            }
            disabled={disabled}
          />
        </div>
        <div className="inline-row">
          <span>Require Special Character</span>
          <button
            type="button"
            className={
              value.passwordPolicy.requireSpecialCharacter
                ? "switch active"
                : "switch"
            }
            onClick={() =>
              setPolicy(
                "requireSpecialCharacter",
                !value.passwordPolicy.requireSpecialCharacter,
              )
            }
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
