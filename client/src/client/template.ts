export function getMainContent(): string {
  return `
  <!-- ADVISOR -->
  <!-- Today's planned follow-ups. Fixed to the left edge of the content area (clear of the sidebar),
       filled by _fuRenderReminders(). Advisor: every due lead, stays until actioned. Admin: one at a
       time, 30s each. Empty = the element renders nothing and takes no space. -->
  <div id="fuReminders" class="fu-rem" aria-live="polite" aria-label="Today's follow-up reminders"></div>
  <section class="screen active" id="s-advisor"><div class="wrap">
    <div class="sec" style="margin-bottom:14px"><div class="sec-bd" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:12px 14px">
      <span style="font-size:12px;font-weight:600;color:var(--muted);margin-right:2px">Filters</span>
      <input aria-label="Filter leads from date" class="input" type="date" id="asnFrom" style="height:30px;font-size:12px;width:150px" title="From date">
      <span style="color:var(--faint);font-size:12px">→</span>
      <input aria-label="Filter leads to date" class="input" type="date" id="asnTo" style="height:30px;font-size:12px;width:150px" title="To date">
      <select aria-label="Filter by source" class="select" id="asnSource" style="height:30px;font-size:12px;width:160px"><option value="all">All sources</option></select>
      <select aria-label="Filter by service" class="select" id="asnService" style="height:30px;font-size:12px;width:160px" onchange="window._asnServiceChange()"><option value="all">All services</option></select>
      <select aria-label="Filter by advisor" class="select" id="assignedFilter" style="height:30px;font-size:12px;width:170px"><option value="all">All advisors</option></select>
      <button class="btn bsm bp" onclick="window._topFilterApply()">Apply</button>
      <button class="btn bsm" onclick="window._topFilterClear()">Clear</button>
    </div></div>
    <div class="sec" style="margin-bottom:14px"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-chart"></use></svg> Advisor dashboard
      <div class="pills" id="asnViewToggle" style="margin-left:auto"><button class="pill on" onclick="window._asnToggleView('list')">List View</button><button class="pill" onclick="window._asnToggleView('kanban')">Kanban View</button></div>
      <select aria-label="Filter by call or lead status" class="select" id="haStatusFilter" style="height:30px;font-size:12px;width:210px"><option value="all">All call/lead statuses</option></select></div>
      <div class="sec-bd">
        <!-- ===== Advisor dashboard — four primary panels =====
             Filled by _renderAdvDashSections() in app.ts. Everything is click-through: elements carry
             data-metric and ONE delegated listener on #advDashSections routes the click to the shared
             drill-down table. No target on this screen is hardcoded — they all come from the
             advisor_targets master in Settings → Advisor targets. -->
        <div id="advDashSections">
          <div class="dgrid">
            <div class="dpanel">
              <div class="dpanel-hd"><span class="dnum">1</span><h4>Pipeline overview</h4></div>
              <div class="dov" id="haOverview"></div>
              <!-- Overlay cards (Call Status filter, Priority) — not pipeline stages, so they sit
                   below the three headline counters rather than competing with them. -->
              <div class="dovmore" id="haKpis"></div>
            </div>
            <div class="dpanel" id="haPanelPerf">
              <div class="dpanel-hd"><span class="dnum">2</span><h4>Pipeline performance</h4><span class="sub">(Actual vs Expected)</span></div>
              <div class="dpf" id="haPipeTargets"></div>
              <div class="dlegend" id="haPipeKey"></div>
              <div class="dsrc" id="haPipeHint"></div>
            </div>
          </div>
          <div class="dgrid2" id="haRow2">
            <div class="dpanel">
              <div class="dpanel-hd"><span class="dnum">3</span><h4>Follow-ups</h4></div>
              <div class="dfu" id="haFollowupCards"></div>
            </div>
            <div class="dpanel">
              <div class="dpanel-hd"><span class="dnum">4</span><h4>Targets &amp; performance</h4><span class="sub" id="haTargetKey"></span></div>
              <div class="dtg" id="haTargetCards"></div>
              <div class="dsrc" id="haTargetHint"></div>
            </div>
          </div>
          <!-- Pacing spans the FULL width, below both panels. Inside panel 4 it made that panel far
               taller than the Follow-ups panel beside it, and since the two stretch to equal height
               the difference showed up as dead white space under the rings. Full width also suits it:
               it is a sentence, not a tile. -->
          <div id="haPacing"></div>

          <!-- Panels 5–9 continue the numbered system from the four above, so the whole screen reads
               as one sequence rather than four designed panels followed by loose sections. -->
          <div id="haLowerSections">
          <div class="dpanel" style="margin-top:14px">
            <div class="dpanel-hd"><span class="dnum">5</span><h4>Call disposition</h4><span class="sub">(21 codes)</span></div>
            <div class="dsub">Colour shows the <b>group</b>, not performance — a disposition has no target. Click any row to open those leads.</div>
            <div id="haDispo" class="hadisp"></div>
          </div>

          <div class="dgrid3">
            <div class="dpanel">
              <div class="dpanel-hd"><span class="dnum">6</span><h4>Visited status</h4></div>
              <div class="dsub">Track leads across the visited journey</div>
              <div id="haVisitedBar"></div>
            </div>
            <div class="dpanel">
              <div class="dpanel-hd"><span class="dnum">7</span><h4>Enrollment status</h4></div>
              <div class="dsub">Track enrollment progress</div>
              <div id="haEnrollBar"></div>
            </div>
            <div class="dpanel">
              <div class="dpanel-hd"><span class="dnum">8</span><h4>Conversion funnel</h4><span class="sub" id="haFunnelKey"></span></div>
              <div class="dsub">Overall conversion with reference goals and deviation</div>
              <div class="dfun-wrap">
                <div id="haFunnel" class="dfun"></div>
                <div id="haFunnelRates"></div>
              </div>
            </div>
          </div>

          <div class="dpanel" style="margin-top:14px">
            <div class="dpanel-hd"><span class="dnum">9</span><h4>Call performance</h4></div>
            <div class="dsub" id="haCallHint"></div>
            <div class="metrics" id="haCallPerf" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin:11px 0 0"></div>
          </div>
          </div>
        </div>
        <div id="haResultsWrap" style="display:none;margin-top:14px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap"><span style="font-weight:700;font-size:13px" id="haResultsTitle"></span>
            <!-- Lives OUTSIDE the table so a re-render (which rewrites thead/tbody only) can't steal focus mid-typing. -->
            <input aria-label="Search results by lead, phone, advisor or status" class="input" id="haResultsSearch" placeholder="Search lead / phone / advisor / status…" oninput="window._haResultsSearch()" style="margin-left:auto;max-width:280px;height:32px;font-size:12.5px">
            <button class="btn bsm" onclick="window._haCloseResults()">Close</button></div>
          <div class="tscroll"><table class="tbl" style="min-width:640px"><thead><tr id="haResultsHead"><th scope="col">Lead</th><th scope="col">Source · Lang</th><th scope="col">Assigned to</th><th scope="col">Call status</th></tr></thead><tbody id="haResultsBody"></tbody></table></div>
        </div>
      </div></div>
    <div class="sec" style="margin-bottom:14px"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-user"></use></svg> Assigned leads <span class="chipb ok" id="assignedCount" style="margin-left:8px">0</span></div>
      <div class="sec-bd">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <input aria-label="Search assigned leads by lead, phone or advisor" class="input" id="assignedSearch" placeholder="Search lead / phone / advisor…" style="height:30px;font-size:12px;width:230px;margin-left:auto" oninput="window._assignedSearch()">
      </div>
      <div id="assignedTableWrap" class="tscroll stick1"><table class="tbl" style="min-width:1060px"><thead><tr id="assignedLeadsHead"><th scope="col">Lead Generated Date &amp; Time</th><th scope="col">Assigned Date &amp; Time</th><th scope="col">Lead</th><th scope="col">Source · Lang</th><th scope="col">Campaign</th><th scope="col">Assigned to</th><th scope="col">Status</th><th scope="col">Call Status</th><th scope="col">Action</th></tr></thead><tbody id="assignedLeadsBody"></tbody></table></div>
      <div id="assignedKanban" style="display:none;overflow-x:auto"></div>
      <div id="asnPager" style="display:flex;gap:10px;margin-top:12px;align-items:center;justify-content:center;flex-wrap:wrap">
        <button class="btn bsm" id="asnFirstBtn" onclick="window._asnPage('first')">« First</button>
        <button class="btn bsm" id="asnPrevBtn" onclick="window._asnPage(-1)">← Previous</button>
        <span style="font-size:12.5px;font-weight:600;color:var(--ink)" id="asnPageInfo">Page 1 of 1</span>
        <button class="btn bsm" id="asnNextBtn" onclick="window._asnPage(1)">Next →</button>
        <button class="btn bsm" id="asnLastBtn" onclick="window._asnPage('last')">Last »</button>
        <button class="btn bsm" data-exp onclick="window._assignedDownload()" style="margin-left:auto">⬇ Download</button>
      </div></div></div>
    <div class="sec" style="margin-bottom:14px" id="asnHistSec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clock"></use></svg> Assigned leads history <span class="chipb neu" id="asnHistCount" style="margin-left:8px">0</span></div>
      <div class="sec-bd">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <input aria-label="History assigned from date" class="input" type="date" id="asnHistFrom" style="height:30px;font-size:12px;width:150px" oninput="window._asnHistFilter()" title="Assigned from">
          <span style="color:var(--faint);font-size:12px">→</span>
          <input aria-label="History assigned to date" class="input" type="date" id="asnHistTo" style="height:30px;font-size:12px;width:150px" oninput="window._asnHistFilter()" title="Assigned to">
          <select aria-label="History filter by advisor" class="select" id="asnHistAdvisor" style="height:30px;font-size:12px;width:160px" onchange="window._asnHistFilter()"><option value="all">All health advisors</option></select>
          <select aria-label="History filter by source" class="select" id="asnHistSource" style="height:30px;font-size:12px;width:150px" onchange="window._asnHistFilter()"><option value="all">All sources</option></select>
          <select aria-label="History filter by service" class="select" id="asnHistService" style="height:30px;font-size:12px;width:150px" onchange="window._asnHistFilter()"><option value="all">All services</option></select>
          <label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);white-space:nowrap"><input type="checkbox" id="asnHistPool" onchange="window._asnHistFilter()"> Unassigned pool only</label>
          <input aria-label="Search assigned leads history by name, number or advisor" class="input" id="asnHistSearch" placeholder="Search name / number / advisor…" style="height:30px;font-size:12px;width:230px;margin-left:auto" oninput="window._asnHistSearch()">
          <button class="btn bsm" data-exp onclick="window._asnHistDownload()">⬇ Download</button>
        </div>
        <div class="tscroll stick1"><table class="tbl" style="min-width:940px"><thead><tr id="asnHistHead"></tr></thead><tbody id="asnHistBody"></tbody></table></div>
      </div></div>
    <!-- Open leads sit ABOVE the detail pane as a horizontal strip (they used to be a narrow
         212px column down the left, which squeezed the profile and stacked the cards vertically). -->
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:4px">
    <div id="advOpenList" style="display:none"></div>
    <div id="advDetailPane" style="min-width:0">
    <div id="advCtxBanner" class="banner plan" style="display:none;margin-bottom:12px"><svg aria-hidden="true" focusable="false" class="icon" style="width:15px;height:15px"><use href="#i-user"></use></svg> <span id="advCtxText"></span></div>
    <div class="chead">
      <span class="cav" id="advAv"></span>
      <div class="cmeta">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><h1 id="advName" style="margin:0">No lead selected</h1><span id="advNotElig" class="chipb al" style="display:none;font-weight:700">⛔ Not Eligible</span><span id="advClosedTop" class="chipb al" style="display:none;font-weight:800;letter-spacing:.02em">NOT REGISTERED · CLOSED</span></div>
        <div class="sub" id="advSub"><span style="color:var(--faint)">Open a lead from Assigned leads to begin</span></div>
        <div class="cbadges" id="advBadges"></div>
      </div>
      <div class="cacts">
        <div style="text-align:center"><div class="ring"><svg aria-hidden="true" focusable="false" width="62" height="62" viewBox="0 0 62 62"><circle class="bgc" cx="31" cy="31" r="26"></circle><circle class="fgc" id="aRing" cx="31" cy="31" r="26" stroke="#C07F0E" stroke-dasharray="163.4" stroke-dashoffset="42"></circle></svg><span class="rc" id="aClock" style="color:var(--warn-ink)">3:09</span></div><div class="rl">SLA · 4h</div></div>
        <span class="chipb vio" id="consBadge" style="height:30px">Status: —</span>
        <button class="btn bp" id="callBtn" onclick="window._advCallToggle()"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-phone"></use></svg> <span>Call</span></button>
        <button class="btn bwa"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-msg"></use></svg> WA</button>
      </div>
    </div>
    <div class="rtabs" id="aTabs">
      <button data-t="recep">Walk-in Receptionist</button><button class="on" data-t="sales">Walk-in Sales</button><button data-t="health">Walk-in Health</button>
      <button data-t="pay">Payment History</button><button data-t="notes">Internal Notes</button>
      <button data-t="extra">Extra Info</button><button data-t="calls">Call History <span class="mini" id="advCallCount" style="display:none">0</span></button>
    </div>
    <div class="a-p" data-p="recep" style="display:none">
      <div class="banner plan" style="margin-top:16px"><svg aria-hidden="true" focusable="false" class="icon" style="width:15px;height:15px"><use href="#i-doc"></use></svg> <span><b>View only.</b> Reception-entered data — consent, visited time, registration time, service, token. Audit-logged.</span></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-door"></use></svg> Reception record <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No reception record for this lead yet.</div></div></div>
    </div>
    <div class="a-p" data-p="sales">
      <div class="sec" id="advBasicSec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-user"></use></svg> Basic info <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g4">
          <div class="fld"><label class="lbl" for="advfName">Name <span class="req">*</span></label><input  class="input" id="advfName" autocomplete="name" value=""></div>
          <div class="fld"><label class="lbl" for="advfPhone">Phone no <span class="req">*</span></label><input  class="input mono" id="advfPhone" autocomplete="tel" type="tel" inputmode="numeric" maxlength="15" value="" oninput="window._digitsOnly(this)"></div>
          <div class="fld adv-nonphysio"><label class="lbl">Alternate ph no <span class="nb">NEW</span></label><input aria-label="Alternate phone number" class="input" placeholder="Alt number"></div>
          <div class="fld"><label class="lbl" for="advfWhats">WhatsApp no</label><input  class="input mono" id="advfWhats" autocomplete="tel" type="tel" inputmode="numeric" maxlength="15" value="" oninput="window._digitsOnly(this)"></div>
          <div class="fld adv-nonphysio"><label class="lbl" for="advfEmail">Email</label><input  class="input" id="advfEmail" autocomplete="email" type="email" placeholder="email@example.com"></div>
          <div class="fld"><label class="lbl" for="advfGender">Gender <span class="req">*</span></label><select  class="select" id="advfGender"><option>-- Select --</option><option selected>Male</option><option>Female</option><option>Other</option></select></div>
          <div class="fld"><label class="lbl" for="advfAge">Age <span class="req">*</span></label><input  class="input mono" id="advfAge" type="number" min="1" max="120" placeholder="e.g. 42"></div>
          <div class="fld adv-nonphysio"><label class="lbl" for="advfOcc">Occupation <span class="req">*</span> <span class="nb">NEW</span></label><select  class="select" id="advfOcc" onchange="othRev(this,'occOth')"><option>-- Select --</option><option>Private Job</option><option selected>Business</option><option>Govt Job</option><option>Self-employed</option><option>Homemaker</option><option>Retired</option><option>Student</option><option>Daily Wage</option><option>Others</option></select><input aria-label="Occupation — other, please specify" class="input hideblock" id="occOth" style="margin-top:7px" placeholder="Enter occupation…"></div>
          <div class="fld adv-nonphysio"><label class="lbl" for="advfLang">Language <span class="req">*</span></label><select  class="select" id="advfLang"><option selected>Tamil</option><option>Telugu</option><option>Kannada</option><option>Malayalam</option><option>Hindi</option><option>Marathi</option><option>Bengali</option><option>Gujarati</option><option>Punjabi</option><option>Urdu</option></select></div>
          <div class="fld adv-nonphysio"><label class="lbl">Lead source</label><select aria-label="Lead source" class="select"><option value="" selected>— Select —</option><option>web</option><option>Meta</option><option>WhatsApp</option><option>Referral</option><option>Direct Walk-in</option></select></div>
          <div class="fld adv-nonphysio"><label class="lbl" for="haLeadGen">Lead generated <span class="ab">AUTO</span></label><input  class="input mono" id="haLeadGen" readonly></div>
          <div class="fld adv-nonphysio"><label class="lbl" for="haBatch">Batch code</label><input  class="input mono" id="haBatch" placeholder="—"></div>
          <div class="fld"><label class="lbl" for="advfLoc">Location <span class="req">*</span></label><select  class="select" id="advfLoc" data-freeform="1" onchange="window._advLocChange(this)"><option selected>Poonamalle</option><option>Porur</option><option>Maduravoyal</option><option>Ambattur</option><option>Avadi</option><option>Tambaram</option><option>Nagapattinam</option><option>✎ Type location manually</option><option>+ Add new location</option></select><input class="input" id="advfLocManual" data-nocap placeholder="Type the location and press Enter…" style="display:none;margin-top:6px" onkeydown="window._advLocManualKey(event)" onblur="window._advLocManualCommit()"></div>
          <div class="fld adv-nonphysio" style="grid-column:span 3"><label class="lbl">Address</label><div class="g4" style="gap:9px"><input aria-label="Address — street or area" class="input" placeholder="Street / Area"><input aria-label="Address — city" class="input" value="Chennai"><input aria-label="Address — ZIP code" class="input" placeholder="ZIP"><input aria-label="Address — country" class="input" value="India"></div></div>
        </div></div></div>

      <!-- PHYSIOTHERAPY-SPECIFIC panel — shown only for Physiotherapy leads (data-nocap: kept out of
           the positional advisor-profile capture, persisted separately so other services are untouched). -->
      <div class="sec" id="advPhysioSec" style="display:none"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-heart"></use></svg> Physiotherapy — basic information <span class="chipb info" style="margin-left:6px">Physio</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <!-- Preferred date / time slot / mode were removed on request — booking happens on the slot
               board / at Reception, so the advisor panel keeps only referral + reports + remarks. -->
          <div class="g4">
            <div class="fld"><label class="lbl" for="advpReferral">Referral details</label><select class="select" id="advpReferral" data-nocap><option value="">— Select —</option><option>MHS Student</option><option>Google</option><option>Friend &amp; Family</option><option>Social Media</option><option>Doctor Referral</option><option>Walk-in</option></select></div>
          </div>
          <div class="fld fw" style="margin-top:8px"><label class="lbl">Reports available <span class="ab">if any</span></label>
            <!-- No onclick here on purpose: initApp binds every ".chips > .chip-o" to toggle "on"
                 (see app.ts, the root.querySelectorAll(".chips") pass). These five used to ALSO carry
                 onclick="this.classList.toggle('on')", so each click toggled twice — on, then straight
                 back off — and the chips could never be selected. Every other chip group in this file
                 relies on that shared binding; keep it that way. -->
            <div class="chips" id="advpReports">
              <button type="button" class="chip-o" data-nocap>X-ray</button>
              <button type="button" class="chip-o" data-nocap>MRI</button>
              <button type="button" class="chip-o" data-nocap>CT Scan</button>
              <button type="button" class="chip-o" data-nocap>Blood Reports</button>
              <button type="button" class="chip-o" data-nocap>NCV &amp; EMG</button>
            </div>
            <div id="advpAtts" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><span class="att add" onclick="window._advpAddReport()"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clip"></use></svg> Upload report</span></div></div>
          <div class="fld fw" style="margin-top:8px"><label class="lbl" for="advpRemarks">Remarks <span class="ab">if any</span></label><textarea class="area" id="advpRemarks" data-nocap rows="3" placeholder="Condition, pain area, doctor's note, referral notes…"></textarea></div>
        </div></div>

      <div class="sec" id="advSugarSec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-drop"></use></svg> Sugar &amp; medical profile <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g4">
          <div class="fld"><label class="lbl" for="advfSugar">Sugar level <span class="req">*</span></label><select  class="select" id="advfSugar"><option value="" selected>— Select —</option><option>No Sugar</option><option>150–250</option><option>Above 250</option></select></div>
          <div class="fld"><label class="lbl">Last test report date</label><input aria-label="Last test report date" class="input" type="date"></div>
          <div class="fld"><label class="lbl">Fasting (mg/dL)</label><input aria-label="Fasting (mg/dL)" class="input mono" type="number" placeholder="—"></div>
          <div class="fld"><label class="lbl">Postprandial (mg/dL)</label><input aria-label="Postprandial (mg/dL)" class="input mono" type="number" placeholder="—"></div>
          <div class="fld"><label class="lbl">HbA1c (%)</label><input aria-label="HbA1c (%)" class="input mono" type="number" placeholder="—"></div>
          <div class="fld"><label class="lbl">Treatment <span class="nb">NEW</span></label><select aria-label="Treatment" class="select"><option value="" selected>— Select —</option><option>Allopathy</option><option>Siddha</option><option>Ayurveda</option><option>Homeopathy</option><option>No Treatment</option><option>Skipped</option></select></div>
          <div class="fld"><label class="lbl">Years of treatment <span class="nb">NEW</span></label><select aria-label="Years of treatment" class="select"><option value="" selected>— Select —</option><option>Less than 1 yr</option><option>1–2 yrs</option><option>3–5 yrs</option><option>5–10 yrs</option><option>10+ yrs</option></select></div>
          <div class="fld fw"><label class="lbl">Blood report — attachment <span class="nb">NEW</span></label>
            <div class="atts" id="bloodAtts"><span class="att"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clip"></use></svg> sugar_report_may26.pdf</span><span class="att add" onclick="addBlood()"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clip"></use></svg> Add report</span></div></div>
          <div class="fld fw"><label class="lbl">How are they managing now · multi-select</label>
            <div class="chips" data-oth="mgOth"><button class="chip-o on">Medicine</button><button class="chip-o">Insulin</button><button class="chip-o on">Diet</button><button class="chip-o">Fitness</button><button class="chip-o">Yoga</button><button class="chip-o" data-others="1">Others</button></div>
            <input aria-label="How they are managing now — other, please specify" class="input hideblock" id="mgOth" style="margin-top:8px;max-width:380px" placeholder="Enter details…"></div>
          <div class="fld fw"><label class="lbl">Health issues · multi-select</label>
            <div class="chips" data-oth="hiOth"><button class="chip-o on">BP / Hypertension</button><button class="chip-o">Cholesterol</button><button class="chip-o on">Fatty Liver</button><button class="chip-o">Kidney Issues</button><button class="chip-o">Thyroid</button><button class="chip-o">PCOD / PCOS</button><button class="chip-o">Nerve Damage</button><button class="chip-o">Retinopathy</button><button class="chip-o">Obesity</button><button class="chip-o" data-others="1">Others</button></div>
            <input aria-label="Health issues — other, please specify" class="input hideblock" id="hiOth" style="margin-top:8px;max-width:380px" placeholder="Enter details…"></div>
          <div class="fld fw"><label class="lbl" style="color:var(--alert-ink)">Appointment eligibility criteria <span class="nb">NEW</span></label>
            <div class="chips" id="eligChips" data-oth="elOth">
              <button class="chip-o neg">Cancer</button><button class="chip-o neg">Brain Tumor</button><button class="chip-o neg">Recent Heart Surgery</button><button class="chip-o neg">Organ Transplant</button><button class="chip-o neg">Pregnancy</button><button class="chip-o neg">Age Above 75</button><button class="chip-o neg">Already Paid</button><button class="chip-o neg">Other Language</button><button class="chip-o neg" data-others="1">Others</button>
            </div>
            <input aria-label="Appointment eligibility — exclusion detail" class="input hideblock" id="elOth" style="margin-top:8px;max-width:380px" placeholder="Enter exclusion detail…">
            <div class="banner good" id="eligBanner"><svg aria-hidden="true" focusable="false" class="icon" style="width:16px;height:16px"><use href="#i-check"></use></svg> <span>Eligible for diabetes reversal — appointment can be booked.</span></div></div>
        </div></div></div>

      <div class="sec" id="advAssignSec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-target"></use></svg> Assignment &amp; pipeline <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g3">
          <div class="fld"><label class="lbl" for="salesSel">Salesperson <span class="ab">AUTO</span></label><select  class="select auto" id="salesSel" tabindex="-1"><option value="">— Select —</option></select></div>
          <div class="fld"><label class="lbl" for="salesTeamSel">Sales team <span class="ab">AUTO</span></label><select  class="select auto" id="salesTeamSel" tabindex="-1"><option value="">— Select —</option><option>Walkin Callers Team</option><option>Physiotherapy Telecaller Team</option></select></div>
          <div class="fld"><label class="lbl" for="hcSel">HC assigned <span class="nb">NEW</span></label><select  class="select" id="hcSel" onchange="window._hcAssignedChange()"><option value="">— Select —</option></select></div>
          <div class="fld"><label class="lbl">Priority</label><div class="stars" id="stars"><span class="star">★</span><span class="star">★</span><span class="star">★</span></div></div>
          <!-- Probability retired from the UI. The input STAYS in the DOM: collectAdvisorProfile
               serialises this panel's inputs POSITIONALLY and restores them by index (els[i]), so
               deleting it would shift every field after it and every saved profile would reload its
               values into the wrong boxes. Hidden, it keeps its slot and stays harmless. -->
          <div class="fld" style="display:none" aria-hidden="true"><label class="lbl">Probability</label><div class="prob"><input aria-label="Probability" type="range" min="0" max="100" value="0" oninput="document.getElementById('pv').textContent=this.value+'%'"><span class="pv" id="pv">0%</span></div></div>
          <div class="fld"><label class="lbl">Tags</label><input aria-label="Tags" class="input" placeholder="e.g. hot-lead, follow-up"></div>
        </div></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-phone"></use></svg> Call status <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="g2">
            <div class="fld"><label class="lbl" for="callStatus">Call status — drives the flow</label>
              <select  class="select" id="callStatus" onchange="callStatusChange(this.value)">
                <option value="new">New (Default)</option><option value="dnd">DND</option><option value="rnr">RNR</option><option value="busy">Line Busy</option><option value="cb">Call Back</option><option value="paid">Already Paid</option><option value="fu">Follow Up</option><option value="so">Switched Off</option><option value="nreg">Not Registered</option><option value="nosugar">No Sugar</option><option value="oos">Out of Service</option><option value="wn">Wrong Number</option><option value="afd">Appointment Fixed – Direct</option><option value="afz">Appointment Fixed – Zoom</option><option value="vis">Visited</option><option value="enr">Enrolled</option><option value="nr">Not Reachable</option><option value="ni">Not Interested</option><option value="disc">Disconnect</option><option value="invalid">Invalid</option>
              </select></div>
            <div class="fld"><label class="lbl" for="nextFollowUp">Next follow-up date &amp; time</label><input  class="input" id="nextFollowUp" type="datetime-local" data-future="1"></div>
          </div>
          <div class="fld"><label class="lbl">Call notes <span class="nb">NEW</span></label><textarea aria-label="Call notes — What was discussed, objections, next step…" class="area" rows="3" placeholder="What was discussed, objections, next step…"></textarea></div>
          <div class="banner plan hideblock" id="fuPanel" style="display:none;flex-direction:column;align-items:stretch;gap:10px">
            <div style="display:flex;gap:9px;align-items:center"><svg aria-hidden="true" focusable="false" class="icon" style="width:16px;height:16px"><use href="#i-repeat"></use></svg><b>Follow-up plan — standard procedure</b></div>
            <div class="g4" style="gap:10px">
              <div><label class="lbl" style="color:var(--vio-ink)">Reason / intent</label><select aria-label="Reason / intent" class="select" style="height:36px"><option>Will decide this week</option><option>Family discussion needed</option><option>Budget / salary date</option></select></div>
              <div><label class="lbl" style="color:var(--vio-ink)" for="fuPlannedDt">Planned date &amp; time *</label><input  class="input" style="height:36px" type="datetime-local" id="fuPlannedDt" data-future="1" onchange="window._fuPlannedSync()"></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Reminder before</label><select aria-label="Reminder before" class="select" style="height:36px"><option selected>15 min before</option><option>30 min before</option></select></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Attempt # <span class="ab">AUTO</span></label><input aria-label="Attempt #" class="input mono" style="height:36px" readonly placeholder="—"></div>
            </div>
            <div><label class="lbl" style="color:var(--vio-ink)">Follow-up notes</label>
              <div style="display:flex;gap:8px"><input aria-label="Follow-up notes" class="input" id="fuNoteA" style="height:36px;background:#fff" placeholder="e.g. Wants to check with brother…"><button class="btn bsm" style="height:36px;flex:none;background:#fff" onclick="addFuNoteA()">Add note</button></div>
              <div id="fuNotesA" style="margin-top:9px;display:flex;flex-direction:column;gap:6px"></div></div>
          </div>
        </div></div>

      <!-- BLOOD TEST PLANS & PRICING — shown only in the Blood-Test advisor view (see
           _advApplyServiceLayout). The two package tables are rendered by _advRenderBtPlans from
           BT_PLANS in app.ts, so panel contents/prices are edited in ONE place. -->
      <div class="sec" id="advBtPlansSec" style="display:none"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-drop"></use></svg> Blood Test Plans &amp; Pricing <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="fld" style="max-width:320px"><label class="lbl" for="advBtPlan">Selected plan</label>
            <select class="select" id="advBtPlan" onchange="window._advBtPlanPick(this.value)"><option value="">— Select a plan —</option></select></div>
          <div id="advBtPlanCards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px;margin-top:12px"></div>
        </div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-msg"></use></svg> WhatsApp messaging <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="g3">
            <div class="fld"><label class="lbl" for="waTplSel">Template</label><select  class="select" id="waTplSel" onchange="waTpl()"><option value="welcome" selected>Welcome &amp; intro</option><option value="appt">Appointment confirmation</option><option value="fu">Follow-up reminder</option><option value="pay">Payment link</option></select></div>
            <!-- The preview IS the message: it is pre-filled from the template with the lead's own
                 details, and whatever is typed here is exactly what WhatsApp opens with. -->
            <div class="fld" style="grid-column:span 2"><label class="lbl" for="waPrev">Message — edit before sending</label><textarea  class="area" id="waPrev" rows="8" placeholder="Pick a template, or type your message here"></textarea></div>
          </div>
          <div style="display:flex;gap:9px;margin-top:6px;align-items:center;flex-wrap:wrap">
            <button class="btn bsm bp" onclick="window._waSend()"><svg aria-hidden="true" focusable="false" class="icon" style="width:14px;height:14px"><use href="#i-msg"></use></svg> Send Via WhatsApp</button>
            <button class="btn bsm" onclick="window.waTpl()" title="Discard edits and rebuild this template from the lead's details">↺ Reset to template</button>
            <span id="waTo" style="font-size:11px;color:var(--faint)"></span>
          </div>
        </div></div>

      <div class="sec hideblock" id="apptSec" style="display:none"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-cal"></use></svg> Appointment — slot board <span class="chipb info" id="apptMode" style="margin-left:6px">Direct (Walk-in)</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="g4">
            <div class="fld"><label class="lbl" for="slotDate">Date</label><input  class="input" type="date" id="slotDate" data-future="1" onchange="renderSlots()"></div>
            <div class="fld"><label class="lbl" for="apptHc">HC <span class="ab" id="apptHcSrc">FROM ASSIGNMENT</span></label><select  class="select" id="apptHc" disabled title="Set automatically from “HC assigned” in Assignment & pipeline — cannot be changed here"><option value="">— Select —</option></select></div>
            <div class="fld"><label class="lbl" for="apptCapRule">Capacity rule</label><input  class="input mono" id="apptCapRule" value="Select an HC first" readonly></div>
            <div class="fld"><label class="lbl" for="apptReq">Appt request <span class="ab">AUTO</span></label><input  class="input mono" id="apptReq" readonly placeholder="—"></div>
          </div>
          <div class="fld"><label class="lbl">Day view — slot occupancy</label><div class="slotgrid" id="slotGrid"></div></div>
          <div class="banner plan hideblock" id="reschBanner" style="display:none"><svg aria-hidden="true" focusable="false" class="icon" style="width:16px;height:16px"><use href="#i-repeat"></use></svg> <span>Reschedule mode — pick new slot.</span></div>
          <div style="display:flex;gap:9px;margin-top:13px"><button class="btn bp" id="bookBtn" onclick="bookSlot()"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-check"></use></svg> <span id="bookBtnLabel">Book into selected slot</span></button><button class="btn hideblock" id="reschBtn" style="display:none" onclick="startResch()"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-repeat"></use></svg> Reschedule</button></div>
        </div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-check"></use></svg> Visited status <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g3">
          <div class="fld"><label class="lbl">Visited status <span class="ab">AUTO</span></label><div class="pills" id="visStatusPills"><button class="pill p-vio on" type="button" style="pointer-events:none">Open</button><button class="pill p-info" type="button" id="visConfirmBtn" onclick="window._advToggleConfirm()" title="Mark this appointment as confirmed" style="cursor:pointer">Confirm</button><button class="pill p-ok" type="button" style="pointer-events:none">Visited</button></div><div style="font-size:11px;color:var(--faint);margin-top:4px">Click <b>Confirm</b> when you have confirmed the appointment with the client. Visited is set automatically at check-in.</div></div>
          <div class="fld"><label class="lbl" for="visDt">Visited date <span class="ab">AUTO</span></label><input  class="input" id="visDt" readonly placeholder="— set on Visited"></div>
        </div></div></div>

      <div class="sec" id="advEnrolledSec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-check"></use></svg> Enrolled status <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g3">
          <div class="fld"><label class="lbl">Enrolled status <span class="ab">AUTO</span></label><div class="pills" id="enrStatusPills" style="pointer-events:none"><button class="pill p-vio on" type="button">Open</button><button class="pill p-ok" type="button">Enrolled</button></div><div style="font-size:11px;color:var(--faint);margin-top:4px">Set automatically when the health coach marks the client Enrolled.</div></div>
          <div class="fld"><label class="lbl" for="enrDt">Enrolled date &amp; time <span class="ab">AUTO</span></label><input  class="input" id="enrDt" readonly placeholder="— set on Enrolled"></div>
        </div></div></div>

      <div class="sec closed" id="advSelfAuditSec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-audit"></use></svg> Sales caller self-audit <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="aud"><div class="ahd">Self evaluation</div><div class="g3">
          <div class="fld"><label class="lbl glbl">✓ Good</label><textarea aria-label="Sales caller self-audit — ✓ Good" class="area"></textarea></div>
          <div class="fld"><label class="lbl blbl">✗ Not good</label><textarea aria-label="Sales caller self-audit — ✗ Not good" class="area"></textarea></div>
          <div class="fld"><label class="lbl ilbl">▲ Improve</label><textarea aria-label="Sales caller self-audit — ▲ Improve" class="area"></textarea></div></div></div></div></div>

      <div class="sec closed" id="advBdmAuditSec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-audit"></use></svg> BDM audit <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="aud"><div class="ahd">BDM evaluation</div><div class="g3">
          <div class="fld"><label class="lbl glbl">✓ Good</label><textarea aria-label="BDM audit — ✓ Good" class="area"></textarea></div>
          <div class="fld"><label class="lbl blbl">✗ Not good</label><textarea aria-label="BDM audit — ✗ Not good" class="area"></textarea></div>
          <div class="fld"><label class="lbl ilbl">▲ Improve</label><textarea aria-label="BDM audit — ▲ Improve" class="area"></textarea></div></div>
          <div class="g3" style="margin-top:4px">
            <div class="fld"><label class="lbl">BDM score</label><div class="score" id="bdm"><button>1</button><button>2</button><button>3</button><button class="on">4</button><button>5</button></div></div>
            <div class="fld"><label class="lbl">Status</label><select aria-label="Status" class="select"><option>Open</option><option selected>Done</option></select></div></div></div></div></div>

      <div class="sec" id="advRemarksSec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-chat"></use></svg> Remarks <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="fld"><textarea aria-label="Remarks" class="area" rows="2" placeholder="Add a remark…"></textarea></div></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clock"></use></svg> Activity log <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="tscroll js-actlog" id="actLog" style="margin-top:12px;max-height:420px"><table class="tbl" style="min-width:640px"><thead><tr><th scope="col" style="width:132px">Action</th><th scope="col">Details</th><th scope="col" style="width:140px">Actor</th><th scope="col" style="width:186px">Date &amp; Time (IST)</th></tr></thead><tbody><tr><td colspan="4" style="text-align:center;color:var(--faint);padding:24px">No activity recorded for this lead yet.</td></tr></tbody></table></div></div></div>

      <div style="display:flex;gap:10px;margin-top:18px"><button class="btn bp" style="height:45px;padding:0 22px" onclick="window._advSaveRecord()">Save lead record</button></div>
    </div>
    <div class="a-p" data-p="health" style="display:none">
      <div class="banner plan" style="margin-top:16px"><svg aria-hidden="true" focusable="false" class="icon" style="width:15px;height:15px"><use href="#i-doc"></use></svg> <span><b>View only.</b> This clinical record is owned by the Health coach — advisors can read everything but edit nothing. Every view is audit-logged.</span></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-stetho"></use></svg> Consultation &amp; program <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No health-coach consultation recorded for this lead yet.</div></div></div>
    </div>
    <div class="a-p" data-p="pay" style="display:none"><div class="sec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-wallet"></use></svg> Payment history</div><div class="sec-bd"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No payment records for this lead yet.</div></div></div></div>
    <div class="a-p" data-p="notes" style="display:none"><div class="sec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-chat"></use></svg> Internal notes</div><div class="sec-bd"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No internal notes for this lead yet.</div></div></div></div>
    <div class="a-p" data-p="extra" style="display:none"><div class="sec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-doc"></use></svg> Extra info</div><div class="sec-bd"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No additional information for this lead yet.</div></div></div></div>
    <div class="a-p" data-p="calls" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-phone"></use></svg> Call logs &amp; recordings <span class="chipb ok" style="margin-left:auto">Auto-captured</span></div>
        <div class="sec-bd" id="advCallLog"><div style="text-align:center;color:var(--faint);padding:22px;font-size:13px">No call records for this lead yet.</div></div></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clock"></use></svg> History of activity</div>
        <div class="sec-bd"><div class="tscroll js-actlog" style="margin-top:4px;max-height:420px"><table class="tbl" style="min-width:640px"><thead><tr><th scope="col" style="width:132px">Action</th><th scope="col">Details</th><th scope="col" style="width:140px">Actor</th><th scope="col" style="width:186px">Date &amp; Time (IST)</th></tr></thead><tbody><tr><td colspan="4" style="text-align:center;color:var(--faint);padding:24px">No activity recorded for this lead yet.</td></tr></tbody></table></div></div></div>
    </div>
    </div><!-- /advDetailPane -->
    </div><!-- /flex row -->
  </div></section>

  <!-- COACH -->
  <section class="screen" id="s-coach"><div class="wrap">
    <div id="coachFilters" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
      <input aria-label="Visited from date" class="input" type="date" id="coFrom" style="height:30px;font-size:12px;width:145px" title="Visited from">
      <span style="color:var(--faint);font-size:12px">→</span>
      <input aria-label="Visited to date" class="input" type="date" id="coTo" style="height:30px;font-size:12px;width:145px" title="Visited to">
      <select aria-label="Filter by coach" class="select" id="coCoach" style="height:30px;font-size:12px;width:150px"><option value="all">All health coaches</option></select>
      <select aria-label="Filter by status" class="select" id="coStatus" style="height:30px;font-size:12px;width:150px"><option value="all">All statuses</option></select>
      <select aria-label="Filter by source" class="select" id="coSource" style="height:30px;font-size:12px;width:140px"><option value="all">All sources</option></select>
      <select aria-label="Filter by service" class="select" id="coService" style="height:30px;font-size:12px;width:140px"><option value="all">All services</option></select>
      <button class="btn bsm bp" onclick="window._coachFilterApply()">Apply</button>
      <button class="btn bsm" onclick="window._coachFilterClear()">Clear</button>
      <input aria-label="Search clients by name or phone" class="input" id="coSearch" placeholder="Search client / phone…" style="height:30px;font-size:12px;width:200px;margin-left:auto" oninput="window._coachSearch()">
    </div>
    <div class="sec" style="margin-bottom:14px" id="coachDashSec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-chart"></use></svg> Health Coach dashboard <span style="font-size:11px;color:var(--faint);font-weight:400;margin-left:8px">By consultation status &amp; program · click a card to filter</span>
      <div class="pills" id="coachViewToggle" style="margin-left:auto;flex-shrink:0"></div>
      <select aria-label="Filter by consultation status" class="select" id="coachConsFilter" style="height:30px;font-size:12px;width:210px;margin-left:8px;flex-shrink:0" title="Filter by consultation status" onchange="window._coachConsFilter(this.value)"></select></div>
      <div class="sec-bd"><div class="metrics" id="coachDash" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin:0"></div></div></div>
    <div class="sec" style="margin-bottom:14px" id="coachClientsSec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-user"></use></svg> Visited clients <span class="chipb ok" id="coachCliCount" style="margin-left:8px">0</span>
      <input aria-label="Search visited clients by client, phone or coach" class="input" id="coCliSearch" placeholder="Search client / phone / coach…" style="height:30px;font-size:12px;width:250px;margin-left:auto" oninput="window._coachCliSearch()">
      <button class="btn bsm" style="margin-left:8px" data-exp onclick="window._coachCliDownload()">⬇ Download</button></div>
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
    <div class="sec" style="margin-bottom:14px" id="zoomCiSecAdv"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-door"></use></svg> Zoom check-in <span class="chipb neu zoomCiCount" style="margin-left:8px">0</span><span style="margin-left:auto;font-size:11px;color:var(--faint)">Appointments fixed as “Appointment Fixed – Zoom” · checked in by Reception</span></div>
      <div class="sec-bd"><div class="tscroll"><table class="tbl" style="min-width:520px"><thead><tr><th scope="col">Client</th><th scope="col">Phone</th><th scope="col">Appointment Fixed Date &amp; Time</th><th scope="col">Status</th></tr></thead><tbody id="zoomCiListAdv"></tbody></table></div></div></div>
    <div class="chead">
      <span class="cav" id="coachAv" style="background:linear-gradient(135deg,#378ADD,#185FA5)">—</span>
      <div class="cmeta"><h1 id="coachName">No client open</h1>
        <div class="sub" id="coachSub"><span class="mono">Pick a visited client from the table above</span></div>
        <div class="cbadges" id="coachBadges"></div></div>
      <div class="cacts"><span class="chipb vio" id="coachBadge" style="height:30px">Status: —</span><button class="btn bp" id="coachCallBtn"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-phone"></use></svg> <span>Call</span></button><button class="btn bwa"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-msg"></use></svg> WA</button></div>
    </div>
    <div class="rtabs" id="cTabs">
      <button data-t="recep2">Walk-in Receptionist</button><button data-t="sales2">Walk-in Sales</button><button class="on" data-t="health2">Walk-in Health</button>
      <button data-t="pay2">Payment History</button><button data-t="notes2">Internal Notes</button>
      <button data-t="extra2">Extra Info</button><button data-t="calls2">Call History <span class="mini" id="coachCallCount">0</span></button>
    </div>
    <div class="c-p" data-p="health2">

      <div class="sec closed"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-user"></use></svg> Lead recap &amp; walk-in <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g4">
          <div class="fld"><label class="lbl" for="crSugar">Sugar level</label><input  class="input" id="crSugar" readonly></div>
          <div class="fld"><label class="lbl" for="crFasting">Fasting / PP</label><input  class="input mono" id="crFasting" readonly></div>
          <div class="fld"><label class="lbl" for="crHba1c">HbA1c (%)</label><input  class="input mono" id="crHba1c" readonly></div>
          <div class="fld"><label class="lbl" for="crWalkIn">Walk-in status</label><select  class="select" id="crWalkIn"><option>Open</option><option selected>Visited</option><option>Not Visited</option><option>Rescheduled</option></select></div>
          <div class="fld fw"><label class="lbl">Blood reports — from Health advisor <span class="ab">SYNCED</span></label>
            <div class="atts" id="coachAtts"></div></div>
          <div class="fld fw"><label class="lbl" for="crRemarks">Remarks</label><textarea  class="area" rows="2" id="crRemarks"></textarea></div>
        </div></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-heart"></use></svg> Screening results — clinic floor <span class="chipb warn" id="scrChip" style="margin-left:8px">Awaiting screening</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="stub" id="scrEmpty" style="margin-top:12px">Client is at reception / screening. The moment the screening desk saves the M0 baseline, the vitals appear here automatically — read-only, locked as baseline.</div>
          <div class="g4" id="scrData" style="display:none;margin-top:2px">
            <div class="fld"><label class="lbl" for="cs_h">Height (cm)</label><input  class="input mono" id="cs_h" readonly></div>
            <div class="fld"><label class="lbl" for="cs_w">Weight (kg)</label><input  class="input mono" id="cs_w" readonly></div>
            <div class="fld"><label class="lbl" for="cs_bmi">BMI <span class="ab">AUTO</span></label><input  class="input mono" id="cs_bmi" readonly></div>
            <div class="fld"><label class="lbl" for="cs_bp">BP</label><input  class="input mono" id="cs_bp" readonly></div>
            <div class="fld"><label class="lbl" for="cs_pu">Pulse</label><input  class="input mono" id="cs_pu" readonly></div>
            <div class="fld"><label class="lbl" for="cs_sp">SpO2 (%)</label><input  class="input mono" id="cs_sp" readonly></div>
            <div class="fld"><label class="lbl" for="cs_wa">Waist (cm)</label><input  class="input mono" id="cs_wa" readonly></div>
            <div class="fld"><label class="lbl" for="cs_te">Temp</label><input  class="input mono" id="cs_te" readonly></div>
            <div class="fld"><label class="lbl" for="cs_gl">Desk glucose (mg/dL)</label><input  class="input mono" id="cs_gl" readonly></div>
            <div class="fld" style="grid-column:span 3"><label class="lbl">Captured by</label><input aria-label="Captured by" class="input" value="Screening desk · M0 baseline · locked" readonly></div>
          </div>
        </div></div>
      <div class="sec closed" id="haSec"><div class="sec-hd" onclick="window._haSecToggle(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-heart"></use></svg> Health assessment <span class="chipb warn" style="margin-left:6px">In progress</span> <span class="arr">▾</span></div>
        <div class="sec-bd">
          <!-- Office-visit recording bar — moved here from the Consultation section on request; markup
               and ids unchanged, all logic still lives on the same handlers. Coach-profile restores
               stay aligned via the v:2 remap in applyCoachProfile. -->
          <div class="mic" style="flex-wrap:wrap;gap:8px"><button class="micb" id="micBtn" onclick="window._ovrToggle()"><svg aria-hidden="true" focusable="false" class="icon" style="width:19px;height:19px"><use href="#i-mic"></use></svg></button>
            <div style="flex:1;min-width:180px"><b style="font-size:13px" id="micTxt">Start office-visit recording</b><div style="font-size:11.5px;color:var(--muted)"><span id="ovrStatus">In-clinic Audio — Auto-saved to this Customer Profile</span> <span id="ovrTimer" class="mono" style="margin-left:6px;color:var(--alert);font-weight:700"></span></div></div>
            <button class="btn bsm bp" id="ovrStartBtn" onclick="window._ovrToggle()">● Start Recording</button>
            <button class="btn bsm" id="ovrStopBtn" onclick="window._ovrStop()" style="display:none;background:var(--alert,#D8442B);border-color:var(--alert,#D8442B);color:#fff">■ Stop Recording</button>
            <input aria-label="Consultation recording link" class="input" id="coachRecUrl" style="max-width:220px" placeholder="https://zoom.us/rec/… or call recording"><button class="btn bsm bp" id="coachSaveZoomBtn" onclick="window._coachSaveZoomLink()" style="margin-left:6px;white-space:nowrap">Save Link</button></div>
          <div id="ovrList" style="margin-top:8px"></div>

          <!-- Assessment gate: these three sections stay hidden until Start Recording is clicked in the
               #haGateModal popup, so a consultation is always captured alongside the data. Markup and
               ids inside are unchanged — only a wrapper class and a locked notice were added. -->
          <div id="haLockNote" class="aud" style="background:#fff;text-align:center;padding:22px 14px">
            <div style="font-size:34px;line-height:1">🎙️</div>
            <div class="ahd" style="margin-top:6px">Health assessment is locked</div>
            <div style="font-size:12.5px;color:var(--muted);margin-top:4px">Start the office-visit recording to open Basic health info, Lifestyle &amp; diet and Symptoms reported.</div>
            <button class="btn bp" style="margin-top:12px" onclick="window._haGateOpen()">● Start Recording</button>
          </div>
          <div class="aud ha-gated" id="haSecBasic" style="background:#fff"><div class="ahd">Basic health info</div><div class="g4">
            <div class="fld fw"><label class="lbl" for="haChief">Chief complaint</label><input  class="input" id="haChief"></div>
            <div class="fld"><label class="lbl" for="haDuration">Duration of diabetes <span class="req">*</span></label><select  class="select" id="haDuration"><option value="">-- Select --</option><option>Newly Diagnosed</option><option>1–3 yrs</option><option>3–5 yrs</option><option>5–10 yrs</option><option>10+ yrs</option></select></div>
            <div class="fld"><label class="lbl">Family history</label><select aria-label="Family history" class="select"><option>None</option><option selected>Father</option><option>Mother</option><option>Both Parents</option><option>Sibling</option></select></div>
            <div class="fld"><label class="lbl" for="haHeight">Height (cm)</label><input  class="input mono" id="haHeight" inputmode="decimal" oninput="window._numOnly(this);window._haBmiCalc()"></div>
            <div class="fld"><label class="lbl" for="haWeight">Weight (kg)</label><input  class="input mono" id="haWeight" inputmode="decimal" oninput="window._numOnly(this);window._haBmiCalc()"></div>
            <div class="fld"><label class="lbl" for="haBmi">BMI <span class="ab">AUTO</span></label><input  class="input mono" id="haBmi" readonly></div>
            <div class="fld"><label class="lbl" for="haBp">BP</label><input  class="input mono" id="haBp"></div>
            <div class="fld"><label class="lbl" for="haPulse">Pulse</label><input  class="input mono" id="haPulse" inputmode="numeric" oninput="window._numOnly(this)"></div>
            <div class="fld"><label class="lbl" for="haTemp">Temp</label><input  class="input mono" id="haTemp" inputmode="decimal" oninput="window._numOnly(this)"></div></div></div>
          <div class="aud ha-gated" id="haSecLifestyle" style="background:#fff"><div class="ahd">Lifestyle &amp; diet</div><div class="g4">
            <div class="fld"><label class="lbl">Diet type</label><select aria-label="Diet type" class="select"><option>Vegetarian</option><option selected>Non-Vegetarian</option><option>Vegan</option><option>Eggetarian</option></select></div>
            <div class="fld"><label class="lbl">Physical activity</label><select aria-label="Physical activity" class="select"><option selected>Sedentary</option><option>Light</option><option>Moderate</option><option>Active</option></select></div>
            <div class="fld"><label class="lbl">Sleep</label><select aria-label="Sleep" class="select"><option>&lt;5</option><option selected>5–6 hrs</option><option>6–7</option><option>7–8</option><option>8+</option></select></div>
            <div class="fld"><label class="lbl">Water (L/day)</label><select aria-label="Water (L/day)" class="select"><option>&lt;1L</option><option selected>1–2L</option><option>2–3L</option><option>3L+</option></select></div>
            <div class="fld"><label class="lbl">Smoking</label><select aria-label="Smoking" class="select"><option selected>Never</option><option>Occasional</option><option>Regular</option><option>Quit</option></select></div>
            <div class="fld"><label class="lbl">Alcohol</label><select aria-label="Alcohol" class="select"><option>Never</option><option selected>Occasional</option><option>Regular</option><option>Quit</option></select></div></div></div>
          <div class="aud ha-gated" id="haSecSymptoms" style="background:#fff"><div class="ahd">Symptoms reported</div>
            <div class="chips" data-oth="syOth"><button class="chip-o">Frequent Urination</button><button class="chip-o">Excessive Thirst</button><button class="chip-o">Fatigue</button><button class="chip-o">Blurred Vision</button><button class="chip-o">Tingling/Numbness</button><button class="chip-o">Slow Healing Wounds</button><button class="chip-o">Weight Loss</button><button class="chip-o">Headache</button><button class="chip-o" data-others="1">Others</button></div>
            <input aria-label="Other symptom — please specify" class="input hideblock" id="syOth" style="margin-top:8px;max-width:360px" placeholder="Enter details…"></div>
          <div class="fld"><label class="lbl" for="haDocNotes">Doctor / consultant notes</label><textarea  class="area" id="haDocNotes"></textarea></div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px">
            <button class="btn bp" id="haSaveBtn" onclick="window._coachSaveRecord()">Save health assessment</button>
            <button class="btn" id="haEditReqBtn" onclick="window._haEditRequest()">✎ Edit Request to BDM</button>
            <span id="haLockState" style="font-size:12px;font-weight:600"></span>
          </div>
        </div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-stetho"></use></svg> Consultation status &amp; program <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="g4">
            <div class="fld"><label class="lbl" for="haAttendedBy">Attended by (HC)</label><input  class="input" id="haAttendedBy" readonly></div>
            <div class="fld"><label class="lbl" for="haConsultDate">Consultation date</label><input  class="input" type="date" id="haConsultDate"></div>
            <div class="fld" id="reviewDateFld" style="display:none"><label class="lbl" for="haReviewDate">Review date <span class="ab">for join / this-week / month plans</span></label><input  class="input" type="datetime-local" id="haReviewDate" data-future="1"></div>
            <!-- Recording status hidden on request — NOT deleted: the coach profile saves pill states
                 positionally across the whole panel, so removing these three pills would shift every
                 later pill (consultation status, payment status) on previously saved profiles. The
                 auto-promote on a saved recording (_recStatusApply) also keeps working unchanged. -->
            <div class="fld" style="display:none"><label class="lbl">Recording status</label><div class="pills" id="recStatusPills"><button class="pill p-vio on" onclick="window._recStatusSet('open')">Open</button><button class="pill p-ok" onclick="window._recStatusSet('done')">Done</button><button class="pill p-al" onclick="window._recStatusSet('notdone')">Not Done</button></div></div>
          </div>
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
            <div style="display:flex;gap:9px;align-items:center"><svg aria-hidden="true" focusable="false" class="icon" style="width:16px;height:16px"><use href="#i-repeat"></use></svg><b>Strong follow-up flow — auto-created plan (committed but not paid)</b></div>
            <div class="g4" style="gap:10px">
              <div><label class="lbl" style="color:var(--vio-ink)" for="fuCommitDate">Commitment date *</label><input  class="input" style="height:36px" type="datetime-local" id="fuCommitDate" data-future="1" onchange="window._fuCommitSync()" oninput="window._fuCommitSync()"></div>
              <div><label class="lbl" style="color:var(--vio-ink)" for="fuOwner">Owner</label><select  class="select" style="height:36px" id="fuOwner"><option selected>-- Select --</option></select></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Blocker</label><select aria-label="Blocker" class="select" style="height:36px"><option>Budget / salary date</option><option>Family discussion</option><option>Travel</option><option>Comparing options</option></select></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Hold offer till</label><input aria-label="Hold offer till" class="input" style="height:36px" type="date" data-future="1"></div>
              <div><label class="lbl" style="color:var(--vio-ink)">Reminder before <span class="nb">NEW</span></label><select aria-label="Reminder before" class="select" style="height:36px"><option selected>15 min before</option><option>30 min before</option></select></div>
              <div style="grid-column:span 3"><label class="lbl" style="color:var(--vio-ink)">If not actioned — repeat notify</label><input aria-label="If not actioned — repeat notify" class="input" style="height:36px" value="Re-notify owner every 10 min × 3 → then escalate to ABM + Deviation page" readonly></div>
            </div>
            <div><label class="lbl" style="color:var(--vio-ink)">Follow-up notes — every attempt logged (clients may take 5–6 follow-ups)</label>
              <div style="display:flex;gap:8px"><input aria-label="Follow-up note" class="input" id="fuNote" style="height:36px;background:#fff" placeholder="e.g. Spoke to wife, salary on 1st — call on 2nd…"><button class="btn bsm" style="height:36px;flex:none;background:#fff" onclick="addFuNote()">Add note</button></div>
              <div id="fuNotes" style="margin-top:9px;display:flex;flex-direction:column;gap:6px"></div></div>
            <div style="font-size:11.5px;font-weight:500">Auto-touch plan: ① WA summary + program PDF today · ② call T+2 days · ③ WA offer-reminder T+5 · ④ call on commitment date − 1 · ⑤ missed → Deviation + ABM. Every touch logged.</div>
          </div>
          <div class="banner bad hideblock" id="refundPanel" style="display:none;flex-direction:column;align-items:stretch;gap:10px">
            <div style="display:flex;gap:9px;align-items:center"><svg aria-hidden="true" focusable="false" class="icon" style="width:16px;height:16px"><use href="#i-coin"></use></svg><b>Refund request — routes through ABM → BM → Accounts (rule-enforced)</b></div>
            <div class="g4" style="gap:10px">
              <div><label class="lbl" style="color:var(--alert-ink)" for="refReason">Reason *</label><select class="select" id="refReason" style="height:36px"><option value="">-- Select --</option><option>Medical — cannot continue</option><option>Relocation</option><option>Dissatisfied with program</option><option>Financial difficulty</option><option>Duplicate payment</option><option>Others</option></select></div>
              <div><label class="lbl" style="color:var(--alert-ink)" for="refPaid">Paid amount <span class="ab">AUTO</span></label><input class="input mono" style="height:36px" id="refPaid" readonly></div>
              <div><label class="lbl" style="color:var(--alert-ink)" for="refDays">Days since payment <span class="ab">AUTO</span></label><input class="input mono" style="height:36px" id="refDays" readonly></div>
              <div><label class="lbl" style="color:var(--alert-ink)" for="refEligible">Refund amount <span class="req">*</span></label><input class="input mono" style="height:36px" id="refEligible" type="number" min="0" step="1" inputmode="numeric" placeholder="Enter amount" title="The amount being requested — cannot exceed what the client has paid for this program"></div>
            </div>
            <button class="btn bsm" style="background:#fff;align-self:flex-start" onclick="window._submitRefund()">Submit refund request → ABM</button>
          </div>
          <div class="fld"><label class="lbl">Client expectations &amp; commitments</label><textarea aria-label="Client expectations & commitments" class="area" placeholder="e.g. HbA1c 9.2 → below 7 in 3 months; morning walks; diet…"></textarea></div>
          <div class="g4" style="margin-top:3px">
            <div class="fld"><label class="lbl" for="haProgram">Program suggested</label><select  class="select" id="haProgram" onchange="window._syncProgramPricing()"><option>L1</option><option selected>L2</option><option>L1 + L2</option></select></div>
            <div class="fld"><label class="lbl" for="haL1Price">L1 price · full only</label><select  class="select" id="haL1Price" onchange="window._payCalcAll()"><option>₹3,999 (Standard)</option><option>₹3,500 (Offer)</option><option>Special Offer</option></select></div>
            <div class="fld"><label class="lbl" for="haSpecialAmt">Special offer amt (₹)</label><input  class="input mono" id="haSpecialAmt" inputmode="numeric" maxlength="9" placeholder="0" oninput="window._numOnly(this);window._payCalcAll()"></div>
            <div class="fld"><label class="lbl" for="haL2Price">L2 price (₹)</label><input  class="input mono" id="haL2Price" inputmode="decimal" oninput="window._numOnly(this);window._payCalcAll()"></div>
            <div class="fld" style="grid-column:span 2"><label class="lbl">Coupon code — special discount <span class="nb">NEW</span></label>
              <div style="display:flex;gap:7px"><input aria-label="Coupon code — special discount" class="input mono" id="coupon" placeholder="e.g. FEST2000"><button class="btn" style="height:39px;flex:none" onclick="applyCoupon()">Apply</button></div>
              <div id="couponRes" style="font-size:11.5px;font-weight:600;margin-top:6px;display:flex;gap:7px;flex-wrap:wrap;align-items:center"></div></div>
            <div class="fld"><label class="lbl">Client category</label><select aria-label="Client category" class="select"><option>-- Select --</option><option>VIP</option><option>Staff Relatives</option><option>Officers</option><option>Complicated</option></select></div>
            <div class="fld"><label class="lbl">Date of joining</label><input aria-label="Date of joining" class="input" type="date" data-future="1"></div>
            <div class="fld"><label class="lbl">Access planned</label><input aria-label="Access planned" class="input" type="date" data-future="1"></div>
            <div class="fld"><label class="lbl" for="haAttendedBy2">Attended by <span class="ab">AUTO</span></label><input  class="input" id="haAttendedBy2" readonly></div>
          </div>
        </div></div>

      <div class="sec hideblock" id="paySec" style="display:none"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-wallet"></use></svg> Payment — <span id="payFlowLbl">standard</span> collection flow <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div id="coachPaySummary"></div>
          <div class="steps"><div class="step on"><span class="n">1</span> Quote (auto from price master)</div><div class="step on"><span class="n">2</span> Collect — Reception desk / Razorpay link / EMI provider</div><div class="step"><span class="n">3</span> Attach proof *</div><div class="step"><span class="n">4</span> Accounts verifies vs bank</div><div class="step"><span class="n">5</span> Auto receipt + GST invoice</div></div>
          <div class="banner good" style="margin-top:10px"><svg aria-hidden="true" focusable="false" class="icon" style="width:15px;height:15px"><use href="#i-check"></use></svg> <span><b>Who collects:</b> Reception or Razorpay link — never the coach. Coach closes, Reception/link collects, Accounts verifies. Cash gets a numbered desk receipt; nothing is "received" until proof + ref are attached.</span></div>
          <div class="g3" style="margin-top:6px">
            <div class="fld"><label class="lbl" for="payMethod">Payment method</label>
              <select  class="select" id="payMethod" onchange="payBlk(this.value)"><option value="">-- Select --</option><option value="full" selected>Full Payment (1 Shot)</option><option value="i2">Installment (2x)</option><option value="emi">EMI (BFL / SaveIn)</option><option value="adv">Advance Booking</option></select></div>
            <div class="fld"><label class="lbl" for="collectedBy">Collected by</label><select  class="select" id="collectedBy"><option selected>Reception desk</option><option>Razorpay link (online)</option><option>EMI provider</option><option>POS Machine</option></select></div>
            <div class="fld"><label class="lbl">Accounts team verification</label><div class="pills" id="payVerify"><button class="pill p-warn on" onclick="window._payVerify('pending',this)">Pending</button><button class="pill p-ok" onclick="window._payVerify('verified',this)">Verified</button></div></div>
          </div>
          <div style="display:flex;gap:10px;margin-top:12px;align-items:center;flex-wrap:wrap">
            <button class="btn bsm bp" id="sendCollectBtn" onclick="sendToReception()"><svg aria-hidden="true" focusable="false" class="icon" style="width:14px;height:14px"><use href="#i-coin"></use></svg> Send collection request to Reception</button>
            <span style="font-size:11.5px;color:var(--muted)">Appears instantly in <b>Reception → Collect payment</b> queue with client, plan &amp; amount</span>
          </div>

          <div class="payblk on" id="pb-full"><div class="pt"><svg aria-hidden="true" focusable="false" class="icon" style="width:15px;height:15px"><use href="#i-coin"></use></svg> Full payment</div>
            <div class="g4">
              <div class="fld"><label class="lbl" for="payAmtDue">Amount due <span class="ab">AUTO</span></label><input  class="input mono" id="payAmtDue" readonly></div>
              <div class="fld"><label class="lbl" for="payFullRcvd">Amount received (₹) <span class="req">*</span></label><input  class="input mono" id="payFullRcvd" inputmode="decimal" oninput="window._payAmtRcvd(this,'#payAmtDue','#payFullRcvdErr');window._payCalcFull()"><div id="payFullRcvdErr" style="display:none;color:var(--alert-ink);font-size:11px;margin-top:3px"></div></div>
              <div class="fld"><label class="lbl" for="payFullMode">Mode <span class="req">*</span></label><select  class="select" id="payFullMode"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Cheque</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl" for="payFullRef">Txn ref / UTR *</label><input  class="input mono" id="payFullRef" placeholder="Mandatory"></div>
              <div class="fld"><label class="lbl" for="payFullDate">Actual paid date</label><input  class="input" type="date" id="payFullDate"></div>
              <div class="fld fw"><label class="lbl">Payment proof — attachment * <span class="nb">NEW</span></label><div class="atts" id="payFullProof"><span class="att add" onclick="window._payAttach('payFullProof')"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clip"></use></svg> Attach screenshot / receipt</span></div></div>
              <div class="fld fw"><label class="lbl">Status <span class="req">*</span></label><select aria-label="Full payment — Status" class="select" data-nocap onchange="window._payStSel(this)" style="max-width:260px"><option>Payment Done</option><option selected>In Process</option><option>Pending</option></select><div class="pills" style="display:none"><button class="pill p-ok">Payment Done</button><button class="pill p-warn on">In Process</button><button class="pill">Pending</button></div></div>
            </div></div>

          <div class="payblk" id="pb-i2"><div class="pt"><svg aria-hidden="true" focusable="false" class="icon" style="width:15px;height:15px"><use href="#i-coin"></use></svg> Installment (2x) — balance never untracked</div>
            <div class="aud" style="background:#fff;margin-top:8px"><div class="ahd">Part 1 — Installment 1 (collected now)</div><div class="g4">
              <div class="fld"><label class="lbl" for="i2Total">Total <span class="ab">AUTO</span></label><input  class="input mono" id="i2Total" placeholder="Auto from L2 price" inputmode="decimal" readonly></div>
              <div class="fld"><label class="lbl" for="i2Inst1Rcvd">Inst-1 received (₹) <span class="req">*</span></label><input  class="input mono" id="i2Inst1Rcvd" placeholder="e.g. 16000" inputmode="decimal" oninput="this.classList.remove('err');window._payAmtRcvd(this,'#i2Total','#i2Inst1RcvdErr');window._payCalcI2()"><div id="i2Inst1RcvdErr" style="display:none;color:var(--alert-ink);font-size:11px;margin-top:3px"></div></div>
              <div class="fld"><label class="lbl" for="i2Inst1Mode">Mode <span class="req">*</span></label><select  class="select" id="i2Inst1Mode" onchange="this.classList.remove('err')"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl" for="i2Inst1Date">Inst-1 date <span class="req">*</span></label><input  class="input" type="date" id="i2Inst1Date" onchange="this.classList.remove('err');window._syncI2BalDue()"></div>
              <div class="fld"><label class="lbl" for="i2Inst1Ref">Txn ref / UTR</label><input  class="input mono" id="i2Inst1Ref" placeholder="e.g. UTR / desk receipt no."></div>
              <div class="fld" style="grid-column:span 3"><label class="lbl">Inst-1 proof</label><div class="atts" id="i2Inst1Proof"><span class="att add" onclick="window._payAttach('i2Inst1Proof')"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clip"></use></svg> Attach proof</span></div></div>
            </div></div>
            <div class="aud" style="background:#fff"><div class="ahd" style="color:var(--warn-ink)">Part 2 — Balance collection (separate fields · auto-reminders from Accounts)</div><div class="g4">
              <div class="fld"><label class="lbl" for="i2BalDue">Balance due <span class="ab">AUTO</span></label><input  class="input mono" id="i2BalDue" readonly></div>
              <div class="fld"><label class="lbl" for="i2BalDueDate">Balance due date <span class="ab">AUTO · +30d</span></label><input  class="input mono" type="text" id="i2BalDueDate" readonly placeholder="30 days after Inst-1 date" title="Auto-calculated: Installment-1 date + 30 days"></div>
              <div class="fld"><label class="lbl" for="i2BalRcvd">Balance received (₹)</label><input  class="input mono" id="i2BalRcvd" inputmode="decimal" oninput="window._payAmtRcvd(this,'#i2BalDue','#i2BalRcvdErr')"><div id="i2BalRcvdErr" style="display:none;color:var(--alert-ink);font-size:11px;margin-top:3px"></div></div>
              <div class="fld"><label class="lbl" for="i2BalMode">Mode</label><select  class="select" id="i2BalMode"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl" for="i2BalDate">Balance paid date</label><input  class="input" type="date" id="i2BalDate"></div>
              <div class="fld"><label class="lbl" for="i2BalRef">Txn ref / UTR *</label><input  class="input mono" id="i2BalRef" placeholder="Mandatory"></div>
              <div class="fld" style="grid-column:span 2"><label class="lbl">Balance proof *</label><div class="atts" id="i2BalProof"><span class="att add" onclick="window._payAttach('i2BalProof')"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clip"></use></svg> Attach proof</span></div></div>
            </div></div>
            <div class="fld fw"><label class="lbl">Status <span class="req">*</span></label><select aria-label="Installment payment — Status" class="select" data-nocap onchange="window._payStSel(this)" style="max-width:260px"><option>1st Paid</option><option>2nd Paid</option><option>Both Paid</option><option>In Process</option><option selected>Pending</option></select><div class="pills" style="display:none"><button class="pill p-info">1st Paid</button><button class="pill p-info">2nd Paid</button><button class="pill p-ok">Both Paid</button><button class="pill p-warn">In Process</button><button class="pill on">Pending</button></div></div>
            </div>

          <div class="payblk" id="pb-emi"><div class="pt"><svg aria-hidden="true" focusable="false" class="icon" style="width:15px;height:15px"><use href="#i-coin"></use></svg> EMI (BFL / SaveIn) — client pays financier; we track down payment &amp; disbursement</div>
            <div class="g4">
              <div class="fld"><label class="lbl">Provider</label><select aria-label="Provider" class="select"><option selected>BFL (Bajaj Finserv)</option><option>SaveIn</option></select></div>
              <div class="fld"><label class="lbl">Eligibility (provider tool)</label><div class="pills"><button class="pill p-ok on">Eligible</button><button class="pill p-al">Not Eligible</button></div></div>
              <div class="fld" style="grid-column:span 2"><label class="lbl">Coupon code <span class="nb">NEW</span></label>
                <div style="display:flex;gap:7px"><input aria-label="EMI coupon code" class="input mono" id="emiCoupon" placeholder="e.g. FEST2000"><button class="btn" style="height:39px;flex:none" onclick="applyCouponEmi()">Apply</button></div>
                <div id="emiCouponRes" style="font-size:11.5px;font-weight:600;margin-top:6px;display:flex;gap:7px;flex-wrap:wrap;align-items:center"></div></div>
              <div class="fld"><label class="lbl" for="emiCost">Program cost <span class="ab">AUTO</span></label><input  class="input mono" id="emiCost" readonly></div>
              <div class="fld"><label class="lbl" for="emiDown">Down payment (₹) — drives calculator</label><input  class="input mono" id="emiDown" placeholder="e.g. 5000" inputmode="decimal" oninput="window._numOnly(this);emiCalc()"></div>
              <div class="fld"><label class="lbl" for="emiRemain">Financed balance <span class="ab">AUTO</span></label><input  class="input mono" id="emiRemain" readonly></div>
              <div class="fld"><label class="lbl" for="emiTenure">Tenure (months) — drives calculator</label><select  class="select" id="emiTenure" onchange="emiCalc()"><option value="">--</option><option>3</option><option>6</option><option>9</option><option>12</option></select></div>
              <div class="fld"><label class="lbl" for="emiPer">EMI / month <span class="ab">AUTO calculated</span></label><input  class="input mono" id="emiPer" readonly></div>
              <div class="fld"><label class="lbl">Documentation date</label><input aria-label="Documentation date" class="input" type="date"></div>
              <div class="fld"><label class="lbl">Disbursement ETA <span class="ab">24–48h</span></label><input aria-label="Disbursement ETA" class="input" type="date" data-future="1"></div>
              <div class="fld"><label class="lbl" for="emiNet">Net after subvention <span class="ab">AUTO</span></label><input  class="input mono" id="emiNet" readonly></div>
              <div class="fld fw"><label class="lbl">Proof * — down-payment receipt + approval screen + disbursement credit</label><div class="atts" id="emiProofs"><span class="att add" onclick="window._payAttach('emiProofs')"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clip"></use></svg> Attach down-payment proof</span><span class="att add" onclick="window._payAttach('emiProofs')"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clip"></use></svg> Attach approval</span><span class="att add" onclick="window._payAttach('emiProofs')"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clip"></use></svg> Attach credit proof</span></div></div>
              <!-- EMI deals go through the BDM. The button lives INSIDE the EMI block so it exists
                   exactly when Payment method = EMI (BFL / SaveIn) — no separate show/hide logic to
                   drift — and sits after the proofs so the coach attaches evidence before asking. -->
              <div class="fld fw" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:6px;padding-top:12px;border-top:1px dashed var(--line)">
                <button class="btn bp" id="bdmReqBtn" onclick="window._bdmRequest()">→ Request to BDM</button>
                <span id="bdmReqState" style="font-size:12px;font-weight:600"></span>
              </div>
              <div class="fld fw"><label class="lbl">EMI payment collection — status <span class="req">*</span></label><select aria-label="EMI payment collection — status" class="select" data-nocap onchange="window._payStSel(this)" style="max-width:260px"><option selected>Open</option><option>EMI Received</option><option>EMI Process</option></select><div class="pills" style="display:none"><button class="pill p-vio on">Open</button><button class="pill p-ok">EMI Received</button><button class="pill p-warn">EMI Process</button></div></div>
            </div></div>

          <div class="payblk" id="pb-adv"><div class="pt"><svg aria-hidden="true" focusable="false" class="icon" style="width:15px;height:15px"><use href="#i-coin"></use></svg> Advance booking — locks the price, starts the clock</div>
            <div class="aud" style="background:#fff;margin-top:8px"><div class="ahd">Part 1 — Advance (collected now)</div><div class="g4">
              <div class="fld"><label class="lbl" for="advAmt">Advance (₹2K–5K) <span class="req">*</span></label><input  class="input mono" id="advAmt" placeholder="e.g. 2000" inputmode="numeric" maxlength="9" oninput="window._numOnly(this);window._payCalcAdv()"></div>
              <div class="fld"><label class="lbl" for="advMode">Mode <span class="req">*</span></label><select  class="select" id="advMode"><option>Cash</option><option selected>UPI</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl" for="advDate">Advance date <span class="req">*</span></label><input  class="input" type="date" id="advDate" onchange="this.classList.remove('err');window._syncAdvBalDue()"></div>
              <div class="fld"><label class="lbl" for="advRef">Txn ref / UTR *</label><input  class="input mono" id="advRef" placeholder="Mandatory"></div>
              <div class="fld fw"><label class="lbl">Advance proof *</label><div class="atts" id="advProof"><span class="att add" onclick="window._payAttach('advProof')"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clip"></use></svg> Attach proof</span></div></div>
            </div></div>
            <div class="aud" style="background:#fff"><div class="ahd" style="color:var(--warn-ink)">Part 2 — Balance collection (separate fields · auto-reminders + Outstanding queue)</div><div class="g4">
              <div class="fld"><label class="lbl" for="advBalDue">Balance due <span class="ab">AUTO</span></label><input  class="input mono" id="advBalDue" readonly></div>
              <div class="fld"><label class="lbl" for="advBalDueDate">Balance due date <span class="ab">AUTO · +30d</span></label><input  class="input mono" type="text" id="advBalDueDate" readonly placeholder="30 days after Advance date" title="Auto-calculated: Advance date + 30 days"></div>
              <div class="fld"><label class="lbl" for="advBalRcvd">Balance received (₹)</label><input  class="input mono" id="advBalRcvd" inputmode="decimal" oninput="window._payAmtRcvd(this,'#advBalDue','#advBalRcvdErr')"><div id="advBalRcvdErr" style="display:none;color:var(--alert-ink);font-size:11px;margin-top:3px"></div></div>
              <div class="fld"><label class="lbl" for="advBalMode">Mode</label><select  class="select" id="advBalMode"><option>Cash</option><option selected>UPI</option><option>Bank Transfer</option><option>Card</option></select></div>
              <div class="fld"><label class="lbl" for="advBalDate">Balance paid date</label><input  class="input" type="date" id="advBalDate"></div>
              <div class="fld"><label class="lbl" for="advBalRef">Txn ref / UTR *</label><input  class="input mono" id="advBalRef" placeholder="Mandatory"></div>
              <div class="fld" style="grid-column:span 2"><label class="lbl">Balance proof *</label><div class="atts" id="advBalProof"><span class="att add" onclick="window._payAttach('advBalProof')"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clip"></use></svg> Attach proof</span></div></div>
            </div></div>
            <div class="fld fw"><label class="lbl">Status <span class="req">*</span></label><select aria-label="Advance payment — Status" class="select" data-nocap onchange="window._payStSel(this)" style="max-width:260px"><option>Advance Paid</option><option selected>Balance Pending</option><option>Fully Paid</option><option>Cancelled</option></select><div class="pills" style="display:none"><button class="pill p-ok">Advance Paid</button><button class="pill p-warn on">Balance Pending</button><button class="pill p-ok">Fully Paid</button><button class="pill p-al">Cancelled</button></div></div>
            </div>
        </div></div>

      <div class="sec" id="enrollStatusSec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-check"></use></svg> Enrolled status <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g2">
          <div class="fld"><label class="lbl">Enrolled status <span class="ab">AUTO — set from payment</span></label>
            <div><span id="payEnrollChip" class="chipb neu">Not enrolled</span></div>
            <div style="font-size:11px;color:var(--faint);margin-top:6px">Enrolled – L1 / L2 is set automatically when this method's status is marked done (Full → Payment Done · Installment → 1st Paid · EMI → EMI Received · Advance → Fully Paid) for the selected program.</div></div>
          <div class="fld"><label class="lbl" for="payEnrollAt">Enrolled date &amp; time <span class="ab">AUTO</span></label><input  class="input" id="payEnrollAt" readonly placeholder="— set on Enrolled"></div>
        </div></div></div>

      <div class="sec closed"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-chat"></use></svg> Feedback call <span class="arr">▾</span></div>
        <div class="sec-bd">
          <div class="fld"><label class="lbl">Call outcome</label>
            <div class="pills"><button class="pill p-ok">Attended — Feedback Collected</button><button class="pill p-warn">Not Attended — Rescheduled</button><button class="pill p-info">Call Back Requested</button><button class="pill p-al">Switched Off</button><button class="pill p-vio on">Open</button></div></div>
          <div class="g2"><div class="fld"><label class="lbl">Next feedback call</label><input aria-label="Next feedback call" class="input" type="datetime-local" data-future="1"></div></div>
          <div class="fld"><label class="lbl">Feedback notes</label><textarea aria-label="Feedback notes" class="area"></textarea></div>
        </div></div>

      <div class="banner plan" style="margin-top:16px"><svg aria-hidden="true" focusable="false" class="icon" style="width:15px;height:15px"><use href="#i-coin"></use></svg> <span>Follow-up &amp; collection sections removed from this screen — committed-not-paid runs through the <b>strong follow-up flow</b> above; balance chasing lives in <b>Accounts → Outstanding</b> with auto-reminders.</span></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-gift"></use></svg> Welcome kit <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="g3">
          <div class="fld"><label class="lbl" for="haAttendedBy3">Attended by <span class="ab">AUTO</span></label><input  class="input" id="haAttendedBy3" readonly></div>
          <div class="fld" style="grid-column:span 2"><label class="lbl">Welcome kit status</label>
            <div class="pills"><button class="pill p-ok" onclick="toast('Kit issued · logged')">Given</button><button class="pill p-warn">Need to Ship</button><button class="pill p-vio on">Not Required</button></div></div>
        </div></div></div>

      <!-- ACTIVITY LOG (Health Coach) — placed exactly where the Advisor has it: the last section of
           the record, immediately above the Save button, so it is read in the same place on both
           screens rather than hidden behind a tab. Rendered by renderActivityLog into this screen's
           OWN container class: both panels are in the DOM at once, and a shared class would let one
           screen repaint the other's log with the wrong lead. -->
      <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-clock"></use></svg> Activity log <span class="nb">NEW</span> <span class="arr">▾</span></div>
        <div class="sec-bd"><div class="tscroll js-actlog-coach" id="coachActLog" style="margin-top:12px;max-height:420px"><table class="tbl" style="min-width:640px"><tbody><tr><td style="text-align:center;color:var(--faint);padding:24px">Loading activity…</td></tr></tbody></table></div></div></div>

      <div style="display:flex;gap:10px;margin-top:18px"><button class="btn bp" style="height:45px;padding:0 22px" onclick="window._coachSaveRecord()">Save health record</button><button class="btn" style="height:45px" onclick="window._coachPrint()">📋 Print prescription</button></div>
    </div>
    <div class="c-p" data-p="recep2" style="display:none"><div class="banner plan" style="margin-top:16px"><svg aria-hidden="true" focusable="false" class="icon" style="width:15px;height:15px"><use href="#i-doc"></use></svg> <span><b>View only.</b> Reception record — same as advisor view.</span></div><div class="sec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-door"></use></svg> Reception record <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div><div class="sec-bd"><table class="tbl"><tbody id="coachRecepBody"><tr><td style="color:var(--muted)">Visited</td><td class="mono">—</td><td style="color:var(--muted)">Registered</td><td class="mono">—</td><td style="color:var(--muted)">Consent</td><td>—</td></tr></tbody></table></div></div></div>
    <div class="c-p" data-p="sales2" style="display:none">
      <div class="banner plan" style="margin-top:16px"><svg aria-hidden="true" focusable="false" class="icon" style="width:15px;height:15px"><use href="#i-doc"></use></svg> <span><b>View only.</b> This sales record is owned by the Health advisor — coaches can read the full journey but edit nothing.</span></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-user"></use></svg> Basic &amp; pipeline <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><table class="tbl"><tbody id="roBasic">
          <tr><td style="color:var(--muted)">Occupation</td><td>—</td><td style="color:var(--muted)">Language</td><td>—</td><td style="color:var(--muted)">Source · campaign</td><td>—</td></tr>
          <tr><td style="color:var(--muted)">Location</td><td>—</td><td style="color:var(--muted)">Salesperson</td><td style="font-weight:600">—</td><td style="color:var(--muted)">Priority · probability</td><td>—</td></tr>
        </tbody></table></div></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-drop"></use></svg> Sugar profile &amp; eligibility <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><table class="tbl"><tbody id="roSugar">
          <tr><td style="color:var(--muted)">Sugar level</td><td>—</td><td style="color:var(--muted)">Fasting / PP</td><td class="mono">—</td><td style="color:var(--muted)">HbA1c</td><td class="mono" style="font-weight:700">—</td></tr>
          <tr><td style="color:var(--muted)">Treatment</td><td>—</td><td style="color:var(--muted)">Managing now</td><td>—</td><td style="color:var(--muted)">Eligibility</td><td>—</td></tr>
        </tbody></table></div></div>
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-phone"></use></svg> Call journey &amp; appointment <span class="chipb neu" style="margin-left:auto">🔒 Read-only</span></div>
        <div class="sec-bd"><table class="tbl"><tbody id="roCalls">
          <tr><td style="color:var(--muted)">Call status</td><td>—</td><td style="color:var(--muted)">Appointment</td><td class="mono">—</td><td style="color:var(--muted)">HC</td><td style="font-weight:600">—</td></tr>
          <tr><td style="color:var(--muted)">Last call note</td><td colspan="5">—</td></tr>
        </tbody></table></div></div>
    </div>
    <div class="c-p" data-p="pay2" style="display:none"><div class="sec"><div class="sec-hd" style="cursor:default"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-wallet"></use></svg> Payment history</div><div class="sec-bd"><div id="coachPayHist"><div class="stub">No payment records for this client yet.</div></div></div></div></div>
    <div class="c-p" data-p="notes2" style="display:none"><div class="stub">Internal notes.</div></div>
    <div class="c-p" data-p="extra2" style="display:none"><div class="stub">Extra info.</div></div>
    <div class="c-p" data-p="calls2" style="display:none"><div class="sec"><div class="sec-hd" style="cursor:default;padding:10px 14px"><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-phone"></use></svg> Call logs &amp; recordings <span class="chipb ok" style="margin-left:auto">Auto-captured</span></div><div class="sec-bd" id="coachCallLog"><div class="stub">No call records for this lead yet.</div></div></div>
</div>
  </div></section>

  <!-- LEAD IMPORT -->
  <!-- ===== META LEADS — pick an ad account / campaign / form and see exactly what arrived ===== -->
  <section class="screen" id="s-metaleads"><div class="wrap" style="max-width:1280px;padding:16px 20px 60px">
    <div class="ph"><div><h1>Meta leads</h1><p>Every lead captured from Meta — filter by ad account, campaign or form to check what is coming in.</p></div>
      <div class="pha"><button class="btn" data-exp onclick="window._mlExport()">⬇ Export</button><button class="btn bp" onclick="window._mlReload()">↻ Refresh</button></div></div>
    <!-- overflow:visible on BOTH the card and its body: the Campaign/Form menus are absolutely
         positioned inside this card, and .sec clips its content by default — which is why the
         dropdown appeared cut off after the first row. Same fix the pool "Assign to" menu uses. -->
    <div class="sec" style="margin-bottom:12px;overflow:visible"><div class="sec-bd" style="overflow:visible">
      <div class="g4" style="overflow:visible">
        <div class="fld"><label class="lbl" for="mlAcct">Ad account</label><select class="select" id="mlAcct" onchange="window._mlRender()"><option value="all">All ad accounts</option></select></div>
        <div class="fld"><label class="lbl">Campaign</label>
          <div id="mlCampWrap" style="position:relative">
            <button type="button" class="select" id="mlCampBtn" onclick="window._mlCampToggle(event)" style="cursor:pointer;width:100%;text-align:left;display:flex;align-items:center;gap:6px;font-weight:500"><span id="mlCampLabel" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted)">All campaigns</span><span style="color:var(--faint);font-size:11px">▾</span></button>
            <!-- Search + Select All are STATIC: only the list below re-renders, so a keystroke can't
                 rebuild the input and steal focus mid-typing. -->
            <div id="mlCampMenu" class="mlfm" style="display:none">
              <div class="mlfm-search"><span class="ic">🔍</span><input id="mlCampSearch" placeholder="Search…" autocomplete="off" oninput="window._mlCampSearch(this.value)" onclick="event.stopPropagation()"></div>
              <label class="mlfm-all"><input type="checkbox" id="mlCampAll" onchange="event.stopPropagation();window._mlCampSelectAll(this.checked)"><span>Select All</span><button type="button" class="mlfm-clear" onclick="event.stopPropagation();window._mlCampClear()">Clear</button></label>
              <div id="mlCampList" class="mlfm-list"></div>
            </div>
          </div>
          <div id="mlCampChips" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px"></div>
        </div>
        <div class="fld"><label class="lbl">Ad name</label>
          <div id="mlAdWrap" style="position:relative">
            <button type="button" class="select" id="mlAdBtn" onclick="window._mlAdToggle(event)" style="cursor:pointer;width:100%;text-align:left;display:flex;align-items:center;gap:6px;font-weight:500"><span id="mlAdLabel" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted)">All ads</span><span style="color:var(--faint);font-size:11px">▾</span></button>
            <!-- Search + Select All are STATIC so a keystroke never rebuilds the input under the cursor. -->
            <div id="mlAdMenu" class="mlfm" style="display:none">
              <div class="mlfm-search"><span class="ic">🔍</span><input id="mlAdSearch" placeholder="Search…" autocomplete="off" oninput="window._mlAdSearch(this.value)" onclick="event.stopPropagation()"></div>
              <label class="mlfm-all"><input type="checkbox" id="mlAdAll" onchange="event.stopPropagation();window._mlAdSelectAll(this.checked)"><span>Select All</span><button type="button" class="mlfm-clear" onclick="event.stopPropagation();window._mlAdClear()">Clear</button></label>
              <div id="mlAdList" class="mlfm-list"></div>
            </div>
          </div>
          <div id="mlAdChips" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px"></div>
        </div>
        <div class="fld"><label class="lbl">Form</label>
          <div id="mlFormWrap" style="position:relative">
            <button type="button" class="select" id="mlFormBtn" onclick="window._mlFormToggle(event)" style="cursor:pointer;width:100%;text-align:left;display:flex;align-items:center;gap:6px;font-weight:500"><span id="mlFormLabel" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted)">All forms</span><span style="color:var(--faint);font-size:11px">▾</span></button>
            <!-- Search + header + legend are STATIC: the list below re-renders on every keystroke,
                 and rebuilding the input with it would steal focus mid-typing. -->
            <div id="mlFormMenu" class="mlfm" style="display:none">
              <div class="mlfm-search"><span class="ic">🔍</span><input id="mlFormSearch" placeholder="Search form…" autocomplete="off" oninput="window._mlFormSearch(this.value)" onclick="event.stopPropagation()"></div>
              <div class="mlfm-hd"><span class="dot"></span><span>Select a Form</span><button type="button" class="mlfm-clear" onclick="event.stopPropagation();window._mlFormClear()">Clear all</button></div>
              <div class="mlfm-key"><span><b class="k-act">⚡</b> Active</span><span><b class="k-has">✅</b> Has leads</span><span><b class="k-non">❌</b> None</span><span><b class="k-warn">⚠️</b> Sync issue</span></div>
              <div id="mlFormList" class="mlfm-list"></div>
            </div>
          </div>
          <div id="mlFormChips" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px"></div>
        </div>
        <div class="fld"><label class="lbl" for="mlRange">Period</label><select class="select" id="mlRange" onchange="window._mlRangeChange()"><option value="all" selected>All time</option><option value="today">Today</option><option value="yest">Yesterday</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="month">This month</option><option value="cust">Custom range</option></select></div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap">
        <input class="input" id="mlSearch" placeholder="Search name / phone / campaign / ad…" style="max-width:340px;height:34px;font-size:12px" oninput="window._mlRender()">
        <span id="mlCustWrap" style="display:none;gap:6px;align-items:center">
          <input class="input" type="date" id="mlFrom" style="height:34px;font-size:12px" onchange="window._mlRender()">
          <span style="font-size:12px;color:var(--muted)">to</span>
          <input class="input" type="date" id="mlTo" style="height:34px;font-size:12px" onchange="window._mlRender()">
        </span>
        <span id="mlSyncInfo" style="font-size:11.5px;color:var(--muted)"></span>
      </div>
    </div></div>
    <!-- Loading placeholders ship in the MARKUP, not from JS. These containers are filled by
         _mlRender() after the feed returns, so an empty container is exactly what the page looked
         like for the whole first load: three blank cards and a blank table, indistinguishable from
         "Meta returned nothing". The skeleton says "working" and, because it is inside the same
         element the renderer overwrites, it cannot outlive the load — _mlRender() is called
         unconditionally, including on the failure path where _mlAll is reset to []. -->
    <div class="metrics" id="mlMetrics" style="margin:10px 0">
      <div class="metric"><div class="ml skel w55">&nbsp;</div><div class="mv skel w30" style="height:22px;margin-top:8px">&nbsp;</div></div>
      <div class="metric"><div class="ml skel w55">&nbsp;</div><div class="mv skel w30" style="height:22px;margin-top:8px">&nbsp;</div></div>
      <div class="metric"><div class="ml skel w55">&nbsp;</div><div class="mv skel w30" style="height:22px;margin-top:8px">&nbsp;</div></div>
      <div class="metric"><div class="ml skel w55">&nbsp;</div><div class="mv skel w30" style="height:22px;margin-top:8px">&nbsp;</div></div>
    </div>
    <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-target"></use></svg> Leads <span class="chipb info" style="margin-left:6px" id="mlCount">0</span></div>
      <div class="sec-bd"><div id="mlTableWrap"><div class="ldwrap" role="status" aria-live="polite"><span class="ldcap">Loading Meta leads…</span><div class="skel w30"></div><div class="skel w90"></div><div class="skel w75"></div><div class="skel w90"></div><div class="skel w55"></div></div></div>
        <div style="display:flex;gap:10px;margin-top:10px;align-items:center;justify-content:center;flex-wrap:wrap">
          <button class="btn bsm" onclick="window._mlPage('first')">« First</button><button class="btn bsm" onclick="window._mlPage('prev')">← Prev</button>
          <span id="mlPageInfo" style="font-size:12px;color:var(--muted)"></span>
          <button class="btn bsm" onclick="window._mlPage('next')">Next →</button><button class="btn bsm" onclick="window._mlPage('last')">Last »</button>
        </div></div></div>
    <div class="sec" style="margin-top:12px"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-chart"></use></svg> Breakdown by campaign</div>
      <div class="sec-bd" id="mlBreakdown"><div class="ldwrap" role="status" aria-live="polite"><span class="ldcap">Building the campaign breakdown…</span><div class="skel w75"></div><div class="skel w90"></div><div class="skel w55"></div></div></div></div>
  </div></section>

  <section class="screen" id="s-import"><div class="wrap">
    <div class="ph"><div><h1>Lead import &amp; intake</h1><p>Real-time Meta capture, every source, bulk CSV fallback — with control.</p></div>
      <div class="pha"><button class="btn bp" onclick="window._addSingleLead()">+ Add single lead</button></div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:10px 0 4px">
      <span class="viewing"><span class="vd"></span> Viewing as ABM / Admin</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-left:auto" id="impFilterBar">
        <select class="select" id="impMonth" style="height:33px;font-size:12px;width:130px"><option value="all" selected>All Months</option><option value="0">January</option><option value="1">February</option><option value="2">March</option><option value="3">April</option><option value="4">May</option><option value="5">June</option><option value="6">July</option><option value="7">August</option><option value="8">September</option><option value="9">October</option><option value="10">November</option><option value="11">December</option></select>
        <select class="select" id="impYear" style="height:33px;font-size:12px;width:100px"><option value="all" selected>All Years</option><option value="2024">2024</option><option value="2025">2025</option><option value="2026">2026</option></select>
        <input class="input mono" id="impDateFrom" type="date" title="From date" style="height:33px;font-size:11.5px;width:150px">
        <span style="color:var(--faint);font-size:12px">to</span>
        <input class="input mono" id="impDateTo" type="date" title="To date" style="height:33px;font-size:11.5px;width:150px">
        <select class="select" id="impSource" style="height:33px;font-size:12px;width:160px"><option value="all">All Sources</option><option>Meta Ads</option><option>Website forms</option><option>WhatsApp (WATI)</option><option>Google / YouTube</option><option>Walk-in / Referral / Telecalling</option><option>Bulk CSV import</option></select>
        <select class="select" id="impService" style="height:33px;font-size:12px;width:150px"><option value="all">All services</option><option>Diabetes Counselling</option><option>Weight Loss Counselling</option><option>Sauna Bath</option><option>Cold Plunge</option><option>Physiotherapy</option><option>Blood Test</option><option>HBOT (Hyperbaric Oxygen Therapy)</option></select>
        <button class="btn bsm bp" onclick="window._impApplyFilters()">Apply</button>
        <button class="btn bsm" onclick="window._impClearFilters()">Clear</button>
      </div>
    </div>
    <div class="metrics kpigrid" id="impMetrics" style="grid-template-columns:repeat(auto-fit,minmax(190px,1fr))"></div>
    <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-bolt"></use></svg> Source connections <span class="arr">▾</span></div>
      <div class="sec-bd"><div class="tscroll"><table class="tbl" style="min-width:1100px" id="srcConnTable"><thead><tr><th style="width:36px"><input type="checkbox" id="srcSelAll" style="accent-color:var(--brand)"></th><th>Total leads</th><th>Lead source</th><th>Status</th><th>Today</th><th>Last lead</th><th>Mode</th><th>Valid</th><th>Unique</th><th>Duplicate</th><th>Assigned</th><th>Unassigned</th></tr></thead><tbody id="srcTableBody"></tbody></table></div>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center">
        <select class="select" id="srcBulkAction" style="height:32px;font-size:12px;width:250px"><option value="pool">Send unassigned leads → assignment</option><option value="export">Export leads (CSV)</option></select>
        <button class="btn bsm bp" onclick="window._srcBulkAction()">Apply bulk action</button>
        <button class="btn bsm" data-exp onclick="window._srcExportSelected()">Export selected</button>
      </div>
      <div class="rb" id="metaLeadAlert" style="margin-top:12px;background:var(--surface-2);border:1px solid var(--line);border-radius:10px;padding:10px 14px">
        <span id="metaLeadAlertText" style="font-size:12.5px;font-weight:600;color:var(--ink)">Alert: notify ABM if no Meta lead for 30 min during campaign hours</span><span class="chipb ok" id="metaLeadAlertChip">Monitoring</span></div></div></div>
    <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-inbox"></use></svg> Live incoming feed <span style="font-size:11px;color:var(--faint);margin-left:8px" id="metaFeedStatus">Connecting to Meta…</span> <span class="arr">▾</span></div>
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
          <button class="btn bsm" data-exp onclick="window._feedDownload()">⬇ Download</button>
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
    <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-clip"></use></svg> Bulk CSV import — wizard <span class="arr">▾</span></div>
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
          <div><div class="g2" style="gap:9px;margin-top:0"></div>
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
            <div class="tscroll"><table class="tbl" style="min-width:1280px"><thead><tr id="csvImportedHead"><th style="width:30px"></th><th>Date &amp; Time</th><th>Campaign</th><th>Ad Name</th><th>Lead Name</th><th>Phone Number</th><th>Sugar Poll</th><th>City</th><th>Street</th><th>Source</th><th>Service</th><th>Name</th><th>Status</th><th>Action</th></tr></thead><tbody id="csvImportedBody"></tbody></table></div>
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
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
              <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600"><input type="checkbox" id="csvDupSelAll" style="accent-color:var(--brand)"> Select all</label>
              <button class="btn bsm" onclick="window._csvKeepSelected()">✓ Keep selected</button>
              <button class="btn bsm" style="color:var(--alert-ink);border-color:var(--alert)" onclick="window._csvDeleteSelected('dup')">🗑 Delete selected</button>
              <button class="btn bsm" onclick="window._csvDownload('dup')">⬇ Download</button>
              <input class="input" id="csvDupSearch" placeholder="🔍 Search leads…" style="height:30px;font-size:12px;width:200px;margin-left:auto" oninput="window._csvDupSearch()">
            </div>
            <div class="tscroll"><table class="tbl" style="min-width:1480px"><thead><tr id="csvDupHead"></tr></thead><tbody id="csvDupBody"></tbody></table></div>
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
              <button class="btn bsm" data-exp onclick="window._rvDownload()" style="margin-left:auto">⬇ Download</button>
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

    <!-- KPI drill-down: the rows behind whichever Lead-import KPI card was clicked. Hidden until
         a card is clicked (window._impDrill), then filled + scrolled into view. -->
    <div class="sec" id="impDrillWrap" style="display:none;margin-bottom:14px">
      <div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-inbox"></use></svg> <span id="impDrillTitle">Leads</span> <span class="chipb ok" id="impDrillCount" style="margin-left:8px">0</span>
        <span style="margin-left:auto;display:flex;gap:8px;align-items:center">
          <button class="btn bsm" data-exp onclick="window._impDrillDownload()">⬇ Download</button>
          <button class="btn bsm" onclick="window._impDrillClose()">Close</button>
        </span>
      </div>
      <div class="sec-bd">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <input class="input" id="impDrillSearch" placeholder="Search lead / phone / campaign / city…" oninput="window._impDrillSearch()" style="height:31px;font-size:12px;max-width:320px">
        </div>
        <div class="tscroll stick1"><table class="tbl" style="min-width:1280px"><thead><tr id="impDrillHead"></tr></thead><tbody id="impDrillBody"></tbody></table></div>
        <div style="display:flex;gap:10px;margin-top:12px;align-items:center;justify-content:center;flex-wrap:wrap">
          <button class="btn bsm" id="impDrillFirstBtn" onclick="window._impDrillPage('first')">« First</button>
          <button class="btn bsm" id="impDrillPrevBtn" onclick="window._impDrillPage(-1)">← Previous</button>
          <span style="font-size:12.5px;font-weight:600;color:var(--ink)" id="impDrillPageInfo">Page 1 of 1</span>
          <button class="btn bsm" id="impDrillNextBtn" onclick="window._impDrillPage(1)">Next →</button>
          <button class="btn bsm" id="impDrillLastBtn" onclick="window._impDrillPage('last')">Last »</button>
        </div>
      </div>
    </div>
  </div></section>

  <!-- ABM -->
  <section class="screen" id="s-abm"><div class="wrap">
    <div class="ph"><div><h1>Assign &amp; approve</h1><p>Distribute, rescue aging leads, gate sensitive actions.</p></div></div>
    <span class="viewing"><span class="vd"></span> Viewing as Asst. branch manager</span>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:10px 0;background:var(--surf2,#f4f4f2);border:1px solid var(--line);border-radius:10px;padding:9px 12px">
      <span style="font-size:12px;font-weight:700;color:var(--ink)">📅 Date range</span>
      <select class="select" id="abmRangePreset" style="height:31px;font-size:12px;width:150px"><option value="all">All time</option><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="month">This month</option><option value="custom">Custom range</option></select>
      <span style="font-size:11px;color:var(--faint)">From</span><input class="input mono" id="abmRangeFrom" type="date" style="height:31px;font-size:11.5px;width:140px">
      <span style="font-size:11px;color:var(--faint)">To</span><input class="input mono" id="abmRangeTo" type="date" style="height:31px;font-size:11.5px;width:140px">
      <button class="btn bsm bp" onclick="window._abmApplyRange()">Apply</button>
      <button class="btn bsm" onclick="window._abmClearRange()">Clear</button>
      <span style="font-size:11px;color:var(--faint);margin-left:auto" id="abmRangeLabel">Showing: all time</span>
    </div>
    <div class="tabs" id="abmTabs"><button class="on" data-t="assign">Assignment</button><button data-t="dev">Deviation <span class="mini" id="devTabCount">0</span></button><button data-t="appr">Approvals <span class="mini" id="apprTabCount">0</span></button><button data-t="rules">Auto-assign rules</button></div>
    <div class="abm-p" data-p="assign">
      <div class="sec" style="overflow:visible"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-inbox"></use></svg> Unassigned pool (<span id="poolCount">0</span>)</div>
        <div class="sec-bd">
          <div style="margin-bottom:10px"><input class="input" id="poolSearch" placeholder="Search lead / number…" style="height:30px;font-size:12px;width:250px" oninput="window._poolSearch()"></div>
          <div class="tscroll"><table class="tbl"><thead><tr id="poolHead"><th style="width:34px"><input type="checkbox" id="poolSelAll" style="accent-color:var(--brand)"></th><th>Lead</th><th>Leads Number</th><th>Date &amp; Time</th><th>Source · lang</th><th>Service(s)</th><th>Sugar</th><th>Waiting</th><th style="width:150px">Action</th></tr></thead><tbody id="unassignedPoolBody">
        </tbody></table></div>
        <div style="display:flex;gap:9px;margin-top:12px;flex-wrap:wrap;align-items:flex-start">
          <span style="font-size:12px;font-weight:600;color:var(--ink);padding-top:8px">Assign to:</span>
          <div style="display:flex;flex-direction:column;gap:3px">
            <select class="select" id="poolAssignSvc" style="height:34px;font-size:12px;width:185px" onchange="window._poolAssignSvcChange()" title="Pick a service to load its advisors"><option value="">— Select service —</option></select>
            <span style="font-size:10.5px;color:var(--faint)">Service first — loads its advisors</span>
          </div>
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
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"></use></svg> Advisor load <span style="font-size:11px;color:var(--faint);font-weight:500;margin-left:6px">— click an advisor to see their leads below</span></div>
        <div class="sec-bd"><div class="tscroll"><table class="tbl"><thead><tr id="advLoadHead"><th>Advisor</th><th>Role</th><th>Branch</th><th>Active leads</th><th>Status</th></tr></thead><tbody id="advisorLoadBody"></tbody></table></div></div></div>
      <div class="sec" style="overflow:visible"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"></use></svg> Advisor Load Leads <span id="advLeadsWho" style="font-size:11.5px;font-weight:600;color:var(--faint);margin-left:6px">— all advisors</span> <span class="chipb neu" id="advLeadsCount" style="margin-left:auto">0</span></div>
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
            <button class="btn bsm" data-exp onclick="window._advLeadsDownload()" style="margin-left:auto;align-self:flex-end">⬇ Download</button>
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
        <div class="sec" style="overflow:visible"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-bell"></use></svg> Call Deviation — in the system 4h+ with no call activity</div>
          <div class="sec-bd">
            <div style="display:flex;gap:8px;margin-bottom:10px;align-items:center;flex-wrap:wrap">
              <span style="font-size:12px;color:var(--faint)">Clears once a call status is set (beyond New/Open) or a call recording is logged.</span>
              <div style="margin-left:auto;display:flex;gap:7px;align-items:center;flex-wrap:wrap">
                <select class="select" id="callDevAssignSvc" style="height:32px;font-size:12px;width:170px" onchange="window._devAssignSvcChange('call')" title="Pick a service to load its advisors"><option value="">— Select service —</option></select>
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
        <div class="sec" style="overflow:visible"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-bell"></use></svg> Leads Deviation — assigned but not called within 4h</div>
          <div class="sec-bd">
            <div style="display:flex;gap:8px;margin-bottom:10px;align-items:center;flex-wrap:wrap">
              <span style="font-size:12px;color:var(--faint)">Cleared once the assigned advisor logs a call (status beyond New/Open or a recording).</span>
              <div style="margin-left:auto;display:flex;gap:7px;align-items:center;flex-wrap:wrap">
                <select class="select" id="leadDevAssignSvc" style="height:32px;font-size:12px;width:170px" onchange="window._devAssignSvcChange('lead')" title="Pick a service to load its advisors"><option value="">— Select service —</option></select>
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
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-check"></use></svg> Pending approvals</div><div class="sec-bd">
        <table class="tbl"><thead><tr><th>Type</th><th>Detail</th><th>Chain</th><th></th></tr></thead><tbody id="approvalsBody"></tbody></table>
        <div class="banner plan" style="margin-top:12px"><svg class="icon" style="width:15px;height:15px"><use href="#i-doc"></use></svg> <span>Approvals (discounts, refunds) will appear here once the approvals workflow is connected to a data source.</span></div>
        <div class="fld" style="max-width:320px;margin-top:12px"><label class="lbl">Delegate while away</label><select class="select"><option>— Off —</option><option>Branch manager</option></select></div></div></div></div>
    <div class="abm-p" data-p="rules" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-cog"></use></svg> Auto-assign rules</div><div class="sec-bd"><div class="g3">
        <div class="fld"><label class="lbl">Mode</label><div class="pills"><button class="pill p-vio on">Manual</button><button class="pill p-info">Round-robin</button><button class="pill p-ok">Rule-based</button></div></div>
        <div class="fld"><label class="lbl">Max leads / advisor</label><input class="input mono" value="40"></div>
        <div class="fld"><label class="lbl">First-contact SLA</label><input class="input mono" value="4h 00m"></div>
      </div><button class="btn bp" style="margin-top:14px" onclick="toast('Rules saved')">Save rules</button></div></div></div>
  </div></section>

  <!-- RECEPTION -->
  <section class="screen" id="s-reception"><div style="padding:10px 14px 60px;max-width:100%">
    <div class="inbound" id="inboundBar" style="display:none"><span style="font-size:22px">📞</span><div><b id="inboundName">Incoming call</b><div style="font-size:12px;opacity:.85" id="inboundSub"></div></div><button class="btn bsm" style="background:#fff;color:var(--brand-600);margin-left:auto" onclick="hideInbound()">Dismiss</button></div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
      <div style="background:linear-gradient(135deg,#129468,var(--brand-600));color:#fff;border-radius:11px;padding:8px 14px;display:flex;align-items:center;gap:9px"><svg class="icon" style="stroke:#fff;width:18px;height:18px"><use href="#i-coin"></use></svg><div><div style="font-size:9px;opacity:.8;font-weight:600;letter-spacing:.06em">REVENUE</div><div style="font-family:var(--disp);font-size:20px;font-weight:700" id="revTotal">₹0</div></div></div>
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
      <button class="btn bsm bp" id="dtApplyBtn" style="display:none" onclick="window._dtApply()">Apply</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px">
      <div id="scCards" class="metrics" style="margin:0;grid-template-columns:repeat(4,1fr)"></div>
      <div id="svcFlows" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px"></div>
    </div>
    <div class="sec" style="margin-top:0"><div class="sec-hd" onclick="togSec(this)" style="padding:10px 14px"><svg class="icon"><use href="#i-cal"></use></svg> Appointments <span class="chipb info" style="margin-left:6px" id="apptCount">0</span> <span style="margin-left:auto;font-size:11px;color:var(--faint)">Click row → full record</span> <input class="input" id="apptSearch" placeholder="Search lead number…" onclick="event.stopPropagation()" oninput="window._apptSearch(this.value)" style="height:32px;max-width:220px;margin-left:12px;font-size:12px"> <span class="arr">▾</span></div>
      <div class="ftable-wrap" id="apptWrap" style="max-height:380px"></div>
    </div>
    <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;margin-top:10px;align-items:start">
      <div>
        <div class="sec" style="margin-top:0"><div class="sec-hd" onclick="togSec(this)" style="padding:10px 14px"><svg class="icon"><use href="#i-user"></use></svg> Client cross-check <span class="arr">▾</span></div>
          <div class="sec-bd" style="padding:4px 14px 14px"><div style="display:flex;gap:7px"><input class="input" id="ccQ" style="height:35px" placeholder="Try: 98412 or 99999 or Prasad"><button class="btn bsm bp" onclick="ccSearch()">Search</button></div><div id="ccRes" style="margin-top:8px"></div></div></div>
        <div class="sec hideblock" id="nwPanel" style="display:none"><div class="sec-hd" style="cursor:default;padding:10px 14px"><svg class="icon"><use href="#i-door"></use></svg> CLIENT REGISTRATION FORM</div>
          <div class="sec-bd" style="padding:4px 14px 14px">
            <div class="nwStep" data-step="1">
              <div class="nwGrpHd">Personal details</div>
              <div class="g4" style="gap:10px 12px">
                <div class="fld"><label class="lbl" for="nwClientId">Client ID</label><input  class="input mono" style="height:38px" id="nwClientId" readonly placeholder="auto"></div>
                <div class="fld"><label class="lbl" for="nwName">Name *</label><input  class="input" style="height:38px" id="nwName"></div>
                <div class="fld"><label class="lbl" for="nwPhone">Phone *</label><input  class="input mono" style="height:38px" id="nwPhone" type="tel" inputmode="numeric" maxlength="10" placeholder="10-digit mobile" oninput="window._digitsOnly(this)"></div>
                <div class="fld"><label class="lbl" for="nwWhats">WhatsApp</label><input  class="input mono" style="height:38px" id="nwWhats" type="tel" inputmode="numeric" maxlength="15" oninput="window._digitsOnly(this)"></div>
                <div class="fld"><label class="lbl" for="nwEmail" id="nwEmailLbl">Email</label><input  class="input" style="height:38px" id="nwEmail" type="email" placeholder="email@example.com"></div>
                <div class="fld"><label class="lbl" for="nwGender">Gender</label><select  class="select" style="height:38px" id="nwGender"><option>Male</option><option>Female</option><option>Other</option></select></div>
                <div class="fld"><label class="lbl" for="nwAge">Age</label><input  class="input mono" style="height:38px" id="nwAge" type="number" min="1" max="120" placeholder="42"></div>
                <div class="fld"><label class="lbl" for="nwOccupation">Occupation</label><select  class="select" style="height:38px" id="nwOccupation"><option>Business</option><option>Private Job</option><option>Govt</option><option>Homemaker</option><option>Others</option></select></div>
              </div>
              <div class="nwGrpHd">Address &amp; source</div>
              <div class="g4" style="gap:10px 12px">
                <div class="fld"><label class="lbl" for="nwLang">Language</label><select  class="select" style="height:38px" id="nwLang"><option>Tamil</option><option>Telugu</option><option>Hindi</option></select></div>
                <div class="fld"><label class="lbl" for="nwSource">Lead source</label><select  class="select" style="height:38px" id="nwSource"><option selected>Direct Walk-in</option><option>Referral</option><option>Phone Enquiry</option></select></div>
                <div class="fld"><label class="lbl" for="nwLocation">Location</label><select  class="select" style="height:38px" id="nwLocation"><option>Poonamalle</option><option>Porur</option></select></div>
                <div class="fld"><label class="lbl" for="nwAddress">Address</label><input  class="input" style="height:38px" id="nwAddress" placeholder="Street, area, city, ZIP"></div>
              </div>
              <div class="nwGrpHd">Service selected today</div>
              <div style="font-size:12px;color:var(--muted);margin:-2px 0 10px">Please tick all the services the client is visiting for today.</div>
              <!-- Filled by _nwRenderSvcGrid() from the FULL service master (app.ts) — a walk-in can
                   be booked for any service, unlike the rest of Reception (RECEPTION_SERVICES). -->
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px 12px" id="nwSvcGrid"></div>
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
              <!-- Slot booking — hidden when Blood Test is selected (it uses the current date/time). -->
              <div id="nwBookingSec">
              <div class="nwGrpHd">Service &amp; booking</div>
              <div class="g4" style="gap:10px 12px;margin-top:10px">
                <div class="fld"><label class="lbl" for="nwDate">Date</label><input  class="input" type="date" style="height:38px" id="nwDate"></div>
                <div class="fld"><label class="lbl" for="nwTime">Time</label><select  class="select" style="height:38px" id="nwTime"><option>9:00 AM</option><option>9:30 AM</option><option selected>10:00 AM</option><option>10:30 AM</option><option>11:00 AM</option><option>11:30 AM</option><option>12:00 PM</option><option>12:30 PM</option><option>2:00 PM</option><option>2:30 PM</option><option>3:00 PM</option><option>3:30 PM</option><option>4:00 PM</option><option>4:30 PM</option><option>5:00 PM</option><option>5:30 PM</option><option>6:00 PM</option><option>6:30 PM</option></select></div>
                <!-- Options are filled live by _nwFillProviders() (Health Coaches + Physiotherapists from the
                     staff master); changing it marks the choice manual and refreshes that provider's slots. -->
                <div class="fld" id="nwProvFld"><label class="lbl" for="nwProv">Provider <span class="ab">auto</span></label><select  class="select" style="height:38px" id="nwProv" onchange="window._nwProvChange(this)"></select></div>
                <div class="fld"><label class="lbl">&nbsp;</label><button class="btn bsm bp" onclick="nwCheckSlot()" style="width:100%;height:38px">Check slot</button></div>
              </div>
              <div id="nwSlotRes" style="margin-top:8px"></div>
              </div>
              <div id="nwBtBookNote" style="display:none;margin-top:10px;font-size:12px;color:var(--muted)"><span class="chipb info">Blood Test</span> uses the current date &amp; time automatically — no slot booking needed.</div>
            </div>
            <div style="display:flex;gap:7px;margin-top:10px"><button class="btn bp" style="height:38px" id="nwPrimaryBtn" onclick="window._nwPrimary()">Save &amp; Proceed</button><button class="btn" style="height:38px" onclick="nwToggle()">Cancel</button></div>
          </div></div>
      </div>
      <div>
        <div class="sec" style="margin-top:0" id="checkinSec"><div class="sec-hd" onclick="togSec(this)" style="padding:10px 14px"><svg class="icon"><use href="#i-door"></use></svg> Check-in <span id="ciName">—</span> <span class="arr">▾</span></div>
          <div class="sec-bd" style="padding:4px 14px 14px">
            <div class="g2" style="gap:8px">
              <div class="fld"><label class="lbl" for="ciSearch">Search</label><input  class="input" style="height:34px" id="ciSearch" placeholder="Client ID, name or phone" oninput="window._ciLookup()"></div>
              <div class="fld"><label class="lbl" for="ciDedup">Dedup</label><input  class="input" style="height:34px" id="ciDedup" readonly></div>
              <div class="fld"><label class="lbl" for="rcVis">Visited <span class="ab">AUTO</span></label><input  class="input mono" style="height:34px" id="rcVis" readonly></div>
              <div class="fld"><label class="lbl" for="rcReg">Registered <span class="ab">AUTO</span></label><input  class="input mono" style="height:34px" id="rcReg" readonly></div>
            </div>
            <div id="ciResults" style="margin-top:10px"></div>
            <div class="consent" style="font-size:12px"><label><input type="checkbox" checked> DPDP data use</label><label><input type="checkbox" checked> Health data</label><label><input type="checkbox" checked> Recording</label><label><input type="checkbox"> WA follow-ups</label></div>
            <button class="btn bp bsm" style="margin-top:8px" id="ciConfirmBtn" onclick="recRegDone()">Confirm → screening</button>
          </div></div>
        <div class="sec" id="zoomCiSecRec"><div class="sec-hd" onclick="togSec(this)" style="padding:10px 14px"><svg class="icon"><use href="#i-door"></use></svg> Zoom check-in <span class="chipb neu zoomCiCount" style="margin-left:6px">0</span> <span class="arr">▾</span></div>
          <div class="sec-bd" style="padding:4px 14px 14px">
            <div class="tscroll"><table class="tbl" style="min-width:440px"><thead><tr><th>Client</th><th>Phone</th><th>Appointment Fixed Date &amp; Time</th><th>Status</th><th>Action</th></tr></thead><tbody id="zoomCiListRec"></tbody></table></div>
          </div></div>
        <div class="sec"><div class="sec-hd" onclick="togSec(this)" style="padding:10px 14px"><svg class="icon"><use href="#i-coin"></use></svg> Collect payment <span class="arr">▾</span></div>
          <div class="sec-bd" style="padding:4px 14px 14px"><div id="recPayList"></div>
            <div id="recWb" class="hideblock" style="display:none;border:1.5px solid var(--brand-line);border-radius:11px;padding:11px 13px;margin-top:8px;background:linear-gradient(180deg,#F7FCFA,#fff)">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><b id="recWbName" style="font-family:var(--disp);font-size:14px">—</b><span class="chipb info" id="recWbPlan">—</span></div>
              <div class="g2" style="gap:8px"><div class="fld"><label class="lbl" for="recWbDue">Due</label><input  class="input mono" style="height:34px" id="recWbDue" readonly></div><div class="fld"><label class="lbl" for="recWbAmt">Received *</label><input  class="input mono" style="height:34px" id="recWbAmt" type="text" inputmode="decimal" maxlength="12" placeholder="0" oninput="window._payAmtRcvd(this,'#recWbDue','#recWbAmtErr')"><div id="recWbAmtErr" style="display:none;color:var(--alert-ink);font-size:11px;margin-top:3px"></div></div><div class="fld"><label class="lbl" for="recWbMode">Mode *</label><select  class="select" style="height:34px" id="recWbMode"><option>UPI</option><option>Cash</option><option>Card</option><option>Net Banking</option></select></div><div class="fld"><label class="lbl" for="recWbTxn">Txn ref *</label><input  class="input mono" style="height:34px" id="recWbTxn" maxlength="40"></div></div>
              <div style="display:flex;gap:6px;margin-top:8px"><button class="btn bsm bp" onclick="recConfirm()">Confirm → Accounts</button><button class="btn bsm" onclick="recBack()">↩ Back</button></div>
            </div>
          </div></div>
      </div>
    </div>
  </div></section>

  <!-- COLLECT PAYMENT (dedicated page — reached from Reception "Save & Proceed" for a Blood Test walk-in) -->
  <section class="screen" id="s-collectpay"><div class="wrap" style="max-width:920px;padding:16px 20px 60px">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px">
      <h1 style="font-family:var(--disp);font-size:22px;font-weight:700">Collect payment</h1>
      <button class="btn" style="margin-left:auto" onclick="window._cpBack()">↩ Back to Reception</button>
    </div>
    <div class="sec" style="margin-top:0"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"></use></svg> Client information</div>
      <div class="sec-bd">
        <div class="g3" style="gap:10px 14px">
          <div class="fld"><label class="lbl">Name</label><input  class="input" style="height:38px" id="cpName" readonly></div>
          <div class="fld"><label class="lbl">Phone number</label><input  class="input mono" style="height:38px" id="cpPhone" readonly></div>
          <div class="fld"><label class="lbl">Email</label><input  class="input" style="height:38px" id="cpEmail" readonly></div>
          <div class="fld"><label class="lbl">Address</label><input  class="input" style="height:38px" id="cpAddr" readonly></div>
          <div class="fld"><label class="lbl">Selected service</label><input  class="input" style="height:38px" id="cpSvc" readonly></div>
        </div>
      </div></div>
    <div class="sec" id="cpTestsSec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-drop"></use></svg> Tests / Panels <span style="margin-left:auto;font-size:11px;color:var(--faint)" id="cpTestsHint">Tick every test / panel the client is paying for</span></div>
      <div class="sec-bd">
        <!-- Two ways to price the same visit: individual panels, or a packaged plan. They are
             ALTERNATIVES — picking one clears the other (see _cpPlanPick / _cpRecalc). -->
        <div class="tabs" id="cpTestTabs" style="margin-bottom:10px"><button class="on" data-t="cp-tests">Tests / Panels</button><button data-t="cp-plans">Blood Test Plans &amp; Pricing</button></div>
        <div class="cp-tp" data-p="cp-tests">
          <!-- Rendered live from the Blood Test Pricing Master (bt_tests) by _cpRenderTests(). -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:8px 14px" id="cpTestsWrap"></div>
        </div>
        <div class="cp-tp" data-p="cp-plans" style="display:none">
          <div id="cpPlanCards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px"></div>
        </div>
      </div></div>
    <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-coin"></use></svg> Payment</div>
      <div class="sec-bd">
        <div class="fld" style="margin-bottom:8px"><label class="lbl">Selected blood test panel(s)</label><input  class="input" style="height:38px" id="cpPanels" readonly placeholder="Tick a test / panel above"></div>
        <!-- Thyrocare cost / selling price / margin were removed from the desk view (21-Aug-2026):
             they still flow into the order + Accounts reconciliation, but Reception sees only the
             customer conversation — Total amount → Discount → Final payable. -->
        <div class="g3" style="gap:10px 14px;margin-bottom:8px">
          <div class="fld"><label class="lbl" for="cpGross">Total amount <span class="ab">auto</span></label><input  class="input mono" style="height:38px" id="cpGross" value="₹0" readonly></div>
          <div class="fld"><label class="lbl" for="cpCoupon">Coupon code</label><div style="display:flex;gap:6px"><input  class="input mono" style="height:38px;flex:1" id="cpCoupon" placeholder="Enter code" maxlength="24"><button class="btn bsm bp" style="height:38px" onclick="window._cpApplyCoupon()">Apply</button></div><div id="cpCouponMsg" style="font-size:11px;margin-top:3px"></div></div>
          <div class="fld"><label class="lbl" for="cpDiscount">Discount</label><input  class="input mono" style="height:38px" id="cpDiscount" value="₹0" readonly></div>
        </div>
        <div class="g3" style="gap:10px 14px;margin-bottom:8px">
          <div class="fld"><label class="lbl" for="cpTotal">Final payable amount</label><input  class="input mono" style="height:38px;font-weight:700" id="cpTotal" value="₹0" readonly></div>
          <div class="fld"><label class="lbl" for="cpAmt">Amount received *</label><input  class="input mono" style="height:38px" id="cpAmt" type="text" inputmode="decimal" maxlength="12" placeholder="0"></div>
          <div class="fld"><label class="lbl" for="cpMode">Mode *</label><select  class="select" style="height:38px" id="cpMode"><option>UPI</option><option>Cash</option><option>Card</option><option>Net Banking</option></select></div>
        </div>
        <div class="g3" style="gap:10px 14px">
          <div class="fld"><label class="lbl" for="cpTxn">Txn ref *</label><input  class="input mono" style="height:38px" id="cpTxn" maxlength="40"></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px"><button class="btn bp" id="cpCollectBtn" onclick="window._cpCollect()">Collect payment → Accounts</button><button class="btn" onclick="window._cpBack()">Cancel</button></div>
      </div></div>
  </div></section>

  <!-- SCREENING -->
  <section class="screen" id="s-screening"><div class="wrap" style="max-width:1280px;padding:16px 20px 60px">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <h1 style="font-family:var(--disp);font-size:22px;font-weight:700">Health screening</h1>
      <div class="pills" id="scrDateF"><button class="pill on" data-d="today" onclick="window._scDateF('today')">Today</button><button class="pill" data-d="yest" onclick="window._scDateF('yest')">Yesterday</button><button class="pill" data-d="tmrw" onclick="window._scDateF('tmrw')">Tomorrow</button><button class="pill" data-d="wk" onclick="window._scDateF('wk')">This week</button><button class="pill" data-d="cust" onclick="window._scDateF('cust')">Custom</button></div>
      <input type="date" class="input" id="scFrom" style="display:none;height:30px;font-size:12px;width:130px">
      <input type="date" class="input" id="scTo" style="display:none;height:30px;font-size:12px;width:130px">
      <button class="btn bsm bp" id="scApplyBtn" style="display:none;height:30px" onclick="window._scApplyDate()">Apply</button>
      <button class="btn" style="margin-left:auto" data-exp onclick="window._scExport()"><svg class="icon"><use href="#i-dl"></use></svg> Export</button>
    </div>
    <div class="metrics" style="margin:10px 0" id="scMetrics"></div>
    <div style="display:grid;grid-template-columns:1fr 310px;gap:14px">
      <div>
        <div class="sec" id="scAssessPanel" style="margin-top:0;display:none"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-heart"></use></svg> Assessment — <span id="scAssessName">Select a client</span> <span class="chipb info" style="margin-left:8px" id="scAssessChip">Baseline · M0</span>
          <button class="btn bsm" style="margin-left:auto" onclick="window._scCloseAssess()">Close</button></div>
          <div class="sec-bd">
            <div class="g4">
              <div class="fld"><label class="lbl" for="sc_h">Height (cm)</label><input  class="input mono" id="sc_h" inputmode="decimal" oninput="window._numOnly(this);window._scBmiCalc()"></div>
              <div class="fld"><label class="lbl" for="sc_w">Weight (kg)</label><input  class="input mono" id="sc_w" inputmode="decimal" oninput="window._numOnly(this);window._scBmiCalc()"></div>
              <div class="fld"><label class="lbl" for="sc_bmi">BMI <span class="ab">AUTO</span></label><input  class="input mono" id="sc_bmi" readonly></div>
              <div class="fld"><label class="lbl" for="sc_bp">BP</label><input  class="input mono" id="sc_bp"></div>
              <div class="fld"><label class="lbl" for="sc_pu">Pulse</label><input  class="input mono" id="sc_pu" inputmode="numeric" oninput="window._numOnly(this)"></div>
              <div class="fld"><label class="lbl" for="sc_sp">SpO2 (%)</label><input  class="input mono" id="sc_sp" inputmode="numeric" oninput="window._numOnly(this)"></div>
              <div class="fld"><label class="lbl" for="sc_te">Temperature</label><input  class="input mono" id="sc_te" inputmode="decimal" oninput="window._numOnly(this)"></div>
              <div class="fld"><label class="lbl" for="sc_gl">Desk glucose (mg/dL)</label><input  class="input mono" id="sc_gl" inputmode="decimal" oninput="window._numOnly(this)"></div>
              <div class="fld" style="grid-column:span 3">
                <label class="lbl">Report — attachment</label>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <button type="button" class="btn bsm" onclick="window._scAddReport()">⬆ Upload report</button>
                  <span id="scAttNote" style="font-size:11px;color:var(--faint)">PDF or image, up to 15 MB</span>
                </div>
                <div id="scAttList" style="display:flex;flex-direction:column;gap:4px;margin-top:6px"></div>
              </div>
            </div>
            <div class="g3" style="margin-top:6px">
              <div class="fld"><label class="lbl" for="sc_by">Screened by <span class="ab">AUTO</span></label><input  class="input" id="sc_by" readonly></div>
              <div class="fld"><label class="lbl" for="sc_dt">Screen date &amp; time <span class="ab">AUTO</span></label><input  class="input mono" id="sc_dt" readonly placeholder="— stamped on save"></div>
              <div class="fld"><label class="lbl">Eligible?</label><div class="pills" id="scEligPills"><button class="pill p-ok" onclick="window._scElig('yes',this)">✓ Yes</button><button class="pill p-al" onclick="window._scElig('no',this)">✗ No</button></div></div>
            </div>
            <div class="fld"><label class="lbl" for="sc_notes">Notes</label><textarea  class="area" id="sc_notes"></textarea></div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
              <button class="btn bsm bp" onclick="screeningDone()"><svg class="icon" style="width:14px;height:14px"><use href="#i-check"></use></svg> Save &amp; send to HC</button>
              <button class="btn bsm" onclick="window._scPrint()">🖨 Print</button>
            </div>
          </div></div>
        <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-clock"></use></svg> Previous screenings — same client <span class="arr">▾</span></div>
          <div class="sec-bd" id="scHistoryWrap"><div style="text-align:center;color:var(--faint);padding:14px;font-size:12px">Open a client to see history.</div></div></div>
      </div>
      <div>
        <div class="sec" style="margin-top:0"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"></use></svg> Queue <span class="chipb info" style="margin-left:6px" id="scQueueCount">0</span></div>
          <div class="sec-bd" id="scQueueList"><div style="text-align:center;color:var(--faint);padding:14px;font-size:12px">No clients in screening queue.</div></div></div>
        <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-chart"></use></svg> Breakdown</div>
          <div class="sec-bd" id="scBreakdown"><div style="text-align:center;color:var(--faint);padding:8px;font-size:12px">—</div></div></div>
        <!-- (Quick test order card removed on request — blood-test ordering lives on the Blood Test
             page / Reception intake, so the screening desk no longer carries a duplicate entry point.) -->
      </div>
    </div>
  </div></section>

  <!-- BLOOD TEST -->
  <section class="screen" id="s-bloodtest"><div class="wrap" style="max-width:1280px;padding:16px 20px 60px">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <h1 style="font-family:var(--disp);font-size:22px;font-weight:700">Blood test — Thyrocare</h1>
      <div class="pills" id="btDateFilt"><button class="pill on" onclick="window._btDateF('today')">Today</button><button class="pill" onclick="window._btDateF('tmrw')">Tomorrow</button><button class="pill" onclick="window._btDateF('yest')">Yesterday</button><button class="pill" onclick="window._btDateF('wk')">This week</button><button class="pill" onclick="window._btDateF('cust')">Custom</button></div>
      <input type="date" class="input" id="btFrom" style="display:none;height:30px;font-size:12px;width:130px">
      <input type="date" class="input" id="btTo" style="display:none;height:30px;font-size:12px;width:130px">
      <button class="btn bsm bp" id="btApplyBtn" style="display:none;height:30px" onclick="window._btApplyDate()">Apply</button>
      <button class="btn" style="margin-left:auto" data-exp onclick="window._btExport()"><svg class="icon"><use href="#i-dl"></use></svg> Export</button>
    </div>
    <!-- Total billed / Thyrocare cost / our margin / paid-to-Thyrocare moved to Accounts & finance
         → "Blood test — Thyrocare" tab, where they're broken down per day instead of one running
         total. This page keeps the operational status cards (Total/Visited/Sample collected/…). -->
    <div class="metrics" style="margin:10px 0 6px" id="btMetrics"></div>

    <!-- ===== Stage 1 — Reception: intake → tests → coupon → contact → payment → order → sample.
         Collapsed until "New walk-in" is clicked so the worklist stays the default view. ===== -->
    <div class="sec" id="btIntakeSec" style="display:none">
      <div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-door"></use></svg> New blood-test walk-in
        <button class="btn bsm" style="margin-left:auto" onclick="window._btIntakeClose()">Cancel</button></div>
      <div class="sec-bd">
        <!-- FR-1.1 / FR-1.2: phone lookup first; an existing lead/client skips re-entry. -->
        <div class="g3">
          <div class="fld"><label class="lbl" for="btiPhone">Phone number <span class="req">*</span></label>
            <input class="input mono" id="btiPhone" placeholder="10-digit mobile" oninput="window._digitsOnly(this)"></div>
          <div class="fld" style="align-self:end"><button class="btn bp" style="height:39px" onclick="window._btLookup()">Check record</button></div>
          <div class="fld"><div id="btiMatch" style="font-size:12.5px;padding-top:22px"></div></div>
        </div>
        <div id="btiForm" style="display:none">
          <div class="g3" style="margin-top:4px">
            <div class="fld"><label class="lbl" for="btiName">Name <span class="req">*</span></label><input class="input" id="btiName"></div>
            <div class="fld"><label class="lbl" for="btiWa">WhatsApp number <span class="req">*</span></label><input class="input mono" id="btiWa" placeholder="Drives report delivery" oninput="window._digitsOnly(this)"></div>
            <div class="fld"><label class="lbl" for="btiEmail">Email</label><input class="input" id="btiEmail" type="email" placeholder="optional"></div>
          </div>
          <!-- FR-1.4 / FR-1.5: multi-select from the master; price recalculates live. -->
          <div class="fld fw" style="margin-top:6px"><label class="lbl">Tests / panels <span class="req">*</span></label>
            <div id="btiTests" style="display:flex;flex-wrap:wrap;gap:7px"></div></div>
          <div class="g4" style="margin-top:6px">
            <div class="fld"><label class="lbl" for="btiPartner">Lab partner</label><select class="select" id="btiPartner"></select></div>
            <div class="fld"><label class="lbl" for="btiCoupon">Coupon code</label>
              <div style="display:flex;gap:6px"><input class="input" id="btiCoupon" placeholder="optional" style="text-transform:uppercase"><button class="btn bsm" style="height:39px" onclick="window._btApplyCoupon()">Apply</button></div>
              <div id="btiCouponMsg" style="font-size:11.5px;margin-top:4px"></div></div>
            <div class="fld"><label class="lbl" for="btiClientType">Client type</label><select class="select" id="btiClientType"><option value="one-time">One-time</option><option value="membership">Membership</option></select></div>
            <div class="fld"><label class="lbl">Calculated price <span class="ab">AUTO</span></label><input class="input mono select auto" id="btiCalc" readonly value="₹0"></div>
          </div>
          <!-- FR-1.8 / FR-1.9: actual amount may differ from calculated; both are stored. -->
          <div class="g4" style="margin-top:6px">
            <div class="fld"><label class="lbl" for="btiAmount">Amount collected <span class="req">*</span></label><input class="input mono" id="btiAmount" oninput="window._numOnly(this)"></div>
            <div class="fld"><label class="lbl" for="btiMode">Payment mode <span class="req">*</span></label><select class="select" id="btiMode"><option value="">— Select —</option><option>Cash</option><option>Card</option><option>UPI</option><option>Bank Transfer</option><option>Wallet</option></select></div>
            <div class="fld"><label class="lbl">Verification <span class="ab">AUTO</span></label><input class="input select auto" id="btiVerif" readonly value="Pending Accounts Verification"></div>
            <div class="fld" style="align-self:end"><button class="btn bp" style="height:39px;width:100%" onclick="window._btCreateOrder()">Generate order</button></div>
          </div>
        </div>
      </div>
    </div>

    <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-cal"></use></svg> Appointment-linked records <span class="arr">▾</span></div>
      <div class="sec-bd">
        <!-- Search + status filters (static so typing never loses focus on re-render) -->
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
          <input class="input" id="btSearch" placeholder="Search name or phone…" oninput="window._btSearchRows(this.value)" style="max-width:220px;height:34px;font-size:12px">
          <select class="select" id="btFiltSample" onchange="window._btFilterChange()" style="height:34px;font-size:12px;width:auto"><option value="">Sample: All</option><option value="collected">Collected</option><option value="yet_to_collect">Yet to Collect</option></select>
          <select class="select" id="btFiltLab" onchange="window._btFilterChange()" style="height:34px;font-size:12px;width:auto"><option value="">Lab: All</option><option value="sent">Sent</option><option value="yet_to_send">Yet to Send</option></select>
          <select class="select" id="btFiltLabRep" onchange="window._btFilterChange()" style="height:34px;font-size:12px;width:auto"><option value="">Lab report: All</option><option value="received">Received</option><option value="yet_to_receive">Yet to Receive</option></select>
          <select class="select" id="btFiltCliRep" onchange="window._btFilterChange()" style="height:34px;font-size:12px;width:auto"><option value="">Client report: All</option><option value="shared">Shared</option><option value="yet_to_share">Yet to Share</option></select>
          <button class="btn bsm" onclick="window._btClearFilters()">Clear</button>
        </div>
        <!-- Bulk-action toolbar (shown only when rows are selected) -->
        <div id="btBulkBar" style="display:none;align-items:center;gap:12px;flex-wrap:wrap;background:var(--brand-tint);border:1px solid var(--line);border-radius:9px;padding:8px 12px;margin-bottom:8px;font-size:12px"></div>
        <div class="tscroll" id="btWorklistWrap"><div class="ldwrap" role="status" aria-live="polite"><span class="ldcap">Loading blood test data…</span><div class="skel w30"></div><div class="skel w90"></div><div class="skel w75"></div><div class="skel w90"></div><div class="skel w55"></div></div></div>
      </div></div>

    <!-- Blood test detail panel (hidden by default) -->
    <div id="btDetailPanel" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-drop"></use></svg> Blood test record — <span id="btDetailName">Client</span>
        <button class="btn bsm" style="margin-left:auto" onclick="window._btCloseDetail()">Close</button></div>
        <div class="sec-bd">
          <!-- Tests / panels multi-select (spec-fixed catalogue) -->
          <div class="fld fw" style="margin-bottom:6px"><label class="lbl">Tests / panels <span class="ab">multi-select</span></label>
            <div id="btdPanelBox" style="position:relative;max-width:520px">
              <div class="select" id="btdPanelBtn" onclick="window._btdTogglePanelDD()" style="cursor:pointer;min-height:39px;height:auto;display:flex;align-items:center;flex-wrap:wrap;gap:5px;padding:6px 10px">Select tests / panels…</div>
              <div id="btdPanelDD" style="display:none;position:absolute;z-index:30;top:calc(100% + 4px);left:0;right:0;background:var(--surface);border:1px solid var(--line);border-radius:9px;max-height:260px;overflow:auto;box-shadow:0 10px 28px rgba(0,0,0,.14);padding:5px"></div>
            </div></div>
          <div class="g4">
            <div class="fld"><label class="lbl" for="btdSample">Sample status</label><select  class="select" id="btdSample"><option value="yet_to_collect">Yet to Collect</option><option value="collected">Collected</option></select></div>
            <div class="fld"><label class="lbl" for="btdLab">Lab status</label><select  class="select" id="btdLab"><option value="yet_to_send">Yet to Send</option><option value="sent">Sent</option></select></div>
            <div class="fld"><label class="lbl" for="btdLabReport">Lab report status</label><select  class="select" id="btdLabReport"><option value="yet_to_receive">Yet to Receive</option><option value="received">Received</option></select></div>
            <div class="fld"><label class="lbl" for="btdClientReport">Client report status</label><select  class="select" id="btdClientReport"><option value="yet_to_share">Yet to Share</option><option value="shared">Shared</option></select></div>
            <div class="fld"><label class="lbl" for="btdThyroCost">Thyrocare cost (₹)</label><input  class="input mono" id="btdThyroCost" type="number" placeholder="e.g. 400"></div>
            <div class="fld"><label class="lbl" for="btdOurPrice">Our price (₹)</label><input  class="input mono" id="btdOurPrice" type="number" placeholder="e.g. 800"></div>
          </div>
          <div class="fld fw" style="margin-top:6px"><label class="lbl">Report attachment</label>
            <div id="btdAtts" style="display:flex;gap:8px;flex-wrap:wrap"><span class="att add" onclick="window._btAddReport()"><svg class="icon"><use href="#i-clip"></use></svg> Upload report</span></div></div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="btn bp" onclick="window._btSaveDetail()"><svg class="icon"><use href="#i-check"></use></svg> Save</button>
            <button class="btn" onclick="window._btShareWA()"><svg class="icon"><use href="#i-msg"></use></svg> Share via WA</button>
            <button class="btn" onclick="window._btCollectPay()">💰 Collect payment</button>
          </div>
        </div></div>
    </div>
  </div></section>

  <!-- PHYSIO -->
  <section class="screen" id="s-physio"><div class="wrap" style="max-width:1280px;padding:16px 20px 60px">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <h1 style="font-family:var(--disp);font-size:22px;font-weight:700">💪 Physiotherapy</h1>
      <div class="pills" id="phDateFilt"><button class="pill on" onclick="window._phDateF('today')">Today</button><button class="pill" onclick="window._phDateF('tmrw')">Tomorrow</button><button class="pill" onclick="window._phDateF('wk')">This week</button><button class="pill" onclick="window._phDateF('cust')">Custom</button></div>
      <input type="date" class="input" id="phFrom" style="display:none;height:30px;font-size:12px;width:130px">
      <input type="date" class="input" id="phTo" style="display:none;height:30px;font-size:12px;width:130px">
      <button class="btn bsm bp" id="phApplyBtn" style="display:none;height:30px" onclick="window._phApplyDate()">Apply</button>
      <button class="btn" style="margin-left:auto" data-exp onclick="window._phExport()"><svg class="icon"><use href="#i-dl"></use></svg> Export</button>
    </div>
    <div class="metrics" style="margin:10px 0" id="phMetrics"></div>
    <!-- Single-column layout, Sessions FIRST (~80% of the space) with the compact Active-patients
         strip (~20%, chips with their own scroll — see #phPatientList CSS) directly below it. -->
    <div>
      <div>
        <div class="sec" style="margin-top:0"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-cal"></use></svg> Sessions <span class="chipb neu" id="phSessCount" style="margin-left:6px">0</span></div>
          <div class="sec-bd">
            <!-- Search + consultation-status filters (static markup so typing never loses focus) -->
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
              <input class="input" id="phSearch" placeholder="Search patient name or phone…" oninput="window._phSearch(this.value)" style="max-width:240px;height:34px;font-size:12px">
              <div class="pills" id="phStatusFilt">
                <button class="pill on" onclick="window._phStatusF('all')">All</button>
                <button class="pill" onclick="window._phStatusF('waiting')">Waiting</button>
                <button class="pill" onclick="window._phStatusF('completed')">Completed</button>
                <button class="pill" onclick="window._phStatusF('cancelled')">Cancelled</button>
              </div>
            </div>
            <div class="tscroll" id="phSessionsWrap"><div class="ldwrap" role="status" aria-live="polite"><span class="ldcap">Loading physiotherapy data…</span><div class="skel w30"></div><div class="skel w90"></div><div class="skel w75"></div><div class="skel w90"></div><div class="skel w55"></div></div></div>
          </div></div>

        <div class="sec" style="margin-top:12px"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"></use></svg> Active patients <span id="phPatientCount">(0)</span></div>
          <div class="sec-bd" id="phPatientList"><div style="text-align:center;color:var(--faint);padding:8px;font-size:12px">No patients yet.</div></div></div>

        <!-- Assessment / SOAP panel (hidden until a patient record is opened) -->
        <div id="phSoapPanel" style="display:none">
        <!-- Carried over from the Health Advisor's Physiotherapy panel — read-only here. -->
        <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-user"></use></svg> Patient — from Health Advisor <span id="phAdvWho" class="chipb info" style="margin-left:6px">—</span> <span class="arr">▾</span></div>
          <div class="sec-bd">
            <div class="g4">
              <div class="fld"><label class="lbl" for="phAdvName">Name</label><input class="input" id="phAdvName" readonly></div>
              <div class="fld"><label class="lbl" for="phAdvPhone">Phone number</label><input class="input mono" id="phAdvPhone" readonly></div>
              <div class="fld"><label class="lbl" for="phAdvAppt">Appointment</label><input class="input" id="phAdvAppt" readonly></div>
              <div class="fld"><label class="lbl" for="phAdvPt">Physiotherapist</label><input class="input" id="phAdvPt" readonly></div>
              <div class="fld"><label class="lbl" for="phAdvCondition">Health condition</label><input class="input" id="phAdvCondition" readonly></div>
              <div class="fld"><label class="lbl" for="phAdvReferral">Referral details</label><input class="input" id="phAdvReferral" readonly></div>
              <div class="fld"><label class="lbl" for="phAdvMode">Mode / preferred slot</label><input class="input" id="phAdvMode" readonly></div>
              <div class="fld"><label class="lbl" for="phAdvReports">Reports available</label><input class="input" id="phAdvReports" readonly></div>
            </div>
            <div class="fld fw" style="margin-top:6px"><label class="lbl" for="phAdvNotes">Previous notes / remarks</label><textarea class="area" id="phAdvNotes" rows="2" readonly></textarea></div>
          </div></div>
        <!-- Patient assessment — the physiotherapist's own record for this consultation. Everything
             here is stored in appointments.physio_data.assessment (JSONB), so reopening the patient
             restores exactly what was entered. -->
        <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-doc"></use></svg> Patient assessment — <span id="phSoapTitle">Patient</span> <span class="arr">▾</span></div>
          <div class="sec-bd">
            <!-- Consultation recording bar. Same controls and the same ids-per-role pattern as the
                 Health Coach's office-visit bar, but on its OWN handlers (_phRec*) so nothing here
                 can disturb a coach recording running in another tab. -->
            <div class="mic" style="flex-wrap:wrap;gap:8px"><button class="micb" id="phMicBtn" onclick="window._phRecToggle()"><svg aria-hidden="true" focusable="false" class="icon" style="width:19px;height:19px"><use href="#i-mic"></use></svg></button>
              <div style="flex:1;min-width:180px"><b style="font-size:13px" id="phMicTxt">Start consultation recording</b><div style="font-size:11.5px;color:var(--muted)"><span id="phRecStatus">In-clinic audio — auto-saved to this patient's record</span> <span id="phRecTimer" class="mono" style="margin-left:6px;color:var(--alert);font-weight:700"></span></div></div>
              <span class="chipb info" id="phRecProgress" style="white-space:nowrap">—</span>
              <button class="btn bsm bp" id="phRecStartBtn" onclick="window._phRecToggle()">● Start Recording</button></div>
            <div id="phRecList" style="margin-top:8px"></div>

            <!-- Assessment gate: the fields below stay hidden until Start Recording is pressed in the
                 #phGateModal popup, so a physiotherapy consultation is always captured alongside the
                 record it produces. Mirrors the Health Coach's haLockNote / .ha-gated pair. -->
            <div id="phLockNote" class="aud" style="background:#fff;text-align:center;padding:22px 14px">
              <div style="font-size:34px;line-height:1">🎙️</div>
              <div class="ahd" style="margin-top:6px">Patient assessment is locked</div>
              <div style="font-size:12.5px;color:var(--muted);margin-top:4px">Start the Physiotherapy consultation recording to open the assessment.</div>
              <button class="btn bp" style="margin-top:12px" onclick="window._phGateOpen()">● Start Recording</button>
            </div>
            <div class="ph-gated">
            <div class="nwGrpHd">Lifestyle information</div>
            <div class="g4">
              <div class="fld"><label class="lbl" for="phaActivity">Physical activity</label><select class="select" id="phaActivity"><option value="">— Select —</option><option>Sedentary</option><option>Light</option><option>Moderate</option><option>Active</option></select></div>
              <div class="fld"><label class="lbl" for="phaNutrition">Nutrition</label><select class="select" id="phaNutrition"><option value="">— Select —</option><option>Balanced</option><option>Vegetarian</option><option>Non-vegetarian</option><option>Irregular / poor</option></select></div>
              <div class="fld"><label class="lbl" for="phaSmoking">Smoking</label><select class="select" id="phaSmoking"><option value="">— Select —</option><option>No</option><option>Occasional</option><option>Regular</option><option>Former</option></select></div>
              <div class="fld"><label class="lbl" for="phaAlcohol">Alcohol</label><select class="select" id="phaAlcohol"><option value="">— Select —</option><option>No</option><option>Occasional</option><option>Regular</option><option>Former</option></select></div>
            </div>
            <div class="nwGrpHd" style="margin-top:12px">Medical assessment</div>
            <div class="g2">
              <div class="fld"><label class="lbl" for="phaHistory">Past medical &amp; surgical history</label><textarea class="area" id="phaHistory" rows="2" placeholder="Diabetes, hypertension, surgeries…"></textarea></div>
              <div class="fld"><label class="lbl" for="phaComplaint">Chief complaint(s)</label><textarea class="area" id="phaComplaint" rows="2" placeholder="Lower back pain radiating to the left leg…"></textarea></div>
            </div>
            <div class="g4" style="margin-top:6px">
              <div class="fld"><label class="lbl" for="phaDuration">Duration of symptoms</label><input class="input" id="phaDuration" placeholder="e.g. 3 weeks"></div>
              <div class="fld"><label class="lbl" for="phaPainLoc">Pain location</label><input class="input" id="phaPainLoc" placeholder="e.g. L4–L5, left knee"></div>
              <div class="fld"><label class="lbl" for="phPain">Pain intensity (1–10)</label><input class="input mono" id="phPain" type="number" min="1" max="10" placeholder="—"></div>
              <div class="fld"><label class="lbl" for="phaTests">Special test results</label><input class="input" id="phaTests" placeholder="e.g. SLR positive"></div>
            </div>
            <div class="g2" style="margin-top:6px">
              <div class="fld"><label class="lbl" for="phaDiagnosis">Diagnosis</label><textarea class="area" id="phaDiagnosis" rows="2" placeholder="Clinical diagnosis…"></textarea></div>
              <div class="fld"><label class="lbl" for="phaTreatment">Treatment plan</label><textarea class="area" id="phaTreatment" rows="2" placeholder="Modalities, exercises, home program…"></textarea></div>
            </div>
            <div class="g4" style="margin-top:6px">
              <!-- "Next session" was removed here on request — the Session Details panel below owns
                   the next-session date (#phTpNext); two inputs for one field meant the last save won. -->
              <div class="fld"><label class="lbl" for="phCondition">Health condition</label><input class="input" id="phCondition" placeholder="Shown in the Sessions table"></div>
            </div>
            <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn" onclick="window._phSaveNotes()"><svg class="icon"><use href="#i-check"></use></svg> Save notes</button><button class="btn bp" onclick="window._phSaveSoap()"><svg class="icon"><use href="#i-check"></use></svg> Complete consultation</button><button class="btn" onclick="window._phPrintNotes()">🖨 Print notes</button></div>
            <p style="font-size:11px;color:var(--faint);margin-top:6px">Completing the consultation sends this patient to Reception &rarr; Collect payment. The payment status then shows on both pages. The recording stops and saves automatically when you press <b>Complete consultation</b>.</p>
            </div>
          </div></div>

        <div class="sec"><div class="sec-hd" onclick="togSec(this)"><svg class="icon"><use href="#i-heart"></use></svg> Physiotherapy Session Details — <span id="phPlanTitle">Patient</span> <span class="arr">▾</span></div>
          <div class="sec-bd">
            <!-- Locked by the same gate as the assessment above: the session plan, its price and the
                 visit log are the record the consultation produces, so they open only once that
                 consultation is being captured. -->
            <div id="phPlanLockNote" class="aud" style="background:#fff;text-align:center;padding:18px 14px">
              <div style="font-size:28px;line-height:1">🎙️</div>
              <div class="ahd" style="margin-top:6px">Session details are locked</div>
              <div style="font-size:12.5px;color:var(--muted);margin-top:4px">Start the Physiotherapy consultation recording to open the session plan.</div>
              <button class="btn bp" style="margin-top:12px" onclick="window._phGateOpen()">● Start Recording</button>
            </div>
            <div class="ph-gated">
            <div class="g4">
              <div class="fld"><label class="lbl" for="phTpTherapist">Physiotherapist name</label><select class="select" id="phTpTherapist"><option value="">— Select —</option><option>Karuna</option><option>Swathi</option></select></div>
              <div class="fld"><label class="lbl" for="phTpPlan">Session / treatment plan</label><select class="select" id="phTpPlan" onchange="window._phTpPlanChange()"><option value="">— Select —</option></select></div>
              <div class="fld" id="phTpCustomFld" style="display:none"><label class="lbl" for="phTpCustom">Custom sessions</label><input class="input mono" id="phTpCustom" type="number" min="1" placeholder="e.g. 12" oninput="window._phTpAmtSync()"></div>
              <div class="fld"><label class="lbl" for="phTpStatus">Consultation status</label><select class="select" id="phTpStatus"><option value="waiting">Waiting</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
            </div>
            <div class="g4" style="margin-top:6px">
              <div class="fld"><label class="lbl" for="phTpProgress">Session progress</label><select class="select mono" id="phTpProgress" onchange="window._phTpProgressChange()"><option value="">Select a session / treatment plan first</option></select></div>
              <div class="fld"><label class="lbl" for="phTpNext">Next session date</label><input class="input" type="date" id="phTpNext" data-future="1"></div>
            </div>
            <div class="nwGrpHd" style="margin-top:12px">Payment details</div>
            <div class="g4">
              <div class="fld"><label class="lbl" for="phTpPayType">Payment type</label><select class="select" id="phTpPayType" onchange="window._phTpAmtSync()"><option value="pack">Package</option><option value="per_visit">Per Visit</option></select></div>
              <div class="fld"><label class="lbl" for="phTpPayMode">Payment mode</label><select class="select" id="phTpPayMode"><option value="">— Select —</option><option>Cash</option><option>UPI</option><option>Card</option><option>Net Banking</option></select></div>
              <div class="fld"><label class="lbl" for="phTpAmt">Amount (₹) <span class="ab">auto</span></label><input class="input mono" id="phTpAmt" type="number" min="0" title="Auto-filled from the pricing master (pack price or per-session rate) — editable"></div>
            </div>
            <div class="fld fw" style="margin-top:6px"><label class="lbl" for="phTpNotes">Session notes</label><textarea class="area" id="phTpNotes" rows="2" placeholder="Optional therapist notes…"></textarea></div>
            <div class="fld fw"><label class="lbl">Visit history</label>
              <div id="phVisitHistory"><div style="text-align:center;color:var(--faint);padding:8px;font-size:12px">Open a patient to see visit history.</div></div></div>
            <div style="display:flex;gap:8px;margin-top:10px"><button class="btn bp" onclick="window._phSavePlan()"><svg class="icon"><use href="#i-check"></use></svg> Save session details</button><!-- "Collect payment" removed on request: collection happens at Reception (the completed consultation surfaces the amount in its Collect queue) — window._phCollectPay stays defined for any stale markup. --></div>
            </div>
          </div></div>
        </div>
      </div>
    </div>
  </div></section>

  <!-- ACCOUNTS -->
  <section class="screen" id="s-accounts"><div class="wrap">
    <div class="ph"><div><h1>Accounts &amp; finance</h1><p>Gross vs net always two numbers. Verification closes the loop.</p></div>
      <div class="pha"><button class="btn" data-exp onclick="window._accExport()"><svg class="icon"><use href="#i-dl"></use></svg> Export Excel</button></div></div>
    <span class="viewing"><span class="vd"></span> Viewing as Accounts</span>
    <div class="sec" style="margin-top:10px"><div class="sec-bd" style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">
      <div class="fld" style="margin:0"><label class="lbl">From date &amp; time</label><input  class="input" type="datetime-local" id="accFrom" style="height:34px;width:190px;font-size:12px"></div>
      <div class="fld" style="margin:0"><label class="lbl">To date &amp; time</label><input  class="input" type="datetime-local" id="accTo" style="height:34px;width:190px;font-size:12px"></div>
      <!-- Options are filled from the service master at load (_fillSvcMaster), so a service added
           there appears here without editing this markup. -->
      <div class="fld" style="margin:0"><label class="lbl">Service</label><select  class="select" id="accSvcF" style="height:34px;width:170px"><option value="all">All services</option></select></div>
      <div class="fld" style="margin:0"><label class="lbl">Payment method</label><select  class="select" id="accMethodF" style="height:34px;width:140px"><option value="all">All methods</option><option>Cash</option><option>UPI</option><option>Card</option><option>Net Banking</option><option>Bank Transfer</option><option>Cheque</option><option>Other</option></select></div>
      <div class="fld" style="margin:0"><label class="lbl">Verification</label><select  class="select" id="accStatusF" style="height:34px;width:130px"><option value="all">All</option><option value="verified">Verified</option><option value="unverified">Unverified</option></select></div>
      <button class="btn bsm bp" style="height:34px" onclick="window._accApplyFilters()">Apply</button>
      <button class="btn bsm" style="height:34px" onclick="window._accClearFilters()">Clear</button>
      <input  class="input" id="accSearch" placeholder="Search name / phone / ref…" style="height:34px;max-width:230px;margin-left:auto;font-size:12px" oninput="window._accSearch()">
    </div></div>
    <div class="metrics" id="accMetrics"></div>
    <!-- PER-SERVICE MONEY — collected headline, billed and outstanding beneath. Reflects the same
         filters as the cards above; the list comes from the service master. -->
    <div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--faint);padding:10px 2px 6px">Revenue by service <span style="font-weight:600;text-transform:none;letter-spacing:0">— collected, with billed below · by payment date</span></div>
    <div class="metrics" id="accSvcMetrics"></div>
    <div class="tabs" id="accTabs"><button class="on" data-t="tx">Transactions</button><button data-t="ver">Verify proofs <span id="accVerCount"></span></button><button data-t="out">Outstanding <span id="accOutCount"></span></button><button data-t="ref">Refunds <span id="accRefCount"></span></button><button data-t="thyro">Blood test — Thyrocare</button><button data-t="physio">Physiotherapy</button></div>
    <div class="acc-p" data-p="tx">
      <div class="sec"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg class="icon"><use href="#i-wallet"></use></svg> Transactions</span>
        <input class="input" id="accTxSearch" placeholder="Search name / phone / ref…" style="height:30px;max-width:230px;font-size:12px;font-weight:400" oninput="window._accTxSearch()"></div>
        <div class="sec-bd" id="accTxBody"><div class="ldwrap" role="status" aria-live="polite"><span class="ldcap">Loading transactions…</span><div class="skel w30"></div><div class="skel w90"></div><div class="skel w75"></div><div class="skel w90"></div><div class="skel w55"></div></div></div></div>
      <!-- Verified-payments history lives WITH the transactions (moved here from the Verify tab on
           request); the Verify tab keeps only the pending-verification queue. -->
      <div class="sec" style="margin-top:12px"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg class="icon"><use href="#i-wallet"></use></svg> Transaction history — verified payments</span>
        <input class="input" id="accHistSearch" placeholder="Search name / phone / ref…" style="height:30px;max-width:230px;font-size:12px;font-weight:400" oninput="window._accHistSearch()"></div>
        <div class="sec-bd" id="accHistBody"><div class="ldwrap" role="status" aria-live="polite"><span class="ldcap">Loading…</span><div class="skel w30"></div><div class="skel w90"></div><div class="skel w75"></div><div class="skel w90"></div><div class="skel w55"></div></div></div></div></div>
    <div class="acc-p" data-p="ver" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg class="icon"><use href="#i-check"></use></svg> Verify transactions — pending verification (nothing counts as received until verified)</span>
        <span style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input class="input" id="accVerSearch" placeholder="Search name / phone / ref…" style="height:30px;max-width:220px;font-size:12px;font-weight:400" oninput="window._accVerSearch()">
          <button class="btn bsm" data-exp onclick="window._accVerDownload()">⬇ Download</button></span></div>
        <div class="sec-bd" id="accVerBody"><div class="ldwrap" role="status" aria-live="polite"><span class="ldcap">Loading…</span><div class="skel w30"></div><div class="skel w90"></div><div class="skel w75"></div><div class="skel w90"></div><div class="skel w55"></div></div></div></div></div>
    <div class="acc-p" data-p="out" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg class="icon"><use href="#i-bell"></use></svg> Outstanding — balance chasing lives here</span>
        <span style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input class="input" id="accOutSearch" placeholder="Search name / phone / service…" style="height:30px;max-width:220px;font-size:12px;font-weight:400" oninput="window._accOutSearch()">
          <button class="btn bsm" data-exp onclick="window._accOutDownload()">⬇ Download</button></span></div>
        <div class="sec-bd" id="accOutBody"><div class="ldwrap" role="status" aria-live="polite"><span class="ldcap">Loading…</span><div class="skel w30"></div><div class="skel w90"></div><div class="skel w75"></div><div class="skel w90"></div><div class="skel w55"></div></div></div></div></div>
    <div class="acc-p" data-p="ref" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg class="icon"><use href="#i-coin"></use></svg> Refund console</span>
        <span style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input class="input" id="accRefSearch" placeholder="Search name / phone / reason…" style="height:30px;max-width:220px;font-size:12px;font-weight:400" oninput="window._accRefSearch()">
          <button class="btn bsm" data-exp onclick="window._accRefDownload()">⬇ Download</button></span></div>
        <div class="sec-bd" id="accRefBody"><div class="ldwrap" role="status" aria-live="polite"><span class="ldcap">Loading…</span><div class="skel w30"></div><div class="skel w90"></div><div class="skel w75"></div><div class="skel w90"></div><div class="skel w55"></div></div></div></div>
      <!-- PAYOUT — confirmed by Accounts, money not sent yet. A confirmed refund is a promise, not a
           payment, so it waits here as "Not Paid Yet". Mark as paid moves it down to Refund history. -->
      <div class="sec"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-coin"></use></svg> Payout <span id="accPayoutCount" style="font-size:11px;font-weight:400;color:var(--faint);margin-left:6px"></span></span>
        <span style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <span id="accPayoutSelInfo" style="font-size:11px;color:var(--muted)"></span>
          <input class="input" id="accPayoutSearch" placeholder="Search name / phone / reason…" style="height:30px;max-width:220px;font-size:12px;font-weight:400" oninput="window._accPayoutSearch()">
          <button class="btn bsm bp" onclick="window._accRefMarkPaid()">✓ Mark as paid</button>
          <button class="btn bsm" data-exp onclick="window._accPayoutDownload()">⬇ Download</button></span></div>
        <div class="sec-bd" id="accPayoutBody"><div class="ldwrap" role="status" aria-live="polite"><span class="ldcap">Loading…</span><div class="skel w30"></div><div class="skel w90"></div><div class="skel w75"></div></div></div></div>
      <!-- REFUND HISTORY — the settled ledger. A row only reaches this table once the money has
           actually gone out, so everything here reads "Paid" and nothing is editable. -->
      <div class="sec"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-doc"></use></svg> Refund history <span id="accRefHistCount" style="font-size:11px;font-weight:400;color:var(--faint);margin-left:6px"></span></span>
        <span style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input class="input" id="accRefHistSearch" placeholder="Search name / phone / reason…" style="height:30px;max-width:220px;font-size:12px;font-weight:400" oninput="window._accRefHistSearch()">
          <button class="btn bsm" data-exp onclick="window._accRefHistDownload()">⬇ Download</button></span></div>
        <div class="sec-bd" id="accRefHistBody"><div class="ldwrap" role="status" aria-live="polite"><span class="ldcap">Loading…</span><div class="skel w30"></div><div class="skel w90"></div><div class="skel w75"></div></div></div></div></div>
    <!-- Blood test — Thyrocare: day-by-day reconciliation with the lab partner. Counts and money use
         the SAME definitions as the Blood Test page's own cards, so the two screens always agree. -->
    <div class="acc-p" data-p="thyro" style="display:none">
      <!-- Totals across every row in the reconciliation table below (same figures as its TOTAL
           footer row, surfaced as cards so they're scannable without scrolling the table). -->
      <div class="metrics" id="accThyroCards" style="margin-bottom:12px"></div>
      <div class="sec"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-drop"></use></svg> Blood test — Thyrocare reconciliation <span style="font-size:11px;font-weight:400;color:var(--faint);margin-left:6px">one row per day · by visit date</span></span>
        <span style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">
          <span id="accThyroSelInfo" style="font-size:11px;color:var(--muted)"></span>
          <button class="btn bsm bp" id="accThyroProceed" style="display:none" onclick="window._accThyroProceed()">→ Proceed to payout</button>
          <button class="btn bsm" id="accThyroClearSel" style="display:none" onclick="window._accThyroSelClear()">Clear</button>
          <button class="btn bsm" data-exp onclick="window._accThyroDownload()">⬇ Download</button></span></div>
        <div class="sec-bd" id="accThyroBody"><div class="ldwrap" role="status" aria-live="polite"><span class="ldcap">Loading…</span><div class="skel w30"></div><div class="skel w90"></div><div class="skel w75"></div><div class="skel w90"></div><div class="skel w55"></div></div></div></div>
      <!-- Payout ledger — real money SENT to Thyrocare. The reconciliation table above only ever
           recognizes what we OWE (a record's cost once its lab report is received, per the
           "Paid to Thyrocare" column) — it never recorded an actual transfer. This is that record,
           and the balance line reconciles the two live, so it can never drift out of sync. -->
      <div class="sec" style="margin-top:12px"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-coin"></use></svg> Payout — money sent to Thyrocare <span id="accThyroPayoutCount" style="font-size:11px;font-weight:400;color:var(--faint);margin-left:6px"></span></span>
        <span style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">
          <span id="accThyroPayoutSelInfo" style="font-size:11px;color:var(--muted)"></span>
          <button class="btn bsm bp" id="accThyroMarkPaid" style="display:none" onclick="window._accThyroMarkPaid()">✓ Mark as paid</button>
          <span id="accThyroBalance" style="font-size:12.5px;font-weight:700;white-space:nowrap"></span></span></div>
        <div class="sec-bd">
          <!-- No manual entry form: a payout is only ever created by Proceed on the reconciliation
               table above, so its amount and the days it covers always come from real records
               rather than being typed in and having to agree with them by hand. -->
          <div class="tscroll"><table class="tbl" style="min-width:760px"><thead><tr><th scope="col" style="width:32px"><input type="checkbox" id="accThyroPayoutSelAll" onclick="window._accThyroPayoutSelAll(this.checked)" style="accent-color:var(--brand)"></th><th scope="col">Raised on</th><th scope="col">Amount</th><th scope="col">Covers</th><th scope="col">Status</th><th scope="col">Recorded by</th><th scope="col">Actions</th></tr></thead><tbody id="accThyroPayoutBody"><tr><td colspan="7" style="text-align:center;color:var(--faint);padding:14px">Loading…</td></tr></tbody></table></div>
          <div style="display:flex;justify-content:flex-end;margin-top:8px"><button class="btn bsm" data-exp onclick="window._accThyroPayoutDownload()">⬇ Download</button></div>
        </div></div>

      <!-- THYROCARE PAYMENTS HISTORY — the settled ledger. A payout only reaches this table once
           Mark as paid confirms the money actually left, so everything here reads "Paid". Kept
           separate from the queue above so "still to send" and "already sent" are never one list. -->
      <div class="sec" style="margin-top:12px"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-doc"></use></svg> Thyrocare payments history <span id="accThyroHistCount" style="font-size:11px;font-weight:400;color:var(--faint);margin-left:6px"></span></span>
        <span style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">
          <input class="input" id="accThyroHistSearch" placeholder="Search amount / day / person…" style="height:30px;max-width:220px;font-size:12px;font-weight:400" oninput="window._accThyroHistSearch()">
          <button class="btn bsm" data-exp onclick="window._accThyroHistDownload()">⬇ Download</button></span></div>
        <div class="sec-bd">
          <div class="tscroll"><table class="tbl" style="min-width:760px"><thead><tr><th scope="col">Paid on</th><th scope="col">Amount</th><th scope="col">Covers</th><th scope="col">Status</th><th scope="col">Recorded by</th><th scope="col">Actions</th></tr></thead><tbody id="accThyroHistBody"><tr><td colspan="6" style="text-align:center;color:var(--faint);padding:14px">Loading…</td></tr></tbody></table></div>
        </div></div>
  </div>
    <!-- Physiotherapy: day-by-day reconciliation with the physio provider/team. Deliberately the same
         shape as the Thyrocare tab above (cards → reconciliation → payout queue → settled history) so
         Accounts works one screen, not two. What differs is the subject: blood test settles a LAB
         COST per record, physio settles SESSION WORK, so "Sample collected" becomes session progress
         and the money is the treatment plan's own price rather than a partner's price list. -->
    <div class="acc-p" data-p="physio" style="display:none">
      <div class="metrics" id="accPhysioCards" style="margin-bottom:12px"></div>
      <div class="sec"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-heart"></use></svg> Physiotherapy reconciliation <span style="font-size:11px;font-weight:400;color:var(--faint);margin-left:6px">one row per day · by visit date</span></span>
        <span style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">
          <span id="accPhysioSelInfo" style="font-size:11px;color:var(--muted)"></span>
          <button class="btn bsm bp" id="accPhysioProceed" style="display:none" onclick="window._accPhysioProceed()">→ Proceed to payout</button>
          <button class="btn bsm" id="accPhysioClearSel" style="display:none" onclick="window._accPhysioSelClear()">Clear</button>
          <button class="btn bsm" data-exp onclick="window._accPhysioDownload()">⬇ Download</button></span></div>
        <div class="sec-bd" id="accPhysioBody"><div class="ldwrap" role="status" aria-live="polite"><span class="ldcap">Loading…</span><div class="skel w30"></div><div class="skel w90"></div><div class="skel w75"></div><div class="skel w90"></div><div class="skel w55"></div></div></div></div>

      <!-- Payout ledger — real money SENT to the physio provider/team. The reconciliation table above
           only recognises what the work is WORTH; this is the record of an actual transfer, and the
           balance line reconciles the two live so they cannot drift. -->
      <div class="sec" style="margin-top:12px"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-coin"></use></svg> Payout — money sent to Physiotherapy <span id="accPhysioPayoutCount" style="font-size:11px;font-weight:400;color:var(--faint);margin-left:6px"></span></span>
        <span style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">
          <span id="accPhysioPayoutSelInfo" style="font-size:11px;color:var(--muted)"></span>
          <button class="btn bsm bp" id="accPhysioMarkPaid" style="display:none" onclick="window._accPhysioMarkPaid()">✓ Mark as paid</button>
          <span id="accPhysioBalance" style="font-size:12.5px;font-weight:700;white-space:nowrap"></span></span></div>
        <div class="sec-bd">
          <!-- No manual entry form, for the same reason as Thyrocare: a payout is only ever created by
               Proceed on the reconciliation table, so its amount and the days it covers always come
               from real records rather than being typed in and having to agree with them by hand. -->
          <div class="tscroll"><table class="tbl" style="min-width:760px"><thead><tr><th scope="col" style="width:32px"><input type="checkbox" id="accPhysioPayoutSelAll" onclick="window._accPhysioPayoutSelAll(this.checked)" style="accent-color:var(--brand)"></th><th scope="col">Raised on</th><th scope="col">Amount</th><th scope="col">Covers</th><th scope="col">Status</th><th scope="col">Recorded by</th><th scope="col">Actions</th></tr></thead><tbody id="accPhysioPayoutBody"><tr><td colspan="7" style="text-align:center;color:var(--faint);padding:14px">Loading…</td></tr></tbody></table></div>
          <div style="display:flex;justify-content:flex-end;margin-top:8px"><button class="btn bsm" data-exp onclick="window._accPhysioPayoutDownload()">⬇ Download</button></div>
        </div></div>

      <!-- PHYSIOTHERAPY PAYMENTS HISTORY — the settled ledger. A payout only reaches this table once
           Mark as paid confirms the money actually left, so everything here reads "Paid". Kept
           separate from the queue above so "still to send" and "already sent" are never one list. -->
      <div class="sec" style="margin-top:12px"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg aria-hidden="true" focusable="false" class="icon"><use href="#i-doc"></use></svg> Physiotherapy payments history <span id="accPhysioHistCount" style="font-size:11px;font-weight:400;color:var(--faint);margin-left:6px"></span></span>
        <span style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">
          <input class="input" id="accPhysioHistSearch" placeholder="Search amount / day / person…" style="height:30px;max-width:220px;font-size:12px;font-weight:400" oninput="window._accPhysioHistSearch()">
          <button class="btn bsm" data-exp onclick="window._accPhysioHistDownload()">⬇ Download</button></span></div>
        <div class="sec-bd">
          <div class="tscroll"><table class="tbl" style="min-width:820px"><thead><tr><th scope="col">Paid on</th><th scope="col">Amount</th><th scope="col">Covers</th><th scope="col">Method</th><th scope="col">Status</th><th scope="col">Recorded by</th><th scope="col">Actions</th></tr></thead><tbody id="accPhysioHistBody"><tr><td colspan="7" style="text-align:center;color:var(--faint);padding:14px">Loading…</td></tr></tbody></table></div>
        </div></div>
    </div>
  </section>

  <!-- REPORTS (Admin Report redesign — all styling scoped under .rpc) -->
  <section class="screen" id="s-reports"><div class="wrap" style="max-width:1600px">
    <div class="rpc">
      <!-- TOP BAR -->
      <div class="topbar">
        <span class="tb-logo">MHS</span>
        <span class="tb-title">Admin Report</span>
        <span class="tb-badge" id="rpcRoleBadge">Full Access</span>
        <div class="tb-right"><span class="tb-date" id="rpcLiveDate"></span></div>
      </div>
      <!-- CONTROL BAR 1 — Period + Row View -->
      <div class="ctrl1">
        <span class="ctrl-label">Period:</span>
        <div class="tog" id="rpcPeriodTog">
          <button class="tog-btn on" data-p="daily" onclick="window._rpcSetPeriod('daily',this)">Daily</button>
          <button class="tog-btn" data-p="weekly" onclick="window._rpcSetPeriod('weekly',this)">Weekly</button>
          <button class="tog-btn" data-p="monthly" onclick="window._rpcSetPeriod('monthly',this)">Monthly</button>
          <button class="tog-btn" data-p="yearly" onclick="window._rpcSetPeriod('yearly',this)">Yearly</button>
          <button class="tog-btn" data-p="custom" onclick="window._rpcSetPeriod('custom',this)">Custom</button>
        </div>
        <div class="custom-range" id="rpcCustomRange">
          <span class="ctrl-label">From</span>
          <input type="date" class="date-input" id="rpcFrom">
          <span class="ctrl-label">To</span>
          <input type="date" class="date-input" id="rpcTo">
          <button class="btn-s purple" onclick="window._rpcRender()">Apply</button>
        </div>
        <!-- Period navigator (← / label / → / Today) removed on request. The label read "Q3 2026" on
             the Monthly view (its window is a quarter of monthly buckets), which was confusing next
             to a Period control that has no Quarterly option. _rpcNavOff stays 0, so every period
             shows the CURRENT day/week/quarter/year; use Custom + From/To for any other range.
             The _rpcNav/_rpcNavToday handlers are kept so nothing that calls them breaks. -->
        <div style="width:0.5px;height:16px;background:#E5E7EB;margin:0 4px"></div>
        <span class="ctrl-label">View by:</span>
        <div class="tog" id="rpcRowviewTog">
          <button class="tog-btn on blue" data-v="period" onclick="window._rpcSetRowView('period',this)">Period</button>
          <button class="tog-btn" data-v="person" onclick="window._rpcSetRowView('person',this)">Person</button>
        </div>
      </div>
      <!-- CONTROL BAR 2 — Filters -->
      <div class="ctrl2">
        <select class="filter-sel" id="rpcFService" onchange="window._rpcRender()"><option value="all">All Services</option></select>
        <select class="filter-sel" id="rpcFSales" onchange="window._rpcRender()"><option value="all">All Salespersons</option></select>
        <select class="filter-sel" id="rpcFHc" onchange="window._rpcRender()"><option value="all">All HCs</option></select>
        <select class="filter-sel" id="rpcFSource" onchange="window._rpcRender()"><option value="all">All Sources</option></select>
        <select class="filter-sel" id="rpcFProg" onchange="window._rpcRender()"><option value="all">All Programs</option><option>L1</option><option>L2</option><option>L1 + L2</option></select>
        <input type="text" class="search-input" id="rpcSearch" placeholder="Search..." oninput="window._rpcRenderBody()">
        <div style="margin-left:auto;display:flex;gap:5px">
          <button class="btn-s" onclick="window._rpcToggleColPanel()" id="rpcColPanelBtn">
            <svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line></svg>
            Columns
          </button>
          <button class="btn-s green" data-exp onclick="window._rpcExport()">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export
          </button>
        </div>
      </div>
      <!-- SAVED VIEWS BAR -->
      <div class="saved-bar" id="rpcSavedBar">
        <span class="sv-lbl">Saved Views:</span>
        <span class="sv-tag on" onclick="window._rpcPreset(this,'all')">All Columns</span>
        <span class="sv-tag sales" onclick="window._rpcPreset(this,'sales')">Sales Only</span>
        <span class="sv-tag health" onclick="window._rpcPreset(this,'health')">Health Only</span>
        <span class="sv-tag roas" onclick="window._rpcPreset(this,'roas')">Revenue View</span>
        <span class="sv-tag" onclick="window._rpcPreset(this,'metric')">Conversion Metrics</span>
        <span class="sv-tag" onclick="window._rpcPreset(this,'l1l2')">L1 / L2 View</span>
        <span class="sv-tag" onclick="window._rpcPreset(this,'audit')">Audit View</span>
        <span class="sv-tag roas" onclick="window._rpcPreset(this,'bysvc')">Revenue by Service</span>
      </div>
      <!-- SUMMARY CARDS -->
      <div class="sum-wrap"><div class="sum-grid" id="rpcSumGrid"></div></div>
      <!-- PER-SERVICE MONEY — one card per service, collected with billed underneath. Never blended
           into a single total; the list is generated from the service master. -->
      <div class="sum-wrap" style="margin-top:8px">
        <div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--faint);padding:0 2px 6px">Revenue by service <span style="font-weight:600;text-transform:none;letter-spacing:0">— collected, with billed below · by payment date</span></div>
        <div class="sum-grid" id="rpcSvcGrid"></div>
      </div>
      <!-- SECTION HEADER -->
      <div class="sec-hd2">
        <div>
          <div class="sec-title" id="rpcSecTitle">Daily Report — Period View</div>
          <div class="sec-sub" id="rpcSecSub">Live data · Click column header to filter</div>
        </div>
        <button type="button" class="rpc-tgl" id="rpcBasisTgl" onclick="window._rpcToggleBasis()" aria-pressed="true"
          title="On: count each lead on the day its latest process happened (call status, appointment, follow-up, enrolment). Off: count it on the day the lead was created.">
          <span class="sw"><span class="kn"></span></span>
          <span class="tx" id="rpcBasisTxt">Date: Activity</span>
        </button>
        <select class="filter-sel" id="rpcSort" onchange="window._rpcRenderBody()">
          <option value="leads">Sort: Leads</option>
          <option value="apptTot">Sort: Appt Fixed</option>
          <option value="vis">Sort: Visited</option>
          <option value="enr">Sort: Enrolled</option>
          <option value="rev">Sort: Revenue</option>
          <option value="none">Sort: Natural</option>
        </select>
      </div>
      <!-- TABLE -->
      <div class="tbl-wrap" id="rpcTblWrap">
        <table><thead id="rpcThead"></thead><tbody id="rpcTbody"><tr><td style="padding:20px;color:#6B7280">Loading report data…</td></tr></tbody></table>
      </div>
      <!-- COL FILTER DROP -->
      <div class="col-filter-drop" id="rpcCfd">
        <div class="cfd-title" id="rpcCfdTitle">Filter: Column</div>
        <div class="cfd-row">
          <select id="rpcCfdOp"><option value="gte">&ge; Min</option><option value="lte">&le; Max</option><option value="eq">= Equal</option><option value="contains">Contains</option></select>
        </div>
        <input class="cfd-input" type="text" id="rpcCfdVal" placeholder="Value...">
        <div class="cfd-row">
          <button class="cfd-btn cfd-clear" onclick="window._rpcCfdClear()">Clear</button>
          <button class="cfd-btn" onclick="window._rpcCfdApply()">Apply</button>
        </div>
      </div>
      <!-- COLUMN PANEL -->
      <div class="col-panel" id="rpcColPanel">
        <div class="cp-hd">
          <span class="cp-hd-title">Manage Columns</span>
          <button class="cp-close" onclick="window._rpcToggleColPanel()">&#10005;</button>
        </div>
        <div class="cp-search"><input type="text" placeholder="Search columns..." oninput="window._rpcCpFilter(this.value)"></div>
        <div class="cp-actions">
          <button class="cp-act" onclick="window._rpcAllCols(true)">Show All</button>
          <button class="cp-act" onclick="window._rpcAllCols(false)">Hide All</button>
          <button class="cp-act" onclick="window._rpcPreset(null,'sales')">Sales</button>
          <button class="cp-act" onclick="window._rpcPreset(null,'health')">Health</button>
          <button class="cp-act" onclick="window._rpcPreset(null,'roas')">Revenue</button>
        </div>
        <div class="cp-list" id="rpcCpList"></div>
      </div>
    </div>
  </div></section>

  <!-- ============================================================================
       MARKETING — CAMPAIGN TRACKER
       Spend and delivery come from Meta (ads_read); everything past the click — leads,
       appointments, visits, enrolments — comes from our own tables and is joined by ad NAME.
       All styling is scoped under .ctk so nothing here can leak into another screen.
       ============================================================================ -->
  <section class="screen" id="s-campaigns"><div class="wrap ctk" style="max-width:1720px;padding:16px 20px 60px">
    <div class="ctk-hero">
      <div class="ctk-hero-glow"></div>
      <div class="ctk-hero-in">
        <div>
          <div class="ctk-eyebrow"><span class="ctk-dot"></span> Live from Meta</div>
          <h1 class="ctk-title">Campaign Tracker</h1>
          <p class="ctk-sub">Every rupee spent, followed all the way to an enrolment.</p>
        </div>
        <div class="ctk-hero-act">
          <span class="ctk-stamp" id="ctkStamp"></span>
          <button class="ctk-btn ghost" data-exp onclick="window._ctkExport()"><span>⬇</span> Export</button>
          <button class="ctk-btn" id="ctkRefreshBtn" onclick="window._ctkLoad(true)"><span class="ctk-spin">↻</span> Refresh</button>
        </div>
      </div>
    </div>

    <!-- Blocked-permission banner. Shown ONLY when Meta refuses the ad account, because a table of
         zeros is indistinguishable from campaigns that genuinely spent nothing. -->
    <div class="ctk-alert" id="ctkAlert" style="display:none"></div>

    <div class="ctk-bar">
      <!-- The range lives in these two hidden inputs; the picker below writes them, and every
           loader still reads them, so nothing downstream needs to know a picker exists. -->
      <input type="hidden" id="ctkFrom"><input type="hidden" id="ctkTo">
      <button class="ctk-dbtn" id="ctkDateBtn" onclick="window._ctkDpOpen()">
        <svg aria-hidden="true" focusable="false" class="icon" style="width:14px;height:14px"><use href="#i-cal"></use></svg>
        <span id="ctkDateLbl">Last 30 days</span><span class="cv">▾</span>
      </button>
      <span class="ctk-cmp" id="ctkCmpTag" style="display:none"></span>
      <div class="ctk-seg" id="ctkLevel">
        <button data-l="campaign" onclick="window._ctkLevel('campaign',this)">By campaign</button>
        <button data-l="adset" onclick="window._ctkLevel('adset',this)">By adset</button>
        <button data-l="ad" class="on" onclick="window._ctkLevel('ad',this)">By ad</button>
      </div>
      <input class="ctk-search" id="ctkSearch" placeholder="Search campaign / adset / ad…" oninput="window._ctkSearch()">
    </div>

    <!-- Same reasoning as the Meta page: these ship empty and are filled by _ctkRender(), so the
         first paint was a blank strip where the KPIs belong. The skeleton cards carry the real
         card's shape, which is what stops the layout jumping when the numbers land. _ctkRender()
         runs from _ctkLoad's finally block, so this is replaced on the error path too. -->
    <div class="ctk-kpis" id="ctkKpis">
      <div class="ctk-k"><div class="kl skel w55">&nbsp;</div><div class="kv skel w75" style="height:22px;margin-top:7px">&nbsp;</div><div class="ks skel w30" style="margin-top:6px">&nbsp;</div><div class="kbar"></div></div>
      <div class="ctk-k"><div class="kl skel w55">&nbsp;</div><div class="kv skel w75" style="height:22px;margin-top:7px">&nbsp;</div><div class="ks skel w30" style="margin-top:6px">&nbsp;</div><div class="kbar"></div></div>
      <div class="ctk-k"><div class="kl skel w55">&nbsp;</div><div class="kv skel w75" style="height:22px;margin-top:7px">&nbsp;</div><div class="ks skel w30" style="margin-top:6px">&nbsp;</div><div class="kbar"></div></div>
      <div class="ctk-k"><div class="kl skel w55">&nbsp;</div><div class="kv skel w75" style="height:22px;margin-top:7px">&nbsp;</div><div class="ks skel w30" style="margin-top:6px">&nbsp;</div><div class="kbar"></div></div>
      <div class="ctk-k"><div class="kl skel w55">&nbsp;</div><div class="kv skel w75" style="height:22px;margin-top:7px">&nbsp;</div><div class="ks skel w30" style="margin-top:6px">&nbsp;</div><div class="kbar"></div></div>
    </div>

    <!-- Funnel: one card per stage. Each card's meter is its conversion FROM THE PREVIOUS STAGE,
         not a share of the total — clicks outnumber enrolments by four orders of magnitude, so on
         one shared scale every stage after the first is an unreadable sliver. -->
    <div class="ctk-panel">
      <div class="ctk-funnel" id="ctkFunnel">
        <div class="ctk-fc"><div class="fl skel w55">&nbsp;</div><div class="fv skel w75" style="height:24px;margin-top:6px">&nbsp;</div><div class="fm"></div></div>
        <div class="ctk-fc"><div class="fl skel w55">&nbsp;</div><div class="fv skel w75" style="height:24px;margin-top:6px">&nbsp;</div><div class="fm"></div></div>
        <div class="ctk-fc"><div class="fl skel w55">&nbsp;</div><div class="fv skel w75" style="height:24px;margin-top:6px">&nbsp;</div><div class="fm"></div></div>
        <div class="ctk-fc"><div class="fl skel w55">&nbsp;</div><div class="fv skel w75" style="height:24px;margin-top:6px">&nbsp;</div><div class="fm"></div></div>
        <div class="ctk-fc"><div class="fl skel w55">&nbsp;</div><div class="fv skel w75" style="height:24px;margin-top:6px">&nbsp;</div><div class="fm"></div></div>
        <div class="ctk-fc"><div class="fl skel w55">&nbsp;</div><div class="fv skel w75" style="height:24px;margin-top:6px">&nbsp;</div><div class="fm"></div></div>
      </div>
    </div>

    <!-- Drill-down — the individual records behind whichever funnel card was clicked. Hidden until
         a card is pressed, so the page does not open with two tables competing for attention. -->
    <div class="ctk-panel" id="ctkDrillPanel" style="display:none">
      <div class="ctk-ph">
        <span class="ctk-ph-t" id="ctkDrillTitle"></span>
        <span class="ctk-ph-s" id="ctkDrillSub"></span>
        <span style="margin-left:auto;display:flex;gap:8px">
          <button class="ctk-btn ghost" style="color:var(--ink);background:var(--surface-2);border-color:var(--line)" data-exp onclick="window._ctkDrillExport()">⬇ Export</button>
          <button class="ctk-btn ghost" style="color:var(--ink);background:var(--surface-2);border-color:var(--line)" onclick="window._ctkDrillClose()">✕ Close</button>
        </span>
      </div>
      <div class="ctk-tw" style="max-height:min(48vh,540px)"><table class="ctk-tbl"><thead id="ctkDrillHead"></thead><tbody id="ctkDrillBody"></tbody></table></div>
    </div>

    <!-- Performance — the per-creative breakdown. This is where every column asked for lives
         (spend, delivery, funnel, conversion, cost-per); the cards above are only its summary. -->
    <div class="ctk-panel">
      <div class="ctk-ph"><span class="ctk-ph-t">Performance</span><span class="ctk-ph-s" id="ctkRowInfo"></span></div>
      <div class="ctk-tw"><table class="ctk-tbl"><thead id="ctkHead"></thead><tbody id="ctkBody"><tr><td colspan="24" class="ctk-none">Loading campaign performance…</td></tr></tbody><tfoot id="ctkFoot"></tfoot></table></div>
    </div>

    <!-- Date-range picker. Built to the Meta Ads Manager pattern: preset rail on the left, two
         months side by side, compare toggle, Cancel / Update. Nothing is applied until Update. -->
    <div class="ctk-dp" id="ctkDp" style="display:none" role="dialog" aria-modal="true" aria-label="Select date range">
      <div class="ctk-dp-box">
        <div class="ctk-dp-hd">
          <span class="t"><svg aria-hidden="true" focusable="false" class="icon" style="width:15px;height:15px"><use href="#i-cal"></use></svg> <b id="ctkDpTitle">Last 30 days</b></span>
          <button class="ctk-dp-x" onclick="window._ctkDpClose()" aria-label="Close">✕</button>
        </div>
        <div class="ctk-dp-bd">
          <div class="ctk-dp-rail">
            <div class="rh">Recently used</div>
            <div id="ctkDpPresets"></div>
          </div>
          <div class="ctk-dp-cal">
            <div class="ctk-dp-months" id="ctkDpMonths"></div>
            <label class="ctk-dp-cmp"><input type="checkbox" id="ctkDpCompare" onchange="window._ctkDpCmp()"> Compare with the previous period</label>
          </div>
        </div>
        <div class="ctk-dp-ft">
          <span class="tz">Dates are shown in Kolkata Time</span>
          <span class="acts">
            <button class="ctk-dp-btn" onclick="window._ctkDpClose()">Cancel</button>
            <button class="ctk-dp-btn primary" onclick="window._ctkDpApply()">Update</button>
          </span>
        </div>
      </div>
    </div>
  </div></section>

  <!-- MARKETING — LEADS VIEW (shell; the spec for this page is still to come) -->
  <section class="screen" id="s-leadsview"><div class="wrap ctk" style="max-width:1720px;padding:16px 20px 60px">
    <div class="ctk-hero">
      <div class="ctk-hero-glow"></div>
      <div class="ctk-hero-in">
        <div>
          <div class="ctk-eyebrow"><span class="ctk-dot"></span> Marketing</div>
          <h1 class="ctk-title">Leads View</h1>
          <p class="ctk-sub">A marketing-side read of every lead, by source and creative.</p>
        </div>
      </div>
    </div>
    <div class="ctk-panel">
      <div class="ctk-empty">
        <div class="ctk-empty-ic">◷</div>
        <div class="ctk-empty-t">Waiting on the spec</div>
        <div class="ctk-empty-s">The page shell, navigation and styling are in place. Tell me which columns and filters this view needs and it gets built here.</div>
      </div>
    </div>
  </div></section>

  <!-- BDM REQUISITION (shell; the spec for this page is still to come) -->
  <section class="screen" id="s-bdmreq"><div class="wrap ctk" style="max-width:1720px;padding:16px 20px 60px">
    <div class="ctk-hero">
      <div class="ctk-hero-glow"></div>
      <div class="ctk-hero-in">
        <div>
          <div class="ctk-eyebrow"><span class="ctk-dot"></span> BDM</div>
          <h1 class="ctk-title">BDM Requisition</h1>
          <p class="ctk-sub">Every request waiting on the BDM — enrolment deals and assessment edits — with who raised it and when. Open one to review the full report, then approve or return it.</p>
        </div>
        <div class="ctk-hero-act">
          <div class="ctk-seg" id="bdmTabs">
            <button class="on" onclick="window._bdmSetTab('pending',this)">Pending <span id="bdmPendingCount" style="font-family:var(--mono);font-size:10px">0</span></button>
            <button onclick="window._bdmSetTab('done',this)">Decided</button>
          </div>
        </div>
      </div>
    </div>
    <!-- DIRECT UPLOAD IN DP — safe, update-only bulk lead editing. Sits directly under the BDM hero.
         The workflow is fixed and cannot be short-cut: download template → upload → preview →
         confirm. The Confirm button does not exist until a preview has been produced. -->
    <div class="sec" style="margin-bottom:14px" id="dupSec"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
      <span><svg class="icon"><use href="#i-dl"></use></svg> Direct Upload in DP <span class="chipb neu" style="margin-left:6px">Updates existing leads, creates new ones</span></span>
      <span style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn bsm" onclick="window._dupTemplate()">⬇ Download template</button>
        <button class="btn bsm" onclick="window._dupHistory()">🕘 Upload history</button></span></div>
      <div class="sec-bd">
        <p style="font-size:12px;color:var(--muted);margin:6px 2px 12px;line-height:1.6">
          Update leads from a CSV, and create the ones that do not exist yet. <b>A blank cell keeps whatever the database already holds</b> — it never clears a value; type <code>#CLEAR</code> to blank a field deliberately.
          Leads are matched on <b>Phone</b> (or <b>Lead ID</b> if your file still has that column); a phone shared by more than one lead is sent to review rather than guessed, so an upload cannot create a duplicate.
          Advisor, Health Coach and Call Status spellings are resolved to the ones the app already uses. A value that cannot be read is skipped and named — the rest of its row still imports.
          <b>Only the leads in your file are touched</b>, and every page reading them refreshes on its own once the upload finishes.
        </p>
        <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end">
          <div class="fld" style="margin:0"><label class="lbl" for="dupFile">CSV file</label>
            <input class="input" type="file" id="dupFile" accept=".csv,text/csv" onchange="window._dupPick()" style="height:36px;padding:6px 8px;max-width:320px"></div>
          <div class="fld" style="margin:0"><label class="lbl">Lead Date handling</label>
            <div class="pills" id="dupDateMode">
              <button type="button" class="pill on" onclick="window._dupDateMode('keep',this)">Keep existing Lead Date</button>
              <button type="button" class="pill" onclick="window._dupDateMode('update',this)">Update Lead Date from CSV</button>
            </div></div>
          <button class="btn bp" onclick="window._dupPreview()" style="height:36px">Validate &amp; preview</button>
          <button class="btn bp" id="dupConfirmBtn" style="height:36px;display:none" onclick="window._dupConfirm()">✓ Confirm update</button>
        </div>
        <div id="dupOut" style="margin-top:14px"></div>
      </div></div>

    <div id="bdmReqList"></div>
  </div></section>

  <!-- RECORDINGS -->
  <section class="screen" id="s-recordings"><div class="wrap" style="max-width:1280px;padding:16px 20px 60px">
    <div class="ph"><div><h1>Recordings</h1><p id="recSubtitle">All in-clinic office-visit audio and Zoom consultation recordings across customers.</p></div></div>

    <div class="sec" style="margin-bottom:16px" id="ovrTblSec">
      <div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-mic"></use></svg> Office Visit Recordings <span class="chipb ok" id="ovrTblCount" style="margin-left:8px">0</span>
        <input class="input" id="ovrTblSearch" placeholder="Search name / recorded by…" style="height:30px;font-size:12px;width:220px;margin-left:auto" oninput="window._ovrTblSearch()">
        <button class="btn bsm" style="margin-left:8px" data-exp onclick="window._ovrTblDownload()">⬇ Download</button></div>
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
      <div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-chat"></use></svg> Zoom Meeting Recordings <span class="chipb ok" id="zoomTblCount" style="margin-left:8px">0</span>
        <input class="input" id="zoomTblSearch" placeholder="Search name / link…" style="height:30px;font-size:12px;width:220px;margin-left:auto" oninput="window._zoomTblSearch()">
        <button class="btn bsm" style="margin-left:8px" data-exp onclick="window._zoomTblDownload()">⬇ Download</button></div>
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

    <div class="sec" id="callRecSec" style="margin-bottom:16px;display:none">
      <div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-mic"></use></svg> Call Recordings <span class="chipb ok" id="callRecCount" style="margin-left:8px">0</span>
        <input class="input" id="callRecSearch" placeholder="Search customer / number / status…" style="height:30px;font-size:12px;width:240px;margin-left:auto" oninput="window._callRecSearch()">
        <button class="btn bsm" style="margin-left:8px" data-exp onclick="window._callRecDownload()">⬇ Download</button></div>
      <div class="sec-bd">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <span style="font-size:12px;color:var(--faint)">Date</span>
          <input class="input" type="date" id="callRecFrom" style="height:30px;font-size:12px;width:150px" title="From">
          <span style="color:var(--faint);font-size:12px">→</span>
          <input class="input" type="date" id="callRecTo" style="height:30px;font-size:12px;width:150px" title="To">
          <button class="btn bsm bp" onclick="window._callRecApply()">Apply</button>
          <button class="btn bsm" onclick="window._callRecClear()">Clear</button>
        </div>
        <div class="tscroll stick1"><table class="tbl" style="min-width:960px"><thead><tr id="callRecHead"></tr></thead><tbody id="callRecBody"></tbody></table></div>
        <div style="display:flex;gap:10px;margin-top:12px;align-items:center;justify-content:center;flex-wrap:wrap">
          <button class="btn bsm" id="callRecFirstBtn" onclick="window._callRecPage('first')">« First</button>
          <button class="btn bsm" id="callRecPrevBtn" onclick="window._callRecPage(-1)">← Previous</button>
          <span style="font-size:12.5px;font-weight:600;color:var(--ink)" id="callRecPageInfo">Page 1 of 1</span>
          <button class="btn bsm" id="callRecNextBtn" onclick="window._callRecPage(1)">Next →</button>
          <button class="btn bsm" id="callRecLastBtn" onclick="window._callRecPage('last')">Last »</button>
        </div>
      </div>
    </div>
  </div></section>

  <!-- SETTINGS -->
  <section class="screen" id="s-admin"><div class="wrap" style="max-width:1280px;padding:16px 20px 60px">
    <div class="ph"><div><h1>Settings &amp; masters</h1><p>Control plane — configure every screen's fields, pricing, roles, integrations.</p></div></div>
    <div class="tabs" id="settTabs"><button class="on" data-t="st-svc">Service pricing</button><button data-t="st-btm">Blood Test pricing</button><button data-t="st-php">Physiotherapy pricing</button><button data-t="st-cpn">Coupon codes</button><button data-t="st-usr">Users &amp; Assignees</button><button data-t="st-tgt">Advisor targets</button><button data-t="st-org">Services &amp; Roles</button><button data-t="st-rbac">Roles &amp; RBAC</button><button data-t="st-act" id="stActTab" style="display:none">Login Activity</button><button data-t="st-fld">Screen fields</button><button data-t="st-drop">Dropdown masters</button><button data-t="st-int">Integrations</button><button data-t="st-msg">Auto-messages</button></div>


    <div class="st-p" data-p="st-svc">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-coin"></use></svg> Service pricing — all services, all variations · dynamic</div>
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
            <p style="font-size:12.5px;color:var(--muted);margin:6px 2px">Blood-test panels &amp; pricing are now managed in the dedicated <b><a href="#" onclick="event.preventDefault();document.querySelector('#settTabs button[data-t=st-btm]').click()" style="color:var(--brand-600)">Blood Test pricing</a></b> tab — the single dynamic source of truth (service amount, Thyrocare cost, auto margin) reflected across Reception, Collect Payment and the Blood Test module.</p></div>
          <div class="aud" style="background:#fff"><div class="ahd" style="color:var(--vio-ink)">💪 Physiotherapy</div>
            <p style="font-size:12.5px;color:var(--muted);margin:6px 2px">Physiotherapy consultation, per-session and pack pricing is managed in the dedicated <b><a href="#" onclick="event.preventDefault();document.querySelector('#settTabs button[data-t=st-php]').click()" style="color:var(--brand-600)">Physiotherapy pricing</a></b> tab — the single dynamic source of truth for the Physiotherapy page's payment amounts.</p></div>
          <button class="btn bp" style="margin-top:12px" onclick="toast('All service pricing saved — reflected across all screens')">Save pricing</button>
        </div></div>
    </div>

    <!-- BLOOD TEST & PRICING MASTER — dynamic CRUD on bt_tests (single source of truth) -->
    <div class="st-p" data-p="st-btm" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-drop"></use></svg> Blood Test &amp; Pricing Master — the single source of truth for every blood-test price</div>
        <div class="sec-bd">
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px">
            <div class="fld" style="margin:0"><label class="lbl" for="btmName">Test / panel</label><input  class="input" id="btmName" placeholder="e.g. HbA1c" style="height:34px;width:220px"></div>
            <div class="fld" style="margin:0"><label class="lbl" for="btmPrice">Service amount (₹)</label><input  class="input mono" id="btmPrice" type="number" min="0" style="height:34px;width:130px" oninput="window._btmMargin()"></div>
            <div class="fld" style="margin:0"><label class="lbl" for="btmCost">Thyrocare cost (₹)</label><input  class="input mono" id="btmCost" type="number" min="0" style="height:34px;width:130px" oninput="window._btmMargin()"></div>
            <div class="fld" style="margin:0"><label class="lbl">Margin <span class="ab">auto</span></label><div class="input mono select auto" id="btmMargin" style="height:34px;width:110px;display:flex;align-items:center">₹0</div></div>
            <div class="fld" style="margin:0"><label class="lbl" for="btmRetest">Re-test (months)</label><input  class="input mono" id="btmRetest" type="number" min="0" placeholder="optional" style="height:34px;width:120px"></div>
            <button class="btn bp" id="btmAddBtn" onclick="window._btmSave()" style="height:34px">+ Add test</button>
            <button class="btn bsm" id="btmCancelBtn" onclick="window._btmCancel()" style="height:34px;display:none">Cancel</button>
          </div>
          <div class="tscroll"><table class="tbl" style="min-width:760px"><thead><tr><th>Test / panel</th><th>Service amount</th><th>Thyrocare cost</th><th>Margin</th><th>Status</th><th>Actions</th></tr></thead><tbody id="btmBody"></tbody></table></div>
          <p style="font-size:11.5px;color:var(--faint);margin-top:10px">Add, edit, delete or (de)activate any panel. Changes take effect live across Reception intake, Collect Payment and the Blood Test module — no code change or redeploy needed.</p>
        </div></div>
    </div>

    <!-- PHYSIOTHERAPY PRICING MASTER — dynamic CRUD on physio_pricing (single source of truth) -->
    <div class="st-p" data-p="st-php" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-heart"></use></svg> Physiotherapy Pricing Master — the single source of truth for every physiotherapy price</div>
        <div class="sec-bd">
          <p style="font-size:12px;color:var(--muted);margin:6px 2px 10px">Live source of truth for the Physiotherapy page's payment amounts. Sessions: 0 = consultation, 1 = per-session rate, 6/8/12 = packs (auto-fills the pack price on a matching treatment plan).</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:12px">
            <div class="fld" style="margin:0"><label class="lbl" for="phpName">Item</label><input class="input" id="phpName" placeholder="e.g. 6-session pack" style="height:34px;width:220px"></div>
            <div class="fld" style="margin:0"><label class="lbl" for="phpSessions">Sessions</label><input class="input mono" id="phpSessions" type="number" min="0" placeholder="0" style="height:34px;width:110px"></div>
            <div class="fld" style="margin:0"><label class="lbl" for="phpPrice">Price (₹)</label><input class="input mono" id="phpPrice" type="number" min="0" style="height:34px;width:130px"></div>
            <button class="btn bp" id="phpAddBtn" onclick="window._phpSave()" style="height:34px">+ Add item</button>
            <button class="btn bsm" id="phpCancelBtn" onclick="window._phpCancel()" style="height:34px;display:none">Cancel</button>
          </div>
          <div class="tscroll"><table class="tbl" style="min-width:560px"><thead><tr><th>Item</th><th>Sessions</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead><tbody id="phpBody"><tr><td colspan="5" style="text-align:center;color:var(--faint);padding:14px">Loading…</td></tr></tbody></table></div>
          <p style="font-size:11.5px;color:var(--faint);margin-top:10px">Add, edit, delete or (de)activate any item. Changes take effect live on the Physiotherapy page's treatment-plan and payment amounts — no code change or redeploy needed.</p>
        </div></div>
    </div>

    <!-- COUPON CODES MASTER — auto-generated MHS + YY + MM + serial codes on bt_coupons (the store
         every Apply-coupon field already validates against). Serial restarts each month. -->
    <div class="st-p" data-p="st-cpn" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-coin"></use></svg> Coupon codes — special discount <span class="nb">NEW</span></div>
        <div class="sec-bd">
          <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:stretch;margin-bottom:16px">
            <div style="flex:1;min-width:270px;background:linear-gradient(135deg,#0E7C5C,#129468);border-radius:13px;padding:15px 18px;color:#fff;box-shadow:0 10px 24px -12px rgba(14,124,92,.55)">
              <div style="font-size:10px;font-weight:700;letter-spacing:.1em;opacity:.78;text-transform:uppercase">Next code · auto-generated</div>
              <div style="display:flex;align-items:center;gap:10px;margin:7px 0 10px"><span id="cpnNext" style="font-family:var(--mono,ui-monospace,monospace);font-size:25px;font-weight:700;letter-spacing:.05em">MHS———</span><button class="btn bsm" style="height:26px;font-size:11px;background:rgba(255,255,255,.14);border-color:transparent;color:#fff" onclick="window._cpnCopyNext()" title="Copy the next code">Copy</button></div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;font-size:10.5px;font-weight:600">
                <span style="background:rgba(255,255,255,.15);border-radius:6px;padding:2px 8px">MHS — brand</span>
                <span style="background:rgba(255,255,255,.15);border-radius:6px;padding:2px 8px" id="cpnFmtY">YY — year</span>
                <span style="background:rgba(255,255,255,.15);border-radius:6px;padding:2px 8px" id="cpnFmtM">MM — month</span>
                <span style="background:rgba(255,255,255,.15);border-radius:6px;padding:2px 8px">0001 — serial</span>
              </div>
              <div style="font-size:10.5px;opacity:.75;margin-top:9px">Serial restarts at 0001 automatically every month.</div>
            </div>
            <div style="flex:1.6;min-width:330px;display:flex;gap:10px 12px;flex-wrap:wrap;align-items:flex-end;align-content:flex-end">
              <div class="fld" style="margin:0"><label class="lbl" for="cpnType">Discount type</label><select class="select" id="cpnType" style="height:34px;width:120px"><option value="flat">Flat ₹</option><option value="percent">Percent %</option></select></div>
              <div class="fld" style="margin:0"><label class="lbl" for="cpnValue">Value <span class="req">*</span></label><input class="input mono" id="cpnValue" type="number" min="1" style="height:34px;width:110px" placeholder="e.g. 500"></div>
              <div class="fld" style="margin:0"><label class="lbl" for="cpnValidTo">Valid until <span class="ab">optional</span></label><input class="input" type="date" id="cpnValidTo" style="height:34px;width:150px"></div>
              <div class="fld" style="margin:0"><label class="lbl" for="cpnMaxUses">Max uses <span class="ab">optional</span></label><input class="input mono" id="cpnMaxUses" type="number" min="1" style="height:34px;width:100px" placeholder="∞"></div>
              <button class="btn bp" style="height:36px" onclick="window._cpnGen()">⚡ Generate coupon</button>
            </div>
          </div>
          <div class="tscroll"><table class="tbl" style="min-width:840px"><thead><tr><th>Code</th><th>Discount</th><th>Validity</th><th>Usage</th><th>Status</th><th>Actions</th></tr></thead><tbody id="cpnBody"><tr><td colspan="6" style="text-align:center;color:var(--faint);padding:14px">Loading…</td></tr></tbody></table></div>
          <p style="font-size:11.5px;color:var(--faint);margin-top:10px">Generated coupons work instantly on the Collect Payment page, the Blood-test intake, and the Coach payment &amp; EMI coupon fields — each apply is validated live against status, validity window and usage cap. No code change or redeploy needed.</p>
        </div></div>
    </div>

    <div class="st-p" data-p="st-fld" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-cog"></use></svg> Screen field configuration — add/remove/reorder fields per tab</div>
        <div class="sec-bd">
          <div class="g3">
            <div class="fld"><label class="lbl" for="fldScreen">Select screen</label><select  class="select" id="fldScreen"><option selected>Screening</option><option>Health advisor · Basic info</option><option>Health advisor · Sugar profile</option><option>Health coach · Assessment</option><option>Blood test · Worklist</option><option>Physio · Session record</option><option>Reception · Check-in</option></select></div>
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

    <!-- ADVISOR TARGETS MASTER — dynamic CRUD on advisor_targets. This is the single source of truth
         for the Health Advisor dashboard's "Targets & performance" and "Pipeline performance" cards:
         nothing on that screen is hardcoded any more, so changing a number here moves the dashboard
         with no code change or redeploy. -->
    <div class="st-p" data-p="st-tgt" style="display:none">
      <!-- APPOINTMENT SLOT DATE RANGE — one setting, both slot boards (Health Advisor's
           "Appointment - slot board" and Reception's "Service & booking"). Applied as the date
           input's own min/max, so out-of-range days are greyed out inside the calendar itself
           rather than refused after the click. Hidden entirely from roles that can change neither
           number; the Previous-days box is shown but LOCKED for a Manager, so they can see the
           window they are working in and know it is a Super Admin decision. -->
      <div class="sec" id="slotRangeCard" style="margin-bottom:12px;display:none">
        <div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-cal"></use></svg> Appointment slot date range</div>
        <div class="sec-bd">
          <p style="font-size:12px;color:var(--muted);margin:2px 2px 12px;line-height:1.6">
            Controls which dates can be picked on the appointment slot boards, on <b>both</b> the Health Advisor and Reception pages.
            <b>Upcoming days</b> counts from today (4 = today plus the next 3). <b>Previous days</b> is how far back a finished day stays reachable.
          </p>
          <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end">
            <div class="fld" style="margin:0"><label class="lbl" for="slotRangeFuture">Upcoming days <span class="ab">Admin / Manager</span></label>
              <input class="input mono" type="number" min="1" max="365" id="slotRangeFuture" style="height:36px;max-width:120px"></div>
            <div class="fld" style="margin:0"><label class="lbl" for="slotRangePast">Previous days <span class="ab">Super Admin</span></label>
              <input class="input mono" type="number" min="0" max="365" id="slotRangePast" style="height:36px;max-width:120px"></div>
            <button class="btn bsm bp" style="height:36px" onclick="window._slotRangeSave()">Save date range</button>
            <span id="slotRangeNote" style="font-size:11.5px;color:var(--muted)"></span>
          </div>
        </div>
      </div>
      <!-- ADVISOR LEADS COUNT SETTING — the daily auto-assignment allocation. Sits ABOVE the targets
           master because it is the thing an admin touches daily, where targets are set once a month.
           Rows come from the live assignees master, so a new advisor appears here the moment they are
           added. A blank or 0 target means "not in the rotation": listing somebody is never enough to
           send them leads, which is what makes it safe to list every lead-working role. -->
      <div class="sec" style="margin-bottom:12px"><div class="sec-hd" style="cursor:default;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg class="icon"><use href="#i-split"></use></svg> Advisor Leads Count Setting — daily auto-assignment</span>
        <span style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <span id="alcInfo" style="font-size:11.5px;color:var(--muted)"></span>
          <button class="btn bsm" onclick="window._alcPreview()">Preview split</button>
          <button class="btn bsm bp" onclick="window._alcRunNow()">⚡ Assign pooled leads now</button>
          <button class="btn bsm bp" onclick="window._alcSave()">Save allocation</button></span></div>
        <div class="sec-bd">
          <p style="font-size:12px;color:var(--muted);margin:6px 2px 12px">Set how many leads each advisor should receive <b>per day</b>. As leads arrive through the day the system tops each advisor up to their number — it does not wait for the whole day's leads to exist. Leave a target at <b>0</b> to keep an advisor out of auto-assignment. The count resets every day on its own. <b>Admin manual assignment is unaffected</b> — you can still assign any lead by hand from Assign &amp; approve, and anything you assign by hand counts towards that advisor's day.</p>
          <div class="tscroll"><table class="tbl" style="min-width:720px"><thead><tr><th scope="col">Advisor</th><th scope="col">Role</th><th scope="col" style="text-align:right">Daily lead target</th><th scope="col" style="text-align:right">Assigned today</th><th scope="col" style="text-align:right">Remaining today</th></tr></thead>
            <tbody id="alcBody"><tr><td colspan="5" style="text-align:center;color:var(--faint);padding:14px">Loading advisors…</td></tr></tbody>
            <tfoot id="alcFoot"></tfoot></table></div>
          <!-- AUTO-ASSIGNMENT SWITCH — Super Admin only. Hidden for everyone else, and the server
               enforces the same rule on the write, so hiding it is presentation rather than the
               actual control. Per-DAY, so "off today" and "on tomorrow" are separate decisions. -->
          <div id="alcSwitch" style="display:none;margin-top:12px"></div>
          <div id="alcPlan" style="margin-top:10px"></div>
        </div></div>

      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-chart"></use></svg> Advisor Targets Master — drives the Health Advisor dashboard</div>
        <div class="sec-bd">
          <p style="font-size:12px;color:var(--muted);margin:6px 2px 12px">One row per advisor per month. The Health Advisor dashboard reads these live — Revenue, Enrollment and CRM usage fill the <b>Targets &amp; performance</b> cards; the five expected counts fill <b>Pipeline performance</b>. Leave an expected value blank to have it derived from that advisor's own book size instead of a fixed number.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:12px">
            <div class="fld" style="margin:0"><label class="lbl" for="tgtAdvisor">Advisor</label><select class="select" id="tgtAdvisor" style="height:34px;width:190px"></select></div>
            <div class="fld" style="margin:0"><label class="lbl" for="tgtPeriod">Period (month)</label><input class="input mono" id="tgtPeriod" type="month" style="height:34px;width:150px"></div>
            <div class="fld" style="margin:0"><label class="lbl" for="tgtRevenue">Revenue target (₹)</label><input class="input mono" id="tgtRevenue" type="number" min="0" placeholder="1800000" style="height:34px;width:150px"></div>
            <div class="fld" style="margin:0"><label class="lbl" for="tgtEnroll">Enrollment target</label><input class="input mono" id="tgtEnroll" type="number" min="0" placeholder="90" style="height:34px;width:140px"></div>
            <div class="fld" style="margin:0"><label class="lbl" for="tgtCrm">CRM usage target (hours/day)</label><input class="input mono" id="tgtCrm" type="number" min="0" step="0.5" placeholder="8" style="height:34px;width:170px"></div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:12px">
            <div class="fld" style="margin:0"><label class="lbl" for="tgtExpDirect">Expected · Appt Direct</label><input class="input mono" id="tgtExpDirect" type="number" min="0" placeholder="auto" style="height:34px;width:150px"></div>
            <div class="fld" style="margin:0"><label class="lbl" for="tgtExpZoom">Expected · Appt Zoom</label><input class="input mono" id="tgtExpZoom" type="number" min="0" placeholder="auto" style="height:34px;width:150px"></div>
            <div class="fld" style="margin:0"><label class="lbl" for="tgtExpConfirmed">Expected · Confirmed</label><input class="input mono" id="tgtExpConfirmed" type="number" min="0" placeholder="auto" style="height:34px;width:150px"></div>
            <div class="fld" style="margin:0"><label class="lbl" for="tgtExpVisited">Expected · Visited</label><input class="input mono" id="tgtExpVisited" type="number" min="0" placeholder="auto" style="height:34px;width:150px"></div>
            <div class="fld" style="margin:0"><label class="lbl" for="tgtExpEnrolled">Expected · Enrolled</label><input class="input mono" id="tgtExpEnrolled" type="number" min="0" placeholder="auto" style="height:34px;width:150px"></div>
            <button class="btn bp" id="tgtAddBtn" onclick="window._tgtSave()" style="height:34px">+ Save target</button>
            <button class="btn bsm" id="tgtCancelBtn" onclick="window._tgtCancel()" style="height:34px;display:none">Cancel</button>
          </div>
          <div class="tscroll"><table class="tbl" style="min-width:980px"><thead><tr><th scope="col">Advisor</th><th scope="col">Period</th><th scope="col">Revenue</th><th scope="col">Enrollment</th><th scope="col">CRM / day</th><th scope="col">Expected (D/Z/C/V/E)</th><th scope="col">Actions</th></tr></thead><tbody id="tgtBody"></tbody></table></div>
          <p style="font-size:11.5px;color:var(--faint);margin-top:10px">Targets do not roll over — each month is set explicitly, so a missed month never silently inflates the next one. An advisor with no row for the current month falls back to the defaults shown on the dashboard.</p>
        </div></div>
    </div>

    <div class="st-p" data-p="st-usr" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"></use></svg> Users &amp; Assignees — one record per person: login, role, branch and telephony</div>
        <div class="sec-bd">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px">
            <button class="btn bp" onclick="window._usrOpenModal()" style="height:36px"><svg class="icon"><use href="#i-user"></use></svg> + Add User</button>
            <input class="input" id="usrSearch" placeholder="Search name / email / role…" oninput="window._usrSearch()" style="height:36px;font-size:12.5px;max-width:280px;margin-left:auto">
          </div>
          <div class="tscroll stick1"><table class="tbl" style="min-width:1280px"><thead><tr id="usrHead"><th>Email</th><th>Name</th><th>Role</th><th>Service</th><th>Branch</th><th>Phone</th><th>DID</th><th>Ext</th><th>Active leads</th><th>Status</th><th>Actions</th></tr></thead><tbody id="usrBody"></tbody></table></div>
          <p style="font-size:11.5px;color:var(--faint);margin-top:10px">Users can log in with their email; first-time users set a password on the login screen. Lead-receiving roles (Advisor, Senior Advisor, Telecaller, Manager, Health Coach) also appear in the “Assign to” dropdown and Advisor load. Deactivated people keep their history but receive no new leads. DID + extension make the Call button dial from that person's own line.</p>
        </div></div>
    </div>

    <div class="st-p" data-p="st-org" style="display:none">
      <div class="sec" style="margin-bottom:14px"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-split"></use></svg> Services — the lines your clinic runs</div>
        <div class="sec-bd">
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:12px">
            <div class="fld" style="margin:0"><label class="lbl" for="svcNew">New service</label><input class="input" id="svcNew" placeholder="e.g. Nutrition" style="height:34px;width:220px"></div>
            <button class="btn bp" onclick="window._svcAdd()" style="height:34px">+ Add service</button>
          </div>
          <div class="tscroll"><table class="tbl" style="min-width:640px"><thead><tr><th>Service</th><th>Roles</th><th>Status</th><th>Actions</th></tr></thead><tbody id="svcBody"></tbody></table></div>
          <p style="font-size:11.5px;color:var(--faint);margin-top:10px">A deactivated service stays on existing user records but is no longer offered when adding someone.</p>
        </div></div>

      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"></use></svg> Roles — what a person can do, and where they appear</div>
        <div class="sec-bd">
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:6px">
            <div class="fld" style="margin:0"><label class="lbl" for="roleNew">New role</label><input class="input" id="roleNew" placeholder="e.g. Nutritionist" style="height:34px;width:190px"></div>
            <div class="fld" style="margin:0"><label class="lbl" for="roleNewSvc">Service</label><select class="select" id="roleNewSvc" style="height:34px;width:170px"></select></div>
            <div class="fld" style="margin:0"><label class="lbl" for="roleNewCopy">Start from <span class="ab">COPIES SCREENS</span></label><select class="select" id="roleNewCopy" style="height:34px;width:180px"></select></div>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);height:34px;white-space:nowrap"><input type="checkbox" id="roleNewAsg" style="accent-color:var(--brand);width:15px;height:15px"> Receives leads</label>
            <button class="btn bp" onclick="window._roleAdd()" style="height:34px">+ Add role</button>
          </div>
          <p style="font-size:11.5px;color:var(--faint);margin:0 0 14px">“Start from” copies that role’s screen access to the new one — a role created with no screens would sign in to an empty app. Adjust afterwards in Roles &amp; RBAC.</p>
          <div class="tscroll stick1"><table class="tbl" style="min-width:900px"><thead><tr><th>Role</th><th>Services</th><th>Receives leads</th><th>Screens</th><th>People</th><th>Status</th><th>Actions</th></tr></thead><tbody id="roleBody"></tbody></table></div>
        </div></div>
    </div>

    <!-- USER LOGIN & ACTIVITY (PRD) — Settings → Login Activity, per §19. app_users stays the
         single source of truth for people and roles; this only visualises their sessions. The tab
         itself is hidden for roles that may not see it (§2/§20) and the API refuses them too, so
         hiding is convenience, not the control. -->
    <div class="st-p" data-p="st-act" style="display:none">
      <div class="act-hd">
        <div>
          <h2 class="act-t">User Activity &amp; Login Monitor <span class="act-live" id="actLive" title="Refreshing automatically">Live</span></h2>
          <p class="act-sub">Monitor user login sessions, active users and daily access activity.</p>
        </div>
        <div class="act-ctl">
          <div class="pills" id="actRange">
            <button class="pill on" onclick="window._actRange('today')">Today</button>
            <button class="pill" onclick="window._actRange('yday')">Yesterday</button>
            <button class="pill" onclick="window._actRange('week')">This Week</button>
            <button class="pill" onclick="window._actRange('month')">This Month</button>
            <button class="pill" onclick="window._actRange('custom')">Custom</button>
          </div>
          <span id="actCustom" style="display:none;gap:6px;align-items:center">
            <input class="input" type="date" id="actFrom" style="height:32px;font-size:12px;width:145px" onchange="window._actLoad()">
            <span style="color:var(--faint)">&rarr;</span>
            <input class="input" type="date" id="actTo" style="height:32px;font-size:12px;width:145px" onchange="window._actLoad()">
          </span>
          <button class="btn bsm" onclick="window._actLoad()" title="Refresh now">&#8635; Refresh</button>
          <button class="btn bsm" data-exp onclick="window._actExport()" title="Export the rows below, exactly as filtered">&#8615; Export</button>
        </div>
      </div>
      <div class="act-updated" id="actUpdated"></div>

      <div class="act-kpis" id="actKpis"></div>

      <div class="sec" style="margin-bottom:14px"><div class="sec-hd" style="cursor:default">
        <svg class="icon"><use href="#i-user"></use></svg> Currently Online <span class="chipb ok" id="actOnlineCount" style="margin-left:6px">0</span></div>
        <div class="sec-bd"><div class="act-online" id="actOnline"></div></div></div>

      <div class="sec" style="margin-bottom:14px"><div class="sec-hd" style="cursor:default;display:flex;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <span><svg class="icon"><use href="#i-clock"></use></svg> Login Activity</span>
        <span class="act-filters">
          <input class="input" id="actSearch" placeholder="Search name, email or role…" oninput="window._actSearch(this.value)" style="height:30px;max-width:230px;font-size:12px">
          <select class="select" id="actFRole" onchange="window._actRender()" style="height:30px;font-size:12px"></select>
          <select class="select" id="actFUser" onchange="window._actRender()" style="height:30px;font-size:12px"></select>
          <select class="select" id="actFStatus" onchange="window._actRender()" style="height:30px;font-size:12px">
            <option value="all">All statuses</option><option value="online">Online</option>
            <option value="out">Logged Out</option><option value="expired">Session Expired</option>
            <option value="never">Never Logged In</option><option value="inactive">Inactive</option>
          </select>
        </span></div>
        <div class="sec-bd" id="actTable"></div></div>

      <div class="sec" style="margin-bottom:14px"><div class="sec-hd" onclick="togSec(this)">
        <svg class="icon"><use href="#i-cal"></use></svg> Login Activity Calendar <span class="arr">&#9662;</span></div>
        <div class="sec-bd" id="actCal"></div></div>

      <div class="sec"><div class="sec-hd" onclick="togSec(this)">
        <svg class="icon"><use href="#i-chart"></use></svg> Login Analytics <span class="arr">&#9662;</span></div>
        <div class="sec-bd" id="actCharts"></div></div>
    </div>

    <div class="st-p" data-p="st-rbac" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-user"></use></svg> Roles &amp; permissions — editable module access matrix</div>
        <div class="sec-bd" id="rbacMatrixBody"><div class="ldwrap" role="status" aria-live="polite"><span class="ldcap">Loading RBAC matrix…</span><div class="skel w30"></div><div class="skel w90"></div><div class="skel w75"></div><div class="skel w90"></div><div class="skel w55"></div></div></div></div>
    </div>

    <div class="st-p" data-p="st-drop" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-doc"></use></svg> Dropdown masters — admin-managed, not hard-coded</div>
        <div class="sec-bd"><div class="g3">
          <div class="fld"><label class="lbl">Eligibility exclusions</label><textarea class="area">Cancer, Brain Tumor, Recent Heart Surgery, Organ Transplant, Pregnancy, Age Above 75, Already Paid, Other Language, Others</textarea></div>
          <div class="fld"><label class="lbl">Occupations</label><textarea class="area">Private Job, Govt Job, Business, Self-employed, Homemaker, Retired, Student, Daily Wage, Others</textarea></div>
          <div class="fld"><label class="lbl">Call statuses</label><textarea class="area">New, DND, RNR, Line Busy, Call Back, Already Paid, Follow Up, Switched Off, Not Registered, No Sugar, Out of Service, Wrong Number, Appointment Fixed – Direct, Appointment Fixed – Home, Visited, Enrolled, Not Reachable, Not Interested, Disconnect, Invalid</textarea></div>
          <div class="fld"><label class="lbl">Languages</label><textarea class="area">Tamil, Telugu, Kannada, Malayalam, Hindi, Marathi, Bengali, Gujarati, Punjabi, Urdu</textarea></div>
          <div class="fld"><label class="lbl">Locations</label><textarea class="area">Poonamalle, Porur, Maduravoyal, Ambattur, Avadi, Tambaram, Nagapattinam</textarea></div>
          <div class="fld"><label class="lbl">Physio conditions</label><textarea class="area">Frozen shoulder, Knee rehab, Lower back pain, Cervical spondylosis, Sports injury, Post-surgical, Sciatica, Others</textarea></div>
        </div><button class="btn bp bsm" style="margin-top:12px" onclick="toast('Masters updated across all screens')">Save masters</button></div></div>
    </div>

    <div class="st-p" data-p="st-int" style="display:none">
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-bolt"></use></svg> Integrations &amp; audit</div>
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
      <div class="sec"><div class="sec-hd" style="cursor:default"><svg class="icon"><use href="#i-msg"></use></svg> Automated messages — WhatsApp / SMS triggers</div>
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

  <!-- USER CREATE / EDIT MODAL -->
  <!-- Health assessment gate. Reuses the existing .umodal styling (no new CSS) and lives OUTSIDE
       #s-coach so it can never enter the coach panel's positional field capture. Contains only
       buttons — no inputs — for the same reason. -->
  <!-- Edit-request reason. Replaces window.prompt(), which rendered as a raw "localhost says"
       browser dialog — indistinguishable from a system error. Outside #s-coach, so its textarea can
       never enter the coach panel's positional field capture. -->
  <div class="umodal" id="haEditModal" role="dialog" aria-modal="true" aria-labelledby="haEditTitle">
    <div class="umodal-card" style="width:min(520px,100%)">
      <div class="umodal-hd">
        <h2 id="haEditTitle">Request an assessment edit</h2>
        <button class="umodal-x" aria-label="Close" onclick="window._haEditModalClose()"><svg class="icon" style="width:15px;height:15px"><use href="#i-x"></use></svg></button>
      </div>
      <div class="umodal-bd">
        <p style="font-size:12.5px;color:var(--muted);margin:0 0 10px;line-height:1.55">
          This assessment is saved and locked. Tell the BDM what needs correcting — they see this reason on the request.
        </p>
        <div class="fld" style="margin:0"><label class="lbl" for="haEditReason">Reason <span class="req">*</span></label>
          <textarea class="area" id="haEditReason" rows="3" placeholder="e.g. BP was entered as 120/80 but the reading was 140/90"></textarea></div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
          <button class="btn" onclick="window._haEditModalClose()">Cancel</button>
          <button class="btn bp" id="haEditSendBtn" onclick="window._haEditSend()">Send to BDM</button>
        </div>
      </div>
    </div>
  </div>

  <div class="umodal" id="haGateModal" role="dialog" aria-modal="true" aria-labelledby="haGateTitle">
    <div class="umodal-card" style="width:min(460px,100%)">
      <div class="umodal-hd">
        <h2 id="haGateTitle">Health assessment</h2>
        <button class="umodal-x" aria-label="Close" onclick="window._haGateClose()"><svg class="icon" style="width:15px;height:15px"><use href="#i-x"></use></svg></button>
      </div>
      <div class="umodal-bd" style="text-align:center;padding:26px 22px">
        <div style="font-size:44px;line-height:1">🎙️</div>
        <div style="font-family:var(--disp);font-size:16px;margin-top:10px">Start the office-visit recording</div>
        <p style="font-size:12.5px;color:var(--muted);margin:8px 0 0;line-height:1.55">
          Basic health info, Lifestyle &amp; diet and Symptoms reported open once recording begins.<br>
          The recording stops and saves automatically when you click <b>Save health record</b>.
        </p>
        <button class="btn bp" id="haGateStartBtn" style="height:44px;padding:0 26px;margin-top:18px" onclick="window._haGateStart()">● Start Recording</button>
      </div>
    </div>
  </div>

  <!-- Physiotherapy consultation gate. Same .umodal styling and the same shape as the Health Coach's
       gate above, with the one addition the physio workflow needs: the patient's position in their
       course, because a physio consultation is session N of a plan rather than a one-off visit. -->
  <div class="umodal" id="phGateModal" role="dialog" aria-modal="true" aria-labelledby="phGateTitle">
    <div class="umodal-card" style="width:min(460px,100%)">
      <div class="umodal-hd">
        <h2 id="phGateTitle">Physiotherapy consultation</h2>
        <button class="umodal-x" aria-label="Close" onclick="window._phGateClose()"><svg class="icon" style="width:15px;height:15px"><use href="#i-x"></use></svg></button>
      </div>
      <div class="umodal-bd" style="text-align:center;padding:26px 22px">
        <div style="font-size:44px;line-height:1">🎙️</div>
        <div style="font-family:var(--disp);font-size:16px;margin-top:10px">Start the Physiotherapy Consultation Recording Session</div>
        <div id="phGateWho" style="font-size:13px;font-weight:700;color:var(--ink);margin-top:8px"></div>
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px;flex-wrap:wrap">
          <span class="chipb info" id="phGateProgress" style="font-size:12px">Session —</span>
          <span class="chipb neu" id="phGateTherapist" style="font-size:12px"></span>
        </div>
        <p style="font-size:12.5px;color:var(--muted);margin:10px 0 0;line-height:1.55">
          The patient assessment opens once recording begins.<br>
          The recording stops and saves automatically when you click <b>Complete consultation</b>.
        </p>
        <button class="btn bp" id="phGateStartBtn" style="height:44px;padding:0 26px;margin-top:18px" onclick="window._phGateStart()">● Start Recording</button>
      </div>
    </div>
  </div>

  <div class="umodal" id="usrModal" role="dialog" aria-modal="true" aria-labelledby="usrModalTitle">
    <div class="umodal-card">
      <div class="umodal-hd">
        <h2 id="usrModalTitle">Add User</h2>
        <button class="umodal-x" aria-label="Close" onclick="window._usrCloseModal()"><svg class="icon" style="width:15px;height:15px"><use href="#i-x"></use></svg></button>
      </div>
      <div class="umodal-bd">
        <div class="umodal-sec">Identity</div>
        <div class="umodal-grid">
          <div class="fld" style="margin:0"><label class="lbl" for="usrName">Name <span class="req">*</span></label><input class="input" id="usrName" placeholder="e.g. Priya K." autocomplete="off"></div>
          <div class="fld" style="margin:0"><label class="lbl" for="usrEmail">Email <span class="req">*</span></label><input class="input" id="usrEmail" type="email" placeholder="user@clinic.com" autocomplete="off"></div>
        </div>

        <div class="umodal-sec">Service &amp; role</div>
        <div class="umodal-grid">
          <div class="fld" style="margin:0"><label class="lbl" for="usrService">Service</label><select class="select" id="usrService" onchange="window._usrServiceChange()"></select></div>
          <div class="fld" style="margin:0"><label class="lbl" for="usrRole">Role</label><select class="select" id="usrRole" onchange="window._usrRoleChange()"></select></div>
        </div>
        <p id="usrRoleHint" style="font-size:11.5px;color:var(--faint);margin:8px 0 0;display:none"></p>
        <!-- Extra roles the person also performs. The select above stays the PRIMARY role (it
             drives the assignee mirror and the session token); these add permissions on top. -->
        <div class="fld" style="margin:10px 0 0">
          <label class="lbl" for="usrRolesExtra">Also works as <span class="ab">MULTI</span></label>
          <div class="chips" id="usrRolesExtra" style="margin-top:2px"></div>
          <p style="font-size:11.5px;color:var(--muted);margin:6px 0 0">Tick every additional role this person performs — they get the combined screen access, and appear in each role&rsquo;s assignment lists.</p>
        </div>

        <div class="umodal-sec" id="usrPostingSec">Posting</div>
        <div class="umodal-grid">
          <div class="fld" style="margin:0" id="usrBranchFld"><label class="lbl" for="usrBranch">Branch</label><select class="select" id="usrBranch"><option>Chennai</option><option>Coimbatore</option><option>Madurai</option></select></div>
          <div class="fld" style="margin:0" id="usrPhoneFld"><label class="lbl" for="usrPhone">Phone</label><input class="input mono" id="usrPhone" placeholder="10 digits" type="tel" inputmode="numeric" maxlength="10" oninput="window._digitsOnly(this)"></div>
        </div>

        <div class="umodal-sec">Telephony <span style="font-weight:500;color:var(--faint);text-transform:none;letter-spacing:0">— leave blank to use the shared line</span></div>
        <div class="umodal-grid">
          <div class="fld" style="margin:0"><label class="lbl" for="usrDid">Tata DID <span class="nb">CALLER ID</span></label><input class="input mono" id="usrDid" placeholder="e.g. 919240254219" inputmode="numeric" maxlength="15" oninput="window._digitsOnly(this)" title="Caller ID shown to the customer. Digits only — a leading + makes Smartflo reject the call."></div>
          <div class="fld" style="margin:0"><label class="lbl" for="usrExt">Extension</label><input class="input mono" id="usrExt" placeholder="e.g. 0606089050073" inputmode="numeric" maxlength="20" oninput="window._digitsOnly(this)" title="Agent extension that rings first when this person clicks Call."></div>
        </div>
      </div>
      <div class="umodal-ft">
        <span id="usrModalErr" class="umodal-err"></span>
        <button class="btn bsm" onclick="window._usrCloseModal()">Cancel</button>
        <button class="btn bp" id="usrSaveBtn" onclick="window._usrCreate()">Create user</button>
      </div>
    </div>
  </div>
  `;
}
