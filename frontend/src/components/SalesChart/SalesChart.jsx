import "./SalesChart.css";

import { useMemo, useState } from "react";

import { formatrupiah } from "../../utils/formatrupiah";

import { useTranslation } from "../../hooks/useTranslation";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function SalesChart({ data = [] }) {
  const [periode, setPeriode] = useState("harian");
  const [metode, setMetode] = useState("total");

  const { t } = useTranslation();

  /*
   * Data dari backend:
   *
   * [
   *   {
   *     date: "2026-08-01",
   *     revenue: 143000,
   *     orders: 2
   *   }
   * ]
   */

  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: item.date,
      revenue: Number(item.revenue) || 0,
      orders: Number(item.orders) || 0,
    }));
  }, [data]);

  /*
   * Karena backend saat ini mengirim sales_trend harian,
   * kita gunakan revenue sebagai nilai chart.
   */
  const maxValue = Math.max(...chartData.map((item) => item.revenue), 0);

  return (
    <div className="card chart">
      <div className="chart-header">
        <div>
          <h3>{t("salesChart.title")}</h3>
        </div>

        <div className="chart-filter">
          <select value={metode} onChange={(e) => setMetode(e.target.value)}>
            <option value="total">{t("salesChart.paymentMethod")}</option>
          </select>
        </div>
      </div>

      <div className="period-filter">
        <div className={`indicator ${periode}`}></div>

        <button
          className={periode === "harian" ? "active" : ""}
          onClick={() => setPeriode("harian")}
        >
          {t("salesChart.day")}
        </button>

        <button
          className={periode === "mingguan" ? "active" : ""}
          onClick={() => setPeriode("mingguan")}
        >
          {t("salesChart.week")}
        </button>

        <button
          className={periode === "bulanan" ? "active" : ""}
          onClick={() => setPeriode("bulanan")}
        >
          {t("salesChart.month")}
        </button>
      </div>

      <div className="chart-body">
        <div className="chart-content">
          <div className="chart-graph">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 50,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid vertical={false} stroke="#E5E7EB" />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, dy: 10 }}
                  padding={{ left: 0, right: 0 }}
                  tickFormatter={(date) => {
                    const [year, month, day] = date.split("-");

                    const months = [
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ];

                    return `${parseInt(day)} ${months[parseInt(month) - 1]}`;
                  }}
                />

                <YAxis
                  domain={[0, maxValue > 0 ? maxValue * 1.1 : 100000]}
                  tickFormatter={formatrupiah}
                  axisLine={false}
                  tickLine={false}
                  width={85}
                  tick={{ fontSize: 12, dx: 0 }}
                />

                <Tooltip
                  formatter={(value) => [formatrupiah(value), "Revenue"]}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8B5E3C"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
