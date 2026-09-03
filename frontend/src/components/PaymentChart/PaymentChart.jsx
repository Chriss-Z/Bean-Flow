import "./PaymentChart.css";

import { useMemo, useState } from "react";

import { useSettings } from "../../context/SettingsContext";
import { useTranslation } from "../../hooks/useTranslation";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function PaymentChart({ data = [] }) {
  const { t } = useTranslation();
  const { formatCurrency } = useSettings();

  const [periode, setPeriode] = useState("harian");

  const COLORS = ["#A3A3A3", "#22C55E", "#3B82F6"];
  const paymentData = useMemo(() => {
    return data.map((item) => ({
      name: item.method,
      value: Number(item.total) || 0,
      percentage: Number(item.percentage) || 0,
    }));
  }, [data]);

  const totalPayment = useMemo(() => {
    return paymentData.reduce((sum, item) => sum + item.value, 0);
  }, [paymentData]);

  const paymentSummary = useMemo(() => {
    return paymentData.map((item) => ({
      ...item,
      percent:
        totalPayment > 0
          ? ((item.value / totalPayment) * 100).toFixed(1)
          : "0.0",
    }));
  }, [paymentData, totalPayment]);

  return (
    <div className="card payment">
      <div className="payment-header">
        <h3>{t("paymentChart.title")}</h3>

        <div className="chart-filter">
          <select value={periode} onChange={(e) => setPeriode(e.target.value)}>
            <option value="harian">{t("paymentChart.today")}</option>

            <option value="mingguan">{t("paymentChart.weekly")}</option>

            <option value="bulanan">{t("paymentChart.monthly")}</option>
          </select>
        </div>
      </div>

      <div className="payment-content">
        {/* PIE CHART */}
        <div className="pie-container">
          <ResponsiveContainer>
            <PieChart>
              {paymentData.length > 0 ? (
                <Pie
                  data={paymentData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {paymentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              ) : (
                <Pie
                  data={[{ value: 1 }]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={0}
                  isAnimationActive={false}
                >
                  <Cell fill="#E5E7EB" />
                </Pie>
              )}

              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  name,
                ]}
                contentStyle={{
                  background: "#6F4E37",
                  border: "none",
                  borderRadius: "10px",
                  color: "#fff",
                }}
                labelStyle={{
                  display: "none",
                }}
                itemStyle={{
                  color: "#fff",
                  fontWeight: 600,
                }}
              />

              {/* TOTAL */}
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="pie-total"
              >
                {t("paymentChart.total")}
              </text>

              {/* VALUE */}
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="pie-value"
              >
                {formatCurrency(totalPayment)}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* PAYMENT DETAIL */}
        <div className="payment-detail">
          {paymentSummary.map((item, index) => (
            <div className="payment-item" key={index}>
              <div>
                <div className="payment-title">
                  <span
                    className={`payment-dot ${
                      item.name === "Cash"
                        ? "tunai"
                        : item.name === "QRIS"
                          ? "qris"
                          : item.name === "Debit Card"
                            ? "debit"
                            : ""
                    }`}
                  ></span>

                  <span className="payment-item-name">{item.name}</span>
                </div>

                <p className="payment-item-total">
                  {formatCurrency(item.value)}
                </p>
              </div>

              <span className="payment-item-percent">{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
