# 企業午餐訂餐系統 V8 Fixed2 測試版

## 本版修正

- 將所有 `.addEventListener` 改成安全綁定 `on(...)`。
- 若某個按鈕不存在，不會造成整個系統中斷。
- `config.js` 預設為 `MODE: "TEST"`。

## 系統模式

開啟 `config.js` 修改：

```js
const APP_CONFIG = {
  MODE: "TEST",
  DEADLINE_HOUR: 10,
  DEADLINE_MINUTE: 0
};
```

- `TEST`：永遠開放，方便測試。
- `AUTO`：每日 10:00 後自動鎖定。
- `CLOSE`：強制關閉。

## 測試帳號

- C5454 / KOOK：一般員工
- B001 / 林主管：主管
- C001 / 陳助理：助理


## V8 Review UI

- 優化訂單總覽確認頁面。
- 新增葷食、素食、外賓、合計摘要卡片。
- 使用者資訊與訂餐資訊改為企業系統卡片式排版。


## Fixed

- 修正下一步總覽訂單時 `reviewSummary` 缺少造成的錯誤。
- 新增 `setHTML()` 安全寫入，避免某個區塊不存在造成系統中斷。
