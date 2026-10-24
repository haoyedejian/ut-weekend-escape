/* UT 周末出逃 · 六屏交互与仪式 */
(function () {
  'use strict';

  var C = window.UT.content;
  var S = window.UT.store;

  var $ = function (id) { return document.getElementById(id); };
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = reduceQuery.matches;
  var DEMO = new URLSearchParams(window.location.search).get('demo') !== '0';

  var screens = {
    entry: $('screen-entry'),
    seal: $('screen-seal'),
    issue: $('screen-issue'),
    dest: $('screen-dest'),
    escape: $('screen-escape'),
    map: $('screen-map')
  };

  var session = S.load();
  var capsules = S.loadCapsules();
  var selectedDest = session.destinationId || 'north';
  var currentScreen = '';
  var busy = false;
  var toastTimer = null;
  var holdTimer = null;
  var sheetReturnFocus = null;

  session.demoMode = DEMO;

  var appKicker = $('appKicker');
  var appMeta = $('appMeta');
  var brand = $('brand');
  var toastEl = $('toast');
  var live = $('live');

  var btnStart = $('btnStart');
  var btnSeal = $('btnSeal');
  var btnDraw = $('btnDraw');
  var btnReroll = $('btnReroll');
  var btnAccept = $('btnAccept');
  var btnGo = $('btnGo');
  var btnPhoto = $('btnPhoto');
  var btnWrite = $('btnWrite');
  var btnReturn = $('btnReturn');
  var btnRestart = $('btnRestart');
  var photoInput = $('photoInput');

  var drawStage = $('drawStage');
  var drawCard = $('drawCard');
  var cardNo = $('cardNo');
  var cardName = $('cardName');
  var cardLine = $('cardLine');
  var cardPermits = $('cardPermits');
  var cardHandover = $('cardHandover');
  var cardObject = $('cardObject');
  var cardTendency = $('cardTendency');
  var issueNo = $('issueNo');
  var issueHint = $('issueHint');
  var issuedActions = $('issuedActions');

  var sealRitual = $('sealRitual');
  var ritualSlips = $('ritualSlips');
  var ritualCode = $('ritualCode');
  var ritualNote = $('ritualNote');
  var returnRitual = $('returnRitual');
  var returnLabels = $('returnLabels');
  var capsuleNo = $('capsuleNo');
  var timeLapse = $('timeLapse');
  var tlFrom = $('tlFrom');

  var frags = $('frags');
  var liveElapsed = $('liveElapsed');
  var livePlace = $('livePlace');
  var returnHint = $('returnHint');
  var returnRecap = $('returnRecap');
  var liveFoot = $('liveFoot');
  var seg = $('seg');
  var panelLive = $('panelLive');
  var panelBack = $('panelBack');

  var destNodes = Array.prototype.slice.call(document.querySelectorAll('.dest'));
  var previewRing = $('previewRing');
  var previewDot = $('previewDot');

  var scrim = $('scrim');
  var writeSheet = $('writeSheet');
  var capsuleSheet = $('capsuleSheet');
  var capsuleBody = $('capsuleBody');
  var closeWrite = $('closeWrite');
  var closeCapsule = $('closeCapsule');
  var writeText = $('writeText');
  var writeCount = $('writeCount');
  var btnSaveText = $('btnSaveText');

  var mapSvg = $('mapSvg');
  var mapPoints = $('mapPoints');
  var mapCard = $('mapCard');

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function personaById(id) {
    for (var i = 0; i < C.personas.length; i++) {
      if (C.personas[i].id === id) return C.personas[i];
    }
    return null;
  }

  function destById(id) {
    return C.destinations[id] || C.destinations.north;
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function announce(msg) {
    live.textContent = '';
    window.setTimeout(function () { live.textContent = msg; }, 30);
  }

  function toast(msg) {
    window.clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add('is-open');
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('is-open');
    }, 2500);
  }

  function hideToast() {
    window.clearTimeout(toastTimer);
    toastEl.classList.remove('is-open');
  }

  function syncKeyboardInset() {
    var vv = window.visualViewport;
    var inset = vv ? Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)) : 0;
    if (inset > 90) {
      document.documentElement.style.setProperty('--kb', inset + 'px');
    } else {
      document.documentElement.style.removeProperty('--kb');
    }
  }

  function persist() {
    var ok = S.save(session);
    if (!ok) toast('本地空间不够，这一步没有存下。');
    return ok;
  }

  function move(next, patch, saveIt) {
    if (session.state !== next && !S.canTransition(session.state, next)) {
      if (window.console) console.warn('UT: 非法状态迁移 ' + session.state + ' → ' + next);
      return false;
    }
    session.state = next;
    if (patch) Object.assign(session, patch);
    if (saveIt !== false) persist();
    return true;
  }

  function show(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle('is-active', key === name);
    });
    var screen = screens[name];
    if (!screen) return;
    if (name === 'escape') {
      appKicker.textContent = panelBack && !panelBack.hidden ? '归还 / 周六' : '出逃中 / 周六';
    } else {
      appKicker.textContent = screen.dataset.kicker || '';
    }
    if (name === 'map') {
      appMeta.textContent = capsules.length + ' 个胶囊';
    } else {
      appMeta.textContent = screen.dataset.meta || '';
    }
    screen.scrollTop = 0;
    currentScreen = name;
    announce(screen.dataset.kicker || '');
  }

  /* ---------- 01 入口 ---------- */
  function fillSealForm() {
    session.labels.forEach(function (text, i) {
      var input = $('label-' + i);
      if (input) input.value = text || '';
    });
    btnSeal.disabled = false;
  }

  function startSealForm() {
    if (!move('SEALING')) return;
    hideToast();
    fillSealForm();
    show('seal');
  }

  /* ---------- 02 封存 ---------- */
  function runSealRitual() {
    hideToast();
    ritualSlips.innerHTML = '';
    session.labels.forEach(function (text) {
      var slip = document.createElement('i');
      slip.textContent = (text || '').trim() || '留空';
      ritualSlips.appendChild(slip);
    });
    ritualCode.textContent = 'NO.' + (session.code || '0000');
    ritualNote.textContent = '社会身份已封存';

    sealRitual.classList.remove('is-running', 'is-gathering', 'is-closing', 'is-stamped');
    sealRitual.classList.add('is-open');
    sealRitual.setAttribute('aria-hidden', 'false');
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        sealRitual.classList.add('is-running');
      });
    });

    window.setTimeout(function () {
      sealRitual.classList.add('is-gathering');
    }, reduce ? 30 : 520);

    window.setTimeout(function () {
      sealRitual.classList.add('is-closing');
    }, reduce ? 90 : 960);

    window.setTimeout(function () {
      sealRitual.classList.add('is-stamped');
    }, reduce ? 200 : 1400);

    return wait(reduce ? 440 : 1700);
  }

  function sealIdentity() {
    if (busy) return;
    busy = true;
    btnSeal.disabled = true;
    if (!session.code) session.code = S.makeCode();

    runSealRitual().then(function () {
      window.setTimeout(function () {
        sealRitual.classList.remove('is-open', 'is-running', 'is-gathering', 'is-closing', 'is-stamped');
        sealRitual.setAttribute('aria-hidden', 'true');
        move('SEALED', { sealedAt: new Date().toISOString() });
        renderIssueBase();
        show('issue');
        busy = false;
        btnSeal.disabled = false;
        announce('社会身份已封存。编号 ' + session.code + '。');
      }, reduce ? 80 : 160);
    });
  }

  /* ---------- 03 签发 ---------- */
  function renderIssueBase() {
    issueNo.textContent = 'NO.' + (session.code || '0000');
    cardNo.textContent = 'NO.' + (session.code || '0000');
    if (!session.personaId) {
      drawStage.classList.remove('is-drawing', 'is-flipped');
      btnDraw.hidden = false;
      issuedActions.hidden = true;
      btnReroll.textContent = '换一张';
      btnReroll.disabled = false;
      issueHint.textContent = '六张卡背朝上。抽到哪张，就过哪一种两天。';
    }
  }

  function fillFront(persona) {
    cardName.textContent = persona.name;
    cardLine.textContent = persona.line;
    cardPermits.innerHTML = '';
    persona.permits.forEach(function (permit) {
      var li = document.createElement('li');
      li.textContent = permit;
      cardPermits.appendChild(li);
    });
    cardHandover.textContent = persona.handover;
    cardObject.textContent = persona.object;
    cardTendency.textContent = persona.tendency;
  }

  function showIssued(restored) {
    btnDraw.hidden = true;
    issuedActions.hidden = false;
    btnReroll.disabled = session.rerollCount > 0;
    btnReroll.textContent = session.rerollCount > 0 ? '已换过' : '换一张';
    issueHint.textContent = session.rerollCount > 0
      ? '换过之后，就它了。'
      : '只能换一次。换过之后，就它了。';
    if (restored) {
      drawStage.classList.add('is-drawing', 'is-flipped');
    }
  }

  function startDraw() {
    if (busy || session.state !== 'SEALED') return;
    busy = true;
    hideToast();
    btnDraw.disabled = true;
    move('DRAWING', null, false);

    var persona = S.drawPersona(session, null);
    session.personaId = persona.id;
    session.prevPersonaId = '';
    fillFront(persona);
    drawStage.classList.add('is-drawing');

    window.setTimeout(function () {
      drawStage.classList.add('is-flipped');
    }, reduce ? 20 : 180);

    window.setTimeout(function () {
      move('ISSUED');
      showIssued(false);
      busy = false;
      btnDraw.disabled = false;
      announce('临时身份：' + persona.name + '。' + persona.line);
    }, reduce ? 280 : 1250);
  }

  function reroll() {
    if (busy || session.state !== 'ISSUED' || session.rerollCount > 0) return;
    busy = true;
    btnReroll.disabled = true;

    move('DRAWING', {
      rerollCount: 1,
      prevPersonaId: session.personaId
    }, false);

    drawStage.classList.remove('is-flipped');

    window.setTimeout(function () {
      var persona = S.drawPersona(session, session.prevPersonaId);
      session.personaId = persona.id;
      fillFront(persona);
      window.requestAnimationFrame(function () {
        drawStage.classList.add('is-flipped');
      });
      window.setTimeout(function () {
        move('ISSUED');
        showIssued(true);
        busy = false;
        toast('换过了。这次就是它。');
        announce('已换过一次。新的临时身份：' + persona.name + '。');
      }, reduce ? 160 : 700);
    }, reduce ? 60 : 760);
  }

  function acceptPersona() {
    if (busy || session.state !== 'ISSUED' || !session.personaId) return;
    hideToast();
    move('CHOOSING');
    renderDest();
    show('dest');
  }

  /* ---------- 04 目的地 ---------- */
  function movePreviewPin() {
    var pin = destById(selectedDest).previewPin;
    previewRing.setAttribute('cx', pin[0]);
    previewRing.setAttribute('cy', pin[1]);
    previewDot.setAttribute('cx', pin[0]);
    previewDot.setAttribute('cy', pin[1]);
  }

  function selectDestination(id) {
    selectedDest = id;
    destNodes.forEach(function (node) {
      var on = node.dataset.dest === id;
      node.classList.toggle('on', on);
      node.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    movePreviewPin();
  }

  function renderDest() {
    if (session.destinationId && C.destinations[session.destinationId]) {
      selectedDest = session.destinationId;
    }
    if (!C.destinations[selectedDest]) selectedDest = 'north';
    selectDestination(selectedDest);
  }

  function lastFridaySix() {
    var d = new Date();
    var day = d.getDay();
    var sinceFriday = (day + 2) % 7;
    d.setDate(d.getDate() - sinceFriday);
    d.setHours(18, 0, 0, 0);
    return d;
  }

  function seedFragments(destination) {
    return destination.fragments.map(function (frag, i) {
      return {
        id: 'seed-' + i,
        kind: frag.kind,
        dataUrl: frag.kind === 'photo' ? destination.photo : '',
        caption: frag.caption || '',
        text: frag.text || '',
        timeLabel: frag.time,
        place: frag.place || (destination.direction + ' · ' + destination.short),
        createdAt: Date.now() - (2 - i) * 3600000
      };
    });
  }

  function beginEscape() {
    if (busy || !selectedDest) return;
    busy = true;
    hideToast();
    btnGo.disabled = true;

    var now = new Date();
    var departure;
    var due;
    if (DEMO) {
      departure = lastFridaySix();
      due = new Date(departure.getTime() + 2 * 86400000);
    } else {
      departure = now;
      due = new Date(now.getTime() + 2 * 86400000);
    }

    move('ESCAPING', {
      destinationId: selectedDest,
      departureAt: departure.toISOString(),
      returnDueAt: due.toISOString(),
      fragments: session.fragments.length ? session.fragments : seedFragments(destById(selectedDest)),
      demoMinute: 17 * 60 + 20
    });

    renderEscape();

    if (DEMO) {
      runTimeLapse();
    } else {
      show('escape');
      busy = false;
      btnGo.disabled = false;
    }
  }

  function runTimeLapse() {
    hideToast();
    timeLapse.classList.remove('is-running');
    tlFrom.classList.remove('is-past');
    timeLapse.classList.add('is-open');
    timeLapse.setAttribute('aria-hidden', 'false');
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        timeLapse.classList.add('is-running');
      });
    });

    window.setTimeout(function () {
      tlFrom.classList.add('is-past');
    }, reduce ? 60 : 620);

    window.setTimeout(function () {
      timeLapse.classList.remove('is-open', 'is-running');
      timeLapse.setAttribute('aria-hidden', 'true');
      tlFrom.classList.remove('is-past');
      show('escape');
      busy = false;
      btnGo.disabled = false;
      announce('出逃中。已经离开 23 小时 20 分。');
    }, reduce ? 420 : 1460);
  }

  /* ---------- 05 出逃 ---------- */
  function durationLabel(fromIso, toDate) {
    if (!fromIso) return '00:00';
    var from = new Date(fromIso).getTime();
    var to = toDate.getTime();
    var mins = Math.max(0, Math.floor((to - from) / 60000));
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    return pad2(h) + ':' + pad2(m);
  }

  function nextFragmentTime() {
    if (DEMO) {
      return 'SAT ' + pad2(Math.floor(session.demoMinute / 60)) + ':' + pad2(session.demoMinute % 60);
    }
    var now = new Date();
    var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[now.getDay()] + ' ' + pad2(now.getHours()) + ':' + pad2(now.getMinutes());
  }

  function renderFrags() {
    frags.innerHTML = '';
    session.fragments.forEach(function (frag) {
      var isText = frag.kind === 'text';
      var card = document.createElement('article');
      card.className = 'frag' + (isText ? ' text' : '');

      if (!isText) {
        var ph = document.createElement('div');
        ph.className = 'ph';
        if (frag.dataUrl) {
          var img = document.createElement('img');
          img.src = frag.dataUrl;
          img.alt = '';
          ph.appendChild(img);
        }
        card.appendChild(ph);
      }

      var body = document.createElement('div');
      body.className = 'body';

      if (isText) {
        var cap = document.createElement('p');
        cap.className = 'cap';
        cap.textContent = '“' + frag.text + '”';
        body.appendChild(cap);
      } else if (frag.caption) {
        var cap2 = document.createElement('p');
        cap2.className = 'cap';
        cap2.textContent = frag.caption;
        body.appendChild(cap2);
      }

      var tm = document.createElement('p');
      tm.className = 'tm';
      tm.textContent = frag.timeLabel + (frag.place ? ' · ' + frag.place : '');
      body.appendChild(tm);
      card.appendChild(body);
      frags.appendChild(card);
    });
  }

  function escapeElapsed() {
    return DEMO ? '23:20' : durationLabel(session.departureAt, new Date());
  }

  function updateReturnMeta() {
    var destination = destById(session.destinationId);
    returnRecap.textContent = '你在' + destination.direction + ' · ' + destination.short +
      '，待了 ' + escapeElapsed() + '，留下 ' + session.fragments.length + ' 条。';
    liveFoot.textContent = session.fragments.length >= 6
      ? '六条了。就这样吧。'
      : '一共最多六条 · 只有你能看见';
  }

  function renderEscape() {
    var destination = destById(session.destinationId);
    livePlace.textContent = destination.direction + ' · ' + destination.short;
    liveElapsed.textContent = '已经离开 ' + escapeElapsed();
    updateReturnMeta();
    if (DEMO) {
      returnHint.textContent = '身份还没取回 · 距离取回 24:40';
    } else {
      returnHint.textContent = '身份还没取回 · 距离取回 ' + durationLabel(new Date().toISOString(), new Date(session.returnDueAt));
    }
    renderFrags();
    setSeg('live');
  }

  function setSeg(which) {
    seg.querySelectorAll('button').forEach(function (btn) {
      var on = btn.dataset.tab === which;
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.tabIndex = on ? 0 : -1;
    });
    panelLive.hidden = which !== 'live';
    panelBack.hidden = which !== 'back';
    appKicker.textContent = which === 'back' ? '归还 / 周六' : '出逃中 / 周六';
  }

  function addFragment(frag, message) {
    if (session.fragments.length >= 6) {
      toast('最多留六条。');
      return;
    }
    var backup = session.fragments.slice();
    session.fragments.push(frag);
    if (!S.save(session)) {
      session.fragments = backup;
      toast('这一条没存下，换一张试试。');
      return;
    }
    renderFrags();
    updateReturnMeta();
    if (message) toast(message);
  }

  function openWrite() {
    if (session.fragments.length >= 6) {
      toast('最多留六条。');
      return;
    }
    writeText.value = '';
    updateWriteCount();
    openSheet(writeSheet);
    window.setTimeout(function () { writeText.focus(); }, 340);
  }

  function updateWriteCount() {
    writeCount.textContent = writeText.value.length + ' / 60';
    btnSaveText.disabled = writeText.value.trim().length === 0;
  }

  function saveText() {
    var text = writeText.value.trim();
    if (!text) return;
    var destination = destById(session.destinationId);
    addFragment({
      id: 'f-' + Date.now(),
      kind: 'text',
      text: text,
      caption: '',
      dataUrl: '',
      timeLabel: nextFragmentTime(),
      place: destination.direction + ' · ' + destination.short,
      createdAt: Date.now()
    }, '留好了。');
    closeSheets();
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('image'));
      };
      img.src = url;
    });
  }

  function canvasData(img, maxEdge, quality) {
    var w = img.naturalWidth || img.width;
    var h = img.naturalHeight || img.height;
    var scale = Math.min(1, maxEdge / Math.max(w, h));
    var cw = Math.max(1, Math.round(w * scale));
    var ch = Math.max(1, Math.round(h * scale));
    var canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#EFEEEB';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, cw, ch);
    return canvas.toDataURL('image/jpeg', quality);
  }

  function compressPhoto(file) {
    return loadImage(file).then(function (img) {
      var quality = 0.82;
      var data = canvasData(img, 1200, quality);
      while (data.length * 0.75 > 500 * 1024 && quality > 0.42) {
        quality -= 0.1;
        data = canvasData(img, 1200, quality);
      }
      if (data.length * 0.75 > 500 * 1024) {
        quality = 0.72;
        data = canvasData(img, 900, quality);
        while (data.length * 0.75 > 500 * 1024 && quality > 0.4) {
          quality -= 0.08;
          data = canvasData(img, 900, quality);
        }
      }
      if (data.length * 0.75 > 560 * 1024) throw new Error('too-large');
      return data;
    });
  }

  function handlePhoto(file) {
    if (!file) return;
    if (session.fragments.length >= 6) {
      toast('最多留六条。');
      return;
    }
    btnPhoto.disabled = true;
    toast('正在收好这张照片。');
    compressPhoto(file).then(function (dataUrl) {
      var destination = destById(session.destinationId);
      addFragment({
        id: 'f-' + Date.now(),
        kind: 'photo',
        dataUrl: dataUrl,
        caption: '',
        text: '',
        timeLabel: nextFragmentTime(),
        place: destination.direction + ' · ' + destination.short,
        createdAt: Date.now()
      }, '留好了。');
    }).catch(function (err) {
      toast(err && err.message === 'too-large' ? '这张太大了，换一张。' : '这张读不出来，换一张试试。');
    }).then(function () {
      btnPhoto.disabled = false;
    });
  }

  /* ---------- 归还仪式 ---------- */
  function deriveCover(persona) {
    var texts = session.fragments.filter(function (f) {
      return f.kind === 'text' && f.text && f.text.trim();
    });
    if (texts.length) return texts[texts.length - 1].text.trim();
    return persona.defaultCover;
  }

  function beginReturn() {
    if (busy || session.state !== 'ESCAPING') return;
    busy = true;
    hideToast();
    btnReturn.disabled = true;
    move('RETURNING', null, false);

    returnLabels.innerHTML = '';
    session.labels.forEach(function (text) {
      var i = document.createElement('i');
      i.textContent = (text || '').trim() || '留空';
      returnLabels.appendChild(i);
    });
    capsuleNo.textContent = 'NO.' + (session.code || '0000');

    returnRitual.classList.remove('is-running', 'is-opening', 'is-shutting');
    returnRitual.classList.add('is-open');
    returnRitual.setAttribute('aria-hidden', 'false');
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        returnRitual.classList.add('is-running');
      });
    });

    window.setTimeout(function () {
      returnRitual.classList.add('is-opening');
    }, reduce ? 60 : 320);

    window.setTimeout(function () {
      returnRitual.classList.add('is-shutting');
    }, reduce ? 200 : 1150);

    window.setTimeout(archiveAndMap, reduce ? 760 : 1950);
  }

  function daysUntil(iso) {
    var ms = new Date(iso).getTime() - Date.now();
    var days = Math.ceil(ms / 86400000);
    return days > 0 ? days : 0;
  }

  function fmtDate(date) {
    var d = new Date(date);
    return pad2(d.getMonth() + 1) + '.' + pad2(d.getDate());
  }

  function pickMapOffset(destinationId, list) {
    var spots = [[0, 0], [17, -13], [-15, -13], [15, 14], [-16, 12], [0, 18]];
    var used = list.filter(function (c) {
      return c.destinationId === destinationId;
    }).map(function (c) {
      var offset = c.mapOffset || [0, 0];
      return offset[0] + ',' + offset[1];
    });
    for (var i = 0; i < spots.length; i++) {
      if (used.indexOf(spots[i][0] + ',' + spots[i][1]) === -1) return spots[i];
    }
    return [0, 0];
  }

  function archiveAndMap(recovering) {
    returnRitual.classList.remove('is-open', 'is-running', 'is-opening', 'is-shutting');
    returnRitual.setAttribute('aria-hidden', 'true');
    hideToast();

    if (recovering && session.archivedCapsuleId) {
      var archived = S.loadCapsules().filter(function (c) {
        return c.id === session.archivedCapsuleId;
      })[0];
      if (archived) {
        capsules = S.loadCapsules();
        session.state = 'MAP';
        S.save(session);
        renderMap(archived.id);
        show('map');
        busy = false;
        btnReturn.disabled = false;
        return;
      }
    }

    var persona = personaById(session.personaId) || C.personas[0];
    var now = new Date();
    var existing = S.loadCapsules();
    var capsule = {
      id: 'cap-' + now.getTime(),
      personaId: persona.id,
      destinationId: session.destinationId,
      dateLabel: fmtDate(now),
      coverLine: deriveCover(persona),
      sealedAt: now.toISOString(),
      openAt: new Date(now.getTime() + 7 * 86400000).toISOString(),
      openedAt: '',
      status: 'sealed',
      mapOffset: pickMapOffset(session.destinationId, existing),
      fragments: session.fragments.map(function (f) {
        return {
          id: f.id,
          kind: f.kind,
          caption: f.caption,
          text: f.text,
          timeLabel: f.timeLabel,
          place: f.place,
          createdAt: f.createdAt
        };
      })
    };

    capsules = existing;
    capsules.push(capsule);
    if (!S.saveCapsules(capsules)) toast('本地空间不够，胶囊没有完整存下。');

    if (recovering) {
      session.state = 'SEALING_CAPSULE';
      Object.assign(session, {
        labels: ['', '', ''],
        returnedAt: now.toISOString(),
        archivedCapsuleId: capsule.id,
        fragments: []
      });
      S.save(session);
    } else {
      move('SEALING_CAPSULE', {
        labels: ['', '', ''],
        returnedAt: now.toISOString(),
        archivedCapsuleId: capsule.id,
        fragments: []
      }, false);
    }
    move('ARCHIVED');
    move('MAP');

    renderMap(capsule.id);
    show('map');
    busy = false;
    btnReturn.disabled = false;

    if (!recovering) {
      window.setTimeout(function () {
        openCapsuleSheet(capsule.id);
      }, 460);
    }
  }

  /* ---------- 06 地图 ---------- */
  function statusText(capsule) {
    if (capsule.status === 'opened') {
      return '已打开 · ' + fmtDate(capsule.openedAt || capsule.openAt);
    }
    var days = daysUntil(capsule.openAt);
    return days > 0
      ? '已封存 · 还有 ' + days + ' 天可打开'
      : '已封存 · 到了可以打开的日子';
  }

  function latestCapsule() {
    return capsules.slice().sort(function (a, b) {
      return new Date(b.sealedAt) - new Date(a.sealedAt);
    })[0];
  }

  function svgNode(tag, attrs) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs).forEach(function (key) {
      node.setAttribute(key, attrs[key]);
    });
    return node;
  }

  function renderMap(focusId) {
    screens.map.dataset.meta = capsules.length + ' 个胶囊';
    mapPoints.innerHTML = '';

    capsules.forEach(function (capsule) {
      var destination = destById(capsule.destinationId);
      var offset = capsule.mapOffset || [0, 0];
      var cx = destination.anchor[0] + offset[0];
      var cy = destination.anchor[1] + offset[1];
      var isNew = capsule.status === 'sealed';
      var persona = personaById(capsule.personaId);

      var g = svgNode('g', {
        'class': 'mpoint',
        role: 'button',
        tabindex: '0',
        'aria-label': capsule.dateLabel + ' ' + (persona ? persona.name : '') + ' ' + destination.name + ' ' + statusText(capsule)
      });
      g.appendChild(svgNode('circle', { 'class': 'hit', cx: cx, cy: cy, r: isNew ? 16 : 13 }));
      g.appendChild(svgNode('circle', {
        'class': 'ring',
        cx: cx, cy: cy,
        r: isNew ? 10 : 7,
        fill: 'none',
        stroke: '#3E5659',
        'stroke-opacity': isNew ? '.35' : '.22'
      }));
      g.appendChild(svgNode('circle', {
        cx: cx, cy: cy,
        r: isNew ? 4.5 : 3.5,
        fill: '#3E5659',
        'fill-opacity': isNew ? '1' : '.5',
        stroke: '#F3F2EC',
        'stroke-width': isNew ? '0' : '1.5'
      }));

      g.addEventListener('click', function () { openCapsuleSheet(capsule.id); });
      g.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openCapsuleSheet(capsule.id);
        }
      });
      mapPoints.appendChild(g);
    });

    var latest = focusId
      ? capsules.filter(function (c) { return c.id === focusId; })[0]
      : latestCapsule();

    if (!latest) {
      mapCard.innerHTML = '<p class="mc-line">这里还没有胶囊。</p>';
      return;
    }

    var latestPersona = personaById(latest.personaId) || C.personas[0];
    var latestDest = destById(latest.destinationId);
    mapCard.innerHTML =
      '<div class="mc-top"><span>' + esc(latest.dateLabel + ' · ' + latestPersona.name) + '</span><span>' +
      esc(latestDest.direction + ' / ' + latestDest.duration) + '</span></div>' +
      '<h2 class="mc-title">' + esc(latestDest.name) + '</h2>' +
      '<p class="mc-line">“' + esc(latest.coverLine) + '”</p>' +
      '<div class="mc-foot"><span class="mc-status">' + esc(statusText(latest)) + '</span>' +
      '<button class="mc-open" type="button" data-capsule="' + esc(latest.id) + '">打开</button></div>';

    var openBtn = mapCard.querySelector('.mc-open');
    if (openBtn) {
      openBtn.addEventListener('click', function () { openCapsuleSheet(latest.id); });
    }
  }

  function openCapsuleSheet(id) {
    var capsule = capsules.filter(function (c) { return c.id === id; })[0];
    if (!capsule) return;
    hideToast();
    var persona = personaById(capsule.personaId) || C.personas[0];
    var destination = destById(capsule.destinationId);

    capsuleBody.innerHTML =
      '<span class="cap-kicker">' + esc(capsule.dateLabel + ' · ' + persona.name) + '</span>' +
      '<h2 class="cap-title">' + esc(destination.name) + '</h2>' +
      '<p class="cap-line">“' + esc(capsule.coverLine) + '”</p>' +
      '<p class="cap-status">' + esc(statusText(capsule)) + '</p>' +
      (capsule.inside ? '<p class="cap-inside">' + esc(capsule.inside) + '</p>' : '') +
      (capsule.status === 'opened'
        ? '<button class="btn ghost" type="button" disabled>已打开</button>'
        : '<button class="btn primary" type="button" id="btnOpenCapsule">打开</button>');

    openSheet(capsuleSheet);

    if (capsule.status === 'opened') {
      closeCapsule.focus({ preventScroll: true });
    } else {
      var openBtn = $('btnOpenCapsule');
      openBtn.addEventListener('click', function () {
        var days = daysUntil(capsule.openAt);
        toast(days > 0 ? '还要等 ' + days + ' 天。先让它待着。' : '到了可以打开的日子。先别急。');
      });
      openBtn.focus({ preventScroll: true });
    }
  }

  function openSheet(sheet) {
    sheetReturnFocus = document.activeElement;
    scrim.classList.add('is-open');
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sheet-open');
    window.setTimeout(syncKeyboardInset, 340);
  }

  function closeSheets() {
    scrim.classList.remove('is-open');
    [writeSheet, capsuleSheet].forEach(function (sheet) {
      sheet.classList.remove('is-open');
      sheet.setAttribute('aria-hidden', 'true');
    });
    document.body.classList.remove('sheet-open');
    window.setTimeout(syncKeyboardInset, 320);
    if (sheetReturnFocus && sheetReturnFocus.focus) {
      sheetReturnFocus.focus({ preventScroll: true });
    }
    sheetReturnFocus = null;
  }

  /* ---------- 重置 ---------- */
  function resetSession(message, keepCapsules) {
    hideToast();
    if (keepCapsules) {
      S.save(S.initialState());
    } else {
      S.resetAll();
    }
    session = S.initialState();
    session.demoMode = DEMO;
    capsules = S.loadCapsules();
    selectedDest = 'north';
    busy = false;
    sheetReturnFocus = null;
    closeSheets();
    drawStage.classList.remove('is-drawing', 'is-flipped');
    [sealRitual, returnRitual].forEach(function (overlay) {
      overlay.classList.remove('is-open', 'is-running', 'is-gathering', 'is-closing', 'is-opening', 'is-shutting', 'is-stamped');
      overlay.setAttribute('aria-hidden', 'true');
    });
    timeLapse.classList.remove('is-open', 'is-running');
    fillSealForm();
    show('entry');
    toast(message || '已清空。可以重新开始。');
  }

  function startHold() {
    cancelHold();
    brand.classList.add('is-holding');
    holdTimer = window.setTimeout(function () {
      cancelHold();
      resetSession('已清空。可以重新开始。');
    }, 3000);
  }

  function cancelHold() {
    window.clearTimeout(holdTimer);
    holdTimer = null;
    brand.classList.remove('is-holding');
  }

  /* ---------- 事件 ---------- */
  function bind() {
    btnStart.addEventListener('click', startSealForm);

    session.labels.forEach(function (_, i) {
      var input = $('label-' + i);
      if (!input) return;
      input.addEventListener('input', function () {
        session.labels[i] = input.value;
        persist();
      });
    });

    btnSeal.addEventListener('click', sealIdentity);
    btnDraw.addEventListener('click', startDraw);
    btnReroll.addEventListener('click', reroll);
    btnAccept.addEventListener('click', acceptPersona);

    destNodes.forEach(function (node) {
      node.addEventListener('click', function () {
        selectDestination(node.dataset.dest);
      });
    });
    btnGo.addEventListener('click', beginEscape);

    seg.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button) return;
      setSeg(button.dataset.tab);
      screens.escape.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });

    seg.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      var next = seg.querySelector('button.on').dataset.tab === 'live' ? 'back' : 'live';
      setSeg(next);
      screens.escape.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      seg.querySelector('[data-tab="' + next + '"]').focus();
    });

    btnWrite.addEventListener('click', openWrite);
    writeText.addEventListener('input', updateWriteCount);
    btnSaveText.addEventListener('click', saveText);
    closeWrite.addEventListener('click', closeSheets);
    closeCapsule.addEventListener('click', closeSheets);
    scrim.addEventListener('click', closeSheets);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && (writeSheet.classList.contains('is-open') || capsuleSheet.classList.contains('is-open'))) {
        closeSheets();
      }
    });

    btnPhoto.addEventListener('click', function () {
      if (session.fragments.length >= 6) {
        toast('最多留六条。');
        return;
      }
      photoInput.value = '';
      photoInput.click();
    });
    photoInput.addEventListener('change', function () {
      var file = photoInput.files && photoInput.files[0];
      photoInput.value = '';
      handlePhoto(file);
    });

    btnReturn.addEventListener('click', beginReturn);
    btnRestart.addEventListener('click', function () {
      resetSession('空位准备好了。', true);
    });

    brand.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      startHold();
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (name) {
      brand.addEventListener(name, cancelHold);
    });
    brand.addEventListener('contextmenu', function (event) { event.preventDefault(); });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncKeyboardInset);
      window.visualViewport.addEventListener('scroll', syncKeyboardInset);
    }
    window.addEventListener('resize', syncKeyboardInset);
  }

  function restore() {
    switch (session.state) {
      case 'ENTRY':
        fillSealForm();
        show('entry');
        break;
      case 'SEALING':
        fillSealForm();
        show('seal');
        break;
      case 'SEALED':
        renderIssueBase();
        show('issue');
        break;
      case 'DRAWING':
        session.personaId = '';
        session.prevPersonaId = '';
        session.state = 'SEALED';
        S.save(session);
        renderIssueBase();
        show('issue');
        break;
      case 'ISSUED':
        renderIssueBase();
        if (session.personaId && personaById(session.personaId)) {
          fillFront(personaById(session.personaId));
          showIssued(true);
        }
        show('issue');
        break;
      case 'CHOOSING':
        renderDest();
        show('dest');
        break;
      case 'ESCAPING':
        renderEscape();
        show('escape');
        break;
      case 'RETURNING':
      case 'SEALING_CAPSULE':
        archiveAndMap(true);
        break;
      case 'MAP':
      case 'ARCHIVED':
        renderMap(session.archivedCapsuleId);
        show('map');
        break;
      default:
        resetSession('');
    }
  }

  bind();
  restore();
})();
