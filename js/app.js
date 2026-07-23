const MOCK_USERS = [
  {
    userId: "U0001",
    empId: "C5454",
    name: "KOOK",
    dept: "燃電製一部",
    group: "A組",
    role: "一般員工",
    enabled: true,
  },
  {
    userId: "U0002",
    empId: "B001",
    name: "林主管",
    dept: "燃電製二部",
    group: "A組",
    role: "主管",
    enabled: true,
  },
  {
    userId: "U0003",
    empId: "C001",
    name: "陳助理",
    dept: "燃電製三部",
    group: "A組",
    role: "助理",
    enabled: true,
  },
];
const state = {
  step: "scan",
  dept: "",
  user: null,
  existingOrder: null,
  pendingOrder: null,
  viewingExistingOrder: false,
  isSubmitting: false,
  isBusy: false,
  noLunch: false,

  systemStatus: null,
  weekHolidays: {},
  order: null,

  // 是否正在修改既有訂單
  editingExistingOrder: false,

  defaultFactory: "",
  defaultFoodType: "",
};
const $ = (id) => document.getElementById(id);
function on(id, event, handler) {
  const el = $(id);
  if (el) el.addEventListener(event, handler);
}
function setHTML(id, html) {
  const el = $(id);

  if (!el) {
    return;
  }

  el.innerHTML = html;

  if (typeof applyLanguage === "function") {
    applyLanguage(el);
  }
}
function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}
function isSystemClosed() {
  return state.systemStatus && state.systemStatus.open === false;
}

function guardOpen() {
  if (!isSystemClosed()) {
    return true;
  }

  setText("closedReason", state.systemStatus?.message || "目前未開放訂餐。");

  showPage("closed");

  return false;
}
function updateHeader() {
  const isMobile = window.innerWidth <= 768;

  const options = isMobile
    ? {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    : {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
      };

  setText(
    "todayText",
    new Date().toLocaleDateString(getCurrentLocale(), options),
  );
}
function showPage(page) {
  state.step = page;

  [
    "closed",
    "scan",
    "verify",
    "check",
    "condition",
    "weekOrder",
    "review",
    "done",
  ].forEach((name) => {
    const el = $("page-" + name);

    if (el) {
      el.classList.toggle("hidden", name !== page);
    }
  });

  document.querySelectorAll(".step").forEach((step) => {
    step.classList.toggle("active", step.dataset.step === page);
  });

  hideAlert();
  updateProgress(page);
}
function updateProgress(current) {
  const order = ["verify", "check", "condition", "weekOrder", "review", "done"];

  const currentIndex = order.indexOf(current);

  document.querySelectorAll(".progress-step").forEach((step, index) => {
    step.classList.remove("done");
    step.classList.remove("active");

    if (index < currentIndex) {
      step.classList.add("done");
    }

    if (index === currentIndex) {
      step.classList.add("active");
    }
  });

  if (current === "done") {
    document.querySelectorAll(".progress-step").forEach((step) => {
      step.classList.remove("active");
      step.classList.add("done");
    });
  }
}
function translateApiMessage(message) {
  const text = String(message || "").trim();

  if (!text) {
    return t("connectionFailed");
  }

  if (text === "此帳號已停用，請聯絡管理員。") {
    return t("accountDisabled");
  }

  if (text === "資料錯誤：工號或姓名不相符。") {
    return t("verifyFailed");
  }

  const departmentMatch = text.match(
    /您目前隸屬部門為【(.+?)】，請掃描正確部門 QR Code。/,
  );

  if (departmentMatch) {
    return t("wrongDepartment").replace(
      "{dept}",
      translateDepartment(departmentMatch[1]),
    );
  }

  const oldDepartmentMatch = text.match(/此使用者隸屬於【(.+?)】。/);

  if (oldDepartmentMatch) {
    return t("wrongDepartment").replace(
      "{dept}",
      translateDepartment(oldDepartmentMatch[1]),
    );
  }

  // 尚未建立翻譯對照的訊息，暫時原樣顯示
  return text;
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
    row(t("employeeId"), u.empId),
    row(t("employeeName"), u.name),
    row(t("department"), translateDepartment(u.dept)),
    row(t("role"), u.role),
  ].join("");
}
function renderSavedUser(u) {
  if (!u) return;

  setText("showEmpId", u.empId || "");
  setText("showEmpName", u.name || "");
  setText("showRole", u.role || "");
}
const MOCK_API_DELAY = 50;
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
        if (u.dept !== p.dept) {
          resolve({
            success: false,
            message: `此使用者隸屬於【${u.dept}】。`,
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

          updatedAt: new Date().toLocaleString("zh-TW"),
        };
        const orders = getOrders();
        orders[`${weekKey()}_${u.userId}`] = order;
        saveOrders(orders);
        resolve({ success: true, message: "訂單已儲存", order });
        return;
      }
      resolve({ success: false, message: "未知的 action" });
    }, 50),
  );
}
async function apiPost(payload) {
  const mode = APP_CONFIG.USE_MOCK_API ? "MOCK" : "正式 API";
  const startTime = performance.now();

  console.log(`[API 開始] action=${payload.action}, mode=${mode}`);

  if (APP_CONFIG.USE_MOCK_API) {
    const result = await mockApi(payload);

    console.log(
      `[API 完成] action=${payload.action}, mode=MOCK, 耗時=${Math.round(
        performance.now() - startTime,
      )}ms`,
    );

    return result;
  }

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    APP_CONFIG.API_TIMEOUT_MS || 30000,
  );

  try {
    const res = await fetch(APP_CONFIG.USER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const result = await res.json();

    console.log(
      `[API 完成] action=${payload.action}, mode=正式 API, 耗時=${Math.round(
        performance.now() - startTime,
      )}ms`,
    );

    return result;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("API 請求逾時");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
async function loadSystemStatus() {
  const result = await apiPost({
    action: "getSystemStatus",
  });

  if (!result.success) {
    throw new Error(result.message || "無法取得系統狀態");
  }

  state.systemStatus = result;

  window.lunchTargetWeekKey = result.targetWeekKey;

  if (!result.open) {
    setText("closedReason", result.message || "目前未開放訂餐。");

    showPage("closed");

    return false;
  }

  return true;
}

async function loadWeekHolidays() {
  const result = await apiPost({
    action: "getWeekHolidayStatus",
    weekKey: weekKey(),
  });

  if (!result.success) {
    throw new Error(result.message || "無法取得假日資料");
  }

  state.weekHolidays = result.days || {};

  return state.weekHolidays;
}
function setButtonLoading(id, text, on) {
  const btn = $(id);

  if (!btn) {
    return;
  }

  btn.textContent = text;
  btn.disabled = on;
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
  };
}
async function scanQRCode(qrDept = "") {
  state.isBusy = false;

  if (!guardOpen()) return;

  // 防止滑鼠事件被誤當成部門
  if (qrDept instanceof Event) {
    qrDept = "";
  }

  // 正式 QR Code 參數優先
  // 測試時沒有參數，才讀取下拉選單
  state.dept = String(qrDept || $("deptSelect")?.value || "").trim();

  /*  state.group = String(
    qrGroup || $("groupSelect")?.value || ""
  ).trim(); */

  if (!state.dept) {
    showAlert("未取得部門或組別，請重新掃描 QR Code。");
    showPage("scan");
    return;
  }
  console.log("存QR", state.dept);
  saveQRCodeContext(state.dept);
  // 寫入隱藏欄位
  // 寫入隱藏欄位
  const deptReadonly = $("deptReadonly");

  if (deptReadonly) {
    deptReadonly.value = state.dept;
  }
  // 顯示本次 QR Code 的部門與組別
  setText("deptReadonlyText", translateDepartment(state.dept));

  clearNotice("verifyNotice");

  // 讀取本機已儲存使用者
  const saved = getSavedUser();

    if (
    saved &&
    saved.empId &&
    saved.name
  ) {
    state.user = {
      userId:
        saved.userId || "",

      empId:
        saved.empId,

      name:
        saved.name,

      nameMasked:
        saved.nameMasked || "",

      nameEncoded:
        saved.nameEncoded || "",

      // 必須使用本次掃描的 QR 部門
      dept:
        state.dept,

      group:
        saved.group || "",

      role:
        saved.role || "",
    };

    renderSavedUser(state.user);

    /*
     * 有本機使用者資料時，
     * 直接向後端重新驗證並查詢訂單。
     */
    setBusy(t("checkingOrder"));

    try {
      const success =
        await checkTodayOrder();

      if (
        success &&
        state.step !== "review"
      ) {
        showPage("check");
      }
    } catch (error) {
      console.error(
        "自動恢復訂單失敗：",
        error
      );

      showVerifyForm();

      notice(
        "verifyNotice",
        "danger",
        t("connectionFailed")
      );

      showPage("verify");
    } finally {
      clearBusy();
    }

    return;
  }

  /*
   * 沒有已儲存使用者，
   * 才顯示首次輸入畫面。
   */
  showVerifyForm();
  showPage("verify");
}
function showVerifyForm() {
  $("verifyForm").classList.remove("hidden");
  $("savedUserBox").classList.add("hidden");
  setText("verifyTitle", t("firstUseTitle"));
  setText("verifyDesc", t("firstUseDescription"));
  setHTML(
    "verifyActions",
    `
  <button
    class="btn primary"
    id="btnVerify"
    data-i18n="query"
  >
    查詢
  </button>
  `,
  );

  on("btnVerify", "click", verifyEmployee);
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
    notice("verifyNotice", "danger", t("enterEmployeeInfo"));
    return;
  }
  setBusy(t("validatingUser"));
  setButtonLoading("btnVerify", t("verifying"), true);
  notice("verifyNotice", "info", t("verificationInProgress"));
  try {
    const result = await apiPost({
      action: "verifyUser",
      empId,
      name: empName,
      dept: state.dept,
    });

    if (!result.success) {
      notice(
        "verifyNotice",
        "danger",
        translateApiMessage(result.message || "資料錯誤：工號或姓名不相符。"),
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
    notice("verifyNotice", "success", t("verifySuccess"));

    setHTML(
      "verifyActions",
      `
  <button
    class="btn primary"
    id="btnConfirmProfile"
    data-i18n="startOrder"
  >
    開始點餐
  </button>

  <button
    class="btn secondary"
    id="btnWrongProfile"
    data-i18n="rebuildUser"
  >
    重建使用者
  </button>
  `,
    );

    on("btnConfirmProfile", "click", confirmProfile);
    on("btnWrongProfile", "click", resetVerify);
  } catch (e) {
    console.error(e);
    notice("verifyNotice", "danger", t("connectionFailed"));
  } finally {
    setButtonLoading("btnVerify", t("query"), false);
    clearBusy();
  }
}
async function confirmProfile() {
  if (state.isBusy) return;
  if (!guardOpen()) return;

  if (!state.dept || !state.user) {
    showAlert("資料不完整，請回到主畫面重新掃描 QR Code。");

    showPage("scan");
    return;
  }

  setBusy(t("recheckingUser"));
  try {
        const success =
      await checkTodayOrder();

    /*
     * 已有訂單時，
     * checkTodayOrder 已經切到 Review，
     * 不要再覆蓋成 check。
     */
    if (
      success &&
      state.step !== "review"
    ) {
      showPage("check");
    }
   } catch (error) {
    console.error("confirmProfile error:", error);

    showAlert("核對使用者資料失敗：" + (error.message || "未知錯誤"));
  } finally {
    clearBusy();
  }
}
async function checkTodayOrder() {
  if (!state.user) {
    return false;
  }

  setHTML(
    "checkBox",
    `
  <div class="order-status-card loading">
    <div class="status-icon">⏳</div>

    <h3 data-i18n="checkingOrder">
      正在確認下週訂單
    </h3>

    <p data-i18n="checkingOrderDescription">
      系統正在重新核對身分並查詢下週訂單...
    </p>
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
      weekKey: weekKey(),
    });

    /*
     * getOrder 後端會先執行 verifyUser。
     * 所以這裡同時完成：
     * 1. 核對工號與姓名
     * 2. 核對啟用狀態
     * 3. 核對 QR Code 部門
     * 4. 查詢下週訂單
     */
    if (!result.success) {
      const errorMessage = translateApiMessage(
        result.message || "資料錯誤：工號或姓名不相符。",
      );

      // 驗證失敗代表 localStorage 資料不可繼續使用
      clearSavedUser();

      state.user = null;
      state.existingOrder = null;
      state.pendingOrder = null;

      // 切回首次輸入畫面
      showVerifyForm();

      notice("verifyNotice", "danger", errorMessage);

      showPage("verify");

      return false;
    }

    state.existingOrder = result.hasOrder ? result.order : null;

        state.existingOrder =
      result.hasOrder
        ? result.order
        : null;

    /*
     * 已有訂單：
     * 直接顯示 Review。
     */
    if (
      result.hasOrder &&
      result.order
    ) {
      state.pendingOrder =
        JSON.parse(
          JSON.stringify(result.order)
        );

      state.order =
        result.order;

      renderReviewFromOrder(
        state.pendingOrder,
        {
          isExistingOrder: true,
        }
      );

      return true;
    }

    /*
     * 沒有訂單：
     * 顯示建立訂單畫面。
     */
    state.pendingOrder = null;
    state.viewingExistingOrder = false;

    setHTML(
      "checkBox",
      `
        <div class="order-status-card no-order">
          <div class="status-icon">✅</div>

          <h3 data-i18n="noExistingOrder">
            下週尚未建立訂單
          </h3>
        </div>
      `,
    );

    setHTML(
      "checkActions",
      `
        <button
          class="btn primary full-mobile"
          id="btnNewOrder"
          data-i18n="createOrder"
        >
          建立
        </button>

        <button
          class="btn ghost full-mobile"
          id="btnBackVerify"
          data-i18n="back"
        >
          返回
        </button>
      `,
    );

    on(
      "btnNewOrder",
      "click",
      function () {
        if (state.isBusy) {
          return;
        }

        startOrder(false);
      }
    );

    on(
      "btnBackVerify",
      "click",
      function () {
        showPage("verify");
      }
    );

    return true;
  } catch (error) {
    console.error("checkTodayOrder error:", error);

    setHTML(
      "checkBox",
      `
      <div class="order-status-card error">
        <div class="status-icon">⚠️</div>
        <h3 data-i18n="queryFailed">
  查詢失敗
</h3>

<p data-i18n="connectionFailed">
  無法連線至訂餐系統，請稍後再試。
</p>
      </div>
      `,
    );

    setHTML(
      "checkActions",
      `
      <button
  class="btn primary full-mobile"
  id="btnRetryCheck"
  data-i18n="retry"
>
  重新查詢
</button>

<button
  class="btn ghost full-mobile"
  id="btnBackVerify"
  data-i18n="back"
>
  返回
</button>
      `,
    );

    on("btnRetryCheck", "click", async () => {
      if (state.isBusy) return;

      setBusy(t("retrying"));

      try {
        const success =
  await checkTodayOrder();

if (
  success &&
  state.step !== "review"
) {
  showPage("check");
}
      } finally {
        clearBusy();
      }
    });

    on("btnBackVerify", "click", () => {
      showPage("verify");
    });

    return false;
  }
}
/* function getLimit() {
  return state.user.role === "主管" || state.user.role === "助理" ? 5 : 1;
} */
function startOrder(isEdit) {
  if (!guardOpen()) return;

  const old = state.existingOrder;

  if (isEdit && old) {
    // 建立副本，避免尚未送出就修改到 existingOrder
    state.pendingOrder = JSON.parse(JSON.stringify(old));

    loadConditionFromOrder(state.pendingOrder);
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
      noLunch: false,
      weeklyMeals: {},
    };

    resetConditionForm();
  }

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

    notice("conditionNotice", "info", t("noLunchSelected"));

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
function loadConditionFromOrder(order) {
  resetConditionForm();

  if (!order) {
    return;
  }

  const noLunch = order.noLunch === true;

  const noLunchCheckbox = $("noLunchCheckbox");

  if (noLunchCheckbox) {
    noLunchCheckbox.checked = noLunch;
  }

  if (!noLunch) {
    const factoryInput = Array.from(
      document.querySelectorAll('input[name="factory"]'),
    ).find((input) => input.value === order.defaultFactory);

    const foodTypeInput = Array.from(
      document.querySelectorAll('input[name="foodType"]'),
    ).find((input) => input.value === order.defaultFoodType);

    if (factoryInput) {
      factoryInput.checked = true;
    }

    if (foodTypeInput) {
      foodTypeInput.checked = true;
    }
  }

  updateConditionState();
}

async function goWeekOrder() {
  if (!state.pendingOrder) {
    return;
  }

  try {
    setBusy(t("loadingWorkDays"));
    await loadWeekHolidays();
  } catch (error) {
    console.error("loadWeekHolidays error:", error);

    notice("conditionNotice", "danger", t("holidayLoadFailed"));
    return;
  } finally {
    clearBusy();
  }

  const noLunch = $("noLunchCheckbox")?.checked === true;

  state.noLunch = noLunch;

  // 下週不訂便當
  if (noLunch) {
    state.pendingOrder.defaultFactory = "";
    state.pendingOrder.defaultFoodType = "";
    state.pendingOrder.noLunch = true;

    renderWeekOrder();
    showPage("weekOrder");
    return;
  }

  const factory = document.querySelector(
    'input[name="factory"]:checked',
  )?.value;

  const foodType = document.querySelector(
    'input[name="foodType"]:checked',
  )?.value;

  if (!factory || !foodType) {
    notice("conditionNotice", "danger", t("conditionRequired"));

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

  const weeklyKeyMap = {
    mon: "monday",
    tue: "tuesday",
    wed: "wednesday",
    thu: "thursday",
    fri: "friday",
  };
  const dayTranslationMap = {
    星期一: "monday",
    星期二: "tuesday",
    星期三: "wednesday",
    星期四: "thursday",
    星期五: "friday",
  };

  setHTML(
    "weekTable",
    weeks
      .map(function (item) {
        const weeklyKey = weeklyKeyMap[item.key];

        const holiday = state.weekHolidays?.[weeklyKey];
        const dayKey = dayTranslationMap[item.day];

        /*
         * 假日不顯示訂餐選項。
         */
        if (holiday?.isHoliday) {
          return `
            <div class="week-row holiday-row">
              <div class="week-info">
                <div
  class="week-day"
  data-i18n="${dayKey}"
>
  ${item.day}
</div>

                <div class="week-date">
                  ${item.date}
                </div>
              </div>

              <div class="holiday-box">
                <strong data-i18n="holiday">
  休假
</strong>

<span>
  ${holiday.holidayName || t("nationalHoliday")}
</span>
              </div>
            </div>
          `;
        }

        const savedMeal =
          state.pendingOrder?.weeklyMeals?.[weeklyKey]?.mealType || "";

        const selectedMeal =
          savedMeal && savedMeal !== "國定假日"
            ? savedMeal
            : noLunch
              ? "上樓用餐"
              : "便當";

        const checked = function (value) {
          return selectedMeal === value ? "checked" : "";
        };

        const mealOptions = noLunch
          ? `
    <label>
      <input
        type="radio"
        name="meal_${item.key}"
        value="上樓用餐"
        ${checked("上樓用餐")}
      >

      <span data-i18n="upstairs">
        上樓用餐
      </span>
    </label>

    <label>
      <input
        type="radio"
        name="meal_${item.key}"
        value="不用餐"
        ${checked("不用餐")}
      >

      <span data-i18n="noMeal">
        不用餐
      </span>
    </label>
  `
          : `
    <label>
      <input
        type="radio"
        name="meal_${item.key}"
        value="便當"
        ${checked("便當")}
      >

      <span data-i18n="lunchBox">
        便當
      </span>
    </label>

    <label>
      <input
        type="radio"
        name="meal_${item.key}"
        value="上樓用餐"
        ${checked("上樓用餐")}
      >

      <span data-i18n="upstairs">
        上樓用餐
      </span>
    </label>

    <label>
      <input
        type="radio"
        name="meal_${item.key}"
        value="不用餐"
        ${checked("不用餐")}
      >

      <span data-i18n="noMeal">
        不用餐
      </span>
    </label>
  `;

        return `
          <div class="week-row">
            <div class="week-info">
              <div
  class="week-day"
  data-i18n="${dayKey}"
>
  ${item.day}
</div>

              <div class="week-date">
                ${item.date}
              </div>
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
/**
 * 將指定訂單顯示在 Review 頁面。
 *
 * 這個函式不讀取 radio，
 * 可以直接顯示後端 getOrder 回傳的訂單。
 */
function translateFactoryValue(value) {
  const map = {
    一廠: "factory1",
    二廠: "factory2",
    三廠: "factory3",
  };

  const key = map[String(value || "").trim()];

  return key ? t(key) : String(value || "");
}

function translateFoodTypeValue(value) {
  const map = {
    葷食: "meat",
    素食: "vegetarian",
  };

  const key = map[String(value || "").trim()];

  return key ? t(key) : String(value || "");
}
function renderReviewFromOrder(order, options = {}) {
  if (!order || !order.weeklyMeals) {
    throw new Error("訂單資料不完整");
  }

  const isExistingOrder =
    options.isExistingOrder === true;

  state.viewingExistingOrder =
    isExistingOrder;

  const weeklyMeals =
    order.weeklyMeals;

  /*
   * 顯示使用者資料
   */
  setHTML(
    "reviewUser",
    `
      <div class="user-item">
        💼
        <span data-i18n="employeeId">
          工號
        </span>
        <strong>
          ${state.user?.empId || order.empId || ""}
        </strong>
      </div>

      <div class="user-item">
        👤
        <span data-i18n="employeeName">
          姓名
        </span>
        <strong>
          ${state.user?.name || order.name || ""}
        </strong>
      </div>

      <div class="user-item">
        🏢
        <span data-i18n="department">
          部門
        </span>
        <strong>
          ${translateDepartment(
            state.user?.dept ||
            order.dept ||
            ""
          )}
        </strong>
      </div>
    `,
  );

  const daySettings = [
    {
      key: "monday",
      translationKey: "monday",
      fallbackDay: "星期一",
    },
    {
      key: "tuesday",
      translationKey: "tuesday",
      fallbackDay: "星期二",
    },
    {
      key: "wednesday",
      translationKey: "wednesday",
      fallbackDay: "星期三",
    },
    {
      key: "thursday",
      translationKey: "thursday",
      fallbackDay: "星期四",
    },
    {
      key: "friday",
      translationKey: "friday",
      fallbackDay: "星期五",
    },
  ];

  setHTML(
    "reviewOrder",
    daySettings
      .map(function (dayInfo) {
        const item =
          weeklyMeals[dayInfo.key];

        if (!item) {
          return "";
        }

        let cssClass = "lunch";
        let icon = "🍱";
        let mealText = "";

        if (item.mealType === "便當") {
          const factory =
            item.factory ||
            order.defaultFactory ||
            "";

          const foodType =
            item.foodType ||
            order.defaultFoodType ||
            "";

          mealText =
            `${t("lunchBox")}（` +
            `${translateFactoryValue(factory)} ` +
            `${translateFoodTypeValue(foodType)}）`;
        } else if (
          item.mealType === "上樓用餐"
        ) {
          cssClass = "upstairs";
          icon = "👥";
          mealText = t("upstairs");
        } else if (
          item.mealType === "不用餐"
        ) {
          cssClass = "none";
          icon = "✖";
          mealText = t("noMeal");
        } else if (
          item.mealType === "國定假日"
        ) {
          cssClass = "holiday";
          icon = "📅";
          mealText =
            item.holidayName ||
            t("nationalHoliday");
        } else {
          cssClass = "none";
          icon = "－";
          mealText =
            item.mealType || "－";
        }

        const dateText =
          String(item.date || "")
            .replace("/", "月") +
          (
            item.date
              ? "日"
              : ""
          );

        return `
          <div class="review-week-row">
            <div
              class="review-day"
              data-i18n="${dayInfo.translationKey}"
            >
              ${item.day || dayInfo.fallbackDay}
            </div>

            <div class="review-date">
              ${dateText}
            </div>

            <div class="meal-pill ${cssClass}">
              <span>${icon}</span>
              <strong>${mealText}</strong>
            </div>
          </div>
        `;
      })
      .join(""),
  );

  /*
   * 已有訂單只允許查看或進入修改，
   * 不直接再次送出。
   */
  const submitButton =
    $("btnSubmit");

  const editButton =
    $("btnEditBottom");

  if (submitButton) {
    submitButton.classList.toggle(
      "hidden",
      isExistingOrder
    );
  }

  if (editButton) {
    if (isExistingOrder) {
      editButton.textContent =
        "✏️ " + t("editOrder");
    } else {
      editButton.textContent =
        "✏️ " + t("backToEdit");
    }
  }

  showPage("review");
}
async function buildReview() {
  if (!guardOpen()) return;

  const factory = state.pendingOrder.defaultFactory;
  const foodType = state.pendingOrder.defaultFoodType;

  const weeks = getThisWeekDates();

  const daySettings = [
    {
      weeklyKey: "monday",
      inputKey: "mon",
      week: weeks[0],
    },
    {
      weeklyKey: "tuesday",
      inputKey: "tue",
      week: weeks[1],
    },
    {
      weeklyKey: "wednesday",
      inputKey: "wed",
      week: weeks[2],
    },
    {
      weeklyKey: "thursday",
      inputKey: "thu",
      week: weeks[3],
    },
    {
      weeklyKey: "friday",
      inputKey: "fri",
      week: weeks[4],
    },
  ];

  const weeklyMeals = {};

  daySettings.forEach(function (dayInfo) {
    const holiday = state.weekHolidays?.[dayInfo.weeklyKey];

    if (holiday?.isHoliday) {
      weeklyMeals[dayInfo.weeklyKey] = {
        date: dayInfo.week.reviewDate,

        day: dayInfo.week.day,

        mealType: "國定假日",

        holidayName: holiday.holidayName || "國定假日",

        factory: "",
        foodType: "",
      };

      return;
    }

    const mealType = getMealValue("meal_" + dayInfo.inputKey);

    if (!mealType) {
      throw new Error("請選擇" + dayInfo.week.day + "的用餐方式。");
    }

    weeklyMeals[dayInfo.weeklyKey] = {
      date: dayInfo.week.reviewDate,

      day: dayInfo.week.day,

      mealType: mealType,
    };
  });

  Object.keys(weeklyMeals).forEach((key) => {
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
    state.pendingOrder.weeklyMeals =
    weeklyMeals;

  state.pendingOrder.updatedAt =
    new Date().toLocaleString("zh-TW");

  /*
   * 新建或修改中的訂單，
   * Review 頁仍顯示確認送出按鈕。
   */
  renderReviewFromOrder(
    state.pendingOrder,
    {
      isExistingOrder: false,
    }
  );
}

  /* setHTML(
    "reviewUser",
    `
  <div class="user-item">💼<span data-i18n="employeeId">工號</span><strong>${state.user.empId}</strong></div>
  <div class="user-item">👤<span data-i18n="employeeName">姓名</span><strong>${state.user.name}</strong></div>
<div class="user-item">
🏢
<span data-i18n="department">部門</span>
<strong>${translateDepartment(state.user.dept)}</strong>
</div>  `,
  );

  const weekMap = [
    weeklyMeals.monday,
    weeklyMeals.tuesday,
    weeklyMeals.wednesday,
    weeklyMeals.thursday,
    weeklyMeals.friday,
  ];
  const reviewDayKeys = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];

  setHTML(
    "reviewOrder",
    weekMap
      .map((item, index) => {
        const dayKey = reviewDayKeys[index];
        let cls = "lunch";
        let icon = "🍱";
        let text = item.mealType;

        if (item.mealType === "上樓用餐") {
          cls = "upstairs";
          icon = "👥";
          text = t("upstairs");
        }

        if (item.mealType === "不用餐") {
          cls = "none";
          icon = "✖";
          text = t("noMeal");
        }
        if (item.mealType === "國定假日") {
          cls = "holiday";
          icon = "📅";
          text = item.holidayName || t("nationalHoliday");
        }

        if (item.mealType === "便當") {
          text = `${t("lunchBox")}（${translateFactory(factory)} ${translateFoodType(foodType)}）`;
        }

        const dateText = item.date.replace("/", "月") + "日";

        return `
  <div class="review-week-row">
    <div
  class="review-day"
  data-i18n="${dayKey}"
>
  ${item.day}
</div>
    <div class="review-date">${dateText}</div>
    <div class="meal-pill ${cls}">
      <span>${icon}</span>
      <strong>${text}</strong>
    </div>
  </div>
`;
      })
      .join(""),
  );

  showPage("review"); */

function translateFactory(value) {
  const map = {
    一廠: "factory1",
    二廠: "factory2",
    三廠: "factory3",
  };

  return map[value] ? t(map[value]) : value;
}

function translateFoodType(value) {
  const map = {
    葷食: "meat",
    素食: "vegetarian",
  };

  return map[value] ? t(map[value]) : value;
}
async function submitOrder() {
  if (state.isBusy) return;
  if (!guardOpen()) return;
  if (!state.pendingOrder || state.isSubmitting) return;

  const totalStart = performance.now();

  state.isSubmitting = true;

  setBusy(t("sendingOrder"));
  setButtonLoading("btnSubmit", t("submitting"), true);
  try {
    const apiStart = performance.now();

    const result = await apiPost({
      action: "saveOrder",
      empId: state.user.empId,
      name: state.user.name,
      dept: state.dept,
      weekKey: weekKey(),
      defaultFactory: state.pendingOrder.defaultFactory,
      defaultFoodType: state.pendingOrder.defaultFoodType,
      weeklyMeals: state.pendingOrder.weeklyMeals,
    });

    const apiElapsed = Math.round(performance.now() - apiStart);

    console.log(`saveOrder API 等待時間：${apiElapsed}ms`);

    // 顯示後端完整回傳內容
    console.log("saveOrder 回傳結果：", result);
    console.table(result.debug?.timings || {});

    // 顯示後端程式實際執行時間
    if (result && result.debug) {
      console.log(
        `saveOrder 後端實際處理時間：${result.debug.backendElapsedMs}ms`,
      );

      console.log(
        `Web App／網路額外時間：約 ${
          apiElapsed - Number(result.debug.backendElapsedMs || 0)
        }ms`,
      );
    } else {
      console.warn("回傳結果沒有 debug，請確認新版 saveOrder 已重新部署。");
    }

    if (!result.success) {
      notice("orderNotice", "danger", result.message || t("submitFailed"));

      showPage("weekOrder");
      return;
    }

    const doneTime = $("doneTime");

    if (doneTime) {
      doneTime.textContent = new Date().toLocaleString(getCurrentLocale(), {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    state.existingOrder = result.order;
    state.pendingOrder = JSON.parse(JSON.stringify(result.order));

    showPage("done");

    console.log(
      `送出訂單總時間：${Math.round(performance.now() - totalStart)}ms`,
    );
  } catch (error) {
    console.error("submitOrder error:", error);

    notice("orderNotice", "danger", error.message || t("connectionFailed"));

    showPage("review");
  } finally {
    state.isSubmitting = false;
    setButtonLoading("btnSubmit", t("submit"), false);
    clearBusy();
  }
}
function editOrderFromDone() {
  if (state.isBusy) return;

  if (!state.existingOrder) {
    showAlert("找不到訂單資料");
    return;
  }

  startOrder(true);
}
function goHome() {
  resetOrderFlow();

  window.location.reload();
}
async function clearLocalData() {
  const ok = await showConfirmDialog({
    title: t("clearLocalData"),
    message: t("confirmClearLocalData"),
    confirmText: t("confirmClear"),
    cancelText: t("cancel"),
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
on(
  "btnEditBottom",
  "click",
  function () {
    if (!guardOpen()) {
      return;
    }

    /*
     * 查看後端已有訂單：
     * 從訂單重新載入編輯流程。
     */
    if (
      state.viewingExistingOrder &&
      state.existingOrder
    ) {
      state.viewingExistingOrder = false;

      startOrder(true);

      return;
    }

    /*
     * 正常建立訂單的 Review：
     * 返回一週訂餐頁。
     */
    showPage("weekOrder");
  }
);
  on("btnSubmit", "click", submitOrder);
  on("btnHome", "click", goHome);
  on("btnEditDone", "click", editOrderFromDone);
}
window.addEventListener("error", (e) => {
  showAlert("系統錯誤：" + e.message);
  console.error(e.error || e.message);
});
async function initializeApp() {
  initLanguage();

  bindEvents();
  updateHeader();

  try {
    setBusy(t("checkingSystem"));
    /*
     * 先向 Apps Script 後端取得：
     * 1. 系統目前是否開放
     * 2. 本次應填寫的目標週次
     */
    const isOpen = await loadSystemStatus();

    if (!isOpen) {
      return;
    }

    /*
     * 優先讀取正式 QR Code 網址參數。
     *
     * 例如：
     * ?dept=燃料電池生產部
     */
    const qrParams = getQRCodeParams();

    if (qrParams.dept) {
      scanQRCode(qrParams.dept);
      return;
    }

    /*
     * 網址沒有部門參數時，
     * 再讀取之前儲存的 QR Code 部門。
     */
    const savedQR = getSavedQRCodeContext();

    if (savedQR && savedQR.dept) {
      scanQRCode(savedQR.dept);
      return;
    }

    /*
     * 完全沒有 QR Code 資料時，
     * 依設定決定顯示測試掃描頁，
     * 或提示使用者掃描 QR Code。
     */
    requireQRCodeScan();
  } catch (error) {
    console.error("initializeApp error:", error);

    state.systemStatus = {
      open: false,
      message: "目前無法確認系統狀態，請稍後重新整理頁面。",
    };

    setText("closedReason", "目前無法確認系統狀態，請稍後重新整理頁面。");

    showPage("closed");
  } finally {
    clearBusy();
  }
}

/*
 * HTML 與 JavaScript 載入完成後，
 * 才正式初始化系統。
 */
document.addEventListener("DOMContentLoaded", initializeApp);
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
   state.order = null;
   state.viewingExistingOrder = false;
  state.dept = "";
  state.isSubmitting = false;
  state.isBusy = false;
  $("deptSelect").value = "";
  $("empId").value = "";
  $("empName").value = "";

  clearNotice("verifyNotice");
  clearNotice("orderNotice");

  document.querySelectorAll('input[type="radio"]').forEach((r) => {
    if (r.defaultChecked) {
      r.checked = true;
    }
  });
}
function renderQRCodeInfo() {
  setText(
    "deptReadonlyText",
    state.dept ? translateDepartment(state.dept) : "未取得",
  );

  const deptInput = $("deptReadonly");

  if (deptInput) {
    deptInput.value = state.dept || "";
  }
}
function refreshDynamicTranslations() {
  if (state.dept) {
    setText("deptReadonlyText", translateDepartment(state.dept));
  }

  if (state.step === "review" && state.pendingOrder?.weeklyMeals) {
    buildReview();
  }
}
function requireQRCodeScan() {
  if (APP_CONFIG.ENABLE_MOCK_SCAN_PAGE === true) {
    showPage("scan");
    return;
  }

  document.querySelectorAll('[id^="page-"]').forEach((page) => {
    page.classList.add("hidden");
  });

  showAlert(t("scanQRCode"));
}
const USER_SESSION_KEY = "LUNCH_ORDER_USER_SESSION";
function saveUserSession(user) {
  if (!user) {
    return;
  }

  const sessionData = {
    empId: String(user.empId || "").trim(),
    name: String(user.name || "").trim(),
    dept: String(user.dept || "").trim(),
  };

  sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionData));
}
function getUserSession() {
  const raw = sessionStorage.getItem(USER_SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const user = JSON.parse(raw);

    if (!user.empId || !user.name || !user.dept) {
      clearUserSession();
      return null;
    }

    return user;
  } catch (error) {
    console.error("讀取使用者 Session 失敗：", error);

    clearUserSession();
    return null;
  }
}
function clearUserSession() {
  sessionStorage.removeItem(USER_SESSION_KEY);
}