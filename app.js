const STORAGE_USER="lunch_user_profile_test_v11";
const STORAGE_ORDERS="lunch_orders_test_v11";
const MOCK_USERS=[
  {userId:"U0001",empId:"C5454",name:"KOOK",dept:"燃料電池生產部",group:"A組",role:"一般員工",enabled:true},
  {userId:"U0002",empId:"B001",name:"林主管",dept:"工程部",group:"A組",role:"主管",enabled:true},
  {userId:"U0003",empId:"C001",name:"陳助理",dept:"品保部",group:"A組",role:"助理",enabled:true}
];
const state = {
  step: "scan",
  dept: "",
  group: "",
  user: null,
  existingOrder: null,
  pendingOrder: null,
  isSubmitting: false,
  isBusy: false
};
const $=id=>document.getElementById(id);
function on(id,event,handler){const el=$(id);if(el)el.addEventListener(event,handler);}
function setHTML(id,html){const el=$(id);if(el)el.innerHTML=html;}
function setText(id,text){const el=$(id);if(el)el.textContent=text;}
function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function isSystemClosed(){if(APP_CONFIG.MODE==="TEST")return false;if(APP_CONFIG.MODE==="CLOSE")return true;const n=new Date(),d=new Date();d.setHours(APP_CONFIG.DEADLINE_HOUR,APP_CONFIG.DEADLINE_MINUTE,0,0);return n>=d;}
function updateHeader(){setText("todayText",new Date().toLocaleDateString("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",weekday:"long"}));setText("systemStatusText",APP_CONFIG.MODE==="TEST"?"測試模式：系統開放中":isSystemClosed()?"今日訂餐已截止":"截止時間：10:00");}
function showPage(page){state.step=page;["closed","scan","verify","check","order","review","done"].forEach(n=>{const el=$("page-"+n);if(el)el.classList.toggle("hidden",n!==page);});document.querySelectorAll(".step").forEach(s=>s.classList.toggle("active",s.dataset.step===page));hideAlert();}
function guardOpen(){if(!isSystemClosed())return true;showPage("closed");return false;}
function showAlert(message){const b=$("alertBox");if(!b)return;b.textContent=message;b.classList.remove("hidden");}
function hideAlert(){const b=$("alertBox");if(!b)return;b.textContent="";b.classList.add("hidden");}
function notice(id,type,msg){setHTML(id,`<div class="notice ${type}">${msg}</div>`);}
function clearNotice(id){setHTML(id,"");}
function row(label,value){return `<div class="row"><span>${label}</span><strong>${value??""}</strong></div>`;}
function profileHTML(u){return [row("工號",u.empId),row("姓名",u.name),row("部門",u.dept),row("組別",u.group),row("身分",u.role)].join("");}
function maskName(n){if(!n)return"";if(n.length<=2)return n[0]+"○";return n[0]+"○"+n[n.length-1];}
function encodeName(n){return btoa(unescape(encodeURIComponent(n)));}
function getOrders(){try{return JSON.parse(localStorage.getItem(STORAGE_ORDERS)||"{}");}catch{return {};}}
function saveOrders(o){localStorage.setItem(STORAGE_ORDERS,JSON.stringify(o));}
function saveUser(u){const safe={userId:u.userId,empId:u.empId,name:u.name,nameMasked:u.nameMasked,nameEncoded:u.nameEncoded,role:u.role};localStorage.setItem(STORAGE_USER,JSON.stringify(safe));}
function getSavedUser(){try{return JSON.parse(localStorage.getItem(STORAGE_USER)||"null");}catch{return null;}}
function clearSavedUser(){localStorage.removeItem(STORAGE_USER);}
function mockApi(p){return new Promise(resolve=>setTimeout(()=>{if(p.action==="verifyUser"){const u=MOCK_USERS.find(x=>x.empId===p.empId&&x.name===p.name&&x.enabled);if(!u){resolve({success:false,message:"資料錯誤：工號或姓名不相符。"});return;}if(u.dept!==p.dept||u.group!==p.group){resolve({success:false,message:`您目前隸屬於「${u.dept}／${u.group}」，但目前掃描的是「${p.dept}／${p.group}」。請掃描正確的部門 QR Code。`});return;}resolve({success:true,message:"驗證成功",user:u});return;}if(p.action==="getOrder"){const u=MOCK_USERS.find(x=>x.empId===p.empId&&x.name===p.name);const key=`${todayKey()}_${u?.userId}`;const order=getOrders()[key]||null;resolve({success:true,hasOrder:!!order,order});return;}if(p.action==="saveOrder"){const u=MOCK_USERS.find(x=>x.empId===p.empId&&x.name===p.name);const order={date:todayKey(),userId:u.userId,empId:u.empId,name:u.name,dept:u.dept,group:u.group,role:u.role,meatQty:Number(p.meatQty||0),vegQty:Number(p.vegQty||0),guestQty:Number(p.guestQty||0),updatedAt:new Date().toLocaleString("zh-TW")};const orders=getOrders();orders[`${todayKey()}_${u.userId}`]=order;saveOrders(orders);resolve({success:true,message:"訂單已儲存",order});return;}resolve({success:false,message:"未知的 action"});},300));}
async function apiPost(payload){if(APP_CONFIG.USE_MOCK_API)return mockApi(payload);const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),APP_CONFIG.API_TIMEOUT_MS||30000);try{const res=await fetch(APP_CONFIG.API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload),signal:controller.signal});return await res.json();}finally{clearTimeout(timeout);}}
function setButtonLoading(id,text,on){const btn=$(id);if(!btn)return;if(on){btn.dataset.originalText=btn.textContent;btn.textContent=text;btn.disabled=true;}else{btn.textContent=btn.dataset.originalText||btn.textContent;btn.disabled=false;}}
function scanQRCode(){if(!guardOpen())return;state.dept=String($("deptSelect")?.value||"").trim();state.group=String($("groupSelect")?.value||"").trim();if(!state.dept||!state.group){showAlert("未取得部門或組別，請重新掃描 QR Code。");showPage("scan");return;}$("deptReadonly").value=state.dept;$("groupReadonly").value=state.group;clearNotice("verifyNotice");const saved=getSavedUser();if(saved){state.user={...saved,dept:state.dept,group:state.group};$("verifyForm").classList.add("hidden");$("savedUserBox").classList.remove("hidden");setHTML("savedUserBox",profileHTML(state.user));setText("verifyDesc","系統已讀取此裝置上次使用者資料，請確認是否正確。");setHTML("verifyActions",`<button class="btn primary" id="btnStartSaved">確認並開始點餐</button><button class="btn secondary" id="btnWrongSaved">資料錯誤，重新輸入</button>`);on("btnStartSaved","click",confirmProfile);on("btnWrongSaved","click",resetVerify);}else{showVerifyForm();}showPage("verify");}
function showVerifyForm(){$("verifyForm").classList.remove("hidden");$("savedUserBox").classList.add("hidden");setText("verifyDesc","請輸入工號與姓名，系統會比對資料庫，確認相符後才可進入點餐。");setHTML("verifyActions",`<button class="btn primary" id="btnVerify">查詢</button><button class="btn ghost" id="btnBackToScan">返回</button>`);on("btnVerify","click",verifyEmployee);on("btnBackToScan","click",()=>showPage("scan"));}
function resetVerify(){clearSavedUser();state.user=null;$("empId").value="";$("empName").value="";clearNotice("verifyNotice");showVerifyForm();}
async function verifyEmployee(){if(!guardOpen())return;const empId=$("empId").value.trim(),empName=$("empName").value.trim();if(!empId||!empName){notice("verifyNotice","danger","請輸入工號與姓名。");return;}setButtonLoading("btnVerify","驗證中...",true);notice("verifyNotice","info","資料驗證中，請稍候...");try{const result=await apiPost({action:"verifyUser",empId,name:empName,dept:state.dept,group:state.group});if(!result.success){notice("verifyNotice","danger",result.message||"資料錯誤：工號或姓名不相符。")if (result.user.dept !== state.dept || result.user.group !== state.group) {
  notice(
    "verifyNotice",
    "danger",
    `您目前隸屬於「${result.user.dept}／${result.user.group}」，但目前掃描的是「${state.dept}／${state.group}」。請掃描正確的部門 QR Code。`
  );
  clearSavedUser();
  return;
};return;}const u=result.user;state.user={userId:u.userId,empId:u.empId,name:u.name,nameMasked:maskName(u.name),nameEncoded:encodeName(u.name),dept:u.dept,group:u.group,role:u.role};saveUser(state.user);$("verifyForm").classList.add("hidden");$("savedUserBox").classList.remove("hidden");setHTML("savedUserBox",profileHTML(state.user));notice("verifyNotice","success","驗證成功，已自動帶入身分："+state.user.role+"。");setHTML("verifyActions",`<button class="btn primary" id="btnConfirmProfile">確認並開始點餐</button><button class="btn secondary" id="btnWrongProfile">資料錯誤，重新輸入</button>`);on("btnConfirmProfile","click",confirmProfile);on("btnWrongProfile","click",resetVerify);}catch(e){console.error(e);notice("verifyNotice","danger","無法連線至訂餐系統伺服器，請稍後再試。");}finally{setButtonLoading("btnVerify","查詢",false);}}
async function confirmProfile() {
  console.log("confirmProfile 被呼叫");
  if (state.isBusy) return;
  if (!guardOpen()) return;

  if (!state.dept || !state.group) {
    showAlert("未取得部門或組別，請回到主畫面重新掃描 QR Code。");
    showPage("scan");
    return;
  }

  state.isBusy = true;
  showAlert("正在確認使用者與部門資料，請稍候...");

  try {
    const result = await apiPost({
      action: "verifyUser",
      empId: state.user.empId,
      name: state.user.name,
      dept: state.dept,
      group: state.group
    });

    if (!result.success) {
      clearSavedUser();
      state.user = null;

      setHTML("savedUserBox", "");
      $("savedUserBox").classList.add("hidden");
      $("verifyForm").classList.remove("hidden");

      notice("verifyNotice", "danger", result.message || "使用者資料與目前部門不相符，請重新輸入。");

      showVerifyForm();
      showPage("verify");
      return;
    }

    await checkTodayOrder();
    showPage("check");

  } finally {
    state.isBusy = false;
    hideAlert();
  }
}
async function checkTodayOrder(){if(!state.user)return;setHTML("checkBox",profileHTML(state.user));setHTML("checkActions","");try{const result=await apiPost({action:"getOrder",empId:state.user.empId,name:state.user.name,dept:state.dept,group:state.group});state.existingOrder=result.hasOrder?result.order:null;if(result.hasOrder){const old=result.order;setHTML("checkBox",profileHTML(state.user)+`<div class="notice warning">今日已有訂單：葷 ${old.meatQty}、素 ${old.vegQty}、外賓 ${old.guestQty}。修改後會覆蓋原資料。</div>`);setHTML("checkActions",`<button class="btn primary" id="btnEditOrder">修改今日訂單</button><button class="btn ghost" id="btnBackVerify">返回</button>`);on("btnEditOrder", "click", () => {lockButton("btnEditOrder", "載入中...");startOrder(true);});}else{setHTML("checkBox",profileHTML(state.user)+`<div class="notice success">今日尚未建立訂單，可建立新訂單。</div>`);setHTML("checkActions",`<button class="btn primary" id="btnNewOrder">建立新訂單</button><button class="btn ghost" id="btnBackVerify">返回</button>`);on("btnNewOrder", "click", () => {lockButton("btnNewOrder", "載入中...");startOrder(false);});}on("btnBackVerify","click",()=>showPage("verify"));}catch(e){console.error(e);setHTML("checkBox",profileHTML(state.user)+`<div class="notice danger">無法連線至訂餐系統伺服器，請稍後再試。</div>`);}}
function getLimit(){return state.user.role==="主管"||state.user.role==="助理"?5:1;}
function startOrder(isEdit){if(!guardOpen())return;const old=state.existingOrder,limit=getLimit();setText("orderTitle",isEdit?"修改今日訂單":"建立新訂單");setHTML("ruleBox",`目前身分：${state.user.role}｜警戒值：${limit}<br>葷食 + 素食至少 1 份，且不可超過警戒值。一般員工不可填寫外賓。`);$("meatQty").value=old?old.meatQty:0;$("vegQty").value=old?old.vegQty:0;$("guestQty").value=old?old.guestQty:0;$("guestQty").disabled=state.user.role==="一般員工";if($("guestQty").disabled)$("guestQty").value=0;validateOrder();showPage("order");}
function num(id){return Math.max(0,Number($(id).value||0));}
function validateOrder(){const meat=num("meatQty"),veg=num("vegQty"),guest=num("guestQty"),limit=getLimit();if(meat+veg<1){notice("orderNotice","danger","葷食 + 素食至少需要填寫 1 份。");return false;}if(meat+veg>limit){notice("orderNotice","danger",`葷食 + 素食不可超過警戒值 ${limit}。目前合計 ${meat+veg}。`);return false;}if(state.user.role==="一般員工"&&guest>0){notice("orderNotice","danger","一般員工不可填寫外賓數量。");return false;}notice("orderNotice","success","目前訂單符合規則。");return true;}
function statCard(type,icon,label,value,unit){return `<div class="stat-card ${type}"><div class="stat-label">${icon} ${label}</div><div class="stat-number">${value}</div><div class="stat-unit">${unit}</div></div>`;}
function buildReview(){if(!guardOpen())return;if(!validateOrder())return;state.pendingOrder={date:todayKey(),empId:state.user.empId,name:state.user.name,dept:state.user.dept,group:state.user.group,role:state.user.role,meatQty:num("meatQty"),vegQty:num("vegQty"),guestQty:num("guestQty"),updatedAt:""};const total=state.pendingOrder.meatQty+state.pendingOrder.vegQty+state.pendingOrder.guestQty;setHTML("reviewSummary",[statCard("meat","🥩","葷食",state.pendingOrder.meatQty,"份"),statCard("veg","🌱","素食",state.pendingOrder.vegQty,"份"),statCard("guest","👥","外賓",state.pendingOrder.guestQty,"人"),statCard("total","📋","合計總數",total,"總數")].join(""));setHTML("reviewUser",[row("工號",state.user.empId),row("姓名",state.user.name),row("部門",state.user.dept),row("組別",state.user.group),row("身分",state.user.role)].join(""));setHTML("reviewOrder",[row("日期",state.pendingOrder.date),row("葷食",state.pendingOrder.meatQty),row("素食",state.pendingOrder.vegQty),row("外賓",state.pendingOrder.guestQty)].join(""));showPage("review");}
async function submitOrder(){if (state.isBusy) return;beginLoading("正在送出訂單...");showAlert("訂單送出中，請稍候...");if(!guardOpen())return;if(!state.pendingOrder||state.isSubmitting)return;state.isSubmitting=true;setButtonLoading("btnSubmit","送出中...",true);try{const result=await apiPost({action:"saveOrder",empId:state.user.empId,name:state.user.name,dept:state.dept,group:state.group,meatQty:state.pendingOrder.meatQty,vegQty:state.pendingOrder.vegQty,guestQty:state.pendingOrder.guestQty});if(!result.success){notice("orderNotice","danger",result.message||"訂單送出失敗。");showPage("order");return;}const order=result.order||state.pendingOrder;setHTML("doneBox",[row("日期",order.date||state.pendingOrder.date),row("工號",order.empId||state.user.empId),row("姓名",order.name||state.user.name),row("部門",order.dept||state.user.dept),row("組別",order.group||state.user.group),row("身分",order.role||state.user.role),row("葷食",order.meatQty??state.pendingOrder.meatQty),row("素食",order.vegQty??state.pendingOrder.vegQty),row("外賓",order.guestQty??state.pendingOrder.guestQty),row("送出時間",order.updatedAt||new Date().toLocaleString("zh-TW"))].join(""));hideAlert();showPage("done");}catch(e){console.error(e);notice("orderNotice","danger","無法連線至訂餐系統伺服器，請稍後再試。");showPage("order");}finally{state.isSubmitting=false;setButtonLoading("btnSubmit","確認送出",false);finishLoading();}}
function goHome(){state.user=null;state.pendingOrder=null;state.existingOrder=null;state.dept="";state.group="";showPage("scan");}
function clearLocalData(){if(!confirm("確定要清除本機測試資料？"))return;clearSavedUser();localStorage.removeItem(STORAGE_ORDERS);location.reload();}
function bindEvents(){on("btnScan","click",scanQRCode);on("btnClear","click",clearLocalData);on("btnBackToCheck","click",()=>guardOpen()&&showPage("check"));on("btnReview","click",buildReview);on("btnEdit","click",()=>guardOpen()&&showPage("order"));on("btnSubmit","click",submitOrder);on("btnHome","click",goHome);["meatQty","vegQty","guestQty"].forEach(id=>on(id,"input",validateOrder));}
window.addEventListener("error",e=>{showAlert("系統錯誤："+e.message);console.error(e.error||e.message);});
document.addEventListener("DOMContentLoaded",()=>{bindEvents();updateHeader();showPage(isSystemClosed()?"closed":"scan");});
function lockButton(buttonId, text) {
  const btn = $(buttonId);
  if (!btn) return;

  btn.disabled = true;
  btn.dataset.originalText = btn.textContent;
  btn.textContent = text;
}
function beginLoading(message) {
  state.isBusy = true;
  setText("loadingText", message || "處理中，請稍候...");
  $("loadingOverlay").classList.remove("hidden");
}

function finishLoading() {
  state.isBusy = false;
  $("loadingOverlay").classList.add("hidden");
}
