const STORAGE_USER = "lunch_user_profile_test_v11";
const STORAGE_ORDERS = "lunch_orders_test_v11";
const STORAGE_QR = "lunch_qr_context_test_v11";

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_ORDERS) || "{}");
  } catch (error) {
    console.error("讀取訂單資料失敗：", error);
    return {};
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
}

function saveUser(user) {
  const safeUser = {
    userId: user.userId || "",
    empId: user.empId || "",
    name: user.name || "",
    nameMasked: user.nameMasked || "",
    nameEncoded: user.nameEncoded || "",
    dept: user.dept || "",
    group: user.group || "",
    role: user.role || "",
  };

  localStorage.setItem(STORAGE_USER, JSON.stringify(safeUser));
}

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USER) || "null");
  } catch (error) {
    console.error("讀取使用者資料失敗：", error);
    return null;
  }
}

function clearSavedUser() {
  localStorage.removeItem(STORAGE_USER);
}

function saveQRCodeContext(dept, group) {
  const normalizedDept = String(dept || "").trim();

  const normalizedGroup = String(group || "").trim();

  const validDepartments = ["燃料電池事業處"];

  const validGroups = [
    "生管部",
    "業務部",
    "製一氬焊部",
    "製一硬焊部",
    "製二部",
    "製三部",
    "品保部",
    "工程研發部",
  ];

  if (
    !validDepartments.includes(normalizedDept) ||
    !validGroups.includes(normalizedGroup)
  ) {
    console.warn("無效的 QR 部門或組別：", {
      dept: normalizedDept,
      group: normalizedGroup,
    });

    localStorage.removeItem(STORAGE_QR);
    return false;
  }

  const qrContext = {
    dept: normalizedDept,
    group: normalizedGroup,
  };

  localStorage.setItem(STORAGE_QR, JSON.stringify(qrContext));

  console.log("已儲存 QR Context：", qrContext);

  return true;
}

function getSavedQRCodeContext() {
  try {
    const raw = localStorage.getItem(STORAGE_QR);

    console.log("QR Context 原始資料：", raw);

    if (!raw) {
      return null;
    }

    const value = JSON.parse(raw);

    const dept = String(value?.dept || "").trim();

    const group = String(value?.group || "").trim();

    const validDepartments = ["燃料電池事業處"];

    const validGroups = [
      "生管部",
      "業務部",
      "製一氬焊部",
      "製一硬焊部",
      "製二部",
      "製三部",
      "品保部",
      "工程研發部",
    ];

    if (!validDepartments.includes(dept) || !validGroups.includes(group)) {
      console.warn("已清除無效的 QR Context：", {
        dept: dept,
        group: group,
      });

      localStorage.removeItem(STORAGE_QR);
      return null;
    }

    return {
      dept: dept,
      group: group,
    };
  } catch (error) {
    console.error("讀取 QR Code 資料失敗：", error);

    localStorage.removeItem(STORAGE_QR);
    return null;
  }
}

function clearSavedQRCodeContext() {
  localStorage.removeItem(STORAGE_QR);
}

function clearAllLunchStorage() {
  localStorage.removeItem(STORAGE_USER);
  localStorage.removeItem(STORAGE_ORDERS);
  localStorage.removeItem(STORAGE_QR);
}
