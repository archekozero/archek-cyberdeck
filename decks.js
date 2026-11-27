// decks.js : les 4 cyberdecks en 3D (three.js), la carte graphique du fond, et les données.
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

export const SMIC = 12.31;
export const DECKS = {
  '01': { name: "L'essentiel", slug: 'deck-01.html', bg: '#9FD8F5', ink: '#0B2BFF', screen: ['#00E0FF', '#0B2BFF'] },
  '02': { name: 'Tout dans le clavier', slug: 'deck-02.html', bg: '#FF8A3D', ink: '#1A0A00', screen: ['#FFE14D', '#FF3D7F'] },
  '03': { name: 'Le plus petit', slug: 'deck-03.html', bg: '#C9B8FF', ink: '#2A0D7A', screen: ['#B8FF5C', '#7A3DFF'] },
  '04': { name: 'Petit budget', slug: 'deck-04.html', bg: '#8FE3B0', ink: '#00361A', screen: ['#FF7A00', '#00A86B'] },
};

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- matières ----------
function mats(scr) {
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xE9C46A, metalness: 1, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 });
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xE6E8EE, metalness: 1, roughness: 0.12, clearcoat: 1 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xDDF2FF, metalness: 0, roughness: 0.05, transmission: 0.92, thickness: 0.6, ior: 1.45, clearcoat: 1 });
  const black = new THREE.MeshPhysicalMaterial({ color: 0x121212, metalness: 0.2, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.2 });
  const key = new THREE.MeshPhysicalMaterial({ color: 0xF4F1EA, metalness: 0, roughness: 0.4, clearcoat: 0.6 });
  const pcb = new THREE.MeshPhysicalMaterial({ color: 0x1F7A4D, metalness: 0.3, roughness: 0.5 });
  const screen = new THREE.MeshBasicMaterial({ map: screenTex(scr) });
  return { gold, chrome, glass, black, key, pcb, screen };
}

// écran : un dégradé vif avec des lignes de code, comme les écrans des objets du reel
function screenTex([a, b]) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 320;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 512, 320); g.addColorStop(0, a); g.addColorStop(1, b);
  x.fillStyle = g; x.fillRect(0, 0, 512, 320);
  x.fillStyle = 'rgba(255,255,255,.18)'; for (let y = 0; y < 320; y += 4) x.fillRect(0, y, 512, 1);
  x.font = '600 22px monospace'; x.fillStyle = 'rgba(0,0,0,.65)';
  ['archek@deck ~', '> whoami', 'cyberdeck v0', '> ./budget --max 200', 'ok : sous le budget'].forEach((l, i) => x.fillText(l, 26, 52 + i * 46));
  x.fillStyle = '#fff'; x.fillRect(320, 230, 14, 26);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const rb = (w, h, d, r = 0.05) => new RoundedBoxGeometry(w, h, d, 4, r);
function keyboard(m, cols, rows, w, d, y) {
  const g = new THREE.Group(), kw = w / cols * 0.82, kd = d / rows * 0.78, geo = rb(kw, 0.05, kd, 0.015);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = new THREE.Mesh(geo, m.key); k.position.set(-w / 2 + (c + 0.5) * w / cols, y, -d / 2 + (r + 0.5) * d / rows); g.add(k);
  }
  return g;
}

// ---------- les 4 modèles ----------
function deck01(m) { // mallette dorée ouverte : écran dans le couvercle, clavier dans le fond
  const g = new THREE.Group();
  const body = new THREE.Mesh(rb(2.4, 0.45, 1.6, 0.08), m.gold); g.add(body);
  const inner = new THREE.Mesh(rb(2.2, 0.06, 1.4, 0.03), m.black); inner.position.y = 0.21; g.add(inner);
  g.add(keyboard(m, 12, 4, 1.7, 0.75, 0.27).translateZ(0.25));
  const pi = new THREE.Mesh(rb(0.55, 0.05, 0.38, 0.02), m.pcb); pi.position.set(0.82, 0.27, -0.38); g.add(pi);
  const lid = new THREE.Group(); lid.position.set(0, 0.22, -0.78);
  const lidB = new THREE.Mesh(rb(2.4, 1.5, 0.12, 0.06), m.gold); lidB.position.set(0, 0.75, -0.04); lid.add(lidB);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 1.08), m.screen); scr.position.set(0, 0.78, 0.03); lid.add(scr);
  const bez = new THREE.Mesh(rb(1.95, 1.26, 0.05, 0.03), m.black); bez.position.set(0, 0.78, 0.0); lid.add(bez);
  lid.rotation.x = -0.32; g.add(lid);
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 12, 32, Math.PI), m.chrome); h.position.set(0, 0.1, 0.85); h.rotation.x = Math.PI / 2; g.add(h);
  return g;
}
function deck02(m) { // le clavier Pi 400 en chrome avec un écran posé sur un pied
  const g = new THREE.Group();
  const kb = new THREE.Mesh(rb(2.5, 0.22, 1.05, 0.08), m.chrome); kb.rotation.x = 0.08; g.add(kb);
  g.add(keyboard(m, 14, 5, 2.2, 0.85, 0.14));
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.9, 16), m.black); stand.position.set(0, 0.45, -0.85); g.add(stand);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.05, 32), m.black); foot.position.set(0, 0.0, -0.85); g.add(foot);
  const disp = new THREE.Group(); disp.position.set(0, 1.25, -0.9); disp.rotation.x = -0.12;
  disp.add(new THREE.Mesh(rb(2.0, 1.25, 0.1, 0.05), m.glass));
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.0), m.screen); s.position.z = 0.06; disp.add(s);
  g.add(disp);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshBasicMaterial({ color: 0xFF3D3D })); led.position.set(1.05, 0.14, 0.4); g.add(led);
  return g;
}
function deck03(m) { // un petit deck de poche translucide, façon console portable
  const g = new THREE.Group();
  const shell = new THREE.Mesh(rb(1.3, 2.1, 0.32, 0.18), m.glass); g.add(shell);
  const back = new THREE.Mesh(rb(1.2, 2.0, 0.08, 0.12), m.gold); back.position.z = -0.12; g.add(back);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.72), m.screen); s.position.set(0, 0.5, 0.17); g.add(s);
  const kb = keyboard(m, 6, 4, 0.95, 0.62, 0); kb.rotation.x = Math.PI / 2; kb.position.set(0, -0.45, 0.17); g.add(kb);
  const pi = new THREE.Mesh(rb(0.65, 0.3, 0.04, 0.02), m.pcb); pi.position.set(0, -0.2, 0.0); g.add(pi);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 12), m.chrome); ant.position.set(0.5, 1.35, 0); g.add(ant);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), m.chrome); tip.position.set(0.5, 1.72, 0); g.add(tip);
  g.rotation.x = -0.25;
  return g;
}
function deck04(m) { // boîte argentée compacte, écran incliné, gros boutons
  const g = new THREE.Group();
  const body = new THREE.Mesh(rb(2.0, 0.6, 1.3, 0.12), m.chrome); g.add(body);
  g.add(keyboard(m, 10, 3, 1.5, 0.5, 0.33).translateZ(0.3));
  const wedge = new THREE.Group(); wedge.position.set(0, 0.32, -0.25); wedge.rotation.x = -0.55;
  wedge.add(new THREE.Mesh(rb(1.6, 0.95, 0.12, 0.05), m.black).translateY(0.45));
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.38, 0.78), m.screen); s.position.set(0, 0.45, 0.065); wedge.add(s);
  g.add(wedge);
  [-0.75, 0.75].forEach(x => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 24), m.gold); b.position.set(x, 0.34, 0.15); g.add(b); });
  const knob = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 12, 32), m.gold); knob.position.set(0.85, 0.34, -0.45); knob.rotation.x = Math.PI / 2; g.add(knob);
  return g;
}
const BUILD = { '01': deck01, '02': deck02, '03': deck03, '04': deck04 };

// ---------- la carte graphique du fond ----------
function gpu(m) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(rb(4.2, 0.5, 1.6, 0.08), m.black));
  const plate = new THREE.Mesh(rb(4.25, 0.06, 1.62, 0.03), m.chrome); plate.position.y = -0.27; g.add(plate);
  const fans = [];
  [-1.3, 0, 1.3].forEach(x => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.05, 12, 48), m.chrome); ring.rotation.x = Math.PI / 2; ring.position.set(x, 0.27, 0); g.add(ring);
    const fan = new THREE.Group(); fan.position.set(x, 0.28, 0);
    for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.015, 0.16), m.glass); b.position.x = 0.27; const p = new THREE.Group(); p.add(b); p.rotation.y = i / 9 * Math.PI * 2; b.rotation.x = 0.5; fan.add(p); }
    fan.add(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 24), m.gold));
    g.add(fan); fans.push(fan);
  });
  const fingers = new THREE.Mesh(rb(2.2, 0.05, 0.22, 0.01), m.gold); fingers.position.set(-0.6, -0.28, 0.9); g.add(fingers);
  const io = new THREE.Mesh(rb(0.08, 0.7, 1.7, 0.02), m.chrome); io.position.set(2.15, 0, 0); g.add(io);
  g.userData.fans = fans;
  return g;
}

// ---------- la carte mère (avec la carte graphique branchée dessus) ----------
function pcbTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 768; const x = c.getContext('2d');
  x.fillStyle = '#0c1f16'; x.fillRect(0, 0, 1024, 768);
  x.strokeStyle = 'rgba(233,196,106,.55)'; x.lineWidth = 2;
  let seed = 3; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 170; i++) {                       // pistes en angles droits et à 45°, comme une vraie carte
    let px = r() * 1024, py = r() * 768; x.beginPath(); x.moveTo(px, py);
    for (let k = 0; k < 4; k++) { const d = 30 + r() * 140, a = [0, 1, 2, 3, 4, 5, 6, 7][(r() * 8) | 0] * Math.PI / 4; px += Math.cos(a) * d; py += Math.sin(a) * d; x.lineTo(px, py); }
    x.stroke(); x.fillStyle = 'rgba(233,196,106,.8)'; x.beginPath(); x.arc(px, py, 3.5, 0, 7); x.fill();
  }
  x.fillStyle = 'rgba(255,255,255,.35)'; x.font = '600 18px monospace';
  ['ARCHEK-MB  REV 0.1', 'PCIE_X16', 'DIMM_A1  DIMM_A2', 'CPU_FAN', 'BIOS', 'USB3_1', 'M.2_1'].forEach((t, i) => x.fillText(t, 40 + (i % 3) * 330, 60 + Math.floor(i / 3) * 300));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function rig(m) {
  const g = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(6, 0.08, 4.6), [m.pcb, m.pcb, new THREE.MeshPhysicalMaterial({ map: pcbTex(), roughness: 0.45, metalness: 0.2, clearcoat: 0.6 }), m.pcb, m.pcb, m.pcb]);
  g.add(board);
  const sock = new THREE.Mesh(rb(1.2, 0.18, 1.2, 0.04), m.chrome); sock.position.set(-0.6, 0.12, -0.9); g.add(sock);
  const cpu = new THREE.Mesh(rb(0.9, 0.06, 0.9, 0.03), m.gold); cpu.position.set(-0.6, 0.24, -0.9); g.add(cpu);
  for (let i = 0; i < 4; i++) { const d = new THREE.Mesh(rb(0.09, 0.32, 2.2, 0.02), i % 2 ? m.black : m.chrome); d.position.set(0.55 + i * 0.22, 0.2, -0.9); g.add(d); }
  for (let i = 0; i < 14; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 14), m.chrome); c.position.set(-2.4 + (i % 7) * 0.22, 0.15, -2.0 + Math.floor(i / 7) * 0.26); g.add(c); }
  const hs = new THREE.Mesh(rb(1.1, 0.35, 0.6, 0.05), m.black); hs.position.set(-2.1, 0.22, 0.2); g.add(hs);
  const slot = new THREE.Mesh(rb(3.4, 0.12, 0.16, 0.02), m.black); slot.position.set(0.2, 0.1, 1.15); g.add(slot);
  const card = gpu(m); card.scale.setScalar(0.85); card.rotation.x = Math.PI / 2; card.position.set(0.2, 0.85, 1.15); g.add(card);
  g.userData.fans = card.userData.fans;
  return g;
}

// ---------- monter une scène dans un canvas ----------
export function mount(canvas, kind, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 5, 4); scene.add(key);
  const cam = new THREE.PerspectiveCamera(opts.fov || 32, 1, 0.1, 100); cam.position.set(0, opts.camY ?? 2.2, opts.dist || 7); cam.lookAt(0, opts.lookY ?? 0.3, 0);
  const m = mats(DECKS[kind]?.screen || ['#222', '#000']);
  const obj = kind === 'gpu' ? gpu(m) : kind === 'rig' ? rig(m) : BUILD[kind](m);
  obj.scale.setScalar(opts.scale || 1); scene.add(obj);
  let mx = 0, my = 0, hover = 0, drag = null, spin = opts.spin ?? 0.004, ry = opts.ry ?? -0.5, rx = 0, visible = true, dirty = true;
  const target = opts.follow === 'window' ? window : canvas;
  target.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2; my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (drag) { ry += (e.clientX - drag) * 0.01; drag = e.clientX; }
  }, { passive: true });
  if (opts.drag) { canvas.addEventListener('pointerdown', e => { drag = e.clientX; canvas.setPointerCapture(e.pointerId); }); canvas.addEventListener('pointerup', () => drag = null); }
  canvas.addEventListener('pointerenter', () => hover = 1); canvas.addEventListener('pointerleave', () => { hover = 0; mx = my = 0; });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(canvas);
  function size() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); dirty = true; }
  size(); addEventListener('resize', size);
  let t0 = performance.now();
  (function loop(t) {
    requestAnimationFrame(loop);
    if (!visible) return;
    const dt = Math.min(50, t - t0); t0 = t;
    if (!reduce) { ry += spin * (1 + hover * 3) * dt / 16; if (obj.userData.fans) obj.userData.fans.forEach(f => f.rotation.y += 0.08 * dt / 16); }
    rx += ((my * 0.25) - rx) * 0.08;
    obj.rotation.y = ry + mx * 0.35; obj.rotation.x = rx + (opts.tilt || 0);
    obj.position.y = reduce ? 0 : Math.sin(t / 900) * 0.06;
    renderer.render(scene, cam);
  })(t0);
  return { scene, obj };
}

// ---------- petites étoiles noires à 4 branches, qui scintillent ----------
export function stars(el, n = 26, color = '#111') {
  for (let i = 0; i < n; i++) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), z = 8 + Math.random() * 18;
    s.setAttribute('viewBox', '0 0 20 20'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = `<path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0Z" fill="${color}"/>`;
    s.style.cssText = `position:absolute;left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${z}px;height:${z}px;opacity:${0.25 + Math.random() * 0.6};animation:tw ${2 + Math.random() * 4}s ${-Math.random() * 4}s ease-in-out infinite`;
    el.appendChild(s);
  }
}

// ---------- transition glitch avant de changer de page ----------
export function glitchLinks() {
  document.querySelectorAll('a[data-go]').forEach(a => a.addEventListener('click', e => {
    if (reduce || e.metaKey || e.ctrlKey) return;
    e.preventDefault(); document.documentElement.classList.add('glitch');
    setTimeout(() => location.href = a.href, 380);
  }));
}

// ---------- côté hacker : pluie de code, ligne de terminal qui s'écrit ----------
const SRC = "import { Raspberry } from '@archek/cerveau'; const deck = useProjet('prochain', { max: 200 }); sudo ./build --deck 01; ssh archek@deck; cat /proc/cpuinfo; echo $BATTERY; 0x1F 0xA4 0x7E ";
export function codeRain(canvas, color = 'rgba(246,211,0,') {
  const x = canvas.getContext('2d'); let W, H, cols, drops, fs = 14;
  function size() { const d = Math.min(2, devicePixelRatio || 1); W = canvas.width = innerWidth * d; H = canvas.height = innerHeight * d; fs = 13 * d; cols = Math.floor(W / (fs * 1.6)); drops = Array.from({ length: cols }, () => Math.random() * -60); }
  size(); addEventListener('resize', size);
  let last = 0;
  (function f(t) { requestAnimationFrame(f); if (reduce || t - last < 60) return; last = t;
    x.fillStyle = 'rgba(0,0,0,.16)'; x.globalCompositeOperation = 'destination-out'; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over';
    x.font = `${fs}px "JetBrains Mono", monospace`;
    for (let i = 0; i < cols; i++) { const y = drops[i] * fs; if (y > 0) { x.fillStyle = color + (Math.random() < .08 ? '.9)' : '.35)'); x.fillText(SRC[(i * 7 + (drops[i] | 0)) % SRC.length], i * fs * 1.6, y); }
      drops[i] += 0.6 + (i % 3) * 0.25; if (y > H && Math.random() > 0.96) drops[i] = Math.random() * -20; }
  })(0);
}
export function typeLines(el, lines, speed = 26) {
  if (reduce) { el.innerHTML = lines.map(l => l.replace(/&/g, '&amp;').replace(/</g, '&lt;')).join('<br>') + '<i class="cur"></i>'; return; }
  let li = 0, ch = 0, out = '';
  (function step() {
    if (li >= lines.length) { el.innerHTML = out + '<i class="cur"></i>'; return; }
    const l = lines[li];
    if (ch <= l.length) { el.innerHTML = out + l.slice(0, ch).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '<i class="cur"></i>'; ch++; setTimeout(step, speed); }
    else { out += l.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '<br>'; li++; ch = 0; setTimeout(step, 240); }
  })();
}
