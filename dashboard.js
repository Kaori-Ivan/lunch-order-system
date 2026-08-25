let dashboardData = {
  currentWeek: {
    startDate: "2026-08-10",
    endDate: "2026-08-14",

    lunchBoxTotal: 102,
    dineUpstairsTotal: 8,
    meatTotal: 75,
    vegetarianTotal: 27,
    newcomerTotal: 2,
  },

  nextWeek: {
    weekId: "",
    startDate: "",
    endDate: "",

    holidays: [],
    serviceDates: [],

    deadline: "2026-07-18T12:00:00",
    orderStatus: "PENDING",

    lunchBoxTotal: 102,
    dineUpstairsTotal: 8,
    meatTotal: 75,
    vegetarianTotal: 27,
    newcomerTotal: 2,

    factories: [
      {
        factoryId: "A",
        factoryName: "A 廠",
        meatTotal: 32,
        vegetarianTotal: 10,
      },
      {
        factoryId: "B",
        factoryName: "B 廠",
        meatTotal: 18,
        vegetarianTotal: 6,
      },
      {
        factoryId: "C",
        factoryName: "C 廠",
        meatTotal: 25,
        vegetarianTotal: 11,
      },
    ],
  },
};
function initializeDashboardData() {
  const currentWeek = getCurrentWeekRange();

  const nextWeek = getNextWeekRange();

  /*
   * 本週日期。
   */
  dashboardData.currentWeek.startDate = currentWeek.startDateValue;

  dashboardData.currentWeek.endDate = currentWeek.endDateValue;

  /*
   * 下週日期。
   */
  dashboardData.nextWeek.startDate = nextWeek.startDateValue;

  dashboardData.nextWeek.endDate = nextWeek.endDateValue;

  dashboardData.nextWeek.weekId = getIsoWeekId(nextWeek.startDateValue);
}
function getIsoWeekId(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);

  const target = new Date(date);
  const dayNumber = (date.getDay() + 6) % 7;

  target.setDate(target.getDate() - dayNumber + 3);

  const firstThursday = new Date(target.getFullYear(), 0, 4);

  const firstDayNumber = (firstThursday.getDay() + 6) % 7;

  firstThursday.setDate(firstThursday.getDate() - firstDayNumber + 3);

  const weekNumber =
    1 + Math.round((target - firstThursday) / (7 * 24 * 60 * 60 * 1000));

  return `${target.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}
function getCurrentWeekRange(baseDate = new Date()) {
  const currentDate = new Date(baseDate);

  /*
   * JavaScript：
   * 星期日 = 0
   * 星期一 = 1
   */
  const currentDay = currentDate.getDay();

  /*
   * 找到本週星期一。
   */
  const daysFromMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const thisMonday = new Date(currentDate);

  thisMonday.setDate(currentDate.getDate() + daysFromMonday);

  /*
   * 本週星期五。
   */
  const thisFriday = new Date(thisMonday);

  thisFriday.setDate(thisMonday.getDate() + 4);

  return {
    startDate: formatDate(thisMonday),

    endDate: formatDate(thisFriday),

    startDateValue: formatDateValue(thisMonday),

    endDateValue: formatDateValue(thisFriday),
  };
}
function getNextWeekRange(baseDate = new Date()) {
  const currentDate = new Date(baseDate);

  // JavaScript：星期日為 0、星期一為 1
  const currentDay = currentDate.getDay();

  // 找到本週星期一
  const daysFromMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const thisMonday = new Date(currentDate);
  thisMonday.setDate(currentDate.getDate() + daysFromMonday);

  // 下週星期一
  const nextMonday = new Date(thisMonday);
  nextMonday.setDate(thisMonday.getDate() + 7);

  // 下週星期五
  const nextFriday = new Date(nextMonday);
  nextFriday.setDate(nextMonday.getDate() + 4);

  return {
    startDate: formatDate(nextMonday),
    endDate: formatDate(nextFriday),
    startDateValue: formatDateValue(nextMonday),
    endDateValue: formatDateValue(nextFriday),
  };
}

function formatDate(date) {
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = weekdays[date.getDay()];

  return `${year}/${month}/${day}（${weekday}）`;
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
const names = [
  "王小明",
  "李美玲",
  "張志豪",
  "陳雅婷",
  "林冠宇",
  "黃筱琪",
  "吳俊穎",
  "劉彥廷",
  "周佳樺",
  "林佑謙",
];
const depts = ["工程部", "業務部", "工程部", "管理部"];
const groups = ["軟體組", "硬體組", "業務一組", "業務二組", "行政組"];

const factories = ["一廠", "二廠"];
const newcomerMeals = [
  {
    id: "N0001",
    mealDate: "2026-08-11",
    quantity: 5,
    department: "人資部",
    note: "新進員工",
    diningMethod: "上樓用餐",
    createdAt: "2026-08-08 09:12",
  },
  {
    id: "N0002",
    mealDate: "2026-08-13",
    quantity: 8,
    department: "工程部",
    note: "新進員工",
    diningMethod: "上樓用餐",
    createdAt: "2026-08-08 09:25",
  },
  {
    id: "N0003",
    mealDate: "2026-08-15",
    quantity: 7,
    department: "品保部",
    note: "新進員工",
    diningMethod: "上樓用餐",
    createdAt: "2026-08-08 09:40",
  },
  loadWeeklyOrderSummary,
];
let weeklyOrderSummaryData = null;
let weeklyOrderSummaryLoaded = false;
let weeklyOrderSummaryLoading = false;
let currentWeekOrderSummaryData = null;
let currentWeekOrderSummaryLoaded = false;
let currentWeekOrderSummaryLoading = false;
// =========================
// 新人用餐真實資料
// =========================
let newcomerMealData = null;
let newcomerMealLoaded = false;
let newcomerMealLoading = false;
const weeklyOrders = Array.from({ length: 24 }, (_, i) => {
  const diningMethod = i % 3 !== 2 ? "上樓用餐" : "固定便當";

  const isLunchBox = diningMethod === "固定便當";

  return {
    orderId: `W30-${String(i + 1).padStart(3, "0")}`,

    weekId: "2026-W30",

    employeeId: `E${String(123 + i).padStart(5, "0")}`,

    employeeName: names[i % names.length],

    department: depts[i % depts.length],

    group: groups[i % groups.length],

    diningMethod,

    factory: isLunchBox ? factories[i % factories.length] : null,

    mealType: isLunchBox ? (i % 2 ? "素食" : "葷食") : null,

    updatedAt: `2026-07-14 ${String(8 + Math.floor(i / 10)).padStart(
      2,
      "0",
    )}:${String(12 + ((i * 3) % 48)).padStart(2, "0")}`,
  };
});
function saveWeeklyOrder(orderData) {
  const existingIndex = weeklyOrders.findIndex(
    (order) =>
      order.weekId === orderData.weekId &&
      order.employeeId === orderData.employeeId,
  );

  const normalizedOrder = {
    ...orderData,

    factory: orderData.diningMethod === "固定便當" ? orderData.factory : null,

    mealType: orderData.diningMethod === "固定便當" ? orderData.mealType : null,

    updatedAt: new Date().toLocaleString("zh-TW"),
  };

  if (existingIndex >= 0) {
    weeklyOrders[existingIndex] = {
      ...weeklyOrders[existingIndex],
      ...normalizedOrder,
    };

    return {
      type: "updated",
      order: weeklyOrders[existingIndex],
    };
  }

  const newOrder = {
    orderId: `WO-${Date.now()}`,
    ...normalizedOrder,
  };

  weeklyOrders.push(newOrder);

  return {
    type: "created",
    order: newOrder,
  };
}
const historyPeriods = [
  {
    weekId: "2026-W33",
    startDate: "2026-08-10",
    endDate: "2026-08-14",
  },
  {
    weekId: "2026-W32",
    startDate: "2026-08-03",
    endDate: "2026-08-07",
  },
  {
    weekId: "2026-W31",
    startDate: "2026-07-27",
    endDate: "2026-07-31",
  },
];


let page = "dashboard";
/* ========================================
   休假日設定
======================================== */

let holidays = [];

let holidaysLoaded = false;
let holidaysLoading = false;
/* ========================================
   人員資料管理
======================================== */

let employees = [];
let employeesLoaded = false;
let employeesLoading = false;

async function loadEmployees() {
  if (employeesLoaded) {
    return;
  }

  try {
    const response = await fetch(APP_CONFIG.ADMIN_API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "getEmployees",
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "讀取人員資料失敗");
    }

    employees = result.data.map((item) => ({
      employeeId: item.employeeId,
      name: item.name,
      department: item.department,
      group: item.group,
      role: item.role,

      // Sheet TRUE / FALSE
      // 轉成目前畫面使用的文字
      status: item.enabled ? "啟用" : "停用",
    }));

    employeesLoaded = true;

    console.log("人員資料讀取成功：", employees);
  } catch (error) {
    console.error("人員資料讀取失敗：", error);

    employeesLoaded = false;
  }
}
async function loadHolidays() {
  try {
    const response = await fetch(APP_CONFIG.ADMIN_API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "getHolidays",
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "讀取休假日失敗");
    }

    holidays = result.data || [];

    holidaysLoaded = true;

    console.log("休假日讀取成功：", holidays);
  } catch (error) {
    console.error("休假日讀取失敗：", error);

    holidaysLoaded = false;

    throw error;
  }
}
async function loadHolidaysAndRender() {
  if (holidaysLoaded) {
    render();
    return;
  }

  if (holidaysLoading) {
    return;
  }

  holidaysLoading = true;

  // 先顯示目前頁面
  render();

  try {
    await loadHolidays();
  } catch (error) {
    console.error("載入休假日失敗：", error);
  } finally {
    holidaysLoading = false;

    // ★ 關鍵：資料回來後重新畫一次
    if (page === "holidays") {
      render();
    }
  }
}
async function loadEmployeesAndRender() {
  // 已經有資料，直接顯示
  if (employeesLoaded) {
    render();
    return;
  }

  // 正在讀取就不要重複呼叫
  if (employeesLoading) {
    return;
  }

  // 先設定 Loading
  employeesLoading = true;

  // 先顯示讀取畫面
  render();

  try {
    await loadEmployees();
  } finally {
    // loadEmployees 完成後
    employeesLoading = false;

    // 再重新畫人員頁
    if (page === "employees") {
      render();
    }
  }
}

let employeePageNo = 1;
const employeePageSize = 10;

let employeeFilters = {
  keyword: "",
  group: "",
  status: "",
};
let pageNo = 1;
let selectedSpecialOrderDate = "";
/* 訂餐管理目前開啟的分頁 */
let orderTab = "next-week";
let orderFilters = {
  keyword: "",
  group: "",
  mealType: "",
  factory: "",
  diet: "",
};
let historyFilters = {
  weekId: "",
  keyword: "",
  department: "",
  diningMethod: "",
  factory: "",
  mealType: "",
};

const historyPageSize = 10;
/* 下週訂單提交狀態 */
let nextWeekOrderSubmitted = false;
let nextWeekOrderSubmittedAt = "";

let currentWeekPageNo = 1;
const currentWeekPageSize = 8;
let currentWeekFilters = {
  keyword: "",
  group: "",
  diningMethod: "",
  factory: "",
  mealType: "",
};
const nav = document.querySelector("#nav"),
  content = document.querySelector("#content");
function renderNavigation() {
  nav.innerHTML = `
    <!-- 首頁總覽 -->
    <button
      type="button"
      class="nav-item ${page === "dashboard" ? "active" : ""}"
      data-page="dashboard"
    >
      <span class="nav-icon">🏠</span>

      <span class="nav-label">
        首頁總覽
      </span>
    </button>

    <!-- 訂餐管理標題 -->
    <button
      type="button"
      class="nav-item nav-parent ${page === "orders" ? "active" : ""}"
      data-page="orders"
    >
      <span class="nav-icon">📅</span>

      <span class="nav-label">
        訂餐管理
      </span>
    </button>

    <!-- 訂餐管理子選單 -->
    <div class="nav-submenu">

      <button
        type="button"
        class="nav-subitem ${
          page === "orders" && orderTab === "next-week" ? "active" : ""
        }"
        data-order-nav="next-week"
      >
        <span class="nav-subitem-icon">📋</span>
        <span>下週訂單</span>
      </button>

      <button
        type="button"
        class="nav-subitem ${
          page === "orders" && orderTab === "current-week" ? "active" : ""
        }"
        data-order-nav="current-week"
      >
        <span class="nav-subitem-icon">🍱</span>
        <span>本週供餐</span>
      </button>

      <button
        type="button"
        class="nav-subitem ${
          page === "orders" && orderTab === "newcomer" ? "active" : ""
        }"
        data-order-nav="newcomer"
      >
        <span class="nav-subitem-icon">🥢</span>
        <span>新人用餐</span>
      </button>

        </div>


    <!-- 人員資料管理 -->
    <button
      type="button"
      class="nav-item ${page === "employees" ? "active" : ""}"
      data-page="employees"
    >
      <span class="nav-icon">👤</span>

      <span class="nav-label">
        人員資料管理
      </span>
    </button>


    <!-- 系統設定 -->
    <button
      type="button"
      class="nav-item nav-parent"
    >
      <span class="nav-icon">⚙️</span>

      <span class="nav-label">
        系統設定
      </span>
    </button>


    <div class="nav-submenu">

      <button
  type="button"
  class="nav-subitem ${page === "holidays" ? "active" : ""}"
  data-page="holidays"
>
  <span class="nav-subitem-icon">📅</span>

  <span>
    休假日設定
  </span>
</button>

    </div>
  `;
}

nav.addEventListener("click", (event) => {
  /*
   * 先判斷是否點擊「訂餐管理」下面的子選單
   */
  const orderNavButton = event.target.closest("[data-order-nav]");

  if (orderNavButton) {
    page = "orders";
    orderTab = orderNavButton.dataset.orderNav;

    // 回到列表第一頁
    pageNo = 1;

    // 本週供餐使用自己的分頁狀態
    if (orderTab === "current-week") {
      currentWeekPageNo = 1;
    }

    if (orderTab === "next-week") {
      loadNextWeekOrdersAndRender();
      return;
    }

    render();
    return;
  }

  /*
   * 再判斷是否點擊首頁或訂餐管理主選單
   */
  const pageButton = event.target.closest("[data-page]");

  if (!pageButton) {
    return;
  }

  page = pageButton.dataset.page;
  pageNo = 1;

  if (page === "orders") {
    orderTab = "next-week";

    loadNextWeekOrdersAndRender();
    return;
  }

  if (page === "employees") {
    loadEmployeesAndRender();
    return;
  }

  if (page === "holidays") {
    loadHolidaysAndRender();
    return;
  }

  render();
});
function setHeader() {
  const pageTitle = document.querySelector("#pageTitle");
  const pageSubtitle = document.querySelector("#pageSubtitle");
  const topActions = document.querySelector(".top-actions");

  // 人員資料管理
  if (page === "employees") {
    pageTitle.innerHTML = `
    <span class="employee-title-icon">👤</span>
    人員資料管理
  `;
    pageSubtitle.textContent = "管理人員基本資料與系統使用權限。";

    if (topActions) {
      topActions.innerHTML = `
      <button
        type="button"
        class="btn btn-primary employee-header-add"
        id="addEmployeeBtn"
      >
        ＋ 新增人員
      </button>
    `;
    }

    return;
  }

  // 休假日設定
  if (page === "holidays") {
    pageTitle.innerHTML = `
    <span class="holiday-title-icon">🗓</span>
    休假日設定
  `;

    pageSubtitle.textContent =
      "設定公司或廠區的休假日，系統將於訂餐時自動排除。";

    if (topActions) {
      topActions.innerHTML = `
      <div class="holiday-header-decoration">
        <img
          src="images/holiday-decoration.png"
          alt=""
        >
      </div>

      <button
        type="button"
        class="btn btn-primary holiday-header-add"
        id="addHolidayBtn"
      >
        ＋ 新增休假日
      </button>
    `;
    }

    return;
  }

  // 其餘頁面恢復日期卡
  if (topActions) {
    topActions.innerHTML = `
      <div class="info-card week-info-card">
        <span>📅</span>

        <div>
          <small>下週訂餐週期</small>
          <b id="nextWeekRange">讀取中...</b>
        </div>
      </div>
    `;

    updateNextWeekRange();
  }

  // 首頁
  if (page === "dashboard") {
    pageTitle.textContent = "首頁總覽";
    pageSubtitle.textContent = "快速掌握下週訂餐與本週供餐狀況";

    return;
  }

  // 訂餐管理
  const orderHeaderMap = {
    "next-week": {
      title: "下週訂單",
      subtitle: "查詢下週訂餐統計與訂單明細",
    },

    "current-week": {
      title: "本週供餐",
      subtitle: "查看本週供餐人數與餐別統計",
    },

    newcomer: {
      title: "新人用餐",
      subtitle: "新增、修改及刪除新人用餐資料",
    },
  };

  const header = orderHeaderMap[orderTab] || orderHeaderMap["next-week"];

  pageTitle.textContent = header.title;
  pageSubtitle.textContent = header.subtitle;
}
function render() {
  renderNavigation();
  setHeader();

  const pageViews = {
    dashboard: dashboardView,
    orders: ordersView,
    employees: employeesView,
    holidays: holidaysView,
  };

  const selectedView = pageViews[page];

  if (typeof selectedView !== "function") {
    console.error("找不到頁面：", page);

    page = "dashboard";
    content.innerHTML = dashboardView();
  } else {
    content.innerHTML = selectedView();
  }

  bindCommon();

  // =========================
  // 人員資料第一次進入時
  // 從 Apps Script 讀取 Sheet
  // =========================
}
function getFilteredEmployees() {
  const keyword = employeeFilters.keyword.trim().toLowerCase();

  return employees.filter((employee) => {
    const employeeId = String(employee.employeeId || "").toLowerCase();

    const name = String(employee.name || "").toLowerCase();

    const matchKeyword =
      !keyword || employeeId.includes(keyword) || name.includes(keyword);

    const matchGroup =
      !employeeFilters.group || employee.group === employeeFilters.group;

    const matchStatus =
      !employeeFilters.status || employee.status === employeeFilters.status;

    return matchKeyword && matchGroup && matchStatus;
  });
}
function employeesView() {
  if (employeesLoading && !employeesLoaded) {
    return `
      <div class="employee-page">
        <section class="card employee-list-card">
          <div style="padding: 60px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 12px;">
              ⏳
            </div>

            <strong>
              正在讀取人員資料...
            </strong>

            <p class="muted">
              請稍候
            </p>
          </div>
        </section>
      </div>
    `;
  }

  const filteredEmployees = getFilteredEmployees();
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / employeePageSize),
  );

  if (employeePageNo > totalPages) {
    employeePageNo = totalPages;
  }

  const startIndex = (employeePageNo - 1) * employeePageSize;

  const currentEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + employeePageSize,
  );

  const groupOptions = [
    ...new Set(employees.map((employee) => employee.group).filter(Boolean)),
  ];

  return `
    <div class="employee-page">


      <!-- 查詢條件 -->
      <section class="card employee-filter-card">

        <div class="employee-filter-grid">


          <!-- 關鍵字 -->
          <div class="employee-search-box">

            <span class="employee-search-icon">
              🔍
            </span>

            <input
              type="text"
              id="employeeKeyword"
              placeholder="搜尋工號或姓名"
              value="${employeeFilters.keyword}"
            >

          </div>


          <!-- 組別 -->
          <div class="field">

            <label>
              組別
            </label>

            <select id="employeeGroupFilter">

              <option value="">
                全部
              </option>

              ${groupOptions
                .map(
                  (group) => `
                    <option
                      value="${group}"
                      ${employeeFilters.group === group ? "selected" : ""}
                    >
                      ${group}
                    </option>
                  `,
                )
                .join("")}

            </select>

          </div>


          <!-- 狀態 -->
          <div class="field">

            <label>
              狀態
            </label>

            <select id="employeeStatusFilter">

              <option value="">
                全部
              </option>

              <option
                value="啟用"
                ${employeeFilters.status === "啟用" ? "selected" : ""}
              >
                啟用
              </option>

              <option
                value="停用"
                ${employeeFilters.status === "停用" ? "selected" : ""}
              >
                停用
              </option>

            </select>

          </div>


          <!-- 查詢 -->
          <button
            type="button"
            class="btn btn-primary"
            id="employeeSearchBtn"
          >
            🔍 查詢
          </button>


          <!-- 清除 -->
          <button
            type="button"
            class="btn btn-outline"
            id="employeeClearBtn"
          >
            ↻ 清除
          </button>


        </div>

      </section>



      <!-- 人員列表 -->
      <section class="card employee-list-card">

        <div class="table-wrap employee-table-wrap">

          <table class="data-table employee-table">

            <thead>

              <tr>
                <th>工號</th>
                <th>姓名</th>
                <th>部門</th>
                <th>組別</th>
                <th>狀態</th>
      
              </tr>

            </thead>


            <tbody>

              ${
                currentEmployees.length === 0
                  ? `
                    <tr>
                      <td
                        colspan="6"
                        class="employee-empty"
                      >
                        查無符合條件的人員資料
                      </td>
                    </tr>
                  `
                  : currentEmployees
                      .map(
                        (employee) => `
                          <tr>

                            <td>
                              <span class="employee-id">
                                ${employee.employeeId}
                              </span>
                            </td>


                            <td>
                              <strong>
                                ${employee.name}
                              </strong>
                            </td>


                            <td>
                              ${employee.department || "—"}
                            </td>


                            <td>
                              ${employee.group || "—"}
                            </td>


                            <td>

                              <span
                                class="employee-status ${
                                  employee.status === "啟用"
                                    ? "is-active"
                                    : "is-inactive"
                                }"
                              >
                                ${employee.status}
                              </span>

                            </td>


                            <td>

                              <div class="employee-actions">

                                <button
                                  type="button"
                                  class="employee-action-btn edit-employee-btn"
                                  data-employee-id="${employee.employeeId}"
                                  title="編輯"
                                >
                                  ✎
                                </button>

                              </div>

                            </td>

                          </tr>
                        `,
                      )
                      .join("")
              }

            </tbody>

          </table>

        </div>


        <!-- 表格底部 -->
        <div class="employee-table-footer">


          <span class="muted">

            共
            ${filteredEmployees.length}
            筆資料

          </span>


          <div class="employee-pages">

            <button
              type="button"
              class="employee-page-button"
              data-employee-page="${employeePageNo - 1}"
              ${employeePageNo === 1 ? "disabled" : ""}
            >
              ‹
            </button>


            ${createEmployeePagination(totalPages)}


            <button
              type="button"
              class="employee-page-button"
              data-employee-page="${employeePageNo + 1}"
              ${employeePageNo === totalPages ? "disabled" : ""}
            >
              ›
            </button>

          </div>


          <span class="muted employee-page-size">

            每頁顯示
            ${employeePageSize}
            筆

          </span>


        </div>

      </section>



      <!-- 小提醒 -->
      <section class="employee-reminder">

        <div class="employee-reminder-icon">
          ☀
        </div>

        <div>

          <strong>
            小提醒
          </strong>

          <p>
            人員資料更新後，系統將同步至訂餐管理。🧡
          </p>

        </div>


        <div class="employee-reminder-food">
          🍱 ☕
        </div>

      </section>


    </div>
  `;
}
function holidaysView() {
  console.log("holidaysView 收到：", holidays.length, holidays);

  if (holidaysLoading && !holidaysLoaded) {
    return `
      <div class="holiday-page">

        <section class="card holiday-list-card">

          <div
            style="
              min-height: 260px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
            "
          >

            <div
              style="
                font-size: 32px;
                margin-bottom: 14px;
              "
            >
              ⏳
            </div>

            <strong>
              正在讀取休假日資料...
            </strong>

            <p class="muted">
              請稍候
            </p>

          </div>

        </section>

      </div>
    `;
  }

  const sortedHolidays = [...holidays].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return `
  <div class="holiday-page">

    <!-- 小提醒 -->
    <section class="holiday-reminder">

      <div class="holiday-reminder-icon">
        🔔
      </div>

      <div>
        <strong>小提醒</strong>

        <p>
          新增的休假日將用於訂餐排除，避免安排餐點。☀
        </p>
      </div>

    </section>


    <!-- 休假日列表 -->
    <section class="card holiday-list-card">

      <div class="table-wrap holiday-table-wrap">

        <table class="data-table holiday-table">

          <thead>
            <tr>
              <th>▣ 日期</th>
              <th>◇ 休假日名稱</th>
              <th>⚙ 操作</th>
            </tr>
          </thead>

          <tbody>

            ${
              sortedHolidays.length === 0
                ? `
                  <tr>
                    <td
                      colspan="3"
                      class="holiday-empty"
                    >
                      目前沒有休假日資料
                    </td>
                  </tr>
                `
                : sortedHolidays
                    .map(
                      (holiday) => `
                        <tr>

                          <td>
                            ${formatHolidayDate(holiday.date)}
                          </td>

                          <td>
                            ${holiday.name}
                          </td>

                          <td>
                            <button
                              type="button"
                              class="holiday-delete-btn"
                              data-holiday-id="${holiday.id}"
                              title="刪除"
                            >
                              🗑
                            </button>
                          </td>

                        </tr>
                      `,
                    )
                    .join("")
            }

          </tbody>

        </table>

      </div>

    </section>

  </div>
`;
}
function createEmployeePagination(totalPages) {
  if (totalPages <= 1) {
    return `
      <button
        type="button"
        class="employee-page-button active"
        data-employee-page="1"
      >
        1
      </button>
    `;
  }

  const pages = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (employeePageNo > 4) {
      pages.push("...");
    }

    const start = Math.max(2, employeePageNo - 1);

    const end = Math.min(totalPages - 1, employeePageNo + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (employeePageNo < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  return pages
    .map((item) => {
      if (item === "...") {
        return `
          <span class="employee-page-dots">
            …
          </span>
        `;
      }

      return `
        <button
          type="button"
          class="employee-page-button ${
            employeePageNo === item ? "active" : ""
          }"
          data-employee-page="${item}"
        >
          ${item}
        </button>
      `;
    })
    .join("");
}
function dashboardView() {
  const orderSummary = getNextWeekOrderSummary();
  const serviceDays = getNextWeekWorkdays().length;

  const weeklyLunchBoxTotal = orderSummary.lunchBoxTotal * serviceDays;

  const weeklyUpstairsTotal = orderSummary.dineUpstairs * serviceDays;

  const nextWeek = {
    start: dashboardData.nextWeek.startDate,
    end: dashboardData.nextWeek.endDate,

    lunchBoxTotal: orderSummary.lunchBoxTotal,
    dineUpstairs: orderSummary.dineUpstairs,
    meat: orderSummary.meat,
    vegetarian: orderSummary.vegetarian,

    newcomer: getNextWeekNewcomerTotal(),

    deadline: "07/18（五）12:00",
    remaining: "2 天 03:24:45",
  };

  const factorySummary = getNextWeekFactorySummary();

  const currentWeekServiceDays = getCurrentWeekWorkdays(
    dashboardData.currentWeek.startDate,
  ).length;

  const currentWeekOrders =
    currentWeekOrderSummaryData &&
    Array.isArray(currentWeekOrderSummaryData.data)
      ? currentWeekOrderSummaryData.data
      : [];

  const currentWeekLunchBoxOrders = currentWeekOrders.filter(
    (order) => order.mealType === "便當",
  );

  const currentWeekUpstairsOrders = currentWeekOrders.filter(
    (order) => order.mealType === "上樓用餐",
  );

  const currentWeekMeat = currentWeekLunchBoxOrders.filter(
    (order) => order.diet === "葷食",
  ).length;

  const currentWeekVegetarian = currentWeekLunchBoxOrders.filter(
    (order) => order.diet === "素食",
  ).length;

  const currentWeek = {
    // 每日固定數量
    lunchBoxPerDay: currentWeekLunchBoxOrders.length,

    dineUpstairsPerDay: currentWeekUpstairsOrders.length,

    meatPerDay: currentWeekMeat,

    vegetarianPerDay: currentWeekVegetarian,

    // 整週數量
    lunchBoxWeeklyTotal:
      currentWeekLunchBoxOrders.length * currentWeekServiceDays,

    dineUpstairsWeeklyTotal:
      currentWeekUpstairsOrders.length * currentWeekServiceDays,

    meatWeeklyTotal: currentWeekMeat * currentWeekServiceDays,

    vegetarianWeeklyTotal: currentWeekVegetarian * currentWeekServiceDays,

    // 新人目前先保留舊資料
    newcomerTotal: getCurrentWeekNewcomerTotal(),

    newcomerDays: getCurrentWeekNewcomerDays(),
  };

  return `
    <div class="dashboard-page">

      <!-- 上方：下週主要統計 -->
      <div class="dashboard-metrics">

        <div class="card dashboard-total-card dashboard-primary-card">
          <div class="dashboard-metric-icon">🍱</div>

          <div class="dashboard-total-content">
            <span class="dashboard-label">下週便當總數</span>

            <div class="dashboard-main-number">
  <strong>${nextWeek.lunchBoxTotal}</strong>
  <small>份／日</small>
</div>

<p class="dashboard-week-total">
  下週預計共 ${weeklyLunchBoxTotal} 份
</p>

<div class="dashboard-meal-chips">
  <span class="dashboard-chip meat-chip">
    🍖 葷食 ${nextWeek.meat}／日
  </span>

  <span class="dashboard-chip veg-chip">
    🌿 素食 ${nextWeek.vegetarian}／日
  </span>
</div>
          </div>
        </div>

        <div class="card dashboard-small-metric dashboard-primary-card">
          <div class="dashboard-small-icon dine-icon">🏠</div>

          <div>
            <span class="dashboard-label">下週上樓用餐</span>

            <div class="dashboard-small-number dine-number">
  <strong>${nextWeek.dineUpstairs}</strong>
  <small>人／日</small>
</div>

<p class="dashboard-week-total">
  下週固定共 ${weeklyUpstairsTotal} 人次
</p>

<span class="dashboard-note">
  不含新人追加
</span>
          </div>
        </div>

        <div class="card dashboard-small-metric newcomer-card">
          <div class="dashboard-small-icon newcomer-icon">👤</div>

          <div>
            <div class="dashboard-label-row">
              <span class="dashboard-label">下周新人用餐</span>
              <span class="newcomer-badge">提醒</span>
            </div>

            <div class="dashboard-small-number newcomer-number">
              <strong>${nextWeek.newcomer}</strong>
              <small>人</small>
            </div>

            <p>不含於固定上樓人數</p>
          </div>
        </div>

        <!-- 下週訂單分廠匯出 -->
<div class="card factory-export-card">

  <div class="factory-export-title">
    <span class="factory-export-title-icon">⬇</span>

    <div>
      <h3>匯出明細（下週訂單）</h3>
      <p>各廠區訂單明細下載（Excel）</p>
    </div>
  </div>

  <div class="factory-export-list">

    <div class="factory-export-row">

      <div class="factory-export-info">
        <span class="factory-export-icon">🏢</span>
        <strong>一廠</strong>
      </div>

      <div class="factory-export-count">
        <strong>
          ${factorySummary.find((row) => row.factory === "一廠")?.total || 0}
        </strong>
        <span>份</span>
      </div>

      <button
        type="button"
        class="factory-export-button"
        data-export-factory="一廠"
      >
        ⬇ 下載 Excel
      </button>

    </div>

    <div class="factory-export-row">

      <div class="factory-export-info">
        <span class="factory-export-icon">🏭</span>
        <strong>二廠</strong>
      </div>

      <div class="factory-export-count">
        <strong>
          ${factorySummary.find((row) => row.factory === "二廠")?.total || 0}
        </strong>
        <span>份</span>
      </div>

      <button
        type="button"
        class="factory-export-button"
        data-export-factory="二廠"
      >
        ⬇ 下載 Excel
      </button>

    </div>

  </div>

  <p class="factory-export-note">
    ＊明細內容包含便當人員名單、廠區、葷素等資訊
  </p>

</div>
      </div>

      <!-- 下方：左邊下週廠區統計，右邊本週參考 -->
      <div class="dashboard-lower-grid">

        ${nextWeekFactorySummary(factorySummary)}

        ${currentWeekOverview(currentWeek)}

      </div>

    </div>
  `;
}
function currentWeekOverview(data) {
  return `
    <section class="card current-week-card current-week-card-large">

      <div class="dashboard-panel-heading current-week-heading">
        <div>
          <h3>📊 本週統計總覽</h3>
          <p>目前供餐狀況，僅供參考</p>
        </div>
      </div>

      <div class="current-week-list">

        <!-- 固定便當 -->
        <div class="current-week-item current-week-main">

          <div class="current-week-icon lunch-icon">
            🍱
          </div>

          <div class="current-week-content">

            <span>固定便當</span>

            <div>
              <strong>
                ${data.lunchBoxPerDay}
              </strong>

              <small>份／日</small>
            </div>

            <p>
              本週預計共
              ${data.lunchBoxWeeklyTotal}
              份
            </p>

          </div>

          <div class="current-week-meals">

            <span class="meat-text">
              葷食
              <b>${data.meatPerDay}</b>
              ／日
            </span>

            <span class="meal-divider"></span>

            <span class="veg-text">
              素食
              <b>${data.vegetarianPerDay}</b>
              ／日
            </span>

          </div>

        </div>

        <!-- 固定上樓 -->
        <div class="current-week-item current-week-main dine-week-item">

          <div class="current-week-icon dine-icon">
            🏠
          </div>

          <div class="current-week-content">

            <span>固定上樓</span>

            <div>
              <strong>
                ${data.dineUpstairsPerDay}
              </strong>

              <small>人／日</small>
            </div>

            <p>
              本週固定共
              ${data.dineUpstairsWeeklyTotal}
              人次，不含新人
            </p>

          </div>

        </div>

        <!-- 新人 -->
        <div class="current-week-item current-week-secondary">

          <div class="current-week-icon newcomer-icon">
            👤
          </div>

          <div class="current-week-content">

            <span>本週新增新人</span>

            <div>
              <strong>
                ${data.newcomerTotal}
              </strong>

              <small>人次</small>
            </div>

            <p>
              共 ${data.newcomerDays} 天有新增
            </p>

          </div>

        </div>

      </div>

    </section>
  `;
}
function nextWeekFactorySummary(rows) {
  const totalMeat = rows.reduce((sum, row) => sum + row.meat, 0);
  const totalVegetarian = rows.reduce((sum, row) => sum + row.vegetarian, 0);
  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);

  return `
    <section class="card next-week-summary-card">

      <div class="dashboard-panel-heading">
        <div>
          <h3>📅 下週訂餐統計總覽</h3>
          <p>依廠區統計便當數量</p>
        </div>

        
      </div>

      <div class="factory-summary-table-wrap">
        <table class="factory-summary-table">
          <thead>
            <tr>
              <th>廠區</th>
              <th>葷食（份）</th>
              <th>素食（份）</th>
              <th>合計（份）</th>
            </tr>
          </thead>

          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    <td>
                      <span class="factory-name">
                        🏭 ${row.factory}
                      </span>
                    </td>

                    <td class="meat-value">
                      ${row.meat}
                    </td>

                    <td class="veg-value">
                      ${row.vegetarian}
                    </td>

                    <td class="total-value">
                      ${row.total}
                    </td>
                  </tr>
                `,
              )
              .join("")}

            <tr class="factory-total-row">
              <td>合計</td>
              <td class="meat-value">${totalMeat}</td>
              <td class="veg-value">${totalVegetarian}</td>
              <td class="total-value">${grandTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </section>
  `;
}
function weeklyTable() {
  const rows = [
    {
      date: "07/13（一）",
      weekday: "星期一",
      total: 98,
      dine: 8,
      meat: 72,
      veg: 26,
      guest: 3,
      today: false,
    },
    {
      date: "07/14（二）",
      weekday: "星期二",
      total: 102,
      dine: 8,
      meat: 75,
      veg: 27,
      guest: 2,
      today: true,
    },
    {
      date: "07/15（三）",
      weekday: "星期三",
      total: 96,
      dine: 7,
      meat: 73,
      veg: 23,
      guest: 1,
      today: false,
    },
    {
      date: "07/16（四）",
      weekday: "星期四",
      total: 104,
      dine: 8,
      meat: 77,
      veg: 27,
      guest: 2,
      today: false,
    },
    {
      date: "07/17（五）",
      weekday: "星期五",
      total: "-",
      dine: "-",
      meat: "-",
      veg: "-",
      guest: "-",
      today: false,
    },
  ];

  return `
    <div class="card weekly-card">

      <div class="weekly-title">
        <div>
          <h3>🍱 本週每日統計（便當）</h3>
          <p>每日便當、人數與餐別統計一覽</p>
        </div>

        <button class="btn btn-outline export-weekly">
          ▣ 匯出本週名單（Excel）
        </button>
      </div>

      <div class="weekly-header">
        <div class="weekly-header-date">日期</div>
        <div><span>🍱</span>便當總份數</div>
        <div><span>🏠</span>上樓用餐人數</div>
        <div><span>🍖</span>葷食份數</div>
        <div><span>🌿</span>素食份數</div>
        <div><span>👥</span>外賓人數</div>
      </div>

      <div class="weekly-list">
        ${rows
          .map(
            (r) => `
            <div class="weekly-row ${r.today ? "is-today" : ""}">

              <div class="weekly-date">
                ${r.today ? '<span class="weekly-today">今天 ✦</span>' : ""}

                <strong>${r.date}</strong>
                <small>${r.weekday}</small>
              </div>

              <div class="weekly-stat total">
                <strong>${r.total}</strong>
                <span>份</span>
              </div>

              <div class="weekly-stat dine">
                <strong>${r.dine}</strong>
                <span>人</span>
              </div>

              <div class="weekly-stat meat">
                <strong>${r.meat}</strong>
                <span>份</span>
              </div>

              <div class="weekly-stat veg">
                <strong>${r.veg}</strong>
                <span>份</span>
              </div>

              <div class="weekly-stat guest">
                <strong>${r.guest}</strong>
                <span>人</span>
              </div>

            </div>
          `,
          )
          .join("")}
      </div>

    </div>
  `;
}
function ordersView() {
  return `
    <div class="order-management-page">

      <div class="order-tab-content">
        ${getOrderTabContent()}
      </div>

    </div>
  `;
}
function orderTabsView() {
  const tabs = [
    {
      id: "next-week",
      icon: "📅",
      label: "下週訂單",
    },
    {
      id: "current-week",
      icon: "🍱",
      label: "本週供餐",
    },
    {
      id: "newcomer",
      icon: "👤",
      label: "新人用餐",
    },
  ];

  return `
    <nav class="order-compact-tabs" aria-label="訂餐管理分頁">
      ${tabs
        .map(
          (tab) => `
            <button
              type="button"
              class="order-compact-tab ${orderTab === tab.id ? "active" : ""}"
              data-order-tab="${tab.id}"
            >
              <span>${tab.icon}</span>
              <strong>${tab.label}</strong>
            </button>
          `,
        )
        .join("")}
    </nav>
  `;
}
function getOrderTabContent() {
  const views = {
    "next-week": nextWeekOrdersTabView,
    "current-week": currentWeekSupplyTabView,
    newcomer: newcomerTabView,
  };

  const selectedTabView = views[orderTab];

  if (typeof selectedTabView !== "function") {
    orderTab = "next-week";
    return nextWeekOrdersTabView();
  }

  return selectedTabView();
}
function nextWeekOrdersTabView() {
  if (weeklyOrderSummaryLoading && !weeklyOrderSummaryLoaded) {
    return `
      <div class="next-week-orders-page">

        <section class="card">

          <div
            style="
              min-height: 300px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              text-align: center;
            "
          >

            <div
              style="
                font-size: 34px;
                margin-bottom: 14px;
              "
            >
              ⏳
            </div>

            <strong>
              正在讀取下週訂單...
            </strong>

            <p class="muted">
              請稍候
            </p>

          </div>

        </section>

      </div>
    `;
  }

  return `
    <div class="next-week-orders-page">

      ${nextWeekOrderStatusView()}

      <div class="spacer"></div>

      ${nextWeekUpstairsScheduleView()}

      <div class="spacer"></div>

      ${filterBar("orders")}

      <div class="spacer"></div>

      ${ordersTable()}

    </div>
  `;
}
function nextWeekOrderStatView({
  icon,
  label,
  value,
  unit,
  colorClass,
  description = "",
}) {
  return `
        <div class="next-week-order-stat ${colorClass}">

            <div class="next-week-order-stat-icon">
                ${icon}
            </div>

            <span class="next-week-order-stat-label">
                ${label}
            </span>

            <div class="next-week-order-stat-value">
                <strong>${value}</strong>
                <small>${unit}</small>
            </div>

            ${
              description
                ? `<div class="next-week-order-stat-description">${description}</div>`
                : ""
            }

        </div>
    `;
}
function nextWeekOrderStatusView() {
  const orderSummary = getNextWeekOrderSummary();
  const serviceDays = getNextWeekWorkdays().length;

  /*
   * 目前先沿用既有的最後更新時間。
   * 未來串接後端後，可將這個值改成 API 回傳的最後更新時間。
   */
  const lastUpdated = nextWeekOrderSubmittedAt || "2026/08/06 15:01";

  return `
    <section
      class="card next-week-order-summary next-week-order-summary-modern next-week-overview-compact"
    >

      <!-- 左側：下週訂餐週期 -->
      <div class="next-week-order-period">

        <span class="next-week-order-label">
          📅 下週訂餐週期
        </span>

        <h3>
          ${formatSpecialOrderDate(dashboardData.nextWeek.startDate)}
          ～
          ${formatSpecialOrderDate(dashboardData.nextWeek.endDate)}
        </h3>

        <div class="next-week-readonly-meta">

    <div class="next-week-last-update">

        <span class="label">
            🕒 最後更新
        </span>

        <span class="time">
            ${lastUpdated}
        </span>

    </div>

    <span class="next-week-readonly-badge">
        目前僅供查閱
    </span>

</div>

      </div>

      <!-- 右側：四項訂餐統計 -->
      <div class="next-week-order-stat-list">

        ${nextWeekOrderStatView({
          icon: "🛍️",
          label: "固定便當",
          value: orderSummary.lunchBoxTotal,
          unit: "份／日",
          colorClass: "lunchbox-stat",
          description: `整週共 ${orderSummary.lunchBoxTotal * serviceDays} 份`,
        })}

        ${nextWeekOrderStatView({
          icon: "🏠",
          label: "固定上樓",
          value: orderSummary.dineUpstairs,
          unit: "人／日",
          colorClass: "upstairs-stat",
          description: `整週共 ${orderSummary.dineUpstairs * serviceDays} 人次`,
        })}

        ${nextWeekOrderStatView({
          icon: "🍖",
          label: "葷食",
          value: orderSummary.meat,
          unit: "份／日",
          colorClass: "meat-stat",
          description: `整週共 ${orderSummary.meat * serviceDays} 份`,
        })}

        ${nextWeekOrderStatView({
          icon: "🌿",
          label: "素食",
          value: orderSummary.vegetarian,
          unit: "份／日",
          colorClass: "vegetarian-stat",
          description: `整週共 ${orderSummary.vegetarian * serviceDays} 份`,
        })}

      </div>

    </section>
  `;
}
function getNextWeekWorkdays() {
  const startDate = new Date(`${dashboardData.nextWeek.startDate}T00:00:00`);

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  const workdays = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(startDate);

    date.setDate(startDate.getDate() + index);

    const dateValue = formatDateValue(date);

    return {
      dateValue,

      displayDate: `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
        date.getDate(),
      ).padStart(2, "0")}`,

      weekday: weekdays[date.getDay()],
    };
  });

  // 排除休假日
  return workdays.filter(
    (day) => !holidays.some((holiday) => holiday.date === day.dateValue),
  );
}
function nextWeekUpstairsScheduleView() {
  const orderSummary = getNextWeekOrderSummary();

  const fixedUpstairsTotal = orderSummary.dineUpstairs;

  const workdays = getNextWeekWorkdays();

  const days = workdays.map((day) => {
    const newcomerRows =
      newcomerMealData && Array.isArray(newcomerMealData.data)
        ? newcomerMealData.data
        : [];

    const newcomerRecords = newcomerRows.filter(
      (item) => item.date === day.dateValue,
    );

    const newcomerTotal = newcomerRecords.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      ...day,
      newcomerTotal,

      actualTotal: fixedUpstairsTotal + newcomerTotal,
    };
  });

  const weeklyNewcomerTotal = days.reduce(
    (sum, day) => sum + day.newcomerTotal,
    0,
  );

  const newcomerDays = days.filter((day) => day.newcomerTotal > 0).length;

  return `
    <section class="next-week-upstairs-panel">

      <div class="next-week-upstairs-heading">
        <div>
          <h3>📅 下週上樓供餐（含新人）</h3>

          <p>
            固定上樓 ${fixedUpstairsTotal} 人／日，
            下方為加入每日新人後的實際人數
          </p>
        </div>
      </div>

      <div class="next-week-upstairs-content">

        <div class="next-week-upstairs-days">

          ${days
            .map(
              (day) => `
                <article class="next-week-upstairs-day">

                  <div class="next-week-upstairs-date">
                    ${day.displayDate}（${day.weekday}）
                  </div>

                  ${
                    day.newcomerTotal > 0
                      ? `
                        <span class="next-week-newcomer-badge">
                          👤 +${day.newcomerTotal}
                        </span>
                      `
                      : ""
                  }

                  <div class="next-week-upstairs-number">
                    <strong>${day.actualTotal}</strong>
                    <span>人</span>
                  </div>

                  <small>
                    ${
                      day.newcomerTotal > 0
                        ? `固定 ${fixedUpstairsTotal}＋新人 ${day.newcomerTotal}`
                        : `固定 ${fixedUpstairsTotal}`
                    }
                  </small>

                </article>
              `,
            )
            .join("")}

        </div>

        <aside class="next-week-newcomer-total">
          <span>下週新人</span>

          <div>
            <strong>${weeklyNewcomerTotal}</strong>
            <small>人次</small>
          </div>

          <p>
            共 ${newcomerDays} 天有新增
          </p>

          <button
            type="button"
            class="btn btn-outline goto-newcomer-tab"
          >
            查看新人明細 →
          </button>
        </aside>

      </div>

    </section>
  `;
}

function getCurrentWeekWorkdays(startDateValue) {
  const monday = new Date(`${startDateValue}T00:00:00`);

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  // 先建立星期一～星期五
  const workdays = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(monday);

    date.setDate(monday.getDate() + index);

    const dateValue = formatDateValue(date);

    return {
      dateValue,

      displayDate: `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
        date.getDate(),
      ).padStart(2, "0")}`,

      weekday: weekdays[date.getDay()],
    };
  });

  // 再排除休假日
  return workdays.filter(
    (day) => !holidays.some((holiday) => holiday.date === day.dateValue),
  );
}
function getNewcomerSummaryByDate(dateValue) {
  const rows =
    newcomerMealData && Array.isArray(newcomerMealData.data)
      ? newcomerMealData.data
      : [];

  const records = rows.filter((item) => item.date === dateValue);

  return {
    records,

    total: records.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
  };
}
function currentWeekNewcomerSchedule() {
  const workdays = getCurrentWeekWorkdays(dashboardData.currentWeek.startDate);

  const days = workdays.map((day) => {
    const rows =
      newcomerMealData && Array.isArray(newcomerMealData.data)
        ? newcomerMealData.data
        : [];

    const records = rows.filter((item) => item.date === day.dateValue);

    const total = records.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );

    const departments = [...new Set(records.map((item) => item.department))];

    return {
      ...day,
      total,
      departments,
    };
  });

  const weeklyTotal = days.reduce((sum, day) => sum + day.total, 0);

  return `
    <section class="current-newcomer-strip">

      <div class="current-newcomer-strip-heading">
        <div class="current-newcomer-strip-title">
          <span class="current-newcomer-title-icon">👥</span>

          <div>
            <h3>本週新人用餐</h3>
            <p>依各用餐日期預定的新人數量</p>
          </div>
        </div>
      </div>

      <div class="current-newcomer-strip-body">

        <div class="current-newcomer-day-list">

          ${days
            .map(
              (day) => `
                <article class="current-newcomer-day-card ${
                  day.total > 0 ? "has-newcomers" : ""
                }">

                  <div class="current-newcomer-day-date">
                    ${day.displayDate}（${day.weekday}）
                  </div>

                  <div class="current-newcomer-day-number">
                    <strong>${day.total}</strong>
                    <span>人</span>
                  </div>

                  <div class="current-newcomer-day-department">
                    ${
                      day.departments.length > 0
                        ? `
                          <span>♙</span>
                          ${day.departments.join("、")}
                        `
                        : "—"
                    }
                  </div>

                </article>
              `,
            )
            .join("")}

        </div>

        <aside class="current-newcomer-week-total">
          <span>本週新人合計</span>

          <div>
            <strong>${weeklyTotal}</strong>
            <small>人次</small>
          </div>

          <p>依各用餐日期累計</p>
        </aside>

      </div>

    </section>
  `;
}
function currentWeekSupplyTabView() {
  const currentWeek = getCurrentWeekSupplySummary();

  return `
    <div class="current-week-supply-page">

      ${currentWeekSupplySummary(currentWeek)}

      <div class="spacer"></div>

      ${currentWeekNewcomerSchedule()}

      <div class="spacer"></div>

      ${currentWeekReadonlyOrders()}

    </div>
  `;
}
function getCurrentWeekSupplySummary() {
  const orders =
    currentWeekOrderSummaryData &&
    Array.isArray(currentWeekOrderSummaryData.data)
      ? currentWeekOrderSummaryData.data
      : [];

  // 本週便當
  const lunchBoxOrders = orders.filter((order) => order.mealType === "便當");

  // 本週上樓用餐
  const upstairsOrders = orders.filter(
    (order) => order.mealType === "上樓用餐",
  );

  // 葷食
  const meatOrders = lunchBoxOrders.filter((order) => order.diet === "葷食");

  // 素食
  const vegetarianOrders = lunchBoxOrders.filter(
    (order) => order.diet === "素食",
  );

  const serviceDays = getCurrentWeekWorkdays(
    dashboardData.currentWeek.startDate,
  ).length;

  const dailyLunchBoxTotal = lunchBoxOrders.length;

  const dineUpstairsTotal = upstairsOrders.length;

  return {
    dailyLunchBoxTotal,

    weeklyLunchBoxTotal: dailyLunchBoxTotal * serviceDays,

    dineUpstairsTotal,

    fixedUpstairsWeeklyTotal: dineUpstairsTotal * serviceDays,

    meatTotal: meatOrders.length,

    vegetarianTotal: vegetarianOrders.length,

    newcomerTotal: getCurrentWeekNewcomerTotal(),

    serviceDays,
  };
}
function currentWeekSupplySummary(data) {
  return `
    <section class="current-supply-summary current-supply-summary-four">

      <!-- 固定便當 -->
      <div class="card current-supply-card">
        <span class="current-supply-icon lunchbox-summary-icon">
          🥡
        </span>

        <div class="current-supply-content">
          <small>便當總數</small>

          <div class="current-supply-number">
            <strong>
              ${data.dailyLunchBoxTotal}
            </strong>

            <span>份／日</span>
          </div>

          <p>
            本週預計共
            ${data.weeklyLunchBoxTotal}
            份
          </p>
        </div>
      </div>

      <!-- 固定上樓 -->
      <div class="card current-supply-card">
        <span class="current-supply-icon upstairs-summary-icon">
          🏠
        </span>

        <div class="current-supply-content">
          <small>固定上樓用餐</small>

          <div class="current-supply-number">
            <strong class="blue-text">
              ${data.dineUpstairsTotal}
            </strong>

            <span>人／日</span>
          </div>

          <p>
            本週固定
            ${data.fixedUpstairsWeeklyTotal}
            人次，不含新人
          </p>
        </div>
      </div>

      <!-- 葷食 -->
      <div class="card current-supply-card">
        <span class="current-supply-icon meat-summary-icon">
          🍖
        </span>

        <div class="current-supply-content">
          <small>葷食</small>

          <div class="current-supply-number">
            <strong class="meat-value">
              ${data.meatTotal}
            </strong>

            <span>份／日</span>
          </div>
        </div>
      </div>

      <!-- 素食 -->
      <div class="card current-supply-card">
        <span class="current-supply-icon vegetarian-summary-icon">
          🌿
        </span>

        <div class="current-supply-content">
          <small>素食</small>

          <div class="current-supply-number">
            <strong class="veg-value">
              ${data.vegetarianTotal}
            </strong>

            <span>份／日</span>
          </div>
        </div>
      </div>

    </section>
  `;
}
function currentWeekOrderFilterView() {
  return `
    <div class="current-week-order-filter">

      <div class="field current-week-keyword-field">
        <label>工號／姓名</label>

        <input
          id="currentWeekKeyword"
          value="${currentWeekFilters.keyword}"
          placeholder="請輸入工號或姓名"
        >
      </div>

      <div class="field">
  <label>組別</label>

  <select id="currentWeekGroup">
    <option value="">全部組別</option>

    ${[
      ...new Set(
        (currentWeekOrderSummaryData &&
        Array.isArray(currentWeekOrderSummaryData.data)
          ? currentWeekOrderSummaryData.data
          : []
        )
          .map((order) => order.group)
          .filter(Boolean),
      ),
    ]
      .sort()
      .map(
        (group) => `
            <option
              value="${group}"
              ${currentWeekFilters.group === group ? "selected" : ""}
            >
              ${group}
            </option>
          `,
      )
      .join("")}
  </select>
</div>

      <div class="field">
        <label>用餐方式</label>

        <select id="currentWeekDiningMethod">
          <option value="">全部</option>

          <option
            value="上樓用餐"
            ${currentWeekFilters.diningMethod === "上樓用餐" ? "selected" : ""}
          >
            上樓用餐
          </option>

          <option
  value="便當"
  ${currentWeekFilters.diningMethod === "便當" ? "selected" : ""}
>
  便當
</option>
        </select>
      </div>

      <div class="field">
  <label>廠區</label>
<select id="currentWeekFactory">
  <option value="">全部廠區</option>

  <option
    value="一廠"
    ${currentWeekFilters.factory === "一廠" ? "selected" : ""}
  >
    一廠
  </option>

  <option
    value="二廠"
    ${currentWeekFilters.factory === "二廠" ? "selected" : ""}
  >
    二廠
  </option>
</select>
</div>

      <div class="field">
        <label>葷／素</label>

        <select id="currentWeekMealType">
          <option value="">全部</option>

          <option
            value="葷食"
            ${currentWeekFilters.mealType === "葷食" ? "selected" : ""}
          >
            葷食
          </option>

          <option
            value="素食"
            ${currentWeekFilters.mealType === "素食" ? "selected" : ""}
          >
            素食
          </option>
        </select>
      </div>

      <button
        type="button"
        class="btn btn-primary"
        id="searchCurrentWeekOrders"
      >
        🔍 查詢
      </button>

      <button
        type="button"
        class="btn btn-outline"
        id="clearCurrentWeekOrders"
      >
        ↻ 清除條件
      </button>

    </div>
  `;
}
function getFilteredCurrentWeekOrders() {
  const keyword = currentWeekFilters.keyword.trim().toLowerCase();

  const orders =
    currentWeekOrderSummaryData &&
    Array.isArray(currentWeekOrderSummaryData.data)
      ? currentWeekOrderSummaryData.data
      : [];

  return orders.filter((order) => {
    const matchesKeyword =
      !keyword ||
      String(order.employeeId || "")
        .toLowerCase()
        .includes(keyword) ||
      String(order.name || "")
        .toLowerCase()
        .includes(keyword);

    const matchesGroup =
      !currentWeekFilters.group || order.group === currentWeekFilters.group;

    const matchesDiningMethod =
      !currentWeekFilters.diningMethod ||
      order.mealType === currentWeekFilters.diningMethod;

    const matchesFactory =
      !currentWeekFilters.factory ||
      order.factory === currentWeekFilters.factory;

    const matchesMealType =
      !currentWeekFilters.mealType ||
      order.diet === currentWeekFilters.mealType;

    return (
      matchesKeyword &&
      matchesGroup &&
      matchesDiningMethod &&
      matchesFactory &&
      matchesMealType
    );
  });
}
function exportCurrentWeekFilteredOrders() {
  const orders =
    getFilteredCurrentWeekOrders();

  if (orders.length === 0) {
    toast("目前沒有可匯出的本週訂單");
    return;
  }

  const rows = [
    [
      "訂餐週期",
      "工號",
      "姓名",
      "部門",
      "組別",
      "用餐方式",
      "廠區",
      "葷／素",
    ],

    ...orders.map((order) => [
      formatOrderWeek(
        order.weekDate ||
        dashboardData.currentWeek.startDate
      ),

      order.employeeId || "",
      order.name || "",
      order.department || "",
      order.group || "",
      order.mealType || "",
      order.factory || "",
      order.diet || "",
    ]),
  ];

  const csv =
    "\ufeff" +
    rows
      .map((row) =>
        row
          .map((value) => {
            const text =
              String(value ?? "");

            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");

  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8",
      },
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    `本週供餐明細_${dashboardData.currentWeek.startDate}_${dashboardData.currentWeek.endDate}.csv`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);

  toast(
    `已匯出 ${orders.length} 筆本週供餐明細`
  );
}
function currentWeekPagination(totalPages) {
  if (totalPages <= 1) {
    return "";
  }

  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).slice(0, 5);

  return `
    <div class="pagination current-week-pagination">

      <div class="pages">

        <button
          type="button"
          class="page"
          data-current-week-page="${Math.max(1, currentWeekPageNo - 1)}"
          ${currentWeekPageNo === 1 ? "disabled" : ""}
        >
          ‹
        </button>

        ${visiblePages
          .map(
            (pageNumber) => `
              <button
                type="button"
                class="page ${pageNumber === currentWeekPageNo ? "active" : ""}"
                data-current-week-page="${pageNumber}"
              >
                ${pageNumber}
              </button>
            `,
          )
          .join("")}

        ${
          totalPages > 5
            ? `
              <button
                type="button"
                class="page"
                disabled
              >
                …
              </button>
            `
            : ""
        }

        <button
          type="button"
          class="page"
          data-current-week-page="${Math.min(
            totalPages,
            currentWeekPageNo + 1,
          )}"
          ${currentWeekPageNo === totalPages ? "disabled" : ""}
        >
          ›
        </button>

      </div>

      <span class="muted">
        每頁顯示 ${currentWeekPageSize} 筆
      </span>

    </div>
  `;
}
function currentWeekReadonlyOrders() {
  const filteredOrders = getFilteredCurrentWeekOrders();
  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / currentWeekPageSize),
  );

  // 避免篩選後目前頁碼超過總頁數
  if (currentWeekPageNo > totalPages) {
    currentWeekPageNo = totalPages;
  }

  const startIndex = (currentWeekPageNo - 1) * currentWeekPageSize;

  const endIndex = startIndex + currentWeekPageSize;

  const currentPageOrders = filteredOrders.slice(startIndex, endIndex);

  return `
    <section class="card current-week-orders-card">

      <div class="section-title">
        <div>
          <h3>
            本週固定訂單明細
            <small class="muted">
              共 ${filteredOrders.length} 筆
            </small>
          </h3>

          <p class="muted">
            本週訂單已進入供餐階段，目前僅供查閱
          </p>
        </div>

        <button
          type="button"
          class="btn btn-outline export-current-week"
        >
          ▣ 匯出查詢結果
        </button>
      </div>

      ${currentWeekOrderFilterView()}

      <div class="current-week-result-info">
  顯示第
  ${filteredOrders.length === 0 ? 0 : startIndex + 1}
  ～
  ${Math.min(endIndex, filteredOrders.length)}
  筆，共 ${filteredOrders.length} 筆資料
</div>
      <div class="table-wrap">
        <table class="data-table order-data-table">

          <thead>
            <tr>
              <th>部門</th>
              <th>組別</th>
              <th>工號</th>
              <th>姓名</th>
              <th>用餐方式</th>
              <th>廠區</th>
              <th>葷／素</th>
              <th>最後修改</th>
            </tr>
          </thead>

          <tbody>
            ${
              currentPageOrders.length === 0
                ? `
                  <tr>
                    <td
                      colspan="8"
                      class="current-week-empty-result"
                    >
                      查無符合條件的本週訂單
                    </td>
                  </tr>
                `
                : currentPageOrders
                    .map(
                      (order) => `
                        <tr>
                          <td>${order.department}</td>

                          <td>${order.group}</td>

                          <td>
                            <span class="employee-id">
                              ${order.employeeId}
                            </span>
                          </td>

                          <td>
                            <strong>
                              ${order.name}
                            </strong>
                          </td>

                          <td>
                            <span class="dining-method ${
                              order.mealType === "上樓用餐"
                                ? "dine-upstairs"
                                : "dine-takeout"
                            }">
  ${order.mealType === "上樓用餐" ? "🏠" : "🥡"}

  ${order.mealType}
</span>
                          </td>

                          <td>
                            ${order.factory || "—"}
                          </td>

                          <td>
  ${
    order.diet
      ? `
        <span class="tag ${order.diet === "葷食" ? "meat" : "veg"}">
          ${order.diet}
        </span>
      `
      : "—"
  }
</td>

                          <td>
                            ${order.updatedAt}
                          </td>
                        </tr>
                      `,
                    )
                    .join("")
            }
          </tbody>

        </table>
      </div>
      ${currentWeekPagination(totalPages)}

    </section>
    
  `;
}
function newcomerTabView() {
  return `
    ${newcomerOrdersView()}
  `;
}
function formatSpecialOrderDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = weekdays[date.getDay()];

  return `${month}/${day}（${weekday}）`;
}

function changeSpecialOrderDate(days) {
  const currentDate = new Date(`${selectedSpecialOrderDate}T00:00:00`);

  currentDate.setDate(currentDate.getDate() + days);

  const newDate = formatDateValue(currentDate);

  if (
    newDate < dashboardData.nextWeek.startDate ||
    newDate > dashboardData.nextWeek.endDate
  ) {
    toast("只能查看下週一至下週五");
    return;
  }

  selectedSpecialOrderDate = newDate;

  render();
}
function bindOrderTabs() {
  document.querySelectorAll("[data-order-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      // 注意：這裡是 orderTab，不是 page
      orderTab = button.dataset.orderTab;

      pageNo = 1;
      if (orderTab === "current-week") {
        currentWeekPageNo = 1;
      }

      render();
    });
  });
}
function newcomerOrdersView() {
  const newcomerRows =
    newcomerMealData && Array.isArray(newcomerMealData.data)
      ? newcomerMealData.data
      : [];

  const selectedMeals = newcomerRows.filter(
    (item) => item.date === selectedSpecialOrderDate,
  );

  const newcomerCount = selectedMeals.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  const displayDate = formatSpecialOrderDate(selectedSpecialOrderDate);

  return `
    <div class="card newcomer-compact-card">

      <div class="newcomer-compact-toolbar">

        <div class="newcomer-compact-title">
          <div class="newcomer-title-icon">
            👤
          </div>

          <div>
            <h3>新人用餐登記</h3>
            <p>指定下週某日追加上樓用餐人數</p>
          </div>
        </div>

        <div class="newcomer-date-control">

          <button
            class="newcomer-date-button"
            id="previousSpecialDate"
            type="button"
            aria-label="前一天"
          >
            ‹
          </button>

          <div class="newcomer-date-input">
            <span>${displayDate}</span>

            <input
              type="date"
              id="specialOrderDateFilter"
              value="${selectedSpecialOrderDate}"
              min="${dashboardData.nextWeek.startDate}"
              max="${dashboardData.nextWeek.endDate}"
              aria-label="新人用餐日期"
            >
          </div>

          <button
            class="newcomer-date-button"
            id="nextSpecialDate"
            type="button"
            aria-label="下一天"
          >
            ›
          </button>

        </div>

        <div class="newcomer-compact-count">
          <span>當日新人</span>
          <strong>${newcomerCount}</strong>
          <small>人</small>
        </div>

        <button
          class="btn btn-primary newcomer-add-button"
          id="addSpecialOrder"
          type="button"
        >
          ＋ 新增
        </button>

      </div>

      ${
        selectedMeals.length === 0
          ? `
            <div class="newcomer-compact-empty">
              <span>—</span>
              ${displayDate} 目前沒有新人用餐登記
            </div>
          `
          : `
            <div class="newcomer-compact-list">

              ${selectedMeals
                .map((item) => {
                  const originalIndex =
                    newcomerMealData && Array.isArray(newcomerMealData.data)
                      ? newcomerMealData.data.indexOf(item)
                      : -1;

                  return `
                    <div class="newcomer-compact-row">

  <span class="newcomer-dining-tag">
    🏠 上樓用餐
  </span>

  <strong class="newcomer-department">
  ${item.department}
</strong>

<span class="newcomer-row-note">
  📝 ${item.name || "未填名稱"}
</span>
  <div class="newcomer-row-quantity">
    <span>數量：</span>
    <strong>${item.quantity}</strong>
    <span>人</span>
  </div>

  <span class="newcomer-row-time">
    ${item.createdAt}
  </span>

  <div class="newcomer-row-actions">

    <button
      class="icon-btn edit-newcomer-meal"
      data-index="${originalIndex}"
      type="button"
    >
      ✎ 編輯
    </button>

    <button
      class="icon-btn danger delete-newcomer-meal"
      data-index="${originalIndex}"
      type="button"
    >
      🗑 刪除
    </button>

  </div>

</div>
                  `;
                })
                .join("")}

            </div>
          `
      }

    </div>
  `;
}
function filterBar(type) {
  // 歷史訂單頁暫時保留原本日期查詢
  if (type === "history") {
    return `
    <div class="card toolbar history-order-filter">

      <div class="field history-period-field">
        <label>訂餐週期</label>

        <select id="historyWeekFilter">
          <option value="2026-W33">
            2026/08/10（一）～08/14（五）
          </option>

          <option value="2026-W32">
            2026/08/03（一）～08/07（五）
          </option>

          <option value="2026-W31">
            2026/07/27（一）～07/31（五）
          </option>
        </select>
      </div>

      <div class="field history-keyword-field">
        <label>工號／姓名</label>

        <input
          id="historyKeyword"
          placeholder="請輸入工號或姓名"
        >
      </div>

      <div class="field">
        <label>部門</label>

        <select id="historyDepartmentFilter">
          <option value="">全部部門</option>
          <option value="工程部">工程部</option>
          <option value="業務部">業務部</option>
          <option value="管理部">管理部</option>
        </select>
      </div>

      <div class="field">
        <label>用餐方式</label>

        <select id="historyDiningFilter">
          <option value="">全部方式</option>
          <option value="固定便當">固定便當</option>
          <option value="上樓用餐">固定上樓</option>
        </select>
      </div>

      <div class="field">
  <label>廠區</label>

  <select id="currentWeekFactory">
    <option value="">全部廠區</option>
    <option value="一廠">一廠</option>
    <option value="二廠">二廠</option>
  </select>
</div>

      <div class="field">
        <label>葷／素</label>

        <select id="historyMealFilter">
          <option value="">全部</option>
          <option value="葷食">葷食</option>
          <option value="素食">素食</option>
        </select>
      </div>

      <button
        type="button"
        class="btn btn-primary"
        id="searchHistoryOrders"
      >
        🔍 查詢
      </button>

      <button
        type="button"
        class="btn btn-outline"
        id="clearHistoryOrders"
      >
        ↻ 清除條件
      </button>

    </div>
  `;
  }

  // 訂餐管理頁改成週期查詢
  const orders =
    weeklyOrderSummaryData && Array.isArray(weeklyOrderSummaryData.data)
      ? weeklyOrderSummaryData.data
      : [];

  const groupOptions = [
    ...new Set(orders.map((order) => order.group).filter(Boolean)),
  ];

  const factoryOptions = [
    ...new Set(orders.map((order) => order.factory).filter(Boolean)),
  ];
  return `
  <div class="card toolbar weekly-order-filter">

    <div class="field order-keyword-field">
      <label>工號／姓名</label>

      <input
        id="orderKeyword"
        placeholder="請輸入工號或姓名"
        value="${orderFilters.keyword}"
      >
    </div>

    
<div class="field">
  <label>組別</label>

  <select id="orderGroupFilter">
    <option value="">全部組別</option>

    ${groupOptions
      .map(
        (group) => `
          <option
            value="${group}"
            ${orderFilters.group === group ? "selected" : ""}
          >
            ${group}
          </option>
        `,
      )
      .join("")}
  </select>

    </div>

    <div class="field">
      <label>用餐方式</label>

      <select id="orderDiningFilter">
  <option value="">全部</option>

  <option
    value="上樓用餐"
    ${orderFilters.mealType === "上樓用餐" ? "selected" : ""}
  >
    上樓用餐
  </option>

  <option
    value="便當"
    ${orderFilters.mealType === "便當" ? "selected" : ""}
  >
    便當
  </option>
</select>
    </div>

    <div class="field">
      <label>廠區</label>

      <select id="orderFactoryFilter">
  <option value="">全部廠區</option>

  ${factoryOptions
    .map(
      (factory) => `
        <option
          value="${factory}"
          ${orderFilters.factory === factory ? "selected" : ""}
        >
          ${factory}
        </option>
      `,
    )
    .join("")}
</select>
    </div>

    <div class="field">
      <label>葷／素</label>

      <select id="orderMealFilter">
  <option value="">全部</option>

  <option
    value="葷食"
    ${orderFilters.diet === "葷食" ? "selected" : ""}
  >
    葷食
  </option>

  <option
    value="素食"
    ${orderFilters.diet === "素食" ? "selected" : ""}
  >
    素食
  </option>
</select>
    </div>

    <button
      class="btn btn-primary do-search"
      type="button"
    >
      🔍 查詢
    </button>

    <button
      class="btn btn-outline clear-filter"
      type="button"
    >
      ↻ 清除條件
    </button>

  </div>
`;
}
function formatOrderWeek(weekDate) {
  if (!weekDate) {
    return "—";
  }

  const start = new Date(weekDate + "T00:00:00");

  if (isNaN(start.getTime())) {
    return weekDate;
  }

  const end = new Date(start);
  end.setDate(start.getDate() + 4);

  const startText =
    `${start.getFullYear()}/` +
    `${String(start.getMonth() + 1).padStart(2, "0")}/` +
    `${String(start.getDate()).padStart(2, "0")}`;

  const endText =
    `${String(end.getMonth() + 1).padStart(2, "0")}/` +
    `${String(end.getDate()).padStart(2, "0")}`;

  return `${startText}～${endText}`;
}
function getFilteredWeeklyOrders() {
  const orders =
    weeklyOrderSummaryData && Array.isArray(weeklyOrderSummaryData.data)
      ? weeklyOrderSummaryData.data
      : [];

  const keyword = String(orderFilters.keyword || "")
    .trim()
    .toLowerCase();

  return orders.filter((order) => {
    const employeeId = String(order.employeeId || "")
      .toLowerCase()

    const name = String(order.name || "").toLowerCase();

    // 工號／姓名
    const matchKeyword =
      !keyword || employeeId.includes(keyword) || name.includes(keyword);

    // 組別
    const matchGroup =
      !orderFilters.group || order.group === orderFilters.group;

    // 用餐方式
    const matchMealType =
      !orderFilters.mealType || order.mealType === orderFilters.mealType;

    // 廠區
    const matchFactory =
      !orderFilters.factory || order.factory === orderFilters.factory;

    // 葷／素
    const matchDiet = !orderFilters.diet || order.diet === orderFilters.diet;

    return (
      matchKeyword && matchGroup && matchMealType && matchFactory && matchDiet
    );
  });
}
function ordersTable() {
  const orders = getFilteredWeeklyOrders();

  const totalPages = Math.max(1, Math.ceil(orders.length / 8));

  // 如果篩選後頁數變少，避免停在不存在的頁數
  if (pageNo > totalPages) {
    pageNo = totalPages;
  }

  const startIndex = (pageNo - 1) * 8;

  const endIndex = startIndex + 8;

  const rows = orders.slice(startIndex, endIndex);

  return `
  <div class="card next-week-orders-table-card">

      <div class="section-title">
        <h3>
          下週訂單明細
          <small class="muted">
            共 ${orders.length} 筆訂單
          </small>
        </h3>

        <div>
          <button
            class="btn btn-outline export-orders"
            type="button"
          >
            ▣ 匯出查詢結果（CSV）
          </button>

          <button
            class="btn btn-outline refresh-orders"
            type="button"
          >
            ↻ 重新整理
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <table class="data-table order-data-table">

          <thead>
            <tr>
              <th>訂餐週期</th>
              <th>部門</th>
              <th>組別</th>
              <th>工號</th>
              <th>姓名</th>
              <th>用餐方式</th>
              <th>廠區</th>
              <th>葷／素</th>
              <th>最後修改</th>
            </tr>
          </thead>

          <tbody>
            ${
              rows.length === 0
                ? `
    <tr>
      <td
        colspan="9"
        style="
          text-align: center;
          padding: 40px 20px;
        "
      >
        <div
          style="
            font-size: 28px;
            margin-bottom: 10px;
          "
        >
          🔍
        </div>

        <strong>
          ${
            weeklyOrderSummaryData?.data?.length
              ? "查無符合條件的訂單"
              : "目前沒有下週訂單資料"
          }
        </strong>

        ${
          weeklyOrderSummaryData?.data?.length
            ? `
              <div
                class="muted"
                style="margin-top: 6px;"
              >
                請調整查詢條件後重新查詢
              </div>
            `
            : ""
        }
      </td>
    </tr>
  `
                : rows
                    .map(
                      (r) => `
                        <tr>
                          <td>${formatOrderWeek(r.weekDate)}</td>

                          <td>${r.department}</td>

                          <td>${r.group}</td>

                          <td>
                            <span class="employee-id">
                              ${r.employeeId}
                            </span>
                          </td>

                          <td>
                            <strong>
                              ${r.name}
                            </strong>
                          </td>

                          <td>
                            <span class="dining-method ${
                              r.mealType === "上樓用餐"
                                ? "dine-upstairs"
                                : "dine-takeout"
                            }">
  ${r.mealType === "上樓用餐" ? "🏠" : "🥡"}

  ${r.mealType}
</span>
                          </td>

                          <td>
                            ${r.factory || "—"}
                          </td>

                          <td>
                            ${
                              r.diet
                                ? `
      <span class="tag ${r.diet === "葷食" ? "meat" : "veg"}">
        ${r.diet}
      </span>
    `
                                : "—"
                            }
                          </td>

                          <td>${r.updatedAt}</td>

                          
                        </tr>
                      `,
                    )
                    .join("")
            }
          </tbody>

        </table>
      </div>

      ${pagination(totalPages, 8)}
    </div>
  `;
}
/*
==================================================
備用：下週訂單「操作」欄
目前暫時不顯示
未來若要恢復，放回 ordersTable() 的表格內
==================================================

表頭要加回：

<th>操作</th>


每筆資料最後要加回：

<td class="actions">

  <button
    class="icon-btn view-row"
    data-order-id="${r.orderId}"
    type="button"
  >
    ⌕ 檢視
  </button>

  <button
    class="icon-btn edit-row"
    data-employee-id="${r.employeeId}"
    data-week-date="${r.weekDate}"
    type="button"
  >
    ✎ 編輯
  </button>

</td>

==================================================
*/
/* function historyView() {
  const pageSize = 10;

  const totalPages = Math.max(1, Math.ceil(weeklyOrders.length / pageSize));

  if (pageNo > totalPages) {
    pageNo = totalPages;
  }

  const startIndex = (pageNo - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const rows = weeklyOrders.slice(startIndex, endIndex);

  return `
    <div class="history-page">

      ${filterBar("history")}

      <div class="spacer"></div>

      <section class="card history-orders-card">

        <div class="section-title">

          <div>
            <h3>
              歷史訂單列表

              <small class="muted">
                共 ${weeklyOrders.length} 筆訂單
              </small>
            </h3>

            <p class="muted">
              每位員工於同一訂餐週期僅保留一筆固定訂單
            </p>
          </div>

          <button
            type="button"
            class="btn btn-outline export-history"
          >
            ▣ 匯出歷史訂單
          </button>

        </div>

        <div class="table-wrap">

          <table class="data-table history-order-table">

            <thead>
              <tr>
                <th>工號</th>
                <th>姓名</th>
                <th>部門</th>
                <th>用餐方式</th>
                <th>廠區</th>
                <th>葷／素</th>
                <th>最後更新時間</th>
                <th>最後更新人</th>
              </tr>
            </thead>

            <tbody>

              ${
                rows.length === 0
                  ? `
                    <tr>
                      <td
                        colspan="8"
                        class="history-empty-result"
                      >
                        目前沒有歷史訂單資料
                      </td>
                    </tr>
                  `
                  : rows
                      .map(
                        (order) => `
                          <tr>

                            <td>
                              <span class="employee-id">
                                ${order.employeeId}
                              </span>
                            </td>

                            <td>
                              <strong>
                                ${order.employeeName}
                              </strong>
                            </td>

                            <td>
                              ${order.department}
                            </td>

                            <td>
                              <span class="dining-method ${
                                order.diningMethod === "上樓用餐"
                                  ? "dine-upstairs"
                                  : "dine-takeout"
                              }">
                                ${
                                  order.diningMethod === "上樓用餐"
                                    ? "🏠 固定上樓"
                                    : "🥡 固定便當"
                                }
                              </span>
                            </td>

                            <td>
                              ${order.factory || "—"}
                            </td>

                            <td>
                              ${
                                order.diet
                                  ? `
      <span class="tag ${order.diet === "葷食" ? "meat" : "veg"}">
        ${order.diet}
      </span>
    `
                                  : "—"
                              }
                            </td>

                            <td>
                              ${order.updatedAt || "—"}
                            </td>

                            <td>
                              ${order.updatedBy || order.employeeName || "—"}
                            </td>

                          </tr>
                        `,
                      )
                      .join("")
              }

            </tbody>

          </table>

        </div>

        ${pagination(totalPages, pageSize)}

      </section>

    </div>
  `;
} */
/* function getFilteredAdmins() {
  const keyword = adminFilters.keyword.trim().toLowerCase();

  return admins.filter((admin) => {
    const employeeId = String(admin.employeeId || "").toLowerCase();

    const name = String(admin.name || "").toLowerCase();

    const matchesKeyword =
      !keyword || employeeId.includes(keyword) || name.includes(keyword);

    const matchesStatus =
      !adminFilters.status || admin.status === adminFilters.status;

    return matchesKeyword && matchesStatus;
  });
} */
/* function adminsView() {
  const filteredAdmins = getFilteredAdmins();

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAdmins.length / adminPageSize),
  );

  // 避免篩選後頁碼超出
  if (adminPageNo > totalPages) {
    adminPageNo = totalPages;
  }

  const startIndex = (adminPageNo - 1) * adminPageSize;

  const endIndex = startIndex + adminPageSize;

  const currentPageAdmins = filteredAdmins.slice(startIndex, endIndex);

  return `
    <div class="admin-page">

      <!-- 管理者查詢 -->
      <section class="card admin-filter-card">

        <div class="admin-filter-top">

          <div>
            <h3>管理者查詢</h3>

            <p>
              可依工號、姓名與狀態查詢管理者資料
            </p>
          </div>

          <button
            type="button"
            class="btn btn-primary"
            id="addAdmin"
          >
            ＋ 新增管理者
          </button>

        </div>

        <div class="admin-filter-grid">

          <div class="field admin-keyword-field">
            <label>工號／姓名</label>

            <input
              id="adminKeyword"
              type="text"
              value="${adminFilters.keyword}"
              placeholder="請輸入工號或姓名"
              autocomplete="off"
            >
          </div>

          <div class="field">
            <label>狀態</label>

            <select id="adminStatusFilter">

              <option value="">
                全部狀態
              </option>

              <option
                value="啟用"
                ${adminFilters.status === "啟用" ? "selected" : ""}
              >
                啟用
              </option>

              <option
                value="停用"
                ${adminFilters.status === "停用" ? "selected" : ""}
              >
                停用
              </option>

            </select>
          </div>

          <button
            type="button"
            class="btn btn-primary"
            id="searchAdmins"
          >
            🔍 查詢
          </button>

          <button
            type="button"
            class="btn btn-outline"
            id="clearAdminFilters"
          >
            ↻ 清除條件
          </button>

        </div>

      </section>

      <div class="spacer"></div>

      <!-- 管理者列表 -->
      <section class="card admin-list-card">

        <div class="section-title">

          <h3>
            管理者列表

            <small class="muted">
              共 ${filteredAdmins.length} 筆資料
            </small>
          </h3>

        </div>

        <div class="table-wrap">

          <table class="data-table admin-table">

            <thead>
              <tr>
                <th>工號</th>
                <th>姓名</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>

              ${
                currentPageAdmins.length === 0
                  ? `
                    <tr>
                      <td
                        colspan="4"
                        class="admin-empty"
                      >
                        查無符合條件的管理者
                      </td>
                    </tr>
                  `
                  : currentPageAdmins
                      .map(
                        (admin) => `
                          <tr>

                            <td>
                              <span class="employee-id">
                                ${admin.employeeId}
                              </span>
                            </td>

                            <td>
                              <strong>
                                ${admin.name}
                              </strong>
                            </td>

                            <td>
                              <span class="admin-status ${
                                admin.status === "啟用"
                                  ? "is-active"
                                  : "is-inactive"
                              }">
                                ${admin.status}
                              </span>
                            </td>

                            <td>
                              <div class="admin-actions">

                                <button
                                  type="button"
                                  class="admin-action-btn edit-admin-btn"
                                  data-admin-id="${admin.employeeId}"
                                >
                                  ✎ 編輯
                                </button>

                                <button
                                  type="button"
                                  class="admin-action-btn reset-pin-btn"
                                  data-admin-id="${admin.employeeId}"
                                >
                                  🔑 重設 PIN
                                </button>

                                <button
                                  type="button"
                                  class="admin-action-btn ${
                                    admin.status === "啟用"
                                      ? "disable-admin-btn"
                                      : "enable-admin-btn"
                                  }"
                                  data-admin-id="${admin.employeeId}"
                                >
                                  ${
                                    admin.status === "啟用"
                                      ? "⏸ 停用"
                                      : "▶ 啟用"
                                  }
                                </button>

                              </div>
                            </td>

                          </tr>
                        `,
                      )
                      .join("")
              }

            </tbody>

          </table>

        </div>

        <div class="admin-table-footer">

          <span class="muted">
            顯示第
            ${filteredAdmins.length === 0 ? 0 : startIndex + 1}
            ～
            ${Math.min(endIndex, filteredAdmins.length)}
            筆，共
            ${filteredAdmins.length}
            筆
          </span>

          <div class="admin-pagination">

            <button
              type="button"
              class="btn btn-outline admin-prev-page"
              ${adminPageNo <= 1 ? "disabled" : ""}
              aria-label="上一頁"
            >
              ‹
            </button>

            <span class="admin-current-page">
              ${adminPageNo}
            </span>

            <button
              type="button"
              class="btn btn-outline admin-next-page"
              ${adminPageNo >= totalPages ? "disabled" : ""}
              aria-label="下一頁"
            >
              ›
            </button>

          </div>

        </div>

      </section>

    </div>
  `;
} */
function pagination(total, pageSize = 10) {
  return `
    <div class="pagination">

      <div class="pages">

        <button
          class="page"
          data-page-no="${Math.max(1, pageNo - 1)}"
          type="button"
        >
          ‹
        </button>

        ${Array.from({ length: Math.min(total, 5) }, (_, index) => index + 1)
          .map(
            (number) => `
              <button
                class="page ${number === pageNo ? "active" : ""}"
                data-page-no="${number}"
                type="button"
              >
                ${number}
              </button>
            `,
          )
          .join("")}

        ${
          total > 5
            ? `
              <button
                class="page"
                type="button"
                disabled
              >
                …
              </button>
            `
            : ""
        }

        <button
          class="page"
          data-page-no="${Math.min(total, pageNo + 1)}"
          type="button"
        >
          ›
        </button>

      </div>

      <span class="muted">
        每頁顯示 ${pageSize} 筆
      </span>

    </div>
  `;
}
function bindCommon() {
  if (page === "employees") {
    bindEmployeeEvents();
  }
  if (page === "holidays") {
    bindHolidayEvents();
  }
  const submitNextWeekOrderButton = document.querySelector(
    "#submitNextWeekOrder",
  );

  submitNextWeekOrderButton?.addEventListener("click", () => {
    if (nextWeekOrderSubmitted) {
      return;
    }

    const confirmed = window.confirm(
      "確認提交下週訂單？\n\n提交後將無法直接修改訂單內容。",
    );

    if (!confirmed) {
      return;
    }

    nextWeekOrderSubmitted = true;

    nextWeekOrderSubmittedAt = new Date().toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    toast("下週訂單已提交");

    render();
  });
  document.querySelectorAll("[data-goto]").forEach((button) => {
    button.addEventListener("click", () => {
      page = button.dataset.goto;

      if (page === "orders") {
        orderTab = "next-week";
      }

      pageNo = 1;
      render();
    });
  });
  document.querySelectorAll("[data-page-no]").forEach(
    (b) =>
      (b.onclick = () => {
        pageNo = +b.dataset.pageNo;
        render();
      }),
  );
  document.querySelectorAll(".do-search").forEach((button) => {
    button.onclick = () => {
      // 只處理下週訂單查詢
      if (page !== "orders" || orderTab !== "next-week") {
        return;
      }

      orderFilters.keyword =
        document.querySelector("#orderKeyword")?.value.trim() || "";

      orderFilters.group =
        document.querySelector("#orderGroupFilter")?.value || "";

      orderFilters.mealType =
        document.querySelector("#orderDiningFilter")?.value || "";

      orderFilters.factory =
        document.querySelector("#orderFactoryFilter")?.value || "";

      orderFilters.diet =
        document.querySelector("#orderMealFilter")?.value || "";

      // 查詢後回第一頁
      pageNo = 1;

      render();

      //toast("查詢完成");
    };
  });
  document
    .querySelector("#orderKeyword")
    ?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();

      document.querySelector(".do-search")?.click();
    });
    document
      .querySelector("#orderKeyword")
      ?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") {
          return;
        }

        event.preventDefault();

        document.querySelector(".do-search")?.click();
      });
  document.querySelectorAll(".clear-filter").forEach((button) => {
    button.onclick = () => {
      // 下週訂單
      if (page === "orders" && orderTab === "next-week") {
        orderFilters = {
          keyword: "",
          group: "",
          mealType: "",
          factory: "",
          diet: "",
        };

        pageNo = 1;

        render();

        //toast("已清除查詢條件");

        return;
      }

      // 其他頁面
      const card = button.closest(".card");

      card?.querySelectorAll("input").forEach((input) => {
        if (input.type === "date") {
          input.value = input.defaultValue;
        } else {
          input.value = "";
        }
      });

      card?.querySelectorAll("select").forEach((select) => {
        select.selectedIndex = 0;
      });

      toast("已清除查詢條件");
    };
  });
  document.querySelectorAll(".export-orders").forEach((button) => {
    button.onclick = exportCSV;
  });

  document.querySelectorAll(".export-next-week").forEach((button) => {
    button.onclick = () => {
      toast("廠區統計匯出功能尚未串接");
    };
  });
  document.querySelectorAll("[data-export-factory]").forEach((button) => {
    button.addEventListener("click", () => {
      const factoryName = button.dataset.exportFactory;

      exportFactoryCSV(factoryName);
    });
  });

  document.querySelectorAll(".export-history").forEach((button) => {
    button.onclick = () => {
      toast("歷史訂單匯出功能尚未串接");
    };
  });
  const sk = document.querySelector("#sendKitchen");
  if (sk) sk.onclick = () => toast("隔日訂單已送出給廚房");
  /* document.querySelectorAll(".view-row").forEach((button) => {
    button.onclick = () => {
      const orderId = button.dataset.orderId;

      const order = weeklyOrders.find((item) => item.orderId === orderId);

      if (!order) {
        toast("找不到訂單資料");
        return;
      }

      openModal(
        "訂單明細",
        `
          <div class="order-detail-list">
            <p>
              <strong>週期：</strong>
              ${order.weekId}
            </p>

            <p>
              <strong>工號：</strong>
              ${order.employeeId}
            </p>

            <p>
              <strong>姓名：</strong>
              ${order.employeeName}
            </p>

            <p>
              <strong>部門：</strong>
              ${order.department}
            </p>

            <p>
              <strong>組別：</strong>
              ${order.group}
            </p>

            <p>
              <strong>用餐方式：</strong>
              ${order.diningMethod}
            </p>

            <p>
              <strong>廠區：</strong>
              ${order.factory || "—"}
            </p>

            <p>
              <strong>餐別：</strong>
              ${order.mealType || "—"}
            </p>

            <p>
              <strong>最後修改：</strong>
              ${order.updatedAt}
            </p>
          </div>
        `,
      );
    };
  }); */
  document.querySelectorAll(".edit-row").forEach((button) => {
    button.onclick = () => {
      openEditOrder(button.dataset.employeeId, button.dataset.weekDate);
    };
  });
  document
    .querySelector(".refresh-orders")
    ?.addEventListener("click", async () => {
      // 已經正在讀取時，不重複送出
      if (weeklyOrderSummaryLoading) {
        return;
      }

      pageNo = 1;

      // 清除目前舊資料
      weeklyOrderSummaryLoaded = false;
      weeklyOrderSummaryData = null;

      showLoadingOverlay("正在重新整理訂單...");

      try {
        await loadNextWeekOrdersAndRender();

        hideLoadingOverlay();

        toast("訂單資料已重新整理");
      } catch (error) {
        hideLoadingOverlay();

        console.error("重新整理訂單失敗：", error);

        toast(error.message || "重新整理訂單失敗");
      }
    });
  document
    .querySelector("#addSpecialOrder")
    ?.addEventListener("click", openSpecialOrder);
  document
    .querySelector("#previousSpecialDate")
    ?.addEventListener("click", () => {
      changeSpecialOrderDate(-1);
    });

  document.querySelector("#nextSpecialDate")?.addEventListener("click", () => {
    changeSpecialOrderDate(1);
  });

  document
    .querySelector("#specialOrderDateFilter")
    ?.addEventListener("change", (e) => {
      selectedSpecialOrderDate = e.target.value;
      render();
    });

  document
    .querySelector("#addSpecialOrderEmpty")
    ?.addEventListener("click", openSpecialOrder);
  document.querySelectorAll(".edit-newcomer-meal").forEach((button) => {
    button.onclick = () => {
      openEditNewcomerMeal(Number(button.dataset.index));
    };
  });

  document.querySelectorAll(".delete-newcomer-meal").forEach((button) => {
    button.onclick = async () => {
      const index = Number(button.dataset.index);

      const rows =
        newcomerMealData && Array.isArray(newcomerMealData.data)
          ? newcomerMealData.data
          : [];

      const item = rows[index];

      if (!item) {
        toast("找不到新人用餐資料");
        return;
      }

      const confirmed = confirm(
        `確定刪除 ${item.date} 的 ${item.quantity} 位新人用餐登記？`,
      );

      if (!confirmed) {
        return;
      }

      showLoadingOverlay("正在刪除新人用餐資料...");

      try {
        const response = await fetch(APP_CONFIG.ADMIN_API_URL, {
          method: "POST",

          body: JSON.stringify({
            action: "deleteNewcomerMeal",

            // index 0 對應 Sheet 第 2 列
            rowIndex: index + 2,
            rowIndex: item.rowIndex,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "刪除新人用餐資料失敗");
        }

        // 清掉舊快取
        newcomerMealData = null;
        newcomerMealLoaded = false;

        // 重新抓 Sheet 最新資料
        const newResult = await loadNewcomerMeals();

        newcomerMealData = newResult;

        newcomerMealLoaded = true;

        hideLoadingOverlay();

        render();

        toast("新人用餐資料已刪除");
      } catch (error) {
        hideLoadingOverlay();

        console.error("刪除新人用餐資料失敗：", error);

        toast(error.message || "刪除新人用餐資料失敗");
      }
    };
  });
  document
    .querySelector(".goto-newcomer-tab")
    ?.addEventListener("click", () => {
      orderTab = "newcomer";

      render();
    });
  const searchCurrentWeekButton = document.querySelector(
    "#searchCurrentWeekOrders",
  );

  searchCurrentWeekButton?.addEventListener("click", () => {
    currentWeekFilters = {
      keyword: document.querySelector("#currentWeekKeyword")?.value || "",
      group: document.querySelector("#currentWeekGroup")?.value || "",
      diningMethod:
        document.querySelector("#currentWeekDiningMethod")?.value || "",

      factory: document.querySelector("#currentWeekFactory")?.value || "",

      mealType: document.querySelector("#currentWeekMealType")?.value || "",
    };
    currentWeekPageNo = 1;
    render();
  });
  document
    .querySelector(".export-current-week")
    ?.addEventListener("click", () => {
      exportCurrentWeekFilteredOrders();
    });

  document
    .querySelector("#clearCurrentWeekOrders")
    ?.addEventListener("click", () => {
      currentWeekFilters = {
        keyword: "",
        group: "",
        diningMethod: "",
        factory: "",
        mealType: "",
      };

      currentWeekPageNo = 1;

      render();
    });
  document
    .querySelector("#currentWeekKeyword")
    ?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }

      document.querySelector("#searchCurrentWeekOrders")?.click();
    });
  document.querySelectorAll("[data-current-week-page]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) {
        return;
      }

      currentWeekPageNo = Number(button.dataset.currentWeekPage);

      render();
    });
  });
  /* document.querySelector("#searchAdmins")?.addEventListener("click", () => {
    adminFilters.keyword = document.querySelector("#adminKeyword")?.value || "";

    adminFilters.status =
      document.querySelector("#adminStatusFilter")?.value || "";

    adminPageNo = 1;

    render();
  });

  document
    .querySelector("#clearAdminFilters")
    ?.addEventListener("click", () => {
      adminFilters = {
        keyword: "",
        status: "",
      };

      adminPageNo = 1;

      render();
    });

  /* document
    .querySelector("#adminKeyword")
    ?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        document.querySelector("#searchAdmins")?.click();
      }
    });
  document.querySelector(".admin-prev-page")?.addEventListener("click", () => {
    if (adminPageNo <= 1) {
      return;
    }

    adminPageNo -= 1;
    render();
  });

  document.querySelector(".admin-next-page")?.addEventListener("click", () => {
    adminPageNo += 1;
    render();
  });
  document.querySelector("#addAdmin")?.addEventListener("click", () => {
    if (!canCurrentAdminManageAdmins()) {
      toast("您沒有新增管理者的權限");
      return;
    }

    openCreateAdminModal();
  });
  document.querySelectorAll(".edit-admin-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (!canCurrentAdminManageAdmins()) {
        toast("您沒有編輯管理者的權限");
        return;
      }

      const employeeId = button.dataset.adminId;

      const admin = admins.find((item) => item.employeeId === employeeId);

      if (!admin) {
        toast("找不到管理者資料");
        return;
      }

      /*
       * 系統擁有者只能修改自己的資料。
       * B 或其他人不能修改 A。
       
      if (admin.isOwner && currentAdminEmployeeId !== admin.employeeId) {
        toast("系統擁有者資料不能由其他管理者修改");
        return;
      }

      openAdminEditModal(admin);
    });
  }); 
  document
    .querySelectorAll(".disable-admin-btn, .enable-admin-btn")
    .forEach((button) => {
      button.addEventListener("click", () => {
        if (!canCurrentAdminManageAdmins()) {
          toast("您沒有變更管理者狀態的權限");
          return;
        }

        const employeeId = button.dataset.adminId;

        const admin = admins.find((item) => item.employeeId === employeeId);

        if (!admin) {
          toast("找不到管理者資料");
          return;
        }

        /*
         * A 的系統擁有者帳號不能被停用。
         *
        if (admin.isOwner) {
          toast("系統擁有者不能被停用");
          return;
        }

        /*
         * 建議也禁止管理者停用自己，
         * 避免 B 不小心把自己鎖住。
         
        if (admin.employeeId === currentAdminEmployeeId) {
          toast("不能停用目前登入的帳號");
          return;
        }

        const nextStatus = admin.status === "啟用" ? "停用" : "啟用";

        const confirmed = window.confirm(
          `確定要將「${admin.name}」設為${nextStatus}嗎？`,
        );

        if (!confirmed) {
          return;
        }

        admin.status = nextStatus;

        render();

        toast(`管理者已${nextStatus}`);
      });
    }); */
  function bindEmployeeEvents() {
    const keywordInput = document.querySelector("#employeeKeyword");

    const groupSelect = document.querySelector("#employeeGroupFilter");

    const statusSelect = document.querySelector("#employeeStatusFilter");

    /* 查詢 */
    document
      .querySelector("#employeeSearchBtn")
      ?.addEventListener("click", () => {
        employeeFilters.keyword = keywordInput?.value.trim() || "";

        employeeFilters.group = groupSelect?.value || "";

        employeeFilters.status = statusSelect?.value || "";

        employeePageNo = 1;

        render();
      });

    /* Enter 搜尋 */
    keywordInput?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }

      employeeFilters.keyword = keywordInput.value.trim();

      employeeFilters.group = groupSelect?.value || "";

      employeeFilters.status = statusSelect?.value || "";

      employeePageNo = 1;

      render();
    });

    /* 清除 */
    document
      .querySelector("#employeeClearBtn")
      ?.addEventListener("click", () => {
        employeeFilters = {
          keyword: "",
          group: "",
          status: "",
        };

        employeePageNo = 1;

        render();

        toast("已清除查詢條件");
      });

    /* 分頁 */
    document.querySelectorAll(".employee-page-button").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled) {
          return;
        }

        const targetPage = Number(button.dataset.employeePage);

        if (!Number.isInteger(targetPage) || targetPage < 1) {
          return;
        }

        employeePageNo = targetPage;

        render();
      });
    });

    /* 編輯 */
    document.querySelectorAll(".edit-employee-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const employeeId = button.dataset.employeeId;

        const employee = employees.find(
          (item) => item.employeeId === employeeId,
        );

        if (!employee) {
          toast("找不到人員資料");

          return;
        }

        openEmployeeEditModal(employee);
      });
    });

    /* 新增 */
    document
      .querySelector("#addEmployeeBtn")
      ?.addEventListener("click", openCreateEmployeeModal);

    /* 暫時的休假日 */
    document
      .querySelector("#holidayComingSoon")
      ?.addEventListener("click", () => {
        toast("休假日設定下一步製作");
      });
  }
  function openEmployeeEditModal(employee) {
    openModal(
      "編輯人員",
      `

      <div class="employee-modal-intro">
        <h3>編輯人員資料</h3>

        <p>
          修改基本資料與系統使用狀態
        </p>
      </div>


      <div class="field">
        <label>
          工號
        </label>

        <input
          <input
  type="text"
  id="editEmployeeId"
  value="${employee.employeeId}"
>
        >
      </div>


      <div class="field">
        <label>
          姓名
        </label>

        <input
          type="text"
          id="editEmployeeName"
          value="${employee.name}"
        >
      </div>


      <div class="field">
  <label>
    部門
  </label>

  <input
    type="text"
    value="${employee.department || ""}"
    disabled
  >
</div>


      <div class="field">
        <label>
          組別
        </label>

        <input
          type="text"
          id="editEmployeeGroup"
          value="${employee.group || ""}"
        >
      </div>


      <div class="field">
        <label>
          狀態
        </label>

        <select id="editEmployeeStatus">

          <option
            value="啟用"
            ${employee.status === "啟用" ? "selected" : ""}
          >
            啟用
          </option>

          <option
            value="停用"
            ${employee.status === "停用" ? "selected" : ""}
          >
            停用
          </option>

        </select>
      </div>


      <div class="modal-actions">

        <button
          type="button"
          class="btn btn-outline"
          id="cancelEmployeeEdit"
        >
          取消
        </button>

        <button
          type="button"
          class="btn btn-primary"
          id="saveEmployeeEdit"
        >
          儲存修改
        </button>

      </div>

    `,
    );

    document
      .querySelector("#cancelEmployeeEdit")
      ?.addEventListener("click", closeModal);

    document
      .querySelector("#saveEmployeeEdit")
      ?.addEventListener("click", async () => {
        const employeeId =
          document
            .querySelector("#editEmployeeId")
            ?.value.trim()
            .toUpperCase() || "";

        const name =
          document.querySelector("#editEmployeeName")?.value.trim() || "";

        const group =
          document.querySelector("#editEmployeeGroup")?.value.trim() || "";

        const status =
          document.querySelector("#editEmployeeStatus")?.value || "啟用";

        if (!employeeId) {
          toast("請輸入工號");
          return;
        }

        if (!name) {
          toast("請輸入姓名");
          return;
        }

        if (!group) {
          toast("請輸入組別");
          return;
        }

        const saveButton = document.querySelector("#saveEmployeeEdit");

        if (saveButton) {
          saveButton.disabled = true;
          saveButton.textContent = "儲存中...";
        }
       showLoadingOverlay(`正在更新「${name}」資料...`);

        try {
          const response = await fetch(APP_CONFIG.ADMIN_API_URL, {
            method: "POST",
            body: JSON.stringify({
              action: "updateEmployee",

              originalEmployeeId: employee.employeeId,

              employeeId: employeeId,

              name: name,

              group: group,

              enabled: status === "啟用",
            }),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.message || "更新人員狀態失敗");
          }

          // 先更新目前畫面
          employee.employeeId = employeeId;

          employee.name = name;

          employee.group = group;

          employee.status = status;

          closeModal();

          // 關閉中央處理中畫面
          hideLoadingOverlay();

          render();

          toast("人員資料更新完成");
        } catch (error) {
          hideLoadingOverlay();
          console.error("更新人員狀態失敗：", error);

          toast("更新失敗");

          if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = "儲存修改";
          }
        }
      });
  }
  function openAdminEditModal(admin) {
    openModal(
      "編輯管理者",
      `
    <div class="modal-header">
      <div>
        <h3>編輯管理者</h3>
        <p>修改管理者姓名與狀態</p>
      </div>
    </div>

    <div class="modal-form">
      <div class="field">
        <label>工號</label>

        <input
          value="${admin.employeeId}"
          disabled
        >
      </div>

      <div class="field">
        <label>姓名</label>

        <input
          id="editAdminName"
          value="${admin.name}"
        >
      </div>

      <div class="field">
        <label>狀態</label>

        <select id="editAdminStatus">
          <option
            value="啟用"
            ${admin.status === "啟用" ? "selected" : ""}
          >
            啟用
          </option>

          <option
            value="停用"
            ${admin.status === "停用" ? "selected" : ""}
          >
            停用
          </option>
        </select>
      </div>
    </div>

    <div class="modal-actions">
      <button
        type="button"
        class="btn btn-outline close-modal"
      >
        取消
      </button>

      <button
        type="button"
        class="btn btn-primary"
        id="saveAdminEdit"
      >
        儲存修改
      </button>
    </div>
  `,
    );

    document.querySelector("#saveAdminEdit")?.addEventListener("click", () => {
      const newName = document.querySelector("#editAdminName")?.value.trim();

      const newStatus = document.querySelector("#editAdminStatus")?.value;

      if (!newName) {
        toast("請輸入管理者姓名");
        return;
      }

      admin.name = newName;
      admin.status = newStatus;

      closeModal();
      render();

      toast("管理者資料已更新");
    });
  }
  document.querySelectorAll(".reset-pin-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (!canCurrentAdminManageAdmins()) {
        toast("您沒有重設 PIN 的權限");
        return;
      }

      const employeeId = button.dataset.adminId;

      const admin = admins.find((item) => item.employeeId === employeeId);

      if (!admin) {
        toast("找不到管理者資料");
        return;
      }

      /*
       * B 不能重設 A 的 PIN。
       * A 可以重設自己的 PIN。
       */
      if (admin.isOwner && currentAdminEmployeeId !== admin.employeeId) {
        toast("系統擁有者的 PIN 不能由其他管理者重設");
        return;
      }

      openResetPinModal(admin);
    });
  });
}
function openEditOrder(employeeId, weekDate) {
  const orders =
    weeklyOrderSummaryData && Array.isArray(weeklyOrderSummaryData.data)
      ? weeklyOrderSummaryData.data
      : [];

  const order = orders.find(
    (item) => item.employeeId === employeeId && item.weekDate === weekDate,
  );

  if (!order) {
    toast("找不到訂單資料");
    return;
  }

  openModal(
    "編輯訂單",
    `
      <div class="field">
        <label>員工</label>

        <input
          value="${order.name}（${order.employeeId}）"
          disabled
        >
      </div>

      <div class="field">
        <label>訂餐週期</label>

        <input
          value="${formatOrderWeek(order.weekDate)}"
          disabled
        >
      </div>

      <div class="field">
        <label>用餐方式</label>

        <select id="editDiningMethod">

          <option
            value="上樓用餐"
            ${order.mealType === "上樓用餐" ? "selected" : ""}
          >
            上樓用餐
          </option>

          <option
            value="便當"
            ${order.mealType === "便當" ? "selected" : ""}
          >
            便當
          </option>

        </select>
      </div>

      <div
        class="field"
        id="editFactoryField"
      >
        <label>廠區</label>

        <select id="editFactory">

          <option value="">
            請選擇廠區
          </option>

          <option
            value="一廠"
            ${order.factory === "一廠" ? "selected" : ""}
          >
            一廠
          </option>

          <option
            value="二廠"
            ${order.factory === "二廠" ? "selected" : ""}
          >
            二廠
          </option>

        </select>
      </div>

      <div
        class="field"
        id="editMealField"
      >
        <label>葷／素</label>

        <select id="editMealType">

          <option value="">
            請選擇葷／素
          </option>

          <option
            value="葷食"
            ${order.diet === "葷食" ? "selected" : ""}
          >
            葷食
          </option>

          <option
            value="素食"
            ${order.diet === "素食" ? "selected" : ""}
          >
            素食
          </option>

        </select>
      </div>

      <button
        class="btn btn-primary"
        style="margin-top:16px;width:100%"
        id="saveModal"
        type="button"
      >
        儲存變更
      </button>
    `,
  );

  setTimeout(() => {
    const diningSelect = document.querySelector("#editDiningMethod");

    const factoryField = document.querySelector("#editFactoryField");

    const mealField = document.querySelector("#editMealField");

    const factorySelect = document.querySelector("#editFactory");

    const mealSelect = document.querySelector("#editMealType");

    const saveButton = document.querySelector("#saveModal");

    if (
      !diningSelect ||
      !factoryField ||
      !mealField ||
      !factorySelect ||
      !mealSelect ||
      !saveButton
    ) {
      return;
    }
    async function saveOrderEdit(orderData) {
      showLoadingOverlay("正在更新訂單...");

      try {
        const response = await fetch(APP_CONFIG.ADMIN_API_URL, {
          method: "POST",

          body: JSON.stringify({
            action: "updateWeeklyOrder",

            employeeId: orderData.employeeId,

            weekDate: orderData.weekDate,

            mealType: orderData.mealType,

            factory: orderData.factory,

            diet: orderData.diet,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "更新訂單失敗");
        }

        closeModal();

        // 清掉舊快取
        weeklyOrderSummaryLoaded = false;
        weeklyOrderSummaryData = null;

        // 重新讀取最新資料
        await loadNextWeekOrdersAndRender();

        hideLoadingOverlay();

        toast("訂單更新完成");
      } catch (error) {
        hideLoadingOverlay();

        console.error("訂單更新失敗：", error);

        toast(error.message || "訂單更新失敗");
      }
    }
    function updateFields() {
      const isLunchBox = diningSelect.value === "便當";

      factoryField.hidden = !isLunchBox;
      mealField.hidden = !isLunchBox;
    }

    diningSelect.addEventListener("change", updateFields);

    updateFields();

    saveButton.onclick = async () => {
      const mealType = diningSelect.value;

      const factory = mealType === "便當" ? factorySelect.value : "";

      const diet = mealType === "便當" ? mealSelect.value : "";
      // =========================
      // 檢查資料是否真的有修改
      // =========================
      const originalMealType = order.mealType || "";

      const originalFactory =
        originalMealType === "便當" ? order.factory || "" : "";

      const originalDiet = originalMealType === "便當" ? order.diet || "" : "";

      const hasChanged =
        mealType !== originalMealType ||
        factory !== originalFactory ||
        diet !== originalDiet;

      // 完全沒有變更，不呼叫 API
      if (!hasChanged) {
        closeModal();

        toast("訂單內容沒有變更");

        return;
      }

      if (mealType === "便當" && !factory) {
        toast("請選擇廠區");
        return;
      }

      if (mealType === "便當" && !diet) {
        toast("請選擇葷／素");
        return;
      }

      await saveOrderEdit({
        employeeId: order.employeeId,
        weekDate: order.weekDate,
        mealType,
        factory,
        diet,
      });
    };
  }, 0);
}
function openAdmin(title, id = "") {
  openModal(
    title,
    `<div class="field"><label>工號</label><input value="${id}"></div><div class="field"><label>姓名</label><input></div><div class="field"><label>角色</label><select><option>部門管理者</option><option>訂餐管理者</option><option>系統管理者</option></select></div><button class="btn btn-primary" style="margin-top:16px" id="saveModal">儲存</button>`,
  );
  setTimeout(
    () =>
      (document.querySelector("#saveModal").onclick = () => {
        closeModal();
        toast("管理者資料已儲存");
      }),
    0,
  );
}
function openEditNewcomerMeal(index) {
  const rows =
    newcomerMealData && Array.isArray(newcomerMealData.data)
      ? newcomerMealData.data
      : [];

  const item = rows[index];

  if (!item) {
    toast("找不到新人用餐資料");
    return;
  }

  openModal(
    "編輯新人用餐",
    `
      <div class="field">
        <label>新人用餐日期</label>

        <input
          type="date"
          id="editNewcomerMealDate"
          value="${item.date}"
          min="${dashboardData.nextWeek.startDate}"
          max="${dashboardData.nextWeek.endDate}"
        >
      </div>


      <div class="field">
        <label>所屬部門</label>

        <input
          type="text"
          id="editNewcomerDepartment"
          value="${item.department || ""}"
        >
      </div>


      <div class="field">
        <label>名稱</label>

        <input
          type="text"
          id="editNewcomerName"
          value="${item.name || ""}"
          placeholder="例如：新人報到"
        >
      </div>


      <div class="field">
        <label>新人數量</label>

        <input
          type="number"
          id="editNewcomerQuantity"
          value="${item.quantity}"
          min="1"
          step="1"
        >
      </div>


      <div class="newcomer-dining-notice">
        🏠 新人固定為上樓用餐
      </div>


      <button
        class="btn btn-primary"
        style="margin-top:16px;width:100%"
        id="saveNewcomerEdit"
        type="button"
      >
        儲存變更
      </button>
    `,
  );

  setTimeout(() => {
    const saveButton = document.querySelector("#saveNewcomerEdit");

    if (!saveButton) {
      return;
    }

    saveButton.onclick = async () => {
      const date = document.querySelector("#editNewcomerMealDate").value;

      const department = document
        .querySelector("#editNewcomerDepartment")
        .value.trim();

      const name = document.querySelector("#editNewcomerName").value.trim();

      const quantity = Number(
        document.querySelector("#editNewcomerQuantity").value,
      );

      if (
        date < dashboardData.nextWeek.startDate ||
        date > dashboardData.nextWeek.endDate
      ) {
        toast("新人用餐日期必須在下週內");
        return;
      }

      if (!department) {
        toast("請輸入新人所屬部門");
        return;
      }

      if (!name) {
        toast("請輸入名稱");
        return;
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        toast("新人數量必須是大於 0 的整數");
        return;
      }

      showLoadingOverlay("正在更新新人用餐資料...");

      try {
        const response = await fetch(APP_CONFIG.ADMIN_API_URL, {
          method: "POST",

          body: JSON.stringify({
            action: "updateNewcomerMeal",

            // Sheet 第一列是標題
            // 所以資料 index 0 = Sheet 第 2 列
            rowIndex: item.rowIndex,

            date,
            department,
            name,
            quantity,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "更新新人用餐資料失敗");
        }

        // 清掉新人快取
        newcomerMealData = null;
        newcomerMealLoaded = false;

        // 重新從 Sheet 抓最新資料
        const newResult = await loadNewcomerMeals();

        newcomerMealData = newResult;

        newcomerMealLoaded = true;

        selectedSpecialOrderDate = date;

        closeModal();

        hideLoadingOverlay();

        render();

        toast("新人用餐資料已更新");
      } catch (error) {
        hideLoadingOverlay();

        console.error("更新新人用餐資料失敗：", error);

        toast(error.message || "更新新人用餐資料失敗");
      }
    };
  }, 0);
}
function openSpecialOrder() {
  openModal(
    "新增新人用餐",
    `
      <div class="field">
        <label>新人用餐日期</label>

        <input
          type="date"
          id="newcomerMealDate"
          value="${selectedSpecialOrderDate}"
          min="${dashboardData.nextWeek.startDate}"
          max="${dashboardData.nextWeek.endDate}"
        >
      </div>

      <div class="field">
        <label>所屬部門</label>

        <input
          type="text"
          id="newcomerDepartment"
          placeholder="例如：人資部"
        >
      </div>

      <div class="field">
        <label>新人數量</label>

        <input
          type="number"
          id="newcomerQuantity"
          value="1"
          min="1"
          step="1"
        >
      </div>

      <div class="field">
  <label>名稱</label>

  <input
    type="text"
    id="newcomerName"
    placeholder="例如：新人報到"
  >
</div>

      <div class="newcomer-dining-notice">
        🏠 新人固定為上樓用餐
      </div>

      <button
        class="btn btn-primary"
        style="margin-top:16px;width:100%"
        id="saveNewcomerMeal"
        type="button"
      >
        儲存新人用餐
      </button>
    `,
  );

  setTimeout(() => {
    const saveButton = document.querySelector("#saveNewcomerMeal");

    if (!saveButton) return;

    saveButton.onclick = async () => {
      const mealDate = document.querySelector("#newcomerMealDate").value;

      const department = document
        .querySelector("#newcomerDepartment")
        .value.trim();

      const quantity = Number(
        document.querySelector("#newcomerQuantity").value,
      );

      const name = document.querySelector("#newcomerName").value.trim();

      if (!mealDate) {
        toast("請選擇新人用餐日期");
        return;
      }

      if (
        mealDate < dashboardData.nextWeek.startDate ||
        mealDate > dashboardData.nextWeek.endDate
      ) {
        toast("新人用餐日期必須在下週週期內");
        return;
      }

      if (!department) {
        toast("請輸入新人所屬部門");
        return;
      }

      if (!name) {
        toast("請輸入名稱");
        return;
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        toast("新人數量必須是大於 0 的整數");
        return;
      }

      showLoadingOverlay("正在新增新人用餐資料...");

      try {
        const response = await fetch(APP_CONFIG.ADMIN_API_URL, {
          method: "POST",

          body: JSON.stringify({
            action: "addNewcomerMeal",

            date: mealDate,
            department,
            name,
            quantity,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "新增新人用餐資料失敗");
        }

        // 清除舊的新人快取
        newcomerMealData = null;
        newcomerMealLoaded = false;

        // 重新從 Sheet 讀取最新資料
        const newResult = await loadNewcomerMeals();

        newcomerMealData = newResult;

        newcomerMealLoaded = true;

        selectedSpecialOrderDate = mealDate;

        closeModal();

        hideLoadingOverlay();

        render();

        toast(`已新增 ${quantity} 位新人`);
      } catch (error) {
        hideLoadingOverlay();

        console.error("新增新人用餐資料失敗：", error);

        toast(error.message || "新增新人用餐資料失敗");
      }
    };
  }, 0);
}
function openModal(title, body) {
  document.querySelector("#modalTitle").textContent = title;
  document.querySelector("#modalBody").innerHTML = body;
  document.querySelector("#modalBackdrop").classList.add("show");
}
function closeModal() {
  document.querySelector("#modalBackdrop").classList.remove("show");
}
document.querySelector("#closeModal").onclick = closeModal;
document.querySelector("#modalBackdrop").onclick = (e) => {
  if (e.target.id === "modalBackdrop") closeModal();
};
function toast(msg) {
  const t = document.querySelector("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
}
function showLoadingOverlay(message = "處理中...") {
  // 避免重複建立
  if (document.querySelector("#loadingOverlay")) {
    return;
  }

  const overlay = document.createElement("div");

  overlay.id = "loadingOverlay";
  overlay.className = "loading-overlay";

  overlay.innerHTML = `
    <div class="loading-overlay-card">

      <div class="loading-spinner"></div>

      <strong>
        ${message}
      </strong>

      <p>
        請稍候，系統正在處理
      </p>

    </div>
  `;

  document.body.appendChild(overlay);
}
function showPageLoading() {
  document.querySelector("#pageLoading")?.classList.remove("is-hidden");
}

function hidePageLoading() {
  document.querySelector("#pageLoading")?.classList.add("is-hidden");
}
function hideLoadingOverlay() {
  document.querySelector("#loadingOverlay")?.remove();
}
function exportCSV() {
  // 取得目前「查詢後」的下週訂單
  const orders = getFilteredWeeklyOrders();

  // 沒有資料就不產生空白檔案
  if (!orders.length) {
    toast("目前沒有可匯出的訂單資料");
    return;
  }

  const rows = [
    ["訂餐週期", "工號", "姓名", "部門", "組別", "用餐方式", "廠區", "葷／素"],

    ...orders.map((order) => [
      formatOrderWeek(order.weekDate),
      order.employeeId || "",
      order.name || "",
      order.department || "",
      order.group || "",
      order.mealType || "",
      order.factory || "",
      order.diet || "",
    ]),
  ];

  const csv =
    "\ufeff" +
    rows
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");

            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  });

  const link = document.createElement("a");

  const url = URL.createObjectURL(blob);

  link.href = url;

  // 取得目前週期
  const weekDate = orders[0]?.weekDate || "下週";

  link.download = `下週訂餐明細_${weekDate}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
async function exportFactoryCSV(factoryName) {
  // =========================
  // 尚未讀取下週訂單時
  // 先從 Sheet 取得最新資料
  // =========================
  if (!weeklyOrderSummaryData || !Array.isArray(weeklyOrderSummaryData.data)) {
    showLoadingOverlay(`正在讀取${factoryName}訂單...`);

    try {
      const targetDate = dashboardData.nextWeek.startDate;

      const result = await loadWeeklyOrderSummary(targetDate);

      weeklyOrderSummaryData = result;
      weeklyOrderSummaryLoaded = true;
    } catch (error) {
      hideLoadingOverlay();

      console.error("讀取下週訂單失敗：", error);

      toast("讀取下週訂單失敗");

      return;
    }

    hideLoadingOverlay();
  }
  const orders =
    weeklyOrderSummaryData && Array.isArray(weeklyOrderSummaryData.data)
      ? weeklyOrderSummaryData.data
      : [];

  const factoryOrders = orders.filter(
    (order) => order.mealType === "便當" && order.factory === factoryName,
  );

  if (factoryOrders.length === 0) {
    toast(`${factoryName}目前沒有便當訂單`);
    return;
  }

  const rows = [
    ["訂餐週期", "工號", "姓名", "部門", "組別", "廠區", "葷／素"],

    ...factoryOrders.map((order) => [
      formatOrderWeek(order.weekDate),
      order.employeeId || "",
      order.name || "",
      order.department || "",
      order.group || "",
      order.factory || "",
      order.diet || "",
    ]),
  ];

  const csv =
    "\ufeff" +
    rows
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");

            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  const weekDate = factoryOrders[0]?.weekDate || "下週";

  link.download = `下週便當明細_${factoryName}_${weekDate}.csv`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}
function initializeDashboardHeader() {
  updateNextWeekRange();
}

function updateNextWeekRange() {
  const nextWeekRangeEl = document.getElementById("nextWeekRange");

  if (!nextWeekRangeEl) {
    return;
  }

  const nextWeek = getNextWeekRange();

  nextWeekRangeEl.textContent = `${nextWeek.startDate}～${formatShortDate(nextWeek.endDateValue)}`;
}

function formatShortDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = weekdays[date.getDay()];

  return `${month}/${day}（${weekday}）`;
}
/* function updateCurrentAdmin() {
  const adminNameEl = document.getElementById("currentAdminName");

  if (!adminNameEl) {
    return;
  }

  try {
    const adminData = localStorage.getItem("adminUser");

    if (!adminData) {
      adminNameEl.textContent = "未登入";
      return;
    }

    const admin = JSON.parse(adminData);

    adminNameEl.textContent =
      admin.name ||
      admin.adminName ||
      admin.employeeName ||
      admin.empId ||
      "管理者";
  } catch (error) {
    console.error("讀取管理者資料失敗：", error);
    adminNameEl.textContent = "管理者";
  }
} */
function getNextWeekNewcomerTotal() {
  const rows =
    newcomerMealData && Array.isArray(newcomerMealData.data)
      ? newcomerMealData.data
      : [];

  return rows
    .filter(
      (item) =>
        item.date >= dashboardData.nextWeek.startDate &&
        item.date <= dashboardData.nextWeek.endDate,
    )
    .reduce((total, item) => total + Number(item.quantity || 0), 0);
}
function getCurrentWeekNewcomerTotal() {
  const rows =
    newcomerMealData && Array.isArray(newcomerMealData.data)
      ? newcomerMealData.data
      : [];

  return rows
    .filter(
      (item) =>
        item.date >= dashboardData.currentWeek.startDate &&
        item.date <= dashboardData.currentWeek.endDate,
    )
    .reduce((total, item) => total + Number(item.quantity || 0), 0);
}
initializeDashboardData();

weeklyOrders.forEach((order) => {
  order.weekId = dashboardData.nextWeek.weekId;
});

if (newcomerMeals.length > 0) {
  newcomerMeals[0].mealDate = dashboardData.nextWeek.startDate;
}

selectedSpecialOrderDate = dashboardData.nextWeek.startDate;

async function initializeApp() {
  showPageLoading();

  try {
    initializeDashboardData();

    initializeDashboardHeader();

    render();

    await Promise.all([
      loadDashboardWeeklyOrders(),
      loadDashboardCurrentWeekOrders(),
      loadDashboardNewcomerMeals(),
    ]);

    render();
  } catch (error) {
    console.error("首頁初始化失敗：", error);

    toast("部分資料載入失敗，請重新整理後再試");
  } finally {
    hidePageLoading();
  }
}

initializeApp();

function getCurrentWeekNewcomerDays() {
  const rows =
    newcomerMealData && Array.isArray(newcomerMealData.data)
      ? newcomerMealData.data
      : [];

  const dates = rows
    .filter(
      (item) =>
        item.date >= dashboardData.currentWeek.startDate &&
        item.date <= dashboardData.currentWeek.endDate,
    )
    .map((item) => item.date);

  return new Set(dates).size;
}

function getNextWeekOrderSummary() {
  // API 還沒讀到資料時
  if (!weeklyOrderSummaryData || !Array.isArray(weeklyOrderSummaryData.data)) {
    return {
      lunchBoxTotal: 0,
      dineUpstairs: 0,
      meat: 0,
      vegetarian: 0,
    };
  }

  const orders = weeklyOrderSummaryData.data;

  // 便當
  const lunchBoxOrders = orders.filter((order) => order.mealType === "便當");

  // 上樓用餐
  const upstairsOrders = orders.filter(
    (order) => order.mealType === "上樓用餐",
  );

  return {
    lunchBoxTotal: lunchBoxOrders.length,

    dineUpstairs: upstairsOrders.length,

    meat: lunchBoxOrders.filter((order) => order.diet === "葷食").length,

    vegetarian: lunchBoxOrders.filter((order) => order.diet === "素食").length,
  };
}
function getNextWeekFactorySummary() {
  const orders =
    weeklyOrderSummaryData && Array.isArray(weeklyOrderSummaryData.data)
      ? weeklyOrderSummaryData.data
      : [];

  return factories.map((factory) => {
    const factoryOrders = orders.filter(
      (order) => order.mealType === "便當" && order.factory === factory,
    );

    const meat = factoryOrders.filter((order) => order.diet === "葷食").length;

    const vegetarian = factoryOrders.filter(
      (order) => order.diet === "素食",
    ).length;

    return {
      factory,
      meat,
      vegetarian,
      total: meat + vegetarian,
    };
  });
}
/* function openResetPinModal(admin) {
  openModal(
    "重設 PIN",
    `
    <div class="modal-header">
      <div>
        <h3>重設 PIN</h3>

        <p>
          ${admin.employeeId}／${admin.name}
        </p>
      </div>
    </div>

    <div class="modal-form">

      <div class="field">
        <label>新 PIN</label>

        <input
          id="newAdminPin"
          type="password"
          inputmode="numeric"
          maxlength="6"
          placeholder="請輸入 6 位數 PIN"
        >
      </div>

      <div class="field">
        <label>確認新 PIN</label>

        <input
          id="confirmAdminPin"
          type="password"
          inputmode="numeric"
          maxlength="6"
          placeholder="請再次輸入 PIN"
        >
      </div>

    </div>

    <div class="modal-actions">
      <button
        type="button"
        class="btn btn-outline close-modal"
      >
        取消
      </button>

      <button
        type="button"
        class="btn btn-primary"
        id="confirmResetPin"
      >
        確認重設
      </button>
    </div>
   `,
  );

  document.querySelector("#confirmResetPin")?.addEventListener("click", () => {
    const newPin = document.querySelector("#newAdminPin")?.value || "";

    const confirmPin = document.querySelector("#confirmAdminPin")?.value || "";

    if (!/^\d{6}$/.test(newPin)) {
      toast("PIN 必須是 6 位數字");
      return;
    }

    if (newPin !== confirmPin) {
      toast("兩次輸入的 PIN 不一致");
      return;
    }

    /*
     * 現在只做畫面測試。
     * 不要把 PIN 存進 admins 陣列。
     * 串 Apps Script 後再傳到後端雜湊。
     *

    closeModal();

    toast(`${admin.name} 的 PIN 已重設`);
  });
} */
/* function openCreateAdminModal() {
  openModal(
    "新增管理者",
    `
    <div class="modal-header">
      <div>
        <h3>新增管理者</h3>
        <p>建立可登入管理後台的管理者帳號</p>
      </div>
    </div>

    <div class="modal-form">

      <div class="field">
        <label>工號 *</label>

        <input
          id="newAdminEmployeeId"
          placeholder="例如 A00009"
          autocomplete="off"
        >
      </div>

      <div class="field">
        <label>姓名 *</label>

        <input
          id="newAdminName"
          placeholder="請輸入管理者姓名"
          autocomplete="off"
        >
      </div>

      <div class="field">
        <label>初始 PIN *</label>

        <input
          id="newAdminPin"
          type="password"
          inputmode="numeric"
          maxlength="6"
          placeholder="請輸入 6 位數 PIN"
          autocomplete="new-password"
        >
      </div>

      <div class="field">
        <label>確認 PIN *</label>

        <input
          id="newAdminPinConfirm"
          type="password"
          inputmode="numeric"
          maxlength="6"
          placeholder="請再次輸入 PIN"
          autocomplete="new-password"
        >
      </div>

    </div>

    <div class="modal-actions">
      <button
        type="button"
        class="btn btn-outline close-modal"
      >
        取消
      </button>

      <button
        type="button"
        class="btn btn-primary"
        id="confirmCreateAdmin"
      >
        建立管理者
      </button>
    </div>
  `,
  );

  document
    .querySelector("#confirmCreateAdmin")
    ?.addEventListener("click", () => {
      createAdminFromModal();
    });
}
function createAdminFromModal() {
  const employeeId =
    document.querySelector("#newAdminEmployeeId")?.value.trim().toUpperCase() ||
    "";

  const name = document.querySelector("#newAdminName")?.value.trim() || "";

  const pin = document.querySelector("#newAdminPin")?.value || "";

  const confirmPin = document.querySelector("#newAdminPinConfirm")?.value || "";

  if (!employeeId) {
    toast("請輸入工號");
    return;
  }

  if (!name) {
    toast("請輸入姓名");
    return;
  }

  if (!/^\d{6}$/.test(pin)) {
    toast("PIN 必須是 6 位數字");
    return;
  }

  if (pin !== confirmPin) {
    toast("兩次輸入的 PIN 不一致");
    return;
  }

  const exists = admins.some(
    (admin) => admin.employeeId.toUpperCase() === employeeId,
  );

  if (exists) {
    toast("此工號已存在");
    return;
  }

  admins.push({
    employeeId,
    name,
    status: "啟用",
  });

  /*
   * 目前只測試前端畫面。
   * PIN 不要放進 admins 陣列。
   * 之後串 Apps Script 時再送到後端處理。
   *

  closeModal();

  adminPageNo = 1;

  render();

  toast("管理者已新增");
} */
/* function getCurrentAdmin() {
  return admins.find(
    (admin) =>
      admin.employeeId === currentAdminEmployeeId && admin.status === "啟用",
  );
} */

/* function canCurrentAdminManageAdmins() {
  const currentAdmin = getCurrentAdmin();

  return Boolean(currentAdmin && currentAdmin.canManageAdmins);
} */
function openCreateEmployeeModal() {
  openModal(
    "新增人員",
    `

      <div class="employee-modal-intro">

        <h3>
          新增人員
        </h3>

        <p>
          建立可使用訂餐系統的人員資料
        </p>

      </div>


      <div class="field">

        <label>
          工號 *
        </label>

        <input
          type="text"
          id="newEmployeeId"
          placeholder="例如 C25009"
        >

      </div>


      <div class="field">

        <label>
          姓名 *
        </label>

        <input
          type="text"
          id="newEmployeeName"
          placeholder="請輸入姓名"
        >

      </div>


      <div class="field">
  <label>
    部門
  </label>

  <input
    type="text"
    value="燃料電池事業處"
    disabled
  >
</div>


      <div class="field">

        <label>
          組別 *
        </label>

        <input
          type="text"
          id="newEmployeeGroup"
          placeholder="請輸入組別"
        >

      </div>

      <div class="field">

  <label>
    身分 *
  </label>

  <select id="newEmployeeRole">
    <option value="">
      請選擇身分
    </option>

    <option value="員工">
      員工
    </option>

    <option value="課長">
      課長
    </option>

    <option value="副理">
      副理
    </option>

    <option value="經理">
      經理
    </option>
  </select>

</div>


      <div class="field">

        <label>
          狀態 *
        </label>

        <select id="newEmployeeStatus">

          <option value="啟用">
            啟用
          </option>

          <option value="停用">
            停用
          </option>

        </select>

      </div>


      <div class="modal-actions">

        <button
          type="button"
          class="btn btn-outline"
          id="cancelCreateEmployee"
        >
          取消
        </button>

        <button
          type="button"
          class="btn btn-primary"
          id="saveNewEmployee"
        >
          新增人員
        </button>

      </div>

    `,
  );

  document
    .querySelector("#cancelCreateEmployee")
    ?.addEventListener("click", closeModal);

  document
    .querySelector("#saveNewEmployee")
    ?.addEventListener("click", async () => {
      const employeeId =
        document.querySelector("#newEmployeeId")?.value.trim().toUpperCase() ||
        "";

      const name =
        document.querySelector("#newEmployeeName")?.value.trim() || "";

      const group =
        document.querySelector("#newEmployeeGroup")?.value.trim() || "";

      const role = document.querySelector("#newEmployeeRole")?.value || "";

      const status =
        document.querySelector("#newEmployeeStatus")?.value || "啟用";

      if (!employeeId) {
        toast("請輸入工號");
        return;
      }

      if (!name) {
        toast("請輸入姓名");
        return;
      }

      if (!group) {
        toast("請輸入組別");
        return;
      }

      if (!role) {
        toast("請選擇身分");
        return;
      }

      // 前端先檢查一次工號
      const exists = employees.some(
        (employee) => String(employee.employeeId).toUpperCase() === employeeId,
      );

      if (exists) {
        toast("此工號已存在");
        return;
      }

      const saveButton = document.querySelector("#saveNewEmployee");

      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "新增中...";
      }
      showLoadingOverlay(`正在新增「${name}」...`);

      try {
        const response = await fetch(APP_CONFIG.ADMIN_API_URL, {
          method: "POST",

          body: JSON.stringify({
            action: "addEmployee",

            employeeId,
            name,
            group,
            role,

            enabled: status === "啟用",
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "新增人員失敗");
        }

        // API 成功後直接加入目前畫面
        employees.push({
          employeeId: result.data.employeeId,

          name: result.data.name,

          department: result.data.department,

          group: result.data.group,

          role: result.data.role,

          status: result.data.enabled ? "啟用" : "停用",
        });

        employeePageNo = 1;

        closeModal();
        hideLoadingOverlay();

        render();

        toast("人員新增完成");
      } catch (error) {
        hideLoadingOverlay();
        console.error("新增人員失敗：", error);

        toast(error.message || "新增人員失敗");

        if (saveButton) {
          saveButton.disabled = false;
          saveButton.textContent = "新增人員";
        }
      }
    });
}
function formatHolidayDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  const weekday = weekdays[date.getDay()];

  return `${year}/${month}/${day}（${weekday}）`;
}
function bindHolidayEvents() {
  /*
   * 新增休假日
   */
  document
    .querySelector("#addHolidayBtn")
    ?.addEventListener("click", openCreateHolidayModal);

  /*
   * 刪除休假日
   */
  document.querySelectorAll(".holiday-delete-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const holidayId = button.dataset.holidayId;

      const holiday = holidays.find((item) => item.id === holidayId);

      if (!holiday) {
        toast("找不到休假日資料");
        return;
      }

      const confirmed = window.confirm(
        `確定要刪除「${holiday.name}」\n${formatHolidayDate(holiday.date)}？`,
      );

      if (!confirmed) {
        return;
      }

      // 防止再次點擊
      button.disabled = true;

      // 顯示中央處理中遮罩
      showLoadingOverlay(`正在刪除「${holiday.name}」...`);

      try {
        const response = await fetch(APP_CONFIG.ADMIN_API_URL, {
          method: "POST",

          body: JSON.stringify({
            action: "deleteHoliday",
            date: holiday.date,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "刪除休假日失敗");
        }

        // =========================
        // 刪除成功
        // =========================

        // 清除目前休假日快取
        holidaysLoaded = false;

        // 從 Sheet 重新取得最新資料
        await loadHolidays();

        // 先關閉中央遮罩
        hideLoadingOverlay();

        // 更新畫面
        render();

        // 顯示完成訊息
        toast("休假日已刪除");
      } catch (error) {
        // =========================
        // 刪除失敗
        // =========================

        // 一定要關閉遮罩
        hideLoadingOverlay();

        console.error("刪除休假日失敗：", error);

        toast(error.message || "刪除休假日失敗");

        // 因為沒有刪成功，
        // 讓垃圾桶可以再次點擊
        button.disabled = false;
      }
    });
  });
}
function openCreateHolidayModal() {
  openModal(
    "新增休假日",
    `

      <div class="holiday-modal-intro">

        <h3>
          新增休假日
        </h3>

        <p>
          設定不提供訂餐的日期
        </p>

      </div>


      <div class="field">

        <label>
          日期 *
        </label>

        <input
          type="date"
          id="newHolidayDate"
        >

      </div>


      <div class="field">

        <label>
          休假日名稱 *
        </label>

        <input
          type="text"
          id="newHolidayName"
          placeholder="例如：中秋節"
        >

      </div>


      <div class="holiday-modal-notice">
        📅 此日期設定後，
        將不列入訂餐日期。
      </div>


      <div class="modal-actions">

        <button
          type="button"
          class="btn btn-outline"
          id="cancelCreateHoliday"
        >
          取消
        </button>

        <button
          type="button"
          class="btn btn-primary"
          id="saveNewHoliday"
        >
          新增休假日
        </button>

      </div>

    `,
  );

  document
    .querySelector("#cancelCreateHoliday")
    ?.addEventListener("click", closeModal);

  document
    .querySelector("#saveNewHoliday")
    ?.addEventListener("click", saveNewHoliday);
}
async function saveNewHoliday() {
  const date = document.querySelector("#newHolidayDate")?.value || "";

  const name = document.querySelector("#newHolidayName")?.value.trim() || "";

  // 日期必填
  if (!date) {
    toast("請選擇休假日期");
    return;
  }

  // 名稱必填
  if (!name) {
    toast("請輸入休假日名稱");
    return;
  }

  // 前端先檢查同日期不能重複
  const exists = holidays.some((holiday) => holiday.date === date);

  if (exists) {
    toast("此日期已設定為休假日");
    return;
  }

  const saveButton = document.querySelector("#saveNewHoliday");

  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "新增中...";
  }
  showLoadingOverlay(`正在新增「${name}」...`);

  try {
    const response = await fetch(APP_CONFIG.ADMIN_API_URL, {
      method: "POST",

      body: JSON.stringify({
        action: "addHoliday",
        date,
        name,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "新增休假日失敗");
    }

    // 清除休假日快取
    holidaysLoaded = false;

    closeModal();

    await loadHolidays();

    // 關閉中央 Loading
    hideLoadingOverlay();

    render();

    toast("休假日新增完成");
  } catch (error) {
    hideLoadingOverlay();
    console.error("新增休假日失敗：", error);

    toast(error.message || "新增休假日失敗");

    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = "新增休假日";
    }
  }
}
async function loadWeeklyOrderSummary(targetDate) {
  const response = await fetch(APP_CONFIG.ADMIN_API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "getWeeklyOrderSummary",
      date: targetDate,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "讀取週訂單失敗");
  }

  return result;
}
async function loadNewcomerMeals() {
  const response = await fetch(APP_CONFIG.ADMIN_API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "getNewcomerMeals",
    }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "讀取新人用餐資料失敗");
  }

  return result;
}

async function testWeeklyOrderSummaryFrontend() {
  try {
    const result = await loadWeeklyOrderSummary("2026-08-17");

    console.log("週訂單前端讀取成功：", result);
  } catch (error) {
    console.error("週訂單前端讀取失敗：", error);
  }
}
async function loadNextWeekOrdersAndRender() {
  if (weeklyOrderSummaryLoaded) {
    render();
    return;
  }

  if (weeklyOrderSummaryLoading) {
    return;
  }

  weeklyOrderSummaryLoading = true;

  render();

  try {
    const targetDate = dashboardData.nextWeek.startDate;

    const result = await loadWeeklyOrderSummary(targetDate);

    weeklyOrderSummaryData = result;
    weeklyOrderSummaryLoaded = true;

    console.log("下週訂單資料讀取成功：", weeklyOrderSummaryData);
  } catch (error) {
    console.error("下週訂單資料讀取失敗：", error);

    weeklyOrderSummaryLoaded = false;
  } finally {
    weeklyOrderSummaryLoading = false;

    if (page === "orders" && orderTab === "next-week") {
      render();
    }
  }
}
async function loadDashboardWeeklyOrders() {
  // 已經有資料就不用重抓
  if (
    weeklyOrderSummaryLoaded &&
    weeklyOrderSummaryData &&
    Array.isArray(weeklyOrderSummaryData.data)
  ) {
    return;
  }

  // 避免重複請求
  if (weeklyOrderSummaryLoading) {
    return;
  }

  weeklyOrderSummaryLoading = true;

  try {
    const targetDate = dashboardData.nextWeek.startDate;

    const result = await loadWeeklyOrderSummary(targetDate);

    weeklyOrderSummaryData = result;

    weeklyOrderSummaryLoaded = true;

    console.log("首頁下週訂單資料讀取成功：", weeklyOrderSummaryData);
  } catch (error) {
    console.error("首頁下週訂單資料讀取失敗：", error);

    weeklyOrderSummaryLoaded = false;
  } finally {
    weeklyOrderSummaryLoading = false;

    // 如果人還在首頁，就重新畫首頁
    if (page === "dashboard") {
      render();
    }
  }
}
async function loadDashboardCurrentWeekOrders() {
  // 已經有本週資料就不用重抓
  if (
    currentWeekOrderSummaryLoaded &&
    currentWeekOrderSummaryData &&
    Array.isArray(currentWeekOrderSummaryData.data)
  ) {
    return;
  }

  // 避免重複請求
  if (currentWeekOrderSummaryLoading) {
    return;
  }

  currentWeekOrderSummaryLoading = true;

  try {
    const targetDate = dashboardData.currentWeek.startDate;

    const result = await loadWeeklyOrderSummary(targetDate);

    currentWeekOrderSummaryData = result;

    currentWeekOrderSummaryLoaded = true;

    console.log("首頁本週訂單資料讀取成功：", currentWeekOrderSummaryData);
  } catch (error) {
    console.error("首頁本週訂單資料讀取失敗：", error);

    currentWeekOrderSummaryLoaded = false;
  } finally {
    currentWeekOrderSummaryLoading = false;

    // 如果目前還在首頁
    // 本週資料回來後重新畫首頁
    if (page === "dashboard") {
      render();
    }
  }
}
async function loadDashboardNewcomerMeals() {
  // 已經載入過就不用重抓
  if (
    newcomerMealLoaded &&
    newcomerMealData &&
    Array.isArray(newcomerMealData.data)
  ) {
    return;
  }

  // 避免重複請求
  if (newcomerMealLoading) {
    return;
  }

  newcomerMealLoading = true;

  try {
    const result = await loadNewcomerMeals();

    newcomerMealData = result;

    newcomerMealLoaded = true;

    console.log("首頁新人用餐資料讀取成功：", newcomerMealData);
  } catch (error) {
    console.error("首頁新人用餐資料讀取失敗：", error);

    newcomerMealLoaded = false;
  } finally {
    newcomerMealLoading = false;

    // 如果目前還在首頁
    // 資料回來後重新畫首頁
    if (page === "dashboard") {
      render();
    }
  }
}