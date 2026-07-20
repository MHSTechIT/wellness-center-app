export function getMainContent(): string {
  return `
  <!-- ADVISOR -->
  <section class="screen active" id="s-advisor"><div class="wrap">
    <div class="sec" style="margin-bottom:14px"><div class="sec-bd" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:12px 14px">
      <span style="font-size:12px;font-weight:600;color:var(--muted);margin-right:2px">Filters</span>
      <input class="input" type="date" id="asnFrom" style="height:30px;font-size:12px;width:150px" title="From date">
      <span style="color:var(--faint);font-size:12px">→</span>
      <input class="input" type="date" id="asnTo" style="height:30px;font-size:12px;width:150px" title="To date">
      <select class="select" id="asnSource" style="height:30px;font-size:12px;width:160px"><option value="all">All sources</option></select>
      <select class="select" id="asnService" style="height:30px;font-size:12px;width:160px"><option value="all">All services</option></select>
      <select class="select" id="assignedFilter" style="height:30px;font-size:12px;width:170px"><option value="all">All advisors</option></select>
      <button class="btn bsm bp" onclick="window._topFilterApply()">Apply</button>
      <button class="btn bsm" onclick="window._topFilterClear()">Clear</button>
    </div></div>
    <div class="sec" style="margin-bottom:14px"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-chart"/></svg> Advisor dashboard
      <div class="pills" id="asnViewToggle" style="margin-left:auto"><button class="pill on" onclick="window._asnToggleView('list')">List View</button><button class="pill" onclick="window._asnToggleView('kanban')">Kanban View</button></div>
      <select class="select" id="haStatusFilter" style="height:30px;font-size:12px;width:210px"><option value="all">All call/lead statuses</option></select></div>
      <div class="sec-bd">
        <div class="metrics" id="haKpis" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin:0"></div>
        <div id="haResultsWrap" style="display:none;margin-top:14px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-weight:700;font-size:13px" id="haResultsTitle"></span><button class="btn bsm" style="margin-left:auto" onclick="window._haCloseResults()">Close</button></div>
          <div class="tscroll"><table class="tbl" style="min-width:640px"><thead><tr id="haResultsHead"><th>Lead</th><th>Source · Lang</th><th>Assigned to</th><th>Call status</th></tr></thead><tbody id="haResultsBody"></tbody></table></div>
        </div>
      </div></div>
    <div class="sec" style="margin-bottom:14px"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Assigned leads <span class="chipb ok" id="assignedCount" style="margin-left:8px">0</span></div>
      <div class="sec-bd">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <input class="input" id="assignedSearch" placeholder="Search lead / phone / advisor…" style="height:30px;font-size:12px;width:230px;margin-left:auto" oninput="window._assignedSearch()">
      </div>
      <div id="assignedTableWrap" class="tscroll stick1"><table class="tbl" style="min-width:880px"><thead><tr id="assignedLeadsHead"><th>Date &amp; Time</th><th>Lead</th><th>Source · Lang</th><th>Campaign</th><th>Assigned to</th><th>Status</th><th>Action</th></tr></thead><tbody id="assignedLeadsBody"></tbody></table></div>
      <div id="assignedKanban" style="display:none;overflow-x:auto"></div>
      <div id="asnPager" style="display:flex;gap:10px;margin-top:12px;align-items:center;justify-content:center;flex-wrap:wrap">
        <button class="btn bsm" id="asnFirstBtn" onclick="window._asnPage('first')">« First</button>
        <button class="btn bsm" id="asnPrevBtn" onclick="window._asnPage(-1)">← Previous</button>
        <span style="font-size:12.5px;font-weight:600;color:var(--ink)" id="asnPageInfo">Page 1 of 1</span>
        <button class="btn bsm" id="asnNextBtn" onclick="window._asnPage(1)">Next →</button>
        <button class="btn bsm" id="asnLastBtn" onclick="window._asnPage('last')">Last »</button>
        <button class="btn bsm" onclick="window._assignedDownload()" style="margin-left:auto">⬇ Download</button>
      </div></div></div>
    <div class="sec" style="margin-bottom:14px" id="asnHistSec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-clock"/></svg> Assigned leads history <span class="chipb neu" id="asnHistCount" style="margin-left:8px">0</span></div>
      <div class="sec-bd">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <input class="input" type="date" id="asnHistFrom" style="height:30px;font-size:12px;width:150px" oninput="window._asnHistFilter()" title="Assigned from">
          <span style="color:var(--faint);font-size:12px">→</span>
          <input class="input" type="date" id="asnHistTo" style="height:30px;font-size:12px;width:150px" oninput="window._asnHistFilter()" title="Assigned to">
          <select class="select" id="asnHistAdvisor" style="height:30px;font-size:12px;width:160px" onchange="window._asnHistFilter()"><option value="all">All health advisors</option></select>
          <select class="select" id="asnHistSource" style="height:30px;font-size:12px;width:150px" onchange="window._asnHistFilter()"><option value="all">All sources</option></select>
          <select class="select" id="asnHistService" style="height:30px;font-size:12px;width:150px" onchange="window._asnHistFilter()"><option value="all">All services</option></select>
          <label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);white-space:nowrap"><input type="checkbox" id="asnHistPool" onchange="window._asnHistFilter()"> Unassigned pool only</label>
          <input class="input" id="asnHistSearch" placeholder="Search name / number / advisor…" style="height:30px;font-size:12px;width:230px;margin-left:auto" oninput="window._asnHistSearch()">
          <button class="btn bsm" onclick="window._asnHistDownload()">⬇ Download</button>
        </div>
        <div class="tscroll stick1"><table class="tbl" style="min-width:940px"><thead><tr id="asnHistHead"></tr></thead><tbody id="asnHistBody"></tbody></table></div>
      </div></div>
    <div style="display:flex;gap:14px;align-items:flex-start;margin-top:4px">
    <div id="advOpenList" style="width:212px;flex-shrink:0;display:none"></div>
    <div id="advDetailPane" style="flex:1;min-width:0">
    <div id="advCtxBanner" class="banner plan" style="display:none;margin-bottom:12px"><svg class="icon" style="width:15px;height:15px"><use href="#i-user"/></svg> <span id="advCtxText"></span></div>
    <div class="chead">
      <span class="cav" id="advAv"></span>
      <div class="cmeta">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><h1 id="advName" style="margin:0">No lead selected</h1><span id="advNotElig" class="chipb al" style="display:none;font-weight:700">⛔ Not Eligible</span></div>
        <div class="sub" id="advSub"><span style="color:var(--faint)">Open a lead from Assigned leads to begin</span></div>
        <div class="cbadges" id="advBadges"></div>
      </div>
      <div class="cacts">
        <div style="text-align:center"><div class="ring"><svg width="62" height="62" viewBox="0 0 62 62"><circle class="bgc" cx="31" cy="31" r="26"/><circle class="fgc" id="aRing" cx="31" cy="31" r="26" stroke="#C07F0E" stroke-dasharray="163.4" stroke-dashoffset="42"/></svg><span class="rc" id="aClock" style="color:var(--warn-ink)">3:09</span></div><div class="rl">SLA · 4h</div></div>
        <span class="chipb vio" id="consBadge" style="height:30px">Status: —</span>
        <button class="btn bp" id="callBtn" onclick="window._advCallToggle()"><svg class="icon"><use href="#i-phone"/></svg> <span>Call</span></button>
        <button class="btn bwa"><svg class="icon"><use href="#i-msg"/></svg> WA</button>
      </div>
    </div>
    <div class="rtabs" id="aTabs">
      <button data-t="recep">Walk-in Receptionist</button><button class="on" data-t="sales">Walk-in Sales</button><button data-t="health">Walk-in Health</button>
      <button data-t="pay">Payment History</button><button data-t="notes">Internal Notes</button>
      <button data-t="extra">Extra Info</button><button data-t="calls">Call History <span class="mini" id="advCallCount" style="display:none">0</span></button>
    </div>
    <div class="a-p" data-p="recep" style="display:none">
      <div class="banner plan" style="margin-top:16px"><svg class="icon" style="width:15px;height:15px"><use href="#i-doc"/></svg> <span><b>View only.</b> Reception-entered data — consent, visited time, registration time, service, token. Audit-logged.</span></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-door"/></svg> Reception record <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No reception record for this lead yet.</div></div></div>
    </div>
    <div class="a-p" data-p="sales">
      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-user"/></svg> Basic info <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g4">
          <div class="fld"><label class="lbl">Name <span class="req">*</span></label><input class="input" id="advfName" value=""></div>
          <div class="fld"><label class="lbl">Phone no <span class="req">*</span></label><input class="input mono" id="advfPhone" type="tel" inputmode="numeric" maxlength="15" value="" oninput="window._digitsOnly(this)"></div>
          <div class="fld"><label class="lbl">Alternate ph no <span class="nb">NEW</span></label><input class="input" placeholder="Alt number"></div>
          <div class="fld"><label class="lbl">WhatsApp no</label><input class="input mono" id="advfWhats" type="tel" inputmode="numeric" maxlength="15" value="" oninput="window._digitsOnly(this)"></div>
          <div class="fld"><label class="lbl">Email</label><input class="input" id="advfEmail" type="email" placeholder="email@example.com"></div>
          <div class="fld"><label class="lbl">Gender <span class="req">*</span></label><select class="select" id="advfGender"><option>-- Select --</option><option selected>Male</option><option>Female</option><option>Other</option></select></div>
          <div class="fld"><label class="lbl">Age <span class="req">*</span></label><input class="input mono" id="advfAge" type="number" min="1" max="120" placeholder="e.g. 42"></div>
          <div class="fld"><label class="lbl">Occupation <span class="req">*</span> <span class="nb">NEW</span></label><select class="select" id="advfOcc" onchange="othRev(this,'occOth')"><option>-- Select --</option><option>Private Job</option><option selected>Business</option><option>Govt Job</option><option>Self-employed</option><option>Homemaker</option><option>Retired</option><option>Student</option><option>Daily Wage</option><option>Others</option></select><input class="input hideblock" id="occOth" style="margin-top:7px" placeholder="Enter occupation…"></div>
          <div class="fld"><label class="lbl">Language <span class="req">*</span></label><select class="select" id="advfLang"><option selected>Tamil</option><option>Telugu</option><option>Kannada</option><option>Malayalam</option><option>Hindi</option><option>Marathi</option><option>Bengali</option><option>Gujarati</option><option>Punjabi</option><option>Urdu</option></select></div>
          <div class="fld"><label class="lbl">Lead source</label><select class="select"><option>web</option><option selected>Meta</option><option>WhatsApp</option><option>Referral</option><option>Direct Walk-in</option></select></div>
          <div class="fld"><label class="lbl">Lead generated <span class="ab">AUTO</span></label><input class="input mono" id="haLeadGen" readonly></div>
          <div class="fld"><label class="lbl">Batch code</label><input class="input mono" id="haBatch" placeholder="—"></div>
          <div class="fld"><label class="lbl">Location <span class="req">*</span></label><select class="select" id="advfLoc"><option selected>Poonamalle</option><option>Porur</option><option>Maduravoyal</option><option>Ambattur</option><option>Avadi</option><option>Tambaram</option><option>Nagapattinam</option><option>+ Add new location</option></select></div>
          <div class="fld" style="grid-column:span 3"><label class="lbl">Address</label><div class="g4" style="gap:9px"><input class="input" placeholder="Street / Area"><input class="input" value="Chennai"><input class="input" placeholder="ZIP"><input class="input" value="India"></div></div>
        </div></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-drop"/></svg> Sugar &amp; medical profile <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g4">
          <div class="fld"><label class="lbl">Sugar level <span class="req">*</span></label><select class="select" id="advfSugar"><option>No Sugar</option><option selected>150–250</option><option>Above 250</option></select></div>
          <div class="fld"><label class="lbl">Last test report date</label><input class="input" type="date"></div>
          <div class="fld"><label class="lbl">Fasting (mg/dL)</label><input class="input mono" type="number" placeholder="—"></div>
          <div class="fld"><label class="lbl">Postprandial (mg/dL)</label><input class="input mono" type="number" placeholder="—"></div>
          <div class="fld"><label class="lbl">HbA1c (%)</label><input class="input mono" type="number" placeholder="—"></div>
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
          <div class="fld"><label class="lbl">HC assigned <span class="nb">NEW</span></label><select class="select" id="hcSel" onchange="window._hcAssignedChange()"><option value="">— Select —</option></select></div>
          <div class="fld"><label class="lbl">Priority</label><div class="stars" id="stars"><span class="star">★</span><span class="star">★</span><span class="star">★</span></div></div>
          <div class="fld"><label class="lbl">Probability</label><div class="prob"><input type="range" min="0" max="100" value="0" oninput="document.getElementById('pv').textContent=this.value+'%'"><span class="pv" id="pv">0%</span></div></div>
          <div class="fld"><label class="lbl">Tags</label><input class="input" placeholder="e.g. hot-lead, follow-up"></div>
        </div></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-phone"/></svg> Call status <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="g2">
            <div class="fld"><label class="lbl">Call status — drives the flow</label>
              <select class="select" id="callStatus" onchange="callStatusChange(this.value)">
                <option value="new">New (Default)</option><option value="dnd">DND</option><option value="rnr">RNR</option><option value="busy">Line Busy</option><option value="cb">Call Back</option><option value="paid">Already Paid</option><option value="fu">Follow Up</option><option value="so">Switched Off</option><option value="nreg">Not Registered</option><option value="nosugar">No Sugar</option><option value="ni">Not Interested</option><option value="oos">Out of Service</option><option value="wn">Wrong Number</option><option value="afd">Appointment Fixed – Direct</option><option value="afz">Appointment Fixed – Zoom</option><option value="apc">Appointment Confirmed</option><option value="vis">Visited</option><option value="enr">Enrolled</option><option value="payp">Payment Pending</option><option value="payc">Payment Completed</option><option value="int">Interested</option><option value="nr">Not Reachable</option><option value="cbr">Callback Requested</option>
              </select></div>
            <div class="fld"><label class="lbl">Next follow-up date &amp; time</label><input class="input" id="nextFollowUp" type="datetime-local" data-future="1"></div>
          </div>
          <div class="fld"><label class="lbl">Call notes <span class="nb">NEW</span></label><textarea class="area" rows="3" placeholder="What was discussed, objections, next step…"></textarea></div>
          <div class="banner plan hideblock" id="fuPanel" style="display:none;flex-direction:column;align-items:stretch;gap:10px">
            <div style="display:flex;gap:9px;align-items:center"><svg class="icon" style="width:16px;height:16px"><use href="#i-repeat"/></svg><b>Follow-up plan — standard procedure</b></div>
            <div class="g4" style="gap:10px">
              <div><label class="lbl" style="color:var(--vio-ink)">Reason / intent</label><select class="select" style="height:36px"><option>Will decide this week</option><option>Family discussion needed</option><option>Budget / salary date</option></select></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Planned date &amp; time *</label><input class="input" style="height:36px" type="datetime-local" id="fuPlannedDt" data-future="1" onchange="window._fuPlannedSync()"></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Reminder before</label><select class="select" style="height:36px"><option selected>15 min before</option><option>30 min before</option></select></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Attempt # <span class="ab">AUTO</span></label><input class="input mono" style="height:36px" readonly placeholder="—"></div>
            </div>
            <div><label class="lbl" style="color:var(--vio-ink)">Follow-up notes</label>
              <div style="display:flex;gap:8px"><input class="input" id="fuNoteA" style="height:36px;background:#fff" placeholder="e.g. Wants to check with brother…"><button class="btn bsm" style="height:36px;flex:none;background:#fff" onclick="addFuNoteA()">Add note</button></div>
              <div id="fuNotesA" style="margin-top:9px;display:flex;flex-direction:column;gap:6px"></div></div>
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
            <div class="fld"><label class="lbl">Date</label><input class="input" type="date" id="slotDate" data-future="1" onchange="renderSlots()"></div>
            <div class="fld"><label class="lbl">HC <span class="ab">FROM ASSIGNMENT</span></label><select class="select" id="apptHc" disabled title="Set automatically from “HC assigned” in Assignment & pipeline — cannot be changed here"><option value="">— Select —</option></select></div>
            <div class="fld"><label class="lbl">Capacity rule</label><input class="input mono" id="apptCapRule" value="Select an HC first" readonly></div>
            <div class="fld"><label class="lbl">Appt request <span class="ab">AUTO</span></label><input class="input mono" id="apptReq" readonly placeholder="—"></div>
          </div>
          <div class="fld"><label class="lbl">Day view — slot occupancy</label><div class="slotgrid" id="slotGrid"></div></div>
          <div class="banner plan hideblock" id="reschBanner" style="display:none"><svg class="icon" style="width:16px;height:16px"><use href="#i-repeat"/></svg> <span>Reschedule mode — pick new slot.</span></div>
          <div style="display:flex;gap:9px;margin-top:13px"><button class="btn bp" id="bookBtn" onclick="bookSlot()"><svg class="icon"><use href="#i-check"/></svg> <span id="bookBtnLabel">Book into selected slot</span></button><button class="btn hideblock" id="reschBtn" style="display:none" onclick="startResch()"><svg class="icon"><use href="#i-repeat"/></svg> Reschedule</button></div>
        </div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-check"/></svg> Visited status <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g3">
          <div class="fld"><label class="lbl">Visited status <span class="ab">AUTO</span></label><div class="pills" id="visStatusPills" style="pointer-events:none"><button class="pill p-vio on" type="button">Open</button><button class="pill p-ok" type="button">Visited</button></div><div style="font-size:11px;color:var(--faint);margin-top:4px">Set automatically when the receptionist confirms check-in.</div></div>
          <div class="fld"><label class="lbl">Visited date <span class="ab">AUTO</span></label><input class="input" id="visDt" readonly placeholder="— set on Visited"></div>
        </div></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-check"/></svg> Enrolled status <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g3">
          <div class="fld"><label class="lbl">Enrolled status <span class="ab">AUTO</span></label><div class="pills" id="enrStatusPills" style="pointer-events:none"><button class="pill p-vio on" type="button">Open</button><button class="pill p-ok" type="button">Enrolled</button></div><div style="font-size:11px;color:var(--faint);margin-top:4px">Set automatically when the health coach marks the client Enrolled.</div></div>
          <div class="fld"><label class="lbl">Enrolled date &amp; time <span class="ab">AUTO</span></label><input class="input" id="enrDt" readonly placeholder="— set on Enrolled"></div>
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
        <div class="sec-bd"><div class="tscroll js-actlog" id="actLog" style="margin-top:12px;max-height:420px"><table class="tbl" style="min-width:640px"><thead><tr><th style="width:132px">Action</th><th>Details</th><th style="width:140px">Actor</th><th style="width:186px">Date &amp; Time (IST)</th></tr></thead><tbody><tr><td colspan="4" style="text-align:center;color:var(--faint);padding:24px">No activity recorded for this lead yet.</td></tr></tbody></table></div></div></div>

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
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-phone"/></svg> Call logs &amp; recordings <span class="chipb ok" style="margin-left:auto">Auto-captured</span></div>
        <div class="sec-bd" id="advCallLog"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No call records for this lead yet.</div></div></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-clock"/></svg> History of activity</div>
        <div class="sec-bd"><div class="tscroll js-actlog" style="margin-top:4px;max-height:420px"><table class="tbl" style="min-width:640px"><thead><tr><th style="width:132px">Action</th><th>Details</th><th style="width:140px">Actor</th><th style="width:186px">Date &amp; Time (IST)</th></tr></thead><tbody><tr><td colspan="4" style="text-align:center;color:var(--faint);padding:24px">No activity recorded for this lead yet.</td></tr></tbody></table></div></div></div>
    </div>
    </div><!-- /advDetailPane -->
    </div><!-- /flex row -->
  </div></section>

  <!-- COACH -->
  <section class="screen" id="s-coach"><div class="wrap">
    <div id="coachFilters" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
      <input class="input" type="date" id="coFrom" style="height:30px;font-size:12px;width:145px" title="Visited from">
      <span style="color:var(--faint);font-size:12px">→</span>
      <input class="input" type="date" id="coTo" style="height:30px;font-size:12px;width:145px" title="Visited to">
      <select class="select" id="coCoach" style="height:30px;font-size:12px;width:150px"><option value="all">All health coaches</option></select>
      <select class="select" id="coStatus" style="height:30px;font-size:12px;width:150px"><option value="all">All statuses</option></select>
      <select class="select" id="coSource" style="height:30px;font-size:12px;width:140px"><option value="all">All sources</option></select>
      <select class="select" id="coService" style="height:30px;font-size:12px;width:140px"><option value="all">All services</option></select>
      <button class="btn bsm bp" onclick="window._coachFilterApply()">Apply</button>
      <button class="btn bsm" onclick="window._coachFilterClear()">Clear</button>
      <input class="input" id="coSearch" placeholder="Search client / phone…" style="height:30px;font-size:12px;width:200px;margin-left:auto" oninput="window._coachSearch()">
    </div>
    <div class="sec" style="margin-bottom:14px" id="coachDashSec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-chart"/></svg> Health Coach dashboard <span style="font-size:11px;color:var(--faint);font-weight:400;margin-left:8px">By consultation status &amp; program · click a card to filter</span>
      <div class="pills" id="coachViewToggle" style="margin-left:auto;flex-shrink:0"></div>
      <select class="select" id="coachConsFilter" style="height:30px;font-size:12px;width:210px;margin-left:8px;flex-shrink:0" title="Filter by consultation status" onchange="window._coachConsFilter(this.value)"></select></div>
      <div class="sec-bd"><div class="metrics" id="coachDash" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin:0"></div></div></div>
    <div class="sec" style="margin-bottom:14px" id="coachClientsSec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Visited clients <span class="chipb ok" id="coachCliCount" style="margin-left:8px">0</span>
      <input class="input" id="coCliSearch" placeholder="Search client / phone / coach…" style="height:30px;font-size:12px;width:250px;margin-left:auto" oninput="window._coachCliSearch()">
      <button class="btn bsm" style="margin-left:8px" onclick="window._coachCliDownload()">⬇ Download</button></div>
      <div class="sec-bd">
        <div id="coachCliTableWrap">
          <div class="tscroll stick1"><table class="tbl" style="min-width:860px"><thead><tr id="coachClientsHead"></tr></thead><tbody id="coachClientsBody"></tbody></table></div>
          <div id="coachCliPager" style="display:flex;gap:10px;margin-top:12px;align-items:center;justify-content:center;flex-wrap:wrap">
            <button class="btn bsm" id="coachCliFirstBtn" onclick="window._coachCliPage('first')">« First</button>
            <button class="btn bsm" id="coachCliPrevBtn" onclick="window._coachCliPage(-1)">← Previous</button>
            <span style="font-size:12.5px;font-weight:600;color:var(--ink)" id="coachCliPageInfo">Page 1 of 1</span>
            <button class="btn bsm" id="coachCliNextBtn" onclick="window._coachCliPage(1)">Next →</button>
            <button class="btn bsm" id="coachCliLastBtn" onclick="window._coachCliPage('last')">Last »</button>
          </div>
        </div>
        <div id="coachKanban" style="display:none;overflow-x:auto"></div>
      </div></div>
    <div class="sec" style="margin-bottom:14px" id="zoomCiSecAdv"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-door"/></svg> Zoom check-in <span class="chipb neu zoomCiCount" style="margin-left:8px">0</span><span style="margin-left:auto;font-size:11px;color:var(--faint)">Appointments fixed as “Appointment Fixed – Zoom” · checked in by Reception</span></div>
      <div class="sec-bd"><div class="tscroll"><table class="tbl" style="min-width:520px"><thead><tr><th>Client</th><th>Phone</th><th>Appointment Fixed Date &amp; Time</th><th>Status</th></tr></thead><tbody id="zoomCiListAdv"></tbody></table></div></div></div>
    <div class="chead">
      <span class="cav" id="coachAv" style="background:linear-gradient(135deg,#378ADD,#185FA5)">—</span>
      <div class="cmeta"><h1 id="coachName">No client open</h1>
        <div class="sub" id="coachSub"><span class="mono">Pick a visited client from the table above</span></div>
        <div class="cbadges" id="coachBadges"></div></div>
      <div class="cacts"><span class="chipb vio" id="coachBadge" style="height:30px">Status: —</span><button class="btn bp" id="coachCallBtn"><svg class="icon"><use href="#i-phone"/></svg> <span>Call</span></button><button class="btn bwa"><svg class="icon"><use href="#i-msg"/></svg> WA</button></div>
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
            <div class="fld"><label class="lbl">Duration of diabetes <span class="req">*</span></label><select class="select" id="haDuration"><option value="">-- Select --</option><option>Newly Diagnosed</option><option>1–3 yrs</option><option>3–5 yrs</option><option>5–10 yrs</option><option>10+ yrs</option></select></div>
            <div class="fld"><label class="lbl">Family history</label><select class="select"><option>None</option><option selected>Father</option><option>Mother</option><option>Both Parents</option><option>Sibling</option></select></div>
            <div class="fld"><label class="lbl">Height (cm)</label><input class="input mono" id="haHeight" inputmode="decimal" oninput="window._numOnly(this);window._haBmiCalc()"></div>
            <div class="fld"><label class="lbl">Weight (kg)</label><input class="input mono" id="haWeight" inputmode="decimal" oninput="window._numOnly(this);window._haBmiCalc()"></div>
            <div class="fld"><label class="lbl">BMI <span class="ab">AUTO</span></label><input class="input mono" id="haBmi" readonly></div>
            <div class="fld"><label class="lbl">BP</label><input class="input mono" id="haBp"></div>
            <div class="fld"><label class="lbl">Pulse</label><input class="input mono" id="haPulse" inputmode="numeric" oninput="window._numOnly(this)"></div>
            <div class="fld"><label class="lbl">Temp</label><input class="input mono" id="haTemp" inputmode="decimal" oninput="window._numOnly(this)"></div></div></div>
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
            <div class="fld" id="reviewDateFld" style="display:none"><label class="lbl">Review date <span class="ab">for join / this-week / month plans</span></label><input class="input" type="date" id="haReviewDate" data-future="1"></div>
            <div class="fld"><label class="lbl">Recording status</label><div class="pills"><button class="pill p-vio on">Open</button><button class="pill p-ok">Done</button><button class="pill p-al">Not Done</button></div></div>
          </div>
          <div class="mic" style="flex-wrap:wrap;gap:8px"><button class="micb" id="micBtn" onclick="window._ovrToggle()"><svg class="icon" style="width:19px;height:19px"><use href="#i-mic"/></svg></button>
            <div style="flex:1;min-width:180px"><b style="font-size:13px" id="micTxt">Start office-visit recording</b><div style="font-size:11.5px;color:var(--muted)"><span id="ovrStatus">In-clinic Audio — Auto-saved to this Customer Profile</span> <span id="ovrTimer" class="mono" style="margin-left:6px;color:var(--alert);font-weight:700"></span></div></div>
            <button class="btn bsm bp" id="ovrStartBtn" onclick="window._ovrToggle()">● Start Recording</button>
            <button class="btn bsm" id="ovrStopBtn" onclick="window._ovrStop()" style="display:none">■ Stop Recording</button>
            <input class="input" id="coachRecUrl" style="max-width:220px" placeholder="https://zoom.us/rec/… or call recording"><button class="btn bsm bp" id="coachSaveZoomBtn" onclick="window._coachSaveZoomLink()" style="margin-left:6px;white-space:nowrap">Save Link</button></div>
          <div id="ovrList" style="margin-top:8px"></div>

          <div class="fld"><label class="lbl">Consultation status — drives payment &amp; follow-up flow</label>
            <div class="pills" id="consStatus">
              <button class="pill p-vio on" onclick="consAct('open',this)">Open</button>
              <button class="pill p-ok" onclick="consAct('join',this)">Will Join Immediately</button>
              <button class="pill p-vio" onclick="consAct('fup',this)">This Week</button>
              <button class="pill p-info" onclick="consAct('fup',this)">End of Month</button>
              <button class="pill p-warn" onclick="consAct('fup',this)">Next Month</button>
              <button class="pill p-ok" style="display:none" onclick="consAct('enrol1',this)">Enrolled – L1</button>
              <button class="pill p-ok" style="display:none" onclick="consAct('enrol2',this)">Enrolled – L2</button>
              <button class="pill p-info" onclick="consAct('paidb',this)">Already Paid – Before Consultation</button>
              <button class="pill p-info" onclick="consAct('paida',this)">Already Paid – After Consultation</button>
              <button class="pill p-al" onclick="consAct('ni',this)">Not Interested</button>
              <button class="pill p-al" onclick="consAct('refund',this)">Refund</button>
            </div></div>
          <div class="banner plan hideblock" id="coachFu" style="display:none;flex-direction:column;align-items:stretch;gap:10px">
            <div style="display:flex;gap:9px;align-items:center"><svg class="icon" style="width:16px;height:16px"><use href="#i-repeat"/></svg><b>Strong follow-up flow — auto-created plan (committed but not paid)</b></div>
            <div class="g4" style="gap:10px">
              <div><label class="lbl" style="color:var(--vio-ink)">Commitment date *</label><input class="input" style="height:36px" type="date" id="fuCommitDate" data-future="1"></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Owner</label><select class="select" style="height:36px" id="fuOwner"><option selected>-- Select --</option></select></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Blocker</label><select class="select" style="height:36px"><option>Budget / salary date</option><option>Family discussion</option><option>Travel</option><option>Comparing options</option></select></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Hold offer till</label><input class="input" style="height:36px" type="date" data-future="1"></div>
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
            <div class="fld"><label class="lbl">Program suggested</label><select class="select" id="haProgram" onchange="window._syncProgramPricing()"><option>L1</option><option selected>L2</option><option>L1 + L2</option></select></div>
            <div class="fld"><label class="lbl">L1 price · full only</label><select class="select" id="haL1Price" onchange="window._payCalcAll()"><option>₹3,999 (Standard)</option><option>₹3,500 (Offer)</option><option>Special Offer</option></select></div>
            <div class="fld"><label class="lbl">Special offer amt (₹)</label><input class="input mono" id="haSpecialAmt" inputmode="numeric" maxlength="9" placeholder="0" oninput="window._numOnly(this);window._payCalcAll()"></div>
            <div class="fld"><label class="lbl">L2 price (₹)</label><input class="input mono" id="haL2Price" inputmode="decimal" oninput="window._numOnly(this);window._payCalcAll()"></div>
            <div class="fld" style="grid-column:span 2"><label class="lbl">Coupon code — special discount <span class="nb">NEW</span></label>
              <div style="display:flex;gap:7px"><input class="input mono" id="coupon" placeholder="e.g. FEST2000"><button class="btn" style="height:39px;flex:none" onclick="applyCoupon()">Apply</button></div>
              <div id="couponRes" style="font-size:11.5px;font-weight:600;margin-top:6px;display:flex;gap:7px;flex-wrap:wrap;align-items:center"></div></div>
            <div class="fld"><label class="lbl">Client category</label><select class="select"><option>-- Select --</option><option>VIP</option><option>Staff Relatives</option><option>Officers</option><option>Complicated</option></select></div>
            <div class="fld"><label class="lbl">Date of joining</label><input class="input" type="date" data-future="1"></div>
            <div class="fld"><label class="lbl">Access planned</label><input class="input" type="date" data-future="1"></div>
            <div class="fld"><label class="lbl">Attended by <span class="ab">AUTO</span></label><input class="input" id="haAttendedBy2" readonly></div>
          </div>
        </div></div>

      <div class="sec hideblock" id="paySec" style="display:none"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-wallet"/></svg> Payment — <span id="payFlowLbl">standard</span> collection flow <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div id="coachPaySummary"></div>
          <div class="steps"><div class="step on"><span class="n">1</span> Quote (auto from price master)</div><div class="step on"><span class="n">2</span> Collect — Reception desk / Razorpay link / EMI provider</div><div class="step"><span class="n">3</span> Attach proof *</div><div class="step"><span class="n">4</span> Accounts verifies vs bank</div><div class="step"><span class="n">5</span> Auto receipt + GST invoice</div></div>
          <div class="banner good" style="margin-top:10px"><svg class="icon" style="width:15px;height:15px"><use href="#i-check"/></svg> <span><b>Who collects:</b> Reception or Razorpay link — never the coach. Coach closes, Reception/link collects, Accounts verifies. Cash gets a numbered desk receipt; nothing is "received" until proof + ref are attached.</span></div>
          <div class="g3" style="margin-top:6px">
            <div class="fld"><label class="lbl">Payment method</label>
              <select class="select" id="payMethod" onchange="payBlk(this.value)"><option value="">-- Select --</option><option value="full" selected>Full Payment (1 Shot)</option><option value="i2">Installment (2x)</option><option value="emi">EMI (BFL / SaveIn)</option><option value="adv">Advance Booking</option></select></div>
            <div class="fld"><label class="lbl">Collected by</label><select class="select" id="collectedBy"><option selected>Reception desk</option><option>Razorpay link (online)</option><option>EMI provider</option><option>POS Machine</option></select></div>
            <div class="fld"><label class="lbl">Accounts team verification</label><div class="pills" id="payVerify"><button class="pill p-warn on" onclick="window._payVerify('pending',this)">Pending</button><button class="pill p-ok" onclick="window._payVerify('verified',this)">Verified</button></div></div>
          </div>
          <div style="display:flex;gap:10px;margin-top:12px;align-items:center;flex-wrap:wrap">
            <button class="btn bsm bp" id="sendCollectBtn" onclick="sendToReception()"><svg class="icon" style="width:14px;height:14px"><use href="#i-coin"/></svg> Send collection request to Reception</button>
            <span style="font-size:11.5px;color:var(--muted)">Appears instantly in <b>Reception → Collect payment</b> queue with client, plan &amp; amount</span>
          </div>

          <div class="payblk on" id="pb-full"><div class="pt"><svg class="icon" style="width:15px;height:15px"><use href="#i-coin"/></svg> Full payment</div>
            <div class="g4">
              <div class="fld"><label class="lbl">Amount due <span class="ab">AUTO</span></label><input class="input mono" id="payAmtDue" readonly></div>
              <div class="fld"><label class="lbl">Amount received (₹) <span class="req">*</span></label><input class="input mono" id="payFullRcvd" inputmode="decimal" oninput="window._payAmtRcvd(this,'#payAmtDue','#payFullRcvdErr');window._payCalcFull()"><div id="payFullRcvdErr" style="display:none;color:var(--alert);font-size:11px;margin-top:3px"></div></div>
              <div class="fld"><label class="lbl">Mode <span class="req">*</span></label><select class="select" id="payFullMode"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Cheque</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" id="payFullRef" placeholder="Mandatory"></div>
              <div class="fld"><label class="lbl">Actual paid date</label><input class="input" type="date" id="payFullDate"></div>
              <div class="fld fw"><label class="lbl">Payment proof — attachment * <span class="nb">NEW</span></label><div class="atts" id="payFullProof"><span class="att add" onclick="window._payAttach('payFullProof')"><svg class="icon"><use href="#i-clip"/></svg> Attach screenshot / receipt</span></div></div>
              <div class="fld fw"><label class="lbl">Status <span class="req">*</span></label><select class="select" data-nocap onchange="window._payStSel(this)" style="max-width:260px"><option>Payment Done</option><option selected>In Process</option><option>Pending</option></select><div class="pills" style="display:none"><button class="pill p-ok">Payment Done</button><button class="pill p-warn on">In Process</button><button class="pill">Pending</button></div></div>
            </div></div>

          <div class="payblk" id="pb-i2"><div class="pt"><svg class="icon" style="width:15px;height:15px"><use href="#i-coin"/></svg> Installment (2x) — balance never untracked</div>
            <div class="aud" style="background:#fff;margin-top:8px"><div class="ahd">Part 1 — Installment 1 (collected now)</div><div class="g4">
              <div class="fld"><label class="lbl">Total</label><input class="input mono" id="i2Total" placeholder="Enter total amount" inputmode="decimal" oninput="window._payCalcI2()"></div>
              <div class="fld"><label class="lbl">Inst-1 received (₹) <span class="req">*</span></label><input class="input mono" id="i2Inst1Rcvd" placeholder="e.g. 16000" inputmode="decimal" oninput="window._payAmtRcvd(this,'#i2Total','#i2Inst1RcvdErr');window._payCalcI2()"><div id="i2Inst1RcvdErr" style="display:none;color:var(--alert);font-size:11px;margin-top:3px"></div></div>
              <div class="fld"><label class="lbl">Mode <span class="req">*</span></label><select class="select" id="i2Inst1Mode"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Inst-1 date</label><input class="input" type="date" id="i2Inst1Date" onchange="window._syncI2BalDue()"></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" id="i2Inst1Ref" placeholder="Mandatory"></div>
              <div class="fld" style="grid-column:span 3"><label class="lbl">Inst-1 proof *</label><div class="atts" id="i2Inst1Proof"><span class="att add" onclick="window._payAttach('i2Inst1Proof')"><svg class="icon"><use href="#i-clip"/></svg> Attach proof</span></div></div>
            </div></div>
            <div class="aud" style="background:#fff"><div class="ahd" style="color:var(--warn-ink)">Part 2 — Balance collection (separate fields · auto-reminders from Accounts)</div><div class="g4">
              <div class="fld"><label class="lbl">Balance due <span class="ab">AUTO</span></label><input class="input mono" id="i2BalDue" readonly></div>
              <div class="fld"><label class="lbl">Balance due date <span class="ab">AUTO · +30d</span></label><input class="input mono" type="text" id="i2BalDueDate" readonly placeholder="30 days after Inst-1 date" title="Auto-calculated: Installment-1 date + 30 days"></div>
              <div class="fld"><label class="lbl">Balance received (₹)</label><input class="input mono" id="i2BalRcvd" inputmode="decimal" oninput="window._payAmtRcvd(this,'#i2BalDue','#i2BalRcvdErr')"><div id="i2BalRcvdErr" style="display:none;color:var(--alert);font-size:11px;margin-top:3px"></div></div>
              <div class="fld"><label class="lbl">Mode</label><select class="select" id="i2BalMode"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Balance paid date</label><input class="input" type="date" id="i2BalDate"></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" id="i2BalRef" placeholder="Mandatory"></div>
              <div class="fld" style="grid-column:span 2"><label class="lbl">Balance proof *</label><div class="atts" id="i2BalProof"><span class="att add" onclick="window._payAttach('i2BalProof')"><svg class="icon"><use href="#i-clip"/></svg> Attach proof</span></div></div>
            </div></div>
            <div class="fld fw"><label class="lbl">Status <span class="req">*</span></label><select class="select" data-nocap onchange="window._payStSel(this)" style="max-width:260px"><option>1st Paid</option><option>2nd Paid</option><option>Both Paid</option><option>In Process</option><option selected>Pending</option></select><div class="pills" style="display:none"><button class="pill p-info">1st Paid</button><button class="pill p-info">2nd Paid</button><button class="pill p-ok">Both Paid</button><button class="pill p-warn">In Process</button><button class="pill on">Pending</button></div></div>
            </div>

          <div class="payblk" id="pb-emi"><div class="pt"><svg class="icon" style="width:15px;height:15px"><use href="#i-coin"/></svg> EMI (BFL / SaveIn) — client pays financier; we track down payment &amp; disbursement</div>
            <div class="g4">
              <div class="fld"><label class="lbl">Provider</label><select class="select"><option selected>BFL (Bajaj Finserv)</option><option>SaveIn</option></select></div>
              <div class="fld"><label class="lbl">Eligibility (provider tool)</label><div class="pills"><button class="pill p-ok on">Eligible</button><button class="pill p-al">Not Eligible</button></div></div>
              <div class="fld" style="grid-column:span 2"><label class="lbl">Coupon code <span class="nb">NEW</span></label>
                <div style="display:flex;gap:7px"><input class="input mono" id="emiCoupon" placeholder="e.g. FEST2000"><button class="btn" style="height:39px;flex:none" onclick="applyCouponEmi()">Apply</button></div>
                <div id="emiCouponRes" style="font-size:11.5px;font-weight:600;margin-top:6px;display:flex;gap:7px;flex-wrap:wrap;align-items:center"></div></div>
              <div class="fld"><label class="lbl">Program cost <span class="ab">AUTO</span></label><input class="input mono" id="emiCost" readonly></div>
              <div class="fld"><label class="lbl">Down payment (₹) — drives calculator <span class="req">*</span></label><input class="input mono" id="emiDown" placeholder="e.g. 5000" inputmode="decimal" oninput="window._numOnly(this);emiCalc()"></div>
              <div class="fld"><label class="lbl">Financed balance <span class="ab">AUTO</span></label><input class="input mono" id="emiRemain" readonly></div>
              <div class="fld"><label class="lbl">Tenure (months) — drives calculator</label><select class="select" id="emiTenure" onchange="emiCalc()"><option value="">--</option><option>3</option><option>6</option><option>9</option><option>12</option></select></div>
              <div class="fld"><label class="lbl">EMI / month <span class="ab">AUTO calculated</span></label><input class="input mono" id="emiPer" readonly></div>
              <div class="fld"><label class="lbl">Documentation date</label><input class="input" type="date"></div>
              <div class="fld"><label class="lbl">Disbursement ETA <span class="ab">24–48h</span></label><input class="input" type="date" data-future="1"></div>
              <div class="fld"><label class="lbl">Net after subvention <span class="ab">AUTO</span></label><input class="input mono" id="emiNet" readonly></div>
              <div class="fld fw"><label class="lbl">Proof * — down-payment receipt + approval screen + disbursement credit</label><div class="atts" id="emiProofs"><span class="att add" onclick="window._payAttach('emiProofs')"><svg class="icon"><use href="#i-clip"/></svg> Attach down-payment proof</span><span class="att add" onclick="window._payAttach('emiProofs')"><svg class="icon"><use href="#i-clip"/></svg> Attach approval</span><span class="att add" onclick="window._payAttach('emiProofs')"><svg class="icon"><use href="#i-clip"/></svg> Attach credit proof</span></div></div>
              <div class="fld fw"><label class="lbl">EMI payment collection — status <span class="req">*</span></label><select class="select" data-nocap onchange="window._payStSel(this)" style="max-width:260px"><option selected>Open</option><option>EMI Received</option><option>EMI Process</option></select><div class="pills" style="display:none"><button class="pill p-vio on">Open</button><button class="pill p-ok">EMI Received</button><button class="pill p-warn">EMI Process</button></div></div>
            </div></div>

          <div class="payblk" id="pb-adv"><div class="pt"><svg class="icon" style="width:15px;height:15px"><use href="#i-coin"/></svg> Advance booking — locks the price, starts the clock</div>
            <div class="aud" style="background:#fff;margin-top:8px"><div class="ahd">Part 1 — Advance (collected now)</div><div class="g4">
              <div class="fld"><label class="lbl">Advance (₹2K–5K) <span class="req">*</span></label><input class="input mono" id="advAmt" placeholder="e.g. 2000" inputmode="numeric" maxlength="9" oninput="window._numOnly(this);window._payCalcAdv()"></div>
              <div class="fld"><label class="lbl">Mode <span class="req">*</span></label><select class="select" id="advMode"><option>Cash</option><option selected>UPI</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Advance date</label><input class="input" type="date" id="advDate"></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" id="advRef" placeholder="Mandatory"></div>
              <div class="fld fw"><label class="lbl">Advance proof *</label><div class="atts" id="advProof"><span class="att add" onclick="window._payAttach('advProof')"><svg class="icon"><use href="#i-clip"/></svg> Attach proof</span></div></div>
            </div></div>
            <div class="aud" style="background:#fff"><div class="ahd" style="color:var(--warn-ink)">Part 2 — Balance collection (separate fields · auto-reminders + Outstanding queue)</div><div class="g4">
              <div class="fld"><label class="lbl">Balance due <span class="ab">AUTO</span></label><input class="input mono" id="advBalDue" readonly></div>
              <div class="fld"><label class="lbl">Balance due date *</label><input class="input" type="date" id="advBalDueDate" data-future="1"></div>
              <div class="fld"><label class="lbl">Balance received (₹)</label><input class="input mono" id="advBalRcvd" inputmode="decimal" oninput="window._payAmtRcvd(this,'#advBalDue','#advBalRcvdErr')"><div id="advBalRcvdErr" style="display:none;color:var(--alert);font-size:11px;margin-top:3px"></div></div>
              <div class="fld"><label class="lbl">Mode</label><select class="select" id="advBalMode"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl">Balance paid date</label><input class="input" type="date" id="advBalDate"></div>
              <div class="fld"><label class="lbl">Txn ref / UTR *</label><input class="input mono" id="advBalRef" placeholder="Mandatory"></div>
              <div class="fld" style="grid-column:span 2"><label class="lbl">Balance proof *</label><div class="atts" id="advBalProof"><span class="att add" onclick="window._payAttach('advBalProof')"><svg class="icon"><use href="#i-clip"/></svg> Attach proof</span></div></div>
            </div></div>
            <div class="fld fw"><label class="lbl">Status <span class="req">*</span></label><select class="select" data-nocap onchange="window._payStSel(this)" style="max-width:260px"><option>Advance Paid</option><option selected>Balance Pending</option><option>Fully Paid</option><option>Cancelled</option></select><div class="pills" style="display:none"><button class="pill p-ok">Advance Paid</button><button class="pill p-warn on">Balance Pending</button><button class="pill p-ok">Fully Paid</button><button class="pill p-al">Cancelled</button></div></div>
            </div>
        </div></div>

      <div class="sec" id="enrollStatusSec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-check"/></svg> Enrolled status <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g2">
          <div class="fld"><label class="lbl">Enrolled status <span class="ab">AUTO — set from payment</span></label>
            <div><span id="payEnrollChip" class="chipb neu">Not enrolled</span></div>
            <div style="font-size:11px;color:var(--faint);margin-top:6px">Enrolled – L1 / L2 is set automatically when this method's status is marked done (Full → Payment Done · Installment → 1st Paid · EMI → EMI Received · Advance → Fully Paid) for the selected program.</div></div>
          <div class="fld"><label class="lbl">Enrolled date &amp; time <span class="ab">AUTO</span></label><input class="input" id="payEnrollAt" readonly placeholder="— set on Enrolled"></div>
        </div></div></div>

      <div class="sec closed"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-chat"/></svg> Feedback call <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="fld"><label class="lbl">Call outcome</label>
            <div class="pills"><button class="pill p-ok">Attended — Feedback Collected</button><button class="pill p-warn">Not Attended — Rescheduled</button><button class="pill p-info">Call Back Requested</button><button class="pill p-al">Switched Off</button><button class="pill p-vio on">Open</button></div></div>
          <div class="g2"><div class="fld"><label class="lbl">Next feedback call</label><input class="input" type="datetime-local" data-future="1"></div></div>
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
    <div class="c-p" data-p="pay2" style="display:none"><div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-wallet"/></svg> Payment history</div><div class="sec-bd"><div id="coachPayHist"><div class="stub">No payment records for this client yet.</div></div></div></div></div>
    <div class="c-p" data-p="notes2" style="display:none"><div class="stub">Internal notes.</div></div>
    <div class="c-p" data-p="extra2" style="display:none"><div class="stub">Extra info.</div></div>
    <div class="c-p" data-p="calls2" style="display:none"><div class="sec"><div class="sec-hd" style="cursor:default;padding:10px 14px"><svg class="icon"><use href="#i-phone"/></svg> Call logs &amp; recordings <span class="chipb ok" style="margin-left:auto">Auto-captured</span></div><div class="sec-bd" id="coachCallLog"><div class="stub">No call records for this lead yet.</div></div></div></div>
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
        <select class="select" id="impService" style="height:33px;font-size:12px;width:150px"><option value="all">All Services</option><option>Diabetes Counselling</option><option>Weight Loss Counselling</option><option>Sauna Bath</option><option>Physiotherapy</option><option>Cold Plunge</option><option>Blood Test</option><option>HBOT (Hyperbaric Oxygen Therapy)</option></select>
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
          <div><div class="g2" style="gap:9px;margin-top:0"><select class="select" id="csvSource"><option>Meta</option><option>Website</option><option>WhatsApp</option><option>Walk-in</option></select><select class="select" id="csvBranch"><option>Chennai</option><option>Coimbatore</option><option>Madurai</option></select><select class="select" id="csvBatch"><option>WK-JUN-04</option><option>WK-JUN-03</option><option>WK-JUL-01</option></select><select class="select" id="csvService"><option>Diabetes Counselling</option><option>Weight Loss Counselling</option><option>Sauna Bath</option><option>Physiotherapy</option><option>Cold Plunge</option><option>Blood Test</option><option>HBOT (Hyperbaric Oxygen Therapy)</option></select></div>
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
            <div class="tscroll"><table class="tbl" style="min-width:1180px"><thead><tr id="csvImportedHead"><th style="width:30px"></th><th>Date &amp; Time</th><th>Campaign</th><th>Ad Name</th><th>Lead Name</th><th>Phone Number</th><th>Sugar Poll</th><th>City</th><th>Street</th><th>Source</th><th>Service</th><th>Name</th><th>Status</th><th>Action</th></tr></thead><tbody id="csvImportedBody"></tbody></table></div>
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
            <div class="tscroll"><table class="tbl" style="min-width:1180px"><thead><tr id="csvDupHead"><th style="width:30px"></th><th>Date &amp; Time</th><th>Campaign</th><th>Lead Name</th><th>Phone Number</th><th>Sugar Poll</th><th>City</th><th>Source</th><th>Service</th><th>Status</th><th>Action</th></tr></thead><tbody id="csvDupBody"></tbody></table></div>
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
            <div class="tscroll"><table class="tbl" style="min-width:980px"><thead><tr id="csvHistHead"><th>Imported at (IST)</th><th>File name</th><th>Batch</th><th>By</th><th>Total</th><th>Valid</th><th>Duplicate</th><th>Actions</th></tr></thead><tbody id="csvHistBody"></tbody></table></div>
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
            <div class="tscroll stick1"><table class="tbl" style="min-width:920px"><thead><tr id="rvHead"><th>Lead Number</th><th>Lead Name</th><th>Total Visits</th><th>First Visit Date</th><th>Last Visit Date</th><th>Repeat Visitor</th></tr></thead><tbody id="rvBody"></tbody></table></div>
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
        <div class="sec-bd">
          <div style="margin-bottom:10px"><input class="input" id="poolSearch" placeholder="Search lead / number…" style="height:30px;font-size:12px;width:250px" oninput="window._poolSearch()"></div>
          <div class="tscroll"><table class="tbl"><thead><tr id="poolHead"><th style="width:34px"><input type="checkbox" id="poolSelAll" style="accent-color:var(--brand)"></th><th>Lead</th><th>Leads Number</th><th>Date &amp; Time</th><th>Source · lang</th><th>Sugar</th><th>Waiting</th><th style="width:150px">Action</th></tr></thead><tbody id="unassignedPoolBody">
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
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Advisor load <span style="font-size:11px;color:var(--faint);font-weight:500;margin-left:6px">— click an advisor to see their leads below</span></div>
        <div class="sec-bd"><div class="tscroll"><table class="tbl"><thead><tr id="advLoadHead"><th>Advisor</th><th>Role</th><th>Branch</th><th>Active leads</th><th>Status</th></tr></thead><tbody id="advisorLoadBody"></tbody></table></div></div></div>
      <div class="sec" style="overflow:visible"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"/></svg> Advisor Load Leads <span id="advLeadsWho" style="font-size:11.5px;font-weight:600;color:var(--faint);margin-left:6px">— all advisors</span> <span class="chipb neu" id="advLeadsCount" style="margin-left:auto">0</span></div>
        <div class="sec-bd">
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
            <div style="display:flex;flex-direction:column;gap:3px">
              <span style="font-size:10.5px;font-weight:700;color:var(--faint);text-transform:uppercase;letter-spacing:.03em">Advisor</span>
              <div id="advLeadsAdvWrap" style="position:relative;width:220px">
                <button type="button" id="advLeadsAdvBtn" class="btn bsm" style="width:100%;justify-content:space-between;font-weight:500;height:31px" onclick="window._advLeadsAdvToggleMenu(event)"><span id="advLeadsAdvLabel">All Advisors</span><span style="color:var(--faint);font-size:11px">▾</span></button>
                <div id="advLeadsAdvMenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;width:100%;max-height:240px;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:10px;box-shadow:0 8px 24px rgba(17,34,27,.14);z-index:40;padding:4px"></div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:3px">
              <span style="font-size:10.5px;font-weight:700;color:var(--faint);text-transform:uppercase;letter-spacing:.03em">Lead search</span>
              <input class="input" id="advLeadsSearch" placeholder="Search leads…" oninput="window._advLeadsSearchFn(this.value)" style="height:31px;font-size:12px;width:230px">
            </div>
            <button class="btn bsm" onclick="window._advLeadsDownload()" style="margin-left:auto;align-self:flex-end">⬇ Download</button>
          </div>
          <div class="tscroll stick1"><table class="tbl" style="min-width:1360px"><thead><tr id="advLeadsHead"></tr></thead><tbody id="advLeadsBody"><tr><td colspan="11" style="text-align:center;color:var(--faint);padding:18px">Select an advisor in Advisor load to see their leads.</td></tr></tbody></table></div>
          <div id="advLeadsPager" style="display:flex;gap:10px;margin-top:12px;align-items:center;justify-content:center;flex-wrap:wrap">
            <button class="btn bsm" id="advLeadsFirstBtn" onclick="window._advLeadsPage('first')">« First</button>
            <button class="btn bsm" id="advLeadsPrevBtn" onclick="window._advLeadsPage(-1)">← Previous</button>
            <span style="font-size:12.5px;font-weight:600;color:var(--ink)" id="advLeadsPageInfo">Page 1 of 1</span>
            <button class="btn bsm" id="advLeadsNextBtn" onclick="window._advLeadsPage(1)">Next →</button>
            <button class="btn bsm" id="advLeadsLastBtn" onclick="window._advLeadsPage('last')">Last »</button>
          </div>
        </div></div>
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
            <div class="tscroll stick1"><table class="tbl" style="min-width:1200px"><thead><tr id="callDevHead"><th style="width:34px"><input type="checkbox" id="callDevSelAll" style="accent-color:var(--brand)" onchange="window._devSelAll('call',this.checked)"></th><th>Lead</th><th>Lead Number</th><th>Source · Lang</th><th>Stage</th><th>Status</th><th>Received Date &amp; Time</th><th>Deviation Time</th></tr></thead><tbody id="callDevBody"><tr><td colspan="8" style="text-align:center;color:var(--faint);padding:20px">Loading…</td></tr></tbody></table></div>
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
            <div class="tscroll stick1"><table class="tbl" style="min-width:1320px"><thead><tr id="leadDevHead"><th style="width:34px"><input type="checkbox" id="leadDevSelAll" style="accent-color:var(--brand)" onchange="window._devSelAll('lead',this.checked)"></th><th>Lead</th><th>Lead Number</th><th>Source · Lang</th><th>Assigned To</th><th>Stage</th><th>Status</th><th>Assigned Date &amp; Time</th><th>Deviation Time</th></tr></thead><tbody id="leadDevBody"><tr><td colspan="9" style="text-align:center;color:var(--faint);padding:20px">Loading…</td></tr></tbody></table></div>
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
    <div class="sec" style="margin-top:0"><div class="sec-hd" onclick="togSec(this)" style="padding:10px 14px"><svg class="icon"><use href="#i-cal"/></svg> Appointments <span class="chipb info" style="margin-left:6px" id="apptCount">0</span> <span style="margin-left:auto;font-size:11px;color:var(--faint)">Click row → full record</span> <input class="input" id="apptSearch" placeholder="Search lead number…" onclick="event.stopPropagation()" oninput="window._apptSearch(this.value)" style="height:32px;max-width:220px;margin-left:12px;font-size:12px"> <span class="arr">▾</span></div>
      <div class="ftable-wrap" id="apptWrap" style="max-height:380px"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
      <div>
        <div class="sec" style="margin-top:0"><div class="sec-hd" onclick="togSec(this)" style="padding:10px 14px"><svg class="icon"><use href="#i-user"/></svg> Client cross-check <span class="arr">▾</span></div>
          <div class="sec-bd" style="padding:4px 14px 14px"><div style="display:flex;gap:7px"><input class="input" id="ccQ" style="height:35px" placeholder="Try: 98412 or 99999 or Prasad"><button class="btn bsm bp" onclick="ccSearch()">Search</button></div><div id="ccRes" style="margin-top:8px"></div></div></div>
        <div class="sec hideblock" id="nwPanel" style="display:none"><div class="sec-hd" style="cursor:default;padding:10px 14px"><svg class="icon"><use href="#i-door"/></svg> CLIENT REGISTRATION FORM</div>
          <div class="sec-bd" style="padding:4px 14px 14px">
            <div id="nwStepNav" class="tabs" style="flex-wrap:nowrap;width:100%;overflow-x:auto;gap:6px;margin:2px 0 12px">
              <button type="button" class="on" data-step="1" onclick="window._nwStep(1)" style="flex:1 1 auto;white-space:nowrap;padding:8px 12px;font-size:12px;text-align:center">1 · Client Details</button>
              <button type="button" data-step="2" onclick="window._nwStep(2)" style="flex:1 1 auto;white-space:nowrap;padding:8px 12px;font-size:12px;text-align:center">2 · Service Selected</button>
              <button type="button" data-step="3" onclick="window._nwStep(3)" style="flex:1 1 auto;white-space:nowrap;padding:8px 12px;font-size:12px;text-align:center">3 · Data Privacy Consent</button>
              <button type="button" data-step="4" onclick="window._nwStep(4)" style="flex:1 1 auto;white-space:nowrap;padding:8px 12px;font-size:12px;text-align:center">4 · General Declaration</button>
            </div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
              <div style="flex:1;height:6px;background:var(--surface-2,#eef1ef);border-radius:4px;overflow:hidden"><div id="nwProgressBar" style="height:100%;width:25%;background:linear-gradient(90deg,#129468,var(--brand-600));transition:width .25s var(--ease)"></div></div>
              <span id="nwProgressLbl" style="font-size:11px;font-weight:600;color:var(--muted);white-space:nowrap">Step 1 of 4</span>
            </div>
            <div class="nwStep" data-step="1">
              <div class="nwGrpHd">Personal details</div>
              <div class="g4" style="gap:10px 12px">
                <div class="fld"><label class="lbl">Client ID</label><input class="input mono" style="height:38px" id="nwClientId" readonly placeholder="auto"></div>
                <div class="fld"><label class="lbl">Name *</label><input class="input" style="height:38px" id="nwName"></div>
                <div class="fld"><label class="lbl">Phone *</label><input class="input mono" style="height:38px" id="nwPhone" type="tel" inputmode="numeric" maxlength="10" placeholder="10-digit mobile" oninput="window._digitsOnly(this)"></div>
                <div class="fld"><label class="lbl">WhatsApp</label><input class="input mono" style="height:38px" id="nwWhats" type="tel" inputmode="numeric" maxlength="15" oninput="window._digitsOnly(this)"></div>
                <div class="fld"><label class="lbl">Email</label><input class="input" style="height:38px" id="nwEmail" type="email" placeholder="email@example.com"></div>
                <div class="fld"><label class="lbl">Gender</label><select class="select" style="height:38px" id="nwGender"><option>Male</option><option>Female</option><option>Other</option></select></div>
                <div class="fld"><label class="lbl">Age</label><input class="input mono" style="height:38px" id="nwAge" type="number" min="1" max="120" placeholder="42"></div>
                <div class="fld"><label class="lbl">Occupation</label><select class="select" style="height:38px" id="nwOccupation"><option>Business</option><option>Private Job</option><option>Govt</option><option>Homemaker</option><option>Others</option></select></div>
              </div>
              <div class="nwGrpHd">Address &amp; source</div>
              <div class="g4" style="gap:10px 12px">
                <div class="fld"><label class="lbl">Language</label><select class="select" style="height:38px" id="nwLang"><option>Tamil</option><option>Telugu</option><option>Hindi</option></select></div>
                <div class="fld"><label class="lbl">Lead source</label><select class="select" style="height:38px" id="nwSource"><option selected>Direct Walk-in</option><option>Referral</option><option>Phone Enquiry</option></select></div>
                <div class="fld"><label class="lbl">Location</label><select class="select" style="height:38px" id="nwLocation"><option>Poonamalle</option><option>Porur</option></select></div>
                <div class="fld"><label class="lbl">Address</label><input class="input" style="height:38px" id="nwAddress" placeholder="Street, area, city, ZIP"></div>
              </div>
              <div class="nwGrpHd">Service &amp; booking</div>
              <div class="fld"><label class="lbl">Service(s)</label><div class="chips" id="nwSvc"><button class="chip-o on" data-svc="dia">🩺 Diabetes</button><button class="chip-o" data-svc="bt">🩸 Blood test</button><button class="chip-o" data-svc="physio">💪 Physio</button></div></div>
              <div class="g4" style="gap:10px 12px;margin-top:10px">
                <div class="fld"><label class="lbl">Date</label><input class="input" type="date" style="height:38px" id="nwDate"></div>
                <div class="fld"><label class="lbl">Time</label><select class="select" style="height:38px" id="nwTime"><option>9:00 AM</option><option>9:30 AM</option><option selected>10:00 AM</option><option>10:30 AM</option><option>11:00 AM</option><option>11:30 AM</option><option>2:00 PM</option><option>2:30 PM</option><option>3:00 PM</option></select></div>
                <div class="fld"><label class="lbl">Provider</label><select class="select" style="height:38px" id="nwProv"><option>Dr. Suresh</option><option>Dr. Priya</option><option>Ganesh (PT)</option></select></div>
                <div class="fld"><label class="lbl">&nbsp;</label><button class="btn bsm bp" onclick="nwCheckSlot()" style="width:100%;height:38px">Check slot</button></div>
              </div>
              <div id="nwSlotRes" style="margin-top:8px"></div>
              <div class="nwGrpHd">Payment</div>
              <div class="g3" style="gap:10px 12px">
                <div class="fld"><label class="lbl">Cost <span class="ab">Settings</span></label><input class="input mono" style="height:38px" id="nwCost" value="₹0 (free)" readonly></div>
                <div class="fld"><label class="lbl">Coupon</label><div style="display:flex;gap:4px"><input class="input mono" style="height:38px" id="nwCoupon" placeholder="Code"><button class="btn bsm" style="height:38px" onclick="toast('Coupon applied · ₹200 off')">Apply</button></div></div>
                <div class="fld"><label class="lbl">Net</label><input class="input mono" style="height:38px" value="₹0" readonly></div>
              </div>
            </div>
            <div class="nwStep" data-step="2" style="display:none">
              <div class="nwGrpHd">Service selected today</div>
              <div style="font-size:12px;color:var(--muted);margin:-2px 0 10px">Please tick all the services the client is visiting for today.</div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px 12px">
                <label class="nwChk"><input type="checkbox" data-svc2="Diabetes Counselling"> Diabetes Counselling</label>
                <label class="nwChk"><input type="checkbox" data-svc2="Weight Loss Counselling"> Weight Loss Counselling</label>
                <label class="nwChk"><input type="checkbox" data-svc2="Sauna Bath"> Sauna Bath</label>
                <label class="nwChk"><input type="checkbox" data-svc2="Cold Plunge"> Cold Plunge</label>
                <label class="nwChk"><input type="checkbox" data-svc2="Physiotherapy"> Physiotherapy</label>
                <label class="nwChk"><input type="checkbox" data-svc2="Blood Test"> Blood Test</label>
                <label class="nwChk"><input type="checkbox" data-svc2="HBOT (Hyperbaric Oxygen Therapy)"> HBOT (Hyperbaric Oxygen Therapy)</label>
              </div>
              <div class="nwGrpHd">How did you hear about us?</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px 10px">
                <label class="nwChk"><input type="checkbox" data-hear="Doctor"> Doctor</label>
                <label class="nwChk"><input type="checkbox" data-hear="Friend"> Friend</label>
                <label class="nwChk"><input type="checkbox" data-hear="Social Media"> Social Media</label>
                <label class="nwChk"><input type="checkbox" data-hear="Google"> Google</label>
                <label class="nwChk"><input type="checkbox" data-hear="Website"> Website</label>
                <label class="nwChk"><input type="checkbox" data-hear="MHS"> MHS</label>
                <label class="nwChk"><input type="checkbox" data-hear="Walk-in"> Walk-in</label>
              </div>
            </div>
            <div class="nwStep" data-step="3" style="display:none">
              <div class="nwGrpHd">Data privacy consent (DPDP Act 2023)</div>
              <div style="font-size:12.5px;line-height:1.65;color:var(--muted);background:var(--surface-2);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin-bottom:14px">Longer Life Wellness Centre collects your personal and health data solely to provide personalised wellness services. Your data will be stored securely, will not be sold to any third party, and will only be shared within your treating team internally. You may request data withdrawal at any time in writing.</div>
              <div style="display:flex;flex-direction:column;gap:10px">
                <div class="nwConsentRow">
                  <span class="nwConsentTxt">I consent to my health data being collected and stored for service delivery</span>
                  <div class="nwYN">
                    <label class="nwChk yn-yes"><input type="radio" name="nwConsent1" data-consent="health" value="Yes"> Yes</label>
                    <label class="nwChk yn-no"><input type="radio" name="nwConsent1" data-consent="health" value="No"> No</label>
                  </div>
                </div>
                <div class="nwConsentRow">
                  <span class="nwConsentTxt">I consent to receiving wellness updates via WhatsApp / SMS / Email</span>
                  <div class="nwYN">
                    <label class="nwChk yn-yes"><input type="radio" name="nwConsent2" data-consent="updates" value="Yes"> Yes</label>
                    <label class="nwChk yn-no"><input type="radio" name="nwConsent2" data-consent="updates" value="No"> No</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="nwStep" data-step="4" style="display:none">
              <div class="nwGrpHd">General declaration</div>
              <div style="font-size:12.5px;line-height:1.65;color:var(--muted);background:var(--surface-2);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin-bottom:12px">I declare that all information provided above is true and accurate. I understand that withholding medical information may compromise my safety and the quality of services provided at Longer Life Wellness Centre.</div>
              <div class="g3" style="gap:10px 12px">
                <div class="fld"><label class="lbl">Client signature</label><input class="input" style="height:38px" id="nwSign" placeholder="Client name / signature"></div>
                <div class="fld"><label class="lbl">Date</label><input class="input" type="date" style="height:38px" id="nwDeclDate"></div>
                <div class="fld"><label class="lbl">Staff received by</label><input class="input" style="height:38px" id="nwStaffRecv" placeholder="Staff name"></div>
              </div>
              <div style="background:var(--surface-2);border:1px solid var(--line);border-radius:9px;padding:10px 14px;margin-top:10px;font-size:11.5px;color:var(--muted)"><b style="color:var(--ink)">For office use only</b> &nbsp;·&nbsp; Client ID: <span class="mono" id="nwOfficeCid">—</span> &nbsp;·&nbsp; Registration date: <span class="mono" id="nwOfficeRegDate">—</span> &nbsp;·&nbsp; Assigned counsellor: <span class="mono" id="nwOfficeCouns">—</span></div>
              <div class="nwGrpHd">Service consent forms</div>
              <div id="nwConsentForms"></div>
            </div>
            <div style="display:flex;gap:7px;margin-top:10px"><button class="btn bp" style="height:38px" id="nwPrimaryBtn" onclick="window._nwPrimary()">Save &amp; Next Page</button><button class="btn" style="height:38px" onclick="nwToggle()">Cancel</button></div>
          </div></div>
      </div>
      <div>
        <div class="sec" style="margin-top:0" id="checkinSec"><div class="sec-hd" onclick="togSec(this)" style="padding:10px 14px"><svg class="icon"><use href="#i-door"/></svg> Check-in <span id="ciName">—</span> <span class="arr">▾</span></div>
          <div class="sec-bd" style="padding:4px 14px 14px">
            <div class="g2" style="gap:8px">
              <div class="fld"><label class="lbl">Search</label><input class="input" style="height:34px" id="ciSearch" placeholder="Client ID, name or phone" oninput="window._ciLookup()"></div>
              <div class="fld"><label class="lbl">Dedup</label><input class="input" style="height:34px" id="ciDedup" readonly></div>
              <div class="fld"><label class="lbl">Visited <span class="ab">AUTO</span></label><input class="input mono" style="height:34px" id="rcVis" readonly></div>
              <div class="fld"><label class="lbl">Registered <span class="ab">AUTO</span></label><input class="input mono" style="height:34px" id="rcReg" readonly></div>
            </div>
            <div class="consent" style="font-size:12px"><label><input type="checkbox" checked> DPDP data use</label><label><input type="checkbox" checked> Health data</label><label><input type="checkbox" checked> Recording</label><label><input type="checkbox"> WA follow-ups</label></div>
            <button class="btn bp bsm" style="margin-top:8px" onclick="recRegDone()">Confirm → screening</button>
          </div></div>
        <div class="sec" id="zoomCiSecRec"><div class="sec-hd" onclick="togSec(this)" style="padding:10px 14px"><svg class="icon"><use href="#i-door"/></svg> Zoom check-in <span class="chipb neu zoomCiCount" style="margin-left:6px">0</span> <span class="arr">▾</span></div>
          <div class="sec-bd" style="padding:4px 14px 14px">
            <div class="tscroll"><table class="tbl" style="min-width:440px"><thead><tr><th>Client</th><th>Phone</th><th>Appointment Fixed Date &amp; Time</th><th>Status</th><th>Action</th></tr></thead><tbody id="zoomCiListRec"></tbody></table></div>
          </div></div>
        <div class="sec"><div class="sec-hd" onclick="togSec(this)" style="padding:10px 14px"><svg class="icon"><use href="#i-coin"/></svg> Collect payment <span class="arr">▾</span></div>
          <div class="sec-bd" style="padding:4px 14px 14px"><div id="recPayList"></div>
            <div id="recWb" class="hideblock" style="display:none;border:1.5px solid var(--brand-line);border-radius:11px;padding:11px 13px;margin-top:8px;background:linear-gradient(180deg,#F7FCFA,#fff)">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><b id="recWbName" style="font-family:var(--disp);font-size:14px">—</b><span class="chipb info" id="recWbPlan">—</span></div>
              <div class="g2" style="gap:8px"><div class="fld"><label class="lbl">Due</label><input class="input mono" style="height:34px" id="recWbDue" readonly></div><div class="fld"><label class="lbl">Received *</label><input class="input mono" style="height:34px" id="recWbAmt" type="text" inputmode="decimal" maxlength="12" placeholder="0" oninput="window._payAmtRcvd(this,'#recWbDue','#recWbAmtErr')"><div id="recWbAmtErr" style="display:none;color:var(--alert);font-size:11px;margin-top:3px"></div></div><div class="fld"><label class="lbl">Mode *</label><select class="select" style="height:34px" id="recWbMode"><option>UPI</option><option>Cash</option><option>Card</option><option>Net Banking</option></select></div><div class="fld"><label class="lbl">Txn ref *</label><input class="input mono" style="height:34px" id="recWbTxn" maxlength="40"></div></div>
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
      <input type="date" class="input" id="scFrom" style="display:none;height:30px;font-size:12px;width:130px">
      <input type="date" class="input" id="scTo" style="display:none;height:30px;font-size:12px;width:130px">
      <button class="btn bsm bp" id="scApplyBtn" style="display:none;height:30px" onclick="window._scApplyDate()">Apply</button>
      <button class="btn" style="margin-left:auto" onclick="window._scExport()"><svg class="icon"><use href="#i-dl"/></svg> Export</button>
    </div>
    <div class="metrics" style="margin:10px 0" id="scMetrics"></div>
    <div style="display:grid;grid-template-columns:1fr 310px;gap:14px">
      <div>
        <div class="sec" id="scAssessPanel" style="margin-top:0;display:none"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-heart"/></svg> Assessment — <span id="scAssessName">Select a client</span> <span class="chipb info" style="margin-left:8px" id="scAssessChip">Baseline · M0</span>
          <button class="btn bsm" style="margin-left:auto" onclick="window._scCloseAssess()">Close</button></div>
          <div class="sec-bd">
            <div class="g4">
              <div class="fld"><label class="lbl">Height (cm)</label><input class="input mono" id="sc_h" inputmode="decimal" oninput="window._numOnly(this);window._scBmiCalc()"></div>
              <div class="fld"><label class="lbl">Weight (kg)</label><input class="input mono" id="sc_w" inputmode="decimal" oninput="window._numOnly(this);window._scBmiCalc()"></div>
              <div class="fld"><label class="lbl">BMI <span class="ab">AUTO</span></label><input class="input mono" id="sc_bmi" readonly></div>
              <div class="fld"><label class="lbl">BP</label><input class="input mono" id="sc_bp"></div>
              <div class="fld"><label class="lbl">Pulse</label><input class="input mono" id="sc_pu" inputmode="numeric" oninput="window._numOnly(this)"></div>
              <div class="fld"><label class="lbl">SpO2 (%)</label><input class="input mono" id="sc_sp" inputmode="numeric" oninput="window._numOnly(this)"></div>
              <div class="fld"><label class="lbl">Waist (cm)</label><input class="input mono" id="sc_wa" inputmode="decimal" oninput="window._numOnly(this)"></div>
              <div class="fld"><label class="lbl">Temperature</label><input class="input mono" id="sc_te" inputmode="decimal" oninput="window._numOnly(this)"></div>
              <div class="fld"><label class="lbl">Desk glucose (mg/dL)</label><input class="input mono" id="sc_gl" inputmode="decimal" oninput="window._numOnly(this)"></div>
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
          <div class="sec-bd"><div class="pills" id="scTestPills"><button type="button" class="pill p-ok on" onclick="window._scTogTest(this)">HbA1c</button><button type="button" class="pill p-ok on" onclick="window._scTogTest(this)">FBS</button><button type="button" class="pill" onclick="window._scTogTest(this)">Lipid</button><button type="button" class="pill" onclick="window._scTogTest(this)">Thyroid</button></div>
            <button class="btn bp bsm" style="margin-top:10px" onclick="window._scOrderTests()">Order &amp; print</button></div></div>
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
              <div class="fld"><label class="lbl">Next session</label><input class="input" type="date" id="phNextDate" data-future="1"></div>
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
        <div class="fld"><label class="lbl">Service</label><select class="select" id="repService" onchange="window._repLoad()"><option value="all" selected>All</option><option value="Diabetes">Diabetes Counselling</option><option value="Weight Loss">Weight Loss Counselling</option><option value="Sauna">Sauna Bath</option><option value="Physio">Physiotherapy</option><option value="Cold">Cold Plunge</option><option value="Blood">Blood Test</option><option value="HBOT">HBOT (Hyperbaric Oxygen Therapy)</option></select></div>
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

  <!-- RECORDINGS -->
  <section class="screen" id="s-recordings"><div class="wrap" style="max-width:1280px;padding:16px 20px 60px">
    <div class="ph"><div><h1>Recordings</h1><p id="recSubtitle">All in-clinic office-visit audio and Zoom consultation recordings across customers.</p></div></div>

    <div class="sec" style="margin-bottom:16px" id="ovrTblSec">
      <div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-mic"/></svg> Office Visit Recordings <span class="chipb ok" id="ovrTblCount" style="margin-left:8px">0</span>
        <input class="input" id="ovrTblSearch" placeholder="Search name / recorded by…" style="height:30px;font-size:12px;width:220px;margin-left:auto" oninput="window._ovrTblSearch()">
        <button class="btn bsm" style="margin-left:8px" onclick="window._ovrTblDownload()">⬇ Download</button></div>
      <div class="sec-bd">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <span style="font-size:12px;color:var(--faint)">Date</span>
          <input class="input" type="date" id="ovrTblFrom" style="height:30px;font-size:12px;width:150px" title="From">
          <span style="color:var(--faint);font-size:12px">→</span>
          <input class="input" type="date" id="ovrTblTo" style="height:30px;font-size:12px;width:150px" title="To">
          <button class="btn bsm bp" onclick="window._ovrTblApply()">Apply</button>
          <button class="btn bsm" onclick="window._ovrTblClear()">Clear</button>
        </div>
        <div class="tscroll stick1"><table class="tbl" style="min-width:960px"><thead><tr id="ovrTblHead"></tr></thead><tbody id="ovrTblBody"></tbody></table></div>
        <div style="display:flex;gap:10px;margin-top:12px;align-items:center;justify-content:center;flex-wrap:wrap">
          <button class="btn bsm" id="ovrTblFirstBtn" onclick="window._ovrTblPage('first')">« First</button>
          <button class="btn bsm" id="ovrTblPrevBtn" onclick="window._ovrTblPage(-1)">← Previous</button>
          <span style="font-size:12.5px;font-weight:600;color:var(--ink)" id="ovrTblPageInfo">Page 1 of 1</span>
          <button class="btn bsm" id="ovrTblNextBtn" onclick="window._ovrTblPage(1)">Next →</button>
          <button class="btn bsm" id="ovrTblLastBtn" onclick="window._ovrTblPage('last')">Last »</button>
        </div>
      </div>
    </div>

    <div class="sec" id="zoomTblSec">
      <div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-chat"/></svg> Zoom Meeting Recordings <span class="chipb ok" id="zoomTblCount" style="margin-left:8px">0</span>
        <input class="input" id="zoomTblSearch" placeholder="Search name / link…" style="height:30px;font-size:12px;width:220px;margin-left:auto" oninput="window._zoomTblSearch()">
        <button class="btn bsm" style="margin-left:8px" onclick="window._zoomTblDownload()">⬇ Download</button></div>
      <div class="sec-bd">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <span style="font-size:12px;color:var(--faint)">Date</span>
          <input class="input" type="date" id="zoomTblFrom" style="height:30px;font-size:12px;width:150px" title="From">
          <span style="color:var(--faint);font-size:12px">→</span>
          <input class="input" type="date" id="zoomTblTo" style="height:30px;font-size:12px;width:150px" title="To">
          <button class="btn bsm bp" onclick="window._zoomTblApply()">Apply</button>
          <button class="btn bsm" onclick="window._zoomTblClear()">Clear</button>
        </div>
        <div class="tscroll stick1"><table class="tbl" style="min-width:960px"><thead><tr id="zoomTblHead"></tr></thead><tbody id="zoomTblBody"></tbody></table></div>
        <div style="display:flex;gap:10px;margin-top:12px;align-items:center;justify-content:center;flex-wrap:wrap">
          <button class="btn bsm" id="zoomTblFirstBtn" onclick="window._zoomTblPage('first')">« First</button>
          <button class="btn bsm" id="zoomTblPrevBtn" onclick="window._zoomTblPage(-1)">← Previous</button>
          <span style="font-size:12.5px;font-weight:600;color:var(--ink)" id="zoomTblPageInfo">Page 1 of 1</span>
          <button class="btn bsm" id="zoomTblNextBtn" onclick="window._zoomTblPage(1)">Next →</button>
          <button class="btn bsm" id="zoomTblLastBtn" onclick="window._zoomTblPage('last')">Last »</button>
        </div>
      </div>
    </div>
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
            <div class="fld" style="margin:0"><label class="lbl">Phone</label><input class="input mono" id="asgPhone" placeholder="optional · 10 digits" style="height:34px;width:140px" type="tel" inputmode="numeric" maxlength="10" oninput="window._digitsOnly(this)"></div>
            <div class="fld" style="margin:0"><label class="lbl">Login email</label><input class="input" id="asgEmail" placeholder="links their Advisor login" style="height:34px;width:200px" type="email" title="Match this advisor to their login account (app user email) so an Advisor sees only their own leads"></div>
            <button class="btn bp" id="asgAddBtn" onclick="window._asgCreate()" style="height:34px">+ Add assignee</button>
            <button class="btn bsm" id="asgCancelBtn" onclick="window._asgCancelEdit()" style="height:34px;display:none">Cancel</button>
          </div>
          <div class="tscroll"><table class="tbl" style="min-width:820px"><thead><tr id="asgHead"><th>Name</th><th>Role</th><th>Branch</th><th>Phone</th><th>Active leads</th><th>Status</th><th>Actions</th></tr></thead><tbody id="asgBody"></tbody></table></div>
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
          <div class="tscroll"><table class="tbl" style="min-width:700px"><thead><tr id="usrHead"><th>Email</th><th>Name</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody id="usrBody"></tbody></table></div>
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
