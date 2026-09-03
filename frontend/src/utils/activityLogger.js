export function createActivityLogEntry(payload) {
  const now = new Date();

  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `log-${now.getTime()}`,
    userId: payload.userId || "STF001",
    userName: payload.userName || "Christian",
    action: payload.action || "UPDATE",
    module: payload.module || "System",
    description: payload.description || "No description",
    timestamp: payload.timestamp || now.toISOString(),
    status: payload.status || "Success",
  };
}
