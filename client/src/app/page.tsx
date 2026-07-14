"use client";

import { useEffect, useRef } from "react";
import { getMainContent } from "@/client/template";
import { initApp } from "@/client/app";

export default function Home() {
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!appRef.current) return;
    return initApp(appRef.current);
  }, []);

  return (
    <div ref={appRef}>
      <svg width="0" height="0" style={{position:"absolute"}} aria-hidden="true">
        <defs>
          <symbol id="i-leaf" viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 1 5 1 8a8 8 0 0 1-9 10z"/><path d="M2 22s4-10 12-12"/></symbol>
          <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></symbol>
          <symbol id="i-stetho" viewBox="0 0 24 24"><path d="M5 3v6a4 4 0 0 0 8 0V3"/><path d="M9 17a5 5 0 0 0 10 0v-2"/><circle cx="19" cy="11" r="2.2"/></symbol>
          <symbol id="i-inbox" viewBox="0 0 24 24"><path d="M3 12h5l2 3h4l2-3h5"/><path d="M5 5h14l2 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/></symbol>
          <symbol id="i-split" viewBox="0 0 24 24"><path d="M12 3v18M3 7h6M3 17h6M15 7h6M15 17h6"/></symbol>
          <symbol id="i-door" viewBox="0 0 24 24"><path d="M14 3v18M5 3h11v18H5zM10 12h.01"/></symbol>
          <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5C19 15.5 12 20 12 20z"/></symbol>
          <symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z"/></symbol>
          <symbol id="i-wallet" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 14h2"/></symbol>
          <symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></symbol>
          <symbol id="i-cog" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2"/></symbol>
          <symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></symbol>
          <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
          <symbol id="i-clip" viewBox="0 0 24 24"><path d="M21 11l-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8"/></symbol>
          <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></symbol>
          <symbol id="i-bell" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M10.5 21a2 2 0 0 0 3 0"/></symbol>
          <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></symbol>
          <symbol id="i-phone" viewBox="0 0 24 24"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L20 13l1 5v3a18 18 0 0 1-16-16z"/></symbol>
          <symbol id="i-dl" viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></symbol>
          <symbol id="i-gift" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4"/><path d="M5 12v8h14v-8M12 8v12"/></symbol>
          <symbol id="i-coin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 0 1 0 3.6h-3a1.8 1.8 0 0 0 0 3.6h4"/></symbol>
          <symbol id="i-doc" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></symbol>
          <symbol id="i-msg" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5z"/></symbol>
          <symbol id="i-mic" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4"/></symbol>
          <symbol id="i-audit" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></symbol>
          <symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></symbol>
          <symbol id="i-repeat" viewBox="0 0 24 24"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></symbol>
          <symbol id="i-chat" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></symbol>
          <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></symbol>
        </defs>
      </svg>

      <div className="login-overlay" id="loginOverlay">
        <div className="login-card">
          <div style={{textAlign:"center",marginBottom:"24px"}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="login-logo" src="/mhs-logo.png" width={795} height={443} alt="My Health School" />
            <h1 className="login-title">My Health School</h1>
            <div className="login-sub">Wellness Center</div>
            <p className="login-cap">Sign in to continue</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <div><label className="lbl">Email</label><input className="input" id="loginEmail" type="email" placeholder="you@clinic.com"/></div>
            <div><label className="lbl">Password</label><input className="input" id="loginPass" type="password" placeholder="••••••••"/></div>
            <div id="loginConfirmWrap" style={{display:"none"}}><label className="lbl">Confirm password</label><input className="input" id="loginConfirm" type="password" placeholder="••••••••"/></div>
            <button className="btn bp" id="loginBtn" style={{width:"100%",height:"42px",marginTop:"4px"}}>Sign in</button>
            <div style={{textAlign:"center"}}><button id="loginToggle" style={{background:"none",border:"none",color:"var(--brand)",fontSize:"12.5px",fontWeight:600,cursor:"pointer",padding:"4px"}}>First time? Set your password</button></div>
            <div className="login-err" id="loginErr" style={{display:"none"}}></div>
          </div>
        </div>
      </div>

      <div className="app" id="appShell" style={{display:"none"}}>
        <aside className="side">
          <div className="sb">
            <img src="/mhs-logo.png" alt="MHS Wellness Center" style={{height:"32px",width:"auto",maxWidth:"56px",objectFit:"contain",display:"block",flex:"0 0 auto"}} />
            <div><div className="bn">MHS Wellness Center</div><div className="bs">Chennai · HQ</div></div>
          </div>
          <nav className="snav" id="nav">
            <div className="ng">Hero screens</div>
            <button data-s="advisor" className="active"><svg className="icon"><use href="#i-user"/></svg> Health advisor</button>
            <button data-s="coach"><svg className="icon"><use href="#i-stetho"/></svg> Health coach</button>
            <div className="ng">Leads &amp; CRM</div>
            <button data-s="import"><svg className="icon"><use href="#i-inbox"/></svg> Lead import</button>
            <button data-s="abm"><svg className="icon"><use href="#i-split"/></svg> Assign &amp; approve</button>
            <div className="ng">Clinic floor</div>
            <button data-s="reception"><svg className="icon"><use href="#i-door"/></svg> Reception</button>
            <button data-s="screening"><svg className="icon"><use href="#i-heart"/></svg> Screening</button>
            <button data-s="bloodtest"><svg className="icon"><use href="#i-drop"/></svg> Blood test</button>
            <button data-s="physio"><svg className="icon"><use href="#i-heart"/></svg> Physiotherapy</button>
            <button data-s="recordings"><svg className="icon"><use href="#i-mic"/></svg> Recordings</button>
            <div className="ng">Finance &amp; insight</div>
            <button data-s="accounts"><svg className="icon"><use href="#i-wallet"/></svg> Accounts</button>
            <button data-s="reports"><svg className="icon"><use href="#i-chart"/></svg> Reports</button>
            <div className="ng">Admin</div>
            <button data-s="admin"><svg className="icon"><use href="#i-cog"/></svg> Settings &amp; masters</button>
          </nav>
          <div className="sfoot" id="sfoot"><span className="ldot"></span> <span id="sfootUser" style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>WellnessOS</span><button id="signOutBtn" style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",color:"#AFC2B8",borderRadius:"7px",padding:"3px 8px",fontSize:"10.5px",fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}} onClick={()=>(window as any)._doSignOut?.()}>Sign out</button></div>
        </aside>
        <main className="main" id="main" dangerouslySetInnerHTML={{__html: getMainContent()}}/>
      </div>

      <div className="toast" id="toast"><svg className="icon"><use href="#i-check"/></svg><span id="toastMsg">Saved</span></div>
      <div className="toast err" id="toastE" style={{background:"#7A2416"}}><svg className="icon"><use href="#i-x"/></svg><span id="toastEMsg">Error</span></div>
      <div className="ach" id="ach"><span className="em" id="achEm">🎉</span><div><b id="achT">Achievement</b><span id="achS">Nice work</span></div></div>
      <div className="doverlay" id="dOverlay" onClick={()=>(window as any).closeDrawer?.()}></div>
      <div className="drawer" id="drawer">
        <div className="dclose">
          <h2 id="dName">Client record</h2>
          <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
            <button className="btn bsm bp" onClick={()=>(window as any)._toast?.("Calling…")}>📞 Call</button>
            <button className="btn bsm" onClick={()=>(window as any)._toast?.("WA template sent")}>WA</button>
            <button onClick={()=>(window as any).closeDrawer?.()}><svg className="icon" style={{width:14,height:14}}><use href="#i-x"/></svg></button>
          </div>
        </div>
        <div className="dbody">
          <div className="rtabs" id="dTabs">
            <button className="on" data-t="dr">Receptionist</button>
            <button data-t="ds">Walk-in Sales</button>
            <button data-t="dh">Walk-in Health</button>
            <button data-t="dp">Payment</button>
            <button data-t="dc">Call log</button>
          </div>
          <div className="d-p" data-p="dr">
            <div className="sec"><div className="sec-hd" style={{cursor:"default",padding:"10px 14px"}}><svg className="icon"><use href="#i-door"/></svg> Reception record</div>
              <div className="sec-bd" style={{padding:"4px 14px 14px"}}><table className="tbl"><tbody id="drRecepBody">
                <tr><td style={{color:"var(--muted)"}}>Visited time</td><td className="mono">—</td><td style={{color:"var(--muted)"}}>Registered</td><td className="mono">—</td></tr>
                <tr><td style={{color:"var(--muted)"}}>Service</td><td>—</td><td style={{color:"var(--muted)"}}>Token</td><td className="mono">—</td></tr>
                <tr><td style={{color:"var(--muted)"}}>Consent</td><td colSpan={3}>—</td></tr>
              </tbody></table></div></div></div>
          <div className="d-p" data-p="ds" style={{display:"none"}}>
            <div className="sec"><div className="sec-hd" style={{cursor:"default",padding:"10px 14px"}}><svg className="icon"><use href="#i-user"/></svg> Sales record</div>
              <div className="sec-bd" style={{padding:"4px 14px 14px"}}><table className="tbl"><tbody id="drSalesBody">
                <tr><td style={{color:"var(--muted)"}}>Lead source</td><td>—</td><td style={{color:"var(--muted)"}}>Language</td><td>—</td></tr>
                <tr><td style={{color:"var(--muted)"}}>Advisor</td><td>—</td><td style={{color:"var(--muted)"}}>Priority</td><td>—</td></tr>
                <tr><td style={{color:"var(--muted)"}}>Sugar</td><td>—</td><td style={{color:"var(--muted)"}}>HbA1c</td><td className="mono">—</td></tr>
                <tr><td style={{color:"var(--muted)"}}>Eligibility</td><td colSpan={3}>—</td></tr>
                <tr><td style={{color:"var(--muted)"}}>Call notes</td><td colSpan={3}>—</td></tr>
              </tbody></table></div></div></div>
          <div className="d-p" data-p="dh" style={{display:"none"}}>
            <div className="sec"><div className="sec-hd" style={{cursor:"default",padding:"10px 14px"}}><svg className="icon"><use href="#i-stetho"/></svg> Health record</div>
              <div className="sec-bd" style={{padding:"4px 14px 14px"}}><table className="tbl"><tbody id="drHealthBody">
                <tr><td style={{color:"var(--muted)"}}>Consult status</td><td>—</td><td style={{color:"var(--muted)"}}>HC</td><td>—</td></tr>
                <tr><td style={{color:"var(--muted)"}}>BMI</td><td className="mono">—</td><td style={{color:"var(--muted)"}}>BP</td><td className="mono">—</td></tr>
                <tr><td style={{color:"var(--muted)"}}>Assessment</td><td colSpan={3}>—</td></tr>
              </tbody></table></div></div></div>
          <div className="d-p" data-p="dp" style={{display:"none"}}>
            <div className="sec"><div className="sec-hd" style={{cursor:"default",padding:"10px 14px"}}><svg className="icon"><use href="#i-wallet"/></svg> Payment</div>
              <div className="sec-bd" style={{padding:"4px 14px 14px"}}><table className="tbl"><tbody>
                <tr><td style={{color:"var(--muted)"}}>Method</td><td>Full · UPI</td><td style={{color:"var(--muted)"}}>Amount</td><td className="mono" style={{fontWeight:700}}>₹29,000</td></tr>
                <tr><td style={{color:"var(--muted)"}}>Txn ref</td><td className="mono">UTR…4821</td><td style={{color:"var(--muted)"}}>Verification</td><td><span className="chipb warn">Pending</span></td></tr>
              </tbody></table><button className="btn bsm" style={{marginTop:8}} onClick={()=>(window as any)._toast?.("Invoice downloading…")}>⬇ Download invoice</button></div></div></div>
          <div className="d-p" data-p="dc" style={{display:"none"}}>
            <div className="sec"><div className="sec-hd" style={{cursor:"default",padding:"10px 14px"}}><svg className="icon"><use href="#i-phone"/></svg> Call log + recordings</div>
              <div className="sec-bd" style={{padding:"4px 14px 14px"}}><table className="tbl"><thead><tr><th>Date</th><th>Dir</th><th>Dur</th><th>Outcome</th><th>Rec</th></tr></thead><tbody>
                <tr><td className="mono">12-Jun 09:14</td><td><span className="chipb info">Out</span></td><td className="mono">4:32</td><td><span className="chipb ok">Connected</span></td><td><button className="btn bsm">▶</button></td></tr>
                <tr><td className="mono">12-Jun 08:58</td><td><span className="chipb info">Out</span></td><td className="mono">0:00</td><td><span className="chipb warn">RNR</span></td><td>—</td></tr>
              </tbody></table></div></div></div>
        </div>
      </div>
      <div className="milestone" id="mstone" onClick={(e)=>(e.currentTarget as HTMLElement).classList.remove("show")}>
        <div className="mcard"><div className="mem" id="msEm">🎉</div><h2 id="msTitle">Revenue milestone!</h2><p id="msSub">Click anywhere to dismiss</p></div>
      </div>
    </div>
  );
}
