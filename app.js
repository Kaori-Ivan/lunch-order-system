const STORAGE_USER = "lunch_user_profile_v9";
const state = { step:"closed", dept:"", group:"", user:null, existingOrder:null, pendingOrder:null, isSubmitting:false };
const $ = (id) => document.getElementById(id);

function on(id, event, handler){ const el=$(id); if(el) el.addEventListener(event, handler); else console.warn("Missing element:",id); }
function setHTML(id, html){ const el=$(id); if(el) el.innerHTML=html; else console.warn("Missing element for innerHTML:",id); }
function setText(id, text){ const el=$(id); if(el) el.textContent=text; }
function todayKey(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }

function isSystemClosed(){
  if(APP_CONFIG.MODE==="TEST") return false;
  if(APP_CONFIG.MODE==="CLOSE") return true;
  const now=new Date(), deadline=new Date();
  deadline.setHours(APP_CONFIG.DEADLINE_HOUR,APP_CONFIG.DEADLINE_MINUTE,0,0);
  return now>=deadline;
}
function getStatusText(){ if(APP_CONFIG.MODE==="TEST") return "測試模式：系統開放中"; if(APP_CONFIG.MODE==="CLOSE") return "目前未開放訂餐"; return isSystemClosed()?"今日訂餐已截止":"截止時間：10:00"; }
function getClosedReason(){ if(APP_CONFIG.MODE==="CLOSE") return "系統已由管理端關閉"; if(APP_CONFIG.MODE==="AUTO"&&isSystemClosed()) return "已超過每日 10:00 截止時間"; return "未開放訂餐"; }
function updateHeader(){
  setText("todayText", new Date().toLocaleDateString("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",weekday:"long"}));
  const status=$("systemStatusText"); if(status){ status.textContent=getStatusText(); status.classList.toggle("closed",isSystemClosed()); }
}
function showPage(page){
  state.step=page;
  ["closed","scan","verify","check","order","review","done"].forEach(name=>{ const el=$("page-"+name); if(el) el.classList.toggle("hidden",name!==page); });
  document.querySelectorAll(".step").forEach(step=>{ step.classList.toggle("active", step.dataset.step===page); if(page==="closed") step.classList.remove("active"); });
  hideAlert();
}
function routeInitial(){ updateHeader(); if(isSystemClosed()){ setText("closedReason",getClosedReason()); showPage("closed"); } else showPage("scan"); }
function guardOpen(){ updateHeader(); if(!isSystemClosed()) return true; state.pendingOrder=null; setText("closedReason",getClosedReason()); showPage("closed"); return false; }
function showAlert(message){ const box=$("alertBox"); if(!box) return; box.textContent=message; box.classList.remove("hidden"); }
function hideAlert(){ const box=$("alertBox"); if(!box) return; box.textContent=""; box.classList.add("hidden"); }
function notice(id,type,msg){ setHTML(id,`<div class="notice ${type}">${msg}</div>`); }
function clearNotice(id){ setHTML(id,""); }
function row(label,value){ return `<div class="row"><span>${label}</span><strong>${value ?? ""}</strong></div>`; }
function profileHTML(user){ return [row("工號",user.empId),row("姓名",user.name),row("部門",user.dept),row("組別",user.group),row("身分",user.role)].join(""); }
function maskName(name){ if(!name) return ""; if(name.length<=2) return name[0]+"○"; return name[0]+"○"+name[name.length-1]; }
function encodeName(name){ return btoa(unescape(encodeURIComponent(name))); }
function getSavedUser(){ try{return JSON.parse(localStorage.getItem(STORAGE_USER)||"null");}catch{return null;} }
function saveUser(user){ localStorage.setItem(STORAGE_USER,JSON.stringify(user)); }
function clearSavedUser(){ localStorage.removeItem(STORAGE_USER); }

async function apiPost(payload){
  if(!APP_CONFIG.API_URL || APP_CONFIG.API_URL.includes("請貼上")) throw new Error("尚未設定 APP_CONFIG.API_URL");
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),APP_CONFIG.API_TIMEOUT_MS||10000);
  try{
    const response=await fetch(APP_CONFIG.API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload),signal:controller.signal});
    const text=await response.text();
    try{return JSON.parse(text);}catch{throw new Error("API 回傳格式不是 JSON："+text.slice(0,100));}
  }finally{ clearTimeout(timeout); }
}
function setButtonLoading(id,loadingText,isLoading){
  const btn=$(id); if(!btn) return;
  if(isLoading){ btn.dataset.originalText=btn.textContent; btn.textContent=loadingText; btn.disabled=true; }
  else{ btn.textContent=btn.dataset.originalText||btn.textContent; btn.disabled=false; }
}

function scanQRCode() {
  if (!guardOpen()) return;

  const deptEl = $("deptSelect");
  const groupEl = $("groupSelect");

  const deptValue = deptEl ? deptEl.value : "";
  const groupValue = groupEl ? groupEl.value : "";

  state.dept = String(deptValue || "").trim();
  state.group = String(groupValue || "").trim();

  console.log("QR Dept/Group:", {
    dept: state.dept,
    group: state.group
  });

  if ($("deptReadonly")) $("deptReadonly").value = state.dept;
  if ($("groupReadonly")) $("groupReadonly").value = state.group;

  clearNotice("verifyNotice");

  const saved = getSavedUser();

  if (saved) {
    state.user = {
      ...saved,
      dept: state.dept,
      group: state.group
    };

    $("verifyForm")?.classList.add("hidden");
    $("savedUserBox")?.classList.remove("hidden");
    setHTML("savedUserBox", profileHTML(state.user));
    setText("verifyDesc", "系統已讀取此裝置上次使用者資料，請確認是否正確。");

    setHTML("verifyActions", `
      <button class="btn primary" id="btnStartSaved">開始點餐</button>
      <button class="btn secondary" id="btnWrongSaved">資料錯誤，重新輸入</button>
    `);

    on("btnStartSaved", "click", confirmProfile);
    on("btnWrongSaved", "click", resetVerify);

  } else {
    showVerifyForm();
  }

  showPage("verify");
}
function showVerifyForm(){
  $("verifyForm")?.classList.remove("hidden"); $("savedUserBox")?.classList.add("hidden");
  setText("verifyDesc","請輸入工號與姓名，系統會比對資料庫，確認相符後才可進入點餐。");
  setHTML("verifyActions",`<button class="btn primary" id="btnVerify">查詢</button><button class="btn ghost" id="btnBackToScan">返回</button>`);
  on("btnVerify","click",verifyEmployee); on("btnBackToScan","click",()=>showPage("scan"));
}
function resetVerify(){ clearSavedUser(); state.user=null; if($("empId")) $("empId").value=""; if($("empName")) $("empName").value=""; clearNotice("verifyNotice"); showVerifyForm(); }

async function verifyEmployee(){
  if(!guardOpen()) return;
  const empId=$("empId")?.value.trim()||"", empName=$("empName")?.value.trim()||"";
  if(!empId||!empName){ notice("verifyNotice","danger","請輸入工號與姓名。"); return; }
  setButtonLoading("btnVerify","驗證中...",true); notice("verifyNotice","info","資料驗證中，請稍候...");
  try{
    const payload = {
    action: "verifyUser",
    empId,
    name: empName,
    dept: state.dept,
    group: state.group
};

console.log("Verify Payload:", payload);

const result = await apiPost(payload);
    if(!result.success){ notice("verifyNotice","danger",result.message||"資料錯誤：工號或姓名不相符。"); return; }
    const user=result.user;
    state.user={userId:user.userId,empId:user.empId,name:user.name,nameMasked:maskName(user.name),nameEncoded:encodeName(user.name),dept:user.dept||state.dept,group:user.group||state.group,role:user.role};
    saveUser(state.user);
    $("savedUserBox")?.classList.remove("hidden"); setHTML("savedUserBox",profileHTML(state.user));
    notice("verifyNotice","success","驗證成功，已自動帶入身分："+state.user.role+"。");
    setHTML("verifyActions",`<button class="btn primary" id="btnConfirmProfile">確認並開始點餐</button><button class="btn secondary" id="btnWrongProfile">資料錯誤，重新輸入</button>`);
    on("btnConfirmProfile","click",confirmProfile); on("btnWrongProfile","click",resetVerify);
  }catch(error){ console.error(error); notice("verifyNotice","danger",error.name==="AbortError"?"系統回應逾時，請稍後再試。":"無法連線至訂餐系統伺服器，請稍後再試。"); }
  finally{ setButtonLoading("btnVerify","查詢",false); }
}

async function confirmProfile(){ if(!guardOpen()) return; await checkTodayOrder(); showPage("check"); }
async function checkTodayOrder(){
  if(!state.user) return;
  setHTML("checkBox",profileHTML(state.user)+`<div class="notice info">正在確認今日訂單...</div>`); setHTML("checkActions","");
  try{
    const result=await apiPost({action:"getOrder",empId:state.user.empId,name:state.user.name});
    if(!result.success){ setHTML("checkBox",profileHTML(state.user)+`<div class="notice danger">${result.message||"無法查詢今日訂單。"}</div>`); setHTML("checkActions",`<button class="btn ghost" id="btnBackVerify">返回</button>`); on("btnBackVerify","click",()=>showPage("verify")); return; }
    state.existingOrder=result.hasOrder?result.order:null;
    if(result.hasOrder){
      const old=result.order;
      setHTML("checkBox",profileHTML(state.user)+`<div class="notice warning">今日已有訂單：葷 ${old.meatQty}、素 ${old.vegQty}、外賓 ${old.guestQty}。修改後會覆蓋原資料。</div>`);
      setHTML("checkActions",`<button class="btn primary" id="btnEditOrder">修改今日訂單</button><button class="btn ghost" id="btnBackVerify">返回</button>`);
      on("btnEditOrder","click",()=>startOrder(true));
    }else{
      setHTML("checkBox",profileHTML(state.user)+`<div class="notice success">今日尚未建立訂單，可建立新訂單。</div>`);
      setHTML("checkActions",`<button class="btn primary" id="btnNewOrder">建立新訂單</button><button class="btn ghost" id="btnBackVerify">返回</button>`);
      on("btnNewOrder","click",()=>startOrder(false));
    }
    on("btnBackVerify","click",()=>showPage("verify"));
  }catch(error){ console.error(error); setHTML("checkBox",profileHTML(state.user)+`<div class="notice danger">無法連線至訂餐系統伺服器，請稍後再試。</div>`); setHTML("checkActions",`<button class="btn ghost" id="btnBackVerify">返回</button>`); on("btnBackVerify","click",()=>showPage("verify")); }
}

function getLimit(){ return state.user?.role==="主管"||state.user?.role==="助理"?5:1; }
function startOrder(isEdit){
  if(!guardOpen()) return;
  const old=state.existingOrder, limit=getLimit();
  setText("orderTitle",isEdit?"修改今日訂單":"建立新訂單");
  setHTML("ruleBox",`目前身分：${state.user.role}｜警戒值：${limit}<br>葷食 + 素食至少 1 份，且不可超過警戒值。一般員工不可填寫外賓。`);
  if($("meatQty")) $("meatQty").value=old?old.meatQty:0;
  if($("vegQty")) $("vegQty").value=old?old.vegQty:0;
  if($("guestQty")){ $("guestQty").value=old?old.guestQty:0; $("guestQty").disabled=state.user.role==="一般員工"; if($("guestQty").disabled) $("guestQty").value=0; }
  validateOrder(); showPage("order");
}
function num(id){ return Math.max(0,Number($(id)?.value||0)); }
function validateOrder(){
  if(!state.user) return false;
  const meat=num("meatQty"), veg=num("vegQty"), guest=num("guestQty"), limit=getLimit();
  if(meat+veg<1){ notice("orderNotice","danger","葷食 + 素食至少需要填寫 1 份。"); return false; }
  if(meat+veg>limit){ notice("orderNotice","danger",`葷食 + 素食不可超過警戒值 ${limit}。目前合計 ${meat+veg}。`); return false; }
  if(state.user.role==="一般員工"&&guest>0){ notice("orderNotice","danger","一般員工不可填寫外賓數量。"); return false; }
  if(guest>10){ notice("orderNotice","warning","外賓數量大於 10，送出前會再次確認。"); return true; }
  notice("orderNotice","success","目前訂單符合規則。"); return true;
}
function buildReview(){
  if(!guardOpen()) return; if(!validateOrder()) return;
  state.pendingOrder={date:todayKey(),empId:state.user.empId,name:state.user.name,userId:state.user.userId,nameMasked:state.user.nameMasked,nameEncoded:state.user.nameEncoded,dept:state.user.dept,group:state.user.group,role:state.user.role,meatQty:num("meatQty"),vegQty:num("vegQty"),guestQty:num("guestQty"),updatedAt:""};
  setHTML("reviewSummary",[`<div class="review-stat"><span>葷食</span><strong>${state.pendingOrder.meatQty}</strong><small>份</small></div>`,`<div class="review-stat"><span>素食</span><strong>${state.pendingOrder.vegQty}</strong><small>份</small></div>`,`<div class="review-stat"><span>外賓</span><strong>${state.pendingOrder.guestQty}</strong><small>人</small></div>`,`<div class="review-stat"><span>合計</span><strong>${state.pendingOrder.meatQty+state.pendingOrder.vegQty+state.pendingOrder.guestQty}</strong><small>總數</small></div>`].join(""));
  setHTML("reviewUser",[row("工號",state.user.empId),row("姓名",state.user.name),row("部門",state.user.dept),row("組別",state.user.group),row("身分",state.user.role)].join(""));
  setHTML("reviewOrder",[row("日期",state.pendingOrder.date),row("葷食",state.pendingOrder.meatQty),row("素食",state.pendingOrder.vegQty),row("外賓",state.pendingOrder.guestQty)].join(""));
  showPage("review");
}

async function submitOrder(){
  if(!guardOpen()) return; if(!state.pendingOrder||state.isSubmitting) return;
  if(state.pendingOrder.guestQty>10&&!confirm("外賓數量大於 10，請再次確認是否送出？")) return;
  state.isSubmitting=true; setButtonLoading("btnSubmit","送出中...",true);
  try{
    const result=await apiPost({action:"saveOrder",empId:state.user.empId,name:state.user.name,meatQty:state.pendingOrder.meatQty,vegQty:state.pendingOrder.vegQty,guestQty:state.pendingOrder.guestQty});
    if(!result.success){ notice("orderNotice","danger",result.message||"訂單送出失敗。"); showPage("order"); return; }
    const order=result.order||state.pendingOrder;
    setHTML("doneBox",[row("日期",order.date||state.pendingOrder.date),row("工號",order.empId||state.user.empId),row("姓名",order.name||state.user.name),row("部門",order.dept||state.user.dept),row("組別",order.group||state.user.group),row("身分",order.role||state.user.role),row("葷食",order.meatQty??state.pendingOrder.meatQty),row("素食",order.vegQty??state.pendingOrder.vegQty),row("外賓",order.guestQty??state.pendingOrder.guestQty),row("送出時間",order.updatedAt||new Date().toLocaleString("zh-TW"))].join(""));
    state.existingOrder=order; showPage("done");
  }catch(error){ console.error(error); notice("orderNotice","danger",error.name==="AbortError"?"系統回應逾時，請稍後再試。":"無法連線至訂餐系統伺服器，請稍後再試。"); showPage("order"); }
  finally{ state.isSubmitting=false; setButtonLoading("btnSubmit","確認送出",false); }
}

function goHome(){ state.user=null; state.pendingOrder=null; state.existingOrder=null; if(isSystemClosed()){ setText("closedReason",getClosedReason()); showPage("closed"); } else showPage("scan"); }
function clearLocalData(){ if(!confirm("確定要清除此裝置記憶的使用者資料？")) return; clearSavedUser(); location.reload(); }
function bindEvents(){
  on("btnScan","click",scanQRCode); on("btnClear","click",clearLocalData); on("btnBackToCheck","click",()=>guardOpen()&&showPage("check")); on("btnReview","click",buildReview); on("btnEdit","click",()=>guardOpen()&&showPage("order")); on("btnSubmit","click",submitOrder); on("btnHome","click",goHome);
  ["meatQty","vegQty","guestQty"].forEach(id=>on(id,"input",validateOrder));
}
window.addEventListener("online",()=>hideAlert());
window.addEventListener("offline",()=>showAlert("目前無法連線，請確認網路狀態。"));
window.addEventListener("error",(e)=>{ showAlert("系統錯誤："+e.message); console.error(e.error||e.message); });
document.addEventListener("DOMContentLoaded",()=>{ bindEvents(); routeInitial(); setInterval(()=>{ updateHeader(); if(isSystemClosed()&&!["closed","done"].includes(state.step)){ setText("closedReason",getClosedReason()); showPage("closed"); } },30000); });
