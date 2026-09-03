const sections = [
  {
    key: "inventory",
    title: "Inventory",
    items: [
      { key: "lowStockAlert", label: "Low Stock Alert" },
      { key: "outOfStockAlert", label: "Out of Stock Alert" },
    ],
  },
  {
    key: "sales",
    title: "Sales",
    items: [
      { key: "newTransaction", label: "New Transaction" },
      { key: "failedTransaction", label: "Failed Transaction" },
      { key: "refund", label: "Refund" },
    ],
  },
  {
    key: "payroll",
    title: "Payroll",
    items: [
      { key: "upcomingPayroll", label: "Upcoming Payroll" },
      { key: "payrollPending", label: "Payroll Pending" },
      { key: "payrollCompleted", label: "Payroll Completed" },
    ],
  },
  {
    key: "system",
    title: "System",
    items: [
      { key: "backupCompleted", label: "Backup Completed" },
      { key: "backupFailed", label: "Backup Failed" },
      { key: "securityAlert", label: "Security Alert" },
      { key: "loginAlert", label: "Login Alert" },
    ],
  },
];

export default function NotificationSettings({ value, onChange, disabled }) {
  const toggle = (sectionKey, itemKey, channelKey) => {
    onChange({
      ...value,
      [sectionKey]: {
        ...value[sectionKey],
        [itemKey]: {
          ...value[sectionKey][itemKey],
          [channelKey]: !value[sectionKey][itemKey][channelKey],
        },
      },
    });
  };

  return (
    <div className="settings-section">
      <h3 className="section-title">Notification</h3>

      {sections.map((section) => (
        <div key={section.key} className="card-block">
          <h4>{section.title}</h4>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>In-App</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {section.items.map((item) => (
                  <tr key={item.key}>
                    <td>{item.label}</td>
                    <td>
                      <button
                        type="button"
                        className={
                          value[section.key][item.key].inApp
                            ? "switch active"
                            : "switch"
                        }
                        onClick={() => toggle(section.key, item.key, "inApp")}
                        disabled={disabled}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className={
                          value[section.key][item.key].email
                            ? "switch active"
                            : "switch"
                        }
                        onClick={() => toggle(section.key, item.key, "email")}
                        disabled={disabled}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
