import { useState, useMemo, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { MdOutlineSearch } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import "./Sales.css";

import HistoryPayment from "../../components/HistoryPayment/HistoryPayment";
import TransactionDetail from "../../components/TransactionDetail/TransactionDetail";
import { useSettings } from "../../context/SettingsContext";
import { useTranslation } from "../../hooks/useTranslation";
import { getTransactions } from "../../services/transactionService";

export default function Sales() {
  const {
    appData,
    activePaymentMethods,
    addActivityLog,
    mapPaymentNameForTransaction,
  } = useSettings();

  const [openDetail, setOpenDetail] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("Today");
  const [cashier, setCashier] = useState("All Cashier");
  const [payment, setPayment] = useState("All Payment");
  const [status, setStatus] = useState("All Status");
  const [category, setCategory] = useState("All Menu Category");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);

        const data = await getTransactions();
        console.log(
          "PRODUCTS:",
          data.flatMap((trx) => (trx.items || []).map((item) => item.product)),
        );

        setTransactions(data);
      } catch (error) {
        console.error("Transaction API Error:", error);
        setError("Gagal mengambil data transaksi.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);
  const { t } = useTranslation();
  const cashiers = useMemo(() => {
    const names = transactions.map((item) => item.user?.name).filter(Boolean);

    return [...new Set(names)];
  }, [transactions]);
  const payments = useMemo(
    () => activePaymentMethods.map((method) => method.name),
    [activePaymentMethods],
  );

  const statuses = useMemo(
    () => [...new Set(transactions.map((item) => item.status))],
    [transactions],
  );

  const categories = useMemo(() => {
    const allCategories = transactions.flatMap((transaction) =>
      (transaction.items || [])
        .map((item) => item.product?.category?.name)
        .filter(Boolean),
    );

    return [...new Set(allCategories)];
  }, [transactions]);

  /* ================= FILTER ================= */
  const filteredHistory = useMemo(() => {
    return transactions.filter((trx) => {
      const cashierName = trx.user?.name;

      const matchSearch =
        trx.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        (cashierName || "").toLowerCase().includes(search.toLowerCase());

      const matchCashier = cashier === "All Cashier" || cashierName === cashier;

      const paymentName = mapPaymentNameForTransaction(trx.payment_method);

      const matchPayment = payment === "All Payment" || paymentName === payment;

      const matchStatus = status === "All Status" || trx.status === status;

      // Belum digunakan sampai category dari API tersedia
      const matchCategory = true;

      // Belum digunakan
      const matchDate = true;

      return (
        matchSearch &&
        matchCashier &&
        matchPayment &&
        matchStatus &&
        matchCategory &&
        matchDate
      );
    });
  }, [
    search,
    dateFilter,
    cashier,
    payment,
    status,
    transactions,
    mapPaymentNameForTransaction,
  ]);

  /* ================= RESET ================= */

  const handleReset = () => {
    setSearch("");
    setDateFilter("Today");
    setCashier("All Cashier");
    setPayment("All Payment");
    setStatus("All Status");
    setCategory("All Menu Category");
  };

  return (
    <div className="sales">
      <div className="greeting">
        <h2>
          Sales <span className="wave">👋</span>
        </h2>
        <p>Kelola seluruh transaksi Bean & Flow.</p>
      </div>

      <div className="sales-row">
        <div className="sales-left">
          <div className="filter-card card">
            <div className="filter-search">
              <div className="search-icon">
                <MdOutlineSearch />
              </div>

              <input
                type="text"
                placeholder="Search transaction..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-row">
              <div className="filter-select">
                <CiCalendarDate className="filter-icon" />

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option>{t("sales.today")}</option>
                  <option>{t("sales.yesterday")}</option>
                  <option>{t("sales.thisWeek")}</option>
                  <option>{t("sales.thisMonth")}</option>
                </select>
              </div>

              <div className="filter-select">
                <select
                  value={cashier}
                  onChange={(e) => setCashier(e.target.value)}
                >
                  <option>{t("sales.allCashier")}</option>

                  {cashiers.map((item, index) => (
                    <option key={`cashier-${item}-${index}`} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-select">
                <select
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                >
                  <option>{t("sales.allPayment")}</option>

                  {payments.map((item, index) => (
                    <option key={`payment-${item}-${index}`} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-select">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>{t("sales.allStatus")}</option>

                  {statuses.map((item, index) => (
                    <option key={`status-${item}-${index}`} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-select">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>{t("sales.allMenuCategory")}</option>

                  {categories.map((item, index) => (
                    <option key={`category-${item}-${index}`} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <button className="reset-btn" onClick={handleReset}>
                {t("sales.reset")}
              </button>
            </div>
          </div>

          <div className="transaction-card card">
            <div className="transaction-content">
              {loading ? (
                <div className="transaction-loading">
                  Loading transactions...
                </div>
              ) : error ? (
                <div className="transaction-error">{error}</div>
              ) : (
                <HistoryPayment
                  data={filteredHistory}
                  showAction={true}
                  scroll={false}
                  onDetail={(trx) => {
                    setSelectedTransaction(trx);
                    setOpenDetail(true);

                    addActivityLog({
                      action: "VIEW",
                      module: "Sales",
                      description: `Opened transaction ${trx.invoice_number}`,
                      status: "Success",
                    });
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <aside className={`detail-card card ${openDetail ? "open" : ""}`}>
          <TransactionDetail
            transaction={selectedTransaction}
            onClose={() => {
              setOpenDetail(false);
              setSelectedTransaction(null);
            }}
          />
        </aside>
      </div>
    </div>
  );
}
