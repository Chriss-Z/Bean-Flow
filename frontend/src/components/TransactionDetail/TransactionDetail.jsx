import "./TransactionDetail.css";
import { useSettings } from "../../context/SettingsContext";

import { CiCalendarDate } from "react-icons/ci";
import { IoPersonOutline } from "react-icons/io5";
import { BsCash } from "react-icons/bs";
import { IoCardOutline, IoQrCodeOutline } from "react-icons/io5";
import { MdPrint } from "react-icons/md";

export default function TransactionDetail({ transaction, onClose }) {
  const { settings, formatCurrency, formatDate, mapPaymentNameForTransaction } =
    useSettings();

  if (!transaction) {
    return (
      <div className="detail-empty">
        <h3>Transaction Detail</h3>
        <p>Pilih transaksi terlebih dahulu.</p>
      </div>
    );
  }

  const paymentMethodName = mapPaymentNameForTransaction(
    transaction.payment_method,
  );

  /*
   * ============================
   * CASHIER
   * ============================
   *
   * Backend:
   * transaction.user.name
   */
  const cashierName = transaction.user?.name || "-";

  /*
   * ============================
   * DATE & TIME
   * ============================
   *
   * Backend hanya memiliki:
   * transaction_date
   */
  const transactionDate = transaction.transaction_date
    ? new Date(transaction.transaction_date)
    : null;

  const transactionTime = transactionDate
    ? transactionDate.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  /*
   * ============================
   * ITEMS
   * ============================
   *
   * Backend:
   *
   * items[
   *   {
   *     quantity,
   *     price,
   *     product: {
   *       name,
   *       image
   *     }
   *   }
   * ]
   */
  const items = transaction.items || [];

  /*
   * ============================
   * SUMMARY
   * ============================
   *
   * Gunakan nilai dari database.
   */
  const subtotal = Number(transaction.subtotal || 0);

  const tax = Number(transaction.tax || 0);

  const grandTotal = Number(transaction.grand_total || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="transaction-detail receipt">
      {/* ================= HEADER ================= */}

      <div className="receipt-header">
        {settings.storeInformation.receipt.showLogo &&
        settings.storeInformation.logo ? (
          <img
            src={settings.storeInformation.logo}
            alt="Store Logo"
            style={{
              width: "70px",
              marginBottom: "8px",
            }}
          />
        ) : null}

        <h2>{settings.storeInformation.storeName || "BEAN & FLOW"}</h2>

        <p>{settings.storeInformation.receipt.header}</p>

        {settings.storeInformation.receipt.showAddress ? (
          <p>
            {`${settings.storeInformation.address}, ${settings.storeInformation.city}`}
          </p>
        ) : null}

        {settings.storeInformation.receipt.showPhone ? (
          <p>{settings.storeInformation.phone}</p>
        ) : null}

        <span>--------------------------</span>
      </div>

      {/* ================= DETAIL HEADER ================= */}

      <div className="detail-header">
        <h3>Transaction Detail</h3>

        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <h4 className="invoice-number">{transaction.invoice_number}</h4>

      {/* ================= INFO ================= */}

      <div className="detail-info">
        {/* DATE */}
        <div className="info-item">
          <CiCalendarDate size={22} />

          <div>
            <span>Date & Time</span>

            <p>
              {formatDate(transaction.transaction_date)}

              <br />

              {transactionTime}
            </p>
          </div>
        </div>

        {/* CASHIER */}
        <div className="info-item">
          <IoPersonOutline size={20} />

          <div>
            <span>Cashier</span>

            <p>{cashierName}</p>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="info-item">
          {paymentMethodName === "QRIS" && <IoQrCodeOutline size={20} />}

          {paymentMethodName.includes("Card") && <IoCardOutline size={20} />}

          {paymentMethodName === "Cash" && <BsCash size={20} />}

          <div>
            <span>Payment Method</span>

            <p>{paymentMethodName}</p>
          </div>
        </div>
      </div>

      <hr />

      {/* ================= ITEMS ================= */}

      <h4>Items</h4>

      <div className="detail-items">
        {items.length > 0 ? (
          items.map((item) => {
            const product = item.product;

            const productName = product?.name || "Unknown Product";

            const quantity = Number(item.quantity || 0);

            const price = Number(item.price || 0);

            const itemTotal = quantity * price;

            return (
              <div className="detail-item" key={item.id}>
                {product?.image ? (
                  <img
                    className="receipt-image"
                    src={product.image}
                    alt={productName}
                  />
                ) : null}

                <div className="item-name">
                  <strong>{productName}</strong>

                  <span>x{quantity}</span>
                </div>

                <strong>{formatCurrency(itemTotal)}</strong>
              </div>
            );
          })
        ) : (
          <p>Tidak ada item transaksi.</p>
        )}
      </div>

      <hr />

      {/* ================= SUMMARY ================= */}

      <div className="summary">
        {/* SUBTOTAL */}
        <div>
          <span>Subtotal</span>

          <strong>{formatCurrency(subtotal)}</strong>
        </div>

        {/* TAX */}
        <div>
          <span>
            {settings.taxAndCharges.tax.name} ({settings.taxAndCharges.tax.rate}
            %)
          </span>

          <strong>{formatCurrency(tax)}</strong>
        </div>

        {/* TOTAL */}
        <div className="total">
          <span>Total</span>

          <strong>{formatCurrency(grandTotal)}</strong>
        </div>
      </div>

      {/* FOOTER */}

      <p
        style={{
          marginTop: "10px",
          color: "#6b7280",
          fontSize: "12px",
        }}
      >
        {settings.storeInformation.receipt.footer}
      </p>

      {/* PRINT */}

      <button className="print-btn" onClick={handlePrint}>
        <MdPrint />
        Print Receipt
      </button>
    </div>
  );
}
