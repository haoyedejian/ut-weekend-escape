/* UT 周末出逃 · 本地存储、确定性随机、状态迁移 */
(function () {
  'use strict';

  var SESSION_KEY = 'ut.session.v1';
  var CAPSULE_KEY = 'ut.capsules.v1';
  var DEVICE_KEY = 'ut.device.v1';

  var ALLOWED = {
    ENTRY: ['SEALING'],
    SEALING: ['SEALED'],
    SEALED: ['DRAWING'],
    DRAWING: ['ISSUED', 'SEALED'],
    ISSUED: ['CHOOSING', 'DRAWING'],
    CHOOSING: ['ESCAPING'],
    ESCAPING: ['RETURNING', 'CHOOSING'],
    RETURNING: ['SEALING_CAPSULE'],
    SEALING_CAPSULE: ['ARCHIVED'],
    ARCHIVED: ['MAP'],
    MAP: []
  };

  function read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  function parse(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function pad(n, size) {
    var s = String(n);
    while (s.length < (size || 2)) s = '0' + s;
    return s;
  }

  function deviceId() {
    var id = read(DEVICE_KEY);
    if (!id) {
      id = 'dev-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      write(DEVICE_KEY, id);
    }
    return id;
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function initialState() {
    return {
      v: 1,
      state: 'ENTRY',
      labels: ['', '', ''],
      code: '',
      personaId: '',
      rerollCount: 0,
      prevPersonaId: '',
      destinationId: '',
      departureAt: '',
      returnDueAt: '',
      sealedAt: '',
      fragments: [],
      demoMinute: 17 * 60 + 20,
      demoMode: true,
      returnedAt: '',
      archivedCapsuleId: ''
    };
  }

  function loadSession() {
    var saved = parse(read(SESSION_KEY));
    var base = initialState();
    if (!saved || typeof saved !== 'object') return base;
    Object.keys(base).forEach(function (k) {
      if (!(k in saved)) saved[k] = base[k];
    });
    if (!ALLOWED[saved.state]) saved.state = 'ENTRY';
    if (!Array.isArray(saved.labels) || saved.labels.length !== 3) saved.labels = ['', '', ''];
    if (!Array.isArray(saved.fragments)) saved.fragments = [];
    return saved;
  }

  function saveSession(session) {
    return write(SESSION_KEY, JSON.stringify(session));
  }

  function defaultCapsules() {
    return JSON.parse(JSON.stringify(window.UT.content.presetCapsules));
  }

  function loadCapsules() {
    var saved = parse(read(CAPSULE_KEY));
    if (!Array.isArray(saved) || !saved.length) return defaultCapsules();
    return saved;
  }

  function saveCapsules(capsules) {
    return write(CAPSULE_KEY, JSON.stringify(capsules));
  }

  function resetAll() {
    try {
      window.localStorage.removeItem(SESSION_KEY);
      window.localStorage.removeItem(CAPSULE_KEY);
    } catch (e) { /* 忽略隐私模式下的异常 */ }
    return initialState();
  }

  function canTransition(from, to) {
    var list = ALLOWED[from];
    return !!(list && list.indexOf(to) !== -1);
  }

  function drawPersona(session, excludeId) {
    var personas = window.UT.content.personas;
    var seed = hash(deviceId() + '|' + todayKey() + '|' + session.rerollCount);
    var rand = mulberry32(seed);
    var idx = Math.floor(rand() * personas.length) % personas.length;
    var persona = personas[idx];
    if (excludeId && persona.id === excludeId) {
      persona = personas[(idx + 1) % personas.length];
    }
    return persona;
  }

  function makeCode() {
    return pad(hash(deviceId() + '|' + todayKey() + '|code') % 10000, 4);
  }

  window.UT.store = {
    load: loadSession,
    save: saveSession,
    initialState: initialState,
    canTransition: canTransition,
    drawPersona: drawPersona,
    makeCode: makeCode,
    loadCapsules: loadCapsules,
    saveCapsules: saveCapsules,
    defaultCapsules: defaultCapsules,
    resetAll: resetAll,
    deviceId: deviceId
  };
})();
