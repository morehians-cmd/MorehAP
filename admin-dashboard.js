/* Moreh Academy Admission Portal — administrator dashboard (approved mockup layout).
   Loaded after public-homepage.js, so this is the single active dashboard renderer.

   Data notes:
   - The portal's Enrollment Status values are Enrolled / Not Enrolled / Temporary /
     Cancelled / Transferred Out. There is no "Approved" or "Rejected" status, so the
     KPI cards and the donut use the real status names and real counts.
   - The caption under each KPI figure is a real percentage of the active school year's
     records. Invented year-over-year deltas are never shown. */
(function () {
  var CDN = 'https://cdn.jsdelivr.net/gh/morehians-cmd/MorehAP@main/';
  var CAMPUS = CDN + 'Moreh%20College%20Under%20Blue%20Skies%20(2).png';

  function svg(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  var IC = {
    people: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    check: svg('<circle cx="12" cy="12" r="9"/><path d="M8.4 12.4l2.6 2.6 4.6-5.2"/>'),
    cap: svg('<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12.6V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.4"/>'),
    bars: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    pie: svg('<path d="M21.2 15.9A10 10 0 1 1 8.1 2.8"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>'),
    alert: svg('<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
    bolt: svg('<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>'),
    userPlus: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>'),
    users: svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>')
  };

  var nf = function (n) { return Number(n || 0).toLocaleString('en-US'); };
  var pc = function (n, t) { return t ? Math.round((n || 0) / t * 1000) / 10 + '%' : '0%'; };
  var escv = function (v) { return esc(v == null ? '' : v); };

  function statusList(st) {
    return [
      { label: 'Enrolled', value: Number(st.enrolled || 0), color: '#2563eb' },
      { label: 'Not Yet Enrolled', value: Number(st.pending || 0), color: '#f7941d' },
      { label: 'Temporary', value: Number(st.temp || 0), color: '#7c3aed' },
      { label: 'Cancelled', value: Number(st.cancelled || 0), color: '#ef4444' },
      { label: 'Transferred Out', value: Number(st.transferred || 0), color: '#94a3b8' }
    ];
  }

  function kpiCard(tone, icon, label, value, note, action, filter) {
    return '<button type="button" class="ma3-kpi ' + tone + '" data-act="' + action + '" data-v="' + escv(filter) + '">' +
      '<span class="ma3-kpi-ic">' + icon + '</span>' +
      '<span><small>' + escv(label) + '</small><strong>' + nf(value) + '</strong><em>' + escv(note) + '</em></span>' +
      '<span class="ma3-kpi-go" aria-hidden="true">&#8250;</span></button>';
  }

  function shortGrade(g) {
    return String(g).replace(/^Grade\s+/, 'G').replace(/^Kinder\s+/, 'K').replace(/^Nursery$/, 'Nurs');
  }

  function chartHTML(rows) {
    if (!rows.length) return '<div class="ma3-empty">No grade-level records for this school year yet.</div>';
    var max = Math.max.apply(null, rows.map(function (r) { return r.value; }).concat([1]));
    var step = Math.max(1, Math.ceil(max / 4 / 10) * 10);
    var top = Math.ceil(max / step) * step;
    var ticks = [1, 0.75, 0.5, 0.25, 0].map(function (f) { return Math.round(top * f); });
    var bars = rows.map(function (r, i) {
      var h = Math.max(2, Math.round(r.value / top * 100));
      var col = i % 2 ? 'linear-gradient(180deg,#ffb160,#f1872d)' : 'linear-gradient(180deg,#4b91f5,#1d54b8)';
      return '<div class="ma3-bar" title="' + escv(r.label) + ': ' + nf(r.value) + '"><b>' + nf(r.value) + '</b>' +
        '<i style="height:' + h + '%;background:' + col + '"></i><small>' + escv(shortGrade(r.label)) + '</small></div>';
    }).join('');
    return '<div class="ma3-chart"><div class="ma3-yaxis">' + ticks.map(function (t) { return '<span>' + nf(t) + '</span>'; }).join('') + '</div>' +
      '<div class="ma3-plot"><div class="ma3-grid"></div><div class="ma3-bars">' + bars + '</div></div></div>';
  }

  function donutHTML(list, total) {
    var sum = list.reduce(function (a, x) { return a + x.value; }, 0);
    var acc = 0, parts = [];
    list.forEach(function (x) {
      if (!x.value) return;
      var from = acc / sum * 360, to = (acc + x.value) / sum * 360;
      acc += x.value;
      parts.push(x.color + ' ' + from.toFixed(2) + 'deg ' + to.toFixed(2) + 'deg');
    });
    var bg = parts.length ? 'conic-gradient(' + parts.join(',') + ')' : '#e8eef7';
    var legend = list.map(function (x) {
      return '<div><i style="background:' + x.color + '"></i><span><b>' + escv(x.label) + '</b>' +
        '<span>' + nf(x.value) + ' &middot; ' + pc(x.value, sum) + '</span></span></div>';
    }).join('');
    return '<div class="ma3-status"><div class="ma3-donut" style="background:' + bg + '"><div><b>' + nf(total) + '</b><small>Total</small></div></div>' +
      '<div class="ma3-legend">' + legend + '</div></div>';
  }

  function relTime(x) {
    var d = String(x.date || '').slice(0, 10), t = String(x.time || '');
    var when = null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(d) && /^\d{1,2}:\d{2}$/.test(t)) when = new Date(d + 'T' + t + ':00');
    if (!when || isNaN(when.getTime())) return escv(d || t || '');
    var mins = Math.round((Date.now() - when.getTime()) / 60000);
    if (mins < 0) return escv(t);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    if (mins < 1440) return Math.round(mins / 60) + 'h ago';
    if (mins < 2880) return 'yesterday';
    return when.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function renderDashboard(r) {
    var d = (r && r.data) || {}, st = d.stats || {};
    var total = Number(st.total || 0);
    var sy = (S.cfg && S.cfg.sy) || '';
    var full = (typeof FULL === 'function') && FULL();
    var sys = (typeof SYS === 'function') && SYS();

    var greeting = (typeof greet === 'function' ? greet() : 'Welcome');
    var rawName = (S.user && S.user.FullName) || 'Administrator';
    var name = (typeof tc === 'function' ? tc(rawName) : rawName);

    var dt = $('maTopDate');
    if (dt) {
      dt.innerHTML = ((typeof I === 'object' && I.cal) ? I.cal : '') + '<b>' +
        new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) + '</b>';
      var tr = document.querySelector('#main>.top .tr'), chip = tr && tr.querySelector('.uchip');
      if (tr && chip && dt.parentNode !== tr) tr.insertBefore(dt, chip);
    }

    var grades = (Array.isArray(d.gradeLevels) ? d.gradeLevels : []).map(function (x) {
      return { label: String(x[0] || ''), value: Number(x[1]) || 0 };
    });

    var cards =
      kpiCard('blue', IC.people, 'Total Applications', total, 'School Year ' + sy, 'dflt', 'All') +
      kpiCard('orange', IC.clock, 'Not Yet Enrolled', st.pending, pc(st.pending, total) + ' of applicants', 'dflt', 'Not Enrolled') +
      kpiCard('green', IC.check, 'Enrolled Students', st.enrolled, pc(st.enrolled, total) + ' of applicants', 'dflt', 'Enrolled') +
      kpiCard('purple', IC.cap, 'Temporary Enrollment', st.temp, pc(st.temp, total) + ' of applicants', 'dflt', 'Temporary');

    var quick = [
      '<button type="button" data-act="quick">' + IC.userPlus + '<span>Add Applicant</span></button>',
      full ? '<button type="button" data-act="nav" data-v="rep">' + IC.bars + '<span>View Reports</span></button>' : '',
      '<button type="button" data-act="dflt" data-v="Enrolled">' + IC.users + '<span>Manage Students</span></button>',
      sys ? '<button type="button" data-act="nav" data-v="set">' + IC.gear + '<span>Settings</span></button>' : ''
    ].join('');

    $('view').innerHTML =
      '<div class="ma3-dash">' +
        '<section class="ma3-hero"><div>' +
          '<h2>' + escv(greeting) + ', ' + escv(name) + '!</h2>' +
          '<p>Welcome to the Moreh Academy Admission Portal.</p>' +
          '<em>Together, we build a brighter future.</em>' +
        '</div></section>' +
        '<section class="ma3-kpis">' + cards + '</section>' +
        '<section class="ma3-row">' +
          '<div class="ma3-panel"><div class="ma3-head"><h3>' + IC.bars + 'Enrollment by Grade Level</h3><small>SY ' + escv(sy) + '</small></div>' +
            chartHTML(grades) + '</div>' +
          '<div class="ma3-panel"><div class="ma3-head"><h3>' + IC.pie + 'Application Status</h3></div>' +
            donutHTML(statusList(st), total) + '</div>' +
          '<figure class="ma3-campus"><img src="' + CAMPUS + '" alt="Moreh College campus under a blue sky">' +
            '<figcaption><b>Moreh Academy</b><span>A Community of Excellence</span></figcaption></figure>' +
        '</section>' +
        '<section class="ma3-row2">' +
          '<div class="ma3-panel"><div class="ma3-head"><h3>' + IC.alert + 'Needs Attention</h3></div>' +
            '<div id="ma3-attn"></div></div>' +
          '<div class="ma3-panel"><div class="ma3-head"><h3>' + IC.clock + 'Recent Activity</h3>' +
            '<a href="javascript:void(0)" data-act="auditall">View All &#8594;</a></div>' +
            '<div id="ma3-act"><div class="ma3-empty">Loading activity&hellip;</div></div></div>' +
          '<div class="ma3-panel ma3-qa-wrap"><div class="ma3-head"><h3>' + IC.bolt + 'Quick Actions</h3></div>' +
            '<div class="ma3-qa">' + quick + '</div></div>' +
        '</section>' +
      '</div>';

    loadPanels(st, full);
  }

  function loadPanels(st, full) {
    // Needs Attention: pending comes from the dashboard payload; the rest arrive separately.
    var attn = { pending: Number(st.pending || 0), req: null, holds: null, sch: null };
    function paint() {
      var box = $('ma3-attn');
      if (!box) return;
      var val = function (n) { return n === null ? '&ndash;' : nf(n); };
      box.innerHTML =
        '<button type="button" class="ma3-attn-row" data-act="dflt" data-v="Not Enrolled"><span class="ma3-pill a">' + val(attn.pending) + '</span><span class="lbl">Pending Applications</span><span class="go">&#8250;</span></button>' +
        '<button type="button" class="ma3-attn-row" data-act="nav" data-v="adm"><span class="ma3-pill b">' + val(attn.req) + '</span><span class="lbl">Incomplete Requirements</span><span class="go">&#8250;</span></button>' +
        '<button type="button" class="ma3-attn-row" data-act="nav" data-v="fl"><span class="ma3-pill c">' + val(attn.holds) + '</span><span class="lbl">Holds Requiring Action</span><span class="go">&#8250;</span></button>' +
        '<button type="button" class="ma3-attn-row" data-act="nav" data-v="sch"><span class="ma3-pill d">' + val(attn.sch) + '</span><span class="lbl">Scholarship Applications</span><span class="go">&#8250;</span></button>';
    }
    paint();

    google.script.run.withSuccessHandler(function (res) {
      var data = res && res.success && res.data ? res.data : null;
      if (!data) return paint();
      var counts = (data.attention && data.attention.counts) || {};
      attn.req = Number(counts.req || 0);
      var cats = Array.isArray(data.byCategory) ? data.byCategory : [];
      attn.sch = cats.reduce(function (a, x) {
        var k = String(x[0] || '');
        return a + (k && k !== 'REGULAR' ? Number(x[1]) || 0 : 0);
      }, 0);
      paint();
    }).withFailureHandler(function () {}).dashboardExtra(S.token);

    google.script.run.withSuccessHandler(function (res) {
      var flags = res && res.success && res.data && Array.isArray(res.data.flags) ? res.data.flags : null;
      if (!flags) return;
      attn.holds = flags.length;
      paint();
    }).withFailureHandler(function () {}).holdsOverview(S.token);

    if (!full) {
      var act = $('ma3-act');
      if (act) act.innerHTML = '<div class="ma3-empty">The activity feed is limited to administrators and system managers.</div>';
      return;
    }
    google.script.run.withSuccessHandler(function (res) {
      var box = $('ma3-act');
      if (!box) return;
      var items = res && res.success && res.data && Array.isArray(res.data.items) ? res.data.items : [];
      var dots = ['#ef4444', '#16a34a', '#2563eb', '#f59e0b'];
      box.innerHTML = items.length ? items.slice(0, 4).map(function (x, i) {
        var what = String(x.action || 'System activity').replace(/[._]/g, ' ');
        var who = [x.actor || 'System', x.role || ''].filter(Boolean).join(' \u00b7 ');
        return '<div class="ma3-act-row"><i style="background:' + dots[i % dots.length] + '"></i>' +
          '<span><b>' + escv(what.charAt(0).toUpperCase() + what.slice(1)) + '</b><small>' + escv(who) + '</small></span>' +
          '<time>' + relTime(x) + '</time></div>';
      }).join('') : '<div class="ma3-empty">No recent system activity.</div>';
    }).withFailureHandler(function () {
      var box = $('ma3-act');
      if (box) box.innerHTML = '<div class="ma3-empty">Activity is temporarily unavailable.</div>';
    }).getRecentActivity(S.token, 12);
  }

  window.homeAdmin = function () {
    var sy = (S.cfg && S.cfg.sy) || '';
    document.body.classList.remove('sbc');
    head('Dashboard', 'Enrollment overview for School Year ' + sy);
    call('dashboard', [T()], renderDashboard);
  };
})();

/* ---------- Homepage hero editor, integrated into Website Management ---------- */
(function () {
  const baseWebsiteManagementPage = window.websiteManagementPage;
  const escField = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
  function heroField(id,label,value,wide) {
    return '<label class="ma-hero-field'+(wide?' wide':'')+'"><span>'+label+'</span><input id="'+id+'" type="text" value="'+escField(value)+'" maxlength="1000"></label>';
  }
  function websiteHeroEditor() {
    if (typeof SYS !== 'function' || !SYS()) return toast('Website Management is restricted to the main administrator.','warn');
    head('Homepage Hero & Images','Edit the public homepage welcome banner, call-to-action links and three carousel images.');
    google.script.run.withSuccessHandler(res => {
      if (!res || !res.success) return toast((res && res.error) || 'Could not load homepage settings.',false);
      const h=res.data||{};
      $('view').innerHTML=
        '<div class="ma-hero-editor">'+
          '<div class="ma-web-warning"><b>Publishing notice</b><p>Saving updates the public homepage immediately. Use Google Drive thumbnail links for images. The public homepage will keep its approved layout and styling.</p></div>'+
          '<div class="sbar"><button class="btn" data-act="webherosave">Save &amp; Publish</button><button class="btn alt" data-act="webherocancel">Back to Website Management</button></div>'+
          '<section class="ma-v2-panel"><div class="ma-v2-panelhead"><h3>Welcome Banner</h3><small>Text and calls to action</small></div><div class="ma-hero-fields">'+
            heroField('maHeroHeadline','Main headline',h.headline,true)+
            heroField('maHeroSubheadline','Tagline',h.subheadline,true)+
            heroField('maHeroDescription','Description',h.description,true)+
            heroField('maHeroPrimaryText','Primary button label',h.primaryText)+
            heroField('maHeroPrimaryUrl','Primary button link',h.primaryUrl)+
            heroField('maHeroSecondaryText','Secondary button label',h.secondaryText)+
            heroField('maHeroSecondaryUrl','Secondary button link',h.secondaryUrl)+
          '</div></section>'+
          '<section class="ma-v2-panel"><div class="ma-v2-panelhead"><h3>Carousel Images</h3><small>Three slides · Google Drive hosted images</small></div><div class="ma-hero-fields">'+
            heroField('maHeroImage1','Slide 1 image URL',h.images&&h.images[0],true)+
            heroField('maHeroImage2','Slide 2 image URL',h.images&&h.images[1],true)+
            heroField('maHeroImage3','Slide 3 image URL',h.images&&h.images[2],true)+
          '</div><p class="ma-web-note">Paste a Google Drive thumbnail URL in this format: https://drive.google.com/thumbnail?id=FILE_ID&amp;sz=w2000. Make sure the image is accessible to viewers of the public website.</p></section>'+
        '</div>';
    }).withFailureHandler(e=>toast(e.message||'Could not load homepage settings.',false)).getHomepageHero();
  }
  act.webhero = websiteHeroEditor;
  act.webherocancel = () => websiteManagementPage();
  act.webherosave = () => {
    if (typeof SYS !== 'function' || !SYS()) return toast('Not allowed.','warn');
    const value=id=>{const el=$(id);return el?el.value.trim():'';};
    const settings={
      headline:value('maHeroHeadline'),
      subheadline:value('maHeroSubheadline'),
      description:value('maHeroDescription'),
      primaryText:value('maHeroPrimaryText'),
      primaryUrl:value('maHeroPrimaryUrl'),
      secondaryText:value('maHeroSecondaryText'),
      secondaryUrl:value('maHeroSecondaryUrl'),
      images:[value('maHeroImage1'),value('maHeroImage2'),value('maHeroImage3')]
    };
    google.script.run.withSuccessHandler(res=>{
      if(!res||!res.success)return toast((res&&res.error)||'Homepage settings were not saved.',false);
      toast(res.message||'Homepage hero settings saved.');
      websiteManagementPage();
    }).withFailureHandler(e=>toast(e.message||'Could not save homepage settings.',false)).saveHomepageHero(S.token,settings);
  };
  if (typeof baseWebsiteManagementPage === 'function') {
    window.websiteManagementPage = function () {
      baseWebsiteManagementPage();
      const root=document.querySelector('.ma-web-page');
      if (!root || root.querySelector('[data-act="webhero"]')) return;
      const section=document.createElement('section');
      section.className='ma-v2-panel';
      section.innerHTML='<div class="ma-v2-panelhead"><h3>Homepage Hero &amp; Images</h3><small>Editable welcome banner</small></div><p>Edit the homepage headline, tagline, buttons and carousel images without changing the page layout or navigation.</p><button type="button" class="btn" data-act="webhero">Edit Hero &amp; Images</button>';
      const first=root.querySelector('section');
      if(first) first.insertAdjacentElement('afterend',section); else root.appendChild(section);
      const note=root.querySelector('.ma-web-note');
      if(note) note.textContent='The homepage hero and carousel images are now editable here. Institutional logos, navigation, section layout and footer remain controlled by the approved homepage template.';
    };
  }
})();
