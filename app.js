const STORAGE_USER = "lunch_user_profile_v8";
const STORAGE_ORDERS = "lunch_orders_v8";

const EMPLOYEES = {
  "C5454": { name: "KOOK", role: "一般員工" },
  "A001": { name: "王小明", role: "一般員工" },
  "B001": { name: "林主管", role: "主管" },
  "C001": { name: "陳助理", role: "助理" }
};

const state = {
  step: "closed",
  dept: "",
  group: "",
  user: null,
  pendingOrder: null,
  isSubmitting: false
};

const $ = (id) => document.getElementById(id);

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function isSystemClosed() {
  if (APP_CONFIG.MODE === "TEST") return false;
  if (APP_CONFIG.MODE === "CLOSE") return true;

  const now = new Date();
  const deadline = new Date();
  deadline.setHours(APP_CONFIG.DEADLINE_HOUR, APP_CONFIG.DEADLINE_MINUTE, 0, 0);
  return now >= deadline;
}

function getStatusText() {
  if (APP_CONFIG.MODE === "TEST") return "測試模式：系統開放中";
  if (APP_CONFIG.MODE === "CLOSE") return "目前未開放訂餐";
  return isSystemClosed() ? "今日訂餐已截止" : "截止時間：10:00";
}

function getClosedReason() {
  if (APP_CONFIG.MODE === "CLOSE") return "系統已由管理端關閉";
  if (APP_CONFIG.MODE === "AUTO" && isSystemClosed()) return "已超過每日 10:00 截止時間";
  return "未開放訂餐";
}

function updateHeader() {
  $("todayText").textContent = new Date().toLocaleDateString("zh-TW", {
    year:"numeric", month:"2-digit", day:"2-digit", weekday:"long"
  });

  const status = $("systemStatusText");
  status.textContent = getStatusText();
  status.classList.toggle("closed", isSystemClosed());
}

function routeInitial() {
  updateHeader();
  cleanupLocalOrders();

  if (isSystemClosed()) {
    $("closedReason").textContent = getClosedReason();
    showPage("closed");
  } else {
    showPage("scan");
  }
}

function guardOpen() {
  updateHeader();
  if (!isSystemClosed()) return true;

  state.pendingOrder = null;
  $("closedReason").textContent = getClosedReason();
  showPage("closed");
  return false;
}

function showPage(page) {
  state.step = page;

  ["closed","scan","verify","check","order","review","done"].forEach((name) => {
    $("page-" + name).classList.toggle("hidden", name !== page);
  });

  document.querySelectorAll(".step").forEach((step) => {
    step.classList.toggle("active", step.dataset.step === page);
    if (page === "closed") step.classList.remove("active");
  });

  hideAlert();
}

function showAlert(message) {
  $("alertBox").textContent = message;
  $("alertBox").classList.remove("hidden");
}

function hideAlert() {
  $("alertBox").textContent = "";
  $("alertBox").classList.add("hidden");
}

function notice(id, type, msg) {
  $(id).innerHTML = `<div class="notice ${type}">${msg}</div>`;
}

function clearNotice(id) {
  $(id).innerHTML = "";
}

function row(label, value) {
  return `<div class="row"><span>${label}</span><strong>${value}</strong></div>`;
}

function profileHTML(user) {
  return [
    row("工號", user.empId),
    row("姓名", user.name),
    row("部門", user.dept),
    row("組別", user.group),
    row("身分", user.role)
  ].join("");
}

function getOrders() {
  try { return JSON.parse(localStorage.getItem(STORAGE_ORDERS) || "{}"); }
  catch { return {}; }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
}

function cleanupLocalOrders() {
  const orders = getOrders();
  const today = todayKey();
  const cleaned = {};

  Object.keys(orders).forEach((key) => {
    if (key.startsWith(today + "_")) cleaned[key] = orders[key];
  });

  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(cleaned));
}

function getSavedUser() {
  try { return JSON.parse(localStorage.getItem(STORAGE_USER) || "null"); }
  catch { return null; }
}

function saveUser(user) {
  localStorage.setItem(STORAGE_USER, JSON.stringify(user));
}

function maskName(name) {
  if (!name) return "";
  if (name.length <= 2) return name[0] + "○";
  return name[0] + "○" + name[name.length - 1];
}

function encodeName(name) {
  return btoa(unescape(encodeURIComponent(name)));
}

function scanQRCode() {
  if (!guardOpen()) return;

  state.dept = $("deptSelect").value;
  state.group = $("groupSelect").value;

  $("deptReadonly").value = state.dept;
  $("groupReadonly").value = state.group;
  clearNotice("verifyNotice");

  const saved = getSavedUser();

  if (saved) {
    state.user = { ...saved, dept: state.dept, group: state.group };
    $("verifyForm").classList.add("hidden");
    $("savedUserBox").classList.remove("hidden");
    $("savedUserBox").innerHTML = profileHTML(state.user);
    $("verifyDesc").textContent = "系統已讀取此裝置上次使用者資料，請確認是否正確。";
    $("verifyActions").innerHTML = `
      <button class="btn primary" id="btnStartSaved">開始點餐</button>
      <button class="btn secondary" id="btnWrongSaved">資料錯誤，重新輸入</button>
    `;
    $("btnStartSaved").addEventListener("click", confirmProfile);
    $("btnWrongSaved").addEventListener("click", resetVerify);
  } else {
    showVerifyForm();
  }

  showPage("verify");
}

function showVerifyForm() {
  $("verifyForm").classList.remove("hidden");
  $("savedUserBox").classList.add("hidden");
  $("verifyDesc").textContent = "請輸入工號與姓名，系統會比對資料庫，確認相符後才可進入點餐。";
  $("verifyActions").innerHTML = `
    <button class="btn primary" id="btnVerify">查詢</button>
    <button class="btn ghost" id="btnBackToScan">返回</button>
  `;
  $("btnVerify").addEventListener("click", verifyEmployee);
  $("btnBackToScan").addEventListener("click", () => showPage("scan"));
}

function resetVerify() {
  localStorage.removeItem(STORAGE_USER);
  state.user = null;
  $("empId").value = "";
  $("empName").value = "";
  clearNotice("verifyNotice");
  showVerifyForm();
}

function verifyEmployee() {
  if (!guardOpen()) return;

  const empId = $("empId").value.trim();
  const empName = $("empName").value.trim();

  if (!empId || !empName) {
    notice("verifyNotice", "danger", "請輸入工號與姓名。");
    return;
  }

  const found = EMPLOYEES[empId];

  if (!found) {
    notice("verifyNotice", "danger", "資料錯誤：查無此工號，請確認後重新輸入。");
    return;
  }

  if (found.name !== empName) {
    notice("verifyNotice", "danger", "資料錯誤：工號與姓名不相符，請確認後重新輸入。");
    return;
  }

  state.user = {
    empId,
    name: found.name,
    nameMasked: maskName(found.name),
    nameEncoded: encodeName(found.name),
    dept: state.dept,
    group: state.group,
    role: found.role
  };

  saveUser(state.user);

  $("savedUserBox").classList.remove("hidden");
  $("savedUserBox").innerHTML = profileHTML(state.user);
  notice("verifyNotice", "success", "資料確認成功，已自動帶入身分：" + found.role + "。");

  $("verifyActions").innerHTML = `
    <button class="btn primary" id="btnConfirmProfile">確認並開始點餐</button>
    <button class="btn secondary" id="btnWrongProfile">資料錯誤，重新輸入</button>
  `;
  $("btnConfirmProfile").addEventListener("click", confirmProfile);
  $("btnWrongProfile").addEventListener("click", resetVerify);
}

function confirmProfile() {
  if (!guardOpen()) return;
  checkTodayOrder();
  showPage("check");
}

function checkTodayOrder() {
  const orders = getOrders();
  const key = `${todayKey()}_${state.user.empId}`;
  const old = orders[key];

  if (old) {
    $("checkBox").innerHTML = profileHTML(state.user) +
      `<div class="notice warning">今日已有訂單：葷 ${old.meatQty}、素 ${old.vegQty}、外賓 ${old.guestQty}。修改後會覆蓋原資料。</div>`;
    $("checkActions").innerHTML = `
      <button class="btn primary" id="btnEditOrder">修改今日訂單</button>
      <button class="btn ghost" id="btnBackVerify">返回</button>
    `;
    $("btnEditOrder").addEventListener("click", () => startOrder(true));
  } else {
    $("checkBox").innerHTML = profileHTML(state.user) +
      `<div class="notice success">今日尚未建立訂單，可建立新訂單。</div>`;
    $("checkActions").innerHTML = `
      <button class="btn primary" id="btnNewOrder">建立新訂單</button>
      <button class="btn ghost" id="btnBackVerify">返回</button>
    `;
    $("btnNewOrder").addEventListener("click", () => startOrder(false));
  }

  $("btnBackVerify").addEventListener("click", () => showPage("verify"));
}

function getLimit() {
  return state.user.role === "主管" || state.user.role === "助理" ? 5 : 1;
}

function startOrder(isEdit) {
  if (!guardOpen()) return;

  const old = getOrders()[`${todayKey()}_${state.user.empId}`];
  const limit = getLimit();

  $("orderTitle").textContent = isEdit ? "修改今日訂單" : "建立新訂單";
  $("ruleBox").innerHTML = `目前身分：${state.user.role}｜警戒值：${limit}<br>葷食 + 素食至少 1 份，且不可超過警戒值。一般員工不可填寫外賓。`;

  $("meatQty").value = old ? old.meatQty : 0;
  $("vegQty").value = old ? old.vegQty : 0;
  $("guestQty").value = old ? old.guestQty : 0;
  $("guestQty").disabled = state.user.role === "一般員工";

  if ($("guestQty").disabled) $("guestQty").value = 0;

  validateOrder();
  showPage("order");
}

function num(id) {
  return Math.max(0, Number($(id).value || 0));
}

function validateOrder() {
  const meat = num("meatQty");
  const veg = num("vegQty");
  const guest = num("guestQty");
  const limit = getLimit();

  if (meat + veg < 1) {
    notice("orderNotice", "danger", "葷食 + 素食至少需要填寫 1 份。");
    return false;
  }

  if (meat + veg > limit) {
    notice("orderNotice", "danger", `葷食 + 素食不可超過警戒值 ${limit}。目前合計 ${meat + veg}。`);
    return false;
  }

  if (state.user.role === "一般員工" && guest > 0) {
    notice("orderNotice", "danger", "一般員工不可填寫外賓數量。");
    return false;
  }

  if (guest > 10) {
    notice("orderNotice", "warning", "外賓數量大於 10，送出前會再次確認。");
    return true;
  }

  notice("orderNotice", "success", "目前訂單符合規則。");
  return true;
}

function buildReview() {
  if (!guardOpen()) return;
  if (!validateOrder()) return;

  state.pendingOrder = {
    date: todayKey(),
    empId: state.user.empId,
    nameMasked: state.user.nameMasked,
    nameEncoded: state.user.nameEncoded,
    dept: state.user.dept,
    group: state.user.group,
    role: state.user.role,
    meatQty: num("meatQty"),
    vegQty: num("vegQty"),
    guestQty: num("guestQty"),
    updatedAt: ""
  };

  $("reviewUser").innerHTML = [
    row("工號", state.user.empId),
    row("姓名", state.user.name),
    row("部門", state.user.dept),
    row("組別", state.user.group),
    row("身分", state.user.role)
  ].join("");

  $("reviewOrder").innerHTML = [
    row("日期", state.pendingOrder.date),
    row("葷食", state.pendingOrder.meatQty),
    row("素食", state.pendingOrder.vegQty),
    row("外賓", state.pendingOrder.guestQty)
  ].join("");

  showPage("review");
}

function submitOrder() {
  if (!guardOpen()) return;
  if (!state.pendingOrder || state.isSubmitting) return;

  if (state.pendingOrder.guestQty > 10 && !confirm("外賓數量大於 10，請再次確認是否送出？")) return;

  state.isSubmitting = true;
  $("btnSubmit").disabled = true;
  $("btnSubmit").textContent = "送出中...";

  state.pendingOrder.updatedAt = new Date().toLocaleString("zh-TW");

  const orders = getOrders();
  orders[`${todayKey()}_${state.user.empId}`] = state.pendingOrder;
  saveOrders(orders);

  // Google Apps Script 預留：
  // fetch("YOUR_APPS_SCRIPT_WEB_APP_URL", {
  //   method: "POST",
  //   body: JSON.stringify(state.pendingOrder)
  // });

  setTimeout(() => {
    $("doneBox").innerHTML = [
      row("日期", state.pendingOrder.date),
      row("工號", state.pendingOrder.empId),
      row("姓名", state.user.name),
      row("部門", state.pendingOrder.dept),
      row("組別", state.pendingOrder.group),
      row("身分", state.pendingOrder.role),
      row("葷食", state.pendingOrder.meatQty),
      row("素食", state.pendingOrder.vegQty),
      row("外賓", state.pendingOrder.guestQty),
      row("送出時間", state.pendingOrder.updatedAt)
    ].join("");

    state.isSubmitting = false;
    $("btnSubmit").disabled = false;
    $("btnSubmit").textContent = "確認送出";
    showPage("done");
  }, 400);
}

function goHome() {
  state.user = null;
  state.pendingOrder = null;

  if (isSystemClosed()) {
    $("closedReason").textContent = getClosedReason();
    showPage("closed");
  } else {
    showPage("scan");
  }
}

function clearLocalData() {
  if (!confirm("確定要清除本機測試資料？")) return;
  localStorage.removeItem(STORAGE_USER);
  localStorage.removeItem(STORAGE_ORDERS);
  location.reload();
}

function bindEvents() {
  $("btnScan").addEventListener("click", scanQRCode);
  $("btnClear").addEventListener("click", clearLocalData);
  $("btnBackToCheck").addEventListener("click", () => guardOpen() && showPage("check"));
  $("btnReview").addEventListener("click", buildReview);
  $("btnEdit").addEventListener("click", () => guardOpen() && showPage("order"));
  $("btnSubmit").addEventListener("click", submitOrder);
  $("btnHome").addEventListener("click", goHome);

  ["meatQty", "vegQty", "guestQty"].forEach((id) => {
    $(id).addEventListener("input", validateOrder);
  });
}

window.addEventListener("error", (e) => {
  showAlert("系統錯誤：" + e.message);
});

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  routeInitial();

  setInterval(() => {
    updateHeader();

    if (isSystemClosed() && !["closed", "done"].includes(state.step)) {
      $("closedReason").textContent = getClosedReason();
      showPage("closed");
    }
  }, 30000);
});
