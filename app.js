const STORAGE_USER = "lunch_user_profile_v7";
const STORAGE_ORDERS = "lunch_orders_v7";
// 正式規則：每日 10:00 截止，超過後整個員工端鎖定。
// 測試時若要暫時模擬未截止，可將 TEST_FORCE_OPEN 改成 true。
const TEST_FORCE_OPEN = false;
const SYSTEM_STATUS = "AUTO"; // AUTO / OPEN / CLOSE
const DEADLINE_HOUR = 10;
const DEADLINE_MINUTE = 0;

const employees = {
  "C5454": { name: "KOOK", role: "一般員工" },
  "A001": { name: "王小明", role: "一般員工" },
  "B001": { name: "林主管", role: "主管" },
  "C001": { name: "陳助理", role: "助理" }
};

let state = {
  dept: "",
  group: "",
  user: null,
  pendingOrder: null,
  isSubmitting: false,
  currentStep: "scan
};

const $ = (id) => document.getElementById(id);

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isClosed() {
  if (TEST_FORCE_OPEN) return false;
  if (SYSTEM_STATUS === "CLOSE") return true;
  if (SYSTEM_STATUS === "OPEN") return false;

  const now = new Date();
  const deadline = new Date();
  deadline.setHours(DEADLINE_HOUR, DEADLINE_MINUTE, 0, 0);
  return now >= deadline;
}

function updateHeader() {
  $("todayText").textContent = new Date().toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long"
  });

  const text = $("deadlineText");
  if (isClosed()) {
    text.textContent = "今日訂餐已截止";
    text.classList.add("closed");
  } else {
    text.textContent = "截止時間：10:00";
    text.classList.remove("closed");
  }
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

function enforceClosedMode() {
  updateHeader();

  if (!isClosed()) return false;

  if (state.currentStep !== "closed" && state.currentStep !== "done") {
    state.pendingOrder = null;
    setStep("closed");
  }

  return true;
}

function setStep(step) {
  state.currentStep = step;

  document.querySelectorAll(".step").forEach((item) => {
    item.classList.toggle("active", item.dataset.step === step);
  });

  ["closed", "scan", "verify", "check", "order", "review", "done"].forEach((name) => {
    $("view-" + name).classList.toggle("hidden", name !== step);
  });

  if (step === "closed") {
    document.querySelectorAll(".step").forEach((item) => item.classList.remove("active"));
  }

  hideAlert();
}

function showAlert(type, message) {
  const box = $("alertBox");
  box.className = `alert ${type || ""}`;
  box.textContent = message;
}

function hideAlert() {
  const box = $("alertBox");
  box.className = "alert hidden";
  box.textContent = "";
}

function notice(targetId, type, message) {
  $(targetId).innerHTML = `<div class="notice ${type}">${message}</div>`;
}

function clearNotice(targetId) {
  $(targetId).innerHTML = "";
}

function row(label, value) {
  return `<div class="row"><span>${label}</span><span>${value}</span></div>`;
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

function orderHTML(order) {
  return [
    profileHTML(order),
    row("日期", order.date),
    row("葷食", order.meatQty),
    row("素食", order.vegQty),
    row("外賓", order.guestQty),
    row("更新時間", order.updatedAt || "-")
  ].join("");
}

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_ORDERS) || "{}");
  } catch {
    return {};
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
}

function saveUser(user) {
  localStorage.setItem(STORAGE_USER, JSON.stringify(user));
}

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USER) || "null");
  } catch {
    return null;
  }
}

function maskName(name) {
  if (!name) return "";
  if (name.length <= 2) return name[0] + "○";
  return name[0] + "○" + name[name.length - 1];
}

function encodedName(name) {
  // 測試用簡易轉碼；正式版建議由 Apps Script 做 AES 加密或權限查詢
  return btoa(unescape(encodeURIComponent(name)));
}

function scanQRCode() {
  if (enforceClosedMode()) return;

  state.dept = $("qrDept").value;
  state.group = $("qrGroup").value;

  const saved = getSavedUser();
  $("dept").value = state.dept;
  $("group").value = state.group;
  clearNotice("verifyNotice");

  if (saved) {
    state.user = { ...saved, dept: state.dept, group: state.group };
    $("verifyForm").classList.add("hidden");
    $("savedProfileBox").classList.remove("hidden");
    $("savedProfileBox").innerHTML = profileHTML(state.user);
    $("verifyDesc").textContent = "系統已讀取此裝置上次使用者資料，請確認是否正確。";
    $("verifyActions").innerHTML = `
      <button class="btn primary" id="btnStartFromSaved">開始點餐</button>
      <button class="btn secondary" id="btnWrongProfile">資料錯誤，重新輸入</button>
    `;
    $("btnStartFromSaved").addEventListener("click", confirmProfile);
    $("btnWrongProfile").addEventListener("click", resetProfileInput);
  } else {
    showVerifyInput();
  }

  setStep("verify");
}

function showVerifyInput() {
  $("verifyForm").classList.remove("hidden");
  $("savedProfileBox").classList.add("hidden");
  $("dept").value = state.dept;
  $("group").value = state.group;
  $("verifyDesc").textContent = "請輸入工號與姓名，系統會比對資料庫，確認相符後才可進入點餐。";
  $("verifyActions").innerHTML = `
    <button class="btn primary" id="btnVerify">查詢</button>
    <button class="btn ghost" id="btnBackScan">返回</button>
  `;
  $("btnVerify").addEventListener("click", verifyEmployee);
  $("btnBackScan").addEventListener("click", () => setStep("scan"));
}

function resetProfileInput() {
  localStorage.removeItem(STORAGE_USER);
  state.user = null;
  $("empId").value = "";
  $("empName").value = "";
  showVerifyInput();
  clearNotice("verifyNotice");
}

function verifyEmployee() {
  if (enforceClosedMode()) return;

  const empId = $("empId").value.trim();
  const empName = $("empName").value.trim();

  if (!empId || !empName) {
    notice("verifyNotice", "danger", "請輸入工號與姓名。");
    return;
  }

  const found = employees[empId];

  if (!found) {
    state.user = null;
    notice("verifyNotice", "danger", "資料錯誤：查無此工號，請確認後重新輸入。");
    return;
  }

  if (found.name !== empName) {
    state.user = null;
    notice("verifyNotice", "danger", "資料錯誤：工號與姓名不相符，請確認後重新輸入。");
    return;
  }

  state.user = {
    empId,
    name: found.name,
    nameEncoded: encodedName(found.name),
    nameMasked: maskName(found.name),
    dept: state.dept,
    group: state.group,
    role: found.role
  };

  saveUser(state.user);
  $("savedProfileBox").classList.remove("hidden");
  $("savedProfileBox").innerHTML = profileHTML(state.user);
  notice("verifyNotice", "success", "資料確認成功，已自動帶入身分：" + found.role + "。");

  $("verifyActions").innerHTML = `
    <button class="btn primary" id="btnConfirmProfile">確認並開始點餐</button>
    <button class="btn secondary" id="btnWrongProfile2">資料錯誤，重新輸入</button>
  `;
  $("btnConfirmProfile").addEventListener("click", confirmProfile);
  $("btnWrongProfile2").addEventListener("click", resetProfileInput);
}

function confirmProfile() {
  if (enforceClosedMode()) return;

  updateHeader();
  if (isClosed()) {
    $("orderCheckBox").innerHTML = profileHTML(state.user) +
      `<div class="notice danger">今日訂餐已截止，無法新增或修改訂單。</div>`;
    $("checkActions").innerHTML = `<button class="btn ghost" id="btnCheckBack">返回</button>`;
    $("btnCheckBack").addEventListener("click", () => setStep("verify"));
    setStep("check");
    return;
  }

  checkTodayOrder();
  setStep("check");
}

function checkTodayOrder() {
  const orders = getOrders();
  const key = `${todayKey()}_${state.user.empId}`;
  const existing = orders[key];

  if (existing) {
    $("orderCheckBox").innerHTML = profileHTML(state.user) +
      `<div class="notice warning">今日已有訂單：葷 ${existing.meatQty}、素 ${existing.vegQty}、外賓 ${existing.guestQty}。修改後會覆蓋原資料。</div>`;
    $("checkActions").innerHTML = `
      <button class="btn primary" id="btnEditOrder">修改今日訂單</button>
      <button class="btn ghost" id="btnBackVerify">返回</button>
    `;
    $("btnEditOrder").addEventListener("click", () => startOrder(true));
  } else {
    $("orderCheckBox").innerHTML = profileHTML(state.user) +
      `<div class="notice success">今日尚未建立訂單，可建立新訂單。</div>`;
    $("checkActions").innerHTML = `
      <button class="btn primary" id="btnNewOrder">建立新訂單</button>
      <button class="btn ghost" id="btnBackVerify">返回</button>
    `;
    $("btnNewOrder").addEventListener("click", () => startOrder(false));
  }

  $("btnBackVerify").addEventListener("click", () => setStep("verify"));
}

function getLimit() {
  return state.user.role === "主管" || state.user.role === "助理" ? 5 : 1;
}

function startOrder(isEdit) {
  if (enforceClosedMode()) return;

  if (isClosed()) {
    showAlert("danger", "今日訂餐已截止，無法新增或修改訂單。");
    return;
  }

  const limit = getLimit();
  const guest = $("guestQty");
  guest.disabled = state.user.role === "一般員工";

  $("orderTitle").textContent = isEdit ? "修改今日訂單" : "建立新訂單";
  $("ruleBox").innerHTML = `
    目前身分：${state.user.role}｜警戒值：${limit}<br>
    葷食 + 素食至少 1 份，且不可超過警戒值。一般員工不可填寫外賓。
  `;

  const existing = getOrders()[`${todayKey()}_${state.user.empId}`];

  $("meatQty").value = existing ? existing.meatQty : 0;
  $("vegQty").value = existing ? existing.vegQty : 0;
  $("guestQty").value = existing ? existing.guestQty : 0;

  if (guest.disabled) $("guestQty").value = 0;

  validateOrder();
  setStep("order");
}

function n(id) {
  return Math.max(0, Number($(id).value || 0));
}

function validateOrder() {
  const meat = n("meatQty");
  const veg = n("vegQty");
  const guest = n("guestQty");
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
  if (enforceClosedMode()) return;

  if (isClosed()) {
    showAlert("danger", "今日訂餐已截止，無法新增或修改訂單。");
    return;
  }

  if (!validateOrder()) return;

  state.pendingOrder = {
    date: todayKey(),
    empId: state.user.empId,
    nameMasked: state.user.nameMasked,
    nameEncoded: state.user.nameEncoded,
    dept: state.user.dept,
    group: state.user.group,
    role: state.user.role,
    meatQty: n("meatQty"),
    vegQty: n("vegQty"),
    guestQty: n("guestQty"),
    updatedAt: ""
  };

  $("reviewUserBox").innerHTML = [
    row("工號", state.user.empId),
    row("姓名", state.user.name),
    row("部門", state.user.dept),
    row("組別", state.user.group),
    row("身分", state.user.role)
  ].join("");

  $("reviewOrderBox").innerHTML = [
    row("日期", state.pendingOrder.date),
    row("葷食", state.pendingOrder.meatQty),
    row("素食", state.pendingOrder.vegQty),
    row("外賓", state.pendingOrder.guestQty)
  ].join("");

  setStep("review");
}

function confirmSubmit() {
  if (enforceClosedMode()) return;

  if (!state.pendingOrder || state.isSubmitting) return;

  if (state.pendingOrder.guestQty > 10 && !confirm("外賓數量大於 10，請再次確認是否送出？")) {
    return;
  }

  state.isSubmitting = true;
  $("btnConfirmSubmit").disabled = true;
  $("btnConfirmSubmit").textContent = "送出中...";

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
    $("btnConfirmSubmit").disabled = false;
    $("btnConfirmSubmit").textContent = "確認送出";
    setStep("done");
  }, 400);
}

function backHome() {
  state.pendingOrder = null;
  state.user = null;
  enforceClosedMode() || setStep("scan");
}

function resetAll() {
  if (!confirm("確定要清除本機測試資料？")) return;
  localStorage.removeItem(STORAGE_USER);
  localStorage.removeItem(STORAGE_ORDERS);
  location.reload();
}

function bindEvents() {
  $("btnScan").addEventListener("click", scanQRCode);
  $("btnResetAll").addEventListener("click", resetAll);
  $("btnBackCheck").addEventListener("click", () => enforceClosedMode() || setStep("check"));
  $("btnReview").addEventListener("click", buildReview);
  $("btnBackEdit").addEventListener("click", () => enforceClosedMode() || setStep("order"));
  $("btnConfirmSubmit").addEventListener("click", confirmSubmit);
  $("btnHome").addEventListener("click", backHome);

  ["meatQty", "vegQty", "guestQty"].forEach((id) => {
    $(id).addEventListener("input", validateOrder);
  });
}

window.addEventListener("error", (e) => {
  showAlert("danger", "系統錯誤：" + e.message);
});

document.addEventListener("DOMContentLoaded", () => {
  updateHeader();
  cleanupLocalOrders();
  bindEvents();
  enforceClosedMode() || setStep("scan");

  setInterval(() => {
    updateHeader();
    enforceClosedMode();
  }, 30000);
});
