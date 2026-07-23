const LANGUAGE_STORAGE_KEY = "lunchOrderLanguage";

const I18N = {
  "zh-TW": {
    systemTitle: "午餐訂餐系統",

    employeeId: "工號",
    employeeName: "姓名",
    department: "部門",
    role: "身分",
    generalEmployee: "一般員工",
    supervisor: "主管",
    assistant: "助理",
    enterEmployeeId: "請輸入工號",
    enterEmployeeName: "請輸入姓名",
    departmentLoaded: "已帶入部門",

    confirmUserTitle: "請確認您的使用者資料",
    firstUseTitle: "請輸入您的資料（首次使用）",

    savedUserDescription:
      "已自動帶入此裝置儲存的使用者資料，請確認後開始點餐。",

    firstUseDescription:
      "請輸入工號與姓名，系統會比對資料庫，確認相符後才可進入點餐。",

    query: "查詢",
    verifying: "驗證中...",
    verificationInProgress: "資料驗證中，請稍候...",
    verifySuccess: "驗證成功，歡迎使用。",
    enterEmployeeInfo: "請輸入工號與姓名。",

    startOrder: "開始點餐",
    rebuildUser: "重建使用者",

    checkingOrder: "正在確認下週訂單",
    checkingOrderDescription: "系統正在重新核對身分並查詢下週訂單...",

    existingOrder: "已有訂單",
    existingOrderDescription: "您下週已建立訂單",
    editOrderDescription: "可點擊下方按鈕修改",

    noExistingOrder: "下週尚未建立訂單",

    editOrder: "修改訂單",
    createOrder: "建立",
    back: "返回",
    retry: "重新查詢",

    queryFailed: "查詢失敗",
    connectionFailed: "無法連線至訂餐系統，請稍後再試。",

    noLunchNextWeek: "下週不訂便當",
    selectMealCondition: "選擇用餐條件",
    noLunchDescription: "勾選後不需選擇廠區及葷素",
    factorySelection: "廠區選擇",
    foodSelection: "餐點選擇",

    factory: "廠區",
    foodType: "葷素",

    factory1: "一廠",
    factory2: "二廠",
    factory3: "三廠",

    meat: "葷食",
    vegetarian: "素食",

    lunchBox: "便當",
    upstairs: "上樓用餐",
    noMeal: "不用餐",

    holiday: "休假",
    nationalHoliday: "國定假日",

    monday: "星期一",
    tuesday: "星期二",
    wednesday: "星期三",
    thursday: "星期四",
    friday: "星期五",

    previous: "上一步",
    next: "下一步",
    reviewOrder: "確認訂單",
    edit: "修改",
    submit: "確認送出",
    submitting: "送出中...",

    selectWeeklyMeals: "選擇一週用餐方式",
    weeklyMealDescription: "請依實際需求選擇每日用餐方式",

    dataProtection: "資料安全保護中",
    userInformation: "使用者資訊",
    weeklyMealMethod: "一週用餐方式",
    chooseDailyMeal: "請為每一天選擇用餐方式",
    editBeforeDeadline: "送出後，若需修改請於截止時間前完成",
    backToEdit: "返回修改",
    confirmContinue: "請確認是否繼續。",

    orderComplete: "訂單已完成",
    backHome: "回到首頁",

    orderSubmitted: "訂單已送出",
    thankYouOrder: "感謝您的訂餐！",
    submitTime: "送出時間",
    systemSubtitle: "Lunch Order System",

    processing: "處理中，請稍候...",
    checkingSystem: "正在確認系統開放狀態...",
    validatingUser: "正在驗證身分，請稍候...",
    recheckingUser: "正在重新核對使用者身分，請稍候...",
    loadingWorkDays: "正在讀取下週工作日資料...",
    sendingOrder: "正在送出訂單，請稍候...",

    retrying: "正在重新查詢，請稍候...",
    holidayLoadFailed: "無法取得下週工作日資料，請稍後再試。",
    conditionRequired: "請完整選擇廠區及葷素，或勾選「下週不訂便當」。",
    submitFailed: "訂單送出失敗。",
    scanQRCode: "請掃描部門 QR Code 進入系統。",

    confirm: "確認",
    cancel: "取消",
    clearLocalData: "清除本機資料",
    confirmClearLocalData: "確定要清除此裝置記憶的使用者資料嗎？",
    confirmClear: "確認清除",
    accountDisabled: "此帳號已停用，請聯絡管理員。",
    verifyFailed: "資料錯誤：工號或姓名不相符。",
    wrongDepartment: "您目前隸屬部門為【{dept}】，請掃描正確部門 QR Code。",
  },

  th: {
    systemTitle: "ระบบสั่งอาหารกลางวัน",

    employeeId: "รหัสพนักงาน",
    employeeName: "ชื่อ",
    department: "แผนก",
    role: "สถานะ",
    enterEmployeeId: "กรุณากรอกรหัสพนักงาน",
    enterEmployeeName: "กรุณากรอกชื่อ",
    departmentLoaded: "ได้นำข้อมูลแผนกมาแล้ว",

    confirmUserTitle: "โปรดยืนยันข้อมูลผู้ใช้งาน",
    firstUseTitle: "โปรดกรอกข้อมูลของคุณ (ใช้งานครั้งแรก)",

    savedUserDescription:
      "ระบบได้นำข้อมูลผู้ใช้งานที่บันทึกไว้ในอุปกรณ์นี้มาแสดง โปรดยืนยันก่อนเริ่มสั่งอาหาร",

    firstUseDescription:
      "โปรดกรอกรหัสพนักงานและชื่อ ระบบจะตรวจสอบกับฐานข้อมูลก่อนเข้าสู่หน้าสั่งอาหาร",

    query: "ค้นหา",
    verifying: "กำลังตรวจสอบ...",
    verificationInProgress: "กำลังตรวจสอบข้อมูล โปรดรอสักครู่...",
    verifySuccess: "ยืนยันข้อมูลสำเร็จ",
    enterEmployeeInfo: "โปรดกรอกรหัสพนักงานและชื่อ",

    startOrder: "เริ่มสั่งอาหาร",
    rebuildUser: "เปลี่ยนผู้ใช้งาน",

    checkingOrder: "กำลังตรวจสอบรายการสั่งอาหารสัปดาห์หน้า",
    checkingOrderDescription:
      "ระบบกำลังตรวจสอบตัวตนและค้นหารายการสั่งอาหารสัปดาห์หน้า...",

    existingOrder: "มีรายการสั่งอาหารแล้ว",
    existingOrderDescription: "คุณได้สร้างรายการสั่งอาหารสำหรับสัปดาห์หน้าแล้ว",
    editOrderDescription: "สามารถกดปุ่มด้านล่างเพื่อแก้ไขได้",

    noExistingOrder: "ยังไม่มีรายการสั่งอาหารสำหรับสัปดาห์หน้า",

    editOrder: "แก้ไขรายการ",
    createOrder: "สร้างรายการ",
    back: "ย้อนกลับ",
    retry: "ค้นหาอีกครั้ง",

    queryFailed: "ค้นหาไม่สำเร็จ",
    connectionFailed:
      "ไม่สามารถเชื่อมต่อระบบสั่งอาหารได้ โปรดลองอีกครั้งภายหลัง",

    noLunchNextWeek: "ไม่สั่งข้าวกล่องในสัปดาห์หน้า",
    factory: "โรงงาน",
    foodType: "ประเภทอาหาร",
    selectMealCondition: "เลือกเงื่อนไขการรับประทานอาหาร",
    noLunchDescription: "เมื่อเลือกแล้ว ไม่จำเป็นต้องเลือกโรงงานและประเภทอาหาร",
    factorySelection: "เลือกโรงงาน",
    foodSelection: "เลือกประเภทอาหาร",

    factory1: "โรงงาน 1",
    factory2: "โรงงาน 2",
    factory3: "โรงงาน 3",

    meat: "อาหารทั่วไป",
    vegetarian: "อาหารมังสวิรัติ",

    lunchBox: "ข้าวกล่อง",
    upstairs: "รับประทานอาหารชั้นบน",
    noMeal: "ไม่รับประทานอาหาร",

    holiday: "วันหยุด",
    nationalHoliday: "วันหยุดราชการ",

    monday: "วันจันทร์",
    tuesday: "วันอังคาร",
    wednesday: "วันพุธ",
    thursday: "วันพฤหัสบดี",
    friday: "วันศุกร์",

    previous: "ย้อนกลับ",
    next: "ถัดไป",
    reviewOrder: "ตรวจสอบรายการ",
    edit: "แก้ไข",
    submit: "ยืนยันและส่ง",
    submitting: "กำลังส่ง...",
    selectWeeklyMeals: "เลือกรูปแบบการรับประทานอาหารประจำสัปดาห์",
    weeklyMealDescription:
      "โปรดเลือกรูปแบบการรับประทานอาหารในแต่ละวันตามความต้องการ",

    dataProtection: "กำลังปกป้องข้อมูลของคุณ",
    userInformation: "ข้อมูลผู้ใช้งาน",
    weeklyMealMethod: "รูปแบบการรับประทานอาหารประจำสัปดาห์",
    chooseDailyMeal: "โปรดเลือกรูปแบบการรับประทานอาหารในแต่ละวัน",
    editBeforeDeadline:
      "หลังจากส่งแล้ว หากต้องการแก้ไข โปรดดำเนินการก่อนเวลาปิดรับ",
    backToEdit: "กลับไปแก้ไข",
    confirmContinue: "โปรดยืนยันว่าต้องการดำเนินการต่อ",

    orderComplete: "สั่งอาหารสำเร็จ",
    backHome: "กลับหน้าหลัก",

    orderSubmitted: "ส่งคำสั่งซื้อเรียบร้อยแล้ว",
    thankYouOrder: "ขอบคุณสำหรับการสั่งอาหาร",
    submitTime: "เวลาที่ส่ง",
    systemSubtitle: "ระบบสั่งอาหารกลางวัน",

    processing: "กำลังดำเนินการ โปรดรอสักครู่...",
    checkingSystem: "กำลังตรวจสอบสถานะระบบ...",
    validatingUser: "กำลังตรวจสอบตัวตน โปรดรอสักครู่...",
    recheckingUser: "กำลังตรวจสอบข้อมูลผู้ใช้อีกครั้ง...",
    loadingWorkDays: "กำลังโหลดวันทำงานของสัปดาห์หน้า...",
    sendingOrder: "กำลังส่งรายการสั่งอาหาร...",

    retrying: "กำลังค้นหาอีกครั้ง โปรดรอสักครู่...",
    holidayLoadFailed:
      "ไม่สามารถโหลดข้อมูลวันทำงานของสัปดาห์หน้าได้ โปรดลองอีกครั้ง",
    conditionRequired:
      "โปรดเลือกโรงงานและประเภทอาหารให้ครบ หรือเลือกไม่สั่งข้าวกล่องในสัปดาห์หน้า",
    submitFailed: "ส่งรายการสั่งอาหารไม่สำเร็จ",
    scanQRCode: "กรุณาสแกน QR Code ของแผนกเพื่อเข้าสู่ระบบ",

    confirm: "ยืนยัน",
    cancel: "ยกเลิก",
    clearLocalData: "ล้างข้อมูลในอุปกรณ์",
    confirmClearLocalData:
      "ต้องการล้างข้อมูลผู้ใช้งานที่บันทึกไว้ในอุปกรณ์นี้หรือไม่",
    confirmClear: "ยืนยันการล้างข้อมูล",
    accountDisabled: "บัญชีนี้ถูกระงับการใช้งาน โปรดติดต่อผู้ดูแลระบบ",

    verifyFailed: "ข้อมูลไม่ถูกต้อง: รหัสพนักงานหรือชื่อไม่ตรงกัน",

    wrongDepartment:
      "คุณสังกัดแผนก【{dept}】 โปรดสแกน QR Code ของแผนกที่ถูกต้อง",
  },

  vi: {
    systemTitle: "Hệ thống đặt cơm trưa",

    employeeId: "Mã nhân viên",
    employeeName: "Họ và tên",
    department: "Bộ phận",
    role: "Vai trò",
    enterEmployeeId: "Vui lòng nhập mã nhân viên",
    enterEmployeeName: "Vui lòng nhập họ và tên",
    departmentLoaded: "Đã tự động nhập bộ phận",

    confirmUserTitle: "Vui lòng xác nhận thông tin người dùng",
    firstUseTitle: "Vui lòng nhập thông tin (lần đầu sử dụng)",

    savedUserDescription:
      "Thông tin người dùng đã lưu trên thiết bị này được tự động điền. Vui lòng xác nhận trước khi đặt món.",

    firstUseDescription:
      "Vui lòng nhập mã nhân viên và họ tên. Hệ thống sẽ đối chiếu dữ liệu trước khi cho phép đặt món.",

    query: "Tra cứu",
    verifying: "Đang xác minh...",
    verificationInProgress: "Đang xác minh dữ liệu, vui lòng chờ...",
    verifySuccess: "Xác minh thành công.",
    enterEmployeeInfo: "Vui lòng nhập mã nhân viên và họ tên.",

    startOrder: "Bắt đầu đặt món",
    rebuildUser: "Đổi người dùng",

    checkingOrder: "Đang kiểm tra đơn hàng tuần sau",
    checkingOrderDescription:
      "Hệ thống đang xác minh lại thông tin và tìm đơn hàng tuần sau...",

    existingOrder: "Đã có đơn hàng",
    existingOrderDescription: "Bạn đã tạo đơn hàng cho tuần sau",
    editOrderDescription: "Có thể nhấn nút bên dưới để chỉnh sửa",

    noExistingOrder: "Chưa có đơn hàng cho tuần sau",

    editOrder: "Chỉnh sửa đơn",
    createOrder: "Tạo đơn",
    back: "Quay lại",
    retry: "Tra cứu lại",

    queryFailed: "Tra cứu thất bại",
    connectionFailed:
      "Không thể kết nối với hệ thống đặt cơm. Vui lòng thử lại sau.",

    noLunchNextWeek: "Không đặt cơm hộp tuần sau",
    factory: "Nhà máy",
    foodType: "Loại suất ăn",
    selectMealCondition: "Chọn điều kiện dùng bữa",
    noLunchDescription: "Sau khi chọn, không cần chọn nhà máy và loại suất ăn",
    factorySelection: "Chọn nhà máy",
    foodSelection: "Chọn loại suất ăn",

    factory1: "Nhà máy 1",
    factory2: "Nhà máy 2",
    factory3: "Nhà máy 3",

    meat: "Suất ăn thường",
    vegetarian: "Suất ăn chay",

    lunchBox: "Cơm hộp",
    upstairs: "Ăn tại tầng trên",
    noMeal: "Không dùng bữa",

    holiday: "Ngày nghỉ",
    nationalHoliday: "Ngày nghỉ lễ",

    monday: "Thứ Hai",
    tuesday: "Thứ Ba",
    wednesday: "Thứ Tư",
    thursday: "Thứ Năm",
    friday: "Thứ Sáu",

    previous: "Quay lại",
    next: "Tiếp theo",
    reviewOrder: "Kiểm tra đơn",
    edit: "Chỉnh sửa",
    submit: "Xác nhận gửi",
    submitting: "Đang gửi...",
    selectWeeklyMeals: "Chọn hình thức dùng bữa trong tuần",
    weeklyMealDescription:
      "Vui lòng chọn hình thức dùng bữa mỗi ngày theo nhu cầu thực tế",

    dataProtection: "Dữ liệu đang được bảo vệ",
    userInformation: "Thông tin người dùng",
    weeklyMealMethod: "Hình thức dùng bữa trong tuần",
    chooseDailyMeal: "Vui lòng chọn hình thức dùng bữa cho từng ngày",
    editBeforeDeadline:
      "Sau khi gửi, nếu cần chỉnh sửa vui lòng hoàn tất trước thời hạn",
    backToEdit: "Quay lại chỉnh sửa",
    confirmContinue: "Vui lòng xác nhận để tiếp tục.",

    orderComplete: "Đặt món thành công",
    backHome: "Về trang chính",

    orderSubmitted: "Đã gửi đơn đặt món",
    thankYouOrder: "Cảm ơn bạn đã đặt suất ăn!",
    submitTime: "Thời gian gửi",
    systemSubtitle: "Hệ thống đặt suất ăn trưa",

    processing: "Đang xử lý, vui lòng chờ...",
    checkingSystem: "Đang kiểm tra trạng thái hệ thống...",
    validatingUser: "Đang xác minh danh tính...",
    recheckingUser: "Đang kiểm tra lại thông tin người dùng...",
    loadingWorkDays: "Đang tải ngày làm việc tuần sau...",
    sendingOrder: "Đang gửi đơn đặt món...",

    retrying: "Đang tra cứu lại, vui lòng chờ...",
    holidayLoadFailed:
      "Không thể tải dữ liệu ngày làm việc của tuần sau. Vui lòng thử lại sau.",
    conditionRequired:
      "Vui lòng chọn đầy đủ nhà máy và loại suất ăn hoặc chọn không đặt cơm hộp tuần sau.",
    submitFailed: "Gửi đơn đặt món thất bại.",
    scanQRCode: "Vui lòng quét mã QR của bộ phận để vào hệ thống.",

    confirm: "Xác nhận",
    cancel: "Hủy",
    clearLocalData: "Xóa dữ liệu trên thiết bị",
    confirmClearLocalData:
      "Bạn có chắc muốn xóa thông tin người dùng đã lưu trên thiết bị này không?",
    confirmClear: "Xác nhận xóa",
    accountDisabled:
      "Tài khoản này đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",

    verifyFailed: "Thông tin không đúng: Mã nhân viên hoặc họ tên không khớp.",

    wrongDepartment:
      "Bạn thuộc bộ phận【{dept}】. Vui lòng quét đúng mã QR của bộ phận.",
  },
};

let currentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "zh-TW";

function t(key) {
  return I18N[currentLanguage]?.[key] || I18N["zh-TW"]?.[key] || key;
}

function getCurrentLocale() {
  const localeMap = {
    "zh-TW": "zh-TW",
    th: "th-TH",
    vi: "vi-VN",
  };

  return localeMap[currentLanguage] || "zh-TW";
}

function applyLanguage(root = document) {
  document.documentElement.lang = currentLanguage;

  root.querySelectorAll("[data-i18n]").forEach(function (element) {
    const key = element.dataset.i18n;

    element.textContent = t(key);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
    const key = element.dataset.i18nPlaceholder;

    element.placeholder = t(key);
  });

  root.querySelectorAll("[data-i18n-title]").forEach(function (element) {
    const key = element.dataset.i18nTitle;

    element.title = t(key);
  });

  document.querySelectorAll("[data-language]").forEach(function (button) {
    button.classList.toggle(
      "active",
      button.dataset.language === currentLanguage,
    );
  });
}

function setLanguage(language) {
  if (!I18N[language]) {
    return;
  }

  currentLanguage = language;

  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

  applyLanguage();

  if (typeof updateHeader === "function") {
    updateHeader();
  }

  if (typeof refreshDynamicTranslations === "function") {
    refreshDynamicTranslations();
  }
}

const DEPARTMENT_TRANSLATIONS = {
  燃料電池生產部: {
    "zh-TW": "燃料電池生產部",
    th: "ฝ่ายผลิตเซลล์เชื้อเพลิง",
    vi: "Bộ phận sản xuất pin nhiên liệu",
  },
  燃電製一部: {
    "zh-TW": "燃電製一部",
    th: "ฝ่ายผลิตเซลล์เชื้อเพลิง 1",
    vi: "Bộ phận sản xuất pin nhiên liệu 1",
  },

  燃電製二部: {
    "zh-TW": "燃電製二部",
    th: "ฝ่ายผลิตเซลล์เชื้อเพลิง 2",
    vi: "Bộ phận sản xuất pin nhiên liệu 2",
  },

  燃電製三部: {
    "zh-TW": "燃電製三部",
    th: "ฝ่ายผลิตเซลล์เชื้อเพลิง 3",
    vi: "Bộ phận sản xuất pin nhiên liệu 3",
  },
};
const ROLE_TRANSLATIONS = {
  副總: {
    "zh-TW": "副總",
    th: "รองผู้จัดการทั่วไป",
    vi: "Phó tổng giám đốc",
  },

  經理: {
    "zh-TW": "經理",
    th: "ผู้จัดการ",
    vi: "Quản lý",
  },

  課長: {
    "zh-TW": "課長",
    th: "หัวหน้าแผนก",
    vi: "Trưởng bộ phận",
  },

  組長: {
    "zh-TW": "組長",
    th: "หัวหน้ากลุ่ม",
    vi: "Trưởng nhóm",
  },

  員工: {
    "zh-TW": "員工",
    th: "พนักงาน",
    vi: "Nhân viên",
  },
};
function translateRole(role) {
  const value = String(role || "").trim();

  const item = ROLE_TRANSLATIONS[value];

  if (!item) {
    return value;
  }

  return item[currentLanguage] || item["zh-TW"] || value;
}
function translateDepartment(dept) {
  const item = DEPARTMENT_TRANSLATIONS[dept];

  if (!item) {
    return dept;
  }

  return item[currentLanguage] || item["zh-TW"];
}
function initLanguage() {
  if (!I18N[currentLanguage]) {
    currentLanguage = "zh-TW";
  }

  document.querySelectorAll("[data-language]").forEach(function (button) {
    button.addEventListener("click", function () {
      setLanguage(button.dataset.language);
    });
  });

  applyLanguage();
}
