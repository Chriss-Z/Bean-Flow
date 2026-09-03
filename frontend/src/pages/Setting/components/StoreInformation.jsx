function Field({ label, children }) {
  return (
    <div className="input-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export default function StoreInformation({ value, onChange, disabled }) {
  const setValue = (field, fieldValue) =>
    onChange({ ...value, [field]: fieldValue });

  const setReceipt = (field, fieldValue) =>
    onChange({
      ...value,
      receipt: {
        ...value.receipt,
        [field]: fieldValue,
      },
    });

  const onLogoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setValue("logo", String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="settings-section">
      <h3 className="section-title">Store Information</h3>

      <div className="card-block">
        <h4>Store Details</h4>
        <div className="section-grid">
          <Field label="Store Name">
            <input
              value={value.storeName}
              onChange={(event) => setValue("storeName", event.target.value)}
              disabled={disabled}
            />
          </Field>
          <Field label="Store ID">
            <input
              value={value.storeId}
              onChange={(event) => setValue("storeId", event.target.value)}
              disabled={disabled}
            />
          </Field>
          <Field label="Phone">
            <input
              value={value.phone}
              onChange={(event) => setValue("phone", event.target.value)}
              disabled={disabled}
            />
          </Field>
          <Field label="Email">
            <input
              value={value.email}
              onChange={(event) => setValue("email", event.target.value)}
              disabled={disabled}
            />
          </Field>
          <Field label="Website">
            <input
              value={value.website}
              onChange={(event) => setValue("website", event.target.value)}
              disabled={disabled}
            />
          </Field>
        </div>
      </div>

      <div className="card-block">
        <h4>Address</h4>
        <div className="section-grid">
          <Field label="Address">
            <input
              value={value.address}
              onChange={(event) => setValue("address", event.target.value)}
              disabled={disabled}
            />
          </Field>
          <Field label="City">
            <input
              value={value.city}
              onChange={(event) => setValue("city", event.target.value)}
              disabled={disabled}
            />
          </Field>
          <Field label="Province">
            <input
              value={value.province}
              onChange={(event) => setValue("province", event.target.value)}
              disabled={disabled}
            />
          </Field>
          <Field label="Postal Code">
            <input
              value={value.postalCode}
              onChange={(event) => setValue("postalCode", event.target.value)}
              disabled={disabled}
            />
          </Field>
        </div>
      </div>

      <div className="card-block">
        <h4>Business</h4>
        <div className="section-grid">
          <Field label="Business Registration Number">
            <input
              value={value.businessRegistrationNumber}
              onChange={(event) =>
                setValue("businessRegistrationNumber", event.target.value)
              }
              disabled={disabled}
            />
          </Field>
          <Field label="NPWP">
            <input
              value={value.npwp}
              onChange={(event) => setValue("npwp", event.target.value)}
              disabled={disabled}
            />
          </Field>
          <Field label="Business Hours">
            <input
              value={value.businessHours}
              onChange={(event) =>
                setValue("businessHours", event.target.value)
              }
              disabled={disabled}
            />
          </Field>
          <Field label="Timezone">
            <input
              value={value.timezone}
              onChange={(event) => setValue("timezone", event.target.value)}
              disabled={disabled}
            />
          </Field>
        </div>
      </div>

      <div className="card-block">
        <h4>Store Logo</h4>
        <div className="inline-row">
          <input
            type="file"
            accept="image/*"
            onChange={onLogoUpload}
            disabled={disabled}
          />
          <div className="action-list">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setValue("logo", "")}
              disabled={disabled}
            >
              Remove Logo
            </button>
          </div>
        </div>
        {value.logo ? (
          <img
            src={value.logo}
            alt="Store Logo"
            style={{ width: "120px", borderRadius: "10px", marginTop: "12px" }}
          />
        ) : null}
      </div>

      <div className="card-block">
        <h4>Receipt</h4>
        <div className="section-grid">
          <Field label="Receipt Header">
            <input
              value={value.receipt.header}
              onChange={(event) => setReceipt("header", event.target.value)}
              disabled={disabled}
            />
          </Field>
          <Field label="Receipt Footer">
            <input
              value={value.receipt.footer}
              onChange={(event) => setReceipt("footer", event.target.value)}
              disabled={disabled}
            />
          </Field>
        </div>

        <div className="inline-row">
          <span>Show Logo</span>
          <button
            type="button"
            className={value.receipt.showLogo ? "switch active" : "switch"}
            onClick={() => setReceipt("showLogo", !value.receipt.showLogo)}
            disabled={disabled}
          />
        </div>
        <div className="inline-row">
          <span>Show Address</span>
          <button
            type="button"
            className={value.receipt.showAddress ? "switch active" : "switch"}
            onClick={() =>
              setReceipt("showAddress", !value.receipt.showAddress)
            }
            disabled={disabled}
          />
        </div>
        <div className="inline-row">
          <span>Show Phone</span>
          <button
            type="button"
            className={value.receipt.showPhone ? "switch active" : "switch"}
            onClick={() => setReceipt("showPhone", !value.receipt.showPhone)}
            disabled={disabled}
          />
        </div>
        <div className="inline-row">
          <span>Show Cashier Name</span>
          <button
            type="button"
            className={
              value.receipt.showCashierName ? "switch active" : "switch"
            }
            onClick={() =>
              setReceipt("showCashierName", !value.receipt.showCashierName)
            }
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
