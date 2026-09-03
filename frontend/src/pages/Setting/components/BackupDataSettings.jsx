import { useSettings } from "../../../context/SettingsContext";

export default function BackupDataSettings({ value, onChange, disabled }) {
  const {
    backupNow,
    exportAllData,
    importAllData,
    clearTransactionData,
    resetInventoryData,
    resetApplicationData,
  } = useSettings();

  const setAutoBackup = (field, fieldValue) => {
    onChange({
      ...value,
      automaticBackup: {
        ...value.automaticBackup,
        [field]: fieldValue,
      },
    });
  };

  const onExport = () => {
    const payload = exportAllData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `beanflow-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const onImport = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result));
        importAllData(payload);
      } catch {
        window.alert("Invalid backup file format");
      }
    };

    reader.readAsText(file);
  };

  const confirmAndRun = (actionLabel, callback) => {
    if (!window.confirm(`${actionLabel}?\nThis action cannot be undone.`))
      return;

    callback();
  };

  return (
    <div className="settings-section">
      <h3 className="section-title">Backup & Data</h3>

      <div className="card-block">
        <h4>Backup</h4>
        <div className="inline-row">
          <span>Last Backup</span>
          <strong>{value.lastBackup || "Never"}</strong>
        </div>
        <div className="inline-row">
          <span>Status</span>
          <strong>{value.backupStatus}</strong>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={backupNow}
          disabled={disabled}
        >
          Backup Now
        </button>
      </div>

      <div className="card-block">
        <h4>Automatic Backup</h4>
        <div className="inline-row">
          <span>Enable</span>
          <button
            type="button"
            className={
              value.automaticBackup.enabled ? "switch active" : "switch"
            }
            onClick={() =>
              setAutoBackup("enabled", !value.automaticBackup.enabled)
            }
            disabled={disabled}
          />
        </div>
        <div className="section-grid">
          <div className="input-field">
            <label>Frequency</label>
            <select
              value={value.automaticBackup.frequency}
              onChange={(event) =>
                setAutoBackup("frequency", event.target.value)
              }
              disabled={disabled}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="input-field">
            <label>Backup Time</label>
            <input
              type="time"
              value={value.automaticBackup.time}
              onChange={(event) => setAutoBackup("time", event.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      <div className="card-block">
        <h4>Data</h4>
        <div className="action-list">
          <button
            type="button"
            className="secondary-button"
            onClick={onExport}
            disabled={disabled}
          >
            Export Data
          </button>
          <label
            className="secondary-button"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            Import Data
            <input
              type="file"
              accept="application/json"
              onChange={onImport}
              disabled={disabled}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      <div className="card-block">
        <h4>Danger Zone</h4>
        <div className="action-list">
          <button
            type="button"
            className="danger-button"
            onClick={() =>
              confirmAndRun("Clear Transaction Data", clearTransactionData)
            }
            disabled={disabled}
          >
            Clear Transaction Data
          </button>
          <button
            type="button"
            className="danger-button"
            onClick={() => confirmAndRun("Reset Inventory", resetInventoryData)}
            disabled={disabled}
          >
            Reset Inventory
          </button>
          <button
            type="button"
            className="danger-button"
            onClick={() =>
              confirmAndRun("Reset Application", resetApplicationData)
            }
            disabled={disabled}
          >
            Reset Application
          </button>
        </div>
      </div>
    </div>
  );
}
