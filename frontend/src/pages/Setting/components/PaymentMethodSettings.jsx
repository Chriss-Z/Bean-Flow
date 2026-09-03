function emptyPaymentMethod() {
  return {
    id: `pm-${Date.now()}`,
    name: "",
    status: "active",
    fee: 0,
    minimumTransaction: 0,
    maximumTransaction: 0,
    icon: "cash",
  };
}

export default function PaymentMethodSettings({ value, onChange, disabled }) {
  const updateMethod = (id, field, fieldValue) => {
    onChange(
      value.map((method) =>
        method.id === id ? { ...method, [field]: fieldValue } : method,
      ),
    );
  };

  const addMethod = () => onChange([...value, emptyPaymentMethod()]);

  const deleteMethod = (id) => {
    if (
      !window.confirm("Delete Payment Method?\nThis action cannot be undone.")
    ) {
      return;
    }

    onChange(value.filter((method) => method.id !== id));
  };

  return (
    <div className="settings-section">
      <h3 className="section-title">Payment Method</h3>

      <div className="inline-row">
        <span>Configure payment method used by Sales and Reports.</span>
        <button
          type="button"
          className="secondary-button"
          onClick={addMethod}
          disabled={disabled}
        >
          Add Method
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Fee (%)</th>
              <th>Min</th>
              <th>Max</th>
              <th>Icon</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {value.map((method) => (
              <tr key={method.id}>
                <td>
                  <input
                    value={method.name}
                    onChange={(event) =>
                      updateMethod(method.id, "name", event.target.value)
                    }
                    disabled={disabled}
                  />
                </td>
                <td>
                  <select
                    value={method.status}
                    onChange={(event) =>
                      updateMethod(method.id, "status", event.target.value)
                    }
                    disabled={disabled}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={method.fee}
                    onChange={(event) =>
                      updateMethod(method.id, "fee", Number(event.target.value))
                    }
                    disabled={disabled}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={method.minimumTransaction}
                    onChange={(event) =>
                      updateMethod(
                        method.id,
                        "minimumTransaction",
                        Number(event.target.value),
                      )
                    }
                    disabled={disabled}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={method.maximumTransaction}
                    onChange={(event) =>
                      updateMethod(
                        method.id,
                        "maximumTransaction",
                        Number(event.target.value),
                      )
                    }
                    disabled={disabled}
                  />
                </td>
                <td>
                  <select
                    value={method.icon}
                    onChange={(event) =>
                      updateMethod(method.id, "icon", event.target.value)
                    }
                    disabled={disabled}
                  >
                    <option value="cash">Cash</option>
                    <option value="qris">QRIS</option>
                    <option value="card">Card</option>
                    <option value="wallet">Wallet</option>
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => deleteMethod(method.id)}
                    disabled={disabled}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
