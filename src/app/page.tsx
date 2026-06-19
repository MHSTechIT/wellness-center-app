"use client";

import { useEffect, useRef } from "react";

function getMainContent(): string {
  return `
  <!-- ADVISOR -->
  <section class="screen active" id="s-advisor"><div class="wrap">
    <div class="chead">
      <span class="cav">AK</span>
      <div class="cmeta">
        <h1>Ajith Kumar</h1>
        <div class="sub"><span class="mono">+91 98●●● ●●●21</span><span>·</span><span class="mono">Lead #10318</span><span>·</span>Batch <span class="mono">WK-JUN-04</span></div>
        <div class="cbadges"><span class="chipb ok">First visit</span><span class="chipb neu">Meta · Tamil</span><span class="chipb warn">Sugar 150–250</span></div>
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
        <div class="sec-bd"><table class="tbl"><tbody>
          <tr><td style="color:var(--muted)">Visited time</td><td class="mono" style="font-weight:600">10:24 AM</td><td style="color:var(--muted)">Registration completed</td><td class="mono" style="font-weight:600">10:31 AM</td></tr>
          <tr><td style="color:var(--muted)">Service</td><td>Diabetes consultation + Blood test</td><td style="color:var(--muted)">Token</td><td class="mono">T-07</td></tr>
          <tr><td style="color:var(--muted)">Consent</td><td colspan="3"><span class="chipb ok">DPDP ✓</span> <span class="chipb ok">Health data ✓</span> <span class="chipb ok">Recording ✓</span> <span class="chipb neu">WA ✗</span></td></tr>
          <tr><td style="color:var(--muted)">Payment at desk</td><td>₹0 (free consultation)</td><td style="color:var(--muted)">Dedup check</td><td>First visit</td></tr>
        </tbody></table></div></div>
    </div>
    <div class="a-p" data-p="sales">
      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-user"/></svg> Basic info <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g4">
          <div class="fld"><label class="lbl">Name</label><input class="input" value="Ajith Kumar"></div>
          <div class="fld"><label class="lbl">Phone no</label><input class="input mono" value="+91 98000 00021"></div>
          <div class="fld"><label class="lbl">Alternate ph no <span class="nb">NEW</span></label><input class="input" placeholder="Alt number"></div>
          <div class="fld"><label class="lbl">WhatsApp no</label><input class="input mono" value="+91 98000 00021"></div>
          <div class="fld"><label class="lbl">Email</label><input class="input" placeholder="email@example.com"></div>
          <div class="fld"><label class="lbl">Gender</label><select class="select"><option>-- Select --</option><option selected>Male</option><option>Female</option><option>Other</option></select></div>
          <div class="fld"><label class="lbl">Age</label><input class="input mono" type="number" min="1" max="120" value="42" placeholder="e.g. 42"></div>
          <div class="fld"><label class="lbl">Occupation <span class="nb">NEW</span></label><select class="select" onchange="othRev(this,'occOth')"><option>-- Select --</option><option>Private Job</option><option selected>Business</option><option>Govt Job</option><option>Self-employed</option><option>Homemaker</option><option>Retired</option><option>Student</option><option>Daily Wage</option><option>Others</option></select><input class="input hideblock" id="occOth" style="margin-top:7px" placeholder="Enter occupation…"></div>
          <div class="fld"><label class="lbl">Language</label><select class="select"><option selected>Tamil</option><option>Telugu</option><option>Kannada</option><option>Malayalam</option><option>Hindi</option><option>Marathi</option><option>Bengali</option><option>Gujarati</option><option>Punjabi</option><option>Urdu</option></select></div>
          <div class="fld"><label class="lbl">Lead source</label><select class="select"><option>web</option><option selected>Meta</option><option>WhatsApp</option><option>Referral</option><option>Direct Walk-in</option></select></div>
          <div class="fld"><label class="lbl">Lead generated <span class="ab">AUTO</span></label><input class="input mono" value="12-Jun-2026 08:14" readonly></div>
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
          <div class="fld"><label class="lbl">Salesperson</label><select class="select"><option selected>Prem Kumar</option><option>Ravi S</option><option>Divya M</option><option>Karthik R</option></select></div>
          <div class="fld"><label class="lbl">Sales team</label><select class="select"><option selected>Walkin Callers Team</option><option>BDM Team</option><option>Online Team</option></select></div>
          <div class="fld"><label class="lbl">HC assigned <span class="nb">NEW</span></label><select class="select" id="hcSel"><option selected>Dr. Suresh</option><option>Dr. Priya</option><option>Dr. Anand</option><option>Dr. Latha</option></select></div>
          <div class="fld"><label class="lbl">Priority</label><div class="stars" id="stars"><span class="star on">★</span><span class="star on">★</span><span class="star">★</span></div></div>
          <div class="fld"><label class="lbl">Probability</label><div class="prob"><input type="range" min="0" max="100" value="62" oninput="document.getElementById('pv').textContent=this.value+'%'"><span class="pv" id="pv">62%</span></div></div>
          <div class="fld"><label class="lbl">Tags</label><input class="input" value="hot-lead, walk-in-jun"></div>
        </div></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-phone"/></svg> Call status <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="g2">
            <div class="fld"><label class="lbl">Call status — drives the flow</label>
              <select class="select" id="callStatus" onchange="callStatusChange(this.value)">
                <option value="new">New (Default)</option><option value="dnd">DND</option><option value="rnr">RNR</option><option value="busy">Line Busy</option><option value="cb">Call Back</option><option value="paid">Already Paid</option><option value="fu">Follow Up</option><option value="so">Switched Off</option><option value="nreg">Not Registered</option><option value="nosugar">No Sugar</option><option value="ni">Not Interested</option><option value="oos">Out of Service</option><option value="wn">Wrong Number</option><option value="afd">Appointment Fixed – Direct</option><option value="afz">Appointment Fixed – Zoom</option>
              </select></div>
            <div class="fld"><label class="lbl">Next follow-up date &amp; time</label><input class="input" type="datetime-local" value="2026-06-13T11:00"></div>
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
            <div class="fld" style="grid-column:span 2"><label class="lbl">Preview</label><textarea class="area" id="waPrev" rows="3">Vanakkam Ajith Kumar! 🙏 Welcome to our Diabetes Reversal family.</textarea></div>
          </div>
          <div style="display:flex;gap:9px;margin-top:6px"><button class="btn bsm bp" onclick="toast('WA template sent via WATI')"><svg class="icon" style="width:14px;height:14px"><use href="#i-msg"/></svg> Send via WATI</button></div>
        </div></div>

      <div class="sec hideblock" id="apptSec" style="display:none"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-cal"/></svg> Appointment — slot board <span class="chipb info" id="apptMode" style="margin-left:6px">Direct (Walk-in)</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="g4">
            <div class="fld"><label class="lbl">Date</label><input class="input" type="date" id="slotDate" value="2026-06-13" onchange="renderSlots()"></div>
            <div class="fld"><label class="lbl">HC</label><select class="select" id="apptHc"><option selected>Dr. Suresh</option><option>Dr. Priya</option><option>Dr. Anand</option><option>Dr. Latha</option></select></div>
            <div class="fld"><label class="lbl">Capacity rule</label><input class="input mono" value="Max 4 bookings / slot" readonly></div>
            <div class="fld"><label class="lbl">Appt request <span class="ab">AUTO</span></label><input class="input mono" value="12-Jun 09:02" readonly></div>
          </div>
          <div class="fld"><label class="lbl">Day view — slot occupancy</label><div class="slotgrid" id="slotGrid"></div></div>
          <div class="banner plan hideblock" id="reschBanner" style="display:none"><svg class="icon" style="width:16px;height:16px"><use href="#i-repeat"/></svg> <span>Reschedule mode — pick new slot.</span></div>
          <div style="display:flex;gap:9px;margin-top:13px"><button class="btn bp" id="bookBtn" onclick="bookSlot()"><svg class="icon"><use href="#i-check"/></svg> Book Ajith into selected slot</button><button class="btn hideblock" id="reschBtn" style="display:none" onclick="startResch()"><svg class="icon"><use href="#i-repeat"/></svg> Reschedule</button></div>
        </div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-check"/></svg> Visited status <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g3">
          <div class="fld"><label class="lbl">Visited status</label><div class="pills"><button class="pill p-vio on">Open</button><button class="pill p-ok" onclick="visitedFx()">Visited</button></div></div>
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
        <div class="sec-bd"><div class="fld"><textarea class="area" rows="2">mar16: did not enquiry</textarea></div></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-clock"/></svg> Activity log <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="timeline" id="actLog" style="margin-top:12px">
          <div class="tl"><div class="t">WhatsApp template sent</div><div class="m">12-Jun 09:05 · Prem Kumar</div></div>
          <div class="tl"><div class="t">Call · no answer · 0:00</div><div class="m">12-Jun 08:58 · Prem Kumar</div></div>
          <div class="tl"><div class="t">Assigned to Prem Kumar</div><div class="m">12-Jun 08:21 · ABM</div></div>
          <div class="tl"><div class="t">Lead captured · Meta</div><div class="m">12-Jun 08:14 · system</div></div>
        </div></div></div>

      <div style="display:flex;gap:10px;margin-top:18px"><button class="btn bp" style="height:45px;padding:0 22px" onclick="toast('Lead record saved')">Save lead record</button></div>
    </div>
    <div class="a-p" data-p="health" style="display:none">
      <div class="banner plan" style="margin-top:16px"><svg class="icon" style="width:15px;height:15px"><use href="#i-doc"/></svg> <span><b>View only.</b> This clinical record is owned by the Health coach — advisors can read everything but edit nothing. Every view is audit-logged.</span></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-stetho"/></svg> Consultation &amp; program <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><table class="tbl"><tbody>
          <tr><td style="color:var(--muted)">Consultation status</td><td><span class="chipb ok">Will Join Immediately</span></td><td style="color:var(--muted)">Attended by</td><td style="font-weight:600">Dr. Suresh</td></tr>
          <tr><td style="color:var(--muted)">Consultation date</td><td class="mono">13-Jun-2026</td><td style="color:var(--muted)">Recording</td><td><span class="chipb ok">Done</span></td></tr>
          <tr><td style="color:var(--muted)">Program suggested</td><td style="font-weight:600">L2 — 6-month reversal</td><td style="color:var(--muted)">Quoted price</td><td class="mono" style="font-weight:700">₹29,000</td></tr>
          <tr><td style="color:var(--muted)">Expectations</td><td colspan="3">HbA1c 8.4 → below 7 in 3 months; morning walks; diet plan</td></tr>
        </tbody></table></div></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-heart"/></svg> Assessment snapshot <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><table class="tbl"><tbody>
          <tr><td style="color:var(--muted)">BMI</td><td class="mono">29.1</td><td style="color:var(--muted)">BP / Pulse</td><td class="mono">130/85 · 78</td><td style="color:var(--muted)">Duration</td><td>3–5 yrs</td></tr>
          <tr><td style="color:var(--muted)">Symptoms</td><td colspan="3">Frequent urination, excessive thirst, fatigue</td><td style="color:var(--muted)">Family history</td><td>Father</td></tr>
        </tbody></table></div></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-wallet"/></svg> Payment summary <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><table class="tbl"><tbody>
          <tr><td style="color:var(--muted)">Method</td><td>Full · UPI</td><td style="color:var(--muted)">Amount</td><td class="mono" style="font-weight:700">₹29,000</td><td style="color:var(--muted)">Status</td><td><span class="chipb warn">Pending verification</span></td></tr>
        </tbody></table></div></div>
    </div>
    <div class="a-p" data-p="pay" style="display:none"><div class="stub">Payment history — read-only ledger (gross / fee / net).</div></div>
    <div class="a-p" data-p="notes" style="display:none"><div class="stub">Internal notes — team-only thread.</div></div>
    <div class="a-p" data-p="extra" style="display:none"><div class="stub">Extra info — admin-configured custom fields.</div></div>
    <div class="a-p" data-p="calls" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-phone"/></svg> Call logs — synced from Tata Tele <span class="chipb ok" style="margin-left:auto">Auto-captured</span></div>
        <div class="sec-bd"><table class="tbl"><thead><tr><th>Date · time</th><th>Direction</th><th>Duration</th><th>Outcome</th><th>Recording</th><th>Note</th></tr></thead><tbody>
          <tr><td class="mono">12-Jun 09:14</td><td><span class="chipb info">Outgoing</span></td><td class="mono">4:32</td><td><span class="chipb ok">Connected · Appt fixed</span></td><td><button class="btn bsm">▶ Play</button></td><td>Confirmed walk-in with wife</td></tr>
          <tr><td class="mono">12-Jun 08:58</td><td><span class="chipb info">Outgoing</span></td><td class="mono">0:00</td><td><span class="chipb warn">RNR</span></td><td>—</td><td>—</td></tr>
          <tr><td class="mono">12-Jun 08:31</td><td><span class="chipb vio">Incoming</span></td><td class="mono">1:05</td><td><span class="chipb ok">Connected</span></td><td><button class="btn bsm">▶ Play</button></td><td>Asked about centre location</td></tr>
          <tr><td class="mono">11-Jun 18:40</td><td><span class="chipb info">Outgoing</span></td><td class="mono">0:00</td><td><span class="chipb al">Switched Off</span></td><td>—</td><td>—</td></tr>
        </tbody></table>
        <p style="font-size:11.5px;color:var(--faint);margin:10px 0 0">Calls made from the office landline (outside the system) won't appear here — flagged risk OD-17.</p></div></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-clock"/></svg> History of activity</div>
        <div class="sec-bd"><div class="timeline" style="margin-top:12px">
          <div class="tl"><div class="t">WA template "Appointment confirmation" sent</div><div class="m">12-Jun 09:16 · auto</div></div>
          <div class="tl"><div class="t">Slot booked 10:30 AM · Dr. Suresh</div><div class="m">12-Jun 09:15 · Prem Kumar</div></div>
          <div class="tl"><div class="t">Call status → Appointment Fixed – Direct</div><div class="m">12-Jun 09:14 · Prem Kumar</div></div>
          <div class="tl"><div class="t">Lead captured · Meta</div><div class="m">12-Jun 08:14 · system</div></div>
        </div></div></div>
    </div>
  </div></section>

  <!-- COACH -->
  <section class="screen" id="s-coach"><div class="wrap">
    <div class="chead">
      <span class="cav" style="background:linear-gradient(135deg,#378ADD,#185FA5)">AK</span>
      <div class="cmeta"><h1>Ajith Kumar</h1>
        <div class="sub"><span class="mono">Client #C-2088</span><span>·</span>HC: Dr. Suresh <span class="ab">AUTO</span></div>
        <div class="cbadges"><span class="chipb warn">HbA1c 8.4%</span><span class="chipb neu">Appt 13 Jun · 10:30</span><span class="chipb ok">Visited</span></div></div>
      <div class="cacts"><span class="chipb vio" id="coachBadge" style="height:30px">Status: Open</span><button class="btn bp"><svg class="icon"><use href="#i-phone"/></svg> Call</button><button class="btn bwa"><svg class="icon"><use href="#i-msg"/></svg> WA</button></div>
    </div>
    <div class="rtabs" id="cTabs">
      <button data-t="recep2">Walk-in Receptionist</button><button data-t="sales2">Walk-in Sales</button><button class="on" data-t="health2">Walk-in Health</button>
      <button data-t="pay2">Payment History</button><button data-t="notes2">Internal Notes</button>
      <button data-t="extra2">Extra Info</button><button data-t="calls2">Call History <span class="mini">6</span></button>
    </div>
    <div class="c-p" data-p="health2">

      <div class="sec closed"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-user"/></svg> Lead recap &amp; walk-in <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g4">
          <div class="fld"><label class="lbl">Sugar level</label><input class="input" value="150–250" readonly></div>
          <div class="fld"><label class="lbl">Fasting / PP</label><input class="input mono" value="162 / 231" readonly></div>
          <div class="fld"><label class="lbl">HbA1c (%)</label><input class="input mono" value="8.4" readonly></div>
          <div class="fld"><label class="lbl">Walk-in status</label><select class="select"><option>Open</option><option selected>Visited</option><option>Not Visited</option><option>Rescheduled</option></select></div>
          <div class="fld fw"><label class="lbl">Blood reports — from Health advisor <span class="ab">SYNCED</span></label>
            <div class="atts" id="coachAtts"><span class="att"><svg class="icon"><use href="#i-clip"/></svg> sugar_report_may26.pdf · advisor</span></div></div>
          <div class="fld fw"><label class="lbl">Remarks</label><textarea class="area" rows="2">mar16: did not enquiry</textarea></div>
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
            <div class="fld fw"><label class="lbl">Chief complaint</label><input class="input" value="High sugar 3 yrs, fatigue"></div>
            <div class="fld"><label class="lbl">Duration of diabetes</label><select class="select"><option>Newly Diagnosed</option><option>1–3 yrs</option><option selected>3–5 yrs</option><option>5–10 yrs</option><option>10+ yrs</option></select></div>
            <div class="fld"><label class="lbl">Family history</label><select class="select"><option>None</option><option selected>Father</option><option>Mother</option><option>Both Parents</option><option>Sibling</option></select></div>
            <div class="fld"><label class="lbl">Height (cm)</label><input class="input mono" value="168"></div>
            <div class="fld"><label class="lbl">Weight (kg)</label><input class="input mono" value="82"></div>
            <div class="fld"><label class="lbl">BMI <span class="ab">AUTO</span></label><input class="input mono" value="29.1" readonly></div>
            <div class="fld"><label class="lbl">BP</label><input class="input mono" value="130/85"></div>
            <div class="fld"><label class="lbl">Pulse</label><input class="input mono" value="78 bpm"></div>
            <div class="fld"><label class="lbl">Temp</label><input class="input mono" value="98.6°F"></div></div></div>
          <div class="aud" style="background:#fff"><div class="ahd">Lifestyle &amp; diet</div><div class="g4">
            <div class="fld"><label class="lbl">Diet type</label><select class="select"><option>Vegetarian</option><option selected>Non-Vegetarian</option><option>Vegan</option><option>Eggetarian</option></select></div>
            <div class="fld"><label class="lbl">Physical activity</label><select class="select"><option selected>Sedentary</option><option>Light</option><option>Moderate</option><option>Active</option></select></div>
            <div class="fld"><label class="lbl">Sleep</label><select class="select"><option>&lt;5</option><option selected>5–6 hrs</option><option>6–7</option><option>7–8</option><option>8+</option></select></div>
            <div class="fld"><label class="lbl">Water (L/day)</label><select class="select"><option>&lt;1L</option><option selected>1–2L</option><option>2–3L</option><option>3L+</option></select></div>
            <div class="fld"><label class="lbl">Smoking</label><select class="select"><option selected>Never</option><option>Occasional</option><option>Regular</option><option>Quit</option></select></div>
            <div class="fld"><label class="lbl">Alcohol</label><select class="select"><option>Never</option><option selected>Occasional</option><option>Regular</option><option>Quit</option></select></div></div></div>
          <div class="aud" style="background:#fff"><div class="ahd">Symptoms reported</div>
            <div class="chips" data-oth="syOth"><button class="chip-o on">Frequent Urination</button><button class="chip-o on">Excessive Thirst</button><button class="chip-o on">Fatigue</button><button class="chip-o">Blurred Vision</button><button class="chip-o">Tingling/Numbness</button><button class="chip-o">Slow Healing Wounds</button><button class="chip-o">Weight Loss</button><button class="chip-o">Headache</button><button class="chip-o" data-others="1">Others</button></div>
            <input class="input hideblock" id="syOth" style="margin-top:8px;max-width:360px" placeholder="Enter details…"></div>
          <div class="fld"><label class="lbl">Doctor / consultant notes</label><textarea class="area">Motivated; mild BP; sedentary job. Good L2 candidate.</textarea></div>
          <button class="btn bp" style="margin-top:12px" onclick="toast('Health assessment saved')">Save health assessment</button>
        </div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-stetho"/></svg> Consultation status &amp; program <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="g4">
            <div class="fld"><label class="lbl">Attended by (HC)</label><input class="input" value="Dr. Suresh" readonly></div>
            <div class="fld"><label class="lbl">Consultation date</label><input class="input" type="date" value="2026-06-13"></div>
            <div class="fld"><label class="lbl">Next review date</label><input class="input" type="date"></div>
            <div class="fld"><label class="lbl">Recording status</label><div class="pills"><button class="pill p-vio on">Open</button><button class="pill p-ok">Done</button><button class="pill p-al">Not Done</button></div></div>
          </div>
          <div class="mic"><button class="micb" id="micBtn"><svg class="icon" style="width:19px;height:19px"><use href="#i-mic"/></svg></button>
            <div style="flex:1"><b style="font-size:13px" id="micTxt">Start recording</b><div style="font-size:11.5px;color:var(--muted)">Consent captured at reception · Zoom link field for online</div></div>
            <input class="input" style="max-width:260px" placeholder="https://zoom.us/rec/…"></div>

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
              <div><label class="lbl" style="color:var(--vio-ink)">Owner</label><select class="select" style="height:36px"><option selected>Dr. Suresh (HC)</option><option>Prem Kumar (HA)</option></select></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Blocker</label><select class="select" style="height:36px"><option>Budget / salary date</option><option>Family discussion</option><option>Travel</option><option>Comparing options</option></select></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Hold offer till</label><input class="input" style="height:36px" type="date"></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Reminder before <span class="nb">NEW</span></label><select class="select" style="height:36px"><option selected>15 min before</option><option>30 min before</option></select></div>
              <div style="grid-column:span 3"><label class="lbl" style="color:var(--vio-ink)">If not actioned — repeat notify</label><input class="input" style="height:36px" value="Re-notify owner every 10 min × 3 → then escalate to ABM + Deviation page" readonly></div>
            </div>
            <div><label class="lbl" style="color:var(--vio-ink)">Follow-up notes — every attempt logged (clients may take 5–6 follow-ups)</label>
              <div style="display:flex;gap:8px"><input class="input" id="fuNote" style="height:36px;background:#fff" placeholder="e.g. Spoke to wife, salary on 1st — call on 2nd…"><button class="btn bsm" style="height:36px;flex:none;background:#fff" onclick="addFuNote()">Add note</button></div>
              <div id="fuNotes" style="margin-top:9px;display:flex;flex-direction:column;gap:6px">
                <div style="background:#fff;border:1px solid var(--line);border-radius:9px;padding:7px 11px;font-size:12px"><b class="mono" style="color:var(--vio-ink)">Attempt 2 · 08-Jun 17:10</b> — Asked for EMI details again; wife supportive. Wants call after salary credit.</div>
                <div style="background:#fff;border:1px solid var(--line);border-radius:9px;padding:7px 11px;font-size:12px"><b class="mono" style="color:var(--vio-ink)">Attempt 1 · 02-Jun 11:30</b> — Positive on program; blocker is school-fee month. Hold offer requested.</div>
              </div></div>
            <div style="font-size:11.5px;font-weight:500">Auto-touch plan: ① WA summary + program PDF today · ② call T+2 days · ③ WA offer-reminder T+5 · ④ call on commitment date − 1 · ⑤ missed → Deviation + ABM. Every touch logged.</div>
          </div>
          <div class="banner bad hideblock" id="refundPanel" style="display:none;flex-direction:column;align-items:stretch;gap:10px">
            <div style="display:flex;gap:9px;align-items:center"><svg class="icon" style="width:16px;height:16px"><use href="#i-coin"/></svg><b>Refund request — routes through ABM → BM → Accounts (rule-enforced)</b></div>
            <div class="g4" style="gap:10px">
              <div><label class="lbl" style="color:var(--alert-ink)">Reason *</label><select class="select" style="height:36px"><option>Medical — cannot continue</option><option>Relocation</option><option>Dissatisfied with program</option><option>Financial difficulty</option><option>Duplicate payment</option><option>Others</option></select></div>
              <div><label class="lbl" style="color:var(--alert-ink)">Paid amount <span class="ab">AUTO</span></label><input class="input mono" style="height:36px" value="₹29,000" readonly></div>
              <div><label class="lbl" style="color:var(--alert-ink)">Days since payment <span class="ab">AUTO</span></label><input class="input mono" style="height:36px" value="4 — Full refund rule" readonly></div>
              <div><label class="lbl" style="color:var(--alert-ink)">Eligible refund <span class="ab">AUTO</span></label><input class="input mono" style="height:36px" value="₹29,000" readonly></div>
            </div>
            <button class="btn bsm" style="background:#fff;align-self:flex-start" onclick="toast('Refund request submitted → ABM approval queue')">Submit refund request → ABM</button>
          </div>
          <div class="fld"><label class="lbl">Client expectations &amp; commitments</label><textarea class="area" placeholder="e.g. HbA1c 9.2 → below 7 in 3 months; morning walks; diet…"></textarea></div>
          <div class="g4" style="margin-top:3px">
            <div class="fld"><label class="lbl">Program suggested</label><select class="select"><option>L1</option><option selected>L2</option><option>L1 + L2</option></select></div>
            <div class="fld"><label class="lbl">L1 price · full only</label><select class="select"><option>₹3,999 (Standard)</option><option>₹3,500 (Offer)</option><option>Special Offer</option></select></div>
            <div class="fld"><label class="lbl">Special offer amt (₹)</label><input class="input mono"></div>
            <div class="fld"><label class="lbl">L2 price (₹)</label><input class="input mono" value="29,000"></div>
            <div class="fld" style="grid-column:span 2"><label class="lbl">Coupon code — special discount <span class="nb">NEW</span></label>
              <div style="display:flex;gap:7px"><input class="input mono" id="coupon" placeholder="e.g. FEST2000"><button class="btn" style="height:39px;flex:none" onclick="applyCoupon()">Apply</button></div>
              <div id="couponRes" style="font-size:11.5px;font-weight:600;margin-top:6px;display:flex;gap:7px;flex-wrap:wrap;align-items:center"></div></div>
            <div class="fld"><label class="lbl">Client category</label><select class="select"><option>-- Select --</option><option>VIP</option><option>Staff Relatives</option><option>Officers</option><option>Complicated</option></select></div>
            <div class="fld"><label class="lbl">Date of joining</label><input class="input" type="date"></div>
            <div class="fld"><label class="lbl">Access planned</label><input class="input" type="date"></div>
            <div class="fld"><label class="lbl">Attended by <span class="ab">AUTO</span></label><input class="input" value="Dr. Suresh" readonly></div>
          </div>
        </div></div>

      <div class="sec hideblock" id="paySec" style="display:none"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-wallet"/></svg> Payment — standard collection flow <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="steps"><div class="step on"><span class="n">1</span> Quote (auto from price master)</div><div class="step on"><span class="n">2</span> Collect — Reception desk / Razorpay link / EMI provider</div><div class="step"><span class="n">3</span> Attach proof *</div><div class="step"><span class="n">4</span> Accounts verifies vs bank</div><div class="step"><span class="n">5</span> Auto receipt + GST invoice</div></div>
          <div class="banner good" style="margin-top:10px"><svg class="icon" style="width:15px;height:15px"><use href="#i-check"/></svg> <span><b>Who collects:</b> Reception or Razorpay link — never the coach. Coach closes, Reception/link collects, Accounts verifies. Cash gets a numbered desk receipt; nothing is "received" until proof + ref are attached.</span></div>
          <div class="g3" style="margin-top:6px">
            <div class="fld"><label class="lbl">Payment method</label>
              <select class="select" id="payMethod" onchange="payBlk(this.value)"><option value="">-- Select --</option><option value="full" selected>Full Payment (1 Shot)</option><option value="i2">Installment (2×)</option><option value="emi">EMI (BFL / SaveIn)</option><option value="adv">Advance Booking</option></select></div>
            <div class="fld"><label class="lbl">Collected by</label><select class="select" id="collectedBy"><option selected>Reception desk</option><option>Razorpay link (online)</option><option>EMI provider</option></select></div>
            <div class="fld"><label class="lbl">Accounts team verification</label><div class="pills"><button class="pill p-warn on">Pending</button><button class="pill p-ok">Verified</button></div></div>
          </div>
          <div style="display:flex;gap:10px;margin-top:12px;align-items:center;flex-wrap:wrap">
            <button class="btn bsm bp" onclick="sendToReception()"><svg class="icon" style="width:14px;height:14px"><use href="#i-coin"/></svg> Send collection request to Reception</button>
            <span style="font-size:11.5px;color:var(--muted)">Appears instantly in <b>Reception → Collect payment</b> queue with client, plan &amp; amount</span>
          </div>

          <div class="payblk on" id="pb-full"><div class="pt"><svg class="icon" style="width:15px;height:15px"><use href="#i-coin"/></svg> Full payment</div>
            <div class="g4">
              <div class="fld"><label class="lbl">Amount due <span class="ab">AUTO</span></label><input class="input mono" value="₹29,000" readonly></div>
              <div class="fld"><label class="lbl">Amount received (₹)</label><input class="input mono" value="29,000"></div>
              <div class="fld"><label class="lbl">Mode</label><select class="select"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Cheque</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" placeholder="Mandatory"></div>
              <div class="fld"><label class="lbl">Actual paid date</label><input class="input" type="date"></div>
              <div class="fld fw"><label class="lbl">Payment proof — attachment * <span class="nb">NEW</span></label><div class="atts"><span class="att add" onclick="toast('Proof attached · pending Accounts verification')"><svg class="icon"><use href="#i-clip"/></svg> Attach screenshot / receipt</span></div></div>
              <div class="fld fw"><label class="lbl">Status</label><div class="pills"><button class="pill p-ok">Payment Done</button><button class="pill p-warn on">In Process</button><button class="pill">Pending</button></div></div>
            </div></div>

          <div class="payblk" id="pb-i2"><div class="pt"><svg class="icon" style="width:15px;height:15px"><use href="#i-coin"/></svg> Installment (2×) · ₹30,000 — balance never untracked</div>
            <div class="aud" style="background:#fff;margin-top:8px"><div class="ahd">Part 1 — Installment 1 (collected now)</div><div class="g4">
              <div class="fld"><label class="lbl">Total <span class="ab">AUTO</span></label><input class="input mono" value="₹30,000" readonly></div>
              <div class="fld"><label class="lbl">Inst-1 received (₹)</label><input class="input mono" placeholder="e.g. 16000"></div>
              <div class="fld"><label class="lbl">Mode</label><select class="select"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Inst-1 date</label><input class="input" type="date"></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" placeholder="Mandatory"></div>
              <div class="fld" style="grid-column:span 3"><label class="lbl">Inst-1 proof *</label><div class="atts"><span class="att add" onclick="toast('Inst-1 proof attached')"><svg class="icon"><use href="#i-clip"/></svg> Attach proof</span></div></div>
            </div></div>
            <div class="aud" style="background:#fff"><div class="ahd" style="color:var(--warn-ink)">Part 2 — Balance collection (separate fields · auto-reminders from Accounts)</div><div class="g4">
              <div class="fld"><label class="lbl">Balance due <span class="ab">AUTO</span></label><input class="input mono" value="₹14,000" readonly></div>
              <div class="fld"><label class="lbl">Balance due date *</label><input class="input" type="date"></div>
              <div class="fld"><label class="lbl">Balance received (₹)</label><input class="input mono"></div>
              <div class="fld"><label class="lbl">Mode</label><select class="select"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Balance paid date</label><input class="input" type="date"></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" placeholder="Mandatory"></div>
              <div class="fld" style="grid-column:span 2"><label class="lbl">Balance proof *</label><div class="atts"><span class="att add" onclick="toast('Balance proof attached')"><svg class="icon"><use href="#i-clip"/></svg> Attach proof</span></div></div>
            </div></div>
            <div class="fld fw"><label class="lbl">Status</label><div class="pills"><button class="pill p-info">1st Paid</button><button class="pill p-info">2nd Paid</button><button class="pill p-ok">Both Paid</button><button class="pill p-warn">In Process</button><button class="pill on">Pending</button></div></div>
            </div>

          <div class="payblk" id="pb-emi"><div class="pt"><svg class="icon" style="width:15px;height:15px"><use href="#i-coin"/></svg> EMI (BFL / SaveIn) — client pays financier; we track down payment &amp; disbursement</div>
            <div class="g4">
              <div class="fld"><label class="lbl">Provider</label><select class="select"><option selected>BFL (Bajaj Finserv)</option><option>SaveIn</option></select></div>
              <div class="fld"><label class="lbl">Eligibility (provider tool)</label><div class="pills"><button class="pill p-ok on">✓ Eligible</button><button class="pill p-al">✗ Not Eligible</button></div></div>
              <div class="fld" style="grid-column:span 2"><label class="lbl">Coupon code <span class="nb">NEW</span></label>
                <div style="display:flex;gap:7px"><input class="input mono" id="emiCoupon" placeholder="e.g. FEST2000"><button class="btn" style="height:39px;flex:none" onclick="applyCouponEmi()">Apply</button></div>
                <div id="emiCouponRes" style="font-size:11.5px;font-weight:600;margin-top:6px;display:flex;gap:7px;flex-wrap:wrap;align-items:center"></div></div>
              <div class="fld"><label class="lbl">Program cost <span class="ab">AUTO</span></label><input class="input mono" id="emiCost" value="32000" readonly></div>
              <div class="fld"><label class="lbl">Down payment (₹) — drives calculator</label><input class="input mono" id="emiDown" placeholder="e.g. 5000" oninput="emiCalc()"></div>
              <div class="fld"><label class="lbl">Financed balance <span class="ab">AUTO</span></label><input class="input mono" id="emiRemain" value="₹32,000" readonly></div>
              <div class="fld"><label class="lbl">Tenure (months) — drives calculator</label><select class="select" id="emiTenure" onchange="emiCalc()"><option value="">--</option><option>3</option><option>6</option><option>9</option><option>12</option></select></div>
              <div class="fld"><label class="lbl">EMI / month <span class="ab">AUTO calculated</span></label><input class="input mono" id="emiPer" value="—" readonly></div>
              <div class="fld"><label class="lbl">Documentation date</label><input class="input" type="date"></div>
              <div class="fld"><label class="lbl">Disbursement ETA <span class="ab">24–48h</span></label><input class="input" type="date"></div>
              <div class="fld"><label class="lbl">Net after subvention <span class="ab">AUTO</span></label><input class="input mono" id="emiNet" value="₹29,920 (−6.5%)" readonly></div>
              <div class="fld fw"><label class="lbl">Proof * — down-payment receipt + approval screen + disbursement credit</label><div class="atts"><span class="att add" onclick="toast('Down-payment proof attached')"><svg class="icon"><use href="#i-clip"/></svg> Attach down-payment proof</span><span class="att add" onclick="toast('Approval proof attached')"><svg class="icon"><use href="#i-clip"/></svg> Attach approval</span><span class="att add" onclick="toast('Disbursement proof attached')"><svg class="icon"><use href="#i-clip"/></svg> Attach credit proof</span></div></div>
              <div class="fld fw"><label class="lbl">EMI payment collection — status</label><div class="pills"><button class="pill p-vio on">Open</button><button class="pill p-ok">EMI Received</button><button class="pill p-warn">EMI Process</button></div></div>
            </div></div>

          <div class="payblk" id="pb-adv"><div class="pt"><svg class="icon" style="width:15px;height:15px"><use href="#i-coin"/></svg> Advance booking — locks the price, starts the clock</div>
            <div class="aud" style="background:#fff;margin-top:8px"><div class="ahd">Part 1 — Advance (collected now)</div><div class="g4">
              <div class="fld"><label class="lbl">Advance (₹2K–5K)</label><input class="input mono" placeholder="e.g. 2000"></div>
              <div class="fld"><label class="lbl">Mode</label><select class="select"><option>Cash</option><option selected>UPI</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Advance date</label><input class="input" type="date"></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" placeholder="Mandatory"></div>
              <div class="fld fw"><label class="lbl">Advance proof *</label><div class="atts"><span class="att add" onclick="toast('Advance proof attached')"><svg class="icon"><use href="#i-clip"/></svg> Attach proof</span></div></div>
            </div></div>
            <div class="aud" style="background:#fff"><div class="ahd" style="color:var(--warn-ink)">Part 2 — Balance collection (separate fields · auto-reminders + Outstanding queue)</div><div class="g4">
              <div class="fld"><label class="lbl">Balance due <span class="ab">AUTO</span></label><input class="input mono" value="₹27,000" readonly></div>
              <div class="fld"><label class="lbl">Balance due date *</label><input class="input" type="date"></div>
              <div class="fld"><label class="lbl">Balance received (₹)</label><input class="input mono"></div>
              <div class="fld"><label class="lbl">Mode</label><select class="select"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Balance paid date</label><input class="input" type="date"></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" placeholder="Mandatory"></div>
              <div class="fld" style="grid-column:span 2"><label class="lbl">Balance proof *</label><div class="atts"><span class="att add" onclick="toast('Balance proof attached')"><svg class="icon"><use href="#i-clip"/></svg> Attach proof</span></div></div>
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
          <div class="fld"><label class="lbl">Attended by <span class="ab">AUTO</span></label><input class="input" value="Dr. Suresh" readonly></div>
          <div class="fld" style="grid-column:span 2"><label class="lbl">Welcome kit status</label>
            <div class="pills"><button class="pill p-ok" onclick="toast('Kit issued · logged')">Given</button><button class="pill p-warn">Need to Ship</button><button class="pill p-vio on">Not Required</button></div></div>
        </div></div></div>

      <div style="display:flex;gap:10px;margin-top:18px"><button class="btn bp" style="height:45px;padding:0 22px" onclick="toast('Health record saved')">Save health record</button><button class="btn" style="height:45px" onclick="toast('Printing consultation prescription for client…')">📋 Print prescription</button></div>
    </div>
    <div class="c-p" data-p="recep2" style="display:none"><div class="banner plan" style="margin-top:16px"><svg class="icon" style="width:15px;height:15px"><use href="#i-doc"/></svg> <span><b>View only.</b> Reception record — same as advisor view.</span></div><div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-door"/></svg> Reception record <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div><div class="sec-bd"><table class="tbl"><tbody><tr><td style="color:var(--muted)">Visited</td><td class="mono">10:24</td><td style="color:var(--muted)">Registered</td><td class="mono">10:31</td><td style="color:var(--muted)">Consent</td><td><span class="chipb ok">All ✓</span></td></tr></tbody></table></div></div></div>
    <div class="c-p" data-p="sales2" style="display:none">
      <div class="banner plan" style="margin-top:16px"><svg class="icon" style="width:15px;height:15px"><use href="#i-doc"/></svg> <span><b>View only.</b> This sales record is owned by the Health advisor — coaches can read the full journey but edit nothing.</span></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Basic &amp; pipeline <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><table class="tbl"><tbody>
          <tr><td style="color:var(--muted)">Occupation</td><td>Business</td><td style="color:var(--muted)">Language</td><td>Tamil</td><td style="color:var(--muted)">Source · campaign</td><td>Meta · DR_Jun_Lookalike</td></tr>
          <tr><td style="color:var(--muted)">Location</td><td>Poonamalle</td><td style="color:var(--muted)">Salesperson</td><td style="font-weight:600">Prem Kumar</td><td style="color:var(--muted)">Priority · probability</td><td>★★☆ · <span class="mono">62%</span></td></tr>
        </tbody></table></div></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-drop"/></svg> Sugar profile &amp; eligibility <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><table class="tbl"><tbody>
          <tr><td style="color:var(--muted)">Sugar level</td><td>150–250</td><td style="color:var(--muted)">Fasting / PP</td><td class="mono">162 / 231</td><td style="color:var(--muted)">HbA1c</td><td class="mono" style="font-weight:700">8.4%</td></tr>
          <tr><td style="color:var(--muted)">Treatment</td><td>Allopathy · 3–5 yrs</td><td style="color:var(--muted)">Managing now</td><td>Medicine, Diet</td><td style="color:var(--muted)">Eligibility</td><td><span class="chipb ok">✓ Eligible — no exclusions</span></td></tr>
        </tbody></table></div></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-phone"/></svg> Call journey &amp; appointment <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><table class="tbl"><tbody>
          <tr><td style="color:var(--muted)">Call status</td><td><span class="chipb ok">Appointment Fixed – Direct</span></td><td style="color:var(--muted)">Appointment</td><td class="mono">13 Jun · 10:30 AM</td><td style="color:var(--muted)">HC</td><td style="font-weight:600">Dr. Suresh</td></tr>
          <tr><td style="color:var(--muted)">Last call note</td><td colspan="5">"Receptive; concerned about cost — explained EMI option; confirmed walk-in with wife."</td></tr>
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
      <div class="pha"><button class="btn bp" onclick="toast('Single lead form opened')">+ Add single lead</button></div></div>
    <span class="viewing"><span class="vd"></span> Viewing as ABM / Admin</span>
    <div class="metrics">
      <div class="metric g"><div class="ml">Leads today</div><div class="mv">141</div><div class="mt ok">Meta 118 · others 23</div></div>
      <div class="metric g"><div class="ml">Feed health</div><div class="mv">Live</div><div class="mt ok">last lead 2m ago</div></div>
      <div class="metric a"><div class="ml">Duplicates flagged</div><div class="mv">6</div><div class="mt warn">review pending</div></div>
      <div class="metric"><div class="ml">Unassigned</div><div class="mv">12</div></div>
    </div>
    <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-bolt"/></svg> Source connections <span class="arr">▾</span></div>
      <div class="sec-bd"><table class="tbl"><thead><tr><th>Source</th><th>Status</th><th>Today</th><th>Last lead</th><th>Mode</th></tr></thead><tbody>
        <tr><td style="font-weight:600">Meta Ads</td><td><span class="chipb ok"><span class="cd"></span> Connected</span></td><td class="mono">118</td><td class="mono">2m</td><td>Real-time webhook</td></tr>
        <tr><td style="font-weight:600">Website forms</td><td><span class="chipb ok"><span class="cd"></span> Connected</span></td><td class="mono">9</td><td class="mono">26m</td><td>Webhook</td></tr>
        <tr><td style="font-weight:600">WhatsApp (WATI)</td><td><span class="chipb ok"><span class="cd"></span> Connected</span></td><td class="mono">8</td><td class="mono">11m</td><td>API</td></tr>
        <tr><td style="font-weight:600">Google / YouTube</td><td><span class="chipb neu">Not connected</span></td><td class="mono">—</td><td class="mono">—</td><td>—</td></tr>
        <tr><td style="font-weight:600">Walk-in / Referral / Telecalling</td><td><span class="chipb info">Manual</span></td><td class="mono">6</td><td class="mono">38m</td><td>Reception / advisor form</td></tr>
      </tbody></table>
      <div class="rb" style="margin-top:12px;background:var(--alert-bg);border:1px solid var(--alert);border-radius:10px;padding:10px 14px">
        <span style="font-size:12.5px;font-weight:600;color:var(--alert-ink)">Alert: notify ABM if no Meta lead for 30 min during campaign hours</span><span class="chipb ok">Enabled</span></div></div></div>
    <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-inbox"/></svg> Live incoming feed <span class="arr">▾</span></div>
      <div class="sec-bd"><table class="tbl"><thead><tr><th></th><th>Lead</th><th>Source</th><th>Campaign</th><th>Service</th><th>Lang</th><th>Received</th><th>Dedup</th></tr></thead><tbody>
        <tr><td><input type="checkbox" style="accent-color:var(--brand)"></td><td style="font-weight:600">K. Anu</td><td><span class="tag">Meta</span></td><td class="mono" style="font-size:11.5px">DR_Jun_Lookalike</td><td>Diabetes</td><td>Tamil</td><td class="mono">2m</td><td><span class="chipb ok">New</span></td></tr>
        <tr><td><input type="checkbox" style="accent-color:var(--brand)"></td><td style="font-weight:600">R. Suresh</td><td><span class="tag">Meta</span></td><td class="mono" style="font-size:11.5px">DR_Reversal_Q2</td><td>Diabetes</td><td>Telugu</td><td class="mono">6m</td><td><span class="chipb ok">New</span></td></tr>
        <tr><td><input type="checkbox" style="accent-color:var(--brand)"></td><td style="font-weight:600">M. Vel</td><td><span class="tag">WhatsApp</span></td><td class="mono" style="font-size:11.5px">—</td><td>Diabetes</td><td>Tamil</td><td class="mono">14m</td><td><span class="chipb al">Visited 12 May</span></td></tr>
      </tbody></table>
      <div style="display:flex;gap:9px;margin-top:12px"><button class="btn bsm bp" onclick="toast('Sent to assignment pool')">Send to assignment →</button><button class="btn bsm">Mark duplicate</button></div></div></div>
    <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-clip"/></svg> Bulk CSV import — wizard <span class="arr">▾</span></div>
      <div class="sec-bd">
        <div class="steps"><div class="step on"><span class="n">✓</span> Upload</div><div class="step on"><span class="n">2</span> Map columns</div><div class="step"><span class="n">3</span> De-dupe &amp; import</div></div>
        <div class="split" style="margin-top:14px">
          <div><div class="drop"><p style="margin:4px 0 3px;font-weight:600;color:var(--ink)">meta_leads_12jun.csv</p><p style="font-size:12px;margin:0">312 rows · uploaded 09:40</p></div>
            <div class="g2" style="margin-top:13px">
              <select class="select"><option selected>full_name → Name</option></select><select class="select"><option selected>phone_number → Phone</option></select>
              <select class="select"><option selected>campaign_name → Campaign</option></select><select class="select"><option selected>ad_language → Language</option></select>
            </div></div>
          <div><div class="g2" style="gap:9px;margin-top:0"><select class="select"><option selected>Source: Meta</option></select><select class="select"><option selected>Branch: Chennai</option></select><select class="select"><option selected>Batch: WK-JUN-04</option></select><select class="select"><option selected>Service: Diabetes</option></select></div>
            <div style="background:var(--warn-bg);border:1px solid var(--warn);border-radius:10px;padding:10px 13px;margin-top:13px;font-size:12.5px;color:var(--warn-ink);font-weight:600">312 rows · 297 new · 9 dup (skip) · 6 repeat-visitor (flag)</div>
            <button class="btn bp" style="margin-top:13px;width:100%" onclick="toast('297 leads imported')">Import 297 leads</button></div>
        </div></div></div>
  </div></section>

  <!-- ABM -->
  <section class="screen" id="s-abm"><div class="wrap">
    <div class="ph"><div><h1>Assign &amp; approve</h1><p>Distribute, rescue aging leads, gate sensitive actions.</p></div></div>
    <span class="viewing"><span class="vd"></span> Viewing as Asst. branch manager</span>
    <div class="tabs" id="abmTabs"><button class="on" data-t="assign">Assignment</button><button data-t="dev">Deviation · 6</button><button data-t="appr">Approvals · 4</button><button data-t="rules">Auto-assign rules</button></div>
    <div class="abm-p" data-p="assign">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-inbox"/></svg> Unassigned pool (12)</div>
        <div class="sec-bd"><table class="tbl"><thead><tr><th></th><th>Lead</th><th>Source · lang</th><th>Sugar</th><th>Waiting</th><th>Assign to</th></tr></thead><tbody>
          <tr><td><input type="checkbox" checked style="accent-color:var(--brand)"></td><td style="font-weight:600">R. Suresh</td><td><span class="tag">Meta · Telugu</span></td><td><span class="chipb warn">150–250</span></td><td class="mono">18m</td><td><select class="select" style="height:31px;font-size:12px"><option>—</option><option>Priya K.</option><option>Vinod M.</option></select></td></tr>
          <tr><td><input type="checkbox" checked style="accent-color:var(--brand)"></td><td style="font-weight:600">F. Begum</td><td><span class="tag">Website · Tamil</span></td><td><span class="chipb neu">—</span></td><td class="mono">26m</td><td><select class="select" style="height:31px;font-size:12px"><option>—</option><option>Sana R.</option></select></td></tr>
        </tbody></table>
        <div style="display:flex;gap:9px;margin-top:12px"><button class="btn bsm bp" onclick="toast('Assigned')">Assign selected</button><button class="btn bsm" onclick="toast('Distributed round-robin')">Round-robin all →</button></div></div></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Advisor load</div>
        <div class="sec-bd"><table class="tbl"><thead><tr><th>Advisor</th><th>Active</th><th>Calls today</th><th>SLA hit</th><th>Conv 30d</th><th>Status</th></tr></thead><tbody>
          <tr><td style="font-weight:600">Priya K.</td><td class="mono">28</td><td class="mono">36/50</td><td class="mono" style="color:var(--ok-ink);font-weight:700">94%</td><td class="mono">6.0%</td><td><span class="chipb ok">Available</span></td></tr>
          <tr><td style="font-weight:600">Sana R.</td><td class="mono">39</td><td class="mono">41/50</td><td class="mono" style="color:var(--warn-ink);font-weight:700">78%</td><td class="mono">3.6%</td><td><span class="chipb warn">Near cap</span></td></tr>
        </tbody></table></div></div>
    </div>
    <div class="abm-p" data-p="dev" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-bell"/></svg> Deviation — aging &amp; untouched</div>
        <div class="sec-bd"><table class="tbl"><thead><tr><th>Lead</th><th>Owner</th><th>Stage</th><th>Past SLA</th><th></th></tr></thead><tbody>
          <tr><td style="font-weight:600">A. Khan</td><td>Sana R.</td><td>Assigned</td><td><span class="chipb al">+15m</span></td><td><button class="btn bsm">Reassign</button></td></tr>
          <tr><td style="font-weight:600">D. Rani</td><td>Priya K.</td><td>Follow-up missed</td><td><span class="chipb al">+2h</span></td><td><button class="btn bsm">Reassign</button></td></tr>
        </tbody></table>
        <button class="btn bsm bp" style="margin-top:12px" onclick="toast('Bulk-reassigned')">Bulk reassign breached →</button></div></div></div>
    <div class="abm-p" data-p="appr" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-check"/></svg> Pending approvals</div><div class="sec-bd">
        <table class="tbl"><thead><tr><th>Type</th><th>Detail</th><th>Chain</th><th></th></tr></thead><tbody>
        <tr><td><span class="chipb warn">Discount</span></td><td>₹2,000 off L2 — S. Kumar</td><td class="mono" style="font-size:11px">ABM</td><td><button class="btn bsm bp" onclick="toast('Approved')">Approve</button></td></tr>
        <tr><td><span class="chipb al">Refund</span></td><td>₹14,500 partial — D. Rao</td><td class="mono" style="font-size:11px">ABM → BM → Accounts</td><td><button class="btn bsm bp" onclick="toast('Forwarded to BM')">Approve &amp; forward</button></td></tr>
        </tbody></table>
        <div class="fld" style="max-width:320px"><label class="lbl">Delegate while away</label><select class="select"><option>— Off —</option><option>Branch manager</option></select></div></div></div></div>
    <div class="abm-p" data-p="rules" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-cog"/></svg> Auto-assign rules</div><div class="sec-bd"><div class="g3">
        <div class="fld"><label class="lbl">Mode</label><div class="pills"><button class="pill p-vio on">Manual</button><button class="pill p-info">Round-robin</button><button class="pill p-ok">Rule-based</button></div></div>
        <div class="fld"><label class="lbl">Max leads / advisor</label><input class="input mono" value="40"></div>
        <div class="fld"><label class="lbl">First-contact SLA</label><input class="input mono" value="4h 00m"></div>
      </div><button class="btn bp" style="margin-top:14px" onclick="toast('Rules saved')">Save rules</button></div></div></div>
  </div></section>

  <!-- RECEPTION -->
  <section class="screen" id="s-reception"><div style="padding:10px 14px 60px;max-width:100%">
    <div class="inbound" id="inboundBar"><span style="font-size:22px">📞</span><div><b>Incoming call — +91 98412 33007 (V. Prasad)</b><div style="font-size:12px;opacity:.85">Called earlier · likely callback from your outbound attempt</div></div><button class="btn bsm" style="background:#fff;color:var(--brand-600);margin-left:auto" onclick="hideInbound()">Dismiss</button><button class="btn bsm" style="background:#fff;color:var(--brand-600)" onclick="openDrawer(RX.find(r=>r.name==='V. Prasad'));hideInbound()">Open record</button></div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
      <div style="background:linear-gradient(135deg,#129468,var(--brand-600));color:#fff;border-radius:11px;padding:8px 14px;display:flex;align-items:center;gap:9px"><svg class="icon" style="stroke:#fff;width:18px;height:18px"><use href="#i-coin"/></svg><div><div style="font-size:9px;opacity:.8;font-weight:600;letter-spacing:.06em">REVENUE</div><div style="font-family:var(--disp);font-size:20px;font-weight:700" id="revTotal">₹0</div></div></div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:11px;padding:8px 14px;display:flex;gap:14px" id="revSvc"></div>
      <div style="margin-left:auto;display:flex;gap:7px"><button class="btn bsm" onclick="showInbound()">📞 Simulate inbound</button><button class="btn bp" onclick="nwToggle()">+ New walk-in</button></div>
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
              <div class="fld"><label class="lbl">Date</label><input class="input" type="date" style="height:34px" id="nwDate" value="2026-06-16"></div>
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
              <div class="fld"><label class="lbl">Search</label><input class="input" style="height:34px" id="ciSearch" placeholder="Phone or name"></div>
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
              <div class="g2" style="gap:8px"><div class="fld"><label class="lbl">Due</label><input class="input mono" style="height:34px" id="recWbDue" readonly></div><div class="fld"><label class="lbl">Received *</label><input class="input mono" style="height:34px" id="recWbAmt"></div><div class="fld"><label class="lbl">Mode *</label><select class="select" style="height:34px"><option>UPI</option><option>Cash</option><option>Card</option></select></div><div class="fld"><label class="lbl">Txn ref *</label><input class="input mono" style="height:34px"></div></div>
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
      <div class="pills" id="scrDateF"><button class="pill on">Today</button><button class="pill">Yesterday</button><button class="pill">Custom</button></div>
      <button class="btn" style="margin-left:auto"><svg class="icon"><use href="#i-dl"/></svg> Print</button>
    </div>
    <div class="metrics" style="margin:10px 0">
      <div class="metric"><div class="ml">Expected</div><div class="mv">14</div></div>
      <div class="metric g"><div class="ml">Screened</div><div class="mv">7</div></div>
      <div class="metric a"><div class="ml">In progress</div><div class="mv">1</div></div>
      <div class="metric"><div class="ml">Waiting</div><div class="mv">3</div></div>
      <div class="metric g"><div class="ml">Eligible for service</div><div class="mv">6</div></div>
      <div class="metric r"><div class="ml">Not eligible</div><div class="mv">1</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 310px;gap:14px">
      <div>
        <div class="sec" style="margin-top:0"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-heart"/></svg> Assessment — Ajith Kumar <span class="chipb info" style="margin-left:8px">Baseline · M0</span></div>
          <div class="sec-bd">
            <div class="g4">
              <div class="fld"><label class="lbl">Height (cm) <span class="nb">dynamic</span></label><input class="input mono" id="sc_h" value="168"></div>
              <div class="fld"><label class="lbl">Weight (kg)</label><input class="input mono" id="sc_w" value="82"></div>
              <div class="fld"><label class="lbl">BMI <span class="ab">AUTO</span></label><input class="input mono" id="sc_bmi" value="29.1" readonly></div>
              <div class="fld"><label class="lbl">BP systolic</label><input class="input mono" id="sc_bp" value="130/85"></div>
              <div class="fld"><label class="lbl">Pulse</label><input class="input mono" id="sc_pu" value="78"></div>
              <div class="fld"><label class="lbl">SpO2 (%)</label><input class="input mono" id="sc_sp" value="98"></div>
              <div class="fld"><label class="lbl">Waist (cm)</label><input class="input mono" id="sc_wa" value="96"></div>
              <div class="fld"><label class="lbl">Temperature</label><input class="input mono" id="sc_te" value="98.6°F"></div>
              <div class="fld"><label class="lbl">Desk glucose (mg/dL)</label><input class="input mono" id="sc_gl" value="186"></div>
            </div>
            <p style="font-size:11px;color:var(--faint);margin:8px 0 0">Fields are dynamic — add/remove in <b>Settings → Screening fields</b>. Prior visit data preserved as separate records.</p>
            <div class="g3" style="margin-top:6px">
              <div class="fld"><label class="lbl">Screened by <span class="ab">AUTO</span></label><input class="input" value="Lakshmi R. (screening)" readonly></div>
              <div class="fld"><label class="lbl">Screen date &amp; time <span class="ab">AUTO</span></label><input class="input mono" value="" readonly placeholder="— stamped on save"></div>
              <div class="fld"><label class="lbl">Eligible for service?</label><div class="pills"><button class="pill p-ok">✓ Yes</button><button class="pill p-al">✗ No (refer out)</button></div></div>
            </div>
            <div class="fld"><label class="lbl">Notes</label><textarea class="area"></textarea></div>
            <div class="fld"><label class="lbl">Route to Health coach</label>
              <div style="display:flex;gap:8px;align-items:center"><select class="select" style="max-width:200px"><option>Dr. Suresh (3 in queue)</option><option>Dr. Priya (1 in queue)</option><option>Dr. Anand (0 in queue)</option></select><button class="btn bsm bp" onclick="screeningDone()"><svg class="icon" style="width:14px;height:14px"><use href="#i-check"/></svg> Save &amp; send to HC</button><button class="btn bsm" onclick="toast('Printing screening report…')">🖨 Print</button></div></div>
            <div class="fld" style="margin-top:8px"><label class="lbl">Retest / rescreening</label><button class="btn bsm" onclick="toast('Rescreening opened — new record, old data preserved')">Request rescreen (new record)</button></div>
          </div></div>
        <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-clock"/></svg> Previous screenings — same client <span class="arr">▾</span></div>
          <div class="sec-bd"><table class="tbl"><thead><tr><th>Date</th><th>BMI</th><th>BP</th><th>Glucose</th><th>Eligible</th><th>By</th><th></th></tr></thead><tbody>
            <tr><td class="mono">14-Jun-2026</td><td class="mono">29.1</td><td class="mono">130/85</td><td class="mono">186</td><td><span class="chipb ok">Yes</span></td><td>Lakshmi R.</td><td><button class="btn bsm">View / print</button></td></tr>
          </tbody></table><p style="font-size:11px;color:var(--faint);margin:6px 0 0">All screening records maintained — never overwritten. Each visit = new row.</p></div></div>
      </div>
      <div>
        <div class="sec" style="margin-top:0"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Queue</div>
          <div class="sec-bd">
            <div class="li"><span class="avs" style="background:linear-gradient(135deg,#17A87B,#0B6B4C)">AK</span><div style="flex:1"><b>Ajith Kumar</b><div style="font-size:11px;color:var(--muted)">🩺 Diabetes · 10:30</div></div><span class="chipb info">In progress</span></div>
            <div class="li"><span class="avs" style="background:linear-gradient(135deg,#378ADD,#185FA5)">RK</span><div style="flex:1"><b>R. Kumar</b><div style="font-size:11px;color:var(--muted)">🩺 Diabetes · 11:15</div></div><span class="chipb neu">Queued</span></div>
            <div class="li"><span class="avs" style="background:linear-gradient(135deg,#7B6CD9,#534AB7)">MJ</span><div style="flex:1"><b>M. John</b><div style="font-size:11px;color:var(--muted)">🩸 Blood test · 11:45</div></div><span class="chipb neu">Queued</span></div>
          </div></div>
        <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-chart"/></svg> Breakdown</div>
          <div class="sec-bd"><table class="tbl"><tbody>
            <tr><td style="font-weight:600">🩺 Diabetes</td><td class="mono" style="text-align:right">5 screened · 2 waiting</td></tr>
            <tr><td style="font-weight:600">🩸 Blood test</td><td class="mono" style="text-align:right">2 screened · 1 waiting</td></tr>
            <tr><td style="font-weight:600">💪 Physio</td><td class="mono" style="text-align:right">0 screened · 0 waiting</td></tr>
          </tbody></table></div></div>
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
      <div class="pills"><button class="pill on">Today</button><button class="pill">Yesterday</button><button class="pill">This week</button><button class="pill">Custom</button></div>
      <button class="btn" style="margin-left:auto"><svg class="icon"><use href="#i-dl"/></svg> Export</button>
    </div>
    <div style="display:flex;gap:10px;margin:10px 0;flex-wrap:wrap">
      <div style="background:linear-gradient(135deg,#129468,var(--brand-600));color:#fff;border-radius:11px;padding:8px 14px;display:flex;gap:14px;align-items:center"><div><div style="font-size:9px;opacity:.7;font-weight:600">TOTAL BILLED</div><div style="font-family:var(--disp);font-size:18px;font-weight:700">₹14,400</div></div></div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:11px;padding:8px 14px;display:flex;gap:16px"><div><div style="font-size:9px;color:var(--faint);font-weight:600">THYROCARE COST</div><div class="mono" style="font-weight:700;color:var(--alert-ink)">₹7,200</div></div><div><div style="font-size:9px;color:var(--faint);font-weight:600">OUR MARGIN</div><div class="mono" style="font-weight:700;color:var(--ok-ink)">₹7,200</div></div><div><div style="font-size:9px;color:var(--faint);font-weight:600">PAID TO THYROCARE</div><div class="mono" style="font-weight:700">₹5,400</div></div></div>
    </div>
    <div class="metrics" style="margin:6px 0">
      <div class="metric"><div class="ml">Expected</div><div class="mv">11</div></div>
      <div class="metric g"><div class="ml">Visited</div><div class="mv">8</div></div>
      <div class="metric g"><div class="ml">Sample collected</div><div class="mv">6</div></div>
      <div class="metric a"><div class="ml">Waiting for sample</div><div class="mv">2</div></div>
      <div class="metric g"><div class="ml">Payment collected</div><div class="mv">6</div></div>
      <div class="metric r"><div class="ml">Not paid</div><div class="mv">2</div></div>
      <div class="metric g"><div class="ml">Report received</div><div class="mv">4</div></div>
      <div class="metric g"><div class="ml">Shared to client</div><div class="mv">3</div></div>
      <div class="metric a"><div class="ml">Retest request</div><div class="mv">1</div></div>
    </div>
    <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-drop"/></svg> Worklist — click any scorecard number to filter <span class="arr">▾</span></div>
      <div class="sec-bd"><table class="tbl"><thead><tr><th>Client</th><th>Phone</th><th>Panel</th><th>Visit #</th><th>Checkpoint</th><th>Sample</th><th>Payment</th><th>Report</th><th>Shared</th><th>Actions</th></tr></thead><tbody>
        <tr><td style="font-weight:600">Ajith Kumar</td><td class="mono">98●●●21</td><td>HbA1c · FBS</td><td class="mono">1st</td><td><span class="chipb info">M0</span></td><td><span class="chipb warn">Collected</span></td><td><span class="chipb ok">₹800 ✓</span></td><td><span class="chipb warn">Pending</span></td><td>—</td><td><div style="display:flex;gap:4px"><button class="btn bsm" onclick="toast('Upload opened')">📎 Report</button></div></td></tr>
        <tr><td style="font-weight:600">R. Banu</td><td class="mono">97●●●14</td><td>HbA1c · Thyroid</td><td class="mono">2nd</td><td><span class="chipb vio">M2</span></td><td><span class="chipb ok">Done</span></td><td><span class="chipb ok">₹1,200 ✓</span></td><td><span class="chipb ok">Ready</span></td><td><span class="chipb ok">WA ✓</span></td><td><div style="display:flex;gap:4px"><button class="btn bsm" onclick="toast('Report PDF downloaded')">⬇</button><button class="btn bsm" onclick="toast('Printing…')">🖨</button><button class="btn bsm" onclick="toast('Shared via WhatsApp')">WA</button></div></td></tr>
        <tr><td style="font-weight:600">K. Mani</td><td class="mono">98●●●41</td><td>HbA1c</td><td class="mono">3rd</td><td><span class="chipb vio">M4</span></td><td><span class="chipb al">Overdue 52h</span></td><td><span class="chipb al">Not paid</span></td><td>—</td><td>—</td><td><div style="display:flex;gap:4px"><button class="btn bsm" onclick="toast('Chased Thyrocare')">Chase</button><button class="btn bsm bp" onclick="recOpen('K. Mani','bt','600')">Collect</button></div></td></tr>
        <tr><td style="font-weight:600">New walk-in</td><td class="mono">—</td><td colspan="8" style="text-align:center"><button class="btn bp" onclick="toast('New blood test client — adding to system')">+ Add client &amp; order test</button> <span style="font-size:11.5px;color:var(--muted)">New clients get added to database + discount/coupon option</span></td></tr>
      </tbody></table></div></div>
    <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-bell"/></svg> Outcome reminders (auto) <span class="arr">▾</span></div>
      <div class="sec-bd"><table class="tbl"><thead><tr><th>Client</th><th>Due</th><th>Date</th><th>Reminder</th><th></th></tr></thead><tbody>
        <tr><td style="font-weight:600">P. Selvam</td><td><span class="chipb vio">M2</span></td><td class="mono">15 Jun</td><td><span class="chipb ok">WA sent</span></td><td><button class="btn bsm">Book slot</button></td></tr>
        <tr><td style="font-weight:600">L. Banu</td><td><span class="chipb vio">M6</span></td><td class="mono">18 Jun</td><td><span class="chipb warn">Due</span></td><td><button class="btn bsm" onclick="toast('WA sent')">Send WA</button></td></tr>
      </tbody></table></div></div>
  </div></section>

  <!-- PHYSIO -->
  <section class="screen" id="s-physio"><div class="wrap" style="max-width:1280px;padding:16px 20px 60px">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <h1 style="font-family:var(--disp);font-size:22px;font-weight:700">💪 Physiotherapy</h1>
      <div class="pills"><button class="pill on">Today</button><button class="pill">This week</button><button class="pill">Custom</button></div>
      <span style="font-size:10px;color:var(--faint);font-weight:600;letter-spacing:.08em;text-transform:uppercase">Revenue today</span>
      <span style="font-family:var(--disp);font-weight:700;font-size:18px;color:var(--brand-600)">₹46,400</span>
      <button class="btn" style="margin-left:auto"><svg class="icon"><use href="#i-dl"/></svg> Export</button>
    </div>
    <div class="metrics" style="margin:10px 0">
      <div class="metric"><div class="ml">Patients today</div><div class="mv">5</div></div>
      <div class="metric g"><div class="ml">Sessions done</div><div class="mv">3</div></div>
      <div class="metric"><div class="ml">Pending</div><div class="mv">2</div></div>
      <div class="metric g"><div class="ml">Active treatment plans</div><div class="mv">18</div></div>
      <div class="metric a"><div class="ml">Expiring this week</div><div class="mv">3</div></div>
      <div class="metric g"><div class="ml">Paid upfront</div><div class="mv">12</div></div>
      <div class="metric a"><div class="ml">Per-session (need payment)</div><div class="mv">6</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 340px;gap:14px">
      <div>
        <div class="sec" style="margin-top:0"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-cal"/></svg> Today's sessions</div>
          <div class="sec-bd"><table class="tbl"><thead><tr><th>Time</th><th>Patient</th><th>Condition</th><th>Session</th><th>Payment</th><th>Status</th><th></th></tr></thead><tbody>
            <tr><td class="mono">9:30</td><td style="font-weight:600">V. Ram</td><td>Frozen shoulder</td><td><span class="chipb info">2 / 10</span></td><td><span class="chipb ok">Pack · ₹8,000 ✓</span></td><td><span class="chipb ok">Done</span></td><td><div style="display:flex;gap:4px"><button class="btn bsm" onclick="toast('SOAP note opened')">Notes</button><button class="btn bsm" onclick="toast('Calling V. Ram…')">📞</button><button class="btn bsm" onclick="openDrawer('V. Ram')">Details</button></div></td></tr>
            <tr><td class="mono">10:00</td><td style="font-weight:600">L. Priya</td><td>Knee rehab (post-op)</td><td><span class="chipb info">5 / 12</span></td><td><span class="chipb ok">Pack · ₹14,400 ✓</span></td><td><span class="chipb ok">Done</span></td><td><button class="btn bsm">Notes</button></td></tr>
            <tr><td class="mono">11:00</td><td style="font-weight:600">P. Ravi</td><td>Lower back pain</td><td><span class="chipb warn">3 / 8</span></td><td><span class="chipb ok">Pack · ₹6,400 ✓</span></td><td><span class="chipb info">In session</span></td><td><button class="btn bsm bp">Complete</button></td></tr>
            <tr><td class="mono">11:30</td><td style="font-weight:600">M. Lakshmi</td><td>Cervical spondylosis</td><td><span class="chipb warn">1 / 6</span></td><td><span class="chipb warn">Per-visit · ₹800 due</span></td><td><span class="chipb neu">Waiting</span></td><td><button class="btn bsm bp" onclick="toast('Session started')">Start</button></td></tr>
            <tr><td class="mono">12:00</td><td style="font-weight:600">S. Anbu</td><td>Sports injury</td><td><span class="chipb warn">1 / 8</span></td><td><span class="chipb warn">Per-visit · ₹1,000 due</span></td><td><span class="chipb warn">Expected</span></td><td><button class="btn bsm" onclick="toast('Calling…')">📞 Call</button></td></tr>
          </tbody></table></div></div>
        <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-doc"/></svg> Session record — P. Ravi · Session 3 / 8 <span class="arr">▾</span></div>
          <div class="sec-bd">
            <div class="g2">
              <div class="fld"><label class="lbl">Subjective (patient says)</label><textarea class="area" placeholder="Pain level 4/10, better since last session…"></textarea></div>
              <div class="fld"><label class="lbl">Objective (therapist observes)</label><textarea class="area" placeholder="ROM improved 15°, swelling reduced…"></textarea></div>
              <div class="fld"><label class="lbl">Assessment</label><textarea class="area" placeholder="Progressing well, add resistance band exercises…"></textarea></div>
              <div class="fld"><label class="lbl">Plan (next session)</label><textarea class="area" placeholder="Increase reps, introduce core stability…"></textarea></div>
            </div>
            <div class="g4" style="margin-top:6px">
              <div class="fld"><label class="lbl">Pain (0–10)</label><input class="input mono" value="4" style="max-width:80px"></div>
              <div class="fld"><label class="lbl">ROM improvement</label><input class="input" placeholder="e.g. +15°"></div>
              <div class="fld"><label class="lbl">Exercises prescribed</label><input class="input" placeholder="e.g. stretches, resistance band"></div>
              <div class="fld"><label class="lbl">Next session</label><input class="input" type="date"></div>
            </div>
            <div style="display:flex;gap:8px;margin-top:12px"><button class="btn bp" onclick="toast('Session 3 saved · visit marked · 5 remaining')"><svg class="icon"><use href="#i-check"/></svg> Save &amp; mark complete</button><button class="btn" onclick="toast('Printing session note…')">🖨 Print notes</button><button class="btn" onclick="toast('Printing prescription for client…')">📋 Print prescription</button></div>
          </div></div>
        <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-heart"/></svg> Treatment plan — P. Ravi <span class="arr">▾</span></div>
          <div class="sec-bd">
            <div class="g4">
              <div class="fld"><label class="lbl">Condition</label><input class="input" value="Lower back pain (L4-L5)"></div>
              <div class="fld"><label class="lbl">Sessions planned</label><input class="input mono" value="8"></div>
              <div class="fld"><label class="lbl">Sessions completed</label><input class="input mono" value="3" readonly></div>
              <div class="fld"><label class="lbl">Remaining</label><input class="input mono" value="5" readonly></div>
              <div class="fld"><label class="lbl">Payment model</label><div class="pills"><button class="pill p-ok on">Upfront pack</button><button class="pill">Per visit</button></div></div>
              <div class="fld"><label class="lbl">Pack price <span class="ab">from Settings</span></label><input class="input mono" value="₹6,400" readonly></div>
              <div class="fld"><label class="lbl">Paid</label><span class="chipb ok" style="margin-top:6px;display:inline-block">₹6,400 · Prepaid ✓</span></div>
              <div class="fld"><label class="lbl">Extend sessions?</label><button class="btn bsm" onclick="toast('Extension: +4 sessions added · ₹3,200 due · sent to reception')">+ Extend (add sessions)</button></div>
            </div>
            <div class="fld fw"><label class="lbl">Visit history</label>
              <table class="tbl"><thead><tr><th>Session</th><th>Date</th><th>Pain</th><th>Notes</th><th>Payment</th></tr></thead><tbody>
                <tr><td class="mono">3 / 8</td><td class="mono">14-Jun</td><td class="mono">4/10</td><td>In progress</td><td><span class="chipb ok">Prepaid</span></td></tr>
                <tr><td class="mono">2 / 8</td><td class="mono">11-Jun</td><td class="mono">5/10</td><td>ROM improved, added resistance</td><td><span class="chipb ok">Prepaid</span></td></tr>
                <tr><td class="mono">1 / 8</td><td class="mono">08-Jun</td><td class="mono">7/10</td><td>Initial assessment, heat therapy</td><td><span class="chipb ok">Prepaid</span></td></tr>
              </tbody></table></div>
          </div></div>
      </div>
      <div>
        <div class="sec" style="margin-top:0"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Active patients (18)</div>
          <div class="sec-bd">
            <div class="li"><span class="avs" style="background:#17A87B">VR</span><div style="flex:1"><b>V. Ram</b><div style="font-size:10.5px;color:var(--muted)">Frozen shoulder · 2/10 · Pack ✓</div></div></div>
            <div class="li"><span class="avs" style="background:#378ADD">LP</span><div style="flex:1"><b>L. Priya</b><div style="font-size:10.5px;color:var(--muted)">Knee rehab · 5/12 · Pack ✓</div></div></div>
            <div class="li"><span class="avs" style="background:#7B6CD9">PR</span><div style="flex:1"><b>P. Ravi</b><div style="font-size:10.5px;color:var(--muted)">Lower back · 3/8 · Pack ✓</div></div><span class="chipb info">Now</span></div>
            <div class="li"><span class="avs" style="background:#C07F0E">ML</span><div style="flex:1"><b>M. Lakshmi</b><div style="font-size:10.5px;color:var(--muted)">Cervical · 1/6 · Per-visit</div></div><span class="chipb warn">Due ₹800</span></div>
            <div class="li"><span class="avs" style="background:#D8442B">SA</span><div style="flex:1"><b>S. Anbu</b><div style="font-size:10.5px;color:var(--muted)">Sports injury · 1/8 · Per-visit</div></div><span class="chipb warn">Due ₹1,000</span></div>
          </div></div>
        <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-coin"/></svg> Pricing <span class="ab">from Settings</span></div>
          <div class="sec-bd"><table class="tbl"><tbody>
            <tr><td>Consultation</td><td class="mono" style="text-align:right;font-weight:700">₹500</td></tr>
            <tr><td>Per session</td><td class="mono" style="text-align:right;font-weight:700">₹800–1,200</td></tr>
            <tr><td>6-session pack</td><td class="mono" style="text-align:right;font-weight:700">₹4,200</td></tr>
            <tr><td>8-session pack</td><td class="mono" style="text-align:right;font-weight:700">₹6,400</td></tr>
            <tr><td>12-session pack</td><td class="mono" style="text-align:right;font-weight:700">₹10,800</td></tr>
            <tr><td>Equipment rental</td><td class="mono" style="text-align:right;font-weight:700">per item</td></tr>
          </tbody></table><p style="font-size:11px;color:var(--faint);margin-top:6px">All prices configurable in Settings → Service pricing</p></div></div>
      </div>
    </div>
  </div></section>

  <!-- ACCOUNTS -->
  <section class="screen" id="s-accounts"><div class="wrap">
    <div class="ph"><div><h1>Accounts &amp; finance</h1><p>Gross vs net always two numbers. Verification closes the loop.</p></div>
      <div class="pha"><button class="btn"><svg class="icon"><use href="#i-dl"/></svg> Export Excel</button></div></div>
    <span class="viewing"><span class="vd"></span> Viewing as Accounts</span>
    <div class="metrics">
      <div class="metric g"><div class="ml">Collected today</div><div class="mv">₹3.4L</div></div>
      <div class="metric a"><div class="ml">Pending verification</div><div class="mv">4</div><div class="mt warn">proofs to verify</div></div>
      <div class="metric a"><div class="ml">Outstanding</div><div class="mv">₹86K</div></div>
      <div class="metric r"><div class="ml">Refunds pending</div><div class="mv">2</div></div>
      <div class="metric"><div class="ml">EMI subvention</div><div class="mv">₹11.2K</div></div>
    </div>
    <div class="tabs" id="accTabs"><button class="on" data-t="tx">Transactions</button><button data-t="ver">Verify proofs · 4</button><button data-t="out">Outstanding · 14</button><button data-t="ref">Refunds · 2</button></div>
    <div class="acc-p" data-p="tx">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-wallet"/></svg> Transactions</div>
        <div class="sec-bd"><table class="tbl"><thead><tr><th>Date</th><th>Client</th><th>Method</th><th>Gross</th><th>Fee/subv.</th><th>Net</th><th>GST inv.</th><th>Status</th></tr></thead><tbody>
          <tr><td class="mono">12 Jun</td><td style="font-weight:600">S. Devi</td><td>Full · UPI</td><td class="mono">₹29,000</td><td class="mono">—</td><td class="mono" style="font-weight:700">₹29,000</td><td><button class="btn bsm" onclick="toast('GST PDF sent on WA')">PDF</button></td><td><span class="chipb ok">Verified</span></td></tr>
          <tr><td class="mono">12 Jun</td><td style="font-weight:600">A. Raman</td><td>EMI · BFL</td><td class="mono">₹32,000</td><td class="mono" style="color:var(--alert-ink)">−₹2,080</td><td class="mono" style="font-weight:700">₹29,920</td><td><button class="btn bsm">PDF</button></td><td><span class="chipb ok">Settled</span></td></tr>
          <tr><td class="mono">11 Jun</td><td style="font-weight:600">M. Latha</td><td>Inst 2×</td><td class="mono">₹30,000</td><td class="mono">—</td><td class="mono" style="font-weight:700">₹15,000</td><td><button class="btn bsm">PDF</button></td><td><span class="chipb warn">₹15K due</span></td></tr>
        </tbody></table></div></div></div>
    <div class="acc-p" data-p="ver" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-check"/></svg> Proof verification — nothing counts as received until verified</div>
        <div class="sec-bd"><table class="tbl"><thead><tr><th>Client</th><th>Claimed</th><th>Mode</th><th>Ref</th><th>Proof</th><th></th></tr></thead><tbody>
          <tr><td style="font-weight:600">Ajith Kumar</td><td class="mono">₹29,000</td><td>UPI</td><td class="mono">UTR…4821</td><td><button class="btn bsm">View</button></td><td><button class="btn bsm bp" onclick="toast('Verified vs bank · receipt issued')">Verify vs bank</button></td></tr>
          <tr><td style="font-weight:600">D. Kumar</td><td class="mono">₹2,000</td><td>Cash · receipt #117</td><td class="mono">—</td><td><button class="btn bsm">View</button></td><td><button class="btn bsm bp">Verify</button></td></tr>
        </tbody></table></div></div></div>
    <div class="acc-p" data-p="out" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-bell"/></svg> Outstanding — balance chasing lives here (moved off coach screen)</div>
        <div class="sec-bd"><table class="tbl"><thead><tr><th>Client</th><th>Type</th><th>Due</th><th>Date</th><th>Reminder</th><th></th></tr></thead><tbody>
          <tr><td style="font-weight:600">M. Latha</td><td>Inst 2 of 2</td><td class="mono">₹15,000</td><td class="mono">20 Jun</td><td><span class="chipb ok">Auto-WA</span></td><td><button class="btn bsm bp" onclick="toast('Pay link sent')">Pay link</button></td></tr>
          <tr><td style="font-weight:600">P. Selvam</td><td>Inst 1 of 2</td><td class="mono">₹10,000</td><td class="mono" style="color:var(--alert-ink);font-weight:700">overdue 3d</td><td><span class="chipb al">Escalated → ABM</span></td><td><button class="btn bsm">Collection call</button></td></tr>
        </tbody></table></div></div></div>
    <div class="acc-p" data-p="ref" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-coin"/></svg> Refund console — rule-enforced</div>
        <div class="sec-bd"><table class="tbl"><thead><tr><th>Client</th><th>Paid</th><th>Days</th><th>Rule</th><th>Refund</th><th>Chain</th><th></th></tr></thead><tbody>
          <tr><td style="font-weight:600">D. Rao</td><td class="mono">₹29,000</td><td class="mono">34</td><td><span class="chipb warn">Partial</span></td><td class="mono">₹14,500</td><td class="mono" style="font-size:11px">ABM ✓ → <b>BM</b> → Accounts</td><td><button class="btn bsm">Track</button></td></tr>
          <tr><td style="font-weight:600">N. Devi</td><td class="mono">₹4,000</td><td class="mono">4</td><td><span class="chipb ok">Full</span></td><td class="mono">₹4,000</td><td class="mono" style="font-size:11px">ABM ✓ → BM ✓ → <b>Accounts</b></td><td><button class="btn bsm bp" onclick="toast('Refund processed via Razorpay')">Process</button></td></tr>
        </tbody></table></div></div></div>
  </div></section>

  <!-- REPORTS -->
  <section class="screen" id="s-reports"><div class="wrap">
    <div class="ph"><div><h1>Reports centre</h1><p>Every report = a slice of the same event stream.</p></div>
      <div class="pha"><button class="btn"><svg class="icon"><use href="#i-dl"/></svg> Excel</button><button class="btn"><svg class="icon"><use href="#i-doc"/></svg> PDF</button><button class="btn bp" onclick="toast('Daily 8am email scheduled')">Schedule email</button></div></div>
    <span class="viewing"><span class="vd"></span> Viewing as Branch manager / Management</span>
    <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-cog"/></svg> Filters</div>
      <div class="sec-bd"><div class="g4">
        <div class="fld"><label class="lbl">Period</label><select class="select"><option>Today</option><option selected>This month</option><option>Quarter</option><option>Custom…</option></select></div>
        <div class="fld"><label class="lbl">Compare vs</label><select class="select"><option selected>Previous period</option><option>Average (6 mo)</option><option>Target</option></select></div>
        <div class="fld"><label class="lbl">Branch</label><select class="select"><option selected>Chennai</option><option>All</option></select></div>
        <div class="fld"><label class="lbl">User</label><select class="select"><option selected>All</option><option>Priya K.</option><option>Dr. Suresh</option></select></div>
        <div class="fld"><label class="lbl">Source</label><select class="select"><option selected>All</option><option>Meta</option><option>Website</option></select></div>
        <div class="fld"><label class="lbl">Language</label><select class="select"><option selected>All</option><option>Tamil</option><option>Telugu</option></select></div>
        <div class="fld"><label class="lbl">Service</label><select class="select"><option selected>Diabetes</option><option>Blood test</option></select></div>
        <div class="fld"><label class="lbl">Campaign</label><select class="select"><option selected>All</option><option>DR_Jun_Lookalike</option></select></div>
      </div></div></div>
    <div class="rep-pick">
      <button class="rep on"><svg class="icon"><use href="#i-inbox"/></svg> Lead report</button>
      <button class="rep" onclick="toast('Conversion funnel loaded')"><svg class="icon"><use href="#i-split"/></svg> Conversion</button>
      <button class="rep" onclick="toast('Revenue loaded')"><svg class="icon"><use href="#i-coin"/></svg> Revenue</button>
      <button class="rep" onclick="toast('Appointments loaded')"><svg class="icon"><use href="#i-cal"/></svg> Appointments</button>
      <button class="rep" onclick="toast('Follow-ups loaded')"><svg class="icon"><use href="#i-bell"/></svg> Follow-up</button>
      <button class="rep" onclick="toast('Performance loaded')"><svg class="icon"><use href="#i-user"/></svg> Employee performance</button>
      <button class="rep" onclick="toast('Retention loaded')"><svg class="icon"><use href="#i-stetho"/></svg> Client retention</button>
      <button class="rep" onclick="toast('Outcomes cohort loaded')"><svg class="icon"><use href="#i-drop"/></svg> Outcomes cohort (M0→M6)</button>
    </div>
    <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-chart"/></svg> Lead report — June vs May</div>
      <div class="sec-bd">
        <div class="metrics" style="margin-top:6px">
          <div class="metric g"><div class="ml">Leads</div><div class="mv">4,512</div><div class="mt ok">▲ 8%</div></div>
          <div class="metric g"><div class="ml">Lead → appt</div><div class="mv">42%</div><div class="mt ok">▲ 3 pts</div></div>
          <div class="metric a"><div class="ml">Lead → enrol</div><div class="mv">4.1%</div><div class="mt warn">target 6%</div></div>
          <div class="metric g"><div class="ml">ROAS</div><div class="mv">3.8×</div><div class="mt ok">▲ 0.4</div></div>
        </div>
        <table class="tbl"><thead><tr><th>Source / campaign</th><th>Leads</th><th>≤4h %</th><th>Appt</th><th>Visited</th><th>Enrolled</th><th>L→E</th><th>Spend</th><th>ROAS</th></tr></thead><tbody>
          <tr><td style="font-weight:600">Meta · DR_Jun_Lookalike</td><td class="mono">2,140</td><td class="mono">92%</td><td class="mono">934</td><td class="mono">572</td><td class="mono">96</td><td class="mono" style="font-weight:700;color:var(--ok-ink)">4.5%</td><td class="mono">₹6.1L</td><td class="mono">4.6×</td></tr>
          <tr><td style="font-weight:600">Meta · DR_Reversal_Q2</td><td class="mono">1,905</td><td class="mono">89%</td><td class="mono">762</td><td class="mono">450</td><td class="mono">71</td><td class="mono" style="font-weight:700">3.7%</td><td class="mono">₹6.8L</td><td class="mono">3.0×</td></tr>
          <tr><td style="font-weight:600">Website organic</td><td class="mono">262</td><td class="mono">95%</td><td class="mono">121</td><td class="mono">86</td><td class="mono">11</td><td class="mono" style="font-weight:700">4.2%</td><td class="mono">—</td><td class="mono">—</td></tr>
        </tbody></table>
        <table class="tbl" style="margin-top:14px"><thead><tr><th>Language</th><th>Leads</th><th>L→V</th><th>L→E</th></tr></thead><tbody>
          <tr><td style="font-weight:600">Tamil (Chennai)</td><td class="mono">2,960</td><td class="mono">28%</td><td class="mono" style="font-weight:700;color:var(--ok-ink)">5.2%</td></tr>
          <tr><td style="font-weight:600">Telugu</td><td class="mono">1,012</td><td class="mono">21%</td><td class="mono" style="font-weight:700">3.1%</td></tr>
          <tr><td style="font-weight:600">Hindi</td><td class="mono">540</td><td class="mono">17%</td><td class="mono" style="font-weight:700">2.7%</td></tr>
        </tbody></table>
      </div></div>
  </div></section>

  <!-- SETTINGS -->
  <section class="screen" id="s-admin"><div class="wrap" style="max-width:1280px;padding:16px 20px 60px">
    <div class="ph"><div><h1>Settings &amp; masters</h1><p>Control plane — configure every screen's fields, pricing, roles, integrations.</p></div></div>
    <div class="tabs" id="settTabs"><button class="on" data-t="st-svc">Service pricing</button><button data-t="st-fld">Screen fields</button><button data-t="st-rbac">Roles &amp; RBAC</button><button data-t="st-drop">Dropdown masters</button><button data-t="st-int">Integrations</button><button data-t="st-msg">Auto-messages</button></div>

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

    <div class="st-p" data-p="st-rbac" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Roles &amp; permissions</div>
        <div class="sec-bd"><table class="tbl matrix"><thead><tr><th>Capability</th><th>Advisor</th><th>Coach</th><th>Screen</th><th>Recep</th><th>Diag</th><th>Physio</th><th>Accts</th><th>ABM</th></tr></thead><tbody>
          <tr><td>Full clinical record</td><td><span class="dn"></span></td><td><span class="dy"><svg><use href="#i-check"/></svg></span></td><td><span class="dy"><svg><use href="#i-check"/></svg></span></td><td><span class="dn"></span></td><td><span class="dy"><svg><use href="#i-check"/></svg></span></td><td><span class="dy"><svg><use href="#i-check"/></svg></span></td><td><span class="dn"></span></td><td><span class="dn"></span></td></tr>
          <tr><td>Collect payment</td><td><span class="dn"></span></td><td><span class="dn"></span></td><td><span class="dn"></span></td><td><span class="dy"><svg><use href="#i-check"/></svg></span></td><td><span class="dy"><svg><use href="#i-check"/></svg></span></td><td><span class="dn"></span></td><td><span class="dy"><svg><use href="#i-check"/></svg></span></td><td><span class="dn"></span></td></tr>
          <tr><td>Verify proof</td><td><span class="dn"></span></td><td><span class="dn"></span></td><td><span class="dn"></span></td><td><span class="dn"></span></td><td><span class="dn"></span></td><td><span class="dn"></span></td><td><span class="dy"><svg><use href="#i-check"/></svg></span></td><td><span class="dn"></span></td></tr>
          <tr><td>Approve discount/freeze</td><td><span class="dn"></span></td><td><span class="dn"></span></td><td><span class="dn"></span></td><td><span class="dn"></span></td><td><span class="dn"></span></td><td><span class="dn"></span></td><td><span class="dn"></span></td><td><span class="dy"><svg><use href="#i-check"/></svg></span></td></tr>
        </tbody></table></div></div>
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

    function eligCheck() {
      const any = [...root.querySelectorAll("#eligChips .chip-o")].some((c) => c.classList.contains("on"));
      const b = root.querySelector("#eligBanner") as HTMLElement;
      if (!b) return;
      if (any) { b.className = "banner bad"; b.innerHTML = '<svg class="icon" style="width:16px;height:16px"><use href="#i-x"></use></svg><span><b>NOT eligible</b> — exclusion tag present.</span>'; }
      else { b.className = "banner good"; b.innerHTML = '<svg class="icon" style="width:16px;height:16px"><use href="#i-check"></use></svg><span>Eligible — can book appointment.</span>'; }
    }

    root.querySelectorAll("#stars .star").forEach((s, i, a) => { (s as HTMLElement).onclick = () => a.forEach((x, j) => x.classList.toggle("on", j <= i)); });
    root.querySelectorAll("#bdm button").forEach((b) => { (b as HTMLElement).onclick = () => { root.querySelectorAll("#bdm button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); }; });

    function addBlood() {
      const ba = root.querySelector("#bloodAtts"); if (ba) ba.insertAdjacentHTML("afterbegin", '<span class="att"><svg class="icon"><use href="#i-clip"></use></svg> new_report.pdf</span>');
      const ca = root.querySelector("#coachAtts"); if (ca) ca.insertAdjacentHTML("afterbegin", '<span class="att"><svg class="icon"><use href="#i-clip"></use></svg> new_report.pdf · advisor</span>');
      toast("Report synced to HC"); addLog("Blood report attached");
    }
    w.addBlood = addBlood;

    // ========== RECEPTION DATA ==========
    const RX: any[] = [
      { id:1,name:"Ajith Kumar",ph:"98000 00021",svc:"dia",svcLabel:"🩺 Diabetes",date:"16-Jun",time:"10:30",hc:"Dr. Suresh",status:"visited",visitedAt:"10:24",payStatus:"paid",payAmt:29000,stage:"screening",session:"",notes:"Confirmed walk-in with wife",calls:2,source:"Meta",lang:"Tamil",sugar:"150–250",hba1c:"8.4",priority:"★★☆",prob:"62%",eligibility:"✓ Eligible",advisor:"Prem Kumar",consultStatus:"Will Join Immediately",bmi:"29.1",bp:"130/85",assessment:"Good L2 candidate"},
      { id:2,name:"R. Kumar",ph:"97114 20832",svc:"dia",svcLabel:"🩺 Diabetes",date:"16-Jun",time:"11:15",hc:"Dr. Priya",status:"expected",visitedAt:"",payStatus:"free",payAmt:0,stage:"",session:"",notes:"",calls:0,source:"Meta",lang:"Tamil",sugar:"Above 250",hba1c:"9.1",priority:"★★★",prob:"78%",eligibility:"✓ Eligible",advisor:"Vinod M.",consultStatus:"Open",bmi:"",bp:"",assessment:""},
      { id:3,name:"P. Ravi",ph:"96448 44281",svc:"physio",svcLabel:"💪 Physio 3/8",date:"16-Jun",time:"11:30",hc:"Ganesh (PT)",status:"expected",visitedAt:"",payStatus:"prepaid",payAmt:6400,stage:"Session 3",session:"3/8",notes:"Lower back pain, improving",calls:0,source:"Referral",lang:"Tamil",sugar:"",hba1c:"",priority:"",prob:"",eligibility:"",advisor:"",consultStatus:"",bmi:"",bp:"",assessment:"Rehab L4-L5"},
      { id:4,name:"M. John",ph:"96448 11290",svc:"bt",svcLabel:"🩸 Blood test",date:"16-Jun",time:"11:45",hc:"—",status:"expected",visitedAt:"",payStatus:"due",payAmt:800,stage:"",session:"",notes:"",calls:0,source:"Walk-in",lang:"Tamil",sugar:"",hba1c:"",priority:"",prob:"",eligibility:"",advisor:"",consultStatus:"",bmi:"",bp:"",assessment:""},
      { id:5,name:"K. Mani",ph:"98873 64101",svc:"dia",svcLabel:"🩺 Diabetes",date:"16-Jun",time:"10:00",hc:"Dr. Latha",status:"noshow",visitedAt:"",payStatus:"",payAmt:0,stage:"",session:"",notes:"No answer on 3 calls",calls:3,source:"Meta",lang:"Telugu",sugar:"150–250",hba1c:"7.8",priority:"★☆☆",prob:"30%",eligibility:"✓ Eligible",advisor:"Sana R.",consultStatus:"Open",bmi:"",bp:"",assessment:""},
      { id:6,name:"S. Devi",ph:"99876 54321",svc:"dia",svcLabel:"🩺 Diabetes",date:"16-Jun",time:"9:30",hc:"Dr. Suresh",status:"visited",visitedAt:"9:28",payStatus:"paid",payAmt:29000,stage:"enrolled",session:"",notes:"Enrolled L2 — kit issued",calls:1,source:"Meta",lang:"Tamil",sugar:"Above 250",hba1c:"10.2",priority:"★★★",prob:"90%",eligibility:"✓ Eligible",advisor:"Priya K.",consultStatus:"Enrolled – L2",bmi:"32.4",bp:"140/90",assessment:"Highly motivated, family support"},
      { id:7,name:"V. Prasad",ph:"98412 33007",svc:"dia",svcLabel:"🩺 Diabetes",date:"16-Jun",time:"12:00",hc:"Dr. Priya",status:"expected",visitedAt:"",payStatus:"free",payAmt:0,stage:"",session:"",notes:"Called yesterday — said will visit today",calls:2,source:"Meta",lang:"Telugu",sugar:"150–250",hba1c:"8.0",priority:"★★☆",prob:"55%",eligibility:"✓ Eligible",advisor:"Vinod M.",consultStatus:"Open",bmi:"",bp:"",assessment:""},
      { id:8,name:"F. Begum",ph:"96001 78234",svc:"bt",svcLabel:"🩸 Blood test",date:"16-Jun",time:"10:15",hc:"—",status:"visited",visitedAt:"10:12",payStatus:"paid",payAmt:1200,stage:"sample",session:"",notes:"Thyroid + HbA1c panel",calls:0,source:"Website",lang:"Tamil",sugar:"",hba1c:"",priority:"",prob:"",eligibility:"",advisor:"",consultStatus:"",bmi:"",bp:"",assessment:""},
      { id:9,name:"L. Priya",ph:"98765 43210",svc:"physio",svcLabel:"💪 Physio 5/12",date:"16-Jun",time:"10:00",hc:"Ganesh (PT)",status:"visited",visitedAt:"9:55",payStatus:"prepaid",payAmt:10800,stage:"done",session:"5/12",notes:"Knee rehab post-op, good progress",calls:0,source:"Referral",lang:"Tamil",sugar:"",hba1c:"",priority:"",prob:"",eligibility:"",advisor:"",consultStatus:"",bmi:"",bp:"",assessment:"ROM 85% recovered"},
      { id:10,name:"M. Lakshmi",ph:"97654 32109",svc:"physio",svcLabel:"💪 Physio 1/6",date:"16-Jun",time:"12:30",hc:"Ganesh (PT)",status:"expected",visitedAt:"",payStatus:"due",payAmt:800,stage:"",session:"1/6",notes:"Cervical spondylosis — first visit",calls:1,source:"Walk-in",lang:"Tamil",sugar:"",hba1c:"",priority:"",prob:"",eligibility:"",advisor:"",consultStatus:"",bmi:"",bp:"",assessment:""},
      { id:11,name:"D. Kumar",ph:"99887 76543",svc:"bt",svcLabel:"🩸 Blood test",date:"16-Jun",time:"2:00 PM",hc:"—",status:"rescheduled",visitedAt:"",payStatus:"",payAmt:0,stage:"→ 18 Jun",session:"",notes:"Fasting not done — rescheduled",calls:1,source:"Meta",lang:"Hindi",sugar:"",hba1c:"",priority:"",prob:"",eligibility:"",advisor:"",consultStatus:"",bmi:"",bp:"",assessment:""},
      { id:12,name:"A. Raman",ph:"98000 11122",svc:"dia",svcLabel:"🩺 Diabetes",date:"16-Jun",time:"2:30 PM",hc:"Dr. Anand",status:"cancelled",visitedAt:"",payStatus:"refunded",payAmt:-4000,stage:"",session:"",notes:"Relocated to Bangalore",calls:2,source:"Meta",lang:"Tamil",sugar:"150–250",hba1c:"7.5",priority:"★★☆",prob:"40%",eligibility:"✓ Eligible",advisor:"Priya K.",consultStatus:"Cancelled",bmi:"",bp:"",assessment:""},
    ];
    w.RX = RX;

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
    function renderAppt() {
      const f = filtered();
      const el = root.querySelector("#apptCount"); if (el) el.textContent = f.length+" total";
      let html = '<table class="tbl" style="min-width:1200px"><thead><tr><th style="min-width:68px">Date · time</th><th style="min-width:110px">Client</th><th style="min-width:95px">Phone</th><th style="min-width:100px">Service</th><th style="min-width:70px">HC / PT</th><th style="min-width:80px">Status</th><th style="min-width:65px">Visited at</th><th style="min-width:70px">Pay</th><th style="min-width:70px">Amount</th><th style="min-width:50px">Inv</th><th style="min-width:70px">Stage</th><th style="min-width:40px">📞</th><th style="min-width:40px">🎤</th></tr></thead><tbody>';
      f.forEach((r:any) => {
        const sm = STATUS_MAP[r.status]||{l:r.status,c:"neu"};
        const pm = PAY_MAP[r.payStatus]||{l:"—",c:"neu"};
        html += '<tr onclick="window._openDrawer('+r.id+')" style="cursor:pointer"><td class="mono">'+r.date+' '+r.time+'</td><td style="font-weight:600">'+r.name+'</td><td class="mono">'+r.ph+'</td><td><span class="tag">'+r.svcLabel+'</span></td><td>'+r.hc+'</td><td><span class="chipb '+sm.c+'">'+sm.l+'</span></td><td class="mono">'+(r.visitedAt||"—")+'</td><td><span class="chipb '+pm.c+'">'+pm.l+'</span></td><td class="mono" style="font-weight:700">'+(r.payAmt?("₹"+r.payAmt.toLocaleString("en-IN")):"—")+'</td><td>'+(r.payStatus==="paid"?'<button class="btn bsm" onclick="event.stopPropagation();window._toast(\'Invoice PDF downloading\')">⬇</button>':"—")+'</td><td>'+(r.stage?'<span class="chipb info">'+r.stage+'</span>':"—")+'</td><td><button class="btn bsm" onclick="event.stopPropagation();window._toast(\'Calling '+r.ph+'…\')">📞</button></td><td>'+(r.calls?'<span class="mono" style="font-size:11px">'+r.calls+'</span>':"—")+'</td></tr>';
      });
      html += '</tbody></table>';
      const aw = root.querySelector("#apptWrap"); if (aw) aw.innerHTML = html;
    }
    function renderPay() {
      const el = root.querySelector("#recPayList");
      if (el) {
        el.innerHTML = RX.filter((r:any)=>r.payStatus==="due").map((r:any)=>'<div class="li" style="padding:8px 0"><div style="flex:1"><b style="font-weight:600">'+r.name+'</b><div style="font-size:11px;color:var(--muted)">'+r.svcLabel+' · ₹'+r.payAmt.toLocaleString("en-IN")+'</div></div><button class="btn bsm bp" onclick="window._recOpen(\''+r.name+'\',\''+r.svc+'\',\''+r.payAmt+'\')">Collect</button></div>').join("") +
        RX.filter((r:any)=>r.payStatus==="prepaid").map((r:any)=>'<div class="li" style="padding:8px 0"><div style="flex:1"><b style="font-weight:600">'+r.name+'</b><div style="font-size:11px;color:var(--muted)">'+r.svcLabel+' · Prepaid ✓</div></div><button class="btn bsm" onclick="window._toast(\'Visit marked · '+r.session+'\')">Mark visit</button></div>').join("");
      }
    }

    w._svcF2 = (s:string) => { curSvc=s; curScFilter=null; renderFilters(); renderAll(); };
    w._svcF = (s:string) => { curSvc=s; curScFilter=null; renderFilters(); renderAll(); };
    w._dtF = (d:string) => { curDate=d; const show=d==="cust"; ["dtFrom","dtTo","dtTo2"].forEach((id)=>{const el=root.querySelector("#"+id)as HTMLElement;if(el)el.style.display=show?"inline":"none";}); renderFilters(); renderAll(); };
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
    w._openDrawer = (id:number) => { const r=RX.find((x:any)=>x.id===id); if(r) openDrawer(r); };
    function closeDrawer() { const d=root.querySelector("#drawer")as HTMLElement; const o=root.querySelector("#dOverlay")as HTMLElement; if(d)d.classList.remove("open"); if(o)o.classList.remove("open"); }
    w.closeDrawer = closeDrawer;

    // Cross-check
    function ccSearch() {
      const qEl=root.querySelector("#ccQ")as HTMLInputElement; if(!qEl) return;
      const q=qEl.value.trim().toLowerCase(); if(!q){toastErr("Enter phone or name");return;}
      const match=RX.find((r:any)=>r.ph.replace(/\s/g,"").includes(q.replace(/\s/g,""))||r.name.toLowerCase().includes(q));
      const res=root.querySelector("#ccRes")as HTMLElement; if(!res) return;
      if(match){
        const hasAppt=match.status!=="noshow"&&match.status!=="cancelled";
        res.innerHTML='<div style="border:1.5px solid var(--brand-line);border-radius:12px;padding:12px 14px;background:linear-gradient(180deg,#F7FCFA,#fff)"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b style="font-family:var(--disp)">'+match.name+'</b><span class="mono" style="color:var(--muted)">'+match.ph+'</span></div><table class="tbl" style="margin-top:8px"><tbody><tr><td style="color:var(--muted)">Service</td><td>'+match.svcLabel+'</td><td style="color:var(--muted)">Appointment</td><td>'+(hasAppt?'<span class="chipb ok">'+match.date+' · '+match.time+' with '+match.hc+'</span>':'<span class="chipb al">None booked</span>')+'</td></tr></tbody></table><div style="display:flex;gap:6px;margin-top:10px"><button class="btn bsm bp" onclick="window._openDrawer('+match.id+')">Open full record</button></div></div>';
        toast("✓ Found: "+match.name);
      } else {
        res.innerHTML='<div style="border:1.5px solid var(--alert);border-radius:12px;padding:12px 14px;background:var(--alert-bg)"><b style="color:var(--alert-ink)">No record found for "'+q+'"</b><p style="font-size:12px;color:var(--alert-ink);margin:6px 0 0">Not in our system. Create a new walk-in record.</p></div>';
      }
    }
    w.ccSearch = ccSearch;

    function nwToggle() { const p=root.querySelector("#nwPanel")as HTMLElement; if(p){p.style.display=p.style.display==="none"?"block":"none"; if(p.style.display==="block")p.scrollIntoView({behavior:"smooth"});} }
    w.nwToggle = nwToggle;
    function nwCheckSlot() {
      const time=(root.querySelector("#nwTime")as HTMLSelectElement)?.value;
      const booked=RX.filter((r:any)=>r.time===time); const cap=4;
      const sr=root.querySelector("#nwSlotRes")as HTMLElement; if(!sr) return;
      if(booked.length>=cap) sr.innerHTML='<span class="chipb al">✗ '+time+' is FULL ('+booked.length+'/'+cap+')</span>';
      else sr.innerHTML='<span class="chipb ok">✓ '+time+' available — '+booked.length+'/'+cap+' booked</span>';
    }
    w.nwCheckSlot = nwCheckSlot;
    function nwBook() {
      const name=(root.querySelector("#nwName")as HTMLInputElement)?.value||"New Client";
      const ph=(root.querySelector("#nwPhone")as HTMLInputElement)?.value||"99999 00000";
      const time=(root.querySelector("#nwTime")as HTMLSelectElement)?.value;
      const prov=(root.querySelector("#nwProv")as HTMLSelectElement)?.value;
      const newR:any={id:RX.length+1,name,ph,svc:"dia",svcLabel:"🩺 Diabetes",date:"16-Jun",time,hc:prov,status:"visited",visitedAt:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}),payStatus:"free",payAmt:0,stage:"screening",session:"",notes:"Walk-in registered at reception",calls:0,source:"Direct Walk-in",lang:"Tamil",sugar:"",hba1c:"",priority:"",prob:"",eligibility:"",advisor:"",consultStatus:"Open",bmi:"",bp:"",assessment:""};
      RX.push(newR); nwToggle(); renderAll();
      ach("📌","Walk-in registered!",name+" · "+time); boom(26);
      toast("Created + booked + checked in → screening");
    }
    w.nwBook = nwBook;

    function recOpen(name:string,plan:string,amt:string) {
      const wb=root.querySelector("#recWb")as HTMLElement; if(wb) wb.style.display="block";
      const p:Record<string,string>={full:"Full",i2:"Installment",emi:"EMI",adv:"Advance",bt:"Blood test",dia:"Diabetes",physio:"Physio"};
      const rn=root.querySelector("#recWbName"); if(rn) rn.textContent=name;
      const rp=root.querySelector("#recWbPlan"); if(rp) rp.textContent=p[plan]||plan;
      const rd=root.querySelector("#recWbDue")as HTMLInputElement; if(rd) rd.value="₹"+Number(amt).toLocaleString("en-IN");
      const ra=root.querySelector("#recWbAmt")as HTMLInputElement; if(ra) ra.value=Number(amt).toLocaleString("en-IN");
    }
    w._recOpen = recOpen;
    function recConfirm() { const wb=root.querySelector("#recWb")as HTMLElement; if(wb)wb.style.display="none"; toast("Collected → Accounts verification"); }
    w.recConfirm = recConfirm;
    function recBack() { const wb=root.querySelector("#recWb")as HTMLElement; if(wb)wb.style.display="none"; toast("↩ Moved back"); }
    w.recBack = recBack;
    function recRegDone() { const now=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}); const el=root.querySelector("#rcReg")as HTMLInputElement; if(el)el.value=now; toast("Registration completed "+now+" · → screening"); }
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
      const map:Record<string,[string,string]>={new:["New","vio"],fu:["Follow Up","warn"],paid:["Already Paid","info"],afd:["Appt Fixed","ok"],afz:["Appt Fixed (Zoom)","ok"],ni:["Not Interested","al"],cb:["Call Back","vio"]};
      const m=map[v]||[v,"neu"];
      if(badge){badge.textContent="Status: "+m[0];badge.className="chipb "+m[1];}
      if(v==="afd"||v==="afz"){renderSlots();ach("📅","Appointment fixed!","Pick a slot");boom(26);addLog("Appointment Fixed");}
      if(v==="fu") addLog("Follow Up");
    }
    w.callStatusChange = callStatusChange;

    const CAP=4; let slots:Record<string,string[][]>={}; let selSlot:string|null=null; let booked:string|null=null; let resch=false;
    function seed(){
      slots={};
      const names:string[][]=[["S. Devi","Dr.S"],["R. Kumar","Dr.P"],["M. John","Dr.A"],["L. Banu","Dr.L"],["K. Mani","Dr.S"]];
      const dEl=root.querySelector("#slotDate")as HTMLInputElement; const d=dEl?dEl.value:"x";
      let h=0; for(const c of d) h=(h*31+c.charCodeAt(0))%997;
      TIMES.forEach((t,i)=>{const n=(h+i*3)%5;slots[t]=[];for(let k=0;k<Math.min(n,4);k++)slots[t].push(names[(h+i+k)%names.length]);});
      slots["9:00 AM"]=[names[0],names[1],names[2],names[3]];
      slots["10:30 AM"]=[names[3],names[4]];
    }
    function renderSlots() {
      if(!Object.keys(slots).length) seed();
      const g=root.querySelector("#slotGrid"); if(!g) return;
      g.innerHTML=TIMES.map((t)=>{
        const n=slots[t].length; const full=n>=CAP;
        const cls=full?"s3 full":n===3?"s2":n>0?"s1":"s0";
        return '<button class="slotcard '+cls+(selSlot===t?" sel":"")+'" data-t="'+t+'"><div class="st"><span class="tm">'+t+'</span><span class="cap">'+n+'/'+CAP+(full?" FULL":"")+'</span></div><ul>'+(slots[t].map((x)=>'<li><span>'+x[0]+'</span><span class="hc">'+x[1]+'</span></li>').join("")||'<li style="color:var(--ok-ink)">Free</li>')+'</ul></button>';
      }).join("");
      g.querySelectorAll(".slotcard").forEach((c)=>{
        (c as HTMLElement).onclick=()=>{
          const t=(c as HTMLElement).dataset.t!;
          if(slots[t].length>=CAP){c.classList.add("shake");setTimeout(()=>c.classList.remove("shake"),350);toastErr("Slot FULL");return;}
          selSlot=t; renderSlots();
        };
      });
    }
    w.renderSlots = renderSlots;
    function bookSlot() {
      if(!selSlot){toastErr("Select slot");return;}
      const hcEl=root.querySelector("#apptHc")as HTMLSelectElement;
      const hc=hcEl?hcEl.value.replace("Dr. ","Dr.").slice(0,5):"Dr.S";
      if(resch&&booked){slots[booked]=slots[booked].filter((x)=>x[0]!=="Ajith Kumar");addLog("Rescheduled → "+selSlot);toast("Rescheduled");resch=false;}
      else{ach("📌","Confirmed!","Ajith · "+selSlot);boom(34);addLog("Booked: "+selSlot);}
      slots[selSlot].push(["Ajith Kumar",hc]); booked=selSlot; selSlot=null;
      const rb=root.querySelector("#reschBtn")as HTMLElement; if(rb)rb.style.display="inline-flex";
      renderSlots();
    }
    w.bookSlot = bookSlot;
    function startResch(){resch=true;const rb=root.querySelector("#reschBanner")as HTMLElement;if(rb)rb.style.display="flex";toast("Pick new slot");}
    w.startResch = startResch;
    function visitedFx(){
      const vd=root.querySelector("#visDt")as HTMLInputElement;
      if(vd)vd.value=new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
      ach("🏥","Visited!","→ screening");boom(34);addLog("Visited");
    }
    w.visitedFx = visitedFx;

    // Call timer
    let onCall=0,ct=0,cti:ReturnType<typeof setInterval>|null=null;
    const cbtn=root.querySelector("#callBtn")as HTMLElement;
    if(cbtn) cbtn.onclick=()=>{
      if(!onCall){
        onCall=1;cbtn.style.background="linear-gradient(135deg,#E2553B,#A8351F)";
        const sp=cbtn.querySelector("span");if(sp)sp.textContent="…";
        ct=0;setTimeout(()=>{if(onCall)cti=setInterval(()=>{ct++;const sp2=cbtn.querySelector("span");if(sp2)sp2.textContent=(ct/60|0)+":"+String(ct%60).padStart(2,"0");},1000);},1200);
      } else {
        onCall=0;if(cti)clearInterval(cti);cbtn.style.background="";
        const sp=cbtn.querySelector("span");if(sp)sp.textContent="Call";
        addLog("Call "+(ct/60|0)+":"+String(ct%60).padStart(2,"0"));
        if(ct<1800){ach("⚡","Speed hero!","<30 min");boom(30);} else toast("Call ended");
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
    }
    w.consAct = consAct;

    function payBlk(v:string){
      root.querySelectorAll(".payblk").forEach((p)=>p.classList.remove("on"));
      const m:Record<string,string>={full:"pb-full",i2:"pb-i2",emi:"pb-emi",adv:"pb-adv"};
      if(m[v]) root.querySelector("#"+m[v])?.classList.add("on");
    }
    w.payBlk = payBlk;

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

    function addLog(txt:string){
      const now=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
      const el=root.querySelector("#actLog");
      if(el)el.insertAdjacentHTML("afterbegin",'<div class="tl now"><div class="t">'+txt+'</div><div class="m">today '+now+'</div></div>');
    }

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

    let fuAttA=3;
    function addFuNoteA(){const el=root.querySelector("#fuNoteA")as HTMLInputElement;if(!el||!el.value.trim()){toastErr("Type note");return;}const now=new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});const notes=root.querySelector("#fuNotesA");if(notes)notes.insertAdjacentHTML("afterbegin",'<div style="background:#fff;border:1px solid var(--line);border-radius:9px;padding:7px 11px;font-size:12px"><b class="mono" style="color:var(--vio-ink)">Attempt '+fuAttA++ +' · '+now+'</b> — '+el.value+'</div>');el.value="";toast("Note added");addLog("Follow-up note");}
    w.addFuNoteA = addFuNoteA;

    let fuAtt=3;
    function addFuNote(){const el=root.querySelector("#fuNote")as HTMLInputElement;if(!el||!el.value.trim()){toastErr("Type note");return;}const now=new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});const notes=root.querySelector("#fuNotes");if(notes)notes.insertAdjacentHTML("afterbegin",'<div style="background:#fff;border:1px solid var(--line);border-radius:9px;padding:7px 11px;font-size:12px"><b class="mono" style="color:var(--vio-ink)">Attempt '+fuAtt++ +' · '+now+'</b> — '+el.value+'</div>');el.value="";toast("Note added");}
    w.addFuNote = addFuNote;

    function sendToReception(){const who=(root.querySelector("#collectedBy")as HTMLSelectElement)?.value;if(who!=="Reception desk"){toast(who||"");return;}toast("Sent → Reception");addLog("Payment → Reception");}
    w.sendToReception = sendToReception;

    function screeningDone(){
      const ids=["sc_h","sc_w","sc_bmi","sc_bp","sc_pu","sc_sp","sc_wa","sc_te","sc_gl"];
      const cids=["cs_h","cs_w","cs_bmi","cs_bp","cs_pu","cs_sp","cs_wa","cs_te","cs_gl"];
      ids.forEach((id,i)=>{const s=root.querySelector("#"+id)as HTMLInputElement;const d=root.querySelector("#"+cids[i])as HTMLInputElement;if(s&&d)d.value=s.value;});
      const e=root.querySelector("#scrEmpty")as HTMLElement;if(e)e.style.display="none";
      const d=root.querySelector("#scrData")as HTMLElement;if(d)d.style.display="grid";
      const ch=root.querySelector("#scrChip")as HTMLElement;if(ch){ch.textContent="Completed · M0 locked";ch.className="chipb ok";}
      toast("Baseline locked → coach screen");
    }
    w.screeningDone = screeningDone;

    function togMsg(b:HTMLElement){b.textContent=b.textContent?.trim()==="On"?"Off":"On";b.className=b.textContent?.trim()==="On"?"chipb ok":"chipb neu";}
    w.togMsg = togMsg;

    root.querySelectorAll(".rep").forEach((r)=>r.addEventListener("click",()=>{root.querySelectorAll(".rep").forEach((x)=>x.classList.remove("on"));r.classList.add("on");}));

    // INIT
    renderFilters();
    renderAll();
    seed();

    return () => { clearInterval(slaInterval); if(cti) clearInterval(cti); };
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

      <div className="app">
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
          <div className="sfoot"><span className="ldot"></span> Merged build · v3</div>
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
              <div className="sec-bd" style={{padding:"4px 14px 14px"}}><table className="tbl"><tbody>
                <tr><td style={{color:"var(--muted)"}}>Visited time</td><td className="mono" style={{fontWeight:600}}>10:24 AM</td><td style={{color:"var(--muted)"}}>Registered</td><td className="mono" style={{fontWeight:600}}>10:31 AM</td></tr>
                <tr><td style={{color:"var(--muted)"}}>Service</td><td>Diabetes + Blood test</td><td style={{color:"var(--muted)"}}>Token</td><td className="mono">T-07</td></tr>
                <tr><td style={{color:"var(--muted)"}}>Consent</td><td colSpan={3}><span className="chipb ok">DPDP ✓</span> <span className="chipb ok">Health data ✓</span> <span className="chipb ok">Recording ✓</span></td></tr>
              </tbody></table></div></div></div>
          <div className="d-p" data-p="ds" style={{display:"none"}}>
            <div className="sec"><div className="sec-hd" style={{cursor:"default",padding:"10px 14px"}}><svg className="icon"><use href="#i-user"/></svg> Sales record</div>
              <div className="sec-bd" style={{padding:"4px 14px 14px"}}><table className="tbl"><tbody>
                <tr><td style={{color:"var(--muted)"}}>Lead source</td><td>Meta · DR_Jun_Lookalike</td><td style={{color:"var(--muted)"}}>Language</td><td>Tamil</td></tr>
                <tr><td style={{color:"var(--muted)"}}>Advisor</td><td style={{fontWeight:600}}>Prem Kumar</td><td style={{color:"var(--muted)"}}>Priority</td><td>★★☆ · 62%</td></tr>
                <tr><td style={{color:"var(--muted)"}}>Sugar</td><td>150–250</td><td style={{color:"var(--muted)"}}>HbA1c</td><td className="mono" style={{fontWeight:700}}>8.4%</td></tr>
                <tr><td style={{color:"var(--muted)"}}>Eligibility</td><td colSpan={3}><span className="chipb ok">✓ Eligible — no exclusions</span></td></tr>
                <tr><td style={{color:"var(--muted)"}}>Call notes</td><td colSpan={3}>Confirmed walk-in with wife; concerned about cost — explained EMI option.</td></tr>
              </tbody></table></div></div></div>
          <div className="d-p" data-p="dh" style={{display:"none"}}>
            <div className="sec"><div className="sec-hd" style={{cursor:"default",padding:"10px 14px"}}><svg className="icon"><use href="#i-stetho"/></svg> Health record</div>
              <div className="sec-bd" style={{padding:"4px 14px 14px"}}><table className="tbl"><tbody>
                <tr><td style={{color:"var(--muted)"}}>Consult status</td><td><span className="chipb ok">Will Join Immediately</span></td><td style={{color:"var(--muted)"}}>HC</td><td>Dr. Suresh</td></tr>
                <tr><td style={{color:"var(--muted)"}}>BMI</td><td className="mono">29.1</td><td style={{color:"var(--muted)"}}>BP</td><td className="mono">130/85</td></tr>
                <tr><td style={{color:"var(--muted)"}}>Assessment</td><td colSpan={3}>Motivated; mild BP; sedentary job. Good L2 candidate.</td></tr>
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
