# 企業午餐訂餐系統 V7 Lock 測試版

## 測試帳號

- C5454 / KOOK：一般員工
- B001 / 林主管：主管
- C001 / 陳助理：助理

## 新增功能

- 每日 10:00 後整個員工端系統鎖定。
- 超過截止時間後無法掃 QRCode、驗證、建立或修改訂單。
- 已在填寫中的使用者，若時間超過 10:00，會自動切換到截止畫面。
- 助理端未來仍可查看 Summary 與下載報表。
- 測試時如需暫時解除鎖定，可在 app.js 將 TEST_FORCE_OPEN 改為 true。

## GitHub Pages 部署

將以下檔案放到 Repository 根目錄：

- index.html
- style.css
- app.js
- README.md
