import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Sales from "./pages/Sales/Sales";
import Inventory from "./pages/Inventory/Inventory";
import Staff from "./pages/Staff/Staff";
import Report from "./pages/Report/Report";
import Salary from "./pages/Salary/Salary";
import Setting from "./pages/Setting/Setting";
import { SettingsProvider, useSettings } from "./context/SettingsContext";

function ProtectedPage({ moduleName, children }) {
  const { hasPermission } = useSettings();

  const token =
    localStorage.getItem("bf_token") || sessionStorage.getItem("bf_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(moduleName, "view")) {
    return (
      <MainLayout>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "24px",
          }}
        >
          <h3>Access Restricted</h3>
          <p>You do not have permission to access this page.</p>
        </div>
      </MainLayout>
    );
  }

  return <MainLayout>{children}</MainLayout>;
}

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          {/* LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* ROOT */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedPage moduleName="dashboard">
                <Dashboard />
              </ProtectedPage>
            }
          />

          {/* SALES */}
          <Route
            path="/sales"
            element={
              <ProtectedPage moduleName="sales">
                <Sales />
              </ProtectedPage>
            }
          />

          {/* INVENTORY */}
          <Route
            path="/inventory"
            element={
              <ProtectedPage moduleName="inventory">
                <Inventory />
              </ProtectedPage>
            }
          />

          {/* STAFF */}
          <Route
            path="/staff"
            element={
              <ProtectedPage moduleName="staff">
                <Staff />
              </ProtectedPage>
            }
          />

          {/* REPORT */}
          <Route
            path="/report"
            element={
              <ProtectedPage moduleName="reports">
                <Report />
              </ProtectedPage>
            }
          />

          {/* SALARY */}
          <Route
            path="/salary"
            element={
              <ProtectedPage moduleName="payroll">
                <Salary />
              </ProtectedPage>
            }
          />

          {/* SETTINGS */}
          <Route
            path="/settings"
            element={
              <ProtectedPage moduleName="settings">
                <Setting />
              </ProtectedPage>
            }
          />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
