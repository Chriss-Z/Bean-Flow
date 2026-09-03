import "./Report.css";

import { useState, useEffect } from "react";

import { DateRange } from "react-date-range";

import { format, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { HiOutlineCurrencyDollar } from "react-icons/hi2";
import { TbMoneybag } from "react-icons/tb";
import { CgFileDocument } from "react-icons/cg";
import { FaChartLine } from "react-icons/fa6";
import { FaShoppingBag } from "react-icons/fa";
import { MdAttachMoney } from "react-icons/md";
import { BsBoxSeamFill } from "react-icons/bs";
import { PiShovelFill } from "react-icons/pi";

import { FaTrophy } from "react-icons/fa";
import { FaMedal } from "react-icons/fa6";

import SalesChart from "../../components/SalesChart/SalesChart";
import PaymentChart from "../../components/PaymentChart/PaymentChart";

import { getReport } from "../../services/reportApi";

import { useSettings } from "../../context/SettingsContext";
import { useTranslation } from "../../hooks/useTranslation";
const API_URL = "http://127.0.0.1:8001";

const getPhotoUrl = (photo) => {
  if (!photo) return null;

  // Kalau sudah URL lengkap
  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }

  // Kalau path dari Laravel Storage
  return `${API_URL}/storage/${photo.replace(/^\/+/, "")}`;
};
const Report = () => {
  const { appData, formatCurrency, formatDate, getTransactionTotals } =
    useSettings();

  const [showCalendar, setShowCalendar] = useState(false);

  const now = new Date();
  const [range, setRange] = useState([
    {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      key: "selection",
    },
  ]);
  const { t } = useTranslation();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      const startDate = range[0].startDate;
      const endDate = range[0].endDate;

      const days = differenceInDays(endDate, startDate) + 1;

      if (days < 7) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const start = format(startDate, "yyyy-MM-dd");
        const end = format(endDate, "yyyy-MM-dd");

        console.log("REPORT DATE:", start, end);

        const data = await getReport(start, end);

        console.log("REPORT API RESPONSE:", data);

        setReportData(data);
      } catch (err) {
        console.error("Failed to fetch report:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [range]);

  const summary = reportData?.summary ?? {};

  const topCashiers = reportData?.top_cashiers ?? [];

  const bestSellingProducts = reportData?.best_selling_products ?? [];
  console.log("TOP CASHIERS:", topCashiers);
  console.log("BEST SELLING:", bestSellingProducts);

  const salesTrend = reportData?.sales_trend ?? [];

  const paymentMethods = reportData?.payment_methods ?? [];
  return (
    <div className="report">
      {/* Greeting */}
      <div className="report-header">
        <div className="greeting">
          <h2>
            {t("report.title")} <span className="wave">👋</span>
          </h2>

          <p>{t("report.greeting")}</p>
        </div>

        <div className="report-actions">
          <div className="report-date-picker">
            <button
              className={`report-date-btn ${showCalendar ? "is-open" : ""}`}
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <span className="date-calendar-icon">▣</span>

              <span>
                {format(range[0].startDate, "dd MMM", { locale: id })}
              </span>

              <span className="date-separator">→</span>

              <span>{format(range[0].endDate, "dd MMM", { locale: id })}</span>
            </button>

            {showCalendar && (
              <div className="calendar-popup">
                {/* SUMMARY */}
                <div className="calendar-summary">
                  <div className="calendar-summary-dates">
                    <span>
                      {format(range[0].startDate, "dd MMM", { locale: id })}
                    </span>

                    <span className="calendar-to">→</span>

                    <span>
                      {format(range[0].endDate, "dd MMM", { locale: id })}
                    </span>
                  </div>

                  <div
                    className={`calendar-summary-badge ${
                      Math.ceil(
                        (range[0].endDate - range[0].startDate) /
                          (1000 * 60 * 60 * 24),
                      ) +
                        1 <
                      7
                        ? "is-invalid"
                        : ""
                    }`}
                  >
                    {Math.ceil(
                      (range[0].endDate - range[0].startDate) /
                        (1000 * 60 * 60 * 24),
                    ) + 1}{" "}
                    hari
                  </div>
                </div>

                {/* PRESETS */}
                <div className="calendar-presets">
                  <div className="calendar-presets-title">Pilih Periode</div>

                  <button
                    onClick={() => {
                      const end = new Date();
                      const start = new Date();
                      start.setDate(end.getDate() - 6);

                      setRange([
                        {
                          startDate: start,
                          endDate: end,
                          key: "selection",
                        },
                      ]);

                      setShowCalendar(false);
                    }}
                  >
                    <strong>7 Hari</strong>
                    <span>Performa 7 hari terakhir</span>
                  </button>

                  <button
                    onClick={() => {
                      const end = new Date();
                      const start = new Date();
                      start.setDate(end.getDate() - 29);

                      setRange([
                        {
                          startDate: start,
                          endDate: end,
                          key: "selection",
                        },
                      ]);

                      setShowCalendar(false);
                    }}
                  >
                    <strong>30 Hari</strong>
                    <span>Performa 30 hari terakhir</span>
                  </button>

                  <button
                    onClick={() => {
                      const start = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        1,
                      );

                      const end = new Date(
                        now.getFullYear(),
                        now.getMonth() + 1,
                        0,
                      );

                      setRange([
                        {
                          startDate: start,
                          endDate: end,
                          key: "selection",
                        },
                      ]);

                      setShowCalendar(false);
                    }}
                  >
                    <strong>Bulan Ini</strong>
                    <span>Performa bulan berjalan</span>
                  </button>
                </div>

                {/* CUSTOM DATE */}
                <div className="calendar-custom">
                  <div className="calendar-custom-title">
                    Pilih tanggal sendiri
                  </div>

                  <DateRange
                    editableDateInputs
                    moveRangeOnFirstSelection={false}
                    ranges={range}
                    onChange={(item) => {
                      const start = item.selection.startDate;
                      const end = item.selection.endDate;

                      const diff =
                        Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

                      if (diff < 7) {
                        setRange([item.selection]);
                        return;
                      }

                      setRange([item.selection]);
                      setShowCalendar(false);
                    }}
                  />
                </div>

                {/* INFO */}
                <div
                  className={`calendar-info ${
                    Math.ceil(
                      (range[0].endDate - range[0].startDate) /
                        (1000 * 60 * 60 * 24),
                    ) +
                      1 <
                    7
                      ? "is-invalid"
                      : ""
                  }`}
                >
                  <span>ⓘ</span>

                  <span>
                    {Math.ceil(
                      (range[0].endDate - range[0].startDate) /
                        (1000 * 60 * 60 * 24),
                    ) +
                      1 <
                    7
                      ? "Pilih minimal 7 hari"
                      : "Periode laporan minimal 7 hari"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button className="btn-export pdf">{t("report.exportPdf")}</button>

          <button className="btn-export excel">
            {t("report.exportExcel")}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="report-stats">
        <div className="report-card">
          <div className="report-card-header">
            <div className="report-card-icon">
              <div className="report-card-icon revenue-icon">
                <TbMoneybag />
              </div>
            </div>

            <div className="report-card-content">
              <span className="report-card-title">
                {t("report.totalRevenue")}
              </span>

              <h2 className="report-card-value">
                {formatCurrency(summary.total_revenue)}
              </h2>

              <div className="report-card-footer">
                <span className="report-card-growth positive">▲ 18.6%</span>
                <span className="report-card-text">vs Jun 2026</span>
              </div>
            </div>
          </div>
        </div>
        <div className="report-card">
          <div className="report-card-header">
            <div className="report-card-icon">
              <div className="report-card-icon transaction-icon">
                <CgFileDocument />
              </div>
            </div>

            <div className="report-card-content">
              <span className="report-card-title">
                {t("report.totalOrders")}
              </span>

              <h2 className="report-card-value">{summary.total_orders || 0}</h2>

              <div className="report-card-footer">
                <span className="report-card-growth positive">▲ 12.4%</span>
                <span className="report-card-text">vs Jun 2026</span>
              </div>
            </div>
          </div>
        </div>
        <div className="report-card">
          <div className="report-card-header">
            <div className="report-card-icon">
              <div className="report-card-icon profit-icon">
                <FaChartLine />
              </div>
            </div>

            <div className="report-card-content">
              <span className="report-card-title">{t("report.netProfit")}</span>

              <h2 className="report-card-value">
                {formatCurrency(summary.net_profit)}
              </h2>

              <div className="report-card-footer">
                <span className="report-card-growth positive">▲ 22.1%</span>
                <span className="report-card-text">vs Jun 2026</span>
              </div>
            </div>
          </div>
        </div>
        <div className="report-card">
          <div className="report-card-header">
            <div className="report-card-icon">
              <div className="report-card-icon order-icon">
                <FaShoppingBag />
              </div>
            </div>

            <div className="report-card-content">
              <span className="report-card-title">
                {t("report.averageTransaction")}
              </span>

              <h2 className="report-card-value">
                {formatCurrency(summary.average_transaction || 0)}
              </h2>

              <div className="report-card-footer">
                <span className="report-card-growth positive">▲ 5.7%</span>
                <span className="report-card-text">vs Jun 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trend */}
      <div className="report-grid-top">
        <div className="sales-trend-card">
          <div>
            <SalesChart data={salesTrend} />
          </div>
        </div>

        <div className="top-cashier-card">
          <div className="top-cashier-header">
            <h3>Top Cashier</h3>
          </div>

          <div className="top-cashier-table">
            {/* Header */}
            <div className="top-cashier-row top-cashier-table-header">
              <span>{t("report.rank")}</span>
              <span>{t("report.cashier")}</span>
              <span>{t("report.transactions")}</span>
              <span>{t("report.totalSale")}</span>
            </div>

            {/* Scrollable body */}
            <div className="top-cashier-table-body">
              {topCashiers.map((cashier, index) => {
                const rank = index + 1;
                const photoUrl = getPhotoUrl(cashier.photo);

                return (
                  <div
                    className="top-cashier-row"
                    key={cashier.id ?? `cashier-${index}`}
                  >
                    <div className="cashier-rank">
                      {rank === 1 ? (
                        <span className="rank-badge rank-1">
                          <FaTrophy />
                        </span>
                      ) : rank === 2 ? (
                        <span className="rank-badge rank-2">
                          <FaMedal />
                        </span>
                      ) : rank === 3 ? (
                        <span className="rank-badge rank-3">
                          <FaMedal />
                        </span>
                      ) : (
                        <span className={`rank-badge rank-${rank}`}>
                          {rank}
                        </span>
                      )}
                    </div>

                    <div className="cashier-info">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={cashier.name || "Staff"}
                          className="cashier-photo"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="cashier-photo cashier-photo-placeholder">
                          {cashier.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}

                      <span>{cashier.name}</span>
                    </div>

                    <span className="cashier-transactions">
                      {cashier.transactions}
                    </span>

                    <span className="cashier-total">
                      {formatCurrency(cashier.total_sale || 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Best Selling */}
      <div className="report-grid-middle">
        <div className="best-selling-card">
          <div className="best-selling-header">
            <h3>{t("report.bestSellingProduct")}</h3>
          </div>

          <div className="best-selling-table">
            {/* Table Header */}
            <div className="best-selling-row best-selling-table-header">
              <span>{t("report.rank")}</span>

              <span>{t("report.product")}</span>

              <span>{t("report.quantitySold")}</span>

              <span>{t("report.revenue")}</span>

              <span>{t("report.profit")}</span>
            </div>

            {/* Table Body */}
            <div className="best-selling-table-body">
              {bestSellingProducts.map((product, index) => {
                const rank = index + 1;

                return (
                  <div
                    className="best-selling-row"
                    key={product.id ?? `product-${index}`}
                  >
                    {/* Rank */}
                    <div className="best-selling-rank">
                      {rank === 1 ? (
                        <span className="best-selling-rank-badge rank-1">
                          <FaTrophy />
                        </span>
                      ) : rank === 2 ? (
                        <span className="best-selling-rank-badge rank-2">
                          <FaMedal />
                        </span>
                      ) : rank === 3 ? (
                        <span className="best-selling-rank-badge rank-3">
                          <FaMedal />
                        </span>
                      ) : (
                        <span className="best-selling-rank-badge rank-normal">
                          {rank}
                        </span>
                      )}
                    </div>

                    {/* Product */}
                    <div className="best-selling-product">
                      {getPhotoUrl(product.image) ? (
                        <img
                          src={getPhotoUrl(product.image)}
                          alt={product.name || "Product"}
                          className="best-selling-product-image"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="best-selling-product-placeholder">
                          {product.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}

                      <span>{product.name}</span>
                    </div>

                    {/* Quantity Sold */}
                    <span className="best-selling-quantity">
                      {product.quantity_sold}
                    </span>

                    {/* Revenue */}
                    <span className="best-selling-revenue">
                      {formatCurrency(product.revenue)}
                    </span>

                    {/* Profit */}
                    <div className="best-selling-profit">
                      <span>{formatCurrency(product.profit)}</span>

                      <span className="profit-growth positive">▲ 18.5%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="payment-method-card">
          <div>
            <PaymentChart data={paymentMethods} />
          </div>
        </div>
      </div>
      <div className="rp-summary-card">
        {/* Revenue */}
        <div className="rp-summary-item">
          <div className="rp-summary-icon rp-icon-revenue">
            <MdAttachMoney />
          </div>
          <div className="rp-summary-content">
            <span className="rp-summary-title">{t("report.totalRevenue")}</span>
            <span className="rp-summary-value">
              {formatCurrency(summary.total_revenue || 0)}
            </span>
            <div className="rp-summary-growth">
              <span className="rp-positive">▲ 18.6%</span>
              <span className="rp-summary-period">vs Jun 2026</span>
            </div>
          </div>
        </div>

        {/* COGS */}
        <div className="rp-summary-item">
          <div className="rp-summary-icon rp-icon-cogs">
            <BsBoxSeamFill />
          </div>
          <div className="rp-summary-content">
            <span className="rp-summary-title">{t("report.cogs")}</span>
            <span className="rp-summary-value">
              {formatCurrency(summary.cogs)}
            </span>
            <div className="rp-summary-growth">
              <span className="rp-negative">▼ 8.2%</span>
              <span className="rp-summary-period">vs Jun 2026</span>
            </div>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="rp-summary-item">
          <div className="rp-summary-icon rp-icon-gross">
            <PiShovelFill />
          </div>
          <div className="rp-summary-content">
            <span className="rp-summary-title">{t("report.grossProfit")}</span>
            <span className="rp-summary-value">
              {formatCurrency(summary.gross_profit)}
            </span>
            <div className="rp-summary-growth">
              <span className="rp-positive">▲ 14.5%</span>
              <span className="rp-summary-period">vs Jun 2026</span>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="rp-summary-item">
          <div className="rp-summary-icon rp-icon-expenses">
            <CgFileDocument />
          </div>
          <div className="rp-summary-content">
            <span className="rp-summary-title">{t("report.expenses")}</span>
            <span className="rp-summary-value">
              {formatCurrency(summary.expenses)}
            </span>
            <div className="rp-summary-growth">
              <span className="rp-negative">▼ 5.3%</span>
              <span className="rp-summary-period">vs Jun 2026</span>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="rp-summary-item rp-summary-item-last">
          <div className="rp-summary-icon rp-icon-net">
            <FaChartLine />
          </div>
          <div className="rp-summary-content">
            <span className="rp-summary-title">{t("report.netProfit")}</span>
            <span className="rp-summary-value">
              {formatCurrency(summary.net_profit)}
            </span>
            <div className="rp-summary-growth">
              <span className="rp-positive">▲ 22.1%</span>
              <span className="rp-summary-period">vs Jun 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
