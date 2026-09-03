import "./Stock.css";
import { StockData } from "../../data/StockData";
import { useSettings } from "../../context/SettingsContext";
import { useTranslation } from "../../hooks/useTranslation";

export default function Stock({ alertOnly = false, data: dataProp }) {
  const { appData } = useSettings();
  const stockRows = dataProp || appData.stockData || StockData;
  const { t } = useTranslation();
  const data = alertOnly
    ? stockRows.filter(
        (item) =>
          item.status === t("stock.lowStock") ||
          item.status === t("stock.outOfStock"),
      )
    : stockRows;

  return (
    <div className="inventory-list">
      {data.map((item) => (
        <div className="inventory-item" key={item.id}>
          <img src={item.image} alt={item.name} className="inventory-image" />

          <div className="inventory-info">
            <div className="inventory-name">{item.name}</div>

            <div className="inventory-stock">
              Stok: {item.stock} {item.unit}
            </div>
          </div>

          <div className="inventory-minimum">
            {t("stock.minimum")}: {item.minimum} {item.unit}
          </div>

          <div
            className={`inventory-status ${
              item.status === "Out of Stock" ? "critical" : "safe"
            }`}
          >
            {item.status === "Low Stock"
              ? t("stock.lowStock")
              : item.status === "Out of Stock"
                ? t("stock.outOfStock")
                : item.status}
          </div>
        </div>
      ))}
    </div>
  );
}
