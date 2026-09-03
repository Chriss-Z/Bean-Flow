function ToggleRow({ label, checked, onToggle, disabled }) {
  return (
    <div className="inline-row">
      <span>{label}</span>
      <button
        type="button"
        className={checked ? "switch active" : "switch"}
        onClick={onToggle}
        disabled={disabled}
      />
    </div>
  );
}

export default function GeneralSettings({ value, onChange, disabled }) {
  const setValue = (key, fieldValue) =>
    onChange({ ...value, [key]: fieldValue });

  return (
    <div className="settings-section">
      <h3 className="section-title">General</h3>

      <div className="card-block">
        <h4>Application</h4>
        <div className="section-grid">
          <div className="input-field">
            <label>Language</label>
            <select
              value={value.language}
              onChange={(event) => setValue("language", event.target.value)}
              disabled={disabled}
            >
              <option>English</option>
              <option>Indonesia</option>
            </select>
          </div>

          <div className="input-field">
            <label>Currency</label>
            <select
              value={value.currency}
              onChange={(event) => setValue("currency", event.target.value)}
              disabled={disabled}
            >
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div className="input-field">
            <label>Date Format</label>
            <select
              value={value.dateFormat}
              onChange={(event) => setValue("dateFormat", event.target.value)}
              disabled={disabled}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="input-field">
            <label>Time Format</label>
            <select
              value={value.timeFormat}
              onChange={(event) => setValue("timeFormat", event.target.value)}
              disabled={disabled}
            >
              <option value="24h">24h</option>
              <option value="12h">12h</option>
            </select>
          </div>

          <div className="input-field">
            <label>Timezone</label>
            <input
              value={value.timezone}
              onChange={(event) => setValue("timezone", event.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="input-field">
            <label>Session Timeout (minutes)</label>
            <input
              type="number"
              min="5"
              value={value.sessionTimeout}
              onChange={(event) =>
                setValue("sessionTimeout", Number(event.target.value))
              }
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      <div className="card-block">
        <h4>Appearance</h4>
        <ToggleRow
          label="Theme (light/dark)"
          checked={value.theme === "dark"}
          onToggle={() =>
            setValue("theme", value.theme === "light" ? "dark" : "light")
          }
          disabled={disabled}
        />
        <ToggleRow
          label="Compact Mode"
          checked={value.compactMode}
          onToggle={() => setValue("compactMode", !value.compactMode)}
          disabled={disabled}
        />
      </div>

      <div className="card-block">
        <h4>Behavior</h4>
        <ToggleRow
          label="Confirmation Dialog"
          checked={value.confirmationDialog}
          onToggle={() =>
            setValue("confirmationDialog", !value.confirmationDialog)
          }
          disabled={disabled}
        />
        <ToggleRow
          label="Success Notification"
          checked={value.successNotification}
          onToggle={() =>
            setValue("successNotification", !value.successNotification)
          }
          disabled={disabled}
        />
        <ToggleRow
          label="Error Notification"
          checked={value.errorNotification}
          onToggle={() =>
            setValue("errorNotification", !value.errorNotification)
          }
          disabled={disabled}
        />
      </div>
    </div>
  );
}
