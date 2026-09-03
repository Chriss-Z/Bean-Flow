import Sidebar from "../components/Sidebar/Sidebar";
import "./MainLayout.css";

export default function MainLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}