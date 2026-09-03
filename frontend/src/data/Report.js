import { historyPayment } from "./HistoryPayment";
import { staffData } from "./Staff";
import { StockData } from "./StockData";


// ===============================
// Revenue
// ===============================

const getTransactionTotal = (trx) => {
  const subtotal = trx.items.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  return subtotal + subtotal * (trx.tax / 100);
};


// ===============================
// Total Revenue
// ===============================

export const totalRevenue = historyPayment.reduce(
  (total, trx) => total + getTransactionTotal(trx),
  0
);


// ===============================
// Payment Summary
// ===============================

export const paymentSummary = historyPayment.reduce(
  (result, trx) => {
    const total = getTransactionTotal(trx);

    switch (trx.payment_method) {
      case "QRIS":
        result.qris += total;
        break;

      case "Cash":
        result.cash += total;
        break;

      case "Debit":
        result.debit += total;
        break;

      default:
        break;
    }

    return result;
  },
  {
    qris: 0,
    cash: 0,
    debit: 0,
  }
);


// ===============================
// Top Cashier
// ===============================

export const topCashier = staffData
  .map((staff) => {
    const transactions = historyPayment.filter(
      (trx) => trx.cashierId === staff.id
    );

    const revenue = transactions.reduce(
      (sum, trx) => sum + getTransactionTotal(trx),
      0
    );

    return {
      ...staff,
      revenue,
      transaction: transactions.length,
    };
  })
  .sort((a, b) => b.revenue - a.revenue);


// ===============================
// Best Selling Product
// ===============================

const productMap = {};

historyPayment.forEach((trx) => {
  trx.items.forEach((item) => {
    if (!productMap[item.id]) {
      productMap[item.id] = {
        ...item,
        sold: 0,
        revenue: 0,
      };
    }

    productMap[item.id].sold += item.qty;
    productMap[item.id].revenue += item.qty * item.price;
  });
});

export const bestSellingProduct = Object.values(productMap).sort(
  (a, b) => b.sold - a.sold
);


// ===============================
// Inventory Value
// ===============================

export const inventoryValue = StockData.reduce(
  (total, item) => total + item.value,
  0
);


// ===============================
// Sales Summary
// ===============================

const cogs = totalRevenue * 0.4;
const expenses = totalRevenue * 0.15;
const grossProfit = totalRevenue - cogs;
const netProfit = grossProfit - expenses;

export const salesSummary = {
  revenue: totalRevenue,
  cogs,
  grossProfit,
  expenses,
  netProfit,
};