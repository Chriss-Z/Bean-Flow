import "./Staff.css";
import { useState, useEffect } from "react";
import { HiMiniUserGroup } from "react-icons/hi2";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { IoPersonOutline } from "react-icons/io5";
import { FiUserX } from "react-icons/fi";
import {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../../services/staffApi";
import { FaEye, FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { useTranslation } from "../../hooks/useTranslation";
const Staff = () => {
  const { t } = useTranslation();
  const getPhotoUrl = (photo) => {
    if (!photo) return "";

    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo;
    }

    return `http://127.0.0.1:8001/storage/${photo}`;
  };
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [positionFilter, setPositionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [staffData, setStaffData] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("profile");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingId, setEditingId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const [staffPhoto, setStaffPhoto] = useState(null);
  const [staffPhotoPreview, setStaffPhotoPreview] = useState("");

  const emptyForm = {
    full_name: "",
    email: "",
    phone: "",
    position: "",
    role: "",
    hire_date: "",
    address: "",
    status: "Active",
    about: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // =========================
  // STATISTICS
  // =========================

  const totalStaff = staffData.length;

  const totalAdmin = staffData.filter((staff) => staff.role === "Admin").length;

  const activeStaff = staffData.filter(
    (staff) => staff.status === "Active",
  ).length;

  const inactiveStaff = staffData.filter(
    (staff) => staff.status !== "Active",
  ).length;

  // =========================
  // FILTER OPTIONS
  // =========================

  const roles = ["All", ...new Set(staffData.map((staff) => staff.role))];

  const positions = [
    "All",
    ...new Set(staffData.map((staff) => staff.position)),
  ];

  const statuses = ["All", ...new Set(staffData.map((staff) => staff.status))];

  // =========================
  // FILTER STAFF
  // =========================

  const filteredStaff = staffData.filter((staff) => {
    const searchValue = search.toLowerCase();

    const matchSearch =
      staff.fullName.toLowerCase().includes(searchValue) ||
      staff.id.toLowerCase().includes(searchValue);

    const matchRole = roleFilter === "All" || staff.role === roleFilter;

    const matchPosition =
      positionFilter === "All" || staff.position === positionFilter;

    const matchStatus = statusFilter === "All" || staff.status === statusFilter;

    return matchSearch && matchRole && matchPosition && matchStatus;
  });
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    const datePart = new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const timePart = new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${datePart}, ${timePart}`;
  };

  const mapStaff = (staff) => ({
    id: staff.staff_code,
    fullName: staff.full_name,
    email: staff.email,
    phone: staff.phone,
    position: staff.position,
    role: staff.role,
    hireDate: formatDate(staff.hire_date),
    address: staff.address,
    status: staff.status,
    about: staff.about,
    photo: staff.photo,

    // Sementara karena data account
    // belum tersedia di database
    account: {
      username: staff.user?.username ?? null,
      loginStatus: staff.user?.login_status ?? "Offline",
      lastLogin: formatDateTime(staff.user?.last_login),
      lastLogout: formatDateTime(staff.user?.last_logout),
      twoFactor: staff.user?.two_factor ?? false,
    },
  });

  // =========================
  // FETCH STAFF FROM API
  // =========================

  const fetchStaff = async (keepSelectedId) => {
    try {
      setLoading(true);
      setError("");

      const data = await getStaff();

      const formattedStaff = data.map(mapStaff);

      setStaffData(formattedStaff);

      if (formattedStaff.length > 0) {
        const keepSelected = keepSelectedId
          ? formattedStaff.find((staff) => staff.id === keepSelectedId)
          : null;

        setSelectedStaff(keepSelected || formattedStaff[0]);
      } else {
        setSelectedStaff(null);
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);

      setError(err.message || "Gagal mengambil data staff");

      setStaffData([]);
      setSelectedStaff(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // =========================
  // CREATE / EDIT / DELETE
  // =========================

  const resetForm = () => {
    setFormData(emptyForm);
    setStaffPhoto(null);
    setStaffPhotoPreview("");
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode("create");
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = async (staff) => {
    try {
      setActionLoading(true);

      const data = await getStaffById(staff.id);

      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        position: data.position || "",
        role: data.role || "",
        hire_date: data.hire_date ? String(data.hire_date).slice(0, 10) : "",
        address: data.address || "",
        status: data.status || "Active",
        about: data.about || "",
      });

      setStaffPhoto(null);

      setStaffPhotoPreview(data.photo ? getPhotoUrl(data.photo) : "");

      setModalMode("edit");
      setEditingId(staff.id);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to get staff:", err);
      alert(err.message || "Gagal mengambil data staff");
    } finally {
      setActionLoading(false);
    }
  };
  const closeModal = () => {
    if (actionLoading) return;
    setShowModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2 MB.");
      return;
    }

    setStaffPhoto(file);

    const previewUrl = URL.createObjectURL(file);
    setStaffPhotoPreview(previewUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);

      const payload = new FormData();

      payload.append("full_name", formData.full_name);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone || "");
      payload.append("position", formData.position);
      payload.append("role", formData.role);
      payload.append("hire_date", formData.hire_date || "");
      payload.append("address", formData.address || "");
      payload.append("status", formData.status);
      payload.append("about", formData.about || "");

      if (staffPhoto) {
        payload.append("photo", staffPhoto);
      }

      if (modalMode === "create") {
        await createStaff(payload);
      } else {
        await updateStaff(editingId, payload);
      }

      setShowModal(false);
      resetForm();

      await fetchStaff(modalMode === "edit" ? editingId : null);
    } catch (err) {
      console.error("Failed to save staff:", err);
      alert(err.message || "Gagal menyimpan data staff");
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteConfirm = (staff) => {
    setDeleteTarget(staff);
    setShowDeleteModal(true);
  };

  const closeDeleteConfirm = () => {
    if (actionLoading) return;
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoading(true);

      await deleteStaff(deleteTarget.id);

      setShowDeleteModal(false);
      setDeleteTarget(null);

      await fetchStaff();
    } catch (err) {
      console.error("Failed to delete staff:", err);
      alert(err.message || "Gagal menghapus staff");
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="staff">
        <div className="greeting">
          <h2>Loading...</h2>
          <p>Memuat data staff...</p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="staff">
        <div className="greeting">
          <h2>Gagal memuat data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="staff">
      {/* Greeting */}
      <div className="greeting">
        <h2>
          {t("staff.title")} <span className="wave">👋</span>
        </h2>
        <p>{t("staff.greeting")}</p>
      </div>

      {/* Statistics */}
      <div className="staff-stats">
        <div className="staff-stat-card">
          <div className="staff-stat-header">
            <span>{t("staff.totalStaff")}</span>

            <div className="staff-icon">
              <HiMiniUserGroup />
            </div>
          </div>

          <h2>{totalStaff}</h2>

          <p>{t("staff.allRegisteredStaff")}</p>
        </div>

        <div className="staff-stat-card">
          <div className="staff-stat-header">
            <span>{t("staff.activeStaff")}</span>

            <div className="staff-icon">
              <IoPersonOutline />
            </div>
          </div>

          <h2>{activeStaff}</h2>

          <p>{t("staff.currentlyWorking")}</p>
        </div>

        <div className="staff-stat-card">
          <div className="staff-stat-header">
            <span>{t("staff.inactiveStaff")}</span>

            <div className="staff-icon">
              <FiUserX />
            </div>
          </div>

          <h2>{inactiveStaff}</h2>

          <p>{t("staff.unavailableStaff")}</p>
        </div>

        <div className="staff-stat-card">
          <div className="staff-stat-header">
            <span>{t("staff.admin")}</span>

            <div className="staff-icon">
              <MdOutlineAdminPanelSettings />
            </div>
          </div>

          <h2>{totalAdmin}</h2>

          <p>{t("staff.administratorAccounts")}</p>
        </div>
      </div>

      {/* Filter */}

      {/* Content */}
      <div className="staff-content">
        <div className="staff-left">
          <div className="staff-filter-card">
            <input
              type="text"
              placeholder={t("staff.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="staff-search"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="staff-select"
            >
              {roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>

            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="staff-select"
            >
              {positions.map((position) => (
                <option key={position}>{position}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="staff-select"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "All"
                    ? t("staff.all")
                    : status === "Active"
                      ? t("staff.active")
                      : status === "Inactive"
                        ? t("staff.inactive")
                        : status === "On Leave"
                          ? t("staff.onLeave")
                          : status}
                </option>
              ))}
            </select>

            <button
              className="reset-filter-btn"
              onClick={() => {
                setSearch("");
                setRoleFilter("All");
                setPositionFilter("All");
                setStatusFilter("All");
              }}
            >
              {t("staff.resetFilter")}
            </button>
          </div>
          <div className="staff-table-card">
            <div className="staff-table-header">
              <h3>{t("staff.staffList")}</h3>

              <div className="staff-table-header-actions">
                <span>
                  {filteredStaff.length} {t("staff.staffCount")}
                </span>

                <button
                  type="button"
                  className="staff-add-btn"
                  onClick={openCreateModal}
                >
                  <FaPlus /> {t("staff.addStaff") || "Add Staff"}
                </button>
              </div>
            </div>

            <div className="staff-table-wrapper">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>{t("staff.photo")}</th>
                    <th>{t("staff.staff")}</th>
                    <th>{t("staff.position")}</th>
                    <th>{t("staff.role")}</th>
                    <th>{t("staff.status")}</th>
                    <th>{t("staff.action")}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id}>
                      <td>
                        {staff.photo ? (
                          <img
                            src={getPhotoUrl(staff.photo)}
                            alt={staff.fullName}
                            className="staff-photo-img"
                          />
                        ) : (
                          <div className="staff-photo"></div>
                        )}
                      </td>

                      <td>
                        <div className="staff-info">
                          <span className="staff-name">{staff.fullName}</span>
                          <span className="staff-id">{staff.id}</span>
                        </div>
                      </td>

                      <td>{staff.position}</td>

                      <td>
                        <span
                          className={`role-badge role-${staff.role.toLowerCase()}`}
                        >
                          {staff.role}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            staff.status === "Active"
                              ? "status-active"
                              : staff.status === "On Leave"
                                ? "status-leave"
                                : "status-inactive"
                          }`}
                        >
                          {staff.status}
                        </span>
                      </td>

                      <td>
                        <div className="staff-row-actions">
                          <button
                            className="action-btn"
                            title={t("staff.view") || "View"}
                            onClick={() => setSelectedStaff(staff)}
                          >
                            <FaEye />
                          </button>

                          <button
                            className="action-btn edit"
                            title={t("staff.edit") || "Edit"}
                            onClick={() => openEditModal(staff)}
                          >
                            <FaEdit />
                          </button>

                          <button
                            className="action-btn delete"
                            title={t("staff.delete") || "Delete"}
                            onClick={() => openDeleteConfirm(staff)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="staff-detail">
          {selectedStaff ? (
            <>
              <div className="staff-detail-header">
                {selectedStaff.photo ? (
                  <img
                    src={getPhotoUrl(selectedStaff.photo)}
                    alt={selectedStaff.fullName}
                    className="detail-photo"
                  />
                ) : (
                  <div className="detail-photo"></div>
                )}

                <h3>{selectedStaff.fullName}</h3>

                <p>{selectedStaff.position}</p>

                <span
                  className={`status-badge ${
                    selectedStaff.status === "Active"
                      ? "status-active"
                      : selectedStaff.status === "On Leave"
                        ? "status-leave"
                        : "status-inactive"
                  }`}
                >
                  {selectedStaff.status}
                </span>
              </div>

              <div className="staff-detail-body">
                <div className="detail-item">
                  <label>{t("staff.staffId")}</label>
                  <span>{selectedStaff.id}</span>
                </div>

                <div className="detail-item">
                  <label>{t("staff.email")}</label>
                  <span>{selectedStaff.email}</span>
                </div>

                <div className="detail-item">
                  <label>{t("staff.phone")}</label>
                  <span>{selectedStaff.phone}</span>
                </div>

                <div className="detail-item">
                  <label>{t("staff.role")}</label>
                  <span>{selectedStaff.role}</span>
                </div>

                <div className="detail-item">
                  <label>{t("staff.hireDate")}</label>
                  <span>{selectedStaff.hireDate}</span>
                </div>

                <div className="detail-item">
                  <label>{t("staff.address")}</label>
                  <span>{selectedStaff.address}</span>
                </div>

                <div className="detail-item">
                  <label>{t("staff.username")}</label>
                  <span>{selectedStaff.account.username}</span>
                </div>

                <div className="detail-item">
                  <label>{t("staff.loginStatus")}</label>
                  <span>{selectedStaff.account.loginStatus}</span>
                </div>

                <div className="detail-item">
                  <label>{t("staff.lastLogin")}</label>
                  <span>{selectedStaff.account.lastLogin}</span>
                </div>

                <div className="detail-item">
                  <label>{t("staff.lastLogout")}</label>
                  <span>{selectedStaff.account.lastLogout}</span>
                </div>

                <div className="detail-item">
                  <label>{t("staff.twoFactor")}</label>
                  <span>
                    {selectedStaff.account.twoFactor ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <div className="detail-about">
                  <label>{t("staff.about")}</label>

                  <p>{selectedStaff.about}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="staff-detail-empty">
              {t("staff.noStaffSelected") || "No staff selected"}
            </div>
          )}
        </div>
      </div>

      {/* ========================================
          MODAL CREATE / EDIT
      ======================================== */}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalMode === "create"
                  ? t("staff.addStaff") || "Add Staff"
                  : t("staff.editStaff") || "Edit Staff"}
              </h3>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
              >
                <FaTimes />
              </button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>{t("staff.fullName") || "Full Name"}</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("staff.email")}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("staff.phone")}</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>{t("staff.position")}</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("staff.role")}</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("staff.hireDate")}</label>
                  <input
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>{t("staff.status")}</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="Active">
                      {t("staff.active") || "Active"}
                    </option>
                    <option value="Inactive">
                      {t("staff.inactive") || "Inactive"}
                    </option>
                    <option value="On Leave">
                      {t("staff.onLeave") || "On Leave"}
                    </option>
                  </select>
                </div>

                <div className="form-group full">
                  <label>{t("staff.address")}</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group full">
                  <label>{t("staff.photo") || "Photo"}</label>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handlePhotoChange}
                  />

                  {staffPhotoPreview && (
                    <div className="staff-image-preview">
                      <img
                        src={staffPhotoPreview}
                        alt={formData.full_name || "Staff"}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group full">
                  <label>{t("staff.about")}</label>
                  <textarea
                    rows={3}
                    name="about"
                    value={formData.about}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                  disabled={actionLoading}
                >
                  {t("staff.cancel") || "Cancel"}
                </button>

                <button
                  type="submit"
                  className="btn-save"
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? t("staff.saving") || "Saving..."
                    : t("staff.save") || "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          CONFIRM DELETE
      ======================================== */}

      {showDeleteModal && deleteTarget && (
        <div className="modal-overlay" onClick={closeDeleteConfirm}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <FaTrash />
            </div>

            <h4>{t("staff.deleteConfirmTitle") || "Delete this staff?"}</h4>

            <p>
              {t("staff.deleteConfirmDescription") ||
                "This action cannot be undone for"}{" "}
              <strong>{deleteTarget.fullName}</strong>.
            </p>

            <div className="confirm-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={closeDeleteConfirm}
                disabled={actionLoading}
              >
                {t("staff.cancel") || "Cancel"}
              </button>

              <button
                type="button"
                className="btn-delete"
                onClick={confirmDelete}
                disabled={actionLoading}
              >
                {actionLoading
                  ? t("staff.deleting") || "Deleting..."
                  : t("staff.delete") || "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
