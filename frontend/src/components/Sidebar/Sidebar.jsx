import "./Sidebar.css";

import { useState } from "react";

import logo from "../../assets/logo.png";
import profile from "../../assets/profil.jpeg";

import { NavLink } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";

import {
  FaHome,
  FaShoppingCart,
  FaBoxOpen,
  FaUsers,
  FaChartBar,
  FaWallet,
  FaCog,
  FaChevronDown,
  FaBell,
} from "react-icons/fa";

/* =========================================================
   SIDEBAR MENUS
========================================================= */

const menus = [
  {
    name: "Beranda",
    icon: <FaHome />,
    path: "/dashboard",
    module: "dashboard",
  },
  {
    name: "Penjualan",
    icon: <FaShoppingCart />,
    path: "/sales",
    module: "sales",
  },
  {
    name: "Inventori",
    icon: <FaBoxOpen />,
    path: "/inventory",
    module: "inventory",
  },
  {
    name: "Staf",
    icon: <FaUsers />,
    path: "/staff",
    module: "staff",
  },
  {
    name: "Laporan",
    icon: <FaChartBar />,
    path: "/report",
    module: "reports",
  },
  {
    name: "Gaji",
    icon: <FaWallet />,
    path: "/salary",
    module: "payroll",
  },
  {
    name: "Pengaturan",
    icon: <FaCog />,
    path: "/settings",
    module: "settings",
  },
];

/* =========================================================
   SIDEBAR
========================================================= */

export default function Sidebar() {
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    hasPermission,
    currentUser,
    inAppNotifications,
    settings,
    settingsLoading,
  } = useSettings();
  const storeInformation = settings?.storeInformation || {
    logo: null,
    storeName: "Bean & Flow",
  };

  /* =======================================================
     FILTER MENU BERDASARKAN BACKEND PERMISSION
  ======================================================= */

  const visibleMenus = menus.filter((menu) =>
    hasPermission(menu.module, "view"),
  );

  return (
    <aside className="sidebar">
      {/* ===================================================
          LOGO
      =================================================== */}

      <div className="logo-section">
        <img src={storeInformation.logo || logo} alt="Logo" className="logo" />

        <h2>{storeInformation.storeName}</h2>

        <span>COFFEE SHOP</span>
      </div>

      <div className="divider"></div>

      {/* ===================================================
          MENU
      =================================================== */}

      <ul className="menu">
        {visibleMenus.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? "menu-link active" : "menu-link"
              }
            >
              {item.icon}

              <span>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="divider"></div>

      {/* ===================================================
          NOTIFICATIONS
      =================================================== */}

      <div
        style={{
          padding: "12px 15px",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={() => setShowNotifications((prev) => !prev)}
          style={{
            border: 0,
            background: "transparent",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <FaBell />

          <span style={{ fontSize: "13px" }}>
            Notifications ({inAppNotifications.length})
          </span>
        </button>

        {showNotifications && (
          <div
            style={{
              position: "absolute",
              left: "15px",
              right: "15px",
              top: "40px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "10px",
              zIndex: 3,
              maxHeight: "180px",
              overflowY: "auto",
            }}
          >
            {inAppNotifications.length === 0 ? (
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                No notification yet.
              </p>
            ) : (
              inAppNotifications.slice(0, 8).map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    marginBottom: "8px",
                    borderBottom: "1px solid #f3f4f6",
                    paddingBottom: "6px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {notification.title}
                  </p>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    {notification.message}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ===================================================
          PROFILE
      =================================================== */}

      <div className="profile">
        <img src={profile} alt="" />

        <div>
          <h4>{currentUser.name}</h4>
          <p>{currentUser.role}</p>
        </div>

        <FaChevronDown />
      </div>
    </aside>
  );
}
