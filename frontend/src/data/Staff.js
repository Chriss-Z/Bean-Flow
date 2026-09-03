import staff1 from "../assets/staff/staff1.png";
import staff2 from "../assets/staff/staff2.jpg";
import staff3 from "../assets/staff/staff3.jpg";
import staff4 from "../assets/staff/staff4.jpg";
import staff5 from "../assets/staff/staff5.jpg";

export const staffData = [
  {
    id: "STF001",
    photo: staff1,
    fullName: "John Michael Carter",
    email: "john.carter@beanflow.com",
    phone: "+62 812-3456-7890",
    position: "Store Manager",
    role: "Admin",
    hireDate: "2023-01-12",
    address: "Jl. Sudirman No.12, Jakarta",
    status: "Active",
    about:
      "Experienced Store Manager responsible for supervising daily operations and improving team performance.",

    account: {
      username: "john.carter",
      loginStatus: "Online",
      lastLogin: "2026-08-07 08:15",
      lastLogout: "2026-08-06 17:30",
      twoFactor: true,
    },
  },

  {
    id: "STF002",
    photo: staff2,
    fullName: "Sarah Olivia Wilson",
    email: "sarah.wilson@beanflow.com",
    phone: "+62 813-9876-5432",
    position: "Cashier",
    role: "Cashier",
    hireDate: "2024-02-10",
    address: "Jl. Kemang Raya No.20, Jakarta",
    status: "Active",
    about: "Responsible for customer transactions and payment processing.",

    account: {
      username: "sarah.wilson",
      loginStatus: "Offline",
      lastLogin: "2026-08-07 08:05",
      lastLogout: "2026-08-06 17:10",
      twoFactor: false,
    },
  },

  {
    id: "STF003",
    photo: staff3,
    fullName: "Emily Grace Brown",
    email: "emily.brown@beanflow.com",
    phone: "+62 811-2233-4455",
    position: "Barista",
    role: "Staff",
    hireDate: "2024-05-18",
    address: "Jl. Bintaro Utama No.11, Jakarta",
    status: "Active",
    about:
      "Passionate barista specializing in espresso-based beverages and latte art.",

    account: {
      username: "emily.brown",
      loginStatus: "Online",
      lastLogin: "2026-08-07 07:55",
      lastLogout: "2026-08-06 17:20",
      twoFactor: false,
    },
  },

  {
    id: "STF004",
    photo: staff4,
    fullName: "Michael Andrew Lee",
    email: "michael.lee@beanflow.com",
    phone: "+62 821-8899-1122",
    position: "Kitchen Staff",
    role: "Staff",
    hireDate: "2023-11-08",
    address: "Jl. Gajah Mada No.55, Jakarta",
    status: "On Leave",
    about:
      "Responsible for preparing food ingredients and maintaining kitchen quality.",

    account: {
      username: "michael.lee",
      loginStatus: "Offline",
      lastLogin: "2026-07-31 08:00",
      lastLogout: "2026-07-31 17:00",
      twoFactor: false,
    },
  },

  {
    id: "STF005",
    photo: staff5,
    fullName: "Sophia Anne Taylor",
    email: "sophia.taylor@beanflow.com",
    phone: "+62 822-3344-5566",
    position: "Inventory Officer",
    role: "Admin",
    hireDate: "2023-08-21",
    address: "Jl. Tebet Barat No.18, Jakarta",
    status: "Active",
    about:
      "Manages inventory records, supplier coordination, and warehouse stock.",

    account: {
      username: "sophia.taylor",
      loginStatus: "Online",
      lastLogin: "2026-08-07 08:25",
      lastLogout: "2026-08-06 17:20",
      twoFactor: true,
    },
  },
];
