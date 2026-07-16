function todayKey() {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function weekKey() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);

  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

function getThisWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  const weekNames = ["星期一", "星期二", "星期三", "星期四", "星期五"];

  const shortDays = ["一", "二", "三", "四", "五"];
  const keys = ["mon", "tue", "wed", "thu", "fri"];

  return weekNames.map((weekName, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);

    return {
      key: keys[index],
      day: weekName,
      shortDay: shortDays[index],
      date: `${d.getMonth() + 1}月${d.getDate()}日`,
      reviewDate: `${d.getMonth() + 1}/${d.getDate()}`,
    };
  });
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
