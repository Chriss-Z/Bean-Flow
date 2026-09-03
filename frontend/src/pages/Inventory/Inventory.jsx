import { useEffect, useState } from "react";

import "./Inventory.css";

import { BsBoxFill } from "react-icons/bs";
import { LuBoxes } from "react-icons/lu";
import { FiAlertTriangle } from "react-icons/fi";
import { HiMiniArchiveBoxXMark } from "react-icons/hi2";

import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaBoxes,
  FaTimes,
} from "react-icons/fa";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import Stock from "../../components/Stock/Stock";

import { useSettings } from "../../context/SettingsContext";
import { useTranslation } from "../../hooks/useTranslation";
import {
  getInventoryMovements,
  getInventoryMovementById,
} from "../../services/inventoryMovementApi";
import { getImageUrl } from "../../utils/imageUrl";
import {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  addInventoryStock,
  getMenu,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  getCategories,
} from "../../services/inventoryApi";
export default function Inventory() {
  const { t } = useTranslation();
  const { formatCurrency, hasPermission } = useSettings();

  const [stockRows, setStockRows] = useState([]);
  const [movements, setMovements] = useState([]);
  const [movementLoading, setMovementLoading] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryRows, setCategoryRows] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [itemImage, setItemImage] = useState(null);
  const [itemImagePreview, setItemImagePreview] = useState("");

  const [modalMode, setModalMode] = useState("create");

  const [actionLoading, setActionLoading] = useState(false);
  const [stockQuantity, setStockQuantity] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    stock: "",
    minimum_stock: "",
    unit: "",
    cost_per_unit: "",
    image: "",
    is_active: true,
  });

  // ==================== STATE UNTUK MENU ====================
  const [menuRows, setMenuRows] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);

  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showMenuDetailModal, setShowMenuDetailModal] = useState(false);
  const [showMenuDeleteModal, setShowMenuDeleteModal] = useState(false);
  const [menuModalMode, setMenuModalMode] = useState("create");
  const [menuActionLoading, setMenuActionLoading] = useState(false);

  const [menuImage, setMenuImage] = useState(null);
  const [menuImagePreview, setMenuImagePreview] = useState("");

  const [menuFormData, setMenuFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    price: "",
    cost_price: "",
    unit: "",
    description: "",
    image: null,
    ingredients: [],
  });
  // ============================================================

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getInventory();

      setStockRows(data);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setError(err.message || "Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };
  const fetchMovements = async () => {
    try {
      setMovementLoading(true);

      const data = await getInventoryMovements();

      setMovements(data);
    } catch (err) {
      console.error("Failed to fetch inventory movements:", err);
    } finally {
      setMovementLoading(false);
    }
  };

  // GET MENU
  const fetchMenu = async () => {
    try {
      setMenuLoading(true);
      setMenuError(null);

      const data = await getMenu();

      setMenuRows(data);
    } catch (err) {
      console.error("Failed to fetch menu:", err);
      setMenuError(err.message || "Gagal mengambil data menu");
    } finally {
      setMenuLoading(false);
    }
  };

  // GET CATEGORIES (untuk dropdown Kategori di form Menu)
  const fetchCategories = async () => {
    try {
      const data = await getCategories();

      setCategoryRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategoryRows([]);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchMovements();
    fetchMenu();
    fetchCategories();
  }, []);

  const inStock = stockRows.filter((item) => item.status === "In Stock").length;

  const lowStock = stockRows.filter(
    (item) => item.status === "Low Stock",
  ).length;

  const outOfStock = stockRows.filter(
    (item) => item.status === "Out of Stock",
  ).length;
  const totalItems = stockRows.length;

  const totalValue = stockRows.reduce(
    (total, item) => total + Number(item.total_value || 0),
    0,
  );

  const summaryData = [
    {
      name: "In Stock",
      value: inStock,
      color: "#2E7D32",
    },
    {
      name: "Low Stock",
      value: lowStock,
      color: "#F9A825",
    },
    {
      name: "Out of Stock",
      value: outOfStock,
      color: "#D32F2F",
    },
  ];
  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      stock: "",
      minimum_stock: "",
      unit: "",
      cost_per_unit: "",
      image: "",
      is_active: true,
    });

    setItemImage(null);
    setItemImagePreview("");
  };

  // RESET FORM MENU
  const resetMenuForm = () => {
    setMenuFormData({
      name: "",
      sku: "",
      category_id: "",
      price: "",
      cost_price: "",
      unit: "",
      description: "",
      image: null,
      is_active: true,
      ingredients: [],
    });

    setMenuImage(null);
    setMenuImagePreview("");
  };

  // Ambil unit ingredient otomatis dari data Inventory (tidak boleh diketik manual)
  const getIngredientUnit = (inventoryItemId) => {
    const found = stockRows.find(
      (row) => String(row.id) === String(inventoryItemId),
    );
    return found?.unit || "-";
  };

  const getIngredientName = (inventoryItemId) => {
    const found = stockRows.find(
      (row) => String(row.id) === String(inventoryItemId),
    );
    return found?.name || "-";
  };

  const handleAddIngredientRow = () => {
    console.log("EDIT MENU DATA:", menu);
    setMenuFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { inventory_item_id: "", quantity: "" },
      ],
    }));
  };

  const handleRemoveIngredientRow = (index) => {
    setMenuFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleIngredientRowChange = (index, field, value) => {
    setMenuFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const stockAlert = stockRows.filter(
    (item) => item.status === "Low Stock" || item.status === "Out of Stock",
  );
  const handleCreate = () => {
    resetForm();
    setSelectedItem(null);
    setModalMode("create");
    setShowModal(true);
  };
  const handleEdit = async (item) => {
    try {
      setActionLoading(true);

      const data = await getInventoryById(item.id);

      setSelectedItem(data);

      setFormData({
        name: data.name || "",
        sku: data.sku || "",
        description: data.description || "",
        stock: data.stock ?? "",
        minimum_stock: data.minimum_stock ?? "",
        unit: data.unit || "",
        cost_per_unit: data.cost_per_unit ?? "",
        image: data.image || "",
        is_active: data.is_active ?? true,
      });

      setItemImage(null);
      setItemImagePreview(data.image || "");

      setModalMode("edit");
      setShowModal(true);
    } catch (err) {
      console.error("Failed to get inventory:", err);
      alert(err.message || "Gagal mengambil data inventory");
    } finally {
      setActionLoading(false);
    }
  };
  const handleItemImageChange = (e) => {
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

    setItemImage(file);

    const previewUrl = URL.createObjectURL(file);
    setItemImagePreview(previewUrl);
  };
  const handleView = async (item) => {
    try {
      setActionLoading(true);

      const data = await getInventoryById(item.id);

      setSelectedItem(data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Failed to get inventory detail:", err);
      alert(err.message || "Gagal mengambil detail inventory");
    } finally {
      setActionLoading(false);
    }
  };
  const handleViewMovement = async (movement) => {
    try {
      setActionLoading(true);

      const data = await getInventoryMovementById(movement.id);

      setSelectedMovement(data);
      setShowMovementModal(true);
    } catch (err) {
      console.error("Failed to get movement detail:", err);
      alert(err.message || "Gagal mengambil detail movement");
    } finally {
      setActionLoading(false);
    }
  };
  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      setActionLoading(true);

      await deleteInventory(selectedItem.id);

      setShowDeleteModal(false);
      setSelectedItem(null);

      await fetchInventory();
    } catch (err) {
      console.error("Failed to delete inventory:", err);
      alert(err.message || "Gagal menonaktifkan inventory");
    } finally {
      setActionLoading(false);
    }
  };
  const handleAddStock = (item) => {
    setSelectedItem(item);
    setStockQuantity("");
    setShowStockModal(true);
  };
  const submitAddStock = async () => {
    if (!selectedItem) return;

    if (!stockQuantity || Number(stockQuantity) <= 0) {
      alert("Jumlah stock harus lebih dari 0.");
      return;
    }

    try {
      setActionLoading(true);
      await addInventoryStock(selectedItem.id, Number(stockQuantity));

      setShowStockModal(false);
      setSelectedItem(null);
      setStockQuantity("");

      await fetchInventory();
      await fetchMovements();
    } catch (err) {
      console.error("Failed to add stock:", err);
      alert(err.message || "Gagal menambahkan stock");
    } finally {
      setActionLoading(false);
    }
  };
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);

      const payload = new FormData();

      payload.append("name", formData.name);
      payload.append("sku", formData.sku);
      payload.append("description", formData.description || "");
      payload.append("stock", Number(formData.stock || 0));
      payload.append("minimum_stock", Number(formData.minimum_stock || 0));
      payload.append("unit", formData.unit);
      payload.append("cost_per_unit", Number(formData.cost_per_unit || 0));
      payload.append("is_active", formData.is_active ? "1" : "0");

      if (itemImage) {
        payload.append("image", itemImage);
      }

      if (modalMode === "create") {
        await createInventory(payload);
      } else {
        await updateInventory(selectedItem.id, payload);
      }

      setShowModal(false);
      setSelectedItem(null);
      resetForm();

      await fetchInventory();
    } catch (err) {
      console.error("Failed to save inventory:", err);
      alert(err.message || "Gagal menyimpan inventory");
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== HANDLER UNTUK MENU (CRUD) ====================
  const handleMenuCreate = () => {
    resetMenuForm();
    setSelectedMenuItem(null);
    setMenuModalMode("create");
    setShowMenuModal(true);
  };

  const handleMenuEdit = async (item) => {
    try {
      setMenuActionLoading(true);

      const data = await getMenuById(item.id);

      setSelectedMenuItem(data);

      const rawIngredients = data.ingredients || data.product_ingredients || [];

      setMenuFormData({
        name: data.name || "",
        sku: data.sku || "",
        category_id: String(data.category_id ?? data.category?.id ?? ""),
        price: data.price ?? "",
        cost_price: data.cost_price ?? "",
        unit: data.unit || "",
        description: data.description || "",
        image: data.image || "",
        is_active: data.is_active ?? true,
        ingredients: rawIngredients.map((ing) => ({
          inventory_item_id: String(
            ing.inventory_item_id ?? ing.inventory_item?.id ?? "",
          ),
          quantity: ing.quantity ?? "",
        })),
      });

      setMenuImage(null);
      setMenuImagePreview(data.image || "");

      setMenuModalMode("edit");
      setShowMenuModal(true);
    } catch (err) {
      console.error("Failed to get menu:", err);
      alert(err.message || "Gagal mengambil data menu");
    } finally {
      setMenuActionLoading(false);
    }
  };

  const handleMenuImageChange = (e) => {
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

    setMenuImage(file);

    const previewUrl = URL.createObjectURL(file);
    setMenuImagePreview(previewUrl);
  };

  const handleMenuView = async (item) => {
    try {
      setMenuActionLoading(true);

      const data = await getMenuById(item.id);

      setSelectedMenuItem(data);
      setShowMenuDetailModal(true);
    } catch (err) {
      console.error("Failed to get menu detail:", err);
      alert(err.message || "Gagal mengambil detail menu");
    } finally {
      setMenuActionLoading(false);
    }
  };

  const handleMenuDelete = (item) => {
    setSelectedMenuItem(item);
    setShowMenuDeleteModal(true);
  };

  const confirmMenuDelete = async () => {
    if (!selectedMenuItem) return;

    try {
      setMenuActionLoading(true);

      await deleteMenu(selectedMenuItem.id);

      setShowMenuDeleteModal(false);
      setSelectedMenuItem(null);

      await fetchMenu();
    } catch (err) {
      console.error("Failed to delete menu:", err);
      alert(err.message || "Gagal menghapus menu");
    } finally {
      setMenuActionLoading(false);
    }
  };

  const handleMenuFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setMenuFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();

    try {
      setMenuActionLoading(true);

      const payload = new FormData();

      payload.append("name", menuFormData.name);
      payload.append("sku", menuFormData.sku);
      payload.append("category_id", menuFormData.category_id);
      payload.append("price", Number(menuFormData.price || 0));
      payload.append("cost_price", Number(menuFormData.cost_price || 0));
      payload.append("unit", menuFormData.unit);
      payload.append("description", menuFormData.description || "");
      payload.append("is_active", menuFormData.is_active ? "1" : "0");

      if (menuImage) {
        payload.append("image", menuImage);
      }

      menuFormData.ingredients
        .filter((ing) => ing.inventory_item_id && ing.quantity)
        .forEach((ing, idx) => {
          payload.append(
            `ingredients[${idx}][inventory_item_id]`,
            ing.inventory_item_id,
          );
          payload.append(`ingredients[${idx}][quantity]`, Number(ing.quantity));
        });

      if (menuModalMode === "create") {
        await createMenu(payload);
      } else {
        await updateMenu(selectedMenuItem.id, payload);
      }

      setShowMenuModal(false);
      setSelectedMenuItem(null);
      resetMenuForm();

      await fetchMenu();
    } catch (err) {
      console.error("Failed to save menu:", err);
      alert(err.message || "Gagal menyimpan menu");
    } finally {
      setMenuActionLoading(false);
    }
  };
  // ======================================================================

  return (
    <div className="inventory">
      <div className="greeting">
        <h2>
          {t("inventory.title")} <span className="wave">👋</span>
        </h2>
        <p>{t("inventory.subtitle")}</p>
      </div>

      <div className="inventory-layout">
        <div className="inventory-left">
          <div className="inventory-stats">
            <div className="card stat-card">
              <div className="card-content">
                <div className="icon-box product">
                  <BsBoxFill />
                </div>

                <div className="card-info">
                  <span className="card-title">{t("inventory.totalItem")}</span>
                  <h2>{stockRows.length}</h2>
                  <p className="card-desc">{t("inventory.allItems")}</p>
                </div>
              </div>
            </div>
            <div className="card stat-card">
              <div className="card-content">
                <div className="icon-box category">
                  <LuBoxes />
                </div>

                <div className="card-info">
                  <span className="card-title">{t("inventory.inStock")}</span>
                  <h2>{inStock}</h2>
                  <p className="card-desc">{t("inventory.sufficientStock")}</p>
                </div>
              </div>
            </div>
            <div className="card stat-card">
              <div className="card-content">
                <div className="icon-box warning">
                  <FiAlertTriangle />
                </div>

                <div className="card-info">
                  <span className="card-title">{t("inventory.lowStock")}</span>
                  <h2>{lowStock}</h2>
                  <p className="card-desc">{t("inventory.runningLow")}</p>
                </div>
              </div>
            </div>
            <div className="card stat-card">
              <div className="card-content">
                <div className="icon-box archive">
                  <HiMiniArchiveBoxXMark />
                </div>

                <div className="card-info">
                  <span className="card-title">
                    {t("inventory.outOfStock")}
                  </span>
                  <h2>{outOfStock}</h2>
                  <p className="card-desc">{t("inventory.itemsOutOfStock")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card inventory-table-card">
            {/* =================== BAGIAN MENU =================== */}
            <div className="table-header">
              <div>
                <h3>Menu</h3>
                <p>Kelola daftar menu yang tersedia</p>
              </div>

              <div className="table-toolbar">
                {hasPermission("menu", "create") ? (
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={handleMenuCreate}
                  >
                    <FaPlus /> Tambah Menu
                  </button>
                ) : null}
              </div>
            </div>

            <div className="menu-grid">
              {menuLoading ? (
                <div className="menu-empty">Memuat menu...</div>
              ) : menuError ? (
                <div className="menu-empty">{menuError}</div>
              ) : menuRows.length === 0 ? (
                <div className="menu-empty">Belum ada menu.</div>
              ) : (
                menuRows.map((item) => (
                  <div className="menu-card" key={item.id}>
                    <div className="menu-card-image">
                      {item.image ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="item-image"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="menu-card-image-placeholder">
                          <BsBoxFill />
                        </div>
                      )}
                    </div>

                    <div className="menu-card-body">
                      <span className="menu-card-category">
                        {item.category?.name || "Menu"}
                      </span>
                      <h4 className="menu-card-name">{item.name}</h4>
                      <div className="menu-card-price">
                        {formatCurrency(Number(item.price || 0))}
                      </div>
                    </div>

                    <div className="menu-card-actions">
                      {hasPermission("menu", "view") && (
                        <button
                          type="button"
                          className="menu-card-btn view"
                          title="View"
                          onClick={() => handleMenuView(item)}
                        >
                          <FaEye />
                        </button>
                      )}

                      {hasPermission("menu", "edit") && (
                        <button
                          type="button"
                          className="menu-card-btn edit"
                          title="Edit"
                          onClick={() => handleMenuEdit(item)}
                        >
                          <FaEdit />
                        </button>
                      )}

                      {hasPermission("menu", "delete") && (
                        <button
                          type="button"
                          className="menu-card-btn delete"
                          title="Delete"
                          onClick={() => handleMenuDelete(item)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="table-divider" />

            {/* =================== BAGIAN INGREDIENT (TIDAK DIUBAH) =================== */}
            <div className="table-header">
              <div>
                <h3>{t("inventory.inventoryList")}</h3>
                <p>{t("inventory.manageItems")}</p>
              </div>

              <div className="table-toolbar">
                {hasPermission("inventory", "edit") ? (
                  <button
                    type="button"
                    className="stock-btn"
                    onClick={() => {
                      setSelectedItem(null);
                      setStockQuantity("");
                      setShowStockModal(true);
                    }}
                  >
                    <FaBoxes /> {t("inventory.addStock")}
                  </button>
                ) : null}
                {hasPermission("inventory", "create") ? (
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={handleCreate}
                  >
                    <FaPlus /> {t("inventory.addItem")}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="inventory-table">
              <div className="inventory-table-head">
                <div>{t("inventory.itemName")}</div>
                <div>{t("inventory.category")}</div>
                <div>{t("inventory.unit")}</div>
                <div>{t("inventory.unitCost")}</div>
                <div>{t("inventory.stock")}</div>
                <div>{t("inventory.totalValue")}</div>
                <div>{t("inventory.status")}</div>
                <div>{t("inventory.action") || "Action"}</div>
              </div>
              <div className="inventory-table-body">
                {loading ? (
                  <div className="table-empty">Loading inventory...</div>
                ) : error ? (
                  <div className="table-empty">{error}</div>
                ) : stockRows.length === 0 ? (
                  <div className="table-empty">{t("inventory.noItems")}</div>
                ) : (
                  stockRows.map((item) => (
                    <div className="inventory-table-row" key={item.id}>
                      <div className="item-info">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="item-image"
                          />
                        ) : (
                          <div className="item-image item-image-placeholder">
                            <BsBoxFill />
                          </div>
                        )}

                        <div className="item-detail">
                          <span className="item-name">{item.name}</span>

                          <button
                            type="button"
                            className="item-action-btn"
                            onClick={() => handleView(item)}
                          >
                            <FaEye />
                          </button>
                        </div>
                      </div>

                      <div className="cell-muted">
                        {item.category?.name || item.category || "-"}
                      </div>

                      <div className="cell-muted">{item.unit}</div>

                      <div className="cell-muted">
                        {formatCurrency(Number(item.cost_per_unit || 0))}
                      </div>

                      <div className="cell-strong">
                        {Number(item.stock || 0).toFixed(3)}
                      </div>

                      <div className="cell-strong">
                        {formatCurrency(Number(item.total_value || 0))}
                      </div>

                      <div>
                        <span
                          className={`status ${item.status
                            ?.toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="inventory-actions">
                        {hasPermission("inventory", "view") && (
                          <button
                            type="button"
                            className="action-btn view"
                            title="View"
                            onClick={() => handleView(item)}
                          >
                            <FaEye />
                          </button>
                        )}

                        {hasPermission("inventory", "edit") && (
                          <button
                            type="button"
                            className="action-btn edit"
                            title="Edit"
                            onClick={() => handleEdit(item)}
                          >
                            <FaEdit />
                          </button>
                        )}

                        {hasPermission("inventory", "edit") && (
                          <button
                            type="button"
                            className="action-btn stock"
                            title={t("inventory.addStock")}
                            onClick={() => handleAddStock(item)}
                          >
                            <FaBoxes />
                          </button>
                        )}

                        {hasPermission("inventory", "delete") && (
                          <button
                            type="button"
                            className="action-btn delete"
                            title="Delete"
                            onClick={() => handleDelete(item)}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="inventory-right">
          <div className="card inventory-summary">
            <div className="summary-header">
              <h3>{t("inventory.summary")}</h3>
              <span>{t("inventory.thisMonth")}</span>
            </div>

            <div className="summary-chart">
              <div className="chart-wrapper">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie
                      data={summaryData}
                      innerRadius={42}
                      outerRadius={56}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {summaryData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="summary-total">
              <span>{t("inventory.totalValue")}</span>

              <h2>{formatCurrency(totalValue)}</h2>

              <p>{t("inventory.acrossAllItems")}</p>
            </div>

            <div className="summary-list">
              {summaryData.map((item) => (
                <div className="summary-row" key={item.name}>
                  <div className="summary-left">
                    <span
                      className="legend-dot"
                      style={{ background: item.color }}
                    />

                    <span>{item.name}</span>
                  </div>

                  <div className="summary-right">
                    <strong>{item.value}</strong>

                    <span>
                      (
                      {totalItems > 0
                        ? ((item.value / totalItems) * 100).toFixed(0)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card low-stock-card">
            <div className="low-stock-header">
              <div className="low-stock-title">
                <div className="low-stock-icon">
                  <FiAlertTriangle />
                </div>

                <div>
                  <h3>{t("inventory.stockAlert")}</h3>
                  <p>{t("inventory.itemsNeedAttention")}</p>
                </div>
              </div>
            </div>

            <div className="low-stock-list">
              <Stock alertOnly={true} data={stockAlert} />
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => !actionLoading && setShowModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalMode === "create"
                  ? t("inventory.addItem")
                  : t("inventory.editItem") || "Edit Item"}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>{t("inventory.itemName")}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("inventory.unit")}</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("inventory.stock")}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    name="stock"
                    value={formData.stock}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    {t("inventory.minimumStock") || "Minimum Stock"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    name="minimum_stock"
                    value={formData.minimum_stock}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>{t("inventory.unitCost")}</label>
                  <input
                    type="number"
                    min="0"
                    name="cost_per_unit"
                    value={formData.cost_per_unit}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>{t("inventory.image") || "Image"}</label>

                  <input
                    type="file"
                    name="image"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleItemImageChange}
                  />

                  {itemImagePreview && (
                    <div className="inventory-image-preview">
                      <img
                        src={itemImagePreview}
                        alt={formData.name || "Inventory"}
                        className="item-image"
                      />
                    </div>
                  )}
                </div>

                <div className="form-group full">
                  <label>{t("inventory.description") || "Description"}</label>
                  <textarea
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group full checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleFormChange}
                    />
                    <span>{t("inventory.active") || "Active"}</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                  disabled={actionLoading}
                >
                  {t("inventory.cancel") || "Cancel"}
                </button>

                <button
                  type="submit"
                  className="btn-save"
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? t("inventory.saving") || "Saving..."
                    : t("inventory.save") || "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedItem && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t("inventory.itemDetail") || "Item Detail"}</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-top">
                {selectedItem.image ? (
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="detail-image"
                  />
                ) : (
                  <div className="detail-image detail-image-placeholder">
                    <BsBoxFill />
                  </div>
                )}

                <div>
                  <h4>{selectedItem.name}</h4>
                  <span className="detail-sku">SKU: {selectedItem.sku}</span>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-row">
                  <span>{t("inventory.category")}</span>
                  <strong>
                    {selectedItem.category?.name ||
                      selectedItem.category ||
                      "-"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>{t("inventory.unit")}</span>
                  <strong>{selectedItem.unit}</strong>
                </div>

                <div className="detail-row">
                  <span>{t("inventory.stock")}</span>
                  <strong>{Number(selectedItem.stock || 0).toFixed(3)}</strong>
                </div>

                <div className="detail-row">
                  <span>{t("inventory.minimumStock") || "Minimum Stock"}</span>
                  <strong>
                    {Number(selectedItem.minimum_stock || 0).toFixed(3)}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>{t("inventory.unitCost")}</span>
                  <strong>
                    {formatCurrency(Number(selectedItem.cost_per_unit || 0))}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>{t("inventory.totalValue")}</span>
                  <strong>
                    {formatCurrency(Number(selectedItem.total_value || 0))}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>{t("inventory.status")}</span>
                  <strong>
                    <span
                      className={`status ${selectedItem.status
                        ?.toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {selectedItem.status}
                    </span>
                  </strong>
                </div>
              </div>

              {selectedItem.description && (
                <div className="detail-description">
                  <span>{t("inventory.description") || "Description"}</span>
                  <p>{selectedItem.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showStockModal && (
        <div
          className="modal-overlay"
          onClick={() => !actionLoading && setShowStockModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t("inventory.addStock")}</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowStockModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {!selectedItem ? (
                <div className="form-group">
                  <label>{t("inventory.itemName")}</label>
                  <select
                    className="form-select"
                    value=""
                    onChange={(e) => {
                      const item = stockRows.find(
                        (row) => String(row.id) === e.target.value,
                      );
                      setSelectedItem(item || null);
                    }}
                  >
                    <option value="">
                      {t("inventory.selectItem") || "Select item"}
                    </option>
                    {stockRows.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="stock-item-preview">
                  <span>{selectedItem.name}</span>
                  <span className="stock-item-current">
                    {t("inventory.stock")}:{" "}
                    {Number(selectedItem.stock || 0).toFixed(3)}{" "}
                    {selectedItem.unit}
                  </span>
                </div>
              )}

              <div className="form-group">
                <label>{t("inventory.quantity") || "Quantity"}</label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowStockModal(false)}
                disabled={actionLoading}
              >
                {t("inventory.cancel") || "Cancel"}
              </button>

              <button
                type="button"
                className="btn-save"
                onClick={submitAddStock}
                disabled={actionLoading || !selectedItem}
              >
                {actionLoading
                  ? t("inventory.saving") || "Saving..."
                  : t("inventory.save") || "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedItem && (
        <div
          className="modal-overlay"
          onClick={() => !actionLoading && setShowDeleteModal(false)}
        >
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <FaTrash />
            </div>

            <h4>{t("inventory.deleteConfirmTitle") || "Delete this item?"}</h4>

            <p>
              {t("inventory.deleteConfirmDescription") ||
                "This action cannot be undone for"}{" "}
              <strong>{selectedItem.name}</strong>.
            </p>

            <div className="confirm-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                {t("inventory.cancel") || "Cancel"}
              </button>

              <button
                type="button"
                className="btn-delete"
                onClick={confirmDelete}
                disabled={actionLoading}
              >
                {actionLoading
                  ? t("inventory.deleting") || "Deleting..."
                  : t("inventory.delete") || "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== MODAL CREATE / EDIT MENU =================== */}
      {showMenuModal && (
        <div
          className="modal-overlay"
          onClick={() => !menuActionLoading && setShowMenuModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {menuModalMode === "create" ? "Tambah Menu" : "Edit Menu"}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowMenuModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form className="modal-body" onSubmit={handleMenuSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Nama Menu</label>
                  <input
                    type="text"
                    name="name"
                    value={menuFormData.name}
                    onChange={handleMenuFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={menuFormData.sku}
                    onChange={handleMenuFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Kategori</label>
                  <select
                    className="form-select"
                    name="category_id"
                    value={menuFormData.category_id}
                    onChange={handleMenuFormChange}
                    required
                  >
                    <option value="">Pilih Kategori</option>

                    {categoryRows.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Harga Jual</label>
                  <input
                    type="number"
                    min="0"
                    name="price"
                    value={menuFormData.price}
                    onChange={handleMenuFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Harga Modal (Cost)</label>
                  <input
                    type="number"
                    min="0"
                    name="cost_price"
                    value={menuFormData.cost_price}
                    onChange={handleMenuFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Satuan Jual (cup, pcs, dll)</label>
                  <input
                    type="text"
                    name="unit"
                    value={menuFormData.unit}
                    onChange={handleMenuFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Image</label>

                  <input
                    type="file"
                    name="image"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleMenuImageChange}
                  />

                  {menuImagePreview && (
                    <div className="inventory-image-preview">
                      <img
                        src={menuImagePreview}
                        alt={menuFormData.name || "Menu"}
                        className="item-image"
                      />
                    </div>
                  )}
                </div>

                <div className="form-group full">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    name="description"
                    value={menuFormData.description}
                    onChange={handleMenuFormChange}
                  />
                </div>

                <div className="form-group full">
                  <label>Ingredients</label>

                  {(menuFormData.ingredients || []).length === 0 ? (
                    <div className="table-empty">
                      Belum ada ingredient dipilih.
                    </div>
                  ) : (
                    menuFormData.ingredients.map((row, index) => (
                      <div className="ingredient-row" key={index}>
                        <div className="form-group" style={{ flex: 2 }}>
                          <select
                            className="form-select"
                            value={row.inventory_item_id}
                            onChange={(e) =>
                              handleIngredientRowChange(
                                index,
                                "inventory_item_id",
                                e.target.value,
                              )
                            }
                            required
                          >
                            <option value="">Pilih Ingredient</option>
                            {(stockRows || []).map((stock) => (
                              <option key={stock.id} value={stock.id}>
                                {stock.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group" style={{ flex: 1 }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Qty"
                            value={row.quantity}
                            onChange={(e) =>
                              handleIngredientRowChange(
                                index,
                                "quantity",
                                e.target.value,
                              )
                            }
                            required
                          />
                        </div>

                        <span className="stock-item-current">
                          {getIngredientUnit(row.inventory_item_id)}
                        </span>

                        <button
                          type="button"
                          className="action-btn delete"
                          title="Hapus ingredient"
                          onClick={() => handleRemoveIngredientRow(index)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    className="stock-btn"
                    onClick={handleAddIngredientRow}
                  >
                    <FaPlus /> Tambah Ingredient
                  </button>
                </div>

                <div className="form-group full checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={menuFormData.is_active}
                      onChange={handleMenuFormChange}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowMenuModal(false)}
                  disabled={menuActionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-save"
                  disabled={menuActionLoading}
                >
                  {menuActionLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================== MODAL DETAIL MENU =================== */}
      {showMenuDetailModal && selectedMenuItem && (
        <div
          className="modal-overlay"
          onClick={() => setShowMenuDetailModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Menu Detail</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowMenuDetailModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-top">
                {console.log("MENU IMAGE:", selectedMenuItem?.image)}
                {selectedMenuItem.image ? (
                  <img
                    src={`http://127.0.0.1:8001/storage/${selectedMenuItem.image}`}
                    alt={selectedMenuItem.name}
                    className="detail-image"
                  />
                ) : (
                  <div className="detail-image detail-image-placeholder">
                    <BsBoxFill />
                  </div>
                )}

                <div>
                  <h4>{selectedMenuItem.name}</h4>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-row">
                  <span>SKU</span>
                  <strong>{selectedMenuItem.sku || "-"}</strong>
                </div>

                <div className="detail-row">
                  <span>Kategori</span>
                  <strong>{selectedMenuItem.category?.name || "-"}</strong>
                </div>

                <div className="detail-row">
                  <span>Harga Jual</span>
                  <strong>
                    {formatCurrency(Number(selectedMenuItem.price || 0))}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Harga Modal</span>
                  <strong>
                    {formatCurrency(Number(selectedMenuItem.cost_price || 0))}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Satuan Jual</span>
                  <strong>{selectedMenuItem.unit || "-"}</strong>
                </div>

                <div className="detail-row">
                  <span>Status</span>
                  <strong>
                    <span
                      className={`status ${
                        selectedMenuItem.is_active ? "in-stock" : "out-of-stock"
                      }`}
                    >
                      {selectedMenuItem.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </strong>
                </div>
              </div>

              {selectedMenuItem.description && (
                <div className="detail-description">
                  <span>Description</span>
                  <p>{selectedMenuItem.description}</p>
                </div>
              )}

              {(
                selectedMenuItem.ingredients ||
                selectedMenuItem.product_ingredients ||
                []
              ).length > 0 && (
                <div className="detail-description">
                  <span>Ingredients</span>

                  <div className="detail-grid" style={{ marginTop: 8 }}>
                    {(
                      selectedMenuItem.ingredients ||
                      selectedMenuItem.product_ingredients ||
                      []
                    ).map((ing, index) => (
                      <div className="detail-row" key={index}>
                        <span>
                          {ing.inventory_item?.name ||
                            getIngredientName(ing.inventory_item_id)}
                        </span>
                        <strong>
                          {ing.quantity}{" "}
                          {ing.inventory_item?.unit ||
                            getIngredientUnit(ing.inventory_item_id)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================== MODAL HAPUS MENU =================== */}
      {showMenuDeleteModal && selectedMenuItem && (
        <div
          className="modal-overlay"
          onClick={() => !menuActionLoading && setShowMenuDeleteModal(false)}
        >
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <FaTrash />
            </div>

            <h4>Delete this menu?</h4>

            <p>
              This action cannot be undone for{" "}
              <strong>{selectedMenuItem.name}</strong>.
            </p>

            <div className="confirm-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowMenuDeleteModal(false)}
                disabled={menuActionLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-delete"
                onClick={confirmMenuDelete}
                disabled={menuActionLoading}
              >
                {menuActionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
