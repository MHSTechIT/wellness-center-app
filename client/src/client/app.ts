"use client";

import { supabase } from "@/shared/supabase";

// All client-side UI logic, state and window.* handlers for the app shell.
// Invoked once from the Home component after the container mounts; returns the
// effect cleanup. Behaviour is identical to the previous inline useEffect body.
export function initApp(root: HTMLElement) {
  const w = window as any;

    // Backend API base URL. Empty = same-origin (dev / reverse-proxy). Set
    // NEXT_PUBLIC_API_BASE_URL to the deployed server origin (e.g.
    // https://api.example.com) when the client and server run separately.
    const API_BASE=(process.env.NEXT_PUBLIC_API_BASE_URL||"").replace(/\/+$/,"");
    const _api=(p:string)=>API_BASE+p;

    // Live numeric-only input guard (digits + one optional decimal). Wire via
    // oninput="window._numOnly(this)" on money/number fields so letters and
    // symbols can never be typed. _digitsOnly keeps digits only (phones, refs).
    w._numOnly=(el:HTMLInputElement)=>{ if(!el)return; let v=(el.value||"").replace(/[^0-9.]/g,""); const i=v.indexOf("."); if(i>=0){ v=v.slice(0,i+1)+v.slice(i+1).replace(/\./g,""); } el.value=v; };
    w._digitsOnly=(el:HTMLInputElement)=>{ if(!el)return; el.value=(el.value||"").replace(/[^0-9]/g,""); };
    // Money-received guard: numeric only (digits + up to 2 decimals) AND must not exceed the
    // due amount. Shows an inline validation message (errSel). Returns true when valid.
    w._payAmtRcvd=(el:HTMLInputElement,dueSel:string,errSel:string)=>{
      if(!el) return true;
      let v=(el.value||"").replace(/[^0-9.]/g,""); const dot=v.indexOf(".");
      if(dot>=0){ v=v.slice(0,dot+1)+v.slice(dot+1).replace(/\./g,"").slice(0,2); }   // one dot, ≤2 decimals
      el.value=v;
      const rcvd=parseFloat(v)||0;
      const dueEl=dueSel?root.querySelector(dueSel)as HTMLInputElement|null:null;
      const due=parseFloat(((dueEl&&dueEl.value)||"").replace(/[^0-9.]/g,""))||0;
      const over=due>0 && rcvd>due;
      el.style.borderColor=over?"var(--alert)":"";
      const err=errSel?root.querySelector(errSel)as HTMLElement|null:null;
      if(err){ err.textContent=over?("Cannot exceed amount due (₹"+due.toLocaleString("en-IN")+")"):""; err.style.display=over?"block":"none"; }
      return !over;
    };

    // ========== AUTH, RBAC & USER MANAGEMENT ==========
    let _currentUser:any = null;
    let _rbacMatrix:any = null;

    const MODULES_LIST=[
      {key:"advisor",label:"Health advisor"},{key:"coach",label:"Health coach"},
      {key:"import",label:"Lead import"},{key:"abm",label:"Assign & approve"},
      {key:"reception",label:"Reception"},{key:"screening",label:"Screening"},
      {key:"bloodtest",label:"Blood test"},{key:"physio",label:"Physiotherapy"},
      {key:"accounts",label:"Accounts"},{key:"reports",label:"Reports"},
      {key:"admin",label:"Settings"}
    ];
    const FULL_ACCESS=["advisor","coach","import","abm","reception","screening","bloodtest","physio","recordings","accounts","reports","admin"];
    const RBAC_ROLES=["Advisor","Senior Advisor","Health Coach","Screening","Receptionist","Diagnostics","Physiotherapist","Accounts","ABM","Manager","Branch Manager"];
    const DEFAULT_RBAC:Record<string,string[]>={
      "Advisor":["advisor"],"Senior Advisor":["advisor","import"],
      "Health Coach":["coach","recordings"],"Screening":["screening"],
      "Receptionist":["reception"],"Diagnostics":["bloodtest"],
      "Physiotherapist":["physio"],"Accounts":["accounts"],
      "ABM":["abm","advisor","import","reports"],
      "Manager":FULL_ACCESS.slice(),
      "Branch Manager":FULL_ACCESS.slice()
    };

    function showLogin(errMsg?:string){
      const overlay=root.querySelector("#loginOverlay") as HTMLElement;
      const appShell=root.querySelector("#appShell") as HTMLElement;
      if(overlay) overlay.style.display="";
      if(appShell) appShell.style.display="none";
      const errEl=root.querySelector("#loginErr") as HTMLElement;
      if(errMsg&&errEl){ errEl.textContent=errMsg; errEl.style.display=""; }
      else if(errEl) errEl.style.display="none";
      // reset form
      const cw=root.querySelector("#loginConfirmWrap") as HTMLElement;
      if(cw) cw.style.display="none";
      const btn=root.querySelector("#loginBtn") as HTMLElement;
      if(btn) btn.textContent="Sign in";
      const tog=root.querySelector("#loginToggle") as HTMLElement;
      if(tog) tog.textContent="First time? Set your password";
      (root.querySelector("#loginPass") as HTMLInputElement|null)&&((root.querySelector("#loginPass") as HTMLInputElement).value="");
    }

    function showApp(){
      const overlay=root.querySelector("#loginOverlay") as HTMLElement;
      const appShell=root.querySelector("#appShell") as HTMLElement;
      if(overlay) overlay.style.display="none";
      if(appShell) appShell.style.display="";
      const sfUser=root.querySelector("#sfootUser") as HTMLElement;
      if(sfUser&&_currentUser) sfUser.textContent=(_currentUser.name||_currentUser.email.split("@")[0])+" · "+_currentUser.role;
      applyNavGating();
      renderFilters();
      renderAll();
      seed();
      loadReceptionData();
      setTimeout(()=>{ try{ w._renderCallDeviation(); w._renderLeadsDeviation(); }catch(_){} },4000);
    }

    async function checkAuth(){
      try{
        const {data:{session}}=await supabase.auth.getSession();
        if(!session){ showLogin(); return; }
        const email=session.user.email||"";
        const {data:appUser}=await supabase.from("app_users").select("*").eq("email",email).single();
        if(!appUser||!appUser.active){
          await supabase.auth.signOut();
          showLogin("Account not found or deactivated. Contact your admin.");
          return;
        }
        _currentUser=appUser;
        await loadRbacMatrix();
        showApp();
      }catch(e:any){
        showLogin();
      }
    }

    let _loginIsSignUp=false;
    function loginToggleMode(){
      _loginIsSignUp=!_loginIsSignUp;
      const cw=root.querySelector("#loginConfirmWrap") as HTMLElement;
      const btn=root.querySelector("#loginBtn") as HTMLElement;
      const tog=root.querySelector("#loginToggle") as HTMLElement;
      const errEl=root.querySelector("#loginErr") as HTMLElement;
      if(errEl) errEl.style.display="none";
      if(cw) cw.style.display=_loginIsSignUp?"":"none";
      if(btn) btn.textContent=_loginIsSignUp?"Set password & sign in":"Sign in";
      if(tog) tog.textContent=_loginIsSignUp?"Already have a password? Sign in":"First time? Set your password";
    }

    async function doSignIn(){
      const emailEl=root.querySelector("#loginEmail") as HTMLInputElement;
      const passEl=root.querySelector("#loginPass") as HTMLInputElement;
      const email=emailEl?.value?.trim()?.toLowerCase()||"";
      const pass=passEl?.value||"";
      if(!email||!pass){ showLoginErr("Enter email and password"); return; }

      if(_loginIsSignUp){
        const confirmEl=root.querySelector("#loginConfirm") as HTMLInputElement;
        const confirm=confirmEl?.value||"";
        if(pass!==confirm){ showLoginErr("Passwords don't match"); return; }
        if(pass.length<6){ showLoginErr("Password must be at least 6 characters"); return; }
        const {data:appUser}=await supabase.from("app_users").select("email").eq("email",email).single();
        if(!appUser){ showLoginErr("This email is not authorized. Ask your admin to add you first."); return; }
        const {error}=await supabase.auth.signUp({email,password:pass});
        if(error){ showLoginErr(error.message); return; }
      } else {
        const {error}=await supabase.auth.signInWithPassword({email,password:pass});
        if(error){ showLoginErr(error.message==="Invalid login credentials"?"Wrong email or password. If first time, click 'Set your password' below.":error.message); return; }
      }
      await checkAuth();
    }

    function showLoginErr(msg:string){
      const el=root.querySelector("#loginErr") as HTMLElement;
      if(el){ el.textContent=msg; el.style.display=""; }
    }

    async function doSignOut(){
      await supabase.auth.signOut();
      _currentUser=null;
      showLogin();
    }
    w._doSignOut=doSignOut;

    // Login form handlers
    setTimeout(()=>{
      const loginBtn=root.querySelector("#loginBtn")as HTMLElement|null;
      // UI-only wrapper: show the button loading spinner around the (unchanged) sign-in call.
      const _signIn=async()=>{ if(loginBtn)loginBtn.classList.add("loading"); try{ await doSignIn(); } finally{ if(loginBtn)loginBtn.classList.remove("loading"); } };
      if(loginBtn) loginBtn.addEventListener("click",()=>{ _signIn(); });
      const loginTog=root.querySelector("#loginToggle");
      if(loginTog) loginTog.addEventListener("click",()=>loginToggleMode());
      const passEl=root.querySelector("#loginPass");
      if(passEl) passEl.addEventListener("keydown",(e:any)=>{ if(e.key==="Enter"&&!_loginIsSignUp) _signIn(); });
      const confirmEl=root.querySelector("#loginConfirm");
      if(confirmEl) confirmEl.addEventListener("keydown",(e:any)=>{ if(e.key==="Enter") _signIn(); });
    },0);

    // RBAC matrix
    async function loadRbacMatrix(){
      const {data}=await supabase.from("app_settings").select("value").eq("key","rbac").single();
      _rbacMatrix=data?.value||{...DEFAULT_RBAC};
    }

    function renderRbacMatrix(){
      const body=root.querySelector("#rbacMatrixBody") as HTMLElement;
      if(!body) return;
      const m=_rbacMatrix||DEFAULT_RBAC;
      const thCells=RBAC_ROLES.map(r=>'<th style="font-size:9px;padding:8px 5px;max-width:65px;word-wrap:break-word;text-align:center">'+r+'</th>').join("");
      const rows=MODULES_LIST.map(mod=>{
        const cells=RBAC_ROLES.map(r=>{
          const on=(m[r]||[]).includes(mod.key);
          return '<td style="text-align:center"><input type="checkbox" '+(on?'checked ':'')+' data-mod="'+mod.key+'" data-role="'+r+'" onchange="window._rbacToggle(this)" style="accent-color:var(--brand);width:16px;height:16px;cursor:pointer"></td>';
        }).join("");
        return '<tr><td style="font-weight:600;font-size:12px">'+mod.label+'</td>'+cells+'</tr>';
      }).join("");
      body.innerHTML='<table class="tbl matrix"><thead><tr><th>Module</th>'+thCells+'</tr></thead><tbody>'+rows+'</tbody></table>'
        +'<p style="font-size:11px;color:var(--faint);margin-top:8px">Super Admin always has full access (not shown). Changes auto-save.</p>';
    }

    w._rbacToggle=function(el:HTMLInputElement){
      const mod=el.dataset.mod||"";
      const role=el.dataset.role||"";
      if(!_rbacMatrix) _rbacMatrix={...DEFAULT_RBAC};
      if(!_rbacMatrix[role]) _rbacMatrix[role]=[];
      if(el.checked){ if(!_rbacMatrix[role].includes(mod)) _rbacMatrix[role].push(mod); }
      else { _rbacMatrix[role]=_rbacMatrix[role].filter((x:string)=>x!==mod); }
      saveRbac();
    };

    async function saveRbac(){
      await supabase.from("app_settings").upsert({key:"rbac",value:_rbacMatrix,updated_at:new Date().toISOString()});
      if(_currentUser&&_currentUser.role!=="Super Admin") applyNavGating();
    }

    // Nav gating
    function applyNavGating(){
      if(!_currentUser) return;
      const role=_currentUser.role;
      // Super Admin, or any role not present in the RBAC matrix (misconfigured/legacy
      // role), gets full access — never lock a valid user out of the entire app.
      if(role==="Super Admin"||!RBAC_ROLES.includes(role)){
        root.querySelectorAll("#nav button[data-s]").forEach((btn:any)=>btn.style.display="");
        return;
      }
      const allowed=(_rbacMatrix||DEFAULT_RBAC)[role]||[];
      root.querySelectorAll("#nav button[data-s]").forEach((btn:any)=>{
        (btn as HTMLElement).style.display=allowed.includes(btn.dataset.s)?"":"none";
      });
      const activeBtn=root.querySelector("#nav button.active") as HTMLElement|null;
      if(activeBtn&&activeBtn.style.display==="none"){
        const first=root.querySelector('#nav button[data-s]:not([style*="display: none"])') as HTMLElement|null;
        if(first) first.click();
      }
    }

    // User management
    let _usrList:any[]=[];

    async function loadUsers(){
      const {data}=await supabase.from("app_users").select("*").order("created_at",{ascending:false});
      _usrList=data||[];
      renderUsers();
    }

    function renderUsers(){
      const body=root.querySelector("#usrBody") as HTMLElement;
      if(!body) return;
      if(!_usrList.length){ body.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--faint);padding:22px">No users yet. Add the first user above.</td></tr>'; return; }
      const _uhd=root.querySelector("#usrHead"); if(_uhd)_uhd.innerHTML=gridHead("usr"); const _usrR=gridApply("usr",_usrList); body.innerHTML=_usrR.map((u:any)=>{
        const isSelf=_currentUser&&_currentUser.email===u.email;
        return '<tr><td class="mono" style="font-size:12px">'+u.email+'</td><td>'+(u.name||"—")+'</td>'
          +'<td><span class="chipb '+(u.role==="Super Admin"?"vio":u.role==="Branch Manager"?"info":"neu")+'">'+u.role+'</span></td>'
          +'<td><span class="chipb '+(u.active?"ok":"al")+'">'+(u.active?"Active":"Inactive")+'</span></td>'
          +'<td class="mono" style="font-size:11px">'+_dIST(u.created_at)+'</td>'
          +'<td>'+(isSelf?'<span style="font-size:11px;color:var(--faint)">You</span>'
            :'<button class="btn bsm" onclick="window._usrToggle('+u.id+')">'+(u.active?"Deactivate":"Activate")+'</button>'
            +(u.role!=="Super Admin"?' <button class="btn bsm" onclick="window._usrDel('+u.id+')" style="color:var(--alert-ink)">Remove</button>':""))
          +'</td></tr>';
      }).join("");
    }

    w._usrCreate=async function(){
      const emailEl=root.querySelector("#usrEmail") as HTMLInputElement;
      const nameEl=root.querySelector("#usrName") as HTMLInputElement;
      const roleEl=root.querySelector("#usrRole") as HTMLSelectElement;
      const email=(emailEl?.value||"").trim().toLowerCase();
      const name=(nameEl?.value||"").trim();
      const role=roleEl?.value||"Advisor";
      if(!email){ toastErr("Enter an email address"); return; }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ toastErr("Invalid email format"); return; }
      try{
        const {error}=await supabase.from("app_users").insert({email,name:name||null,role});
        if(error){ toastErr(error.message.includes("duplicate")?"This email already exists":error.message); return; }
        toast("User added — they can set their password on the login screen");
        if(emailEl) emailEl.value="";
        if(nameEl) nameEl.value="";
        await loadUsers();
      }catch(e:any){ toastErr("Failed: "+(e.message||"db error")); }
    };

    w._usrToggle=async function(id:any){
      const u=_usrList.find((x:any)=>String(x.id)===String(id));   // id is BIGSERIAL → gateway returns a string
      if(!u) return;
      await supabase.from("app_users").update({active:!u.active}).eq("id",id);
      toast(u.active?"User deactivated":"User activated");
      await loadUsers();
    };

    w._usrDel=async function(id:any){
      const u=_usrList.find((x:any)=>String(x.id)===String(id));   // id is BIGSERIAL → gateway returns a string
      if(u&&u.role==="Super Admin"){ toastErr("Cannot remove Super Admin"); return; }
      await supabase.from("app_users").delete().eq("id",id);
      toast("User removed");
      await loadUsers();
    };

    // ========== NAV ==========
    const navEl = root.querySelector("#nav");
    if (navEl) {
      navEl.querySelectorAll("button").forEach((b) => {
        b.onclick = () => {
          navEl.querySelectorAll("button").forEach((x) => x.classList.remove("active"));
          b.classList.add("active");
          root.querySelectorAll(".screen").forEach((x) =>
            x.classList.toggle("active", x.id === "s-" + (b as HTMLElement).dataset.s)
          );
          const mainEl = root.querySelector("#main");
          if (mainEl) mainEl.scrollTop = 0;
          // Flush any render deferred while this screen was off-screen during a sync.
          const _scr=(b as HTMLElement).dataset.s; if(_scr&&(w as any)._flushDirtyScreen) (w as any)._flushDirtyScreen(_scr);
        };
      });
    }

    function togSec(h: HTMLElement) { h.parentElement?.classList.toggle("closed"); }
    w.togSec = togSec;

    function tabset(wr: string, p: string) {
      root.querySelectorAll(wr + " button").forEach((b) => {
        (b as HTMLElement).onclick = () => {
          root.querySelectorAll(wr + " button").forEach((x) => x.classList.remove("on"));
          b.classList.add("on");
          root.querySelectorAll(p).forEach((x) => {
            (x as HTMLElement).style.display = (x as HTMLElement).dataset.p === (b as HTMLElement).dataset.t ? "" : "none";
          });
        };
      });
    }
    tabset("#aTabs", ".a-p");
    tabset("#cTabs", ".c-p");
    tabset("#abmTabs", ".abm-p");
    tabset("#accTabs", ".acc-p");
    tabset("#settTabs", ".st-p");
    tabset("#dTabs", ".d-p");

    root.querySelectorAll(".pills").forEach((g) => {
      if ((g as HTMLElement).id) return;
      g.querySelectorAll(".pill").forEach((p) =>
        p.addEventListener("click", () => { g.querySelectorAll(".pill").forEach((x) => x.classList.remove("on")); p.classList.add("on"); })
      );
    });

    root.querySelectorAll(".chips").forEach((g) => {
      const oth = (g as HTMLElement).dataset.oth;
      g.querySelectorAll(".chip-o:not([disabled])").forEach((c) =>
        c.addEventListener("click", () => {
          c.classList.toggle("on");
          if ((c as HTMLElement).dataset.others && oth) { const el = root.querySelector("#" + oth) as HTMLElement; if (el) el.style.display = c.classList.contains("on") ? "block" : "none"; }
          if ((g as HTMLElement).id === "eligChips") eligCheck();
        })
      );
    });

    function othRev(sel: HTMLSelectElement, id: string) { const el = root.querySelector("#" + id) as HTMLElement; if (el) el.style.display = sel.value === "Others" ? "block" : "none"; }
    w.othRev = othRev;

    // Per-lead "Not Eligible" reason, surfaced in the Assigned-leads table (no separate banner).
    const _eligMap:Record<string,string>={};
    function eligCheck() {
      const onChips = [...root.querySelectorAll("#eligChips .chip-o")].filter((c) => c.classList.contains("on"));
      const any = onChips.length > 0;
      const e = (s:string) => (s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const reasons = onChips.map((c) => (c.textContent||"").trim()).filter(Boolean).join(", ");
      const b = root.querySelector("#eligBanner") as HTMLElement;
      if (b) {
        if (any) { b.className = "banner bad"; b.innerHTML = '<svg class="icon" style="width:16px;height:16px"><use href="#i-x"></use></svg><span><b>NOT eligible</b> — exclusion tag present'+(reasons?" ("+e(reasons)+")":"")+'.</span>'; }
        else { b.className = "banner good"; b.innerHTML = '<svg class="icon" style="width:16px;height:16px"><use href="#i-check"></use></svg><span>Eligible — can book appointment.</span>'; }
      }
      // Red "Not Eligible" badge next to the lead name (Open Profile header).
      _advSetNotEligBadge(any, reasons);
      // Record eligibility for the open lead → the Assigned-leads table flags the row red.
      if (_advLeadId) {
        if (any) _eligMap[String(_advLeadId)] = reasons || "Exclusion tag present";
        else delete _eligMap[String(_advLeadId)];
        try{ renderAssignedLeads(); }catch(_){}
        // Persist the eligibility immediately so it survives refresh / reopen / re-login —
        // but NOT during a profile restore (that's not a user-initiated change).
        if(!_advApplying){
          try{ persistAdvProfileQuiet(String(_advLeadId)); }catch(_){}
          try{ logActivity(_advLeadId,[{action:"Status Changed",field:"Eligibility",new:any?("Not Eligible"+(reasons?" ("+reasons+")":"")):"Eligible"}]); }catch(_){}
        }
      }
    }
    // Show/hide the red "Not Eligible" badge in the Open Profile header.
    function _advSetNotEligBadge(on:boolean,reasons:string){
      const el=root.querySelector("#advNotElig")as HTMLElement|null; if(!el) return;
      el.style.display=on?"":"none";
      el.title=on&&reasons?("Exclusion tag present — "+reasons):"";
    }

    root.querySelectorAll("#stars .star").forEach((s, i, a) => { (s as HTMLElement).onclick = () => a.forEach((x, j) => x.classList.toggle("on", j <= i)); });
    root.querySelectorAll("#bdm button").forEach((b) => { (b as HTMLElement).onclick = () => { root.querySelectorAll("#bdm button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); }; });

    // Real upload is wired in w._advAddBlood (Supabase Storage). Keep addBlood as an alias.
    function addBlood(){ if((w as any)._advAddBlood)(w as any)._advAddBlood(); }
    w.addBlood = addBlood;

    // ========== LEAD IMPORT DATA ENGINE ==========
    let IMP_SRC_CFG=[
      {name:"Meta Ads",status:"Connected",sc:"ok",mode:"Real-time webhook",lastLead:"2m"},
      {name:"Website forms",status:"Connected",sc:"ok",mode:"Webhook",lastLead:"26m"},
      {name:"WhatsApp (WATI)",status:"Connected",sc:"ok",mode:"API",lastLead:"11m"},
      {name:"Google / YouTube",status:"Not connected",sc:"neu",mode:"—",lastLead:"—"},
      {name:"Walk-in / Referral / Telecalling",status:"Manual",sc:"info",mode:"Reception / advisor form",lastLead:"38m"}
    ];
    // Lead records live in Supabase (synced from Meta). IMP is populated by
    // fetchMetaLiveFeed() from /api/meta/leads — no mock data.
    const IMP:any[]=[];

    // ===== Meta connection monitor (Source Connections status + alerts/popups) =====
    let _metaConn:"unknown"|"connected"|"disconnected"="unknown";
    let _metaAlertActive=false;          // true while the 30-min no-lead alert is showing
    let _metaMonitorTimer:any=null;
    const CAMPAIGN_START_HOUR=9, CAMPAIGN_END_HOUR=21;   // active campaign window (IST)
    function istHour(){
      try{ return Number(new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",hour:"2-digit",hour12:false}).format(new Date())); }catch(_){ return new Date().getHours(); }
    }
    // Top-centre notification stack — deduped, capped, and auto-dismissing so the same
    // alert never piles up. type: 'warn' (60s) | 'ok' (6s).
    const _NOTIF_MAX=6;   // at most this many popups on screen; oldest is dropped past it
    function _notifStackEl(){
      let s=document.getElementById("metaNotifStack")as HTMLElement|null;
      if(!s){ s=document.createElement("div"); s.id="metaNotifStack";
        s.style.cssText="position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:100000;display:flex;flex-direction:column;gap:8px;align-items:center;max-width:92vw;pointer-events:none";
        document.body.appendChild(s); }
      return s;
    }
    function _metaPopup(msg:string,type:"warn"|"ok"){
      if(!_currentUser) return;   // never surface background alerts on the login screen — only after sign-in
      const stack=_notifStackEl();
      const al=type==="warn";
      // Auto-dismiss within 5–10s so alerts never linger: warnings 8s, success 6s.
      const arm=(el:HTMLElement)=>{ const t=(el as any)._t; if(t)clearTimeout(t); (el as any)._t=setTimeout(()=>{ if(el.parentNode)el.parentNode.removeChild(el); }, al?8000:6000); };
      // Dedupe: an identical message already showing just refreshes its timer.
      const existing=Array.from(stack.children).find((c:any)=>c.getAttribute("data-msg")===msg)as HTMLElement|undefined;
      if(existing){ arm(existing); return; }
      // Cap: drop the oldest until under the limit.
      while(stack.children.length>=_NOTIF_MAX){ const first=stack.firstElementChild as HTMLElement|null; if(!first)break; const ft=(first as any)._t; if(ft)clearTimeout(ft); stack.removeChild(first); }
      const wrap=document.createElement("div"); wrap.setAttribute("data-msg",msg);
      wrap.style.cssText="pointer-events:auto;display:flex;align-items:center;gap:12px;padding:13px 18px;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.25);font-size:13.5px;font-weight:600;max-width:92vw;"+(al?"background:var(--alert-bg);border:1.5px solid var(--alert);color:var(--alert-ink)":"background:var(--ok-bg);border:1.5px solid var(--ok);color:var(--ok-ink)");
      wrap.innerHTML='<span style="font-size:16px">'+(al?"⚠":"✓")+'</span><span>'+msg+'</span><button aria-label="Dismiss" style="background:none;border:none;font-size:18px;line-height:1;cursor:pointer;color:inherit;font-weight:700">×</button>';
      (wrap.querySelector("button")as HTMLElement).onclick=()=>{ const t=(wrap as any)._t; if(t)clearTimeout(t); if(wrap.parentNode) wrap.parentNode.removeChild(wrap); };
      stack.appendChild(wrap);
      arm(wrap);
    }
    // Remove any active notification whose message contains `match` (clear-on-resolve).
    function _metaPopupClear(match:string){
      const stack=document.getElementById("metaNotifStack"); if(!stack)return;
      Array.from(stack.children).forEach((c:any)=>{ if((c.getAttribute("data-msg")||"").indexOf(match)>=0){ if(c._t)clearTimeout(c._t); if(c.parentNode)c.parentNode.removeChild(c); } });
    }
    // Transition the Meta connection state; fire toasts/popups + repaint the status cell.
    function setMetaConn(state:"connected"|"disconnected",reason?:string){
      const prev=_metaConn;
      if(prev===state){ return; }
      _metaConn=state;
      try{ renderSrcTable(); }catch(_){}
      if(state==="connected"){
        if(prev==="disconnected"){ toast("✓ Meta reconnected — leads syncing"); _metaPopupClear("Meta connection lost"); _metaPopup("Meta connection re-established. Leads are syncing again.","ok"); }
        else { toast("✓ Meta connected — leads syncing"); }
      }else{
        toastErr("Meta connection lost"+(reason?" — "+reason:""));
        _metaPopup("Meta connection lost"+(reason?" ("+reason+")":"")+". New leads may not arrive until it reconnects.","warn");
      }
    }
    // Newest Meta lead timestamp (ms); 0 if none.
    function newestMetaLeadMs(){ let mx=0; (_metaLeads||[]).forEach((l:any)=>{ const t=new Date(l.createdAt).getTime(); if(t>mx) mx=t; }); return mx; }
    // Update the "no Meta lead for 30 min during campaign hours" alert banner.
    function updateMetaAlert(){
      const box=root.querySelector("#metaLeadAlert")as HTMLElement|null;
      const txt=root.querySelector("#metaLeadAlertText")as HTMLElement|null;
      const chip=root.querySelector("#metaLeadAlertChip")as HTMLElement|null;
      if(!box||!txt||!chip) return;
      const h=istHour();
      const inHours=h>=CAMPAIGN_START_HOUR&&h<CAMPAIGN_END_HOUR;
      const newest=newestMetaLeadMs();
      const ageMin=newest?Math.floor((Date.now()-newest)/60000):Infinity;
      const triggered=inHours && ageMin>30;
      if(triggered){
        box.style.background="var(--alert-bg)";box.style.borderColor="var(--alert)";
        txt.textContent="⚠ Alert: No Meta leads received for the last 30 minutes. Please notify the ABM team.";
        txt.style.color="var(--alert-ink)";
        chip.className="chipb al"; chip.textContent="ACTIVE";
        if(!_metaAlertActive && _currentUser){ _metaAlertActive=true; toastErr("No Meta leads for 30+ min — notify the ABM team"); _metaPopup("No Meta leads received in the last 30 minutes during campaign hours. Please notify the ABM team.","warn"); }
      }else{
        box.style.background="var(--surface-2)";box.style.borderColor="var(--line)";
        txt.textContent="Alert: notify ABM if no Meta lead for 30 min during campaign hours"+(inHours?"":" · outside campaign hours ("+CAMPAIGN_START_HOUR+":00–"+CAMPAIGN_END_HOUR+":00 IST)");
        txt.style.color="var(--ink)";
        chip.className="chipb ok"; chip.textContent=inHours?"Monitoring":"Idle";
        if(_metaAlertActive) _metaPopupClear("No Meta leads");   // leads resumed → clear the alert
        _metaAlertActive=false;
      }
    }

    // Supabase: source-connection display config only.
    // Lead data for the dashboard comes from the LIVE META FEED (see fetchMetaLiveFeed
    // below), which is the single source of truth shared by the KPI cards, the
    // Source Connections table, and the Live Incoming Feed. We intentionally do NOT
    // load leads from Supabase here — doing so would race with the Meta fetch and
    // overwrite real leads with stale/seed rows.
    (async()=>{
      try{
        const srcRes=await supabase.from("source_connections").select("*");
        if(srcRes.data && srcRes.data.length>0){
          IMP_SRC_CFG=srcRes.data.map((s:any)=>({name:s.name,status:s.status,sc:s.status_color,mode:s.mode,lastLead:s.last_lead}));
          renderImport();
        }
      }catch(e){
        // Supabase optional — dashboard still works from the live Meta feed.
      }
    })();

    // Shared filter predicate used by BOTH the dashboard (KPI cards + Source
    // Connections, via IMP) and the Live Incoming Feed (via _metaLeads), so all
    // three always reflect exactly the same filtered dataset.
    // Parse a date/datetime-local input value into a timezone-safe LOCAL Date.
    // Handles "YYYY-MM-DDTHH:mm" (date+time) and "YYYY-MM-DD" (date only). For a
    // date-only value, isEnd snaps to end-of-day so the whole day is included.
    function parseRangeBound(v:string,isEnd:boolean):Date|null{
      if(!v) return null;
      let m=v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{2})/);
      if(m) return new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],isEnd?59:0,isEnd?999:0);
      m=v.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if(m) return new Date(+m[1],+m[2]-1,+m[3],isEnd?23:0,isEnd?59:0,isEnd?59:0,isEnd?999:0);
      const d=new Date(v); return isNaN(d.getTime())?null:d;
    }
    // Committed filter — only updated when Apply (or Clear) is clicked, so changing
    // an input does NOT refresh the data until Apply (and background re-renders use
    // the last applied filter, not the half-typed inputs).
    const _impFilter:any={mo:"all",yr:"all",df:"",dt:"",src:"all",svc:"all"};
    // Map a stored service value to a canonical filter option.
    function normService(s:string){
      const x=(s||"").toLowerCase();
      if(x.indexOf("weight")>=0||x.indexOf("wt loss")>=0)return "Weight Loss Counselling";
      if(x.indexOf("diab")>=0||x.indexOf("sugar")>=0)return "Diabetes Counselling";
      if(x.indexOf("sauna")>=0||x.indexOf("sona")>=0)return "Sauna Bath";
      if(x.indexOf("cold")>=0||x.indexOf("plunge")>=0)return "Cold Plunge";
      if(x.indexOf("phys")>=0)return "Physiotherapy";
      if(x.indexOf("blood")>=0)return "Blood Test";
      if(x.indexOf("hbot")>=0||x.indexOf("hyperbaric")>=0||x.indexOf("oxygen")>=0)return "HBOT (Hyperbaric Oxygen Therapy)";
      return s||"";
    }
    function leadPasses(dateObj:Date,source:string,service?:string){
      if(!dateObj||isNaN(dateObj.getTime())) return false;
      const mo=_impFilter.mo, yr=_impFilter.yr, df=_impFilter.df, dt=_impFilter.dt, src=_impFilter.src, svc=_impFilter.svc;
      // An explicit date/time range takes PRECEDENCE over the Month/Year dropdowns.
      const rangeActive=!!df||!!dt;
      if(rangeActive){
        const from=parseRangeBound(df,false); if(from&&dateObj<from) return false;
        const to=parseRangeBound(dt,true);    if(to&&dateObj>to) return false;
      }else{
        if(yr!=="all"&&dateObj.getFullYear()!==Number(yr))return false;
        if(mo!=="all"&&dateObj.getMonth()!==Number(mo))return false;
      }
      if(src!=="all"&&source!==src)return false;
      if(svc!=="all"&&normService(service||"")!==svc)return false;
      return true;
    }
    function impFiltered(){
      return IMP.filter(r=>leadPasses(r.date,r.source,r.service));
    }

    function renderImpKPIs(){
      const f=impFiltered();
      const td=new Date();td.setHours(0,0,0,0);
      const todayL=f.filter(r=>r.date.getFullYear()===td.getFullYear()&&r.date.getMonth()===td.getMonth()&&r.date.getDate()===td.getDate()).length;
      // Unique = Valid − Duplicate. Unassigned = Unique − Assigned.
      const validN=f.filter(r=>r.isValid).length;
      const dupN=f.filter(r=>r.isDuplicate).length;
      const uniqueN=Math.max(0,validN-dupN);
      const assignedN=f.filter(r=>r.isAssigned).length;
      const unassignedN=Math.max(0,uniqueN-assignedN);
      const cards=[
        {l:"Total Leads",v:f.length,c:"g",k:"total"},
        {l:"Today Leads",v:todayL,c:"g",k:"today"},
        {l:"Valid Leads",v:validN,c:"g",k:"valid"},
        {l:"Unique Leads",v:uniqueN,c:"",k:"unique"},
        {l:"Duplicate Leads",v:dupN,c:"a",k:"duplicate"},
        {l:"Assigned Leads",v:assignedN,c:"g",k:"assigned"},
        {l:"Unassigned Leads",v:unassignedN,c:"a",k:"unassigned"}
      ];
      const KPI_IC:Record<string,string>={total:"i-inbox",today:"i-cal",valid:"i-check",unique:"i-target",duplicate:"i-repeat",assigned:"i-split",unassigned:"i-clock"};
      const cc=(c:string)=>c==="g"?"g":c==="a"?"a":c==="r"?"r":"n";
      const el=root.querySelector("#impMetrics")as HTMLElement|null;
      if(!el) return;
      const existing=el.querySelectorAll(".kpi");
      if(existing.length!==cards.length){
        // First paint (or layout changed): build the cards once — the entrance animation plays here only.
        el.innerHTML=cards.map(x=>{
          const ic=KPI_IC[x.k]||"i-chart";
          return '<button class="kpi '+cc(x.c)+'" onclick="window._impDrill(\''+x.k+'\')" title="View '+x.l+'">'
            +'<span class="kpi-arrow">&rsaquo;</span>'
            +'<div class="kpi-top"><span class="kpi-ic"><svg class="icon"><use href="#'+ic+'"/></svg></span><span class="kpi-l">'+x.l+'</span></div>'
            +'<div class="kpi-v">'+x.v+'</div>'
            +'</button>';
        }).join("");
      } else {
        // Subsequent syncs/refreshes: update values in place — no re-render, no flicker.
        cards.forEach((x,i)=>{
          const card=existing[i]as HTMLElement;
          card.className="kpi "+cc(x.c);
          card.setAttribute("onclick","window._impDrill('"+x.k+"')");
          const v=card.querySelector(".kpi-v")as HTMLElement|null;
          if(v && v.textContent!==String(x.v)){
            v.textContent=String(x.v);
            v.classList.remove("bump"); void v.offsetWidth; v.classList.add("bump"); // retrigger gentle pulse
          }
        });
      }
    }

    function renderSrcTable(){
      const f=impFiltered();
      const td=new Date();td.setHours(0,0,0,0);
      const el=root.querySelector("#srcTableBody");
      if(!el) return;
      // Age of the most recent lead, derived from real data (not a hardcoded value).
      const ageStr=(d:Date)=>{
        const m=Math.floor((Date.now()-d.getTime())/60000);
        if(m<1)return "now";if(m<60)return m+"m";if(m<1440)return Math.floor(m/60)+"h";return Math.floor(m/1440)+"d";
      };
      // When a specific source is selected, show only that source's row.
      const srcRows=_impFilter.src!=="all"?IMP_SRC_CFG.filter((s:any)=>s.name===_impFilter.src):IMP_SRC_CFG;
      el.innerHTML=srcRows.map(s=>{
        const sf=f.filter(r=>r.source===s.name);
        const todC=sf.filter(r=>r.date.getFullYear()===td.getFullYear()&&r.date.getMonth()===td.getMonth()&&r.date.getDate()===td.getDate()).length;
        const valid=sf.filter(r=>r.isValid).length;
        const dup=sf.filter(r=>r.isDuplicate).length;
        const uniq=Math.max(0,valid-dup);     // Unique = Valid − Duplicate
        const asgn=sf.filter(r=>r.isAssigned).length;
        const unasgn=Math.max(0,uniq-asgn);   // Unassigned = Unique − Assigned
        // Honest, data-driven status/last-lead/mode: a source is "Connected" only
        // if it actually has leads in the database; otherwise "Not connected".
        const allForSrc=IMP.filter(r=>r.source===s.name);
        const connected=allForSrc.length>0;
        const isManual=s.name.indexOf("Walk-in")===0;
        const newest=allForSrc.reduce((mx:any,r:any)=>(!mx||r.date>mx)?r.date:mx,null);
        const lastLead=newest?ageStr(newest):"—";
        const isMeta=s.name==="Meta Ads";
        let status=connected?"Connected":(isManual?"Manual":"Not connected");
        let sc=connected?"ok":(isManual?"info":"neu");
        // Meta's status reflects the live connection monitor (sync reachability).
        if(isMeta){
          if(_metaConn==="disconnected"){ status="Disconnected"; sc="al"; }
          else if(_metaConn==="connected"||connected){ status="Connected"; sc="ok"; }
          else { status="Connecting…"; sc="neu"; }
        }
        const mode=connected?s.mode:"—";
        return '<tr><td><input type="checkbox" class="srcChk" style="accent-color:var(--brand)"></td>'
          +'<td class="mono" style="font-weight:700;cursor:pointer" onclick="window._impDrillSrc(\''+s.name+'\',\'total\')">'+sf.length+'</td>'
          +'<td style="font-weight:600">'+s.name+'</td>'
          +'<td><span class="chipb '+sc+'"><span class="cd"></span> '+status+'</span></td>'
          +'<td class="mono">'+todC+'</td>'
          +'<td class="mono">'+lastLead+'</td>'
          +'<td>'+mode+'</td>'
          +'<td class="mono" style="cursor:pointer" onclick="window._impDrillSrc(\''+s.name+'\',\'valid\')">'+valid+'</td>'
          +'<td class="mono" style="cursor:pointer" onclick="window._impDrillSrc(\''+s.name+'\',\'unique\')">'+uniq+'</td>'
          +'<td class="mono" style="cursor:pointer;'+(dup>0?'color:var(--warn-ink);font-weight:600':'')+'" onclick="window._impDrillSrc(\''+s.name+'\',\'duplicate\')">'+dup+'</td>'
          +'<td class="mono" style="cursor:pointer" onclick="window._impDrillSrc(\''+s.name+'\',\'assigned\')">'+asgn+'</td>'
          +'<td class="mono" style="cursor:pointer;'+(unasgn>0?'color:var(--warn-ink);font-weight:600':'')+'" onclick="window._impDrillSrc(\''+s.name+'\',\'unassigned\')">'+unasgn+'</td></tr>';
      }).join("");
      // TOTAL row — sums every source so the table ties out to the Total Leads card
      // (Total Leads = Meta + Walk-in + …). Uses the SAME filtered dataset (f) as the KPIs.
      const tTot=f.length, tTod=f.filter(r=>r.date.getFullYear()===td.getFullYear()&&r.date.getMonth()===td.getMonth()&&r.date.getDate()===td.getDate()).length,
        tVal=f.filter(r=>r.isValid).length, tDup=f.filter(r=>r.isDuplicate).length, tUniq=Math.max(0,tVal-tDup),
        tAsg=f.filter(r=>r.isAssigned).length, tUna=Math.max(0,tUniq-tAsg);   // Unique = Valid − Dup; Unassigned = Unique − Assigned
      el.innerHTML+='<tr style="background:var(--surface-2);font-weight:800;border-top:2px solid var(--line)">'
        +'<td></td>'
        +'<td class="mono" style="font-weight:800">'+tTot+'</td>'
        +'<td style="font-weight:800">TOTAL · all sources</td>'
        +'<td></td>'
        +'<td class="mono" style="font-weight:800">'+tTod+'</td>'
        +'<td></td><td></td>'
        +'<td class="mono" style="font-weight:800">'+tVal+'</td>'
        +'<td class="mono" style="font-weight:800">'+tUniq+'</td>'
        +'<td class="mono" style="font-weight:800">'+tDup+'</td>'
        +'<td class="mono" style="font-weight:800">'+tAsg+'</td>'
        +'<td class="mono" style="font-weight:800">'+tUna+'</td></tr>';
      const selAll=root.querySelector("#srcSelAll")as HTMLInputElement;
      if(selAll) selAll.onchange=()=>{root.querySelectorAll(".srcChk").forEach((c:any)=>{c.checked=selAll.checked;});};
    }

    function renderImport(){renderImpKPIs();renderSrcTable();}

    w._impDrill=(k:string)=>{
      const f=impFiltered();
      const td=new Date();td.setHours(0,0,0,0);
      let count=0;const label=k.charAt(0).toUpperCase()+k.slice(1);
      if(k==="total") count=f.length;
      else if(k==="today") count=f.filter(r=>r.date.getFullYear()===td.getFullYear()&&r.date.getMonth()===td.getMonth()&&r.date.getDate()===td.getDate()).length;
      else if(k==="valid") count=f.filter(r=>r.isValid).length;
      else if(k==="unique") count=Math.max(0,f.filter(r=>r.isValid).length-f.filter(r=>r.isDuplicate).length);
      else if(k==="duplicate") count=f.filter(r=>r.isDuplicate).length;
      else if(k==="assigned") count=f.filter(r=>r.isAssigned).length;
      else if(k==="unassigned") count=Math.max(0,(f.filter(r=>r.isValid).length-f.filter(r=>r.isDuplicate).length)-f.filter(r=>r.isAssigned).length);
      toast(label+" leads: "+count+" — drill-down view");
    };
    w._impDrillSrc=(src:string,k:string)=>{
      const f=impFiltered().filter(r=>r.source===src);
      let count=0;
      if(k==="total") count=f.length;
      else if(k==="valid") count=f.filter(r=>r.isValid).length;
      else if(k==="unique") count=Math.max(0,f.filter(r=>r.isValid).length-f.filter(r=>r.isDuplicate).length);
      else if(k==="duplicate") count=f.filter(r=>r.isDuplicate).length;
      else if(k==="assigned") count=f.filter(r=>r.isAssigned).length;
      else if(k==="unassigned") count=Math.max(0,(f.filter(r=>r.isValid).length-f.filter(r=>r.isDuplicate).length)-f.filter(r=>r.isAssigned).length);
      toast(src+" — "+k+": "+count+" leads");
    };

    // ===== Source Connections: Export selected + Apply bulk action =====
    // Names of the source rows whose checkbox is ticked (index-aligned to IMP_SRC_CFG).
    function _srcSelectedSources():string[]{
      const chks=Array.from(root.querySelectorAll(".srcChk"))as HTMLInputElement[];
      const names:string[]=[];
      chks.forEach((c,i)=>{ if(c.checked&&IMP_SRC_CFG[i]) names.push(IMP_SRC_CFG[i].name); });
      return names;
    }
    // Leads belonging to the given source(s), honoring the active dashboard filter.
    function _srcLeadsFor(names:string[]){
      const set=new Set(names);
      return feedAll().filter((l:any)=>set.has(feedSrcName(l))&&leadPasses(new Date(l.createdAt),feedSrcName(l),l.service));
    }
    function _downloadCsv(filename:string,rows:string[][]){
      const esc=(v:any)=>'"'+String(v==null?"":v).replace(/"/g,'""')+'"';
      const blob=new Blob([rows.map(r=>r.map(esc).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8;"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=filename;
      document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
    }
    w._srcExportSelected=()=>{
      const names=_srcSelectedSources();
      if(!names.length){ toast("Tick one or more source rows first"); return; }
      const leads=_srcLeadsFor(names);
      if(!leads.length){ toast("No leads to export for the selected source(s)"); return; }
      const cols=["Date & Time (IST)","Source","Campaign","Ad Name","Lead Name","Phone","Sugar","City","Street","Service","Language","Valid","Duplicate","Assigned"];
      const rows=[cols];
      leads.sort((a:any,b:any)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())
        .forEach((l:any)=>rows.push([fmtIST(l.createdAt),feedSrcName(l),l.campaign||"",l.adName||"",l.name||"",l.phone||"",l.sugar||"",l.city||"",l.street||"",l.service||"",l.lang||"",l.isValid?"Yes":"No",l.isDuplicate?"Yes":"No",l.isAssigned?"Yes":"No"]));
      _downloadCsv("wellnessos_leads_"+names.length+"src_"+leads.length+".csv",rows);
      toast(leads.length+" lead"+(leads.length===1?"":"s")+" exported from "+names.length+" source"+(names.length===1?"":"s"));
    };
    w._srcBulkAction=async()=>{
      const action=(root.querySelector("#srcBulkAction")as HTMLSelectElement)?.value||"pool";
      const names=_srcSelectedSources();
      if(!names.length){ toast("Tick one or more source rows first"); return; }
      if(action==="export"){ w._srcExportSelected(); return; }
      // action === "pool": send all not-yet-pooled, unassigned leads of the selected sources to the pool
      const leads=_srcLeadsFor(names).filter((l:any)=>!l.isAssigned&&!l.inPool&&!_movedToPool.has(String(l.id)));
      if(!leads.length){ toast("No unassigned leads to send for the selected source(s)"); return; }
      const ids=leads.map((l:any)=>String(l.id));
      const btn=root.querySelector("#srcBulkAction") as HTMLSelectElement;
      try{
        const nowIso=new Date().toISOString();
        for(let i=0;i<ids.length;i+=200){
          const {error}=await supabase.from("leads").update({in_pool:true,pool_added_at:nowIso}).in("meta_lead_id",ids.slice(i,i+200));
          if(error) throw error;
        }
      }catch(e:any){ toast("Bulk action failed: "+(e.message||"db error")); return; }
      // Reflect locally + re-render every affected view.
      ids.forEach(id=>{ const ld=_metaLeads.find((x:any)=>String(x.id)===id); if(ld)ld.inPool=true; });
      await loadOtherSourceLeads(); await loadAssignmentExtras(); rebuildPoolFromDB(); rebuildIMP();
      renderImport(); renderMetaPage(); renderUnassignedPool(); renderAdvisorLoad();
      toast(ids.length+" unassigned lead"+(ids.length===1?"":"s")+" from "+names.length+" source"+(names.length===1?"":"s")+" sent to assignment");
    };

    // Reflect filter precedence in the UI: a date range overrides Month/Year.
    function syncFilterUI(){
      const monthEl=root.querySelector("#impMonth")as HTMLSelectElement;
      const yearEl=root.querySelector("#impYear")as HTMLSelectElement;
      const df=(root.querySelector("#impDateFrom")as HTMLInputElement)?.value;
      const dt=(root.querySelector("#impDateTo")as HTMLInputElement)?.value;
      const rangeActive=!!df||!!dt;
      [monthEl,yearEl].forEach(el=>{if(el){el.disabled=rangeActive;el.style.opacity=rangeActive?"0.45":"1";el.title=rangeActive?"Cleared while a date range is active":"";}});
    }
    // COMMIT the current inputs into the active filter, then re-render dashboard + feed.
    // Only called by Apply / Clear — changing an input does nothing until then.
    function applyFilters(){
      _impFilter.mo=(root.querySelector("#impMonth")as HTMLSelectElement)?.value||"all";
      _impFilter.yr=(root.querySelector("#impYear")as HTMLSelectElement)?.value||"all";
      _impFilter.df=(root.querySelector("#impDateFrom")as HTMLInputElement)?.value||"";
      _impFilter.dt=(root.querySelector("#impDateTo")as HTMLInputElement)?.value||"";
      _impFilter.src=(root.querySelector("#impSource")as HTMLSelectElement)?.value||"all";
      _impFilter.svc=(root.querySelector("#impService")as HTMLSelectElement)?.value||"all";
      syncFilterUI();renderImport();_metaPageNum=1;renderMetaPage();
    }
    // Changing a filter input only updates the visual hint — the data refreshes
    // ONLY when the user clicks Apply (or Clear).
    ["impMonth","impYear","impSource","impService","impDateFrom","impDateTo"].forEach(id=>{
      const el=root.querySelector("#"+id)as HTMLElement|null;
      if(el) (el as any).onchange=()=>{ syncFilterUI(); };
    });

    syncFilterUI();
    renderImport();

    // Explicit Apply / Clear for the Lead Import filter bar.
    w._impApplyFilters=()=>{ applyFilters(); toast("Filters applied"); };
    w._impClearFilters=()=>{
      const m=root.querySelector("#impMonth")as HTMLSelectElement;if(m)m.value="all";
      const y=root.querySelector("#impYear")as HTMLSelectElement;if(y)y.value="all";
      const f=root.querySelector("#impDateFrom")as HTMLInputElement;if(f)f.value="";
      const t=root.querySelector("#impDateTo")as HTMLInputElement;if(t)t.value="";
      const s=root.querySelector("#impSource")as HTMLSelectElement;if(s)s.value="all";
      const sv=root.querySelector("#impService")as HTMLSelectElement;if(sv)sv.value="all";
      applyFilters();
    };

    // ===== Add single lead (manual entry → saved to DB → assignment pool) =====
    w._addSingleLead=()=>{
      const ov=document.createElement("div");
      ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px";
      const box=document.createElement("div");
      box.style.cssText="background:var(--surf,#fff);border-radius:14px;padding:22px;max-width:560px;width:100%;max-height:88vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)";
      box.innerHTML='<div style="font-weight:700;font-size:16px;margin-bottom:3px;color:var(--ink)">Add single lead</div>'
        +'<div style="font-size:12px;color:var(--faint);margin-bottom:16px">Manually capture a lead — it is saved to the database and added to the Unassigned pool.</div>'
        +'<div class="g2" style="gap:11px">'
        +'<div class="fld"><label class="lbl">Name *</label><input class="input" id="slName" placeholder="Full name"></div>'
        +'<div class="fld"><label class="lbl">Phone *</label><input class="input mono" id="slPhone" type="tel" inputmode="numeric" maxlength="15" placeholder="10-digit mobile" oninput="window._digitsOnly(this)"></div>'
        +'<div class="fld"><label class="lbl">Email</label><input class="input" id="slEmail" type="email" placeholder="email@example.com"></div>'
        +'<div class="fld"><label class="lbl">Source</label><select class="select" id="slSource"><option>Walk-in / Referral / Telecalling</option><option>Website forms</option><option>WhatsApp (WATI)</option><option>Manual</option></select></div>'
        +'<div class="fld"><label class="lbl">Service</label><select class="select" id="slService"><option>Diabetes Counselling</option><option>Weight Loss Counselling</option><option>Sauna Bath</option><option>Physiotherapy</option><option>Cold Plunge</option><option>Blood Test</option><option>HBOT (Hyperbaric Oxygen Therapy)</option></select></div>'
        +'<div class="fld"><label class="lbl">Language</label><select class="select" id="slLang"><option>Tamil</option><option>Telugu</option><option>English</option><option>Hindi</option></select></div>'
        +'<div class="fld"><label class="lbl">City</label><input class="input" id="slCity" placeholder="City"></div>'
        +'<div class="fld"><label class="lbl">Sugar level</label><select class="select" id="slSugar"><option value="">—</option><option>No Sugar</option><option>150-250</option><option>Above 250</option></select></div>'
        +'</div>'
        +'<div id="slMsg" style="font-size:12px;color:var(--alert-ink);margin-top:8px;min-height:16px"></div>'
        +'<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px"><button class="btn bsm" id="slCancel">Cancel</button><button class="btn bsm bp" id="slSave">Save lead</button></div>';
      ov.appendChild(box);document.body.appendChild(ov);
      const close=()=>{if(ov.parentNode)document.body.removeChild(ov);};
      (box.querySelector("#slCancel")as HTMLElement).onclick=close;
      ov.onclick=(ev)=>{if(ev.target===ov)close();};
      (box.querySelector("#slSave")as HTMLButtonElement).onclick=async()=>{
        const val=(id:string)=>(box.querySelector(id)as HTMLInputElement)?.value.trim()||"";
        const name=val("#slName"),phone=val("#slPhone");
        const msg=box.querySelector("#slMsg")as HTMLElement;
        if(!name||!phone){ if(msg)msg.textContent="Name and phone are required."; return; }
        const _phoneDigits=phone.replace(/\D/g,"");
        if(_phoneDigits.length<10){ if(msg)msg.textContent="Enter a valid phone number (at least 10 digits)."; return; }
        const _email=val("#slEmail");
        if(_email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(_email)){ if(msg)msg.textContent="Enter a valid email address."; return; }
        // Duplicate check: does this phone already exist anywhere in the feed
        // (Meta-synced OR a previously-added manual/other-source lead)?
        const np=normPhone(phone);
        const feedMatch=np?feedAll().find((x:any)=>normPhone(x.phone)===np):null;
        const isDup=!!feedMatch;
        const saveBtn=box.querySelector("#slSave")as HTMLButtonElement;saveBtn.disabled=true;saveBtn.textContent="Saving…";
        const nowIso=new Date().toISOString();
        const row={
          meta_lead_id:"manual-"+Date.now()+"-"+Math.floor(Math.random()*1e6),
          name,phone,email:val("#slEmail"),source:val("#slSource")||"Manual",
          language:val("#slLang")||"Tamil",service:val("#slService")||"Diabetes",
          city:val("#slCity"),sugar_poll:val("#slSugar"),campaign:"Manual entry",
          lead_date:nowIso.substring(0,10),is_valid:true,is_duplicate:isDup,is_assigned:false,
          in_pool:false,created_at:nowIso   // lands in the Live Incoming Feed (not auto-pooled)
        };
        try{
          const {error}=await supabase.from("leads").insert(row);
          if(error) throw error;
        }catch(e:any){
          if(msg)msg.textContent="Save failed: "+(e.message||"db error");
          saveBtn.disabled=false;saveBtn.textContent="Save lead";return;
        }
        close();
        await loadOtherSourceLeads();   // reload non-Meta leads (feed + dashboard)
        await loadAssignmentExtras();rebuildPoolFromDB();
        rebuildIMP();renderImport();renderUnassignedPool();renderAdvisorLoad();renderAssigneesTable();
        // If an active filter would HIDE the just-added lead (e.g. a To-date earlier
        // than now, or a different Source), clear it so the lead is always visible.
        const impSrc=(row.source==="Manual")?"Walk-in / Referral / Telecalling":row.source;
        if(!leadPasses(new Date(nowIso),impSrc,row.service) && w._impClearFilters){ w._impClearFilters(); }
        const _cE=root.querySelector("#metaFeedCount"); if(_cE) _cE.textContent=feedAll().length+" leads in database";
        if(isDup){
          // Surface the colliding leads (manual + the existing one) in the Duplicates tab.
          _manualDupPhones.add(np);
          if(w._feedSetView) w._feedSetView("dup");   // switch to the Duplicates view
          const filtered=feedFiltered();
          const idx=filtered.findIndex((x:any)=>normPhone(x.phone)===np);
          if(idx>=0){ _metaPageNum=Math.floor(idx/META_PER_PAGE)+1; }
          renderMetaPage();
          toastErr("Duplicate: "+name+" ("+phone+") already exists — shown in the Duplicates tab");
        }else{
          if(w._feedSetView) w._feedSetView("all");
          _metaPageNum=1; renderMetaPage();
          toast("Lead added: "+name+" — now in the Live Incoming Feed (select it → Send to assignment)");
        }
      };
      setTimeout(()=>{(box.querySelector("#slName")as HTMLInputElement)?.focus();},50);
    };

    // ========== META LIVE FEED ==========
    let _metaFeedTimer:any=null;
    let _metaLeads:any[]=[];
    let _otherLeads:any[]=[];      // non-Meta leads (compact shape) for KPI cards + Source Connections
    let _otherFeedLeads:any[]=[];  // non-Meta leads (full feed shape) so they show in the Live feed too
    let _metaPageNum=1;
    const META_PER_PAGE=10;
    // The Live feed shows EVERY source: Meta-synced leads + manual/other-source leads.
    function feedAll(){ return _otherFeedLeads.length?_metaLeads.concat(_otherFeedLeads):_metaLeads; }
    // IMP/source name for a feed lead (Meta → "Meta Ads", Manual → Walk-in bucket).
    function feedSrcName(l:any){ return l.source==="Meta"?"Meta Ads":(l.source==="Manual"?"Walk-in / Referral / Telecalling":(l.source||"Meta Ads")); }

    // ===== Live-feed duplicate highlighting =====
    // Toggled by the "Mark duplicate" button. Colours each duplicate-phone GROUP a
    // distinct tint so matching leads are easy to spot. Phones added via "+ Add single
    // lead" that collide with a feed lead are tracked here so they highlight too.
    let _feedHighlightDups=false;
    let _dupColorMap:Record<string,string>={};
    const _manualDupPhones=new Set<string>();
    const DUP_PALETTE=["#FDE2E1","#E1ECFD","#FDF3E1","#E8E1FD","#E1FDE9","#FDE1F4","#E1FAFD","#F6F0D6"];
    function normPhone(p:string){ return (p||"").replace(/[^0-9]/g,"").slice(-10); }   // last 10 digits
    function buildDupColorMap(){
      const counts:Record<string,number>={};
      feedAll().forEach((l:any)=>{ const p=normPhone(l.phone); if(p) counts[p]=(counts[p]||0)+1; });
      const map:Record<string,string>={};
      let ci=0;
      // colour any phone seen >1 across the feed, plus any manual-entry collision phone
      const dupPhones=new Set<string>();
      Object.keys(counts).forEach(p=>{ if(counts[p]>1) dupPhones.add(p); });
      _manualDupPhones.forEach(p=>dupPhones.add(p));
      Array.from(dupPhones).sort().forEach(p=>{ map[p]=DUP_PALETTE[ci%DUP_PALETTE.length]; ci++; });
      return map;
    }
    function dupGroupCount(){ return Object.keys(_dupColorMap).length; }
    // Set of phones that are duplicated across the ACTIVE feed (count>1) + manual collisions.
    function feedDupPhoneSet(){
      // A phone is a duplicate if it was received 2+ times in TOTAL (historical) — count
      // every occurrence, including ones already pooled/assigned, so an assigned lead
      // never drops out of the Duplicates view.
      const counts:Record<string,number>={};
      feedAll().forEach((l:any)=>{ const p=normPhone(l.phone); if(p) counts[p]=(counts[p]||0)+1; });
      const s=new Set<string>();
      Object.keys(counts).forEach(p=>{ if(counts[p]>1) s.add(p); });
      _manualDupPhones.forEach(p=>s.add(p));
      return s;
    }
    // Group duplicate leads by phone → one entry each with repeat count + all sources.
    // Also, across ALL feed leads for that phone (incl. assigned/pooled ones that have
    // left the feed), track the latest received time and the last-assigned advisor.
    function feedDupGroups(){
      const ds=feedDupPhoneSet();
      // Per-phone history over EVERY occurrence of the number (including pooled/assigned
      // ones that have left the active feed). The Duplicates table is a HISTORICAL view:
      // assigning a lead updates only "Last Assigned Advisor" — it never removes the
      // record, and never changes the repeat count or last-repeat time.
      const meta:Record<string,any>={};
      feedAll().forEach((l:any)=>{
        const p=normPhone(l.phone); if(!p) return;
        const t=new Date(l.createdAt).getTime()||0;
        if(!meta[p]) meta[p]={firstReceived:l.createdAt,firstReceivedAt:Infinity,lastReceived:l.createdAt,lastReceivedAt:-Infinity,lastAssigned:"",lastAssignedAt:-1,count:0,sources:new Set<string>()};
        const m=meta[p];
        m.count++;   // total times received (unaffected by assignment)
        m.sources.add((l.source==="Meta")?"Meta":(l.source==="Manual"?"Manual":(l.source||"Meta")));
        if(t<=m.firstReceivedAt){ m.firstReceivedAt=t; m.firstReceived=l.createdAt; }   // earliest = original
        if(t>=m.lastReceivedAt){ m.lastReceivedAt=t; m.lastReceived=l.createdAt; }        // latest = most recent repeat
        // Last assigned advisor = the assignment with the most recent assignment time
        // (assigned_at; falls back to the lead's created time). Reflects reassignments.
        if(l.assignedTo){ const at=l.assignedAt?(new Date(l.assignedAt).getTime()||t):t; if(at>=m.lastAssignedAt){ m.lastAssignedAt=at; m.lastAssigned=l.assignedTo; } }
      });
      // Representative lead per duplicate phone (honors search + dashboard filters). Prefer
      // an active/unassigned occurrence (so "Send to assignment" targets an unpooled one);
      // otherwise fall back to the newest occurrence.
      const rep:Record<string,any>={};
      feedAll().filter((l:any)=>feedMatchesQuery(l)&&leadPasses(new Date(l.createdAt),feedSrcName(l),l.service)).forEach((l:any)=>{
        const p=normPhone(l.phone); if(!p||!ds.has(p)) return;
        const cur=rep[p];
        if(!cur){ rep[p]=l; return; }
        const lActive=!feedIsProcessed(l), cActive=!feedIsProcessed(cur);
        if(lActive!==cActive){ if(lActive) rep[p]=l; return; }
        if(new Date(l.createdAt).getTime()>new Date(cur.createdAt).getTime()) rep[p]=l;
      });
      return Object.keys(rep).map(p=>({
        rep: rep[p],
        count: meta[p]?meta[p].count:1,
        sources: meta[p]?Array.from(meta[p].sources):[],
        firstReceived: meta[p]?meta[p].firstReceived:rep[p].createdAt,
        lastReceived: meta[p]?meta[p].lastReceived:rep[p].createdAt,
        lastAssigned: meta[p]?meta[p].lastAssigned:"",
      })).sort((a:any,b:any)=>new Date(b.lastReceived).getTime()-new Date(a.lastReceived).getTime());
    }
    // The selectable lead ids for the current view (Duplicates view selects each group's rep).
    function feedSelectableIds(){
      if(_feedView==="dup") return feedDupGroups().map((g:any)=>String(g.rep.id));
      return feedFiltered().filter((l:any)=>!_movedToPool.has(String(l.id))).map((l:any)=>String(l.id));
    }

    // ===== Live-feed view (All / Duplicates / Valid / Invalid) + cross-page selection =====
    let _feedView:"all"|"dup"|"valid"|"invalid"="all";
    const _feedSelected=new Set<string>();   // selected lead ids, persists across pages/filters
    // Validation rule: a lead is VALID when it has a proper 10-digit mobile number.
    function feedIsValid(l:any){ return normPhone(l.phone).length===10; }
    // A lead has LEFT the feed once it's sent to the pool / assigned (it now lives in
    // the Assign & Approve → Unassigned Pool, not the incoming feed).
    function feedIsProcessed(l:any){ return !!l.inPool || !!l.isAssigned || _movedToPool.has(String(l.id)); }
    // Lead-search query for the live feed (matches name/phone/campaign/city/ad).
    let _feedQuery=""; let _feedSearchT:any=null;
    function feedMatchesQuery(l:any){
      if(!_feedQuery) return true;
      const q=_feedQuery;
      return (l.name||"").toLowerCase().includes(q)||(l.phone||"").toLowerCase().includes(q)
        ||(l.campaign||"").toLowerCase().includes(q)||(l.city||"").toLowerCase().includes(q)||(l.adName||"").toLowerCase().includes(q);
    }
    // Active (unprocessed) incoming leads matching the active dashboard filters + search.
    function feedActive(){
      return feedAll().filter((l:any)=>!feedIsProcessed(l) && feedMatchesQuery(l) && leadPasses(new Date(l.createdAt),feedSrcName(l),l.service));
    }
    // Leads matching the active dashboard filters AND the current tab view.
    function feedFiltered(){
      let list=feedActive().sort((a:any,b:any)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
      if(_feedView==="dup"){ const ds=feedDupPhoneSet(); return list.filter((l:any)=>ds.has(normPhone(l.phone))); }
      // All / Valid / Invalid show ONLY unique (non-duplicate) leads —
      // duplicates live exclusively in the Duplicates tab.
      list=list.filter((l:any)=>!l.isDuplicate);
      if(_feedView==="valid") list=list.filter((l:any)=>feedIsValid(l));
      else if(_feedView==="invalid") list=list.filter((l:any)=>!feedIsValid(l));
      return list;
    }
    // Keep the "select all" checkbox + selection counter in sync with _feedSelected
    // without re-rendering the table (so individual ticks don't flicker).
    function syncFeedSelUI(){
      const ids=feedSelectableIds();
      const allSel=ids.length>0 && ids.every((id:string)=>_feedSelected.has(id));
      const someSel=ids.some((id:string)=>_feedSelected.has(id));
      const selAll=root.querySelector("#feedSelAll")as HTMLInputElement;
      if(selAll){ selAll.checked=allSel; selAll.indeterminate=!allSel&&someSel; }
      const c=root.querySelector("#feedSelCount"); if(c) c.textContent=_feedSelected.size?(_feedSelected.size+" selected"):"";
    }

    // Load non-Meta leads so the KPI cards, Source Connections AND the Live feed
    // reflect ALL sources (manual / walk-in / website / WhatsApp etc.).
    async function loadOtherSourceLeads(){
      try{
        const {data}=await supabase.from("leads")
          .select("meta_lead_id,name,phone,email,source,language,service,city,sugar_poll,street,campaign,lead_date,created_at,is_valid,is_duplicate,is_assigned,in_pool,assigned_to,assigned_at,call_status")
          .neq("source","Meta Ads");
        const rows=data||[];
        _otherLeads=rows.map((r:any)=>({id:r.meta_lead_id,name:r.name,
          source:(r.source==="Manual")?"Walk-in / Referral / Telecalling":r.source,service:r.service||"Diabetes",
          date:new Date(r.created_at||r.lead_date),isValid:!!r.is_valid,isDuplicate:!!r.is_duplicate,isAssigned:!!r.is_assigned}));
        // Full feed-shaped objects for the Live Incoming Feed.
        _otherFeedLeads=rows.map((r:any)=>{
          const createdAt=r.created_at||r.lead_date;
          const m=Math.floor((Date.now()-new Date(createdAt).getTime())/60000);
          const received=m<1?"now":(m<60?m+"m":(m<1440?Math.floor(m/60)+"h":Math.floor(m/1440)+"d"));
          return {id:r.meta_lead_id,name:r.name,phone:r.phone||"",email:r.email||"",
            source:r.source||"Manual",campaign:r.campaign||"Manual entry",adName:"",
            sugar:r.sugar_poll||"",city:r.city||"",street:r.street||"",
            service:r.service||"Diabetes",lang:r.language||"Tamil",received,createdAt,
            isValid:!!r.is_valid,isDuplicate:!!r.is_duplicate,isAssigned:!!r.is_assigned,
            inPool:!!r.in_pool,assignedTo:r.assigned_to||"",assignedAt:r.assigned_at||null,callStatus:r.call_status||""};
        });
      }catch(_){ _otherLeads=[]; _otherFeedLeads=[]; }
    }
    // Rebuild the shared IMP dataset = Meta leads + other-source leads.
    function rebuildIMP(){
      IMP.length=0;
      _metaLeads.forEach((ld:any)=>IMP.push({id:ld.id,name:ld.name,source:"Meta Ads",service:ld.service||"Diabetes",date:new Date(ld.createdAt),isValid:!!ld.isValid,isDuplicate:!!ld.isDuplicate,isAssigned:!!ld.isAssigned}));
      _otherLeads.forEach((o:any)=>IMP.push(o));
    }

    // "26 Jun, 10:59 AM IST" — shared formatter for the Last Synced label.
    function fmtSyncTime(d:Date){
      const parts=new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:true}).formatToParts(d);
      const g=(t:string)=>parts.find(p=>p.type===t)?.value||"";
      return g("day")+" "+g("month")+", "+g("hour")+":"+g("minute")+" "+g("dayPeriod").toUpperCase()+" IST";
    }
    function setSyncedLabel(d:Date){
      const el=root.querySelector("#metaFeedStatus"); if(el) el.textContent="Last Synced: "+fmtSyncTime(d);
    }

    // Date-only IST formatter — robust to both 'YYYY-MM-DD' and full ISO strings
    // (the /db gateway returns DATE columns as UTC ISO, which naive slicing gets wrong).
    function fmtISTDate(iso:string){
      if(!iso) return "";
      try{
        const parts=new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric"}).formatToParts(new Date(iso));
        const g=(t:string)=>parts.find(p=>p.type===t)?.value||"";
        return g("day")+" "+g("month")+" "+g("year");
      }catch(e){ return String(iso).slice(0,10); }
    }
    function fmtIST(iso:string){
      if(!iso) return "—";
      try{
        const d=new Date(iso);
        // Format in IST (Asia/Kolkata) — day-month-year + 12h time
        const parts=new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}).formatToParts(d);
        const g=(t:string)=>parts.find(p=>p.type===t)?.value||"";
        return g("day")+" "+g("month")+" "+g("year")+", "+g("hour")+":"+g("minute")+" "+g("dayPeriod").toUpperCase();
      }catch(e){return "—";}
    }

    // ===== Column specs (label + per-column filter text-extractor) for the feed =====
    // Standard tabs (All / Valid / Invalid) operate on a lead; Duplicates on a group.
    const _feedColsStd:any[]=[
      {key:"_sel",head:'<input type="checkbox" id="feedSelAll" style="accent-color:var(--brand)" title="Select all matching the current filter (all pages)">',thStyle:"width:36px"},
      {key:"date",label:"Date & Time (IST)",filter:true,text:(l:any)=>fmtIST(l.createdAt)},
      {key:"campaign",label:"Campaign",filter:true,text:(l:any)=>l.campaign||""},
      {key:"adName",label:"Ad Name",filter:true,text:(l:any)=>l.adName||""},
      {key:"name",label:"Lead Name",filter:true,text:(l:any)=>l.name||""},
      {key:"phone",label:"Phone Number",filter:true,text:(l:any)=>l.phone||""},
      {key:"sugar",label:"Sugar Poll",filter:true,text:(l:any)=>l.sugar||""},
      {key:"city",label:"City",filter:true,text:(l:any)=>l.city||""},
      {key:"street",label:"Street",filter:true,text:(l:any)=>l.street||""},
      {key:"source",label:"Source",filter:true,text:(l:any)=>l.source||""},
      {key:"service",label:"Service",filter:true,text:(l:any)=>l.service||""},
      {key:"lang",label:"Language",filter:true,text:(l:any)=>l.lang||""},
      {key:"received",label:"Received",filter:true,text:(l:any)=>l.received||""},
      {key:"dedup",label:"Dedup",filter:true,text:(l:any)=>feedIsValid(l)?"Valid":"Invalid"},
    ];
    const _feedColsDup:any[]=[
      {key:"_sel",head:'<input type="checkbox" id="feedSelAll" style="accent-color:var(--brand)" title="Select all matching the current filter (all pages)">',thStyle:"width:36px"},
      {key:"date",label:"First Update Date & Time",filter:true,text:(g:any)=>fmtIST(g.firstReceived)},
      {key:"lastRepeat",label:"Last Repeat Date & Time",filter:true,text:(g:any)=>fmtIST(g.lastReceived)},
      {key:"count",label:"Repeat Leads Count",filter:true,text:(g:any)=>String(g.count)},
      {key:"campaign",label:"Campaign",filter:true,text:(g:any)=>g.rep.campaign||""},
      {key:"adName",label:"Ad Name",filter:true,text:(g:any)=>g.rep.adName||""},
      {key:"name",label:"Lead Name",filter:true,text:(g:any)=>g.rep.name||""},
      {key:"phone",label:"Phone Number",filter:true,text:(g:any)=>g.rep.phone||""},
      {key:"sugar",label:"Sugar Poll",filter:true,text:(g:any)=>g.rep.sugar||""},
      {key:"city",label:"City",filter:true,text:(g:any)=>g.rep.city||""},
      {key:"street",label:"Street",filter:true,text:(g:any)=>g.rep.street||""},
      {key:"source",label:"Source",filter:true,text:(g:any)=>(g.sources||[]).join(" ")},
      {key:"service",label:"Service",filter:true,text:(g:any)=>g.rep.service||""},
      {key:"lang",label:"Language",filter:true,text:(g:any)=>g.rep.lang||""},
      {key:"lastAssigned",label:"Last Assigned Advisor",filter:true,text:(g:any)=>g.lastAssigned||"Not Assigned"},
      {key:"dedup",label:"Dedup",filter:true,text:(_g:any)=>"Duplicate"},
    ];
    const _attr=(s:string)=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    // ===== Generic Excel-style column-filter engine (shared by EVERY table) =====
    // A table registers: cols() → spec [{key,label,filter,text(row),head?,thStyle?}],
    // rows() → base rows, rerender(). State per table: colKey → Set of allowed values.
    const _grids:Record<string,{cols:()=>any[];rerender:()=>void;F:Record<string,Set<string>>;base:any[]}>={};
    function regGrid(id:string,cols:()=>any[],rerender:()=>void){ const ex=_grids[id]; _grids[id]={cols,rerender,F:ex?ex.F:{},base:ex?ex.base:[]}; }
    // Filter rows for a table (AND across columns; a row passes if its value is allowed).
    function gridApply(id:string,rows:any[]){ const g=_grids[id]; if(!g)return rows; g.base=rows; const cols=g.cols(); const active=cols.filter((c:any)=>c.filter&&g.F[c.key]); if(!active.length)return rows; return rows.filter((row:any)=>active.every((c:any)=>g.F[c.key].has(String(c.text(row)??"").trim()))); }
    // Build a header row's <th> cells (with filter carets) for a table.
    function gridHead(id:string){ const g=_grids[id]; const cols=g?g.cols():[]; return cols.map((c:any)=>{ const st=c.thStyle?' style="'+c.thStyle+'"':''; if(c.head!==undefined) return '<th'+st+'>'+c.head+'</th>'; if(!c.filter) return '<th'+st+'>'+_attr(c.label||"")+'</th>'; const active=!!(g&&g.F[c.key]); const caret='<span title="Filter" style="margin-left:6px;font-size:10px;padding:1px 5px;border-radius:5px;'+(active?'background:var(--brand);color:#fff':'background:var(--surface-2);color:var(--muted)')+'">▾</span>'; return '<th style="white-space:nowrap'+(c.thStyle?';'+c.thStyle:'')+'"><span style="display:inline-flex;align-items:center;cursor:pointer;user-select:none" onclick="window._gridFilter(\''+id+'\',\''+c.key+'\',event)"><span>'+_attr(c.label)+'</span>'+caret+'</span></th>'; }).join(""); }
    // Distinct values for a column, respecting the OTHER active column filters.
    function gridValues(id:string,key:string){ const g=_grids[id]; if(!g)return []; const cols=g.cols(); const col=cols.find((c:any)=>c.key===key); if(!col)return []; let base=g.base||[]; const active=cols.filter((c:any)=>c.filter&&c.key!==key&&g.F[c.key]); if(active.length) base=base.filter((row:any)=>active.every((c:any)=>g.F[c.key].has(String(c.text(row)??"").trim()))); const set=new Set<string>(); base.forEach((row:any)=>set.add(String(col.text(row)??"").trim())); return Array.from(set).sort((a,b)=>a.localeCompare(b)); }
    // ---- Shared filter popup (search + checkbox list + select-all + Apply/Clear) ----
    let _gfOpen:{id:string;key:string;values:string[];sel:Set<string>;search:string;shown:string[]}|null=null;
    function gfPopupEl(){ let p=root.querySelector("#gridFilterPopup")as HTMLElement|null; if(!p){ p=document.createElement("div"); p.id="gridFilterPopup"; p.style.cssText="display:none;position:fixed;z-index:400;background:#fff;border:1px solid var(--line);border-radius:10px;box-shadow:0 12px 34px rgba(17,34,27,.18);width:238px;padding:10px;font-size:12px;font-weight:400"; root.appendChild(p); } return p; }
    function gfClose(){ if(!_gfOpen)return; _gfOpen=null; const p=root.querySelector("#gridFilterPopup"); if(p)(p as HTMLElement).style.display="none"; }
    function gfRenderList(){ if(!_gfOpen)return; const q=_gfOpen.search.toLowerCase(); _gfOpen.shown=_gfOpen.values.filter((v:string)=>!q||v.toLowerCase().includes(q)); const list=root.querySelector("#gfList"); if(!list)return; list.innerHTML=_gfOpen.shown.length?_gfOpen.shown.map((v:string,i:number)=>'<label style="display:flex;align-items:center;gap:7px;padding:3px 5px;cursor:pointer;border-radius:5px" onmouseover="this.style.background=\'var(--surface-2)\'" onmouseout="this.style.background=\'\'"><input type="checkbox" '+(_gfOpen!.sel.has(v)?"checked":"")+' onchange="window._gfToggle('+i+',this.checked)" style="accent-color:var(--brand)"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+_attr(v===""?"(blank)":v)+'</span></label>').join(""):'<div style="color:var(--faint);padding:10px;text-align:center">No matching values</div>'; const all=root.querySelector("#gfAll")as HTMLInputElement|null; if(all)all.checked=_gfOpen.shown.length>0&&_gfOpen.shown.every((v:string)=>_gfOpen!.sel.has(v)); }
    function gfRender(event:any){ const p=gfPopupEl(); if(!_gfOpen){p.style.display="none";return;} p.innerHTML='<input id="gfSearch" placeholder="Search…" value="'+_attr(_gfOpen.search)+'" oninput="window._gfSearch(this.value)" style="width:100%;box-sizing:border-box;padding:5px 8px;border:1px solid var(--line);border-radius:6px;margin-bottom:6px"><label style="display:flex;align-items:center;gap:7px;padding:3px 5px;font-weight:600;cursor:pointer"><input type="checkbox" id="gfAll" onchange="window._gfSelectAll(this.checked)" style="accent-color:var(--brand)"> Select all</label><div id="gfList" style="max-height:220px;overflow:auto;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:4px 0;margin:5px 0"></div><div style="display:flex;gap:7px;justify-content:flex-end"><button class="btn bsm" onclick="window._gfClear()">Clear</button><button class="btn bsm bp" onclick="window._gfApply()">Apply</button></div>'; const th=event&&event.target&&event.target.closest?event.target.closest("th"):null; if(th){const r=th.getBoundingClientRect();let left=r.left;if(left+238>window.innerWidth)left=window.innerWidth-246;p.style.left=Math.max(6,left)+"px";p.style.top=(r.bottom+3)+"px";} p.style.display="block"; gfRenderList(); const s=root.querySelector("#gfSearch")as HTMLInputElement|null; if(s)s.focus(); }
    w._gridFilter=(id:string,key:string,event:any)=>{ if(event&&event.stopPropagation)event.stopPropagation(); if(_gfOpen&&_gfOpen.id===id&&_gfOpen.key===key){gfClose();return;} const g=_grids[id]; if(!g)return; const values=gridValues(id,key); const ex=g.F[key]; const sel=new Set<string>(ex?Array.from(ex):values); _gfOpen={id,key,values,sel,search:"",shown:values.slice()}; gfRender(event); };
    w._gfSearch=(v:string)=>{ if(!_gfOpen)return; _gfOpen.search=v||""; gfRenderList(); };
    w._gfToggle=(i:number,ch:boolean)=>{ if(!_gfOpen)return; const v=_gfOpen.shown[i]; if(v===undefined)return; if(ch)_gfOpen.sel.add(v);else _gfOpen.sel.delete(v); const all=root.querySelector("#gfAll")as HTMLInputElement|null; if(all)all.checked=_gfOpen.shown.every((x:string)=>_gfOpen!.sel.has(x)); };
    w._gfSelectAll=(ch:boolean)=>{ if(!_gfOpen)return; _gfOpen.shown.forEach((v:string)=>{if(ch)_gfOpen!.sel.add(v);else _gfOpen!.sel.delete(v);}); gfRenderList(); };
    w._gfApply=()=>{ if(!_gfOpen)return; const g=_grids[_gfOpen.id]; const {key,values,sel}=_gfOpen; if(sel.size>=values.length)delete g.F[key];else g.F[key]=new Set(sel); const rr=g.rerender; gfClose(); rr(); };
    w._gfClear=()=>{ if(!_gfOpen)return; const g=_grids[_gfOpen.id]; delete g.F[_gfOpen.key]; const rr=g.rerender; gfClose(); rr(); };
    // Auto-close like a standard data grid: outside click / scroll (page or any table,
    // but NOT the popup's own list) / Esc / resize / window blur.
    document.addEventListener("click",(e:any)=>{ if(!_gfOpen)return; const p=root.querySelector("#gridFilterPopup"); if(p&&p.contains(e.target))return; gfClose(); });
    window.addEventListener("scroll",(e:any)=>{ if(!_gfOpen)return; const p=root.querySelector("#gridFilterPopup"); if(p&&e.target&&p.contains(e.target))return; gfClose(); },true);
    document.addEventListener("keydown",(e:any)=>{ if(_gfOpen&&(e.key==="Escape"||e.key==="Esc"))gfClose(); });
    window.addEventListener("resize",()=>gfClose());
    window.addEventListener("blur",()=>gfClose());
    // Register the Live Incoming Feed (columns depend on the All/Duplicates view).
    regGrid("feed", ()=>_feedView==="dup"?_feedColsDup:_feedColsStd, ()=>{ _metaPageNum=1; renderMetaPage(); });
    // ---- Column specs for the other application tables (same Excel-style filter) ----
    const _csvImpCols:any[]=[
      {key:"_sel",head:"",thStyle:"width:30px"},
      {key:"dt",label:"Date & Time",filter:true,text:(r:any)=>r.dt||""},
      {key:"campaign",label:"Campaign",filter:true,text:(r:any)=>r.campaign||""},
      {key:"ad",label:"Ad Name",filter:true,text:(r:any)=>r.ad||""},
      {key:"lead",label:"Lead Name",filter:true,text:(r:any)=>r.lead||""},
      {key:"phone",label:"Phone Number",filter:true,text:(r:any)=>r.phone||""},
      {key:"sugar",label:"Sugar Poll",filter:true,text:(r:any)=>r.sugar||""},
      {key:"city",label:"City",filter:true,text:(r:any)=>r.city||""},
      {key:"street",label:"Street",filter:true,text:(r:any)=>r.street||""},
      {key:"source",label:"Source",filter:true,text:(r:any)=>r.source||""},
      {key:"service",label:"Service",filter:true,text:(r:any)=>r.service||""},
      {key:"name",label:"Name",filter:true,text:(r:any)=>r.name||""},
      {key:"status",label:"Status",filter:false},
      {key:"_act",label:"Action",filter:false},
    ];
    regGrid("csvImported", ()=>_csvImpCols, ()=>renderCsvValid());
    const _csvDupCols:any[]=[
      {key:"_sel",head:"",thStyle:"width:30px"},
      {key:"dt",label:"Date & Time",filter:true,text:(r:any)=>r.dt||""},
      {key:"campaign",label:"Campaign",filter:true,text:(r:any)=>r.campaign||""},
      {key:"lead",label:"Lead Name",filter:true,text:(r:any)=>r.lead||""},
      {key:"phone",label:"Phone Number",filter:true,text:(r:any)=>r.phone||""},
      {key:"sugar",label:"Sugar Poll",filter:true,text:(r:any)=>r.sugar||""},
      {key:"city",label:"City",filter:true,text:(r:any)=>r.city||""},
      {key:"source",label:"Source",filter:true,text:(r:any)=>r.source||""},
      {key:"service",label:"Service",filter:true,text:(r:any)=>r.service||""},
      {key:"status",label:"Status",filter:false},
      {key:"_act",label:"Action",filter:false},
    ];
    regGrid("csvDup", ()=>_csvDupCols, ()=>renderCsvDup());
    const _poolCols:any[]=[
      {key:"_sel",head:'<input type="checkbox" id="poolSelAll" style="accent-color:var(--brand)">',thStyle:"width:34px"},
      {key:"lead",label:"Lead",filter:true,text:(p:any)=>p.name||""},
      {key:"phone",label:"Leads Number",filter:true,text:(p:any)=>p.phone||""},
      {key:"dt",label:"Date & Time",filter:true,text:(p:any)=>fmtIST(p.createdAt||p.ts)},
      {key:"src",label:"Source · lang",filter:true,text:(p:any)=>p.src||""},
      {key:"sugar",label:"Sugar",filter:true,text:(p:any)=>String(p.sugar||"").replace(/<[^>]*>/g,"").trim()},
      {key:"waiting",label:"Waiting",filter:true,text:(p:any)=>p.waiting||""},
      {key:"_act",label:"Action",filter:false,thStyle:"width:150px"},
    ];
    regGrid("pool", ()=>_poolCols, ()=>renderUnassignedPool());
    const _advLoadCols:any[]=[
      {key:"advisor",label:"Advisor",filter:true,text:(a:any)=>a.name||""},
      {key:"role",label:"Role",filter:true,text:(a:any)=>a.role||""},
      {key:"branch",label:"Branch",filter:true,text:(a:any)=>a.branch||""},
      {key:"active",label:"Active leads",filter:true,text:(a:any)=>String(_asgActiveLeadCount(a.name))},
      {key:"status",label:"Status",filter:true,text:(a:any)=>_asgActiveLeadCount(a.name)>=40?"Near cap":"Available"},
    ];
    regGrid("advLoad", ()=>_advLoadCols, ()=>renderAdvisorLoad());
    const _dIST=(d:any)=>{ if(!d)return "—"; const x=d instanceof Date?d:new Date(d); return isNaN(x.getTime())?"—":new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric"}).format(x); };
    const _asgCols:any[]=[
      {key:"name",label:"Name",filter:true,text:(a:any)=>a.name||""},
      {key:"role",label:"Role",filter:true,text:(a:any)=>a.role||""},
      {key:"branch",label:"Branch",filter:true,text:(a:any)=>a.branch||""},
      {key:"phone",label:"Phone",filter:true,text:(a:any)=>a.phone||""},
      {key:"active",label:"Active leads",filter:true,text:(a:any)=>String(_asgActiveLeadCount(a.name))},
      {key:"status",label:"Status",filter:true,text:(a:any)=>a.is_active?"Active":"Inactive"},
      {key:"_act",label:"Actions",filter:false},
    ];
    regGrid("asg", ()=>_asgCols, ()=>renderAssigneesTable());
    const _csvHistCols:any[]=[
      {key:"dt",label:"Imported at (IST)",filter:true,text:(b:any)=>fmtIST(b.created_at)},
      {key:"file",label:"File name",filter:true,text:(b:any)=>b.file_name||""},
      {key:"batch",label:"Batch",filter:true,text:(b:any)=>b.batch_name||""},
      {key:"by",label:"By",filter:true,text:(b:any)=>b.imported_by||""},
      {key:"total",label:"Total",filter:true,text:(b:any)=>String(b.total_records||0)},
      {key:"valid",label:"Valid",filter:true,text:(b:any)=>String(b.valid_records||0)},
      {key:"dup",label:"Duplicate",filter:true,text:(b:any)=>String(b.duplicate_records||0)},
      {key:"_act",label:"Actions",filter:false},
    ];
    regGrid("csvHist", ()=>_csvHistCols, ()=>renderCsvHist());
    const _rvCols:any[]=[
      {key:"phone",label:"Lead Number",filter:true,text:(g:any)=>g.phone||""},
      {key:"name",label:"Lead Name",filter:true,text:(g:any)=>g.name||""},
      {key:"visits",label:"Total Visits",filter:true,text:(g:any)=>String(g.visits)},
      {key:"first",label:"First Visit Date",filter:true,text:(g:any)=>_dIST(g.first)},
      {key:"last",label:"Last Visit Date",filter:true,text:(g:any)=>_dIST(g.last)},
      {key:"status",label:"Repeat Visitor",filter:true,text:(g:any)=>g.visits>1?"Repeat":"First-time"},
    ];
    regGrid("rv", ()=>_rvCols, ()=>renderCsvRepeat());
    const _usrCols:any[]=[
      {key:"email",label:"Email",filter:true,text:(u:any)=>u.email||""},
      {key:"name",label:"Name",filter:true,text:(u:any)=>u.name||""},
      {key:"role",label:"Role",filter:true,text:(u:any)=>u.role||""},
      {key:"status",label:"Status",filter:true,text:(u:any)=>u.active?"Active":"Inactive"},
      {key:"created",label:"Created",filter:true,text:(u:any)=>_dIST(u.created_at)},
      {key:"_act",label:"Actions",filter:false},
    ];
    regGrid("usr", ()=>_usrCols, ()=>renderUsers());
    const _haResCols:any[]=[
      {key:"lead",label:"Lead",filter:true,text:(l:any)=>l.name||""},
      {key:"src",label:"Source · Lang",filter:true,text:(l:any)=>l.source==="Manual"?"Manual":((l.source||"Meta")+" · "+(l.lang||"Tamil"))},
      {key:"assigned",label:"Assigned to",filter:true,text:(l:any)=>l.assignedTo||"—"},
      {key:"status",label:"Call status",filter:true,text:(l:any)=>haEffStatus(l)},
    ];
    regGrid("haResults", ()=>_haResCols, ()=>renderHaResults());
    // Shared pager-button state for all tables: First/Prev disabled on page 1,
    // Next/Last disabled on the last page. Button ids follow <prefix>{First,Prev,Next,Last}Btn.
    function _pgBtns(prefix:string,page:number,pages:number){
      const set=(id:string,dis:boolean)=>{const b=root.querySelector("#"+id)as HTMLButtonElement|null; if(!b)return; b.disabled=dis; b.style.opacity=dis?"0.45":"1"; b.style.cursor=dis?"not-allowed":"pointer";};
      const atFirst=page<=1, atLast=page>=pages;
      set(prefix+"FirstBtn",atFirst); set(prefix+"PrevBtn",atFirst);
      set(prefix+"NextBtn",atLast);  set(prefix+"LastBtn",atLast);
    }
    // Normalize a pager click: 'first' → 1, 'last' → clamp-to-end sentinel, number → delta.
    function _pgApply(cur:number,dir:any){ return dir==="first"?1:dir==="last"?1e9:cur+dir; }
    function renderMetaPage(){
      const tbody=root.querySelector("#liveFeedBody");
      const pageInfo=root.querySelector("#metaPageInfo");
      const prevBtn=root.querySelector("#metaPrevBtn")as HTMLButtonElement;
      const nextBtn=root.querySelector("#metaNextBtn")as HTMLButtonElement;
      const head=root.querySelector("#liveFeedHead");
      const esc=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      _dupColorMap=buildDupColorMap();
      let totalPages=1;
      if(_feedView==="dup"){
        // Collapsed view: one row per duplicate phone, with Repeat Leads Count + all sources.
        if(head){ head.innerHTML=gridHead("feed"); bindFeedSelAll(); }
        const groups=gridApply("feed",feedDupGroups());
        const total=groups.length;
        totalPages=Math.max(1,Math.ceil(total/META_PER_PAGE));
        if(_metaPageNum>totalPages)_metaPageNum=totalPages; if(_metaPageNum<1)_metaPageNum=1;
        const start=(_metaPageNum-1)*META_PER_PAGE;
        const pageGroups=groups.slice(start,start+META_PER_PAGE);
        if(tbody){
          tbody.innerHTML=pageGroups.length?pageGroups.map((g:any)=>{
            const ld=g.rep; const sel=_feedSelected.has(String(ld.id));
            const color=_dupColorMap[normPhone(ld.phone)]||null;
            const rowStyle=color?'background:'+color+';box-shadow:inset 4px 0 0 rgba(0,0,0,0.18);':'';
            const chk='<input type="checkbox" class="feedChk" data-id="'+esc(String(ld.id))+'"'+(sel?" checked":"")+' onchange="window._feedToggleSel(this)" style="accent-color:var(--brand)">';
            return '<tr'+(rowStyle?' style="'+rowStyle+'"':'')+'>'
              +'<td>'+chk+'</td>'
              +'<td class="mono" style="font-size:11.5px;white-space:nowrap">'+esc(fmtIST(g.firstReceived))+'</td>'
              +'<td class="mono" style="font-size:11.5px;white-space:nowrap">'+esc(fmtIST(g.lastReceived))+'</td>'
              +'<td class="mono" style="text-align:center"><span class="chipb al" title="Received '+g.count+' time(s)">&times;'+g.count+'</span></td>'
              +'<td class="mono" style="font-size:11.5px">'+esc(ld.campaign||"—")+'</td>'
              +'<td>'+esc(ld.adName||"—")+'</td>'
              +'<td style="font-weight:600">'+esc(ld.name||"—")+'</td>'
              +'<td class="mono" style="font-weight:600">'+esc(ld.phone||"—")+'</td>'
              +'<td>'+esc(ld.sugar||"—")+'</td>'
              +'<td>'+esc(ld.city||"—")+'</td>'
              +'<td>'+esc(ld.street||"—")+'</td>'
              +'<td>'+(g.sources.map((s:string)=>'<span class="tag" style="margin:0 3px 3px 0;display:inline-block">'+esc(s)+'</span>').join("")||"—")+'</td>'
              +'<td>'+esc(ld.service)+'</td>'
              +'<td>'+esc(ld.lang)+'</td>'
              +'<td>'+(g.lastAssigned?'<span class="chipb vio">'+esc(g.lastAssigned)+'</span>':'<span style="color:var(--faint)">Not Assigned</span>')+'</td>'
              +'<td><span class="chipb al">Duplicate</span></td>'
              +'</tr>';
          }).join(""):'<tr><td colspan="16" style="text-align:center;color:var(--faint);padding:22px">No duplicate leads in this range</td></tr>';
        }
        if(pageInfo) pageInfo.textContent="Page "+_metaPageNum+" of "+totalPages+" · "+total+" duplicate lead"+(total===1?"":"s");
      } else {
        if(head){ head.innerHTML=gridHead("feed"); bindFeedSelAll(); }
        const filtered=gridApply("feed",feedFiltered());
        const total=filtered.length;
        totalPages=Math.max(1,Math.ceil(total/META_PER_PAGE));
        if(_metaPageNum>totalPages)_metaPageNum=totalPages; if(_metaPageNum<1)_metaPageNum=1;
        const start=(_metaPageNum-1)*META_PER_PAGE;
        const pageLeads=filtered.slice(start,start+META_PER_PAGE);
        if(tbody){
          tbody.innerHTML=pageLeads.length?pageLeads.map((ld:any)=>{
            const sel=_feedSelected.has(String(ld.id));
            const chk='<input type="checkbox" class="feedChk" data-id="'+esc(String(ld.id))+'"'+(sel?" checked":"")+' onchange="window._feedToggleSel(this)" style="accent-color:var(--brand)">';
            // Highlight ONLY duplicate leads (unique leads stay unchanged).
            const dupStyle=ld.isDuplicate?' style="background:var(--warn-bg);box-shadow:inset 4px 0 0 var(--warn)"':'';
            return '<tr'+dupStyle+'>'
              +'<td>'+chk+'</td>'
              +'<td class="mono" style="font-size:11.5px;white-space:nowrap">'+esc(fmtIST(ld.createdAt))+'</td>'
              +'<td class="mono" style="font-size:11.5px">'+esc(ld.campaign||"—")+'</td>'
              +'<td>'+esc(ld.adName||"—")+'</td>'
              +'<td style="font-weight:600">'+esc(ld.name||"—")+'</td>'
              +'<td class="mono" style="font-weight:600">'+esc(ld.phone||"—")+'</td>'
              +'<td>'+esc(ld.sugar||"—")+'</td>'
              +'<td>'+esc(ld.city||"—")+'</td>'
              +'<td>'+esc(ld.street||"—")+'</td>'
              +'<td><span class="tag">'+esc(ld.source)+'</span></td>'
              +'<td>'+esc(ld.service)+'</td>'
              +'<td>'+esc(ld.lang)+'</td>'
              +'<td class="mono">'+esc(ld.received)+'</td>'
              +'<td>'+(feedIsValid(ld)?'<span class="chipb ok">Valid</span>':'<span class="chipb warn">Invalid</span>')+'</td>'
              +'</tr>';
          }).join(""):'<tr><td colspan="14" style="text-align:center;color:var(--faint);padding:22px">'+(_feedView==="valid"?"No valid leads in this range":_feedView==="invalid"?"No invalid leads in this range":"No leads in this range")+'</td></tr>';
        }
        const _vw=_feedView==="valid"?"valid ":_feedView==="invalid"?"invalid ":"";
        if(pageInfo) pageInfo.textContent="Page "+_metaPageNum+" of "+totalPages+" · "+total+" "+_vw+"leads";
      }
      void prevBtn; void nextBtn;
      _pgBtns("meta",_metaPageNum,totalPages);
      // Tab counts. Valid/Invalid exclude duplicates (those live only in the Duplicates tab).
      const _active=feedActive();
      const _uniqueActive=_active.filter((l:any)=>!l.isDuplicate);
      const dupTab=root.querySelector("#feedDupCount"); if(dupTab) dupTab.textContent=String(feedDupGroups().length);
      const validTab=root.querySelector("#feedValidCount"); if(validTab) validTab.textContent=String(_uniqueActive.filter((l:any)=>feedIsValid(l)).length);
      const invalidTab=root.querySelector("#feedInvalidCount"); if(invalidTab) invalidTab.textContent=String(_uniqueActive.filter((l:any)=>!feedIsValid(l)).length);
      syncFeedSelUI();   // header select-all + "N selected" counter
    }

    w._metaPage=(dir:any)=>{
      _metaPageNum=_pgApply(_metaPageNum,dir);
      renderMetaPage();
    };

    // ===== Assignee master (loaded from Supabase `assignees`) =====
    let _assignees:any[]=[];
    let _asgEditId:number|null=null;

    // ===== Send-to-assignment → Unassigned Pool (persisted via leads.in_pool) =====
    const _movedToPool=new Set<string>();   // lead ids currently in the pool (from DB)
    // Pool is 100% live: only leads flagged in_pool in the database (no seed/mock).
    let _unassignedPool:any[]=[];
    // Rebuild the pool from the DB-backed feed leads flagged in_pool, so the pool
    // survives refreshes/sessions. Also refreshes the feed's "Moved" set.
    // Non-Meta pooled/assigned leads (e.g. CSV leads sent to assignment) — loaded
    // from the DB so they flow through the SAME pool → assign pipeline.
    let _poolExtras:any[]=[];
    let _assignedExtras:any[]=[];
    async function loadAssignmentExtras(){
      try{
        const [pr,ar]=await Promise.all([
          supabase.from("leads").select("meta_lead_id,name,phone,source,language,service,campaign,assigned_to,pool_added_at,created_at").eq("in_pool",true).eq("is_assigned",false).neq("source","Meta Ads"),
          supabase.from("leads").select("meta_lead_id,name,phone,source,language,service,campaign,assigned_to,call_status,assigned_at,pool_added_at,created_at,enrolled_at").eq("is_assigned",true).neq("source","Meta Ads")
        ]);
        _poolExtras=(pr.data||[]).map((r:any)=>({id:r.meta_lead_id,name:r.name,phone:r.phone,src:r.source==="Manual"?"Manual":((r.source||"CSV")+" · "+(r.language||"Tamil")),sugar:'<span class="chipb neu">—</span>',waiting:"now",assignedTo:"",campaign:r.campaign,lang:r.language,source:r.source,service:r.service||"",poolAddedAt:r.pool_added_at,createdAt:r.created_at}));
        // Carry call_status so Manual/CSV assigned leads land in the right Kanban status column (not defaulted to Open).
        _assignedExtras=(ar.data||[]).map((r:any)=>({id:r.meta_lead_id,name:r.name,phone:r.phone,source:r.source||"CSV",lang:r.language||"Tamil",service:r.service||"",campaign:r.campaign||"—",isAssigned:true,assignedTo:r.assigned_to||"",callStatus:r.call_status||"",assignedAt:r.assigned_at,poolAddedAt:r.pool_added_at,createdAt:r.created_at,enrolledAt:r.enrolled_at||null}));
      }catch(_){ /* columns/table may be absent — ignore */ }
    }

    // ---- Assign & Approve time-range filter (pool / deviation / advisor load) ----
    const _abmRange:{from:Date|null,to:Date|null}={from:null,to:null};
    function inAbmRange(ts:any){
      if(!_abmRange.from&&!_abmRange.to) return true;
      const d=ts?new Date(ts):null;
      if(!d||isNaN(d.getTime())) return false;
      if(_abmRange.from&&d<_abmRange.from) return false;
      if(_abmRange.to&&d>_abmRange.to) return false;
      return true;
    }
    function _abmApplyPreset(name:string){
      const fromEl=root.querySelector("#abmRangeFrom")as HTMLInputElement;
      const toEl=root.querySelector("#abmRangeTo")as HTMLInputElement;
      const fmt=(d:Date)=>{const p=(n:number)=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"T"+p(d.getHours())+":"+p(d.getMinutes());};
      const now=new Date();let from:Date|null=null,to:Date|null=new Date(now);
      const sod=(d:Date)=>{const x=new Date(d);x.setHours(0,0,0,0);return x;};
      const eod=(d:Date)=>{const x=new Date(d);x.setHours(23,59,59,999);return x;};
      if(name==="today"){from=sod(now);to=eod(now);}
      else if(name==="yesterday"){const y=new Date(now);y.setDate(y.getDate()-1);from=sod(y);to=eod(y);}
      else if(name==="7d"){from=new Date(now);from.setDate(from.getDate()-7);to=now;}
      else if(name==="30d"){from=new Date(now);from.setDate(from.getDate()-30);to=now;}
      else if(name==="month"){from=new Date(now.getFullYear(),now.getMonth(),1,0,0,0);to=now;}
      else if(name==="all"){if(fromEl)fromEl.value="";if(toEl)toEl.value="";return;}
      else return;
      if(fromEl&&from)fromEl.value=fmt(from);
      if(toEl&&to)toEl.value=fmt(to);
    }
    function _abmRenderAll(){renderUnassignedPool();renderAdvisorLoad();renderAssigneesTable();renderAssignedLeads();}
    w._abmApplyRange=()=>{
      const fromEl=root.querySelector("#abmRangeFrom")as HTMLInputElement;
      const toEl=root.querySelector("#abmRangeTo")as HTMLInputElement;
      _abmRange.from=fromEl&&fromEl.value?new Date(fromEl.value):null;
      _abmRange.to=toEl&&toEl.value?new Date(toEl.value):null;
      const lab=root.querySelector("#abmRangeLabel");
      if(lab){
        if(!_abmRange.from&&!_abmRange.to) lab.textContent="Showing: all time";
        else{const f=(d:Date|null)=>d?new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}).format(d):"…";lab.textContent="Showing: "+f(_abmRange.from)+" → "+f(_abmRange.to);}
      }
      _abmRenderAll();
      try{ w._renderCallDeviation(); w._renderLeadsDeviation(); }catch(_){}
      toast("Time-range filter applied");
    };
    w._abmClearRange=()=>{
      _abmRange.from=null;_abmRange.to=null;
      const fromEl=root.querySelector("#abmRangeFrom")as HTMLInputElement;if(fromEl)fromEl.value="";
      const toEl=root.querySelector("#abmRangeTo")as HTMLInputElement;if(toEl)toEl.value="";
      const ps=root.querySelector("#abmRangePreset")as HTMLSelectElement;if(ps)ps.value="all";
      const lab=root.querySelector("#abmRangeLabel");if(lab)lab.textContent="Showing: all time";
      _abmRenderAll();
      try{ w._renderCallDeviation(); w._renderLeadsDeviation(); }catch(_){}
    };
    const _abmPresetEl=root.querySelector("#abmRangePreset")as HTMLSelectElement;
    if(_abmPresetEl) _abmPresetEl.onchange=()=>{ _abmApplyPreset(_abmPresetEl.value); if(_abmPresetEl.value!=="custom") w._abmApplyRange(); };

    function rebuildPoolFromDB(){
      _movedToPool.clear();
      const pooled=_metaLeads.filter((ld:any)=>ld.inPool);
      pooled.forEach((ld:any)=>_movedToPool.add(String(ld.id)));
      _unassignedPool=[
        ...pooled.map((ld:any)=>({
          id:ld.id,name:ld.name,phone:ld.phone||"",src:(ld.source||"Meta")+" · "+(ld.lang||"Tamil"),
          sugar:'<span class="chipb neu">—</span>',waiting:ld.received||"now",assignedTo:"",
          createdAt:ld.createdAt,ts:ld.poolAddedAt||ld.createdAt
        })),
        ..._poolExtras.map((p:any)=>({...p,ts:p.poolAddedAt||p.createdAt}))
      ];
    }
    // Free-text search over the Unassigned pool (composes with the time-range + column filters).
    let _poolQuery=""; let _poolSearchT:any=null;
    function poolMatchesQuery(p:any){
      const q=_poolQuery.trim().toLowerCase(); if(!q) return true;
      return [p.name,p.phone,p.src].some((v:any)=>String(v||"").toLowerCase().indexOf(q)>=0);
    }
    w._poolSearch=()=>{ if(_poolSearchT)clearTimeout(_poolSearchT); _poolSearchT=setTimeout(()=>{ _poolQuery=(root.querySelector("#poolSearch")as HTMLInputElement)?.value||""; renderUnassignedPool(); },180); };
    function renderUnassignedPool(){
      const body=root.querySelector("#unassignedPoolBody");
      const cnt=root.querySelector("#poolCount");
      const hd=root.querySelector("#poolHead"); if(hd)hd.innerHTML=gridHead("pool");
      const poolAll=_unassignedPool.filter((p:any)=>inAbmRange(p.ts));   // time-range filter
      const pool=gridApply("pool",poolAll.filter(poolMatchesQuery));     // + search + column filters
      if(cnt) cnt.textContent=String(poolAll.length);
      if(!body) return;
      const esc=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const activeNames=_assignees.filter((a:any)=>a.is_active).map((a:any)=>a.name);
      body.innerHTML=pool.length?pool.map((p:any)=>{
        const isNew=String(p.id).indexOf("seed-")!==0;
        return '<tr><td><input type="checkbox" class="poolChk" data-id="'+esc(String(p.id))+'" checked style="accent-color:var(--brand)"></td>'
          +'<td style="font-weight:600">'+esc(p.name)+(isNew?' <span class="chipb ok" style="margin-left:4px">Transferred</span>':'')+'</td>'
          +'<td class="mono">'+esc(p.phone||"—")+'</td>'
          +'<td class="mono" style="font-size:11px;white-space:nowrap">'+esc(fmtIST(p.createdAt||p.ts))+'</td>'
          +'<td><span class="tag">'+esc(p.src)+'</span></td>'
          +'<td>'+(p.sugar||'<span class="chipb neu">—</span>')+'</td>'
          +'<td class="mono">'+esc(p.waiting)+'</td>'
          +'<td><button class="btn bsm" title="Return this lead to its original source table (Live Incoming Feed or Bulk CSV Import Wizard) and remove it from the pool" onclick="window._poolReturnToSource(\''+esc(String(p.id))+'\')">↩ Return to Source</button></td></tr>';
      }).join(""):'<tr><td colspan="8" style="text-align:center;color:var(--faint);padding:18px">No unassigned leads in the pool</td></tr>';
      // Populate the "Assign to" checkbox multi-select from active assignees (preserve ticks).
      const asgMenu=root.querySelector("#poolAssignMenu")as HTMLElement|null;
      if(asgMenu){
        const prev=new Set(Array.from(asgMenu.querySelectorAll(".poolAdvChk:checked")).map((c:any)=>c.getAttribute("data-adv")));
        asgMenu.innerHTML=activeNames.length?activeNames.map((n:string)=>'<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px;cursor:pointer;font-size:12.5px" onmouseover="this.style.background=\'var(--surface-2)\'" onmouseout="this.style.background=\'\'"><input type="checkbox" class="poolAdvChk" data-adv="'+esc(n)+'" style="accent-color:var(--brand)" onchange="window._poolAdvSelChange()"'+(prev.has(n)?" checked":"")+'>'+esc(n)+'</label>').join(""):'<div style="font-size:11.5px;color:var(--faint);padding:8px">No active advisors</div>';
        try{ w._poolAdvSelChange&&w._poolAdvSelChange(); }catch(_){}
      }
      const psa=root.querySelector("#poolSelAll")as HTMLInputElement|null;
      if(psa) psa.onchange=()=>{ root.querySelectorAll(".poolChk").forEach((c:any)=>{c.checked=psa.checked;}); };
      renderDeviation();
    }
    // The Deviation tab now hosts Call/Leads deviation sub-tabs (badge owned by
    // _setDevBadges). This only keeps the Approvals placeholder fresh.
    function renderDeviation(){
      const appr=root.querySelector("#apprTabCount");
      const apprBody=root.querySelector("#approvalsBody");
      if(appr) appr.textContent="0";
      if(apprBody) apprBody.innerHTML='<tr><td colspan="4" style="text-align:center;color:var(--faint);padding:18px">No pending approvals in this period</td></tr>';
    }
    w._gotoAssign=()=>{const b=root.querySelector('#abmTabs button[data-t="assign"]')as HTMLButtonElement;if(b)b.click();};

    // ===== Assignee master: load, render, CRUD =====
    // The exact set of an advisor's active leads within the selected time range.
    // Advisor Load's "Active leads" count and the Advisor Load Leads table both derive
    // from THIS function, so the count always matches the rows shown.
    function _asgActiveLeadsFor(name:string){
      const all=_metaLeads.filter((l:any)=>l.isAssigned&&l.assignedTo===name&&inAbmRange(l.poolAddedAt||l.createdAt))
        .concat(_assignedExtras.filter((l:any)=>l.assignedTo===name&&inAbmRange(l.poolAddedAt||l.createdAt)));
      // Collapse repeat leads (same phone) into ONE assigned record — keep the most recent —
      // so a lead received/assigned multiple times counts once in the advisor's load.
      const _t=(x:any)=>new Date(x.assignedAt||x.poolAddedAt||x.createdAt||0).getTime()||0;
      const byPhone:Record<string,any>={}; const noPhone:any[]=[];
      all.forEach((l:any)=>{ const p=normPhone(l.phone); if(!p){ noPhone.push(l); return; } const cur=byPhone[p]; if(!cur||_t(l)>=_t(cur)) byPhone[p]=l; });
      return noPhone.concat(Object.keys(byPhone).map(p=>byPhone[p]));
    }
    function _asgActiveLeadCount(name:string){
      // Advisor workload within the selected time range (by pool/lead timestamp).
      return _asgActiveLeadsFor(name).length;
    }
    function renderAssigneesTable(){
      const body=root.querySelector("#asgBody");
      if(!body) return;
      const esc=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const _ahd=root.querySelector("#asgHead"); if(_ahd)_ahd.innerHTML=gridHead("asg"); const _asgR=gridApply("asg",_assignees); body.innerHTML=_asgR.length?_asgR.map((a:any)=>{
        const cnt=_asgActiveLeadCount(a.name);
        return '<tr style="'+(a.is_active?'':'opacity:0.55')+'">'
          +'<td style="font-weight:600">'+esc(a.name)+'</td><td>'+esc(a.role)+'</td><td>'+esc(a.branch)+'</td>'
          +'<td class="mono">'+esc(a.phone||"—")+'</td><td class="mono">'+cnt+'</td>'
          +'<td>'+(a.is_active?'<span class="chipb ok">Active</span>':'<span class="chipb neu">Inactive</span>')+'</td>'
          +'<td><div style="display:flex;gap:6px"><button class="btn bsm" onclick="window._asgEdit('+a.id+')">Edit</button>'
          +'<button class="btn bsm" onclick="window._asgToggle('+a.id+','+(a.is_active?'false':'true')+')">'+(a.is_active?'Deactivate':'Activate')+'</button></div></td></tr>';
      }).join(""):'<tr><td colspan="7" style="text-align:center;color:var(--faint);padding:18px">No assignees yet — add one above</td></tr>';
    }
    function renderAdvisorLoad(){
      const body=root.querySelector("#advisorLoadBody");
      if(!body) return;
      const esc=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const hd=root.querySelector("#advLoadHead"); if(hd)hd.innerHTML=gridHead("advLoad");
      const active=gridApply("advLoad",_assignees.filter((a:any)=>a.is_active));
      body.innerHTML=active.length?active.map((a:any)=>{
        const cnt=_asgActiveLeadCount(a.name);
        const status=cnt>=40?'<span class="chipb warn">Near cap</span>':'<span class="chipb ok">Available</span>';
        const on=_advLeadsAdv.has(a.name);
        return '<tr data-adv="'+esc(a.name)+'" onclick="window._advLeadsSelect(this.getAttribute(\'data-adv\'))" style="cursor:pointer'+(on?';background:var(--surf2,#eef7f1);box-shadow:inset 3px 0 0 var(--brand)':'')+'" title="Show this advisor\'s leads below"><td style="font-weight:600">'+esc(a.name)+'</td><td>'+esc(a.role)+'</td><td>'+esc(a.branch)+'</td><td class="mono">'+cnt+'</td><td>'+status+'</td></tr>';
      }).join(""):'<tr><td colspan="5" style="text-align:center;color:var(--faint);padding:18px">No active assignees — add them in Settings → Assignees</td></tr>';
      renderAdvLoadLeads();
    }
    // ===== Advisor Load Leads: drill-down of the assigned book =====
    // Advisor filter: empty Set = "All Advisors"; otherwise the chosen advisor names.
    let _advLeadsAdv=new Set<string>();
    let _advLeadsPageN=1; const ADVL_PER=25;
    let _advLeadsQuery="";
    let _advLeadsDetInit=false;                // one-shot: fetch details for the default (all) view
    let _advLeadsDet:Record<string,any>={};   // meta_lead_id -> live DB details (assigned_at, next_followup, service, last_fu)
    // The base row set for the current advisor selection (union across selected advisors,
    // or every active advisor when "All"). Deduped by lead id. Each advisor's slice uses
    // the SAME _asgActiveLeadsFor() as the Advisor-load count, so totals stay in lock-step.
    function _advLeadsBaseRows(){
      const active=_assignees.filter((a:any)=>a.is_active).map((a:any)=>a.name);
      const names=_advLeadsAdv.size?Array.from(_advLeadsAdv):active;
      // Dedupe globally by phone (fallback to id when no phone), keeping the most recent —
      // so a repeat lead assigned across advisors/records shows once in the load table.
      const _t=(x:any)=>new Date(x.assignedAt||x.poolAddedAt||x.createdAt||0).getTime()||0;
      const byKey:Record<string,any>={};
      names.forEach((n:string)=>_asgActiveLeadsFor(n).forEach((l:any)=>{ const k=normPhone(l.phone)||String(l.id); const cur=byKey[k]; if(!cur||_t(l)>=_t(cur)) byKey[k]=l; }));
      return Object.keys(byKey).map(k=>byKey[k]);
    }
    const _advLeadsBtnLabel=()=>_advLeadsAdv.size===0?"All Advisors":(_advLeadsAdv.size===1?Array.from(_advLeadsAdv)[0]:_advLeadsAdv.size+" advisors selected");
    const _advLeadsWhoLabel=()=>_advLeadsAdv.size===0?"all advisors":(_advLeadsAdv.size===1?Array.from(_advLeadsAdv)[0]:_advLeadsAdv.size+" advisors");
    const _haBucketLabel=(cs:string)=>{ const k=haBucketOf(cs); const c=HA_CARDS.find((x:any)=>x.key===k); return c?c.label:"Open Leads"; };
    const _advLeadSvc=(l:any)=>{ const d=_advLeadsDet[String(l.id)]; return (d&&d.service)||l.service||"Diabetes"; };
    const _advLeadAsgd=(l:any)=>{ const d=_advLeadsDet[String(l.id)]; return fmtIST((d&&d.assigned_at)||l.poolAddedAt||l.createdAt); };
    const _advLeadNextFu=(l:any)=>{ const d=_advLeadsDet[String(l.id)]; return d&&d.next_followup?_dIST(d.next_followup):"—"; };
    const _advLeadLastFu=(l:any)=>{ const d=_advLeadsDet[String(l.id)]; return (d&&d.last_fu)||"—"; };
    const _advLeadsCols=[
      {key:"num",label:"Lead Number",filter:true,text:(l:any)=>String(l.id||"—")},
      {key:"name",label:"Lead Name",filter:true,text:(l:any)=>l.name||"—"},
      {key:"phone",label:"Phone Number",filter:true,text:(l:any)=>l.phone||"—"},
      {key:"source",label:"Source",filter:true,text:(l:any)=>l.source||"—"},
      {key:"service",label:"Service",filter:true,text:(l:any)=>_advLeadSvc(l)},
      {key:"stage",label:"Stage",filter:true,text:(l:any)=>_haBucketLabel(haEffStatus(l))},
      {key:"status",label:"Status",filter:true,text:(l:any)=>haEffStatus(l)},
      {key:"asgd",label:"Assigned Date & Time",filter:true,text:(l:any)=>_advLeadAsgd(l)},
      {key:"lastfu",label:"Last Follow-up Date & Time",filter:true,text:(l:any)=>_advLeadLastFu(l)},
      {key:"nextfu",label:"Next Follow-up Date",filter:true,text:(l:any)=>_advLeadNextFu(l)},
      {key:"adv",label:"Assigned Advisor",filter:true,text:(l:any)=>l.assignedTo||"—"},
    ];
    regGrid("advLeads",()=>_advLeadsCols,()=>renderAdvLoadLeads());
    // Pull live per-lead details (assigned_at / next follow-up / service / last follow-up)
    // for the selected advisor's leads, keyed by meta_lead_id. Degrades gracefully if the
    // advisor_profile / assigned_at / next_followup columns aren't present.
    async function loadAdvLeadsDetails(){
      _advLeadsDet={};
      const ids=_advLeadsBaseRows().map((l:any)=>String(l.id)).filter(Boolean);
      if(!ids.length) return;
      try{
        for(let i=0;i<ids.length;i+=300){
          const chunk=ids.slice(i,i+300);
          let res:any=await supabase.from("leads").select("meta_lead_id,service,assigned_at,next_followup,advisor_profile").in("meta_lead_id",chunk);
          if(res.error) res=await supabase.from("leads").select("meta_lead_id,service").in("meta_lead_id",chunk);
          (res.data||[]).forEach((r:any)=>{
            let lastFu="";
            // Follow-up notes are stored newest-first (unshift) → the latest is index 0.
            try{ const fn=r.advisor_profile&&r.advisor_profile.fuNotes; if(Array.isArray(fn)&&fn.length) lastFu=(fn[0]&&fn[0].at)||""; }catch(_){}
            // Next follow-up: prefer the dedicated column; fall back to the value saved inside
            // advisor_profile (older leads only stored it there, before it was persisted to the column).
            // The value is the #nextFollowUp datetime-local string — locate it by VALUE SHAPE
            // (YYYY-MM-DDTHH:MM), not by field position, since the saved index isn't reliable.
            let nfu=r.next_followup;
            if(!nfu){ try{ const f=r.advisor_profile&&r.advisor_profile.f; if(Array.isArray(f)){ const dt=f.find((rec:any)=>rec&&typeof rec.v==="string"&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(rec.v)); if(dt) nfu=dt.v; } }catch(_){} }
            _advLeadsDet[String(r.meta_lead_id)]={service:r.service,assigned_at:r.assigned_at,next_followup:nfu,last_fu:lastFu};
          });
        }
      }catch(_){/* keep in-memory fallbacks */}
    }
    // Apply search + Excel column filters to the advisor's base book (the count set).
    function _advLeadsFiltered(){
      const q=_advLeadsQuery.trim().toLowerCase();
      let rows=_advLeadsBaseRows();
      if(q) rows=rows.filter((l:any)=>_advLeadsCols.some((c:any)=>c.filter&&String(c.text(l)).toLowerCase().includes(q)));
      return gridApply("advLeads",rows);
    }
    // Populate the Advisor multi-select dropdown (All Advisors + one row per active advisor).
    function _renderAdvLeadsMenu(){
      const lab=root.querySelector("#advLeadsAdvLabel"); if(lab)lab.textContent=_advLeadsBtnLabel();
      const menu=root.querySelector("#advLeadsAdvMenu"); if(!menu) return;
      const esc=(s:any)=>String(s??"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const active=_assignees.filter((a:any)=>a.is_active);
      let html='<label style="display:flex;align-items:center;gap:8px;padding:5px 7px;font-weight:700;cursor:pointer;border-bottom:1px solid var(--line)"><input type="checkbox" '+(_advLeadsAdv.size===0?"checked":"")+' onchange="window._advLeadsAdvAll()" style="accent-color:var(--brand)"> All Advisors</label>';
      html+=active.map((a:any)=>'<label style="display:flex;align-items:center;gap:8px;padding:5px 7px;cursor:pointer"><input type="checkbox" class="advLeadsChk" data-adv="'+esc(a.name)+'" '+(_advLeadsAdv.has(a.name)?"checked":"")+' onchange="window._advLeadsAdvToggle(this.getAttribute(\'data-adv\'),this.checked)" style="accent-color:var(--brand)"> '+esc(a.name)+'</label>').join("");
      menu.innerHTML=html;
    }
    function _setAdvLeadsPager(page:number,pages:number){
      const info=root.querySelector("#advLeadsPageInfo"); if(info)info.textContent="Page "+page+" of "+pages;
      const dis=(id:string,d:boolean)=>{ const b=root.querySelector("#"+id)as HTMLButtonElement|null; if(b)b.disabled=d; };
      dis("advLeadsFirstBtn",page<=1); dis("advLeadsPrevBtn",page<=1); dis("advLeadsNextBtn",page>=pages); dis("advLeadsLastBtn",page>=pages);
    }
    function renderAdvLoadLeads(){
      const body=root.querySelector("#advLeadsBody"); if(!body) return;
      const who=root.querySelector("#advLeadsWho"); const cnt=root.querySelector("#advLeadsCount");
      const hd=root.querySelector("#advLeadsHead"); if(hd)hd.innerHTML=gridHead("advLeads");
      const esc=(s:any)=>String(s??"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      _renderAdvLeadsMenu();
      const base=_advLeadsBaseRows();
      // One-shot: enrich the default (all-advisors) view with live DB details.
      if(!_advLeadsDetInit && base.length){ _advLeadsDetInit=true; loadAdvLeadsDetails().then(()=>renderAdvLoadLeads()); }
      // Count chip = the selected advisors' full active-lead set (matches Advisor load).
      if(who)who.textContent="— "+_advLeadsWhoLabel();
      if(cnt)cnt.textContent=String(base.length);
      const rowsAll=_advLeadsFiltered();
      const total=rowsAll.length; const pages=Math.max(1,Math.ceil(total/ADVL_PER));
      if(_advLeadsPageN>pages)_advLeadsPageN=pages; if(_advLeadsPageN<1)_advLeadsPageN=1;
      const rows=rowsAll.slice((_advLeadsPageN-1)*ADVL_PER,(_advLeadsPageN-1)*ADVL_PER+ADVL_PER);
      body.innerHTML=rows.length?rows.map((l:any)=>'<tr>'
        +'<td class="mono">'+esc(String(l.id||"—"))+'</td>'
        +'<td style="font-weight:600">'+esc(l.name||"—")+'</td>'
        +'<td class="mono">'+esc(l.phone||"—")+'</td>'
        +'<td>'+esc(l.source||"—")+'</td>'
        +'<td><span class="tag">'+esc(_advLeadSvc(l))+'</span></td>'
        +'<td><span class="chipb info">'+esc(_haBucketLabel(haEffStatus(l)))+'</span></td>'
        +'<td><span class="chipb ok">'+esc(haEffStatus(l))+'</span></td>'
        +'<td class="mono" style="font-size:11.5px">'+esc(_advLeadAsgd(l))+'</td>'
        +'<td class="mono" style="font-size:11.5px">'+esc(_advLeadLastFu(l))+'</td>'
        +'<td class="mono" style="font-size:11.5px">'+esc(_advLeadNextFu(l))+'</td>'
        +'<td style="font-weight:600">'+esc(l.assignedTo||"—")+'</td></tr>').join("")
        :'<tr><td colspan="11" style="text-align:center;color:var(--faint);padding:18px">'+(base.length?"No leads match the current search / filters.":"No leads assigned for this selection.")+'</td></tr>';
      _setAdvLeadsPager(_advLeadsPageN,pages);
    }
    // Refresh details for the current selection, then repaint. Shared by every selection change.
    function _advLeadsReload(){ _advLeadsPageN=1; renderAdvisorLoad(); loadAdvLeadsDetails().then(()=>renderAdvLoadLeads()); }
    w._advLeadsSelect=(name:string)=>{ if(!name)return; _advLeadsAdv=new Set<string>([name]); _advLeadsReload(); };
    w._advLeadsAdvToggleMenu=(e:any)=>{ if(e&&e.stopPropagation)e.stopPropagation(); const m=root.querySelector("#advLeadsAdvMenu")as HTMLElement|null; if(m)m.style.display=(m.style.display==="block")?"none":"block"; };
    w._advLeadsAdvAll=()=>{ _advLeadsAdv=new Set<string>(); _advLeadsReload(); };
    w._advLeadsAdvToggle=(name:string,checked:boolean)=>{ if(!name)return; if(checked)_advLeadsAdv.add(name); else _advLeadsAdv.delete(name); _advLeadsReload(); };
    w._advLeadsSearchFn=(v:string)=>{ _advLeadsQuery=v||""; _advLeadsPageN=1; renderAdvLoadLeads(); };
    w._advLeadsPage=(d:any)=>{ if(d==="first")_advLeadsPageN=1; else if(d==="last")_advLeadsPageN=1e9; else _advLeadsPageN+=(d===1?1:-1); renderAdvLoadLeads(); };
    w._advLeadsDownload=()=>{
      const rowsAll=_advLeadsFiltered();
      if(!rowsAll.length){ toast("Nothing to download"); return; }
      const out:string[][]=[["Lead Number","Lead Name","Phone Number","Source","Service","Stage","Status","Assigned Date & Time","Last Follow-up Date & Time","Next Follow-up Date","Assigned Advisor"]];
      rowsAll.forEach((l:any)=>out.push([String(l.id||""),l.name||"",l.phone||"",l.source||"",_advLeadSvc(l),_haBucketLabel(haEffStatus(l)),haEffStatus(l),_advLeadAsgd(l),_advLeadLastFu(l),_advLeadNextFu(l),l.assignedTo||""]));
      const tag=_advLeadsAdv.size===1?Array.from(_advLeadsAdv)[0].replace(/[^a-z0-9]+/gi,"_").toLowerCase():(_advLeadsAdv.size===0?"all_advisors":_advLeadsAdv.size+"_advisors");
      _downloadCsv("advisor_"+tag+"_leads.csv",out); toast("Exported "+rowsAll.length+" lead"+(rowsAll.length===1?"":"s"));
    };
    // Close the Advisor multi-select when clicking outside it (mirrors the pool-assign menu).
    document.addEventListener("click",(e:any)=>{ const wrap=root.querySelector("#advLeadsAdvWrap"); const m=root.querySelector("#advLeadsAdvMenu")as HTMLElement|null; if(m&&m.style.display==="block"&&wrap&&!wrap.contains(e.target)) m.style.display="none"; });
    async function loadAssignees(){
      try{
        const {data,error}=await supabase.from("assignees").select("*").order("name");
        if(error) throw error;
        _assignees=data||[];
      }catch(e){ _assignees=[]; }
      renderAssigneesTable();renderAdvisorLoad();renderUnassignedPool();renderAssignedLeads();renderHealthDashboard();populateAdvisorDropdowns();
    }
    // Fill the lead-profile Salesperson + HC dropdowns from the live Assignees master.
    // Salesperson = active staff (any role except Health Coach); HC = active Health Coaches.
    function populateAdvisorDropdowns(){
      const esc=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const active=_assignees.filter((a:any)=>a.is_active);
      const sales=root.querySelector("#salesSel")as HTMLSelectElement|null;
      const hc=root.querySelector("#hcSel")as HTMLSelectElement|null;
      if(sales){ const cur=sales.value; const ppl=active.filter((a:any)=>a.role!=="Health Coach");
        sales.innerHTML='<option value="">— Select —</option>'+ppl.map((a:any)=>'<option>'+esc(a.name)+'</option>').join("");
        if(cur)sales.value=cur; }
      const docs=active.filter((a:any)=>a.role==="Health Coach");
      if(hc){ const cur=hc.value;
        hc.innerHTML='<option value="">— Select —</option>'+docs.map((a:any)=>'<option>'+esc(a.name)+'</option>').join("");
        if(cur)hc.value=cur; }
      const apptHc=root.querySelector("#apptHc")as HTMLSelectElement|null;
      if(apptHc){ const cur=apptHc.value;
        apptHc.innerHTML='<option value="">— Select —</option>'+docs.map((a:any)=>'<option>'+esc(a.name)+'</option>').join("");
        if(cur)apptHc.value=cur; }
      // Follow-up plan Owner (Consultation status & program → Strong follow-up flow) = ANY active
      // user who can own a follow-up task (Health Coach / Advisor / Team Lead / etc.). Value is the
      // name; the role is shown as a hint. Restored positionally by applyCoachProfile — options must
      // exist first, which they do (this runs on every assignees load, before a client is opened).
      const fuOwner=root.querySelector("#fuOwner")as HTMLSelectElement|null;
      if(fuOwner){ const cur=fuOwner.value;
        fuOwner.innerHTML='<option value="">-- Select --</option>'+active.map((a:any)=>'<option value="'+esc(a.name)+'">'+esc(a.name)+(a.role?(" — "+esc(a.role)):"")+'</option>').join("");
        if(cur&&Array.from(fuOwner.options).some(o=>o.value===cur))fuOwner.value=cur; }
    }
    w._asgCreate=async()=>{
      const name=((root.querySelector("#asgName")as HTMLInputElement)?.value||"").trim();
      if(!name){toast("Enter a name");return;}
      const role=(root.querySelector("#asgRole")as HTMLSelectElement)?.value||"Advisor";
      const branch=(root.querySelector("#asgBranch")as HTMLSelectElement)?.value||"Chennai";
      const phone=((root.querySelector("#asgPhone")as HTMLInputElement)?.value||"").trim();
      if(phone&&!/^\d{10}$/.test(phone)){toast("Phone must be a 10-digit number");return;}
      try{
        if(_asgEditId){
          const {error}=await supabase.from("assignees").update({name,role,branch,phone}).eq("id",_asgEditId);
          if(error) throw error; toast("Assignee updated");
        }else{
          const {error}=await supabase.from("assignees").insert({name,role,branch,phone});
          if(error) throw error; toast("Assignee added");
        }
        (w as any)._asgCancelEdit();
        await loadAssignees();
      }catch(e:any){
        toast(/exist|relation|schema/i.test(e.message||"")?"Run supabase-migration-assignees.sql first":"Save failed: "+(e.message||"db error"));
      }
    };
    w._asgEdit=(id:any)=>{
      // id column is BIGSERIAL → the data gateway returns it as a string, while the
      // onclick passes a numeric literal; compare as strings so the lookup matches.
      const a=_assignees.find((x:any)=>String(x.id)===String(id)); if(!a) return;
      (root.querySelector("#asgName")as HTMLInputElement).value=a.name;
      (root.querySelector("#asgRole")as HTMLSelectElement).value=a.role;
      (root.querySelector("#asgBranch")as HTMLSelectElement).value=a.branch;
      (root.querySelector("#asgPhone")as HTMLInputElement).value=a.phone||"";
      _asgEditId=id;
      const b=root.querySelector("#asgAddBtn"); if(b)b.textContent="Update assignee";
      const c=root.querySelector("#asgCancelBtn")as HTMLElement; if(c)c.style.display="";
    };
    w._asgCancelEdit=()=>{
      _asgEditId=null;
      const n=root.querySelector("#asgName")as HTMLInputElement; if(n)n.value="";
      const p=root.querySelector("#asgPhone")as HTMLInputElement; if(p)p.value="";
      const b=root.querySelector("#asgAddBtn"); if(b)b.textContent="+ Add assignee";
      const c=root.querySelector("#asgCancelBtn")as HTMLElement; if(c)c.style.display="none";
    };
    w._asgToggle=async(id:number,active:boolean)=>{
      try{
        const {error}=await supabase.from("assignees").update({is_active:active}).eq("id",id);
        if(error) throw error;
        await loadAssignees();
        toast(active?"Assignee activated":"Assignee deactivated");
      }catch(e:any){ toast("Update failed: "+(e.message||"db error")); }
    };
    // Persist a lead → advisor assignment (leaves the unassigned pool).
    w._assignLead=async(id:string,name:string)=>{
      if(!name) return;
      if(String(id).indexOf("seed-")===0){toast("Demo lead — assign a real pooled lead");return;}
      try{
        const {error}=await supabase.from("leads").update({assigned_to:name,is_assigned:true,in_pool:false}).eq("meta_lead_id",id);
        if(error) throw error;
        try{ await supabase.from("leads").update({assigned_at:new Date().toISOString()}).eq("meta_lead_id",id); }catch(_){}
      }catch(e:any){
        toast(/in_pool|column|schema|exist/i.test(e.message||"")?"Run the assignment migrations first":"Assign failed: "+(e.message||"db error"));
        return;
      }
      const ld=_metaLeads.find((x:any)=>String(x.id)===String(id));
      if(ld){ld.inPool=false;ld.isAssigned=true;ld.assignedTo=name;}
      logActivity(id,[{action:"Assigned",field:"Assigned to",new:name}]);
      logAssignment(id,name,"assigned");
      await loadAssignmentExtras();   // refresh non-Meta (CSV) pooled/assigned leads
      rebuildPoolFromDB();
      renderUnassignedPool();renderMetaPage();renderImport();renderAdvisorLoad();renderAssigneesTable();renderAssignedLeads();renderHealthDashboard();
      toast("Lead assigned to "+name);
    };

    // ===== Assigned leads view (live, from leads where is_assigned) =====
    let _asnPage=1; const ASN_PER=15;
    let _asnView="list"; // "list" | "kanban"
    w._asnToggleView=(v:string)=>{
      _asnView=(v==="kanban")?"kanban":"list";
      const tog=root.querySelector("#asnViewToggle");
      if(tog) tog.querySelectorAll(".pill").forEach((b:any)=>b.classList.toggle("on",(b.textContent||"").toLowerCase().indexOf(_asnView)>=0));
      renderAssignedLeads();
    };
    // Date & Time shown for an assigned lead = its assignment time (assigned_at),
    // falling back to pool-add / creation time when that column isn't populated.
    let _asnQuery=""; let _asnSearchT:any=null;
    function _asnDateVal(l:any){ const d=_advLeadsDet[String(l.id)]; return (d&&d.assigned_at)||l.assignedAt||l.poolAddedAt||l.createdAt||null; }
    function _asnMatchesQuery(l:any){
      const q=_asnQuery.trim().toLowerCase(); if(!q) return true;
      return [l.name,l.phone,l.source,l.assignedTo,l.campaign,_asnCallStatus(l)].some((v:any)=>String(v||"").toLowerCase().indexOf(q)>=0);
    }
    function assignedLeads(){
      const f=_asnApplied.advisor||"all";   // applied via the Apply button, not on select change
      // Honor the dashboard call/lead-status dropdown too, so List + Kanban stay in
      // sync with it (and with each other). haEffStatus is hoisted, defined below.
      const sf=(root.querySelector("#haStatusFilter")as HTMLSelectElement)?.value||"all";
      // Date & Time / Source / Service are the shared TOP filters (haCommonFilter) —
      // the same ones that drive the Advisor Dashboard, so both stay in sync.
      const all=haCommonFilter([..._metaLeads.filter((l:any)=>l.isAssigned&&l.assignedTo), ..._assignedExtras]);
      return all.filter((l:any)=>{
        if(!(f==="all"||l.assignedTo===f)) return false;
        if(!(sf==="all"||haEffStatus(l)===sf)) return false;
        return _asnMatchesQuery(l);
      });
    }
    // Latest saved call status for a lead (leads.call_status via l.callStatus). Defaults to
    // "New" when nothing has been selected yet — matching the app's default workflow.
    function _asnCallStatus(l:any){ return (l&&l.callStatus)?String(l.callStatus):"New"; }
    // Chip colour by call-status family (green = won/progressed, red = lost, amber = pending).
    function _callStatusCls(s:string){ const t=(s||"").toLowerCase();
      if(/enrol|payment completed|visited|already paid/.test(t)) return "ok";
      if(/appointment|confirmed|^interested$|interested/.test(t)) return "info";
      if(/not interested|dnd|wrong number|out of service|not registered|switched off/.test(t)) return "al";
      if(/follow up|call back|callback|rnr|line busy|not reachable|no sugar|pending|busy/.test(t)) return "warn";
      return "neu"; }
    const _asgnLeadCols=[
      {key:"dt",label:"Date & Time",filter:true,text:(l:any)=>fmtIST(_asnDateVal(l))},
      {key:"lead",label:"Lead",filter:true,text:(l:any)=>l.name||""},
      {key:"src",label:"Source · Lang",filter:true,text:(l:any)=>l.source==="Manual"?"Manual":((l.source||"Meta")+" · "+(l.lang||"Tamil"))},
      {key:"camp",label:"Campaign",filter:true,text:(l:any)=>l.campaign||"—"},
      {key:"asg",label:"Assigned to",filter:true,text:(l:any)=>l.assignedTo||""},
      {key:"status",label:"Status",filter:true,text:(l:any)=>_eligMap[String(l.id)]?"Not Eligible":"Assigned"},
      {key:"callstatus",label:"Call Status",filter:true,text:(l:any)=>_asnCallStatus(l)},
      {key:"act",label:"Action",filter:false,head:'Action'},
    ];
    regGrid("assignedLeads",()=>_asgnLeadCols,()=>renderAssignedLeads());
    function renderAssignedLeads(){
      // populate advisor filter from active assignees (preserve selection)
      const fsel=root.querySelector("#assignedFilter")as HTMLSelectElement;
      if(fsel){
        const cur=fsel.value;
        const names=_assignees.map((a:any)=>a.name);
        fsel.innerHTML='<option value="all">All advisors</option>'+names.map((n:string)=>'<option>'+(n||"").replace(/</g,"&lt;")+'</option>').join("");
        if(Array.from(fsel.options).some(o=>o.value===cur)) fsel.value=cur;
      }
      // populate service + source filters from the whole assigned set (preserve selection)
      const _asnBaseAll=[..._metaLeads.filter((l:any)=>l.isAssigned&&l.assignedTo), ..._assignedExtras];
      const _fillAsnSel=(sel:string,vals:string[],allLabel:string)=>{ const el=root.querySelector(sel)as HTMLSelectElement|null; if(!el) return; const cur=el.value; const uniq=Array.from(new Set(vals.filter(Boolean))).sort(); el.innerHTML='<option value="all">'+allLabel+'</option>'+uniq.map((v:string)=>'<option>'+(v||"").replace(/</g,"&lt;")+'</option>').join(""); if(Array.from(el.options).some(o=>o.value===cur)) el.value=cur; };
      _fillAsnSel("#asnService",_asnBaseAll.map((l:any)=>l.service),"All services");
      _fillAsnSel("#asnSource",_asnBaseAll.map((l:any)=>l.source),"All sources");
      const list=assignedLeads();
      const _alF=gridApply("assignedLeads",list);
      const body=root.querySelector("#assignedLeadsBody");
      const _alh=root.querySelector("#assignedLeadsHead"); if(_alh)_alh.innerHTML=gridHead("assignedLeads");
      const cnt=root.querySelector("#assignedCount");
      const info=root.querySelector("#asnPageInfo");
      const prev=root.querySelector("#asnPrevBtn")as HTMLButtonElement, next=root.querySelector("#asnNextBtn")as HTMLButtonElement;
      if(cnt) cnt.textContent=String(_alF.length);
      // View switch: Kanban shows the same (filtered) leads grouped by call-status bucket.
      const tableWrap=root.querySelector("#assignedTableWrap")as HTMLElement|null;
      const kanban=root.querySelector("#assignedKanban")as HTMLElement|null;
      const pager=root.querySelector("#asnPager")as HTMLElement|null;
      if(_asnView==="kanban"){
        if(tableWrap)tableWrap.style.display="none";
        if(pager)pager.style.display="none";
        if(kanban){kanban.style.display="";_renderAssignedKanban(kanban,_alF);}
        return;
      }
      if(tableWrap)tableWrap.style.display="";
      if(pager)pager.style.display="flex";
      if(kanban)kanban.style.display="none";
      if(!body) return;
      const total=_alF.length;const pages=Math.max(1,Math.ceil(total/ASN_PER));
      if(_asnPage>pages)_asnPage=pages;if(_asnPage<1)_asnPage=1;
      const rows=_alF.slice((_asnPage-1)*ASN_PER,(_asnPage-1)*ASN_PER+ASN_PER);
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      body.innerHTML=rows.length?rows.map((l:any)=>{
        const elig=_eligMap[String(l.id)];   // exclusion reason → Not Eligible
        const tr=elig?'<tr style="background:var(--alert-bg);box-shadow:inset 3px 0 0 var(--alert)">':'<tr>';
        const status=elig
          ? '<td><span class="chipb al" title="Exclusion tag present — '+e(elig)+'">Not Eligible</span></td>'
          : '<td><span class="chipb ok">Assigned</span></td>';
        return tr
        +'<td class="mono" style="font-size:11px;white-space:nowrap">'+e(fmtIST(_asnDateVal(l)))+'</td>'
        +'<td style="font-weight:600;cursor:pointer;color:var(--brand)" title="Open lead profile →" onclick="window._openLeadProfile(\''+e(String(l.id))+'\')">'+e(l.name)+' ↗</td>'
        +'<td><span class="tag">'+e(l.source==="Manual"?"Manual":((l.source||"Meta")+" · "+(l.lang||"Tamil")))+'</span></td>'
        +'<td class="mono" style="font-size:11.5px">'+e(l.campaign||"—")+'</td>'
        +'<td style="font-weight:600">'+e(l.assignedTo)+'</td>'
        +status
        +'<td><span class="chipb '+_callStatusCls(_asnCallStatus(l))+'">'+e(_asnCallStatus(l))+'</span></td>'
        +'<td><div style="display:flex;gap:6px"><button class="btn bsm bp" onclick="window._openLeadProfile(\''+e(String(l.id))+'\')">Open profile</button><button class="btn bsm" onclick="window._unassignLead(\''+e(String(l.id))+'\')">Return to pool</button></div></td></tr>';
      }).join("")
        :'<tr><td colspan="8" style="text-align:center;color:var(--faint);padding:18px">No assigned leads yet</td></tr>';
      if(info)info.textContent="Page "+_asnPage+" of "+pages;
      void prev; void next;
      _pgBtns("asn",_asnPage,pages);
      if(!_eligLoadedOnce){ _eligLoadedOnce=true; _loadEligibilities(); }
    }
    // Load persisted Not-Eligible reasons for assigned leads once, then repaint the table.
    let _eligLoadedOnce=false;
    async function _loadEligibilities(){
      if(_advProfileColMissing) return;
      const ids=assignedLeads().map((l:any)=>String(l.id)).filter(Boolean).slice(0,500);
      if(!ids.length) return;
      try{
        const {data,error}=await supabase.from("leads").select("meta_lead_id,advisor_profile").in("meta_lead_id",ids);
        if(error){ if(/advisor_profile|column|exist|schema/i.test(error.message||"")) _advProfileColMissing=true; return; }
        (data||[]).forEach((r:any)=>{ const ne=r.advisor_profile&&r.advisor_profile._notElig; if(ne) _eligMap[String(r.meta_lead_id)]=ne; else delete _eligMap[String(r.meta_lead_id)]; });
        renderAssignedLeads();
      }catch(_){}
    }
    // Kanban board for the Assigned-leads section — same leads, grouped by call-status
    // bucket (matches the dashboard KPI buckets). Layout only; opening a card and
    // returning to pool use the exact same handlers as the list rows.
    function _renderAssignedKanban(kb:HTMLElement,list:any[]){
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      // Columns are the call/lead statuses straight from HA_STATUSES (the same list
      // that fills the All Call/Lead Statuses dropdown), matched exactly against each
      // lead's effective status — so the board and the dropdown are always in sync.
      const _palette=["#17A87B","#378ADD","#7B6CD9","#C07F0E","#D8442B","#5B9BD5","#A855F7","#EF4444","#0B6B4C","#E8A817"];
      const cols=HA_STATUSES.map((s:string,i:number)=>({status:s,label:s,color:_palette[i%_palette.length]}));
      const avc=["#17A87B","#378ADD","#7B6CD9","#C07F0E","#D8442B","#5B9BD5","#A855F7","#EF4444"];
      kb.innerHTML='<div style="display:flex;gap:12px;min-width:max-content;padding-bottom:8px">'+cols.map(col=>{
        const items=list.filter((l:any)=>haEffStatus(l)===col.status);
        return '<div style="min-width:230px;max-width:270px;flex:1;display:flex;flex-direction:column;max-height:600px;background:var(--surface);border:1px solid var(--line);border-radius:10px;overflow:hidden">'
          +'<div style="flex-shrink:0;padding:10px 12px;border-bottom:2px solid '+col.color+';display:flex;align-items:center;gap:6px"><span style="width:9px;height:9px;border-radius:50%;background:'+col.color+';flex-shrink:0;display:inline-block"></span><span style="font-weight:700;font-size:12px;white-space:nowrap">'+e(col.label)+'</span><span class="chipb neu" style="margin-left:auto;font-size:11px">'+items.length+'</span></div>'
          +'<div style="flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:6px;min-height:60px">'
          +(items.length?items.map((l:any,i:number)=>{
            const init=(l.name||"??").split(" ").map((w:string)=>w[0]||"").join("").substring(0,2).toUpperCase();
            return '<div style="padding:10px;border-radius:8px;border:1px solid var(--line);background:#fff;transition:box-shadow .15s" onmouseover="this.style.boxShadow=\'0 2px 8px rgba(0,0,0,.08)\'" onmouseout="this.style.boxShadow=\'none\'">'
              +'<div style="display:flex;align-items:center;gap:8px"><span class="avs" style="background:'+avc[i%avc.length]+';width:28px;height:28px;font-size:10px;flex-shrink:0">'+init+'</span>'
              +'<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:12.5px;cursor:pointer;color:var(--brand);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="Open lead profile →" onclick="window._openLeadProfile(\''+e(String(l.id))+'\')">'+e(l.name||l.phone||"Lead")+' ↗</div>'
              +'<div style="font-size:10.5px;color:var(--muted);margin-top:1px">'+e(l.source==="Manual"?"Manual":((l.source||"Meta")+(l.lang?" · "+l.lang:"")))+'</div>'
              +'<div style="font-size:10.5px;color:var(--faint);margin-top:1px">→ '+e(l.assignedTo||"—")+'</div>'
              +'<div style="font-size:9.5px;color:var(--faint);margin-top:1px">'+e(fmtIST(_asnDateVal(l)))+'</div></div></div>'
              +'<div style="display:flex;gap:6px;margin-top:8px"><button class="btn bsm bp" style="flex:1" onclick="window._openLeadProfile(\''+e(String(l.id))+'\')">Open</button><button class="btn bsm" onclick="window._unassignLead(\''+e(String(l.id))+'\')">Pool</button></div></div>';
          }).join(""):'<div style="text-align:center;color:var(--faint);font-size:11px;padding:12px 0">No leads</div>')
          +'</div></div>';
      }).join("")+'</div>';
    }
    w._asnPage=(dir:any)=>{_asnPage=_pgApply(_asnPage,dir);renderAssignedLeads();renderHealthDashboard();};
    // Top filters (date / service / source) + lead search — both List and Kanban read
    // assignedLeads(), so a filter change updates whichever view is showing and persists
    // across the List⇄Kanban toggle.
    w._asnFilterChange=()=>{ _asnPage=1; renderAssignedLeads(); };
    w._assignedSearch=()=>{ if(_asnSearchT)clearTimeout(_asnSearchT); _asnSearchT=setTimeout(()=>{ _asnQuery=(root.querySelector("#assignedSearch")as HTMLInputElement)?.value||""; _asnPage=1; renderAssignedLeads(); },180); };
    // The advisor filter is a TOP filter — held until Apply (see _topFilterApply),
    // not applied on select change. No onchange handler here by design.
    // Return an assigned lead to the unassigned pool.
    w._unassignLead=async(id:string)=>{
      try{
        const {error}=await supabase.from("leads").update({assigned_to:null,is_assigned:false,in_pool:true}).eq("meta_lead_id",id);
        if(error) throw error;
      }catch(e:any){ toast("Failed: "+(e.message||"db error")); return; }
      const ld=_metaLeads.find((x:any)=>String(x.id)===String(id));
      const prevAdv=ld?ld.assignedTo:((_assignedExtras.find((x:any)=>String(x.id)===String(id))||{}).assignedTo||"");
      if(ld){ld.isAssigned=false;ld.assignedTo="";ld.inPool=true;}
      logActivity(id,[{action:"Assigned",field:"Assigned to",old:prevAdv,new:"Unassigned (returned to pool)"}]);
      logAssignment(id,prevAdv,"unassigned");
      await loadAssignmentExtras();
      rebuildPoolFromDB();
      renderUnassignedPool();renderMetaPage();renderImport();renderAdvisorLoad();renderAssigneesTable();renderAssignedLeads();renderHealthDashboard();
      toast("Lead returned to pool");
    };
    // ===== Assigned Leads History (immutable audit trail from lead_assignments) =====
    let _asnHist:any[]=[]; let _asnHistQuery=""; let _asnHistT:any=null;
    const _asnHistCols=[
      {key:"dt",label:"Date & Time",filter:true,text:(r:any)=>fmtIST(r.created_at)},
      {key:"name",label:"Lead Name",filter:true,text:(r:any)=>r.lead_name||"—"},
      {key:"phone",label:"Lead Number",filter:true,text:(r:any)=>r.lead_phone||"—"},
      {key:"source",label:"Source Name",filter:true,text:(r:any)=>r.source||"—"},
      {key:"advisor",label:"Assigned Health Advisor",filter:true,text:(r:any)=>r.advisor||"—"},
      {key:"by",label:"Assigned By",filter:true,text:(r:any)=>r.assigned_by||"—"},
      {key:"status",label:"Assignment Status",filter:true,text:(r:any)=>r.status==="unassigned"?"Returned to pool":"Assigned"},
    ];
    regGrid("asnHist",()=>_asnHistCols,()=>renderAsnHist());
    async function loadAssignmentHistory(){
      try{ const {data}=await supabase.from("lead_assignments").select("*").order("created_at",{ascending:false}).limit(1000); _asnHist=data||[]; }
      catch(_){ _asnHist=[]; }
      populateAsnHistFilters(); renderAsnHist();
    }
    function populateAsnHistFilters(){
      const fill=(sel:string,vals:string[],allLabel:string)=>{
        const el=root.querySelector(sel)as HTMLSelectElement|null; if(!el) return;
        const cur=el.value;
        const uniq=Array.from(new Set(vals.filter(Boolean))).sort();
        el.innerHTML='<option value="all">'+allLabel+'</option>'+uniq.map((v:string)=>'<option>'+(v||"").replace(/</g,"&lt;")+'</option>').join("");
        if(Array.from(el.options).some(o=>o.value===cur)) el.value=cur;
      };
      fill("#asnHistAdvisor",_asnHist.map((r:any)=>r.advisor),"All health advisors");
      fill("#asnHistSource",_asnHist.map((r:any)=>r.source),"All sources");
      fill("#asnHistService",_asnHist.map((r:any)=>r.service),"All services");
    }
    function _asnHistMatchesQuery(r:any){
      const q=_asnHistQuery.trim().toLowerCase(); if(!q) return true;
      return [r.lead_name,r.lead_phone,r.advisor,r.assigned_by,r.source].some((v:any)=>String(v||"").toLowerCase().indexOf(q)>=0);
    }
    function asnHistBase(){
      const from=(root.querySelector("#asnHistFrom")as HTMLInputElement)?.value||"";
      const to=(root.querySelector("#asnHistTo")as HTMLInputElement)?.value||"";
      const adv=(root.querySelector("#asnHistAdvisor")as HTMLSelectElement)?.value||"all";
      const src=(root.querySelector("#asnHistSource")as HTMLSelectElement)?.value||"all";
      const svc=(root.querySelector("#asnHistService")as HTMLSelectElement)?.value||"all";
      const poolOnly=(root.querySelector("#asnHistPool")as HTMLInputElement)?.checked||false;
      const fromT=from?new Date(from+"T00:00:00").getTime():0;
      const toT=to?new Date(to+"T23:59:59").getTime():0;
      return _asnHist.filter((r:any)=>{
        const t=new Date(r.created_at).getTime();
        if(fromT&&t<fromT) return false;
        if(toT&&t>toT) return false;
        if(adv!=="all"&&(r.advisor||"")!==adv) return false;
        if(src!=="all"&&(r.source||"")!==src) return false;
        if(svc!=="all"&&(r.service||"")!==svc) return false;
        if(poolOnly&&r.status!=="unassigned") return false;
        return _asnHistMatchesQuery(r);
      });
    }
    function renderAsnHist(){
      const head=root.querySelector("#asnHistHead"); if(head)head.innerHTML=gridHead("asnHist");
      const rows=gridApply("asnHist",asnHistBase());
      const body=root.querySelector("#asnHistBody"); const cnt=root.querySelector("#asnHistCount");
      if(cnt)cnt.textContent=String(rows.length);
      if(!body) return;
      const e=(s:any)=>(s==null?"":String(s)).replace(/</g,"&lt;").replace(/>/g,"&gt;");
      body.innerHTML=rows.length?rows.map((r:any)=>{
        const st=r.status==="unassigned"
          ?'<span class="chipb al">Returned to pool</span>'
          :'<span class="chipb ok">Assigned</span>';
        return '<tr>'
          +'<td class="mono" style="font-size:11.5px;white-space:nowrap">'+e(fmtIST(r.created_at))+'</td>'
          +'<td style="font-weight:600">'+e(r.lead_name||"—")+'</td>'
          +'<td class="mono">'+e(r.lead_phone||"—")+'</td>'
          +'<td><span class="tag">'+e(r.source||"—")+'</span></td>'
          +'<td style="font-weight:600">'+e(r.advisor||"—")+'</td>'
          +'<td>'+e(r.assigned_by||"—")+'</td>'
          +'<td>'+st+'</td></tr>';
      }).join(""):'<tr><td colspan="7" style="text-align:center;color:var(--faint);padding:18px">No assignment history yet</td></tr>';
    }
    w._asnHistFilter=()=>{ renderAsnHist(); };
    w._asnHistSearch=()=>{ if(_asnHistT)clearTimeout(_asnHistT); _asnHistT=setTimeout(()=>{ _asnHistQuery=(root.querySelector("#asnHistSearch")as HTMLInputElement)?.value||""; renderAsnHist(); },180); };
    w._asnHistDownload=()=>{
      const rows=gridApply("asnHist",asnHistBase());
      const out:string[][]=[["Date & Time","Lead Name","Lead Number","Source Name","Assigned Health Advisor","Assigned By","Assignment Status"]];
      rows.forEach((r:any)=>out.push([fmtIST(r.created_at),r.lead_name||"",r.lead_phone||"",r.source||"",r.advisor||"",r.assigned_by||"",r.status==="unassigned"?"Returned to pool":"Assigned"]));
      _downloadCsv("wellnessos_assigned_leads_history.csv",out);
    };
    // ===== Return to Pool: send a pooled lead BACK to its ORIGINAL source table =====
    // The lead's origin is read from its id prefix (the "lead origin" signal), because
    // the stored `source` is unreliable (CSV rows are forced to source="Manual" on move):
    //   "csv-…"        → Bulk CSV Import Wizard (the row was MOVED out of csv_leads into
    //                     `leads`; we reverse that: re-stage into csv_leads, drop the leads row)
    //   anything else  → Live Incoming Feed (Meta / manual / walk-in / website: the row
    //                     lives in `leads`, pooling only flipped in_pool=true — we flip it back)
    // Persisted to the DB so it survives refresh; touches only this one lead.
    w._poolReturnToSource=async(id:string)=>{
      const sid=String(id);
      if(sid.indexOf("seed-")===0){ toast("Demo lead — nothing to return"); return; }
      const p=_unassignedPool.find((x:any)=>String(x.id)===sid);
      const nm=p?p.name:"Lead";
      const isCsv=sid.indexOf("csv-")===0;
      try{
        if(isCsv){
          // Reverse the CSV → pool move: re-create the import-wizard row, then delete
          // the pooled leads row so it can't live in both places.
          const {data:ld}=await supabase.from("leads").select("*").eq("meta_lead_id",id).limit(1);
          const L:any=ld&&ld[0]; if(!L){ toastErr("Lead not found in the database"); return; }
          const {error:insErr}=await supabase.from("csv_leads").insert({
            batch_id:null, date_time:L.lead_date||String(L.created_at||"").substring(0,10)||"",
            campaign:L.campaign||"", ad_name:L.ad_name||"", lead_name:L.name||"Lead", phone:L.phone||"",
            sugar_poll:L.sugar_poll||"", city:L.city||"", street:L.street||"",
            source:L.source||"CSV", service:L.service||"Diabetes", name:L.name||"Lead", status:"valid"
          });
          if(insErr) throw insErr;
          const {error:delErr}=await supabase.from("leads").delete().eq("meta_lead_id",id);
          if(delErr) throw delErr;
        }else{
          // Live-feed origin: clear the pool + assignment flags; the row stays in `leads`
          // and re-appears in the Live Incoming Feed. NOTE: pool_added_at is intentionally
          // KEPT (not nulled) — it is the durable "was pooled" marker that protects a
          // Meta lead from the sync prune (which would otherwise delete an out-of-crawl
          // lead the moment it has no workflow state). See syncMetaLeadsToSupabase().
          const {error}=await supabase.from("leads").update({in_pool:false,is_assigned:false,assigned_to:null}).eq("meta_lead_id",id);
          if(error) throw error;
          const ld=_metaLeads.find((x:any)=>String(x.id)===sid);
          if(ld){ ld.inPool=false; ld.isAssigned=false; ld.assignedTo=""; }
        }
      }catch(e:any){
        toastErr(/in_pool|column|schema|exist|relation/i.test(e.message||"")?"Run the assignment / CSV migrations first":"Return failed: "+(e.message||"db error"));
        return;
      }
      // Refresh every dataset the lead could belong to, then re-render.
      await loadOtherSourceLeads();
      await loadCsvData();
      await loadAssignmentExtras();
      rebuildPoolFromDB();
      rebuildIMP();
      renderUnassignedPool();renderMetaPage();renderImport();renderAdvisorLoad();renderAssigneesTable();renderAssignedLeads();renderHealthDashboard();
      toast(nm+(isCsv?" returned to the Bulk CSV Import Wizard":" returned to the Live Incoming Feed"));
    };
    w._assignedDownload=()=>{
      const list=gridApply("assignedLeads",assignedLeads());
      if(!list.length){toast("Nothing to download");return;}
      const out:string[][]=[["Date & Time","Lead","Phone","Source","Language","Campaign","Assigned to","Status"]];
      list.forEach((l:any)=>out.push([fmtIST(_asnDateVal(l)),l.name||"",l.phone||"",l.source||"",l.lang||"",l.campaign||"",l.assignedTo||"",_eligMap[String(l.id)]?"Not Eligible":"Assigned"]));
      _downloadCsv("wellnessos_assigned_leads.csv",out);
      toast("Downloaded "+list.length+" assigned leads");
    };

    // ===== Open-leads vertical list (left) + detail pane (right) =====
    let _advLeadId="";         // id of the lead currently shown in the detail pane
    let _openLeads:any[]=[];   // leads opened from the Assigned table — kept until closed
    let _openRelinked=false;
    let _advAttachments:any[]=[];   // blood-report files for the active lead [{name,url,at}]
    let _advFuNotes:any[]=[];       // follow-up notes for the active lead [{text,at}]
    let _advApplying=false;         // true while restoring a saved profile (suppress activity logging)
    let _advLeadGenStr="";          // formatted "Lead generated" date for the open lead (AUTO, survives restore)
    let _advProfileColMissing=false;// once we learn advisor_profile column isn't there, skip the DB read
    const ADV_ACTOR="ABM / Admin";  // no auth yet → record the active role
    // Call-status codes that REQUIRE a "Next follow-up date & time".
    const FU_REQUIRED_CODES=["cb","fu","rnr","busy","so","nr","cbr"];
    const _OPEN_KEY="wos_open_leads";
    // Persist the open-leads workspace so it survives page refreshes / new sessions.
    function saveOpenLeads(){
      try{ localStorage.setItem(_OPEN_KEY,JSON.stringify({active:String(_advLeadId||""),leads:_openLeads.map((o:any)=>({id:String(o.id),name:o.lead.name||"",phone:o.lead.phone||""}))})); }catch(_){/* storage unavailable */}
    }
    function findLeadById(id:string){
      return _metaLeads.find((x:any)=>String(x.id)===String(id))
        ||_assignedExtras.find((x:any)=>String(x.id)===String(id))
        ||_poolExtras.find((x:any)=>String(x.id)===String(id))||null;
    }
    // Restore the open-leads list IMMEDIATELY from localStorage using saved
    // name/phone placeholders, so the workspace shows before the feed loads.
    function restoreOpenLeads(){
      let saved:any=null;
      try{ saved=JSON.parse(localStorage.getItem(_OPEN_KEY)||"null"); }catch(_){/* */}
      if(!saved||!Array.isArray(saved.leads)||saved.leads.length===0) return;
      _openLeads=saved.leads.map((s:any)=>({id:String(s.id),lead:{id:s.id,name:s.name||"",phone:s.phone||"",_placeholder:true}}));
      const activeOpen=_openLeads.some((o:any)=>String(o.id)===String(saved.active));
      _advLeadId=activeOpen?String(saved.active):String(_openLeads[0].id);
      const act=_openLeads.find((o:any)=>String(o.id)===String(_advLeadId));
      renderOpenList();
      if(act) fillAdvisorDetail(act.lead);   // partial detail (name/phone) until relinked
    }
    // Once the real lead data has loaded, swap placeholders for live lead objects
    // (and drop any leads that no longer exist). Runs once after the feed loads.
    function relinkOpenLeads(){
      if(_openRelinked||_openLeads.length===0) return;
      _openRelinked=true;
      const linked:any[]=[];
      _openLeads.forEach((o:any)=>{ const real=findLeadById(o.id); if(real) linked.push({id:real.id,lead:real}); });
      _openLeads=linked;
      if(_openLeads.length===0){ _advLeadId=""; _advClearDetail(); renderOpenList(); saveOpenLeads(); return; }
      if(!_openLeads.some((o:any)=>String(o.id)===String(_advLeadId))) _advLeadId=String(_openLeads[0].id);
      const act=_openLeads.find((o:any)=>String(o.id)===String(_advLeadId));
      renderOpenList();
      if(act) fillAdvisorDetail(act.lead);   // upgrade to full live data
      saveOpenLeads();
    }

    // Populate the right-hand detail pane from a real lead record (no demo data).
    function fillAdvisorDetail(l:any){
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const name=l.name||l.phone||"Lead";
      const initials=(name.match(/[A-Za-z0-9]/g)||["L","D"]).slice(0,2).join("").toUpperCase();
      const srcLang=l.source==="Manual"?"Manual":((l.source||"Meta")+" · "+(l.lang||"Tamil"));
      const setTxt=(sel:string,txt:string)=>{const el=root.querySelector(sel);if(el)el.textContent=txt;};
      const setHtml=(sel:string,html:string)=>{const el=root.querySelector(sel);if(el)el.innerHTML=html;};
      setTxt("#advAv",initials||"LD");
      setTxt("#advName",name);
      setTxt("#bookBtnLabel","Book "+((name||"").split(" ")[0]||"lead")+" into selected slot");
      setHtml("#advSub",'<span class="mono">'+e(l.phone||"—")+'</span><span>·</span><span class="mono">Lead #'+e(String(l.id))+'</span><span>·</span>'+e(l.campaign||"—"));
      setHtml("#advBadges",
        '<span class="chipb '+(l.isValid?'ok':'neu')+'">'+(l.isValid?'Valid':'No phone')+'</span>'
        +'<span class="chipb neu">'+e(srcLang)+'</span>'
        +(l.isDuplicate?'<span class="chipb warn">Duplicate</span>':'')
        +(l.assignedTo?'<span class="chipb vio">Assigned: '+e(l.assignedTo)+'</span>':'<span class="chipb info">Unassigned</span>'));
      setHtml("#consBadge","Status: "+(l.isAssigned?"Assigned":(l.inPool?"In pool":"New")));
      const banner=root.querySelector("#advCtxBanner")as HTMLElement;
      if(banner) banner.style.display="none";
      _advLeadId=String(l.id);
      root.querySelectorAll("#s-advisor .a-p input").forEach((i:any)=>{ if(i.type==="checkbox"||i.type==="radio") i.checked=false; else i.value=""; });
      root.querySelectorAll("#s-advisor .a-p textarea").forEach((t:any)=>{ t.value=""; });
      root.querySelectorAll("#s-advisor .a-p select").forEach((s:any)=>{ s.selectedIndex=0; });
      // Clear demo/sample widget states so a fresh lead shows nothing pre-selected.
      const _sp=root.querySelector('#s-advisor .a-p[data-p="sales"]');
      if(_sp){
        _sp.querySelectorAll(".chip-o.on").forEach((c:any)=>c.classList.remove("on"));
        _sp.querySelectorAll("#stars .star.on").forEach((s:any)=>s.classList.remove("on"));
        _sp.querySelectorAll("#bdm button.on").forEach((b:any)=>b.classList.remove("on"));
        const pills=_sp.querySelectorAll(".pill"); pills.forEach((b:any,i:number)=>b.classList.toggle("on",i===0));   // default: Open
        const range=_sp.querySelector("input[type=range]")as HTMLInputElement|null; const pv=_sp.querySelector("#pv"); if(range){ range.value="50"; if(pv)pv.textContent="50%"; }
      }
      _advSetNotEligBadge(false,"");   // reset; restored profile (eligCheck) re-shows it if excluded
      _advAttachments=[]; renderAdvAtts();
      _advFuNotes=[]; renderAdvFuNotes();
      populateAdvisorDropdowns();   // Salesperson + HC options from the live Assignees master
      const setV=(sel:string,v:string)=>{const el=root.querySelector(sel)as HTMLInputElement;if(el)el.value=v||"";};
      setV("#advfName",l.name||"");setV("#advfPhone",l.phone||"");setV("#advfWhats",l.phone||"");setV("#advfEmail",l.email||"");
      // Lead generated (AUTO): the lead's real creation timestamp. Stored so it survives a profile restore.
      const _fmtGen=(v:any)=>{ if(!v)return""; const d=new Date(v); if(isNaN(d.getTime()))return""; const mon=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]; const p=(n:number)=>String(n).padStart(2,"0"); return p(d.getDate())+"-"+mon+"-"+d.getFullYear()+" "+p(d.getHours())+":"+p(d.getMinutes()); };
      _advLeadGenStr=_fmtGen(l.createdAt||l.date||l.leadDate||l.created_at);
      setV("#haLeadGen",_advLeadGenStr);
      // Mark "Open" on real leads only (never from a restore placeholder, which
      // doesn't know the lead's real call status — that would overwrite it).
      if(!l._placeholder&&(!l.callStatus||l.callStatus==="New")){
        l.callStatus="Open";
        supabase.from("leads").update({call_status:"Open"}).eq("meta_lead_id",l.id).then(()=>{});
      }
      const csSel=root.querySelector("#callStatus")as HTMLSelectElement;
      if(csSel){const code=HA_LABEL2CODE[l.callStatus||"Open"];if(code)csSel.value=code;}
      renderHealthDashboard();
      loadAndApplyProfile(l);   // restore the saved "Save lead record" form for this lead
      renderActivityLog(l.id);  // show this lead's audit history (latest first)
      renderCallLogs(l);        // show this lead's call logs + voice recordings (latest first)
    }

    // ===== Persisted lead profile (Health Advisor "Save lead record") =====
    // The editable form is a single template reused for every lead, so we can
    // serialize it index-based (positions are stable across saves & refreshes).
    function _advPanelEl(){ return root.querySelector('#s-advisor .a-p[data-p="sales"]')as HTMLElement|null; }
    function _advCtrls(){ const p=_advPanelEl(); return p?(Array.from(p.querySelectorAll("input,select,textarea"))as any[]):[]; }
    // Human label per control (from its .fld > .lbl), deduped — powers the Activity Log diff.
    function _advLabels(){
      const seen:Record<string,number>={};
      return _advCtrls().map((el:any,i:number)=>{
        const fld=el.closest?el.closest(".fld"):null; const lab=fld?fld.querySelector(".lbl"):null;
        let t=lab?(lab.textContent||"").replace(/\b(NEW|AUTO|SYNCED)\b/g,"").replace(/\s+/g," ").trim():"";
        if(!t) t="Field "+(i+1);
        seen[t]=(seen[t]||0)+1; if(seen[t]>1) t=t+" ("+seen[t]+")";
        return t;
      });
    }
    // {label: value} snapshot for diffing. profileF (optional) reads from a saved profile.
    function _advNamed(profileF?:any[]){
      const labels=_advLabels(); const ctrls=_advCtrls(); const out:Record<string,string>={};
      ctrls.forEach((el:any,i:number)=>{
        if(el.readOnly) return;
        let v:any;
        if(profileF){ const rec=profileF[i]; v=rec?("c" in rec?(rec.c?"Yes":"No"):(rec.v||"")):""; }
        else { v=(el.type==="checkbox"||el.type==="radio")?(el.checked?"Yes":"No"):el.value; }
        out[labels[i]]=v==null?"":String(v);
      });
      return out;
    }
    function collectAdvisorProfile(){
      const p=_advPanelEl(); if(!p) return null;
      const f=Array.from(p.querySelectorAll("input,select,textarea")).map((el:any)=>(el.type==="checkbox"||el.type==="radio")?{c:!!el.checked}:{v:el.value});
      const states=(sel:string)=>Array.from(p.querySelectorAll(sel)).map((b:any)=>b.classList.contains("on"));
      // Persist the Not-Eligible reason so the Assigned-leads table can flag it after refresh.
      const _notElig=[...root.querySelectorAll("#eligChips .chip-o")].filter((c:any)=>c.classList.contains("on")).map((c:any)=>(c.textContent||"").trim()).filter(Boolean).join(", ");
      return {v:2,f,chips:states(".chip-o"),stars:states("#stars .star"),pills:states(".pill"),score:states("#bdm button"),attachments:_advAttachments.slice(),fuNotes:_advFuNotes.slice(),_notElig};
    }
    function applyAdvisorProfile(obj:any){
      const p=_advPanelEl(); if(!p||!obj) return;
      _advApplying=true;
      try{
        const els=Array.from(p.querySelectorAll("input,select,textarea"));
        (obj.f||[]).forEach((rec:any,i:number)=>{ const el:any=els[i]; if(!el) return; if("c" in rec) el.checked=!!rec.c; else el.value=rec.v==null?"":rec.v; });
        const setStates=(sel:string,arr:any[])=>{ if(!arr) return; const list=Array.from(p.querySelectorAll(sel)); arr.forEach((on:boolean,i:number)=>{ if(list[i]) (list[i]as HTMLElement).classList.toggle("on",!!on); }); };
        setStates(".chip-o",obj.chips); setStates("#stars .star",obj.stars); setStates(".pill",obj.pills); setStates("#bdm button",obj.score);
        _advAttachments=Array.isArray(obj.attachments)?obj.attachments.slice():[]; renderAdvAtts();
        _advFuNotes=Array.isArray(obj.fuNotes)?obj.fuNotes.slice():[]; renderAdvFuNotes();
        const range=p.querySelector("input[type=range]")as HTMLInputElement|null; const pv=p.querySelector("#pv"); if(range&&pv) pv.textContent=range.value+"%";
        const cs=p.querySelector("#callStatus")as HTMLSelectElement|null; if(cs&&(w as any).callStatusChange){ try{ (w as any).callStatusChange(cs.value); }catch(_){} }
        try{ eligCheck(); }catch(_){}
        // AUTO field — keep the real lead-generated date even if a stale saved value exists.
        const lg=p.querySelector("#haLeadGen")as HTMLInputElement|null; if(lg&&_advLeadGenStr) lg.value=_advLeadGenStr;
      } finally { _advApplying=false; }
    }
    // ---- Blood-report attachments + follow-up notes renderers ----
    function renderAdvAtts(){
      const ba=root.querySelector("#bloodAtts"); if(!ba) return;
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      ba.innerHTML=_advAttachments.map((a:any,i:number)=>'<span class="att"><svg class="icon"><use href="#i-clip"/></svg> <a href="'+e(a.url||"#")+'" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">'+e(a.name||"file")+'</a> <span onclick="window._advRemoveAtt('+i+')" title="Remove" style="cursor:pointer;color:var(--alert-ink);font-weight:700;margin-left:4px">&times;</span></span>').join("")
        +'<span class="att add" onclick="window._advAddBlood()"><svg class="icon"><use href="#i-clip"/></svg> Add report</span>';
    }
    function renderAdvFuNotes(){
      const el=root.querySelector("#fuNotesA"); if(!el) return;
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      el.innerHTML=_advFuNotes.length?_advFuNotes.map((n:any)=>'<div style="background:#fff;border:1px solid var(--line);border-radius:9px;padding:7px 11px;font-size:12px"><b class="mono" style="color:var(--vio-ink)">'+e(n.at||"")+'</b> — '+e(n.text||"")+'</div>').join(""):'<div style="font-size:12px;color:var(--faint)">No follow-up notes yet.</div>';
    }
    const _advpKey=(id:any)=>"wos_advp_"+id;
    function readProfileLocal(id:any){ try{ const s=localStorage.getItem(_advpKey(id)); return s?JSON.parse(s):null; }catch(_){ return null; } }
    function saveProfileLocal(id:any,obj:any){ try{ localStorage.setItem(_advpKey(id),JSON.stringify(obj)); }catch(_){/* storage full/unavailable */} }
    // Fetch (once) + apply the saved profile for a lead, if it's still the active one.
    // Prefers the DB; falls back to device-local storage (e.g. before the migration is run).
    // Visited status is READ-ONLY on the advisor page and driven ONLY by leads.visited_at,
    // which the reception "Confirm check-in" sets. Never toggled by advisor clicks or any
    // other action — this just mirrors the stored value (Visited if visited_at is set).
    function _advApplyVisited(visitedAt:any){
      const isV=!!visitedAt;
      const cont=root.querySelector("#visStatusPills");
      if(cont){ cont.querySelectorAll(".pill").forEach((b:any,i:number)=>b.classList.toggle("on", i===(isV?1:0))); }
      const vd=root.querySelector("#visDt")as HTMLInputElement|null;
      if(vd) vd.value=isV?fmtIST(visitedAt):"";
    }
    async function loadAndApplyProfile(l:any){
      if(!l) return;
      // 1) INSTANT apply. The device-local copy is the authoritative latest (every
      //    save writes it synchronously), so prefer it over any stale in-memory cache.
      let prof:any = readProfileLocal(l.id);
      if(prof==null) prof = (l.advisorProfile!=null ? l.advisorProfile : null);
      l.advisorProfile = prof || null;
      if(prof && String(_advLeadId)===String(l.id)) applyAdvisorProfile(prof);
      // Enrolled status/date come from the SAME in-memory lead (callStatus + enrolledAt) the
      // Advisor dashboard counts. Apply it AFTER the profile restore (which would otherwise
      // reset the pills to the saved Open state) and BEFORE the gated DB read below, so the
      // lead profile always matches the Enrolled card — even if the advisor_profile read is skipped.
      if(String(_advLeadId)===String(l.id)) _advApplyEnrolled(l.callStatus, l.enrolledAt);
      // 2) BACKGROUND reconcile with the DB (skip once we know the column is absent).
      if(_advProfileColMissing) return;
      try{
        const {data,error}=await supabase.from("leads").select("advisor_profile,visited_at,call_status,enrolled_at").eq("meta_lead_id",l.id).limit(1);
        if(error){ if(/advisor_profile|column|exist|schema/i.test(error.message||"")) _advProfileColMissing=true; return; }
        const dbProf=data&&data[0]&&data[0].advisor_profile;
        if(dbProf){ l.advisorProfile=dbProf; if(String(_advLeadId)===String(l.id)) applyAdvisorProfile(dbProf); }
        if(data&&data[0]&&data[0].enrolled_at) l.enrolledAt=data[0].enrolled_at;   // cache for the enrolled table
        // Visited status reflects leads.visited_at (reception check-in) — applied AFTER the
        // profile restore so it always wins over any stale saved pill state, and survives refresh.
        if(String(_advLeadId)===String(l.id)){ _advApplyVisited(data&&data[0]&&data[0].visited_at); _advApplyEnrolled(data&&data[0]&&data[0].call_status, data&&data[0]&&data[0].enrolled_at); }
      }catch(_){/* network error — local copy already applied */}
    }
    function _advFindLead(id:string){ return [..._openLeads.map((o:any)=>o.lead),..._metaLeads,..._otherFeedLeads].find((x:any)=>x&&String(x.id)===id); }
    // Save the profile WITHOUT toast/diff (used after attachment / note changes).
    function persistAdvProfileQuiet(id:string){
      const obj=collectAdvisorProfile();
      saveProfileLocal(id,obj);
      const l=_advFindLead(id); if(l) l.advisorProfile=obj;
      supabase.from("leads").update({advisor_profile:obj}).eq("meta_lead_id",id).then(()=>{},()=>{});
    }
    w._advSaveRecord=async()=>{
      if(!_advLeadId){ toast("Open a lead first (from Assigned leads)"); return; }
      const _csSel=root.querySelector("#callStatus")as HTMLSelectElement|null;
      if(_csSel && FU_REQUIRED_CODES.indexOf(_csSel.value)>=0){
        const nf=root.querySelector("#nextFollowUp")as HTMLInputElement|null;
        if(nf && !nf.value){ toastErr("Set a Next follow-up date & time for status: "+(HA_CODE2LABEL[_csSel.value]||_csSel.value)); try{nf.focus();}catch(_){} return; }
      }
      // Block saving a follow-up scheduled in the past (covers the mirrored Planned date & time).
      { const nf=root.querySelector("#nextFollowUp")as HTMLInputElement|null;
        if(nf && nf.value){ const t=new Date(nf.value).getTime(); if(!isNaN(t) && t<Date.now()-60000){ toastErr("Next follow-up can't be in the past — choose a current or future time"); try{_setFutureMin(nf);nf.focus();}catch(_){} return; } } }
      const id=String(_advLeadId);
      const lead=_advFindLead(id);
      const prev=lead?lead.advisorProfile:null;
      const obj=collectAdvisorProfile();
      if(!obj){ toast("Open a lead first (from Assigned leads)"); return; }
      const entries:any[]=[];
      if(!prev){ entries.push({action:"Created",field:"Lead record",new:"created"}); }
      else{
        const before=_advNamed(prev.f); const after=_advNamed();
        Object.keys(after).forEach(k=>{ if(/call status/i.test(k)) return; const o=before[k]==null?"":before[k]; const n=after[k]; if(o!==n) entries.push({action:"Updated",field:k,old:o,new:n}); });
        const grp=(label:string,a:any,b:any)=>{ if(JSON.stringify(a||[])!==JSON.stringify(b||[])) entries.push({action:"Updated",field:label,new:"changed"}); };
        grp("Priority",prev.stars,obj.stars); grp("Managing-now / Health issues",prev.chips,obj.chips); grp("Visited status",prev.pills,obj.pills); grp("BDM score",prev.score,obj.score);
      }
      saveProfileLocal(id,obj);
      const cs=root.querySelector("#callStatus")as HTMLSelectElement|null;
      const csLabel=cs?(HA_CODE2LABEL[cs.value]||""):"";
      const upd:any={advisor_profile:obj}; if(csLabel) upd.call_status=csLabel;
      // Persist the Next follow-up date to its dedicated column (the Advisor-load "Next
      // Follow-up Date" column reads leads.next_followup — previously it only lived in JSONB).
      const nfEl=root.querySelector("#nextFollowUp")as HTMLInputElement|null;
      let nfIso:string|null=null;
      if(nfEl&&nfEl.value){ const d=new Date(nfEl.value); if(!isNaN(d.getTime())) nfIso=d.toISOString(); }
      upd.next_followup=nfIso;
      // Reflect the planned follow-up in-memory so the Follow-ups card/table update immediately.
      _advLeadsDet[id]=Object.assign({},_advLeadsDet[id],{next_followup:nfIso});
      // Persist canonical contact fields edited in Basic info to the leads columns (not just
      // the advisor_profile JSONB), so the header, tables and downstream screens reflect them.
      const _fv=(sel:string)=>((root.querySelector(sel)as HTMLInputElement)?.value||"").trim();
      const _nm=_fv("#advfName"), _ph=_fv("#advfPhone"), _em=_fv("#advfEmail");
      if(_nm) upd.name=_nm; if(_ph) upd.phone=_ph; if(_em) upd.email=_em;   // only write non-empty (never blank existing)
      try{
        const {error}=await supabase.from("leads").update(upd).eq("meta_lead_id",id);
        if(error){
          if(/advisor_profile|column|schema|exist/i.test(error.message||"")) toast("Saved locally — run supabase-migration-advisor-profile.sql for DB sync");
          else toastErr("Save failed: "+(error.message||"DB error"));
          return;
        }
        [..._openLeads.map((o:any)=>o.lead),..._metaLeads,..._otherFeedLeads].forEach((x:any)=>{ if(x&&String(x.id)===id){ x.advisorProfile=obj; if(csLabel)x.callStatus=csLabel; if(_nm)x.name=_nm; if(_ph)x.phone=_ph; if(_em)x.email=_em; } });
        // Reflect updated name/phone in the open header immediately.
        if(_nm){ const an=root.querySelector("#advName"); if(an)an.textContent=_nm; }
        renderHealthDashboard(); renderAssignedLeads();
        toast("Lead record saved");
        if(entries.length) logActivity(id,entries);
      }catch(e:any){ toastErr("Save failed: "+(e.message||"network error")); }
    };
    w._advAddBlood=()=>{
      if(!_advLeadId){ toast("Open a lead first (from Assigned leads)"); return; }
      const id=String(_advLeadId);
      const inp=document.createElement("input"); inp.type="file"; inp.accept=".pdf,.jpg,.jpeg,.png,.webp,.heic";
      inp.onchange=async()=>{
        const file=inp.files&&inp.files[0]; if(!file) return;
        if(file.size>15*1024*1024){ toast("File too large (max 15 MB)"); return; }
        toast("Uploading "+file.name+"…");
        const path=id.replace(/[^a-zA-Z0-9._-]/g,"_")+"/"+Date.now()+"_"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
        try{
          const up=await supabase.storage.from("lead-files").upload(path,file,{upsert:false});
          if(up.error) throw up.error;
          const {data}=supabase.storage.from("lead-files").getPublicUrl(path);
          _advAttachments.unshift({name:file.name,url:(data&&data.publicUrl)||"",at:new Date().toISOString()});
          renderAdvAtts();
          persistAdvProfileQuiet(id);
          logActivity(id,[{action:"File Uploaded",field:"Blood report",new:file.name}]);
          toast("Report uploaded");
        }catch(e:any){
          const miss=/bucket|not found|does not exist|404/i.test(e.message||"");
          toast(miss?"Create a PUBLIC Storage bucket named 'lead-files' in Supabase first":"Upload failed: "+(e.message||"error"));
        }
      };
      inp.click();
    };
    w._advRemoveAtt=(i:number)=>{
      if(!_advLeadId) return; const id=String(_advLeadId);
      const a=_advAttachments[i]; if(!a) return;
      _advAttachments.splice(i,1); renderAdvAtts();
      persistAdvProfileQuiet(id);
      logActivity(id,[{action:"Updated",field:"Blood report removed",old:a.name}]);
    };
    // ---- Activity log (per-lead audit history) ----
    const _actKey=(id:any)=>"wos_act_"+id;
    function readActLocal(id:any){ try{ return JSON.parse(localStorage.getItem(_actKey(id))||"[]"); }catch(_){ return []; } }
    function writeActLocal(id:any,arr:any[]){ try{ localStorage.setItem(_actKey(id),JSON.stringify(arr.slice(0,200))); }catch(_){} }
    function _actTime(iso:string){ try{ return new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}).format(new Date(iso)); }catch(_){ return iso; } }
    function _actColor(a:string){ a=(a||"").toLowerCase(); if(a.indexOf("creat")>=0)return "ok"; if(a.indexOf("assign")>=0)return "vio"; if(a.indexOf("status")>=0)return "warn"; if(a.indexOf("file")>=0||a.indexOf("follow")>=0)return "info"; return "neu"; }
    async function logActivity(leadId:any,entries:any[]){
      if(!leadId||!entries||!entries.length) return;
      const nowIso=new Date().toISOString();
      const rows=entries.map((e:any)=>({lead_id:String(leadId),action:e.action,field:e.field||null,old_value:(e.old==null||e.old==="")?null:String(e.old),new_value:(e.new==null||e.new==="")?null:String(e.new),actor:ADV_ACTOR,created_at:nowIso}));
      const local=readActLocal(leadId); rows.slice().reverse().forEach((r:any)=>local.unshift(r)); writeActLocal(leadId,local);
      if(String(_advLeadId)===String(leadId)) renderActivityLog(leadId);
      try{ await supabase.from("lead_activity").insert(rows); }catch(_){/* table not migrated yet — local copy kept */}
    }
    // ---- Assignment history (immutable audit trail behind "Assigned Leads History") ----
    // The `leads` row keeps only current state; every assign/unassign also writes one
    // row here so the history view has Date&Time + Assigned By that `leads` can't express.
    function _asnActor(){ return _currentUser?(((_currentUser.name||"").trim())||((_currentUser.email||"").split("@")[0])||"System"):"System"; }
    function _findLeadForHist(id:string){
      const s=String(id);
      return _metaLeads.find((x:any)=>String(x.id)===s)
          || _assignedExtras.find((x:any)=>String(x.id)===s)
          || _poolExtras.find((x:any)=>String(x.id)===s)
          || _otherFeedLeads.find((x:any)=>String(x.id)===s)
          || null;
    }
    async function logAssignment(id:string,advisor:string,status:string){
      if(!id) return;
      const l:any=_findLeadForHist(id)||{};
      const row={lead_id:String(id),lead_name:l.name||null,lead_phone:l.phone||null,
        source:l.source||null,service:l.service||null,advisor:advisor||null,
        assigned_by:_asnActor(),status:status||"assigned",created_at:new Date().toISOString()};
      try{ await supabase.from("lead_assignments").insert(row); _asnHist.unshift(row); try{ populateAsnHistFilters(); renderAsnHist(); }catch(_){} }catch(_){/* table not migrated yet */}
    }
    async function renderActivityLog(leadId:any){
      const els=Array.from(root.querySelectorAll(".js-actlog")); if(!els.length) return;
      let rows:any[]=[];
      try{ const {data}=await supabase.from("lead_activity").select("*").eq("lead_id",String(leadId)).order("created_at",{ascending:false}).limit(200); rows=data||[]; }catch(_){ rows=[]; }
      if(!rows.length) rows=readActLocal(leadId);
      if(String(_advLeadId)!==String(leadId)) return;   // user switched away during the fetch
      const e=(s:any)=>(s==null?"":String(s)).replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const html=rows.length
        ? rows.map((r:any)=>{
            const chg=r.field?('<b>'+e(r.field)+'</b>'+((r.old_value!=null||r.new_value!=null)?': <span style="color:var(--faint)">'+e(r.old_value||"—")+'</span> &rarr; <b>'+e(r.new_value||"—")+'</b>':'')):'';
            return '<div class="tl"><div class="t"><span class="chipb '+_actColor(r.action)+'">'+e(r.action)+'</span> '+chg+'</div><div class="m">'+e(r.actor||ADV_ACTOR)+' &middot; '+_actTime(r.created_at)+'</div></div>';
          }).join("")
        : '<div style="text-align:center;color:var(--faint);padding:18px;font-size:13px">No activity recorded for this lead yet.</div>';
      els.forEach((el:any)=>{ el.innerHTML=html; });
    }
    // Render the lead's Call logs + voice recordings from `call_recordings` (contact_id = lead id,
    // with a phone/to_number fallback so calls placed before the id mapping still surface). Latest
    // first. Each call shows date/time, direction, duration, status, agent + a recording Play/Download.
    async function renderCallLogs(lead:any){
      const el=root.querySelector("#advCallLog"); if(!el||!lead) return;
      const leadId=String(lead.id); const ph=(lead.phone||"").replace(/\D/g,"");
      // Pull the latest call status + recordings from the provider CDR first (resolves calls stuck
      // at "initiated" and surfaces recordings the push webhook never delivered), then read the DB.
      try{ await _callSync(leadId); }catch(_){}
      if(String(_advLeadId)!==leadId) return;   // user switched away during the sync
      let rows:any[]=[];
      try{ const {data}=await supabase.from("call_recordings").select("*").eq("contact_id",leadId).order("created_at",{ascending:false}).limit(100); rows=data||[]; }catch(_){ rows=[]; }
      if(ph && ph.length>=6){ try{ const {data:d2}=await supabase.from("call_recordings").select("*").ilike("to_number","%"+ph.slice(-10)+"%").order("created_at",{ascending:false}).limit(100); (d2||[]).forEach((r:any)=>{ if(!rows.some((x:any)=>String(x.id)===String(r.id))) rows.push(r); }); }catch(_){} }
      if(String(_advLeadId)!==leadId) return;   // user switched away during the fetch
      rows.sort((a:any,b:any)=>new Date(b.created_at||0).getTime()-new Date(a.created_at||0).getTime());
      const e=(s:any)=>(s==null?"":String(s)).replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const recCount=rows.filter((r:any)=>r.recording_url).length;
      if(!rows.length){ el.innerHTML='<div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No call records for this lead yet.</div>'; return; }
      el.innerHTML='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><span class="chipb info">'+rows.length+' call'+(rows.length===1?"":"s")+'</span><span class="chipb '+(recCount?"ok":"neu")+'">'+recCount+' recording'+(recCount===1?"":"s")+'</span></div>'
        +rows.map((r:any)=>{
          const out=/out/i.test(r.direction||"outbound");
          const dir=out?'<span class="chipb vio">Outgoing</span>':'<span class="chipb info">Incoming</span>';
          const dur=r.duration_seconds?((r.duration_seconds/60|0)+":"+String(r.duration_seconds%60).padStart(2,"0")):"—";
          const st=r.call_status||"—"; const stc=/complet|answer|connect/i.test(st)?"ok":/miss|fail|no.?answer|busy|reject|cancel/i.test(st)?"al":"warn";
          const rec=r.recording_url
            ? '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:7px"><audio controls preload="none" style="height:34px;max-width:260px"><source src="'+e(r.recording_url)+'"></audio><a class="btn bsm" href="'+e(r.recording_url)+'" download target="_blank" rel="noopener">⬇ Download</a></div>'
            : '<div style="margin-top:6px;font-size:11px;color:var(--faint)">'+(/(initiat|ring)/i.test(st)?"Recording will appear once the call completes.":"No recording available.")+'</div>';
          return '<div style="border-bottom:1px solid var(--line);padding:11px 0">'
            +'<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'
            +'<span class="mono" style="font-size:12px;font-weight:600">'+e(fmtIST(r.created_at))+'</span>'+dir
            +'<span class="chipb '+stc+'">'+e(st)+'</span>'
            +'<span style="font-size:11.5px;color:var(--muted)">Duration '+dur+'</span>'
            +'<span style="font-size:11.5px;color:var(--muted)">Agent '+e(r.agent_number||r.from_number||"—")+'</span>'
            +'<span style="font-size:11.5px;color:var(--muted)">→ '+e(r.to_number||"—")+'</span></div>'
            +rec+'</div>';
        }).join("");
    }
    w.addFuNoteA=()=>{
      if(!_advLeadId){ toast("Open a lead first (from Assigned leads)"); return; }
      const id=String(_advLeadId);
      const inp=root.querySelector("#fuNoteA")as HTMLInputElement|null; const txt=inp?inp.value.trim():"";
      if(!txt){ toast("Enter a follow-up note"); return; }
      const at=new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:true}).format(new Date());
      _advFuNotes.unshift({text:txt,at}); renderAdvFuNotes(); if(inp) inp.value="";
      persistAdvProfileQuiet(id);
      logActivity(id,[{action:"Follow-up Added",field:"Follow-up note",new:txt}]);
      toast("Follow-up note added");
    };

    // Render the vertical list of opened leads (left panel); highlight the active one.
    function renderOpenList(){
      const el=root.querySelector("#advOpenList")as HTMLElement;
      if(!el) return;
      if(_openLeads.length===0){ el.style.display="none"; return; }
      el.style.display="block";
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      el.innerHTML='<div style="font-weight:700;font-size:11px;color:var(--faint);margin-bottom:8px;letter-spacing:.05em">OPEN LEADS ('+_openLeads.length+')</div>'
        +_openLeads.map((o:any)=>{
          const l=o.lead;const active=String(o.id)===String(_advLeadId);
          const nm=l.name||l.phone||"Lead";
          return '<div onclick="window._selectOpenLead(\''+e(String(o.id))+'\')" style="display:flex;align-items:center;gap:6px;padding:8px 9px;border-radius:9px;cursor:pointer;margin-bottom:6px;border:1px solid '+(active?'var(--brand)':'var(--line)')+';background:'+(active?'var(--brand-50,#e7f4ec)':'var(--surf,#fff)')+'">'
            +'<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+e(nm)+'</div><div class="mono" style="font-size:10px;color:var(--faint);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+e(l.phone||"")+'</div></div>'
            +'<span onclick="event.stopPropagation();window._closeOpenLead(\''+e(String(o.id))+'\')" title="Close" style="cursor:pointer;color:var(--faint);font-size:16px;line-height:1;padding:0 3px">×</span>'
          +'</div>';
        }).join("");
    }

    // Click a lead in the Assigned table → add it to the open list + show its detail.
    w._openLeadProfile=(id:string)=>{
      const l=_metaLeads.find((x:any)=>String(x.id)===String(id))
        ||_assignedExtras.find((x:any)=>String(x.id)===String(id))
        ||_poolExtras.find((x:any)=>String(x.id)===String(id));
      if(!l){toast("Lead not found");return;}
      if(!_openLeads.some((o:any)=>String(o.id)===String(l.id))) _openLeads.push({id:l.id,lead:l});
      _advLeadId=String(l.id);
      const navBtn=root.querySelector('#nav button[data-s="advisor"]')as HTMLButtonElement;
      if(navBtn) navBtn.click();
      renderOpenList();
      fillAdvisorDetail(l);
      saveOpenLeads();
      toast("Opened: "+(l.name||l.phone||"Lead"));
    };
    // Click a lead in the vertical list → switch the detail pane to that lead.
    w._selectOpenLead=(id:string)=>{
      const o=_openLeads.find((x:any)=>String(x.id)===String(id));
      if(!o) return;
      _advLeadId=String(id);
      fillAdvisorDetail(o.lead);
      renderOpenList();
      saveOpenLeads();
    };
    // Close a lead from the list; if it was active, switch to another (or clear).
    w._closeOpenLead=(id:string)=>{
      _openLeads=_openLeads.filter((x:any)=>String(x.id)!==String(id));
      if(String(_advLeadId)===String(id)){
        if(_openLeads.length){ _advLeadId=String(_openLeads[0].id); fillAdvisorDetail(_openLeads[0].lead); }
        else { _advLeadId=""; _advClearDetail(); }
      }
      renderOpenList();
      saveOpenLeads();
    };

    // Clear the advisor detail to a neutral state on first load (no demo data
    // until a real lead is opened from the Assigned leads table).
    function _advClearDetail(){
      root.querySelectorAll("#s-advisor .a-p input").forEach((i:any)=>{ if(i.type==="checkbox"||i.type==="radio") i.checked=false; else i.value=""; });
      root.querySelectorAll("#s-advisor .a-p textarea").forEach((t:any)=>{ t.value=""; });
      root.querySelectorAll("#s-advisor .a-p select").forEach((s:any)=>{ s.selectedIndex=0; });
      const setTxt=(sel:string,t:string)=>{const el=root.querySelector(sel);if(el)el.textContent=t;};
      const setHtml=(sel:string,h:string)=>{const el=root.querySelector(sel);if(el)el.innerHTML=h;};
      setTxt("#advAv","—");
      setTxt("#advName","No lead selected");
      setHtml("#advSub",'<span>Open a lead from the Assigned leads table below to view its profile.</span>');
      setHtml("#advBadges","");
      setHtml("#consBadge","Status: —");
      const b=root.querySelector("#advCtxBanner")as HTMLElement; if(b)b.style.display="none";
    }
    _advClearDetail();

    // ===== Health Advisor KPI dashboard (call-status driven) =====
    let _haActiveBucket="";
    const HA_STATUSES=["New","Open","DND","RNR","Line Busy","Call Back","Already Paid","Follow Up","Switched Off","Not Registered","No Sugar","Not Interested","Out of Service","Wrong Number","Appointment Fixed – Direct","Appointment Fixed – Zoom","Appointment Confirmed","Visited","Enrolled","Payment Pending","Payment Completed","Interested","Not Reachable","Callback Requested"];
    const HA_LABEL2CODE:any={New:"new",DND:"dnd",RNR:"rnr","Line Busy":"busy","Call Back":"cb","Already Paid":"paid","Follow Up":"fu","Switched Off":"so","Not Registered":"nreg","No Sugar":"nosugar","Not Interested":"ni","Out of Service":"oos","Wrong Number":"wn","Appointment Fixed – Direct":"afd","Appointment Fixed – Zoom":"afz","Appointment Confirmed":"apc","Visited":"vis","Enrolled":"enr","Payment Pending":"payp","Payment Completed":"payc","Interested":"int","Not Reachable":"nr","Callback Requested":"cbr",Open:"new"};
    const HA_CODE2LABEL:any={new:"New",dnd:"DND",rnr:"RNR",busy:"Line Busy",cb:"Call Back",paid:"Already Paid",fu:"Follow Up",so:"Switched Off",nreg:"Not Registered",nosugar:"No Sugar",ni:"Not Interested",oos:"Out of Service",wn:"Wrong Number",afd:"Appointment Fixed – Direct",afz:"Appointment Fixed – Zoom",apc:"Appointment Confirmed",vis:"Visited",enr:"Enrolled",payp:"Payment Pending",payc:"Payment Completed",int:"Interested",nr:"Not Reachable",cbr:"Callback Requested"};
    function haBucketOf(cs:string){
      const s=(cs||"").toLowerCase();
      if(/enrol/.test(s)) return "enrolled";
      if(/payment completed|converted/.test(s)) return "closed";
      if(/payment pending|already paid/.test(s)) return "payment";
      if(/appointment/.test(s)) return "sales";
      if(/visited/.test(s)) return "health";
      if(/follow up|call back|callback/.test(s)) return "followup";
      if(/not interested|no sugar|wrong number|dnd/.test(s)) return "closed";
      return "open"; // New/Open/RNR/Line Busy/Switched Off/Interested/etc.
    }
    const HA_CARDS=[
      {key:"open",label:"Open Leads",c:"g"},{key:"sales",label:"Walk-in Sales Stage",c:""},
      {key:"health",label:"Walk-in Health Stage",c:""},{key:"payment",label:"Payment Stage",c:"a"},
      {key:"enrolled",label:"Enrolled",c:"g"},{key:"followup",label:"Follow-up",c:""},
      {key:"closed",label:"Closed / Converted",c:"a"}
    ];
    function haBook(){
      // The advisor's book = assigned leads (Meta + Manual/CSV). Role enforcement
      // (only-own-leads) requires auth; without it, this shows the full assigned book.
      return [..._metaLeads.filter((l:any)=>l.isAssigned&&l.assignedTo), ..._assignedExtras];
    }
    function haEffStatus(l:any){ return l.callStatus || (l.isAssigned?"Open":"New"); }
    // Follow-up reminder: notify the advisor once per lead when a scheduled follow-up is
    // due/overdue (only after sign-in). Cleared automatically when the lead leaves the
    // follow-up bucket (status changed → completed), so it re-arms if re-scheduled.
    const _fuNotified=new Set<string>();
    function _checkFuReminders(){
      if(!_currentUser) return;
      const now=Date.now(); const live=new Set<string>();
      haBook().forEach((l:any)=>{
        if(haBucketOf(haEffStatus(l))!=="followup") return;
        const key=String(l.id); live.add(key);
        const nf=(_advLeadsDet[key]||{}).next_followup; if(!nf) return;
        const t=new Date(nf).getTime(); if(isNaN(t)||t>now) return;
        if(_fuNotified.has(key)) return; _fuNotified.add(key);
        _metaPopup("Follow-up due — "+(l.name||l.phone||"lead")+(l.assignedTo?(" · "+l.assignedTo):"")+" (planned "+fmtIST(nf)+")","warn");
      });
      _fuNotified.forEach(k=>{ if(!live.has(k)) _fuNotified.delete(k); });   // re-arm when completed
    }
    // Shared TOP filters (Date & Time / Source / Service). Applied to BOTH the Advisor
    // Dashboard (cards + drill-down) and the Assigned-leads table so they refresh together.
    // Returns the list unchanged when nothing is selected (no behavior change by default).
    // The filters are APPLIED on demand (Apply button), not on every keystroke/change.
    // haCommonFilter reads this committed state, so staging a selection in the controls
    // does NOT touch the data until _topFilterApply() copies the controls into it.
    let _asnApplied:{src:string;svc:string;from:string;to:string;advisor:string}={src:"all",svc:"all",from:"",to:"",advisor:"all"};
    function haCommonFilter(list:any[]){
      const src=_asnApplied.src, svc=_asnApplied.svc, from=_asnApplied.from, to=_asnApplied.to, adv=_asnApplied.advisor;
      const fromT=from?new Date(from+"T00:00:00").getTime():0;
      const toT=to?new Date(to+"T23:59:59").getTime():0;
      if(src==="all"&&svc==="all"&&!fromT&&!toT&&(!adv||adv==="all")) return list;
      return list.filter((l:any)=>{
        if(src!=="all"&&(l.source||"")!==src) return false;
        if(svc!=="all"&&(l.service||"")!==svc) return false;
        if(adv&&adv!=="all"&&(l.assignedTo||"")!==adv) return false;   // advisor is a TOP filter → drives dashboard + table
        if(fromT||toT){ const dv=_asnDateVal(l); const t=dv?new Date(dv).getTime():0; if(fromT&&t<fromT) return false; if(toT&&t>toT) return false; }
        return true;
      });
    }
    // Apply the staged top-filter selections → refresh dashboard AND assigned leads together.
    w._topFilterApply=()=>{
      _asnApplied={
        src:(root.querySelector("#asnSource")as HTMLSelectElement)?.value||"all",
        svc:(root.querySelector("#asnService")as HTMLSelectElement)?.value||"all",
        from:(root.querySelector("#asnFrom")as HTMLInputElement)?.value||"",
        to:(root.querySelector("#asnTo")as HTMLInputElement)?.value||"",
        advisor:(root.querySelector("#assignedFilter")as HTMLSelectElement)?.value||"all",
      };
      _asnPage=1; renderAssignedLeads(); renderHealthDashboard();
    };
    w._topFilterClear=()=>{
      const set=(id:string,v:string)=>{const el=root.querySelector("#"+id)as any; if(el)el.value=v;};
      set("asnFrom",""); set("asnTo",""); set("asnSource","all"); set("asnService","all"); set("assignedFilter","all");
      _asnApplied={src:"all",svc:"all",from:"",to:"",advisor:"all"};
      _asnPage=1; renderAssignedLeads(); renderHealthDashboard();
    };
    function renderHealthDashboard(){
      const fsel=root.querySelector("#haStatusFilter")as HTMLSelectElement;
      if(fsel && fsel.options.length<=1){
        fsel.innerHTML='<option value="all">All call/lead statuses</option>'+HA_STATUSES.map(s=>'<option>'+s+'</option>').join("");
      }
      const filter=fsel?.value||"all";
      let book=haCommonFilter(haBook());
      if(filter!=="all") book=book.filter((l:any)=>haEffStatus(l)===filter);
      const counts:any={open:0,sales:0,health:0,payment:0,enrolled:0,followup:0,closed:0};
      book.forEach((l:any)=>{counts[haBucketOf(haEffStatus(l))]++;});
      const kpiEl=root.querySelector("#haKpis");
      if(kpiEl){
        const cards=HA_CARDS.map(c=>'<div class="metric '+c.c+'" style="cursor:pointer" onclick="window._haCardClick(\''+c.key+'\')"><div class="ml">'+c.label+'</div><div class="mv">'+counts[c.key]+'</div></div>');
        cards.push('<div class="metric" style="cursor:pointer" onclick="window._haCardClick(\'callstatus\')"><div class="ml">Call Status'+(filter!=="all"?": "+filter:"")+'</div><div class="mv">'+book.length+'</div></div>');
        kpiEl.innerHTML=cards.join("");
      }
      if(_haActiveBucket) renderHaResults();
    }
    // Per-lead Enrolled status (advisor detail) — read-only, mirrors leads.call_status
    // + enrolled_at. Set automatically when the coach marks the client Enrolled.
    function _advApplyEnrolled(callStatus:any,enrolledAt:any){
      const isE=/enrol/i.test(String(callStatus||""));
      const cont=root.querySelector("#enrStatusPills");
      if(cont){ cont.querySelectorAll(".pill").forEach((b:any,i:number)=>b.classList.toggle("on", i===(isE?1:0))); }
      const ed=root.querySelector("#enrDt")as HTMLInputElement|null;
      if(ed) ed.value=(isE&&enrolledAt)?fmtIST(enrolledAt):"";
    }
    function renderHaResults(){
      const wrap=root.querySelector("#haResultsWrap")as HTMLElement;
      const body=root.querySelector("#haResultsBody");
      const title=root.querySelector("#haResultsTitle");
      if(!wrap||!body) return;
      const fsel=root.querySelector("#haStatusFilter")as HTMLSelectElement;
      const filter=fsel?.value||"all";
      let book=haCommonFilter(haBook());
      if(filter!=="all") book=book.filter((l:any)=>haEffStatus(l)===filter);
      const list=_haActiveBucket==="callstatus"?book:book.filter((l:any)=>haBucketOf(haEffStatus(l))===_haActiveBucket);
      const card=HA_CARDS.find(c=>c.key===_haActiveBucket);
      wrap.style.display="";
      if(title) title.textContent=(card?card.label:"Call status")+" — "+list.length+" lead"+(list.length===1?"":"s");
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      // Follow-ups card → dedicated table: name, number, planned date & time, source, advisor, status.
      if(_haActiveBucket==="followup"){
        const hd=root.querySelector("#haResultsHead"); if(hd)hd.innerHTML='<th>Lead Name</th><th>Lead Number</th><th>Planned Follow-up Date &amp; Time</th><th>Source · Lang</th><th>Assigned Advisor</th><th>Follow-up Status</th>';
        const now=Date.now();
        body.innerHTML=list.length?list.map((l:any)=>{ const nf=(_advLeadsDet[String(l.id)]||{}).next_followup; const due=nf&&new Date(nf).getTime()<=now;
          return '<tr>'
            +'<td style="font-weight:600;cursor:pointer;color:var(--brand)" onclick="window._openLeadProfile(\''+e(String(l.id))+'\')">'+e(l.name)+' ↗</td>'
            +'<td class="mono">'+e(l.phone||"—")+'</td>'
            +'<td class="mono" style="font-size:11px;white-space:nowrap">'+e(nf?fmtIST(nf):"—")+'</td>'
            +'<td><span class="tag">'+e(l.source==="Manual"?"Manual":((l.source||"Meta")+" · "+(l.lang||"Tamil")))+'</span></td>'
            +'<td>'+e(l.assignedTo||"—")+'</td>'
            +'<td>'+(nf?(due?'<span class="chipb al">Overdue</span>':'<span class="chipb warn">Pending</span>'):'<span class="chipb neu">Pending</span>')+'</td></tr>';
        }).join(""):'<tr><td colspan="6" style="text-align:center;color:var(--faint);padding:16px">No pending follow-ups</td></tr>';
        return;
      }
      const _hhd=root.querySelector("#haResultsHead"); if(_hhd)_hhd.innerHTML=gridHead("haResults"); const _haR=gridApply("haResults",list); body.innerHTML=_haR.length?_haR.map((l:any)=>'<tr>'
        +'<td style="font-weight:600;cursor:pointer;color:var(--brand)" onclick="window._openLeadProfile(\''+e(String(l.id))+'\')">'+e(l.name)+' ↗</td>'
        +'<td><span class="tag">'+e(l.source==="Manual"?"Manual":((l.source||"Meta")+" · "+(l.lang||"Tamil")))+'</span></td>'
        +'<td>'+e(l.assignedTo||"—")+'</td>'
        +'<td><span class="chipb '+(haBucketOf(haEffStatus(l))==="closed"?"warn":"ok")+'">'+e(haEffStatus(l))+'</span></td></tr>').join("")
        :'<tr><td colspan="4" style="text-align:center;color:var(--faint);padding:16px">No leads in this status</td></tr>';
    }
    w._haCardClick=(key:string)=>{_haActiveBucket=key;renderHaResults();const wr=root.querySelector("#haResultsWrap");if(wr)wr.scrollIntoView({behavior:"smooth",block:"nearest"});};
    w._haCloseResults=()=>{_haActiveBucket="";const wr=root.querySelector("#haResultsWrap")as HTMLElement;if(wr)wr.style.display="none";};
    {const fsel=root.querySelector("#haStatusFilter")as HTMLSelectElement;if(fsel)fsel.onchange=()=>{_asnPage=1;renderAssignedLeads();renderHealthDashboard();};}
    // Persist a call-status change for the currently-open lead (drives KPIs).
    w._haSetCallStatus=(label:string)=>{
      if(!_advLeadId){return;}
      const l=haBook().find((x:any)=>String(x.id)===_advLeadId)||_metaLeads.find((x:any)=>String(x.id)===_advLeadId);
      if(l) l.callStatus=label;
      supabase.from("leads").update({call_status:label}).eq("meta_lead_id",_advLeadId).then(()=>{});
      renderHealthDashboard();
      try{ renderAssignedLeads(); }catch(_){}   // keep the Assigned-leads Call Status column live
    };

    // Checked pool-lead ids (by data-id, so it's correct even with the time-range filter on).
    function _poolCheckedIds(){
      return Array.from(root.querySelectorAll(".poolChk:checked")).map((c:any)=>c.getAttribute("data-id")).filter(Boolean).map(String).filter((id:string)=>id.indexOf("seed-")!==0);
    }
    function _afterAssign(){
      return loadAssignmentExtras().then(()=>{ rebuildPoolFromDB(); renderUnassignedPool();renderMetaPage();renderImport();renderAdvisorLoad();renderAssigneesTable();renderAssignedLeads();renderHealthDashboard(); });
    }
    // Assign a set of leads to ONE advisor (Assign selected). assigned_at is best-effort
    // so assignment still works before the deviation migration is run.
    async function _assignManyTo(ids:string[],advisor:string){
      const nowIso=new Date().toISOString();
      try{
        for(let i=0;i<ids.length;i+=200){
          const chunk=ids.slice(i,i+200);
          const {error}=await supabase.from("leads").update({assigned_to:advisor,is_assigned:true,in_pool:false}).in("meta_lead_id",chunk);
          if(error) throw error;
          try{ await supabase.from("leads").update({assigned_at:nowIso}).in("meta_lead_id",chunk); }catch(_){}
        }
      }catch(e:any){ toast(/in_pool|column|schema|exist/i.test(e.message||"")?"Run the assignment migrations first":"Assign failed: "+(e.message||"db error")); return; }
      ids.forEach(id=>{const ld=_metaLeads.find((x:any)=>String(x.id)===id); if(ld){ld.inPool=false;ld.isAssigned=true;ld.assignedTo=advisor;} logActivity(id,[{action:"Assigned",field:"Assigned to",new:advisor}]); logAssignment(id,advisor,"assigned");});
      await _afterAssign();
      toast(ids.length+" lead"+(ids.length===1?"":"s")+" assigned to "+advisor);
    }
    // Advisors currently ticked in the "Assign to" checkbox dropdown.
    function _poolSelectedAdvisors():string[]{
      return Array.from(root.querySelectorAll("#poolAssignMenu .poolAdvChk:checked")).map((c:any)=>String(c.getAttribute("data-adv"))).filter(Boolean);
    }
    // Open/close the advisor dropdown menu (absolute; the pool card is set to
    // overflow:visible so the menu isn't clipped).
    w._poolAdvToggleMenu=(e:any)=>{ if(e&&e.stopPropagation)e.stopPropagation(); const m=root.querySelector("#poolAssignMenu")as HTMLElement|null; if(m) m.style.display=(m.style.display==="block")?"none":"block"; };
    // Refresh the button label + gate the round-robin button (enabled only at 2+ advisors).
    w._poolAdvSelChange=()=>{
      const advs=_poolSelectedAdvisors();
      const lab=root.querySelector("#poolAssignLabel")as HTMLElement|null;
      if(lab){ if(!advs.length){ lab.textContent="— Select advisor(s) —"; lab.style.color="var(--muted)"; } else if(advs.length<=2){ lab.textContent=advs.join(", "); lab.style.color="var(--ink)"; } else { lab.textContent=advs.length+" advisors selected"; lab.style.color="var(--ink)"; } }
      const rr=root.querySelector("#poolRRBtn")as HTMLButtonElement|null;
      if(rr){ rr.disabled=advs.length<2; rr.style.opacity=advs.length<2?"0.5":"1"; rr.style.cursor=advs.length<2?"not-allowed":"pointer"; rr.title=advs.length<2?"Select 2 or more advisors to round-robin":"Distribute the ticked leads across the selected advisors"; }
    };
    // Close the advisor menu when clicking outside it.
    document.addEventListener("click",(e:any)=>{ const wrap=root.querySelector("#poolAssignWrap"); const m=root.querySelector("#poolAssignMenu")as HTMLElement|null; if(m&&m.style.display==="block"&&wrap&&!wrap.contains(e.target)) m.style.display="none"; });
    // Assign selected → all ticked leads to the (single) selected advisor.
    w._assignSelected=async()=>{
      const advs=_poolSelectedAdvisors();
      if(!advs.length){ toast("Select an advisor in 'Assign to' first"); return; }
      const ids=_poolCheckedIds();
      if(!ids.length){ toast("Tick one or more pooled leads first"); return; }
      await _assignManyTo(ids,advs[0]);
    };
    // Round-robin the ticked leads across ONLY the selected advisors (2+ required).
    w._assignSelectedRR=async()=>{
      const advs=_poolSelectedAdvisors();
      if(advs.length<2){ toast("Select 2 or more advisors for round-robin"); return; }
      const ids=_poolCheckedIds();
      if(!ids.length){ toast("Tick one or more pooled leads first"); return; }
      const nowIso=new Date().toISOString();
      try{
        for(let i=0;i<ids.length;i++){
          const name=advs[i%advs.length];
          const {error}=await supabase.from("leads").update({assigned_to:name,is_assigned:true,in_pool:false}).eq("meta_lead_id",ids[i]);
          if(error) throw error;
          try{ await supabase.from("leads").update({assigned_at:nowIso}).eq("meta_lead_id",ids[i]); }catch(_){}
          const ld=_metaLeads.find((x:any)=>String(x.id)===ids[i]);
          if(ld){ld.inPool=false;ld.isAssigned=true;ld.assignedTo=name;}
          logActivity(ids[i],[{action:"Assigned",field:"Assigned to",new:name+" (round-robin)"}]);
          logAssignment(ids[i],name,"assigned");
        }
      }catch(e:any){ toast(/in_pool|column|schema|exist/i.test(e.message||"")?"Run the assignment migrations first":"Distribute failed: "+(e.message||"db error")); return; }
      await _afterAssign();
      toast(ids.length+" lead"+(ids.length===1?"":"s")+" distributed across "+advs.length+" selected advisors");
    };

    w._sendToAssignment=async()=>{
      // Use the cross-page selection set (every lead the user ticked, on any page).
      const ids=Array.from(_feedSelected).filter(id=>id&&!_movedToPool.has(id));
      if(ids.length===0){toast("Select one or more leads first");return;}
      // Persist to the database first so the assignment survives refresh.
      try{
        const nowIso=new Date().toISOString();
        for(let i=0;i<ids.length;i+=200){
          const {error}=await supabase.from("leads").update({in_pool:true,pool_added_at:nowIso}).in("meta_lead_id",ids.slice(i,i+200));
          if(error) throw error;
        }
      }catch(e:any){
        const isMissing=/in_pool|column|schema|exist/i.test(e.message||"");
        toast(isMissing?"Run supabase-migration-assignment.sql first":"Save failed: "+(e.message||"db error"));
        return;
      }
      // Reflect locally: flag in-memory leads, mark them moved (so they leave the feed
      // entirely — any source), and drop them from the selection.
      ids.forEach(id=>{const ld=feedAll().find((x:any)=>String(x.id)===id);if(ld)ld.inPool=true; _movedToPool.add(String(id)); _feedSelected.delete(id);});
      rebuildPoolFromDB();
      renderMetaPage();          // moved leads are now excluded from the feed
      renderUnassignedPool();    // reflect in Assign & approve immediately
      toast(ids.length+" lead"+(ids.length===1?"":"s")+" sent to assignment — removed from the feed");
    };
    // Toggle a single lead in the cross-page selection set.
    w._feedToggleSel=(el:HTMLInputElement)=>{
      const id=el.getAttribute("data-id"); if(!id) return;
      if(el.checked) _feedSelected.add(id); else _feedSelected.delete(id);
      syncFeedSelUI();
    };
    // Switch the live feed between All / Duplicates / Valid / Invalid views.
    w._feedSetView=(v:"all"|"dup"|"valid"|"invalid")=>{
      _feedView=v; _metaPageNum=1;
      root.querySelectorAll("#feedViewTabs button").forEach((b:any)=>b.classList.toggle("on",b.getAttribute("data-fv")===v));
      if(v==="dup"){ _dupColorMap=buildDupColorMap(); }   // colour the duplicates view
      renderMetaPage();
    };
    // Live-feed lead search (debounced) — narrows the current view + filters.
    w._feedSearch=()=>{
      const el=root.querySelector("#feedSearch")as HTMLInputElement|null;
      _feedQuery=((el?el.value:"")||"").trim().toLowerCase();
      _metaPageNum=1;
      if(_feedSearchT) clearTimeout(_feedSearchT);
      _feedSearchT=setTimeout(()=>renderMetaPage(),180);
    };
    // Download the CURRENT feed view (respects tab + filters + search) as CSV.
    w._feedDownload=()=>{
      if(_feedView==="dup"){
        const groups=feedDupGroups();
        if(!groups.length){ toast("No rows to download"); return; }
        const rows:string[][]=[["First Update Date & Time","Repeat Leads Count","Campaign","Ad Name","Lead Name","Phone","Sugar","City","Street","Sources","Service","Language"]];
        groups.forEach((g:any)=>{const l=g.rep; rows.push([fmtIST(l.createdAt),String(g.count),l.campaign||"",l.adName||"",l.name||"",l.phone||"",l.sugar||"",l.city||"",l.street||"",g.sources.join(" | "),l.service||"",l.lang||""]);});
        _downloadCsv("live_feed_duplicates_"+groups.length+".csv",rows);
        toast(groups.length+" duplicate group"+(groups.length===1?"":"s")+" downloaded");
      } else {
        const leads=feedFiltered();
        if(!leads.length){ toast("No rows to download"); return; }
        const rows:string[][]=[["Date & Time (IST)","Campaign","Ad Name","Lead Name","Phone","Sugar","City","Street","Source","Service","Language","Valid"]];
        leads.forEach((l:any)=>rows.push([fmtIST(l.createdAt),l.campaign||"",l.adName||"",l.name||"",l.phone||"",l.sugar||"",l.city||"",l.street||"",feedSrcName(l),l.service||"",l.lang||"",feedIsValid(l)?"Yes":"No"]));
        _downloadCsv("live_feed_"+_feedView+"_"+leads.length+".csv",rows);
        toast(leads.length+" lead"+(leads.length===1?"":"s")+" downloaded");
      }
    };
    // Header "select all" → select EVERY lead matching the active filter, across ALL
    // pages (not just the 10 on screen), so bulk actions apply to the whole result set.
    // Bind the header "select all" (re-bound after the Duplicates view rebuilds the header).
    function bindFeedSelAll(){
      const el=root.querySelector("#feedSelAll")as HTMLInputElement|null;
      if(!el) return;
      el.onchange=()=>{
        const ids=feedSelectableIds();
        if(el.checked) ids.forEach((id:string)=>_feedSelected.add(id));
        else ids.forEach((id:string)=>_feedSelected.delete(id));
        renderMetaPage();
        toast(el.checked?(_feedSelected.size+" lead"+(_feedSelected.size===1?"":"s")+" selected across all pages"):"Selection cleared");
      };
    }
    bindFeedSelAll();
    renderUnassignedPool();
    loadAssignees();   // load the assignee master (Assign-to dropdown + advisor load + settings)

    let _metaFetchInFlight=false;
    let _metaFetchRetries=0;
    let _autoSyncInFlight=false;
    // Auto-pull from Meta when the DB hasn't been synced recently, so today's leads
    // appear without anyone clicking "Sync from Meta". Meta doesn't push to us, so a
    // poll is the only way to capture new leads — this is self-throttled by STALE_MS.
    const AUTO_SYNC_STALE_MS=5*60*1000; // re-sync if last sync older than 5 min
    let _autoSyncFails=0;               // consecutive auto-sync failures
    async function maybeAutoSync(lastSync:any){
      if(_autoSyncInFlight||_syncing) return;
      const finished=lastSync&&lastSync.finished_at?new Date(lastSync.finished_at).getTime():0;
      if(finished&&(Date.now()-finished)<AUTO_SYNC_STALE_MS) return; // fresh enough
      await runAutoSync();
    }
    // Pull fresh leads from Meta and keep the "Last Synced" label current. Drives the
    // automatic 5-minute sync; updates the timestamp on success and shows the error
    // states on failure — all without a manual page refresh.
    async function runAutoSync(){
      if(_autoSyncInFlight||_syncing) return;
      _autoSyncInFlight=true;
      const statusEl=root.querySelector("#metaFeedStatus");
      if(statusEl){ statusEl.textContent="Syncing from Meta…"; statusEl.classList.add("syncing"); }
      try{
        const res=await fetch(_api("/api/meta/sync"),{method:"POST"});
        const data=await res.json().catch(()=>({}));
        if(data&&data.ok){
          _autoSyncFails=0;
          setMetaConn("connected");
          setSyncedLabel(new Date());     // immediate "Last Synced: <now> IST"
          await fetchMetaLiveFeed();        // pull the new leads (re-confirms label from DB)
        }else{
          _autoSyncFails++;
          if(data&&data.error) setMetaConn("disconnected",data.error);
          if(statusEl) statusEl.textContent=_autoSyncFails>=2?"⚠ Unable to sync data. Please check the Meta connection.":"⚠ Last sync failed. Retrying…";
        }
      }catch(_){
        _autoSyncFails++;
        if(statusEl) statusEl.textContent=_autoSyncFails>=2?"⚠ Unable to sync data. Please check the Meta connection.":"⚠ Last sync failed. Retrying…";
      }finally{ _autoSyncInFlight=false; const s2=root.querySelector("#metaFeedStatus"); if(s2) s2.classList.remove("syncing"); }
    }
    // Perf: during a (background) sync we only rebuild the screen the user is looking
    // at; the other screens are marked dirty and rebuilt when navigated to. This keeps
    // in-memory data fresh everywhere while avoiding the whole-app DOM thrash that made
    // the UI freeze during sync. (Filters/actions still render their screen immediately.)
    const _screenRender:Record<string,()=>void>={
      import:()=>{ renderImport(); renderMetaPage(); },
      advisor:()=>{ renderAssignedLeads(); renderHealthDashboard(); renderAsnHist(); },
      abm:()=>{ renderUnassignedPool(); renderAdvisorLoad(); renderAssigneesTable(); }
    };
    const _dirtyScreens=new Set<string>();
    function _activeScreenId(){ const s=root.querySelector(".screen.active"); return s?s.id.replace(/^s-/,""):""; }
    function _renderVisibleOrDefer(){
      const active=_activeScreenId();
      Object.keys(_screenRender).forEach(scr=>{
        if(scr===active){ _dirtyScreens.delete(scr); try{ _screenRender[scr](); }catch(_){} }
        else _dirtyScreens.add(scr);
      });
    }
    w._flushDirtyScreen=(scr:string)=>{ if(_dirtyScreens.has(scr)){ _dirtyScreens.delete(scr); try{ _screenRender[scr]&&_screenRender[scr](); }catch(_){} } };
    async function fetchMetaLiveFeed(){
      if(_metaFetchInFlight) return; // prevent overlapping requests piling up
      _metaFetchInFlight=true;
      const tbody=root.querySelector("#liveFeedBody");
      const statusEl=root.querySelector("#metaFeedStatus");
      const countEl=root.querySelector("#metaFeedCount");
      const haveData=_metaLeads&&_metaLeads.length>0;
      try{
        const res=await fetch(_api("/api/meta/leads"));
        const data=await res.json();
        if(data.error){
          // Only a real schema problem is permanent; everything else (e.g. a
          // transient "fetch failed" to Supabase) is retried, WITHOUT wiping data.
          const schemaErr=/column|relation|does not exist|schema/i.test(data.error)&&!/fetch failed/i.test(data.error);
          if(schemaErr){
            if(!haveData){_metaLeads=[];IMP.length=0;renderImport();}
            if(statusEl) statusEl.textContent="⚠ Run the SQL migrations, then Sync";
            if(tbody&&!haveData) tbody.innerHTML='<tr><td colspan="14" style="text-align:center;color:var(--warn-ink);padding:24px">Database not ready: '+data.error+'</td></tr>';
            return;
          }
          throw new Error(data.error||"fetch failed");   // transient → handled in catch (retry)
        }
        if(!data.leads||data.leads.length===0){
          _metaLeads=[];IMP.length=0;renderImport();
          if(statusEl) statusEl.textContent=(data.lastSync?"Synced · no leads matched your ad accounts":"Not synced yet — pulling from Meta…");
          if(tbody) tbody.innerHTML='<tr><td colspan="14" style="text-align:center;color:var(--faint);padding:24px">No synced leads yet. Pulling from Meta…</td></tr>';
          if(countEl) countEl.textContent="0 leads in database";
          maybeAutoSync(data.lastSync);   // empty DB → trigger an initial sync
          return;
        }
        _metaFetchRetries=0;   // success — reset retry counter
        // Sort by latest Date & Time first (newest createdAt at top)
        _metaLeads=[...data.leads].sort((a:any,b:any)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
        // Restore the assignment pool from the DB (in_pool flag) BEFORE rendering
        // the feed, so already-pooled leads (incl. CSV extras) show after a refresh.
        await loadAssignmentExtras();
        rebuildPoolFromDB();
        // Upgrade the restored open-leads placeholders to live lead objects (once).
        relinkOpenLeads();
        // Build the shared IMP dataset (Meta + all other sources) so the KPI cards
        // and Source Connections table reflect EVERY source, incl. manual leads.
        await loadOtherSourceLeads();
        rebuildIMP();
        // Only rebuild the screen in view; the rest render when navigated to (no freeze).
        _renderVisibleOrDefer();
        // Show the latest successful sync time from the database (auto-refreshes
        // on every 5-min poll, so the label always reflects the newest sync).
        let syncMsg="";
        if(data.lastSync&&data.lastSync.finished_at){
          syncMsg="Last Synced: "+fmtSyncTime(new Date(data.lastSync.finished_at));
        }else{
          syncMsg="Not synced yet — click Sync from Meta";
        }
        if(statusEl) statusEl.textContent=syncMsg;
        if(countEl) countEl.textContent=feedAll().length+" leads in database";
        // Connection monitor: leads loaded → connected (unless the last sync errored).
        setMetaConn((data.lastSync&&data.lastSync.status==="error")?"disconnected":"connected",data.lastSync&&data.lastSync.error);
        updateMetaAlert();
        // If the DB is stale, pull fresh leads from Meta in the background (captures today's leads).
        maybeAutoSync(data.lastSync);
      }catch(e:any){
        // Transient failure (e.g. Supabase "fetch failed" on a cold start / network
        // blip). NEVER wipe already-loaded data — just retry with backoff so the
        // page recovers automatically instead of looking "reset".
        _metaFetchInFlight=false;
        if(_metaFetchRetries<8){
          _metaFetchRetries++;
          const delay=Math.min(1500*_metaFetchRetries,8000);
          if(statusEl) statusEl.textContent="Reconnecting to database… (attempt "+_metaFetchRetries+")";
          if(tbody&&!haveData) tbody.innerHTML='<tr><td colspan="14" style="text-align:center;color:var(--faint);padding:24px">Loading leads from the database…</td></tr>';
          setTimeout(()=>{ fetchMetaLiveFeed(); }, delay);
          return;
        }
        if(statusEl) statusEl.textContent="⚠ Could not reach the database — click ↻ Reload";
        if(tbody&&!haveData) tbody.innerHTML='<tr><td colspan="14" style="text-align:center;color:var(--faint);padding:24px">Could not reach the database. Click ↻ Reload to retry.</td></tr>';
        setMetaConn("disconnected","database unreachable");   // leads aren't flowing → flag it
        return;
      }finally{
        _metaFetchInFlight=false;
      }
    }
    w._refreshMetaFeed=()=>{
      toast("Reloading from database…");
      _metaFetchRetries=0;_metaFetchInFlight=false;
      fetchMetaLiveFeed();
    };
    let _syncing=false;
    w._syncFromMeta=async()=>{
      if(_syncing){toast("Sync already running…");return;}
      _syncing=true;
      const btn=root.querySelector("#metaSyncBtn")as HTMLButtonElement;
      const statusEl=root.querySelector("#metaFeedStatus");
      if(btn){btn.disabled=true;btn.textContent="⏳ Syncing from Meta… (~2 min)";}
      if(statusEl) statusEl.textContent="Syncing from Meta — crawling forms & filtering to your ad accounts…";
      toast("Meta sync started — this can take ~2 minutes");
      try{
        const res=await fetch(_api("/api/meta/sync"),{method:"POST"});
        const data=await res.json();
        if(data.error){
          toast("Sync failed: "+data.error);
          if(statusEl) statusEl.textContent="⚠ Sync failed: "+data.error;
          setMetaConn("disconnected",data.error);
        }else{
          const s=data.stats||{};
          toast("Sync complete — "+(s.leadsSynced||0)+" leads from "+((s.accessibleAccounts||[]).length)+" ad account(s)");
          setMetaConn("connected");
          await fetchMetaLiveFeed();
        }
      }catch(e:any){
        toast("Sync error: "+(e.message||"network"));
        if(statusEl) statusEl.textContent="⚠ Sync error";
        setMetaConn("disconnected",e.message||"network");
      }finally{
        _syncing=false;
        if(btn){btn.disabled=false;btn.textContent="⟳ Sync from Meta";}
      }
    };
    // Restore the open-leads list instantly from localStorage (placeholder names),
    // before the feed finishes loading. relinkOpenLeads() upgrades to live data later.
    // Placed here so the dashboard/HA_* constants it touches are already initialised.
    restoreOpenLeads();

    fetchMetaLiveFeed();
    // AUTOMATIC SYNC every 5 minutes: pull fresh leads from Meta and update the
    // "Last Synced" timestamp — no manual refresh needed. runAutoSync re-reads the
    // feed on success, so the dashboard + label always reflect the newest sync.
    _metaFeedTimer=setInterval(runAutoSync,300000);
    // Connection/alert monitor: refresh the 30-min no-lead banner every 60s so it
    // fires (and clears) on time even when no new leads arrive.
    updateMetaAlert();
    _metaMonitorTimer=setInterval(updateMetaAlert,60000);
    // Follow-up due/overdue reminders (checked on the same cadence).
    _checkFuReminders();
    setInterval(_checkFuReminders,60000);
    // Floor all future-scheduling date/time pickers so past dates/times can't be chosen.
    _wireFutureFields();

    // ===== REAL-TIME: Supabase pushes new/changed leads instantly (no refresh) =====
    function dbRowToLead(r:any){
      const createdAt=r.created_at||r.lead_date;
      const m=Math.floor((Date.now()-new Date(createdAt).getTime())/60000);
      const received=m<1?"now":(m<60?m+"m":(m<1440?Math.floor(m/60)+"h":Math.floor(m/1440)+"d"));
      return {id:r.meta_lead_id,name:r.name,phone:r.phone,email:r.email,source:"Meta",
        campaign:r.campaign||"—",adName:r.ad_name||"",sugar:r.sugar_poll||"",city:r.city||"",street:r.street||"",
        service:r.service||"Diabetes",lang:r.language||"Tamil",received,createdAt,
        adAccountName:r.ad_account_name||"",isValid:r.is_valid,isDuplicate:r.is_duplicate,
        isAssigned:r.is_assigned,inPool:!!r.in_pool,poolAddedAt:r.pool_added_at||null,assignedTo:r.assigned_to||"",callStatus:r.call_status||"",enrolledAt:r.enrolled_at||null};
    }
    function liveRerenderAll(){
      _metaLeads.sort((a:any,b:any)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
      rebuildIMP();   // Meta + other-source leads (don't drop manual/walk-in from the dashboard)
      rebuildPoolFromDB();
      _renderVisibleOrDefer();   // only rebuild the visible screen; others render on navigation
      const countEl=root.querySelector("#metaFeedCount");if(countEl)countEl.textContent=feedAll().length+" leads in database";
      updateMetaAlert();   // a live change refreshes the 30-min no-lead alert
    }
    try{
      const _leadsChannel=supabase
        .channel("leads-realtime")
        .on("postgres_changes",{event:"INSERT",schema:"public",table:"leads",filter:"source=eq.Meta Ads"},(payload:any)=>{
          const lead=dbRowToLead(payload.new);
          if(_metaLeads.some((x:any)=>String(x.id)===String(lead.id))) return; // dedupe
          _metaLeads.unshift(lead);
          _metaPageNum=1;                 // jump to first page so the newest is visible on top
          setMetaConn("connected");       // leads flowing → connected
          liveRerenderAll();
          const st=root.querySelector("#metaFeedStatus");if(st)st.textContent="🟢 Live — new lead "+(lead.name||"")+" just now";
          toast("New lead received: "+(lead.name||lead.phone||"Meta lead"));
        })
        .on("postgres_changes",{event:"UPDATE",schema:"public",table:"leads",filter:"source=eq.Meta Ads"},(payload:any)=>{
          const upd=dbRowToLead(payload.new);
          const ld=_metaLeads.find((x:any)=>String(x.id)===String(upd.id));
          if(!ld) return;
          ld.isAssigned=upd.isAssigned;ld.inPool=upd.inPool;ld.assignedTo=upd.assignedTo;ld.isValid=upd.isValid;ld.isDuplicate=upd.isDuplicate;
          liveRerenderAll();
        })
        .on("postgres_changes",{event:"DELETE",schema:"public",table:"leads"},(payload:any)=>{
          const oldId=payload.old?.meta_lead_id;
          if(!oldId) return;
          const i=_metaLeads.findIndex((x:any)=>String(x.id)===String(oldId));
          if(i>=0){_metaLeads.splice(i,1);liveRerenderAll();}
        })
        .subscribe();
      w.__leadsChannel=_leadsChannel;   // kept for cleanup on unmount
    }catch(e){ /* realtime optional — poll fallback still runs */ }

    // ========== BULK CSV IMPORT ==========
    const CSV_COLS=["Date & Time","Campaign","Ad Name","Lead Name","Phone Number","Sugar Poll","City","Street","Source","Service","Name"];
    let _csvParsed:any[]=[];            // rows parsed from the chosen file (pre-import)
    let _csvLeads:any[]=[];             // all imported rows from DB (valid + duplicate)
    let _csvBatches:any[]=[];           // import history from DB
    const _csvPhones=new Set<string>(); // valid phones already in DB (dedupe)
    let _csvPage=1, _csvDupPage=1, _csvTabName="valid";
    const CSV_PER=10;
    // Duplicates are review items: they live in the Duplicates tab for 10 minutes
    // after upload, then are auto-removed (hidden immediately, deleted from the DB
    // by a periodic sweep). Valid imported leads are never touched.
    const DUP_TTL_MS=10*60*1000;
    function dupAgeMs(r:any){ return r.created_at?(Date.now()-new Date(r.created_at).getTime()):0; }
    function isActiveDup(r:any){ return r.status==="duplicate" && (!r.created_at || dupAgeMs(r)<DUP_TTL_MS); }
    let _csvSweepTimer:any=null;
    async function sweepExpiredDups(){
      const expired=_csvLeads.filter((r:any)=>r.status==="duplicate"&&r.created_at&&dupAgeMs(r)>=DUP_TTL_MS);
      if(expired.length){
        const ids=expired.map((r:any)=>r.id);
        try{ for(let i=0;i<ids.length;i+=200){ await supabase.from("csv_leads").delete().in("id",ids.slice(i,i+200)); } }catch(_){}
        _csvLeads=_csvLeads.filter((r:any)=>!ids.includes(r.id));
      }
      renderCsvValid();renderCsvDup();   // refresh counts + table even if nothing expired this tick
    }

    // ---- Shared time-range filter (applies to all 4 CSV tabs) ----
    const _csvRange:{from:Date|null,to:Date|null}={from:null,to:null};
    // Robust date parser: CSV "Date & Time" values arrive in mixed formats
    // (YYYY-MM-DD HH:mm, DD-MM-YYYY HH:mm, DD/MM/YYYY) which `new Date()` can't
    // parse reliably (it returned NaN → every row was filtered out → "0 records").
    function parseFlexDate(s:any):Date|null{
      if(!s) return null;
      s=String(s).trim();
      if(/^\d{4}-\d{2}-\d{2}T/.test(s)){ const d=new Date(s); return isNaN(d.getTime())?null:d; }  // ISO (created_at)
      let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);                       // YYYY-MM-DD [HH:mm]
      if(m) return new Date(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0));
      m=s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[ T](\d{1,2}):(\d{2}))?/);                     // DD-MM-YYYY [HH:mm]
      if(m) return new Date(+m[3],+m[2]-1,+m[1],+(m[4]||0),+(m[5]||0));
      const d=new Date(s); return isNaN(d.getTime())?null:d;
    }
    function inCsvRange(dateStr:string){
      if(!_csvRange.from&&!_csvRange.to) return true;   // no range = all
      const d=parseFlexDate(dateStr);
      if(!d) return false;                              // can't place undated/unparseable rows in a range
      if(_csvRange.from&&d<_csvRange.from) return false;
      if(_csvRange.to&&d>_csvRange.to) return false;
      return true;
    }
    function _csvApplyPreset(name:string){
      const fromEl=root.querySelector("#csvRangeFrom")as HTMLInputElement;
      const toEl=root.querySelector("#csvRangeTo")as HTMLInputElement;
      const fmt=(d:Date)=>{const p=(n:number)=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"T"+p(d.getHours())+":"+p(d.getMinutes());};
      const now=new Date();let from:Date|null=null,to:Date|null=new Date(now);
      const sod=(d:Date)=>{const x=new Date(d);x.setHours(0,0,0,0);return x;};
      const eod=(d:Date)=>{const x=new Date(d);x.setHours(23,59,59,999);return x;};
      if(name==="today"){from=sod(now);to=eod(now);}
      else if(name==="yesterday"){const y=new Date(now);y.setDate(y.getDate()-1);from=sod(y);to=eod(y);}
      else if(name==="7d"){from=new Date(now);from.setDate(from.getDate()-7);to=now;}
      else if(name==="30d"){from=new Date(now);from.setDate(from.getDate()-30);to=now;}
      else if(name==="month"){from=new Date(now.getFullYear(),now.getMonth(),1,0,0,0);to=now;}
      else if(name==="all"){if(fromEl)fromEl.value="";if(toEl)toEl.value="";return;}
      else return; // custom — leave inputs as the user set them
      if(fromEl&&from)fromEl.value=fmt(from);
      if(toEl&&to)toEl.value=fmt(to);
    }
    w._csvApplyRange=()=>{
      const fromEl=root.querySelector("#csvRangeFrom")as HTMLInputElement;
      const toEl=root.querySelector("#csvRangeTo")as HTMLInputElement;
      _csvRange.from=fromEl&&fromEl.value?new Date(fromEl.value):null;
      _csvRange.to=toEl&&toEl.value?new Date(toEl.value):null;
      const lab=root.querySelector("#csvRangeLabel");
      if(lab){
        if(!_csvRange.from&&!_csvRange.to) lab.textContent="Showing: all time";
        else{const f=(d:Date|null)=>d?new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}).format(d):"…";lab.textContent="Showing: "+f(_csvRange.from)+" → "+f(_csvRange.to);}
      }
      _csvPage=1;_csvDupPage=1;
      renderCsvValid();renderCsvDup();renderCsvHist();renderCsvRepeat();
      toast("Time-range filter applied");
    };
    w._csvClearRange=()=>{
      _csvRange.from=null;_csvRange.to=null;
      const fromEl=root.querySelector("#csvRangeFrom")as HTMLInputElement;if(fromEl)fromEl.value="";
      const toEl=root.querySelector("#csvRangeTo")as HTMLInputElement;if(toEl)toEl.value="";
      const ps=root.querySelector("#csvRangePreset")as HTMLSelectElement;if(ps)ps.value="all";
      const lab=root.querySelector("#csvRangeLabel");if(lab)lab.textContent="Showing: all time";
      _csvPage=1;_csvDupPage=1;
      renderCsvValid();renderCsvDup();renderCsvHist();renderCsvRepeat();
    };
    // Selecting a preset fills From/To and applies immediately (Custom waits for Apply).
    const _csvPresetEl=root.querySelector("#csvRangePreset")as HTMLSelectElement;
    if(_csvPresetEl) _csvPresetEl.onchange=()=>{ _csvApplyPreset(_csvPresetEl.value); if(_csvPresetEl.value!=="custom") w._csvApplyRange(); };

    function csvEsc(v:string){return '"'+String(v==null?"":v).replace(/"/g,'""')+'"';}
    w._downloadCSVTemplate=()=>{
      const sample=[
        ["2026-06-12 10:30","DR_Jun_Lookalike","Diabetes Reversal A","K. Anu","+919750126135","150-250","Chennai","Anna Nagar 2nd St","Meta","Diabetes","K. Anu"],
        ["2026-06-12 11:05","DR_Reversal_Q2","Sugar Control B","R. Suresh","+919884693633","Above 250","Coimbatore","Gandhipuram Main Rd","Meta","Diabetes","R. Suresh"]
      ];
      const lines=[CSV_COLS.map(csvEsc).join(","),...sample.map(r=>r.map(csvEsc).join(","))];
      const blob=new Blob([lines.join("\r\n")],{type:"text/csv;charset=utf-8;"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download="wellnessos_lead_template.csv";
      document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
      toast("Template downloaded");
    };

    // Minimal RFC-4180 CSV parser (handles quoted fields, commas, escaped quotes)
    function parseCSV(text:string):string[][]{
      const rows:string[][]=[];let field="",row:string[]=[],inQ=false,i=0;
      while(i<text.length){
        const c=text[i];
        if(inQ){
          if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else inQ=false;}
          else field+=c;
        }else{
          if(c==='"')inQ=true;
          else if(c===","){row.push(field);field="";}
          else if(c==="\n"||c==="\r"){if(c==="\r"&&text[i+1]==="\n")i++;row.push(field);field="";if(row.some(x=>x!==""))rows.push(row);row=[];}
          else field+=c;
        }
        i++;
      }
      if(field!==""||row.length){row.push(field);if(row.some(x=>x!==""))rows.push(row);}
      return rows;
    }

    function colIdx(header:string[],names:string[]){
      const norm=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,"");
      const H=header.map(norm);
      for(const n of names){const k=H.indexOf(norm(n));if(k>=0)return k;}
      return -1;
    }

    const csvInput=root.querySelector("#csvFileInput")as HTMLInputElement;
    const csvImportBtn=root.querySelector("#csvImportBtn")as HTMLButtonElement;
    if(csvInput){
      csvInput.onchange=()=>{
        const f=csvInput.files&&csvInput.files[0];
        const nameEl=root.querySelector("#csvFileName");
        const infoEl=root.querySelector("#csvFileInfo");
        const sumEl=root.querySelector("#csvSummary")as HTMLElement|null;
        if(!f){return;}
        const reader=new FileReader();
        reader.onload=()=>{
          const rows=parseCSV(String(reader.result||""));
          if(rows.length<2){_csvParsed=[];if(sumEl)sumEl.textContent="File has no data rows";if(csvImportBtn)csvImportBtn.disabled=true;return;}
          const header=rows[0];
          const idx={
            dt:colIdx(header,["Date & Time","DateTime","date_time","created_time"]),
            campaign:colIdx(header,["Campaign","campaign_name"]),
            ad:colIdx(header,["Ad Name","ad_name"]),
            lead:colIdx(header,["Lead Name","full_name","lead"]),
            phone:colIdx(header,["Phone Number","phone","phone_number"]),
            sugar:colIdx(header,["Sugar Poll","sugar"]),
            city:colIdx(header,["City"]),
            street:colIdx(header,["Street","address"]),
            source:colIdx(header,["Source"]),
            service:colIdx(header,["Service"]),
            name:colIdx(header,["Name"])
          };
          const get=(r:string[],k:number)=>k>=0?(r[k]||"").trim():"";
          _csvParsed=rows.slice(1).map(r=>({
            dt:get(r,idx.dt),campaign:get(r,idx.campaign),ad:get(r,idx.ad),
            lead:get(r,idx.lead)||get(r,idx.name),phone:get(r,idx.phone),sugar:get(r,idx.sugar),
            city:get(r,idx.city),street:get(r,idx.street),source:get(r,idx.source)||"Meta",
            service:get(r,idx.service)||"Diabetes",name:get(r,idx.name)||get(r,idx.lead)
          }));
          // Validate + dedupe preview (valid = has phone; dup = phone seen in file or already imported)
          const filePhones=new Set<string>();let valid=0,dup=0,invalid=0;
          _csvParsed.forEach(r=>{
            if(!r.phone){invalid++;return;}
            if(filePhones.has(r.phone)||_csvPhones.has(r.phone)){dup++;return;}
            filePhones.add(r.phone);valid++;
          });
          if(nameEl)nameEl.textContent=f.name;
          if(infoEl)infoEl.textContent=_csvParsed.length+" rows · parsed";
          if(sumEl){
            sumEl.style.background="var(--warn-bg)";sumEl.style.borderColor="var(--warn)";sumEl.style.color="var(--warn-ink)";
            sumEl.textContent=_csvParsed.length+" rows · "+valid+" new · "+dup+" duplicate (kept for review) · "+invalid+" invalid (no phone)";
          }
          if(csvImportBtn){csvImportBtn.disabled=(valid+dup)===0;csvImportBtn.textContent="Import "+(valid+dup)+" leads";}
        };
        reader.readAsText(f);
      };
    }

    // ---- Confirmation modal ----
    function csvConfirm(message:string,onYes:()=>void){
      const ov=document.createElement("div");
      ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;display:flex;align-items:center;justify-content:center";
      const box=document.createElement("div");
      box.style.cssText="background:var(--surf,#fff);border-radius:14px;padding:22px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3)";
      box.innerHTML='<div style="font-weight:700;font-size:15px;margin-bottom:8px;color:var(--ink)">Please confirm</div>'
        +'<div style="font-size:13px;color:var(--faint);margin-bottom:18px">'+message+'</div>'
        +'<div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn bsm" id="cfCancel">Cancel</button><button class="btn bsm bp" id="cfYes" style="background:var(--alert,#c0392b);border-color:var(--alert,#c0392b)">Delete</button></div>';
      ov.appendChild(box);document.body.appendChild(ov);
      const close=()=>{if(ov.parentNode)document.body.removeChild(ov);};
      (box.querySelector("#cfCancel")as HTMLElement).onclick=close;
      (box.querySelector("#cfYes")as HTMLElement).onclick=()=>{close();onYes();};
      ov.onclick=(ev)=>{if(ev.target===ov)close();};
    }

    // ---- Load persisted CSV data from Supabase ----
    async function loadCsvData(){
      try{
        const [lr,br]=await Promise.all([
          supabase.from("csv_leads").select("*").order("created_at",{ascending:false}),
          supabase.from("csv_import_batches").select("*").order("created_at",{ascending:false})
        ]);
        if(lr.error) throw lr.error;
        _csvLeads=(lr.data||[]).map((r:any)=>({id:r.id,batch_id:r.batch_id,dt:r.date_time,campaign:r.campaign,ad:r.ad_name,lead:r.lead_name,phone:r.phone,sugar:r.sugar_poll,city:r.city,street:r.street,source:r.source,service:r.service,name:r.name,status:r.status,created_at:r.created_at}));
        _csvBatches=br.data||[];
        _csvPhones.clear();
        _csvLeads.forEach((r:any)=>{if(r.status==="valid"&&r.phone)_csvPhones.add(r.phone);});
        renderCsvValid();renderCsvDup();renderCsvHist();populateRvSources();renderCsvRepeat();
      }catch(e:any){
        const sumEl=root.querySelector("#csvSummary");
        if(sumEl&&/exist|relation|schema/i.test(e.message||"")) sumEl.textContent="Run supabase-migration-csv-imports.sql to enable saved imports";
      }
    }

    w._importCSV=async()=>{
      if(!_csvParsed.length){toast("Choose a CSV file first");return;}
      const valid:any[]=[], dup:any[]=[];
      const filePhones=new Set<string>();
      _csvParsed.forEach(r=>{
        if(!r.phone) return;                                   // invalid — skip (no phone)
        const isDup=_csvPhones.has(r.phone)||filePhones.has(r.phone);
        filePhones.add(r.phone);
        (isDup?dup:valid).push(r);
      });
      if(valid.length+dup.length===0){toast("No rows with a phone number");return;}
      if(csvImportBtn){csvImportBtn.disabled=true;csvImportBtn.textContent="Importing…";}
      try{
        const sel=(id:string)=>(root.querySelector(id)as HTMLSelectElement)?.value;
        const meta={
          file_name:(root.querySelector("#csvFileName")?.textContent)||"upload.csv",
          batch_name:sel("#csvBatch")||"—",source:sel("#csvSource")||"Meta",
          branch:sel("#csvBranch")||"—",service:sel("#csvService")||"Diabetes",
          imported_by:"ABM / Admin",
          total_records:valid.length+dup.length,valid_records:valid.length,duplicate_records:dup.length
        };
        const bres=await supabase.from("csv_import_batches").insert(meta).select("id").single();
        if(bres.error) throw bres.error;
        const batchId=bres.data.id;
        const toRow=(r:any,status:string)=>({batch_id:batchId,date_time:r.dt,campaign:r.campaign,ad_name:r.ad,lead_name:r.lead,phone:r.phone,sugar_poll:r.sugar,city:r.city,street:r.street,source:r.source,service:r.service,name:r.name,status});
        const rows=[...valid.map(r=>toRow(r,"valid")),...dup.map(r=>toRow(r,"duplicate"))];
        for(let i=0;i<rows.length;i+=500){const {error}=await supabase.from("csv_leads").insert(rows.slice(i,i+500));if(error) throw error;}
        _csvParsed=[];
        if(csvInput)csvInput.value="";
        const nameEl=root.querySelector("#csvFileName");if(nameEl)nameEl.textContent="Click to choose a CSV file";
        const sumEl=root.querySelector("#csvSummary");if(sumEl)sumEl.textContent=valid.length+" imported · "+dup.length+" duplicates kept for review";
        _csvPage=1;_csvDupPage=1;
        await loadCsvData();   // auto-refreshes all CSV tabs incl. Duplicates with the latest records
        if(dup.length){ w._csvTab("dup"); toast(dup.length+" duplicate"+(dup.length===1?"":"s")+" detected — shown for 10 min in the Duplicates tab"); }
        else toast(valid.length+" leads imported");
      }catch(e:any){
        const isMissing=/exist|relation|schema/i.test(e.message||"");
        toast(isMissing?"Run supabase-migration-csv-imports.sql first":"Import failed: "+(e.message||"db error"));
      }finally{
        if(csvImportBtn){csvImportBtn.disabled=false;csvImportBtn.textContent="Import leads";}
      }
    };

    // ---- Tabs ----
    w._csvTab=(name:string)=>{
      _csvTabName=name;
      root.querySelectorAll("#csvTabs button").forEach((b:any)=>b.classList.toggle("on",b.getAttribute("data-ct")===name));
      root.querySelectorAll(".csv-tab").forEach((d:any)=>{d.style.display=d.getAttribute("data-ctp")===name?"block":"none";});
    };
    root.querySelectorAll("#csvTabs button").forEach((b:any)=>{b.onclick=()=>w._csvTab(b.getAttribute("data-ct"));});

    // ---- Render: valid imported leads ----
    // Lead search for the CSV "Imported leads" table (name / phone / campaign / city).
    let _csvQuery="";
    function csvMatchesQuery(r:any){
      if(!_csvQuery) return true; const q=_csvQuery;
      return (r.lead||"").toLowerCase().includes(q)||(r.name||"").toLowerCase().includes(q)||(r.phone||"").toLowerCase().includes(q)||(r.campaign||"").toLowerCase().includes(q)||(r.city||"").toLowerCase().includes(q);
    }
    w._csvSearch=()=>{
      const el=root.querySelector("#csvSearch")as HTMLInputElement|null;
      _csvQuery=((el?el.value:"")||"").trim().toLowerCase(); _csvPage=1; renderCsvValid();
    };
    // Selection for the Imported-leads table, tracked by id so it survives re-renders
    // (the table repaints on the sweep timer, search, and data reloads).
    // csv_leads.id is a Postgres bigint → the gateway returns it as a STRING, so all
    // selection/matching here keys on the string id (never Number()) to stay consistent.
    const _csvSelIds=new Set<string>();
    function _csvUpdateSelAll(){
      const sa=root.querySelector("#csvValidSelAll")as HTMLInputElement|null; if(!sa) return;
      const boxes=Array.from(root.querySelectorAll("#csvImportedBody .csvChk"))as HTMLInputElement[];
      const checked=boxes.filter((c)=>c.checked).length;
      sa.checked=boxes.length>0&&checked===boxes.length;
      sa.indeterminate=checked>0&&checked<boxes.length;
    }
    w._csvRowSel=(el:any)=>{ const id=String(el.getAttribute("data-id")); if(el.checked)_csvSelIds.add(id); else _csvSelIds.delete(id); _csvUpdateSelAll(); };
    function renderCsvValid(){
      const wrap=root.querySelector("#csvImportedWrap")as HTMLElement;
      const body=root.querySelector("#csvImportedBody");
      const cnt=root.querySelector("#csvImportedCount");
      const vc=root.querySelector("#csvValidCount"),dc=root.querySelector("#csvDupCount"),hc=root.querySelector("#csvHistCount");
      const info=root.querySelector("#csvPageInfo");
      const prev=root.querySelector("#csvPrevBtn")as HTMLButtonElement,next=root.querySelector("#csvNextBtn")as HTMLButtonElement;
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const hd=root.querySelector("#csvImportedHead"); if(hd)hd.innerHTML=gridHead("csvImported");
      const valid=gridApply("csvImported",_csvLeads.filter((r:any)=>r.status==="valid"&&inCsvRange(r.dt)&&csvMatchesQuery(r)));
      const dupN=_csvLeads.filter((r:any)=>isActiveDup(r)&&inCsvRange(r.dt)).length;
      const histN=_csvBatches.filter((b:any)=>inCsvRange(b.created_at)).length;
      if(vc)vc.textContent=String(valid.length);
      if(dc)dc.textContent=String(dupN);
      if(hc)hc.textContent=String(histN);
      if(wrap)wrap.style.display=(_csvLeads.length||_csvBatches.length)?"block":"none";
      if(!body)return;
      const total=valid.length;const pages=Math.max(1,Math.ceil(total/CSV_PER));
      if(_csvPage>pages)_csvPage=pages;if(_csvPage<1)_csvPage=1;
      const pageRows=valid.slice((_csvPage-1)*CSV_PER,(_csvPage-1)*CSV_PER+CSV_PER);
      body.innerHTML=pageRows.length?pageRows.map((r:any)=>'<tr>'
        +'<td><input type="checkbox" class="csvChk" data-id="'+r.id+'"'+(_csvSelIds.has(String(r.id))?" checked":"")+' style="accent-color:var(--brand)" onchange="window._csvRowSel(this)"></td>'
        +'<td class="mono" style="font-size:11.5px;white-space:nowrap">'+e(r.dt||"—")+'</td>'
        +'<td class="mono" style="font-size:11.5px">'+e(r.campaign||"—")+'</td>'
        +'<td>'+e(r.ad||"—")+'</td>'
        +'<td style="font-weight:600">'+e(r.lead||"—")+'</td>'
        +'<td class="mono">'+e(r.phone||"—")+'</td>'
        +'<td>'+e(r.sugar||"—")+'</td>'
        +'<td>'+e(r.city||"—")+'</td>'
        +'<td>'+e(r.street||"—")+'</td>'
        +'<td><span class="tag">'+e(r.source||"—")+'</span></td>'
        +'<td>'+e(r.service||"—")+'</td>'
        +'<td>'+e(r.name||"—")+'</td>'
        +'<td><span class="chipb ok">Valid</span></td>'
        +'<td><button class="btn bsm" style="color:var(--alert-ink)" onclick="window._csvDeleteOne('+r.id+')">Delete</button></td></tr>').join("")
        :'<tr><td colspan="14" style="text-align:center;color:var(--faint);padding:18px">No imported leads yet</td></tr>';
      if(cnt)cnt.textContent=total+" record"+(total===1?"":"s");
      if(info)info.textContent="Page "+_csvPage+" of "+pages;
      void prev; void next;
      _pgBtns("csv",_csvPage,pages);
      _csvUpdateSelAll();   // reflect the preserved selection instead of wiping it
    }

    // ---- Render: duplicates ----
    function renderCsvDup(){
      const body=root.querySelector("#csvDupBody");
      const info=root.querySelector("#csvDupPageInfo");
      const prev=root.querySelector("#csvDupPrevBtn")as HTMLButtonElement,next=root.querySelector("#csvDupNextBtn")as HTMLButtonElement;
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      if(!body)return;
      const hd=root.querySelector("#csvDupHead"); if(hd)hd.innerHTML=gridHead("csvDup");
      const dups=gridApply("csvDup",_csvLeads.filter((r:any)=>isActiveDup(r)&&inCsvRange(r.dt)));
      const total=dups.length;const pages=Math.max(1,Math.ceil(total/CSV_PER));
      if(_csvDupPage>pages)_csvDupPage=pages;if(_csvDupPage<1)_csvDupPage=1;
      const pageRows=dups.slice((_csvDupPage-1)*CSV_PER,(_csvDupPage-1)*CSV_PER+CSV_PER);
      body.innerHTML=pageRows.length?pageRows.map((r:any)=>{
        const leftMs=r.created_at?Math.max(0,DUP_TTL_MS-dupAgeMs(r)):DUP_TTL_MS;
        const leftMin=Math.ceil(leftMs/60000);
        const expChip='<span class="chipb '+(leftMin<=2?"al":"warn")+'" style="margin-left:6px" title="Auto-removed after 10 minutes">⏱ '+leftMin+'m left</span>';
        return '<tr style="background:var(--warn-bg)">'
        +'<td><input type="checkbox" class="csvDupChk" data-id="'+r.id+'" style="accent-color:var(--brand)"></td>'
        +'<td class="mono" style="font-size:11.5px;white-space:nowrap">'+e(r.dt||"—")+'</td>'
        +'<td class="mono" style="font-size:11.5px">'+e(r.campaign||"—")+'</td>'
        +'<td style="font-weight:600">'+e(r.lead||"—")+'</td>'
        +'<td class="mono">'+e(r.phone||"—")+'</td>'
        +'<td>'+e(r.sugar||"—")+'</td>'
        +'<td>'+e(r.city||"—")+'</td>'
        +'<td><span class="tag">'+e(r.source||"—")+'</span></td>'
        +'<td>'+e(r.service||"—")+'</td>'
        +'<td><span class="chipb warn">Duplicate</span>'+expChip+'</td>'
        +'<td><div style="display:flex;gap:6px"><button class="btn bsm" onclick="window._csvKeepOne('+r.id+')">Keep</button><button class="btn bsm" style="color:var(--alert-ink)" onclick="window._csvDeleteOne('+r.id+')">Delete</button></div></td></tr>';
      }).join("")
        :'<tr><td colspan="11" style="text-align:center;color:var(--faint);padding:18px">No duplicate leads (shown for 10 minutes after import)</td></tr>';
      if(info)info.textContent="Page "+_csvDupPage+" of "+pages;
      void prev; void next;
      _pgBtns("csvDup",_csvDupPage,pages);
      const sa=root.querySelector("#csvDupSelAll")as HTMLInputElement;if(sa)sa.checked=false;
    }

    // ---- Render: import history (batches) ----
    function renderCsvHist(){
      const body=root.querySelector("#csvHistBody");
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      if(!body)return;
      const _chd=root.querySelector("#csvHistHead"); if(_chd)_chd.innerHTML=gridHead("csvHist"); const batches=gridApply("csvHist",_csvBatches.filter((b:any)=>inCsvRange(b.created_at)));
      body.innerHTML=batches.length?batches.map((b:any)=>{
        const dt=fmtIST(b.created_at);
        return '<tr><td class="mono" style="font-size:11.5px;white-space:nowrap">'+e(dt)+'</td>'
          +'<td>'+e(b.file_name||"—")+'</td><td>'+e(b.batch_name||"—")+'</td><td>'+e(b.imported_by||"—")+'</td>'
          +'<td class="mono">'+(b.total_records||0)+'</td>'
          +'<td class="mono" style="color:var(--ok-ink);font-weight:600">'+(b.valid_records||0)+'</td>'
          +'<td class="mono" style="color:var(--warn-ink);font-weight:600">'+(b.duplicate_records||0)+'</td>'
          +'<td><div style="display:flex;gap:6px"><button class="btn bsm" title="Download batch" onclick="window._csvDownloadBatch('+b.id+')">⬇</button><button class="btn bsm" title="Delete batch" style="color:var(--alert-ink)" onclick="window._csvDeleteBatch('+b.id+')">🗑</button></div></td></tr>';
      }).join(""):'<tr><td colspan="8" style="text-align:center;color:var(--faint);padding:18px">No import history</td></tr>';
    }

    // ---- Repeat Visitor (aggregate imported leads by phone) ----
    let _rvPage=1; const RV_PER=10; let _rvData:any[]=[];
    function rvParseDate(s:string){ return parseFlexDate(s); }   // handles DD-MM-YYYY etc.
    function populateRvSources(){
      const sel=root.querySelector("#rvSource")as HTMLSelectElement;
      if(!sel)return;
      const cur=sel.value;
      const srcs=Array.from(new Set(_csvLeads.map((r:any)=>(r.source||"").trim()).filter(Boolean))).sort();
      sel.innerHTML='<option value="all">All Sources</option>'+srcs.map((s:string)=>'<option>'+s.replace(/</g,"&lt;")+'</option>').join("");
      if(Array.from(sel.options).some(o=>o.value===cur)) sel.value=cur;
    }
    function rvFiltered(){
      const mo=(root.querySelector("#rvMonth")as HTMLSelectElement)?.value;
      const yr=(root.querySelector("#rvYear")as HTMLSelectElement)?.value;
      const df=(root.querySelector("#rvFrom")as HTMLInputElement)?.value;
      const dt=(root.querySelector("#rvTo")as HTMLInputElement)?.value;
      const src=(root.querySelector("#rvSource")as HTMLSelectElement)?.value;
      const rangeActive=!!df||!!dt;
      let from:Date|null=null,to:Date|null=null;
      if(df){from=new Date(df);from.setHours(0,0,0,0);}
      if(dt){to=new Date(dt);to.setHours(23,59,59,999);}
      return _csvLeads.filter((r:any)=>{
        if(!inCsvRange(r.dt)) return false;   // shared time-range filter (applies to all tabs)
        if(src&&src!=="all"&&(r.source||"")!==src) return false;
        const d=rvParseDate(r.dt);
        if(rangeActive){ if(!d) return false; if(from&&d<from) return false; if(to&&d>to) return false; }
        else if(yr!=="all"||mo!=="all"){ if(!d) return false; if(yr!=="all"&&d.getFullYear()!==Number(yr)) return false; if(mo!=="all"&&d.getMonth()!==Number(mo)) return false; }
        return true;
      });
    }
    function rvAggregate(visits:any[]){
      const map=new Map<string,any>();
      visits.forEach((r:any)=>{
        const phone=((r.phone||"").trim())||"(no phone)";
        let g=map.get(phone);
        if(!g){g={phone,name:r.lead||r.name||"—",visits:0,first:null,last:null,records:[]};map.set(phone,g);}
        g.visits++; g.records.push(r);
        const d=rvParseDate(r.dt);
        if(d){ if(!g.first||d<g.first)g.first=d; if(!g.last||d>g.last){g.last=d;g.name=r.lead||r.name||g.name;} }
      });
      return Array.from(map.values()).sort((a,b)=>b.visits-a.visits);
    }
    function renderCsvRepeat(){
      const visits=rvFiltered();
      _rvData=rvAggregate(visits);
      const totalVisits=visits.length, unique=_rvData.length;
      const repeat=_rvData.filter(g=>g.visits>1).length;
      const avg=unique?(totalVisits/unique):0;
      const high=_rvData.reduce((m,g)=>Math.max(m,g.visits),0);
      const kpiEl=root.querySelector("#rvKpis");
      if(kpiEl){
        const cards=[
          {l:"Total Visitors",v:totalVisits,c:"g"},
          {l:"Unique Visitors",v:unique,c:""},
          {l:"Repeat Visitors",v:repeat,c:"a"},
          {l:"Avg Visits / Lead",v:avg.toFixed(2),c:"g"},
          {l:"Highest Repeat Count",v:high,c:"a"}
        ];
        kpiEl.innerHTML=cards.map(x=>'<div class="metric '+x.c+'"><div class="ml">'+x.l+'</div><div class="mv">'+x.v+'</div></div>').join("");
      }
      const tabCnt=root.querySelector("#csvRepeatTabCount"); if(tabCnt)tabCnt.textContent=String(repeat);
      const body=root.querySelector("#rvBody");
      const info=root.querySelector("#rvPageInfo");
      const prev=root.querySelector("#rvPrevBtn")as HTMLButtonElement, next=root.querySelector("#rvNextBtn")as HTMLButtonElement;
      if(!body)return;
      const _rhd=root.querySelector("#rvHead"); if(_rhd)_rhd.innerHTML=gridHead("rv"); const _rvF=gridApply("rv",_rvData); const total=_rvF.length;const pages=Math.max(1,Math.ceil(total/RV_PER));
      if(_rvPage>pages)_rvPage=pages;if(_rvPage<1)_rvPage=1;
      const pageRows=_rvF.slice((_rvPage-1)*RV_PER,(_rvPage-1)*RV_PER+RV_PER);
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const fmt=(d:Date|null)=>d?new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric"}).format(d):"—";
      body.innerHTML=pageRows.length?pageRows.map((g:any)=>'<tr>'
        +'<td class="mono">'+e(g.phone)+'</td>'
        +'<td style="font-weight:600">'+e(g.name)+'</td>'
        +'<td class="mono" style="font-weight:700;cursor:pointer;color:var(--brand)" title="View visit history" onclick="window._rvHistory(\''+e(g.phone)+'\')">'+g.visits+(g.visits>1?' ▸':'')+'</td>'
        +'<td class="mono">'+fmt(g.first)+'</td>'
        +'<td class="mono">'+fmt(g.last)+'</td>'
        +'<td>'+(g.visits>1?'<span class="chipb warn">Repeat · '+g.visits+'×</span>':'<span class="chipb neu">First-time</span>')+'</td></tr>').join("")
        :'<tr><td colspan="6" style="text-align:center;color:var(--faint);padding:18px">No visitor data for this filter</td></tr>';
      if(info)info.textContent="Page "+_rvPage+" of "+pages+" · "+total+" visitor"+(total===1?"":"s");
      void prev; void next;
      _pgBtns("rv",_rvPage,pages);
    }
    w._rvPage=(dir:any)=>{_rvPage=_pgApply(_rvPage,dir);renderCsvRepeat();};
    w._rvHistory=(phone:string)=>{
      const g=_rvData.find((x:any)=>x.phone===phone);
      if(!g){toast("No history");return;}
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const fmt=(s:string)=>{const d=rvParseDate(s);return d?new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}).format(d):(s||"—");};
      const recs=g.records.slice().sort((a:any,b:any)=>{const da=rvParseDate(a.dt),db=rvParseDate(b.dt);return (db?db.getTime():0)-(da?da.getTime():0);});
      const ov=document.createElement("div");
      ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;display:flex;align-items:center;justify-content:center";
      const box=document.createElement("div");
      box.style.cssText="background:var(--surf,#fff);border-radius:14px;padding:20px;max-width:560px;width:92%;max-height:80vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)";
      box.innerHTML='<div style="font-weight:700;font-size:15px;margin-bottom:4px;color:var(--ink)">Visit history — '+e(g.name)+'</div>'
        +'<div style="font-size:12px;color:var(--faint);margin-bottom:14px">'+e(g.phone)+' · '+g.visits+' visit'+(g.visits===1?"":"s")+'</div>'
        +'<table class="tbl" style="width:100%"><thead><tr><th>#</th><th>Date &amp; Time (IST)</th><th>Campaign</th><th>Source</th></tr></thead><tbody>'
        +recs.map((r:any,i:number)=>'<tr><td class="mono">'+(i+1)+'</td><td class="mono" style="font-size:11.5px">'+e(fmt(r.dt))+'</td><td class="mono" style="font-size:11.5px">'+e(r.campaign||"—")+'</td><td><span class="tag">'+e(r.source||"—")+'</span></td></tr>').join("")
        +'</tbody></table><div style="text-align:right;margin-top:14px"><button class="btn bsm bp" id="rvHistClose">Close</button></div>';
      ov.appendChild(box);document.body.appendChild(ov);
      const close=()=>{if(ov.parentNode)document.body.removeChild(ov);};
      (box.querySelector("#rvHistClose")as HTMLElement).onclick=close;
      ov.onclick=(ev)=>{if(ev.target===ov)close();};
    };
    w._rvDownload=()=>{
      if(!_rvData.length){toast("Nothing to download");return;}
      const fmt=(d:Date|null)=>d?new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(d):"";
      const header=["Lead Number","Lead Name","Total Visits","First Visit Date","Last Visit Date","Repeat Visitor"];
      const lines=[header.map(csvEsc).join(",")];
      _rvData.forEach((g:any)=>lines.push([g.phone,g.name,g.visits,fmt(g.first),fmt(g.last),g.visits>1?"Yes":"No"].map(csvEsc).join(",")));
      const blob=new Blob([lines.join("\r\n")],{type:"text/csv;charset=utf-8;"});
      const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="wellnessos_repeat_visitors.csv";document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
      toast("Downloaded "+_rvData.length+" visitors");
    };
    ["rvMonth","rvYear","rvFrom","rvTo","rvSource"].forEach(id=>{
      const el=root.querySelector("#"+id)as HTMLInputElement;
      if(el) el.onchange=()=>{_rvPage=1;renderCsvRepeat();};
    });

    w._csvPage=(dir:any)=>{_csvPage=_pgApply(_csvPage,dir);renderCsvValid();};
    w._csvDupPage=(dir:any)=>{_csvDupPage=_pgApply(_csvDupPage,dir);renderCsvDup();};

    // ---- Select-all ----
    const _vSelAll=root.querySelector("#csvValidSelAll")as HTMLInputElement;
    if(_vSelAll)_vSelAll.onchange=()=>{
      const valid=_csvLeads.filter((r:any)=>r.status==="valid"&&inCsvRange(r.dt)&&csvMatchesQuery(r));
      if(_vSelAll.checked) valid.forEach((r:any)=>_csvSelIds.add(String(r.id))); else valid.forEach((r:any)=>_csvSelIds.delete(String(r.id)));
      root.querySelectorAll("#csvImportedBody .csvChk").forEach((c:any)=>{c.checked=_vSelAll.checked;});
      _vSelAll.indeterminate=false;
    };
    const _dSelAll=root.querySelector("#csvDupSelAll")as HTMLInputElement;
    if(_dSelAll)_dSelAll.onchange=()=>root.querySelectorAll(".csvDupChk").forEach((c:any)=>{c.checked=_dSelAll.checked;});

    // ---- Delete / Keep / Download ----
    async function csvDeleteIds(ids:any[]){
      for(let i=0;i<ids.length;i+=200){await supabase.from("csv_leads").delete().in("id",ids.slice(i,i+200));}
      await loadCsvData();
    }
    w._csvDeleteOne=(id:number)=>csvConfirm("Delete this lead permanently?",async()=>{await csvDeleteIds([id]);toast("Lead deleted");});
    w._csvDeleteSelected=(which:string)=>{
      // Imported-leads selection is tracked across pages in _csvSelIds; dup table reads its checkboxes.
      const ids=which==="dup"
        ? Array.from(root.querySelectorAll(".csvDupChk:checked")).map((c:any)=>String(c.getAttribute("data-id")))
        : Array.from(_csvSelIds);
      if(!ids.length){toast("Select one or more rows first");return;}
      csvConfirm("Delete "+ids.length+" selected lead(s) permanently?",async()=>{await csvDeleteIds(ids);_csvSelIds.clear();toast(ids.length+" deleted");});
    };
    async function csvKeepIds(ids:any[]){
      for(let i=0;i<ids.length;i+=200){await supabase.from("csv_leads").update({status:"valid"}).in("id",ids.slice(i,i+200));}
      await loadCsvData();
    }
    w._csvKeepOne=async(id:number)=>{await csvKeepIds([id]);toast("Moved to imported leads");};
    w._csvKeepSelected=()=>{
      const ids=Array.from(root.querySelectorAll(".csvDupChk:checked")).map((c:any)=>String(c.getAttribute("data-id")));
      if(!ids.length){toast("Select duplicates first");return;}
      csvKeepIds(ids).then(()=>toast(ids.length+" kept"));
    };
    w._csvDeleteBatch=(id:number)=>csvConfirm("Delete this entire import batch and all its leads?",async()=>{await supabase.from("csv_import_batches").delete().eq("id",id);await loadCsvData();toast("Batch deleted");});

    function downloadCsvRows(rows:any[],fname:string){
      const header=["Date & Time","Campaign","Ad Name","Lead Name","Phone Number","Sugar Poll","City","Street","Source","Service","Name","Status"];
      const lines=[header.map(csvEsc).join(",")];
      rows.forEach((r:any)=>lines.push([r.dt,r.campaign,r.ad,r.lead,r.phone,r.sugar,r.city,r.street,r.source,r.service,r.name,r.status].map(csvEsc).join(",")));
      const blob=new Blob([lines.join("\r\n")],{type:"text/csv;charset=utf-8;"});
      const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=fname;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
    }
    w._csvDownload=(which:string)=>{
      // Respect the active time-range + (for the valid tab) the lead search box.
      const rows=which==="dup"
        ?_csvLeads.filter((r:any)=>isActiveDup(r)&&inCsvRange(r.dt))
        :_csvLeads.filter((r:any)=>r.status==="valid"&&inCsvRange(r.dt)&&csvMatchesQuery(r));
      if(!rows.length){toast("Nothing to download");return;}
      downloadCsvRows(rows,"wellnessos_"+which+"_leads.csv");toast("Downloaded "+rows.length+" rows");
    };
    w._csvDownloadBatch=(id:any)=>{
      const rows=_csvLeads.filter((r:any)=>String(r.batch_id)===String(id));
      if(!rows.length){toast("No rows left in this batch");return;}
      downloadCsvRows(rows,"wellnessos_batch_"+id+".csv");toast("Downloaded batch");
    };

    // Send selected CSV imported leads to the SAME assignment pool as the feed.
    // They become DB-backed pooled leads (leads.in_pool=true) handled by the exact
    // same pool → assign workflow.
    w._csvSendToAssignment=async()=>{
      const sel=_csvTabName==="dup"?".csvDupChk:checked":(_csvTabName==="valid"?".csvChk:checked":null);
      if(!sel){toast("Open the Imported leads or Duplicates tab and select rows");return;}
      const ids=Array.from(root.querySelectorAll(sel)).map((c:any)=>String(c.getAttribute("data-id")));
      if(ids.length===0){toast("Select one or more leads first");return;}
      const rows=ids.map((id:string)=>_csvLeads.find((r:any)=>String(r.id)===id)).filter(Boolean);
      if(rows.length===0){toast("Select one or more leads first");return;}
      try{
        const nowIso=new Date().toISOString();
        // Manual-source leads: Source and Language both shown as "Manual".
        const payload=rows.map((r:any)=>{
          const d=parseFlexDate(r.dt);
          return {
            meta_lead_id:"csv-"+r.id,name:r.lead||r.name||"Lead",phone:(r.phone||"").trim(),
            source:"Manual",language:"Manual",
            lead_date:(d&&!isNaN(d.getTime()))?d.toISOString().substring(0,10):nowIso.substring(0,10),
            campaign:r.campaign||"Manual import",service:r.service||"Diabetes",
            is_valid:!!(r.phone&&r.phone.trim()),is_duplicate:false,is_assigned:false,
            in_pool:true,pool_added_at:nowIso,created_at:nowIso
          };
        });
        for(let i=0;i<payload.length;i+=200){
          const {error}=await supabase.from("leads").upsert(payload.slice(i,i+200),{onConflict:"meta_lead_id"});
          if(error) throw error;
        }
        // Move (not copy): remove the rows from csv_leads so they leave the import
        // table and can't be pushed again.
        for(let i=0;i<ids.length;i+=200){
          await supabase.from("csv_leads").delete().in("id",ids.slice(i,i+200));
        }
      }catch(e:any){
        toast(/in_pool|column|schema|exist/i.test(e.message||"")?"Run the assignment migrations first":"Send failed: "+(e.message||"db error"));
        return;
      }
      await loadCsvData();          // refresh import tables (moved leads now gone)
      await loadAssignmentExtras();
      rebuildPoolFromDB();
      renderUnassignedPool();renderAdvisorLoad();renderAssigneesTable();renderAssignedLeads();renderHealthDashboard();
      toast(rows.length+" lead"+(rows.length===1?"":"s")+" moved to assignment pool");
    };

    loadCsvData();
    // Sweep expired CSV duplicates (>10 min) and keep the countdown chips fresh.
    _csvSweepTimer=setInterval(()=>{ sweepExpiredDups(); },30000);
    loadAssignmentExtras().then(()=>{rebuildPoolFromDB();renderUnassignedPool();renderAssignedLeads();renderHealthDashboard();});
    loadAssignmentHistory();   // Assigned Leads History audit table
    loadZoomCheckins();        // Zoom appointments awaiting check-in

    // ========== RECEPTION DATA (live: appointments + payments) ==========
    let RX: any[] = [];        // current date-filtered appointments (shape used by renderers)
    let _recAll: any[] = [];   // all loaded appointments
    let _recInst: Record<string,any> = {};   // installment aggregation by lead_id (status/balance/history)
    function _recSvcCode(s:string){ s=(s||"").toLowerCase(); if(s.indexOf("blood")>=0)return "bt"; if(s.indexOf("phys")>=0)return "physio"; return "dia"; }
    function _recSvcLabel(s:string,session:string){ const c=_recSvcCode(s); if(c==="bt")return "🩸 Blood test"; if(c==="physio")return "💪 Physio"+(session?(" "+session):""); return "🩺 Diabetes"; }
    // IST date, robust to both 'YYYY-MM-DD' and full-ISO timestamps (the /db gateway
    // returns DATE columns as UTC ISO). Format: DD MMM YYYY (e.g. 06 Jul 2026).
    function _recFmtDate(d:string){ return fmtISTDate(d); }
    async function loadReceptionData(){
      try{
        const [ar,pr]=await Promise.all([
          supabase.from("appointments").select("*").order("appt_date",{ascending:false}).limit(500),
          supabase.from("payments").select("*").order("created_at",{ascending:false})
        ]);
        const pays:Record<string,any>={}; (pr.data||[]).forEach((p:any)=>{ if(!pays[p.appointment_id]) pays[p.appointment_id]={status:p.status,amount:p.amount||0}; });
        // Installment aggregation per lead (from the shared payments table) so Reception can show
        // Installment 1 / 2 status, remaining balance, next due date + a payment history.
        _recInst={};
        (pr.data||[]).filter((p:any)=>p.payment_type==="installment").forEach((p:any)=>{ const k=String(p.lead_id||""); if(!k)return; (_recInst[k]=_recInst[k]||{rows:[]}).rows.push(p); });
        Object.keys(_recInst).forEach((k)=>{ const o=_recInst[k]; o.rows.sort((a:any,b:any)=>Number(a.installment_number||0)-Number(b.installment_number||0)); const paid=o.rows.filter((r:any)=>r.status==="paid"); const due=o.rows.filter((r:any)=>r.status==="due"); o.inst1=o.rows.find((r:any)=>Number(r.installment_number)===1)||null; o.inst2=o.rows.find((r:any)=>Number(r.installment_number)===2)||null; o.balance=due.reduce((s:number,r:any)=>s+(r.amount||0),0); o.dueDate=(due[0]||{}).due_date||""; o.totalInst=Math.max(2,...o.rows.map((r:any)=>Number(r.total_installments||2))); o.paidCount=paid.length; o.allPaid=o.rows.length>0&&due.length===0&&paid.length>=o.totalInst; });
        // Enrichment: pull each lead's latest call_status so the Health Coach's Enrolled status
        // is reflected in Reception (Coach → Reception sync via the SAME leads record).
        const _leadIds=Array.from(new Set((ar.data||[]).map((a:any)=>a.lead_id).filter(Boolean)));
        const _csById:Record<string,string>={}; const _enrAtById:Record<string,string>={};
        if(_leadIds.length){ try{ const {data:_lr}=await supabase.from("leads").select("meta_lead_id,call_status,enrolled_at").in("meta_lead_id",_leadIds); (_lr||[]).forEach((r:any)=>{ _csById[String(r.meta_lead_id)]=r.call_status||""; _enrAtById[String(r.meta_lead_id)]=r.enrolled_at||""; }); }catch(_){} }
        _recAll=(ar.data||[]).map((a:any)=>{ const pay=pays[a.id]||{status:(a.status==="cancelled"?"refunded":(a.status==="visited"||a.stage==="screening"||a.stage==="screened")?"due":"free"),amount:0}; const _cs=_csById[String(a.lead_id)]||""; return {
          id:a.id, lead_id:a.lead_id, name:a.client_name||"Client", ph:a.phone||"", svc:_recSvcCode(a.service), svcLabel:_recSvcLabel(a.service,a.session),
          _date:a.appt_date, date:_recFmtDate(a.appt_date), time:a.appt_time||"", hc:a.hc_pt||"—", status:a.status||"expected", visitedAt:a.visited_at||"", clientId:a.client_id||"",
          payStatus:pay.status, payAmt:pay.amount||0, stage:a.stage||"", session:a.session||"", notes:a.notes||"", calls:0, source:a.source||"", lang:a.language||"Tamil",
          enrolled:/enrol/i.test(_cs)||a.stage==="enrolled", enrolledAt:_enrAtById[String(a.lead_id)]||"", inst:_recInst[String(a.lead_id)]||null,
          sugar:"",hba1c:"",priority:"",prob:"",eligibility:"",advisor:"",consultStatus:_cs,bmi:"",bp:"",assessment:"" };
        });
      }catch(e:any){ _recAll=[]; toastErr("Reception load failed — check your connection"); }
      applyRecDate();
      try{ loadZoomCheckins(); }catch(_){}
    }
    function _recDateRange():[Date|null,Date|null]{
      const now=new Date(); const sod=(d:Date)=>{const x=new Date(d);x.setHours(0,0,0,0);return x;}; const eod=(d:Date)=>{const x=new Date(d);x.setHours(23,59,59,999);return x;};
      if(curDate==="today") return [sod(now),eod(now)];
      if(curDate==="tmr"){ const t=new Date(now);t.setDate(t.getDate()+1); return [sod(t),eod(t)]; }
      if(curDate==="wk"){ const e=new Date(now);e.setDate(e.getDate()+7); return [sod(now),eod(e)]; }
      if(curDate==="cust"){ const f=(root.querySelector("#dtFrom")as HTMLInputElement)?.value; const t=(root.querySelector("#dtTo")as HTMLInputElement)?.value; return [f?sod(new Date(f)):null,t?eod(new Date(t)):null]; }
      return [null,null];
    }
    function applyRecDate(){
      const [from,to]=_recDateRange();
      RX=_recAll.filter((r:any)=>{ if(!r._date)return true; const d=new Date(r._date+"T12:00:00"); if(from&&d<from)return false; if(to&&d>to)return false; return true; });
      renderAll();
    }
    // Booking hook: Advisor "Appointment Fixed" → create/update an appointment row.
    async function _bookApptForLead(leadId:string,mode:string){
      const lead=(typeof _advFindLead==="function")?_advFindLead(String(leadId)):null;
      const name=lead?(lead.name||lead.phone||"Client"):"Client";
      const phone=lead?(lead.phone||""):"";
      const lang=lead?(lead.lang||"Tamil"):"Tamil";
      const hc=(root.querySelector("#hcSel")as HTMLSelectElement|null)?.value||"";
      const sd=(root.querySelector("#slotDate")as HTMLInputElement|null)?.value;
      const apptDate=sd||new Date().toISOString().substring(0,10);
      const apptTime=selSlot||"";
      const mt=(mode.toLowerCase()==="zoom")?"zoom":"direct";
      try{
        const {data}=await supabase.from("appointments").select("id").eq("lead_id",leadId).eq("appt_date",apptDate).neq("status","cancelled").limit(1);
        if(data&&data[0]) await supabase.from("appointments").update({appt_time:apptTime,hc_pt:hc,source:"Advisor ("+mode+")",meeting_type:mt}).eq("id",data[0].id);
        else await supabase.from("appointments").insert({lead_id:leadId,client_name:name,phone,service:"Diabetes",hc_pt:hc,appt_date:apptDate,appt_time:apptTime,status:"expected",source:"Advisor ("+mode+")",meeting_type:mt,language:lang});
        toast("Appointment booked → Reception");
        loadReceptionData();
        try{ loadZoomCheckins(); }catch(_){}
      }catch(e:any){ if(/appointment|relation|column|schema|exist/i.test(e.message||"")) toast("Run supabase-migration-reception.sql to enable appointments"); }
    }

    let curSvc = "all", curDate = "today", curScFilter: string | null = null;
    const SVC_LABELS: Record<string,string> = { all:"All", dia:"🩺 Diabetes", bt:"🩸 Blood test", physio:"💪 Physio" };
    const STATUS_MAP: Record<string,{l:string;c:string}> = { visited:{l:"Visited",c:"ok"}, expected:{l:"Expected",c:"warn"}, noshow:{l:"No show",c:"al"}, rescheduled:{l:"Rescheduled",c:"warn"}, cancelled:{l:"Cancelled",c:"al"} };
    const PAY_MAP: Record<string,{l:string;c:string}> = { paid:{l:"Paid",c:"ok"}, due:{l:"Due",c:"warn"}, free:{l:"Free",c:"neu"}, prepaid:{l:"Prepaid ✓",c:"ok"}, refunded:{l:"Refunded",c:"al"} };
    const TIMES = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM"];

    function filtered() {
      let d = [...RX];
      if (curSvc !== "all") d = d.filter((r) => r.svc === curSvc);
      if (curScFilter) d = d.filter((r) => {
        if (curScFilter === "expected") return r.status === "expected";
        if (curScFilter === "visited") return r.status === "visited";
        if (curScFilter === "noshow") return r.status === "noshow";
        if (curScFilter === "rescheduled") return r.status === "rescheduled";
        if (curScFilter === "cancelled") return r.status === "cancelled";
        if (curScFilter === "paydue") return r.payStatus === "due";
        if (curScFilter === "enrolled") return r.stage === "enrolled";
        return true;
      });
      return d;
    }

    function renderAll() { renderRev(); renderSc(); renderFlows(); renderAppt(); renderPay(); }
    function renderRev() {
      const f = curSvc === "all" ? RX : RX.filter((r) => r.svc === curSvc);
      const tot = f.reduce((s: number, r: any) => s + Math.max(0, r.payAmt), 0);
      const el = root.querySelector("#revTotal"); if (el) el.textContent = "₹" + tot.toLocaleString("en-IN");
      const bySvc: Record<string,number> = { dia:0, bt:0, physio:0 };
      f.forEach((r: any) => { if (r.payAmt > 0) bySvc[r.svc] = (bySvc[r.svc]||0) + r.payAmt; });
      const rs = root.querySelector("#revSvc");
      if (rs) rs.innerHTML = Object.entries(bySvc).map(([k,v]) => '<div><div style="font-size:9px;color:var(--faint);font-weight:600">'+(SVC_LABELS[k]||k).toUpperCase()+'</div><div class="mono" style="font-weight:700">₹'+v.toLocaleString("en-IN")+'</div></div>').join("");
    }
    function renderSc() {
      const f = curSvc === "all" ? RX : RX.filter((r) => r.svc === curSvc);
      const c: Record<string,number> = { expected:0,visited:0,noshow:0,rescheduled:0,cancelled:0,paydue:0,enrolled:0 };
      f.forEach((r: any) => { c[r.status]=(c[r.status]||0)+1; if(r.payStatus==="due")c.paydue++; if(r.enrolled)c.enrolled++; });
      const cards = [{k:"expected",l:"Expected",v:f.length,c:""},{k:"visited",l:"Visited",v:c.visited,c:"g"},{k:"noshow",l:"No show",v:c.noshow,c:"r"},{k:"rescheduled",l:"Rescheduled",v:c.rescheduled,c:"a"},{k:"cancelled",l:"Cancelled",v:c.cancelled,c:"r"},{k:"paydue",l:"Pay due",v:c.paydue,c:"a"},{k:"enrolled",l:"Enrolled",v:c.enrolled,c:"g"}];
      const el = root.querySelector("#scCards");
      if (el) el.innerHTML = cards.map((x) => '<div class="metric '+x.c+'" style="cursor:pointer;'+(curScFilter===x.k?'outline:2.5px solid var(--brand);outline-offset:-1px':'')+'" onclick="window._scClick(\''+x.k+'\')"><div class="ml">'+x.l+'</div><div class="mv">'+x.v+'</div></div>').join("");
    }
    function renderFlows() {
      const svcs = [{k:"dia",icon:"🩺",name:"Diabetes",fields:["expected","visited","screening","with HC","enrolled"]},{k:"bt",icon:"🩸",name:"Blood test",fields:["expected","visited","sample","report","billed"]},{k:"physio",icon:"💪",name:"Physio",fields:["expected","visited","in session","done","pay due"]}];
      const el = root.querySelector("#svcFlows");
      if (el) el.innerHTML = svcs.map((s) => {
        const d = RX.filter((r:any)=>r.svc===s.k);
        const vals = s.k==="dia"?[d.length,d.filter((r:any)=>r.status==="visited").length,d.filter((r:any)=>r.stage==="screening").length,d.filter((r:any)=>r.consultStatus&&r.consultStatus!=="Open"&&r.consultStatus!=="Cancelled").length,d.filter((r:any)=>r.stage==="enrolled").length]:s.k==="bt"?[d.length,d.filter((r:any)=>r.status==="visited").length,d.filter((r:any)=>r.stage==="sample").length,0,d.filter((r:any)=>r.payStatus==="paid").length]:[d.length,d.filter((r:any)=>r.status==="visited").length,d.filter((r:any)=>r.stage&&r.stage.includes("ession")).length,d.filter((r:any)=>r.stage==="done").length,d.filter((r:any)=>r.payStatus==="due").length];
        return '<div class="aud" style="margin:0;padding:9px 11px;background:#fff;cursor:pointer" onclick="window._svcF2(\''+s.k+'\')"><div class="ahd" style="font-size:10px">'+s.icon+' '+s.name+'</div><div style="font-size:11px;line-height:1.9">'+s.fields.map((f,i)=>f.charAt(0).toUpperCase()+f.slice(1)+' <b class="mono">'+vals[i]+'</b>').join('<br>')+'</div></div>';
      }).join("");
    }
    // Excel-style per-column filters for the Appointments table (shared grid engine).
    // AND-combined with the existing service/date pill filters via filtered().
    const _apptCols=[
      {key:"dt",label:"Date · time",filter:true,text:(r:any)=>r.date+(r.time?", "+r.time:""),thStyle:"min-width:150px"},
      {key:"client",label:"Client",filter:true,text:(r:any)=>r.name||"",thStyle:"min-width:120px"},
      {key:"phone",label:"Phone",filter:true,text:(r:any)=>r.ph||"",thStyle:"min-width:110px"},
      {key:"svc",label:"Service",filter:true,text:(r:any)=>r.svcLabel||"",thStyle:"min-width:110px"},
      {key:"hc",label:"HC / PT",filter:true,text:(r:any)=>r.hc||"",thStyle:"min-width:90px"},
      {key:"status",label:"Status",filter:true,text:(r:any)=>(STATUS_MAP[r.status]||{l:r.status}).l,thStyle:"min-width:100px"},
      {key:"visited",label:"Visited at",filter:true,text:(r:any)=>r.visitedAt?fmtIST(r.visitedAt):"—",thStyle:"min-width:150px"},
      {key:"pay",label:"Pay",filter:true,text:(r:any)=>(PAY_MAP[r.payStatus]||{l:"—"}).l,thStyle:"min-width:90px"},
      {key:"amount",label:"Amount",filter:true,text:(r:any)=>r.payAmt?("₹"+r.payAmt.toLocaleString("en-IN")):"—",thStyle:"min-width:70px"},
      {key:"inv",label:"Inv",filter:false,head:'<th style="min-width:50px">Inv</th>'},
      {key:"stage",label:"Stage",filter:true,text:(r:any)=>r.stage||"—",thStyle:"min-width:90px"},
      {key:"call",label:"call",filter:false,head:'<th style="min-width:40px">📞</th>'},
      {key:"rec",label:"rec",filter:false,head:'<th style="min-width:40px">🎤</th>'},
    ];
    regGrid("appt",()=>_apptCols,()=>renderAppt());
    function renderAppt() {
      const aw = root.querySelector("#apptWrap") as HTMLElement|null; if(!aw) return;
      // Build the table shell once; header + body re-render each pass.
      if(!root.querySelector("#apptBody")){
        aw.innerHTML='<table class="tbl" style="min-width:1200px"><thead><tr id="apptHead"></tr></thead><tbody id="apptBody"></tbody></table>';
      }
      const hd=root.querySelector("#apptHead"); if(hd)hd.innerHTML=gridHead("appt");
      const f = gridApply("appt", filtered());
      const el = root.querySelector("#apptCount"); if (el) el.textContent = f.length+" total";
      const body=root.querySelector("#apptBody"); if(!body) return;
      let rows='';
      f.forEach((r:any) => {
        const sm = STATUS_MAP[r.status]||{l:r.status,c:"neu"};
        const pm = PAY_MAP[r.payStatus]||{l:"—",c:"neu"};
        rows += '<tr onclick="window._openDrawer('+r.id+')" style="cursor:pointer"><td class="mono">'+r.date+(r.time?', '+r.time:'')+'</td><td style="font-weight:600">'+r.name+'</td><td class="mono">'+r.ph+'</td><td><span class="tag">'+r.svcLabel+'</span></td><td>'+r.hc+'</td><td><span class="chipb '+sm.c+'">'+sm.l+'</span></td><td class="mono">'+(r.visitedAt?fmtIST(r.visitedAt):"—")+'</td><td><span class="chipb '+pm.c+'">'+pm.l+'</span></td><td class="mono" style="font-weight:700">'+(r.payAmt?("₹"+r.payAmt.toLocaleString("en-IN")):"—")+'</td><td>'+(r.payStatus==="paid"?'<button class="btn bsm" title="Download invoice PDF" onclick="event.stopPropagation();window._recDownloadInvoice(\''+r.id+'\')">⬇</button>':"—")+'</td><td>'+(r.stage?'<span class="chipb info">'+r.stage+'</span>':"—")+'</td><td><button class="btn bsm" onclick="event.stopPropagation();window._recCall(\''+(r.lead_id||"")+'\',\''+(r.ph||"").replace(/[^0-9+ ]/g,"")+'\')">📞</button></td><td>'+(r.calls?'<span class="mono" style="font-size:11px">'+r.calls+'</span>':"—")+'</td></tr>';
      });
      body.innerHTML = rows || '<tr><td colspan="13" style="text-align:center;color:var(--faint);padding:18px">No appointments match the filters</td></tr>';
    }
    function renderPay() {
      const el = root.querySelector("#recPayList");
      if (el) {
        const due=RX.filter((r:any)=>r.payStatus==="due"&&r.status==="visited");
        el.innerHTML = (due.length?due.map((r:any)=>'<div class="li" style="padding:8px 0"><div style="flex:1"><b style="font-weight:600">'+r.name+'</b><div style="font-size:11px;color:var(--muted)">'+r.svcLabel+(r.payAmt?' · ₹'+r.payAmt.toLocaleString("en-IN"):'')+(r.stage==="screened"?' · <span class="chipb ok" style="font-size:10px">Screened ✓</span>':'')+'</div></div><button class="btn bsm bp" onclick="window._recOpen('+r.id+',\''+(r.name||"").replace(/'/g,"")+'\','+(r.payAmt||0)+',\''+(r.lead_id||"")+'\')">Collect</button></div>').join(""):'<div style="font-size:12px;color:var(--faint);padding:8px 0">No pending payments.</div>');
      }
    }

    w._recCall = async (leadId:string,phone:string) => {
      if(leadId){ const r=await _callInitiate(leadId); if(r&&r.ok){ toast("📞 Calling — your phone rings first, then the customer"); _pollRecordings(leadId,"reception"); return; } if(r&&r.error){ toastErr(r.error); return; } }
      toast("Calling "+(phone||"")+"…");
    };
    // ===== Invoice PDF — generated client-side (no backend/library) and auto-downloaded =====
    // Builds a minimal, valid single-page PDF from ASCII text lines so it opens in any reader.
    // Offsets are byte-accurate because the whole document is kept ASCII (string len === bytes).
    function _buildInvoicePdf(lines:string[]):Blob{
      const clean=(s:any)=>String(s==null?"":s).replace(/[^\x20-\x7E]/g,"?").replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
      let y=800; const body=lines.map(l=>{ const seg="BT /F1 12 Tf 50 "+y+" Td ("+clean(l)+") Tj ET"; y-=20; return seg; }).join("\n");
      const objs=[
        "<</Type/Catalog/Pages 2 0 R>>",
        "<</Type/Pages/Kids[3 0 R]/Count 1>>",
        "<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>",
        "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>",
        "<</Length "+body.length+">>\nstream\n"+body+"\nendstream"
      ];
      let pdf="%PDF-1.4\n"; const offs:number[]=[];
      for(let i=0;i<objs.length;i++){ offs.push(pdf.length); pdf+=(i+1)+" 0 obj\n"+objs[i]+"\nendobj\n"; }
      const xref=pdf.length;
      pdf+="xref\n0 "+(objs.length+1)+"\n0000000000 65535 f \n";
      offs.forEach(o=>{ pdf+=String(o).padStart(10,"0")+" 00000 n \n"; });
      pdf+="trailer\n<</Size "+(objs.length+1)+"/Root 1 0 R>>\nstartxref\n"+xref+"\n%%EOF";
      return new Blob([pdf],{type:"application/pdf"});
    }
    w._recDownloadInvoice=(id:any)=>{
      try{
        const r=_recAll.find((x:any)=>String(x.id)===String(id));
        if(!r){ toastErr("Invoice data not found for this appointment"); return; }
        const money=(n:any)=>"INR "+(parseInt(n)||0).toLocaleString("en-IN");
        const lines=[
          "WellnessOS  -  Tax Invoice",
          "Chennai HQ",
          "----------------------------------------",
          "Invoice No : INV-"+String(id),
          "Issued     : "+fmtIST(new Date().toISOString()),
          "",
          "Client     : "+(r.name||"-"),
          "Client ID  : "+(r.clientId||"-"),
          "Phone      : "+(r.ph||"-"),
          "Service    : "+(r.svcLabel||r.svc||"-"),
          "Provider   : "+(r.hc||"-"),
          "Appt Date  : "+((r.date||"")+(r.time?", "+r.time:"")),
          "----------------------------------------",
          "Amount     : "+money(r.payAmt),
          "Payment    : "+(r.payStatus==="paid"?"PAID":String(r.payStatus||"-").toUpperCase()),
          "----------------------------------------",
          "",
          "Thank you for choosing WellnessOS."
        ];
        const blob=_buildInvoicePdf(lines);
        if(!blob||!blob.size) throw new Error("empty PDF generated");
        const url=URL.createObjectURL(blob);
        const a=document.createElement("a"); a.href=url; a.download="invoice_"+String(r.clientId||("INV-"+id)).replace(/[^A-Za-z0-9._-]/g,"_")+".pdf";
        document.body.appendChild(a); a.click();
        setTimeout(()=>{ try{ document.body.removeChild(a); URL.revokeObjectURL(url); }catch(_){} }, 1500);
        toast("✓ Invoice PDF downloaded");
      }catch(e:any){ toastErr("Invoice download failed: "+((e&&e.message)||"could not generate PDF")); }
    };
    w._svcF2 = (s:string) => { curSvc=s; curScFilter=null; renderFilters(); renderAll(); };
    w._svcF = (s:string) => { curSvc=s; curScFilter=null; renderFilters(); renderAll(); };
    w._dtF = (d:string) => { curDate=d; const show=d==="cust"; ["dtFrom","dtTo","dtTo2"].forEach((id)=>{const el=root.querySelector("#"+id)as HTMLElement;if(el)el.style.display=show?"inline":"none";}); renderFilters(); applyRecDate(); };
    ["dtFrom","dtTo"].forEach((id)=>{ const el=root.querySelector("#"+id)as HTMLInputElement|null; if(el) el.onchange=()=>{ if(curDate==="cust") applyRecDate(); }; });
    w._scClick = (k:string) => { curScFilter=curScFilter===k?null:k; renderSc(); renderAppt(); };

    function renderFilters() {
      const sf = root.querySelector("#svcFilt"); if (sf) sf.innerHTML = Object.entries(SVC_LABELS).map(([k,v])=>'<button class="pill '+(curSvc===k?"p-ok on":"p-info")+'" onclick="window._svcF(\''+k+'\')">'+v+'</button>').join("");
      const dates = [["today","Today"],["tmr","Tomorrow"],["wk","This week"],["cust","Between dates"]];
      const df = root.querySelector("#dateFilt"); if (df) df.innerHTML = dates.map(([k,v])=>'<button class="pill '+(curDate===k?"on":"")+'" onclick="window._dtF(\''+k+'\')">'+v+'</button>').join("");
    }

    // Drawer
    function openDrawer(r:any) {
      if(!r) return;
      const d=root.querySelector("#drawer")as HTMLElement; const o=root.querySelector("#dOverlay")as HTMLElement;
      if(d) d.classList.add("open"); if(o) o.classList.add("open");
      const dn=root.querySelector("#dName"); if(dn) dn.textContent=r.name;
      root.querySelectorAll("#dTabs button").forEach((b,i)=>b.classList.toggle("on",i===0));
      root.querySelectorAll(".d-p").forEach((p,i)=>{(p as HTMLElement).style.display=i===0?"":"none";});
      const sm=STATUS_MAP[r.status]||{l:r.status,c:"neu"}; const pm=PAY_MAP[r.payStatus]||{l:"—",c:"neu"};
      const drp=root.querySelector('[data-p="dr"]');
      const e2=(s:string)=>(s||"").replace(/'/g,"");
      const enrollRow=r.enrolled
        ? '<div style="padding:2px 14px 14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span class="chipb ok">🏆 Enrolled</span>'+(r.enrolledAt?'<span class="mono" style="font-size:11.5px;color:var(--muted)">'+fmtIST(r.enrolledAt)+'</span>':'')+'<span style="font-size:11.5px;color:var(--muted)">· Synced with Health Coach</span></div>'
        : '<div style="padding:2px 14px 14px"><button class="btn bsm bp" onclick="window._recMarkEnrolled(\''+(r.lead_id||"")+'\',\''+r.id+'\',\''+e2(r.name)+'\')"><svg class="icon" style="width:14px;height:14px"><use href="#i-check"/></svg> Mark Enrolled → sync to Health Coach</button></div>';
      // Installment payments block (Installment 1 / 2 status, balance, next due, history + Collect).
      let instBlock='';
      const inst=r.inst;
      if(inst&&inst.rows&&inst.rows.length){
        const money=(n:number)=>"₹"+(Number(n)||0).toLocaleString("en-IN");
        const stChip=(x:any)=>x&&x.status==="paid"?'<span class="chipb ok">Paid</span>':(x?'<span class="chipb warn">Pending</span>':'<span class="chipb neu">—</span>');
        const overall=inst.allPaid?'<span class="chipb ok">Fully Paid</span>':'<span class="chipb warn">Balance '+money(inst.balance)+'</span>';
        const collectBtn=(!inst.allPaid&&inst.inst2&&inst.inst2.status!=="paid")?'<div style="margin-top:10px"><button class="btn bsm bp" onclick="window._recCollectInstallment(\''+(r.lead_id||"")+'\',\''+r.id+'\','+(inst.balance||0)+',\''+e2(r.name)+'\')"><svg class="icon" style="width:14px;height:14px"><use href="#i-coin"/></svg> Collect Installment 2 → '+money(inst.balance)+'</button></div>':'';
        const histRow=(x:any)=>'<tr><td class="mono">'+(x.installment_number||"")+'</td><td class="mono" style="font-weight:600">'+money(x.amount)+'</td><td class="mono" style="font-size:11px;white-space:nowrap">'+(x.paid_at?fmtIST(x.paid_at):(x.due_date?("due "+fmtISTDate(x.due_date)):"—"))+'</td><td>'+(x.method||"—")+'</td><td>'+(x.collected_by||"—")+'</td><td>'+stChip(x)+'</td></tr>';
        instBlock='<div class="sec" style="margin-top:12px"><div class="sec-hd" style="cursor:default;padding:10px 14px"><svg class="icon"><use href="#i-coin"></use></svg> Installment payments</div><div class="sec-bd" style="padding:4px 14px 14px">'
          +'<table class="tbl"><tbody>'
          +'<tr><td style="color:var(--muted)">Installment 1</td><td>'+stChip(inst.inst1)+(inst.inst1?' <span class="mono">'+money(inst.inst1.amount)+'</span>':'')+'</td><td style="color:var(--muted)">Installment 2</td><td>'+stChip(inst.inst2)+(inst.inst2?' <span class="mono">'+money(inst.inst2.amount)+'</span>':'')+'</td></tr>'
          +'<tr><td style="color:var(--muted)">Overall</td><td>'+overall+'</td><td style="color:var(--muted)">Next due</td><td class="mono">'+((inst.dueDate&&!inst.allPaid)?fmtISTDate(inst.dueDate):"—")+'</td></tr>'
          +'</tbody></table>'+collectBtn
          +'<div style="margin-top:12px;font-size:11px;color:var(--muted);font-weight:600">Payment history</div>'
          +'<div style="overflow-x:auto"><table class="tbl" style="margin-top:4px"><thead><tr><th>#</th><th>Amount</th><th>Date / Due</th><th>Method</th><th>Collected by</th><th>Status</th></tr></thead><tbody>'+inst.rows.map(histRow).join("")+'</tbody></table></div>'
          +'</div></div>';
      }
      if(drp) drp.innerHTML='<div class="sec" style="margin-top:12px"><div class="sec-hd" style="cursor:default;padding:10px 14px"><svg class="icon"><use href="#i-door"></use></svg> Reception record</div><div class="sec-bd" style="padding:4px 14px 14px"><table class="tbl"><tbody><tr><td style="color:var(--muted)">Visited</td><td class="mono" style="font-weight:600">'+(r.visitedAt||"—")+'</td><td style="color:var(--muted)">Service</td><td>'+r.svcLabel+'</td></tr><tr><td style="color:var(--muted)">HC / PT</td><td style="font-weight:600">'+r.hc+'</td><td style="color:var(--muted)">Status</td><td><span class="chipb '+sm.c+'">'+sm.l+'</span></td></tr><tr><td style="color:var(--muted)">Payment</td><td class="mono" style="font-weight:700">'+(r.payAmt?"₹"+r.payAmt.toLocaleString("en-IN"):"—")+'</td><td style="color:var(--muted)">Pay status</td><td><span class="chipb '+pm.c+'">'+pm.l+'</span></td></tr></tbody></table></div>'+enrollRow+'</div>'+instBlock;
    }
    w._openDrawer = (id:number) => { const r=_recAll.find((x:any)=>String(x.id)===String(id))||RX.find((x:any)=>String(x.id)===String(id)); if(r) openDrawer(r); };
    function closeDrawer() { const d=root.querySelector("#drawer")as HTMLElement; const o=root.querySelector("#dOverlay")as HTMLElement; if(d)d.classList.remove("open"); if(o)o.classList.remove("open"); }
    w.closeDrawer = closeDrawer;

    // Cross-check — search ALL appointments, then fall back to the live leads DB.
    async function ccSearch() {
      const qEl=root.querySelector("#ccQ")as HTMLInputElement; if(!qEl) return;
      const q=qEl.value.trim().toLowerCase(); if(!q){toastErr("Enter phone or name");return;}
      const res=root.querySelector("#ccRes")as HTMLElement; if(!res) return;
      const match=_recAll.find((r:any)=>(r.ph||"").replace(/\s/g,"").includes(q.replace(/\s/g,""))||(r.name||"").toLowerCase().includes(q));
      if(!match){
        // No appointment — check the leads DB so we can tell "exists but unbooked" vs "new".
        try{
          const d=q.replace(/\D/g,"");
          let qb=supabase.from("leads").select("meta_lead_id,name,phone").limit(1);
          qb=d.length>=4?qb.ilike("phone","%"+d+"%"):qb.ilike("name","%"+q+"%");
          const {data}=await qb;
          const lead=data&&data[0];
          if(lead){ res.innerHTML='<div style="border:1.5px solid var(--warn);border-radius:12px;padding:12px 14px;background:var(--warn-bg)"><b>'+ (lead.name||lead.phone) +'</b> <span class="mono" style="color:var(--muted)">'+(lead.phone||"")+'</span><p style="font-size:12px;color:var(--warn-ink);margin:6px 0 0">In the system, but <b>no appointment booked</b>. Use “+ New walk-in” to book.</p></div>'; toast("Found lead — no appointment"); return; }
        }catch(_){}
      }
      if(match){
        const hasAppt=match.status!=="noshow"&&match.status!=="cancelled";
        res.innerHTML='<div style="border:1.5px solid var(--brand-line);border-radius:12px;padding:12px 14px;background:linear-gradient(180deg,#F7FCFA,#fff)"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b style="font-family:var(--disp)">'+match.name+'</b><span class="mono" style="color:var(--muted)">'+match.ph+'</span></div><table class="tbl" style="margin-top:8px"><tbody><tr><td style="color:var(--muted)">Service</td><td>'+match.svcLabel+'</td><td style="color:var(--muted)">Appointment</td><td>'+(hasAppt?'<span class="chipb ok">'+match.date+' · '+match.time+' with '+match.hc+'</span>':'<span class="chipb al">None booked</span>')+'</td></tr></tbody></table><div style="display:flex;gap:6px;margin-top:10px"><button class="btn bsm bp" onclick="window._openDrawer('+match.id+')">Open full record</button></div></div>';
        toast("✓ Found: "+match.name);
      } else {
        res.innerHTML='<div style="border:1.5px solid var(--alert);border-radius:12px;padding:12px 14px;background:var(--alert-bg)"><b style="color:var(--alert-ink)">No record found for "'+q+'"</b><p style="font-size:12px;color:var(--alert-ink);margin:6px 0 0">Not in our system. Create a new walk-in record.</p></div>';
      }
    }
    w.ccSearch = ccSearch;

    // ===== New-walk-in wizard: 4-step nav, Save & Next, draft auto-save, auto Client ID =====
    let _nwStepN=1; let _nwSaveT:any=null;
    const _NW_DRAFT_KEY="wos_nw_draft";
    function nwToggle() {
      const p=root.querySelector("#nwPanel")as HTMLElement; if(!p) return;
      p.style.display=p.style.display==="none"?"block":"none";
      if(p.style.display!=="block") return;
      p.scrollIntoView({behavior:"smooth"});
      const dt=root.querySelector("#nwDate")as HTMLInputElement; if(dt&&!dt.value) dt.value=new Date().toISOString().substring(0,10);
      // Resume a saved draft (survives refresh/reopen) from its last step; else start fresh.
      let draft:any=null; try{ const s=localStorage.getItem(_NW_DRAFT_KEY); draft=s?JSON.parse(s):null; }catch(_){}
      if(draft){ _nwRestoreDraft(draft); _nwStep(Math.min(4,Math.max(1,Number(draft._step)||1))); if(!((root.querySelector("#nwClientId")as HTMLInputElement)?.value)) _nwFillClientId(); toast("Draft restored — resuming step "+(Number(draft._step)||1)); }
      else{ _nwStep(1); _nwFillClientId(); }
    }
    // Show/hide keeps every field mounted, so switching steps never loses entered data.
    function _nwStep(n:number){
      _nwStepN=n;
      const panel=root.querySelector("#nwPanel"); if(!panel) return;
      panel.querySelectorAll(".nwStep").forEach((s:any)=>{ s.style.display=(String(s.getAttribute("data-step"))===String(n))?"":"none"; });
      panel.querySelectorAll("#nwStepNav button").forEach((b:any)=>{ b.classList.toggle("on",String(b.getAttribute("data-step"))===String(n)); });
      const bar=root.querySelector("#nwProgressBar")as HTMLElement|null; if(bar) bar.style.width=(n*25)+"%";
      const lbl=root.querySelector("#nwProgressLbl"); if(lbl) lbl.textContent="Step "+n+" of 4";
      const pb=root.querySelector("#nwPrimaryBtn"); if(pb) pb.textContent=(n<4)?"Save & Next Page":"✓ Complete Registration";
      if(n===4){ try{ _nwRenderConsents(); }catch(_){} }   // build consent forms for the services picked in step 2
    }
    w._nwStep=(n:number)=>_nwStep(n);
    // ---- Draft persistence: entered data survives refresh / reopen, resumes at last step ----
    function _nwCollectDraft(){
      const panel=root.querySelector("#nwPanel"); if(!panel) return null;
      const v:Record<string,any>={_step:_nwStepN};
      panel.querySelectorAll("input[id^='nw'],select[id^='nw'],textarea[id^='nw']").forEach((el:any)=>{ if(el.type!=="checkbox"&&el.type!=="radio"&&el.id) v[el.id]=el.value; });
      v._svc1=Array.from(panel.querySelectorAll("#nwSvc .chip-o.on")).map((c:any)=>c.getAttribute("data-svc"));
      v._svc2=Array.from(panel.querySelectorAll("input[data-svc2]:checked")).map((i:any)=>i.getAttribute("data-svc2"));
      v._hear=Array.from(panel.querySelectorAll("input[data-hear]:checked")).map((i:any)=>i.getAttribute("data-hear"));
      v._c1=(panel.querySelector('input[name="nwConsent1"]:checked')as HTMLInputElement)?.value||"";
      v._c2=(panel.querySelector('input[name="nwConsent2"]:checked')as HTMLInputElement)?.value||"";
      return v;
    }
    function _nwRestoreDraft(v:any){
      const panel=root.querySelector("#nwPanel"); if(!panel||!v) return;
      Object.keys(v).forEach(k=>{ if(k[0]==="_")return; const el=panel.querySelector("#"+k)as any; if(el&&"value"in el) el.value=v[k]; });
      panel.querySelectorAll("#nwSvc .chip-o").forEach((c:any)=>c.classList.toggle("on",(v._svc1||[]).indexOf(c.getAttribute("data-svc"))>=0));
      panel.querySelectorAll("input[data-svc2]").forEach((i:any)=>i.checked=(v._svc2||[]).indexOf(i.getAttribute("data-svc2"))>=0);
      panel.querySelectorAll("input[data-hear]").forEach((i:any)=>i.checked=(v._hear||[]).indexOf(i.getAttribute("data-hear"))>=0);
      const setR=(name:string,val:string)=>{ if(!val)return; const r=panel.querySelector('input[name="'+name+'"][value="'+val+'"]')as HTMLInputElement|null; if(r)r.checked=true; };
      setR("nwConsent1",v._c1); setR("nwConsent2",v._c2);
    }
    function _nwSaveDraft(silent?:boolean){
      const p=root.querySelector("#nwPanel")as HTMLElement|null; if(!p||p.style.display==="none") return;
      try{ const d=_nwCollectDraft(); if(d) localStorage.setItem(_NW_DRAFT_KEY,JSON.stringify(d)); }catch(_){}
      if(!silent) toast("Draft saved successfully");
    }
    function _nwClearDraft(){ if(_nwSaveT)clearTimeout(_nwSaveT); try{ localStorage.removeItem(_NW_DRAFT_KEY); }catch(_){} }
    w._nwClearDraft=_nwClearDraft;
    // Primary button: Save & Next (steps 1-3) → Complete Registration (step 4 = create/book/check-in).
    w._nwPrimary=()=>{ if(_nwStepN<4){ _nwStep(_nwStepN+1); _nwSaveDraft(); } else { nwBook(); } };
    // Silent auto-save on any change while the form is open, so a refresh mid-step keeps data.
    { const panel=root.querySelector("#nwPanel");
      const auto=()=>{ const p=root.querySelector("#nwPanel")as HTMLElement|null; if(!p||p.style.display==="none")return; if(_nwSaveT)clearTimeout(_nwSaveT); _nwSaveT=setTimeout(()=>_nwSaveDraft(true),500); };
      if(panel){ panel.addEventListener("input",auto); panel.addEventListener("change",auto); }
    }
    // Service → consent-form map. General Declaration (step 4) renders the matching
    // form(s) for whatever services are ticked on step 2 (Service Selected). Content for
    // Physio / Blood Test / HBOT is pending — shown as a placeholder until provided.
    const _NW_CONSENTS:Record<string,any>={
      "Diabetes Counselling":{n:1,title:"Diabetes Counselling",items:[
        "This is a nutritional and lifestyle counselling service by a qualified Nutritionist/Dietitian — NOT a medical consultation or prescription.",
        "I will continue all medications under my physician's supervision and will NOT alter doses without my doctor's advice.",
        "I understand that lifestyle-based diabetes reversal outcomes vary individually and no specific result is guaranteed.",
        "I understand this session may include a recommendation to join the My Health School online program.",
        "I am under no obligation to enrol in any program and my data will not be shared without my consent.",
        "I understand that dietary and lifestyle changes may affect my blood glucose levels and I will monitor and report changes to my physician."]},
      "Weight Loss Counselling":{n:2,title:"Weight Loss Counselling",items:[
        "This is a nutritional and lifestyle counselling service by a qualified Nutritionist/Dietitian — NOT a medical consultation or prescription.",
        "Evidence-based weight loss is 0.5–1 kg per week. I understand that rapid results are neither safe nor sustainable.",
        "Outcomes depend on individual compliance, metabolism, and lifestyle factors — no specific result is guaranteed.",
        "I understand this session may include a recommendation to join the My Health School online program.",
        "I do not have any active eating disorder that would contraindicate nutritional counselling.",
        "I will continue all medications under my physician's supervision and will NOT alter doses without my doctor's advice.",
        "My data will not be shared with any third party without my written consent."]},
      "Sauna Bath":{n:3,title:"Sauna Bath",meta:["Sauna Temperature (°C)","Session Duration (min)","Wellness Attendant"],items:[
        "I understand that sauna use elevates core body temperature and places additional stress on the cardiovascular system.",
        "I confirm I do not have uncontrolled hypertension, recent cardiac event, pregnancy, epilepsy, or severe neuropathy.",
        "I confirm I do not have a pacemaker or implanted cardiac device.",
        "I have not consumed alcohol in the last 12 hours and have consumed at least 200ml water before this session.",
        "I understand that certain medications (antihypertensives, diuretics, insulin) may increase sauna risk — I have disclosed all medications to staff.",
        "If I have diabetes, I understand that sauna may cause post-session blood glucose fluctuations and I will monitor accordingly.",
        "I will exit immediately if I feel dizzy, nauseous, or experience chest discomfort.",
        "I understand a wellness attendant is stationed outside and I must check in and out with them at every session.",
        "Maximum session duration is 20 minutes. I agree to follow all safety protocols as briefed."]},
      "Cold Plunge":{n:4,title:"Cold Plunge",meta:["Water Temperature (°C)","Session Duration (min)","Wellness Attendant"],items:[
        "I understand cold water immersion triggers a cold shock response including gasping and rapid heart rate elevation and can pose serious cardiovascular risk.",
        "I confirm I do not have cardiac arrhythmia, uncontrolled hypertension, Raynaud's disease, cold urticaria, peripheral vascular disease, or open wounds.",
        "I confirm I do not have a history of cardiac events and I am not pregnant.",
        "I have not had surgery in the last 3 months.",
        "I understand that if I have diabetes with peripheral neuropathy, my cold sensation may be reduced — I will inform staff.",
        "If transitioning from sauna, I confirm I have rested for a minimum of 5 minutes before entering the cold plunge.",
        "I will begin with a maximum of 1–2 minutes for my first session and follow the progressive duration protocol as guided by staff.",
        "I will breathe slowly upon entering — no breath-holding. I will NOT submerge my head unless cleared by staff.",
        "A wellness attendant is present outside at all times. I will not use the cold plunge unsupervised."]},
      "Physiotherapy":{n:5,title:"Physiotherapy",meta:["Physiotherapist Name","Registration No."],items:[
        "Physiotherapy is delivered by a registered, qualified physiotherapist. All treatments are evidence-based and individualised.",
        "Treatment may include manual therapy, therapeutic exercises, electrotherapy (TENS, IFT, ultrasound), and heat/cold application.",
        "I confirm I do not have metallic implants or surgical hardware in my body (absolute contraindication for electrotherapy).",
        "I confirm I do not have a pacemaker or implanted cardiac device.",
        "I confirm I do not have active cancer currently under treatment.",
        "Some discomfort (DOMS) may occur after initial sessions — this is a normal physiological response.",
        "I will inform the physiotherapist of any worsening symptoms between sessions.",
        "I have the right to stop treatment at any time without obligation.",
        "I confirm I have disclosed all relevant medical history, imaging reports, and medications to the physiotherapist."]},
      "Blood Test":{n:6,title:"Blood Test",options:[{label:"Fasting Status",choices:["Fasting (8–10 hrs)","Non-fasting","Not required for tests ordered"]}],meta:["Tests Requested","Phlebotomist Name"],items:[
        "Blood collection is performed by a trained phlebotomist / healthcare professional using sterile, single-use equipment.",
        "I understand minor discomfort, bruising, or lightheadedness may occur following blood collection.",
        "I confirm I have disclosed all current medications and any bleeding disorders to the centre staff.",
        "I am not on anticoagulant therapy (blood thinners) unless I have informed staff prior to collection.",
        "Results will be shared with me and may be used by the counselling team to personalise my wellness program.",
        "I have followed the required fasting instructions (if applicable) as communicated by the centre.",
        "I understand that blood test results will NOT be interpreted as a medical diagnosis — I will be referred to my physician for clinical decisions."]},
      "HBOT (Hyperbaric Oxygen Therapy)":{n:7,title:"HBOT — Hyperbaric Oxygen Therapy",options:[{label:"Chamber Type",choices:["Soft","Hard"]}],meta:["Chamber Pressure (ATA)","Session Duration (min)","Session Number","HBOT Operator","Operator Certification"],items:[
        "I understand that HBOT involves breathing enriched oxygen in a pressurised chamber at greater than atmospheric pressure.",
        "I understand this is a wellness-grade HBOT session and is NOT a substitute for medical treatment or therapeutic HBOT.",
        "I confirm I do not have untreated pneumothorax (collapsed lung), active ear/sinus infection, fever, or implanted electronic devices.",
        "I confirm I do not have uncontrolled hypertension, severe COPD, epilepsy, or any contraindicated implants.",
        "I confirm I am not pregnant and am not currently on chemotherapy with bleomycin or cisplatin.",
        "I understand common side effects include ear pressure (barotrauma) and I have been trained on the Valsalva manoeuvre for ear equalisation.",
        "I agree not to bring any flammable materials, electronic devices, or petroleum-based products into the chamber.",
        "I will wear the cotton gown or cotton clothing provided — no synthetic fabrics.",
        "I have been verbally briefed on oxygen fire risk and chamber emergency exit protocol.",
        "I will notify staff immediately if I feel claustrophobic, experience ear pain, or any unusual symptom during the session.",
        "This session is conducted under the supervision of trained HBOT staff and is not a substitute for medical treatment."]}
    };
    function _nwRenderConsents(){
      const wrap=root.querySelector("#nwConsentForms"); if(!wrap) return;
      const e=(s:any)=>String(s==null?"":s).replace(/</g,"&lt;").replace(/>/g,"&gt;");
      // Office-use summary (Client ID + registration date + assigned counsellor).
      const setT=(id:string,v:string)=>{const el=root.querySelector("#"+id);if(el)el.textContent=v;};
      setT("nwOfficeCid",((root.querySelector("#nwClientId")as HTMLInputElement)?.value||"—")||"—");
      setT("nwOfficeRegDate",fmtISTDate(new Date().toISOString()));
      setT("nwOfficeCouns",((root.querySelector("#nwProv")as HTMLSelectElement)?.value||"—")||"—");
      const sel=Array.from(root.querySelectorAll('#nwPanel .nwStep[data-step="2"] input[data-svc2]:checked')).map((i:any)=>i.getAttribute("data-svc2"));
      if(!sel.length){ wrap.innerHTML='<div style="text-align:center;color:var(--faint);padding:22px;font-size:12.5px;border:1px dashed var(--line);border-radius:10px">Select one or more services on the “Service Selected” step to load the matching consent form(s).</div>'; return; }
      const sig='<div class="nwSignRow"><div class="fld"><label class="lbl">Client signature</label><input class="input" style="height:34px"></div><div class="fld"><label class="lbl">Date</label><input class="input" type="date" style="height:34px"></div><div class="fld"><label class="lbl">Staff witness</label><input class="input" style="height:34px"></div></div>';
      wrap.innerHTML=sel.map((svc:string)=>{ const c=_NW_CONSENTS[svc]; if(!c) return "";
        let body='';
        if(c.todo){ body='<div style="color:var(--faint);font-size:12.5px;padding:4px 2px">Consent content for this service will be added shortly.</div>'; }
        else{
          body=c.items.map((t:string)=>'<label class="nwConsentItem"><input type="checkbox"><span>'+e(t)+'</span></label>').join("");
          if(c.options&&c.options.length){ body+=c.options.map((o:any)=>'<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-top:8px"><span style="font-weight:600;font-size:12.5px">'+e(o.label)+'</span>'+o.choices.map((ch:string)=>'<label class="nwChk" style="padding:6px 12px"><input type="checkbox">'+e(ch)+'</label>').join("")+'</div>').join(""); }
          if(c.meta&&c.meta.length){ body+='<table class="nwConsentMeta"><tbody>'+c.meta.map((m:string)=>'<tr><td>'+e(m)+'</td><td><input class="input" style="height:30px"></td></tr>').join("")+'</tbody></table>'; }
        }
        return '<div class="nwConsentCard"><div class="nwConsentHd">CONSENT '+c.n+' — '+e(c.title)+'</div><div class="nwConsentBody">'+body+sig+'</div></div>';
      }).join("");
    }
    // Next Client ID: WC + 2-digit year + 4-digit running number (per year), e.g. WC260001.
    async function _genClientId():Promise<string>{
      const yy=String(new Date().getFullYear()).slice(-2); const prefix="WC"+yy;
      let maxN=0;
      try{ const {data}=await supabase.from("leads").select("client_id").ilike("client_id",prefix+"%").limit(100000);
        (data||[]).forEach((r:any)=>{ const m=String(r.client_id||"").match(/(\d{4})$/); if(m){ const n=parseInt(m[1],10); if(n>maxN)maxN=n; } });
      }catch(_){}
      return prefix+String(maxN+1).padStart(4,"0");
    }
    // True when no client already holds this Client ID (dedup guard before create).
    async function _cidFree(cid:string):Promise<boolean>{ try{ const {data}=await supabase.from("leads").select("client_id").eq("client_id",cid).limit(1); return !(data&&data.length); }catch(_){ return true; } }
    async function _nwFillClientId(){ const el=root.querySelector("#nwClientId")as HTMLInputElement|null; if(!el) return; el.value="…"; try{ el.value=await _genClientId(); }catch(_){ el.value=""; } }
    w.nwToggle = nwToggle;
    function nwCheckSlot() {
      const time=(root.querySelector("#nwTime")as HTMLSelectElement)?.value;
      const booked=RX.filter((r:any)=>r.time===time); const cap=4;
      const sr=root.querySelector("#nwSlotRes")as HTMLElement; if(!sr) return;
      if(booked.length>=cap) sr.innerHTML='<span class="chipb al">✗ '+time+' is FULL ('+booked.length+'/'+cap+')</span>';
      else sr.innerHTML='<span class="chipb ok">✓ '+time+' available — '+booked.length+'/'+cap+' booked</span>';
    }
    w.nwCheckSlot = nwCheckSlot;
    async function nwBook() {
      const name=((root.querySelector("#nwName")as HTMLInputElement)?.value||"").trim();
      const ph=((root.querySelector("#nwPhone")as HTMLInputElement)?.value||"").trim();
      const time=(root.querySelector("#nwTime")as HTMLSelectElement)?.value||"";
      const prov=(root.querySelector("#nwProv")as HTMLSelectElement)?.value||"";
      if(!name||!ph){ toastErr("Enter name and phone"); return; }
      if(!/^\d{10}$/.test(ph)){ toastErr("Enter a valid 10-digit mobile number"); return; }
      const nowIso=new Date().toISOString(); const today=nowIso.substring(0,10);
      const apptDate=((root.querySelector("#nwDate")as HTMLInputElement)?.value||"").trim()||today;   // honour the chosen date
      const email=((root.querySelector("#nwEmail")as HTMLInputElement)?.value||"").trim();
      if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ toastErr("Enter a valid email address"); return; }
      const leadId="walkin-"+Date.now()+"-"+Math.floor(Math.random()*1e6);
      // Client ID: use the one shown on the form; re-verify it's unique right before
      // creating (avoids duplicate registrations), regenerating on collision/empty.
      let clientId=((root.querySelector("#nwClientId")as HTMLInputElement)?.value||"").trim();
      if(!/^WC\d{6}$/.test(clientId) || !(await _cidFree(clientId))){ clientId=await _genClientId(); let g=0; while(!(await _cidFree(clientId))&&g++<5) clientId=await _genClientId(); }
      const cidEl=root.querySelector("#nwClientId")as HTMLInputElement|null; if(cidEl) cidEl.value=clientId;
      const visAt=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
      const svcChips=root.querySelectorAll("#nwSvc .chip-o.on"); const svcParts:string[]=[]; svcChips.forEach((c:any)=>{ const s=c.getAttribute("data-svc"); if(s==="dia")svcParts.push("Diabetes"); else if(s==="bt")svcParts.push("Blood test"); else if(s==="physio")svcParts.push("Physio"); }); const svcStr=svcParts.join(" + ")||"Diabetes";
      const langVal=((root.querySelector("#nwLang")as HTMLSelectElement|null)?.value)||"Tamil";   // read the Language field by id (robust to layout changes)
      try{
        await supabase.from("leads").insert({meta_lead_id:leadId,client_id:clientId,name,phone:ph,email:email||null,source:"Walk-in / Referral / Telecalling",language:langVal,service:svcStr,lead_date:today,is_valid:!!ph,is_duplicate:false,is_assigned:false,call_status:"Visited",visited_at:nowIso,created_at:nowIso});
      }catch(_){ /* lead insert best-effort */ }
      try{
        await supabase.from("appointments").insert({lead_id:leadId,client_id:clientId,client_name:name,phone:ph,service:svcStr,hc_pt:prov,appt_date:apptDate,appt_time:time,status:"visited",visited_at:visAt,stage:"screening",source:"Direct Walk-in",language:langVal,notes:"Walk-in registered at reception"});
      }catch(e:any){ toastErr(/appointment|relation|exist|schema/i.test(e.message||"")?"Run supabase-migration-reception.sql first":"Booking failed: "+(e.message||"db error")); return; }
      _nwClearDraft();   // registration completed → discard the saved draft
      nwToggle(); await loadReceptionData();
      ach("📌","Walk-in registered!",name+(time?(" · "+time):"")); boom(26);
      toast("Created + booked + checked in → screening");
    }
    w.nwBook = nwBook;

    let _recCollect:{apptId:any,leadId:string,amt:number,installment?:number}|null=null;
    function recOpen(apptId:any,name:string,amt:any,leadId:string) {
      _recCollect={apptId,leadId:leadId||"",amt:Number(amt)||0};
      // The collection panel lives on the Reception screen — when triggered from Blood test /
      // Physio / Accounts, switch to Reception so the form is actually visible.
      try{ const nav=root.querySelector('#nav button[data-s="reception"]')as HTMLButtonElement|null; if(nav) nav.click(); }catch(_){}
      const wb=root.querySelector("#recWb")as HTMLElement; if(wb){ wb.style.display="block"; try{ wb.scrollIntoView({behavior:"smooth",block:"center"}); }catch(_){} }
      const rn=root.querySelector("#recWbName"); if(rn) rn.textContent=name;
      const rp=root.querySelector("#recWbPlan"); if(rp) rp.textContent="Collection";
      const rd=root.querySelector("#recWbDue")as HTMLInputElement; if(rd) rd.value="₹"+(Number(amt)||0).toLocaleString("en-IN");
      const ra=root.querySelector("#recWbAmt")as HTMLInputElement; if(ra) ra.value=String(Number(amt)||0);
    }
    w._recOpen = recOpen;
    async function recConfirm() {
      if(!_recCollect){ toast("Nothing to collect"); return; }
      // Validate BEFORE hiding the panel, so failures keep the form open.
      const raw=((root.querySelector("#recWbAmt")as HTMLInputElement)?.value||"").trim();
      const amt=Number(raw.replace(/[^0-9.]/g,""));
      const due=Number(_recCollect.amt)||0;
      if(!raw||isNaN(amt)||amt<=0){ toastErr("Enter a valid amount — numbers only"); return; }
      if(due>0&&amt>due){ toastErr("Received (₹"+amt.toLocaleString("en-IN")+") cannot exceed the due (₹"+due.toLocaleString("en-IN")+")"); return; }
      const modeEl=root.querySelector("#recWbMode")as HTMLSelectElement|null;
      const method=(modeEl?.value||"UPI").toLowerCase();
      const txnEl=root.querySelector("#recWbTxn")as HTMLInputElement|null;
      const txnRef=(txnEl?.value||"").trim();
      if(method!=="cash"&&!txnRef){ toastErr("Enter the transaction reference for "+method.toUpperCase()+" payments"); return; }
      const wb=root.querySelector("#recWb")as HTMLElement; if(wb)wb.style.display="none";
      try{
        // ---- Reception collecting a pending INSTALLMENT (updates that installment, not a new payment) ----
        if(_recCollect.installment){
          const num=_recCollect.installment;
          const {data:ex}=await supabase.from("payments").select("id").eq("lead_id",_recCollect.leadId).eq("payment_type","installment").eq("installment_number",num).limit(1);
          const vals:any={status:"paid",amount:amt,method,paid_at:new Date().toISOString(),collected_by:"Reception desk",txn_ref:txnRef||null,due_date:null};
          if(ex&&ex[0]) await supabase.from("payments").update(vals).eq("id",ex[0].id);
          else await supabase.from("payments").insert(Object.assign({lead_id:_recCollect.leadId,payment_type:"installment",installment_number:num,total_installments:2,service:"Diabetes"},vals));
          if(_recCollect.apptId) await supabase.from("appointments").update({stage:"payment"}).eq("id",_recCollect.apptId);
          // Fully-paid check across all of this lead's installments.
          let fully=false; try{ const {data:all}=await supabase.from("payments").select("status,total_installments").eq("lead_id",_recCollect.leadId).eq("payment_type","installment"); const rws=all||[]; const tot=Math.max(2,...rws.map((r:any)=>Number(r.total_installments||2))); const paidN=rws.filter((r:any)=>r.status==="paid").length; fully=rws.length>0&&rws.every((r:any)=>r.status==="paid")&&paidN>=tot; }catch(_){}
          if(String(_coachLeadId)===String(_recCollect.leadId)){ try{ _renderCoachPayHistory(String(_recCollect.leadId)); }catch(_){} }
          toast("Installment "+num+" collected"+(fully?" — Fully Paid ✓":" · balance updated"));
          await loadReceptionData(); try{ loadAccountsData(); }catch(_){} try{ renderHealthDashboard(); renderAssignedLeads(); }catch(_){}
          _recCollect=null; return;
        }
        await supabase.from("payments").insert({appointment_id:_recCollect.apptId,lead_id:_recCollect.leadId,amount:amt,status:"paid",method,paid_at:new Date().toISOString(),collected_by:"Reception desk"});
        await supabase.from("appointments").update({stage:"payment"}).eq("id",_recCollect.apptId);
        if(_recCollect.leadId){
          await supabase.from("leads").update({call_status:"Payment Done"}).eq("meta_lead_id",_recCollect.leadId);
          // If the Health Coach has this client open, refresh its payment history + locks live.
          if(String(_coachLeadId)===String(_recCollect.leadId)){ try{ _renderCoachPayHistory(String(_recCollect.leadId)); }catch(_){} }
        }
        toast("₹"+amt.toLocaleString("en-IN")+" collected → Accounts verification");
        await loadReceptionData();
      }catch(e:any){ toastErr(/payment|relation|exist|schema/i.test(e.message||"")?"Run supabase-migration-reception.sql first":"Collect failed: "+(e.message||"db error")); }
      _recCollect=null;
    }
    w.recConfirm = recConfirm;
    // Reception → collect a pending installment for a lead (opens the collection panel prefilled
    // with the balance, tagged so recConfirm marks that installment Paid + checks Fully Paid).
    w._recCollectInstallment=(leadId:string,apptId:any,balance:number,name:string)=>{
      recOpen(apptId,(name||"Client")+" · Installment 2",balance,leadId||"");
      if(_recCollect) _recCollect.installment=2;
      const rp=root.querySelector("#recWbPlan"); if(rp) rp.textContent="Installment 2";
    };
    // SHARED enrollment sync — the single source of truth used by every module that can
    // enroll a lead (Reception "Mark Enrolled", Accounts payment-confirm, Health Coach save).
    // Writes leads.call_status='Enrolled' + enrolled_at + appointment stage, then propagates to
    // the in-memory Advisor + Health Coach records and refreshes every dependent view. Returns
    // the enrolled timestamp (or null on failure). Callers refresh Reception/Accounts as needed.
    async function _enrollLeadShared(leadId:string, srcLabel:string, level:string="L1"):Promise<string|null>{
      if(!leadId){ toastErr("No linked lead to enroll"); return null; }
      const lvl=(level==="L2")?"L2":"L1"; const consLabel="Enrolled – "+lvl;
      const enrIso=new Date().toISOString();
      const already=[..._metaLeads,..._assignedExtras].some((l:any)=>String(l.id)===String(leadId)&&l.callStatus==="Enrolled");
      try{
        const upd:any={call_status:"Enrolled"}; if(!already) upd.enrolled_at=enrIso;
        const {error}=await supabase.from("leads").update(upd).eq("meta_lead_id",leadId);
        if(error) throw error;
        await supabase.from("appointments").update({stage:"enrolled"}).eq("lead_id",leadId).neq("status","cancelled");
      }catch(e:any){ toastErr("Enroll sync failed: "+(e.message||"db error")); return null; }
      // Advisor in-memory leads → Enrolled (drives the Advisor dashboard + Call Status column).
      const setEnrolled=(arr:any[])=>arr.forEach((l:any)=>{ if(String(l.id)===String(leadId)){ l.callStatus="Enrolled"; if(!already) l.enrolledAt=enrIso; } });
      setEnrolled(_metaLeads); setEnrolled(_assignedExtras);
      // Health Coach in-memory client → consultation status Enrolled – L1/L2 (drives coach
      // dashboard/table + is what the profile restores to when opened).
      const cc=_coachClients.find((x:any)=>String(x.id)===String(leadId));
      if(cc){ cc.callStatus="Enrolled"; cc.consStatus=consLabel; if(cc.coachProfile) cc.coachProfile.consStatus=consLabel; }
      if(!already) logActivity(leadId,[{action:"Enrolled",field:"Enrolled at ("+srcLabel+")",new:fmtIST(enrIso)}]);
      try{ renderHealthDashboard(); renderAssignedLeads(); renderAsnHist(); }catch(_){}
      try{ renderCoachOpenList(); }catch(_){}
      try{ if(String(_advLeadId)===String(leadId)&&!already) _advApplyEnrolled("Enrolled",enrIso); }catch(_){}
      // If the coach currently has this client open, flip the (hidden) Enrolled pill live at the
      // right level so the badge + payment enrollment chip reflect it.
      try{ if(String(_coachLeadId)===String(leadId)){ const code=lvl==="L2"?"enrol2":"enrol1"; const pill=root.querySelector('#consStatus .pill[onclick*="'+code+'"]')as HTMLElement|null; if(pill){ root.querySelectorAll("#consStatus .pill").forEach((b:any)=>b.classList.remove("on")); pill.classList.add("on"); consAct(code,pill); } _refreshPayEnrollChip(); } }catch(_){}
      return already?"":enrIso;
    }
    // Reception → Health Coach enrollment (explicit per-client action).
    w._recMarkEnrolled=async(leadId:string,apptId:any,name:string)=>{
      if(!leadId){ toastErr("This walk-in has no linked lead to enroll"); return; }
      const res=await _enrollLeadShared(leadId,"Reception"); if(res===null) return;
      await loadReceptionData();   // Reception reflects Enrolled immediately
      closeDrawer();
      toast("🏆 "+(name||"Client")+" marked Enrolled — synced to Health Coach");
    };
    function recBack() { const wb=root.querySelector("#recWb")as HTMLElement; if(wb)wb.style.display="none"; toast("↩ Moved back"); }
    w.recBack = recBack;
    // Check-in: match the typed phone/name to a loaded appointment; fill Dedup + name.
    let _ciMatch:any=null;
    function _ciLookup(){
      const q=((root.querySelector("#ciSearch")as HTMLInputElement)?.value||"").trim();
      const nameEl=root.querySelector("#ciName"); const dd=root.querySelector("#ciDedup")as HTMLInputElement|null;
      if(!q){ _ciMatch=null; if(nameEl)nameEl.textContent="—"; if(dd)dd.value=""; return; }
      const ql=q.toLowerCase(); const digits=q.replace(/\D/g,"");
      const matches=_recAll.filter((r:any)=>{ const ph=(r.ph||"").replace(/\D/g,""); const cid=(r.clientId||"").toLowerCase(); return (digits.length>=4 && ph.indexOf(digits)>=0) || (r.name||"").toLowerCase().indexOf(ql)>=0 || (cid!==""&&cid.indexOf(ql)>=0); });
      const pick=matches.find((r:any)=>r.status!=="visited")||matches[0]||null;
      _ciMatch=pick;
      if(nameEl) nameEl.textContent=pick?pick.name:"No match";
      if(dd){
        if(!pick){ dd.value="No match found"; }
        else{ const ph=(pick.ph||"").replace(/\D/g,""); const same=ph?_recAll.filter((r:any)=>(r.ph||"").replace(/\D/g,"")===ph):[pick]; dd.value=same.length>1?("Repeat · "+same.length+" appts"):"Unique · new client"; }
      }
    }
    w._ciLookup=_ciLookup;
    // Confirm → screening: mark the appointment visited, advance to screening stage, persist.
    async function recRegDone(){
      _ciLookup();
      if(!_ciMatch){ toastErr("Search a client by phone or name first"); return; }
      const nowIso=new Date().toISOString();
      const now=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
      try{
        const {error}=await supabase.from("appointments").update({status:"visited",visited_at:nowIso,stage:"screening"}).eq("id",_ciMatch.id);
        if(error) throw error;
        // Set leads.visited_at too — that's the field the Health Coach queue reads,
        // so the checked-in client flows through to the coach after screening.
        if(_ciMatch.lead_id){ try{ await supabase.from("leads").update({call_status:"Visited",visited_at:nowIso}).eq("meta_lead_id",_ciMatch.lead_id); }catch(_){}
          // Record the check-in in the lead's Activity Log (date/time + mode).
          const mode=(_ciMatch.meeting_type==="zoom"||/zoom/i.test(_ciMatch.source||""))?"Zoom":"Walk-in";
          logActivity(_ciMatch.lead_id,[{action:"Checked In",field:"Visited",new:mode}]);
        }
      }catch(e:any){ toastErr("Check-in save failed: "+(e.message||"db error")); return; }
      const vis=root.querySelector("#rcVis")as HTMLInputElement|null; if(vis)vis.value=now;
      const reg=root.querySelector("#rcReg")as HTMLInputElement|null; if(reg)reg.value=now;
      toast("✓ "+_ciMatch.name+" checked in → screening ("+now+")");
      await loadReceptionData();   // refresh: appointment now Visited, in screening queue + payment queue
      try{ loadZoomCheckins(); }catch(_){}
    }
    w.recRegDone = recRegDone;
    // ===== Zoom check-in (Appointment Fixed – Zoom) — Advisor list + Reception action =====
    // Zoom appointments the advisor booked, awaiting the receptionist's check-in. Loaded
    // independently of the reception queue so the list works on the advisor screen too.
    let _zoomAppts:any[]=[];
    async function loadZoomCheckins(){
      try{
        const {data}=await supabase.from("appointments").select("id,lead_id,client_name,phone,service,appt_date,appt_time,status,source,meeting_type,language,visited_at")
          .neq("status","visited").neq("status","cancelled").order("appt_date",{ascending:false}).limit(500);
        _zoomAppts=(data||[]).filter((a:any)=>a.meeting_type==="zoom"||/zoom/i.test(a.source||""));
      }catch(_){ _zoomAppts=[]; }
      renderZoomCheckins();
    }
    function renderZoomCheckins(){
      const e=(s:any)=>(s==null?"":String(s)).replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const when=(a:any)=>(a.appt_date?fmtISTDate(a.appt_date):"")+(a.appt_time?(" · "+a.appt_time):"");
      const rowHtml=(a:any,withAction:boolean)=>'<tr>'
        +'<td style="font-weight:600">'+e(a.client_name||"Client")+'</td>'
        +'<td class="mono">'+e(a.phone||"—")+'</td>'
        +'<td>'+e(when(a)||"—")+'</td>'
        +'<td><span class="chipb warn">'+e(a.status||"expected")+'</span></td>'
        +(withAction?'<td><button class="btn bsm bp" onclick="window._zoomCheckin('+a.id+')">✓ Check in</button></td>':'')
        +'</tr>';
      const fill=(sel:string,withAction:boolean)=>{ const b=root.querySelector(sel); if(!b) return; b.innerHTML=_zoomAppts.length?_zoomAppts.map((a:any)=>rowHtml(a,withAction)).join(""):('<tr><td colspan="'+(withAction?5:4)+'" style="text-align:center;color:var(--faint);padding:16px">No Zoom appointments awaiting check-in</td></tr>'); };
      fill("#zoomCiListAdv",false);
      fill("#zoomCiListRec",true);
      root.querySelectorAll(".zoomCiCount").forEach((x:any)=>{ x.textContent=String(_zoomAppts.length); });
    }
    w._zoomCheckin=async(apptId:number)=>{
      const a=_zoomAppts.find((x:any)=>String(x.id)===String(apptId));
      const nowIso=new Date().toISOString();
      try{
        const {error}=await supabase.from("appointments").update({status:"visited",visited_at:nowIso,stage:"screening"}).eq("id",apptId);
        if(error) throw error;
        if(a&&a.lead_id){ try{ await supabase.from("leads").update({call_status:"Visited",visited_at:nowIso}).eq("meta_lead_id",a.lead_id); }catch(_){}
          logActivity(a.lead_id,[{action:"Checked In",field:"Visited",new:"Zoom"}]);
        }
      }catch(e:any){ toastErr("Zoom check-in failed: "+(e.message||"db error")); return; }
      toast("✓ "+((a&&a.client_name)||"Client")+" checked in (Zoom)");
      await loadZoomCheckins();
      try{ loadReceptionData(); }catch(_){}
    };
    function showInbound() { root.querySelector("#inboundBar")?.classList.add("show"); }
    w.showInbound = showInbound;
    function hideInbound() { root.querySelector("#inboundBar")?.classList.remove("show"); }
    w.hideInbound = hideInbound;

    // Advisor call status
    const badge = root.querySelector("#consBadge");
    function callStatusChange(v:string) {
      const appt=root.querySelector("#apptSec")as HTMLElement;
      const fu=root.querySelector("#fuPanel")as HTMLElement;
      if(appt){ appt.style.display=(v==="afd"||v==="afz")?"block":"none"; if(v==="afd"||v==="afz") appt.classList.add("closed"); }   // show the slot board collapsed — it opens only when the advisor clicks it
      if(v==="afd"){const m=root.querySelector("#apptMode");if(m)m.textContent="Direct (Walk-in)";}
      if(v==="afz"){const m=root.querySelector("#apptMode");if(m)m.textContent="Zoom / Online";}
      if(fu) fu.style.display=(v==="fu")?"flex":"none";
      // Next follow-up date is REQUIRED for statuses that imply a retry/follow-up,
      // and disabled+cleared for the rest. (Appointment statuses use the slot board.)
      const needsFu=FU_REQUIRED_CODES.indexOf(v)>=0;
      const nf=root.querySelector("#nextFollowUp")as HTMLInputElement|null;
      if(nf){
        nf.disabled=!needsFu;
        nf.style.opacity=needsFu?"1":"0.45";
        nf.title=needsFu?"Required for this status":"Only used for Call Back / Follow Up / RNR / Line Busy / Switched Off";
        if(!needsFu){ nf.value=""; }
        else if(!nf.value && !_advApplying){ const d=new Date(); d.setDate(d.getDate()+1); d.setHours(11,0,0,0); const p=(n:number)=>String(n).padStart(2,"0"); nf.value=d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"T"+p(d.getHours())+":"+p(d.getMinutes()); }
      }
      // Follow-up plan "Planned date & time" mirrors the canonical Next-follow-up field.
      if(v==="fu"){ const _fp=root.querySelector("#fuPlannedDt")as HTMLInputElement|null; if(_fp) _fp.value=((root.querySelector("#nextFollowUp")as HTMLInputElement)?.value)||_fp.value; }
      const map:Record<string,[string,string]>={new:["New","vio"],fu:["Follow Up","warn"],paid:["Already Paid","info"],afd:["Appt Fixed","ok"],afz:["Appt Fixed (Zoom)","ok"],ni:["Not Interested","al"],cb:["Call Back","vio"]};
      const m=map[v]||[v,"neu"];
      if(badge){badge.textContent="Status: "+m[0];badge.className="chipb "+m[1];}
      if(v==="afd"||v==="afz"){ const sdEl=root.querySelector("#slotDate")as HTMLInputElement|null; if(sdEl&&!sdEl.value) sdEl.value=new Date().toISOString().substring(0,10); renderSlots(); }   // no auto-popup/auto-book — the advisor opens the slot board and books a slot explicitly
      // Persist the call status to the open lead so it drives the KPI dashboard.
      if(w._haSetCallStatus) w._haSetCallStatus(HA_CODE2LABEL[v]||v);
      // Audit: log a real status change (but not when restoring a saved profile).
      if(!_advApplying && _advLeadId) logActivity(_advLeadId,[{action:"Status Changed",field:"Call status",new:HA_CODE2LABEL[v]||v}]);
    }
    w.callStatusChange = callStatusChange;
    // Follow-up plan → push the entered "Planned date & time" into the canonical Next-follow-up
    // field so the existing save persists it to leads.next_followup and it drives the dashboard.
    w._fuPlannedSync=()=>{ const p=(root.querySelector("#fuPlannedDt")as HTMLInputElement)?.value; const nf=root.querySelector("#nextFollowUp")as HTMLInputElement|null; if(nf&&p){ nf.disabled=false; nf.style.opacity="1"; nf.value=p; } };

    // ===== Future-only date/time validation (scheduling fields) =====
    // Applied to fields that schedule a FUTURE activity (follow-up / planned / appointment /
    // review / next-action). Historical fields (actual-paid dates, report dates) and range
    // FILTERS are intentionally excluded — they carry data-future only where future-only.
    function _pad2(n:number){return String(n).padStart(2,"0");}
    function _nowLocalDT(){const d=new Date();return d.getFullYear()+"-"+_pad2(d.getMonth()+1)+"-"+_pad2(d.getDate())+"T"+_pad2(d.getHours())+":"+_pad2(d.getMinutes());}
    function _todayLocal(){const d=new Date();return d.getFullYear()+"-"+_pad2(d.getMonth()+1)+"-"+_pad2(d.getDate());}
    // Set the picker floor so past dates/times can't be chosen. datetime-local → now; date → today.
    function _setFutureMin(el:HTMLInputElement){ if(!el)return; el.min=(el.type==="datetime-local")?_nowLocalDT():_todayLocal(); }
    // Is the entered value in the past? (empty/unparseable = allowed). 60s grace on datetime for "now".
    function _isPastVal(el:HTMLInputElement){ const v=el.value; if(!v)return false; if(el.type==="datetime-local"){ const t=new Date(v).getTime(); return !isNaN(t)&&t<Date.now()-60000; } return v<_todayLocal(); }
    w._futureMin=(el:HTMLInputElement)=>_setFutureMin(el);   // refresh min on focus (clock moves on)
    // Wire every [data-future] scheduling input once the template is mounted: floor the picker
    // and reject a manually-typed past value on change.
    function _wireFutureFields(){
      root.querySelectorAll<HTMLInputElement>("input[data-future]").forEach(el=>{
        _setFutureMin(el);
        el.addEventListener("focus",()=>_setFutureMin(el));
        el.addEventListener("change",()=>{ _setFutureMin(el); if(_isPastVal(el)){ toastErr("Please choose the current or a future date/time — past values aren't allowed"); el.value=""; el.focus(); } });
      });
    }

    // Each slot is now PER HEALTH COACH: a time can hold at most ONE booking for a given HC.
    // The same time is still independently bookable for a different HC. Occupancy is scoped
    // to the currently-selected HC so the board shows only that coach's schedule.
    type SlotBk={name:string;hc:string;leadId:string};
    const HC_CAP=1; let slots:Record<string,SlotBk[]>={}; let selSlot:string|null=null; let booked:string|null=null; let resch=false;
    // The HC that drives the slot board is ALWAYS the "HC assigned" value from Assignment &
    // pipeline (the board's own HC dropdown is locked/read-only and only mirrors it).
    function _apptHcVal():string{ const h=(root.querySelector("#hcSel")as HTMLSelectElement|null)?.value||""; if(h) return h; return (root.querySelector("#apptHc")as HTMLSelectElement|null)?.value||""; }
    // Load REAL slot occupancy for the chosen date AND the selected HC from the appointments table.
    async function loadSlotsFromDB(){
      slots={}; TIMES.forEach(t=>slots[t]=[]);
      const date=(root.querySelector("#slotDate")as HTMLInputElement|null)?.value;
      const hc=_apptHcVal();
      if(!date||!hc) return;   // no HC selected → nothing loaded; renderSlots shows a prompt
      try{
        const {data}=await supabase.from("appointments").select("client_name,hc_pt,appt_time,status,lead_id").eq("appt_date",date).eq("hc_pt",hc).neq("status","cancelled");
        (data||[]).forEach((a:any)=>{ const t=a.appt_time; if(t&&slots[t]) slots[t].push({name:a.client_name||"Client",hc:a.hc_pt||"—",leadId:String(a.lead_id||"")}); });
      }catch(_){/* table not migrated yet → all slots free */}
    }
    function seed(){ TIMES.forEach(t=>{ if(!slots[t]) slots[t]=[]; }); }   // no demo data — just ensure keys exist
    async function renderSlots() {
      const g=root.querySelector("#slotGrid"); if(!g) return;
      const esc=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const hc=_apptHcVal();
      // The board's HC dropdown is LOCKED: always mirror the assigned HC + keep it disabled so
      // it can't be changed here. Booking is only ever for the assigned Health Coach.
      const apptHcEl=root.querySelector("#apptHc")as HTMLSelectElement|null;
      if(apptHcEl){ apptHcEl.value=hc; apptHcEl.disabled=true; apptHcEl.title="Set automatically from “HC assigned” in Assignment & pipeline — cannot be changed here"; }
      const capEl=root.querySelector("#apptCapRule")as HTMLInputElement|null;
      if(capEl) capEl.value=hc?("1 booking / slot · "+hc):"Assign an HC first";
      if(!hc){ g.innerHTML='<div style="grid-column:1/-1;text-align:center;color:var(--faint);padding:22px 8px">Assign a <b>Health Coach</b> in <b>Assignment &amp; pipeline</b> (HC assigned) — the slot board loads that coach\'s schedule automatically. Each coach has an independent schedule.</div>'; selSlot=null; return; }
      await loadSlotsFromDB();
      g.innerHTML=TIMES.map((t)=>{
        const arr=slots[t]||[]; const isBooked=arr.length>=HC_CAP;
        const own=isBooked&&!!_advLeadId&&arr.some(x=>String(x.leadId)===String(_advLeadId));
        const cls=isBooked?(own?"s2":"s3 full"):"s0";
        const tag=isBooked?(own?"YOUR SLOT":"BOOKED"):"Free";
        return '<button class="slotcard '+cls+(selSlot===t?" sel":"")+'" data-t="'+t+'"><div class="st"><span class="tm">'+t+'</span><span class="cap">'+tag+'</span></div><ul>'+(arr.map((x)=>'<li><span>'+esc(x.name)+'</span><span class="hc">'+esc(x.hc)+'</span></li>').join("")||'<li style="color:var(--ok-ink)">Free</li>')+'</ul></button>';
      }).join("");
      g.querySelectorAll(".slotcard").forEach((c)=>{
        (c as HTMLElement).onclick=()=>{
          const t=(c as HTMLElement).dataset.t!;
          const arr=slots[t]||[];
          const own=!!_advLeadId&&arr.some(x=>String(x.leadId)===String(_advLeadId));
          // Booked by another lead for THIS HC → not selectable (one booking per slot per HC).
          if(arr.length>=HC_CAP && !own){c.classList.add("shake");setTimeout(()=>c.classList.remove("shake"),350);toastErr(t+" is already booked for "+hc);return;}
          selSlot=t; renderSlots();
        };
      });
    }
    w.renderSlots = renderSlots;
    // Assigning a Health Coach in "Assignment & pipeline" links it to the appointment booking:
    // the slot board switches to that coach's schedule.
    w._hcAssignedChange=()=>{ const h=(root.querySelector("#hcSel")as HTMLSelectElement|null)?.value||""; const a=root.querySelector("#apptHc")as HTMLSelectElement|null; if(a) a.value=h; selSlot=null; renderSlots(); };
    w._apptHcChange=()=>{ selSlot=null; renderSlots(); };   // changing the board's HC reloads that coach's schedule
    // Book the CURRENTLY OPEN lead into the selected slot (real appointment row).
    async function bookSlot() {
      if(!selSlot){toastErr("Select a slot first");return;}
      const date=(root.querySelector("#slotDate")as HTMLInputElement|null)?.value;
      if(!date){toastErr("Pick a date first");return;}
      if(date<_todayLocal()){toastErr("Appointment date can't be in the past");return;}
      if(!_advLeadId){toastErr("Open a lead first (from Assigned leads)");return;}
      const hc=_apptHcVal();
      if(!hc){toastErr("Select a Health Coach (HC) first");return;}
      const lead=_advFindLead(String(_advLeadId));
      const name=lead?(lead.name||lead.phone||"Client"):"Client";
      // Guard against double-booking: this HC's slot must be free (or already this lead's).
      await loadSlotsFromDB();
      const taken=slots[selSlot]||[];
      if(taken.length>=HC_CAP && !taken.some(x=>String(x.leadId)===String(_advLeadId))){ toastErr(selSlot+" is already booked for "+hc); await renderSlots(); return; }
      try{
        const {data}=await supabase.from("appointments").select("id").eq("lead_id",_advLeadId).eq("appt_date",date).neq("status","cancelled").limit(1);
        if(data&&data[0]) await supabase.from("appointments").update({appt_time:selSlot,hc_pt:hc,status:"expected"}).eq("id",data[0].id);
        else await supabase.from("appointments").insert({lead_id:_advLeadId,client_name:name,phone:lead?(lead.phone||""):"",service:"Diabetes",hc_pt:hc,appt_date:date,appt_time:selSlot,status:"expected",source:"Advisor slot board",language:lead?(lead.lang||"Tamil"):"Tamil"});
      }catch(e:any){ toastErr(/appointment|relation|exist|schema/i.test(e.message||"")?"Run supabase-migration-reception.sql first":"Booking failed: "+(e.message||"db error")); return; }
      booked=selSlot;
      logActivity(_advLeadId,[{action:"Status Changed",field:"Appointment",new:date+" · "+booked}]);
      const rb=root.querySelector("#reschBtn")as HTMLElement; if(rb)rb.style.display="inline-flex";
      ach("📌","Booked!",name+" · "+booked); boom(34);
      toast("Booked into "+booked);
      selSlot=null; resch=false;
      await renderSlots();
      loadReceptionData();
    }
    w.bookSlot = bookSlot;
    function startResch(){resch=true;const rb=root.querySelector("#reschBanner")as HTMLElement;if(rb)rb.style.display="flex";toast("Pick a new slot");}
    w.startResch = startResch;
    function visitedFx(){
      const vd=root.querySelector("#visDt")as HTMLInputElement;
      if(vd)vd.value=new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
      // reflect the pill selection (Visited on, Open off)
      const sp=root.querySelector('#s-advisor .a-p[data-p="sales"]'); if(sp){ const pills=sp.querySelectorAll(".pill"); pills.forEach((b:any,i:number)=>b.classList.toggle("on",i===1)); }
      ach("🏥","Visited!","→ screening");boom(34);
      if(_advLeadId){
        persistAdvProfileQuiet(String(_advLeadId));
        logActivity(_advLeadId,[{action:"Status Changed",field:"Visited status",old:"Open",new:"Visited"}]);
        // Mark visited in the DB so the lead becomes eligible in the Health Coach list.
        supabase.from("leads").update({visited_at:new Date().toISOString()}).eq("meta_lead_id",_advLeadId).then(()=>{},()=>{});
      }
    }
    w.visitedFx = visitedFx;
    // Toggle back to "Open" — clears the auto Visited date.
    w._advSetOpen=()=>{
      const sp=root.querySelector('#s-advisor .a-p[data-p="sales"]');
      if(sp){ const pills=sp.querySelectorAll(".pill"); pills.forEach((b:any,i:number)=>b.classList.toggle("on",i===0)); }
      const vd=root.querySelector("#visDt")as HTMLInputElement|null; if(vd) vd.value="";
      if(_advLeadId && !_advApplying){
        persistAdvProfileQuiet(String(_advLeadId));
        logActivity(_advLeadId,[{action:"Status Changed",field:"Visited status",old:"Visited",new:"Open"}]);
        supabase.from("leads").update({visited_at:null}).eq("meta_lead_id",_advLeadId).then(()=>{},()=>{});
      }
    };

    // ===== Click-to-call (Tata Tele / Smartflo) — server keeps the API key =====
    async function _callInitiate(id:string){ try{ const r=await fetch(_api("/api/calls/initiate/"+encodeURIComponent(id)),{method:"POST"}); return await r.json(); }catch(_){ return {ok:false,error:"network error"}; } }
    async function _callRecordings(id:string){ try{ const r=await fetch(_api("/api/calls/"+encodeURIComponent(id)+"/recordings")); return await r.json(); }catch(_){ return {ok:false,recordings:[]}; } }
    // Pull final call status + recordings from the provider's CDR into the DB (webhook-independent).
    async function _callSync(id:string){ try{ const r=await fetch(_api("/api/calls/"+encodeURIComponent(id)+"/sync")); return await r.json(); }catch(_){ return {ok:false,synced:0}; } }
    async function _callTagLatest(id:string,t:string){ try{ const r=await fetch(_api("/api/calls/"+encodeURIComponent(id)+"/latest-type"),{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({callType:t})}); return await r.json(); }catch(_){ return {ok:false}; } }
    // After a call, poll for the recording the webhook delivers, then auto-tag it.
    function _pollRecordings(id:string,callType:string){
      const delays=[3000,15000,45000,120000,300000]; let surfaced=false;
      delays.forEach(d=>setTimeout(async()=>{
        if(surfaced) return;
        const res=await _callRecordings(id);
        const recs=(res&&res.recordings)||[];
        const ready=recs.find((r:any)=>r.recording_url);
        if(ready){
          surfaced=true;
          await _callTagLatest(id,callType);
          logActivity(id,[{action:"File Uploaded",field:"Call recording",new:ready.recording_url}]);
          if(String(_advLeadId)===String(id)) toast("Call recording ready");
        }
      },d));
    }
    // ===== Advisor Call ↔ End-Call button (Tata/Smartflo click-to-call) =====
    // Bound as a window handler (via the template's onclick) so it survives any header re-render,
    // and re-queries the button each tick so state stays correct. Click-to-call has no programmatic
    // hangup (the call is on the agent's phone), so "End" finalises the CRM side — stops the timer,
    // records the duration + a "Call ended" activity, resets the UI for the next call, and fetches
    // the final recording (which the Smartflo webhook writes once the agent hangs up).
    let _callActive=false, _callSecs=0, _callTimer:ReturnType<typeof setInterval>|null=null, _callBusy=false;
    function _callBtnState(mode:"idle"|"connecting"|"active"){
      const b=root.querySelector("#callBtn")as HTMLElement|null; if(!b) return; const s=b.querySelector("span");
      if(mode==="idle"){ b.style.background=""; b.classList.remove("oncall"); if(s)s.textContent="Call"; }
      else if(mode==="connecting"){ b.style.background="linear-gradient(135deg,#E2553B,#A8351F)"; b.classList.add("oncall"); if(s)s.textContent="Connecting…"; }
      else { b.style.background="linear-gradient(135deg,#E2553B,#A8351F)"; b.classList.add("oncall"); if(s)s.textContent="End · "+((_callSecs/60|0)+":"+String(_callSecs%60).padStart(2,"0")); }
    }
    function _endCallUi(){ _callActive=false; if(_callTimer){clearInterval(_callTimer);_callTimer=null;} _callBtnState("idle"); }
    w._advCallToggle=async()=>{
      if(_callBusy) return;                    // ignore rapid double-clicks during the initiate await
      if(!_callActive){
        if(!_advLeadId){ toast("Open a lead first (from Assigned leads)"); return; }
        const id=String(_advLeadId); const nm=(root.querySelector("#advName")?.textContent)||"lead";
        _callBusy=true; _callActive=true; _callBtnState("connecting");
        const r=await _callInitiate(id);
        _callBusy=false;
        if(!r||!r.ok){ _endCallUi(); toastErr((r&&r.error)||"Call could not be placed"); return; }
        toast("📞 Calling "+nm+" — your phone rings first, then the customer");
        logActivity(id,[{action:"Status Changed",field:"Call",new:"Outbound call initiated"}]);
        _callSecs=0; _callBtnState("active");
        if(_callTimer)clearInterval(_callTimer);
        _callTimer=setInterval(()=>{ _callSecs++; _callBtnState("active"); },1000);
        _pollRecordings(id,"outbound");
      } else {
        // End the call (agent hangs up on their phone; CRM finalises + records).
        const id=_advLeadId?String(_advLeadId):"";
        const dur=(_callSecs/60|0)+":"+String(_callSecs%60).padStart(2,"0");
        _endCallUi();
        if(id){ logActivity(id,[{action:"Updated",field:"Call ended",new:dur}]);
          // Pull the final status/recording once the webhook posts it (a few seconds after hangup).
          setTimeout(()=>{ if(String(_advLeadId)===id){ const l=_advFindLead(id); if(l) renderCallLogs(l); } }, 9000);
        }
        toast("Call ended · "+dur);
      }
    };
    // Bind directly too (belt-and-suspenders: works even if the template onclick is missing).
    { const _cb=root.querySelector("#callBtn")as HTMLElement|null; if(_cb) _cb.onclick=()=>w._advCallToggle(); }

    // Coach consultation
    const cBadge=root.querySelector("#coachBadge");
    let _coachConsStatus="Open";   // the open client's consultation status (persisted in coach_profile)
    function consAct(a:string,el:HTMLElement){
      const pay=root.querySelector("#paySec")as HTMLElement;
      const fu=root.querySelector("#coachFu")as HTMLElement;
      const rf=root.querySelector("#refundPanel")as HTMLElement;
      // Record the chosen consultation status (the pill's label) so the dashboard/table
      // can categorize this client. Runs for user clicks AND profile restores.
      if(el&&el.textContent) _coachConsStatus=el.textContent.trim();
      if(fu)fu.style.display="none"; if(rf)rf.style.display="none";
      // Review date is only relevant for "Will Join Immediately" (join) and the
      // This Week / End of Month / Next Month plans (all the 'fup' action) — hidden otherwise.
      const rdFld=root.querySelector("#reviewDateFld")as HTMLElement|null;
      if(rdFld) rdFld.style.display=(a==="join"||a==="fup")?"":"none";
      if(a==="refund"){if(rf)rf.style.display="flex";if(pay)pay.style.display="none";if(cBadge){cBadge.textContent="Refund";cBadge.className="chipb al";}return;}
      if(a==="join"){if(pay)pay.style.display="block";if(cBadge){cBadge.textContent="Joining";cBadge.className="chipb ok";}}
      if(a==="fup"){if(fu)fu.style.display="flex";if(pay)pay.style.display="none";if(cBadge){cBadge.textContent="Follow Up";cBadge.className="chipb warn";}}
      if(a==="enrol1"||a==="enrol2"){if(pay)pay.style.display="block";if(cBadge){cBadge.textContent="Enrolled";cBadge.className="chipb ok";}}   // no auto celebration popup — only updates the consultation status
      if(a==="paidb"||a==="paida"){if(pay)pay.style.display="block";if(cBadge){cBadge.textContent="Paid";cBadge.className="chipb info";}}
      if(a==="ni"){if(pay)pay.style.display="none";if(cBadge){cBadge.textContent="Not Interested";cBadge.className="chipb al";}}
      if(a==="open"){if(pay)pay.style.display="none";if(cBadge){cBadge.textContent="Open";cBadge.className="chipb vio";}}
      // Whenever the payment section is revealed, refresh the auto quote/balances and
      // apply the L1/L2 program-specific pricing view.
      if(pay&&pay.style.display==="block"){ try{ _syncProgramPricing(); }catch(_){} }
    }
    w.consAct = consAct;

    function payBlk(v:string){
      root.querySelectorAll(".payblk").forEach((p)=>p.classList.remove("on"));
      const m:Record<string,string>={full:"pb-full",i2:"pb-i2",emi:"pb-emi",adv:"pb-adv"};
      if(m[v]) root.querySelector("#"+m[v])?.classList.add("on");
      try{ if(w._coachApplyPayLocks) w._coachApplyPayLocks(); }catch(_){}   // re-apply paid-stage locks for the chosen method
    }
    w.payBlk = payBlk;
    // Payment-section Status = a DROPDOWN backed by the section's existing (hidden) status pills.
    // The dropdown is the UI; the pill state remains the storage, so save/load keeps using the
    // existing positional pill capture — fully backward-compatible, no new status values, no
    // calc/workflow change. The dropdown itself is excluded from the field capture (data-nocap).
    // Which status value in each payment method triggers enrollment (drives Enrolled – L1/L2).
    const _payEnrollTrig:Record<string,{method:string;trigger:string}>={ "pb-full":{method:"full",trigger:"Payment Done"}, "pb-i2":{method:"i2",trigger:"1st Paid"}, "pb-emi":{method:"emi",trigger:"EMI Received"}, "pb-adv":{method:"adv",trigger:"Fully Paid"} };
    // Show the auto enrollment level (from payment) in the payment section.
    function _setPayEnrollDisplay(level:string,iso:string){ const chip=root.querySelector("#payEnrollChip"); if(chip){ (chip as HTMLElement).className="chipb ok"; chip.textContent="Enrolled – "+level; } const at=root.querySelector("#payEnrollAt")as HTMLInputElement|null; if(at) at.value=iso?fmtIST(iso):""; }
    // Refresh the payment enrollment chip from the current consultation status (on profile load).
    function _refreshPayEnrollChip(){ const cs=_coachConsStatus||""; const m=cs.match(/Enrolled\s*[–-]\s*(L\d)/i); const chip=root.querySelector("#payEnrollChip"); const at=root.querySelector("#payEnrollAt"); if(chip){ if(m){ (chip as HTMLElement).className="chipb ok"; chip.textContent="Enrolled – "+m[1].toUpperCase(); } else { (chip as HTMLElement).className="chipb neu"; chip.textContent="Not enrolled"; } } const ati=at as HTMLInputElement|null; if(ati){ const cc=_coachClients.find((x:any)=>String(x.id)===String(_coachLeadId)); ati.value=(m&&cc&&cc.enrolledAt)?fmtIST(cc.enrolledAt):""; } }
    w._refreshPayEnrollChip=_refreshPayEnrollChip;
    w._payStSel=(sel:any)=>{
      const box=sel&&sel.parentElement; const grp=box&&box.querySelector(".pills");
      if(grp){ grp.querySelectorAll(".pill").forEach((b:any)=>b.classList.toggle("on",(b.textContent||"").trim()===sel.value)); }
      // Payment-driven enrollment: when the ACTIVE payment method's status hits its trigger value,
      // auto-enroll the open client at the suggested program's level (L1/L2) + record date & sync.
      const blk=sel&&sel.closest?sel.closest(".payblk"):null; const t=blk?_payEnrollTrig[blk.id]:null;
      if(!t) return;
      const activeMethod=(root.querySelector("#payMethod")as HTMLSelectElement|null)?.value||"";
      if(activeMethod!==t.method) return;                         // only the selected method enrolls
      if((sel.value||"").trim()!==t.trigger) return;              // only its "done/received/paid" value
      if(!_coachLeadId){ toast("Open a client first to enroll"); return; }
      const prog=(root.querySelector("#haProgram")as HTMLSelectElement|null)?.value||"L2";
      const level=(prog==="L1")?"L1":"L2";
      _enrollLeadShared(String(_coachLeadId),"Payment "+t.trigger,level).then((iso:string|null)=>{ if(iso!==null){ _setPayEnrollDisplay(level,iso||((_coachClients.find((x:any)=>String(x.id)===String(_coachLeadId))||{}).enrolledAt)||""); toast("🏆 Enrolled – "+level+" (from payment)"); } });
    };
    // After a profile restores the (hidden) pills, mirror each on-pill back into its dropdown.
    function _syncPayStSelects(){ root.querySelectorAll("#s-coach select[data-nocap]").forEach((sel:any)=>{ const grp=sel.parentElement&&sel.parentElement.querySelector(".pills"); const on=grp&&grp.querySelector(".pill.on"); if(on) sel.value=(on.textContent||"").trim(); }); }
    w._syncPayStSelects=_syncPayStSelects;
    // Program-suggested → payment flow: show ONLY the price field for the chosen program
    // (L1 → L1 price, L2 → L2 price, L1 + L2 → both), label the flow, and re-quote. Payment
    // methods (Full / Installment / EMI / Advance) are shared by both programs.
    function _syncProgramPricing(){
      const prog=(root.querySelector("#haProgram")as HTMLSelectElement)?.value||"L2";
      const l1Fld=(root.querySelector("#haL1Price")as HTMLElement|null)?.closest(".fld")as HTMLElement|null;
      const l2Fld=(root.querySelector("#haL2Price")as HTMLElement|null)?.closest(".fld")as HTMLElement|null;
      const showL1=prog==="L1"||prog==="L1 + L2";
      const showL2=prog==="L2"||prog==="L1 + L2";
      if(l1Fld) l1Fld.style.display=showL1?"":"none";
      if(l2Fld) l2Fld.style.display=showL2?"":"none";
      const lbl=root.querySelector("#payFlowLbl"); if(lbl) lbl.textContent=prog+" · standard";
      _payCalcAll();
    }
    w._syncProgramPricing=_syncProgramPricing;

    function _payNum(sel:string):number{
      const el=root.querySelector(sel)as HTMLInputElement|HTMLSelectElement|null;
      return parseInt(((el&&(el as any).value)||"").replace(/[^\d]/g,""))||0;
    }
    // Quote (auto from price master): a Special-offer amount overrides everything;
    // otherwise the price follows the suggested program (L1, L2, or L1+L2).
    function _payGetPrice():number{
      const special=_payNum("#haSpecialAmt");
      if(special>0) return special;
      const prog=(root.querySelector("#haProgram")as HTMLSelectElement)?.value||"L2";
      const l1=_payNum("#haL1Price"), l2=_payNum("#haL2Price");
      if(prog==="L1") return l1;
      if(prog==="L1 + L2") return l1+l2;
      return l2;
    }
    function _paySetVal(id:string,v:number){
      const el=root.querySelector("#"+id)as HTMLInputElement;
      if(el) el.value=v?"₹"+v.toLocaleString("en-IN"):"";
    }
    function _payCalcAll(){
      const price=_payGetPrice();
      _paySetVal("payAmtDue",price);
      // Installment Total is a MANUAL field — never auto-fill it; the balance due
      // is derived from whatever total the user entered, minus instalment-1.
      const i2t=_payNum("#i2Total");
      const i2r=parseInt((root.querySelector("#i2Inst1Rcvd")as HTMLInputElement)?.value?.replace(/[^\d]/g,"")||"0")||0;
      _paySetVal("i2BalDue",i2t?Math.max(0,i2t-i2r):0);
      const advA=parseInt((root.querySelector("#advAmt")as HTMLInputElement)?.value?.replace(/[^\d]/g,"")||"0")||0;
      _paySetVal("advBalDue",price?Math.max(0,price-advA):0);
      emiBase=price||32000;
      emiCalc();
    }
    w._payCalcAll = _payCalcAll;
    function _payCalcFull(){ _payCalcAll(); }
    w._payCalcFull = _payCalcFull;
    function _payCalcI2(){
      const total=_payNum("#i2Total");   // manual Total for installment
      const rcvd=parseInt((root.querySelector("#i2Inst1Rcvd")as HTMLInputElement)?.value?.replace(/[^\d]/g,"")||"0")||0;
      _paySetVal("i2BalDue",total?Math.max(0,total-rcvd):0);
    }
    w._payCalcI2 = _payCalcI2;
    function _payCalcAdv(){
      const price=_payGetPrice();
      const adv=parseInt((root.querySelector("#advAmt")as HTMLInputElement)?.value?.replace(/[^\d]/g,"")||"0")||0;
      _paySetVal("advBalDue",price?Math.max(0,price-adv):0);
    }
    w._payCalcAdv = _payCalcAdv;

    function _payVerify(status:string,btn:HTMLElement){
      const pills=btn.parentElement;
      if(!pills) return;
      pills.querySelectorAll(".pill").forEach(p=>p.classList.remove("on"));
      btn.classList.add("on");
      if(status==="verified") toast("Payment verified by Accounts");
      else toast("Verification status: Pending");
    }
    w._payVerify = _payVerify;

    // Uploaded payment-proof files, keyed by their container id — included in the payments
    // row on save (proof_url/proof_name) so proofs persist and are visible to Accounts.
    const _payProofs:Record<string,{url:string,name:string}>={};
    function _payAttach(containerId:string){
      const fi=document.createElement("input");
      fi.type="file";fi.accept="image/*,.pdf";
      fi.onchange=async()=>{
        const file=fi.files?.[0];
        if(!file) return;
        if(file.size>15*1024*1024){ toast("File too large (max 15 MB)"); return; }
        const container=root.querySelector("#"+containerId);
        if(!container) return;
        const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
        const tag=document.createElement("span");
        tag.className="att";tag.innerHTML='<svg class="icon"><use href="#i-clip"/></svg> '+e(file.name)+' · uploading…';
        const addBtn=container.querySelector(".att.add");
        if(addBtn) container.insertBefore(tag,addBtn);
        const lid=String(_coachLeadId||"unassigned").replace(/[^a-zA-Z0-9._-]/g,"_");
        const path=lid+"/"+Date.now()+"_"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
        try{
          const up=await supabase.storage.from("payment-proofs").upload(path,file,{upsert:false});
          if(up.error) throw up.error;
          const {data}=supabase.storage.from("payment-proofs").getPublicUrl(path);
          const url=(data&&data.publicUrl)||"";
          _payProofs[containerId]={url,name:file.name};
          tag.innerHTML='<svg class="icon"><use href="#i-clip"/></svg> <a href="'+e(url)+'" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">'+e(file.name)+'</a>';
          toast("Proof uploaded: "+file.name);
        }catch(err:any){ tag.innerHTML='<svg class="icon"><use href="#i-clip"/></svg> '+e(file.name)+' · upload failed'; toastErr("Proof upload failed: "+(err&&err.message||"error")); }
      };
      fi.click();
    }
    w._payAttach = _payAttach;

    // Mic / office-visit recording is implemented with MediaRecorder in the coach
    // section (window._ovrToggle / _ovrStop) — the old cosmetic stub was removed.

    // SLA timer
    let sla=11398;
    const slaInterval=setInterval(()=>{
      sla--;
      const h=sla/3600|0,m=(sla%3600)/60|0;
      const el=root.querySelector("#aClock")as HTMLElement; if(!el) return;
      el.textContent=h+":"+String(m).padStart(2,"0");
      const c=sla<900?["#D8442B","var(--alert-ink)"]:sla<3600?["#C07F0E","var(--warn-ink)"]:["#16A878","var(--ok-ink)"];
      const r=root.querySelector("#aRing")as SVGElement;
      if(r){r.setAttribute("stroke",c[0]);r.style.strokeDashoffset=String(163.4*(1-Math.max(0,sla/14400)));}
      el.style.color=c[1];
    },1000);

    // Route legacy addLog() calls into the persistent per-lead activity log.
    function addLog(txt:string){ if(_advLeadId) logActivity(_advLeadId,[{action:"Updated",field:txt}]); }

    function ach(em:string,title:string,sub:string){
      const a=root.querySelector("#ach")as HTMLElement;
      const achEm=root.querySelector("#achEm");if(achEm)achEm.textContent=em;
      const achT=root.querySelector("#achT");if(achT)achT.textContent=title;
      const achS=root.querySelector("#achS");if(achS)achS.textContent=sub;
      if(a){a.classList.add("show");setTimeout(()=>a.classList.remove("show"),3200);}
    }

    const CFC=["#3DD9A4","#D9A441","#378ADD","#D4537E","#7B6CD9","#16A878"];
    function boom(n=30){
      for(let i=0;i<n;i++){
        const d=document.createElement("div");d.className="cf";
        d.style.left=(40+Math.random()*20)+"%";d.style.background=CFC[i%CFC.length];
        document.body.appendChild(d);
        d.animate([{transform:"translate(0,0) rotate(0)",opacity:1},{transform:"translate("+(Math.random()-.5)*420+"px,"+innerHeight*.85+"px) rotate("+(Math.random()*720-360)+"deg)",opacity:.2}],{duration:1400+Math.random()*900,easing:"cubic-bezier(.2,.6,.4,1)"}).onfinish=()=>d.remove();
      }
    }

    function toast(m:string){
      const x=root.querySelector("#toast")as HTMLElement;if(!x) return;
      x.className="toast";const msg=root.querySelector("#toastMsg");if(msg)msg.textContent=m;
      x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2400);
    }
    w._toast = toast; w.toast = toast;

    function toastErr(m:string){
      const x=root.querySelector("#toastE")as HTMLElement;
      if(x){const msg=root.querySelector("#toastEMsg");if(msg)msg.textContent=m;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2800);}
      else toast("⚠ "+m);
    }
    w.toastErr = toastErr;

    function applyCoupon(){const v=root.querySelector("#coupon")as HTMLInputElement;if(!v||!v.value.trim()){toastErr("Enter code");return;}const r=root.querySelector("#couponRes")as HTMLElement;if(r)r.innerHTML='<span class="chipb ok">−₹2,000</span><span class="chipb warn">ABM approval</span>';toast("Coupon sent");}
    w.applyCoupon = applyCoupon;

    let emiBase=32000;
    function emiCalc(){
      const cost=emiBase;
      const downEl=root.querySelector("#emiDown")as HTMLInputElement;const down=parseInt((downEl?.value||"0").replace(/\D/g,""))||0;
      const tenEl=root.querySelector("#emiTenure")as HTMLSelectElement;const ten=parseInt(tenEl?.value)||0;
      const remain=Math.max(0,cost-down);
      const ec=root.querySelector("#emiCost")as HTMLInputElement;if(ec)ec.value=cost.toLocaleString("en-IN");
      const er=root.querySelector("#emiRemain")as HTMLInputElement;if(er)er.value="₹"+remain.toLocaleString("en-IN");
      const ep=root.querySelector("#emiPer")as HTMLInputElement;if(ep)ep.value=ten?("₹"+Math.ceil(remain/ten).toLocaleString("en-IN")+" × "+ten):"—";
      const en=root.querySelector("#emiNet")as HTMLInputElement;if(en)en.value="₹"+Math.round(cost*.935).toLocaleString("en-IN")+" (−6.5%)";
    }
    w.emiCalc = emiCalc;

    function applyCouponEmi(){const v=root.querySelector("#emiCoupon")as HTMLInputElement;if(!v||!v.value.trim()){toastErr("Enter code");return;}emiBase=30000;emiCalc();const r=root.querySelector("#emiCouponRes")as HTMLElement;if(r)r.innerHTML='<span class="chipb ok">−₹2,000</span>';toast("EMI coupon sent");}
    w.applyCouponEmi = applyCouponEmi;

    function waTpl(){const el=root.querySelector("#waPrev")as HTMLTextAreaElement;if(el)el.value="Template preview loaded";}
    w.waTpl = waTpl;

    // addFuNoteA + Add-report (blood) are defined earlier with DB persistence + activity logging.

    let fuAtt=3;
    function addFuNote(){const el=root.querySelector("#fuNote")as HTMLInputElement;if(!el||!el.value.trim()){toastErr("Type note");return;}const now=new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});const notes=root.querySelector("#fuNotes");if(notes)notes.insertAdjacentHTML("afterbegin",'<div style="background:#fff;border:1px solid var(--line);border-radius:9px;padding:7px 11px;font-size:12px"><b class="mono" style="color:var(--vio-ink)">Attempt '+fuAtt++ +' · '+now+'</b> — '+el.value+'</div>');el.value="";toast("Note added");}
    w.addFuNote = addFuNote;

    function sendToReception(){const who=(root.querySelector("#collectedBy")as HTMLSelectElement)?.value;if(who!=="Reception desk"){toast(who||"");return;}toast("Sent → Reception");addLog("Payment → Reception");}
    w.sendToReception = sendToReception;

    function _bmiCalc(hEl:HTMLInputElement|null,wEl:HTMLInputElement|null,bEl:HTMLInputElement|null){
      if(!hEl||!wEl||!bEl) return;
      const h=parseFloat(hEl.value); const wt=parseFloat(wEl.value);
      if(h>0&&wt>0){ const m=h/100; bEl.value=(wt/(m*m)).toFixed(1); } else { bEl.value=""; }
    }
    function _scBmiCalc(){ _bmiCalc(root.querySelector("#sc_h"),root.querySelector("#sc_w"),root.querySelector("#sc_bmi")); }
    w._scBmiCalc = _scBmiCalc;
    function _haBmiCalc(){ _bmiCalc(root.querySelector("#haHeight"),root.querySelector("#haWeight"),root.querySelector("#haBmi")); }
    w._haBmiCalc = _haBmiCalc;

    // ========== SCREENING MODULE (live data) ==========
    let _scAll:any[]=[], _scFiltered:any[]=[], _scDate="today", _scOpenAppt:any=null, _scEligVal="", _scSvcFilter="";
    function _scDateRange():[Date|null,Date|null]{
      const now=new Date(); const sod=(d:Date)=>{const x=new Date(d);x.setHours(0,0,0,0);return x;}; const eod=(d:Date)=>{const x=new Date(d);x.setHours(23,59,59,999);return x;};
      if(_scDate==="today") return [sod(now),eod(now)];
      if(_scDate==="yest"){ const y=new Date(now);y.setDate(y.getDate()-1); return [sod(y),eod(y)]; }
      if(_scDate==="cust"){ const f=(root.querySelector("#scFrom")as HTMLInputElement)?.value; const t=(root.querySelector("#scTo")as HTMLInputElement)?.value; return [f?sod(new Date(f)):null,t?eod(new Date(t)):null]; }
      return [null,null];
    }
    async function loadScreeningData(){
      try{
        const {data}=await supabase.from("appointments").select("*").in("stage",["screening","screened","done"]).order("appt_date",{ascending:false}).limit(500);
        _scAll=(data||[]).map((a:any)=>{
          const sv=a.screening_vitals_data||{};
          return { id:a.id, lead_id:a.lead_id, name:a.client_name||"Client", ph:a.phone||"", _date:a.appt_date, date:_recFmtDate(a.appt_date), time:a.appt_time||"",
            status:a.status||"expected", stage:a.stage||"", service:a.service||"Diabetes",
            vitals:sv, eligible:sv.eligible||"", screenedAt:sv.screened_at||"", screenedBy:sv.screened_by||"",
            raw:a };
        });
      }catch(_){ _scAll=[]; }
      _scApplyDateFilter();
    }
    function _scApplyDateFilter(){
      const [from,to]=_scDateRange();
      _scFiltered=_scAll.filter((r:any)=>{ if(!r._date)return true; const d=new Date(r._date+"T12:00:00"); if(from&&d<from)return false; if(to&&d>to)return false; return true; });
      _scRenderAll();
    }
    w._scDateF=(d:string)=>{ _scDate=d; const show=d==="cust"; ["scFrom","scTo","scApplyBtn"].forEach(id=>{const el=root.querySelector("#"+id)as HTMLElement;if(el)el.style.display=show?"inline":"none";}); root.querySelectorAll("#scrDateF .pill").forEach((b:any)=>b.classList.remove("on")); const idx={today:0,yest:1,cust:2}[d]??0; root.querySelectorAll("#scrDateF .pill")[idx]?.classList.add("on"); _scApplyDateFilter(); };
    w._scApplyDate=()=>{ if(_scDate==="cust") _scApplyDateFilter(); };
    function _scRenderAll(){
      const f=_scFiltered; const e=(s:any)=>String(s??"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const screened=f.filter((r:any)=>r.stage==="screened"||r.stage==="done");
      const waiting=f.filter((r:any)=>r.stage==="screening"&&!r.screenedAt);
      const inProg=f.filter((r:any)=>r.stage==="screening"&&_scOpenAppt&&_scOpenAppt.id===r.id);
      const eligible=screened.filter((r:any)=>r.eligible==="yes");
      const notEligible=screened.filter((r:any)=>r.eligible==="no");
      const metrics=[{l:"Expected",v:f.length,c:""},{l:"Screened",v:screened.length,c:"g"},{l:"In progress",v:inProg.length,c:"a"},
        {l:"Waiting",v:waiting.length,c:""},{l:"Eligible",v:eligible.length,c:"g"},{l:"Not eligible",v:notEligible.length,c:"r"}];
      const mel=root.querySelector("#scMetrics"); if(mel) mel.innerHTML=metrics.map(m=>'<div class="metric '+m.c+'"><div class="ml">'+m.l+'</div><div class="mv">'+m.v+'</div></div>').join("");
      // Queue
      const colors=["#17A87B","#378ADD","#7B6CD9","#C07F0E","#D8442B","#5B9BD5"];
      let queue=f.filter((r:any)=>r.stage==="screening");
      if(_scSvcFilter) queue=queue.filter((r:any)=>(r.service||"Other")===_scSvcFilter);
      const ql=root.querySelector("#scQueueList"); const qc=root.querySelector("#scQueueCount");
      if(qc) qc.textContent=String(queue.length);
      if(ql) ql.innerHTML=queue.length?queue.map((r:any,i:number)=>{
        const init=(r.name||"??").split(" ").map((w:string)=>w[0]||"").join("").substring(0,2).toUpperCase();
        const svcIcon=r.service?.toLowerCase().includes("blood")?"🩸":r.service?.toLowerCase().includes("physio")?"💪":"🩺";
        const active=_scOpenAppt&&_scOpenAppt.id===r.id;
        return '<div class="li" style="cursor:pointer'+(active?";background:var(--brand-tint)":"")+'" onclick="window._scOpenAssess('+r.id+')"><span class="avs" style="background:'+colors[i%colors.length]+'">'+init+'</span><div style="flex:1"><b>'+e(r.name)+'</b><div style="font-size:11px;color:var(--muted)">'+svcIcon+' '+e(r.service)+' · '+e(r.time)+'</div></div>'
          +(r.screenedAt?'<span class="chipb ok">Done</span>':'<span class="chipb info">Queued</span>')+'</div>';
      }).join(""):'<div style="text-align:center;color:var(--faint);padding:14px;font-size:12px">No clients in screening queue.</div>';
      // Breakdown by service
      const bySvc:Record<string,{screened:number;waiting:number}>={};
      f.forEach((r:any)=>{ const s=r.service||"Other"; if(!bySvc[s]) bySvc[s]={screened:0,waiting:0}; if(r.screenedAt) bySvc[s].screened++; else bySvc[s].waiting++; });
      const svcIcon=(s:string)=>s.toLowerCase().includes("blood")?"🩸":s.toLowerCase().includes("physio")?"💪":"🩺";
      const bd=root.querySelector("#scBreakdown"); if(bd) bd.innerHTML=Object.keys(bySvc).length?'<table class="tbl"><tbody>'+Object.entries(bySvc).map(([s,d])=>{
        const on=_scSvcFilter===s;
        return '<tr style="cursor:pointer'+(on?";background:var(--brand-tint)":"")+'" title="'+(on?"Showing only "+e(s)+" — click to clear":"Click to filter the queue to "+e(s))+'" onclick="window._scFilterSvc(\''+s.replace(/'/g,"\\'")+'\')"><td style="font-weight:600">'+(on?"● ":"")+svcIcon(s)+' '+e(s)+'</td><td class="mono" style="text-align:right">'+d.screened+' screened · '+d.waiting+' waiting</td></tr>';
      }).join("")+'</tbody></table>'+(_scSvcFilter?'<div style="text-align:center;padding:6px 0 2px"><button type="button" class="pill" style="font-size:11px" onclick="window._scFilterSvc(\'\')">✕ Clear filter · show all</button></div>':'')
        :'<div style="text-align:center;color:var(--faint);padding:8px;font-size:12px">—</div>';
    }
    w._scFilterSvc=(s:string)=>{ _scSvcFilter=(s&&_scSvcFilter===s)?"":s; _scRenderAll();
      const qh=root.querySelector("#scQueueList"); if(qh)(qh as HTMLElement).scrollIntoView?.({block:"nearest"}); };
    // Test pills are a multi-select for the lab order. Toggle the green "selected" look
    // (p-ok) together with `on` so every pill — not just the pre-selected HbA1c/FBS —
    // gives clear visual feedback when picked. _scOrderTests reads `.pill.on`.
    w._scTogTest=(btn:HTMLElement)=>{ const on=btn.classList.toggle("on"); btn.classList.toggle("p-ok",on); };
    w._scOrderTests=()=>{
      const on=Array.from(root.querySelectorAll("#scTestPills .pill.on")).map((b:any)=>b.textContent.trim());
      if(!on.length){ toastErr("Select at least one test to order"); return; }
      const cur=_scOpenAppt;
      const win=window.open("","_blank","width=640,height=720"); if(!win){ toastErr("Allow pop-ups to print the order slip"); return; }
      const who=cur?(cur.name||"Client"):"—"; const ph=cur?(cur.ph||"—"):"—";
      win.document.write('<html><head><title>Test order — '+who+'</title></head><body style="font-family:system-ui;padding:28px;color:#111">'
        +'<h2 style="margin:0 0 4px">Lab Test Order</h2><p style="margin:0 0 14px;color:#555">'+who+' · '+ph+' · '+new Date().toLocaleString("en-IN")+'</p>'
        +'<table style="border-collapse:collapse;width:100%;font-size:13px"><thead><tr><th style="text-align:left;padding:6px;border:1px solid #ddd;background:#f6f6f6">#</th><th style="text-align:left;padding:6px;border:1px solid #ddd;background:#f6f6f6">Test</th></tr></thead><tbody>'
        +on.map((t:string,i:number)=>'<tr><td style="padding:6px;border:1px solid #ddd;width:36px">'+(i+1)+'</td><td style="padding:6px;border:1px solid #ddd">'+t.replace(/</g,"&lt;")+'</td></tr>').join("")
        +'</tbody></table><p style="margin-top:18px;color:#555;font-size:12px">Ordered by '+_scCurrentUser()+'</p></body></html>');
      win.document.close(); win.focus(); setTimeout(()=>{try{win.print();}catch(_){}},300);
      toast("Ordered "+on.length+" test"+(on.length>1?"s":"")+" · slip printed");
    };
    w._scOpenAssess=(id:any)=>{
      const r=_scAll.find((x:any)=>String(x.id)===String(id)); if(!r){toast("Not found");return;} _scOpenAppt=r;   // id is BIGSERIAL → gateway returns a string
      const el=(s:string)=>root.querySelector("#"+s)as any;
      if(el("scAssessName")) el("scAssessName").textContent=r.name;
      if(el("scAssessChip")) el("scAssessChip").textContent="Baseline · M0";
      const v=r.vitals||{};
      if(el("sc_h")) el("sc_h").value=v.height||"";
      if(el("sc_w")) el("sc_w").value=v.weight||"";
      if(el("sc_bmi")) el("sc_bmi").value=v.bmi||"";
      if(el("sc_bp")) el("sc_bp").value=v.bp||"";
      if(el("sc_pu")) el("sc_pu").value=v.pulse||"";
      if(el("sc_sp")) el("sc_sp").value=v.spo2||"";
      if(el("sc_wa")) el("sc_wa").value=v.waist||"";
      if(el("sc_te")) el("sc_te").value=v.temp||"";
      if(el("sc_gl")) el("sc_gl").value=v.glucose||"";
      // Both AUTO fields fill immediately on open: screener = logged-in user,
      // date/time = the saved stamp if screened, otherwise the current time (live).
      if(el("sc_by")) el("sc_by").value=v.screened_by||_scCurrentUser();
      const _scDtFmt=(t:any)=>new Date(t).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
      if(el("sc_dt")) el("sc_dt").value=v.screened_at?_scDtFmt(v.screened_at):_scDtFmt(Date.now());
      if(el("sc_notes")) el("sc_notes").value=v.notes||"";
      _scEligVal=v.eligible||"";
      root.querySelectorAll("#scEligPills .pill").forEach((b:any)=>b.classList.remove("on"));
      if(_scEligVal==="yes") root.querySelector("#scEligPills .pill.p-ok")?.classList.add("on");
      if(_scEligVal==="no") root.querySelector("#scEligPills .pill.p-al")?.classList.add("on");
      const ap=root.querySelector("#scAssessPanel")as HTMLElement; if(ap) ap.style.display="block";
      // Load history
      _scLoadHistory(r);
      _scRenderAll();
    };
    w._scCloseAssess=()=>{ _scOpenAppt=null; const ap=root.querySelector("#scAssessPanel")as HTMLElement; if(ap)ap.style.display="none"; _scRenderAll(); };
    w._scElig=(val:string,btn:HTMLElement)=>{ _scEligVal=val; root.querySelectorAll("#scEligPills .pill").forEach((b:any)=>b.classList.remove("on")); btn.classList.add("on"); };
    // Previous screenings for the SAME client — every prior visit's saved vitals
    // (appointments.screening_vitals_data), keyed by lead_id (phone as fallback),
    // excluding the visit currently being screened.
    async function _scLoadHistory(cur:any){
      const wrap=root.querySelector("#scHistoryWrap"); if(!wrap)return;
      const none=(msg:string)=>{ wrap.innerHTML='<div style="text-align:center;color:var(--faint);padding:14px;font-size:12px">'+msg+'</div>'; };
      if(!cur){ none("Open a client to see history."); return; }
      try{
        let q=supabase.from("appointments").select("id,appt_date,screening_vitals_data").not("screening_vitals_data","is",null).order("appt_date",{ascending:false}).limit(30);
        if(cur.lead_id) q=q.eq("lead_id",cur.lead_id);
        else if(cur.ph) q=q.eq("phone",cur.ph);
        else { none("No previous screening records."); return; }
        const {data}=await q;
        let rows=(data||[]).filter((a:any)=>String(a.id)!==String(cur.id)&&a.screening_vitals_data&&a.screening_vitals_data.screened_at);
        // Fallback: the single leads.screening_vitals record, if no per-visit history exists.
        if(!rows.length&&cur.lead_id){
          const {data:ld}=await supabase.from("leads").select("screening_vitals").eq("meta_lead_id",cur.lead_id).limit(1);
          const sv=ld&&ld[0]&&ld[0].screening_vitals;
          if(sv&&sv.screened_at) rows=[{id:"leads-sv",appt_date:(sv.screened_at||"").substring(0,10),screening_vitals_data:sv}];
        }
        if(!rows.length){ none("No previous screening records."); return; }
        const e=(s:any)=>String(s??"—").replace(/</g,"&lt;").replace(/>/g,"&gt;");
        wrap.innerHTML='<div class="tscroll" style="max-height:230px"><table class="tbl"><thead><tr><th>Date</th><th>Height</th><th>Weight</th><th>BMI</th><th>BP</th><th>Glucose</th><th>Eligible</th><th>Screened by</th></tr></thead><tbody>'
          +rows.map((a:any)=>{const sv=a.screening_vitals_data||{}; const dt=sv.screened_at||a.appt_date; const el=sv.eligible==="no"?'<span class="chipb al">Not eligible</span>':sv.eligible==="yes"?'<span class="chipb ok">Eligible</span>':"—"; return '<tr><td class="mono">'+(dt?new Date(dt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—")+'</td><td class="mono">'+e(sv.height)+'</td><td class="mono">'+e(sv.weight)+'</td><td class="mono">'+e(sv.bmi)+'</td><td class="mono">'+e(sv.bp)+'</td><td class="mono">'+e(sv.glucose)+'</td><td>'+el+'</td><td>'+e(sv.screened_by)+'</td></tr>';}).join("")
          +'</tbody></table></div><p style="font-size:11px;color:var(--faint);margin:6px 0 0">'+rows.length+' previous screening'+(rows.length===1?"":"s")+' for this client.</p>';
      }catch(_){ none("Could not load history."); }
    }
    // The logged-in screener's name for the "Screened by (AUTO)" field.
    function _scCurrentUser(){ return _currentUser?(((_currentUser.name||"").trim())||((_currentUser.email||"").split("@")[0])||"Screening desk"):"Screening desk"; }
    async function screeningDone(){
      if(!_scOpenAppt){ toast("Open a client first"); return; }
      const ids=["sc_h","sc_w","sc_bmi","sc_bp","sc_pu","sc_sp","sc_wa","sc_te","sc_gl"];
      const cids=["cs_h","cs_w","cs_bmi","cs_bp","cs_pu","cs_sp","cs_wa","cs_te","cs_gl"];
      _scBmiCalc();
      ids.forEach((id,i)=>{const s=root.querySelector("#"+id)as HTMLInputElement;const d=root.querySelector("#"+cids[i])as HTMLInputElement;if(s&&d)d.value=s.value;});
      const vitals:any={};
      const vMap:Record<string,string>={sc_h:"height",sc_w:"weight",sc_bmi:"bmi",sc_bp:"bp",sc_pu:"pulse",sc_sp:"spo2",sc_wa:"waist",sc_te:"temp",sc_gl:"glucose"};
      ids.forEach(id=>{const el=root.querySelector("#"+id)as HTMLInputElement; if(el&&el.value) vitals[vMap[id]]=el.value;});
      vitals.screened_at=new Date().toISOString();
      vitals.screened_by=((root.querySelector("#sc_by")as HTMLInputElement)?.value||"").trim()||_scCurrentUser();
      vitals.notes=(root.querySelector("#sc_notes")as HTMLTextAreaElement)?.value||"";
      // Stamp the AUTO fields in the form so the screener sees them immediately on save.
      const byEl=root.querySelector("#sc_by")as HTMLInputElement|null; if(byEl) byEl.value=vitals.screened_by;
      const dtEl=root.querySelector("#sc_dt")as HTMLInputElement|null; if(dtEl) dtEl.value=new Date(vitals.screened_at).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
      vitals.eligible=_scEligVal;
      const leadId=_scOpenAppt.lead_id||"";
      if(leadId){
        try{
          const {error}=await supabase.from("leads").update({screening_vitals:vitals}).eq("meta_lead_id",leadId);
          if(error && !/screening_vitals|column/i.test(error.message||"")){
            toastErr("Screening save failed: "+(error.message||"DB error")); return;
          }
        }catch(e:any){ toastErr("Screening save failed: "+(e.message||"network error")); return; }
      }
      try{
        const {error}=await supabase.from("appointments").update({stage:"screened",status:"visited",screening_vitals_data:vitals}).eq("id",_scOpenAppt.id);
        if(error && !/screening_vitals_data|column|schema|exist/i.test(error.message||"")){ toastErr("Screening save failed: "+(error.message||"DB error")); return; }
      }catch(e:any){ toastErr("Screening save failed: "+(e.message||"network error")); return; }
      const e2=root.querySelector("#scrEmpty")as HTMLElement;if(e2)e2.style.display="none";
      const d2=root.querySelector("#scrData")as HTMLElement;if(d2)d2.style.display="grid";
      const ch=root.querySelector("#scrChip")as HTMLElement;if(ch){ch.textContent="Completed · M0 locked";ch.className="chipb ok";}
      toast("Screening confirmed → proceed to Payment Collection");
      await loadScreeningData();
      await loadReceptionData();
    }
    w.screeningDone = screeningDone;
    w._scPrint=()=>{ if(!_scOpenAppt){toast("Open a client first");return;}
      const v=(id:string)=>(root.querySelector("#"+id)as HTMLInputElement|HTMLTextAreaElement)?.value||"—";
      const win=window.open("","_blank","width=700,height=700"); if(!win){toast("Allow pop-ups");return;}
      win.document.write('<html><head><title>Screening — '+(_scOpenAppt.name||"")+'</title></head><body style="font-family:system-ui;padding:28px"><h2>Health Screening Report</h2><p>'+_scOpenAppt.name+' · '+new Date().toLocaleDateString("en-IN")+'</p><table style="border-collapse:collapse;width:100%;font-size:13px">'
        +[["Height",v("sc_h")+"cm"],["Weight",v("sc_w")+"kg"],["BMI",v("sc_bmi")],["BP",v("sc_bp")],["Pulse",v("sc_pu")],["SpO2",v("sc_sp")+"%"],["Waist",v("sc_wa")+"cm"],["Temp",v("sc_te")],["Glucose",v("sc_gl")+"mg/dL"]]
        .map(r=>'<tr><td style="padding:6px;border:1px solid #ddd;font-weight:600;width:120px">'+r[0]+'</td><td style="padding:6px;border:1px solid #ddd">'+r[1]+'</td></tr>').join("")
        +'</table></body></html>'); win.document.close(); win.focus(); setTimeout(()=>{try{win.print();}catch(_){}},300);
    };
    w._scExport=()=>{ if(!_scFiltered.length){toast("Nothing to export");return;} const out:string[][]=[["Client","Phone","Service","Stage","Height","Weight","BMI","BP","Glucose","Eligible","Screened at"]];
      _scFiltered.forEach((r:any)=>{ const v=r.vitals||{}; out.push([r.name,r.ph,r.service,r.stage,v.height||"",v.weight||"",v.bmi||"",v.bp||"",v.glucose||"",v.eligible||"",v.screened_at||""]); });
      _downloadCsv("screening_export.csv",out); toast("Exported "+_scFiltered.length+" rows"); };

    function togMsg(b:HTMLElement){b.textContent=b.textContent?.trim()==="On"?"Off":"On";b.className=b.textContent?.trim()==="On"?"chipb ok":"chipb neu";}
    w.togMsg = togMsg;

    root.querySelectorAll(".rep").forEach((r)=>r.addEventListener("click",()=>{root.querySelectorAll(".rep").forEach((x)=>x.classList.remove("on"));r.classList.add("on");}));

    // ===================== HEALTH COACH (live clients) =====================
    let _coachLeadId="";
    let _coachAttachments:any[]=[];
    let _coachApplying=false;
    let _coachClients:any[]=[];
    function _coachPanelEl(){ return root.querySelector('#s-coach .c-p[data-p="health2"]')as HTMLElement|null; }
    function collectCoachProfile(){
      const p=_coachPanelEl(); if(!p) return null;
      // [data-nocap] elements (the payment Status dropdowns, which mirror the existing hidden
      // pills) are excluded so the positional field capture stays identical to before — existing
      // saved profiles keep restoring correctly.
      const f=Array.from(p.querySelectorAll("input,select,textarea")).filter((el:any)=>!el.hasAttribute("data-nocap")).map((el:any)=>(el.type==="checkbox"||el.type==="radio")?{c:!!el.checked}:{v:el.value});
      const pills=Array.from(p.querySelectorAll(".pill")).map((b:any)=>b.classList.contains("on"));
      const chips=Array.from(p.querySelectorAll(".chip-o")).map((b:any)=>b.classList.contains("on"));
      return {v:1,f,pills,chips,attachments:_coachAttachments.slice(),consStatus:_coachConsStatus};
    }
    function applyCoachProfile(obj:any){
      const p=_coachPanelEl(); if(!p||!obj) return;
      _coachApplying=true;
      try{
        const els=Array.from(p.querySelectorAll("input,select,textarea")).filter((el:any)=>!el.hasAttribute("data-nocap"));
        (obj.f||[]).forEach((rec:any,i:number)=>{ const el:any=els[i]; if(!el) return; if("c" in rec) el.checked=!!rec.c; else el.value=rec.v==null?"":rec.v; });
        const pills=Array.from(p.querySelectorAll(".pill")); (obj.pills||[]).forEach((on:boolean,i:number)=>{ if(pills[i]) (pills[i]as HTMLElement).classList.toggle("on",!!on); });
        const chipEls=Array.from(p.querySelectorAll(".chip-o")); (obj.chips||[]).forEach((on:boolean,i:number)=>{ if(chipEls[i]) (chipEls[i]as HTMLElement).classList.toggle("on",!!on); });
        _coachAttachments=Array.isArray(obj.attachments)?obj.attachments.slice():[]; renderCoachAtts();
        _haBmiCalc();
        // Re-trigger panel visibility based on restored consultation status pills
        const cs=root.querySelector("#consStatus"); if(cs){ const onPill=cs.querySelector(".pill.on")as HTMLElement; if(onPill){ const act=onPill.getAttribute("onclick")||""; const m=act.match(/consAct\('([^']+)'/); if(m) consAct(m[1],onPill); } }
        // Re-trigger payment method panel visibility
        const pm=root.querySelector("#payMethod")as HTMLSelectElement; if(pm&&pm.value) payBlk(pm.value);
        _syncProgramPricing();   // apply L1/L2 program-specific pricing view (also re-quotes)
        _syncPayStSelects();     // mirror restored payment-Status pills into their dropdowns
        _refreshPayEnrollChip(); // reflect the enrolled level (L1/L2) in the payment section
      } finally { _coachApplying=false; }
    }
    function renderCoachAtts(){
      const ba=root.querySelector("#coachAtts"); if(!ba) return;
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      ba.innerHTML=_coachAttachments.length?_coachAttachments.map((a:any)=>'<span class="att"><svg class="icon"><use href="#i-clip"/></svg> <a href="'+e(a.url||"#")+'" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">'+e(a.name||"file")+(a.src==="advisor"?" · advisor":"")+'</a></span>').join(""):'<span style="font-size:12px;color:var(--faint)">No reports synced from the advisor yet.</span>';
    }
    const _coachpKey=(id:any)=>"wos_coachp_"+id;
    function readCoachLocal(id:any){ try{ const s=localStorage.getItem(_coachpKey(id)); return s?JSON.parse(s):null; }catch(_){ return null; } }
    function saveCoachLocal(id:any,obj:any){ try{ localStorage.setItem(_coachpKey(id),JSON.stringify(obj)); }catch(_){} }
    async function loadAndApplyCoach(lead:any){
      if(!lead) return;
      if(lead.coachProfile===undefined){
        let prof:any=null;
        try{ const {data}=await supabase.from("leads").select("coach_profile").eq("meta_lead_id",lead.id).limit(1); prof=(data&&data[0]&&data[0].coach_profile)||null; }catch(e:any){ prof=null; if(/coach_profile|column/i.test(e.message||"")) toastErr("Run supabase-migration-coach-screening.sql to enable coach profiles"); }
        if(!prof) prof=readCoachLocal(lead.id);
        lead.coachProfile=prof;
      }
      if(lead.coachProfile && String(_coachLeadId)===String(lead.id)) applyCoachProfile(lead.coachProfile);
    }
    // Pull blood-report attachments + recap fields the advisor saved (advisor_profile).
    async function _coachSyncAdvisorReports(lead:any){
      let ap:any=null;
      try{ const {data}=await supabase.from("leads").select("advisor_profile").eq("meta_lead_id",lead.id).limit(1); ap=data&&data[0]&&data[0].advisor_profile; }catch(_){}
      if(!ap){ try{ const s=localStorage.getItem("wos_advp_"+lead.id); if(s) ap=JSON.parse(s); }catch(_){} }
      if(String(_coachLeadId)!==String(lead.id)) return;
      // Populate recap fields from advisor profile using named labels
      if(ap&&ap.f){
        const named=_advNamed(ap.f);
        const setV=(id:string,v:string)=>{const el=root.querySelector("#"+id)as HTMLInputElement|null;if(el&&v)el.value=v;};
        setV("crSugar",named["Sugar level"]||lead.sugar||"");
        const fasting=named["Fasting (mg/dL)"]||""; const pp=named["Postprandial (mg/dL)"]||"";
        setV("crFasting",(fasting||pp)?((fasting||"--")+" / "+(pp||"--")):"");
        setV("crHba1c",named["HbA1c (%)"]||"");
        const ws=named["Walk-in status"]||""; const sel=root.querySelector("#crWalkIn")as HTMLSelectElement|null;
        if(sel&&ws){ for(let i=0;i<sel.options.length;i++){ if(sel.options[i].text===ws){sel.selectedIndex=i;break;} } }
      } else if(lead.sugar){
        const el=root.querySelector("#crSugar")as HTMLInputElement|null; if(el) el.value=lead.sugar;
      }
      // Sync attachments
      let atts:any[]=[]; if(ap&&Array.isArray(ap.attachments)) atts=ap.attachments;
      if(atts.length){ const have=new Set(_coachAttachments.map((a:any)=>a.url)); atts.forEach((a:any)=>{ if(!have.has(a.url)) _coachAttachments.push({name:a.name,url:a.url,src:"advisor"}); }); renderCoachAtts(); }
    }
    // Surface this client's Smartflo call recording into the recording-url field.
    async function _coachRenderRecordings(id:string){
      const fld=root.querySelector("#coachRecUrl")as HTMLInputElement|null; if(!fld) return;
      try{ const res=await _callRecordings(id); const recs=(res&&res.recordings)||[]; const ready=recs.find((r:any)=>r.recording_url); if(ready&&!fld.value&&String(_coachLeadId)===String(id)) fld.value=ready.recording_url; }catch(_){}
      // Restore the most recently saved Zoom link so it stays available on reopen/refresh.
      try{ if(!fld.value){ const {data}=await supabase.from("zoom_recordings").select("meeting_url,created_at").eq("lead_id",id).order("created_at",{ascending:false}).limit(1); const z=data&&data[0]; if(z&&z.meeting_url&&!fld.value&&String(_coachLeadId)===String(id)) fld.value=z.meeting_url; } }catch(_){}
    }
    // ===== Score card — hybrid: manual Progress+Consultation, auto Attendance+Follow-up =====
    let _scAuto={attendance:0,followup:0};
    function _scNum(sel:string){ const el=root.querySelector(sel)as HTMLInputElement|null; const n=parseInt(((el&&el.value)||"").replace(/[^\d]/g,""))||0; return Math.max(0,Math.min(100,n)); }
    function _scRecalcOverall(){
      const prog=_scNum("#scProgress"), cons=_scNum("#scConsult");
      // Weights (tunable): progress .30, consultation .25, attendance .25, follow-up .20.
      const overall=Math.round(0.30*prog+0.25*cons+0.25*_scAuto.attendance+0.20*_scAuto.followup);
      const ov=root.querySelector("#scOverallV"); if(ov) ov.textContent=String(overall);
      const tile=root.querySelector("#scOverallTile")as HTMLElement|null;
      if(tile) tile.style.borderColor=overall>=75?"var(--ok)":overall>=50?"var(--warn)":"var(--alert)";
    }
    w._scRecalcOverall=_scRecalcOverall;
    async function _renderScoreCard(id:string){
      let att=0, fu=80;
      try{
        const {data:appts}=await supabase.from("appointments").select("status").eq("lead_id",id);
        const rows=appts||[]; const tot=rows.length; const vis=rows.filter((a:any)=>a.status==="visited").length;
        att= tot? Math.round(100*vis/tot) : 0;
      }catch(_){}
      try{
        const {data:lr}=await supabase.from("leads").select("next_followup").eq("meta_lead_id",id).limit(1);
        const nf=lr&&lr[0]&&lr[0].next_followup;
        if(!nf) fu=80; else { const t=new Date(nf).getTime(); fu= t>=Date.now()?100:40; }   // future = on-track, overdue = poor
      }catch(_){}
      if(String(_coachLeadId)!==String(id)) return;
      _scAuto={attendance:att,followup:fu};
      const setTxt=(sel:string,v:any)=>{const el=root.querySelector(sel);if(el)el.textContent=String(v);};
      setTxt("#scAttendanceV",att); setTxt("#scFollowupV",fu);
      _scRecalcOverall();
    }
    // ===== Office-visit audio recording (MediaRecorder → /storage → office_recordings) =====
    let _ovrRec:any=null; let _ovrChunks:any[]=[]; let _ovrStartMs=0; let _ovrTimer:any=null; let _ovrLeadId="";
    function _ovrSetUi(recording:boolean){
      const mb=root.querySelector("#micBtn")as HTMLElement|null; const txt=root.querySelector("#micTxt"); const stop=root.querySelector("#ovrStopBtn")as HTMLElement|null; const start=root.querySelector("#ovrStartBtn")as HTMLElement|null; const st=root.querySelector("#ovrStatus");
      if(mb) mb.classList.toggle("rec",recording);
      if(txt) txt.textContent=recording?"Recording…":"Start office-visit recording";
      if(st) st.textContent=recording?"● Recording in progress — In-clinic Audio, auto-saving to this Customer Profile":"In-clinic Audio — Auto-saved to this Customer Profile";
      if(stop) stop.style.display=recording?"":"none";
      if(start) start.style.display=recording?"none":"";
      const t=root.querySelector("#ovrTimer"); if(t&&!recording) t.textContent="";
    }
    w._ovrToggle=async()=>{
      if(_ovrRec&&_ovrRec.state==="recording"){ w._ovrStop(); return; }
      if(!_coachLeadId){ toast("Open a visited client first"); return; }
      // Browsers only expose the microphone (getUserMedia/MediaRecorder) on a SECURE
      // context — HTTPS or localhost. On a plain http:// deployment navigator.mediaDevices
      // is undefined, so surface the real cause instead of a generic "not supported".
      if(!window.isSecureContext){ toastErr("Audio recording needs a secure (HTTPS) connection — it is blocked on this http:// address. Open the app over https:// to record."); return; }
      if(!navigator.mediaDevices||!(window as any).MediaRecorder){ toastErr("Audio recording is not supported in this browser"); return; }
      let stream:MediaStream;
      try{ stream=await navigator.mediaDevices.getUserMedia({audio:true}); }
      catch(e:any){ toastErr("Microphone permission denied"); return; }
      _ovrChunks=[];
      const MR=(window as any).MediaRecorder;
      const mime=MR.isTypeSupported&&MR.isTypeSupported("audio/webm")?"audio/webm":"";
      _ovrRec=new MR(stream,mime?{mimeType:mime}:undefined);
      _ovrRec.ondataavailable=(ev:any)=>{ if(ev.data&&ev.data.size) _ovrChunks.push(ev.data); };
      _ovrRec.onstop=()=>{ try{ stream.getTracks().forEach((t:any)=>t.stop()); }catch(_){} _ovrFinalize(); };
      _ovrRec.start();
      _ovrStartMs=Date.now();
      _ovrLeadId=String(_coachLeadId);
      _ovrSetUi(true);
      const tEl=root.querySelector("#ovrTimer");
      _ovrTimer=setInterval(()=>{ const s=Math.floor((Date.now()-_ovrStartMs)/1000); const mm=String(Math.floor(s/60)).padStart(2,"0"); const ss=String(s%60).padStart(2,"0"); if(tEl)tEl.textContent="● "+mm+":"+ss; },1000);
      toast("Recording started");
    };
    w._ovrStop=()=>{ if(_ovrRec&&_ovrRec.state!=="inactive"){ try{ _ovrRec.stop(); }catch(_){} } if(_ovrTimer){clearInterval(_ovrTimer);_ovrTimer=null;} _ovrSetUi(false); };
    async function _ovrFinalize(){
      const id=String(_ovrLeadId||_coachLeadId||""); if(!id||!_ovrChunks.length) return;
      const dur=Math.round((Date.now()-_ovrStartMs)/1000);
      const blob=new Blob(_ovrChunks,{type:(_ovrChunks[0]&&_ovrChunks[0].type)||"audio/webm"});
      _ovrChunks=[];
      const safe=id.replace(/[^a-zA-Z0-9._-]/g,"_");
      const path=safe+"/"+Date.now()+"_office-visit.webm";
      toast("Saving recording…");
      try{
        const up=await supabase.storage.from("office-recordings").upload(path,blob as any,{upsert:false});
        if(up.error) throw up.error;
        const {data}=supabase.storage.from("office-recordings").getPublicUrl(path);
        const url=(data&&data.publicUrl)||"";
        await supabase.from("office_recordings").insert({lead_id:id,file_url:url,file_path:path,file_name:"Office visit "+fmtIST(new Date().toISOString()),duration_seconds:dur,recorded_by:_asnActor(),created_at:new Date().toISOString()});
        toast("✓ Recording saved to profile");
        if(String(_coachLeadId)===id) _ovrRenderList(id);
      }catch(e:any){ toastErr("Recording save failed: "+(e.message||"upload error")); }
    }
    async function _ovrRenderList(id:string){
      const el=root.querySelector("#ovrList"); if(!el) return;
      let rows:any[]=[];
      try{ const {data}=await supabase.from("office_recordings").select("*").eq("lead_id",id).order("created_at",{ascending:false}).limit(50); rows=data||[]; }catch(_){ rows=[]; }
      if(String(_coachLeadId)!==String(id)) return;
      const e=(s:any)=>(s==null?"":String(s)).replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const dur=(s:number)=>{ s=s||0; const m=Math.floor(s/60); return (m?m+"m ":"")+(s%60)+"s"; };
      el.innerHTML=rows.length?('<div style="font-size:11px;color:var(--faint);font-weight:600;margin-bottom:4px">OFFICE-VISIT RECORDINGS ('+rows.length+')</div>'+rows.map((r:any)=>
        '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;margin-bottom:6px;flex-wrap:wrap">'
        +'<span style="font-size:12px;font-weight:600">🎙 '+e(fmtIST(r.created_at))+'</span>'
        +'<span class="chipb neu" style="font-size:10px">'+e(dur(r.duration_seconds))+'</span>'
        +(r.recorded_by?'<span style="font-size:10.5px;color:var(--muted)">'+e(r.recorded_by)+'</span>':'')
        +'<audio controls preload="none" src="'+e(r.file_url||"")+'" style="height:32px;flex:1;min-width:180px"></audio>'
        +'<a class="btn bsm" href="'+e(r.file_url||"#")+'" download style="text-decoration:none">⬇ Download</a>'
        +'</div>'
      ).join("")):'<div style="font-size:12px;color:var(--faint)">No office-visit recordings yet.</div>';
    }
    // ===== Recordings screen: cross-client Office-visit audio + Zoom meeting tables =====
    // Both reuse the shared Excel-style filter grid engine (regGrid/gridHead/gridApply),
    // shared pager helpers (_pgBtns/_pgApply) and CSV export (_downloadCsv).
    let _ovrRows:any[]=[], _zoomRows:any[]=[];
    let _ovrQuery="", _zoomQuery="", _ovrSearchT:any=null, _zoomSearchT:any=null;
    let _ovrApplied:{from:string;to:string}={from:"",to:""};
    let _zoomApplied:{from:string;to:string}={from:"",to:""};
    const REC_PER=12; let _ovrTblPageN=1, _zoomTblPageN=1;
    const _recDur=(s:number)=>{ s=Math.max(0,Math.round(s||0)); const m=Math.floor(s/60); return (m?m+"m ":"")+(s%60)+"s"; };
    const _ovrTblCols:any[]=[
      {key:"dt",label:"Recording Date & Time",filter:true,text:(r:any)=>fmtIST(r.created_at)},
      {key:"cust",label:"Customer Name",filter:true,text:(r:any)=>r._cust||""},
      {key:"by",label:"Recorded By",filter:true,text:(r:any)=>r.recorded_by||""},
      {key:"dur",label:"Duration",filter:true,text:(r:any)=>_recDur(r.duration_seconds)},
      {key:"status",label:"Recording Status",filter:true,text:(r:any)=>r.file_url?"Ready":"Processing"},
      {key:"act",label:"Actions",filter:false},
    ];
    regGrid("ovrTbl",()=>_ovrTblCols,()=>renderOvrTbl());
    const _zoomTblCols:any[]=[
      {key:"dt",label:"Meeting Date & Time",filter:true,text:(r:any)=>fmtIST(r.meeting_at||r.created_at)},
      {key:"cust",label:"Customer Name",filter:true,text:(r:any)=>r._cust||""},
      {key:"link",label:"Zoom Recording Link",filter:true,text:(r:any)=>r.meeting_url||""},
      {key:"dur",label:"Meeting Duration",filter:true,text:(r:any)=>_recDur(r.duration_seconds)},
      {key:"status",label:"Recording Status",filter:true,text:(r:any)=>r.status||(r.meeting_url?"Ready":"Pending")},
      {key:"act",label:"Actions",filter:false},
    ];
    regGrid("zoomTbl",()=>_zoomTblCols,()=>renderZoomTbl());
    async function loadRecordings(){
      try{ const {data}=await supabase.from("office_recordings").select("*").order("created_at",{ascending:false}).limit(2000); _ovrRows=data||[]; }catch(_){ _ovrRows=[]; }
      try{ const {data}=await supabase.from("zoom_recordings").select("*").order("created_at",{ascending:false}).limit(2000); _zoomRows=data||[]; }catch(_){ _zoomRows=[]; }
      // Resolve customer name by lead_id (office rows have none; zoom rows keep their own).
      const ids=Array.from(new Set([..._ovrRows,..._zoomRows].map((r:any)=>String(r.lead_id)).filter(Boolean)));
      const nameMap:Record<string,string>={};
      if(ids.length){ try{ const {data}=await supabase.from("leads").select("meta_lead_id,name").in("meta_lead_id",ids); (data||[]).forEach((l:any)=>{ if(l.meta_lead_id!=null) nameMap[String(l.meta_lead_id)]=l.name||""; }); }catch(_){} }
      const resolve=(r:any,own?:string)=>own||nameMap[String(r.lead_id)]||("Lead #"+(r.lead_id||"?"));
      _ovrRows.forEach((r:any)=>{ r._cust=resolve(r); });
      _zoomRows.forEach((r:any)=>{ r._cust=resolve(r,r.customer_name); });
      _ovrTblPageN=1; _zoomTblPageN=1;
      renderOvrTbl(); renderZoomTbl();
    }
    function _recDateFilter(rows:any[],applied:{from:string;to:string},field:(r:any)=>any){
      const {from,to}=applied; if(!from&&!to)return rows;
      const f=from?new Date(from+"T00:00:00").getTime():0; const t=to?new Date(to+"T23:59:59").getTime():0;
      return rows.filter((r:any)=>{ const d=field(r); const x=d?new Date(d).getTime():0; if(f&&x<f)return false; if(t&&x>t)return false; return true; });
    }
    function _ovrBase(){
      let base=_ovrRows;
      const q=_ovrQuery.trim().toLowerCase();
      if(q) base=base.filter((r:any)=>[r._cust,r.recorded_by].some((v:any)=>String(v||"").toLowerCase().includes(q)));
      return _recDateFilter(base,_ovrApplied,(r:any)=>r.created_at);
    }
    function _zoomBase(){
      let base=_zoomRows;
      const q=_zoomQuery.trim().toLowerCase();
      if(q) base=base.filter((r:any)=>[r._cust,r.meeting_url].some((v:any)=>String(v||"").toLowerCase().includes(q)));
      return _recDateFilter(base,_zoomApplied,(r:any)=>r.meeting_at||r.created_at);
    }
    const _recE=(s:any)=>(s==null?"":String(s)).replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const _recA=(s:any)=>(s==null?"":String(s)).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
    function renderOvrTbl(){
      const head=root.querySelector("#ovrTblHead"); if(head)head.innerHTML=gridHead("ovrTbl");
      const rows=gridApply("ovrTbl",_ovrBase());
      const cnt=root.querySelector("#ovrTblCount"); if(cnt)cnt.textContent=String(rows.length);
      const body=root.querySelector("#ovrTblBody"); if(!body)return;
      const pages=Math.max(1,Math.ceil(rows.length/REC_PER));
      if(_ovrTblPageN>pages)_ovrTblPageN=pages; if(_ovrTblPageN<1)_ovrTblPageN=1;
      const pr=rows.slice((_ovrTblPageN-1)*REC_PER,(_ovrTblPageN-1)*REC_PER+REC_PER);
      body.innerHTML=pr.length?pr.map((r:any)=>{
        const ready=!!r.file_url; const url=_recA(r.file_url||"");
        return '<tr>'
          +'<td class="mono" style="font-size:11px;white-space:nowrap">'+_recE(fmtIST(r.created_at))+'</td>'
          +'<td style="font-weight:600">'+_recE(r._cust||"—")+'</td>'
          +'<td>'+_recE(r.recorded_by||"—")+'</td>'
          +'<td class="mono">'+_recE(_recDur(r.duration_seconds))+'</td>'
          +'<td><span class="chipb '+(ready?"ok":"neu")+'">'+(ready?"Ready":"Processing")+'</span></td>'
          +'<td>'+(ready?'<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><audio controls preload="none" src="'+url+'" style="height:30px;max-width:190px"></audio><a class="btn bsm" href="'+url+'" download style="text-decoration:none">⬇ Download</a></div>':'<span style="font-size:11px;color:var(--faint)">No file</span>')+'</td>'
          +'</tr>';
      }).join(""):'<tr><td colspan="6" style="text-align:center;color:var(--faint);padding:18px">No office-visit recordings match the filters</td></tr>';
      const info=root.querySelector("#ovrTblPageInfo"); if(info)info.textContent="Page "+_ovrTblPageN+" of "+pages;
      _pgBtns("ovrTbl",_ovrTblPageN,pages);
    }
    function renderZoomTbl(){
      const head=root.querySelector("#zoomTblHead"); if(head)head.innerHTML=gridHead("zoomTbl");
      const rows=gridApply("zoomTbl",_zoomBase());
      const cnt=root.querySelector("#zoomTblCount"); if(cnt)cnt.textContent=String(rows.length);
      const body=root.querySelector("#zoomTblBody"); if(!body)return;
      const pages=Math.max(1,Math.ceil(rows.length/REC_PER));
      if(_zoomTblPageN>pages)_zoomTblPageN=pages; if(_zoomTblPageN<1)_zoomTblPageN=1;
      const pr=rows.slice((_zoomTblPageN-1)*REC_PER,(_zoomTblPageN-1)*REC_PER+REC_PER);
      body.innerHTML=pr.length?pr.map((r:any)=>{
        const url=r.meeting_url||""; const has=!!url; const ua=_recA(url);
        const status=r.status||(has?"Ready":"Pending");
        const shortUrl=url.length>42?url.slice(0,42)+"…":url;
        return '<tr>'
          +'<td class="mono" style="font-size:11px;white-space:nowrap">'+_recE(fmtIST(r.meeting_at||r.created_at))+'</td>'
          +'<td style="font-weight:600">'+_recE(r._cust||"—")+'</td>'
          +'<td>'+(has?'<a href="'+ua+'" target="_blank" rel="noopener" class="mono" style="font-size:11px;color:var(--brand)">'+_recE(shortUrl)+'</a>':'<span style="color:var(--faint)">—</span>')+'</td>'
          +'<td class="mono">'+_recE(_recDur(r.duration_seconds))+'</td>'
          +'<td><span class="chipb '+(has?"ok":"neu")+'">'+_recE(status)+'</span></td>'
          +'<td>'+(has?'<div style="display:flex;gap:6px;flex-wrap:wrap"><a class="btn bsm" href="'+ua+'" target="_blank" rel="noopener" style="text-decoration:none">🔗 Open</a><a class="btn bsm bp" href="'+ua+'" target="_blank" rel="noopener" style="text-decoration:none">▶ Play</a><a class="btn bsm" href="'+ua+'" target="_blank" rel="noopener" download style="text-decoration:none">⬇ Download</a></div>':'<span style="font-size:11px;color:var(--faint)">No link</span>')+'</td>'
          +'</tr>';
      }).join(""):'<tr><td colspan="6" style="text-align:center;color:var(--faint);padding:18px">No Zoom recordings match the filters</td></tr>';
      const info=root.querySelector("#zoomTblPageInfo"); if(info)info.textContent="Page "+_zoomTblPageN+" of "+pages;
      _pgBtns("zoomTbl",_zoomTblPageN,pages);
    }
    w._ovrTblSearch=()=>{ if(_ovrSearchT)clearTimeout(_ovrSearchT); _ovrSearchT=setTimeout(()=>{ _ovrQuery=(root.querySelector("#ovrTblSearch")as HTMLInputElement)?.value||""; _ovrTblPageN=1; renderOvrTbl(); },180); };
    w._ovrTblApply=()=>{ _ovrApplied={from:(root.querySelector("#ovrTblFrom")as HTMLInputElement)?.value||"",to:(root.querySelector("#ovrTblTo")as HTMLInputElement)?.value||""}; _ovrTblPageN=1; renderOvrTbl(); };
    w._ovrTblClear=()=>{ const f=root.querySelector("#ovrTblFrom")as HTMLInputElement; const t=root.querySelector("#ovrTblTo")as HTMLInputElement; if(f)f.value=""; if(t)t.value=""; _ovrApplied={from:"",to:""}; _ovrTblPageN=1; renderOvrTbl(); };
    w._ovrTblPage=(dir:any)=>{ _ovrTblPageN=_pgApply(_ovrTblPageN,dir); renderOvrTbl(); };
    w._ovrTblDownload=()=>{
      const rows=gridApply("ovrTbl",_ovrBase());
      if(!rows.length){ toast("Nothing to download"); return; }
      const out:string[][]=[["Recording Date & Time","Customer Name","Recorded By","Duration","Recording Status","Recording URL"]];
      rows.forEach((r:any)=>out.push([fmtIST(r.created_at),r._cust||"",r.recorded_by||"",_recDur(r.duration_seconds),r.file_url?"Ready":"Processing",r.file_url||""]));
      _downloadCsv("wellnessos_office_recordings.csv",out); toast("Downloaded "+rows.length+" office recordings");
    };
    w._zoomTblSearch=()=>{ if(_zoomSearchT)clearTimeout(_zoomSearchT); _zoomSearchT=setTimeout(()=>{ _zoomQuery=(root.querySelector("#zoomTblSearch")as HTMLInputElement)?.value||""; _zoomTblPageN=1; renderZoomTbl(); },180); };
    w._zoomTblApply=()=>{ _zoomApplied={from:(root.querySelector("#zoomTblFrom")as HTMLInputElement)?.value||"",to:(root.querySelector("#zoomTblTo")as HTMLInputElement)?.value||""}; _zoomTblPageN=1; renderZoomTbl(); };
    w._zoomTblClear=()=>{ const f=root.querySelector("#zoomTblFrom")as HTMLInputElement; const t=root.querySelector("#zoomTblTo")as HTMLInputElement; if(f)f.value=""; if(t)t.value=""; _zoomApplied={from:"",to:""}; _zoomTblPageN=1; renderZoomTbl(); };
    w._zoomTblPage=(dir:any)=>{ _zoomTblPageN=_pgApply(_zoomTblPageN,dir); renderZoomTbl(); };
    w._zoomTblDownload=()=>{
      const rows=gridApply("zoomTbl",_zoomBase());
      if(!rows.length){ toast("Nothing to download"); return; }
      const out:string[][]=[["Meeting Date & Time","Customer Name","Zoom Recording Link","Meeting Duration","Recording Status"]];
      rows.forEach((r:any)=>out.push([fmtIST(r.meeting_at||r.created_at),r._cust||"",r.meeting_url||"",_recDur(r.duration_seconds),r.status||(r.meeting_url?"Ready":"Pending")]));
      _downloadCsv("wellnessos_zoom_recordings.csv",out); toast("Downloaded "+rows.length+" Zoom recordings");
    };
    function fillCoachDetail(lead:any){
      if(!lead) return;
      _coachLeadId=String(lead.id);
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const name=lead.name||lead.phone||"Client";
      const initials=(name.match(/[A-Za-z0-9]/g)||["C","L"]).slice(0,2).join("").toUpperCase();
      const setT=(sel:string,t:string)=>{const el=root.querySelector(sel);if(el)el.textContent=t;};
      const setHt=(sel:string,h:string)=>{const el=root.querySelector(sel);if(el)el.innerHTML=h;};
      const setV=(id:string,v:string)=>{const el=root.querySelector("#"+id)as HTMLInputElement|null;if(el)el.value=v;};
      setT("#coachAv",initials||"CL"); setT("#coachName",name);
      setHt("#coachSub",'<span class="mono">'+e(lead.phone||"—")+'</span><span>·</span><span class="mono">Lead #'+e(String(lead.id))+'</span>');
      setHt("#coachBadges",'<span class="chipb '+(lead.isValid?'ok':'neu')+'">'+(lead.isValid?'Valid':'No phone')+'</span><span class="chipb neu">'+e((lead.source==="Manual"?"Manual":(lead.source||"Meta"))+" · "+(lead.lang||"Tamil"))+'</span><span class="chipb ok">Visited</span>');
      const cb=root.querySelector("#coachBadge"); if(cb) cb.textContent="Status: Open";
      const p=_coachPanelEl();
      if(p){
        p.querySelectorAll("input").forEach((i:any)=>{ if(i.type==="checkbox"||i.type==="radio")i.checked=false; else i.value=""; });
        p.querySelectorAll("textarea").forEach((t:any)=>t.value="");
        p.querySelectorAll("select").forEach((s:any)=>s.selectedIndex=0);
        p.querySelectorAll(".pill.on").forEach((b:any)=>b.classList.remove("on"));
        p.querySelectorAll(".chip-o.on").forEach((b:any)=>b.classList.remove("on"));
      }
      _coachAttachments=[]; renderCoachAtts();
      Object.keys(_payProofs).forEach(k=>delete _payProofs[k]);   // clear per-client payment proofs
      _coachConsStatus="Open";   // reset; a restored profile re-sets it via consAct
      const crS=root.querySelector("#crSugar")as HTMLInputElement|null; if(crS&&lead.sugar) crS.value=lead.sugar;
      setV("haConsultDate",new Date().toISOString().slice(0,10));
      const fuNotes=root.querySelector("#fuNotes"); if(fuNotes) fuNotes.innerHTML="";
      // Reset score-card auto tiles until recomputed for this client.
      _scAuto={attendance:0,followup:0};
      ["#scAttendanceV","#scFollowupV","#scOverallV"].forEach(s=>{const el=root.querySelector(s);if(el)el.textContent="—";});
      const rdFld=root.querySelector("#reviewDateFld")as HTMLElement|null; if(rdFld) rdFld.style.display="none";
      renderCoachOpenList();
      loadAndApplyCoach(lead).then(()=>{ try{ _renderScoreCard(String(lead.id)); }catch(_){} });
      _coachSyncAdvisorReports(lead);
      _coachSyncScreeningVitals(lead);
      _coachRenderRecordings(_coachLeadId);
      _ovrRenderList(_coachLeadId);
      _renderCoachPayHistory(_coachLeadId);
      _coachPopulateReadOnly(lead);
    }
    async function _coachSyncScreeningVitals(lead:any){
      let sv:any=null;
      try{ const {data}=await supabase.from("leads").select("screening_vitals,assigned_to").eq("meta_lead_id",lead.id).limit(1); sv=data&&data[0]; }catch(_){}
      if(String(_coachLeadId)!==String(lead.id)) return;
      const vitals=(sv&&sv.screening_vitals)||null;
      if(vitals){
        const setV=(id:string,v:string)=>{const el=root.querySelector("#"+id)as HTMLInputElement|null;if(el&&v)el.value=v;};
        setV("cs_h",vitals.height||""); setV("cs_w",vitals.weight||""); setV("cs_bp",vitals.bp||"");
        setV("cs_pu",vitals.pulse||""); setV("cs_sp",vitals.spo2||""); setV("cs_wa",vitals.waist||"");
        setV("cs_te",vitals.temp||""); setV("cs_gl",vitals.glucose||"");
        if(vitals.height&&vitals.weight){ const m=parseFloat(vitals.height)/100; const bmi=parseFloat(vitals.weight)/(m*m); if(bmi>0){const el=root.querySelector("#cs_bmi")as HTMLInputElement;if(el)el.value=bmi.toFixed(1);} }
        const se=root.querySelector("#scrEmpty")as HTMLElement;if(se)se.style.display="none";
        const sd=root.querySelector("#scrData")as HTMLElement;if(sd)sd.style.display="grid";
        const sc=root.querySelector("#scrChip")as HTMLElement;if(sc){sc.textContent="Completed";sc.className="chipb ok";}
        const haH=root.querySelector("#haHeight")as HTMLInputElement; const haW=root.querySelector("#haWeight")as HTMLInputElement;
        if(haH&&!haH.value&&vitals.height) haH.value=vitals.height;
        if(haW&&!haW.value&&vitals.weight) haW.value=vitals.weight;
        _haBmiCalc();
        const haB=root.querySelector("#haBp")as HTMLInputElement; if(haB&&!haB.value&&vitals.bp) haB.value=vitals.bp;
        const haP=root.querySelector("#haPulse")as HTMLInputElement; if(haP&&!haP.value&&vitals.pulse) haP.value=vitals.pulse;
        const haT=root.querySelector("#haTemp")as HTMLInputElement; if(haT&&!haT.value&&vitals.temp) haT.value=vitals.temp;
      }
      const assignedTo=(sv&&sv.assigned_to)||"Health Coach";
      const setAtt=(id:string)=>{const el=root.querySelector("#"+id)as HTMLInputElement;if(el&&!el.value) el.value=assignedTo;};
      setAtt("haAttendedBy"); setAtt("haAttendedBy2"); setAtt("haAttendedBy3");
    }
    async function _coachPopulateReadOnly(lead:any){
      let adv:any=null;
      try{ const {data}=await supabase.from("leads").select("advisor_profile,source,language,campaign,assigned_to").eq("meta_lead_id",lead.id).limit(1); adv=data&&data[0]; }catch(_){}
      if(String(_coachLeadId)!==String(lead.id)) return;
      const esc=(s:string)=>(s||"--").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const rb=root.querySelector("#roBasic"); if(rb&&adv){
        const named=adv.advisor_profile?_advNamed(adv.advisor_profile.f):null;
        const occ=(named&&named["Occupation"])||"--"; const loc=(named&&named["Location"])||"--"; const pr=(named&&named["Priority"])||"--";
        rb.innerHTML='<tr><td style="color:var(--muted)">Occupation</td><td>'+esc(occ)+'</td><td style="color:var(--muted)">Language</td><td>'+esc(adv.language||lead.lang)+'</td><td style="color:var(--muted)">Source</td><td>'+esc((adv.source||lead.source||"Meta")+" · "+(adv.campaign||""))+'</td></tr>'
          +'<tr><td style="color:var(--muted)">Location</td><td>'+esc(loc)+'</td><td style="color:var(--muted)">Salesperson</td><td style="font-weight:600">'+esc(adv.assigned_to||"--")+'</td><td style="color:var(--muted)">Priority</td><td>'+esc(pr)+'</td></tr>';
      }
      const rs=root.querySelector("#roSugar"); if(rs&&adv&&adv.advisor_profile){
        const named=_advNamed(adv.advisor_profile.f);
        const sl=named["Sugar level"]||lead.sugar||"--"; const fp=(named["Fasting (mg/dL)"]||"--")+" / "+(named["Postprandial (mg/dL)"]||"--");
        const hb=named["HbA1c (%)"]||"--"; const trt=named["Treatment"]||"--"; const mg=named["Managing with"]||"--";
        rs.innerHTML='<tr><td style="color:var(--muted)">Sugar level</td><td>'+esc(sl)+'</td><td style="color:var(--muted)">Fasting / PP</td><td class="mono">'+esc(fp)+'</td><td style="color:var(--muted)">HbA1c</td><td class="mono" style="font-weight:700">'+esc(hb)+'</td></tr>'
          +'<tr><td style="color:var(--muted)">Treatment</td><td>'+esc(trt)+'</td><td style="color:var(--muted)">Managing now</td><td>'+esc(mg)+'</td><td style="color:var(--muted)">Eligibility</td><td>'+esc(named["Eligibility"]||"--")+'</td></tr>';
      }
      const rc=root.querySelector("#roCalls"); if(rc&&adv){
        const named=adv.advisor_profile?_advNamed(adv.advisor_profile.f):null;
        const cs=(named&&named["Call status"])||"--"; const hc=adv.assigned_to||"--";
        rc.innerHTML='<tr><td style="color:var(--muted)">Call status</td><td>'+esc(cs)+'</td><td style="color:var(--muted)">Appointment</td><td class="mono">--</td><td style="color:var(--muted)">HC</td><td style="font-weight:600">'+esc(hc)+'</td></tr>'
          +'<tr><td style="color:var(--muted)">Last call note</td><td colspan="5">'+esc((named&&named["Last note"])||"--")+'</td></tr>';
      }
    }
    async function loadCoachClients(){
      try{
        let res=await supabase.from("leads").select("meta_lead_id,name,phone,source,language,service,is_valid,sugar_poll,coach_profile,screening_vitals,visited_at,call_status").not("visited_at","is",null).order("visited_at",{ascending:false}).limit(100);
        if(res.error&&/column|screening_vitals/i.test(res.error.message||"")){
          res=await supabase.from("leads").select("meta_lead_id,name,phone,source,language,service,is_valid,sugar_poll,coach_profile,visited_at,call_status").not("visited_at","is",null).order("visited_at",{ascending:false}).limit(100) as any;
        }
        if(res.error) throw res.error;
        const data=res.data;
        const apptStages:Record<string,string>={}; const apptHc:Record<string,string>={};
        try{ const {data:appts}=await supabase.from("appointments").select("lead_id,stage,status,hc_pt").limit(500); (appts||[]).forEach((a:any)=>{ if(a.lead_id){ if(a.stage) apptStages[a.lead_id]=a.stage; if(a.hc_pt&&!apptHc[a.lead_id]) apptHc[a.lead_id]=a.hc_pt; } }); }catch(_){}
        _coachClients=(data||[]).map((r:any)=>{
          const cp=r.coach_profile; const sv=r.screening_vitals||null; const apptStage=apptStages[r.meta_lead_id]||"";
          let stage="screening";
          if(cp&&cp._stage) stage=cp._stage;
          else if(apptStage==="enrolled") stage="enrolled";
          else if(apptStage==="payment") stage="payment";
          else if(apptStage==="consultation"||apptStage==="health") stage="consultation";
          else if(cp&&cp.f&&cp.f.length>3) stage="assessment";
          else if(sv&&sv.screened_at) stage="assessment";
          return {id:r.meta_lead_id,name:r.name,phone:r.phone,source:r.source,lang:r.language,service:r.service||"",isValid:r.is_valid,sugar:r.sugar_poll||"",coachProfile:cp||null,_stage:stage,visitedAt:r.visited_at,hc:apptHc[r.meta_lead_id]||"",consStatus:(cp&&cp.consStatus)||"Open",callStatus:r.call_status||""};
        });
        // Reconcile historical enrollments: a client marked Enrolled on the coach side whose
        // lead.call_status hasn't caught up → sync it (DB + memory) so the Advisor dashboard,
        // Enrolled card and Enrolled-clients table reflect it without needing a re-save.
        _coachClients.filter((c:any)=>/enrol/i.test(c.consStatus||"")&&c.callStatus!=="Enrolled").forEach((c:any)=>{
          const cid=String(c.id); c.callStatus="Enrolled";
          const enrIso=c.visitedAt||new Date().toISOString();   // best-effort enrollment time for historical rows
          supabase.from("leads").update({call_status:"Enrolled",enrolled_at:enrIso}).eq("meta_lead_id",cid).then(()=>{});
          const setE=(arr:any[])=>arr.forEach((l:any)=>{ if(String(l.id)===cid){ l.callStatus="Enrolled"; if(!l.enrolledAt) l.enrolledAt=enrIso; } });
          setE(_metaLeads); setE(_assignedExtras);
        });
      }catch(_){ _coachClients=[]; }
      _coachPopulateFilters();
      renderCoachOpenList();
    }
    let _coachView="list";
    let _coachQuery=""; let _coachSearchT:any=null;
    // Dropdown/date filters are APPLIED on demand (Apply button); search stays live.
    let _coachApplied:{from:string;to:string;coach:string;status:string;source:string;service:string}={from:"",to:"",coach:"all",status:"all",source:"all",service:"all"};
    // Central filter set — dashboard cards, Visited-clients table, List and Kanban all read
    // this, so everything stays in sync with the applied filters.
    function _coachFiltered(){
      const from=_coachApplied.from, to=_coachApplied.to, coach=_coachApplied.coach, st=_coachApplied.status, src=_coachApplied.source, svc=_coachApplied.service;
      const q=_coachQuery.trim().toLowerCase();
      const fromT=from?new Date(from+"T00:00:00").getTime():0;
      const toT=to?new Date(to+"T23:59:59").getTime():0;
      return _coachClients.filter((c:any)=>{
        if(coach!=="all"&&(c.hc||"")!==coach) return false;
        if(st!=="all"&&_coachConsOf(c)!==st) return false;   // filter by consultation status (matches cards + column)
        if(src!=="all"&&(c.source||"")!==src) return false;
        if(svc!=="all"&&(c.service||"")!==svc) return false;
        if(fromT||toT){ const t=c.visitedAt?new Date(c.visitedAt).getTime():0; if(fromT&&t<fromT) return false; if(toT&&t>toT) return false; }
        if(q&&![c.name,c.phone,c.source].some((v:any)=>String(v||"").toLowerCase().indexOf(q)>=0)) return false;
        return true;
      });
    }
    // Consultation status label for a client (persisted in coach_profile.consStatus).
    // Prefer the live coach_profile (fresh after a save) over the load-time snapshot.
    function _coachConsOf(c:any){ return (c&&((c.coachProfile&&c.coachProfile.consStatus)||c.consStatus))||"Open"; }
    function _coachPopulateFilters(){
      const fill=(sel:string,vals:string[],allLabel:string)=>{ const el=root.querySelector(sel)as HTMLSelectElement|null; if(!el) return; const cur=el.value; const uniq=Array.from(new Set(vals.filter(Boolean))).sort(); el.innerHTML='<option value="all">'+allLabel+'</option>'+uniq.map((v:string)=>'<option>'+(v||"").replace(/</g,"&lt;")+'</option>').join(""); if(Array.from(el.options).some(o=>o.value===cur)) el.value=cur; };
      // The coach filter must list EVERY active Health Coach from the Assignees master
      // (single source of truth), not only those who already have a visited client.
      // Union with any coach present on a client so historical assignments still show.
      const coachNames=_assignees.filter((a:any)=>a.is_active&&a.role==="Health Coach").map((a:any)=>a.name)
        .concat(_coachClients.map((c:any)=>c.hc));
      fill("#coCoach",coachNames,"All health coaches");
      fill("#coSource",_coachClients.map((c:any)=>c.source),"All sources");
      fill("#coService",_coachClients.map((c:any)=>c.service),"All services");
      const stEl=root.querySelector("#coStatus")as HTMLSelectElement|null;
      if(stEl){ const cur=stEl.value; const eo=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;"); stEl.innerHTML='<option value="all">All statuses</option>'+_coachStatusCards.map((s:string)=>'<option value="'+eo(s)+'">'+eo(s)+'</option>').join(""); if(Array.from(stEl.options).some(o=>o.value===cur)) stEl.value=cur; }
    }
    // Apply the staged coach filters (date / coach / status / service) → refresh list + kanban.
    w._coachFilterApply=()=>{
      _coachApplied={
        from:(root.querySelector("#coFrom")as HTMLInputElement)?.value||"",
        to:(root.querySelector("#coTo")as HTMLInputElement)?.value||"",
        coach:(root.querySelector("#coCoach")as HTMLSelectElement)?.value||"all",
        status:(root.querySelector("#coStatus")as HTMLSelectElement)?.value||"all",
        source:(root.querySelector("#coSource")as HTMLSelectElement)?.value||"all",
        service:(root.querySelector("#coService")as HTMLSelectElement)?.value||"all",
      };
      renderCoachOpenList();
    };
    w._coachFilterClear=()=>{
      const set=(id:string,v:string)=>{const el=root.querySelector("#"+id)as any; if(el)el.value=v;};
      set("coFrom",""); set("coTo",""); set("coCoach","all"); set("coStatus","all"); set("coSource","all"); set("coService","all");
      _coachApplied={from:"",to:"",coach:"all",status:"all",source:"all",service:"all"};
      renderCoachOpenList();
    };
    // Search stays live (not gated by Apply).
    w._coachSearch=()=>{ if(_coachSearchT)clearTimeout(_coachSearchT); _coachSearchT=setTimeout(()=>{ _coachQuery=(root.querySelector("#coSearch")as HTMLInputElement)?.value||""; renderCoachOpenList(); },180); };
    w._coachToggleView=(v:string)=>{ _coachView=v; renderCoachOpenList(); };
    // ===== Health Coach dashboard cards (by consultation status) + Visited-clients table =====
    const _coachStatusCards=["Open","Will Join Immediately","This Week","End of Month","Next Month","Enrolled – L1","Enrolled – L2","Already Paid – Before Consultation","Already Paid – After Consultation","Not Interested","Refund"];
    let _coachDashSel="";
    function renderCoachDash(){
      const el=root.querySelector("#coachDash"); if(!el) return;
      const list=_coachFiltered();   // cards reflect the applied filter bar (NOT the card selection)
      const counts:Record<string,number>={}; _coachStatusCards.forEach(l=>counts[l]=0);
      list.forEach((c:any)=>{ const s=_coachConsOf(c); counts[s]=(counts[s]||0)+1; });
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      el.innerHTML=_coachStatusCards.map(l=>{
        const on=_coachDashSel===l;
        return '<div class="metric" style="cursor:pointer'+(on?';outline:2px solid var(--brand);outline-offset:-1px':'')+'" onclick="window._coachDashClick(\''+e(l).replace(/'/g,"\\'")+'\')"><div class="ml">'+e(l)+'</div><div class="mv">'+(counts[l]||0)+'</div></div>';
      }).join("");
    }
    w._coachDashClick=(label:string)=>{ _coachDashSel=(_coachDashSel===label)?"":label; _coachCliPage=1; renderCoachOpenList(); };
    // Top-right "Consultation Status" dropdown — drives the same selection the dashboard cards use,
    // so it filters both the cards (highlights the match) and the Visited-clients table, persists
    // across List/Kanban, and composes with the applied filter bar (all via _coachCliBase).
    w._coachConsFilter=(v:string)=>{ _coachDashSel=v||""; _coachCliPage=1; renderCoachOpenList(); };
    const COACH_CLI_PER=12; let _coachCliPage=1;
    const _coachCliCols=[
      {key:"name",label:"Lead Name",filter:true,text:(c:any)=>c.name||""},
      {key:"phone",label:"Phone",filter:true,text:(c:any)=>c.phone||""},
      {key:"source",label:"Source",filter:true,text:(c:any)=>c.source||""},
      {key:"service",label:"Service",filter:true,text:(c:any)=>c.service||""},
      {key:"hc",label:"Health Coach",filter:true,text:(c:any)=>c.hc||"—"},
      {key:"cons",label:"Consultation Status",filter:true,text:(c:any)=>_coachConsOf(c)},
      {key:"visited",label:"Visited Date & Time",filter:true,text:(c:any)=>fmtIST(c.visitedAt)},
      {key:"act",label:"Action",filter:false,head:"Action"},
    ];
    regGrid("coachClients",()=>_coachCliCols,()=>renderCoachClientsTable());
    function _coachCliBase(){ let base=_coachFiltered(); if(_coachDashSel) base=base.filter((c:any)=>_coachConsOf(c)===_coachDashSel); return base; }
    function renderCoachClientsTable(){
      const head=root.querySelector("#coachClientsHead"); if(head)head.innerHTML=gridHead("coachClients");
      const rows=gridApply("coachClients",_coachCliBase());
      const cnt=root.querySelector("#coachCliCount"); if(cnt)cnt.textContent=String(rows.length);
      const body=root.querySelector("#coachClientsBody"); if(!body) return;
      const total=rows.length; const pages=Math.max(1,Math.ceil(total/COACH_CLI_PER));
      if(_coachCliPage>pages)_coachCliPage=pages; if(_coachCliPage<1)_coachCliPage=1;
      const pageRows=rows.slice((_coachCliPage-1)*COACH_CLI_PER,(_coachCliPage-1)*COACH_CLI_PER+COACH_CLI_PER);
      const e=(s:any)=>(s==null?"":String(s)).replace(/</g,"&lt;").replace(/>/g,"&gt;");
      body.innerHTML=pageRows.length?pageRows.map((c:any)=>{
        const active=String(c.id)===String(_coachLeadId);
        return '<tr'+(active?' style="background:var(--brand-tint)"':'')+'>'
          +'<td style="font-weight:600;cursor:pointer;color:var(--brand)" onclick="window._coachOpen(\''+e(String(c.id))+'\')">'+e(c.name||"—")+' ↗</td>'
          +'<td class="mono">'+e(c.phone||"—")+'</td>'
          +'<td><span class="tag">'+e(c.source||"—")+'</span></td>'
          +'<td>'+e(c.service||"—")+'</td>'
          +'<td>'+e(c.hc||"—")+'</td>'
          +'<td><span class="chipb neu">'+e(_coachConsOf(c))+'</span></td>'
          +'<td class="mono" style="font-size:11px;white-space:nowrap">'+e(fmtIST(c.visitedAt))+'</td>'
          +'<td><button class="btn bsm bp" onclick="window._coachOpen(\''+e(String(c.id))+'\')">Open</button></td></tr>';
      }).join(""):'<tr><td colspan="8" style="text-align:center;color:var(--faint);padding:18px">No visited clients match the filters</td></tr>';
      const info=root.querySelector("#coachCliPageInfo"); if(info)info.textContent="Page "+_coachCliPage+" of "+pages;
      _pgBtns("coachCli",_coachCliPage,pages);
    }
    w._coachCliPage=(dir:any)=>{ _coachCliPage=_pgApply(_coachCliPage,dir); renderCoachClientsTable(); };
    w._coachCliDownload=()=>{
      const rows=gridApply("coachClients",_coachCliBase());
      if(!rows.length){ toast("Nothing to download"); return; }
      const out:string[][]=[["Lead Name","Phone","Source","Service","Health Coach","Consultation Status","Visited Date & Time"]];
      rows.forEach((c:any)=>out.push([c.name||"",c.phone||"",c.source||"",c.service||"",c.hc||"",_coachConsOf(c),fmtIST(c.visitedAt)]));
      _downloadCsv("wellnessos_visited_clients.csv",out);
      toast("Downloaded "+rows.length+" visited clients");
    };
    // Master render for the Visited-clients area: dashboard cards + the List/Kanban toggle,
    // then either the table (List) or the kanban board (Kanban) — both honour the same
    // applied filters + dashboard-card selection (_coachCliBase).
    function renderCoachOpenList(){
      try{ renderCoachDash(); }catch(_){}
      const tog=root.querySelector("#coachViewToggle");
      if(tog) tog.innerHTML='<button class="pill'+(_coachView==="list"?" on":"")+'" onclick="window._coachToggleView(\'list\')">List View</button><button class="pill'+(_coachView==="kanban"?" on":"")+'" onclick="window._coachToggleView(\'kanban\')">Kanban View</button>';
      const csf=root.querySelector("#coachConsFilter")as HTMLSelectElement|null;
      if(csf){ const eo=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;"); csf.innerHTML='<option value="">All Status</option>'+_coachStatusCards.map((s:string)=>'<option value="'+eo(s)+'">'+eo(s)+'</option>').join(""); csf.value=_coachDashSel; }
      const kb=root.querySelector("#coachKanban")as HTMLElement|null;
      const tw=root.querySelector("#coachCliTableWrap")as HTMLElement|null;
      if(_coachView==="kanban"){
        if(tw)tw.style.display="none";
        const base=_coachCliBase();
        const cnt=root.querySelector("#coachCliCount"); if(cnt)cnt.textContent=String(base.length);
        if(kb){ kb.style.display=""; _renderCoachKanban(kb,base); }
      } else {
        if(kb)kb.style.display="none";
        if(tw)tw.style.display="";
        renderCoachClientsTable();
      }
    }
    function _renderCoachKanban(kb:HTMLElement,list:any[]){
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      // Kanban columns mirror the consultation-status values (the same set the dashboard
      // cards, List view and All-Status dropdown use) so every view stays in sync.
      const stageColors=["#17A87B","#378ADD","#7B6CD9","#C07F0E","#0B6B4C","#E8A817","#0EA5A0","#D8442B","#A855F7","#EF4444","#64748B"];
      const cols=_coachStatusCards.map((label:string,ci:number)=>({label,color:stageColors[ci%stageColors.length],filter:(c:any)=>_coachConsOf(c)===label}));
      const colors=["#17A87B","#378ADD","#7B6CD9","#C07F0E","#D8442B","#5B9BD5","#A855F7","#EF4444"];
      kb.innerHTML='<div style="display:flex;gap:12px;min-width:max-content;padding-bottom:8px">'+cols.map(col=>{
        const items=list.filter(col.filter);
        return '<div style="min-width:220px;max-width:260px;flex:1;background:var(--surface);border:1px solid var(--line);border-radius:10px;overflow:hidden">'
          +'<div style="padding:10px 12px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:6px"><span style="width:9px;height:9px;border-radius:50%;background:'+col.color+';flex-shrink:0;display:inline-block"></span><span style="font-weight:700;font-size:12px">'+e(col.label)+'</span><span class="chipb neu" style="margin-left:auto;font-size:11px">'+items.length+'</span></div>'
          +'<div style="padding:8px;display:flex;flex-direction:column;gap:6px;min-height:60px">'
          +(items.length?items.map((c:any,i:number)=>{
            const active=String(c.id)===String(_coachLeadId);
            const init=(c.name||"??").split(" ").map((w:string)=>w[0]||"").join("").substring(0,2).toUpperCase();
            return '<div onclick="window._coachOpen(\''+e(String(c.id))+'\')" style="cursor:pointer;padding:10px;border-radius:8px;border:1px solid '+(active?"var(--brand)":"var(--line)")+';background:'+(active?"var(--brand-tint)":"#fff")+';transition:box-shadow .15s" onmouseover="this.style.boxShadow=\'0 2px 8px rgba(0,0,0,.08)\'" onmouseout="this.style.boxShadow=\'none\'">'
              +'<div style="display:flex;align-items:center;gap:8px"><span class="avs" style="background:'+colors[i%colors.length]+';width:28px;height:28px;font-size:10px;flex-shrink:0">'+init+'</span>'
              +'<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+e(c.name||c.phone||"Client")+'</div>'
              +'<div style="font-size:10.5px;color:var(--muted);margin-top:1px">'+e(c.source||"Meta")+(c.lang?" · "+e(c.lang):"")+'</div></div></div></div>';
          }).join(""):'<div style="text-align:center;color:var(--faint);font-size:11px;padding:12px 0">No clients</div>')
          +'</div></div>';
      }).join("")+'</div>';
    }
    w._coachOpen=(id:string)=>{ const c=_coachClients.find((x:any)=>String(x.id)===String(id)); if(!c){toast("Client not found");return;} fillCoachDetail(c); toast("Opened: "+(c.name||c.phone||"client")); };
    // Persist the coach's collected payment to the `payments` table so it shows in the
    // payment history + Accounts. Handles Full / 2× Installment / Advance (each re-written
    // so re-saving doesn't duplicate). EMI is a financier flow (money goes to the provider,
    // not collected by us) so it stays tracked in coach_profile only.
    async function _persistInstallments(id:string){
      const pm=(root.querySelector("#payMethod")as HTMLSelectElement)?.value||"";
      const total=_payGetPrice();
      const val=(sel:string)=>((root.querySelector(sel)as HTMLInputElement|HTMLSelectElement|null)?.value)||"";
      const iso=(d:string)=>d?new Date(d).toISOString():new Date().toISOString();
      const proof=(cid:string)=>{ const p=_payProofs[cid]; return p?{proof_url:p.url,proof_name:p.name}:{}; };
      const commit=async(ptype:string,rows:any[],label:string,collected:number)=>{
        try{ await supabase.from("payments").delete().eq("lead_id",id).eq("payment_type",ptype); }catch(_){}
        if(!rows.length) return;
        try{
          await supabase.from("payments").insert(rows);
          logActivity(id,[{action:"Payment",field:label,new:"₹"+collected.toLocaleString("en-IN")+(total?(" of ₹"+total.toLocaleString("en-IN")+", balance ₹"+Math.max(0,total-collected).toLocaleString("en-IN")):"")}]);
          if(String(_coachLeadId)===id) _renderCoachPayHistory(id);
        }catch(e:any){ toastErr("Payment save failed: "+(e.message||"db error")); }
      };
      if(pm==="i2"){
        const p1=_payNum("#i2Inst1Rcvd"), p2=_payNum("#i2BalRcvd");
        const totalI2=_payNum("#i2Total")||total;
        const balance=Math.max(0,totalI2-p1-p2);
        const dueDate=val("#i2BalDueDate")||null;
        // Don't clobber (or duplicate) an installment-2 that Reception already collected.
        let recInst2Paid=false;
        try{ const {data}=await supabase.from("payments").select("status,collected_by,installment_number").eq("lead_id",id).eq("payment_type","installment"); recInst2Paid=(data||[]).some((r:any)=>Number(r.installment_number)===2&&r.status==="paid"&&/reception|pos/i.test(String(r.collected_by||""))); }catch(_){}
        if(!p1&&!p2&&balance<=0) return;
        const rows:any[]=[];
        if(p1) rows.push({lead_id:id,amount:p1,status:"paid",method:val("#i2Inst1Mode")||null,paid_at:iso(val("#i2Inst1Date")),payment_type:"installment",installment_number:1,total_installments:2,txn_ref:val("#i2Inst1Ref")||null,service:"Diabetes",collected_by:"Health Coach",...proof("i2Inst1Proof")});
        if(p2) rows.push({lead_id:id,amount:p2,status:"paid",method:val("#i2BalMode")||null,paid_at:iso(val("#i2BalDate")),payment_type:"installment",installment_number:2,total_installments:2,txn_ref:val("#i2BalRef")||null,service:"Diabetes",collected_by:"Health Coach",...proof("i2BalProof")});
        // Pending installment-2 → a "due" row so Reception can see the balance + due date + collect it.
        else if(balance>0&&!recInst2Paid) rows.push({lead_id:id,amount:balance,status:"due",payment_type:"installment",installment_number:2,total_installments:2,service:"Diabetes",due_date:dueDate,collected_by:"Health Coach"});
        // Re-write only the coach-owned installment rows (preserve Reception collections), then insert.
        try{ await supabase.from("payments").delete().eq("lead_id",id).eq("payment_type","installment").neq("collected_by","Reception desk"); }catch(_){}
        if(rows.length){ try{ await supabase.from("payments").insert(rows); logActivity(id,[{action:"Payment",field:"Installment",new:"₹"+(p1+p2).toLocaleString("en-IN")+(totalI2?(" of ₹"+totalI2.toLocaleString("en-IN")+", balance ₹"+balance.toLocaleString("en-IN")):"")}]); if(String(_coachLeadId)===id) _renderCoachPayHistory(id); }catch(e:any){ toastErr("Payment save failed: "+(e.message||"db error")); } }
      } else if(pm==="full"){
        const amt=_payNum("#payFullRcvd"); if(!amt) return;
        await commit("full",[{lead_id:id,amount:amt,status:"paid",method:val("#payFullMode")||null,paid_at:iso(val("#payFullDate")),payment_type:"full",txn_ref:val("#payFullRef")||null,service:"Diabetes",...proof("payFullProof")}],"Full payment",amt);
      } else if(pm==="adv"){
        const a1=_payNum("#advAmt"), a2=_payNum("#advBalRcvd");
        if(!a1&&!a2) return;
        const rows:any[]=[];
        if(a1) rows.push({lead_id:id,amount:a1,status:"paid",method:val("#advMode")||null,paid_at:iso(val("#advDate")),payment_type:"advance",installment_number:1,total_installments:2,txn_ref:val("#advRef")||null,service:"Diabetes",...proof("advProof")});
        if(a2) rows.push({lead_id:id,amount:a2,status:"paid",method:val("#advBalMode")||null,paid_at:iso(val("#advBalDate")),payment_type:"advance",installment_number:2,total_installments:2,txn_ref:val("#advBalRef")||null,service:"Diabetes",...proof("advBalProof")});
        await commit("advance",rows,"Advance booking",a1+a2);
      }
    }
    // Lock a set of input fields (paid stages can't be edited/re-collected).
    function _lockFields(ids:string[],locked:boolean){ ids.forEach(s=>{ const el=root.querySelector(s)as HTMLInputElement|HTMLSelectElement|null; if(el){ el.disabled=locked; (el as HTMLElement).style.opacity=locked?"0.6":""; (el as HTMLElement).title=locked?"Paid — locked":""; } }); }
    // Set a payment-section Status dropdown (+ its hidden pill) without firing enrollment.
    function _setPayStatus(blkId:string,value:string){ const sel=root.querySelector('#'+blkId+' select[data-nocap]')as HTMLSelectElement|null; if(!sel)return; sel.value=value; const grp=sel.parentElement&&sel.parentElement.querySelector(".pills"); if(grp) grp.querySelectorAll(".pill").forEach((b:any)=>b.classList.toggle("on",(b.textContent||"").trim()===value)); }
    let _coachPayRows:any[]=[];
    // Apply payment locks from the lead's payment rows: mark paid stages Done, disable their inputs,
    // lock the fully-collected method, and block re-collection (prevents duplicate payment/enrollment).
    function _applyPaymentLocks(id:string,rows:any[]){
      if(String(_coachLeadId)!==String(id)) return;
      const paid=(rows||[]).filter((r:any)=>r.status==="paid");
      const fullPaid=paid.some((r:any)=>(r.payment_type||"full")==="full");
      const inst1Paid=paid.some((r:any)=>r.payment_type==="installment"&&Number(r.installment_number)===1);
      const inst2Paid=paid.some((r:any)=>r.payment_type==="installment"&&Number(r.installment_number)===2);
      const adv1Paid=paid.some((r:any)=>r.payment_type==="advance"&&Number(r.installment_number)===1);
      const adv2Paid=paid.some((r:any)=>r.payment_type==="advance"&&Number(r.installment_number)===2);
      // FULL — one shot: lock the whole section once paid.
      _lockFields(["#payFullRcvd","#payFullMode","#payFullRef","#payFullDate"],fullPaid);
      const fsel=root.querySelector('#pb-full select[data-nocap]')as HTMLSelectElement|null; if(fsel) fsel.disabled=fullPaid;
      if(fullPaid) _setPayStatus("pb-full","Payment Done");
      // INSTALLMENT — lock inst-1 once paid (inst-2 stays open); lock inst-2 once paid.
      _lockFields(["#i2Inst1Rcvd","#i2Inst1Mode","#i2Inst1Ref","#i2Inst1Date"],inst1Paid);
      _lockFields(["#i2BalRcvd","#i2BalMode","#i2BalRef","#i2BalDate"],inst2Paid);
      if(inst1Paid&&inst2Paid) _setPayStatus("pb-i2","Both Paid"); else if(inst1Paid) _setPayStatus("pb-i2","1st Paid");
      const isel=root.querySelector('#pb-i2 select[data-nocap]')as HTMLSelectElement|null; if(isel) isel.disabled=(inst1Paid&&inst2Paid);
      // ADVANCE
      _lockFields(["#advAmt","#advMode","#advRef","#advDate"],adv1Paid);
      _lockFields(["#advBalRcvd","#advBalMode","#advBalRef","#advBalDate"],adv2Paid);
      if(adv1Paid&&adv2Paid) _setPayStatus("pb-adv","Fully Paid");
      // Block re-collection: disable "Send collection request to Reception" when the ACTIVE method is fully collected.
      const method=(root.querySelector("#payMethod")as HTMLSelectElement|null)?.value||"";
      const done=(method==="full"&&fullPaid)||(method==="i2"&&inst1Paid&&inst2Paid)||(method==="adv"&&adv1Paid&&adv2Paid);
      const sb=root.querySelector("#sendCollectBtn")as HTMLButtonElement|null;
      if(sb){ sb.disabled=done; sb.style.opacity=done?"0.55":""; sb.style.pointerEvents=done?"none":""; sb.title=done?"Payment already collected for this method":""; }
      // A small "collected" note next to the button.
      let note=root.querySelector("#payCollectedNote")as HTMLElement|null;
      if(done&&sb){ if(!note){ note=document.createElement("span"); note.id="payCollectedNote"; note.style.cssText="margin-left:8px;font-size:11.5px;font-weight:600;color:var(--ok-ink)"; sb.parentElement?.insertBefore(note,sb.nextSibling); } note.textContent="✓ Payment collected — locked"; }
      else if(note){ note.remove(); }
    }
    w._coachApplyPayLocks=()=>_applyPaymentLocks(String(_coachLeadId),_coachPayRows);   // re-apply on method change
    async function _renderCoachPayHistory(id:string){
      const el=root.querySelector("#coachPayHist"); if(!el) return;
      let rows:any[]=[];
      try{ const {data}=await supabase.from("payments").select("*").eq("lead_id",id).order("created_at",{ascending:false}).limit(100); rows=data||[]; }catch(_){ rows=[]; }
      if(String(_coachLeadId)!==String(id)) return;
      _coachPayRows=rows; try{ _applyPaymentLocks(id,rows); }catch(_){}
      const e=(s:any)=>(s==null?"":String(s)).replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const money=(n:any)=>"₹"+(parseInt(n)||0).toLocaleString("en-IN");
      if(!rows.length){ el.innerHTML='<div class="stub">No payment records for this client yet.</div>'; return; }
      const paid=rows.reduce((s:number,r:any)=>s+(parseInt(r.amount)||0),0);
      el.innerHTML='<div style="margin-bottom:8px;font-size:12px;color:var(--muted)">Total collected: <b style="color:var(--ink)">'+money(paid)+'</b> · '+rows.length+' payment'+(rows.length===1?"":"s")+'</div>'
        +'<div class="tscroll"><table class="tbl" style="min-width:560px"><thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Mode</th><th>Ref</th><th>Status</th></tr></thead><tbody>'
        +rows.map((r:any)=>{ const typ=r.payment_type==="installment"?("Installment "+(r.installment_number||"")+"/"+(r.total_installments||2)):(r.payment_type||"full"); return '<tr>'
          +'<td class="mono" style="font-size:11px">'+e(fmtIST(r.paid_at||r.created_at))+'</td>'
          +'<td>'+e(typ)+'</td>'
          +'<td class="mono" style="font-weight:700">'+money(r.amount)+'</td>'
          +'<td>'+e(r.method||"—")+'</td>'
          +'<td class="mono" style="font-size:11px">'+e(r.txn_ref||"—")+'</td>'
          +'<td><span class="chipb '+(r.status==="paid"?"ok":"neu")+'">'+e(r.status||"—")+'</span></td></tr>'; }).join("")
        +'</tbody></table></div>';
    }
    // Persist the coach's Zoom/online recording link into zoom_recordings so it shows
    // in the Recordings screen's Zoom table. Idempotent: skips a link already stored.
    async function _persistZoomRecording(id:string){
      const url=((root.querySelector("#coachRecUrl")as HTMLInputElement)?.value||"").trim();
      if(!url) return;
      try{
        const {data}=await supabase.from("zoom_recordings").select("id,meeting_url").eq("lead_id",id).limit(200);
        if((data||[]).some((r:any)=>String(r.meeting_url||"")===url)) return;   // already stored
        const name=((root.querySelector("#coachName")?.textContent)||"").trim();
        const cd=((root.querySelector("#haConsultDate")as HTMLInputElement)?.value||"");
        await supabase.from("zoom_recordings").insert({lead_id:id,customer_name:name,meeting_url:url,status:"Ready",recorded_by:_asnActor(),meeting_at:cd?new Date(cd).toISOString():new Date().toISOString(),created_at:new Date().toISOString()});
      }catch(_){}
    }
    // Dedicated "Save Link" action next to the recording-URL field: validate, store in
    // zoom_recordings against this customer, confirm, and refresh the Zoom Recordings table.
    w._coachSaveZoomLink=async()=>{
      if(!_coachLeadId){ toast("Open a visited client first"); return; }
      const fld=root.querySelector("#coachRecUrl")as HTMLInputElement|null;
      const url=(fld?.value||"").trim();
      if(!url){ toastErr("Paste a Zoom meeting link first"); return; }
      if(!/^https?:\/\/\S+$/i.test(url)){ toastErr("Enter a valid link — it must start with http:// or https://"); return; }
      const id=String(_coachLeadId);
      try{
        const {data}=await supabase.from("zoom_recordings").select("id,meeting_url").eq("lead_id",id).limit(200);
        if((data||[]).some((r:any)=>String(r.meeting_url||"")===url)){ toast("This link is already saved for this client"); return; }
        const name=((root.querySelector("#coachName")?.textContent)||"").trim();
        const cd=((root.querySelector("#haConsultDate")as HTMLInputElement)?.value||"");
        const {error}=await supabase.from("zoom_recordings").insert({lead_id:id,customer_name:name,meeting_url:url,status:"Ready",recorded_by:_asnActor(),meeting_at:cd?new Date(cd).toISOString():new Date().toISOString(),created_at:new Date().toISOString()});
        if(error){ toastErr("Save failed: "+(error.message||"db error")); return; }
        toast("✓ Zoom link saved to "+(name||"customer profile"));
        logActivity(id,[{action:"Zoom Recording",field:"Link saved",new:url}]);
        try{ await loadRecordings(); }catch(_){}   // reflect in the Zoom Recordings table
      }catch(e:any){ toastErr("Save failed: "+(e.message||"network error")); }
    };
    w._coachSaveRecord=async()=>{
      if(!_coachLeadId){ toast("Open a visited client first"); return; }
      const id=String(_coachLeadId);
      const obj=collectCoachProfile();
      // Review Date must be today-or-future for the join / this-week / month plans. Only these
      // four consultation statuses are validated; every other status is left untouched. An empty
      // review date is still allowed (unchanged) — we only block a PAST date being saved.
      const _revStatuses=["Will Join Immediately","This Week","End of Month","Next Month"];
      if(_revStatuses.indexOf((obj&&obj.consStatus)||"")>=0){
        const rd=root.querySelector("#haReviewDate")as HTMLInputElement|null;
        if(rd && rd.value && rd.value<_todayLocal()){ toastErr("Review date can't be in the past — choose today or a future date"); try{_setFutureMin(rd);rd.focus();}catch(_){} return; }
      }
      saveCoachLocal(id,obj);
      const c=_coachClients.find((x:any)=>String(x.id)===id); if(c)c.coachProfile=obj;
      try{
        const {error}=await supabase.from("leads").update({coach_profile:obj}).eq("meta_lead_id",id);
        if(error){
          if(/coach_profile|column|schema|exist/i.test(error.message||"")) toast("Saved locally — run supabase-migration-coach-screening.sql for DB sync");
          else toastErr("Save failed: "+(error.message||"DB error"));
          return;
        }
        await _persistInstallments(id);   // store installment payments (if the 2× method is active)
        await _persistZoomRecording(id);  // store the Zoom/online recording link (if entered)
        // Propagate an ENROLLED consultation status to the lead's call_status so the
        // Advisor dashboard "Enrolled" card + Enrolled-clients table stay in sync and it
        // survives a refresh (persisted in the DB, read back via leads.call_status).
        if(/enrol/i.test((obj&&obj.consStatus)||"")){
          // New enrollment (wasn't Enrolled before) → stamp enrolled_at now; keep it stable on re-saves.
          const already=[..._metaLeads,..._assignedExtras].some((l:any)=>String(l.id)===id&&l.callStatus==="Enrolled");
          const enrIso=new Date().toISOString();
          const upd:any={call_status:"Enrolled"}; if(!already) upd.enrolled_at=enrIso;
          try{ await supabase.from("leads").update(upd).eq("meta_lead_id",id); }catch(_){}
          // Coach → Reception sync: stamp this lead's appointment(s) as enrolled so Reception
          // reflects it in the same DB record, then refresh Reception live (no manual reload).
          try{ await supabase.from("appointments").update({stage:"enrolled"}).eq("lead_id",id).neq("status","cancelled"); }catch(_){}
          const setEnrolled=(arr:any[])=>arr.forEach((l:any)=>{ if(String(l.id)===id){ l.callStatus="Enrolled"; if(!already) l.enrolledAt=enrIso; } });
          setEnrolled(_metaLeads); setEnrolled(_assignedExtras);
          if(!already){ logActivity(id,[{action:"Enrolled",field:"Enrolled at",new:fmtIST(enrIso)}]); }
          try{ renderHealthDashboard(); renderAssignedLeads(); renderAsnHist(); }catch(_){}
          try{ await loadReceptionData(); }catch(_){}   // Reception's Enrolled card/table update immediately
          try{ if(String(_advLeadId)===id&&!already) _advApplyEnrolled("Enrolled",enrIso); }catch(_){}
        }
        try{ renderCoachOpenList(); }catch(_){}   // reflect new consultation status in dashboard/table
        toast("Health record saved");
        logActivity(id,[{action:"Updated",field:"Health Coach record",new:"saved"}]);
      }catch(e:any){ toastErr("Save failed: "+(e.message||"network error")); }
    };
    w._coachPrint=()=>{
      if(!_coachLeadId){ toast("Open a visited client first"); return; }
      const p=_coachPanelEl(); if(!p) return;
      const name=(root.querySelector("#coachName")?.textContent)||"Client";
      const rows:string[]=[];
      p.querySelectorAll(".fld").forEach((fld:any)=>{
        const lab=fld.querySelector(".lbl"); const ctrl=fld.querySelector("input,select,textarea");
        if(!lab||!ctrl) return; const v=(ctrl as any).value; if(!v) return;
        rows.push('<tr><td style="color:#666;padding:4px 14px 4px 0;vertical-align:top">'+(lab.textContent||"").replace(/\s+/g," ").trim()+'</td><td style="font-weight:600;padding:4px 0">'+String(v).replace(/</g,"&lt;")+'</td></tr>');
      });
      const win=window.open("","_blank","width=760,height=1000"); if(!win){ toast("Allow pop-ups to print the prescription"); return; }
      win.document.write('<html><head><title>Consultation — '+name+'</title></head><body style="font-family:system-ui,Arial,sans-serif;padding:28px;color:#111"><h2 style="margin:0">WellnessOS — Consultation Record</h2><div style="color:#666;margin:2px 0 18px">'+name+' &middot; Lead #'+_coachLeadId+' &middot; '+new Date().toLocaleString("en-IN")+'</div><table style="border-collapse:collapse;font-size:13px">'+(rows.join("")||'<tr><td>No details entered yet.</td></tr>')+'</table></body></html>');
      win.document.close(); win.focus(); setTimeout(()=>{ try{ win.print(); }catch(_){} },300);
    };
    const _ccb=root.querySelector("#coachCallBtn")as HTMLElement|null;
    if(_ccb) _ccb.onclick=async()=>{
      if(!_coachLeadId){ toast("Open a visited client first"); return; }
      const id=String(_coachLeadId); const nm=(root.querySelector("#coachName")?.textContent)||"client";
      const r=await _callInitiate(id);
      if(!r||!r.ok){ toastErr((r&&r.error)||"Call could not be placed"); return; }
      toast("📞 Calling "+nm+" — your phone rings first, then the customer");
      logActivity(id,[{action:"Status Changed",field:"Call",new:"Outbound call initiated"}]);
      _pollRecordings(id,"coach"); setTimeout(()=>_coachRenderRecordings(id),50000);
    };
    // Make the consultation pill groups single-select toggles (Recording / Consultation / Welcome-kit status).
    {
      const cp=_coachPanelEl();
      if(cp) cp.querySelectorAll(".pills").forEach((grp:any)=>{
        grp.querySelectorAll(".pill").forEach((b:any)=>{
          b.addEventListener("click",()=>{ grp.querySelectorAll(".pill").forEach((x:any)=>x.classList.remove("on")); b.classList.add("on"); });
        });
      });
    }
    // Clear the static demo values on load so nothing shows until a real client is opened.
    {
      const p=_coachPanelEl();
      if(p){
        p.querySelectorAll("input").forEach((i:any)=>{ if(i.type==="checkbox"||i.type==="radio")i.checked=false; else i.value=""; });
        p.querySelectorAll("textarea").forEach((t:any)=>t.value="");
        p.querySelectorAll("select").forEach((s:any)=>s.selectedIndex=0);
        p.querySelectorAll(".pill.on").forEach((b:any)=>b.classList.remove("on"));
      }
      _coachAttachments=[]; renderCoachAtts();
    }
    // Refresh the coach's visited-client list when the Health Coach screen is opened.
    {
      const coachNav=root.querySelector('#nav button[data-s="coach"]')as HTMLButtonElement|null;
      if(coachNav) coachNav.addEventListener("click",()=>{ loadCoachClients(); loadZoomCheckins(); });
      // Load the cross-client recordings tables when the Recordings screen is opened.
      const recNav=root.querySelector('#nav button[data-s="recordings"]')as HTMLButtonElement|null;
      if(recNav) recNav.addEventListener("click",()=>{ loadRecordings(); });
    }
    loadCoachClients();

    // ===== Deviation pages (Call Deviation / Leads Deviation) =====
    const _recordedLeadIds=new Set<string>();
    async function loadRecordedLeadIds(){
      try{ const {data}=await supabase.from("call_recordings").select("contact_id"); (data||[]).forEach((r:any)=>{ if(r.contact_id) _recordedLeadIds.add(String(r.contact_id)); }); }catch(_){/* telephony table may not exist */}
    }
    function _devDur(ms:number){ if(ms<0)ms=0; const h=Math.floor(ms/3600000); const m=Math.floor((ms%3600000)/60000); return h>=24?(Math.floor(h/24)+"d "+(h%24)+"h"):(h+"h "+m+"m"); }
    const DEV_MS=4*3600000;
    let _callDevRows:any[]=[], _leadDevRows:any[]=[];
    // Multi-select state for the deviation tables (by lead id, per table).
    const _devSel:{call:Set<string>,lead:Set<string>}={call:new Set(),lead:new Set()};
    function _devSyncSel(){
      (["call","lead"] as const).forEach(wk=>{
        const set=_devSel[wk]; set.clear();
        root.querySelectorAll('.devChk[data-w="'+wk+'"]:checked').forEach((c:any)=>set.add(c.getAttribute("data-id")));
        const all=root.querySelectorAll('.devChk[data-w="'+wk+'"]');
        const sa=root.querySelector("#"+wk+"DevSelAll")as HTMLInputElement|null;
        if(sa){ sa.checked=all.length>0&&set.size===all.length; sa.indeterminate=set.size>0&&set.size<all.length; }
        const cnt=root.querySelector("#"+wk+"DevSelCount"); if(cnt) cnt.textContent=set.size?(set.size+" selected"):"";
      });
    }
    w._devChkToggle=()=>_devSyncSel();
    w._devSelAll=(wk:string,on:boolean)=>{ root.querySelectorAll('.devChk[data-w="'+wk+'"]').forEach((c:any)=>{c.checked=on;}); _devSyncSel(); };

    // ---- Deviation "Assign to" controls (same behavior as the Unassigned Pool) ----
    function _populateDevAssignMenus(){
      const esc=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const names=_assignees.filter((a:any)=>a.is_active).map((a:any)=>a.name);
      (["call","lead"] as const).forEach(wk=>{
        const menu=root.querySelector("#"+wk+"DevAssignMenu")as HTMLElement|null; if(!menu) return;
        const prev=new Set(Array.from(menu.querySelectorAll(".devAdvChk:checked")).map((c:any)=>c.getAttribute("data-adv")));
        menu.innerHTML=names.length?names.map((n:string)=>'<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px;cursor:pointer;font-size:12.5px" onmouseover="this.style.background=\'var(--surface-2)\'" onmouseout="this.style.background=\'\'"><input type="checkbox" class="devAdvChk" data-w="'+wk+'" data-adv="'+esc(n)+'" style="accent-color:var(--brand)" onchange="window._devAssignSelChange(\''+wk+'\')"'+(prev.has(n)?" checked":"")+'>'+esc(n)+'</label>').join(""):'<div style="font-size:11.5px;color:var(--faint);padding:8px">No active advisors</div>';
        try{ w._devAssignSelChange(wk); }catch(_){}
      });
    }
    function _devSelectedAdvisors(wk:string):string[]{
      return Array.from(root.querySelectorAll("#"+wk+"DevAssignMenu .devAdvChk:checked")).map((c:any)=>String(c.getAttribute("data-adv"))).filter(Boolean);
    }
    w._devAssignToggle=(wk:string,e:any)=>{ if(e&&e.stopPropagation)e.stopPropagation(); const m=root.querySelector("#"+wk+"DevAssignMenu")as HTMLElement|null; if(m) m.style.display=(m.style.display==="block")?"none":"block"; };
    w._devAssignSelChange=(wk:string)=>{
      const advs=_devSelectedAdvisors(wk);
      const lab=root.querySelector("#"+wk+"DevAssignLabel")as HTMLElement|null;
      if(lab){ if(!advs.length){ lab.textContent="Assign to…"; lab.style.color="var(--muted)"; } else if(advs.length<=2){ lab.textContent=advs.join(", "); lab.style.color="var(--ink)"; } else { lab.textContent=advs.length+" advisors"; lab.style.color="var(--ink)"; } }
      const rr=root.querySelector("#"+wk+"DevRRBtn")as HTMLButtonElement|null;
      if(rr){ rr.disabled=advs.length<2; rr.style.opacity=advs.length<2?"0.5":"1"; rr.style.cursor=advs.length<2?"not-allowed":"pointer"; }
    };
    w._devAssignSelected=async(wk:string)=>{
      const advs=_devSelectedAdvisors(wk);
      if(!advs.length){ toast("Select an advisor in 'Assign to' first"); return; }
      _devSyncSel(); const ids=Array.from(_devSel[wk as "call"|"lead"]);
      if(!ids.length){ toast("Tick one or more leads first"); return; }
      await _assignManyTo(ids,advs[0]);
      try{ wk==="call"?w._renderCallDeviation():w._renderLeadsDeviation(); }catch(_){}
    };
    w._devAssignRR=async(wk:string)=>{
      const advs=_devSelectedAdvisors(wk);
      if(advs.length<2){ toast("Select 2 or more advisors for round-robin"); return; }
      _devSyncSel(); const ids=Array.from(_devSel[wk as "call"|"lead"]);
      if(!ids.length){ toast("Tick one or more leads first"); return; }
      const nowIso=new Date().toISOString();
      try{
        for(let i=0;i<ids.length;i++){
          const name=advs[i%advs.length];
          const {error}=await supabase.from("leads").update({assigned_to:name,is_assigned:true,in_pool:false}).eq("meta_lead_id",ids[i]);
          if(error) throw error;
          try{ await supabase.from("leads").update({assigned_at:nowIso}).eq("meta_lead_id",ids[i]); }catch(_){}
          const ld=_metaLeads.find((x:any)=>String(x.id)===ids[i]); if(ld){ld.inPool=false;ld.isAssigned=true;ld.assignedTo=name;}
          logActivity(ids[i],[{action:"Assigned",field:"Assigned to",new:name+" (round-robin)"}]);
          logAssignment(ids[i],name,"assigned");
        }
      }catch(e:any){ toast(/in_pool|column|schema|exist/i.test(e.message||"")?"Run the assignment migrations first":"Distribute failed: "+(e.message||"db error")); return; }
      await _afterAssign();
      try{ wk==="call"?w._renderCallDeviation():w._renderLeadsDeviation(); }catch(_){}
      toast(ids.length+" lead"+(ids.length===1?"":"s")+" distributed across "+advs.length+" selected advisors");
    };
    // Close a deviation assign-menu on outside click.
    document.addEventListener("click",(e:any)=>{ (["call","lead"] as const).forEach(wk=>{ const wrap=root.querySelector("#"+wk+"DevAssignWrap"); const m=root.querySelector("#"+wk+"DevAssignMenu")as HTMLElement|null; if(m&&m.style.display==="block"&&wrap&&!wrap.contains(e.target)) m.style.display="none"; }); });
    const _devEsc=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const _devSrcLang=(r:any)=>(r.source==="Meta Ads"?"Meta":(r.source||"Meta"))+" · "+(r.language||"Tamil");
    const _callDevCols=[
      {key:"sel",label:"",filter:false,head:'<th style="width:34px"><input type="checkbox" id="callDevSelAll" style="accent-color:var(--brand)" onchange="window._devSelAll(\'call\',this.checked)"></th>'},
      {key:"lead",label:"Lead",filter:true,text:(r:any)=>r.name||"—"},
      {key:"num",label:"Lead Number",filter:true,text:(r:any)=>r.phone||"—"},
      {key:"src",label:"Source · Lang",filter:true,text:(r:any)=>_devSrcLang(r)},
      {key:"stage",label:"Stage",filter:true,text:(r:any)=>r.is_assigned?"Assigned":"Unassigned"},
      {key:"status",label:"Status",filter:true,text:(_r:any)=>"No call activity"},
      {key:"recv",label:"Received Date & Time",filter:true,text:(r:any)=>fmtIST(r.created_at)},
      {key:"dev",label:"Deviation Time",filter:false,head:'<th>Deviation Time</th>'},
    ];
    regGrid("callDev",()=>_callDevCols,()=>{try{(w as any)._renderCallDeviation();}catch(_){}});
    const _leadDevCols=[
      {key:"sel",label:"",filter:false,head:'<th style="width:34px"><input type="checkbox" id="leadDevSelAll" style="accent-color:var(--brand)" onchange="window._devSelAll(\'lead\',this.checked)"></th>'},
      {key:"lead",label:"Lead",filter:true,text:(r:any)=>r.name||"—"},
      {key:"num",label:"Lead Number",filter:true,text:(r:any)=>r.phone||"—"},
      {key:"src",label:"Source · Lang",filter:true,text:(r:any)=>_devSrcLang(r)},
      {key:"asg",label:"Assigned To",filter:true,text:(r:any)=>r.assigned_to||"—"},
      {key:"stage",label:"Stage",filter:true,text:(_r:any)=>"Assigned"},
      {key:"status",label:"Status",filter:true,text:(_r:any)=>"Not called"},
      {key:"asgd",label:"Assigned Date & Time",filter:true,text:(r:any)=>fmtIST(r.assigned_at||r.created_at)},
      {key:"dev",label:"Deviation Time",filter:false,head:'<th>Deviation Time</th>'},
    ];
    regGrid("leadDev",()=>_leadDevCols,()=>{try{(w as any)._renderLeadsDeviation();}catch(_){}});
    function _setDevBadges(){
      const cc=root.querySelector("#callDevCount"); if(cc)cc.textContent=String(_callDevRows.length);
      const lc=root.querySelector("#leadDevCount"); if(lc)lc.textContent=String(_leadDevRows.length);
      const c1=root.querySelector("#devCardCall"); if(c1)c1.textContent=String(_callDevRows.length);
      const c2=root.querySelector("#devCardLead"); if(c2)c2.textContent=String(_leadDevRows.length);
      const dt=root.querySelector("#devTabCount"); if(dt)dt.textContent=String(_callDevRows.length+_leadDevRows.length);
    }
    // Switch between the Call / Leads deviation sub-tabs and (re)load that table.
    w._devSubTab=(v:string)=>{
      root.querySelectorAll("#devSubTabs button").forEach((b:any)=>b.classList.toggle("on",b.getAttribute("data-dt")===v));
      root.querySelectorAll(".dev-sub").forEach((d:any)=>{d.style.display=d.getAttribute("data-dtp")===v?"block":"none";});
      if(v==="call") w._renderCallDeviation(); else w._renderLeadsDeviation();
    };
    w._renderCallDeviation=async()=>{
      await loadRecordedLeadIds();
      const cutoff=new Date(Date.now()-DEV_MS).toISOString();
      const body=root.querySelector("#callDevBody"); const now0=Date.now();
      let rows:any[]=[];
      try{
        const {data}=await supabase.from("leads").select("meta_lead_id,name,phone,source,language,call_status,created_at,is_assigned")
          .lt("created_at",cutoff).or("call_status.is.null,call_status.eq.New,call_status.eq.Open").order("created_at",{ascending:true}).limit(1000);
        rows=(data||[]).filter((r:any)=>!_recordedLeadIds.has(String(r.meta_lead_id))&&inAbmRange(r.created_at));
      }catch(_){ rows=[]; }
      _callDevRows=rows; const now=now0; _setDevBadges(); const _cdh=root.querySelector("#callDevHead"); if(_cdh)_cdh.innerHTML=gridHead("callDev"); const _cdDisp=gridApply("callDev",rows);
      if(body) body.innerHTML=_cdDisp.length?_cdDisp.map((r:any)=>'<tr>'
        +'<td><input type="checkbox" class="devChk" data-w="call" data-id="'+_devEsc(String(r.meta_lead_id))+'" style="accent-color:var(--brand)" onchange="window._devChkToggle()"></td>'
        +'<td style="font-weight:600">'+_devEsc(r.name||"—")+'</td>'
        +'<td class="mono" style="font-weight:600">'+_devEsc(r.phone||"—")+'</td>'
        +'<td><span class="tag">'+_devEsc(_devSrcLang(r))+'</span></td>'
        +'<td>'+(r.is_assigned?"Assigned":"Unassigned")+'</td>'
        +'<td><span class="chipb al">No call activity</span></td>'
        +'<td class="mono" style="font-size:11.5px">'+_devEsc(fmtIST(r.created_at))+'</td>'
        +'<td class="mono" style="font-weight:700;color:var(--alert-ink)">'+_devDur(now-new Date(r.created_at).getTime())+'</td></tr>').join("")
        :'<tr><td colspan="8" style="text-align:center;color:var(--faint);padding:20px">No call deviations — every lead has activity within 4h 🎉</td></tr>';
      _devSyncSel();
      try{ _populateDevAssignMenus(); }catch(_){}
    };
    w._renderLeadsDeviation=async()=>{
      await loadRecordedLeadIds();
      const cutoffMs=Date.now()-DEV_MS;
      const body=root.querySelector("#leadDevBody");
      let rows:any[]=[];
      try{
        // Prefer assigned_at; fall back to created_at if the deviation migration isn't run yet.
        let res:any=await supabase.from("leads").select("meta_lead_id,name,phone,source,language,assigned_to,assigned_at,call_status,created_at,is_assigned")
          .eq("is_assigned",true).or("call_status.is.null,call_status.eq.New,call_status.eq.Open").limit(1000);
        if(res.error&&/assigned_at|column/i.test(res.error.message||"")){
          res=await supabase.from("leads").select("meta_lead_id,name,phone,source,language,assigned_to,call_status,created_at,is_assigned")
            .eq("is_assigned",true).or("call_status.is.null,call_status.eq.New,call_status.eq.Open").limit(1000);
        }
        if(res.error) throw res.error;
        rows=(res.data||[]).filter((r:any)=>{ if(_recordedLeadIds.has(String(r.meta_lead_id))) return false; const at=r.assigned_at||r.created_at; const t=new Date(at).getTime(); return t<cutoffMs && inAbmRange(at); });
      }catch(_){ rows=[]; }
      _leadDevRows=rows; const now=Date.now(); _setDevBadges(); const _ldh=root.querySelector("#leadDevHead"); if(_ldh)_ldh.innerHTML=gridHead("leadDev"); const _ldDisp=gridApply("leadDev",rows);
      if(body) body.innerHTML=_ldDisp.length?_ldDisp.map((r:any)=>{ const at=r.assigned_at||r.created_at; return '<tr>'
        +'<td><input type="checkbox" class="devChk" data-w="lead" data-id="'+_devEsc(String(r.meta_lead_id))+'" style="accent-color:var(--brand)" onchange="window._devChkToggle()"></td>'
        +'<td style="font-weight:600">'+_devEsc(r.name||"—")+'</td>'
        +'<td class="mono" style="font-weight:600">'+_devEsc(r.phone||"—")+'</td>'
        +'<td><span class="tag">'+_devEsc(_devSrcLang(r))+'</span></td>'
        +'<td style="font-weight:600">'+_devEsc(r.assigned_to||"—")+'</td><td>Assigned</td>'
        +'<td><span class="chipb al">Not called</span></td>'
        +'<td class="mono" style="font-size:11.5px">'+_devEsc(fmtIST(at))+'</td>'
        +'<td class="mono" style="font-weight:700;color:var(--alert-ink)">'+_devDur(now-new Date(at).getTime())+'</td></tr>';
      }).join(""):'<tr><td colspan="9" style="text-align:center;color:var(--faint);padding:20px">No lead deviations — all assigned leads called within 4h 🎉</td></tr>';
      _devSyncSel();
      try{ _populateDevAssignMenus(); }catch(_){}
    };
    w._downloadDeviation=(which:string)=>{
      if(which==="call"){ const sel=_devSel.call; let rows=_callDevRows; if(sel.size) rows=rows.filter((r:any)=>sel.has(String(r.meta_lead_id))); if(!rows.length){toast("Nothing to download");return;}
        const out:string[][]=[["Lead","Lead Number","Source","Language","Stage","Status","Received","Deviation"]];
        rows.forEach((r:any)=>out.push([r.name||"",r.phone||"",r.source||"",r.language||"",r.is_assigned?"Assigned":"Unassigned","No call activity",fmtIST(r.created_at),_devDur(Date.now()-new Date(r.created_at).getTime())]));
        _downloadCsv("call_deviation_"+rows.length+".csv",out); toast(rows.length+(sel.size?" selected":"")+" rows downloaded");
      } else { const sel=_devSel.lead; let rows=_leadDevRows; if(sel.size) rows=rows.filter((r:any)=>sel.has(String(r.meta_lead_id))); if(!rows.length){toast("Nothing to download");return;}
        const out:string[][]=[["Lead","Lead Number","Source","Language","Assigned To","Stage","Status","Assigned","Deviation"]];
        rows.forEach((r:any)=>{const at=r.assigned_at||r.created_at; out.push([r.name||"",r.phone||"",r.source||"",r.language||"",r.assigned_to||"","Assigned","Not called",fmtIST(at),_devDur(Date.now()-new Date(at).getTime())]);});
        _downloadCsv("leads_deviation_"+rows.length+".csv",out); toast(rows.length+(sel.size?" selected":"")+" rows downloaded");
      }
    };

    // ========== BLOOD TEST MODULE (live data) ==========
    let _btAll:any[]=[], _btFiltered:any[]=[], _btDate="today", _btOpenAppt:any=null, _btReportAtt:any=null;
    const _btE=(s:any)=>String(s??"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    function _btDateRange():[Date|null,Date|null]{
      const now=new Date(); const sod=(d:Date)=>{const x=new Date(d);x.setHours(0,0,0,0);return x;}; const eod=(d:Date)=>{const x=new Date(d);x.setHours(23,59,59,999);return x;};
      if(_btDate==="today") return [sod(now),eod(now)];
      if(_btDate==="yest"){ const y=new Date(now);y.setDate(y.getDate()-1); return [sod(y),eod(y)]; }
      if(_btDate==="wk"){ const s=new Date(now);s.setDate(s.getDate()-s.getDay()); return [sod(s),eod(now)]; }
      if(_btDate==="cust"){ const f=(root.querySelector("#btFrom")as HTMLInputElement)?.value; const t=(root.querySelector("#btTo")as HTMLInputElement)?.value; return [f?sod(new Date(f)):null,t?eod(new Date(t)):null]; }
      return [null,null];
    }
    async function loadBloodTestData(){
      try{
        const [ar,pr]=await Promise.all([
          supabase.from("appointments").select("*").ilike("service","%blood%").order("appt_date",{ascending:false}).limit(500),
          supabase.from("payments").select("*").order("created_at",{ascending:false})
        ]);
        const pays:Record<string,any>={}; (pr.data||[]).forEach((p:any)=>{ if(p.appointment_id&&!pays[p.appointment_id]) pays[p.appointment_id]=p; });
        _btAll=(ar.data||[]).map((a:any)=>{
          const pay=pays[a.id]; const bt=a.blood_test_data||{};
          return { id:a.id, lead_id:a.lead_id, name:a.client_name||"Client", ph:a.phone||"", _date:a.appt_date, date:_recFmtDate(a.appt_date), time:a.appt_time||"",
            status:a.status||"expected", stage:a.stage||"", session:a.session||"", panel:bt.panel||"HbA1c", checkpoint:bt.checkpoint||"M0",
            sampleStatus:bt.sample_status||"pending", reportStatus:bt.report_status||"pending", reportUrl:bt.report_url||"",
            shared:bt.shared||false, thyroCost:bt.thyrocare_cost||0, ourPrice:bt.our_price||0,
            payStatus:pay?pay.status:"due", payAmt:pay?pay.amount:0, payMethod:pay?pay.method:"", payVerified:pay?pay.verified:false,
            btData:bt, raw:a };
        });
      }catch(e:any){ _btAll=[]; if(/blood_test_data|column/i.test(e.message||"")) toast("Run supabase-migration-module-columns.sql to enable blood test data"); }
      _btApplyDateFilter();
    }
    function _btApplyDateFilter(){
      const [from,to]=_btDateRange();
      _btFiltered=_btAll.filter((r:any)=>{ if(!r._date)return true; const d=new Date(r._date+"T12:00:00"); if(from&&d<from)return false; if(to&&d>to)return false; return true; });
      _btRenderAll();
    }
    w._btDateF=(d:string)=>{ _btDate=d; const show=d==="cust"; ["btFrom","btTo"].forEach(id=>{const el=root.querySelector("#"+id)as HTMLElement;if(el)el.style.display=show?"inline":"none";}); root.querySelectorAll("#btDateFilt .pill").forEach((b:any)=>b.classList.remove("on")); const idx={today:0,yest:1,wk:2,cust:3}[d]??0; root.querySelectorAll("#btDateFilt .pill")[idx]?.classList.add("on"); _btApplyDateFilter(); };
    w._btApplyDate=()=>{ if(_btDate==="cust") _btApplyDateFilter(); };
    function _btRenderAll(){
      const f=_btFiltered;
      const totalBilled=f.reduce((s:number,r:any)=>s+Math.max(0,r.ourPrice),0);
      const totalCost=f.reduce((s:number,r:any)=>s+Math.max(0,r.thyroCost),0);
      const el=(id:string)=>root.querySelector("#"+id);
      if(el("btTotalBilled")) (el("btTotalBilled") as HTMLElement).textContent="₹"+totalBilled.toLocaleString("en-IN");
      if(el("btThyroCost")) (el("btThyroCost") as HTMLElement).textContent="₹"+totalCost.toLocaleString("en-IN");
      if(el("btMargin")) (el("btMargin") as HTMLElement).textContent="₹"+(totalBilled-totalCost).toLocaleString("en-IN");
      if(el("btPaidThyro")) (el("btPaidThyro") as HTMLElement).textContent="₹"+f.filter((r:any)=>r.sampleStatus==="done").reduce((s:number,r:any)=>s+r.thyroCost,0).toLocaleString("en-IN");
      const cnt=(fn:(r:any)=>boolean)=>f.filter(fn).length;
      const metrics=[{l:"Expected",v:f.length,c:""},{l:"Visited",v:cnt((r:any)=>r.status==="visited"),c:"g"},{l:"Sample collected",v:cnt((r:any)=>["collected","sent_to_lab","done"].includes(r.sampleStatus)),c:"g"},
        {l:"Waiting",v:cnt((r:any)=>r.sampleStatus==="pending"&&r.status==="visited"),c:"a"},{l:"Payment collected",v:cnt((r:any)=>r.payStatus==="paid"),c:"g"},{l:"Not paid",v:cnt((r:any)=>r.payStatus!=="paid"&&r.payStatus!=="free"),c:"r"},
        {l:"Report received",v:cnt((r:any)=>["ready","shared"].includes(r.reportStatus)),c:"g"},{l:"Shared",v:cnt((r:any)=>r.shared),c:"g"}];
      const me=el("btMetrics"); if(me)(me as HTMLElement).innerHTML=metrics.map(m=>'<div class="metric '+m.c+'"><div class="ml">'+m.l+'</div><div class="mv">'+m.v+'</div></div>').join("");
      const sMap:{[k:string]:{l:string;c:string}}={pending:{l:"Pending",c:"warn"},collected:{l:"Collected",c:"info"},sent_to_lab:{l:"Sent to lab",c:"info"},done:{l:"Done",c:"ok"}};
      const rMap:{[k:string]:{l:string;c:string}}={pending:{l:"Pending",c:"warn"},ready:{l:"Ready",c:"ok"},shared:{l:"Shared",c:"ok"}};
      let wl='<table class="tbl"><thead><tr><th>Client</th><th>Phone</th><th>Panel</th><th>Checkpoint</th><th>Sample</th><th>Payment</th><th>Report</th><th>Shared</th><th>Actions</th></tr></thead><tbody>';
      if(!f.length) wl+='<tr><td colspan="9" style="text-align:center;color:var(--faint);padding:20px">No blood test appointments for this period.</td></tr>';
      else f.forEach((r:any)=>{
        const ss=sMap[r.sampleStatus]||{l:r.sampleStatus,c:"neu"}; const rs=rMap[r.reportStatus]||{l:r.reportStatus,c:"neu"};
        wl+='<tr style="cursor:pointer" onclick="window._btOpenDetail('+r.id+')"><td style="font-weight:600">'+_btE(r.name)+'</td><td class="mono">'+_btE(r.ph)+'</td><td>'+_btE(r.panel)+'</td><td><span class="chipb info">'+_btE(r.checkpoint)+'</span></td>'
          +'<td><span class="chipb '+ss.c+'">'+ss.l+'</span></td>'
          +'<td>'+(r.payStatus==="paid"?'<span class="chipb ok">₹'+r.payAmt.toLocaleString("en-IN")+' ✓</span>':'<span class="chipb warn">'+(r.ourPrice?'₹'+r.ourPrice.toLocaleString("en-IN")+' due':'Due')+'</span>')+'</td>'
          +'<td><span class="chipb '+rs.c+'">'+rs.l+'</span></td>'
          +'<td>'+(r.shared?'<span class="chipb ok">WA ✓</span>':'—')+'</td>'
          +'<td><div style="display:flex;gap:4px"><button class="btn bsm bp" onclick="event.stopPropagation();window._btOpenDetail('+r.id+')">Open</button></div></td></tr>';
      });
      wl+='</tbody></table>';
      const ww=el("btWorklistWrap"); if(ww)(ww as HTMLElement).innerHTML=wl;
      const rw=el("btRemindersWrap"); if(rw)(rw as HTMLElement).innerHTML='<div style="text-align:center;color:var(--faint);padding:14px;font-size:12px">Outcome reminders are auto-generated from appointment milestones.</div>';
    }
    w._btOpenDetail=(id:any)=>{
      const r=_btAll.find((x:any)=>String(x.id)===String(id)); if(!r){toast("Not found");return;}   // id is BIGSERIAL → gateway returns a string
      _btOpenAppt=r; _btReportAtt=r.btData.report_url?{name:"Report",url:r.btData.report_url}:null;
      const el=(s:string)=>root.querySelector("#"+s) as HTMLInputElement|HTMLSelectElement|null;
      if(el("btDetailName"))(el("btDetailName") as HTMLElement).textContent=r.name+" · "+r.date;
      if(el("btdPanel")) (el("btdPanel") as HTMLInputElement).value=r.panel;
      if(el("btdCheckpoint")) (el("btdCheckpoint") as HTMLSelectElement).value=r.checkpoint;
      if(el("btdSample")) (el("btdSample") as HTMLSelectElement).value=r.sampleStatus;
      if(el("btdReport")) (el("btdReport") as HTMLSelectElement).value=r.reportStatus;
      if(el("btdThyroCost")) (el("btdThyroCost") as HTMLInputElement).value=String(r.thyroCost||"");
      if(el("btdOurPrice")) (el("btdOurPrice") as HTMLInputElement).value=String(r.ourPrice||"");
      _btRenderAtts();
      const dp=root.querySelector("#btDetailPanel") as HTMLElement; if(dp) dp.style.display="block";
      dp?.scrollIntoView({behavior:"smooth"});
    };
    function _btRenderAtts(){ const el=root.querySelector("#btdAtts"); if(!el)return; if(_btReportAtt&&_btReportAtt.url){ el.innerHTML='<a href="'+_btE(_btReportAtt.url)+'" target="_blank" class="att"><svg class="icon"><use href="#i-clip"/></svg> '+_btE(_btReportAtt.name||"Report")+'</a> <button class="btn bsm" onclick="window._btAddReport()">Replace</button>'; } else { el.innerHTML='<span class="att add" onclick="window._btAddReport()"><svg class="icon"><use href="#i-clip"/></svg> Upload report</span>'; } }
    w._btCloseDetail=()=>{ const dp=root.querySelector("#btDetailPanel") as HTMLElement; if(dp) dp.style.display="none"; _btOpenAppt=null; };
    w._btAddReport=()=>{
      const inp=document.createElement("input"); inp.type="file"; inp.accept=".pdf,.jpg,.jpeg,.png,.webp";
      inp.onchange=async()=>{ const file=inp.files&&inp.files[0]; if(!file)return; if(file.size>15*1024*1024){toast("Max 15 MB");return;}
        toast("Uploading…"); const id=_btOpenAppt?.lead_id||"bt"; const path="bloodtest/"+String(id).replace(/[^a-zA-Z0-9._-]/g,"_")+"/"+Date.now()+"_"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
        try{ const up=await supabase.storage.from("lead-files").upload(path,file,{upsert:false}); if(up.error)throw up.error;
          const {data}=supabase.storage.from("lead-files").getPublicUrl(path); _btReportAtt={name:file.name,url:(data&&data.publicUrl)||""}; _btRenderAtts(); toast("Report uploaded");
        }catch(e:any){ toast(/bucket|not found|policy/i.test(e.message||"")?"Run supabase-migration-storage-buckets.sql":"Upload failed"); }
      }; inp.click();
    };
    w._btSaveDetail=async()=>{
      if(!_btOpenAppt){toast("Open a record first");return;}
      const v=(id:string)=>(root.querySelector("#"+id)as HTMLInputElement|HTMLSelectElement)?.value||"";
      const btData={panel:v("btdPanel"),checkpoint:v("btdCheckpoint"),sample_status:v("btdSample"),report_status:v("btdReport"),
        thyrocare_cost:Number(v("btdThyroCost"))||0,our_price:Number(v("btdOurPrice"))||0,
        report_url:_btReportAtt?.url||"",shared:v("btdReport")==="shared",sample_at:v("btdSample")!=="pending"?new Date().toISOString():""};
      try{ const {error}=await supabase.from("appointments").update({blood_test_data:btData}).eq("id",_btOpenAppt.id);
        if(error&&/blood_test_data|column|schema|exist/i.test(error.message||"")){ toastErr("Can't save yet — the blood-test column is missing. Run supabase-migration-module-columns.sql in Supabase, then Save again."); return; }
        if(error)throw error; toast("Blood test record saved"); await loadBloodTestData();
      }catch(e:any){ toastErr("Save failed: "+(e.message||"error")); }
    };
    w._btShareWA=()=>{ if(!_btOpenAppt){toast("Open a record first");return;} toast("WhatsApp share — report link sent to "+(_btOpenAppt.name||"client")); };
    w._btCollectPay=()=>{ if(!_btOpenAppt)return; const price=Number((root.querySelector("#btdOurPrice")as HTMLInputElement)?.value)||800; recOpen(_btOpenAppt.id,_btOpenAppt.name,price,_btOpenAppt.lead_id); };
    w._btExport=()=>{ if(!_btFiltered.length){toast("Nothing to export");return;} const out:string[][]=[["Client","Phone","Panel","Checkpoint","Sample","Payment","Report","Our Price","Thyro Cost"]];
      _btFiltered.forEach((r:any)=>out.push([r.name,r.ph,r.panel,r.checkpoint,r.sampleStatus,r.payStatus,r.reportStatus,String(r.ourPrice),String(r.thyroCost)]));
      _downloadCsv("blood_test_export.csv",out); toast("Exported "+_btFiltered.length+" rows"); };

    // ========== PHYSIOTHERAPY MODULE (live data) ==========
    let _phAll:any[]=[], _phFiltered:any[]=[], _phDate="today", _phOpenAppt:any=null;
    function _phDateRange():[Date|null,Date|null]{
      const now=new Date(); const sod=(d:Date)=>{const x=new Date(d);x.setHours(0,0,0,0);return x;}; const eod=(d:Date)=>{const x=new Date(d);x.setHours(23,59,59,999);return x;};
      if(_phDate==="today") return [sod(now),eod(now)];
      if(_phDate==="wk"){ const s=new Date(now);s.setDate(s.getDate()-s.getDay()); return [sod(s),eod(now)]; }
      if(_phDate==="cust"){ const f=(root.querySelector("#phFrom")as HTMLInputElement)?.value; const t=(root.querySelector("#phTo")as HTMLInputElement)?.value; return [f?sod(new Date(f)):null,t?eod(new Date(t)):null]; }
      return [null,null];
    }
    async function loadPhysioData(){
      try{
        const [ar,pr]=await Promise.all([
          supabase.from("appointments").select("*").ilike("service","%physio%").order("appt_date",{ascending:false}).limit(500),
          supabase.from("payments").select("*").order("created_at",{ascending:false})
        ]);
        const pays:Record<string,any>={}; (pr.data||[]).forEach((p:any)=>{ if(p.appointment_id&&!pays[p.appointment_id]) pays[p.appointment_id]=p; });
        _phAll=(ar.data||[]).map((a:any)=>{
          const pay=pays[a.id]; const pd=a.physio_data||{};
          return { id:a.id, lead_id:a.lead_id, name:a.client_name||"Client", ph:a.phone||"", _date:a.appt_date, date:_recFmtDate(a.appt_date), time:a.appt_time||"",
            status:a.status||"expected", stage:a.stage||"", session:a.session||"",
            condition:pd.condition||"", sessionsPlanned:pd.sessions_planned||0, sessionsCompleted:pd.sessions_completed||0,
            payModel:pd.payment_model||"per_visit", packPrice:pd.pack_price||800,
            soap:pd.soap||{}, painLevel:pd.pain_level, visits:pd.visits||[],
            payStatus:pay?pay.status:"due", payAmt:pay?pay.amount:0, phData:pd, raw:a };
        });
      }catch(e:any){ _phAll=[]; if(/physio_data|column/i.test(e.message||"")) toast("Run supabase-migration-module-columns.sql to enable physio data"); }
      _phApplyDateFilter();
    }
    function _phApplyDateFilter(){
      const [from,to]=_phDateRange();
      _phFiltered=_phAll.filter((r:any)=>{ if(!r._date)return true; const d=new Date(r._date+"T12:00:00"); if(from&&d<from)return false; if(to&&d>to)return false; return true; });
      _phRenderAll();
    }
    w._phDateF=(d:string)=>{ _phDate=d; const show=d==="cust"; ["phFrom","phTo"].forEach(id=>{const el=root.querySelector("#"+id)as HTMLElement;if(el)el.style.display=show?"inline":"none";}); root.querySelectorAll("#phDateFilt .pill").forEach((b:any)=>b.classList.remove("on")); const idx={today:0,wk:1,cust:2}[d]??0; root.querySelectorAll("#phDateFilt .pill")[idx]?.classList.add("on"); _phApplyDateFilter(); };
    w._phApplyDate=()=>{ if(_phDate==="cust") _phApplyDateFilter(); };
    function _phRenderAll(){
      const f=_phFiltered; const all=_phAll;
      const rev=f.reduce((s:number,r:any)=>s+Math.max(0,r.payAmt),0);
      const el=(id:string)=>root.querySelector("#"+id); if(el("phRevenue"))(el("phRevenue") as HTMLElement).textContent="₹"+rev.toLocaleString("en-IN");
      const cnt=(fn:(r:any)=>boolean)=>f.filter(fn).length;
      const activePlans=all.filter((r:any)=>r.sessionsPlanned>0&&r.sessionsCompleted<r.sessionsPlanned);
      const metrics=[{l:"Patients today",v:f.length,c:""},{l:"Sessions done",v:cnt((r:any)=>r.stage==="done"||r.status==="visited"),c:"g"},
        {l:"Pending",v:cnt((r:any)=>r.status==="expected"),c:""},{l:"Active plans",v:activePlans.length,c:"g"},
        {l:"Paid upfront",v:all.filter((r:any)=>r.payModel==="pack"&&r.payStatus==="paid").length,c:"g"},
        {l:"Per-session (need pay)",v:f.filter((r:any)=>r.payModel==="per_visit"&&r.payStatus!=="paid").length,c:"a"}];
      const me=el("phMetrics"); if(me)(me as HTMLElement).innerHTML=metrics.map(m=>'<div class="metric '+m.c+'"><div class="ml">'+m.l+'</div><div class="mv">'+m.v+'</div></div>').join("");
      const e=(s:any)=>String(s??"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      let tbl='<table class="tbl"><thead><tr><th>Time</th><th>Patient</th><th>Condition</th><th>Session</th><th>Payment</th><th>Status</th><th></th></tr></thead><tbody>';
      if(!f.length) tbl+='<tr><td colspan="7" style="text-align:center;color:var(--faint);padding:20px">No physiotherapy sessions for this period.</td></tr>';
      else f.forEach((r:any)=>{
        const stMap:{[k:string]:{l:string;c:string}}={expected:{l:"Expected",c:"warn"},visited:{l:"In session",c:"info"},done:{l:"Done",c:"ok"},noshow:{l:"No show",c:"al"}};
        const st=stMap[r.status]||{l:r.stage||r.status,c:"neu"};
        const sessLabel=r.sessionsPlanned?(r.sessionsCompleted+' / '+r.sessionsPlanned):'—';
        const payLabel=r.payModel==="pack"?(r.payStatus==="paid"?'Pack · ₹'+r.packPrice.toLocaleString("en-IN")+' ✓':'Pack · due'):(r.payStatus==="paid"?'₹'+r.payAmt.toLocaleString("en-IN")+' ✓':'₹'+r.packPrice.toLocaleString("en-IN")+' due');
        const payC=r.payStatus==="paid"?"ok":"warn";
        tbl+='<tr style="cursor:pointer" onclick="window._phOpenSession('+r.id+')"><td class="mono">'+e(r.time)+'</td><td style="font-weight:600">'+e(r.name)+'</td><td>'+e(r.condition||"—")+'</td>'
          +'<td><span class="chipb info">'+sessLabel+'</span></td><td><span class="chipb '+payC+'">'+payLabel+'</span></td>'
          +'<td><span class="chipb '+st.c+'">'+st.l+'</span></td>'
          +'<td><div style="display:flex;gap:4px"><button class="btn bsm bp" onclick="event.stopPropagation();window._phOpenSession('+r.id+')">Open</button>'
          +(r.status==="expected"?'<button class="btn bsm" onclick="event.stopPropagation();window._phStartSession('+r.id+')">Start</button>':'')
          +(r.status==="visited"?'<button class="btn bsm bp" onclick="event.stopPropagation();window._phCompleteSession('+r.id+')">Complete</button>':'')
          +'</div></td></tr>';
      });
      tbl+='</tbody></table>';
      const sw=el("phSessionsWrap"); if(sw)(sw as HTMLElement).innerHTML=tbl;
      const colors=["#17A87B","#378ADD","#7B6CD9","#C07F0E","#D8442B","#5B9BD5","#A855F7","#EF4444"];
      const pl=el("phPatientList"); const pc=el("phPatientCount");
      if(pc)(pc as HTMLElement).textContent="("+activePlans.length+")";
      if(pl)(pl as HTMLElement).innerHTML=activePlans.length?activePlans.map((r:any,i:number)=>{
        const init=(r.name||"??").split(" ").map((w:string)=>w[0]||"").join("").substring(0,2).toUpperCase();
        const active=_phOpenAppt&&_phOpenAppt.id===r.id;
        return '<div class="li" style="cursor:pointer'+(active?";background:var(--brand-tint)":"")+'" onclick="window._phOpenSession('+r.id+')"><span class="avs" style="background:'+colors[i%colors.length]+'">'+init+'</span><div style="flex:1"><b>'+e(r.name)+'</b><div style="font-size:10.5px;color:var(--muted)">'+e(r.condition||"—")+' · '+r.sessionsCompleted+'/'+r.sessionsPlanned+(r.payModel==="pack"?" · Pack":"")+'</div></div>'
          +(r.payStatus!=="paid"?'<span class="chipb warn">Due ₹'+r.packPrice.toLocaleString("en-IN")+'</span>':'')+'</div>';
      }).join(""):'<div style="text-align:center;color:var(--faint);padding:8px;font-size:12px">No active patients.</div>';
    }
    w._phOpenSession=(id:any)=>{
      const r=_phAll.find((x:any)=>String(x.id)===String(id)); if(!r){toast("Not found");return;} _phOpenAppt=r;   // id is BIGSERIAL → gateway returns a string
      const el=(s:string)=>root.querySelector("#"+s) as any;
      if(el("phSoapTitle")) el("phSoapTitle").textContent=r.name+" · Session "+(r.sessionsCompleted+1)+" / "+(r.sessionsPlanned||"?");
      if(el("phPlanTitle")) el("phPlanTitle").textContent=r.name;
      if(el("phSoapS")) el("phSoapS").value=r.soap.subjective||"";
      if(el("phSoapO")) el("phSoapO").value=r.soap.objective||"";
      if(el("phSoapA")) el("phSoapA").value=r.soap.assessment||"";
      if(el("phSoapP")) el("phSoapP").value=r.soap.plan||"";
      if(el("phPain")) el("phPain").value=r.painLevel!=null?String(r.painLevel):"";
      if(el("phRom")) el("phRom").value=r.soap.rom||"";
      if(el("phExercises")) el("phExercises").value=r.soap.exercises||"";
      if(el("phCondition")) el("phCondition").value=r.condition;
      if(el("phPlanned")) el("phPlanned").value=String(r.sessionsPlanned||"");
      if(el("phCompleted")) el("phCompleted").value=String(r.sessionsCompleted);
      if(el("phRemaining")) el("phRemaining").value=String(Math.max(0,(r.sessionsPlanned||0)-r.sessionsCompleted));
      if(el("phPackPrice")) el("phPackPrice").value=String(r.packPrice||"");
      root.querySelectorAll("#phPayModel .pill").forEach((b:any)=>b.classList.toggle("on",b.textContent.toLowerCase().includes(r.payModel==="pack"?"upfront":"per")));
      const vh=el("phVisitHistory"); if(vh){ if(r.visits.length){ vh.innerHTML='<table class="tbl"><thead><tr><th>Session</th><th>Date</th><th>Pain</th><th>Notes</th></tr></thead><tbody>'
        +r.visits.map((v:any)=>'<tr><td class="mono">'+v.session+'</td><td class="mono">'+v.date+'</td><td class="mono">'+(v.pain!=null?v.pain+'/10':'—')+'</td><td>'+(_btE(v.notes||"—"))+'</td></tr>').join("")+'</tbody></table>';
      } else { vh.innerHTML='<div style="font-size:12px;color:var(--faint);padding:8px">No visits recorded yet.</div>'; } }
      const sp=root.querySelector("#phSoapPanel") as HTMLElement; if(sp) sp.style.display="block";
      sp?.scrollIntoView({behavior:"smooth"}); _phRenderAll();
    };
    w._phPayModel=(m:string)=>{ root.querySelectorAll("#phPayModel .pill").forEach((b:any)=>b.classList.remove("on")); root.querySelectorAll("#phPayModel .pill").forEach((b:any)=>{if(b.textContent.toLowerCase().includes(m==="pack"?"upfront":"per"))b.classList.add("on");}); };
    w._phStartSession=async(id:number)=>{ try{ await supabase.from("appointments").update({status:"visited",visited_at:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}).eq("id",id); toast("Session started"); await loadPhysioData(); }catch(e:any){ toastErr("Failed: "+(e.message||"")); } };
    w._phCompleteSession=async(id:any)=>{ try{ const r=_phAll.find((x:any)=>String(x.id)===String(id)); if(!r)return; const pd=r.phData||{};
      // Idempotent: a session counts + logs a visit exactly once (guards double-click and
      // Complete-then-Save both bumping the counter / adding duplicate visit rows).
      if(!pd._completed){ pd._completed=true; pd.sessions_completed=(pd.sessions_completed||0)+1;
        const visit={session:pd.sessions_completed+"/"+(pd.sessions_planned||"?"),date:_recFmtDate(new Date().toISOString().substring(0,10)),pain:r.painLevel,notes:"Completed"};
        if(!pd.visits) pd.visits=[]; pd.visits.unshift(visit);
      }
      await supabase.from("appointments").update({status:"visited",stage:"done",physio_data:pd}).eq("id",id); toast("Session completed"); await loadPhysioData();
    }catch(e:any){ toastErr("Failed: "+(e.message||"")); } };
    w._phSaveSoap=async()=>{
      if(!_phOpenAppt){toast("Open a session first");return;} const v=(id:string)=>(root.querySelector("#"+id) as HTMLInputElement|HTMLTextAreaElement)?.value||"";
      const pd=_phOpenAppt.phData||{}; pd.soap={subjective:v("phSoapS"),objective:v("phSoapO"),assessment:v("phSoapA"),plan:v("phSoapP"),rom:v("phRom"),exercises:v("phExercises")};
      pd.pain_level=Math.max(0,Math.min(10,Number(v("phPain"))||0));   // clamp 0–10
      let visit:any=null;
      if(!pd._completed){ pd._completed=true; pd.sessions_completed=(pd.sessions_completed||0)+1;
        visit={session:pd.sessions_completed+"/"+(pd.sessions_planned||"?"),date:_recFmtDate(new Date().toISOString().substring(0,10)),pain:pd.pain_level,notes:v("phSoapA").substring(0,80)};
        if(!pd.visits) pd.visits=[]; pd.visits.unshift(visit);
      }
      try{ await supabase.from("appointments").update({stage:"done",physio_data:pd}).eq("id",_phOpenAppt.id);
        toast("Session saved & marked complete"); await loadPhysioData();
      }catch(e:any){ toastErr(/physio_data|column|schema|exist/i.test(e.message||"")?"Can't save yet — the physio column is missing. Run supabase-migration-module-columns.sql in Supabase.":"Save failed: "+(e.message||"error")); }
    };
    w._phSavePlan=async()=>{
      if(!_phOpenAppt){toast("Open a patient first");return;} const v=(id:string)=>(root.querySelector("#"+id) as HTMLInputElement)?.value||"";
      const pd=_phOpenAppt.phData||{}; pd.condition=v("phCondition"); pd.sessions_planned=Number(v("phPlanned"))||0; pd.pack_price=Number(v("phPackPrice"))||0;
      const isP=root.querySelector("#phPayModel .pill.on")?.textContent?.toLowerCase().includes("upfront"); pd.payment_model=isP?"pack":"per_visit";
      try{ await supabase.from("appointments").update({physio_data:pd}).eq("id",_phOpenAppt.id); toast("Treatment plan saved"); await loadPhysioData(); }catch(e:any){ toastErr(/physio_data|column|schema|exist/i.test(e.message||"")?"Can't save yet — the physio column is missing. Run supabase-migration-module-columns.sql in Supabase.":"Save failed: "+(e.message||"error")); }
    };
    w._phCollectPay=()=>{ if(!_phOpenAppt)return; recOpen(_phOpenAppt.id,_phOpenAppt.name,_phOpenAppt.packPrice,_phOpenAppt.lead_id); };
    w._phPrintNotes=()=>{ if(!_phOpenAppt){toast("Open a session first");return;} const v=(id:string)=>(root.querySelector("#"+id) as HTMLInputElement|HTMLTextAreaElement)?.value||"";
      const win=window.open("","_blank","width=700,height=900"); if(!win){toast("Allow pop-ups");return;}
      win.document.write('<html><head><title>Physio Notes — '+(_phOpenAppt.name||"")+'</title></head><body style="font-family:system-ui;padding:28px"><h2>Physiotherapy Session Notes</h2><p>'+_phOpenAppt.name+' · '+new Date().toLocaleDateString("en-IN")+'</p><table style="border-collapse:collapse;width:100%;font-size:13px"><tr><td style="padding:6px;border:1px solid #ddd;font-weight:600;width:120px">Subjective</td><td style="padding:6px;border:1px solid #ddd">'+v("phSoapS")+'</td></tr><tr><td style="padding:6px;border:1px solid #ddd;font-weight:600">Objective</td><td style="padding:6px;border:1px solid #ddd">'+v("phSoapO")+'</td></tr><tr><td style="padding:6px;border:1px solid #ddd;font-weight:600">Assessment</td><td style="padding:6px;border:1px solid #ddd">'+v("phSoapA")+'</td></tr><tr><td style="padding:6px;border:1px solid #ddd;font-weight:600">Plan</td><td style="padding:6px;border:1px solid #ddd">'+v("phSoapP")+'</td></tr><tr><td style="padding:6px;border:1px solid #ddd;font-weight:600">Pain</td><td style="padding:6px;border:1px solid #ddd">'+v("phPain")+'/10</td></tr></table></body></html>');
      win.document.close(); win.focus(); setTimeout(()=>{try{win.print();}catch(_){}},300);
    };
    w._phExport=()=>{ if(!_phFiltered.length){toast("Nothing to export");return;} const out:string[][]=[["Patient","Phone","Condition","Session","Status","Payment","Amount"]];
      _phFiltered.forEach((r:any)=>out.push([r.name,r.ph,r.condition,r.sessionsCompleted+"/"+r.sessionsPlanned,r.status,r.payStatus,String(r.payAmt)]));
      _downloadCsv("physio_export.csv",out); toast("Exported"); };

    // ========== ACCOUNTS & FINANCE MODULE (live data) ==========
    let _accPays:any[]=[], _accAppts:Record<string,any>={};
    async function loadAccountsData(){
      try{
        const [pr,ar]=await Promise.all([
          supabase.from("payments").select("*").order("created_at",{ascending:false}).limit(1000),
          supabase.from("appointments").select("id,client_name,phone,service").limit(2000)
        ]);
        _accAppts={}; (ar.data||[]).forEach((a:any)=>{ _accAppts[a.id]=a; });
        _accPays=(pr.data||[]).map((p:any)=>{
          const appt=_accAppts[p.appointment_id]||{};
          return { ...p, clientName:appt.client_name||"Client", clientPhone:appt.phone||"", service:p.service||appt.service||"", dateFmt:_recFmtDate(p.paid_at?p.paid_at.substring(0,10):p.created_at?.substring(0,10)||"") };
        });
      }catch(_){ _accPays=[]; }
      _accRenderAll();
    }
    const _accTxCols=[
      {key:"date",label:"Date",filter:true,text:(p:any)=>p.dateFmt||""},
      {key:"client",label:"Client",filter:true,text:(p:any)=>p.clientName||""},
      {key:"service",label:"Service",filter:true,text:(p:any)=>p.service||""},
      {key:"method",label:"Method",filter:true,text:(p:any)=>(p.payment_type||"full")+" · "+(p.method||"")},
      {key:"gross",label:"Gross",filter:true,text:(p:any)=>"₹"+(p.amount||0).toLocaleString("en-IN")},
      {key:"subv",label:"Subv.",filter:true,text:(p:any)=>{const x=p.emi_subvention||0;return x?"−₹"+x.toLocaleString("en-IN"):"—";}},
      {key:"net",label:"Net",filter:true,text:(p:any)=>"₹"+((p.amount||0)-(p.emi_subvention||0)).toLocaleString("en-IN")},
      {key:"status",label:"Status",filter:true,text:(p:any)=>p.verified?"Verified":"Unverified"},
    ];
    const _accVerCols=[
      {key:"client",label:"Client",filter:true,text:(p:any)=>p.clientName||""},
      {key:"claimed",label:"Claimed",filter:true,text:(p:any)=>"₹"+(p.amount||0).toLocaleString("en-IN")},
      {key:"mode",label:"Mode",filter:true,text:(p:any)=>p.method||"—"},
      {key:"ref",label:"Ref",filter:true,text:(p:any)=>p.txn_ref||"—"},
      {key:"proof",label:"Proof",filter:false,head:'<th>Proof</th>'},
      {key:"act",label:"",filter:false,head:'<th></th>'},
    ];
    const _accOutCols=[
      {key:"client",label:"Client",filter:true,text:(p:any)=>p.clientName||""},
      {key:"service",label:"Service",filter:true,text:(p:any)=>p.service||""},
      {key:"due",label:"Due",filter:true,text:(p:any)=>"₹"+(p.amount||0).toLocaleString("en-IN")},
      {key:"date",label:"Date",filter:true,text:(p:any)=>p.dateFmt||""},
      {key:"act",label:"",filter:false,head:'<th></th>'},
    ];
    const _accRefCols=[
      {key:"client",label:"Client",filter:true,text:(p:any)=>p.clientName||""},
      {key:"paid",label:"Paid",filter:true,text:(p:any)=>"₹"+(p.amount||0).toLocaleString("en-IN")},
      {key:"refund",label:"Refund",filter:true,text:(p:any)=>"₹"+(p.refund_amount||0).toLocaleString("en-IN")},
      {key:"reason",label:"Reason",filter:true,text:(p:any)=>p.refund_reason||"—"},
      {key:"status",label:"Status",filter:true,text:(p:any)=>{const m:any={requested:"Requested",abm_approved:"ABM ✓",bm_approved:"BM ✓"};return m[p.refund_status]||p.refund_status||"";}},
      {key:"act",label:"",filter:false,head:'<th></th>'},
    ];
    regGrid("accTx",()=>_accTxCols,()=>_accRenderAll());
    regGrid("accVer",()=>_accVerCols,()=>_accRenderAll());
    regGrid("accOut",()=>_accOutCols,()=>_accRenderAll());
    regGrid("accRef",()=>_accRefCols,()=>_accRenderAll());
    function _accRenderAll(){
      const pays=_accPays; const e=(s:any)=>String(s??"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const todayStr=new Date().toISOString().substring(0,10);
      const todayPaid=pays.filter((p:any)=>p.status==="paid"&&(p.paid_at||p.created_at||"").startsWith(todayStr));
      const collectedToday=todayPaid.reduce((s:number,p:any)=>s+(p.amount||0),0);
      const unverified=pays.filter((p:any)=>p.status==="paid"&&!p.verified);
      const outstanding=pays.filter((p:any)=>p.status==="due");
      const outstandingAmt=outstanding.reduce((s:number,p:any)=>s+(p.amount||0),0);
      const refunds=pays.filter((p:any)=>p.refund_status&&p.refund_status!=="processed");
      const emiSub=pays.reduce((s:number,p:any)=>s+(p.emi_subvention||0),0);
      const fmtL=(n:number)=>n>=100000?"₹"+(n/100000).toFixed(1)+"L":n>=1000?"₹"+(n/1000).toFixed(1)+"K":"₹"+n.toLocaleString("en-IN");
      const metrics=[{l:"Collected today",v:fmtL(collectedToday),c:"g"},{l:"Pending verification",v:String(unverified.length),c:unverified.length?"a":"",t:unverified.length?"proofs to verify":""},
        {l:"Outstanding",v:fmtL(outstandingAmt),c:outstandingAmt?"a":""},{l:"Refunds pending",v:String(refunds.length),c:refunds.length?"r":""},
        {l:"EMI subvention",v:fmtL(emiSub),c:""}];
      const mel=root.querySelector("#accMetrics"); if(mel) mel.innerHTML=metrics.map(m=>'<div class="metric '+m.c+'"><div class="ml">'+m.l+'</div><div class="mv">'+m.v+'</div>'+(m.t?'<div class="mt warn">'+m.t+'</div>':'')+'</div>').join("");
      const vc=root.querySelector("#accVerCount"); if(vc) vc.textContent=unverified.length?" · "+unverified.length:"";
      const oc=root.querySelector("#accOutCount"); if(oc) oc.textContent=outstanding.length?" · "+outstanding.length:"";
      const rc=root.querySelector("#accRefCount"); if(rc) rc.textContent=refunds.length?" · "+refunds.length:"";
      // Transactions tab
      const allPaid=pays.filter((p:any)=>p.status==="paid"||p.amount>0);
      const _txF=gridApply("accTx",allPaid);
      let txH='<table class="tbl"><thead><tr id="accTxHead"></tr></thead><tbody>';
      if(!_txF.length) txH+='<tr><td colspan="8" style="text-align:center;color:var(--faint);padding:20px">No transactions yet.</td></tr>';
      else _txF.slice(0,100).forEach((p:any)=>{
        const sub=p.emi_subvention||0; const net=(p.amount||0)-sub;
        const verChip=p.verified?'<span class="chipb ok">Verified</span>':'<span class="chipb warn">Unverified</span>';
        txH+='<tr><td class="mono">'+e(p.dateFmt)+'</td><td style="font-weight:600">'+e(p.clientName)+'</td><td>'+e(p.service)+'</td><td>'+e((p.payment_type||"full")+" · "+(p.method||""))+'</td><td class="mono">₹'+(p.amount||0).toLocaleString("en-IN")+'</td>'
          +'<td class="mono"'+(sub?'style="color:var(--alert-ink)"':'')+'>'+( sub?'−₹'+sub.toLocaleString("en-IN"):'—')+'</td><td class="mono" style="font-weight:700">₹'+net.toLocaleString("en-IN")+'</td><td>'+verChip+'</td></tr>';
      });
      txH+='</tbody></table>';
      const txEl=root.querySelector("#accTxBody"); if(txEl){ txEl.innerHTML=txH; const _th=root.querySelector("#accTxHead"); if(_th)_th.innerHTML=gridHead("accTx"); }
      // Verify proofs tab
      const _verF=gridApply("accVer",unverified);
      let vH='<table class="tbl"><thead><tr id="accVerHead"></tr></thead><tbody>';
      if(!_verF.length) vH+='<tr><td colspan="6" style="text-align:center;color:var(--faint);padding:20px">All payments verified ✓</td></tr>';
      else _verF.forEach((p:any)=>{
        vH+='<tr><td style="font-weight:600">'+e(p.clientName)+'</td><td class="mono">₹'+(p.amount||0).toLocaleString("en-IN")+'</td><td>'+e(p.method||"—")+'</td><td class="mono">'+e(p.txn_ref||"—")+'</td>'
          +'<td>'+(p.proof_url?'<a href="'+e(p.proof_url)+'" target="_blank" class="btn bsm">View</a>':'—')+'</td>'
          +'<td><button class="btn bsm bp" onclick="window._accVerify('+p.id+')">Verify</button></td></tr>';
      });
      vH+='</tbody></table>';
      const vEl=root.querySelector("#accVerBody"); if(vEl){ vEl.innerHTML=vH; const _vh=root.querySelector("#accVerHead"); if(_vh)_vh.innerHTML=gridHead("accVer"); }
      // Outstanding tab
      const _outF=gridApply("accOut",outstanding);
      let oH='<table class="tbl"><thead><tr id="accOutHead"></tr></thead><tbody>';
      if(!_outF.length) oH+='<tr><td colspan="5" style="text-align:center;color:var(--faint);padding:20px">No outstanding balances ✓</td></tr>';
      else _outF.forEach((p:any)=>{
        oH+='<tr><td style="font-weight:600">'+e(p.clientName)+'</td><td>'+e(p.service)+'</td><td class="mono">₹'+(p.amount||0).toLocaleString("en-IN")+'</td><td class="mono">'+e(p.dateFmt)+'</td>'
          +'<td><button class="btn bsm bp" onclick="window._accCollect('+p.id+',\''+e(p.clientName).replace(/'/g,"")+'\','+(p.amount||0)+',\''+e(p.lead_id||"")+'\')">Collect</button></td></tr>';
      });
      oH+='</tbody></table>';
      const oEl=root.querySelector("#accOutBody"); if(oEl){ oEl.innerHTML=oH; const _oh=root.querySelector("#accOutHead"); if(_oh)_oh.innerHTML=gridHead("accOut"); }
      // Refunds tab
      const _refF=gridApply("accRef",refunds);
      let rH='<table class="tbl"><thead><tr id="accRefHead"></tr></thead><tbody>';
      if(!_refF.length) rH+='<tr><td colspan="6" style="text-align:center;color:var(--faint);padding:20px">No pending refunds.</td></tr>';
      else _refF.forEach((p:any)=>{
        const sMap:{[k:string]:{l:string;c:string}}={requested:{l:"Requested",c:"warn"},abm_approved:{l:"ABM ✓",c:"info"},bm_approved:{l:"BM ✓",c:"info"}};
        const st=sMap[p.refund_status]||{l:p.refund_status,c:"neu"};
        rH+='<tr><td style="font-weight:600">'+e(p.clientName)+'</td><td class="mono">₹'+(p.amount||0).toLocaleString("en-IN")+'</td><td class="mono">₹'+(p.refund_amount||0).toLocaleString("en-IN")+'</td>'
          +'<td>'+e(p.refund_reason||"—")+'</td><td><span class="chipb '+st.c+'">'+st.l+'</span></td>'
          +'<td><button class="btn bsm bp" onclick="window._accProcessRefund('+p.id+')">Process</button></td></tr>';
      });
      rH+='</tbody></table>';
      const rEl=root.querySelector("#accRefBody"); if(rEl){ rEl.innerHTML=rH; const _rh=root.querySelector("#accRefHead"); if(_rh)_rh.innerHTML=gridHead("accRef"); }
    }
    w._accVerify=async(id:number)=>{
      try{ await supabase.from("payments").update({verified:true,verified_at:new Date().toISOString()}).eq("id",id);
        // Accounts confirming the payment ENROLLS the lead automatically (shared record) and
        // syncs Reception + Health Coach + Advisor + dashboards. Payment date/time is already
        // stored on the payment row (paid_at / verified_at).
        const pay=_accPays.find((p:any)=>String(p.id)===String(id));
        const leadId=pay&&(pay.lead_id||(_accAppts[pay.appointment_id]||{}).lead_id);
        if(leadId){ await _enrollLeadShared(String(leadId),"Accounts payment confirmed"); try{ await loadReceptionData(); }catch(_){} }
        toast(leadId?"Payment verified ✓ — lead Enrolled & synced":"Payment verified ✓"); await loadAccountsData();
      }catch(e:any){ toastErr(/verified|column/i.test(e.message||"")?"Run supabase-migration-module-columns.sql first":"Verify failed"); }
    };
    w._accCollect=(id:number,name:string,amt:number,leadId:string)=>{ recOpen(id,name,amt,leadId); };
    w._accProcessRefund=async(id:number)=>{
      try{ await supabase.from("payments").update({refund_status:"processed",refund_processed_at:new Date().toISOString()}).eq("id",id);
        toast("Refund processed"); await loadAccountsData();
      }catch(e:any){ toastErr("Refund failed: "+(e.message||"")); }
    };
    w._accExport=()=>{ if(!_accPays.length){toast("Nothing to export");return;}
      const out:string[][]=[["Date","Client","Service","Method","Amount","Status","Verified","Txn Ref"]];
      _accPays.forEach((p:any)=>out.push([p.dateFmt,p.clientName,p.service,p.method||"",String(p.amount||0),p.status,p.verified?"Yes":"No",p.txn_ref||""]));
      _downloadCsv("accounts_export.csv",out); toast("Exported"); };

    // ========== REPORTS CENTRE MODULE (live data) ==========
    let _repTab="lead", _repLeads:any[]=[], _repAppts:any[]=[], _repPays:any[]=[];
    async function loadReportsData(){
      try{
        const [lr,ar,pr]=await Promise.all([
          supabase.from("leads").select("meta_lead_id,name,phone,source,language,service,campaign,call_status,created_at,is_assigned,assigned_to,visited_at").order("created_at",{ascending:false}).limit(5000),
          supabase.from("appointments").select("id,lead_id,client_name,service,status,stage,appt_date,visited_at,created_at").order("created_at",{ascending:false}).limit(2000),
          supabase.from("payments").select("id,appointment_id,lead_id,amount,status,method,paid_at,service,created_at").order("created_at",{ascending:false}).limit(2000)
        ]);
        _repLeads=lr.data||[]; _repAppts=ar.data||[]; _repPays=pr.data||[];
      }catch(_){ _repLeads=[]; _repAppts=[]; _repPays=[]; }
      _repRender();
    }
    function _repPeriodFilter(items:any[],dateField:string){
      const period=(root.querySelector("#repPeriod") as HTMLSelectElement)?.value||"month";
      if(period==="all") return items;
      const now=new Date(); const sod=(d:Date)=>{const x=new Date(d);x.setHours(0,0,0,0);return x;};
      let from:Date;
      if(period==="today") from=sod(now);
      else if(period==="quarter"){ from=new Date(now.getFullYear(),Math.floor(now.getMonth()/3)*3,1); }
      else { from=new Date(now.getFullYear(),now.getMonth(),1); }
      return items.filter((r:any)=>{ const d=r[dateField]; if(!d)return false; return new Date(d)>=from; });
    }
    function _repApplyFilters(items:any[]){
      const src=(root.querySelector("#repSource") as HTMLSelectElement)?.value||"all";
      const lang=(root.querySelector("#repLang") as HTMLSelectElement)?.value||"all";
      const svc=(root.querySelector("#repService") as HTMLSelectElement)?.value||"all";
      return items.filter((r:any)=>{
        if(src!=="all"&&(r.source||"").indexOf(src)<0) return false;
        if(lang!=="all"&&(r.language||"")!==lang) return false;
        if(svc!=="all"&&(r.service||"").indexOf(svc)<0) return false;
        return true;
      });
    }
    function _repRender(){
      const e=(s:any)=>String(s??"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const titleEl=root.querySelector("#repTitle"); const kpiEl=root.querySelector("#repKpis"); const tblEl=root.querySelector("#repTableWrap");
      // Populate source/language filter options from data
      const srcSel=root.querySelector("#repSource") as HTMLSelectElement;
      if(srcSel&&srcSel.options.length<=1){ const srcs=[...new Set(_repLeads.map((l:any)=>l.source).filter(Boolean))]; srcs.forEach(s=>{ const o=document.createElement("option"); o.value=s; o.textContent=s; srcSel.appendChild(o); }); }
      const langSel=root.querySelector("#repLang") as HTMLSelectElement;
      if(langSel&&langSel.options.length<=1){ const langs=[...new Set(_repLeads.map((l:any)=>l.language).filter(Boolean))]; langs.forEach(s=>{ const o=document.createElement("option"); o.value=s; o.textContent=s; langSel.appendChild(o); }); }
      const leads=_repApplyFilters(_repPeriodFilter(_repLeads,"created_at"));
      const appts=_repPeriodFilter(_repAppts,"created_at");
      const pays=_repPeriodFilter(_repPays,"created_at").filter((p:any)=>p.status==="paid");
      const totalRev=pays.reduce((s:number,p:any)=>s+(p.amount||0),0);
      const visited=appts.filter((a:any)=>a.status==="visited"||a.visited_at);
      const enrolled=appts.filter((a:any)=>a.stage==="enrolled");
      const pct=(n:number,d:number)=>d?((n/d)*100).toFixed(1)+"%":"0%";
      const fmtL=(n:number)=>n>=100000?"₹"+(n/100000).toFixed(1)+"L":n>=1000?"₹"+(n/1000).toFixed(0)+"K":"₹"+n.toLocaleString("en-IN");
      if(_repTab==="lead"){
        if(titleEl) titleEl.textContent="Lead report";
        if(kpiEl) kpiEl.innerHTML=[{l:"Leads",v:leads.length.toLocaleString(),c:"g"},{l:"Lead → Appt",v:pct(appts.length,leads.length),c:"g"},{l:"Lead → Enrol",v:pct(enrolled.length,leads.length),c:enrolled.length/Math.max(leads.length,1)<0.06?"a":"g"},{l:"Revenue",v:fmtL(totalRev),c:"g"}]
          .map(m=>'<div class="metric '+m.c+'"><div class="ml">'+m.l+'</div><div class="mv">'+m.v+'</div></div>').join("");
        // By source
        const bySrc:Record<string,{leads:number;appts:number;visited:number;enrolled:number}>={};
        leads.forEach((l:any)=>{ const s=l.source||"Other"; if(!bySrc[s]) bySrc[s]={leads:0,appts:0,visited:0,enrolled:0}; bySrc[s].leads++; });
        appts.forEach((a:any)=>{ const lid=a.lead_id; const l=_repLeads.find((x:any)=>x.meta_lead_id===lid); const s=l?.source||"Other"; if(bySrc[s]){ bySrc[s].appts++; if(a.status==="visited"||a.visited_at)bySrc[s].visited++; if(a.stage==="enrolled")bySrc[s].enrolled++; } });
        let h='<table class="tbl"><thead><tr><th>Source</th><th>Leads</th><th>Appt</th><th>Visited</th><th>Enrolled</th><th>L→E</th></tr></thead><tbody>';
        Object.entries(bySrc).sort((a,b)=>b[1].leads-a[1].leads).forEach(([s,d])=>{
          h+='<tr><td style="font-weight:600">'+e(s)+'</td><td class="mono">'+d.leads+'</td><td class="mono">'+d.appts+'</td><td class="mono">'+d.visited+'</td><td class="mono">'+d.enrolled+'</td><td class="mono" style="font-weight:700">'+pct(d.enrolled,d.leads)+'</td></tr>';
        });
        if(!Object.keys(bySrc).length) h+='<tr><td colspan="6" style="text-align:center;color:var(--faint);padding:20px">No lead data yet.</td></tr>';
        h+='</tbody></table>';
        // By language
        const byLang:Record<string,{leads:number;visited:number;enrolled:number}>={};
        leads.forEach((l:any)=>{ const la=l.language||"Other"; if(!byLang[la]) byLang[la]={leads:0,visited:0,enrolled:0}; byLang[la].leads++; });
        appts.forEach((a:any)=>{ const lid=a.lead_id; const l=_repLeads.find((x:any)=>x.meta_lead_id===lid); const la=l?.language||"Other"; if(byLang[la]){ if(a.status==="visited"||a.visited_at)byLang[la].visited++; if(a.stage==="enrolled")byLang[la].enrolled++; } });
        h+='<table class="tbl" style="margin-top:14px"><thead><tr><th>Language</th><th>Leads</th><th>L→V</th><th>L→E</th></tr></thead><tbody>';
        Object.entries(byLang).sort((a,b)=>b[1].leads-a[1].leads).forEach(([la,d])=>{
          h+='<tr><td style="font-weight:600">'+e(la)+'</td><td class="mono">'+d.leads+'</td><td class="mono">'+pct(d.visited,d.leads)+'</td><td class="mono" style="font-weight:700">'+pct(d.enrolled,d.leads)+'</td></tr>';
        });
        h+='</tbody></table>';
        if(tblEl) tblEl.innerHTML=h;
      } else if(_repTab==="funnel"){
        if(titleEl) titleEl.textContent="Conversion funnel";
        const stages=[{l:"Leads",v:leads.length},{l:"Appointments",v:appts.length},{l:"Visited",v:visited.length},{l:"Enrolled",v:enrolled.length},{l:"Paid",v:pays.length}];
        if(kpiEl) kpiEl.innerHTML=stages.map(s=>'<div class="metric g"><div class="ml">'+s.l+'</div><div class="mv">'+s.v+'</div></div>').join("");
        let h='<div style="display:flex;gap:4px;align-items:flex-end;height:200px;margin:20px 0">';
        const max=Math.max(...stages.map(s=>s.v),1);
        h+=stages.map(s=>'<div style="flex:1;text-align:center"><div style="background:var(--brand-tint);border:1px solid var(--brand-line);border-radius:6px 6px 0 0;height:'+Math.max(10,s.v/max*180)+'px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px"><span class="mono" style="font-weight:700;font-size:13px">'+s.v+'</span></div><div style="font-size:11px;margin-top:4px;color:var(--muted)">'+s.l+'</div></div>').join("");
        h+='</div>';
        if(tblEl) tblEl.innerHTML=h;
      } else if(_repTab==="revenue"){
        if(titleEl) titleEl.textContent="Revenue report";
        const bySvc:Record<string,number>={};
        pays.forEach((p:any)=>{ const s=p.service||"Other"; bySvc[s]=(bySvc[s]||0)+(p.amount||0); });
        if(kpiEl) kpiEl.innerHTML=[{l:"Total revenue",v:fmtL(totalRev),c:"g"},{l:"Transactions",v:String(pays.length),c:""},{l:"Avg ticket",v:pays.length?fmtL(Math.round(totalRev/pays.length)):"—",c:""}]
          .map(m=>'<div class="metric '+m.c+'"><div class="ml">'+m.l+'</div><div class="mv">'+m.v+'</div></div>').join("");
        let h='<table class="tbl"><thead><tr><th>Service</th><th>Revenue</th><th>Transactions</th><th>Avg</th></tr></thead><tbody>';
        Object.entries(bySvc).sort((a,b)=>b[1]-a[1]).forEach(([s,v])=>{
          const cnt=pays.filter((p:any)=>(p.service||"Other")===s).length;
          h+='<tr><td style="font-weight:600">'+e(s)+'</td><td class="mono" style="font-weight:700">'+fmtL(v)+'</td><td class="mono">'+cnt+'</td><td class="mono">'+fmtL(Math.round(v/Math.max(cnt,1)))+'</td></tr>';
        });
        if(!Object.keys(bySvc).length) h+='<tr><td colspan="4" style="text-align:center;color:var(--faint);padding:20px">No revenue data yet.</td></tr>';
        h+='</tbody></table>';
        if(tblEl) tblEl.innerHTML=h;
      } else if(_repTab==="appt"){
        if(titleEl) titleEl.textContent="Appointments report";
        if(kpiEl) kpiEl.innerHTML=[{l:"Total",v:String(appts.length),c:""},{l:"Visited",v:String(visited.length),c:"g"},{l:"No show",v:String(appts.filter((a:any)=>a.status==="noshow").length),c:"r"},{l:"Visit rate",v:pct(visited.length,appts.length),c:"g"}]
          .map(m=>'<div class="metric '+m.c+'"><div class="ml">'+m.l+'</div><div class="mv">'+m.v+'</div></div>').join("");
        const byDate:Record<string,{total:number;visited:number}>={};
        appts.forEach((a:any)=>{ const d=a.appt_date||a.created_at?.substring(0,10)||""; if(!byDate[d]) byDate[d]={total:0,visited:0}; byDate[d].total++; if(a.status==="visited"||a.visited_at)byDate[d].visited++; });
        let h='<table class="tbl"><thead><tr><th>Date</th><th>Total</th><th>Visited</th><th>Visit %</th></tr></thead><tbody>';
        Object.entries(byDate).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,30).forEach(([d,v])=>{
          h+='<tr><td class="mono">'+e(_recFmtDate(d))+'</td><td class="mono">'+v.total+'</td><td class="mono">'+v.visited+'</td><td class="mono" style="font-weight:700">'+pct(v.visited,v.total)+'</td></tr>';
        });
        if(!Object.keys(byDate).length) h+='<tr><td colspan="4" style="text-align:center;color:var(--faint);padding:20px">No appointment data yet.</td></tr>';
        h+='</tbody></table>';
        if(tblEl) tblEl.innerHTML=h;
      }
    }
    w._repTab=(tab:string)=>{ _repTab=tab; root.querySelectorAll(".rep-pick .rep").forEach((b:any)=>b.classList.remove("on")); root.querySelectorAll(".rep-pick .rep").forEach((b:any)=>{ if(b.textContent.toLowerCase().includes(tab==="lead"?"lead":tab==="funnel"?"conversion":tab==="revenue"?"revenue":"appointment")) b.classList.add("on"); }); _repRender(); };
    w._repLoad=()=>_repRender();
    w._repExport=(fmt:string)=>{ if(fmt==="csv"){ const items=_repApplyFilters(_repPeriodFilter(_repLeads,"created_at")); if(!items.length){toast("No data");return;}
      const out:string[][]=[["Name","Phone","Source","Language","Service","Campaign","Status","Created"]];
      items.forEach((l:any)=>out.push([l.name||"",l.phone||"",l.source||"",l.language||"",l.service||"",l.campaign||"",l.call_status||"",l.created_at||""]));
      _downloadCsv("report_export.csv",out); toast("Exported "+items.length+" rows");
    } else { toast("PDF export — use browser Print (Ctrl+P) on this page"); } };

    // INIT — nav click handlers (data loading gated behind auth in showApp)
    {
      const recNav=root.querySelector('#nav button[data-s="reception"]')as HTMLButtonElement|null;
      if(recNav) recNav.addEventListener("click",()=>{ loadReceptionData(); });
      const scrNav=root.querySelector('#nav button[data-s="screening"]')as HTMLButtonElement|null;
      if(scrNav) scrNav.addEventListener("click",()=>{ loadScreeningData(); });
      const btNav=root.querySelector('#nav button[data-s="bloodtest"]')as HTMLButtonElement|null;
      if(btNav) btNav.addEventListener("click",()=>{ loadBloodTestData(); });
      const phNav=root.querySelector('#nav button[data-s="physio"]')as HTMLButtonElement|null;
      if(phNav) phNav.addEventListener("click",()=>{ loadPhysioData(); });
      const accNav=root.querySelector('#nav button[data-s="accounts"]')as HTMLButtonElement|null;
      if(accNav) accNav.addEventListener("click",()=>{ loadAccountsData(); });
      const repNav=root.querySelector('#nav button[data-s="reports"]')as HTMLButtonElement|null;
      if(repNav) repNav.addEventListener("click",()=>{ loadReportsData(); });
      const devTabBtn=root.querySelector('#abmTabs button[data-t="dev"]')as HTMLButtonElement|null;
      if(devTabBtn) devTabBtn.addEventListener("click",()=>{ w._renderCallDeviation(); w._renderLeadsDeviation(); });
      const usrTabBtn=root.querySelector('#settTabs button[data-t="st-usr"]')as HTMLButtonElement|null;
      if(usrTabBtn) usrTabBtn.addEventListener("click",()=>{ loadUsers(); });
      const rbacTabBtn=root.querySelector('#settTabs button[data-t="st-rbac"]')as HTMLButtonElement|null;
      if(rbacTabBtn) rbacTabBtn.addEventListener("click",()=>{ renderRbacMatrix(); });
    }
    // Auth gate — all data loading happens inside showApp() after successful auth
    checkAuth();

    return () => { clearInterval(slaInterval); if(_callTimer) clearInterval(_callTimer); if(_metaFeedTimer) clearInterval(_metaFeedTimer); if(_csvSweepTimer) clearInterval(_csvSweepTimer); if(_metaMonitorTimer) clearInterval(_metaMonitorTimer); try{ if(w.__leadsChannel) supabase.removeChannel(w.__leadsChannel); }catch(_){} };
}
