import { useSettings } from "../../../context/SettingsContext";

const groups = [
  {
    key: "payment",
    title: "Payment",
    entries: [
      { key: "qris", label: "QRIS" },
      { key: "paymentGateway", label: "Payment Gateway" },
    ],
  },
  {
    key: "storage",
    title: "Storage",
    entries: [
      { key: "googleDrive", label: "Google Drive" },
      { key: "cloudStorage", label: "Cloud Storage" },
    ],
  },
  {
    key: "communication",
    title: "Communication",
    entries: [
      { key: "email", label: "Email" },
      { key: "whatsapp", label: "WhatsApp" },
    ],
  },
];

export default function IntegrationSettings({ value, onChange, disabled }) {
  const { updateIntegrationState } = useSettings();

  const setStatus = (groupKey, serviceKey, status) => {
    const nextValue = {
      ...value,
      [groupKey]: {
        ...value[groupKey],
        [serviceKey]: {
          connected: status === "Connected",
          status,
          lastSync: status === "Connected" ? new Date().toISOString() : null,
        },
      },
    };

    onChange(nextValue);
    updateIntegrationState(groupKey, serviceKey, status);
  };

  return (
    <div className="settings-section">
      <h3 className="section-title">Integration</h3>

      {groups.map((group) => (
        <div key={group.key} className="card-block">
          <h4>{group.title}</h4>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Last Sync</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {group.entries.map((entry) => {
                  const service = value[group.key][entry.key];

                  return (
                    <tr key={entry.key}>
                      <td>{entry.label}</td>
                      <td>{service.status}</td>
                      <td>{service.lastSync || "-"}</td>
                      <td>
                        <div className="action-list">
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              setStatus(group.key, entry.key, "Connected")
                            }
                            disabled={disabled}
                          >
                            Connect
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              setStatus(group.key, entry.key, "Not Connected")
                            }
                            disabled={disabled}
                          >
                            Disconnect
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              setStatus(group.key, entry.key, "Configured")
                            }
                          >
                            Configure
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              setStatus(
                                group.key,
                                entry.key,
                                service.connected
                                  ? "Connected"
                                  : "Not Connected",
                              )
                            }
                          >
                            Test Connection
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
