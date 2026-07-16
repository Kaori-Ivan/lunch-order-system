const WEEKDAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];

function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentWorkWeek() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekday = today.getDay();

  // 星期日視為上一周結束，因此往前六天取得星期一
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      date: toLocalDateKey(date),
      meat: 0,
      veg: 0,
      guest: 0,
    };
  });
}

function renderWeeklySummary(rows) {
  const tbody = document.getElementById("weeklySummaryBody");

  if (!tbody) {
    return;
  }

  const todayKey = toLocalDateKey(new Date());

  tbody.innerHTML = rows
    .map((item) => {
      const date = new Date(`${item.date}T00:00:00`);

      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const weekday = WEEKDAY_NAMES[date.getDay()];

      const meat = Number(item.meat) || 0;
      const veg = Number(item.veg) || 0;
      const guest = Number(item.guest) || 0;

      const total = meat + veg;
      const isToday = item.date === todayKey;

      return `
        <tr class="${isToday ? "is-today" : ""}">
          <td>
            <div class="weekly-date-cell">
              ${isToday ? `<span class="today-badge">今天</span>` : ""}

              <span class="weekly-date-text">
                ${month}/${day}（${weekday}）
              </span>

              ${isToday ? `<span class="today-sun">☀</span>` : ""}
            </div>
          </td>

         <td>

<div class="weekly-total-box">

    <span class="weekly-total-number">
        ${total}
    </span>

    <span class="weekly-unit">
        份
    </span>

</div>

</td>

          <td>

<div class="weekly-meat-box">

<span class="weekly-meat-number">
    ${meat}
</span>

<span class="weekly-unit">
    份
</span>

</div>

</td>
         <td>

<div class="weekly-veg-box">

<span class="weekly-veg-number">
    ${veg}
</span>

<span class="weekly-unit">
    份
</span>

</div>

</td>

          <td>
            <span class="weekly-guest-pill">
              👥 ${guest} 人
            </span>
          </td>
        </tr>
      `;
    })
    .join("");
}

function setWeeklySummaryData(data) {
  const workWeek = getCurrentWorkWeek();

  const dataMap = new Map(data.map((item) => [item.date, item]));

  const mergedData = workWeek.map((day) => {
    return {
      ...day,
      ...(dataMap.get(day.date) || {}),
    };
  });

  window.weeklySummaryRows = mergedData;

  renderWeeklySummary(mergedData);
}

function exportWeeklyExcel() {
  const rows = window.weeklySummaryRows || getCurrentWorkWeek();

  const bodyRows = rows
    .map((item) => {
      const meat = Number(item.meat) || 0;
      const veg = Number(item.veg) || 0;
      const guest = Number(item.guest) || 0;

      return `
        <tr>
          <td>${item.date}</td>
          <td>${meat + veg}</td>
          <td>${meat}</td>
          <td>${veg}</td>
          <td>${guest}</td>
        </tr>
      `;
    })
    .join("");

  const excelContent = `
    <html>
      <head>
        <meta charset="UTF-8">
      </head>

      <body>
        <table border="1">
          <thead>
            <tr>
              <th>日期</th>
              <th>便當總份數</th>
              <th>葷食份數</th>
              <th>素食份數</th>
              <th>外賓人數</th>
            </tr>
          </thead>

          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", excelContent], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `本周送餐名單_${toLocalDateKey(new Date())}.xls`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", () => {
  setWeeklySummaryData([
    {
      date: "2026-07-13",
      meat: 72,
      veg: 26,
      guest: 3,
    },
    {
      date: "2026-07-14",
      meat: 75,
      veg: 27,
      guest: 2,
    },
    {
      date: "2026-07-15",
      meat: 79,
      veg: 27,
      guest: 1,
    },
    {
      date: "2026-07-16",
      meat: 77,
      veg: 24,
      guest: 4,
    },
    {
      date: "2026-07-17",
      meat: 65,
      veg: 29,
      guest: 5,
    },
  ]);
});
