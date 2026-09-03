import { useMemo, useState } from "react";
import { useSettings } from "../../../context/SettingsContext";

export default function ActivityLog() {
  const { activityLogs, formatDate } = useSettings();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const moduleOptions = useMemo(
    () => ["All", ...new Set(activityLogs.map((log) => log.module))],
    [activityLogs],
  );

  const userOptions = useMemo(
    () => ["All", ...new Set(activityLogs.map((log) => log.userName))],
    [activityLogs],
  );

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      const matchSearch =
        log.description.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase());

      const matchModule = moduleFilter === "All" || log.module === moduleFilter;
      const matchStatus = statusFilter === "All" || log.status === statusFilter;
      const matchUser = userFilter === "All" || log.userName === userFilter;
      const matchDate =
        !dateFilter || log.timestamp.slice(0, 10) === dateFilter;

      return (
        matchSearch && matchModule && matchStatus && matchUser && matchDate
      );
    });
  }, [
    activityLogs,
    dateFilter,
    moduleFilter,
    search,
    statusFilter,
    userFilter,
  ]);

  return (
    <div className="settings-section">
      <h3 className="section-title">Activity Log</h3>

      <div className="card-block">
        <div className="section-grid">
          <div className="input-field">
            <label>Search</label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search action or description"
            />
          </div>
          <div className="input-field">
            <label>Module</label>
            <select
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
            >
              {moduleOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="input-field">
            <label>User</label>
            <select
              value={userFilter}
              onChange={(event) => setUserFilter(event.target.value)}
            >
              {userOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="input-field">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All</option>
              <option>Success</option>
              <option>Failed</option>
              <option>Warning</option>
              <option>Info</option>
            </select>
          </div>
          <div className="input-field">
            <label>Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>{formatDate(log.timestamp)}</td>
                <td>{log.userName}</td>
                <td>{log.action}</td>
                <td>{log.module}</td>
                <td>{log.description}</td>
                <td>{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
