# 企業午餐訂餐系統 V8 測試版

## 系統模式

請開啟 `config.js` 修改：

```js
const APP_CONFIG = {
  MODE: "TEST",
  DEADLINE_HOUR: 10,
  DEADLINE_MINUTE: 0
};
```

### MODE 說明

- `TEST`：永遠開放，方便測試，不受星期幾與時間影響。
- `AUTO`：每日 10:00 後自動鎖定。
- `CLOSE`：強制關閉，一進入就顯示未開放訂餐。

## 測試帳號

- C5454 / KOOK：一般員工
- B001 / 林主管：主管
- C001 / 陳助理：助理

## 部署 GitHub Pages

將下列檔案放在 Repository 根目錄：

- index.html
- style.css
- config.js
- app.js
- README.md
