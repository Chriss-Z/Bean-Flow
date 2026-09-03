function createEmptyCharge() {
  return {
    id: `chg-${Date.now()}`,
    name: "",
    type: "fixed",
    value: 0,
    enabled: true,
  };
}

export default function TaxChargesSettings({ value, onChange, disabled }) {
  const updateTax = (key, keyValue) => {
    onChange({
      ...value,
      tax: {
        ...value.tax,
        [key]: keyValue,
      },
    });
  };

  const updateCharge = (id, key, keyValue) => {
    onChange({
      ...value,
      charges: value.charges.map((charge) =>
        charge.id === id ? { ...charge, [key]: keyValue } : charge,
      ),
    });
  };

  const addCharge = () =>
    onChange({ ...value, charges: [...value.charges, createEmptyCharge()] });

  const removeCharge = (id) =>
    onChange({
      ...value,
      charges: value.charges.filter((charge) => charge.id !== id),
    });

  return (
    <div className="settings-section">
      <h3 className="section-title">Tax & Charges</h3>

      <div className="card-block">
        <h4>Tax</h4>
        <div className="inline-row">
          <span>Enable Tax</span>
          <button
            type="button"
            className={value.tax.enabled ? "switch active" : "switch"}
            onClick={() => updateTax("enabled", !value.tax.enabled)}
            disabled={disabled}
          />
        </div>

        <div className="section-grid">
          <div className="input-field">
            <label>Tax Name</label>
            <input
              value={value.tax.name}
              onChange={(event) => updateTax("name", event.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="input-field">
            <label>Tax Rate (%)</label>
            <input
              type="number"
              value={value.tax.rate}
              onChange={(event) =>
                updateTax("rate", Number(event.target.value))
              }
              disabled={disabled}
            />
          </div>

          <div className="input-field">
            <label>Tax Mode</label>
            <select
              value={value.tax.mode}
              onChange={(event) => updateTax("mode", event.target.value)}
              disabled={disabled}
            >
              <option value="included">Included</option>
              <option value="excluded">Excluded</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-block">
        <div className="inline-row">
          <h4>Additional Charges</h4>
          <button
            type="button"
            className="secondary-button"
            onClick={addCharge}
            disabled={disabled}
          >
            Add Charge
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Value</th>
                <th>Enabled</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {value.charges.map((charge) => (
                <tr key={charge.id}>
                  <td>
                    <input
                      value={charge.name}
                      onChange={(event) =>
                        updateCharge(charge.id, "name", event.target.value)
                      }
                      disabled={disabled}
                    />
                  </td>
                  <td>
                    <select
                      value={charge.type}
                      onChange={(event) =>
                        updateCharge(charge.id, "type", event.target.value)
                      }
                      disabled={disabled}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={charge.value}
                      onChange={(event) =>
                        updateCharge(
                          charge.id,
                          "value",
                          Number(event.target.value),
                        )
                      }
                      disabled={disabled}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className={charge.enabled ? "switch active" : "switch"}
                      onClick={() =>
                        updateCharge(charge.id, "enabled", !charge.enabled)
                      }
                      disabled={disabled}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => removeCharge(charge.id)}
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
    </div>
  );
}
