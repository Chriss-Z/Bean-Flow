import "./Salary.css";

import {
  MdAttachMoney,
  MdPeople,
  MdCheckCircle,
  MdPendingActions,
  MdPayments,
  MdEvent,
  MdSchedule,
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdLocalCafe,
} from "react-icons/md";

import { useMemo, useState, useEffect } from "react";
import { PieChart, Pie, Cell } from "recharts";

import {
  getPayrolls,
  getPayrollHistory,
  getUpcomingPayments,
  // NOTE: tiga fungsi di bawah ini diasumsikan tersedia di payrollApi.js
  // mengikuti pola getPayrolls() dkk. Sesuaikan nama/signature dengan
  // service kamu jika berbeda:
  //   createPayroll(payload)          -> POST payroll baru
  //   updatePayroll(id, payload)      -> PUT/PATCH payroll existing
  //   deletePayroll(id)               -> DELETE payroll
  createPayroll,
  updatePayroll,
  deletePayroll,
} from "../../services/payrollApi";

import { useSettings } from "../../context/SettingsContext";
import { useTranslation } from "../../hooks/useTranslation";

const Salary = () => {
  const { formatCurrency, formatDate } = useSettings();
  const { t } = useTranslation();

  // ========================================
  // STATE
  // ========================================

  const [payrolls, setPayrolls] = useState([]);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [employmentFilter, setEmploymentFilter] = useState("All Employee");

  const [searchEmployee, setSearchEmployee] = useState("");

  const [positionFilter, setPositionFilter] = useState("All Position");

  const [statusFilter, setStatusFilter] = useState("All Status");

  // ========================================
  // STATE - CREATE / EDIT / DELETE (BARU)
  // ========================================

  const emptyForm = {
    staffId: "",
    period: "",
    paymentDate: "",
    basicSalary: "",
    allowance: "",
    overtime: "",
    bonus: "",
    deduction: "",
    status: "Pending",
    notes: "",
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ========================================
  // FETCH PAYROLL DATA
  // ========================================

  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        setLoading(true);
        setError("");

        const [payrollResponse, historyResponse, upcomingResponse] =
          await Promise.all([
            getPayrolls(),
            getPayrollHistory(),
            getUpcomingPayments(),
          ]);

        console.log("PAYROLL RESPONSE:", payrollResponse);
        console.log("HISTORY RESPONSE:", historyResponse);
        console.log("UPCOMING RESPONSE:", upcomingResponse);

        // IMPORTANT:
        // Jangan setPayrolls([]).
        // Ambil data payroll dari API.
        setPayrolls(payrollResponse?.data || payrollResponse || []);

        setPayrollHistory(historyResponse?.data || historyResponse || []);

        setUpcomingPayments(upcomingResponse?.data || upcomingResponse || []);
      } catch (err) {
        console.error("Failed to fetch payroll:", err);

        setError(err?.message || "Failed to load payroll data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, []);

  // ========================================
  // COMBINE PAYROLL + STAFF
  // ========================================

  const salaryEmployees = useMemo(() => {
    return payrolls.map((payroll) => {
      const staff = payroll.staff;

      const basicSalary = Number(payroll.basic_salary || 0);

      const allowance = Number(payroll.allowance || 0);

      const overtime = Number(payroll.overtime || 0);

      const bonus = Number(payroll.bonus || 0);

      const deduction = Number(payroll.deduction || 0);

      const calculatedSalary =
        basicSalary + allowance + overtime + bonus - deduction;

      const totalSalary =
        payroll.net_salary !== null && payroll.net_salary !== undefined
          ? Number(payroll.net_salary)
          : calculatedSalary;

      return {
        id: payroll.id,

        staffId: payroll.staff_id,

        staff: staff,

        employmentType: staff?.employment_type || "-",

        basicSalary,
        allowance,
        overtime,
        bonus,
        deduction,

        totalSalary,

        paymentStatus: payroll.status || "Pending",

        period: payroll.payroll_period,

        payDate: payroll.payment_date,

        notes: payroll.notes,
      };
    });
  }, [payrolls]);

  // ========================================
  // FILTER DATA
  // ========================================

  const filteredEmployees = useMemo(() => {
    return salaryEmployees.filter((employee) => {
      const matchesEmployment =
        employmentFilter === "All Employee" ||
        employee.employmentType === employmentFilter;

      const matchesSearch = employee.staff?.full_name
        ?.toLowerCase()
        .includes(searchEmployee.toLowerCase());

      const matchesPosition =
        positionFilter === "All Position" ||
        employee.staff?.position === positionFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        employee.staff?.status === statusFilter;

      return (
        matchesEmployment && matchesSearch && matchesPosition && matchesStatus
      );
    });
  }, [
    salaryEmployees,
    employmentFilter,
    searchEmployee,
    positionFilter,
    statusFilter,
  ]);

  // ========================================
  // POSITION OPTIONS
  // ========================================

  const positionOptions = useMemo(() => {
    return [
      "All Position",
      ...new Set(
        salaryEmployees
          .map((employee) => employee.staff?.position)
          .filter(Boolean),
      ),
    ];
  }, [salaryEmployees]);

  // ========================================
  // STATUS OPTIONS
  // ========================================

  const statusOptions = useMemo(() => {
    return [
      "All Status",
      ...new Set(
        salaryEmployees
          .map((employee) => employee.staff?.status)
          .filter(Boolean),
      ),
    ];
  }, [salaryEmployees]);

  // ========================================
  // STAFF OPTIONS (untuk dropdown Create/Edit)
  // Diambil dari data payroll yang sudah ada karena tidak ada
  // staff API terpisah di halaman ini.
  // ========================================

  const staffOptions = useMemo(() => {
    const map = new Map();

    salaryEmployees.forEach((employee) => {
      if (employee.staff?.id && !map.has(employee.staff.id)) {
        map.set(employee.staff.id, employee.staff);
      }
    });

    return Array.from(map.values());
  }, [salaryEmployees]);

  // ========================================
  // PAYROLL CALCULATION
  // ========================================

  const totalEmployee = salaryEmployees.length;

  const paidEmployees = salaryEmployees.filter(
    (employee) => employee.paymentStatus === "Paid",
  );

  const pendingEmployees = salaryEmployees.filter(
    (employee) => employee.paymentStatus === "Pending",
  );

  const paidThisMonth = paidEmployees.length;

  const pendingPayment = pendingEmployees.length;

  // ========================================
  // PAYROLL COMPONENT
  // ========================================

  const totalBasicSalary = salaryEmployees.reduce(
    (total, employee) => total + employee.basicSalary,
    0,
  );

  const totalAllowance = salaryEmployees.reduce(
    (total, employee) => total + employee.allowance,
    0,
  );

  const totalOvertime = salaryEmployees.reduce(
    (total, employee) => total + employee.overtime,
    0,
  );

  const totalBonus = salaryEmployees.reduce(
    (total, employee) => total + employee.bonus,
    0,
  );

  const totalDeduction = salaryEmployees.reduce(
    (total, employee) => total + employee.deduction,
    0,
  );

  // ========================================
  // TOTAL PAYROLL
  // ========================================

  const totalPayroll = salaryEmployees.reduce(
    (total, employee) => total + employee.totalSalary,
    0,
  );

  // ========================================
  // PAID PAYROLL
  // ========================================

  const totalPaidPayroll = paidEmployees.reduce(
    (total, employee) => total + employee.totalSalary,
    0,
  );

  // ========================================
  // PENDING PAYROLL
  // ========================================

  const totalPendingPayroll = pendingEmployees.reduce(
    (total, employee) => total + employee.totalSalary,
    0,
  );

  // ========================================
  // AVERAGE SALARY
  // ========================================

  const averageSalary = totalEmployee > 0 ? totalPayroll / totalEmployee : 0;

  // ========================================
  // HIGHEST SALARY
  // ========================================

  const highestSalaryEmployee = salaryEmployees.reduce((highest, employee) => {
    if (!highest) {
      return employee;
    }

    return employee.totalSalary > highest.totalSalary ? employee : highest;
  }, null);

  // ========================================
  // FORMAT PAYROLL DATE
  // ========================================

  const formatPayrollDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ========================================
  // CREATE / EDIT / DELETE HANDLERS (BARU)
  // ========================================

  const openCreateModal = () => {
    setModalMode("create");
    setEditingId(null);
    setFormData(emptyForm);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (employee) => {
    setModalMode("edit");
    setEditingId(employee.id);
    setFormData({
      staffId: employee.staffId || "",
      period: employee.period || "",
      paymentDate: employee.payDate
        ? String(employee.payDate).slice(0, 10)
        : "",
      basicSalary: employee.basicSalary ?? "",
      allowance: employee.allowance ?? "",
      overtime: employee.overtime ?? "",
      bonus: employee.bonus ?? "",
      deduction: employee.deduction ?? "",
      status: employee.paymentStatus || "Pending",
      notes: employee.notes || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setFormError("");
  };

  const handleFormChange = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const previewTotal =
    Number(formData.basicSalary || 0) +
    Number(formData.allowance || 0) +
    Number(formData.overtime || 0) +
    Number(formData.bonus || 0) -
    Number(formData.deduction || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.staffId) {
      setFormError(
        t("salary.selectEmployeeRequired") || "Please select an employee.",
      );
      return;
    }

    if (!formData.period) {
      setFormError(
        t("salary.periodRequired") || "Please fill in the payroll period.",
      );
      return;
    }

    const payload = {
      staff_id: formData.staffId,
      payroll_period: formData.period,
      payment_date: formData.paymentDate || null,
      basic_salary: Number(formData.basicSalary || 0),
      allowance: Number(formData.allowance || 0),
      overtime: Number(formData.overtime || 0),
      bonus: Number(formData.bonus || 0),
      deduction: Number(formData.deduction || 0),
      status: formData.status,
      notes: formData.notes,
    };

    try {
      setIsSubmitting(true);
      setFormError("");

      if (modalMode === "create") {
        const created = await createPayroll(payload);
        const createdData = created?.data || created;

        setPayrolls((previous) => [...previous, createdData]);
      } else {
        const updated = await updatePayroll(editingId, payload);
        const updatedData = updated?.data || updated;

        setPayrolls((previous) =>
          previous.map((payroll) =>
            payroll.id === editingId ? { ...payroll, ...updatedData } : payroll,
          ),
        );
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save payroll:", err);
      setFormError(err?.message || "Failed to save payroll data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (employee) => {
    setDeleteTarget(employee);
  };

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);

      await deletePayroll(deleteTarget.id);

      setPayrolls((previous) =>
        previous.filter((payroll) => payroll.id !== deleteTarget.id),
      );

      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete payroll:", err);
      setError(err?.message || "Failed to delete payroll data.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="salary-page">
        <div className="salary-empty">Loading payroll data...</div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="salary-page">
        <div className="salary-empty">{error}</div>
      </div>
    );
  }
  return (
    <div className="salary-page">
      {/* Greeting */}
      <div className="salary-greeting">
        <div className="greeting">
          <h2>
            {t("salary.title")} <span className="wave">👋</span>
          </h2>

          <p>{t("salary.greeting")}</p>
        </div>

        <div className="salary-greeting-actions">
          <button className="salary-add-button" onClick={openCreateModal}>
            <MdAdd />
            <span>{t("salary.addSalary") || "Add Salary"}</span>
          </button>

          <button className="salary-pdf-button">{t("salary.exportPdf")}</button>
        </div>
      </div>

      {/* Salary Layout */}
      <div className="salary-layout">
        {/* =========================
      LEFT COLUMN
  ========================== */}

        <div className="salary-left-column">
          {/* 4 CARDS */}

          <div className="salary-stat-grid">
            {/* Total Payroll */}
            <div className="salary-stat-card">
              <div className="salary-stat-header">
                <div className="salary-icon payroll-icon">
                  <MdAttachMoney />
                </div>

                <span className="salary-stat-title">
                  {t("salary.totalPayroll")}
                </span>
              </div>

              <div className="salary-stat-value">
                {formatCurrency(totalPayroll)}
              </div>

              <div className="salary-stat-footer payroll-footer">
                ▲ 18,6% <span>vs Jun 2026</span>
              </div>
            </div>

            {/* Total Employee */}
            <div className="salary-stat-card">
              <div className="salary-stat-header">
                <div className="salary-icon employee-icon">
                  <MdPeople />
                </div>

                <span className="salary-stat-title">
                  {t("salary.totalEmployee")}
                </span>
              </div>

              <div className="salary-stat-value">{totalEmployee}</div>

              <div className="salary-stat-footer employee-footer">
                ▲ 4,3% <span>vs Jun 2026</span>
              </div>
            </div>

            {/* Paid This Month */}
            <div className="salary-stat-card">
              <div className="salary-stat-header">
                <div className="salary-icon paid-icon">
                  <MdCheckCircle />
                </div>

                <span className="salary-stat-title">
                  {t("salary.paidThisMonth")}
                </span>
              </div>

              <div className="salary-stat-value">
                {formatCurrency(
                  salaryEmployees
                    .filter((employee) => employee.paymentStatus === "Paid")
                    .reduce((sum, employee) => sum + employee.totalSalary, 0),
                )}
              </div>

              <div className="salary-stat-footer paid-footer">
                ▲ 12,8% <span>vs Jun 2026</span>
              </div>
            </div>

            {/* Pending Payment */}
            <div className="salary-stat-card">
              <div className="salary-stat-header">
                <div className="salary-icon pending-icon">
                  <MdPendingActions />
                </div>

                <span className="salary-stat-title">
                  {t("salary.pendingPayment")}
                </span>
              </div>

              <div className="salary-stat-value">
                {formatCurrency(
                  salaryEmployees
                    .filter((employee) => employee.paymentStatus === "Pending")
                    .reduce((sum, employee) => sum + employee.totalSalary, 0),
                )}
              </div>

              <div className="salary-stat-footer pending-footer">
                ▼ 8,2% <span>vs Jun 2026</span>
              </div>
            </div>
          </div>

          {/* EMPLOYEE SALARY */}

          <div className="employee-salary-card">
            {/* ========================================
      HEADER
  ======================================== */}

            <div className="employee-salary-header">
              <div>
                <h3>{t("salary.employeeSalary")}</h3>

                <p>{t("salary.employeeSalaryDescription")}</p>
              </div>
            </div>

            {/* ========================================
      FILTER
  ======================================== */}

            <div className="employee-salary-filter">
              {/* Employment Type */}
              <div className="employment-filter">
                {["All Employee", "Full Time", "Part Time", "Contract"].map(
                  (type) => (
                    <button
                      key={type}
                      className={
                        employmentFilter === type
                          ? "employment-filter-btn active"
                          : "employment-filter-btn"
                      }
                      onClick={() => setEmploymentFilter(type)}
                    >
                      {type}
                    </button>
                  ),
                )}
              </div>

              {/* Search */}
              <div className="salary-search">
                <input
                  type="text"
                  placeholder="Search Employee..."
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                />
              </div>

              {/* Position */}
              <select
                className="salary-select"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
              >
                {positionOptions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>

              {/* Status */}
              <select
                className="salary-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              {/* Reset Filter */}
              <button
                className="salary-reset-button"
                onClick={() => {
                  setEmploymentFilter("All Employee");
                  setSearchEmployee("");
                  setPositionFilter("All Position");
                  setStatusFilter("All Status");
                }}
              >
                {t("salary.resetFilter")}
              </button>
            </div>

            {/* ========================================
      TABLE
  ======================================== */}

            <div className="employee-salary-table-wrapper">
              <table className="employee-salary-table">
                <thead>
                  <tr>
                    <th>{t("salary.employee")}</th>

                    <th>{t("salary.position")}</th>

                    <th>{t("salary.status")}</th>

                    <th>{t("salary.basicSalary")}</th>

                    <th>{t("salary.allowance")}</th>

                    <th>{t("salary.deduction")}</th>

                    <th>{t("salary.totalSalary")}</th>

                    <th>{t("salary.paymentStatus")}</th>

                    <th className="actions-column">
                      {t("salary.actions") || "Actions"}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <tr key={employee.id}>
                        {/* Employee */}

                        <td>
                          <div className="salary-employee">
                            <img
                              src={
                                employee.staff?.photo || "/default-avatar.png"
                              }
                              alt={employee.staff?.full_name || "-"}
                            />

                            <span>{employee.staff?.full_name || "-"}</span>
                          </div>
                        </td>

                        {/* Position */}

                        <td>
                          <span
                            className={`salary-status ${String(
                              employee.staff?.position || "",
                            )
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {employee.staff?.position || "-"}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`salary-status ${String(
                              employee.staff?.status || "",
                            )
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {employee.staff?.status || "-"}
                          </span>
                        </td>
                        {/* Basic Salary */}

                        <td>{formatCurrency(employee.basicSalary)}</td>

                        {/* Allowance */}

                        <td>{formatCurrency(employee.allowance)}</td>

                        {/* Deduction */}

                        <td>{formatCurrency(employee.deduction)}</td>

                        {/* Total Salary */}

                        <td className="total-salary">
                          {formatCurrency(employee.totalSalary)}
                        </td>

                        {/* Payment Status */}

                        <td>
                          <span
                            className={`payment-status ${employee.paymentStatus.toLowerCase()}`}
                          >
                            {employee.paymentStatus}
                          </span>
                        </td>

                        {/* Actions (BARU) */}
                        <td className="actions-column">
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="action-btn edit"
                              title={t("salary.edit") || "Edit"}
                              onClick={() => openEditModal(employee)}
                            >
                              <MdEdit />
                            </button>

                            <button
                              type="button"
                              className="action-btn delete"
                              title={t("salary.delete") || "Delete"}
                              onClick={() => openDeleteConfirm(employee)}
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="salary-empty">
                        {t("salary.noEmployeeFound")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAYROLL HISTORY */}
          <div className="payroll-history-card">
            <div className="payroll-history-header">
              <div>
                <h3>{t("salary.payrollHistory")}</h3>
                <p>{t("salary.payrollHistoryDescription")}</p>
              </div>
            </div>

            <div className="payroll-history-table-wrapper">
              <table className="payroll-history-table">
                <thead>
                  <tr>
                    <th>{t("salary.payrollId")}</th>
                    <th>{t("salary.period")}</th>
                    <th>{t("salary.payDate")}</th>
                    <th>{t("salary.totalEmployee")}</th>
                    <th>{t("salary.status")}</th>
                  </tr>
                </thead>

                <tbody>
                  {payrollHistory.map((payroll) => (
                    <tr key={payroll.id}>
                      <td>{payroll.id}</td>
                      <td>{payroll.period}</td>
                      <td>{formatDate(payroll.payDate)}</td>
                      <td>{payroll.totalEmployee}</td>
                      <td>
                        <span
                          className={`payroll-status ${String(
                            payroll.status || "",
                          ).toLowerCase()}`}
                        >
                          <span className="status-dot"></span>
                          {payroll.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="salary-right-column">
          <div className="payroll-summary-card">
            <h3 className="salary-card-title">{t("salary.payrollSummary")}</h3>

            {/* CHART + SUMMARY */}
            <div className="payroll-summary-content">
              {/* PIE CHART */}
              <div className="payroll-chart">
                <PieChart width={82} height={82}>
                  <Pie
                    data={[
                      {
                        name: "Basic Salary",
                        value: totalBasicSalary,
                      },
                      {
                        name: "Allowance",
                        value: totalAllowance,
                      },
                      {
                        name: "Overtime",
                        value: totalOvertime,
                      },
                      {
                        name: "Bonus",
                        value: totalBonus,
                      },
                      {
                        name: "Deduction",
                        value: totalDeduction,
                      },
                    ]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={24}
                    outerRadius={38}
                    paddingAngle={2}
                    stroke="none"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#8b5cf6" />
                  </Pie>
                </PieChart>
              </div>

              {/* SUMMARY */}
              <div className="payroll-summary-list">
                {/* BASIC */}
                <div className="summary-item">
                  <div className="summary-label">
                    <span className="summary-dot green"></span>
                    <span>{t("salary.basicSalary")}</span>
                  </div>

                  <strong>{formatCurrency(totalBasicSalary)}</strong>
                </div>

                {/* ALLOWANCE */}
                <div className="summary-item">
                  <div className="summary-label">
                    <span className="summary-dot blue"></span>
                    <span>{t("salary.allowance")}</span>
                  </div>

                  <strong>{formatCurrency(totalAllowance)}</strong>
                </div>

                {/* DEDUCTION */}
                <div className="summary-item">
                  <div className="summary-label">
                    <span className="summary-dot purple"></span>
                    <span>{t("salary.deduction")}</span>
                  </div>

                  <strong> {formatCurrency(totalDeduction)}</strong>
                </div>

                {/* TOTAL */}
                <div className="summary-item">
                  <div className="summary-label">
                    <span className="summary-dot red"></span>
                    <span>{t("salary.totalPayroll")}</span>
                  </div>

                  <strong>{formatCurrency(totalPayroll)}</strong>
                </div>
              </div>
            </div>

            {/* ========================================
      TOTAL EMPLOYEE + PAID
  ======================================== */}

            <div className="summary-bottom">
              {/* TOTAL EMPLOYEE */}
              <div className="summary-bottom-item">
                <div className="summary-bottom-icon employee-icon">
                  <MdPeople />
                </div>

                <div className="summary-bottom-content">
                  <span>{t("salary.totalEmployee")}</span>

                  <strong>{totalEmployee}</strong>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="summary-bottom-divider"></div>

              {/* PAID */}
              <div className="summary-bottom-item">
                <div className="summary-bottom-icon paid-icon">
                  <MdCheckCircle />
                </div>

                <div className="summary-bottom-content">
                  <span>{t("salary.paidThisMonth")}</span>

                  <strong>{paidThisMonth}</strong>
                </div>
              </div>
            </div>
          </div>
          {/* ========================================
      AVERAGE + HIGHEST SALARY
  ======================================== */}

          {/* ========================================
    AVERAGE + HIGHEST
======================================== */}

          <div className="salary-comparison-card">
            {/* AVERAGE */}

            <div className="comparison-item">
              <div className="comparison-icon average-icon">
                <MdAttachMoney />
              </div>

              <div className="comparison-content">
                <span className="comparison-title">
                  {t("salary.averageSalary")}
                </span>

                <strong className="comparison-value">
                  {formatCurrency(averageSalary)}
                </strong>

                <span className="comparison-subtitle">
                  {t("salary.perEmployee")}
                </span>
              </div>
            </div>

            <div className="comparison-divider"></div>

            {/* HIGHEST */}

            <div className="comparison-item">
              <div className="comparison-icon highest-icon">
                <MdPayments />
              </div>

              <div className="comparison-content">
                <span className="comparison-title">
                  {t("salary.highestSalary")}
                </span>

                <strong className="comparison-value">
                  {formatCurrency(highestSalaryEmployee?.totalSalary || 0)}
                </strong>

                <span className="comparison-subtitle">
                  {highestSalaryEmployee?.staff?.full_name || "-"}
                </span>

                <span className="comparison-role">
                  {highestSalaryEmployee?.staff?.position || "-"}
                </span>
              </div>
            </div>
          </div>
          <div className="payroll-component-card">
            <h3 className="salary-card-title">Payroll Component</h3>

            <div className="payroll-component-list">
              <div className="component-row">
                <span>{t("salary.basicSalary")}</span>

                <strong>{formatCurrency(totalBasicSalary)}</strong>
              </div>

              <div className="component-row">
                <span>{t("salary.allowance")}</span>

                <strong>{formatCurrency(totalAllowance)}</strong>
              </div>

              <div className="component-row">
                <span>{t("salary.overtime")}</span>

                <strong>{formatCurrency(totalOvertime)}</strong>
              </div>

              <div className="component-row">
                <span>{t("salary.deduction")}</span>

                <strong className="deduction">
                  - {formatCurrency(totalDeduction)}
                </strong>
              </div>

              <div className="component-divider"></div>

              <div className="component-row component-total">
                <span>{t("salary.totalPayroll")}</span>

                <strong>{formatCurrency(totalPayroll)}</strong>
              </div>
            </div>
          </div>
          <div className="upcoming-payment-card">
            <h3 className="salary-card-title">{t("salary.upcomingPayment")}</h3>

            {upcomingPayments.length > 0 && (
              <div className="upcoming-payment-content">
                <div className="upcoming-date-icon">
                  <MdEvent />
                </div>

                <div className="upcoming-payment-info">
                  <strong>{upcomingPayments[0].period} Payroll</strong>

                  <span>
                    {" "}
                    {formatPayrollDate(upcomingPayments[0].paymentDate)}
                  </span>
                </div>

                <div
                  className={`upcoming-status ${
                    upcomingPayments[0].status === "Paid" ? "paid" : "scheduled"
                  }`}
                >
                  <MdSchedule />

                  <span>{upcomingPayments[0].status}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================
          MODAL CREATE / EDIT (BARU)
      ======================================== */}

      {isModalOpen && (
        <div className="salary-modal-overlay" onClick={closeModal}>
          <div className="salary-modal" onClick={(e) => e.stopPropagation()}>
            <div className="salary-modal-header">
              <div className="salary-modal-heading">
                <div className="salary-modal-icon">
                  <MdLocalCafe />
                </div>
                <div>
                  <h3>
                    {modalMode === "create"
                      ? t("salary.addSalary") || "Add Salary"
                      : t("salary.editSalary") || "Edit Salary"}
                  </h3>
                  <p>
                    {modalMode === "create"
                      ? t("salary.addSalaryDescription") ||
                        "Create a new payroll entry"
                      : t("salary.editSalaryDescription") ||
                        "Update this payroll entry"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="salary-modal-close"
                onClick={closeModal}
              >
                <MdClose />
              </button>
            </div>

            <form className="salary-modal-body" onSubmit={handleSubmit}>
              <div className="salary-form-grid">
                {/* Employee */}
                <div className="salary-form-group full">
                  <label>{t("salary.employee")}</label>
                  <select
                    className="salary-select"
                    value={formData.staffId}
                    onChange={(e) =>
                      handleFormChange("staffId", e.target.value)
                    }
                    disabled={modalMode === "edit"}
                  >
                    <option value="">
                      {t("salary.selectEmployee") || "Select employee"}
                    </option>
                    {staffOptions.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Period */}
                <div className="salary-form-group">
                  <label>{t("salary.period")}</label>
                  <input
                    type="text"
                    placeholder="e.g. July 2026"
                    value={formData.period}
                    onChange={(e) => handleFormChange("period", e.target.value)}
                  />
                </div>

                {/* Payment Date */}
                <div className="salary-form-group">
                  <label>{t("salary.payDate")}</label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) =>
                      handleFormChange("paymentDate", e.target.value)
                    }
                  />
                </div>

                {/* Basic Salary */}
                <div className="salary-form-group">
                  <label>{t("salary.basicSalary")}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.basicSalary}
                    onChange={(e) =>
                      handleFormChange("basicSalary", e.target.value)
                    }
                  />
                </div>

                {/* Allowance */}
                <div className="salary-form-group">
                  <label>{t("salary.allowance")}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.allowance}
                    onChange={(e) =>
                      handleFormChange("allowance", e.target.value)
                    }
                  />
                </div>

                {/* Overtime */}
                <div className="salary-form-group">
                  <label>{t("salary.overtime")}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.overtime}
                    onChange={(e) =>
                      handleFormChange("overtime", e.target.value)
                    }
                  />
                </div>

                {/* Bonus */}
                <div className="salary-form-group">
                  <label>{t("salary.bonus") || "Bonus"}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bonus}
                    onChange={(e) => handleFormChange("bonus", e.target.value)}
                  />
                </div>

                {/* Deduction */}
                <div className="salary-form-group">
                  <label>{t("salary.deduction")}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deduction}
                    onChange={(e) =>
                      handleFormChange("deduction", e.target.value)
                    }
                  />
                </div>

                {/* Status */}
                <div className="salary-form-group">
                  <label>{t("salary.paymentStatus")}</label>
                  <select
                    className="salary-select"
                    value={formData.status}
                    onChange={(e) => handleFormChange("status", e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="salary-form-group full">
                  <label>{t("salary.notes") || "Notes"}</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => handleFormChange("notes", e.target.value)}
                  />
                </div>
              </div>

              <div className="salary-form-preview">
                <span>{t("salary.totalSalary")}</span>
                <strong>{formatCurrency(previewTotal)}</strong>
              </div>

              {formError && (
                <div className="salary-form-error">{formError}</div>
              )}

              <div className="salary-modal-footer">
                <button
                  type="button"
                  className="salary-btn-cancel"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  {t("salary.cancel") || "Cancel"}
                </button>

                <button
                  type="submit"
                  className="salary-btn-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? t("salary.saving") || "Saving..."
                    : modalMode === "create"
                      ? t("salary.save") || "Save"
                      : t("salary.update") || "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          CONFIRM DELETE (BARU)
      ======================================== */}

      {deleteTarget && (
        <div className="salary-confirm-overlay" onClick={closeDeleteConfirm}>
          <div
            className="salary-confirm-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="salary-confirm-icon">
              <MdDelete />
            </div>

            <h4>{t("salary.deleteConfirmTitle") || "Delete this payroll?"}</h4>

            <p>
              {t("salary.deleteConfirmDescription") ||
                "This action cannot be undone for"}{" "}
              <strong>{deleteTarget.staff?.full_name || "-"}</strong>.
            </p>

            <div className="salary-confirm-actions">
              <button
                type="button"
                className="salary-btn-cancel"
                onClick={closeDeleteConfirm}
                disabled={isDeleting}
              >
                {t("salary.cancel") || "Cancel"}
              </button>

              <button
                type="button"
                className="salary-btn-delete"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting
                  ? t("salary.deleting") || "Deleting..."
                  : t("salary.delete") || "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salary;
