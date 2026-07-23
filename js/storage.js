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

function saveQRCodeContext(dept) {
  const value = String(dept || "").trim();

  if (!value) {
    console.warn("QR 部門為空，未儲存");

    return;
  }

  const qrContext = {
    dept: value,
  };

  localStorage.setItem(STORAGE_QR, JSON.stringify(qrContext));

  console.log("已儲存 QR Context：", qrContext);
}

function getSavedQRCodeContext() {
  try {
    const raw = localStorage.getItem(STORAGE_QR);

    console.log("QR Context 原始資料：", raw);

    if (!raw) {
      return null;
    }

    const value = JSON.parse(raw);

    if (!value || !String(value.dept || "").trim()) {
      return null;
    }

    return {
      dept: String(value.dept).trim(),
    };
  } catch (error) {
    console.error("讀取 QR Code 資料失敗：", error);

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
