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
  const qrContext = {
    dept: dept || "",
  };

  localStorage.setItem(STORAGE_QR, JSON.stringify(qrContext));
}

function getSavedQRCodeContext() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_QR) || "null");
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
