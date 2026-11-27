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
  const obj = kind === 'gpu' ? gpu(m) : BUILD[kind](m);
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
