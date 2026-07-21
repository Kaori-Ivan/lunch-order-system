function todayKey() {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 取得目前後端指定的訂餐週次。
 *
 * 正常情況由 getSystemStatus API 提供。
 */
function weekKey() {
  if (
    window.lunchTargetWeekKey
  ) {
    return window.lunchTargetWeekKey;
  }

  // API 尚未完成時的備用計算：
  // 取得下週星期一
  const today = new Date();
  const day = today.getDay();

  const diffToMonday =
    day === 0
      ? -6
      : 1 - day;

  const nextMonday =
    new Date(today);

  nextMonday.setDate(
    today.getDate() +
    diffToMonday +
    7
  );

  return [
    nextMonday.getFullYear(),
    String(
      nextMonday.getMonth() + 1
    ).padStart(2, "0"),
    String(
      nextMonday.getDate()
    ).padStart(2, "0"),
  ].join("-");
}


/**
 * 根據目標週 weekKey，
 * 建立星期一到星期五日期。
 */
function getThisWeekDates() {
  const targetWeekKey =
    weekKey();

  const parts =
    targetWeekKey.split("-");

  const monday = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );

  const weekNames = [
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五"
  ];

  const shortDays = [
    "一",
    "二",
    "三",
    "四",
    "五"
  ];

  const keys = [
    "mon",
    "tue",
    "wed",
    "thu",
    "fri"
  ];

  return weekNames.map(
    function (weekName, index) {
      const date =
        new Date(monday);

      date.setDate(
        monday.getDate() +
        index
      );

      const dateKey = [
        date.getFullYear(),
        String(
          date.getMonth() + 1
        ).padStart(2, "0"),
        String(
          date.getDate()
        ).padStart(2, "0"),
      ].join("-");

      return {
        key: keys[index],
        day: weekName,
        shortDay: shortDays[index],

        date:
          (date.getMonth() + 1) +
          "月" +
          date.getDate() +
          "日",

        reviewDate:
          (date.getMonth() + 1) +
          "/" +
          date.getDate(),

        dateKey: dateKey
      };
    }
  );
}

function maskName(name) {
  if (!name) return "";

  if (name.length <= 2) {
    return name[0] + "○";
  }

  return name[0] + "○" + name[name.length - 1];
}

function encodeName(name) {
  return btoa(unescape(encodeURIComponent(name)));
}
