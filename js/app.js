const MOCK_USERS = [
  {
    userId: "U0001",
    empId: "C5454",
    name: "KOOK",
    dept: "燃料電池生產部",
    group: "A組",
    role: "一般員工",
    enabled: true,
  },
  {
    userId: "U0002",
    empId: "B001",
    name: "林主管",
    dept: "工程部",
    group: "A組",
    role: "主管",
    enabled: true,
  },
  {
    userId: "U0003",
    empId: "C001",
    name: "陳助理",
    dept: "品保部",
    group: "A組",
    role: "助理",
    enabled: true,
  },
];
const state = {
  step: "scan",
  dept: "",
  group: "",
  user: null,
  existingOrder: null,
  pendingOrder: null,
  isSubmitting: false,
  isBusy: false,
  noLunch: false,
};
const $ = (id) => document.getElementById(id);
function on(id, event, handler) {
  const el = $(id);
  if (el) el.addEventListener(event, handler);
}
function setHTML(id, html) {
  const el = $(id);
  if (el) el.innerHTML = html;
}
function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}
function isSystemClosed() {
  if (APP_CONFIG.MODE === "TEST") return false;
  if (APP_CONFIG.MODE === "CLOSE") return true;
  const n = new Date(),
    d = new Date();
  d.setHours(APP_CONFIG.DEADLINE_HOUR, APP_CONFIG.DEADLINE_MINUTE, 0, 0);
  return n >= d;
}
function updateHeader() {

    const isMobile = window.innerWidth <= 768;

    const options = isMobile
        ? {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
        : {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            weekday: "short"
        };

    setText(
        "todayText",
        new Date().toLocaleDateString("zh-TW", options)
    );

}
function showPage(page){
    console.log("切換頁面：", page);

    state.step = page;

    ["closed","scan","verify","check","condition","weekOrder","review","done"].forEach(n=>{        
        const el = document.getElementById("page-" + n);

        console.log("page-"+n, el);

        if(el){
            el.classList.toggle("hidden", n!==page);
        }
    });

    document.querySelectorAll(".step").forEach(s=>{
        s.classList.toggle("active", s.dataset.step===page);
    });

    hideAlert();
    updateProgress(page);
}
function updateProgress(current){

  const order = [
  "verify",
  "check",
  "condition",
  "weekOrder",
  "review",
  "done"
];

  const currentIndex = order.indexOf(current);

  document.querySelectorAll(".progress-step").forEach((step,index)=>{
    step.classList.remove("done");
    step.classList.remove("active");

    if(index < currentIndex){
      step.classList.add("done");
    }

    if(index === currentIndex){
      step.classList.add("active");
    }
  });

  if(current === "done"){
    document.querySelectorAll(".progress-step").forEach(step=>{
      step.classList.remove("active");
      step.classList.add("done");
    });
  }
}
function guardOpen() {
  if (!isSystemClosed()) return true;
  showPage("closed");
  return false;
}
function showAlert(message) {
  const b = $("alertBox");
  if (!b) return;
  b.textContent = message;
  b.classList.remove("hidden");
}
function hideAlert() {
  const b = $("alertBox");
  if (!b) return;
  b.textContent = "";
  b.classList.add("hidden");
}
function notice(id, type, msg) {
  setHTML(id, `<div class="notice ${type}">${msg}</div>`);
}
function clearNotice(id) {
  setHTML(id, "");
}
function row(label, value) {
  return `<div class="row"><span>${label}</span><strong>${value ?? ""}</strong></div>`;
}
function profileHTML(u) {
  return [
    row("工號", u.empId),
    row("姓名", u.name),
    row("部門", u.dept),
    row("組別", u.group),
    row("身分", u.role),
  ].join("");
}
function renderSavedUser(u) {
  if (!u) return;

   setText("showEmpId", u.empId || "");
  setText("showEmpName", u.name || "");
  setText("showRole", u.role || "");
}
function mockApi(p) {
  return new Promise((resolve) =>
    setTimeout(() => {
      if (p.action === "verifyUser") {
        const u = MOCK_USERS.find(
          (x) => x.empId === p.empId && x.name === p.name && x.enabled,
        );
        if (!u) {
          resolve({ success: false, message: "資料錯誤：工號或姓名不相符。" });
          return;
        }
        if (u.dept !== p.dept || u.group !== p.group) {
  resolve({
    success: false,
    message: `此使用者隸屬於【${u.dept}／${u.group}】。`,
  });
  return;

        }
        resolve({ success: true, message: "驗證成功", user: u });
        return;
      }
      if (p.action === "getOrder") {
        const u = MOCK_USERS.find(
          (x) => x.empId === p.empId && x.name === p.name,
        );
        const key = `${weekKey()}_${u?.userId}`;
        const order = getOrders()[key] || null;
        resolve({ success: true, hasOrder: !!order, order });
        return;
      }
      if (p.action === "saveOrder") {
        const u = MOCK_USERS.find(
          (x) => x.empId === p.empId && x.name === p.name,
        );
        const order = {
            date: todayKey(),
            weekKey: weekKey(),
            userId: u.userId,
            empId: u.empId,
            name: u.name,
            dept: u.dept,
            group: u.group,
            role: u.role,

            defaultFactory: p.defaultFactory,
            defaultFoodType: p.defaultFoodType,
            weeklyMeals: p.weeklyMeals,

            updatedAt: new Date().toLocaleString("zh-TW")
        };
        const orders = getOrders();
        orders[`${weekKey()}_${u.userId}`] = order;
        saveOrders(orders);
        resolve({ success: true, message: "訂單已儲存", order });
        return;
      }
      resolve({ success: false, message: "未知的 action" });
    }, 300),
  );
}
async function apiPost(payload) {
  if (APP_CONFIG.USE_MOCK_API) return mockApi(payload);
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    APP_CONFIG.API_TIMEOUT_MS || 30000,
  );
  try {
    const res = await fetch(APP_CONFIG.USER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
function setButtonLoading(id, text, on) {
  const btn = $(id);
  if (!btn) return;
  if (on) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = text;
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText || btn.textContent;
    btn.disabled = false;
  }
}
function setBusy(message) {
  state.isBusy = true;

  const overlay = $("busyOverlay");
  const text = $("busyText");

  if (text) text.textContent = message || "處理中，請稍候...";
  if (overlay) overlay.classList.remove("hidden");

  document.querySelectorAll("button").forEach((btn) => {
    btn.disabled = true;
  });
}
function clearBusy() {
  state.isBusy = false;

  const overlay = $("busyOverlay");
  if (overlay) overlay.classList.add("hidden");

  document.querySelectorAll("button").forEach((btn) => {
    btn.disabled = false;
  });
}
function showConfirmDialog({
  title,
  message,
  confirmText = "確認",
  cancelText = "取消",
}) {
  return new Promise((resolve) => {
    $("dialogTitle").textContent = title;
    $("dialogMessage").textContent = message;
    $("dialogConfirm").textContent = confirmText;
    $("dialogCancel").textContent = cancelText;

    $("confirmDialog").classList.remove("hidden");

    const close = (result) => {
      $("confirmDialog").classList.add("hidden");
      $("dialogConfirm").onclick = null;
      $("dialogCancel").onclick = null;
      resolve(result);
    };

    $("dialogConfirm").onclick = () => close(true);
    $("dialogCancel").onclick = () => close(false);
  });
}
function getQRCodeParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    dept: String(params.get("dept") || "").trim(),
    group: String(params.get("group") || "").trim()
  };
}
function scanQRCode(qrDept = "", qrGroup = "") {
  state.isBusy = false;

 

  if (!guardOpen()) return;

   // 防止滑鼠事件被誤當成部門
  if (qrDept instanceof Event) {
    qrDept = "";
    qrGroup = "";
  }

  // 正式 QR Code 參數優先
  // 測試時沒有參數，才讀取下拉選單
  state.dept = String(
    qrDept || $("deptSelect")?.value || ""
  ).trim();

  state.group = String(
    qrGroup || $("groupSelect")?.value || ""
  ).trim();

  if (!state.dept || !state.group) {
    showAlert("未取得部門或組別，請重新掃描 QR Code。");
    showPage("scan");
    return;
  }
  console.log("存QR", state.dept, state.group);
  saveQRCodeContext(state.dept, state.group);
  // 寫入隱藏欄位
  $("deptReadonly").value = state.dept;
  $("groupReadonly").value = state.group;

  // 顯示本次 QR Code 的部門與組別
  setText("deptReadonlyText", state.dept);
  setText("groupReadonlyText", state.group);

  clearNotice("verifyNotice");

  // 讀取本機已儲存使用者
  const saved = getSavedUser();

  if (saved && saved.empId && saved.name) {
    // 只載入使用者資料
    state.user = {
      userId: saved.userId || "",
      empId: saved.empId,
      name: saved.name,
      nameMasked: saved.nameMasked || "",
      nameEncoded: saved.nameEncoded || "",

      // 部門與組別以本次 QR Code 為準
      dept: state.dept,
      group: state.group,

      role: saved.role || "",
    };

    // 隱藏首次輸入欄位
    $("verifyForm").classList.add("hidden");

    // 顯示已儲存使用者
    $("savedUserBox").classList.remove("hidden");
    setText("verifyTitle", "請確認您的使用者資料");

    renderSavedUser(state.user);

    setText(
      "verifyDesc",
      "已自動帶入此裝置儲存的使用者資料，請確認後開始點餐。"
    );

    setHTML(
      "verifyActions",
      `
      <button class="btn primary" id="btnStartSaved">
        開始點餐
      </button>

      <button class="btn secondary" id="btnWrongSaved">
        重建使用者
      </button>
      `
    );

    on("btnStartSaved", "click", confirmProfile);
    on("btnWrongSaved", "click", resetVerify);

  } else {
    // 沒有已儲存使用者才顯示輸入欄位
    showVerifyForm();
  }

  showPage("verify");
}
function showVerifyForm() {
  $("verifyForm").classList.remove("hidden");
  $("savedUserBox").classList.add("hidden");
  setText("verifyTitle", "請輸入您的資料（首次使用）");
  setText(
    "verifyDesc",
    "請輸入工號與姓名，系統會比對資料庫，確認相符後才可進入點餐。",
  );
  setHTML(
    "verifyActions",
    `<button class="btn primary" id="btnVerify">查詢</button><button class="btn ghost" id="btnBackToScan">返回</button>`,
  );
  on("btnVerify", "click", verifyEmployee);
  on("btnBackToScan", "click", () => showPage("scan"));
}
function resetVerify() {
  clearSavedUser();
  state.user = null;
  $("empId").value = "";
  $("empName").value = "";
  clearNotice("verifyNotice");
  showVerifyForm();
}
async function verifyEmployee() {
  if (state.isBusy) return;
  if (!guardOpen()) return;

  const empId = $("empId").value.trim();
  const empName = $("empName").value.trim();

  if (!empId || !empName) {
    notice("verifyNotice", "danger", "請輸入工號與姓名。");
    return;
  }
  setBusy("正在驗證身分，請稍候...");

  setButtonLoading("btnVerify", "驗證中...", true);
  notice("verifyNotice", "info", "資料驗證中，請稍候...");

  try {
    const result = await apiPost({
      action: "verifyUser",
      empId,
      name: empName,
      dept: state.dept,
      group: state.group,
    });

    if (!result.success) {
      notice(
        "verifyNotice",
        "danger",
        result.message || "資料錯誤：工號或姓名不相符。",
      );
      clearSavedUser();
      return;
    }

    const u = result.user;

    state.user = {
      userId: u.userId,
      empId: u.empId,
      name: u.name,
      nameMasked: maskName(u.name),
      nameEncoded: encodeName(u.name),
      dept: u.dept,
      group: u.group,
      role: u.role,
    };

    saveUser(state.user);

    $("verifyForm").classList.add("hidden");
    $("savedUserBox").classList.remove("hidden");

    renderSavedUser(state.user);
    notice(
      "verifyNotice",
      "success",
      "驗證成功，已自動帶入身分：" + state.user.role + "。",
    );

    setHTML(
      "verifyActions",
      `
      <button class="btn primary" id="btnConfirmProfile">開始點餐</button>
      <button class="btn secondary" id="btnWrongProfile">重建使用者</button>
    `,
    );

    on("btnConfirmProfile", "click", confirmProfile);
    on("btnWrongProfile", "click", resetVerify);
  } catch (e) {
    console.error(e);
    notice("verifyNotice", "danger", "無法連線至訂餐系統伺服器，請稍後再試。");
  } finally {
    setButtonLoading("btnVerify", "查詢", false);
    clearBusy();
  }
}
async function confirmProfile() {
  if (state.isBusy) return;
  if (!guardOpen()) return;

  if (!state.dept || !state.group || !state.user) {
    showAlert("資料不完整，請回到主畫面重新掃描 QR Code。");
    showPage("scan");
    return;
  }

  setBusy("正在確認使用者資料，請稍候...");

  try {
    const result = await apiPost({
      action: "verifyUser",
      empId: state.user.empId,
      name: state.user.name,
      dept: state.dept,
      group: state.group,
    });

    if (!result.success) {
  clearSavedUser();
  state.user = null;

  $("savedUserBox").classList.add("hidden");

  showVerifyForm();

  notice(
  "verifyNotice",
  "danger",
  result.message
);

  showPage("verify");
  return;
}

    await checkTodayOrder();
    showPage("check");
  } catch (e) {
    console.error("confirmProfile error:", e);
    showAlert("確認使用者資料失敗：" + e.message);
  } finally {
    clearBusy();
  }
}
async function checkTodayOrder() {
  if (!state.user) return;

  setHTML(
    "checkBox",
    `
    <div class="order-status-card loading">
      <div class="status-icon">⏳</div>
      <h3>正在確認本周訂單</h3>
      <p>系統正在查詢本周是否已有訂單...</p>
    </div>
  `,
  );

  setHTML("checkActions", "");

  try {
    const result = await apiPost({
      action: "getOrder",
      empId: state.user.empId,
      name: state.user.name,
      dept: state.dept,
      group: state.group,
      weekKey: weekKey(),
    });

    state.existingOrder = result.hasOrder ? result.order : null;

    if (result.hasOrder) {
      const old = result.order;

      setHTML(
      "checkBox",
      `
      <div class="order-status-card has-order">

      <div class="status-icon">🍱</div>

      <h3>已有訂單</h3>

      <p>您本週已建立訂單</p>

      <p>可點擊下方按鈕修改</p>

      </div>
      `
      );

      setHTML(
        "checkActions",
        `
        <button class="btn primary full-mobile" id="btnEditOrder">修改訂單</button>
        <button class="btn ghost full-mobile" id="btnBackVerify">返回</button>
      `,
      );

      on("btnEditOrder", "click", () => {
        if (state.isBusy) return;
        startOrder(true);
      });
    } else {
      setHTML(
        "checkBox",
        `
        <div class="order-status-card no-order">
          <div class="status-icon">✅</div>
          <h3>本周尚未建立訂單</h3>
        </div>
      `,
      );

      setHTML(
        "checkActions",
        `
        <button class="btn primary full-mobile" id="btnNewOrder">建立</button>
        <button class="btn ghost full-mobile" id="btnBackVerify">返回</button>
      `,
      );

      on("btnNewOrder", "click", () => {
        if (state.isBusy) return;
        startOrder(false);
      });
    }

on("btnBackVerify", "click", () => showPage("verify"));  
} catch (e) {
    console.error(e);

    setHTML(
      "checkBox",
      `
      <div class="order-status-card error">
        <div class="status-icon">⚠️</div>
        <h3>查詢失敗</h3>
        <p>無法連線至訂餐系統，請稍後再試。</p>
      </div>
    `,
    );
  }
}
/* function getLimit() {
  return state.user.role === "主管" || state.user.role === "助理" ? 5 : 1;
} */
function startOrder(isEdit) {
  if (!guardOpen()) return;

  const old = state.existingOrder;

  if (old) {
    state.pendingOrder = old;
  } else {
    state.pendingOrder = {
      date: todayKey(),
      weekKey: weekKey(),
      empId: state.user.empId,
      name: state.user.name,
      dept: state.user.dept,
      group: state.user.group,
      role: state.user.role,
      defaultFactory: "",
      defaultFoodType: "",
      weeklyMeals: {}
    };
  }
  resetConditionForm();
  showPage("condition");
}
function updateConditionState() {
  const noLunchCheckbox = $("noLunchCheckbox");
  const lunchConditionBox = $("lunchConditionBox");
  const nextButton = $("btnConditionNext");

  if (!noLunchCheckbox || !lunchConditionBox || !nextButton) {
    return;
  }

  const noLunch = noLunchCheckbox.checked;
  state.noLunch = noLunch;

  const factoryInputs = document.querySelectorAll('input[name="factory"]');

  const foodTypeInputs = document.querySelectorAll('input[name="foodType"]');

  // 勾選不訂便當：停用廠區及葷素
  factoryInputs.forEach((input) => {
    input.disabled = noLunch;
  });

  foodTypeInputs.forEach((input) => {
    input.disabled = noLunch;
  });

  lunchConditionBox.classList.toggle("condition-disabled", noLunch);

  if (noLunch) {
    // 清除原本選取的廠區與葷素
    factoryInputs.forEach((input) => {
      input.checked = false;
    });

    foodTypeInputs.forEach((input) => {
      input.checked = false;
    });

    nextButton.disabled = false;

    notice(
      "conditionNotice",
      "info",
      "已選擇本週不訂便當。下一頁僅提供「上樓用餐」及「不用餐」。",
    );

    return;
  }
  clearNotice("conditionNotice");

  const factorySelected = document.querySelector(
    'input[name="factory"]:checked',
  );

  const foodTypeSelected = document.querySelector(
    'input[name="foodType"]:checked',
  );

  // 未勾不訂便當時，兩項都必須選擇
  nextButton.disabled = !(factorySelected && foodTypeSelected);
}
function resetConditionForm() {
  state.noLunch = false;

  const noLunchCheckbox = $("noLunchCheckbox");

  if (noLunchCheckbox) {
    noLunchCheckbox.checked = false;
  }

  document
    .querySelectorAll('input[name="factory"], input[name="foodType"]')
    .forEach((input) => {
      input.checked = false;
      input.disabled = false;
    });

  $("lunchConditionBox")?.classList.remove("condition-disabled");

  clearNotice("conditionNotice");

  const nextButton = $("btnConditionNext");

  if (nextButton) {
    nextButton.disabled = true;
  }
}
function goWeekOrder() {
  if (!state.pendingOrder) {
    return;
  }

  const noLunch = $("noLunchCheckbox")?.checked === true;

  state.noLunch = noLunch;

  // 情況一：本週不訂便當
  if (noLunch) {
    state.pendingOrder.defaultFactory = "";
    state.pendingOrder.defaultFoodType = "";
    state.pendingOrder.noLunch = true;

    renderWeekOrder();
    showPage("weekOrder");
    return;
  }

  // 情況二：有訂便當，廠區與葷素都必填
  const factory = document.querySelector(
    'input[name="factory"]:checked',
  )?.value;

  const foodType = document.querySelector(
    'input[name="foodType"]:checked',
  )?.value;

  if (!factory || !foodType) {
    notice(
      "conditionNotice",
      "danger",
      "請完整選擇廠區及葷素，或勾選「本週不訂便當」。",
    );

    updateConditionState();
    return;
  }

  state.pendingOrder.defaultFactory = factory;
  state.pendingOrder.defaultFoodType = foodType;
  state.pendingOrder.noLunch = false;

  renderWeekOrder();
  showPage("weekOrder");
}

function getMealValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}
function renderWeekOrder() {
  const weeks = getThisWeekDates();
  const noLunch = state.noLunch === true;

  setHTML(
    "weekTable",
    weeks
      .map((item) => {
        const mealOptions = noLunch
          ? `
            <label>
              <input
                type="radio"
                name="meal_${item.key}"
                value="上樓用餐"
                checked
              >
              上樓用餐
            </label>

            <label>
              <input
                type="radio"
                name="meal_${item.key}"
                value="不用餐"
              >
              不用餐
            </label>
          `
          : `
            <label>
              <input
                type="radio"
                name="meal_${item.key}"
                value="便當"
                checked
              >
              便當
            </label>

            <label>
              <input
                type="radio"
                name="meal_${item.key}"
                value="上樓用餐"
              >
              上樓用餐
            </label>

            <label>
              <input
                type="radio"
                name="meal_${item.key}"
                value="不用餐"
              >
              不用餐
            </label>
          `;

        return `
          <div class="week-row">
            <div class="week-info">
              <div class="week-day">${item.day}</div>
              <div class="week-date">${item.date}</div>
            </div>

            <div class="meal-options ${noLunch ? "two-options" : ""}">
              ${mealOptions}
            </div>
          </div>
        `;
      })
      .join(""),
  );
}
/* function num(id) {
  return Math.max(0, Number($(id).value || 0));
} */
/* function validateOrder() {
  const meat = num("meatQty");
  const veg = num("vegQty");
  const guest = num("guestQty");
  const limit = getLimit();

  if (meat + veg < 1) {
    notice("orderNotice", "danger", "請至少選擇 1 份餐點。");
    return false;
  }

  if (meat + veg > limit) {
    notice("orderNotice", "danger", `葷食 或 素食合計不可超過 ${limit} 份。`);
    return false;
  }

  if (state.user.role === "一般員工" && guest > 0) {
    notice("orderNotice", "danger", "一般員工不可填寫外賓數量。");
    return false;
  }

  // 驗證成功，不顯示任何訊息
  setHTML("orderNotice", "");
  return true;
} */
/* function statCard(type, icon, label, value, unit) {
  return `<div class="stat-card ${type}"><div class="stat-label">${icon} ${label}</div><div class="stat-number">${value}</div><div class="stat-unit">${unit}</div></div>`;
} */
async function buildReview() {
  if (!guardOpen()) return;

  const factory = state.pendingOrder.defaultFactory;
  const foodType = state.pendingOrder.defaultFoodType;

  const weeks = getThisWeekDates();

const weeklyMeals = {
  monday: {
    date: weeks[0].reviewDate,
    day: weeks[0].day,
    mealType: getMealValue("meal_mon")
  },
  tuesday: {
    date: weeks[1].reviewDate,
    day: weeks[1].day,
    mealType: getMealValue("meal_tue")
  },
  wednesday: {
    date: weeks[2].reviewDate,
    day: weeks[2].day,
    mealType: getMealValue("meal_wed")
  },
  thursday: {
    date: weeks[3].reviewDate,
    day: weeks[3].day,
    mealType: getMealValue("meal_thu")
  },
  friday: {
    date: weeks[4].reviewDate,
    day: weeks[4].day,
    mealType: getMealValue("meal_fri")
  }
};

  Object.keys(weeklyMeals).forEach(key => {
    if (weeklyMeals[key].mealType === "便當") {
      weeklyMeals[key].factory = factory;
      weeklyMeals[key].foodType = foodType;
    } else {
      weeklyMeals[key].factory = "";
      weeklyMeals[key].foodType = "";
    }
  });

  state.pendingOrder.weeklyMeals = weeklyMeals;
  state.pendingOrder.updatedAt = new Date().toLocaleString("zh-TW");

  setHTML(
  "reviewUser",
  `
  <div class="user-item">💼<span>工號</span><strong>${state.user.empId}</strong></div>
  <div class="user-item">👤<span>姓名</span><strong>${state.user.name}</strong></div>
  <div class="user-item">🏢<span>部門</span><strong>${state.user.dept}</strong></div>
  <div class="user-item">👥<span>組別</span><strong>${state.user.group}</strong></div>
  `
);

  const weekMap = [
  weeklyMeals.monday,
  weeklyMeals.tuesday,
  weeklyMeals.wednesday,
  weeklyMeals.thursday,
  weeklyMeals.friday
];

setHTML(
  "reviewOrder",
  weekMap.map((item, index) => {

    let cls = "lunch";
    let icon = "🍱";
    let text = item.mealType;

    if (item.mealType === "上樓用餐") {
      cls = "upstairs";
      icon = "👥";
      text = "上樓用餐";
    }

    if (item.mealType === "不用餐") {
      cls = "none";
      icon = "✖";
      text = "不用餐";
    }

    if (item.mealType === "便當") {
      text = `便當（${factory} ${foodType}）`;
    }

    const dateText = item.date.replace("/", "月") + "日";



return `
  <div class="review-week-row">
    <div class="review-day">${item.day}</div>
    <div class="review-date">${dateText}</div>
    <div class="meal-pill ${cls}">
      <span>${icon}</span>
      <strong>${text}</strong>
    </div>
  </div>
`;
  }).join("")
);

  showPage("review");
}
async function submitOrder() {
  if (state.isBusy) return;
  if (!guardOpen()) return;
  if (!state.pendingOrder || state.isSubmitting) return;

  state.isBusy = true;
  state.isSubmitting = true;

  setBusy("正在送出訂單，請稍候...");
  setButtonLoading("btnSubmit", "送出中...", true);

  try {
    const result = await apiPost({
      action: "saveOrder",
      empId: state.user.empId,
      name: state.user.name,
      dept: state.dept,
      group: state.group,
      weekKey: weekKey(),
      defaultFactory: state.pendingOrder.defaultFactory,
      defaultFoodType: state.pendingOrder.defaultFoodType,
      weeklyMeals: state.pendingOrder.weeklyMeals,
    });

    if (!result.success) {
      notice("orderNotice", "danger", result.message || "訂單送出失敗。");
      showPage("weekOrder");
      return;
    }

    const order = result.order || state.pendingOrder;

  

clearBusy();

const doneTime = document.getElementById("doneTime");
if (doneTime) {
  doneTime.textContent = new Date().toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

showPage("done");

setTimeout(() => {
  goHome();
}, 10000);
  } catch (e) {
    console.error(e);
    notice("orderNotice", "danger", "無法連線至訂餐系統伺服器，請稍後再試。");
    showPage("review");
  } finally {
    state.isSubmitting = false;
    setButtonLoading("btnSubmit", "確認送出", false);
    //clearBusy();
  }
}
function goHome() {

  resetOrderFlow();

  showPage("scan");
}
async function clearLocalData() {
  const ok = await showConfirmDialog({
    title: "清除本機資料",
    message: "確定要清除此裝置記憶的使用者資料嗎？",
    confirmText: "確認清除",
    cancelText: "取消",
  });

  if (!ok) return;

  clearSavedUser();
  clearSavedQRCodeContext();     
  localStorage.removeItem(STORAGE_ORDERS);

  location.reload();
}
function bindEvents() {
  const btnScan = $("btnScan");

  if (btnScan) {
    let touchHandled = false;

    // 手機觸控
    btnScan.addEventListener(
      "touchend",
      (event) => {
        event.preventDefault();

        if (touchHandled) return;

        touchHandled = true;
        scanQRCode();

        setTimeout(() => {
          touchHandled = false;
        }, 500);
      },
      { passive: false },
    );

    // 電腦滑鼠，以及不支援 touchend 的裝置
    btnScan.addEventListener("click", () => {
      if (touchHandled) return;
      scanQRCode();
    });
  }
  on("btnClear", "click", clearLocalData);
  on("btnBackToCheck", "click", () => guardOpen() && showPage("check"));
  on("noLunchCheckbox", "change", updateConditionState);

  document
    .querySelectorAll('input[name="factory"], input[name="foodType"]')
    .forEach((input) => {
      input.addEventListener("change", updateConditionState);
    });
  on("btnConditionNext", "click", goWeekOrder);
  on("btnBackToCondition", "click", () => guardOpen() && showPage("condition"));
  on("btnReview", "click", buildReview);
  on("btnEdit", "click", () => guardOpen() && showPage("weekOrder"));
  on("btnEditBottom", "click", () => guardOpen() && showPage("weekOrder"));
  on("btnSubmit", "click", submitOrder);
  on("btnHome", "click", goHome);
}
window.addEventListener("error", (e) => {
  showAlert("系統錯誤：" + e.message);
  console.error(e.error || e.message);
});
document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  updateHeader();

  if (isSystemClosed()) {
    showPage("closed");
    return;
  }

  // 先讀取正式 QR Code 網址參數
  const qrParams = getQRCodeParams();

  if (qrParams.dept && qrParams.group) {
    scanQRCode(qrParams.dept, qrParams.group);
    return;
  }

  // 網址沒有參數時，讀取上一次掃描的部門與組別
  const savedQR = getSavedQRCodeContext();

  if (savedQR && savedQR.dept && savedQR.group) {
    scanQRCode(savedQR.dept, savedQR.group);
    return;
  }

  // 完全沒有掃描紀錄，才顯示模擬掃描頁
  showPage("scan");
});
function lockButton(buttonId, text) {
  const btn = $(buttonId);
  if (!btn) return;

  btn.disabled = true;
  btn.dataset.originalText = btn.textContent;
  btn.textContent = text;
}
function beginLoading(message) {
  state.isBusy = true;

  const text = $("loadingText");
  const overlay = $("loadingOverlay");

  if (text) text.textContent = message || "處理中，請稍候...";
  if (overlay) overlay.classList.remove("hidden");

  showAlert(message || "處理中，請稍候...");
}

function finishLoading() {
  state.isBusy = false;

  const overlay = $("loadingOverlay");
  if (overlay) overlay.classList.add("hidden");

  hideAlert();
}
function resetOrderFlow() {

  state.user = null;
  state.pendingOrder = null;
  state.existingOrder = null;
  state.dept = "";
  state.group = "";
  state.isSubmitting = false;
  state.isBusy = false;

  $("deptSelect").value = "";
  $("groupSelect").value = "";
  $("empId").value = "";
  $("empName").value = "";

  clearNotice("verifyNotice");
  clearNotice("orderNotice");

document
.querySelectorAll('input[type="radio"]')
.forEach(r=>{

    if(r.defaultChecked){

        r.checked=true;

    }

});

}
function renderQRCodeInfo() {
  setText("deptReadonlyText", state.dept || "未取得");
  setText("groupReadonlyText", state.group || "未取得");

  const deptInput = $("deptReadonly");
  const groupInput = $("groupReadonly");

  if (deptInput) deptInput.value = state.dept || "";
  if (groupInput) groupInput.value = state.group || "";
}
