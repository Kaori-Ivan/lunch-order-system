console.log("MANAGER JS VERSION 20260909-A");
document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 系統開放狀態
  // =========================
  let managerSystemStatus = null;
  let managerTargetWeekKey = "";
  let managerWeekHolidays = {};
  // =========================
  // 頁面
  // =========================
  const loginPage = document.getElementById("managerLoginPage");

  const homePage = document.getElementById("managerHomePage");

  const orderPage = document.getElementById("managerOrderPage");
  const historyPage = document.getElementById("managerHistoryPage");

  const addEmployeePage = document.getElementById("managerAddEmployeePage");

  const closedPage = document.getElementById("managerClosedPage");

  const closedReason = document.getElementById("managerClosedReason");

  const closedRefreshButton = document.getElementById(
    "btnManagerClosedRefresh",
  );

  // =========================
  // 登入
  // =========================
  const employeeIdInput = document.getElementById("managerEmployeeId");

  const loginButton = document.getElementById("btnManagerLogin");

  const homeEmployeeId = document.getElementById("homeManagerEmployeeId");

  // =========================
  // 首頁按鈕
  // =========================
  const newOrderButton = document.getElementById("btnNewManagerOrder");
  const historyButton = document.getElementById("btnManagerOrderHistory");

  const historyBackButton = document.getElementById("btnManagerHistoryBack");
  const addEmployeeButton = document.getElementById("btnManagerAddEmployee");

  const editEmployeeButton =
  document.getElementById("btnManagerEditEmployee");

const editEmployeePage =
  document.getElementById("managerEditEmployeePage");

const editEmployeeBackButton =
  document.getElementById("btnManagerEditEmployeeBack");

  const editEmployeeSelect =
  document.getElementById("editEmployeeSelect");


  const editEmployeeForm =
  document.getElementById("editEmployeeForm");

const editEmployeeId =
  document.getElementById("editEmployeeId");

const editEmployeeName =
  document.getElementById("editEmployeeName");

const editEmployeeDepartment =
  document.getElementById("editEmployeeDepartment");

const editEmployeeGroup =
  document.getElementById("editEmployeeGroup");

const editEmployeeEnabled =
  document.getElementById("editEmployeeEnabled");

const editEmployeeSubmitButton =
  document.getElementById("btnManagerEditEmployeeSubmit");
  const addEmployeeBackButton = document.getElementById(
    "btnManagerAddEmployeeBack",
  );

  const newEmployeeDepartment = document.getElementById(
    "newEmployeeDepartment",
  );

  const newEmployeeGroup = document.getElementById("newEmployeeGroup");

  const newEmployeeId =
  document.getElementById("newEmployeeId");

  const newEmployeeName =
    document.getElementById("newEmployeeName");

  const addEmployeeSubmitButton =
    document.getElementById("btnManagerAddEmployeeSubmit");

  const historyWeek = document.getElementById("managerHistoryWeek");

  const historyLoading = document.getElementById("managerHistoryLoading");

  const historyEmpty = document.getElementById("managerHistoryEmpty");

  const historyList = document.getElementById("managerHistoryList");

  const backButton = document.getElementById("btnManagerOrderBack");
  const historyTools = document.getElementById("managerHistoryTools");

  const historyCount = document.getElementById("managerHistoryCount");

  const historySearch = document.getElementById("managerHistorySearch");

  // =========================
  // 代訂表單
  // =========================
  const departmentSelect = document.getElementById("managerDepartment");

  const employeeSelect = document.getElementById("managerEmployee");

  const employeePreview = document.getElementById("managerEmployeePreview");

  const employeeName = document.getElementById("managerEmployeeName");

  const employeeDetail = document.getElementById("managerEmployeeDetail");

  // =========================
  // 整週代訂
  // =========================
  const weekRange = document.getElementById("managerWeekRange");

  const weeklyMeals = document.getElementById("managerWeeklyMeals");

  const defaultFactory = document.getElementById("managerDefaultFactory");

  const defaultFoodType = document.getElementById("managerDefaultFoodType");

  const submitButton = document.getElementById("btnManagerOrderSubmit");

  // =========================
  // 整週摘要
  // =========================
  const summaryEmployee = document.getElementById("managerSummaryEmployee");

  const summaryWeek = document.getElementById("managerSummaryWeek");

  const weeklySummary = document.getElementById("managerWeeklySummary");
  // =========================
  // 暫時測試用人員資料
  // 之後再改成 API
  // =========================
  // =========================
  // 正式人員資料
  // =========================
  let employeeData = [];
  let managerEmployeesLoaded = false;
  let managerEmployeesLoadingPromise = null;

  const MANAGER_EMPLOYEE_CACHE_KEY = "managerEmployeeCache";
  // 目前登入的管理者
  let currentManager = null;

  const MANAGER_EMPLOYEE_CACHE_TIME_KEY = "managerEmployeeCacheTime";

  const MANAGER_EMPLOYEE_CACHE_MAX_AGE = 10 * 60 * 1000;
  const MANAGER_API_RETRY_COUNT = 1;
  const MANAGER_API_RETRY_DELAY = 1000;
  // =========================
  // 整週用餐資料
  // =========================
  let weeklyMealState = {};
  let managerHistoryRecords = [];
  let editingEmployeeId = "";
  let isSubmitting = false;

  // =========================
  // 呼叫原訂餐系統 API
  // =========================
  async function managerApiPost(payload) {
    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(APP_CONFIG.USER_API_URL, {
        method: "POST",

        body: JSON.stringify(payload),

        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }
  // =========================
  // 讀取正式員工資料
  // =========================
  async function loadManagerEmployees() {
    // 已經成功載入過，就直接使用現有資料
    if (managerEmployeesLoaded) {
      return;
    }

    // 如果目前已經有一支人員 API 正在執行，
    // 不要再發第二支，直接等待同一個 Promise
    if (managerEmployeesLoadingPromise) {
      return managerEmployeesLoadingPromise;
    }

    managerEmployeesLoadingPromise = (async () => {
      // =========================
      // 先讀 sessionStorage 快取
      // =========================
      const cachedData = sessionStorage.getItem(MANAGER_EMPLOYEE_CACHE_KEY);

      const cachedTime = Number(
        sessionStorage.getItem(MANAGER_EMPLOYEE_CACHE_TIME_KEY) || 0,
      );

      const cacheAge = Date.now() - cachedTime;

      const cacheValid =
        cachedData &&
        cachedTime > 0 &&
        cacheAge < MANAGER_EMPLOYEE_CACHE_MAX_AGE;

      if (cacheValid) {
        try {
          const parsedData = JSON.parse(cachedData);

          if (Array.isArray(parsedData) && parsedData.length > 0) {
            employeeData = parsedData;

            managerEmployeesLoaded = true;

            console.log("使用有效快取人員資料：", employeeData);

            return;
          }
        } catch (error) {
          console.warn("快取人員資料解析失敗：", error);
        }
      }

      /*
       * 快取不存在、已過期或內容異常，
       * 就清掉後重新向 API 讀取。
       */
      sessionStorage.removeItem(MANAGER_EMPLOYEE_CACHE_KEY);

      sessionStorage.removeItem(MANAGER_EMPLOYEE_CACHE_TIME_KEY);

      // =========================
      // 沒有快取才呼叫正式 API
      // =========================
      let lastError = null;

      for (let attempt = 0; attempt <= MANAGER_API_RETRY_COUNT; attempt += 1) {
        const controller = new AbortController();

        const timeout = setTimeout(() => controller.abort(), 12000);

        try {
          const response = await fetch(APP_CONFIG.ADMIN_API_URL, {
            method: "POST",

            body: JSON.stringify({
              action: "getEmployees",
            }),

            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.message || "讀取人員資料失敗");
          }

          employeeData = (result.data || [])
            .filter((employee) => {
              return employee.enabled === true;
            })
            .map((employee) => {
              return {
                id: employee.employeeId,
                name: employee.name,
                department: employee.department,
                group: employee.group || "",
                role: employee.role || "",
              };
            });

          managerEmployeesLoaded = true;

          sessionStorage.setItem(
            MANAGER_EMPLOYEE_CACHE_KEY,
            JSON.stringify(employeeData),
          );

          sessionStorage.setItem(
            MANAGER_EMPLOYEE_CACHE_TIME_KEY,
            String(Date.now()),
          );

          console.log("管理者代訂人員資料：", employeeData);

          return;
        } catch (error) {
          lastError = error;

          console.warn(`讀取人員資料失敗，第 ${attempt + 1} 次：`, error);

          if (attempt < MANAGER_API_RETRY_COUNT) {
            await new Promise((resolve) => {
              setTimeout(resolve, MANAGER_API_RETRY_DELAY);
            });
          }
        } finally {
          clearTimeout(timeout);
        }
      }

      throw lastError;
    })();

    try {
      await managerEmployeesLoadingPromise;
    } finally {
      // 不論成功或失敗，
      // 這一次請求結束後都要解除鎖
      managerEmployeesLoadingPromise = null;
    }
  }
let editEmployees = [];
async function loadEditEmployees() {
  if (!currentManager) {
    return;
  }

  editEmployeeSelect.innerHTML =
    '<option value="">載入中...</option>';

  editEmployeeSelect.disabled = true;

  try {
    const response = await fetch(
      APP_CONFIG.ADMIN_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          action: "getEmployees"
        })
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(
        result.message || "取得人員資料失敗"
      );
    }

    const employees = Array.isArray(result.data)
      ? result.data
      : [];

    // 只保留目前登入負責人自己組別的人員
    // 修改人員需要包含「啟用」與「停用」
    editEmployees = employees.filter(
  employee =>
    employee.group === currentManager.group &&
    employee.role === "員工"
);

    editEmployeeSelect.innerHTML =
      '<option value="">請選擇人員</option>';

    editEmployees.forEach(employee => {
      const option =
        document.createElement("option");

      option.value = employee.employeeId;

      option.textContent =
        `${employee.employeeId}｜${employee.name}` +
        `${employee.enabled ? "" : "（停用）"}`;

      editEmployeeSelect.appendChild(option);
    });

    if (editEmployees.length === 0) {
      editEmployeeSelect.innerHTML =
        '<option value="">目前沒有可修改的人員</option>';
    }

  } catch (error) {
    console.error(
      "載入修改人員名單失敗：",
      error
    );

    editEmployeeSelect.innerHTML =
      '<option value="">人員資料載入失敗</option>';

  } finally {
    editEmployeeSelect.disabled = false;
  }
}


  // =========================
  // 讀取下週休假日
  // =========================
  async function loadManagerWeekHolidays() {
    const result = await managerApiPost({
      action: "getWeekHolidayStatus",
      weekKey: managerTargetWeekKey,
    });

    if (!result.success) {
      throw new Error(result.message || "無法取得下週休假日");
    }

    managerWeekHolidays = result.days || {};
  }
  // =========================
  // 建立後端指定週次日期
  // =========================
  // =========================
  // 建立可代訂的下週日期
  // 自動排除休假日
  // =========================
  // =========================
  // 建立部門選單
  // =========================
  // =========================
  // 建立組別選單
  // =========================
  function renderManagerGroups() {
    departmentSelect.innerHTML = `
    <option value="">
      請選擇組別
    </option>
  `;

    if (!currentManager) {
      return;
    }

    const managerGroup = currentManager.group || "";

    if (!managerGroup) {
      return;
    }

    const option = document.createElement("option");

    option.value = managerGroup;
    option.textContent = managerGroup;

    departmentSelect.appendChild(option);

    // 自動選擇登入組長自己的組別
    departmentSelect.value = managerGroup;

    // 觸發人員清單更新
    departmentSelect.dispatchEvent(new Event("change"));
  }
  function loadManagerTargetWeekDates() {
    console.log("開始建立整週日期");
    console.log("managerTargetWeekKey =", managerTargetWeekKey);
    console.log("weeklyMeals =", weeklyMeals);
    if (!managerTargetWeekKey) {
      return;
    }

    const monday = new Date(`${managerTargetWeekKey}T00:00:00`);

    const weekDays = [
      {
        name: "星期一",
        key: "monday",
      },
      {
        name: "星期二",
        key: "tuesday",
      },
      {
        name: "星期三",
        key: "wednesday",
      },
      {
        name: "星期四",
        key: "thursday",
      },
      {
        name: "星期五",
        key: "friday",
      },
    ];

    weeklyMealState = {};

    const weekDates = weekDays.map((weekDay, index) => {
      const date = new Date(monday);

      date.setDate(monday.getDate() + index);

      const dateValue = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      return {
        ...weekDay,
        date,
        dateValue,
      };
    });

    // =========================
    // 顯示訂餐週次
    // =========================
    const firstDay = weekDates[0];

    const lastDay = weekDates[4];

    const formatShortDate = (date) => {
      return `${date.getMonth() + 1}/` + `${date.getDate()}`;
    };

    if (weekRange) {
      weekRange.textContent =
        `${formatShortDate(firstDay.date)}` +
        ` ～ ` +
        `${formatShortDate(lastDay.date)}`;
    }

    if (summaryWeek) {
      summaryWeek.textContent =
        `${formatShortDate(firstDay.date)}` +
        ` ～ ` +
        `${formatShortDate(lastDay.date)}`;
    }

    // =========================
    // 建立週一～週五畫面
    // =========================
    weeklyMeals.innerHTML = "";

    weekDates.forEach((dayInfo) => {
      const holiday = managerWeekHolidays[dayInfo.key];

      const dayCard = document.createElement("div");

      dayCard.className = "manager-week-day";

      dayCard.dataset.day = dayInfo.key;

      // =========================
      // 假日
      // =========================
      if (holiday?.isHoliday) {
        weeklyMealState[dayInfo.key] = {
          date: dayInfo.dateValue,
          mealType: "國定假日",
        };

        dayCard.innerHTML = `
          <div class="manager-week-day-header">

            <div>
              <strong>
                ${dayInfo.name}
              </strong>

              <span>
                ${formatShortDate(dayInfo.date)}
              </span>
            </div>

            <span class="manager-holiday-badge">
              休假日
            </span>

          </div>

          <div class="manager-holiday-note">
            ${holiday.holidayName || "國定假日"}
          </div>
        `;

        weeklyMeals.appendChild(dayCard);

        return;
      }

      // =========================
      // 一般上班日
      // =========================
      weeklyMealState[dayInfo.key] = {
        date: dayInfo.dateValue,
        mealType: "",
        factory: "",
        foodType: "",
        quantity: 1,
      };

      dayCard.innerHTML = `
        <div class="manager-week-day-header">

          <div>
            <strong>
              ${dayInfo.name}
            </strong>

            <span>
              ${formatShortDate(dayInfo.date)}
            </span>
          </div>

        </div>


        <div class="manager-week-meal-options">

          <label class="manager-week-meal-option">

            <input
              type="radio"
              name="mealType-${dayInfo.key}"
              value="便當"
              data-day="${dayInfo.key}"
              data-meal-type
            >

            <span>
              🍱 便當
            </span>

          </label>


          <label class="manager-week-meal-option">

            <input
              type="radio"
              name="mealType-${dayInfo.key}"
              value="上樓用餐"
              data-day="${dayInfo.key}"
              data-meal-type
            >

            <span>
              🏠 上樓用餐
            </span>

          </label>


          <label class="manager-week-meal-option">

            <input
              type="radio"
              name="mealType-${dayInfo.key}"
              value="不用餐"
              data-day="${dayInfo.key}"
              data-meal-type
            >

            <span>
              ⛔ 不用餐
            </span>

          </label>

        </div>


        <div
  class="manager-week-lunchbox-fields hidden"
  data-lunchbox-fields="${dayInfo.key}"
>
  <div class="manager-form-grid">

    <div class="manager-field">
      <label>
  數量
</label>

<div class="manager-quantity">

  <button
    type="button"
    data-quantity-minus="${dayInfo.key}"
    aria-label="減少數量"
  >
    −
  </button>

  <strong
    data-quantity-display="${dayInfo.key}"
  >
    1
  </strong>

  <button
    type="button"
    data-quantity-plus="${dayInfo.key}"
    aria-label="增加數量"
  >
    ＋
  </button>

</div>
    </div>

  </div>
</div>

      `;

      weeklyMeals.appendChild(dayCard);
    });
  }
  // =========================
  // 檢查訂餐系統是否開放
  // =========================
  async function loadManagerSystemStatus() {
    try {
      const result = await managerApiPost({
        action: "getSystemStatus",
      });

      if (!result.success) {
        throw new Error(result.message || "無法取得系統狀態");
      }

      managerSystemStatus = result;

      managerTargetWeekKey = result.targetWeekKey || "";

      // 系統未開放
      if (!result.open) {
        loginPage.classList.add("hidden");

        homePage.classList.add("hidden");

        orderPage.classList.add("hidden");

        closedReason.textContent = result.message || "目前未開放訂餐";

        closedPage.classList.remove("hidden");

        return;
      }

      // 系統開放
      closedPage.classList.add("hidden");

      // 只有尚未登入時才顯示登入頁
      if (!currentManager) {
        loginPage.classList.remove("hidden");
      }

      await loadManagerWeekHolidays();

      loadManagerTargetWeekDates();
    } catch (error) {
      console.error("管理者系統狀態讀取失敗：", error);

      loginPage.classList.add("hidden");

      homePage.classList.add("hidden");

      orderPage.classList.add("hidden");

      closedReason.textContent = "目前無法確認訂餐系統狀態，請稍後重新整理。";

      closedPage.classList.remove("hidden");
    }
  }
  // =========================
  // 登入
  // =========================

  loginButton.addEventListener("click", async () => {
    const employeeId = employeeIdInput.value.trim();

    if (!employeeId) {
      alert("請輸入管理者工號");

      employeeIdInput.focus();

      return;
    }

    const originalText = loginButton.textContent;

    try {
      loginButton.disabled = true;

      loginButton.textContent = "正在驗證身分...";

      // =========================
      // 只驗證目前輸入的管理者
      // 不再先下載全部員工
      // =========================
      const result = await managerApiPost({
        action: "verifyManager",
        employeeId: employeeId,
      });

      if (!result.success) {
        alert(result.message || "管理者身分驗證失敗");

        employeeIdInput.focus();

        return;
      }

      const manager = result.manager;

      // =========================
      // 保存目前登入管理者
      // =========================
      currentManager = {
        id: manager.employeeId,

        name: manager.name,

        department: manager.department || "",

        group: manager.group || "",

        role: manager.role || "",
      };

      // =========================
      // 登入成功
      // =========================
      homeEmployeeId.textContent = `${currentManager.name}｜${currentManager.id}`;

      loginPage.classList.add("hidden");

      closedPage.classList.add("hidden");

      orderPage.classList.add("hidden");

      homePage.classList.remove("hidden");
      loadManagerEmployees().catch((error) => {
        console.warn("背景預載人員資料失敗：", error);
      });
    } catch (error) {
      console.error("管理者身分驗證失敗：", error);

      alert("目前無法驗證身分，請稍後再試。");
    } finally {
      loginButton.disabled = false;

      loginButton.textContent = originalText;
    }
  });

  // =========================
  // 進入新增代訂
  // =========================
  newOrderButton.addEventListener("click", async () => {
    editingEmployeeId = "";
    newOrderButton.disabled = true;

    /*
     * 先切到新增代訂頁，
     * 不要讓使用者一直停在首頁等待 API。
     */
    homePage.classList.add("hidden");
    historyPage.classList.add("hidden");
    orderPage.classList.remove("hidden");

    /*
     * 人員資料還沒回來前先鎖住選單。
     */
    departmentSelect.disabled = true;
    employeeSelect.disabled = true;

    departmentSelect.innerHTML = `
    <option value="">
      正在讀取組別...
    </option>
  `;

    employeeSelect.innerHTML = `
    <option value="">
      正在讀取人員...
    </option>
  `;

    try {
      await loadManagerEmployees();

      // API 成功後恢復組別選單
      departmentSelect.disabled = false;

      renderManagerGroups();
    } catch (error) {
      console.error("讀取代訂人員資料失敗：", error);

      departmentSelect.innerHTML = `
      <option value="">
        讀取失敗
      </option>
    `;

      employeeSelect.innerHTML = `
      <option value="">
        無法讀取人員
      </option>
    `;

      alert("目前無法讀取人員資料，請稍後再試。");
    } finally {
      newOrderButton.disabled = false;
    }
  });

  // =========================
  // 進入新增人員
  // =========================
  addEmployeeButton.addEventListener("click", () => {
    if (!currentManager) {
      alert("管理者登入資料已失效，請重新登入。");
      return;
    }

    // 隱藏其他頁面
    homePage.classList.add("hidden");
    orderPage.classList.add("hidden");
    historyPage.classList.add("hidden");

    // 自動帶入登入管理者的部門與組別
    newEmployeeDepartment.value = currentManager.department || "";
    newEmployeeGroup.value = currentManager.group || "";

    // 顯示新增人員頁面
    addEmployeePage.classList.remove("hidden");
  });

  // =========================
// 進入修改人員
// =========================
editEmployeeButton.addEventListener("click", () => {
  if (!currentManager) {
    alert("管理者登入資料已失效，請重新登入。");
    return;
  }

  homePage.classList.add("hidden");
  orderPage.classList.add("hidden");
  historyPage.classList.add("hidden");
  addEmployeePage.classList.add("hidden");

  editEmployeePage.classList.remove("hidden");

  // 每次進入修改人員頁面時
// 先恢復成初始狀態
editEmployeeForm.classList.add("hidden");

editEmployeeSelect.value = "";

editEmployeeId.value = "";
editEmployeeName.value = "";
editEmployeeDepartment.value = "";
editEmployeeGroup.value = "";
editEmployeeEnabled.value = "true";

  loadEditEmployees();
});

// =========================
// 修改人員－返回首頁
// =========================
editEmployeeBackButton.addEventListener("click", () => {
  editEmployeePage.classList.add("hidden");
  homePage.classList.remove("hidden");
});
// =========================
// 修改人員－選擇人員
// =========================
editEmployeeSelect.addEventListener("change", () => {
  const employeeId =
    editEmployeeSelect.value.trim();

  // 沒有選擇人員時，隱藏修改區
  if (!employeeId) {
    editEmployeeForm.classList.add("hidden");
    return;
  }

  // 從剛才載入的人員資料中找到該員工
  const employee = editEmployees.find(
    item => item.employeeId === employeeId
  );

  if (!employee) {
    alert("找不到此人員資料");
    editEmployeeForm.classList.add("hidden");
    return;
  }

  // 將資料帶入修改表單
  editEmployeeId.value =
    employee.employeeId || "";

  editEmployeeName.value =
    employee.name || "";

  editEmployeeDepartment.value =
    employee.department || "";

  editEmployeeGroup.value =
    employee.group || "";

  editEmployeeEnabled.value =
    employee.enabled ? "true" : "false";

  // 顯示修改區
  editEmployeeForm.classList.remove("hidden");
});


// =========================
// 修改人員－儲存修改
// =========================
editEmployeeSubmitButton.addEventListener(
  "click",
  async () => {
    if (!currentManager) {
      alert("管理者登入資料已失效，請重新登入。");
      return;
    }

    const originalEmployeeId =
      editEmployeeSelect.value
        .trim()
        .toUpperCase();

    const employeeId =
      editEmployeeId.value
        .trim()
        .toUpperCase();

    const name =
      editEmployeeName.value.trim();

    const enabled =
      editEmployeeEnabled.value === "true";

    if (!originalEmployeeId) {
      alert("請先選擇要修改的人員");
      return;
    }

    if (!employeeId) {
      alert("工號不可空白");
      editEmployeeId.focus();
      return;
    }

    if (!name) {
      alert("姓名不可空白");
      editEmployeeName.focus();
      return;
    }

    try {
      editEmployeeSubmitButton.disabled = true;
      editEmployeeSubmitButton.textContent =
        "儲存中...";

      const response = await fetch(
        APP_CONFIG.ADMIN_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },
          body: JSON.stringify({
            action:
              "updateManagerProxyEmployee",

            managerEmpId:
              currentManager.id,

            originalEmployeeId:
              originalEmployeeId,

            employeeId:
              employeeId,

            name:
              name,

            enabled:
              enabled
          })
        }
      );

      const result =
        await response.json();

      if (!result.success) {
        alert(
          result.message ||
          "修改人員失敗"
        );
        return;
      }

      alert("人員資料修改完成");

    } catch (error) {
      console.error(
        "管理者代訂修改人員失敗：",
        error
      );

      alert(
        "修改人員失敗，請稍後再試"
      );

    } finally {
      editEmployeeSubmitButton.disabled =
        false;

      editEmployeeSubmitButton.textContent =
        "儲存修改";
    }
  }
);
  // =========================
  // 進入代訂紀錄
  // =========================
  historyButton.addEventListener("click", async () => {
    if (!currentManager) {
      alert("管理者登入資料已失效，請重新登入。");
      return;
    }

    if (!managerTargetWeekKey) {
      alert("目前無法取得訂餐週次。");
      return;
    }

    homePage.classList.add("hidden");
    orderPage.classList.add("hidden");
    historyPage.classList.remove("hidden");
    historyWeek.textContent = `訂餐週次：${managerTargetWeekKey}`;

    /*
     * 工具列一進頁就固定顯示，
     * 避免 API 載入完成後版面突然跳動。
     */
    historyTools.classList.remove("hidden");

    historyCount.textContent = "0";

    historySearch.value = "";
    historySearch.disabled = true;

    historyLoading.textContent = "正在讀取代訂紀錄...";
    historyLoading.classList.remove("hidden");

    historyEmpty.classList.add("hidden");

    historyList.classList.add("hidden");
    historyList.innerHTML = "";

    try {
      const result = await managerApiPost({
        action: "getManagerProxyOrders",
        managerEmpId: currentManager.id,
        weekKey: managerTargetWeekKey,
      });

      if (!result.success) {
        throw new Error(result.message || "讀取代訂紀錄失敗");
      }

      const records = result.data || [];
      managerHistoryRecords = records;
      historyCount.textContent = new Set(
        records.map((item) => item.employeeEmpId),
      ).size;

      historyLoading.classList.add("hidden");

      historySearch.disabled = false;

      if (records.length === 0) {
        historyEmpty.classList.remove("hidden");
        return;
      }

      const grouped = {};

      records.forEach((item) => {
        const key = item.employeeEmpId;

        if (!grouped[key]) {
          grouped[key] = {
            employeeEmpId: item.employeeEmpId,
            employeeName: item.employeeName,
            records: [],
          };
        }

        grouped[key].records.push(item);
      });

      const html = Object.values(grouped)
        .map((employee) => {
          const days = employee.records
            .map((item) => {
              let mealText = item.mealType || "未設定";

              if (item.mealType === "便當") {
                mealText =
                  `便當｜${item.factory}` +
                  `｜${item.foodType}` +
                  `｜${item.quantity}份`;
              }

              return `
              <div class="manager-history-day">
                <span>
  ${formatManagerHistoryDate(item.orderDate)}
</span>

                <strong>
                  ${mealText}
                </strong>
              </div>
            `;
            })
            .join("");
          const lunchCount = employee.records.filter(
            (item) => item.mealType === "便當",
          ).length;

          const upstairsCount = employee.records.filter(
            (item) => item.mealType === "上樓用餐",
          ).length;

          const noMealCount = employee.records.filter(
            (item) => item.mealType === "不用餐",
          ).length;

          const summaryText =
            `便當 ${lunchCount}｜` +
            `上樓 ${upstairsCount}｜` +
            `不用餐 ${noMealCount}`;

          return `
  <div
    class="manager-history-card"
    data-employee-id="${employee.employeeEmpId}"
  >

    <div class="manager-history-person">

      <div>
        <strong>
          ${employee.employeeName}
        </strong>

        <span>
          ${employee.employeeEmpId}
        </span>
      </div>

      <button
        type="button"
        class="manager-history-edit-btn"
        data-employee-id="${employee.employeeEmpId}"
      >
        修改代訂
      </button>

    </div>


    <div class="manager-history-summary">

      <span>
        ${summaryText}
      </span>

      <button
        type="button"
        class="manager-history-toggle-btn"
      >
        查看明細 ▼
      </button>

    </div>


    <div
      class="manager-history-days hidden"
    >
      ${days}
    </div>

  </div>
`;
        })
        .join("");

      historyList.innerHTML = html;

      historyList.classList.remove("hidden");
    } catch (error) {
      console.error("讀取代訂紀錄失敗：", error);

      historyLoading.classList.add("hidden");

      historySearch.disabled = true;

      historyEmpty.textContent = error.message || "讀取代訂紀錄失敗";

      historyEmpty.classList.remove("hidden");
    }
  });

  // =========================
  // 返回首頁
  // =========================
  backButton.addEventListener("click", () => {
    orderPage.classList.add("hidden");

    homePage.classList.remove("hidden");
  });
  historyBackButton.addEventListener("click", () => {
    historyPage.classList.add("hidden");

    homePage.classList.remove("hidden");
  });
  addEmployeeBackButton.addEventListener("click", () => {
  addEmployeePage.classList.add("hidden");

  homePage.classList.remove("hidden");
});
// =========================
// 管理者代訂－新增人員
// =========================
addEmployeeSubmitButton.addEventListener("click", async () => {
  const employeeId =
    newEmployeeId.value.trim().toUpperCase();

  const name =
    newEmployeeName.value.trim();

  const group =
    newEmployeeGroup.value.trim();

  if (!employeeId) {
    alert("請輸入員工工號");
    newEmployeeId.focus();
    return;
  }

  if (!name) {
    alert("請輸入員工姓名");
    newEmployeeName.focus();
    return;
  }

  if (!group) {
    alert("無法取得管理者組別，請重新登入");
    return;
  }

  try {
    addEmployeeSubmitButton.disabled = true;
    addEmployeeSubmitButton.textContent = "新增中...";

    const response = await fetch(
      APP_CONFIG.ADMIN_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          action: "addManagerProxyEmployee",
          employeeId,
          name,
          group
        })
      }
    );

    const result = await response.json();

    if (!result.success) {
      alert(result.message || "新增人員失敗");
      return;
    }

    alert("人員新增完成");

    // 清除人員快取，讓下次進入代訂時重新取得最新名單
    sessionStorage.removeItem("managerEmployeeCache");


    newEmployeeId.value = "";
    newEmployeeName.value = "";

  } catch (error) {
    console.error(
      "管理者代訂新增人員失敗：",
      error
    );

    alert("新增人員失敗，請稍後再試");

  } finally {
    addEmployeeSubmitButton.disabled = false;
    addEmployeeSubmitButton.textContent = "確認新增人員";
  }
});
  // =========================
  // 代訂紀錄搜尋
  // =========================
  historySearch.addEventListener("input", () => {
    const keyword = historySearch.value.trim().toLowerCase();

    const cards = historyList.querySelectorAll(".manager-history-card");

    cards.forEach((card) => {
      const employeeId = card.dataset.employeeId?.toLowerCase() || "";

      const employeeName =
        card
          .querySelector(".manager-history-person strong")
          ?.textContent?.trim()
          ?.toLowerCase() || "";

      const matched =
        !keyword ||
        employeeId.includes(keyword) ||
        employeeName.includes(keyword);

      card.classList.toggle("hidden", !matched);
    });
  });
  historyList.addEventListener("click", (event) => {
    // =========================
    // 修改代訂
    // =========================
    const editButton = event.target.closest(".manager-history-edit-btn");

    if (editButton) {
      const employeeId = editButton.dataset.employeeId || "";
      editingEmployeeId = employeeId;

      if (!employeeId) {
        alert("無法取得代訂人員資料。");
        return;
      }

      const employee = employeeData.find((item) => item.id === employeeId);

      if (!employee) {
        alert("找不到此員工資料，請重新進入新增代訂頁。");
        return;
      }

      historyPage.classList.add("hidden");
      homePage.classList.add("hidden");
      orderPage.classList.remove("hidden");

      departmentSelect.value = employee.group || currentManager?.group || "";

      departmentSelect.dispatchEvent(new Event("change"));

      employeeSelect.value = employee.id;

      employeeSelect.dispatchEvent(new Event("change"));

      loadManagerExistingOrder(employee.id);
      submitButton.textContent = "更新整週代訂";

      return;
    }
    // =========================
    // 查看 / 收合明細
    // =========================
    const toggleButton = event.target.closest(".manager-history-toggle-btn");

    if (!toggleButton) {
      return;
    }

    const card = toggleButton.closest(".manager-history-card");

    if (!card) {
      return;
    }

    const days = card.querySelector(".manager-history-days");

    if (!days) {
      return;
    }

    const isHidden = days.classList.contains("hidden");

    days.classList.toggle("hidden");

    toggleButton.textContent = isHidden ? "收合明細 ▲" : "查看明細 ▼";
  });

  // =========================
  // 部門連動人員
  // =========================
  departmentSelect.addEventListener("change", () => {
    const group = departmentSelect.value;

    employeeSelect.innerHTML = "";

    employeePreview.classList.add("hidden");

    if (!group) {
      employeeSelect.disabled = true;

      employeeSelect.innerHTML = `
        <option value="">
          請先選擇組別
        </option>
      `;

      updateSummary();

      return;
    }

    employeeSelect.disabled = false;

    employeeSelect.innerHTML = `
      <option value="">
        請選擇人員
      </option>
    `;

    const employees = employeeData.filter(
      (employee) =>
        employee.group === group && employee.group === currentManager?.group,
    );

    employees.forEach((employee) => {
      const option = document.createElement("option");

      option.value = employee.id;

      option.textContent = `${employee.name}｜${employee.id}`;

      option.dataset.name = employee.name;

      employeeSelect.appendChild(option);
    });

    updateSummary();
  });

  // =========================
  // 人員選擇
  // =========================
  employeeSelect.addEventListener("change", () => {
    const selectedOption = employeeSelect.options[employeeSelect.selectedIndex];

    if (!employeeSelect.value) {
      employeePreview.classList.add("hidden");

      updateSummary();

      return;
    }

    const selectedName = selectedOption.dataset.name;

    const selectedId = selectedOption.value;

    employeeName.textContent = selectedName;

    employeeDetail.textContent = `${departmentSelect.value}｜${selectedId}`;

    employeePreview.classList.remove("hidden");

    updateSummary();
  });
  // =========================
  // 整週用餐方式變更
  // =========================
  weeklyMeals.addEventListener("change", (event) => {
    const target = event.target;

    // =========================
    // 用餐方式
    // =========================
    if (target.matches("[data-meal-type]")) {
      const dayKey = target.dataset.day;
      const mealType = target.value;

      weeklyMealState[dayKey].mealType = mealType;

      const lunchboxFields = weeklyMeals.querySelector(
        `[data-lunchbox-fields="${dayKey}"]`,
      );

      if (mealType === "便當") {
        if (!defaultFactory.value || !defaultFoodType.value) {
          alert("請先選擇預設廠區與預設葷素。");

          target.checked = false;

          weeklyMealState[dayKey].mealType = "";

          updateSummary();

          return;
        }

        weeklyMealState[dayKey].factory = defaultFactory.value;

        weeklyMealState[dayKey].foodType = defaultFoodType.value;

        weeklyMealState[dayKey].quantity =
          weeklyMealState[dayKey].quantity || 1;

        lunchboxFields?.classList.remove("hidden");
      } else {
        lunchboxFields?.classList.add("hidden");

        // 非便當不需要這些資料
        weeklyMealState[dayKey].factory = "";
        weeklyMealState[dayKey].foodType = "";
        weeklyMealState[dayKey].quantity = 1;
        weeklyMealState[dayKey].note = "";
      }

      updateSummary();
      return;
    }

    // =========================
    // 廠區
    // =========================
    if (target.matches("[data-factory]")) {
      const dayKey = target.dataset.factory;

      weeklyMealState[dayKey].factory = target.value;

      updateSummary();
      return;
    }

    // =========================
    // 葷素
    // =========================
    if (target.matches("[data-food-type]")) {
      const dayKey = target.dataset.foodType;

      weeklyMealState[dayKey].foodType = target.value;

      updateSummary();
      return;
    }
  });
  // =========================
  // 便當數量 ＋ / －
  // =========================
  weeklyMeals.addEventListener("click", (event) => {
    const target = event.target;

    // 減少數量
    if (target.matches("[data-quantity-minus]")) {
      const dayKey = target.dataset.quantityMinus;

      const currentQuantity = Number(weeklyMealState[dayKey].quantity || 1);

      const newQuantity = Math.max(1, currentQuantity - 1);

      weeklyMealState[dayKey].quantity = newQuantity;

      const display = weeklyMeals.querySelector(
        `[data-quantity-display="${dayKey}"]`,
      );

      if (display) {
        display.textContent = newQuantity;
      }

      updateSummary();
      return;
    }

    // 增加數量
    if (target.matches("[data-quantity-plus]")) {
      const dayKey = target.dataset.quantityPlus;

      const currentQuantity = Number(weeklyMealState[dayKey].quantity || 1);

      const newQuantity = currentQuantity + 1;

      weeklyMealState[dayKey].quantity = newQuantity;

      const display = weeklyMeals.querySelector(
        `[data-quantity-display="${dayKey}"]`,
      );

      if (display) {
        display.textContent = newQuantity;
      }

      updateSummary();
    }
  });
  // =========================
  // 預設便當條件變更
  // 同步所有已選便當日期
  // =========================
  function syncManagerDefaultMealSettings() {
    Object.values(weeklyMealState).forEach((meal) => {
      if (!meal || meal.mealType !== "便當") {
        return;
      }

      meal.factory = defaultFactory.value;
      meal.foodType = defaultFoodType.value;
    });

    updateSummary();
  }

  defaultFactory.addEventListener("change", () => {
    syncManagerDefaultMealSettings();
  });

  defaultFoodType.addEventListener("change", () => {
    syncManagerDefaultMealSettings();
  });

  function loadManagerExistingOrder(employeeId) {
    console.log("=== 開始載入修改代訂 ===");
    console.log("employeeId =", employeeId);
    console.log("managerHistoryRecords =", managerHistoryRecords);

    const employeeRecords = managerHistoryRecords.filter(
      (item) =>
        String(item.employeeEmpId || "").trim() ===
        String(employeeId || "").trim(),
    );

    console.log("employeeRecords =", employeeRecords);

    if (employeeRecords.length === 0) {
      alert("找不到此人員的代訂紀錄。");
      return;
    }

    employeeRecords.forEach((record) => {
      const recordDate = String(record.orderDate || "")
        .trim()
        .substring(0, 10);

      const dayEntry = Object.entries(weeklyMealState).find(([, meal]) => {
        const mealDate = String(meal.date || "")
          .trim()
          .substring(0, 10);

        return mealDate === recordDate;
      });

      if (!dayEntry) {
        return;
      }

      const [dayKey, meal] = dayEntry;

      // 國定假日不覆蓋
      if (meal.mealType === "國定假日") {
        return;
      }

      meal.mealType = record.mealType || "";

      if (record.mealType === "便當") {
        meal.factory = record.factory || "";
        meal.foodType = record.foodType || "";
        meal.quantity = Number(record.quantity) || 1;
      } else {
        meal.factory = "";
        meal.foodType = "";
        meal.quantity = 1;
      }

      const radio = weeklyMeals.querySelector(
        `[data-day="${dayKey}"][data-meal-type][value="${record.mealType}"]`,
      );

      if (radio) {
        radio.checked = true;
      }

      const lunchboxFields = weeklyMeals.querySelector(
        `[data-lunchbox-fields="${dayKey}"]`,
      );

      const quantityDisplay = weeklyMeals.querySelector(
        `[data-quantity-display="${dayKey}"]`,
      );

      if (record.mealType === "便當") {
        lunchboxFields?.classList.remove("hidden");

        if (quantityDisplay) {
          quantityDisplay.textContent = meal.quantity;
        }
        /*
         * 目前頁面只有一組預設廠區 / 葷素，
         * 先帶入既有便當設定。
         */
        if (record.factory) {
          defaultFactory.value = record.factory;
        }

        if (record.foodType) {
          defaultFoodType.value = record.foodType;
        }
      } else {
        lunchboxFields?.classList.add("hidden");
      }
    });

    updateSummary();
  }
  function formatManagerHistoryDate(dateText) {
    if (!dateText) {
      return "";
    }

    const date = new Date(`${dateText}T00:00:00`);

    const weekNames = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${weekNames[date.getDay()]} ${month}/${day}`;
  }

  function setManagerOrderFormLocked(locked) {
    orderPage.classList.toggle("is-submitting", locked);

    backButton.disabled = locked;
    departmentSelect.disabled = locked;
    employeeSelect.disabled = locked;
    defaultFactory.disabled = locked;
    defaultFoodType.disabled = locked;

    weeklyMeals.querySelectorAll("input, select, button").forEach((element) => {
      element.disabled = locked;
    });

    submitButton.disabled = locked;
  }
  // =========================
  // 更新摘要
  // =========================
  function updateSummary() {
    // =========================
    // 代訂人員
    // =========================
    if (employeeSelect.value) {
      const selectedOption =
        employeeSelect.options[employeeSelect.selectedIndex];

      summaryEmployee.textContent = `${selectedOption.dataset.name}｜${employeeSelect.value}`;
    } else {
      summaryEmployee.textContent = "尚未選擇";
    }

    // =========================
    // 整週摘要
    // =========================
    const weekDays = [
      {
        key: "monday",
        name: "星期一",
      },
      {
        key: "tuesday",
        name: "星期二",
      },
      {
        key: "wednesday",
        name: "星期三",
      },
      {
        key: "thursday",
        name: "星期四",
      },
      {
        key: "friday",
        name: "星期五",
      },
    ];

    let allReady = Boolean(employeeSelect.value);

    let hasActualMeal = false;

    const summaryLines = [];

    weekDays.forEach((day) => {
      const meal = weeklyMealState[day.key];

      if (!meal) {
        allReady = false;
        return;
      }

      // =========================
      // 國定假日
      // =========================
      if (meal.mealType === "國定假日") {
        summaryLines.push(`
        <div class="manager-week-summary-row">
          <strong>
            ${day.name}
          </strong>

          <span>
            國定假日
          </span>
        </div>
      `);

        return;
      }

      // =========================
      // 尚未選擇
      // =========================
      if (!meal.mealType) {
        allReady = false;

        summaryLines.push(`
        <div class="manager-week-summary-row">
          <strong>
            ${day.name}
          </strong>

          <span>
            尚未選擇
          </span>
        </div>
      `);

        return;
      }

      // =========================
      // 便當
      // =========================
      if (meal.mealType === "便當") {
        hasActualMeal = true;
        if (
          !meal.factory ||
          !meal.foodType ||
          !Number.isInteger(Number(meal.quantity)) ||
          Number(meal.quantity) < 1
        ) {
          allReady = false;
        }

        summaryLines.push(`
        <div class="manager-week-summary-row">

          <strong>
            ${day.name}
          </strong>

          <span>
            便當｜
            ${meal.factory || "未選廠區"}｜
            ${meal.foodType || "未選葷素"}｜
            ${meal.quantity || 1} 份
          </span>

        </div>
      `);

        return;
      }

      // =========================
      // 上樓用餐 / 不用餐
      // =========================
      if (meal.mealType === "上樓用餐") {
        hasActualMeal = true;
      }
      summaryLines.push(`
      <div class="manager-week-summary-row">

        <strong>
          ${day.name}
        </strong>

        <span>
          ${meal.mealType}
        </span>

      </div>
    `);
    });

    weeklySummary.innerHTML = summaryLines.join("");

    if (!hasActualMeal) {
      allReady = false;
    }

    submitButton.disabled = !allReady;
  }
  // =========================
  // 送出整週代訂
  // =========================
  submitButton.addEventListener("click", async () => {
    if (isSubmitting) {
      return;
    }

    if (!currentManager) {
      alert("管理者登入資料已失效，請重新登入。");
      return;
    }

    if (!employeeSelect.value) {
      alert("請先選擇代訂人員。");
      return;
    }

    if (!managerTargetWeekKey) {
      alert("目前無法取得下週訂餐週次。");
      return;
    }

    const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday"];

    const weeklyMealsPayload = {};
    let hasActualMeal = false;

    for (const dayKey of weekDays) {
      const meal = weeklyMealState[dayKey];

      if (!meal) {
        alert("整週用餐資料尚未載入完成。");
        return;
      }

      if (meal.mealType === "國定假日") {
        weeklyMealsPayload[dayKey] = {
          mealType: "國定假日",
        };

        continue;
      }

      if (!meal.mealType) {
        alert("請完成週一至週五的用餐方式。");
        return;
      }

      if (meal.mealType === "便當") {
        hasActualMeal = true;
        const quantity = Number(meal.quantity);

        if (!meal.factory) {
          alert("便當訂單尚有廠區未選擇。");
          return;
        }

        if (!meal.foodType) {
          alert("便當訂單尚有葷素未選擇。");
          return;
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
          alert("便當數量必須是大於 0 的整數。");
          return;
        }

        weeklyMealsPayload[dayKey] = {
          mealType: "便當",
          factory: meal.factory,
          foodType: meal.foodType,
          quantity: quantity,
        };
        continue;
      }

      if (meal.mealType === "上樓用餐") {
        hasActualMeal = true;
      }

      weeklyMealsPayload[dayKey] = {
        mealType: meal.mealType,
      };
    }

    if (!hasActualMeal) {
      alert("整週不能全部選擇不用餐，請至少安排一天便當或上樓用餐。");
      return;
    }
    isSubmitting = true;

    const originalText = submitButton.textContent;

    try {
      setManagerOrderFormLocked(true);

      submitButton.textContent = "整週代訂送出中...";

      const result = await managerApiPost({
        action: editingEmployeeId
          ? "updateManagerProxyWeekOrder"
          : "saveManagerProxyWeekOrder",

        managerEmpId: currentManager.id,

        employeeEmpId: employeeSelect.value,

        weekKey: managerTargetWeekKey,

        weeklyMeals: weeklyMealsPayload,
      });

      if (!result.success) {
        throw new Error(result.message || "整週代訂失敗");
      }

      alert(result.message || "整週代訂成功");

      const wasEditing = Boolean(editingEmployeeId);

      // =========================
      // 送出成功後重設表單
      // 保留組長登入狀態與組別
      // =========================

      // 修改完成後退出修改模式
      editingEmployeeId = "";
      submitButton.textContent = "送出整週代訂";

      if (wasEditing) {
        orderPage.classList.add("hidden");
        homePage.classList.add("hidden");
        historyPage.classList.remove("hidden");

        historyButton.click();

        return;
      }
      // 清除目前代訂人員
      employeeSelect.value = "";

      // 隱藏人員預覽
      employeePreview.classList.add("hidden");

      // 重新建立週一～週五
      // 同時清空上一筆整週用餐選擇
      loadManagerTargetWeekDates();
      if (historyWeek) {
        historyWeek.textContent = `週次：${managerTargetWeekKey}`;
      }

      // 更新 STEP 3 摘要
      updateSummary();
    } catch (error) {
      console.error("整週代訂送出失敗：", error);

      alert(error.message || "整週代訂失敗，請稍後再試。");
    } finally {
      isSubmitting = false;

      setManagerOrderFormLocked(false);

      submitButton.textContent = editingEmployeeId
        ? "更新整週代訂"
        : "送出整週代訂";

      updateSummary();
    }
  });
  // =========================
  // 關閉頁重新整理
  // =========================
  closedRefreshButton.addEventListener("click", () => {
    window.location.reload();
  });

  // =========================
  // 啟動管理者代訂系統
  // =========================
  loadManagerSystemStatus();
});
