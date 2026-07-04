"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

function getMainContent(): string {
  return `
  <!-- ADVISOR -->
  <section class="screen active" id="s-advisor"><div class="wrap">
    <div class="sec" style="margin-bottom:14px"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-chart"/></svg> Advisor dashboard
      <div class="pills" id="asnViewToggle" style="margin-left:auto"><button class="pill on" onclick="window._asnToggleView('list')">List View</button><button class="pill" onclick="window._asnToggleView('kanban')">Kanban View</button></div>
      <select class="select" id="haStatusFilter" style="height:30px;font-size:12px;width:210px"><option value="all">All call/lead statuses</option></select></div>
      <div class="sec-bd">
        <div class="metrics" id="haKpis" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin:0"></div>
        <div id="haResultsWrap" style="display:none;margin-top:14px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-weight:700;font-size:13px" id="haResultsTitle"></span><button class="btn bsm" style="margin-left:auto" onclick="window._haCloseResults()">Close</button></div>
          <div class="tscroll"><table class="tbl" style="min-width:640px"><thead><tr><th>Lead</th><th>Source · Lang</th><th>Assigned to</th><th>Call status</th></tr></thead><tbody id="haResultsBody"></tbody></table></div>
        </div>
      </div></div>
    <div class="sec" style="margin-bottom:14px"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Assigned leads <span class="chipb ok" id="assignedCount" style="margin-left:8px">0</span>
      <select class="select" id="assignedFilter" style="height:30px;font-size:12px;width:170px;margin-left:auto"><option value="all">All advisors</option></select></div>
      <div class="sec-bd"><div id="assignedTableWrap" class="tscroll stick1"><table class="tbl" style="min-width:760px"><thead><tr><th>Lead</th><th>Source · Lang</th><th>Campaign</th><th>Assigned to</th><th>Status</th><th>Action</th></tr></thead><tbody id="assignedLeadsBody"></tbody></table></div>
      <div id="assignedKanban" style="display:none;overflow-x:auto"></div>
      <div id="asnPager" style="display:flex;gap:10px;margin-top:12px;align-items:center;justify-content:center;flex-wrap:wrap">
        <button class="btn bsm" id="asnFirstBtn" onclick="window._asnPage('first')">« First</button>
        <button class="btn bsm" id="asnPrevBtn" onclick="window._asnPage(-1)">← Previous</button>
        <span style="font-size:12.5px;font-weight:600;color:var(--ink)" id="asnPageInfo">Page 1 of 1</span>
        <button class="btn bsm" id="asnNextBtn" onclick="window._asnPage(1)">Next →</button>
        <button class="btn bsm" id="asnLastBtn" onclick="window._asnPage('last')">Last »</button>
        <button class="btn bsm" onclick="window._assignedDownload()" style="margin-left:auto">⬇ Download</button>
      </div></div></div>
    <div style="display:flex;gap:14px;align-items:flex-start;margin-top:4px">
    <div id="advOpenList" style="width:212px;flex-shrink:0;display:none"></div>
    <div id="advDetailPane" style="flex:1;min-width:0">
    <div id="advCtxBanner" class="banner plan" style="display:none;margin-bottom:12px"><svg class="icon" style="width:15px;height:15px"><use href="#i-user"/></svg> <span id="advCtxText"></span></div>
    <div class="chead">
      <span class="cav" id="advAv">AK</span>
      <div class="cmeta">
        <h1 id="advName">Ajith Kumar</h1>
        <div class="sub" id="advSub"><span class="mono">+91 98●●● ●●●21</span><span>·</span><span class="mono">Lead #10318</span><span>·</span>Batch <span class="mono">WK-JUN-04</span></div>
        <div class="cbadges" id="advBadges"><span class="chipb ok">First visit</span><span class="chipb neu">Meta · Tamil</span><span class="chipb warn">Sugar 150–250</span></div>
      </div>
      <div class="cacts">
        <div style="text-align:center"><div class="ring"><svg width="62" height="62" viewBox="0 0 62 62"><circle class="bgc" cx="31" cy="31" r="26"/><circle class="fgc" id="aRing" cx="31" cy="31" r="26" stroke="#C07F0E" stroke-dasharray="163.4" stroke-dashoffset="42"/></svg><span class="rc" id="aClock" style="color:var(--warn-ink)">3:09</span></div><div class="rl">SLA · 4h</div></div>
        <span class="chipb vio" id="consBadge" style="height:30px">Status: New</span>
        <button class="btn bp" id="callBtn"><svg class="icon"><use href="#i-phone"/></svg> <span>Call</span></button>
        <button class="btn bwa"><svg class="icon"><use href="#i-msg"/></svg> WA</button>
      </div>
    </div>
    <div class="rtabs" id="aTabs">
      <button data-t="recep">Walk-in Receptionist</button><button class="on" data-t="sales">Walk-in Sales</button><button data-t="health">Walk-in Health</button>
      <button data-t="pay">Payment History</button><button data-t="notes">Internal Notes</button>
      <button data-t="extra">Extra Info</button><button data-t="calls">Call History <span class="mini">4</span></button>
    </div>
    <div class="a-p" data-p="recep" style="display:none">
      <div class="banner plan" style="margin-top:16px"><svg class="icon" style="width:15px;height:15px"><use href="#i-doc"/></svg> <span><b>View only.</b> Reception-entered data — consent, visited time, registration time, service, token. Audit-logged.</span></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-door"/></svg> Reception record <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No reception record for this lead yet.</div></div></div>
    </div>
    <div class="a-p" data-p="sales">
      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-user"/></svg> Basic info <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g4">
          <div class="fld"><label class="lbl">Name</label><input class="input" id="advfName" value=""></div>
          <div class="fld"><label class="lbl">Phone no</label><input class="input mono" id="advfPhone" value=""></div>
          <div class="fld"><label class="lbl">Alternate ph no <span class="nb">NEW</span></label><input class="input" placeholder="Alt number"></div>
          <div class="fld"><label class="lbl">WhatsApp no</label><input class="input mono" id="advfWhats" value=""></div>
          <div class="fld"><label class="lbl">Email</label><input class="input" id="advfEmail" placeholder="email@example.com"></div>
          <div class="fld"><label class="lbl">Gender</label><select class="select"><option>-- Select --</option><option selected>Male</option><option>Female</option><option>Other</option></select></div>
          <div class="fld"><label class="lbl">Age</label><input class="input mono" type="number" min="1" max="120" value="42" placeholder="e.g. 42"></div>
          <div class="fld"><label class="lbl">Occupation <span class="nb">NEW</span></label><select class="select" onchange="othRev(this,'occOth')"><option>-- Select --</option><option>Private Job</option><option selected>Business</option><option>Govt Job</option><option>Self-employed</option><option>Homemaker</option><option>Retired</option><option>Student</option><option>Daily Wage</option><option>Others</option></select><input class="input hideblock" id="occOth" style="margin-top:7px" placeholder="Enter occupation…"></div>
          <div class="fld"><label class="lbl">Language</label><select class="select"><option selected>Tamil</option><option>Telugu</option><option>Kannada</option><option>Malayalam</option><option>Hindi</option><option>Marathi</option><option>Bengali</option><option>Gujarati</option><option>Punjabi</option><option>Urdu</option></select></div>
          <div class="fld"><label class="lbl">Lead source</label><select class="select"><option>web</option><option selected>Meta</option><option>WhatsApp</option><option>Referral</option><option>Direct Walk-in</option></select></div>
          <div class="fld"><label class="lbl">Lead generated <span class="ab">AUTO</span></label><input class="input mono" id="haLeadGen" readonly></div>
          <div class="fld"><label class="lbl">Batch code</label><input class="input mono" value="WK-JUN-04"></div>
          <div class="fld"><label class="lbl">Location</label><select class="select"><option selected>Poonamalle</option><option>Porur</option><option>Maduravoyal</option><option>Ambattur</option><option>Avadi</option><option>Tambaram</option><option>Nagapattinam</option><option>+ Add new location</option></select></div>
          <div class="fld" style="grid-column:span 3"><label class="lbl">Address</label><div class="g4" style="gap:9px"><input class="input" placeholder="Street / Area"><input class="input" value="Chennai"><input class="input" placeholder="ZIP"><input class="input" value="India"></div></div>
        </div></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-drop"/></svg> Sugar &amp; medical profile <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g4">
          <div class="fld"><label class="lbl">Sugar level</label><select class="select"><option>No Sugar</option><option selected>150–250</option><option>Above 250</option></select></div>
          <div class="fld"><label class="lbl">Last test report date</label><input class="input" type="date" value="2026-05-28"></div>
          <div class="fld"><label class="lbl">Fasting (mg/dL)</label><input class="input mono" value="162"></div>
          <div class="fld"><label class="lbl">Postprandial (mg/dL)</label><input class="input mono" value="231"></div>
          <div class="fld"><label class="lbl">HbA1c (%)</label><input class="input mono" value="8.4"></div>
          <div class="fld"><label class="lbl">Treatment <span class="nb">NEW</span></label><select class="select"><option selected>Allopathy</option><option>Siddha</option><option>Ayurveda</option><option>Homeopathy</option><option>No Treatment</option><option>Skipped</option></select></div>
          <div class="fld"><label class="lbl">Years of treatment <span class="nb">NEW</span></label><select class="select"><option>Less than 1 yr</option><option>1–2 yrs</option><option selected>3–5 yrs</option><option>5–10 yrs</option><option>10+ yrs</option></select></div>
          <div class="fld fw"><label class="lbl">Blood report — attachment <span class="nb">NEW</span></label>
            <div class="atts" id="bloodAtts"><span class="att"><svg class="icon"><use href="#i-clip"/></svg> sugar_report_may26.pdf</span><span class="att add" onclick="addBlood()"><svg class="icon"><use href="#i-clip"/></svg> Add report</span></div></div>
          <div class="fld fw"><label class="lbl">How are they managing now · multi-select</label>
            <div class="chips" data-oth="mgOth"><button class="chip-o on">Medicine</button><button class="chip-o">Insulin</button><button class="chip-o on">Diet</button><button class="chip-o">Fitness</button><button class="chip-o">Yoga</button><button class="chip-o" data-others="1">Others</button></div>
            <input class="input hideblock" id="mgOth" style="margin-top:8px;max-width:380px" placeholder="Enter details…"></div>
          <div class="fld fw"><label class="lbl">Health issues · multi-select</label>
            <div class="chips" data-oth="hiOth"><button class="chip-o on">BP / Hypertension</button><button class="chip-o">Cholesterol</button><button class="chip-o on">Fatty Liver</button><button class="chip-o">Kidney Issues</button><button class="chip-o">Thyroid</button><button class="chip-o">PCOD / PCOS</button><button class="chip-o">Nerve Damage</button><button class="chip-o">Retinopathy</button><button class="chip-o">Obesity</button><button class="chip-o" data-others="1">Others</button></div>
            <input class="input hideblock" id="hiOth" style="margin-top:8px;max-width:380px" placeholder="Enter details…"></div>
          <div class="fld fw"><label class="lbl" style="color:var(--alert-ink)">Appointment eligibility criteria <span class="nb">NEW</span></label>
            <div class="chips" id="eligChips" data-oth="elOth">
              <button class="chip-o neg">Cancer</button><button class="chip-o neg">Brain Tumor</button><button class="chip-o neg">Recent Heart Surgery</button><button class="chip-o neg">Organ Transplant</button><button class="chip-o neg">Pregnancy</button><button class="chip-o neg">Age Above 75</button><button class="chip-o neg">Already Paid</button><button class="chip-o neg">Other Language</button><button class="chip-o neg" data-others="1">Others</button>
            </div>
            <input class="input hideblock" id="elOth" style="margin-top:8px;max-width:380px" placeholder="Enter exclusion detail…">
            <div class="banner good" id="eligBanner"><svg class="icon" style="width:16px;height:16px"><use href="#i-check"/></svg> <span>Eligible for diabetes reversal — appointment can be booked.</span></div></div>
        </div></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-target"/></svg> Assignment &amp; pipeline <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g3">
          <div class="fld"><label class="lbl">Salesperson</label><select class="select" id="salesSel"><option value="">— Select —</option></select></div>
          <div class="fld"><label class="lbl">Sales team</label><select class="select" id="salesTeamSel"><option value="">— Select —</option><option>Walkin Callers Team</option><option>BDM Team</option><option>Online Team</option></select></div>
          <div class="fld"><label class="lbl">HC assigned <span class="nb">NEW</span></label><select class="select" id="hcSel"><option value="">— Select —</option></select></div>
          <div class="fld"><label class="lbl">Priority</label><div class="stars" id="stars"><span class="star on">★</span><span class="star on">★</span><span class="star">★</span></div></div>
          <div class="fld"><label class="lbl">Probability</label><div class="prob"><input type="range" min="0" max="100" value="62" oninput="document.getElementById('pv').textContent=this.value+'%'"><span class="pv" id="pv">62%</span></div></div>
          <div class="fld"><label class="lbl">Tags</label><input class="input" value="hot-lead, walk-in-jun"></div>
        </div></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-phone"/></svg> Call status <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="g2">
            <div class="fld"><label class="lbl">Call status — drives the flow</label>
              <select class="select" id="callStatus" onchange="callStatusChange(this.value)">
                <option value="new">New (Default)</option><option value="dnd">DND</option><option value="rnr">RNR</option><option value="busy">Line Busy</option><option value="cb">Call Back</option><option value="paid">Already Paid</option><option value="fu">Follow Up</option><option value="so">Switched Off</option><option value="nreg">Not Registered</option><option value="nosugar">No Sugar</option><option value="ni">Not Interested</option><option value="oos">Out of Service</option><option value="wn">Wrong Number</option><option value="afd">Appointment Fixed – Direct</option><option value="afz">Appointment Fixed – Zoom</option><option value="apc">Appointment Confirmed</option><option value="vis">Visited</option><option value="enr">Enrolled</option><option value="payp">Payment Pending</option><option value="payc">Payment Completed</option><option value="int">Interested</option><option value="nr">Not Reachable</option><option value="cbr">Callback Requested</option>
              </select></div>
            <div class="fld"><label class="lbl">Next follow-up date &amp; time</label><input class="input" id="nextFollowUp" type="datetime-local"></div>
          </div>
          <div class="fld"><label class="lbl">Call notes <span class="nb">NEW</span></label><textarea class="area" rows="3" placeholder="What was discussed, objections, next step…"></textarea></div>
          <div class="banner plan hideblock" id="fuPanel" style="display:none;flex-direction:column;align-items:stretch;gap:10px">
            <div style="display:flex;gap:9px;align-items:center"><svg class="icon" style="width:16px;height:16px"><use href="#i-repeat"/></svg><b>Follow-up plan — standard procedure</b></div>
            <div class="g4" style="gap:10px">
              <div><label class="lbl" style="color:var(--vio-ink)">Reason / intent</label><select class="select" style="height:36px"><option>Will decide this week</option><option>Family discussion needed</option><option>Budget / salary date</option></select></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Planned date &amp; time *</label><input class="input" style="height:36px" type="datetime-local"></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Reminder before</label><select class="select" style="height:36px"><option selected>15 min before</option><option>30 min before</option></select></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Attempt # <span class="ab">AUTO</span></label><input class="input mono" style="height:36px" value="3 of 5" readonly></div>
            </div>
            <div><label class="lbl" style="color:var(--vio-ink)">Follow-up notes</label>
              <div style="display:flex;gap:8px"><input class="input" id="fuNoteA" style="height:36px;background:#fff" placeholder="e.g. Wants to check with brother…"><button class="btn bsm" style="height:36px;flex:none;background:#fff" onclick="addFuNoteA()">Add note</button></div>
              <div id="fuNotesA" style="margin-top:9px;display:flex;flex-direction:column;gap:6px">
                <div style="background:#fff;border:1px solid var(--line);border-radius:9px;padding:7px 11px;font-size:12px"><b class="mono" style="color:var(--vio-ink)">Attempt 2 · 12-Jun 08:58</b> — RNR; sent WA.</div>
                <div style="background:#fff;border:1px solid var(--line);border-radius:9px;padding:7px 11px;font-size:12px"><b class="mono" style="color:var(--vio-ink)">Attempt 1 · 11-Jun 18:40</b> — Interested but busy.</div>
              </div></div>
          </div>
        </div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-msg"/></svg> WhatsApp messaging — WATI templates <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="g3">
            <div class="fld"><label class="lbl">Template</label><select class="select" id="waTplSel" onchange="waTpl()"><option value="welcome" selected>Welcome &amp; intro</option><option value="appt">Appointment confirmation</option><option value="fu">Follow-up reminder</option><option value="pay">Payment link</option></select></div>
            <div class="fld" style="grid-column:span 2"><label class="lbl">Preview</label><textarea class="area" id="waPrev" rows="3" placeholder="Template preview will appear here"></textarea></div>
          </div>
          <div style="display:flex;gap:9px;margin-top:6px"><button class="btn bsm bp" onclick="toast('WA template sent via WATI')"><svg class="icon" style="width:14px;height:14px"><use href="#i-msg"/></svg> Send via WATI</button></div>
        </div></div>

      <div class="sec hideblock" id="apptSec" style="display:none"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-cal"/></svg> Appointment — slot board <span class="chipb info" id="apptMode" style="margin-left:6px">Direct (Walk-in)</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="g4">
            <div class="fld"><label class="lbl">Date</label><input class="input" type="date" id="slotDate" onchange="renderSlots()"></div>
            <div class="fld"><label class="lbl">HC</label><select class="select" id="apptHc"><option value="">— Select —</option></select></div>
            <div class="fld"><label class="lbl">Capacity rule</label><input class="input mono" value="Max 4 bookings / slot" readonly></div>
            <div class="fld"><label class="lbl">Appt request <span class="ab">AUTO</span></label><input class="input mono" value="12-Jun 09:02" readonly></div>
          </div>
          <div class="fld"><label class="lbl">Day view — slot occupancy</label><div class="slotgrid" id="slotGrid"></div></div>
          <div class="banner plan hideblock" id="reschBanner" style="display:none"><svg class="icon" style="width:16px;height:16px"><use href="#i-repeat"/></svg> <span>Reschedule mode — pick new slot.</span></div>
          <div style="display:flex;gap:9px;margin-top:13px"><button class="btn bp" id="bookBtn" onclick="bookSlot()"><svg class="icon"><use href="#i-check"/></svg> Book Ajith into selected slot</button><button class="btn hideblock" id="reschBtn" style="display:none" onclick="startResch()"><svg class="icon"><use href="#i-repeat"/></svg> Reschedule</button></div>
        </div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-check"/></svg> Visited status <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g3">
          <div class="fld"><label class="lbl">Visited status</label><div class="pills"><button class="pill p-vio on" onclick="window._advSetOpen()">Open</button><button class="pill p-ok" onclick="visitedFx()">Visited</button></div></div>
          <div class="fld"><label class="lbl">Visited date <span class="ab">AUTO</span></label><input class="input" id="visDt" readonly placeholder="— set on Visited"></div>
        </div></div></div>

      <div class="sec closed"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-audit"/></svg> Sales caller self-audit <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="aud"><div class="ahd">Self evaluation</div><div class="g3">
          <div class="fld"><label class="lbl glbl">✓ Good</label><textarea class="area"></textarea></div>
          <div class="fld"><label class="lbl blbl">✗ Not good</label><textarea class="area"></textarea></div>
          <div class="fld"><label class="lbl ilbl">▲ Improve</label><textarea class="area"></textarea></div></div></div></div></div>

      <div class="sec closed"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-audit"/></svg> BDM audit <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="aud"><div class="ahd">BDM evaluation</div><div class="g3">
          <div class="fld"><label class="lbl glbl">✓ Good</label><textarea class="area"></textarea></div>
          <div class="fld"><label class="lbl blbl">✗ Not good</label><textarea class="area"></textarea></div>
          <div class="fld"><label class="lbl ilbl">▲ Improve</label><textarea class="area"></textarea></div></div>
          <div class="g3" style="margin-top:4px">
            <div class="fld"><label class="lbl">BDM score</label><div class="score" id="bdm"><button>1</button><button>2</button><button>3</button><button class="on">4</button><button>5</button></div></div>
            <div class="fld"><label class="lbl">Status</label><select class="select"><option>Open</option><option selected>Done</option></select></div></div></div></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-chat"/></svg> Remarks <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="fld"><textarea class="area" rows="2" placeholder="Add a remark…"></textarea></div></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-clock"/></svg> Activity log <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="timeline" id="actLog" style="margin-top:12px"><div style="text-align:center;color:var(--faint);padding:18px;font-size:13px">No activity recorded for this lead yet.</div></div></div></div>

      <div style="display:flex;gap:10px;margin-top:18px"><button class="btn bp" style="height:45px;padding:0 22px" onclick="window._advSaveRecord()">Save lead record</button></div>
    </div>
    <div class="a-p" data-p="health" style="display:none">
      <div class="banner plan" style="margin-top:16px"><svg class="icon" style="width:15px;height:15px"><use href="#i-doc"/></svg> <span><b>View only.</b> This clinical record is owned by the Health coach — advisors can read everything but edit nothing. Every view is audit-logged.</span></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-stetho"/></svg> Consultation &amp; program <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No health-coach consultation recorded for this lead yet.</div></div></div>
    </div>
    <div class="a-p" data-p="pay" style="display:none"><div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-wallet"/></svg> Payment history</div><div class="sec-bd"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No payment records for this lead yet.</div></div></div></div>
    <div class="a-p" data-p="notes" style="display:none"><div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-chat"/></svg> Internal notes</div><div class="sec-bd"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No internal notes for this lead yet.</div></div></div></div>
    <div class="a-p" data-p="extra" style="display:none"><div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-doc"/></svg> Extra info</div><div class="sec-bd"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No additional information for this lead yet.</div></div></div></div>
    <div class="a-p" data-p="calls" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-phone"/></svg> Call logs <span class="chipb ok" style="margin-left:auto">Auto-captured</span></div>
        <div class="sec-bd"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No call records for this lead yet.</div></div></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-clock"/></svg> History of activity</div>
        <div class="sec-bd"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No activity recorded for this lead yet.</div></div></div>
    </div>
    </div><!-- /advDetailPane -->
    </div><!-- /flex row -->
  </div></section>

  <!-- COACH -->
  <section class="screen" id="s-coach"><div class="wrap">
    <div id="coachOpenList" style="margin-bottom:14px"></div>
    <div id="coachKanban" style="display:none;margin-bottom:14px;overflow-x:auto"></div>
    <div class="chead">
      <span class="cav" id="coachAv" style="background:linear-gradient(135deg,#378ADD,#185FA5)">—</span>
      <div class="cmeta"><h1 id="coachName">No client open</h1>
        <div class="sub" id="coachSub"><span class="mono">Pick a visited client below</span></div>
        <div class="cbadges" id="coachBadges"></div></div>
      <div class="cacts"><span class="chipb vio" id="coachBadge" style="height:30px">Status: —</span><button class="btn bp" id="coachCallBtn"><svg class="icon"><use href="#i-phone"/></svg> Call</button><button class="btn bwa"><svg class="icon"><use href="#i-msg"/></svg> WA</button></div>
    </div>
    <div class="rtabs" id="cTabs">
      <button data-t="recep2">Walk-in Receptionist</button><button data-t="sales2">Walk-in Sales</button><button class="on" data-t="health2">Walk-in Health</button>
      <button data-t="pay2">Payment History</button><button data-t="notes2">Internal Notes</button>
      <button data-t="extra2">Extra Info</button><button data-t="calls2">Call History <span class="mini" id="coachCallCount">0</span></button>
    </div>
    <div class="c-p" data-p="health2">

      <div class="sec closed"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-user"/></svg> Lead recap &amp; walk-in <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g4">
          <div class="fld"><label class="lbl">Sugar level</label><input class="input" id="crSugar" readonly></div>
          <div class="fld"><label class="lbl">Fasting / PP</label><input class="input mono" id="crFasting" readonly></div>
          <div class="fld"><label class="lbl">HbA1c (%)</label><input class="input mono" id="crHba1c" readonly></div>
          <div class="fld"><label class="lbl">Walk-in status</label><select class="select" id="crWalkIn"><option>Open</option><option selected>Visited</option><option>Not Visited</option><option>Rescheduled</option></select></div>
          <div class="fld fw"><label class="lbl">Blood reports — from Health advisor <span class="ab">SYNCED</span></label>
            <div class="atts" id="coachAtts"></div></div>
          <div class="fld fw"><label class="lbl">Remarks</label><textarea class="area" rows="2" id="crRemarks"></textarea></div>
        </div></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-heart"/></svg> Screening results — clinic floor <span class="chipb warn" id="scrChip" style="margin-left:8px">Awaiting screening</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="stub" id="scrEmpty" style="margin-top:12px">Client is at reception / screening. The moment the screening desk saves the M0 baseline, the vitals appear here automatically — read-only, locked as baseline.</div>
          <div class="g4" id="scrData" style="display:none;margin-top:2px">
            <div class="fld"><label class="lbl">Height (cm)</label><input class="input mono" id="cs_h" readonly></div>
            <div class="fld"><label class="lbl">Weight (kg)</label><input class="input mono" id="cs_w" readonly></div>
            <div class="fld"><label class="lbl">BMI <span class="ab">AUTO</span></label><input class="input mono" id="cs_bmi" readonly></div>
            <div class="fld"><label class="lbl">BP</label><input class="input mono" id="cs_bp" readonly></div>
            <div class="fld"><label class="lbl">Pulse</label><input class="input mono" id="cs_pu" readonly></div>
            <div class="fld"><label class="lbl">SpO2 (%)</label><input class="input mono" id="cs_sp" readonly></div>
            <div class="fld"><label class="lbl">Waist (cm)</label><input class="input mono" id="cs_wa" readonly></div>
            <div class="fld"><label class="lbl">Temp</label><input class="input mono" id="cs_te" readonly></div>
            <div class="fld"><label class="lbl">Desk glucose (mg/dL)</label><input class="input mono" id="cs_gl" readonly></div>
            <div class="fld" style="grid-column:span 3"><label class="lbl">Captured by</label><input class="input" value="Screening desk · M0 baseline · locked" readonly></div>
          </div>
        </div></div>
      <div class="sec closed"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-heart"/></svg> Health assessment <span class="chipb warn" style="margin-left:6px">In progress</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="aud" style="background:#fff"><div class="ahd">Basic health info</div><div class="g4">
            <div class="fld fw"><label class="lbl">Chief complaint</label><input class="input" id="haChief"></div>
            <div class="fld"><label class="lbl">Duration of diabetes</label><select class="select"><option>Newly Diagnosed</option><option>1–3 yrs</option><option selected>3–5 yrs</option><option>5–10 yrs</option><option>10+ yrs</option></select></div>
            <div class="fld"><label class="lbl">Family history</label><select class="select"><option>None</option><option selected>Father</option><option>Mother</option><option>Both Parents</option><option>Sibling</option></select></div>
            <div class="fld"><label class="lbl">Height (cm)</label><input class="input mono" id="haHeight" oninput="window._haBmiCalc()"></div>
            <div class="fld"><label class="lbl">Weight (kg)</label><input class="input mono" id="haWeight" oninput="window._haBmiCalc()"></div>
            <div class="fld"><label class="lbl">BMI <span class="ab">AUTO</span></label><input class="input mono" id="haBmi" readonly></div>
            <div class="fld"><label class="lbl">BP</label><input class="input mono" id="haBp"></div>
            <div class="fld"><label class="lbl">Pulse</label><input class="input mono" id="haPulse"></div>
            <div class="fld"><label class="lbl">Temp</label><input class="input mono" id="haTemp"></div></div></div>
          <div class="aud" style="background:#fff"><div class="ahd">Lifestyle &amp; diet</div><div class="g4">
            <div class="fld"><label class="lbl">Diet type</label><select class="select"><option>Vegetarian</option><option selected>Non-Vegetarian</option><option>Vegan</option><option>Eggetarian</option></select></div>
            <div class="fld"><label class="lbl">Physical activity</label><select class="select"><option selected>Sedentary</option><option>Light</option><option>Moderate</option><option>Active</option></select></div>
            <div class="fld"><label class="lbl">Sleep</label><select class="select"><option>&lt;5</option><option selected>5–6 hrs</option><option>6–7</option><option>7–8</option><option>8+</option></select></div>
            <div class="fld"><label class="lbl">Water (L/day)</label><select class="select"><option>&lt;1L</option><option selected>1–2L</option><option>2–3L</option><option>3L+</option></select></div>
            <div class="fld"><label class="lbl">Smoking</label><select class="select"><option selected>Never</option><option>Occasional</option><option>Regular</option><option>Quit</option></select></div>
            <div class="fld"><label class="lbl">Alcohol</label><select class="select"><option>Never</option><option selected>Occasional</option><option>Regular</option><option>Quit</option></select></div></div></div>
          <div class="aud" style="background:#fff"><div class="ahd">Symptoms reported</div>
            <div class="chips" data-oth="syOth"><button class="chip-o">Frequent Urination</button><button class="chip-o">Excessive Thirst</button><button class="chip-o">Fatigue</button><button class="chip-o">Blurred Vision</button><button class="chip-o">Tingling/Numbness</button><button class="chip-o">Slow Healing Wounds</button><button class="chip-o">Weight Loss</button><button class="chip-o">Headache</button><button class="chip-o" data-others="1">Others</button></div>
            <input class="input hideblock" id="syOth" style="margin-top:8px;max-width:360px" placeholder="Enter details…"></div>
          <div class="fld"><label class="lbl">Doctor / consultant notes</label><textarea class="area" id="haDocNotes"></textarea></div>
          <button class="btn bp" style="margin-top:12px" onclick="window._coachSaveRecord()">Save health assessment</button>
        </div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-stetho"/></svg> Consultation status &amp; program <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="g4">
            <div class="fld"><label class="lbl">Attended by (HC)</label><input class="input" id="haAttendedBy" readonly></div>
            <div class="fld"><label class="lbl">Consultation date</label><input class="input" type="date" id="haConsultDate"></div>
            <div class="fld"><label class="lbl">Next review date</label><input class="input" type="date"></div>
            <div class="fld"><label class="lbl">Recording status</label><div class="pills"><button class="pill p-vio on">Open</button><button class="pill p-ok">Done</button><button class="pill p-al">Not Done</button></div></div>
          </div>
          <div class="mic"><button class="micb" id="micBtn"><svg class="icon" style="width:19px;height:19px"><use href="#i-mic"/></svg></button>
            <div style="flex:1"><b style="font-size:13px" id="micTxt">Start recording</b><div style="font-size:11.5px;color:var(--muted)">Calls are recorded via Smartflo · Zoom link for online consults</div></div>
            <input class="input" id="coachRecUrl" style="max-width:260px" placeholder="https://zoom.us/rec/… or call recording"></div>

          <div class="fld"><label class="lbl">Consultation status — drives payment &amp; follow-up flow</label>
            <div class="pills" id="consStatus">
              <button class="pill p-vio on" onclick="consAct('open',this)">Open</button>
              <button class="pill p-ok" onclick="consAct('join',this)">Will Join Immediately</button>
              <button class="pill p-vio" onclick="consAct('fup',this)">This Week</button>
              <button class="pill p-info" onclick="consAct('fup',this)">End of Month</button>
              <button class="pill p-warn" onclick="consAct('fup',this)">Next Month</button>
              <button class="pill p-ok" onclick="consAct('enrol1',this)">Enrolled – L1</button>
              <button class="pill p-ok" onclick="consAct('enrol2',this)">Enrolled – L2</button>
              <button class="pill p-info" onclick="consAct('paidb',this)">Already Paid – Before Consultation</button>
              <button class="pill p-info" onclick="consAct('paida',this)">Already Paid – After Consultation</button>
              <button class="pill p-al" onclick="consAct('ni',this)">Not Interested</button>
              <button class="pill p-al" onclick="consAct('refund',this)">Refund</button>
            </div></div>
          <div class="banner plan hideblock" id="coachFu" style="display:none;flex-direction:column;align-items:stretch;gap:10px">
            <div style="display:flex;gap:9px;align-items:center"><svg class="icon" style="width:16px;height:16px"><use href="#i-repeat"/></svg><b>Strong follow-up flow — auto-created plan (committed but not paid)</b></div>
            <div class="g4" style="gap:10px">
              <div><label class="lbl" style="color:var(--vio-ink)">Commitment date *</label><input class="input" style="height:36px" type="date"></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Owner</label><select class="select" style="height:36px" id="fuOwner"><option selected>-- Select --</option></select></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Blocker</label><select class="select" style="height:36px"><option>Budget / salary date</option><option>Family discussion</option><option>Travel</option><option>Comparing options</option></select></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Hold offer till</label><input class="input" style="height:36px" type="date"></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Reminder before <span class="nb">NEW</span></label><select class="select" style="height:36px"><option selected>15 min before</option><option>30 min before</option></select></div>
              <div style="grid-column:span 3"><label class="lbl" style="color:var(--vio-ink)">If not actioned — repeat notify</label><input class="input" style="height:36px" value="Re-notify owner every 10 min × 3 → then escalate to ABM + Deviation page" readonly></div>
            </div>
            <div><label class="lbl" style="color:var(--vio-ink)">Follow-up notes — every attempt logged (clients may take 5–6 follow-ups)</label>
              <div style="display:flex;gap:8px"><input class="input" id="fuNote" style="height:36px;background:#fff" placeholder="e.g. Spoke to wife, salary on 1st — call on 2nd…"><button class="btn bsm" style="height:36px;flex:none;background:#fff" onclick="addFuNote()">Add note</button></div>
              <div id="fuNotes" style="margin-top:9px;display:flex;flex-direction:column;gap:6px"></div></div>
            <div style="font-size:11.5px;font-weight:500">Auto-touch plan: ① WA summary + program PDF today · ② call T+2 days · ③ WA offer-reminder T+5 · ④ call on commitment date − 1 · ⑤ missed → Deviation + ABM. Every touch logged.</div>
          </div>
          <div class="banner bad hideblock" id="refundPanel" style="display:none;flex-direction:column;align-items:stretch;gap:10px">
            <div style="display:flex;gap:9px;align-items:center"><svg class="icon" style="width:16px;height:16px"><use href="#i-coin"/></svg><b>Refund request — routes through ABM → BM → Accounts (rule-enforced)</b></div>
            <div class="g4" style="gap:10px">
              <div><label class="lbl" style="color:var(--alert-ink)">Reason *</label><select class="select" style="height:36px"><option>Medical — cannot continue</option><option>Relocation</option><option>Dissatisfied with program</option><option>Financial difficulty</option><option>Duplicate payment</option><option>Others</option></select></div>
              <div><label class="lbl" style="color:var(--alert-ink)">Paid amount <span class="ab">AUTO</span></label><input class="input mono" style="height:36px" id="refPaid" readonly></div>
              <div><label class="lbl" style="color:var(--alert-ink)">Days since payment <span class="ab">AUTO</span></label><input class="input mono" style="height:36px" id="refDays" readonly></div>
              <div><label class="lbl" style="color:var(--alert-ink)">Eligible refund <span class="ab">AUTO</span></label><input class="input mono" style="height:36px" id="refEligible" readonly></div>
            </div>
            <button class="btn bsm" style="background:#fff;align-self:flex-start" onclick="toast('Refund request submitted → ABM approval queue')">Submit refund request → ABM</button>
          </div>
          <div class="fld"><label class="lbl">Client expectations &amp; commitments</label><textarea class="area" placeholder="e.g. HbA1c 9.2 → below 7 in 3 months; morning walks; diet…"></textarea></div>
          <div class="g4" style="margin-top:3px">
            <div class="fld"><label class="lbl">Program suggested</label><select class="select" id="haProgram" onchange="window._payCalcAll()"><option>L1</option><option selected>L2</option><option>L1 + L2</option></select></div>
            <div class="fld"><label class="lbl">L1 price · full only</label><select class="select" id="haL1Price" onchange="window._payCalcAll()"><option>₹3,999 (Standard)</option><option>₹3,500 (Offer)</option><option>Special Offer</option></select></div>
            <div class="fld"><label class="lbl">Special offer amt (₹)</label><input class="input mono" id="haSpecialAmt" oninput="window._payCalcAll()"></div>
            <div class="fld"><label class="lbl">L2 price (₹)</label><input class="input mono" id="haL2Price" oninput="window._payCalcAll()"></div>
            <div class="fld" style="grid-column:span 2"><label class="lbl">Coupon code — special discount <span class="nb">NEW</span></label>
              <div style="display:flex;gap:7px"><input class="input mono" id="coupon" placeholder="e.g. FEST2000"><button class="btn" style="height:39px;flex:none" onclick="applyCoupon()">Apply</button></div>
              <div id="couponRes" style="font-size:11.5px;font-weight:600;margin-top:6px;display:flex;gap:7px;flex-wrap:wrap;align-items:center"></div></div>
            <div class="fld"><label class="lbl">Client category</label><select class="select"><option>-- Select --</option><option>VIP</option><option>Staff Relatives</option><option>Officers</option><option>Complicated</option></select></div>
            <div class="fld"><label class="lbl">Date of joining</label><input class="input" type="date"></div>
            <div class="fld"><label class="lbl">Access planned</label><input class="input" type="date"></div>
            <div class="fld"><label class="lbl">Attended by <span class="ab">AUTO</span></label><input class="input" id="haAttendedBy2" readonly></div>
          </div>
        </div></div>

      <div class="sec hideblock" id="paySec" style="display:none"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-wallet"/></svg> Payment — standard collection flow <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="steps"><div class="step on"><span class="n">1</span> Quote (auto from price master)</div><div class="step on"><span class="n">2</span> Collect — Reception desk / Razorpay link / EMI provider</div><div class="step"><span class="n">3</span> Attach proof *</div><div class="step"><span class="n">4</span> Accounts verifies vs bank</div><div class="step"><span class="n">5</span> Auto receipt + GST invoice</div></div>
          <div class="banner good" style="margin-top:10px"><svg class="icon" style="width:15px;height:15px"><use href="#i-check"/></svg> <span><b>Who collects:</b> Reception or Razorpay link — never the coach. Coach closes, Reception/link collects, Accounts verifies. Cash gets a numbered desk receipt; nothing is "received" until proof + ref are attached.</span></div>
          <div class="g3" style="margin-top:6px">
            <div class="fld"><label class="lbl">Payment method</label>
              <select class="select" id="payMethod" onchange="payBlk(this.value)"><option value="">-- Select --</option><option value="full" selected>Full Payment (1 Shot)</option><option value="i2">Installment (2x)</option><option value="emi">EMI (BFL / SaveIn)</option><option value="adv">Advance Booking</option></select></div>
            <div class="fld"><label class="lbl">Collected by</label><select class="select" id="collectedBy"><option selected>Reception desk</option><option>Razorpay link (online)</option><option>EMI provider</option></select></div>
            <div class="fld"><label class="lbl">Accounts team verification</label><div class="pills" id="payVerify"><button class="pill p-warn on" onclick="window._payVerify('pending',this)">Pending</button><button class="pill p-ok" onclick="window._payVerify('verified',this)">Verified</button></div></div>
          </div>
          <div style="display:flex;gap:10px;margin-top:12px;align-items:center;flex-wrap:wrap">
            <button class="btn bsm bp" onclick="sendToReception()"><svg class="icon" style="width:14px;height:14px"><use href="#i-coin"/></svg> Send collection request to Reception</button>
            <span style="font-size:11.5px;color:var(--muted)">Appears instantly in <b>Reception → Collect payment</b> queue with client, plan &amp; amount</span>
          </div>

          <div class="payblk on" id="pb-full"><div class="pt"><svg class="icon" style="width:15px;height:15px"><use href="#i-coin"/></svg> Full payment</div>
            <div class="g4">
              <div class="fld"><label class="lbl">Amount due <span class="ab">AUTO</span></label><input class="input mono" id="payAmtDue" readonly></div>
              <div class="fld"><label class="lbl">Amount received (₹)</label><input class="input mono" id="payFullRcvd" oninput="window._payCalcFull()"></div>
              <div class="fld"><label class="lbl">Mode</label><select class="select" id="payFullMode"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Cheque</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" id="payFullRef" placeholder="Mandatory"></div>
              <div class="fld"><label class="lbl">Actual paid date</label><input class="input" type="date" id="payFullDate"></div>
              <div class="fld fw"><label class="lbl">Payment proof — attachment * <span class="nb">NEW</span></label><div class="atts" id="payFullProof"><span class="att add" onclick="window._payAttach('payFullProof')"><svg class="icon"><use href="#i-clip"/></svg> Attach screenshot / receipt</span></div></div>
              <div class="fld fw"><label class="lbl">Status</label><div class="pills"><button class="pill p-ok">Payment Done</button><button class="pill p-warn on">In Process</button><button class="pill">Pending</button></div></div>
            </div></div>

          <div class="payblk" id="pb-i2"><div class="pt"><svg class="icon" style="width:15px;height:15px"><use href="#i-coin"/></svg> Installment (2x) — balance never untracked</div>
            <div class="aud" style="background:#fff;margin-top:8px"><div class="ahd">Part 1 — Installment 1 (collected now)</div><div class="g4">
              <div class="fld"><label class="lbl">Total <span class="ab">AUTO</span></label><input class="input mono" id="i2Total" readonly></div>
              <div class="fld"><label class="lbl">Inst-1 received (₹)</label><input class="input mono" id="i2Inst1Rcvd" placeholder="e.g. 16000" oninput="window._payCalcI2()"></div>
              <div class="fld"><label class="lbl">Mode</label><select class="select" id="i2Inst1Mode"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Inst-1 date</label><input class="input" type="date" id="i2Inst1Date"></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" id="i2Inst1Ref" placeholder="Mandatory"></div>
              <div class="fld" style="grid-column:span 3"><label class="lbl">Inst-1 proof *</label><div class="atts" id="i2Inst1Proof"><span class="att add" onclick="window._payAttach('i2Inst1Proof')"><svg class="icon"><use href="#i-clip"/></svg> Attach proof</span></div></div>
            </div></div>
            <div class="aud" style="background:#fff"><div class="ahd" style="color:var(--warn-ink)">Part 2 — Balance collection (separate fields · auto-reminders from Accounts)</div><div class="g4">
              <div class="fld"><label class="lbl">Balance due <span class="ab">AUTO</span></label><input class="input mono" id="i2BalDue" readonly></div>
              <div class="fld"><label class="lbl">Balance due date *</label><input class="input" type="date" id="i2BalDueDate"></div>
              <div class="fld"><label class="lbl">Balance received (₹)</label><input class="input mono" id="i2BalRcvd"></div>
              <div class="fld"><label class="lbl">Mode</label><select class="select" id="i2BalMode"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Balance paid date</label><input class="input" type="date" id="i2BalDate"></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" id="i2BalRef" placeholder="Mandatory"></div>
              <div class="fld" style="grid-column:span 2"><label class="lbl">Balance proof *</label><div class="atts" id="i2BalProof"><span class="att add" onclick="window._payAttach('i2BalProof')"><svg class="icon"><use href="#i-clip"/></svg> Attach proof</span></div></div>
            </div></div>
            <div class="fld fw"><label class="lbl">Status</label><div class="pills"><button class="pill p-info">1st Paid</button><button class="pill p-info">2nd Paid</button><button class="pill p-ok">Both Paid</button><button class="pill p-warn">In Process</button><button class="pill on">Pending</button></div></div>
            </div>

          <div class="payblk" id="pb-emi"><div class="pt"><svg class="icon" style="width:15px;height:15px"><use href="#i-coin"/></svg> EMI (BFL / SaveIn) — client pays financier; we track down payment &amp; disbursement</div>
            <div class="g4">
              <div class="fld"><label class="lbl">Provider</label><select class="select"><option selected>BFL (Bajaj Finserv)</option><option>SaveIn</option></select></div>
              <div class="fld"><label class="lbl">Eligibility (provider tool)</label><div class="pills"><button class="pill p-ok on">Eligible</button><button class="pill p-al">Not Eligible</button></div></div>
              <div class="fld" style="grid-column:span 2"><label class="lbl">Coupon code <span class="nb">NEW</span></label>
                <div style="display:flex;gap:7px"><input class="input mono" id="emiCoupon" placeholder="e.g. FEST2000"><button class="btn" style="height:39px;flex:none" onclick="applyCouponEmi()">Apply</button></div>
                <div id="emiCouponRes" style="font-size:11.5px;font-weight:600;margin-top:6px;display:flex;gap:7px;flex-wrap:wrap;align-items:center"></div></div>
              <div class="fld"><label class="lbl">Program cost <span class="ab">AUTO</span></label><input class="input mono" id="emiCost" readonly></div>
              <div class="fld"><label class="lbl">Down payment (₹) — drives calculator</label><input class="input mono" id="emiDown" placeholder="e.g. 5000" oninput="emiCalc()"></div>
              <div class="fld"><label class="lbl">Financed balance <span class="ab">AUTO</span></label><input class="input mono" id="emiRemain" readonly></div>
              <div class="fld"><label class="lbl">Tenure (months) — drives calculator</label><select class="select" id="emiTenure" onchange="emiCalc()"><option value="">--</option><option>3</option><option>6</option><option>9</option><option>12</option></select></div>
              <div class="fld"><label class="lbl">EMI / month <span class="ab">AUTO calculated</span></label><input class="input mono" id="emiPer" readonly></div>
              <div class="fld"><label class="lbl">Documentation date</label><input class="input" type="date"></div>
              <div class="fld"><label class="lbl">Disbursement ETA <span class="ab">24–48h</span></label><input class="input" type="date"></div>
              <div class="fld"><label class="lbl">Net after subvention <span class="ab">AUTO</span></label><input class="input mono" id="emiNet" readonly></div>
              <div class="fld fw"><label class="lbl">Proof * — down-payment receipt + approval screen + disbursement credit</label><div class="atts" id="emiProofs"><span class="att add" onclick="window._payAttach('emiProofs')"><svg class="icon"><use href="#i-clip"/></svg> Attach down-payment proof</span><span class="att add" onclick="window._payAttach('emiProofs')"><svg class="icon"><use href="#i-clip"/></svg> Attach approval</span><span class="att add" onclick="window._payAttach('emiProofs')"><svg class="icon"><use href="#i-clip"/></svg> Attach credit proof</span></div></div>
              <div class="fld fw"><label class="lbl">EMI payment collection — status</label><div class="pills"><button class="pill p-vio on">Open</button><button class="pill p-ok">EMI Received</button><button class="pill p-warn">EMI Process</button></div></div>
            </div></div>

          <div class="payblk" id="pb-adv"><div class="pt"><svg class="icon" style="width:15px;height:15px"><use href="#i-coin"/></svg> Advance booking — locks the price, starts the clock</div>
            <div class="aud" style="background:#fff;margin-top:8px"><div class="ahd">Part 1 — Advance (collected now)</div><div class="g4">
              <div class="fld"><label class="lbl">Advance (₹2K–5K)</label><input class="input mono" id="advAmt" placeholder="e.g. 2000" oninput="window._payCalcAdv()"></div>
              <div class="fld"><label class="lbl">Mode</label><select class="select" id="advMode"><option>Cash</option><option selected>UPI</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Advance date</label><input class="input" type="date" id="advDate"></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" id="advRef" placeholder="Mandatory"></div>
              <div class="fld fw"><label class="lbl">Advance proof *</label><div class="atts" id="advProof"><span class="att add" onclick="window._payAttach('advProof')"><svg class="icon"><use href="#i-clip"/></svg> Attach proof</span></div></div>
            </div></div>
            <div class="aud" style="background:#fff"><div class="ahd" style="color:var(--warn-ink)">Part 2 — Balance collection (separate fields · auto-reminders + Outstanding queue)</div><div class="g4">
              <div class="fld"><label class="lbl">Balance due <span class="ab">AUTO</span></label><input class="input mono" id="advBalDue" readonly></div>
              <div class="fld"><label class="lbl">Balance due date *</label><input class="input" type="date" id="advBalDueDate"></div>
              <div class="fld"><label class="lbl">Balance received (₹)</label><input class="input mono" id="advBalRcvd"></div>
              <div class="fld"><label class="lbl">Mode</label><select class="select" id="advBalMode"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Balance paid date</label><input class="input" type="date" id="advBalDate"></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" id="advBalRef" placeholder="Mandatory"></div>
              <div class="fld" style="grid-column:span 2"><label class="lbl">Balance proof *</label><div class="atts" id="advBalProof"><span class="att add" onclick="window._payAttach('advBalProof')"><svg class="icon"><use href="#i-clip"/></svg> Attach proof</span></div></div>
            </div></div>
            <div class="fld fw"><label class="lbl">Status</label><div class="pills"><button class="pill p-ok">Advance Paid</button><button class="pill p-warn on">Balance Pending</button><button class="pill p-ok">Fully Paid</button><button class="pill p-al">Cancelled</button></div></div>
            </div>
        </div></div>

      <div class="sec closed"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-chat"/></svg> Feedback call <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="fld"><label class="lbl">Call outcome</label>
            <div class="pills"><button class="pill p-ok">Attended — Feedback Collected</button><button class="pill p-warn">Not Attended — Rescheduled</button><button class="pill p-info">Call Back Requested</button><button class="pill p-al">Switched Off</button><button class="pill p-vio on">Open</button></div></div>
          <div class="g2"><div class="fld"><label class="lbl">Next feedback call</label><input class="input" type="datetime-local"></div></div>
          <div class="fld"><label class="lbl">Feedback notes</label><textarea class="area"></textarea></div>
        </div></div>

      <div class="banner plan" style="margin-top:16px"><svg class="icon" style="width:15px;height:15px"><use href="#i-coin"/></svg> <span>Follow-up &amp; collection sections removed from this screen — committed-not-paid runs through the <b>strong follow-up flow</b> above; balance chasing lives in <b>Accounts → Outstanding</b> with auto-reminders.</span></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-gift"/></svg> Welcome kit <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g3">
          <div class="fld"><label class="lbl">Attended by <span class="ab">AUTO</span></label><input class="input" id="haAttendedBy3" readonly></div>
          <div class="fld" style="grid-column:span 2"><label class="lbl">Welcome kit status</label>
            <div class="pills"><button class="pill p-ok" onclick="toast('Kit issued · logged')">Given</button><button class="pill p-warn">Need to Ship</button><button class="pill p-vio on">Not Required</button></div></div>
        </div></div></div>

      <div style="display:flex;gap:10px;margin-top:18px"><button class="btn bp" style="height:45px;padding:0 22px" onclick="window._coachSaveRecord()">Save health record</button><button class="btn" style="height:45px" onclick="window._coachPrint()">📋 Print prescription</button></div>
    </div>
    <div class="c-p" data-p="recep2" style="display:none"><div class="banner plan" style="margin-top:16px"><svg class="icon" style="width:15px;height:15px"><use href="#i-doc"/></svg> <span><b>View only.</b> Reception record — same as advisor view.</span></div><div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-door"/></svg> Reception record <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div><div class="sec-bd"><table class="tbl"><tbody id="coachRecepBody"><tr><td style="color:var(--muted)">Visited</td><td class="mono">—</td><td style="color:var(--muted)">Registered</td><td class="mono">—</td><td style="color:var(--muted)">Consent</td><td>—</td></tr></tbody></table></div></div></div>
    <div class="c-p" data-p="sales2" style="display:none">
      <div class="banner plan" style="margin-top:16px"><svg class="icon" style="width:15px;height:15px"><use href="#i-doc"/></svg> <span><b>View only.</b> This sales record is owned by the Health advisor — coaches can read the full journey but edit nothing.</span></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Basic &amp; pipeline <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><table class="tbl"><tbody id="roBasic">
          <tr><td style="color:var(--muted)">Occupation</td><td>—</td><td style="color:var(--muted)">Language</td><td>—</td><td style="color:var(--muted)">Source · campaign</td><td>—</td></tr>
          <tr><td style="color:var(--muted)">Location</td><td>—</td><td style="color:var(--muted)">Salesperson</td><td style="font-weight:600">—</td><td style="color:var(--muted)">Priority · probability</td><td>—</td></tr>
        </tbody></table></div></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-drop"/></svg> Sugar profile &amp; eligibility <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><table class="tbl"><tbody id="roSugar">
          <tr><td style="color:var(--muted)">Sugar level</td><td>—</td><td style="color:var(--muted)">Fasting / PP</td><td class="mono">—</td><td style="color:var(--muted)">HbA1c</td><td class="mono" style="font-weight:700">—</td></tr>
          <tr><td style="color:var(--muted)">Treatment</td><td>—</td><td style="color:var(--muted)">Managing now</td><td>—</td><td style="color:var(--muted)">Eligibility</td><td>—</td></tr>
        </tbody></table></div></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-phone"/></svg> Call journey &amp; appointment <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><table class="tbl"><tbody id="roCalls">
          <tr><td style="color:var(--muted)">Call status</td><td>—</td><td style="color:var(--muted)">Appointment</td><td class="mono">—</td><td style="color:var(--muted)">HC</td><td style="font-weight:600">—</td></tr>
          <tr><td style="color:var(--muted)">Last call note</td><td colspan="5">—</td></tr>
        </tbody></table></div></div>
    </div>
    <div class="c-p" data-p="pay2" style="display:none"><div class="stub">Payment history — full ledger.</div></div>
    <div class="c-p" data-p="notes2" style="display:none"><div class="stub">Internal notes.</div></div>
    <div class="c-p" data-p="extra2" style="display:none"><div class="stub">Extra info.</div></div>
    <div class="c-p" data-p="calls2" style="display:none"><div class="stub">Call history.</div></div>
  </div></section>

  <!-- LEAD IMPORT -->
  <section class="screen" id="s-import"><div class="wrap">
    <div class="ph"><div><h1>Lead import &amp; intake</h1><p>Real-time Meta capture, every source, bulk CSV fallback — with control.</p></div>
      <div class="pha"><button class="btn bp" onclick="window._addSingleLead()">+ Add single lead</button></div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:10px 0 4px">
      <span class="viewing"><span class="vd"></span> Viewing as ABM / Admin</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-left:auto" id="impFilterBar">
        <select class="select" id="impMonth" style="height:33px;font-size:12px;width:130px"><option value="all" selected>All Months</option><option value="0">January</option><option value="1">February</option><option value="2">March</option><option value="3">April</option><option value="4">May</option><option value="5">June</option><option value="6">July</option><option value="7">August</option><option value="8">September</option><option value="9">October</option><option value="10">November</option><option value="11">December</option></select>
        <select class="select" id="impYear" style="height:33px;font-size:12px;width:100px"><option value="all" selected>All Years</option><option value="2024">2024</option><option value="2025">2025</option><option value="2026">2026</option></select>
        <input class="input mono" id="impDateFrom" type="datetime-local" title="From date &amp; time" style="height:33px;font-size:11.5px;width:182px">
        <span style="color:var(--faint);font-size:12px">to</span>
        <input class="input mono" id="impDateTo" type="datetime-local" title="To date &amp; time" style="height:33px;font-size:11.5px;width:182px">
        <select class="select" id="impSource" style="height:33px;font-size:12px;width:160px"><option value="all">All Sources</option><option>Meta Ads</option><option>Website forms</option><option>WhatsApp (WATI)</option><option>Google / YouTube</option><option>Walk-in / Referral / Telecalling</option></select>
        <select class="select" id="impService" style="height:33px;font-size:12px;width:150px"><option value="all">All Services</option><option>Diabetes</option><option>Physiotherapy</option><option>Blood Test</option><option>Sona Booth</option></select>
        <button class="btn bsm bp" onclick="window._impApplyFilters()">Apply</button>
        <button class="btn bsm" onclick="window._impClearFilters()">Clear</button>
      </div>
    </div>
    <div class="metrics kpigrid" id="impMetrics" style="grid-template-columns:repeat(auto-fit,minmax(190px,1fr))"></div>
    <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-bolt"/></svg> Source connections <span class="arr">▾</span></div>
      <div class="sec-bd"><div class="tscroll"><table class="tbl" style="min-width:1100px" id="srcConnTable"><thead><tr><th style="width:36px"><input type="checkbox" id="srcSelAll" style="accent-color:var(--brand)"></th><th>Total leads</th><th>Lead source</th><th>Status</th><th>Today</th><th>Last lead</th><th>Mode</th><th>Valid</th><th>Unique</th><th>Duplicate</th><th>Assigned</th><th>Unassigned</th></tr></thead><tbody id="srcTableBody"></tbody></table></div>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center">
        <select class="select" id="srcBulkAction" style="height:32px;font-size:12px;width:250px"><option value="pool">Send unassigned leads → assignment</option><option value="export">Export leads (CSV)</option></select>
        <button class="btn bsm bp" onclick="window._srcBulkAction()">Apply bulk action</button>
        <button class="btn bsm" onclick="window._srcExportSelected()">Export selected</button>
      </div>
      <div class="rb" id="metaLeadAlert" style="margin-top:12px;background:var(--surface-2);border:1px solid var(--line);border-radius:10px;padding:10px 14px">
        <span id="metaLeadAlertText" style="font-size:12.5px;font-weight:600;color:var(--ink)">Alert: notify ABM if no Meta lead for 30 min during campaign hours</span><span class="chipb ok" id="metaLeadAlertChip">Monitoring</span></div></div></div>
    <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-inbox"/></svg> Live incoming feed <span style="font-size:11px;color:var(--faint);margin-left:8px" id="metaFeedStatus">Connecting to Meta…</span> <span class="arr">▾</span></div>
      <div class="sec-bd">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
        <div class="tabs" id="feedViewTabs" style="margin-bottom:0">
          <button class="on" data-fv="all" onclick="window._feedSetView('all')">All leads</button>
          <button data-fv="dup" onclick="window._feedSetView('dup')">Duplicates <span class="mini" id="feedDupCount">0</span></button>
          <button data-fv="valid" onclick="window._feedSetView('valid')">Valid leads <span class="mini" id="feedValidCount">0</span></button>
          <button data-fv="invalid" onclick="window._feedSetView('invalid')">Invalid leads <span class="mini" id="feedInvalidCount">0</span></button>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
          <input class="input" id="feedSearch" placeholder="🔍 Search leads…" style="height:32px;font-size:12px;width:210px" oninput="window._feedSearch()">
          <button class="btn bsm" onclick="window._feedDownload()">⬇ Download</button>
        </div>
      </div>
      <div class="tscroll"><table class="tbl" style="min-width:1480px"><thead><tr id="liveFeedHead"><th style="width:36px"><input type="checkbox" id="feedSelAll" style="accent-color:var(--brand)" title="Select all leads matching the current filter (all pages)"></th><th>Date &amp; Time (IST)</th><th>Campaign</th><th>Ad Name</th><th>Lead Name</th><th>Phone Number</th><th>Sugar Poll</th><th>City</th><th>Street</th><th>Source</th><th>Service</th><th>Language</th><th>Received</th><th>Dedup</th></tr></thead><tbody id="liveFeedBody">
        <tr><td colspan="14" style="text-align:center;color:var(--faint);padding:24px">Loading live leads from Meta ad accounts…</td></tr>
      </tbody></table></div>
      <div style="display:flex;gap:10px;margin-top:12px;align-items:center;justify-content:center;flex-wrap:wrap">
        <button class="btn bsm" id="metaFirstBtn" onclick="window._metaPage('first')">« First</button>
        <button class="btn bsm" id="metaPrevBtn" onclick="window._metaPage(-1)">← Previous</button>
        <span style="font-size:12.5px;font-weight:600;color:var(--ink)" id="metaPageInfo">Page 1 of 1</span>
        <button class="btn bsm" id="metaNextBtn" onclick="window._metaPage(1)">Next →</button>
        <button class="btn bsm" id="metaLastBtn" onclick="window._metaPage('last')">Last »</button>
      </div>
      <div style="display:flex;gap:9px;margin-top:12px;align-items:center;flex-wrap:wrap"><button class="btn bsm bp" onclick="window._sendToAssignment()">Send to assignment →</button><span style="font-size:12px;font-weight:700;color:var(--brand-600)" id="feedSelCount"></span><button class="btn bsm bp" id="metaSyncBtn" onclick="window._syncFromMeta()" style="margin-left:auto">⟳ Sync from Meta</button><button class="btn bsm" onclick="window._refreshMetaFeed()">↻ Reload</button><span style="font-size:11px;color:var(--faint)" id="metaFeedCount"></span></div></div></div>
    <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-clip"/></svg> Bulk CSV import — wizard <span class="arr">▾</span></div>
      <div class="sec-bd">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
          <div class="steps" style="flex:1;min-width:240px"><div class="step on"><span class="n">✓</span> Upload</div><div class="step on"><span class="n">2</span> Map columns</div><div class="step"><span class="n">3</span> De-dupe &amp; import</div></div>
          <button class="btn bsm" onclick="window._downloadCSVTemplate()" title="Download a sample CSV with the required columns">⬇ Download template</button>
        </div>
        <div class="split" style="margin-top:14px">
          <div>
            <label class="drop" id="csvDrop" style="cursor:pointer;display:block;text-align:center">
              <input type="file" id="csvFileInput" accept=".csv,text/csv" style="display:none">
              <p style="margin:4px 0 3px;font-weight:600;color:var(--ink)" id="csvFileName">Click to choose a CSV file</p>
              <p style="font-size:12px;margin:0" id="csvFileInfo">Use the template above for the correct columns</p>
            </label></div>
          <div><div class="g2" style="gap:9px;margin-top:0"><select class="select" id="csvSource"><option>Meta</option><option>Website</option><option>WhatsApp</option><option>Walk-in</option></select><select class="select" id="csvBranch"><option>Chennai</option><option>Coimbatore</option><option>Madurai</option></select><select class="select" id="csvBatch"><option>WK-JUN-04</option><option>WK-JUN-03</option><option>WK-JUL-01</option></select><select class="select" id="csvService"><option>Diabetes</option><option>Physio</option><option>Blood test</option></select></div>
            <div id="csvSummary" style="background:var(--surf2,#f4f4f2);border:1px solid var(--line);border-radius:10px;padding:10px 13px;margin-top:13px;font-size:12.5px;color:var(--faint);font-weight:600">Upload a CSV to see the de-dupe summary</div>
            <button class="btn bp" id="csvImportBtn" style="margin-top:13px;width:100%" disabled onclick="window._importCSV()">Import leads</button></div>
        </div>
        <div id="csvImportedWrap" style="display:none;margin-top:18px;border-top:1px solid var(--line);padding-top:16px">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;background:var(--surf2,#f4f4f2);border:1px solid var(--line);border-radius:10px;padding:9px 12px">
            <span style="font-size:12px;font-weight:700;color:var(--ink)">⏱ Time range</span>
            <select class="select" id="csvRangePreset" style="height:31px;font-size:12px;width:150px"><option value="all">All time</option><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="month">This month</option><option value="custom">Custom range</option></select>
            <span style="font-size:11px;color:var(--faint)">From</span><input class="input mono" id="csvRangeFrom" type="datetime-local" style="height:31px;font-size:11.5px;width:185px">
            <span style="font-size:11px;color:var(--faint)">To</span><input class="input mono" id="csvRangeTo" type="datetime-local" style="height:31px;font-size:11.5px;width:185px">
            <button class="btn bsm bp" onclick="window._csvApplyRange()">Apply</button>
            <button class="btn bsm" onclick="window._csvClearRange()">Clear</button>
            <span style="font-size:11px;color:var(--faint);margin-left:auto" id="csvRangeLabel">Showing: all time</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
            <div class="tabs" id="csvTabs" style="margin-bottom:0">
              <button class="on" data-ct="valid">Imported leads <span class="mini" id="csvValidCount">0</span></button>
              <button data-ct="dup">Duplicates <span class="mini" id="csvDupCount">0</span></button>
              <button data-ct="hist">Recent imported leads <span class="mini" id="csvHistCount">0</span></button>
              <button data-ct="repeat">Repeat visitor <span class="mini" id="csvRepeatTabCount">0</span></button>
            </div>
            <button class="btn bsm bp" style="margin-left:auto" onclick="window._csvSendToAssignment()">Send to assignment →</button>
          </div>

          <!-- VALID -->
          <div class="csv-tab" data-ctp="valid">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
              <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600"><input type="checkbox" id="csvValidSelAll" style="accent-color:var(--brand)"> Select all</label>
              <button class="btn bsm" onclick="window._csvDownload('valid')">⬇ Download</button>
              <button class="btn bsm" style="color:var(--alert-ink);border-color:var(--alert)" onclick="window._csvDeleteSelected('valid')">🗑 Delete selected</button>
              <input class="input" id="csvSearch" placeholder="🔍 Search leads…" style="height:30px;font-size:12px;width:200px;margin-left:auto" oninput="window._csvSearch()">
              <span class="chipb ok" id="csvImportedCount">0 records</span>
            </div>
            <div class="tscroll"><table class="tbl" style="min-width:1180px"><thead><tr><th style="width:30px"></th><th>Date &amp; Time</th><th>Campaign</th><th>Ad Name</th><th>Lead Name</th><th>Phone Number</th><th>Sugar Poll</th><th>City</th><th>Street</th><th>Source</th><th>Service</th><th>Name</th><th>Status</th><th>Action</th></tr></thead><tbody id="csvImportedBody"></tbody></table></div>
            <div style="display:flex;gap:10px;margin-top:12px;align-items:center;justify-content:center;flex-wrap:wrap">
              <button class="btn bsm" id="csvFirstBtn" onclick="window._csvPage('first')">« First</button>
              <button class="btn bsm" id="csvPrevBtn" onclick="window._csvPage(-1)">← Previous</button>
              <span style="font-size:12.5px;font-weight:600;color:var(--ink)" id="csvPageInfo">Page 1 of 1</span>
              <button class="btn bsm" id="csvNextBtn" onclick="window._csvPage(1)">Next →</button>
              <button class="btn bsm" id="csvLastBtn" onclick="window._csvPage('last')">Last »</button>
            </div>
          </div>

          <!-- DUPLICATES -->
          <div class="csv-tab" data-ctp="dup" style="display:none">
            <div class="banner plan" style="margin:0 0 12px"><svg class="icon" style="width:15px;height:15px"><use href="#i-doc"/></svg> <span>Duplicate phone numbers detected on import. Review and <b>Keep</b> (move to Imported leads) or <b>Delete</b>. Duplicates are shown here for <b>10 minutes</b>, then auto-removed.</span></div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
              <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600"><input type="checkbox" id="csvDupSelAll" style="accent-color:var(--brand)"> Select all</label>
              <button class="btn bsm" onclick="window._csvKeepSelected()">✓ Keep selected</button>
              <button class="btn bsm" style="color:var(--alert-ink);border-color:var(--alert)" onclick="window._csvDeleteSelected('dup')">🗑 Delete selected</button>
              <button class="btn bsm" onclick="window._csvDownload('dup')">⬇ Download</button>
            </div>
            <div class="tscroll"><table class="tbl" style="min-width:1180px"><thead><tr><th style="width:30px"></th><th>Date &amp; Time</th><th>Campaign</th><th>Lead Name</th><th>Phone Number</th><th>Sugar Poll</th><th>City</th><th>Source</th><th>Service</th><th>Status</th><th>Action</th></tr></thead><tbody id="csvDupBody"></tbody></table></div>
            <div style="display:flex;gap:10px;margin-top:12px;align-items:center;justify-content:center;flex-wrap:wrap">
              <button class="btn bsm" id="csvDupFirstBtn" onclick="window._csvDupPage('first')">« First</button>
              <button class="btn bsm" id="csvDupPrevBtn" onclick="window._csvDupPage(-1)">← Previous</button>
              <span style="font-size:12.5px;font-weight:600;color:var(--ink)" id="csvDupPageInfo">Page 1 of 1</span>
              <button class="btn bsm" id="csvDupNextBtn" onclick="window._csvDupPage(1)">Next →</button>
              <button class="btn bsm" id="csvDupLastBtn" onclick="window._csvDupPage('last')">Last »</button>
            </div>
          </div>

          <!-- HISTORY -->
          <div class="csv-tab" data-ctp="hist" style="display:none">
            <div class="tscroll"><table class="tbl" style="min-width:980px"><thead><tr><th>Imported at (IST)</th><th>File name</th><th>Batch</th><th>By</th><th>Total</th><th>Valid</th><th>Duplicate</th><th>Actions</th></tr></thead><tbody id="csvHistBody"></tbody></table></div>
          </div>

          <!-- REPEAT VISITOR -->
          <div class="csv-tab" data-ctp="repeat" style="display:none">
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
              <select class="select" id="rvMonth" style="height:31px;font-size:12px;width:124px"><option value="all">All Months</option><option value="0">January</option><option value="1">February</option><option value="2">March</option><option value="3">April</option><option value="4">May</option><option value="5">June</option><option value="6">July</option><option value="7">August</option><option value="8">September</option><option value="9">October</option><option value="10">November</option><option value="11">December</option></select>
              <select class="select" id="rvYear" style="height:31px;font-size:12px;width:96px"><option value="all">All Years</option><option>2024</option><option>2025</option><option>2026</option></select>
              <input class="input mono" id="rvFrom" type="date" style="height:31px;font-size:12px;width:130px">
              <span style="color:var(--faint);font-size:12px">to</span>
              <input class="input mono" id="rvTo" type="date" style="height:31px;font-size:12px;width:130px">
              <select class="select" id="rvSource" style="height:31px;font-size:12px;width:150px"><option value="all">All Sources</option></select>
              <button class="btn bsm" onclick="window._rvDownload()" style="margin-left:auto">⬇ Download</button>
            </div>
            <div class="metrics" id="rvKpis" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:12px"></div>
            <div class="tscroll stick1"><table class="tbl" style="min-width:920px"><thead><tr><th>Lead Number</th><th>Lead Name</th><th>Total Visits</th><th>First Visit Date</th><th>Last Visit Date</th><th>Repeat Visitor</th></tr></thead><tbody id="rvBody"></tbody></table></div>
            <div style="display:flex;gap:10px;margin-top:12px;align-items:center;justify-content:center;flex-wrap:wrap">
              <button class="btn bsm" id="rvFirstBtn" onclick="window._rvPage('first')">« First</button>
              <button class="btn bsm" id="rvPrevBtn" onclick="window._rvPage(-1)">← Previous</button>
              <span style="font-size:12.5px;font-weight:600;color:var(--ink)" id="rvPageInfo">Page 1 of 1</span>
              <button class="btn bsm" id="rvNextBtn" onclick="window._rvPage(1)">Next →</button>
              <button class="btn bsm" id="rvLastBtn" onclick="window._rvPage('last')">Last »</button>
            </div>
          </div>
        </div></div></div>
  </div></section>

  <!-- ABM -->
  <section class="screen" id="s-abm"><div class="wrap">
    <div class="ph"><div><h1>Assign &amp; approve</h1><p>Distribute, rescue aging leads, gate sensitive actions.</p></div></div>
    <span class="viewing"><span class="vd"></span> Viewing as Asst. branch manager</span>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:10px 0;background:var(--surf2,#f4f4f2);border:1px solid var(--line);border-radius:10px;padding:9px 12px">
      <span style="font-size:12px;font-weight:700;color:var(--ink)">⏱ Time range</span>
      <select class="select" id="abmRangePreset" style="height:31px;font-size:12px;width:150px"><option value="all">All time</option><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="month">This month</option><option value="custom">Custom range</option></select>
      <span style="font-size:11px;color:var(--faint)">From</span><input class="input mono" id="abmRangeFrom" type="datetime-local" style="height:31px;font-size:11.5px;width:185px">
      <span style="font-size:11px;color:var(--faint)">To</span><input class="input mono" id="abmRangeTo" type="datetime-local" style="height:31px;font-size:11.5px;width:185px">
      <button class="btn bsm bp" onclick="window._abmApplyRange()">Apply</button>
      <button class="btn bsm" onclick="window._abmClearRange()">Clear</button>
      <span style="font-size:11px;color:var(--faint);margin-left:auto" id="abmRangeLabel">Showing: all time</span>
    </div>
    <div class="tabs" id="abmTabs"><button class="on" data-t="assign">Assignment</button><button data-t="dev">Deviation <span class="mini" id="devTabCount">0</span></button><button data-t="appr">Approvals <span class="mini" id="apprTabCount">0</span></button><button data-t="rules">Auto-assign rules</button></div>
    <div class="abm-p" data-p="assign">
      <div class="sec" style="overflow:visible"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-inbox"/></svg> Unassigned pool (<span id="poolCount">0</span>)</div>
        <div class="sec-bd"><div class="tscroll"><table class="tbl"><thead><tr><th style="width:34px"><input type="checkbox" id="poolSelAll" style="accent-color:var(--brand)"></th><th>Lead</th><th>Source · lang</th><th>Sugar</th><th>Waiting</th></tr></thead><tbody id="unassignedPoolBody">
        </tbody></table></div>
        <div style="display:flex;gap:9px;margin-top:12px;flex-wrap:wrap;align-items:flex-start">
          <span style="font-size:12px;font-weight:600;color:var(--ink);padding-top:8px">Assign to:</span>
          <div style="display:flex;flex-direction:column;gap:3px">
            <div id="poolAssignWrap" style="position:relative;width:230px">
              <button type="button" id="poolAssignBtn" class="btn bsm" style="width:100%;justify-content:space-between;font-weight:500;height:34px" onclick="window._poolAdvToggleMenu(event)"><span id="poolAssignLabel" style="color:var(--muted)">— Select advisor(s) —</span><span style="color:var(--faint);font-size:11px">▾</span></button>
              <div id="poolAssignMenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;width:100%;max-height:210px;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:10px;box-shadow:0 8px 24px rgba(17,34,27,.14);z-index:30;padding:4px"></div>
            </div>
            <span style="font-size:10.5px;color:var(--faint)">Tick 1 advisor, or 2+ for round-robin</span>
          </div>
          <button class="btn bsm bp" style="margin-top:0" onclick="window._assignSelected()">Assign selected</button>
          <button class="btn bsm" id="poolRRBtn" style="margin-top:0" onclick="window._assignSelectedRR()" disabled title="Select 2 or more advisors to round-robin">Assign selected (round-robin)</button>
        </div></div></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Advisor load</div>
        <div class="sec-bd"><div class="tscroll"><table class="tbl"><thead><tr><th>Advisor</th><th>Role</th><th>Branch</th><th>Active leads</th><th>Status</th></tr></thead><tbody id="advisorLoadBody"></tbody></table></div></div></div>
    </div>
    <div class="abm-p" data-p="dev" style="display:none">
      <div class="metrics" style="grid-template-columns:repeat(auto-fit,minmax(190px,1fr));margin-bottom:14px">
        <div class="metric r"><div class="ml">Call Deviations (4h+ no call)</div><div class="mv" id="devCardCall">0</div></div>
        <div class="metric a"><div class="ml">Leads Deviations (assigned 4h+)</div><div class="mv" id="devCardLead">0</div></div>
      </div>
      <div class="tabs" id="devSubTabs" style="margin-bottom:12px">
        <button class="on" data-dt="call" onclick="window._devSubTab('call')">Call Deviation <span class="mini" id="callDevCount">0</span></button>
        <button data-dt="lead" onclick="window._devSubTab('lead')">Leads Deviation <span class="mini" id="leadDevCount">0</span></button>
      </div>
      <div class="dev-sub" data-dtp="call">
        <div class="sec" style="overflow:visible"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-bell"/></svg> Call Deviation — in the system 4h+ with no call activity</div>
          <div class="sec-bd">
            <div style="display:flex;gap:8px;margin-bottom:10px;align-items:center;flex-wrap:wrap">
              <span style="font-size:12px;color:var(--faint)">Clears once a call status is set (beyond New/Open) or a call recording is logged.</span>
              <div style="margin-left:auto;display:flex;gap:7px;align-items:center;flex-wrap:wrap">
                <div id="callDevAssignWrap" style="position:relative">
                  <button type="button" id="callDevAssignBtn" class="btn bsm" style="min-width:150px;justify-content:space-between;font-weight:500" onclick="window._devAssignToggle('call',event)"><span id="callDevAssignLabel" style="color:var(--muted)">Assign to…</span><span style="color:var(--faint);font-size:11px">▾</span></button>
                  <div id="callDevAssignMenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;min-width:200px;max-height:210px;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:10px;box-shadow:0 8px 24px rgba(17,34,27,.14);z-index:30;padding:4px"></div>
                </div>
                <button class="btn bsm bp" onclick="window._devAssignSelected('call')">Assign selected</button>
                <button class="btn bsm" id="callDevRRBtn" onclick="window._devAssignRR('call')" disabled title="Select 2 or more advisors to round-robin">Round-robin</button>
                <span id="callDevSelCount" style="font-size:11.5px;font-weight:700;color:var(--brand-600);align-self:center"></span>
              </div>
              <button class="btn bsm" onclick="window._renderCallDeviation()">↻ Refresh</button>
              <button class="btn bsm" onclick="window._downloadDeviation('call')">⬇ Download</button>
            </div>
            <div class="tscroll stick1"><table class="tbl" style="min-width:1200px"><thead><tr><th style="width:34px"><input type="checkbox" id="callDevSelAll" style="accent-color:var(--brand)" onchange="window._devSelAll('call',this.checked)"></th><th>Lead</th><th>Lead Number</th><th>Source · Lang</th><th>Stage</th><th>Status</th><th>Received Date &amp; Time</th><th>Deviation Time</th></tr></thead><tbody id="callDevBody"><tr><td colspan="8" style="text-align:center;color:var(--faint);padding:20px">Loading…</td></tr></tbody></table></div>
          </div></div>
      </div>
      <div class="dev-sub" data-dtp="lead" style="display:none">
        <div class="sec" style="overflow:visible"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-bell"/></svg> Leads Deviation — assigned but not called within 4h</div>
          <div class="sec-bd">
            <div style="display:flex;gap:8px;margin-bottom:10px;align-items:center;flex-wrap:wrap">
              <span style="font-size:12px;color:var(--faint)">Cleared once the assigned advisor logs a call (status beyond New/Open or a recording).</span>
              <div style="margin-left:auto;display:flex;gap:7px;align-items:center;flex-wrap:wrap">
                <div id="leadDevAssignWrap" style="position:relative">
                  <button type="button" id="leadDevAssignBtn" class="btn bsm" style="min-width:150px;justify-content:space-between;font-weight:500" onclick="window._devAssignToggle('lead',event)"><span id="leadDevAssignLabel" style="color:var(--muted)">Assign to…</span><span style="color:var(--faint);font-size:11px">▾</span></button>
                  <div id="leadDevAssignMenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;min-width:200px;max-height:210px;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:10px;box-shadow:0 8px 24px rgba(17,34,27,.14);z-index:30;padding:4px"></div>
                </div>
                <button class="btn bsm bp" onclick="window._devAssignSelected('lead')">Assign selected</button>
                <button class="btn bsm" id="leadDevRRBtn" onclick="window._devAssignRR('lead')" disabled title="Select 2 or more advisors to round-robin">Round-robin</button>
                <span id="leadDevSelCount" style="font-size:11.5px;font-weight:700;color:var(--brand-600);align-self:center"></span>
              </div>
              <button class="btn bsm" onclick="window._renderLeadsDeviation()">↻ Refresh</button>
              <button class="btn bsm" onclick="window._downloadDeviation('lead')">⬇ Download</button>
            </div>
            <div class="tscroll stick1"><table class="tbl" style="min-width:1320px"><thead><tr><th style="width:34px"><input type="checkbox" id="leadDevSelAll" style="accent-color:var(--brand)" onchange="window._devSelAll('lead',this.checked)"></th><th>Lead</th><th>Lead Number</th><th>Source · Lang</th><th>Assigned To</th><th>Stage</th><th>Status</th><th>Assigned Date &amp; Time</th><th>Deviation Time</th></tr></thead><tbody id="leadDevBody"><tr><td colspan="9" style="text-align:center;color:var(--faint);padding:20px">Loading…</td></tr></tbody></table></div>
          </div></div>
      </div></div>
    <div class="abm-p" data-p="appr" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-check"/></svg> Pending approvals</div><div class="sec-bd">
        <table class="tbl"><thead><tr><th>Type</th><th>Detail</th><th>Chain</th><th></th></tr></thead><tbody id="approvalsBody"></tbody></table>
        <div class="banner plan" style="margin-top:12px"><svg class="icon" style="width:15px;height:15px"><use href="#i-doc"/></svg> <span>Approvals (discounts, refunds) will appear here once the approvals workflow is connected to a data source.</span></div>
        <div class="fld" style="max-width:320px;margin-top:12px"><label class="lbl">Delegate while away</label><select class="select"><option>— Off —</option><option>Branch manager</option></select></div></div></div></div>
    <div class="abm-p" data-p="rules" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-cog"/></svg> Auto-assign rules</div><div class="sec-bd"><div class="g3">
        <div class="fld"><label class="lbl">Mode</label><div class="pills"><button class="pill p-vio on">Manual</button><button class="pill p-info">Round-robin</button><button class="pill p-ok">Rule-based</button></div></div>
        <div class="fld"><label class="lbl">Max leads / advisor</label><input class="input mono" value="40"></div>
        <div class="fld"><label class="lbl">First-contact SLA</label><input class="input mono" value="4h 00m"></div>
      </div><button class="btn bp" style="margin-top:14px" onclick="toast('Rules saved')">Save rules</button></div></div></div>
  </div></section>

  <!-- RECEPTION -->
  <section class="screen" id="s-reception"><div style="padding:10px 14px 60px;max-width:100%">
    <div class="inbound" id="inboundBar" style="display:none"><span style="font-size:22px">📞</span><div><b id="inboundName">Incoming call</b><div style="font-size:12px;opacity:.85" id="inboundSub"></div></div><button class="btn bsm" style="background:#fff;color:var(--brand-600);margin-left:auto" onclick="hideInbound()">Dismiss</button></div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
      <div style="background:linear-gradient(135deg,#129468,var(--brand-600));color:#fff;border-radius:11px;padding:8px 14px;display:flex;align-items:center;gap:9px"><svg class="icon" style="stroke:#fff;width:18px;height:18px"><use href="#i-coin"/></svg><div><div style="font-size:9px;opacity:.8;font-weight:600;letter-spacing:.06em">REVENUE</div><div style="font-family:var(--disp);font-size:20px;font-weight:700" id="revTotal">₹0</div></div></div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:11px;padding:8px 14px;display:flex;gap:14px" id="revSvc"></div>
      <div style="margin-left:auto;display:flex;gap:7px"><button class="btn bp" onclick="nwToggle()">+ New walk-in</button></div>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:6px">
      <div id="svcFilt" style="display:flex;gap:5px"></div>
      <span style="color:var(--line);font-size:16px">│</span>
      <div id="dateFilt" style="display:flex;gap:5px"></div>
      <input class="input mono" id="dtFrom" type="date" style="height:29px;width:125px;font-size:11.5px;display:none">
      <span id="dtTo2" style="display:none;color:var(--faint);font-size:12px">to</span>
      <input class="input mono" id="dtTo" type="date" style="height:29px;width:125px;font-size:11.5px;display:none">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px">
      <div id="scCards" class="metrics" style="margin:0;grid-template-columns:repeat(4,1fr)"></div>
      <div id="svcFlows" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"></div>
    </div>
    <div class="sec" style="margin-top:0"><div class="sec-hd" onclick="togSec(this)" style="padding:10px 14px"><svg class="icon"><use href="#i-cal"/></svg> Appointments <span class="chipb info" style="margin-left:6px" id="apptCount">0</span> <span style="margin-left:auto;font-size:11px;color:var(--faint)">Click row → full record</span> <span class="arr">▾</span></div>
      <div class="ftable-wrap" id="apptWrap" style="max-height:380px"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
      <div>
        <div class="sec" style="margin-top:0"><div class="sec-hd" onclick="togSec(this)" style="padding:10px 14px"><svg class="icon"><use href="#i-user"/></svg> Client cross-check <span class="arr">▾</span></div>
          <div class="sec-bd" style="padding:4px 14px 14px"><div style="display:flex;gap:7px"><input class="input" id="ccQ" style="height:35px" placeholder="Try: 98412 or 99999 or Prasad"><button class="btn bsm bp" onclick="ccSearch()">Search</button></div><div id="ccRes" style="margin-top:8px"></div></div></div>
        <div class="sec hideblock" id="nwPanel" style="display:none"><div class="sec-hd" style="cursor:default;padding:10px 14px"><svg class="icon"><use href="#i-door"/></svg> New walk-in — registration + booking</div>
          <div class="sec-bd" style="padding:4px 14px 14px">
            <div class="g4" style="gap:8px">
              <div class="fld"><label class="lbl">Name *</label><input class="input" style="height:34px" id="nwName"></div>
              <div class="fld"><label class="lbl">Phone *</label><input class="input mono" style="height:34px" id="nwPhone" placeholder="+91"></div>
              <div class="fld"><label class="lbl">WhatsApp</label><input class="input mono" style="height:34px"></div>
              <div class="fld"><label class="lbl">Email</label><input class="input" style="height:34px"></div>
              <div class="fld"><label class="lbl">Gender</label><select class="select" style="height:34px"><option>Male</option><option>Female</option><option>Other</option></select></div>
              <div class="fld"><label class="lbl">Age</label><input class="input mono" style="height:34px" type="number" min="1" max="120" placeholder="42"></div>
              <div class="fld"><label class="lbl">Occupation</label><select class="select" style="height:34px"><option>Business</option><option>Private Job</option><option>Govt</option><option>Homemaker</option><option>Others</option></select></div>
              <div class="fld"><label class="lbl">Language</label><select class="select" style="height:34px"><option>Tamil</option><option>Telugu</option><option>Hindi</option></select></div>
              <div class="fld"><label class="lbl">Lead source</label><select class="select" style="height:34px"><option selected>Direct Walk-in</option><option>Referral</option><option>Phone Enquiry</option></select></div>
              <div class="fld"><label class="lbl">Location</label><select class="select" style="height:34px"><option>Poonamalle</option><option>Porur</option></select></div>
              <div class="fld" style="grid-column:span 2"><label class="lbl">Address</label><input class="input" style="height:34px" placeholder="Street, area, city, ZIP"></div>
            </div>
            <div class="fld"><label class="lbl">Service(s)</label><div class="chips" id="nwSvc"><button class="chip-o on" data-svc="dia">🩺 Diabetes</button><button class="chip-o" data-svc="bt">🩸 Blood test</button><button class="chip-o" data-svc="physio">💪 Physio</button></div></div>
            <div class="g4" style="gap:8px;margin-top:6px">
              <div class="fld"><label class="lbl">Date</label><input class="input" type="date" style="height:34px" id="nwDate"></div>
              <div class="fld"><label class="lbl">Time</label><select class="select" style="height:34px" id="nwTime"><option>9:00 AM</option><option>9:30 AM</option><option selected>10:00 AM</option><option>10:30 AM</option><option>11:00 AM</option><option>11:30 AM</option><option>2:00 PM</option><option>2:30 PM</option><option>3:00 PM</option></select></div>
              <div class="fld"><label class="lbl">Provider</label><select class="select" style="height:34px" id="nwProv"><option>Dr. Suresh</option><option>Dr. Priya</option><option>Ganesh (PT)</option></select></div>
              <div class="fld"><label class="lbl">&nbsp;</label><button class="btn bsm bp" onclick="nwCheckSlot()" style="width:100%;height:34px">Check slot</button></div>
            </div>
            <div id="nwSlotRes" style="margin-top:6px"></div>
            <div class="g3" style="gap:8px;margin-top:6px">
              <div class="fld"><label class="lbl">Cost <span class="ab">Settings</span></label><input class="input mono" style="height:34px" id="nwCost" value="₹0 (free)" readonly></div>
              <div class="fld"><label class="lbl">Coupon</label><div style="display:flex;gap:4px"><input class="input mono" style="height:34px" id="nwCoupon" placeholder="Code"><button class="btn bsm" style="height:34px" onclick="toast('Coupon applied · ₹200 off')">Apply</button></div></div>
              <div class="fld"><label class="lbl">Net</label><input class="input mono" style="height:34px" value="₹0" readonly></div>
            </div>
            <div style="display:flex;gap:7px;margin-top:10px"><button class="btn bp" style="height:38px" onclick="nwBook()">Create, book &amp; check-in</button><button class="btn" style="height:38px" onclick="nwToggle()">Cancel</button></div>
          </div></div>
      </div>
      <div>
        <div class="sec" style="margin-top:0" id="checkinSec"><div class="sec-hd" onclick="togSec(this)" style="padding:10px 14px"><svg class="icon"><use href="#i-door"/></svg> Check-in <span id="ciName">—</span> <span class="arr">▾</span></div>
          <div class="sec-bd" style="padding:4px 14px 14px">
            <div class="g2" style="gap:8px">
              <div class="fld"><label class="lbl">Search</label><input class="input" style="height:34px" id="ciSearch" placeholder="Phone or name" oninput="window._ciLookup()"></div>
              <div class="fld"><label class="lbl">Dedup</label><input class="input" style="height:34px" id="ciDedup" readonly></div>
              <div class="fld"><label class="lbl">Visited <span class="ab">AUTO</span></label><input class="input mono" style="height:34px" id="rcVis" readonly></div>
              <div class="fld"><label class="lbl">Registered <span class="ab">AUTO</span></label><input class="input mono" style="height:34px" id="rcReg" readonly></div>
            </div>
            <div class="consent" style="font-size:12px"><label><input type="checkbox" checked> DPDP data use</label><label><input type="checkbox" checked> Health data</label><label><input type="checkbox" checked> Recording</label><label><input type="checkbox"> WA follow-ups</label></div>
            <button class="btn bp bsm" style="margin-top:8px" onclick="recRegDone()">Confirm → screening</button>
          </div></div>
        <div class="sec"><div class="sec-hd" onclick="togSec(this)" style="padding:10px 14px"><svg class="icon"><use href="#i-coin"/></svg> Collect payment <span class="arr">▾</span></div>
          <div class="sec-bd" style="padding:4px 14px 14px"><div id="recPayList"></div>
            <div id="recWb" class="hideblock" style="display:none;border:1.5px solid var(--brand-line);border-radius:11px;padding:11px 13px;margin-top:8px;background:linear-gradient(180deg,#F7FCFA,#fff)">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><b id="recWbName" style="font-family:var(--disp);font-size:14px">—</b><span class="chipb info" id="recWbPlan">—</span></div>
              <div class="g2" style="gap:8px"><div class="fld"><label class="lbl">Due</label><input class="input mono" style="height:34px" id="recWbDue" readonly></div><div class="fld"><label class="lbl">Received *</label><input class="input mono" style="height:34px" id="recWbAmt"></div><div class="fld"><label class="lbl">Mode *</label><select class="select" style="height:34px" id="recWbMode"><option>UPI</option><option>Cash</option><option>Card</option><option>Net Banking</option></select></div><div class="fld"><label class="lbl">Txn ref *</label><input class="input mono" style="height:34px" id="recWbTxn"></div></div>
              <div style="display:flex;gap:6px;margin-top:8px"><button class="btn bsm bp" onclick="recConfirm()">Confirm → Accounts</button><button class="btn bsm" onclick="recBack()">↩ Back</button></div>
            </div>
          </div></div>
      </div>
    </div>
  </div></section>

  <!-- SCREENING -->
  <section class="screen" id="s-screening"><div class="wrap" style="max-width:1280px;padding:16px 20px 60px">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <h1 style="font-family:var(--disp);font-size:22px;font-weight:700">Health screening</h1>
      <div class="pills" id="scrDateF"><button class="pill on" onclick="window._scDateF('today')">Today</button><button class="pill" onclick="window._scDateF('yest')">Yesterday</button><button class="pill" onclick="window._scDateF('cust')">Custom</button></div>
      <input type="date" class="input" id="scFrom" style="display:none;height:30px;font-size:12px;width:130px" onchange="window._scApplyDate()">
      <input type="date" class="input" id="scTo" style="display:none;height:30px;font-size:12px;width:130px" onchange="window._scApplyDate()">
      <button class="btn" style="margin-left:auto" onclick="window._scExport()"><svg class="icon"><use href="#i-dl"/></svg> Export</button>
    </div>
    <div class="metrics" style="margin:10px 0" id="scMetrics"></div>
    <div style="display:grid;grid-template-columns:1fr 310px;gap:14px">
      <div>
        <div class="sec" id="scAssessPanel" style="margin-top:0;display:none"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-heart"/></svg> Assessment — <span id="scAssessName">Select a client</span> <span class="chipb info" style="margin-left:8px" id="scAssessChip">Baseline · M0</span>
          <button class="btn bsm" style="margin-left:auto" onclick="window._scCloseAssess()">Close</button></div>
          <div class="sec-bd">
            <div class="g4">
              <div class="fld"><label class="lbl">Height (cm)</label><input class="input mono" id="sc_h" oninput="window._scBmiCalc()"></div>
              <div class="fld"><label class="lbl">Weight (kg)</label><input class="input mono" id="sc_w" oninput="window._scBmiCalc()"></div>
              <div class="fld"><label class="lbl">BMI <span class="ab">AUTO</span></label><input class="input mono" id="sc_bmi" readonly></div>
              <div class="fld"><label class="lbl">BP</label><input class="input mono" id="sc_bp"></div>
              <div class="fld"><label class="lbl">Pulse</label><input class="input mono" id="sc_pu"></div>
              <div class="fld"><label class="lbl">SpO2 (%)</label><input class="input mono" id="sc_sp"></div>
              <div class="fld"><label class="lbl">Waist (cm)</label><input class="input mono" id="sc_wa"></div>
              <div class="fld"><label class="lbl">Temperature</label><input class="input mono" id="sc_te"></div>
              <div class="fld"><label class="lbl">Desk glucose (mg/dL)</label><input class="input mono" id="sc_gl"></div>
            </div>
            <div class="g3" style="margin-top:6px">
              <div class="fld"><label class="lbl">Screened by <span class="ab">AUTO</span></label><input class="input" id="sc_by" readonly></div>
              <div class="fld"><label class="lbl">Screen date &amp; time <span class="ab">AUTO</span></label><input class="input mono" id="sc_dt" readonly placeholder="— stamped on save"></div>
              <div class="fld"><label class="lbl">Eligible?</label><div class="pills" id="scEligPills"><button class="pill p-ok" onclick="window._scElig('yes',this)">✓ Yes</button><button class="pill p-al" onclick="window._scElig('no',this)">✗ No</button></div></div>
            </div>
            <div class="fld"><label class="lbl">Notes</label><textarea class="area" id="sc_notes"></textarea></div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
              <button class="btn bsm bp" onclick="screeningDone()"><svg class="icon" style="width:14px;height:14px"><use href="#i-check"/></svg> Save &amp; send to HC</button>
              <button class="btn bsm" onclick="window._scPrint()">🖨 Print</button>
            </div>
          </div></div>
        <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-clock"/></svg> Previous screenings — same client <span class="arr">▾</span></div>
          <div class="sec-bd" id="scHistoryWrap"><div style="text-align:center;color:var(--faint);padding:14px;font-size:12px">Open a client to see history.</div></div></div>
      </div>
      <div>
        <div class="sec" style="margin-top:0"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Queue <span class="chipb info" style="margin-left:6px" id="scQueueCount">0</span></div>
          <div class="sec-bd" id="scQueueList"><div style="text-align:center;color:var(--faint);padding:14px;font-size:12px">No clients in screening queue.</div></div></div>
        <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-chart"/></svg> Breakdown</div>
          <div class="sec-bd" id="scBreakdown"><div style="text-align:center;color:var(--faint);padding:8px;font-size:12px">—</div></div></div>
        <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-drop"/></svg> Quick test order</div>
          <div class="sec-bd"><div class="pills"><button class="pill p-ok on">HbA1c</button><button class="pill p-ok on">FBS</button><button class="pill">Lipid</button><button class="pill">Thyroid</button></div>
            <button class="btn bp bsm" style="margin-top:10px" onclick="toast('Ordered · slip printed')">Order &amp; print</button></div></div>
      </div>
    </div>
  </div></section>

  <!-- BLOOD TEST -->
  <section class="screen" id="s-bloodtest"><div class="wrap" style="max-width:1280px;padding:16px 20px 60px">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <h1 style="font-family:var(--disp);font-size:22px;font-weight:700">Blood test — Thyrocare</h1>
      <div class="pills" id="btDateFilt"><button class="pill on" onclick="window._btDateF('today')">Today</button><button class="pill" onclick="window._btDateF('yest')">Yesterday</button><button class="pill" onclick="window._btDateF('wk')">This week</button><button class="pill" onclick="window._btDateF('cust')">Custom</button></div>
      <input type="date" class="input" id="btFrom" style="display:none;height:30px;font-size:12px;width:130px" onchange="window._btApplyDate()">
      <input type="date" class="input" id="btTo" style="display:none;height:30px;font-size:12px;width:130px" onchange="window._btApplyDate()">
      <button class="btn" style="margin-left:auto" onclick="window._btExport()"><svg class="icon"><use href="#i-dl"/></svg> Export</button>
    </div>
    <div style="display:flex;gap:10px;margin:10px 0;flex-wrap:wrap" id="btRevCards">
      <div style="background:linear-gradient(135deg,#129468,var(--brand-600));color:#fff;border-radius:11px;padding:8px 14px;display:flex;gap:14px;align-items:center"><div><div style="font-size:9px;opacity:.7;font-weight:600">TOTAL BILLED</div><div style="font-family:var(--disp);font-size:18px;font-weight:700" id="btTotalBilled">₹0</div></div></div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:11px;padding:8px 14px;display:flex;gap:16px"><div><div style="font-size:9px;color:var(--faint);font-weight:600">THYROCARE COST</div><div class="mono" style="font-weight:700;color:var(--alert-ink)" id="btThyroCost">₹0</div></div><div><div style="font-size:9px;color:var(--faint);font-weight:600">OUR MARGIN</div><div class="mono" style="font-weight:700;color:var(--ok-ink)" id="btMargin">₹0</div></div><div><div style="font-size:9px;color:var(--faint);font-weight:600">PAID TO THYROCARE</div><div class="mono" style="font-weight:700" id="btPaidThyro">₹0</div></div></div>
    </div>
    <div class="metrics" style="margin:6px 0" id="btMetrics"></div>
    <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-drop"/></svg> Worklist <span class="arr">▾</span></div>
      <div class="sec-bd" id="btWorklistWrap"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">Loading blood test data…</div></div></div>
    <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-bell"/></svg> Outcome reminders <span class="arr">▾</span></div>
      <div class="sec-bd" id="btRemindersWrap"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">Loading…</div></div></div>

    <!-- Blood test detail panel (hidden by default) -->
    <div id="btDetailPanel" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-drop"/></svg> Blood test record — <span id="btDetailName">Client</span>
        <button class="btn bsm" style="margin-left:auto" onclick="window._btCloseDetail()">Close</button></div>
        <div class="sec-bd">
          <div class="g4">
            <div class="fld"><label class="lbl">Panel / tests</label><input class="input" id="btdPanel" placeholder="e.g. HbA1c · FBS · Lipid"></div>
            <div class="fld"><label class="lbl">Checkpoint</label><select class="select" id="btdCheckpoint"><option>M0</option><option>M2</option><option>M4</option><option>M6</option></select></div>
            <div class="fld"><label class="lbl">Sample status</label><select class="select" id="btdSample"><option value="pending">Pending</option><option value="collected">Collected</option><option value="sent_to_lab">Sent to lab</option><option value="done">Done</option></select></div>
            <div class="fld"><label class="lbl">Report status</label><select class="select" id="btdReport"><option value="pending">Pending</option><option value="ready">Ready</option><option value="shared">Shared to client</option></select></div>
            <div class="fld"><label class="lbl">Thyrocare cost (₹)</label><input class="input mono" id="btdThyroCost" type="number" placeholder="e.g. 400"></div>
            <div class="fld"><label class="lbl">Our price (₹)</label><input class="input mono" id="btdOurPrice" type="number" placeholder="e.g. 800"></div>
          </div>
          <div class="fld fw" style="margin-top:6px"><label class="lbl">Report attachment</label>
            <div id="btdAtts" style="display:flex;gap:8px;flex-wrap:wrap"><span class="att add" onclick="window._btAddReport()"><svg class="icon"><use href="#i-clip"/></svg> Upload report</span></div></div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="btn bp" onclick="window._btSaveDetail()"><svg class="icon"><use href="#i-check"/></svg> Save</button>
            <button class="btn" onclick="window._btShareWA()"><svg class="icon"><use href="#i-msg"/></svg> Share via WA</button>
            <button class="btn" onclick="window._btCollectPay()">💰 Collect payment</button>
          </div>
        </div></div>
    </div>
  </div></section>

  <!-- PHYSIO -->
  <section class="screen" id="s-physio"><div class="wrap" style="max-width:1280px;padding:16px 20px 60px">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <h1 style="font-family:var(--disp);font-size:22px;font-weight:700">💪 Physiotherapy</h1>
      <div class="pills" id="phDateFilt"><button class="pill on" onclick="window._phDateF('today')">Today</button><button class="pill" onclick="window._phDateF('wk')">This week</button><button class="pill" onclick="window._phDateF('cust')">Custom</button></div>
      <input type="date" class="input" id="phFrom" style="display:none;height:30px;font-size:12px;width:130px" onchange="window._phApplyDate()">
      <input type="date" class="input" id="phTo" style="display:none;height:30px;font-size:12px;width:130px" onchange="window._phApplyDate()">
      <span style="font-size:10px;color:var(--faint);font-weight:600;letter-spacing:.08em;text-transform:uppercase">Revenue</span>
      <span style="font-family:var(--disp);font-weight:700;font-size:18px;color:var(--brand-600)" id="phRevenue">₹0</span>
      <button class="btn" style="margin-left:auto" onclick="window._phExport()"><svg class="icon"><use href="#i-dl"/></svg> Export</button>
    </div>
    <div class="metrics" style="margin:10px 0" id="phMetrics"></div>
    <div style="display:grid;grid-template-columns:1fr 340px;gap:14px">
      <div>
        <div class="sec" style="margin-top:0"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-cal"/></svg> Sessions</div>
          <div class="sec-bd" id="phSessionsWrap"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">Loading physiotherapy data…</div></div></div>

        <!-- SOAP notes panel (hidden until a session is opened) -->
        <div id="phSoapPanel" style="display:none">
        <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-doc"/></svg> Session record — <span id="phSoapTitle">Patient</span> <span class="arr">▾</span></div>
          <div class="sec-bd">
            <div class="g2">
              <div class="fld"><label class="lbl">Subjective (patient says)</label><textarea class="area" id="phSoapS" placeholder="Pain level, better since last session…"></textarea></div>
              <div class="fld"><label class="lbl">Objective (therapist observes)</label><textarea class="area" id="phSoapO" placeholder="ROM improved, swelling reduced…"></textarea></div>
              <div class="fld"><label class="lbl">Assessment</label><textarea class="area" id="phSoapA" placeholder="Progressing well, add resistance…"></textarea></div>
              <div class="fld"><label class="lbl">Plan (next session)</label><textarea class="area" id="phSoapP" placeholder="Increase reps, core stability…"></textarea></div>
            </div>
            <div class="g4" style="margin-top:6px">
              <div class="fld"><label class="lbl">Pain (0–10)</label><input class="input mono" id="phPain" type="number" min="0" max="10" style="max-width:80px"></div>
              <div class="fld"><label class="lbl">ROM improvement</label><input class="input" id="phRom" placeholder="e.g. +15°"></div>
              <div class="fld"><label class="lbl">Exercises prescribed</label><input class="input" id="phExercises" placeholder="e.g. stretches, resistance band"></div>
              <div class="fld"><label class="lbl">Next session</label><input class="input" type="date" id="phNextDate"></div>
            </div>
            <div style="display:flex;gap:8px;margin-top:12px"><button class="btn bp" onclick="window._phSaveSoap()"><svg class="icon"><use href="#i-check"/></svg> Save &amp; mark complete</button><button class="btn" onclick="window._phPrintNotes()">🖨 Print notes</button></div>
          </div></div>

        <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-heart"/></svg> Treatment plan — <span id="phPlanTitle">Patient</span> <span class="arr">▾</span></div>
          <div class="sec-bd">
            <div class="g4">
              <div class="fld"><label class="lbl">Condition</label><input class="input" id="phCondition"></div>
              <div class="fld"><label class="lbl">Sessions planned</label><input class="input mono" id="phPlanned" type="number"></div>
              <div class="fld"><label class="lbl">Sessions completed</label><input class="input mono" id="phCompleted" readonly></div>
              <div class="fld"><label class="lbl">Remaining</label><input class="input mono" id="phRemaining" readonly></div>
              <div class="fld"><label class="lbl">Payment model</label><div class="pills" id="phPayModel"><button class="pill p-ok" onclick="window._phPayModel('pack')">Upfront pack</button><button class="pill" onclick="window._phPayModel('per_visit')">Per visit</button></div></div>
              <div class="fld"><label class="lbl">Pack / session price (₹)</label><input class="input mono" id="phPackPrice" type="number"></div>
            </div>
            <div class="fld fw"><label class="lbl">Visit history</label>
              <div id="phVisitHistory"><div style="text-align:center;color:var(--faint);padding:8px;font-size:12px">Open a patient to see visit history.</div></div></div>
            <div style="display:flex;gap:8px;margin-top:10px"><button class="btn bp" onclick="window._phSavePlan()"><svg class="icon"><use href="#i-check"/></svg> Save plan</button><button class="btn" onclick="window._phCollectPay()">💰 Collect payment</button></div>
          </div></div>
        </div>
      </div>
      <div>
        <div class="sec" style="margin-top:0"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Active patients <span id="phPatientCount">(0)</span></div>
          <div class="sec-bd" id="phPatientList"><div style="text-align:center;color:var(--faint);padding:8px;font-size:12px">No patients yet.</div></div></div>
        <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-coin"/></svg> Pricing <span class="ab">from Settings</span></div>
          <div class="sec-bd"><table class="tbl"><tbody>
            <tr><td>Consultation</td><td class="mono" style="text-align:right;font-weight:700">₹500</td></tr>
            <tr><td>Per session</td><td class="mono" style="text-align:right;font-weight:700">₹800–1,200</td></tr>
            <tr><td>6-session pack</td><td class="mono" style="text-align:right;font-weight:700">₹4,200</td></tr>
            <tr><td>8-session pack</td><td class="mono" style="text-align:right;font-weight:700">₹6,400</td></tr>
            <tr><td>12-session pack</td><td class="mono" style="text-align:right;font-weight:700">₹10,800</td></tr>
          </tbody></table><p style="font-size:11px;color:var(--faint);margin-top:6px">Configurable in Settings → Service pricing</p></div></div>
      </div>
    </div>
  </div></section>

  <!-- ACCOUNTS -->
  <section class="screen" id="s-accounts"><div class="wrap">
    <div class="ph"><div><h1>Accounts &amp; finance</h1><p>Gross vs net always two numbers. Verification closes the loop.</p></div>
      <div class="pha"><button class="btn" onclick="window._accExport()"><svg class="icon"><use href="#i-dl"/></svg> Export Excel</button></div></div>
    <span class="viewing"><span class="vd"></span> Viewing as Accounts</span>
    <div class="metrics" id="accMetrics"></div>
    <div class="tabs" id="accTabs"><button class="on" data-t="tx">Transactions</button><button data-t="ver">Verify proofs <span id="accVerCount"></span></button><button data-t="out">Outstanding <span id="accOutCount"></span></button><button data-t="ref">Refunds <span id="accRefCount"></span></button></div>
    <div class="acc-p" data-p="tx">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-wallet"/></svg> Transactions</div>
        <div class="sec-bd" id="accTxBody"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">Loading transactions…</div></div></div></div>
    <div class="acc-p" data-p="ver" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-check"/></svg> Proof verification — nothing counts as received until verified</div>
        <div class="sec-bd" id="accVerBody"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">Loading…</div></div></div></div>
    <div class="acc-p" data-p="out" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-bell"/></svg> Outstanding — balance chasing lives here</div>
        <div class="sec-bd" id="accOutBody"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">Loading…</div></div></div></div>
    <div class="acc-p" data-p="ref" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-coin"/></svg> Refund console</div>
        <div class="sec-bd" id="accRefBody"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">Loading…</div></div></div></div>
  </div></section>

  <!-- REPORTS -->
  <section class="screen" id="s-reports"><div class="wrap">
    <div class="ph"><div><h1>Reports centre</h1><p>Every report = a slice of the same event stream.</p></div>
      <div class="pha"><button class="btn" onclick="window._repExport('csv')"><svg class="icon"><use href="#i-dl"/></svg> Excel</button><button class="btn" onclick="window._repExport('pdf')"><svg class="icon"><use href="#i-doc"/></svg> PDF</button></div></div>
    <span class="viewing"><span class="vd"></span> Viewing as <span id="repViewRole">Management</span></span>
    <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-cog"/></svg> Filters</div>
      <div class="sec-bd"><div class="g4">
        <div class="fld"><label class="lbl">Period</label><select class="select" id="repPeriod" onchange="window._repLoad()"><option value="today">Today</option><option value="month" selected>This month</option><option value="quarter">Quarter</option><option value="all">All time</option></select></div>
        <div class="fld"><label class="lbl">Source</label><select class="select" id="repSource" onchange="window._repLoad()"><option value="all" selected>All</option></select></div>
        <div class="fld"><label class="lbl">Language</label><select class="select" id="repLang" onchange="window._repLoad()"><option value="all" selected>All</option></select></div>
        <div class="fld"><label class="lbl">Service</label><select class="select" id="repService" onchange="window._repLoad()"><option value="all" selected>All</option><option value="Diabetes">Diabetes</option><option value="Blood test">Blood test</option><option value="Physio">Physio</option></select></div>
      </div></div></div>
    <div class="rep-pick">
      <button class="rep on" onclick="window._repTab('lead')"><svg class="icon"><use href="#i-inbox"/></svg> Lead report</button>
      <button class="rep" onclick="window._repTab('funnel')"><svg class="icon"><use href="#i-split"/></svg> Conversion</button>
      <button class="rep" onclick="window._repTab('revenue')"><svg class="icon"><use href="#i-coin"/></svg> Revenue</button>
      <button class="rep" onclick="window._repTab('appt')"><svg class="icon"><use href="#i-cal"/></svg> Appointments</button>
    </div>
    <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-chart"/></svg> <span id="repTitle">Lead report</span></div>
      <div class="sec-bd">
        <div class="metrics" style="margin-top:6px" id="repKpis"></div>
        <div id="repTableWrap"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">Loading report data…</div></div>
      </div></div>
  </div></section>

  <!-- SETTINGS -->
  <section class="screen" id="s-admin"><div class="wrap" style="max-width:1280px;padding:16px 20px 60px">
    <div class="ph"><div><h1>Settings &amp; masters</h1><p>Control plane — configure every screen's fields, pricing, roles, integrations.</p></div></div>
    <div class="tabs" id="settTabs"><button class="on" data-t="st-svc">Service pricing</button><button data-t="st-asg">Assignees</button><button data-t="st-usr">Users</button><button data-t="st-rbac">Roles &amp; RBAC</button><button data-t="st-fld">Screen fields</button><button data-t="st-drop">Dropdown masters</button><button data-t="st-int">Integrations</button><button data-t="st-msg">Auto-messages</button></div>

    <div class="st-p" data-p="st-asg" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Assignees — single source of truth for everyone who can receive leads</div>
        <div class="sec-bd">
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px">
            <div class="fld" style="margin:0"><label class="lbl">Name</label><input class="input" id="asgName" placeholder="e.g. Priya K." style="height:34px;width:160px"></div>
            <div class="fld" style="margin:0"><label class="lbl">Role</label><select class="select" id="asgRole" style="height:34px;width:150px"><option>Advisor</option><option>Senior Advisor</option><option>Telecaller</option><option>Manager</option><option>Health Coach</option></select></div>
            <div class="fld" style="margin:0"><label class="lbl">Branch</label><select class="select" id="asgBranch" style="height:34px;width:140px"><option>Chennai</option><option>Coimbatore</option><option>Madurai</option></select></div>
            <div class="fld" style="margin:0"><label class="lbl">Phone</label><input class="input mono" id="asgPhone" placeholder="optional" style="height:34px;width:140px"></div>
            <button class="btn bp" id="asgAddBtn" onclick="window._asgCreate()" style="height:34px">+ Add assignee</button>
            <button class="btn bsm" id="asgCancelBtn" onclick="window._asgCancelEdit()" style="height:34px;display:none">Cancel</button>
          </div>
          <div class="tscroll"><table class="tbl" style="min-width:820px"><thead><tr><th>Name</th><th>Role</th><th>Branch</th><th>Phone</th><th>Active leads</th><th>Status</th><th>Actions</th></tr></thead><tbody id="asgBody"></tbody></table></div>
          <p style="font-size:11.5px;color:var(--faint);margin-top:10px">Active assignees appear in the “Assign to” dropdown on Assign &amp; approve and in Advisor load. Deactivated assignees keep their history but can’t receive new leads.</p>
        </div></div>
    </div>

    <div class="st-p" data-p="st-svc">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-coin"/></svg> Service pricing — all services, all variations · dynamic</div>
        <div class="sec-bd">
          <div class="aud" style="background:#fff;margin-top:0"><div class="ahd" style="color:var(--brand-600)">🩺 Diabetes reversal</div>
            <table class="tbl"><thead><tr><th>Item</th><th>Price</th><th>Status</th><th></th></tr></thead><tbody>
              <tr><td>Consultation (first visit)</td><td><input class="input mono" style="height:32px;max-width:120px" value="0"></td><td><span class="chipb ok">Free phase</span></td><td><button class="btn bsm">Edit</button></td></tr>
              <tr><td>Consultation (repeat / future)</td><td><input class="input mono" style="height:32px;max-width:120px" value="500"></td><td><span class="chipb neu">Planned</span></td><td><button class="btn bsm">Edit</button></td></tr>
              <tr><td>L1 · standard</td><td><input class="input mono" style="height:32px;max-width:120px" value="3999"></td><td><span class="chipb ok">Active</span></td><td></td></tr>
              <tr><td>L1 · offer</td><td><input class="input mono" style="height:32px;max-width:120px" value="3500"></td><td><span class="chipb ok">Active</span></td><td></td></tr>
              <tr><td>L2 · full</td><td><input class="input mono" style="height:32px;max-width:120px" value="29000"></td><td><span class="chipb ok">Active</span></td><td></td></tr>
              <tr><td>L2 · installment (2×)</td><td><input class="input mono" style="height:32px;max-width:120px" value="30000"></td><td><span class="chipb ok">Active</span></td><td></td></tr>
              <tr><td>L2 · EMI</td><td><input class="input mono" style="height:32px;max-width:120px" value="32000"></td><td><span class="chipb ok">Active</span></td><td></td></tr>
            </tbody></table></div>
          <div class="aud" style="background:#fff"><div class="ahd" style="color:var(--info-ink)">🩸 Blood test (Thyrocare partnership)</div>
            <table class="tbl"><thead><tr><th>Panel</th><th>Our price</th><th>Thyrocare cost</th><th>Margin</th></tr></thead><tbody>
              <tr><td>HbA1c</td><td><input class="input mono" style="height:32px;max-width:100px" value="400"></td><td><input class="input mono" style="height:32px;max-width:100px" value="200"></td><td class="mono" style="font-weight:700;color:var(--ok-ink)">₹200</td></tr>
              <tr><td>FBS</td><td><input class="input mono" style="height:32px;max-width:100px" value="400"></td><td><input class="input mono" style="height:32px;max-width:100px" value="200"></td><td class="mono" style="font-weight:700;color:var(--ok-ink)">₹200</td></tr>
              <tr><td>Lipid profile</td><td><input class="input mono" style="height:32px;max-width:100px" value="600"></td><td><input class="input mono" style="height:32px;max-width:100px" value="300"></td><td class="mono" style="font-weight:700;color:var(--ok-ink)">₹300</td></tr>
              <tr><td>Thyroid</td><td><input class="input mono" style="height:32px;max-width:100px" value="500"></td><td><input class="input mono" style="height:32px;max-width:100px" value="250"></td><td class="mono" style="font-weight:700;color:var(--ok-ink)">₹250</td></tr>
            </tbody></table></div>
          <div class="aud" style="background:#fff"><div class="ahd" style="color:var(--vio-ink)">💪 Physiotherapy</div>
            <table class="tbl"><thead><tr><th>Item</th><th>Price</th><th></th></tr></thead><tbody>
              <tr><td>Initial consultation</td><td><input class="input mono" style="height:32px;max-width:120px" value="500"></td><td></td></tr>
              <tr><td>Per session (standard)</td><td><input class="input mono" style="height:32px;max-width:120px" value="800"></td><td></td></tr>
              <tr><td>Per session (complex)</td><td><input class="input mono" style="height:32px;max-width:120px" value="1200"></td><td></td></tr>
              <tr><td>6-session pack</td><td><input class="input mono" style="height:32px;max-width:120px" value="4200"></td><td></td></tr>
              <tr><td>8-session pack</td><td><input class="input mono" style="height:32px;max-width:120px" value="6400"></td><td></td></tr>
              <tr><td>12-session pack</td><td><input class="input mono" style="height:32px;max-width:120px" value="10800"></td><td></td></tr>
              <tr><td>Equipment rental (per item/day)</td><td><input class="input mono" style="height:32px;max-width:120px" value="100"></td><td></td></tr>
              <tr><td>Extended sessions (per session)</td><td><input class="input mono" style="height:32px;max-width:120px" value="800"></td><td></td></tr>
            </tbody></table></div>
          <button class="btn bp" style="margin-top:12px" onclick="toast('All service pricing saved — reflected across all screens')">Save pricing</button>
        </div></div>
    </div>

    <div class="st-p" data-p="st-fld" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-cog"/></svg> Screen field configuration — add/remove/reorder fields per tab</div>
        <div class="sec-bd">
          <div class="g3">
            <div class="fld"><label class="lbl">Select screen</label><select class="select" id="fldScreen"><option selected>Screening</option><option>Health advisor · Basic info</option><option>Health advisor · Sugar profile</option><option>Health coach · Assessment</option><option>Blood test · Worklist</option><option>Physio · Session record</option><option>Reception · Check-in</option></select></div>
          </div>
          <div class="aud" style="background:#fff;margin-top:12px"><div class="ahd">Screening fields — drag to reorder, toggle to enable/disable</div>
            <table class="tbl"><thead><tr><th></th><th>Field</th><th>Type</th><th>Required</th><th>Enabled</th></tr></thead><tbody>
              <tr><td>☰</td><td>Height (cm)</td><td>Number</td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td></tr>
              <tr><td>☰</td><td>Weight (kg)</td><td>Number</td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td></tr>
              <tr><td>☰</td><td>BMI</td><td>Auto-calc</td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td></tr>
              <tr><td>☰</td><td>BP systolic/diastolic</td><td>Number</td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td></tr>
              <tr><td>☰</td><td>Pulse</td><td>Number</td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td></tr>
              <tr><td>☰</td><td>SpO2</td><td>Number</td><td><input type="checkbox" style="accent-color:var(--brand)"></td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td></tr>
              <tr><td>☰</td><td>Waist (cm)</td><td>Number</td><td><input type="checkbox" style="accent-color:var(--brand)"></td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td></tr>
              <tr><td>☰</td><td>Temperature</td><td>Number</td><td><input type="checkbox" style="accent-color:var(--brand)"></td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td></tr>
              <tr><td>☰</td><td>Desk glucose</td><td>Number</td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td><td><input type="checkbox" checked style="accent-color:var(--brand)"></td></tr>
            </tbody></table>
            <div style="display:flex;gap:8px;margin-top:10px"><button class="btn bsm bp" onclick="toast('+ New field added — configure type, label, validation')">+ Add field</button><button class="btn bsm" onclick="toast('Fields saved — screening form updated')">Save field config</button></div>
          </div></div></div>
    </div>

    <div class="st-p" data-p="st-usr" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> User management — who can log in and what role they have</div>
        <div class="sec-bd">
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px">
            <div class="fld" style="margin:0"><label class="lbl">Email</label><input class="input" id="usrEmail" placeholder="user@clinic.com" style="height:34px;width:220px"></div>
            <div class="fld" style="margin:0"><label class="lbl">Name</label><input class="input" id="usrName" placeholder="Display name" style="height:34px;width:160px"></div>
            <div class="fld" style="margin:0"><label class="lbl">Role</label><select class="select" id="usrRole" style="height:34px;width:170px"><option>Advisor</option><option>Senior Advisor</option><option>Health Coach</option><option>Screening</option><option>Receptionist</option><option>Diagnostics</option><option>Physiotherapist</option><option>Accounts</option><option>ABM</option><option>Manager</option><option>Branch Manager</option><option>Super Admin</option></select></div>
            <button class="btn bp" id="usrAddBtn" onclick="window._usrCreate()" style="height:34px">+ Add user</button>
          </div>
          <div class="tscroll"><table class="tbl" style="min-width:700px"><thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody id="usrBody"></tbody></table></div>
          <p style="font-size:11.5px;color:var(--faint);margin-top:10px">Users added here can log in with their email. First-time users set their password on the login screen.</p>
        </div></div>
    </div>

    <div class="st-p" data-p="st-rbac" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Roles &amp; permissions — editable module access matrix</div>
        <div class="sec-bd" id="rbacMatrixBody"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">Loading RBAC matrix…</div></div></div>
    </div>

    <div class="st-p" data-p="st-drop" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-doc"/></svg> Dropdown masters — admin-managed, not hard-coded</div>
        <div class="sec-bd"><div class="g3">
          <div class="fld"><label class="lbl">Eligibility exclusions</label><textarea class="area">Cancer, Brain Tumor, Recent Heart Surgery, Organ Transplant, Pregnancy, Age Above 75, Already Paid, Other Language, Others</textarea></div>
          <div class="fld"><label class="lbl">Occupations</label><textarea class="area">Private Job, Govt Job, Business, Self-employed, Homemaker, Retired, Student, Daily Wage, Others</textarea></div>
          <div class="fld"><label class="lbl">Call statuses</label><textarea class="area">New, DND, RNR, Line Busy, Call Back, Already Paid, Follow Up, Switched Off, Not Registered, No Sugar, Not Interested, Out of Service, Wrong Number, Appointment Fixed – Direct, Appointment Fixed – Zoom</textarea></div>
          <div class="fld"><label class="lbl">Languages</label><textarea class="area">Tamil, Telugu, Kannada, Malayalam, Hindi, Marathi, Bengali, Gujarati, Punjabi, Urdu</textarea></div>
          <div class="fld"><label class="lbl">Locations</label><textarea class="area">Poonamalle, Porur, Maduravoyal, Ambattur, Avadi, Tambaram, Nagapattinam</textarea></div>
          <div class="fld"><label class="lbl">Physio conditions</label><textarea class="area">Frozen shoulder, Knee rehab, Lower back pain, Cervical spondylosis, Sports injury, Post-surgical, Sciatica, Others</textarea></div>
        </div><button class="btn bp bsm" style="margin-top:12px" onclick="toast('Masters updated across all screens')">Save masters</button></div></div>
    </div>

    <div class="st-p" data-p="st-int" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-bolt"/></svg> Integrations &amp; audit</div>
        <div class="sec-bd"><div class="split">
          <div><div class="li"><div style="flex:1">Meta lead feed</div><span class="chipb ok"><span class="cd"></span> Connected</span></div>
            <div class="li"><div style="flex:1">Tata Tele (calls + recording)</div><span class="chipb ok"><span class="cd"></span> Connected</span></div>
            <div class="li"><div style="flex:1">WATI (WhatsApp API)</div><span class="chipb ok"><span class="cd"></span> Connected</span></div>
            <div class="li"><div style="flex:1">Razorpay</div><span class="chipb ok"><span class="cd"></span> Connected</span></div>
            <div class="li"><div style="flex:1">Thyrocare</div><span class="chipb warn">Manual upload</span></div>
            <div class="li"><div style="flex:1">Tagmango</div><span class="chipb ok"><span class="cd"></span> Connected</span></div></div>
          <div><table class="tbl"><thead><tr><th>Audit log</th><th>User</th><th>Time</th></tr></thead><tbody>
            <tr><td>Price master edited (Physio pack)</td><td>Super admin</td><td class="mono">09:12</td></tr>
            <tr><td>Screening field added (SpO2)</td><td>Super admin</td><td class="mono">09:05</td></tr>
          </tbody></table></div>
        </div></div></div>
    </div>

    <div class="st-p" data-p="st-msg" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-msg"/></svg> Automated messages — WhatsApp / SMS triggers</div>
        <div class="sec-bd"><table class="tbl"><thead><tr><th>Event trigger</th><th>WhatsApp</th><th>SMS</th><th>Template</th></tr></thead><tbody>
          <tr><td style="font-weight:600">Payment done (verified)</td><td><button class="chipb ok" onclick="togMsg(this)">On</button></td><td><button class="chipb ok" onclick="togMsg(this)">On</button></td><td class="mono" style="font-size:11.5px">receipt_gst_v2</td></tr>
          <tr><td style="font-weight:600">Appointment fixed</td><td><button class="chipb ok" onclick="togMsg(this)">On</button></td><td><button class="chipb neu" onclick="togMsg(this)">Off</button></td><td class="mono" style="font-size:11.5px">appt_details_v1</td></tr>
          <tr><td style="font-weight:600">Appointment confirmed</td><td><button class="chipb ok" onclick="togMsg(this)">On</button></td><td><button class="chipb ok" onclick="togMsg(this)">On</button></td><td class="mono" style="font-size:11.5px">appt_confirm_v1</td></tr>
          <tr><td style="font-weight:600">Rescheduled</td><td><button class="chipb ok" onclick="togMsg(this)">On</button></td><td><button class="chipb neu" onclick="togMsg(this)">Off</button></td><td class="mono" style="font-size:11.5px">appt_resch_v1</td></tr>
          <tr><td style="font-weight:600">Follow-up reminder</td><td><button class="chipb ok" onclick="togMsg(this)">On</button></td><td><button class="chipb neu" onclick="togMsg(this)">Off</button></td><td class="mono" style="font-size:11.5px">fu_reminder_v1</td></tr>
          <tr><td style="font-weight:600">Physio session reminder</td><td><button class="chipb ok" onclick="togMsg(this)">On</button></td><td><button class="chipb neu" onclick="togMsg(this)">Off</button></td><td class="mono" style="font-size:11.5px">physio_session_v1</td></tr>
          <tr><td style="font-weight:600">Blood test report ready</td><td><button class="chipb ok" onclick="togMsg(this)">On</button></td><td><button class="chipb neu" onclick="togMsg(this)">Off</button></td><td class="mono" style="font-size:11.5px">bt_report_v1</td></tr>
        </tbody></table></div></div>
    </div>

  </div></section>
  `;
}

export default function Home() {
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!appRef.current) return;
    const root = appRef.current;
    const w = window as any;

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
    const FULL_ACCESS=["advisor","coach","import","abm","reception","screening","bloodtest","physio","accounts","reports","admin"];
    const RBAC_ROLES=["Advisor","Senior Advisor","Health Coach","Screening","Receptionist","Diagnostics","Physiotherapist","Accounts","ABM","Manager","Branch Manager"];
    const DEFAULT_RBAC:Record<string,string[]>={
      "Advisor":["advisor"],"Senior Advisor":["advisor","import"],
      "Health Coach":["coach"],"Screening":["screening"],
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
      const loginBtn=root.querySelector("#loginBtn");
      if(loginBtn) loginBtn.addEventListener("click",()=>doSignIn());
      const loginTog=root.querySelector("#loginToggle");
      if(loginTog) loginTog.addEventListener("click",()=>loginToggleMode());
      const passEl=root.querySelector("#loginPass");
      if(passEl) passEl.addEventListener("keydown",(e:any)=>{ if(e.key==="Enter"&&!_loginIsSignUp) doSignIn(); });
      const confirmEl=root.querySelector("#loginConfirm");
      if(confirmEl) confirmEl.addEventListener("keydown",(e:any)=>{ if(e.key==="Enter") doSignIn(); });
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
      body.innerHTML=_usrList.map((u:any)=>{
        const isSelf=_currentUser&&_currentUser.email===u.email;
        return '<tr><td class="mono" style="font-size:12px">'+u.email+'</td><td>'+(u.name||"—")+'</td>'
          +'<td><span class="chipb '+(u.role==="Super Admin"?"vio":u.role==="Branch Manager"?"info":"neu")+'">'+u.role+'</span></td>'
          +'<td><span class="chipb '+(u.active?"ok":"al")+'">'+(u.active?"Active":"Inactive")+'</span></td>'
          +'<td class="mono" style="font-size:11px">'+(u.created_at?new Date(u.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—")+'</td>'
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

    w._usrToggle=async function(id:number){
      const u=_usrList.find((x:any)=>x.id===id);
      if(!u) return;
      await supabase.from("app_users").update({active:!u.active}).eq("id",id);
      toast(u.active?"User deactivated":"User activated");
      await loadUsers();
    };

    w._usrDel=async function(id:number){
      const u=_usrList.find((x:any)=>x.id===id);
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
      // Record eligibility for the open lead → the Assigned-leads table flags the row red.
      if (_advLeadId) {
        if (any) _eligMap[String(_advLeadId)] = reasons || "Exclusion tag present";
        else delete _eligMap[String(_advLeadId)];
        try{ renderAssignedLeads(); }catch(_){}
      }
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
    // A dismissible popup pinned top-centre. type: 'warn' (stays) | 'ok' (auto-dismiss).
    function _metaPopup(msg:string,type:"warn"|"ok"){
      const ex=document.getElementById("metaConnPopup"); if(ex&&ex.parentNode) ex.parentNode.removeChild(ex);
      const wrap=document.createElement("div"); wrap.id="metaConnPopup";
      const al=type==="warn";
      wrap.style.cssText="position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:100000;display:flex;align-items:center;gap:12px;padding:13px 18px;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.25);font-size:13.5px;font-weight:600;max-width:92vw;"+(al?"background:var(--alert-bg);border:1.5px solid var(--alert);color:var(--alert-ink)":"background:var(--ok-bg);border:1.5px solid var(--ok);color:var(--ok-ink)");
      wrap.innerHTML='<span style="font-size:16px">'+(al?"⚠":"✓")+'</span><span>'+msg+'</span><button aria-label="Dismiss" style="background:none;border:none;font-size:18px;line-height:1;cursor:pointer;color:inherit;font-weight:700">×</button>';
      (wrap.querySelector("button")as HTMLElement).onclick=()=>{ if(wrap.parentNode) wrap.parentNode.removeChild(wrap); };
      document.body.appendChild(wrap);
      // Auto-dismiss: success popups after 6s, alert popups after 60s (max 1 min).
      setTimeout(()=>{ if(wrap.parentNode) wrap.parentNode.removeChild(wrap); }, al?60000:6000);
    }
    // Transition the Meta connection state; fire toasts/popups + repaint the status cell.
    function setMetaConn(state:"connected"|"disconnected",reason?:string){
      const prev=_metaConn;
      if(prev===state){ return; }
      _metaConn=state;
      try{ renderSrcTable(); }catch(_){}
      if(state==="connected"){
        if(prev==="disconnected"){ toast("✓ Meta reconnected — leads syncing"); _metaPopup("Meta connection re-established. Leads are syncing again.","ok"); }
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
        if(!_metaAlertActive){ _metaAlertActive=true; toastErr("No Meta leads for 30+ min — notify the ABM team"); _metaPopup("No Meta leads received in the last 30 minutes during campaign hours. Please notify the ABM team.","warn"); }
      }else{
        box.style.background="var(--surface-2)";box.style.borderColor="var(--line)";
        txt.textContent="Alert: notify ABM if no Meta lead for 30 min during campaign hours"+(inHours?"":" · outside campaign hours ("+CAMPAIGN_START_HOUR+":00–"+CAMPAIGN_END_HOUR+":00 IST)");
        txt.style.color="var(--ink)";
        chip.className="chipb ok"; chip.textContent=inHours?"Monitoring":"Idle";
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
      if(x.indexOf("diab")>=0)return "Diabetes";
      if(x.indexOf("phys")>=0)return "Physiotherapy";
      if(x.indexOf("blood")>=0)return "Blood Test";
      if(x.indexOf("sona")>=0)return "Sona Booth";
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
        +'<div class="fld"><label class="lbl">Phone *</label><input class="input mono" id="slPhone" placeholder="+91…"></div>'
        +'<div class="fld"><label class="lbl">Email</label><input class="input" id="slEmail" placeholder="email@example.com"></div>'
        +'<div class="fld"><label class="lbl">Source</label><select class="select" id="slSource"><option>Walk-in / Referral / Telecalling</option><option>Website forms</option><option>WhatsApp (WATI)</option><option>Manual</option></select></div>'
        +'<div class="fld"><label class="lbl">Service</label><select class="select" id="slService"><option>Diabetes</option><option>Physio</option><option>Blood test</option></select></div>'
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
      const counts:Record<string,number>={};
      feedAll().filter((l:any)=>!feedIsProcessed(l)).forEach((l:any)=>{ const p=normPhone(l.phone); if(p) counts[p]=(counts[p]||0)+1; });
      const s=new Set<string>();
      Object.keys(counts).forEach(p=>{ if(counts[p]>1) s.add(p); });
      _manualDupPhones.forEach(p=>s.add(p));
      return s;
    }
    // Group duplicate leads by phone → one entry each with repeat count + all sources.
    function feedDupGroups(){
      const ds=feedDupPhoneSet();
      const byPhone:Record<string,any>={};
      feedActive().forEach((l:any)=>{
        const p=normPhone(l.phone); if(!p||!ds.has(p)) return;
        if(!byPhone[p]){ byPhone[p]={rep:l,count:0,sources:new Set<string>()}; }
        const g=byPhone[p]; g.count++;
        const src=(l.source==="Meta")?"Meta":(l.source==="Manual"?"Manual":(l.source||"Meta"));
        g.sources.add(src);
        if(new Date(l.createdAt).getTime()>new Date(g.rep.createdAt).getTime()) g.rep=l;   // newest as representative
      });
      return Object.keys(byPhone).map(p=>({...byPhone[p],sources:Array.from(byPhone[p].sources)}))
        .sort((a:any,b:any)=>new Date(b.rep.createdAt).getTime()-new Date(a.rep.createdAt).getTime());
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
          .select("meta_lead_id,name,phone,email,source,language,service,city,sugar_poll,street,campaign,lead_date,created_at,is_valid,is_duplicate,is_assigned,in_pool,assigned_to,call_status")
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
            inPool:!!r.in_pool,assignedTo:r.assigned_to||"",callStatus:r.call_status||""};
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

    const _FEED_STD_HEAD='<th style="width:36px"><input type="checkbox" id="feedSelAll" style="accent-color:var(--brand)" title="Select all leads matching the current filter (all pages)"></th><th>Date &amp; Time (IST)</th><th>Campaign</th><th>Ad Name</th><th>Lead Name</th><th>Phone Number</th><th>Sugar Poll</th><th>City</th><th>Street</th><th>Source</th><th>Service</th><th>Language</th><th>Received</th><th>Dedup</th>';
    const _FEED_DUP_HEAD='<th style="width:36px"><input type="checkbox" id="feedSelAll" style="accent-color:var(--brand)" title="Select all duplicate leads (all pages)"></th><th>Date &amp; Time (IST)</th><th>Repeat Leads Count</th><th>Campaign</th><th>Ad Name</th><th>Lead Name</th><th>Phone Number</th><th>Sugar Poll</th><th>City</th><th>Street</th><th>Source</th><th>Service</th><th>Language</th><th>Dedup</th>';
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
        if(head&&head.innerHTML.indexOf("Repeat Leads Count")<0){ head.innerHTML=_FEED_DUP_HEAD; bindFeedSelAll(); }
        const groups=feedDupGroups();
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
              +'<td class="mono" style="font-size:11.5px;white-space:nowrap">'+esc(fmtIST(ld.createdAt))+'</td>'
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
              +'<td><span class="chipb al">Duplicate</span></td>'
              +'</tr>';
          }).join(""):'<tr><td colspan="14" style="text-align:center;color:var(--faint);padding:22px">No duplicate leads in this range</td></tr>';
        }
        if(pageInfo) pageInfo.textContent="Page "+_metaPageNum+" of "+totalPages+" · "+total+" duplicate lead"+(total===1?"":"s");
      } else {
        if(head&&head.innerHTML.indexOf("Repeat Leads Count")>=0){ head.innerHTML=_FEED_STD_HEAD; bindFeedSelAll(); }
        const filtered=feedFiltered();
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
          supabase.from("leads").select("meta_lead_id,name,phone,source,language,campaign,assigned_to,pool_added_at,created_at").eq("in_pool",true).eq("is_assigned",false).neq("source","Meta Ads"),
          supabase.from("leads").select("meta_lead_id,name,phone,source,language,campaign,assigned_to,call_status,pool_added_at,created_at").eq("is_assigned",true).neq("source","Meta Ads")
        ]);
        _poolExtras=(pr.data||[]).map((r:any)=>({id:r.meta_lead_id,name:r.name,phone:r.phone,src:r.source==="Manual"?"Manual":((r.source||"CSV")+" · "+(r.language||"Tamil")),sugar:'<span class="chipb neu">—</span>',waiting:"now",assignedTo:"",campaign:r.campaign,lang:r.language,source:r.source,poolAddedAt:r.pool_added_at,createdAt:r.created_at}));
        // Carry call_status so Manual/CSV assigned leads land in the right Kanban status column (not defaulted to Open).
        _assignedExtras=(ar.data||[]).map((r:any)=>({id:r.meta_lead_id,name:r.name,phone:r.phone,source:r.source||"CSV",lang:r.language||"Tamil",campaign:r.campaign||"—",isAssigned:true,assignedTo:r.assigned_to||"",callStatus:r.call_status||"",poolAddedAt:r.pool_added_at,createdAt:r.created_at}));
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
          id:ld.id,name:ld.name,src:(ld.source||"Meta")+" · "+(ld.lang||"Tamil"),
          sugar:'<span class="chipb neu">—</span>',waiting:ld.received||"now",assignedTo:"",
          ts:ld.poolAddedAt||ld.createdAt
        })),
        ..._poolExtras.map((p:any)=>({...p,ts:p.poolAddedAt||p.createdAt}))
      ];
    }
    function renderUnassignedPool(){
      const body=root.querySelector("#unassignedPoolBody");
      const cnt=root.querySelector("#poolCount");
      const pool=_unassignedPool.filter((p:any)=>inAbmRange(p.ts));   // time-range filter
      if(cnt) cnt.textContent=String(pool.length);
      if(!body) return;
      const esc=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const activeNames=_assignees.filter((a:any)=>a.is_active).map((a:any)=>a.name);
      body.innerHTML=pool.length?pool.map((p:any)=>{
        const isNew=String(p.id).indexOf("seed-")!==0;
        return '<tr><td><input type="checkbox" class="poolChk" data-id="'+esc(String(p.id))+'" checked style="accent-color:var(--brand)"></td>'
          +'<td style="font-weight:600">'+esc(p.name)+(isNew?' <span class="chipb ok" style="margin-left:4px">Transferred</span>':'')+'</td>'
          +'<td><span class="tag">'+esc(p.src)+'</span></td>'
          +'<td>'+(p.sugar||'<span class="chipb neu">—</span>')+'</td>'
          +'<td class="mono">'+esc(p.waiting)+'</td></tr>';
      }).join(""):'<tr><td colspan="5" style="text-align:center;color:var(--faint);padding:18px">No unassigned leads in the pool</td></tr>';
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
    function _asgActiveLeadCount(name:string){
      // Advisor workload within the selected time range (by pool/lead timestamp).
      return _metaLeads.filter((l:any)=>l.isAssigned&&l.assignedTo===name&&inAbmRange(l.poolAddedAt||l.createdAt)).length
        + _assignedExtras.filter((l:any)=>l.assignedTo===name&&inAbmRange(l.poolAddedAt||l.createdAt)).length;
    }
    function renderAssigneesTable(){
      const body=root.querySelector("#asgBody");
      if(!body) return;
      const esc=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      body.innerHTML=_assignees.length?_assignees.map((a:any)=>{
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
      const active=_assignees.filter((a:any)=>a.is_active);
      body.innerHTML=active.length?active.map((a:any)=>{
        const cnt=_asgActiveLeadCount(a.name);
        const status=cnt>=40?'<span class="chipb warn">Near cap</span>':'<span class="chipb ok">Available</span>';
        return '<tr><td style="font-weight:600">'+esc(a.name)+'</td><td>'+esc(a.role)+'</td><td>'+esc(a.branch)+'</td><td class="mono">'+cnt+'</td><td>'+status+'</td></tr>';
      }).join(""):'<tr><td colspan="5" style="text-align:center;color:var(--faint);padding:18px">No active assignees — add them in Settings → Assignees</td></tr>';
    }
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
    }
    w._asgCreate=async()=>{
      const name=((root.querySelector("#asgName")as HTMLInputElement)?.value||"").trim();
      if(!name){toast("Enter a name");return;}
      const role=(root.querySelector("#asgRole")as HTMLSelectElement)?.value||"Advisor";
      const branch=(root.querySelector("#asgBranch")as HTMLSelectElement)?.value||"Chennai";
      const phone=((root.querySelector("#asgPhone")as HTMLInputElement)?.value||"").trim();
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
    w._asgEdit=(id:number)=>{
      const a=_assignees.find((x:any)=>x.id===id); if(!a) return;
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
      }catch(e:any){
        toast(/in_pool|column|schema|exist/i.test(e.message||"")?"Run the assignment migrations first":"Assign failed: "+(e.message||"db error"));
        return;
      }
      const ld=_metaLeads.find((x:any)=>String(x.id)===String(id));
      if(ld){ld.inPool=false;ld.isAssigned=true;ld.assignedTo=name;}
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
    function assignedLeads(){
      const f=(root.querySelector("#assignedFilter")as HTMLSelectElement)?.value||"all";
      // Honor the dashboard call/lead-status dropdown too, so List + Kanban stay in
      // sync with it (and with each other). haEffStatus is hoisted, defined below.
      const sf=(root.querySelector("#haStatusFilter")as HTMLSelectElement)?.value||"all";
      const all=[..._metaLeads.filter((l:any)=>l.isAssigned&&l.assignedTo), ..._assignedExtras];
      return all.filter((l:any)=>(f==="all"||l.assignedTo===f)&&(sf==="all"||haEffStatus(l)===sf));
    }
    function renderAssignedLeads(){
      // populate advisor filter from active assignees (preserve selection)
      const fsel=root.querySelector("#assignedFilter")as HTMLSelectElement;
      if(fsel){
        const cur=fsel.value;
        const names=_assignees.map((a:any)=>a.name);
        fsel.innerHTML='<option value="all">All advisors</option>'+names.map((n:string)=>'<option>'+(n||"").replace(/</g,"&lt;")+'</option>').join("");
        if(Array.from(fsel.options).some(o=>o.value===cur)) fsel.value=cur;
      }
      const list=assignedLeads();
      const body=root.querySelector("#assignedLeadsBody");
      const cnt=root.querySelector("#assignedCount");
      const info=root.querySelector("#asnPageInfo");
      const prev=root.querySelector("#asnPrevBtn")as HTMLButtonElement, next=root.querySelector("#asnNextBtn")as HTMLButtonElement;
      if(cnt) cnt.textContent=String(list.length);
      // View switch: Kanban shows the same (filtered) leads grouped by call-status bucket.
      const tableWrap=root.querySelector("#assignedTableWrap")as HTMLElement|null;
      const kanban=root.querySelector("#assignedKanban")as HTMLElement|null;
      const pager=root.querySelector("#asnPager")as HTMLElement|null;
      if(_asnView==="kanban"){
        if(tableWrap)tableWrap.style.display="none";
        if(pager)pager.style.display="none";
        if(kanban){kanban.style.display="";_renderAssignedKanban(kanban,list);}
        return;
      }
      if(tableWrap)tableWrap.style.display="";
      if(pager)pager.style.display="flex";
      if(kanban)kanban.style.display="none";
      if(!body) return;
      const total=list.length;const pages=Math.max(1,Math.ceil(total/ASN_PER));
      if(_asnPage>pages)_asnPage=pages;if(_asnPage<1)_asnPage=1;
      const rows=list.slice((_asnPage-1)*ASN_PER,(_asnPage-1)*ASN_PER+ASN_PER);
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      body.innerHTML=rows.length?rows.map((l:any)=>{
        const elig=_eligMap[String(l.id)];   // exclusion reason → Not Eligible
        const tr=elig?'<tr style="background:var(--alert-bg);box-shadow:inset 3px 0 0 var(--alert)">':'<tr>';
        const status=elig
          ? '<td><span class="chipb al" title="Exclusion tag present — '+e(elig)+'">Not Eligible</span></td>'
          : '<td><span class="chipb ok">Assigned</span></td>';
        return tr
        +'<td style="font-weight:600;cursor:pointer;color:var(--brand)" title="Open lead profile →" onclick="window._openLeadProfile(\''+e(String(l.id))+'\')">'+e(l.name)+' ↗</td>'
        +'<td><span class="tag">'+e(l.source==="Manual"?"Manual":((l.source||"Meta")+" · "+(l.lang||"Tamil")))+'</span></td>'
        +'<td class="mono" style="font-size:11.5px">'+e(l.campaign||"—")+'</td>'
        +'<td style="font-weight:600">'+e(l.assignedTo)+'</td>'
        +status
        +'<td><div style="display:flex;gap:6px"><button class="btn bsm bp" onclick="window._openLeadProfile(\''+e(String(l.id))+'\')">Open profile</button><button class="btn bsm" onclick="window._unassignLead(\''+e(String(l.id))+'\')">Return to pool</button></div></td></tr>';
      }).join("")
        :'<tr><td colspan="6" style="text-align:center;color:var(--faint);padding:18px">No assigned leads yet</td></tr>';
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
              +'<div style="font-size:10.5px;color:var(--faint);margin-top:1px">→ '+e(l.assignedTo||"—")+'</div></div></div>'
              +'<div style="display:flex;gap:6px;margin-top:8px"><button class="btn bsm bp" style="flex:1" onclick="window._openLeadProfile(\''+e(String(l.id))+'\')">Open</button><button class="btn bsm" onclick="window._unassignLead(\''+e(String(l.id))+'\')">Pool</button></div></div>';
          }).join(""):'<div style="text-align:center;color:var(--faint);font-size:11px;padding:12px 0">No leads</div>')
          +'</div></div>';
      }).join("")+'</div>';
    }
    w._asnPage=(dir:any)=>{_asnPage=_pgApply(_asnPage,dir);renderAssignedLeads();renderHealthDashboard();};
    const _assignedFilterEl=root.querySelector("#assignedFilter")as HTMLSelectElement;
    if(_assignedFilterEl) _assignedFilterEl.onchange=()=>{_asnPage=1;renderAssignedLeads();renderHealthDashboard();};
    // Return an assigned lead to the unassigned pool.
    w._unassignLead=async(id:string)=>{
      try{
        const {error}=await supabase.from("leads").update({assigned_to:null,is_assigned:false,in_pool:true}).eq("meta_lead_id",id);
        if(error) throw error;
      }catch(e:any){ toast("Failed: "+(e.message||"db error")); return; }
      const ld=_metaLeads.find((x:any)=>String(x.id)===String(id));
      if(ld){ld.isAssigned=false;ld.assignedTo="";ld.inPool=true;}
      await loadAssignmentExtras();
      rebuildPoolFromDB();
      renderUnassignedPool();renderMetaPage();renderImport();renderAdvisorLoad();renderAssigneesTable();renderAssignedLeads();renderHealthDashboard();
      toast("Lead returned to pool");
    };
    w._assignedDownload=()=>{
      const list=assignedLeads();
      if(!list.length){toast("Nothing to download");return;}
      const esc=(s:any)=>'"'+String(s==null?"":s).replace(/"/g,'""')+'"';
      const header=["Lead","Phone","Source","Language","Campaign","Assigned to"];
      const lines=[header.map(esc).join(",")];
      list.forEach((l:any)=>lines.push([l.name,l.phone,l.source,l.lang,l.campaign,l.assignedTo].map(esc).join(",")));
      const blob=new Blob([lines.join("\r\n")],{type:"text/csv;charset=utf-8;"});
      const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="wellnessos_assigned_leads.csv";document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
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
    async function loadAndApplyProfile(l:any){
      if(!l) return;
      // 1) INSTANT apply. The device-local copy is the authoritative latest (every
      //    save writes it synchronously), so prefer it over any stale in-memory cache.
      let prof:any = readProfileLocal(l.id);
      if(prof==null) prof = (l.advisorProfile!=null ? l.advisorProfile : null);
      l.advisorProfile = prof || null;
      if(prof && String(_advLeadId)===String(l.id)) applyAdvisorProfile(prof);
      // 2) BACKGROUND reconcile with the DB (skip once we know the column is absent).
      if(_advProfileColMissing) return;
      try{
        const {data,error}=await supabase.from("leads").select("advisor_profile").eq("meta_lead_id",l.id).limit(1);
        if(error){ if(/advisor_profile|column|exist|schema/i.test(error.message||"")) _advProfileColMissing=true; return; }
        const dbProf=data&&data[0]&&data[0].advisor_profile;
        if(dbProf){ l.advisorProfile=dbProf; if(String(_advLeadId)===String(l.id)) applyAdvisorProfile(dbProf); }
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
      try{
        const {error}=await supabase.from("leads").update(upd).eq("meta_lead_id",id);
        if(error){
          if(/advisor_profile|column|schema|exist/i.test(error.message||"")) toast("Saved locally — run supabase-migration-advisor-profile.sql for DB sync");
          else toastErr("Save failed: "+(error.message||"DB error"));
          return;
        }
        [..._openLeads.map((o:any)=>o.lead),..._metaLeads,..._otherFeedLeads].forEach((x:any)=>{ if(x&&String(x.id)===id){ x.advisorProfile=obj; if(csLabel)x.callStatus=csLabel; } });
        renderHealthDashboard();
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
    async function renderActivityLog(leadId:any){
      const el=root.querySelector("#actLog"); if(!el) return;
      let rows:any[]=[];
      try{ const {data}=await supabase.from("lead_activity").select("*").eq("lead_id",String(leadId)).order("created_at",{ascending:false}).limit(200); rows=data||[]; }catch(_){ rows=[]; }
      if(!rows.length) rows=readActLocal(leadId);
      if(String(_advLeadId)!==String(leadId)) return;   // user switched away during the fetch
      const e=(s:any)=>(s==null?"":String(s)).replace(/</g,"&lt;").replace(/>/g,"&gt;");
      if(!rows.length){ el.innerHTML='<div style="text-align:center;color:var(--faint);padding:18px;font-size:13px">No activity recorded for this lead yet.</div>'; return; }
      el.innerHTML=rows.map((r:any)=>{
        const chg=r.field?('<b>'+e(r.field)+'</b>'+((r.old_value!=null||r.new_value!=null)?': <span style="color:var(--faint)">'+e(r.old_value||"—")+'</span> &rarr; <b>'+e(r.new_value||"—")+'</b>':'')):'';
        return '<div class="tl"><div class="t"><span class="chipb '+_actColor(r.action)+'">'+e(r.action)+'</span> '+chg+'</div><div class="m">'+e(r.actor||ADV_ACTOR)+' &middot; '+_actTime(r.created_at)+'</div></div>';
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
      return [..._metaLeads.filter((l:any)=>l.isAssigned), ..._assignedExtras];
    }
    function haEffStatus(l:any){ return l.callStatus || (l.isAssigned?"Open":"New"); }
    function renderHealthDashboard(){
      const fsel=root.querySelector("#haStatusFilter")as HTMLSelectElement;
      if(fsel && fsel.options.length<=1){
        fsel.innerHTML='<option value="all">All call/lead statuses</option>'+HA_STATUSES.map(s=>'<option>'+s+'</option>').join("");
      }
      const filter=fsel?.value||"all";
      let book=haBook();
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
    function renderHaResults(){
      const wrap=root.querySelector("#haResultsWrap")as HTMLElement;
      const body=root.querySelector("#haResultsBody");
      const title=root.querySelector("#haResultsTitle");
      if(!wrap||!body) return;
      const fsel=root.querySelector("#haStatusFilter")as HTMLSelectElement;
      const filter=fsel?.value||"all";
      let book=haBook();
      if(filter!=="all") book=book.filter((l:any)=>haEffStatus(l)===filter);
      const list=_haActiveBucket==="callstatus"?book:book.filter((l:any)=>haBucketOf(haEffStatus(l))===_haActiveBucket);
      const card=HA_CARDS.find(c=>c.key===_haActiveBucket);
      wrap.style.display="";
      if(title) title.textContent=(card?card.label:"Call status")+" — "+list.length+" lead"+(list.length===1?"":"s");
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      body.innerHTML=list.length?list.map((l:any)=>'<tr>'
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
      ids.forEach(id=>{const ld=_metaLeads.find((x:any)=>String(x.id)===id); if(ld){ld.inPool=false;ld.isAssigned=true;ld.assignedTo=advisor;} logActivity(id,[{action:"Assigned",field:"Assigned to",new:advisor}]);});
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
        const rows:string[][]=[["Date & Time (IST)","Repeat Leads Count","Campaign","Ad Name","Lead Name","Phone","Sugar","City","Street","Sources","Service","Language"]];
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
      if(statusEl) statusEl.textContent="Syncing from Meta…";
      try{
        const res=await fetch("/api/meta/sync",{method:"POST"});
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
      }finally{ _autoSyncInFlight=false; }
    }
    async function fetchMetaLiveFeed(){
      if(_metaFetchInFlight) return; // prevent overlapping requests piling up
      _metaFetchInFlight=true;
      const tbody=root.querySelector("#liveFeedBody");
      const statusEl=root.querySelector("#metaFeedStatus");
      const countEl=root.querySelector("#metaFeedCount");
      const haveData=_metaLeads&&_metaLeads.length>0;
      try{
        const res=await fetch("/api/meta/leads");
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
        renderMetaPage();
        renderUnassignedPool();
        renderAdvisorLoad();renderAssigneesTable();renderAssignedLeads();renderHealthDashboard();  // refresh live counts
        // Upgrade the restored open-leads placeholders to live lead objects (once).
        relinkOpenLeads();
        // Build the shared IMP dataset (Meta + all other sources) so the KPI cards
        // and Source Connections table reflect EVERY source, incl. manual leads.
        await loadOtherSourceLeads();
        rebuildIMP();
        renderImport();
        renderMetaPage();   // re-render the feed now that manual/other-source leads are loaded
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
        const res=await fetch("/api/meta/sync",{method:"POST"});
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

    // ===== REAL-TIME: Supabase pushes new/changed leads instantly (no refresh) =====
    function dbRowToLead(r:any){
      const createdAt=r.created_at||r.lead_date;
      const m=Math.floor((Date.now()-new Date(createdAt).getTime())/60000);
      const received=m<1?"now":(m<60?m+"m":(m<1440?Math.floor(m/60)+"h":Math.floor(m/1440)+"d"));
      return {id:r.meta_lead_id,name:r.name,phone:r.phone,email:r.email,source:"Meta",
        campaign:r.campaign||"—",adName:r.ad_name||"",sugar:r.sugar_poll||"",city:r.city||"",street:r.street||"",
        service:r.service||"Diabetes",lang:r.language||"Tamil",received,createdAt,
        adAccountName:r.ad_account_name||"",isValid:r.is_valid,isDuplicate:r.is_duplicate,
        isAssigned:r.is_assigned,inPool:!!r.in_pool,poolAddedAt:r.pool_added_at||null,assignedTo:r.assigned_to||"",callStatus:r.call_status||""};
    }
    function liveRerenderAll(){
      _metaLeads.sort((a:any,b:any)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
      rebuildIMP();   // Meta + other-source leads (don't drop manual/walk-in from the dashboard)
      rebuildPoolFromDB();
      renderMetaPage();renderImport();renderUnassignedPool();renderAdvisorLoad();renderAssigneesTable();renderAssignedLeads();renderHealthDashboard();
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
    const _csvSelIds=new Set<number>();
    function _csvUpdateSelAll(){
      const sa=root.querySelector("#csvValidSelAll")as HTMLInputElement|null; if(!sa) return;
      const boxes=Array.from(root.querySelectorAll("#csvImportedBody .csvChk"))as HTMLInputElement[];
      const checked=boxes.filter((c)=>c.checked).length;
      sa.checked=boxes.length>0&&checked===boxes.length;
      sa.indeterminate=checked>0&&checked<boxes.length;
    }
    w._csvRowSel=(el:any)=>{ const id=Number(el.getAttribute("data-id")); if(el.checked)_csvSelIds.add(id); else _csvSelIds.delete(id); _csvUpdateSelAll(); };
    function renderCsvValid(){
      const wrap=root.querySelector("#csvImportedWrap")as HTMLElement;
      const body=root.querySelector("#csvImportedBody");
      const cnt=root.querySelector("#csvImportedCount");
      const vc=root.querySelector("#csvValidCount"),dc=root.querySelector("#csvDupCount"),hc=root.querySelector("#csvHistCount");
      const info=root.querySelector("#csvPageInfo");
      const prev=root.querySelector("#csvPrevBtn")as HTMLButtonElement,next=root.querySelector("#csvNextBtn")as HTMLButtonElement;
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const valid=_csvLeads.filter((r:any)=>r.status==="valid"&&inCsvRange(r.dt)&&csvMatchesQuery(r));
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
        +'<td><input type="checkbox" class="csvChk" data-id="'+r.id+'"'+(_csvSelIds.has(r.id)?" checked":"")+' style="accent-color:var(--brand)" onchange="window._csvRowSel(this)"></td>'
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
      const dups=_csvLeads.filter((r:any)=>isActiveDup(r)&&inCsvRange(r.dt));
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
      const batches=_csvBatches.filter((b:any)=>inCsvRange(b.created_at));   // import-time range
      body.innerHTML=batches.length?batches.map((b:any)=>{
        const dt=new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}).format(new Date(b.created_at));
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
      const total=_rvData.length;const pages=Math.max(1,Math.ceil(total/RV_PER));
      if(_rvPage>pages)_rvPage=pages;if(_rvPage<1)_rvPage=1;
      const pageRows=_rvData.slice((_rvPage-1)*RV_PER,(_rvPage-1)*RV_PER+RV_PER);
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
      if(_vSelAll.checked) valid.forEach((r:any)=>_csvSelIds.add(r.id)); else valid.forEach((r:any)=>_csvSelIds.delete(r.id));
      root.querySelectorAll("#csvImportedBody .csvChk").forEach((c:any)=>{c.checked=_vSelAll.checked;});
      _vSelAll.indeterminate=false;
    };
    const _dSelAll=root.querySelector("#csvDupSelAll")as HTMLInputElement;
    if(_dSelAll)_dSelAll.onchange=()=>root.querySelectorAll(".csvDupChk").forEach((c:any)=>{c.checked=_dSelAll.checked;});

    // ---- Delete / Keep / Download ----
    async function csvDeleteIds(ids:number[]){
      for(let i=0;i<ids.length;i+=200){await supabase.from("csv_leads").delete().in("id",ids.slice(i,i+200));}
      await loadCsvData();
    }
    w._csvDeleteOne=(id:number)=>csvConfirm("Delete this lead permanently?",async()=>{await csvDeleteIds([id]);toast("Lead deleted");});
    w._csvDeleteSelected=(which:string)=>{
      // Imported-leads selection is tracked across pages in _csvSelIds; dup table reads its checkboxes.
      const ids=which==="dup"
        ? Array.from(root.querySelectorAll(".csvDupChk:checked")).map((c:any)=>Number(c.getAttribute("data-id")))
        : Array.from(_csvSelIds);
      if(!ids.length){toast("Select one or more rows first");return;}
      csvConfirm("Delete "+ids.length+" selected lead(s) permanently?",async()=>{await csvDeleteIds(ids);_csvSelIds.clear();toast(ids.length+" deleted");});
    };
    async function csvKeepIds(ids:number[]){
      for(let i=0;i<ids.length;i+=200){await supabase.from("csv_leads").update({status:"valid"}).in("id",ids.slice(i,i+200));}
      await loadCsvData();
    }
    w._csvKeepOne=async(id:number)=>{await csvKeepIds([id]);toast("Moved to imported leads");};
    w._csvKeepSelected=()=>{
      const ids=Array.from(root.querySelectorAll(".csvDupChk:checked")).map((c:any)=>Number(c.getAttribute("data-id")));
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
    w._csvDownloadBatch=(id:number)=>{
      const rows=_csvLeads.filter((r:any)=>r.batch_id===id);
      if(!rows.length){toast("No rows left in this batch");return;}
      downloadCsvRows(rows,"wellnessos_batch_"+id+".csv");toast("Downloaded batch");
    };

    // Send selected CSV imported leads to the SAME assignment pool as the feed.
    // They become DB-backed pooled leads (leads.in_pool=true) handled by the exact
    // same pool → assign workflow.
    w._csvSendToAssignment=async()=>{
      const sel=_csvTabName==="dup"?".csvDupChk:checked":(_csvTabName==="valid"?".csvChk:checked":null);
      if(!sel){toast("Open the Imported leads or Duplicates tab and select rows");return;}
      const ids=Array.from(root.querySelectorAll(sel)).map((c:any)=>Number(c.getAttribute("data-id")));
      if(ids.length===0){toast("Select one or more leads first");return;}
      const rows=ids.map(id=>_csvLeads.find((r:any)=>r.id===id)).filter(Boolean);
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

    // ========== RECEPTION DATA (live: appointments + payments) ==========
    let RX: any[] = [];        // current date-filtered appointments (shape used by renderers)
    let _recAll: any[] = [];   // all loaded appointments
    function _recSvcCode(s:string){ s=(s||"").toLowerCase(); if(s.indexOf("blood")>=0)return "bt"; if(s.indexOf("phys")>=0)return "physio"; return "dia"; }
    function _recSvcLabel(s:string,session:string){ const c=_recSvcCode(s); if(c==="bt")return "🩸 Blood test"; if(c==="physio")return "💪 Physio"+(session?(" "+session):""); return "🩺 Diabetes"; }
    function _recFmtDate(d:string){ if(!d)return ""; try{ return new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short"}).format(new Date(d+"T12:00:00")); }catch(_){ return d; } }
    async function loadReceptionData(){
      try{
        const [ar,pr]=await Promise.all([
          supabase.from("appointments").select("*").order("appt_date",{ascending:false}).limit(500),
          supabase.from("payments").select("*").order("created_at",{ascending:false})
        ]);
        const pays:Record<string,any>={}; (pr.data||[]).forEach((p:any)=>{ if(!pays[p.appointment_id]) pays[p.appointment_id]={status:p.status,amount:p.amount||0}; });
        _recAll=(ar.data||[]).map((a:any)=>{ const pay=pays[a.id]||{status:(a.status==="cancelled"?"refunded":(a.status==="visited"||a.stage==="screening"||a.stage==="screened")?"due":"free"),amount:0}; return {
          id:a.id, lead_id:a.lead_id, name:a.client_name||"Client", ph:a.phone||"", svc:_recSvcCode(a.service), svcLabel:_recSvcLabel(a.service,a.session),
          _date:a.appt_date, date:_recFmtDate(a.appt_date), time:a.appt_time||"", hc:a.hc_pt||"—", status:a.status||"expected", visitedAt:a.visited_at||"",
          payStatus:pay.status, payAmt:pay.amount||0, stage:a.stage||"", session:a.session||"", notes:a.notes||"", calls:0, source:a.source||"", lang:a.language||"Tamil",
          sugar:"",hba1c:"",priority:"",prob:"",eligibility:"",advisor:"",consultStatus:"",bmi:"",bp:"",assessment:"" };
        });
      }catch(e:any){ _recAll=[]; toastErr("Reception load failed — check your connection"); }
      applyRecDate();
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
      try{
        const {data}=await supabase.from("appointments").select("id").eq("lead_id",leadId).eq("appt_date",apptDate).neq("status","cancelled").limit(1);
        if(data&&data[0]) await supabase.from("appointments").update({appt_time:apptTime,hc_pt:hc,source:"Advisor ("+mode+")"}).eq("id",data[0].id);
        else await supabase.from("appointments").insert({lead_id:leadId,client_name:name,phone,service:"Diabetes",hc_pt:hc,appt_date:apptDate,appt_time:apptTime,status:"expected",source:"Advisor ("+mode+")",language:lang});
        toast("Appointment booked → Reception");
        loadReceptionData();
      }catch(e:any){ if(/appointment|relation|column|schema|exist/i.test(e.message||"")) toast("Run supabase-migration-reception.sql to enable appointments"); }
    }

    let curSvc = "all", curDate = "today", curScFilter: string | null = null;
    const SVC_LABELS: Record<string,string> = { all:"All", dia:"🩺 Diabetes", bt:"🩸 Blood test", physio:"💪 Physio" };
    const STATUS_MAP: Record<string,{l:string;c:string}> = { visited:{l:"Visited",c:"ok"}, expected:{l:"Expected",c:"warn"}, noshow:{l:"No show",c:"al"}, rescheduled:{l:"Rescheduled",c:"warn"}, cancelled:{l:"Cancelled",c:"al"} };
    const PAY_MAP: Record<string,{l:string;c:string}> = { paid:{l:"Paid",c:"ok"}, due:{l:"Due",c:"warn"}, free:{l:"Free",c:"neu"}, prepaid:{l:"Prepaid ✓",c:"ok"}, refunded:{l:"Refunded",c:"al"} };
    const TIMES = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","2:00 PM","2:30 PM","3:00 PM"];

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
      f.forEach((r: any) => { c[r.status]=(c[r.status]||0)+1; if(r.payStatus==="due")c.paydue++; if(r.stage==="enrolled")c.enrolled++; });
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
    // Per-column filters for the Appointments table (client/phone/HC/stage text;
    // service/status/pay dropdowns). AND-combined with the existing service/date filters.
    const _apptColF:Record<string,string>={client:"",phone:"",svc:"",hc:"",status:"",pay:"",stage:""};
    function _apptColMatch(r:any){
      const F=_apptColF;
      if(F.client && !((r.name||"").toLowerCase().includes(F.client.toLowerCase()))) return false;
      if(F.phone && !((r.ph||"").includes(F.phone))) return false;
      if(F.svc && r.svc!==F.svc) return false;
      if(F.hc && !((r.hc||"").toLowerCase().includes(F.hc.toLowerCase()))) return false;
      if(F.status && r.status!==F.status) return false;
      if(F.pay && r.payStatus!==F.pay) return false;
      if(F.stage && !(String(r.stage||"").toLowerCase().includes(F.stage.toLowerCase()))) return false;
      return true;
    }
    w._apptFilt=(field:string,val:string)=>{ _apptColF[field]=val; renderAppt(); };
    function renderAppt() {
      const f = filtered().filter(_apptColMatch);
      const el = root.querySelector("#apptCount"); if (el) el.textContent = f.length+" total";
      const aw = root.querySelector("#apptWrap") as HTMLElement|null; if(!aw) return;
      // Build the header (with filter controls) once so typing keeps input focus; only the body re-renders.
      if(!root.querySelector("#apptBody")){
        const fi='margin-top:3px;display:block;width:100%;height:26px;font-size:10.5px;padding:0 6px;border-radius:6px;border:1px solid var(--line);background:#fff';
        const svcOpts='<option value="">All</option>'+["dia","bt","physio"].map(k=>'<option value="'+k+'">'+SVC_LABELS[k]+'</option>').join("");
        const statusOpts='<option value="">All</option>'+Object.keys(STATUS_MAP).map(k=>'<option value="'+k+'">'+STATUS_MAP[k].l+'</option>').join("");
        const payOpts='<option value="">All</option>'+Object.keys(PAY_MAP).map(k=>'<option value="'+k+'">'+PAY_MAP[k].l+'</option>').join("");
        aw.innerHTML='<table class="tbl" style="min-width:1200px"><thead><tr>'
          +'<th style="min-width:68px">Date · time</th>'
          +'<th style="min-width:120px">Client<input id="apf_client" placeholder="Filter…" oninput="window._apptFilt(\'client\',this.value)" style="'+fi+'"></th>'
          +'<th style="min-width:110px">Phone<input id="apf_phone" placeholder="Filter…" oninput="window._apptFilt(\'phone\',this.value)" style="'+fi+'"></th>'
          +'<th style="min-width:110px">Service<select id="apf_svc" onchange="window._apptFilt(\'svc\',this.value)">'+svcOpts+'</select></th>'
          +'<th style="min-width:90px">HC / PT<input id="apf_hc" placeholder="Filter…" oninput="window._apptFilt(\'hc\',this.value)" style="'+fi+'"></th>'
          +'<th style="min-width:100px">Status<select id="apf_status" onchange="window._apptFilt(\'status\',this.value)">'+statusOpts+'</select></th>'
          +'<th style="min-width:65px">Visited at</th>'
          +'<th style="min-width:90px">Pay<select id="apf_pay" onchange="window._apptFilt(\'pay\',this.value)">'+payOpts+'</select></th>'
          +'<th style="min-width:70px">Amount</th>'
          +'<th style="min-width:50px">Inv</th>'
          +'<th style="min-width:90px">Stage<input id="apf_stage" placeholder="Filter…" oninput="window._apptFilt(\'stage\',this.value)" style="'+fi+'"></th>'
          +'<th style="min-width:40px">📞</th><th style="min-width:40px">🎤</th>'
          +'</tr></thead><tbody id="apptBody"></tbody></table>';
      }
      const body=root.querySelector("#apptBody"); if(!body) return;
      let rows='';
      f.forEach((r:any) => {
        const sm = STATUS_MAP[r.status]||{l:r.status,c:"neu"};
        const pm = PAY_MAP[r.payStatus]||{l:"—",c:"neu"};
        rows += '<tr onclick="window._openDrawer('+r.id+')" style="cursor:pointer"><td class="mono">'+r.date+' '+r.time+'</td><td style="font-weight:600">'+r.name+'</td><td class="mono">'+r.ph+'</td><td><span class="tag">'+r.svcLabel+'</span></td><td>'+r.hc+'</td><td><span class="chipb '+sm.c+'">'+sm.l+'</span></td><td class="mono">'+(r.visitedAt||"—")+'</td><td><span class="chipb '+pm.c+'">'+pm.l+'</span></td><td class="mono" style="font-weight:700">'+(r.payAmt?("₹"+r.payAmt.toLocaleString("en-IN")):"—")+'</td><td>'+(r.payStatus==="paid"?'<button class="btn bsm" onclick="event.stopPropagation();window._toast(\'Invoice PDF downloading\')">⬇</button>':"—")+'</td><td>'+(r.stage?'<span class="chipb info">'+r.stage+'</span>':"—")+'</td><td><button class="btn bsm" onclick="event.stopPropagation();window._recCall(\''+(r.lead_id||"")+'\',\''+(r.ph||"").replace(/[^0-9+ ]/g,"")+'\')">📞</button></td><td>'+(r.calls?'<span class="mono" style="font-size:11px">'+r.calls+'</span>':"—")+'</td></tr>';
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
      if(drp) drp.innerHTML='<div class="sec" style="margin-top:12px"><div class="sec-hd" style="cursor:default;padding:10px 14px"><svg class="icon"><use href="#i-door"></use></svg> Reception record</div><div class="sec-bd" style="padding:4px 14px 14px"><table class="tbl"><tbody><tr><td style="color:var(--muted)">Visited</td><td class="mono" style="font-weight:600">'+(r.visitedAt||"—")+'</td><td style="color:var(--muted)">Service</td><td>'+r.svcLabel+'</td></tr><tr><td style="color:var(--muted)">HC / PT</td><td style="font-weight:600">'+r.hc+'</td><td style="color:var(--muted)">Status</td><td><span class="chipb '+sm.c+'">'+sm.l+'</span></td></tr><tr><td style="color:var(--muted)">Payment</td><td class="mono" style="font-weight:700">'+(r.payAmt?"₹"+r.payAmt.toLocaleString("en-IN"):"—")+'</td><td style="color:var(--muted)">Pay status</td><td><span class="chipb '+pm.c+'">'+pm.l+'</span></td></tr></tbody></table></div></div>';
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

    function nwToggle() { const p=root.querySelector("#nwPanel")as HTMLElement; if(p){p.style.display=p.style.display==="none"?"block":"none"; if(p.style.display==="block"){p.scrollIntoView({behavior:"smooth"}); const dt=root.querySelector("#nwDate")as HTMLInputElement; if(dt&&!dt.value) dt.value=new Date().toISOString().substring(0,10);}} }
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
      const nowIso=new Date().toISOString(); const today=nowIso.substring(0,10);
      const leadId="walkin-"+Date.now()+"-"+Math.floor(Math.random()*1e6);
      const visAt=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
      const svcChips=root.querySelectorAll("#nwSvc .chip-o.on"); const svcParts:string[]=[]; svcChips.forEach((c:any)=>{ const s=c.getAttribute("data-svc"); if(s==="dia")svcParts.push("Diabetes"); else if(s==="bt")svcParts.push("Blood test"); else if(s==="physio")svcParts.push("Physio"); }); const svcStr=svcParts.join(" + ")||"Diabetes";
      const langSel=root.querySelector("#nwPanel .select") as HTMLSelectElement|null; let langParts:NodeListOf<HTMLSelectElement>|null=null; try{ langParts=root.querySelectorAll("#nwPanel select.select") as NodeListOf<HTMLSelectElement>; }catch(_){} const langVal=langParts&&langParts.length>=2?langParts[1].value:"Tamil";
      try{
        await supabase.from("leads").insert({meta_lead_id:leadId,name,phone:ph,source:"Walk-in / Referral / Telecalling",language:langVal,service:svcStr,lead_date:today,is_valid:!!ph,is_duplicate:false,is_assigned:false,call_status:"Visited",visited_at:nowIso,created_at:nowIso});
      }catch(_){ /* lead insert best-effort */ }
      try{
        await supabase.from("appointments").insert({lead_id:leadId,client_name:name,phone:ph,service:svcStr,hc_pt:prov,appt_date:today,appt_time:time,status:"visited",visited_at:visAt,stage:"screening",source:"Direct Walk-in",language:langVal,notes:"Walk-in registered at reception"});
      }catch(e:any){ toastErr(/appointment|relation|exist|schema/i.test(e.message||"")?"Run supabase-migration-reception.sql first":"Booking failed: "+(e.message||"db error")); return; }
      nwToggle(); await loadReceptionData();
      ach("📌","Walk-in registered!",name+(time?(" · "+time):"")); boom(26);
      toast("Created + booked + checked in → screening");
    }
    w.nwBook = nwBook;

    let _recCollect:{apptId:any,leadId:string,amt:number}|null=null;
    function recOpen(apptId:any,name:string,amt:any,leadId:string) {
      _recCollect={apptId,leadId:leadId||"",amt:Number(amt)||0};
      const wb=root.querySelector("#recWb")as HTMLElement; if(wb) wb.style.display="block";
      const rn=root.querySelector("#recWbName"); if(rn) rn.textContent=name;
      const rp=root.querySelector("#recWbPlan"); if(rp) rp.textContent="Collection";
      const rd=root.querySelector("#recWbDue")as HTMLInputElement; if(rd) rd.value="₹"+(Number(amt)||0).toLocaleString("en-IN");
      const ra=root.querySelector("#recWbAmt")as HTMLInputElement; if(ra) ra.value=String(Number(amt)||0);
    }
    w._recOpen = recOpen;
    async function recConfirm() {
      const wb=root.querySelector("#recWb")as HTMLElement; if(wb)wb.style.display="none";
      if(!_recCollect){ toast("Nothing to collect"); return; }
      const amt=Number(((root.querySelector("#recWbAmt")as HTMLInputElement)?.value||"").replace(/[^0-9.]/g,""))||_recCollect.amt||0;
      const modeEl=root.querySelector("#recWbMode")as HTMLSelectElement|null;
      const method=(modeEl?.value||"UPI").toLowerCase();
      const txnEl=root.querySelector("#recWbTxn")as HTMLInputElement|null;
      const txnRef=(txnEl?.value||"").trim();
      if(method!=="cash"&&!txnRef){ toastErr("Enter the transaction reference for "+method.toUpperCase()+" payments"); return; }
      try{
        await supabase.from("payments").insert({appointment_id:_recCollect.apptId,lead_id:_recCollect.leadId,amount:amt,status:"paid",method,paid_at:new Date().toISOString()});
        await supabase.from("appointments").update({stage:"payment"}).eq("id",_recCollect.apptId);
        if(_recCollect.leadId){
          await supabase.from("leads").update({call_status:"Payment Done"}).eq("meta_lead_id",_recCollect.leadId);
        }
        toast("₹"+amt.toLocaleString("en-IN")+" collected → Accounts verification");
        await loadReceptionData();
      }catch(e:any){ toastErr(/payment|relation|exist|schema/i.test(e.message||"")?"Run supabase-migration-reception.sql first":"Collect failed: "+(e.message||"db error")); }
      _recCollect=null;
    }
    w.recConfirm = recConfirm;
    function recBack() { const wb=root.querySelector("#recWb")as HTMLElement; if(wb)wb.style.display="none"; toast("↩ Moved back"); }
    w.recBack = recBack;
    // Check-in: match the typed phone/name to a loaded appointment; fill Dedup + name.
    let _ciMatch:any=null;
    function _ciLookup(){
      const q=((root.querySelector("#ciSearch")as HTMLInputElement)?.value||"").trim();
      const nameEl=root.querySelector("#ciName"); const dd=root.querySelector("#ciDedup")as HTMLInputElement|null;
      if(!q){ _ciMatch=null; if(nameEl)nameEl.textContent="—"; if(dd)dd.value=""; return; }
      const ql=q.toLowerCase(); const digits=q.replace(/\D/g,"");
      const matches=_recAll.filter((r:any)=>{ const ph=(r.ph||"").replace(/\D/g,""); return (digits.length>=4 && ph.indexOf(digits)>=0) || (r.name||"").toLowerCase().indexOf(ql)>=0; });
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
        if(_ciMatch.lead_id){ try{ await supabase.from("leads").update({call_status:"Visited",visited_at:nowIso}).eq("meta_lead_id",_ciMatch.lead_id); }catch(_){} }
      }catch(e:any){ toastErr("Check-in save failed: "+(e.message||"db error")); return; }
      const vis=root.querySelector("#rcVis")as HTMLInputElement|null; if(vis)vis.value=now;
      const reg=root.querySelector("#rcReg")as HTMLInputElement|null; if(reg)reg.value=now;
      toast("✓ "+_ciMatch.name+" checked in → screening ("+now+")");
      await loadReceptionData();   // refresh: appointment now Visited, in screening queue + payment queue
    }
    w.recRegDone = recRegDone;
    function showInbound() { root.querySelector("#inboundBar")?.classList.add("show"); }
    w.showInbound = showInbound;
    function hideInbound() { root.querySelector("#inboundBar")?.classList.remove("show"); }
    w.hideInbound = hideInbound;

    // Advisor call status
    const badge = root.querySelector("#consBadge");
    function callStatusChange(v:string) {
      const appt=root.querySelector("#apptSec")as HTMLElement;
      const fu=root.querySelector("#fuPanel")as HTMLElement;
      if(appt) appt.style.display=(v==="afd"||v==="afz")?"block":"none";
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
      const map:Record<string,[string,string]>={new:["New","vio"],fu:["Follow Up","warn"],paid:["Already Paid","info"],afd:["Appt Fixed","ok"],afz:["Appt Fixed (Zoom)","ok"],ni:["Not Interested","al"],cb:["Call Back","vio"]};
      const m=map[v]||[v,"neu"];
      if(badge){badge.textContent="Status: "+m[0];badge.className="chipb "+m[1];}
      if(v==="afd"||v==="afz"){ const sdEl=root.querySelector("#slotDate")as HTMLInputElement|null; if(sdEl&&!sdEl.value) sdEl.value=new Date().toISOString().substring(0,10); renderSlots();ach("📅","Appointment fixed!","Pick a slot");boom(26); if(!_advApplying && _advLeadId) _bookApptForLead(_advLeadId, v==="afz"?"Zoom":"Direct"); }
      // Persist the call status to the open lead so it drives the KPI dashboard.
      if(w._haSetCallStatus) w._haSetCallStatus(HA_CODE2LABEL[v]||v);
      // Audit: log a real status change (but not when restoring a saved profile).
      if(!_advApplying && _advLeadId) logActivity(_advLeadId,[{action:"Status Changed",field:"Call status",new:HA_CODE2LABEL[v]||v}]);
    }
    w.callStatusChange = callStatusChange;

    const CAP=4; let slots:Record<string,string[][]>={}; let selSlot:string|null=null; let booked:string|null=null; let resch=false;
    // Load REAL slot occupancy for the chosen date from the appointments table.
    async function loadSlotsFromDB(){
      slots={}; TIMES.forEach(t=>slots[t]=[]);
      const date=(root.querySelector("#slotDate")as HTMLInputElement|null)?.value;
      if(!date) return;
      try{
        const {data}=await supabase.from("appointments").select("client_name,hc_pt,appt_time,status").eq("appt_date",date).neq("status","cancelled");
        (data||[]).forEach((a:any)=>{ const t=a.appt_time; if(t&&slots[t]) slots[t].push([a.client_name||"Client",a.hc_pt||"—"]); });
      }catch(_){/* table not migrated yet → all slots free */}
    }
    function seed(){ TIMES.forEach(t=>{ if(!slots[t]) slots[t]=[]; }); }   // no demo data — just ensure keys exist
    async function renderSlots() {
      const g=root.querySelector("#slotGrid"); if(!g) return;
      await loadSlotsFromDB();
      g.innerHTML=TIMES.map((t)=>{
        const arr=slots[t]||[]; const n=arr.length; const full=n>=CAP;
        const cls=full?"s3 full":n>=3?"s2":n>0?"s1":"s0";
        return '<button class="slotcard '+cls+(selSlot===t?" sel":"")+'" data-t="'+t+'"><div class="st"><span class="tm">'+t+'</span><span class="cap">'+n+'/'+CAP+(full?" FULL":"")+'</span></div><ul>'+(arr.map((x)=>'<li><span>'+x[0]+'</span><span class="hc">'+x[1]+'</span></li>').join("")||'<li style="color:var(--ok-ink)">Free</li>')+'</ul></button>';
      }).join("");
      g.querySelectorAll(".slotcard").forEach((c)=>{
        (c as HTMLElement).onclick=()=>{
          const t=(c as HTMLElement).dataset.t!;
          if((slots[t]||[]).length>=CAP){c.classList.add("shake");setTimeout(()=>c.classList.remove("shake"),350);toastErr("Slot FULL");return;}
          selSlot=t; renderSlots();
        };
      });
    }
    w.renderSlots = renderSlots;
    // Book the CURRENTLY OPEN lead into the selected slot (real appointment row).
    async function bookSlot() {
      if(!selSlot){toastErr("Select a slot first");return;}
      const date=(root.querySelector("#slotDate")as HTMLInputElement|null)?.value;
      if(!date){toastErr("Pick a date first");return;}
      if(!_advLeadId){toastErr("Open a lead first (from Assigned leads)");return;}
      const lead=_advFindLead(String(_advLeadId));
      const name=lead?(lead.name||lead.phone||"Client"):"Client";
      const hc=(root.querySelector("#apptHc")as HTMLSelectElement|null)?.value||"";
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
    async function _callInitiate(id:string){ try{ const r=await fetch("/api/calls/initiate/"+encodeURIComponent(id),{method:"POST"}); return await r.json(); }catch(_){ return {ok:false,error:"network error"}; } }
    async function _callRecordings(id:string){ try{ const r=await fetch("/api/calls/"+encodeURIComponent(id)+"/recordings"); return await r.json(); }catch(_){ return {ok:false,recordings:[]}; } }
    async function _callTagLatest(id:string,t:string){ try{ const r=await fetch("/api/calls/"+encodeURIComponent(id)+"/latest-type",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({callType:t})}); return await r.json(); }catch(_){ return {ok:false}; } }
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
    // Call button: initiate the dial (agent rings first), then run a timer + polling.
    let onCall=0,ct=0,cti:ReturnType<typeof setInterval>|null=null;
    const cbtn=root.querySelector("#callBtn")as HTMLElement;
    if(cbtn) cbtn.onclick=async()=>{
      const sp=cbtn.querySelector("span");
      if(!onCall){
        if(!_advLeadId){ toast("Open a lead first (from Assigned leads)"); return; }
        const id=String(_advLeadId); const nm=(root.querySelector("#advName")?.textContent)||"lead";
        onCall=1; cbtn.style.background="linear-gradient(135deg,#E2553B,#A8351F)"; if(sp)sp.textContent="Calling…";
        const r=await _callInitiate(id);
        if(!r||!r.ok){ onCall=0; cbtn.style.background=""; if(sp)sp.textContent="Call"; toastErr((r&&r.error)||"Call could not be placed"); return; }
        toast("📞 Calling "+nm+" — your phone rings first, then the customer");
        logActivity(id,[{action:"Status Changed",field:"Call",new:"Outbound call initiated"}]);
        ct=0; if(cti)clearInterval(cti); cti=setInterval(()=>{ct++;const s2=cbtn.querySelector("span");if(s2)s2.textContent=(ct/60|0)+":"+String(ct%60).padStart(2,"0");},1000);
        _pollRecordings(id,"outbound");
      } else {
        onCall=0; if(cti)clearInterval(cti); cbtn.style.background=""; if(sp)sp.textContent="Call";
        if(_advLeadId) logActivity(_advLeadId,[{action:"Updated",field:"Call ended",new:(ct/60|0)+":"+String(ct%60).padStart(2,"0")}]);
        toast("Call ended");
      }
    };

    // Coach consultation
    const cBadge=root.querySelector("#coachBadge");
    function consAct(a:string,el:HTMLElement){
      const pay=root.querySelector("#paySec")as HTMLElement;
      const fu=root.querySelector("#coachFu")as HTMLElement;
      const rf=root.querySelector("#refundPanel")as HTMLElement;
      if(fu)fu.style.display="none"; if(rf)rf.style.display="none";
      if(a==="refund"){if(rf)rf.style.display="flex";if(pay)pay.style.display="none";if(cBadge){cBadge.textContent="Refund";cBadge.className="chipb al";}return;}
      if(a==="join"){if(pay)pay.style.display="block";if(cBadge){cBadge.textContent="Joining";cBadge.className="chipb ok";}}
      if(a==="fup"){if(fu)fu.style.display="flex";if(pay)pay.style.display="none";if(cBadge){cBadge.textContent="Follow Up";cBadge.className="chipb warn";}}
      if(a==="enrol1"||a==="enrol2"){if(pay)pay.style.display="block";if(cBadge){cBadge.textContent="Enrolled";cBadge.className="chipb ok";}ach("🏆","Enrolled!","");boom(60);}
      if(a==="paidb"||a==="paida"){if(pay)pay.style.display="block";if(cBadge){cBadge.textContent="Paid";cBadge.className="chipb info";}}
      if(a==="ni"){if(pay)pay.style.display="none";if(cBadge){cBadge.textContent="Not Interested";cBadge.className="chipb al";}}
      if(a==="open"){if(pay)pay.style.display="none";if(cBadge){cBadge.textContent="Open";cBadge.className="chipb vio";}}
      // Whenever the payment section is revealed, refresh the auto quote/balances.
      if(pay&&pay.style.display==="block"){ try{ _payCalcAll(); }catch(_){} }
    }
    w.consAct = consAct;

    function payBlk(v:string){
      root.querySelectorAll(".payblk").forEach((p)=>p.classList.remove("on"));
      const m:Record<string,string>={full:"pb-full",i2:"pb-i2",emi:"pb-emi",adv:"pb-adv"};
      if(m[v]) root.querySelector("#"+m[v])?.classList.add("on");
    }
    w.payBlk = payBlk;

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
      _paySetVal("i2Total",price);
      const i2r=parseInt((root.querySelector("#i2Inst1Rcvd")as HTMLInputElement)?.value?.replace(/[^\d]/g,"")||"0")||0;
      _paySetVal("i2BalDue",price?Math.max(0,price-i2r):0);
      const advA=parseInt((root.querySelector("#advAmt")as HTMLInputElement)?.value?.replace(/[^\d]/g,"")||"0")||0;
      _paySetVal("advBalDue",price?Math.max(0,price-advA):0);
      emiBase=price||32000;
      emiCalc();
    }
    w._payCalcAll = _payCalcAll;
    function _payCalcFull(){ _payCalcAll(); }
    w._payCalcFull = _payCalcFull;
    function _payCalcI2(){
      const price=_payGetPrice();
      const rcvd=parseInt((root.querySelector("#i2Inst1Rcvd")as HTMLInputElement)?.value?.replace(/[^\d]/g,"")||"0")||0;
      _paySetVal("i2BalDue",price?Math.max(0,price-rcvd):0);
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

    function _payAttach(containerId:string){
      const fi=document.createElement("input");
      fi.type="file";fi.accept="image/*,.pdf";
      fi.onchange=async()=>{
        const file=fi.files?.[0];
        if(!file) return;
        const container=root.querySelector("#"+containerId);
        if(!container) return;
        const tag=document.createElement("span");
        tag.className="att";tag.innerHTML='<svg class="icon"><use href="#i-clip"/></svg> '+file.name;
        const addBtn=container.querySelector(".att.add");
        if(addBtn) container.insertBefore(tag,addBtn);
        toast("File attached: "+file.name);
      };
      fi.click();
    }
    w._payAttach = _payAttach;

    // Mic
    let rec=0;
    const mb=root.querySelector("#micBtn")as HTMLElement;
    if(mb) mb.onclick=()=>{rec=rec?0:1;mb.classList.toggle("rec",!!rec);const mt=root.querySelector("#micTxt");if(mt)mt.textContent=rec?"Recording…":"Start recording";if(!rec)toast("Saved");};

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
    let _scAll:any[]=[], _scFiltered:any[]=[], _scDate="today", _scOpenAppt:any=null, _scEligVal="";
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
    w._scDateF=(d:string)=>{ _scDate=d; const show=d==="cust"; ["scFrom","scTo"].forEach(id=>{const el=root.querySelector("#"+id)as HTMLElement;if(el)el.style.display=show?"inline":"none";}); root.querySelectorAll("#scrDateF .pill").forEach((b:any)=>b.classList.remove("on")); const idx={today:0,yest:1,cust:2}[d]??0; root.querySelectorAll("#scrDateF .pill")[idx]?.classList.add("on"); _scApplyDateFilter(); };
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
      const queue=f.filter((r:any)=>r.stage==="screening");
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
      const bd=root.querySelector("#scBreakdown"); if(bd) bd.innerHTML=Object.keys(bySvc).length?'<table class="tbl"><tbody>'+Object.entries(bySvc).map(([s,d])=>
        '<tr><td style="font-weight:600">'+svcIcon(s)+' '+e(s)+'</td><td class="mono" style="text-align:right">'+d.screened+' screened · '+d.waiting+' waiting</td></tr>').join("")+'</tbody></table>'
        :'<div style="text-align:center;color:var(--faint);padding:8px;font-size:12px">—</div>';
    }
    w._scOpenAssess=(id:number)=>{
      const r=_scAll.find((x:any)=>x.id===id); if(!r){toast("Not found");return;} _scOpenAppt=r;
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
      _scLoadHistory(r.lead_id);
      _scRenderAll();
    };
    w._scCloseAssess=()=>{ _scOpenAppt=null; const ap=root.querySelector("#scAssessPanel")as HTMLElement; if(ap)ap.style.display="none"; _scRenderAll(); };
    w._scElig=(val:string,btn:HTMLElement)=>{ _scEligVal=val; root.querySelectorAll("#scEligPills .pill").forEach((b:any)=>b.classList.remove("on")); btn.classList.add("on"); };
    async function _scLoadHistory(leadId:string){
      const wrap=root.querySelector("#scHistoryWrap"); if(!wrap)return;
      if(!leadId){ wrap.innerHTML='<div style="text-align:center;color:var(--faint);padding:14px;font-size:12px">No history.</div>'; return; }
      try{
        const {data}=await supabase.from("leads").select("screening_vitals").eq("meta_lead_id",leadId).limit(1);
        const sv=(data&&data[0]&&data[0].screening_vitals)||null;
        if(!sv){ wrap.innerHTML='<div style="text-align:center;color:var(--faint);padding:14px;font-size:12px">No previous screening records.</div>'; return; }
        const e=(s:any)=>String(s??"—");
        wrap.innerHTML='<table class="tbl"><thead><tr><th>Date</th><th>BMI</th><th>BP</th><th>Glucose</th><th>By</th></tr></thead><tbody>'
          +'<tr><td class="mono">'+(sv.screened_at?new Date(sv.screened_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—")+'</td><td class="mono">'+e(sv.bmi)+'</td><td class="mono">'+e(sv.bp)+'</td><td class="mono">'+e(sv.glucose)+'</td><td>'+e(sv.screened_by)+'</td></tr>'
          +'</tbody></table><p style="font-size:11px;color:var(--faint);margin:6px 0 0">Screening records from leads.screening_vitals.</p>';
      }catch(_){ wrap.innerHTML='<div style="color:var(--faint);padding:8px;font-size:12px">Could not load history.</div>'; }
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
        await supabase.from("appointments").update({stage:"screened",status:"visited",screening_vitals_data:vitals}).eq("id",_scOpenAppt.id);
      }catch(_){}
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
      const f=Array.from(p.querySelectorAll("input,select,textarea")).map((el:any)=>(el.type==="checkbox"||el.type==="radio")?{c:!!el.checked}:{v:el.value});
      const pills=Array.from(p.querySelectorAll(".pill")).map((b:any)=>b.classList.contains("on"));
      const chips=Array.from(p.querySelectorAll(".chip-o")).map((b:any)=>b.classList.contains("on"));
      return {v:1,f,pills,chips,attachments:_coachAttachments.slice()};
    }
    function applyCoachProfile(obj:any){
      const p=_coachPanelEl(); if(!p||!obj) return;
      _coachApplying=true;
      try{
        const els=Array.from(p.querySelectorAll("input,select,textarea"));
        (obj.f||[]).forEach((rec:any,i:number)=>{ const el:any=els[i]; if(!el) return; if("c" in rec) el.checked=!!rec.c; else el.value=rec.v==null?"":rec.v; });
        const pills=Array.from(p.querySelectorAll(".pill")); (obj.pills||[]).forEach((on:boolean,i:number)=>{ if(pills[i]) (pills[i]as HTMLElement).classList.toggle("on",!!on); });
        const chipEls=Array.from(p.querySelectorAll(".chip-o")); (obj.chips||[]).forEach((on:boolean,i:number)=>{ if(chipEls[i]) (chipEls[i]as HTMLElement).classList.toggle("on",!!on); });
        _coachAttachments=Array.isArray(obj.attachments)?obj.attachments.slice():[]; renderCoachAtts();
        _haBmiCalc();
        // Re-trigger panel visibility based on restored consultation status pills
        const cs=root.querySelector("#consStatus"); if(cs){ const onPill=cs.querySelector(".pill.on")as HTMLElement; if(onPill){ const act=onPill.getAttribute("onclick")||""; const m=act.match(/consAct\('([^']+)'/); if(m) consAct(m[1],onPill); } }
        // Re-trigger payment method panel visibility
        const pm=root.querySelector("#payMethod")as HTMLSelectElement; if(pm&&pm.value) payBlk(pm.value);
        _payCalcAll();
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
    }
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
      const crS=root.querySelector("#crSugar")as HTMLInputElement|null; if(crS&&lead.sugar) crS.value=lead.sugar;
      setV("haConsultDate",new Date().toISOString().slice(0,10));
      const fuNotes=root.querySelector("#fuNotes"); if(fuNotes) fuNotes.innerHTML="";
      renderCoachOpenList();
      loadAndApplyCoach(lead);
      _coachSyncAdvisorReports(lead);
      _coachSyncScreeningVitals(lead);
      _coachRenderRecordings(_coachLeadId);
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
        let res=await supabase.from("leads").select("meta_lead_id,name,phone,source,language,is_valid,sugar_poll,coach_profile,screening_vitals").not("visited_at","is",null).order("visited_at",{ascending:false}).limit(100);
        if(res.error&&/column|screening_vitals/i.test(res.error.message||"")){
          res=await supabase.from("leads").select("meta_lead_id,name,phone,source,language,is_valid,sugar_poll,coach_profile").not("visited_at","is",null).order("visited_at",{ascending:false}).limit(100) as any;
        }
        if(res.error) throw res.error;
        const data=res.data;
        const apptStages:Record<string,string>={};
        try{ const {data:appts}=await supabase.from("appointments").select("lead_id,stage,status").not("stage","is",null).limit(500); (appts||[]).forEach((a:any)=>{ if(a.lead_id) apptStages[a.lead_id]=a.stage; }); }catch(_){}
        _coachClients=(data||[]).map((r:any)=>{
          const cp=r.coach_profile; const sv=r.screening_vitals||null; const apptStage=apptStages[r.meta_lead_id]||"";
          let stage="screening";
          if(cp&&cp._stage) stage=cp._stage;
          else if(apptStage==="enrolled") stage="enrolled";
          else if(apptStage==="payment") stage="payment";
          else if(apptStage==="consultation"||apptStage==="health") stage="consultation";
          else if(cp&&cp.f&&cp.f.length>3) stage="assessment";
          else if(sv&&sv.screened_at) stage="assessment";
          return {id:r.meta_lead_id,name:r.name,phone:r.phone,source:r.source,lang:r.language,isValid:r.is_valid,sugar:r.sugar_poll||"",coachProfile:cp||null,_stage:stage};
        });
      }catch(_){ _coachClients=[]; }
      renderCoachOpenList();
    }
    let _coachView="list";
    w._coachToggleView=(v:string)=>{ _coachView=v; renderCoachOpenList(); };
    function renderCoachOpenList(){
      const el=root.querySelector("#coachOpenList")as HTMLElement|null; if(!el) return;
      const kb=root.querySelector("#coachKanban")as HTMLElement|null;
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const toggleHtml='<div class="pills" style="margin-left:auto;flex-shrink:0"><button class="pill'+(_coachView==="list"?" on":"")+'" onclick="window._coachToggleView(\'list\')">List View</button><button class="pill'+(_coachView==="kanban"?" on":"")+'" onclick="window._coachToggleView(\'kanban\')">Kanban View</button></div>';
      if(!_coachClients.length){ el.innerHTML='<div style="font-size:12px;color:var(--faint);padding:6px 0">No visited clients yet — mark a lead "Visited" in the Health Advisor to see them here.</div>'; if(kb)kb.style.display="none"; return; }
      if(_coachView==="list"){
        el.style.display="";
        el.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="font-weight:700;font-size:11px;color:var(--faint);letter-spacing:.05em">VISITED CLIENTS ('+_coachClients.length+')</div>'+toggleHtml+'</div>'
          +'<div style="display:flex;gap:8px;flex-wrap:wrap">'+_coachClients.map((c:any)=>{const active=String(c.id)===String(_coachLeadId);return '<button onclick="window._coachOpen(\''+e(String(c.id))+'\')" class="btn bsm"'+(active?' style="background:var(--brand-tint);border-color:var(--brand);color:var(--brand-600)"':'')+'>'+e(c.name||c.phone||"Client")+'</button>';}).join("")+'</div>';
        if(kb)kb.style.display="none";
      } else {
        el.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="font-weight:700;font-size:11px;color:var(--faint);letter-spacing:.05em">VISITED CLIENTS ('+_coachClients.length+')</div>'+toggleHtml+'</div>';
        el.style.display="";
        if(kb){ kb.style.display=""; _renderCoachKanban(kb); }
      }
    }
    function _renderCoachKanban(kb:HTMLElement){
      const e=(s:string)=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const cols=[
        {key:"screening",label:"Screening",color:"#E8A817",icon:"🔬",filter:(c:any)=>!c._stage||c._stage==="screening"},
        {key:"assessment",label:"Assessment",color:"#378ADD",icon:"📋",filter:(c:any)=>c._stage==="assessment"},
        {key:"consultation",label:"Consultation",color:"#7B6CD9",icon:"🩺",filter:(c:any)=>c._stage==="consultation"},
        {key:"payment",label:"Payment",color:"#17A87B",icon:"💳",filter:(c:any)=>c._stage==="payment"},
        {key:"enrolled",label:"Enrolled",color:"#0B6B4C",icon:"✅",filter:(c:any)=>c._stage==="enrolled"}
      ];
      const colors=["#17A87B","#378ADD","#7B6CD9","#C07F0E","#D8442B","#5B9BD5","#A855F7","#EF4444"];
      kb.innerHTML='<div style="display:flex;gap:12px;min-width:max-content;padding-bottom:8px">'+cols.map(col=>{
        const items=_coachClients.filter(col.filter);
        return '<div style="min-width:220px;max-width:260px;flex:1;background:var(--surface);border:1px solid var(--line);border-radius:10px;overflow:hidden">'
          +'<div style="padding:10px 12px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:6px"><span>'+col.icon+'</span><span style="font-weight:700;font-size:12px">'+col.label+'</span><span class="chipb neu" style="margin-left:auto;font-size:11px">'+items.length+'</span></div>'
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
    w._coachSaveRecord=async()=>{
      if(!_coachLeadId){ toast("Open a visited client first"); return; }
      const id=String(_coachLeadId);
      const obj=collectCoachProfile();
      saveCoachLocal(id,obj);
      const c=_coachClients.find((x:any)=>String(x.id)===id); if(c)c.coachProfile=obj;
      try{
        const {error}=await supabase.from("leads").update({coach_profile:obj}).eq("meta_lead_id",id);
        if(error){
          if(/coach_profile|column|schema|exist/i.test(error.message||"")) toast("Saved locally — run supabase-migration-coach-screening.sql for DB sync");
          else toastErr("Save failed: "+(error.message||"DB error"));
          return;
        }
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
      if(coachNav) coachNav.addEventListener("click",()=>{ loadCoachClients(); });
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
      _callDevRows=rows; const now=now0; _setDevBadges();
      if(body) body.innerHTML=rows.length?rows.map((r:any)=>'<tr>'
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
      _leadDevRows=rows; const now=Date.now(); _setDevBadges();
      if(body) body.innerHTML=rows.length?rows.map((r:any)=>{ const at=r.assigned_at||r.created_at; return '<tr>'
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
    w._btOpenDetail=(id:number)=>{
      const r=_btAll.find((x:any)=>x.id===id); if(!r){toast("Not found");return;}
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
        if(error&&/blood_test_data|column/i.test(error.message||"")){ toast("Run supabase-migration-module-columns.sql first"); return; }
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
    w._phOpenSession=(id:number)=>{
      const r=_phAll.find((x:any)=>x.id===id); if(!r){toast("Not found");return;} _phOpenAppt=r;
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
    w._phCompleteSession=async(id:number)=>{ try{ const r=_phAll.find((x:any)=>x.id===id); if(!r)return; const pd=r.phData||{}; pd.sessions_completed=(pd.sessions_completed||0)+1;
      const visit={session:pd.sessions_completed+"/"+(pd.sessions_planned||"?"),date:_recFmtDate(new Date().toISOString().substring(0,10)),pain:r.painLevel,notes:"Completed"};
      if(!pd.visits) pd.visits=[]; pd.visits.unshift(visit);
      await supabase.from("appointments").update({status:"visited",stage:"done",physio_data:pd}).eq("id",id); toast("Session completed"); await loadPhysioData();
    }catch(e:any){ toastErr("Failed: "+(e.message||"")); } };
    w._phSaveSoap=async()=>{
      if(!_phOpenAppt){toast("Open a session first");return;} const v=(id:string)=>(root.querySelector("#"+id) as HTMLInputElement|HTMLTextAreaElement)?.value||"";
      const pd=_phOpenAppt.phData||{}; pd.soap={subjective:v("phSoapS"),objective:v("phSoapO"),assessment:v("phSoapA"),plan:v("phSoapP"),rom:v("phRom"),exercises:v("phExercises")};
      pd.pain_level=Number(v("phPain"))||0; pd.sessions_completed=(pd.sessions_completed||0)+1;
      const visit={session:pd.sessions_completed+"/"+(pd.sessions_planned||"?"),date:_recFmtDate(new Date().toISOString().substring(0,10)),pain:pd.pain_level,notes:v("phSoapA").substring(0,80)};
      if(!pd.visits) pd.visits=[]; pd.visits.unshift(visit);
      try{ await supabase.from("appointments").update({stage:"done",physio_data:pd}).eq("id",_phOpenAppt.id);
        toast("Session saved & marked complete"); await loadPhysioData();
      }catch(e:any){ toastErr(/physio_data|column/i.test(e.message||"")?"Run supabase-migration-module-columns.sql first":"Save failed"); }
    };
    w._phSavePlan=async()=>{
      if(!_phOpenAppt){toast("Open a patient first");return;} const v=(id:string)=>(root.querySelector("#"+id) as HTMLInputElement)?.value||"";
      const pd=_phOpenAppt.phData||{}; pd.condition=v("phCondition"); pd.sessions_planned=Number(v("phPlanned"))||0; pd.pack_price=Number(v("phPackPrice"))||0;
      const isP=root.querySelector("#phPayModel .pill.on")?.textContent?.toLowerCase().includes("upfront"); pd.payment_model=isP?"pack":"per_visit";
      try{ await supabase.from("appointments").update({physio_data:pd}).eq("id",_phOpenAppt.id); toast("Treatment plan saved"); await loadPhysioData(); }catch(e:any){ toastErr("Save failed"); }
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
      let txH='<table class="tbl"><thead><tr><th>Date</th><th>Client</th><th>Service</th><th>Method</th><th>Gross</th><th>Subv.</th><th>Net</th><th>Status</th></tr></thead><tbody>';
      if(!allPaid.length) txH+='<tr><td colspan="8" style="text-align:center;color:var(--faint);padding:20px">No transactions yet.</td></tr>';
      else allPaid.slice(0,100).forEach((p:any)=>{
        const sub=p.emi_subvention||0; const net=(p.amount||0)-sub;
        const verChip=p.verified?'<span class="chipb ok">Verified</span>':'<span class="chipb warn">Unverified</span>';
        txH+='<tr><td class="mono">'+e(p.dateFmt)+'</td><td style="font-weight:600">'+e(p.clientName)+'</td><td>'+e(p.service)+'</td><td>'+e((p.payment_type||"full")+" · "+(p.method||""))+'</td><td class="mono">₹'+(p.amount||0).toLocaleString("en-IN")+'</td>'
          +'<td class="mono"'+(sub?'style="color:var(--alert-ink)"':'')+'>'+( sub?'−₹'+sub.toLocaleString("en-IN"):'—')+'</td><td class="mono" style="font-weight:700">₹'+net.toLocaleString("en-IN")+'</td><td>'+verChip+'</td></tr>';
      });
      txH+='</tbody></table>';
      const txEl=root.querySelector("#accTxBody"); if(txEl) txEl.innerHTML=txH;
      // Verify proofs tab
      let vH='<table class="tbl"><thead><tr><th>Client</th><th>Claimed</th><th>Mode</th><th>Ref</th><th>Proof</th><th></th></tr></thead><tbody>';
      if(!unverified.length) vH+='<tr><td colspan="6" style="text-align:center;color:var(--faint);padding:20px">All payments verified ✓</td></tr>';
      else unverified.forEach((p:any)=>{
        vH+='<tr><td style="font-weight:600">'+e(p.clientName)+'</td><td class="mono">₹'+(p.amount||0).toLocaleString("en-IN")+'</td><td>'+e(p.method||"—")+'</td><td class="mono">'+e(p.txn_ref||"—")+'</td>'
          +'<td>'+(p.proof_url?'<a href="'+e(p.proof_url)+'" target="_blank" class="btn bsm">View</a>':'—')+'</td>'
          +'<td><button class="btn bsm bp" onclick="window._accVerify('+p.id+')">Verify</button></td></tr>';
      });
      vH+='</tbody></table>';
      const vEl=root.querySelector("#accVerBody"); if(vEl) vEl.innerHTML=vH;
      // Outstanding tab
      let oH='<table class="tbl"><thead><tr><th>Client</th><th>Service</th><th>Due</th><th>Date</th><th></th></tr></thead><tbody>';
      if(!outstanding.length) oH+='<tr><td colspan="5" style="text-align:center;color:var(--faint);padding:20px">No outstanding balances ✓</td></tr>';
      else outstanding.forEach((p:any)=>{
        oH+='<tr><td style="font-weight:600">'+e(p.clientName)+'</td><td>'+e(p.service)+'</td><td class="mono">₹'+(p.amount||0).toLocaleString("en-IN")+'</td><td class="mono">'+e(p.dateFmt)+'</td>'
          +'<td><button class="btn bsm bp" onclick="window._accCollect('+p.id+',\''+e(p.clientName).replace(/'/g,"")+'\','+(p.amount||0)+',\''+e(p.lead_id||"")+'\')">Collect</button></td></tr>';
      });
      oH+='</tbody></table>';
      const oEl=root.querySelector("#accOutBody"); if(oEl) oEl.innerHTML=oH;
      // Refunds tab
      let rH='<table class="tbl"><thead><tr><th>Client</th><th>Paid</th><th>Refund</th><th>Reason</th><th>Status</th><th></th></tr></thead><tbody>';
      if(!refunds.length) rH+='<tr><td colspan="6" style="text-align:center;color:var(--faint);padding:20px">No pending refunds.</td></tr>';
      else refunds.forEach((p:any)=>{
        const sMap:{[k:string]:{l:string;c:string}}={requested:{l:"Requested",c:"warn"},abm_approved:{l:"ABM ✓",c:"info"},bm_approved:{l:"BM ✓",c:"info"}};
        const st=sMap[p.refund_status]||{l:p.refund_status,c:"neu"};
        rH+='<tr><td style="font-weight:600">'+e(p.clientName)+'</td><td class="mono">₹'+(p.amount||0).toLocaleString("en-IN")+'</td><td class="mono">₹'+(p.refund_amount||0).toLocaleString("en-IN")+'</td>'
          +'<td>'+e(p.refund_reason||"—")+'</td><td><span class="chipb '+st.c+'">'+st.l+'</span></td>'
          +'<td><button class="btn bsm bp" onclick="window._accProcessRefund('+p.id+')">Process</button></td></tr>';
      });
      rH+='</tbody></table>';
      const rEl=root.querySelector("#accRefBody"); if(rEl) rEl.innerHTML=rH;
    }
    w._accVerify=async(id:number)=>{
      try{ await supabase.from("payments").update({verified:true,verified_at:new Date().toISOString()}).eq("id",id);
        toast("Payment verified ✓"); await loadAccountsData();
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

    return () => { clearInterval(slaInterval); if(cti) clearInterval(cti); if(_metaFeedTimer) clearInterval(_metaFeedTimer); if(_csvSweepTimer) clearInterval(_csvSweepTimer); if(_metaMonitorTimer) clearInterval(_metaMonitorTimer); try{ if(w.__leadsChannel) supabase.removeChannel(w.__leadsChannel); }catch(_){} };
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
          <div style={{textAlign:"center",marginBottom:"22px"}}>
            <span className="bm" style={{display:"inline-grid",width:"48px",height:"48px",borderRadius:"14px",margin:"0 auto"}}><svg style={{width:"24px",height:"24px",stroke:"#06281F",strokeWidth:2,fill:"none"}}><use href="#i-leaf"/></svg></span>
            <h1 style={{fontFamily:"var(--disp)",fontSize:"22px",fontWeight:700,marginTop:"12px",letterSpacing:"-.3px"}}>WellnessOS</h1>
            <p style={{color:"var(--muted)",fontSize:"13px",margin:"4px 0 0"}}>Sign in to continue</p>
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
            <span className="bm"><svg><use href="#i-leaf"/></svg></span>
            <div><div className="bn">WellnessOS</div><div className="bs">Chennai · HQ</div></div>
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
