import { menus } from "./Menu";

const menu = (id) => menus.find((item) => item.id === id);

export const historyPayment = [
  {
    id: 1,
    invoice_number: "INV-20260801-001",
    transaction_date: "1 Agustus 2026",
    transaction_time: "08:15",
    cashierId: "STF001",
    payment_method: "QRIS",
    status: "Completed",
    category: "Coffee",
    tax: 10,
    items: [
      {
        ...menu(1),
        qty: 2,
      },
      {
        ...menu(2),
        qty: 1,
      },
    ],
  },

  {
    id: 2,
    invoice_number: "INV-20260801-002",
    transaction_date: "1 Agustus 2026",
    transaction_time: "08:32",
    cashierId: "STF002",
    payment_method: "Cash",
    status: "Completed",
    category: "Pastry",
    tax: 10,
    items: [
      {
        ...menu(3),
        qty: 2,
      },
    ],
  },

  {
    id: 3,
    invoice_number: "INV-20260801-003",
    transaction_date: "1 Agustus 2026",
    transaction_time: "09:10",
    cashierId: "STF002",
    payment_method: "Debit",
    status: "Completed",
    category: "Food",
    tax: 10,
    items: [
      {
        ...menu(4),
        qty: 2,
      },
      {
        ...menu(5),
        qty: 1,
      },
    ],
  },

  {
    id: 4,
    invoice_number: "INV-20260801-004",
    transaction_date: "1 Agustus 2026",
    transaction_time: "09:48",
    cashierId: "STF001",
    payment_method: "QRIS",
    status: "Completed",
    category: "Coffee",
    tax: 10,
    items: [
      {
        ...menu(6),
        qty: 1,
      },
      {
        ...menu(7),
        qty: 1,
      },
    ],
  },

  {
    id: 5,
    invoice_number: "INV-20260801-005",
    transaction_date: "1 Agustus 2026",
    transaction_time: "10:25",
    cashierId: "STF002",
    payment_method: "Cash",
    status: "Completed",
    category: "Tea",
    tax: 10,
    items: [
      {
        ...menu(8),
        qty: 2,
      },
      {
        ...menu(9),
        qty: 1,
      },
    ],
  },

  {
    id: 6,
    invoice_number: "INV-20260801-006",
    transaction_date: "1 Agustus 2026",
    transaction_time: "11:03",
    cashierId: "STF002",
    payment_method: "QRIS",
    status: "Completed",
    category: "Coffee",
    tax: 10,
    items: [
      {
        ...menu(10),
        qty: 3,
      },
      {
        ...menu(2),
        qty: 2,
      },
    ],
  },

  {
    id: 7,
    invoice_number: "INV-20260801-007",
    transaction_date: "1 Agustus 2026",
    transaction_time: "11:47",
    cashierId: "STF001",
    payment_method: "Debit",
    status: "Completed",
    category: "Non Coffee",
    tax: 10,
    items: [
      {
        ...menu(11),
        qty: 2,
      },
      {
        ...menu(12),
        qty: 1,
      },
    ],
  },

  {
    id: 8,
    invoice_number: "INV-20260801-008",
    transaction_date: "1 Agustus 2026",
    transaction_time: "12:20",
    cashierId: "STF002",
    payment_method: "Cash",
    status: "Completed",
    category: "Tea",
    tax: 10,
    items: [
      {
        ...menu(13),
        qty: 1,
      },
      {
        ...menu(14),
        qty: 1,
      },
    ],
  },

  {
    id: 9,
    invoice_number: "INV-20260801-009",
    transaction_date: "1 Agustus 2026",
    transaction_time: "12:29",
    cashierId: "STF002",
    payment_method: "Cash",
    status: "Completed",
    category: "Tea",
    tax: 10,
    items: [
      {
        ...menu(13),
        qty: 1,
      },
      {
        ...menu(14),
        qty: 1,
      },
    ],
  },
];
