  import { useEffect, useMemo, useState } from "react";

  import {
    fetchRolesAndPermissions,
    createRole,
    renameRole,
    deleteRole,
    updateRolePermissions,
  } from "../../../services/rolesApi";

  /* =========================================================
    CATATAN MIGRASI

    Versi lama komponen ini menerima `value`/`onChange` dari
    parent, yang bersumber dari settings.roles (data dummy
    lokal) dengan permission berbentuk objek bersarang custom
    per module/action. Backend yang sesungguhnya memakai
    struktur berbeda:

    - roles.slug adalah identifier asli yang dipakai users.role
    - permissions adalah tabel master (module + action + slug)
    - role <-> permission terhubung lewat role_permissions

    Supaya tidak ada 2 sumber kebenaran, komponen ini sekarang
    MENGAMBIL & MENYIMPAN datanya sendiri langsung ke API
    (self-contained), bukan lagi dikendalikan lewat props
    value/onChange dari SettingsContext. Modul & action juga
    TIDAK di-hardcode lagi, tapi diturunkan dari daftar
    permission asli di database - supaya kalau backend
    menambah module baru (mis. "products", "menu"), UI ini
    otomatis menampilkannya tanpa perlu ubah kode.

    PENTING: dropdown "Active User Role" dari versi lama
    dihapus. Itu mengubah role user yang SEDANG LOGIN secara
    bebas dari halaman ini, padahal role user semestinya
    diatur lewat halaman manajemen Staff/User (field
    users.role), bukan dari halaman "kelola daftar role".
    Kalau Anda memang butuh fitur "pindahkan user ke role
    lain", itu sebaiknya ada di halaman Staff, bukan di sini.
    ========================================================= */

  export default function UserRolesSettings({ disabled }) {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savingRoleId, setSavingRoleId] = useState(null);

    /* =======================================================
      LOAD DATA
    ======================================================= */
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRolesAndPermissions();
        setRoles(data.roles ?? []);
        setPermissions(data.permissions ?? []);
      } catch (err) {
        console.error("Failed to load roles & permissions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadData();
    }, []);

    /* =======================================================
      DERIVE MODULES & ACTIONS FROM MASTER PERMISSION LIST
      (dinamis, bukan hardcode)
    ======================================================= */
    const modules = useMemo(
      () => [...new Set(permissions.map((permission) => permission.module))],
      [permissions],
    );

    const actions = useMemo(
      () => [...new Set(permissions.map((permission) => permission.action))],
      [permissions],
    );

    /* =======================================================
      HELPER: cari permission id dari module + action
    ======================================================= */
    const findPermissionId = (moduleName, action) => {
      const found = permissions.find(
        (permission) =>
          permission.module === moduleName && permission.action === action,
      );
      return found?.id ?? null;
    };

    /* =======================================================
      HELPER: apakah role sudah punya permission tsb
    ======================================================= */
    const roleHasPermission = (role, moduleName, action) => {
      return (role.permissions ?? []).some(
        (permission) =>
          permission.module === moduleName && permission.action === action,
      );
    };

    /* =======================================================
      TOGGLE PERMISSION
    ======================================================= */
    const togglePermission = async (role, moduleName, action) => {
      const permissionId = findPermissionId(moduleName, action);
      if (!permissionId) return;

      const currentIds = (role.permissions ?? []).map(
        (permission) => permission.id,
      );

      const nextIds = currentIds.includes(permissionId)
        ? currentIds.filter((id) => id !== permissionId)
        : [...currentIds, permissionId];

      // Optimistic update supaya toggle terasa instan.
      setRoles((prev) =>
        prev.map((item) =>
          item.id === role.id
            ? {
                ...item,
                permissions: permissions.filter((p) => nextIds.includes(p.id)),
              }
            : item,
        ),
      );

      setSavingRoleId(role.id);
      try {
        const updated = await updateRolePermissions(role.id, nextIds);
        setRoles((prev) =>
          prev.map((item) => (item.id === role.id ? updated : item)),
        );
      } catch (err) {
        console.error("Failed to update role permissions:", err);
        // Rollback kalau gagal.
        setRoles((prev) =>
          prev.map((item) => (item.id === role.id ? role : item)),
        );
        alert(err.message);
      } finally {
        setSavingRoleId(null);
      }
    };

    /* =======================================================
      ADD ROLE
    ======================================================= */
    const addRole = async () => {
      const name = window.prompt("Nama role baru:");
      if (!name || !name.trim()) return;

      try {
        const created = await createRole(name.trim());
        setRoles((prev) => [...prev, created]);
      } catch (err) {
        console.error("Failed to create role:", err);
        alert(err.message);
      }
    };

    /* =======================================================
      RENAME ROLE
    ======================================================= */
    const updateRoleName = async (role, name) => {
      // Update tampilan dulu (optimistic), commit ke backend saat blur.
      setRoles((prev) =>
        prev.map((item) => (item.id === role.id ? { ...item, name } : item)),
      );
    };

    const commitRoleName = async (role) => {
      if (!role.name || !role.name.trim()) return;

      try {
        const updated = await renameRole(role.id, role.name.trim());
        setRoles((prev) =>
          prev.map((item) => (item.id === role.id ? updated : item)),
        );
      } catch (err) {
        console.error("Failed to rename role:", err);
        alert(err.message);
        loadData();
      }
    };

    /* =======================================================
      DELETE ROLE
    ======================================================= */
    const handleDeleteRole = async (role) => {
      if (!window.confirm(`Delete role "${role.name}"?`)) return;

      try {
        await deleteRole(role.id);
        setRoles((prev) => prev.filter((item) => item.id !== role.id));
      } catch (err) {
        // Termasuk kasus 409: role masih dipakai user.
        console.error("Failed to delete role:", err);
        alert(err.message);
      }
    };

    if (loading) {
      return (
        <div className="settings-section">
          <h3 className="section-title">User & Roles</h3>
          <p>Loading roles...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="settings-section">
          <h3 className="section-title">User & Roles</h3>
          <p className="error-text">{error}</p>
          <button type="button" className="secondary-button" onClick={loadData}>
            Coba lagi
          </button>
        </div>
      );
    }

    return (
      <div className="settings-section">
        <div className="inline-row">
          <h3 className="section-title">User & Roles</h3>
          <button
            type="button"
            className="secondary-button"
            onClick={addRole}
            disabled={disabled}
          >
            Create Role
          </button>
        </div>

        {roles.map((role) => (
          <div key={role.id} className="card-block">
            <div className="inline-row">
              <input
                value={role.name}
                onChange={(event) => updateRoleName(role, event.target.value)}
                onBlur={() => commitRoleName(role)}
                disabled={disabled}
                placeholder="Role name"
              />
              <span className="muted-text">({role.slug})</span>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDeleteRole(role)}
                disabled={disabled}
              >
                Delete Role
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Module</th>
                    {actions.map((action) => (
                      <th key={action}>{action}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((moduleName) => (
                    <tr key={moduleName}>
                      <td>{moduleName}</td>
                      {actions.map((action) => {
                        const permissionId = findPermissionId(moduleName, action);
                        const active = roleHasPermission(
                          role,
                          moduleName,
                          action,
                        );

                        return (
                          <td key={action}>
                            <button
                              type="button"
                              className={active ? "switch active" : "switch"}
                              onClick={() =>
                                togglePermission(role, moduleName, action)
                              }
                              disabled={
                                disabled ||
                                !permissionId ||
                                savingRoleId === role.id
                              }
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  }
