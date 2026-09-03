import { useEffect, useMemo, useState } from "react";
import {
  FiSettings,
  FiHome,
  FiPercent,
  FiUsers,
  FiBell,
  FiShield,
  FiDatabase,
  FiLink,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";
import "./Setting.css";
import { useSettings } from "../../context/SettingsContext";
import GeneralSettings from "./components/GeneralSettings";
import StoreInformation from "./components/StoreInformation";
import TaxChargesSettings from "./components/TaxChargesSettings";
import UserRolesSettings from "./components/UserRolesSettings";
import NotificationSettings from "./components/NotificationSettings";
import SecuritySettings from "./components/SecuritySettings";
import BackupDataSettings from "./components/BackupDataSettings";
import IntegrationSettings from "./components/IntegrationSettings";
import ActivityLog from "./components/ActivityLog";

const settingTabs = [
  { key: "general", label: "General", icon: FiSettings },
  { key: "storeInformation", label: "Store Information", icon: FiHome },
  { key: "taxAndCharges", label: "Tax & Charges", icon: FiPercent },
  { key: "roles", label: "User & Roles", icon: FiUsers },
  { key: "notification", label: "Notification", icon: FiBell },
  { key: "security", label: "Security", icon: FiShield },
  { key: "backupAndData", label: "Backup & Data", icon: FiDatabase },
  { key: "integration", label: "Integration", icon: FiLink },
  { key: "activityLog", label: "Activity Log", icon: FiFileText },
];

/*
 * Tab yang TIDAK punya tombol "Save Changes" global, karena
 * komponennya sudah self-contained (menyimpan sendiri ke API
 * setiap ada perubahan, bukan lewat draft + save di sini).
 *
 * - roles: UserRolesSettings sudah self-contained (lihat catatan
 *   migrasi di file komponennya). Bukan lagi bagian dari
 *   settings.* di backend, jadi tidak boleh ikut disimpan lewat
 *   updateSettings().
 * - activityLog: read-only, tidak ada yang perlu disimpan.
 */
const SELF_MANAGED_TABS = ["roles", "activityLog"];

/*
 * Section settings yang SUNGGUH-SUNGGUH ada di backend (tabel
 * `settings`). Hanya ini yang boleh dikirim lewat updateSettings().
 * "paymentMethods" dan "roles" SENGAJA tidak ada di sini karena
 * masing-masing sudah punya tabel & endpoint sendiri.
 */
const SETTINGS_SECTION_KEYS = [
  "general",
  "storeInformation",
  "taxAndCharges",
  "notification",
  "security",
  "backupAndData",
  "integration",
];

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export default function Setting() {
  const {
    settings,
    settingsLoading,
    updateSettings,
    hasPermission,
    addActivityLog,
  } = useSettings();

  const [activeTab, setActiveTab] = useState("general");
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState(settings);
  const [saving, setSaving] = useState(false);

  const canEditSettings = hasPermission("settings", "edit");

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const hasUnsavedChanges = useMemo(
    () => !deepEqual(draft, settings),
    [draft, settings],
  );

  useEffect(() => {
    const beforeUnloadHandler = (event) => {
      if (!hasUnsavedChanges) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnloadHandler);

    return () =>
      window.removeEventListener("beforeunload", beforeUnloadHandler);
  }, [hasUnsavedChanges]);

  const changeTab = (nextTab) => {
    if (
      hasUnsavedChanges &&
      settings?.general?.confirmationDialog &&
      !window.confirm("Unsaved changes. Are you sure you want to leave?")
    ) {
      return;
    }

    setActiveTab(nextTab);
    setMessage("");
  };

  /*
   * Hanya menyimpan section yang bentuknya SETTINGS_SECTION_KEYS
   * dan yang nilainya benar-benar berubah dibanding data asli dari
   * backend. "paymentMethods" dan "roles" TIDAK PERNAH dikirim ke
   * sini karena keduanya bukan bagian dari settings.* lagi.
   */
  const saveChanges = async () => {
    if (!draft || !settings) return;

    setSaving(true);
    try {
      const changedSections = SETTINGS_SECTION_KEYS.filter(
        (key) => !deepEqual(draft[key], settings[key]),
      );

      await Promise.all(
        changedSections.map((key) => updateSettings(key, draft[key])),
      );

      addActivityLog({
        action: "UPDATE",
        module: "Settings",
        description: `Saved changes in ${activeTab}`,
        status: "Success",
      });

      setMessage("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage("");
      alert(error.message || "Gagal menyimpan settings.");
    } finally {
      setSaving(false);
    }
  };

  if (settingsLoading || !draft) {
    return (
      <div className="settings-page">
        <div className="greeting">
          <h2>Setting</h2>
        </div>
        <p>Loading settings...</p>
      </div>
    );
  }

  const content = {
    general: (
      <GeneralSettings
        value={draft.general}
        onChange={(nextValue) =>
          setDraft((prev) => ({ ...prev, general: nextValue }))
        }
        disabled={!canEditSettings}
      />
    ),
    storeInformation: (
      <StoreInformation
        value={draft.storeInformation}
        onChange={(nextValue) =>
          setDraft((prev) => ({ ...prev, storeInformation: nextValue }))
        }
        disabled={!canEditSettings}
      />
    ),
    taxAndCharges: (
      <TaxChargesSettings
        value={draft.taxAndCharges}
        onChange={(nextValue) =>
          setDraft((prev) => ({ ...prev, taxAndCharges: nextValue }))
        }
        disabled={!canEditSettings}
      />
    ),
    /*
     * UserRolesSettings sekarang self-contained: mengambil &
     * menyimpan datanya sendiri langsung ke API. TIDAK menerima
     * value/onChange lagi.
     */
    roles: <UserRolesSettings disabled={!canEditSettings} />,
    notification: (
      <NotificationSettings
        value={draft.notification}
        onChange={(nextValue) =>
          setDraft((prev) => ({ ...prev, notification: nextValue }))
        }
        disabled={!canEditSettings}
      />
    ),
    security: (
      <SecuritySettings
        value={draft.security}
        onChange={(nextValue) =>
          setDraft((prev) => ({ ...prev, security: nextValue }))
        }
        disabled={!canEditSettings}
      />
    ),
    backupAndData: (
      <BackupDataSettings
        value={draft.backupAndData}
        onChange={(nextValue) =>
          setDraft((prev) => ({ ...prev, backupAndData: nextValue }))
        }
        disabled={!canEditSettings}
      />
    ),
    integration: (
      <IntegrationSettings
        value={draft.integration}
        onChange={(nextValue) =>
          setDraft((prev) => ({ ...prev, integration: nextValue }))
        }
        disabled={!canEditSettings}
      />
    ),
    activityLog: <ActivityLog />,
  };

  const activeTabLabel = settingTabs.find(
    (tab) => tab.key === activeTab,
  )?.label;
  const showSaveButton = !SELF_MANAGED_TABS.includes(activeTab);

  return (
    <div className="settings-page">
      <div className="greeting">
        <h2>Setting</h2>
        <p>Salaries &gt; Payroll Management</p>
      </div>

      <div className="settings-layout">
        <aside className="settings-side-nav">
          {settingTabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                type="button"
                className={
                  activeTab === tab.key ? "tab-button active" : "tab-button"
                }
                onClick={() => changeTab(tab.key)}
              >
                <Icon className="tab-icon" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        <section className="settings-content-card">
          <div className="settings-content-header">
            <h3>{activeTabLabel}</h3>
            {showSaveButton && hasUnsavedChanges && (
              <span className="unsaved-badge">Unsaved changes</span>
            )}
          </div>

          {message ? (
            <div className="save-message">
              <FiCheckCircle />
              <span>{message}</span>
            </div>
          ) : null}

          <div className="settings-content-body">{content[activeTab]}</div>

          {showSaveButton && (
            <div className="settings-actions">
              <button
                type="button"
                className="save-button"
                disabled={!hasUnsavedChanges || !canEditSettings || saving}
                onClick={saveChanges}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
