// Celestia - game logic
const $ = s => document.querySelector(s);
const T = TUNING;
const S = { ship: '', loc: 'farport', step: 0, ore: 0, zeals: 0, mining: false,
            view: 'name', mapUnlocked: false, travel: null };
/* Tutorial steps:
 0 name ship | 1 find the client at Farport | 2 travel to Korr | 3 mine 50 lunarrite
 4 return to Farport | 5 deliver at the hut | 6 leave into space | 7 tutorial complete */

let playable = false, last = performance.now();
const rnd = a => a[Math.floor(Math.random() * a.length)];
const randName = () => rnd(FIRST_NAMES) + ' ' + rnd(LAST_NAMES);

/* ---------- tab pause / scaling ---------- */
function checkPlay() {
  const w = innerWidth, h = innerHeight;
  playable = !document.hidden;
  const g = $('#guard');
  g.hidden = playable;
  if (!playable) g.innerHTML = 'PAUSED<br>RETURN TO THIS TAB';
  // stage keeps its 11.5:7 layout and scales to fit any tab size
  const s = Math.min(w / 920, h / 560);
  $('#stage').style.transform = `translate(-50%,-50%) scale(${s})`;
}
addEventListener('resize', checkPlay);
document.addEventListener('visibilitychange', checkPlay);

/* ---------- popups ---------- */
function popup(text, label, cb) {
  const p = $('#popup'); p.hidden = false;
  p.innerHTML = `<div class="pt">${text}</div><button class="btn" id="pb">${label || 'OK'}</button>`;
  $('#pb').onclick = () => { p.hidden = true; cb && cb(); };
}
function popups(list, done) {
  const next = i => i >= list.length ? (done && done()) :
    popup(list[i], i === list.length - 1 ? 'OK' : 'NEXT', () => next(i + 1));
  next(0);
}

/* ---------- HUD ---------- */
function questText() {
  return ['', 'QUEST: FIND THE CLIENT', 'QUEST: GO TO KORR',
    `QUEST: MINE LUNARRITE ${Math.floor(S.ore)}/${T.need}`, 'QUEST: RETURN TO FARPORT',
    'QUEST: DELIVER TO THE HUT', 'QUEST: LEAVE INTO SPACE', 'TUTORIAL COMPLETE'][S.step] || '';
}
const hud = () => `<div class="hud"><span>${S.ship}</span><span id="qt">${questText()}</span><span>${S.zeals.toLocaleString()} Z</span></div>`;

/* ---------- screens ---------- */
function render() {
  S.mining = false;
  const el = $('#screen');
  if (S.view === 'name') return renderName(el);
  if (S.view === 'planet') return renderPlanet(el);
  if (S.view === 'hut') return renderHut(el);
  if (S.view === 'travel') return renderTravel(el);
  if (S.view === 'map') return renderMap(el);
}

function renderName(el) {
  el.innerHTML = `<div class="center"><h1>CELESTIA</h1>
    <img src="assets/ship.gif" style="width:184px;height:112px;border:2px solid #fff">
    <div>NAME YOUR SHIP</div>
    <input id="nm" maxlength="24" value="${randName()}">
    <div style="display:flex;gap:12px"><button class="btn" id="rn">RANDOMIZE</button><button class="btn" id="go">LAUNCH</button></div></div>`;
  $('#rn').onclick = () => $('#nm').value = randName();
  $('#go').onclick = () => {
    S.ship = ($('#nm').value.trim() || randName()).toUpperCase();
    S.step = 1; S.view = 'planet'; S.loc = 'farport'; render();
    popups([`WELCOME, CAPTAIN OF THE ${S.ship}. THIS IS FARPORT, A JOB HUB PLANET.`,
      'JOBS COME FROM PEOPLE. SOMEONE HERE HAS ASKED FOR A PILOT. GO TO THEIR HUT.']);
  };
}

function renderPlanet(el) {
  const L = S.loc, P = PLACES[L];
  let acts = '', mid = '';
  if (L === 'farport') {
    if (S.step === 1 || S.step === 5) acts += `<button class="btn" id="hut">${S.step === 5 ? 'GO TO THE HUT (DELIVER)' : 'VISIT THE HUT'}</button>`;
    if (S.step === 2) acts += `<button class="btn" id="tk">TRAVEL TO KORR</button>`;
    if (S.step === 6) acts += `<button class="btn" id="leave">LEAVE INTO SPACE</button>`;
    if (S.step >= 7) acts += `<button class="btn" id="hut">VISIT THE HUT</button><button class="btn" id="map">OPEN MAP</button>`;
  } else {
    if (S.step === 3) {
      mid = `<div class="mid box"><div>LUNARRITE  TOUGHNESS ${T.toughness}</div>
        <div id="ore">${S.ore.toFixed(1)} / ${T.need}</div>
        <div class="bar"><div id="bar"></div></div></div>`;
      acts += `<button class="btn" id="mine">START MINING</button>`;
    }
    if (S.step === 4) acts += `<button class="btn" id="tf">TRAVEL TO FARPORT</button>`;
    if (S.step >= 7) acts += `<button class="btn" id="map">OPEN MAP</button>`;
  }
  el.innerHTML = `<img class="bg" src="assets/arrival-${L}.png" onerror="this.onerror=null;this.src='assets/${L}.png'">
    ${hud()}${mid}
    <div class="box" style="position:absolute;left:12px;top:46px;z-index:5">${P.name}<br><span style="font-size:8px">${P.sub}</span></div>
    <div class="actions">${acts}</div>`;
  const on = (id, f) => { const b = $('#' + id); if (b) b.onclick = f; };
  on('hut', () => { S.view = 'hut'; render(); });
  on('tk', () => startTravel('korr'));
  on('tf', () => startTravel('farport'));
  on('map', () => { S.view = 'map'; render(); });
  on('leave', leaveIntoSpace);
  on('mine', () => { S.mining = !S.mining; $('#mine').textContent = S.mining ? 'STOP MINING' : 'START MINING'; });
  updateOre();
}

function updateOre() {
  const o = $('#ore'); if (!o) return;
  o.textContent = `${S.ore.toFixed(1)} / ${T.need}`;
  $('#bar').style.width = (S.ore / T.need * 100) + '%';
  $('#qt').textContent = questText();
}

function renderHut(el) {
  let text, btn = '';
  if (S.step === 1) {
    text = `OLD TOBIN: "${S.ship}! I NEED ${T.need} LUNARRITE FROM KORR. I'LL PAY ${T.reward.toLocaleString()} ZEALS. BRING IT TO ME HERE."`;
    btn = '<button class="btn" id="ok">ACCEPT JOB</button>';
  } else if (S.step === 5) {
    text = `OLD TOBIN: "THAT'S ${T.need} LUNARRITE! HERE ARE YOUR ${T.reward.toLocaleString()} ZEALS."`;
    btn = '<button class="btn" id="ok">DELIVER LUNARRITE</button>';
  } else text = 'OLD TOBIN: "SAFE FLIGHTS, CAPTAIN."';
  el.innerHTML = `<div class="center"><div class="box" style="width:640px;line-height:2">${text}</div>
    <div style="display:flex;gap:12px">${btn}<button class="btn" id="bk">LEAVE HUT</button></div></div>${hud()}`;
  $('#bk').onclick = () => { S.view = 'planet'; render(); };
  const ok = $('#ok');
  if (ok) ok.onclick = () => {
    if (S.step === 1) {
      S.step = 2; S.view = 'planet'; render();
      popups(['JOB ACCEPTED: MINE 50 LUNARRITE ON KORR AND BRING IT BACK.',
        'PRESS TRAVEL TO KORR. THE JOURNEY TAKES 5 SECONDS.']);
    } else {
      S.step = 6; S.ore = 0; S.zeals += T.reward; S.view = 'planet'; render();
      popups([`JOB COMPLETE! +${T.reward.toLocaleString()} ZEALS.`, 'YOU ARE READY. PRESS LEAVE INTO SPACE.']);
    }
  };
}

/* ---------- travel ---------- */
const stars = Array.from({ length: 90 }, () => ({ x: Math.random() * 920, y: Math.random() * 560, s: 0.3 + Math.random() }));
function startTravel(to) { S.travel = { to, t: 0 }; S.view = 'travel'; render(); }
function renderTravel(el) {
  // Drop your own animations into assets/travel-warp.gif and assets/travel-remaining.png (92x56 art, any size works)
  el.innerHTML = `<canvas id="tc" width="920" height="560" style="position:absolute;inset:0"></canvas>
    <img id="warp" class="bg" src="assets/travel-warp.gif" onerror="this.onerror=null;this.src='assets/ship.gif'">
    <img id="rem" class="bg" src="assets/travel-remaining.png" style="display:none" onerror="this.remove()">
    <div class="tbar" id="tt"></div>`;
}
function tickTravel(dt) {
  const tr = S.travel; tr.t += dt;
  const warping = tr.t < T.warpSeconds;
  const remain = Math.max(0, T.travelSeconds - Math.max(0, tr.t - T.warpSeconds));
  const w = $('#warp'), r = $('#rem'), tt = $('#tt'); if (!tt) return;
  if (w) w.style.display = warping ? 'block' : 'none';
  if (r) r.style.display = warping ? 'none' : 'block';
  tt.textContent = warping ? 'ENGAGING WARP...' : `TRAVELLING TO ${PLACES[tr.to].name}  -  ${remain.toFixed(1)} S REMAINING`;
  const c = $('#tc').getContext('2d'); c.fillStyle = '#000'; c.fillRect(0, 0, 920, 560); c.fillStyle = '#fff';
  for (const s of stars) { s.x -= s.s * (warping ? 900 : 120) * dt; if (s.x < -60) { s.x = 940; s.y = Math.random() * 560; }
    c.fillRect(s.x, s.y, warping ? 40 * s.s : 4, 4); }
  if (tr.t >= T.warpSeconds + T.travelSeconds) arrive(tr.to);
}
function arrive(dest) {
  S.loc = dest; S.travel = null; S.view = 'planet';
  if (dest === 'korr' && S.step === 2) {
    S.step = 3; render();
    popups(['THIS IS KORR. LUNARRITE HAS A TOUGHNESS OF 0.3.',
      `TOUGHNESS 0.3 MEANS IT CAN BE MINED AT 3.3333X. YOUR RETRO MINER DOES 0.5/S, SO YOU MINE ${T.mineRate.toFixed(2)} PER SECOND.`,
      'PRESS START MINING AND COLLECT 50 LUNARRITE.']);
  } else if (dest === 'farport' && S.step === 4) {
    S.step = 5; render();
    popup('BACK AT FARPORT. TAKE THE LUNARRITE TO TOBIN\'S HUT.');
  } else render();
}

/* ---------- leaving into space: pixel boom, then the map unlocks ---------- */
function leaveIntoSpace() {
  S.step = 7; S.mapUnlocked = true;
  $('#screen').innerHTML = '';
  const c = $('#fx'), x = c.getContext('2d');
  const cols = ['#ffffff', '#bbbbbb', '#777777', '#f5a623'];
  const ps = Array.from({ length: 260 }, () => { const a = Math.random() * 6.283, v = 40 + Math.random() * 380;
    return { x: 460, y: 280, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c: rnd(cols), z: 4 + Math.floor(Math.random() * 3) * 4 }; });
  let t = 0, prev = performance.now();
  (function loop(now) {
    const dt = (now - prev) / 1000; prev = now; t += dt;
    x.clearRect(0, 0, 920, 560);
    for (const p of ps) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.985; p.vy *= 0.985;
      x.globalAlpha = Math.max(0, 1 - t / 2); x.fillStyle = p.c; x.fillRect(Math.round(p.x / 4) * 4, Math.round(p.y / 4) * 4, p.z, p.z); }
    x.globalAlpha = 1;
    if (t < 2) return requestAnimationFrame(loop);
    x.clearRect(0, 0, 920, 560);
    S.view = 'map'; render();
    popups(['SYSTEMS UNLOCKED: THE PORT SYSTEM AND THE LEAR SYSTEM.',
      'DRAG TO MOVE THE MAP. SHIFT + DRAG, THE MOUSE WHEEL OR THE ROTATE BUTTONS TURN IT. CLICK A PLANET TO TRAVEL.',
      'TUTORIAL COMPLETE.']);
  })(prev);
}

/* ---------- map ---------- */
const M = { cam: { x: 0, y: 0 }, rot: 0, sel: null, drag: null, moved: 0 };
function sysOf(loc) { return SYSTEMS.find(s => s.planet.id === loc); }
function renderMap(el) {
  const s = sysOf(S.loc); M.cam = { x: s.x, y: s.y }; M.sel = null;
  el.innerHTML = `<canvas class="map" id="mc" width="920" height="560"></canvas>${hud()}
    <div class="panel" id="mp"></div>
    <div class="actions" style="bottom:44px"><button class="btn" id="rl">&lt; ROTATE</button><button class="btn" id="rr">ROTATE &gt;</button></div>
    <div class="banner">MORE SYSTEMS - COMING SOON</div>`;
  const c = $('#mc');
  const pt = e => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * 920 / r.width, y: (e.clientY - r.top) * 560 / r.height }; };
  c.oncontextmenu = e => e.preventDefault();
  c.onpointerdown = e => { c.setPointerCapture(e.pointerId); M.drag = pt(e); M.moved = 0; };
  c.onpointermove = e => {
    if (!M.drag) return;
    const p = pt(e), dx = p.x - M.drag.x, dy = p.y - M.drag.y; M.moved += Math.abs(dx) + Math.abs(dy);
    if (e.shiftKey || e.buttons === 2) M.rot += dx * 0.01;
    else { const a = -M.rot; M.cam.x -= dx * Math.cos(a) - dy * Math.sin(a); M.cam.y -= dx * Math.sin(a) + dy * Math.cos(a); }
    M.drag = p;
  };
  c.onpointerup = e => { if (M.moved < 5) pick(pt(e)); M.drag = null; };
  c.onwheel = e => { e.preventDefault(); M.rot += e.deltaY * 0.002; };
  $('#rl').onclick = () => M.rot -= 0.3;
  $('#rr').onclick = () => M.rot += 0.3;
  panel();
}
const proj = (wx, wy) => { const dx = wx - M.cam.x, dy = wy - M.cam.y, c = Math.cos(M.rot), s = Math.sin(M.rot);
  return { x: 460 + dx * c - dy * s, y: 280 + dx * s + dy * c }; };
function planetPos(sys, time) { const p = sys.planet, a = p.angle + time * p.speed;
  return proj(sys.x + Math.cos(a) * sys.ring, sys.y + Math.sin(a) * sys.ring); }
function pick(p) {
  const t = performance.now() / 1000; M.sel = null;
  for (const s of SYSTEMS) { const q = planetPos(s, t); if (Math.hypot(q.x - p.x, q.y - p.y) < s.planet.r + 12) M.sel = s; }
  panel();
}
function panel() {
  const el = $('#mp'); if (!el) return;
  const s = M.sel; if (!s) { el.innerHTML = '<div class="box" style="font-size:8px">CLICK A PLANET</div>'; return; }
  const here = S.loc === s.planet.id;
  el.innerHTML = `<div class="box">${s.planet.name}<br><span style="font-size:8px">${s.name}<br>${here ? 'YOU ARE HERE' : '5 KILAYEARS = 5 SECONDS'}</span></div>
    <button class="btn" id="pgo">${here ? 'LAND' : 'TRAVEL TO ' + s.planet.name}</button>`;
  $('#pgo').onclick = () => here ? (S.view = 'planet', render()) : startTravel(s.planet.id);
}
function drawMap() {
  const c = $('#mc'); if (!c) return; const x = c.getContext('2d'), t = performance.now() / 1000;
  x.fillStyle = '#000'; x.fillRect(0, 0, 920, 560);
  x.fillStyle = '#444'; for (let i = 0; i < 70; i++) x.fillRect((i * 137) % 920, (i * 71) % 560, 2, 2);
  const a = proj(SYSTEMS[0].x, SYSTEMS[0].y), b = proj(SYSTEMS[1].x, SYSTEMS[1].y);
  x.strokeStyle = '#444'; x.setLineDash([6, 8]); x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); x.setLineDash([]);
  x.font = '8px "Press Start 2P", monospace'; x.textAlign = 'center';
  for (const s of SYSTEMS) {
    const c0 = proj(s.x, s.y);
    x.strokeStyle = '#999'; x.lineWidth = 2; x.beginPath(); x.arc(c0.x, c0.y, s.ring, 0, 6.283); x.stroke(); // grey, no fill
    x.fillStyle = '#f5a623'; x.beginPath(); x.arc(c0.x, c0.y, s.sun, 0, 6.283); x.fill();               // sun
    const q = planetPos(s, t);
    x.fillStyle = s.planet.color; x.beginPath(); x.arc(q.x, q.y, s.planet.r, 0, 6.283); x.fill();
    if (M.sel === s) { x.strokeStyle = '#fff'; x.strokeRect(q.x - s.planet.r - 6, q.y - s.planet.r - 6, s.planet.r * 2 + 12, s.planet.r * 2 + 12); }
    x.fillStyle = '#fff'; x.fillText(s.name, c0.x, c0.y + s.ring + 24);
    if (S.loc === s.planet.id) x.fillText('YOU', q.x, q.y - s.planet.r - 12);
  }
}

/* ---------- main loop ---------- */
function tick(now) {
  const dt = Math.min(0.25, (now - last) / 1000); last = now;
  if (playable) {
    if (S.view === 'travel' && S.travel) tickTravel(dt);
    else if (S.view === 'map') drawMap();
    else if (S.mining && S.view === 'planet' && S.loc === 'korr' && S.step === 3) {
      S.ore = Math.min(T.need, S.ore + T.mineRate * dt); updateOre();
      if (S.ore >= T.need) { S.mining = false; S.step = 4; render();
        popup('50 LUNARRITE COLLECTED! RETURN TO FARPORT TO DELIVER IT.'); }
    }
  }
  requestAnimationFrame(tick);
}
checkPlay(); render(); requestAnimationFrame(tick);
