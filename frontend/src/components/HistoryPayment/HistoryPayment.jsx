import "./HistoryPayment.css";

import { BsCash } from "react-icons/bs";
import { IoCardOutline, IoQrCodeOutline } from "react-icons/io5";
import { FaEye } from "react-icons/fa";

import { useSettings } from "../../context/SettingsContext";
import { useTranslation } from "../../hooks/useTranslation";

export default function HistoryPayment({
  data,
  showAction = false,
  onDetail,
  scroll = true,
}) {
  const { formatCurrency, mapPaymentNameForTransaction } = useSettings();
  const { t } = useTranslation();

  // Gunakan data dari backend
  const rows = data ?? [];

  const formatTime = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="history-list">
      {/* ================= HEADER ================= */}
      <div
        className={`history-row history-head ${
          showAction ? "with-action" : ""
        }`}
      >
        <span>{t("historyPayment.transactionId")}</span>
        <span>{t("historyPayment.time")}</span>
        <span>{t("historyPayment.cashier")}</span>
        <span>{t("historyPayment.paymentMethod")}</span>
        <span>{t("historyPayment.total")}</span>
        <span>{t("historyPayment.status")}</span>

        {showAction && <span>{t("historyPayment.action")}</span>}
      </div>

      {/* ================= BODY ================= */}
      <div
        className={`history-body ${
          scroll ? "dashboard-scroll" : "sales-scroll"
        }`}
      >
        {rows.map((trx) => {
          const cashierName = trx.user?.name || "-";

          const paymentName = mapPaymentNameForTransaction(trx.payment_method);

          const transactionTime = formatTime(trx.transaction_date);

          const total = Number(trx.grand_total ?? 0);

          return (
            <div
              className={`history-row ${showAction ? "with-action" : ""}`}
              key={trx.id}
            >
              {/* Transaction ID */}
              <span>{trx.invoice_number || "-"}</span>

              {/* Time */}
              <span>{transactionTime}</span>

              {/* Cashier */}
              <span>{cashierName}</span>

              {/* Payment Method */}
              <span>
                {paymentName === "QRIS" && <IoQrCodeOutline />}

                {paymentName.includes("Card") && <IoCardOutline />}

                {paymentName === "Cash" && <BsCash />}

                {paymentName}
              </span>

              {/* Total */}
              <span>{formatCurrency(total)}</span>

              {/* Status */}
              <span
                className={`status ${String(trx.status || "").toLowerCase()}`}
              >
                {trx.status || "-"}
              </span>

              {/* Action */}
              {showAction && (
                <span>
                  <button className="eye-btn" onClick={() => onDetail?.(trx)}>
                    <FaEye />
                  </button>
                </span>
              )}
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="history-empty">Tidak ada transaksi.</div>
        )}
      </div>
    </div>
  );
}
