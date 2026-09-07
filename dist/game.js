/**
 * corp.exe — FP cubicle → sit → Win95-on-CRT → day loop
 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import copy from "./copy-data.js";
import { createWin95, W as CRT_W, H as CRT_H } from "./win95.js";
import * as audio from "./audio.js";

const $ = (id) => document.getElementById(id);
const canvas3d = $("game-canvas");
canvas3d.style.pointerEvents = "auto"; // bubbles to #stage for sit + CRT clicks; title screen sits above
const toastEl = $("toast");
const hudPrompt = $("hud-prompt");

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id)?.classList.add("active");
}
function toast(msg, ok = false) {
  toastEl.textContent = msg;
  toastEl.className = "toast show" + (ok ? " ok" : "");
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => (toastEl.className = "toast"), 1600);
}
function setPrompt(t) {
  if (!t) {
    hudPrompt.hidden = true;
    return;
  }
  hudPrompt.hidden = false;
  hudPrompt.textContent = t;
}

function setDesktopFullscreen(on) {
  const ov = $("desktop-overlay");
  if (!ov || !win95?.canvas) return;
  if (on) {
    if (win95.canvas.parentElement !== ov) ov.appendChild(win95.canvas);
    ov.hidden = false;
    ov.classList.add("show");
    canvas3d.style.visibility = "hidden";
  } else {
    ov.classList.remove("show");
    ov.hidden = true;
    canvas3d.style.visibility = "visible";
  }
}

function overlayPointer(e) {
  const ov = $("desktop-overlay");
  const el = ov?.querySelector("canvas") || win95.canvas;
  const rect = el.getBoundingClientRect();
  const cx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * CRT_W;
  const cy = ((e.clientY - rect.top) / Math.max(1, rect.height)) * CRT_H;
  return { cx, cy };
}


/* —— Game state —— */
const G = {
  phase: "title", // title | boot | walk | sit | seated | ending
  muted: false,
  keys: Object.create(null),
  yaw: 0,
  lookX: 0,
  lookY: 0,
  canSit: false,
  sitT: 0,
  handTypeT: 0,
  handClickT: 0,
  slackTimer: null,
  assetsReady: false,
};

/* Tagline from Writer */
if (copy.boot?.titleTagline) $("title-tagline").textContent = copy.boot.titleTagline;
if (copy.boot?.clockInButton) $("btn-clock-in").textContent = copy.boot.clockInButton;

/* ================================================================
 * THREE + PS1 pipeline
 * ================================================================ */
const RT_W = 320;
const RT_H = 240;
const renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: false, powerPreference: "low-power" });
renderer.setSize(RT_W, RT_H, false);
renderer.setPixelRatio(1);
renderer.setClearColor(0x2a2820, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2820);
scene.fog = new THREE.Fog(0x3a3830, 8, 28);

const camera = new THREE.PerspectiveCamera(60, RT_W / RT_H, 0.08, 60);
const player = {
  pos: new THREE.Vector3(0, 1.55, 3.2),
  eye: 1.55,
  speed: 1.8,
};
camera.position.copy(player.pos);

const renderTarget = new THREE.WebGLRenderTarget(RT_W, RT_H, {
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter,
  generateMipmaps: false,
});
const postUniforms = {
  tDiffuse: { value: null },
  uTime: { value: 0 },
  uRes: { value: new THREE.Vector2(RT_W, RT_H) },
};
const postScene = new THREE.Scene();
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
postScene.add(
  new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: postUniforms,
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
      fragmentShader: `
        uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes; varying vec2 vUv;
        float bayer(vec2 p){
          int x=int(mod(p.x,4.)); int y=int(mod(p.y,4.)); int i=x+y*4;
          float m[16]; m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;
          m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
          return m[i]/16.;
        }
        void main(){
          vec2 uv=vUv;
          // light affine wobble only — no Bayer checker / posterize on the frame
          uv.x += sin(uv.y*32.+uTime)*.35/uRes.x;
          vec4 c=texture2D(tDiffuse,uv);
          gl_FragColor=c;
        }`,
    })
  )
);

/* FARM.md lighting — bright, still PS1 */
scene.add(new THREE.AmbientLight(0x8a8680, 1.35));
const keyL = new THREE.DirectionalLight(0xd0c8b0, 0.95);
keyL.position.set(2, 8, 4);
scene.add(keyL);
const fluo = new THREE.PointLight(0xe8e4c8, 1.2, 8);
fluo.position.set(0, 2.4, -1);
scene.add(fluo);
/* fluorescents every ~2–3 cells along Z */
for (let iz = -8; iz <= 4; iz += 2) {
  for (const ix of [-8, -4, 0, 4, 8]) {
    const fl = new THREE.PointLight(0xe8e4c8, 0.5, 5.5);
    fl.position.set(ix * 2.2, 2.45, iz * 2.6);
    scene.add(fl);
  }
}

const OfficeRoot = new THREE.Group();
OfficeRoot.name = "OfficeRoot";
scene.add(OfficeRoot);

const nodes = {};
const SEAT = new THREE.Vector3(0.0, 0, 0.4); // chair spot (XZ)
const SIT_CAM = new THREE.Vector3(0.15, 1.2, 0.55);
const SIT_LOOK = new THREE.Vector3(0.0, 1.05, -0.55);
const SIT_RADIUS = 3.2; // almost whole cubicle — E should work once you see the CRT

function forceNearest(root) {
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (m.map) {
        m.map.magFilter = THREE.NearestFilter;
        m.map.minFilter = THREE.NearestFilter;
        m.map.generateMipmaps = false;
        m.map.needsUpdate = true;
      }
      m.flatShading = true;
      if ("emissive" in m) {
        m.emissive = m.emissive || new THREE.Color(0x000000);
        m.emissive.setHex(0x222018);
        m.emissiveIntensity = Math.max(m.emissiveIntensity || 0, 0.35);
      }
      m.needsUpdate = true;
      if (!m.userData._snap) {
        m.userData._snap = true;
        const prev = m.onBeforeCompile;
        m.onBeforeCompile = (shader, r) => {
          if (prev) prev(shader, r);
          shader.uniforms.uSnapAmount = { value: 72.0 };
          if (!shader.vertexShader.includes("uSnapAmount")) {
            shader.vertexShader = "uniform float uSnapAmount;\n" + shader.vertexShader;
          }
          shader.vertexShader = shader.vertexShader.replace(
            "#include <project_vertex>",
            `#include <project_vertex>
             gl_Position.xy = floor(gl_Position.xy * uSnapAmount + 0.5) / uSnapAmount;`
          );
        };
        m.customProgramCacheKey = () => "ps1snap72";
      }
    }
  });
}

const loader = new GLTFLoader();
async function loadModel(path) {
  const g = await loader.loadAsync(path);
  forceNearest(g.scene);
  return g.scene;
}

/* Win95 CRT */
const win95 = createWin95(copy, {
  onStandupDone: () => {
    toast("Day started. The fog approves.", true);
    startSlackNoise();
    win95.enableDaySystems();
  },
  onTicketDone: () => {},
  onClockOut: () => clockOut(),
  onPrOpen: () => {
    if (nodes.KyleBust) nodes.KyleBust.visible = true;
  },
  onPrClose: () => {
    if (nodes.KyleBust) nodes.KyleBust.visible = false;
  },
  onType: () => {
    G.handTypeT = 0.25;
  },
  onClick: () => {
    G.handClickT = 0.15;
  },
});

const crtTex = new THREE.CanvasTexture(win95.canvas);
crtTex.magFilter = THREE.NearestFilter;
crtTex.minFilter = THREE.NearestFilter;
crtTex.generateMipmaps = false;
crtTex.colorSpace = THREE.SRGBColorSpace;
crtTex.flipY = true;

let screenMesh = null;
let handsRoot = null;
let keyboardMesh = null;
let mouseMesh = null;

async function loadOffice() {
  let paths;
  try {
    const man = await (await fetch("assets/manifest.json")).json();
    paths = man.models;
  } catch {
    paths = [
      "assets/models/cubicle.glb",
      "assets/models/neighbor_bay.glb",
      "assets/models/desk_set.glb",
      "assets/models/hands.glb",
      "assets/models/keyboard.glb",
      "assets/models/kyle_bust.glb",
      "assets/models/mouse.glb",
      "assets/models/prop_dead_plant.glb",
      "assets/models/prop_mug.glb",
      "assets/models/prop_stickies.glb",
      "assets/models/prop_ticket.glb",
      "assets/models/screen_quad.glb",
      "assets/models/slack_panel.glb",
    ];
  }
  const by = {};
  await Promise.all(
    paths.map(async (p) => {
      const name = p.split("/").pop().replace(/\.glb$/i, "");
      by[name] = await loadModel(p);
    })
  );

  // Cubicle farm hellscape — FARM.md (2.2×2.6, ≥200 neighbor CRTs)
  const farm = new THREE.Group();
  farm.name = "CubicleFarm";
  const PITCH_X = 2.2;
  const PITCH_Z = 2.6;
  const crtGreen = new THREE.MeshBasicMaterial({ color: 0x5ecf4a, toneMapped: false });
  const crtTeal = new THREE.MeshBasicMaterial({ color: 0x3ec8b0, toneMapped: false });
  const crtDim = new THREE.MeshBasicMaterial({ color: 0x2a6030, toneMapped: false });
  const deskMat = new THREE.MeshBasicMaterial({ color: 0x2a2820 });
  const wallMat = new THREE.MeshBasicMaterial({ color: 0x3d3a32 });
  const crtGeo = new THREE.PlaneGeometry(0.36, 0.26);
  const deskGeo = new THREE.BoxGeometry(1.0, 0.05, 0.5);
  const wallGeo = new THREE.BoxGeometry(2.0, 1.2, 0.06);

  function makeNeighborProxy(ix, iz) {
    const g = new THREE.Group();
    g.name = `Neighbor_${ix}_${iz}`;
    const back = new THREE.Mesh(wallGeo, wallMat);
    back.position.set(0, 0.7, -0.9);
    g.add(back);
    const side = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 1.2, 1.6),
      wallMat
    );
    side.position.set(-0.95, 0.7, -0.2);
    g.add(side);
    const deskProxy = new THREE.Mesh(deskGeo, deskMat);
    deskProxy.position.set(0, 0.74, -0.35);
    g.add(deskProxy);
    const far = Math.abs(ix) > 6 || iz < -5;
    const mat = far ? crtDim : (ix + iz) % 2 === 0 ? crtGreen : crtTeal;
    const glow = new THREE.Mesh(crtGeo, mat);
    glow.position.set(0, 1.02, -0.58);
    glow.rotation.y = Math.PI; // face +Z aisle
    g.add(glow);
    return g;
  }

  function prepNeighborBay(root) {
    root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (m.map) {
          m.map.magFilter = THREE.NearestFilter;
          m.map.minFilter = THREE.NearestFilter;
          m.map.generateMipmaps = false;
        }
        if ("emissive" in m) {
          m.emissive = new THREE.Color(0x5ecf4a);
          m.emissiveIntensity = Math.max(m.emissiveIntensity || 0, 1.0);
        }
        m.needsUpdate = true;
      }
    });
  }

  // player home bay — full cubicle only
  const c0 = by.cubicle.clone();
  c0.name = "Cubicle";
  c0.position.set(0, 0, 0);
  farm.add(c0);

  let neighborCount = 0;
  const hasBay = !!by.neighbor_bay;
  for (let ix = -10; ix <= 10; ix++) {
    for (let iz = -8; iz <= 4; iz++) {
      if (ix === 0 && iz === 0) continue;
      const x = ix * PITCH_X;
      const z = iz * PITCH_Z;
      let bay;
      if (hasBay) {
        bay = by.neighbor_bay.clone();
        prepNeighborBay(bay);
      } else {
        bay = makeNeighborProxy(ix, iz);
      }
      bay.position.set(x, 0, z);
      farm.add(bay);
      neighborCount++;
    }
  }
  OfficeRoot.add(farm);
  forceNearest(farm);
  console.info(
    "[corp.exe] farm neighbors",
    neighborCount,
    hasBay ? "(neighbor_bay.glb)" : "(proxy until neighbor_bay.glb lands)"
  );


  const desk = by.desk_set;
  desk.name = "DeskSet";
  desk.position.set(0, 0, -0.8);
  OfficeRoot.add(desk);
  nodes.DeskSet = desk;

  // screen_quad at screen_anchor (local to desk)
  const anchor = desk.getObjectByName("screen_anchor");
  const screen = by.screen_quad;
  screen.name = "screen_quad";
  if (anchor) {
    anchor.add(screen);
    screen.position.set(0, 0, 0.02);
    // face toward seated camera (+Z in desk space)
    screen.rotation.set(0, 0, 0);
  } else {
    screen.position.set(0, 1.02, -0.68);
    OfficeRoot.add(screen);
  }
  screen.traverse((o) => {
    if (o.isMesh) {
      o.material = new THREE.MeshBasicMaterial({ map: crtTex, toneMapped: false });
      screenMesh = o;
    }
  });
  if (!screenMesh) {
    // fallback plane
    const pl = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.32),
      new THREE.MeshBasicMaterial({ map: crtTex, toneMapped: false })
    );
    pl.position.set(0, 1.02, -0.68);
    OfficeRoot.add(pl);
    screenMesh = pl;
  }

  // keyboard / mouse at anchors
  const kbA = desk.getObjectByName("keyboard_anchor");
  keyboardMesh = by.keyboard;
  if (kbA) kbA.add(keyboardMesh);
  else {
    keyboardMesh.position.set(0, 0.77, -0.55);
    OfficeRoot.add(keyboardMesh);
  }

  const msA = desk.getObjectByName("mouse_anchor");
  mouseMesh = by.mouse;
  if (msA) msA.add(mouseMesh);
  else {
    mouseMesh.position.set(0.45, 0.77, -0.6);
    OfficeRoot.add(mouseMesh);
  }

  // props
  const props = new THREE.Group();
  props.name = "Props";
  const layout = [
    ["prop_mug", [0.45, 0.77, -0.35]],
    ["prop_stickies", [-0.5, 0.77, -0.2]],
    ["prop_dead_plant", [0.7, 0.77, 0.15]],
    ["prop_ticket", [-0.2, 0.78, -0.05]],
  ];
  for (const [k, pos] of layout) {
    if (!by[k]) continue;
    by[k].position.set(...pos);
    props.add(by[k]);
  }
  OfficeRoot.add(props);

  const slack = by.slack_panel;
  slack.position.set(-1.1, 1.15, -0.2);
  OfficeRoot.add(slack);

  nodes.KyleBust = by.kyle_bust;
  nodes.KyleBust.position.set(0.9, 0.95, 0.2);
  nodes.KyleBust.rotation.y = -0.6;
  nodes.KyleBust.visible = false;
  OfficeRoot.add(nodes.KyleBust);

  // Hands — parent to camera for FP view when seated
  handsRoot = by.hands;
  handsRoot.name = "Hands";
  handsRoot.visible = false;
  handsRoot.position.set(0, -0.35, -0.55);
  handsRoot.rotation.x = 0.35;
  camera.add(handsRoot);
  scene.add(camera);

  G.assetsReady = true;
  console.info("[corp.exe] office ready", Object.keys(by));
}

/* CRT pointer helpers (hoisted for sit raycast) */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

/* —— Movement / sit —— */
const clock = new THREE.Clock();
let footAcc = 0;

function updateWalk(dt) {
  const forward = (G.keys["w"] || G.keys["arrowup"] ? 1 : 0) - (G.keys["s"] || G.keys["arrowdown"] ? 1 : 0);
  const strafe = (G.keys["d"] || G.keys["arrowright"] ? 1 : 0) - (G.keys["a"] || G.keys["arrowleft"] ? 1 : 0);
  if (forward || strafe) {
    const ang = G.yaw;
    const fx = -Math.sin(ang);
    const fz = -Math.cos(ang);
    const rx = Math.cos(ang);
    const rz = -Math.sin(ang);
    player.pos.x += (fx * forward + rx * strafe) * player.speed * dt;
    player.pos.z += (fz * forward + rz * strafe) * player.speed * dt;
    // soft bounds — match dense 7×5 @ 2.5m farm
    player.pos.x = THREE.MathUtils.clamp(player.pos.x, -7.5, 7.5);
    player.pos.z = THREE.MathUtils.clamp(player.pos.z, -4.5, 6.0);
    footAcc += dt;
    if (footAcc > 0.38) {
      footAcc = 0;
      audio.footstep();
    }
  }
  camera.position.set(player.pos.x, player.eye, player.pos.z);
  camera.rotation.order = "YXZ";
  camera.rotation.y = G.yaw;
  camera.rotation.x = G.lookY;

  // player.pos.y is eye height — only XZ matters
  const dist = Math.hypot(player.pos.x - SEAT.x, player.pos.z - SEAT.z);
  // also allow sit if CRT is in view (ray from camera center)
  let lookingAtDesk = false;
  if (screenMesh) {
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycaster.intersectObject(screenMesh, true);
    lookingAtDesk = hits.length > 0;
  }
  G.canSit = dist < SIT_RADIUS || lookingAtDesk || player.pos.z < 1.8;
  const sitBtn = $("btn-sit");
  if (sitBtn) {
    sitBtn.hidden = !G.canSit;
    sitBtn.style.pointerEvents = G.canSit ? "auto" : "none";
  }
  setPrompt(
    G.canSit
      ? "E / Space / SIT — Cubicle 4-B"
      : "WASD · walk toward the glowing CRT"
  );
  // soft auto-sit if basically on the chair
  if (dist < 0.85) {
    G._autoSitT = (G._autoSitT || 0) + dt;
    if (G._autoSitT > 0.45) beginSit();
  } else {
    G._autoSitT = 0;
  }
}

function beginSit() {
  if (G.phase !== "walk") return;
  G.phase = "sit";
  G.canSit = false;
  const sitBtn = $("btn-sit");
  if (sitBtn) sitBtn.hidden = true;
  setPrompt("Sitting…");
  try { audio.playSfx("sit"); } catch (_) {}
  G.sitT = 0;
}

function updateSit(dt) {
  G.sitT += dt;
  const t = Math.min(1, G.sitT / 1.1);
  const e = t * t * (3 - 2 * t);
  camera.position.lerpVectors(player.pos.clone().setY(player.eye), SIT_CAM, e);
  const look = new THREE.Vector3().lerpVectors(
    new THREE.Vector3(player.pos.x, player.eye, player.pos.z - 1),
    SIT_LOOK,
    e
  );
  camera.lookAt(look);
  if (t >= 1) {
    G.phase = "seated";
    handsRoot && (handsRoot.visible = false); // fullscreen desktop — hide FP hands chrome
    audio.playSfx("crtOn");
    audio.playBgm("bgmDesk");
    setDesktopFullscreen(true);
    setPrompt("Fullscreen desktop · Start → Shut Down to clock out · Esc backs out later");
    toast((copy.boot?.bootToasts && copy.boot.bootToasts[0]) || "Desktop online — zoomed for humans", true);
  }
}

function updateSeated(dt) {
  // light mouse look around CRT
  camera.position.copy(SIT_CAM);
  const look = SIT_LOOK.clone();
  look.x += G.lookX * 0.15;
  look.y += G.lookY * 0.1;
  camera.lookAt(look);

  // hand anim
  if (handsRoot) {
    G.handTypeT = Math.max(0, G.handTypeT - dt);
    G.handClickT = Math.max(0, G.handClickT - dt);
    const left = handsRoot.getObjectByName("left_wrist") || handsRoot;
    const right = handsRoot.getObjectByName("right_wrist") || handsRoot;
    const bob = Math.sin(performance.now() * 0.02) * 0.002;
    handsRoot.position.y = -0.35 + bob + (G.handTypeT > 0 ? Math.sin(performance.now() * 0.05) * 0.01 : 0);
    if (keyboardMesh && G.handTypeT > 0) keyboardMesh.rotation.x = Math.sin(performance.now() * 0.08) * 0.02;
    if (mouseMesh && G.handClickT > 0) mouseMesh.position.y = 0.005;
    else if (mouseMesh) mouseMesh.position.y = 0;
    void left;
    void right;
  }

  win95.tick(dt);
  win95.render();
  crtTex.needsUpdate = true;
}


function stagePointer(e) {
  const rect = canvas3d.getBoundingClientRect();
  const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  return { nx, ny, sx: ((e.clientX - rect.left) / rect.width) * CRT_W, sy: ((e.clientY - rect.top) / rect.height) * CRT_H };
}

function mapToCrt(e) {
  const { nx, ny } = stagePointer(e);
  pointer.set(nx, ny);
  raycaster.setFromCamera(pointer, camera);
  if (!screenMesh) return null;
  const hits = raycaster.intersectObject(screenMesh, true);
  if (!hits.length) return null;
  const uv = hits[0].uv;
  if (!uv) return null;
  // flipY texture → canvas y
  const cx = uv.x * CRT_W;
  const cy = (1 - uv.y) * CRT_H;
  return { cx, cy };
}

/* —— Day / boot / ending —— */
function startSlackNoise() {
  stopSlackNoise();
  G.slackTimer = setInterval(() => {
    if (G.phase !== "seated") return;
    const pool = copy.slackPool;
    if (!pool?.length) return;
    const m = pool[Math.floor(Math.random() * pool.length)];
    win95.pushSlack(m);
    win95.state.clockMinutes = Math.min(18 * 60, win95.state.clockMinutes + 1);
  }, 12000);
}
function stopSlackNoise() {
  if (G.slackTimer) clearInterval(G.slackTimer);
  G.slackTimer = null;
}

async function runBoot() {
  G.phase = "boot";
  showScreen("screen-title");
  $("screen-title").classList.remove("active");
  const boot = $("boot-overlay");
  boot.classList.add("show");
  const lines = copy.boot?.biosLines || ["HelixStack BIOS", "Cubicle 4-B", "OK"];
  boot.textContent = "";
  for (const ln of lines) {
    boot.textContent += ln + "\n";
    await new Promise((r) => setTimeout(r, 180));
  }
  await new Promise((r) => setTimeout(r, 400));
  boot.classList.remove("show");
  showScreen("screen-title");
  $("screen-title").classList.remove("active");
  G.phase = "walk";
  audio.playBgm("bgmWalk");
  player.pos.set(0, 1.55, 3.2);
  G.yaw = 0;
  setPrompt("WASD · find Cubicle 4-B · E to sit");
}

function clockOut() {
  stopSlackNoise();
  G.phase = "ending";
  audio.stopBgm();
  setDesktopFullscreen(false);
  if (handsRoot) handsRoot.visible = false;
  if (nodes.KyleBust) nodes.KyleBust.visible = false;
  showScreen("screen-ending");
  const sp = win95.state.sprint;
  const san = Math.round(win95.state.sanity);
  const unr = win95.state.unread;
  const grades = copy.eod?.grades || [];
  const sorted = [...grades].sort((a, b) => (b.minSprint ?? b.min ?? 0) - (a.minSprint ?? a.min ?? 0));
  const gobj = sorted.find((g) => sp >= (g.minSprint ?? g.min ?? 0)) || sorted[sorted.length - 1] || {};
  const grade = gobj.grade || gobj.label || "Needs Improvement";
  let note = gobj.managerNote || "";
  note = note.replace(/\{\{sprint\}\}/g, sp).replace(/\{\{sanity\}\}/g, san).replace(/\{\{unread\}\}/g, unr);
  const closer = (copy.eod?.closers && copy.eod.closers[Math.floor(Math.random()*copy.eod.closers.length)]) || "The building does not have an exit, only a clock.";
  $("ending-stats").innerHTML = `
    Sprint Points: <span style="color:var(--amber)">${sp}</span><br/>
    Sanity: <span style="color:var(--sick)">${san}</span><br/>
    Unread: <span style="color:var(--blood)">${unr}</span><br/>
    Tickets closed this shift: ${win95.state.closedCount || 0}
  `;
  $("ending-review").innerHTML = `<strong style="color:var(--jira)">${grade}</strong><br/>${note}<br/><br/>${closer}`;
  setPrompt("");
}

/* —— Input —— */
window.addEventListener("keydown", (e) => {
  const k = (e.key || "").toLowerCase();
  G.keys[k] = true;
  if (e.code) G.keys[e.code.toLowerCase()] = true;
  const sitKey =
    e.code === "KeyE" ||
    e.code === "Space" ||
    k === "e" ||
    k === " " ||
    k === "enter" ||
    e.code === "Enter";
  if (G.phase === "walk" && sitKey) {
    e.preventDefault();
    // If somehow canSit false but they're past the doorway, still sit
    if (!G.canSit && player.pos.z < 2.2) G.canSit = true;
    if (G.canSit) beginSit();
    else toast("Get closer to your desk (walk toward the CRT)");
  }
  if (e.key === "m" || e.key === "M") {
    G.muted = !G.muted;
    audio.setMuted(G.muted);
    toast(G.muted ? "Muted" : "Unmuted", true);
  }
  if (G.phase === "seated") win95.onKey(e);
});
window.addEventListener("keyup", (e) => {
  G.keys[e.key.toLowerCase()] = false;
});

$("stage").addEventListener("mousemove", (e) => {
  if (G.phase === "walk") {
    const { nx, ny } = stagePointer(e);
    G.yaw = -nx * 0.6;
    G.lookY = ny * 0.25;
  }
});

$("stage").addEventListener("mousedown", (e) => {
  if (G.phase === "walk" && G.canSit) {
    beginSit();
  }
});

function bindDesktopOverlayInput() {
  const ov = $("desktop-overlay");
  if (!ov || ov._bound) return;
  ov._bound = true;
  ov.addEventListener("mousemove", (e) => {
    if (G.phase !== "seated") return;
    const { cx, cy } = overlayPointer(e);
    win95.onPointerMove(cx, cy);
  });
  ov.addEventListener("mousedown", (e) => {
    if (G.phase !== "seated") return;
    e.preventDefault();
    const { cx, cy } = overlayPointer(e);
    win95.onPointerMove(cx, cy);
    win95.onPointerDown();
  });
  ov.addEventListener("mouseup", () => {
    if (G.phase === "seated") win95.onPointerUp();
  });
  ov.addEventListener("mouseleave", () => {
    if (G.phase === "seated") win95.onPointerUp();
  });
}
bindDesktopOverlayInput();

$("btn-clock-in").addEventListener("click", () => {
  if (G.phase !== "title" && G.phase !== "boot") return;
  if (G._clockInArmed) return;
  G._clockInArmed = true;
  const btn = $("btn-clock-in");
  btn.disabled = true;
  const label = btn.textContent;
  const start = () => {
    btn.textContent = label;
    runBoot().finally(() => {
      /* stay disabled through boot; re-enable only if we bounce back to title */
      if (G.phase === "title") {
        G._clockInArmed = false;
        btn.disabled = false;
      }
    });
  };
  if (G.assetsReady) {
    start();
    return;
  }
  btn.textContent = "LOADING…";
  toast("Loading cubicle…");
  const t0 = performance.now();
  const wait = setInterval(() => {
    if (G.assetsReady) {
      clearInterval(wait);
      start();
    } else if (performance.now() - t0 > 20000) {
      clearInterval(wait);
      /* soft-start anyway so the day is playable with whatever loaded */
      G.assetsReady = true;
      toast("Assets slow — clocking in anyway");
      start();
    }
  }, 100);
});
$("btn-again").addEventListener("click", () => {
  location.reload();
});
const sitBtnEl = $("btn-sit");
if (sitBtnEl) {
  sitBtnEl.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (G.phase === "walk") beginSit();
  });
}



/* —— Loop —— */
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, clock.getDelta());
  postUniforms.uTime.value = clock.elapsedTime;

  if (G.phase === "walk") updateWalk(dt);
  else if (G.phase === "sit") updateSit(dt);
  else if (G.phase === "seated") updateSeated(dt);
  else if (G.phase === "title" || G.phase === "boot" || G.phase === "ending") {
    // ambient orbit peek
    const t = clock.elapsedTime;
    camera.position.set(Math.sin(t * 0.15) * 0.4 + 0.8, 1.6, 2.8);
    camera.lookAt(0, 1.0, -0.5);
    win95.render();
    crtTex.needsUpdate = true;
  }

  if (win95.state.sanity < 25) {
    // occasional sanity sting
  }

  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, camera);
  postUniforms.tDiffuse.value = renderTarget.texture;
  renderer.setRenderTarget(null);
  renderer.render(postScene, postCam);
}
frame();

loadOffice()
  .then(() => {
    toast("Cubicle farm online", true);
    if (!$("btn-clock-in").disabled || G._clockInArmed) {
      /* keep disabled if clock-in already waiting */
    }
    if (!G._clockInArmed) $("btn-clock-in").disabled = false;
  })
  .catch((err) => {
    console.error(err);
    toast("Asset load failed — starting with placeholders");
    G.assetsReady = true; // unblock CLOCK IN
    if (!G._clockInArmed) $("btn-clock-in").disabled = false;
  });

window.corpWin95 = win95;
window.corpOffice = () => OfficeRoot;
