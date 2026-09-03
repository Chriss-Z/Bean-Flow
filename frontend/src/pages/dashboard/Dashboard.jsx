import "./Dashboard.css";

import { useEffect, useState } from "react";

import { FaShoppingCart } from "react-icons/fa";
import { PiNoteDuotone } from "react-icons/pi";
import { IoPerson } from "react-icons/io5";
import { TbMoneybag } from "react-icons/tb";
import { CiSquareAlert } from "react-icons/ci";

import SalesChart from "../../components/SalesChart/SalesChart";
import PaymentChart from "../../components/PaymentChart/PaymentChart";
import HistoryPayment from "../../components/HistoryPayment/HistoryPayment";
import Stock from "../../components/Stock/Stock";

import { useSettings } from "../../context/SettingsContext";
import { useTranslation } from "../../hooks/useTranslation";

import { getReport } from "../../services/reportApi";
import { getInventory } from "../../services/inventoryApi";
import { getTransactions } from "../../services/transactionService";

export default function Dashboard() {
  const { formatCurrency } = useSettings();
  const { t } = useTranslation();

  // ==============================
  // STATE
  // ==============================

  const [reportData, setReportData] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==============================
  // FETCH DASHBOARD DATA
  // ==============================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ==========================================
        // DATE RANGE: AWAL BULAN SAMPAI HARI INI
        // ==========================================

        const now = new Date();

        const start = new Date(now.getFullYear(), now.getMonth(), 1);

        const startDate = start.toISOString().split("T")[0];
        const endDate = now.toISOString().split("T")[0];

        console.log("REPORT DATE RANGE:", {
          startDate,
          endDate,
        });

        // ==========================================
        // FETCH REPORT + INVENTORY + TRANSACTIONS
        // ==========================================

        const [report, inventory, transactionsData] = await Promise.all([
          getReport(startDate, endDate),
          getInventory(),
          getTransactions(),
        ]);

        console.log("DASHBOARD REPORT:", report);
        console.log("DASHBOARD INVENTORY:", inventory);
        console.log("DASHBOARD TRANSACTIONS:", transactionsData);

        setReportData(report);
        setInventoryData(inventory);
        setTransactions(transactionsData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ==============================
  // REPORT SUMMARY
  // ==============================

  const summary = reportData?.summary ?? {};

  const transactionSummary = {
    total: Number(summary.total_revenue ?? 0),

    totalTransactions: Number(summary.total_orders ?? 0),

    avg: Number(summary.average_transaction ?? 0),

    itemSold: Number(summary.total_items_sold ?? 0),
  };

  // ==============================
  // INVENTORY DATA
  // ==============================

  const stockData = inventoryData.map((item) => {
    const stock = Number(item.stock ?? 0);
    const minimum = Number(item.minimum_stock ?? 0);

    let status = "In Stock";

    if (stock <= 0) {
      status = "Out of Stock";
    } else if (stock <= minimum) {
      status = "Low Stock";
    }

    return {
      id: item.id,
      name: item.name,
      stock,
      minimum,
      unit: item.unit,
      status,
      image: item.image,
    };
  });

  return (
    <div className="dashboard">
      <div className="greeting">
        <h2>
          {t("dashboard.title")} <span className="wave">👋</span>
        </h2>
        <p>{t("dashboard.welcome")}, Christian</p>
      </div>
      <div className="stats">
        <div className="card small">
          <div className="card-header">
            <div className="icon">
              <FaShoppingCart />
            </div>

            <span>{t("dashboard.totalSalesToday")}</span>
          </div>
          <h2>{formatCurrency(transactionSummary.total)}</h2>
          <p className="growth">
            <span>↑ 12,5%</span> {t("dashboard.fromYesterday")}
          </p>
        </div>
        <div className="card small">
          <div className="card-header">
            <div className="icon icon-hijau">
              <PiNoteDuotone />
            </div>

            <span>{t("dashboard.totalTransactions")}</span>
          </div>

          <h2>{transactionSummary.totalTransactions}</h2>
          <p className="growth">
            <span>↑ 8,3%</span> {t("dashboard.fromYesterday")}
          </p>
        </div>
        <div className="card small">
          <div className="card-header">
            <div className="icon icon-kuning">
              <IoPerson />
            </div>

            <span>{t("dashboard.averageTransaction")}</span>
          </div>

          <h2>{formatCurrency(transactionSummary.avg)}</h2>
          <p className="growth">
            <span>↑ 4,7%</span> {t("dashboard.fromYesterday")}
          </p>
        </div>
        <div className="card small">
          <div className="card-header">
            <div className="icon icon-ungu">
              <TbMoneybag />
            </div>

            <span>{t("dashboard.totalItemsSold")}</span>
          </div>

          <h2>{transactionSummary.itemSold}</h2>
          <p className="growth">
            <span>↑ 12,5%</span> {t("dashboard.fromYesterday")}
          </p>
        </div>
      </div>

      <div className="row">
        <div>
          <SalesChart data={reportData?.sales_trend ?? []} />
        </div>

        {/* Payment Card */}
        <div>
          <PaymentChart data={reportData?.payment_methods ?? []} />
        </div>
      </div>

      <div className="row">
        <div className="card activity">
          <div className="activity-header">
            <h3>{t("dashboard.transactionHistory")}</h3>
          </div>
          <div>
            <HistoryPayment data={transactions} />
          </div>
        </div>
        <div className="card inventory">
          <div className="inventory-header">
            <h3>{t("dashboard.inventoryStock")}</h3>
            <div className="alert-icon">
              <CiSquareAlert />
            </div>
          </div>
          <div>
            <Stock data={stockData} />
          </div>
        </div>
      </div>
    </div>
  );
}
