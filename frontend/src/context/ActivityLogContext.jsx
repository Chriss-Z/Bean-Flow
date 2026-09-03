import { createContext, useContext } from "react";
import { useSettings } from "./SettingsContext";

const ActivityLogContext = createContext(null);

export function ActivityLogProvider({ children }) {
  const { activityLogs, addActivityLog } = useSettings();

  return (
    <ActivityLogContext.Provider value={{ activityLogs, addActivityLog }}>
      {children}
    </ActivityLogContext.Provider>
  );
}

export function useActivityLog() {
  const context = useContext(ActivityLogContext);

  if (!context) {
    throw new Error("useActivityLog must be used inside ActivityLogProvider");
  }

  return context;
}
